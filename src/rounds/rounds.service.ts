import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Match, Round } from '@prisma/client';
import { PlayersService } from '@/players/players.service';
import { generateSchedule } from '@/lib/round-algorithm';
import { AlgoPlayer } from '@/common/interfaces/algo-player';
import { RoundsGateway } from '@/rounds/rounds.gateway';

@Injectable()
export class RoundsService {
  constructor(
    private prisma: PrismaService,
    private players: PlayersService,
    private gateway: RoundsGateway
  ) {}

  list(groupId: string) {
    return this.prisma.round.findMany({
      where: { groupId },
      include: { matches: true },
      orderBy: { roundNumber: 'desc' },
    });
  }

  async create(groupId: string, dto: { matches: Omit<Match, 'id' | 'roundId'>[] }) {
    // calcula próximo número
    const last = await this.prisma.round.findFirst({
      where: { groupId },
      orderBy: { roundNumber: 'desc' },
      select: { roundNumber: true },
    });
    const next = (last?.roundNumber ?? 0) + 1;

    return this.prisma.round.create({
      data: {
        groupId,
        roundNumber: next,
        matches: { createMany: { data: dto.matches } },
      },
      include: { matches: true },
    });
  }

  updateScore(matchId: string, gamesA: number, gamesB: number) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: { gamesA, gamesB },
    });
  }

  delete(roundId: string, groupId: string) {
    return this.prisma.round.delete({ where: { id: roundId, groupId } });
  }

  private async applyRoundStats(round: Round & { matches: Match[] }, delta: 1 | -1) {
    await this.prisma.$transaction(async (tx) => {
      const ids = new Set<string>();

      for (const m of round.matches) {
        // matchCount
        [m.teamA1, m.teamA2, m.teamB1, m.teamB2].forEach((id) => ids.add(id));

        // partnerCounts
        await this.players.bumpPartnerCount(m.teamA1, m.teamA2, round.groupId, delta, tx);
        await this.players.bumpPartnerCount(m.teamB1, m.teamB2, round.groupId, delta, tx);
      }

      await this.players.bumpMatchCount([...ids], delta, tx);
    });
  }

  async generateRound(groupId: string, courts: number) {
    /* 1. ativos */
    const playersDb = await this.prisma.player.findMany({
      where: { groupId, active: true },
    });
    if (playersDb.length < courts * 4) throw new BadRequestException('Jogadores insuficientes');

    /* 2. links */
    const links = await this.prisma.playerPartner.findMany({
      where: { groupId },
    });

    /* 3. map */
    const partnerMap = new Map<string, Record<string, number>>();
    playersDb.forEach((p) => partnerMap.set(p.id, {}));
    links.forEach((row) => {
      partnerMap.get(row.playerId)![row.partnerId] = row.count;
    });

    /* 4. adapta */
    const players: AlgoPlayer[] = playersDb.map((p) => ({
      ...p,
      partnerCounts: partnerMap.get(p.id)!,
      preferredPairs: [],
    }));

    /* 5. algoritmo */
    const unsaved = generateSchedule(players, courts);

    /* 6. persiste + stats numa transação */
    const round = await this.prisma.$transaction(async (tx) => {
      // roundNumber
      const last = await tx.round.findFirst({
        where: { groupId },
        orderBy: { roundNumber: 'desc' },
        select: { roundNumber: true },
      });
      const next = (last?.roundNumber ?? 0) + 1;

      // cria round
      const savedRound = await tx.round.create({
        data: {
          id: unsaved.id,
          groupId,
          roundNumber: next,
        },
      });

      // cria matches
      const matchesData = unsaved.matches.map((m) => ({
        id: m.id,
        roundId: savedRound.id,
        teamA1: m.teamA[0].id,
        teamA2: m.teamA[1].id,
        teamB1: m.teamB[0].id,
        teamB2: m.teamB[1].id,
      }));
      await tx.match.createMany({ data: matchesData });

      // carrega com matches
      const full = await tx.round.findUnique({
        where: { id: savedRound.id },
        include: { matches: true },
      });

      // stats +1
      await this.applyRoundStats(full as Round & { matches: Match[] }, +1);

      return full;
    });

    /* 7. broadcast */
    this.gateway.emitRoundCreated(groupId, round);

    return round;
  }
}
