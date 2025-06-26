import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Match, Round } from '@prisma/client';
import { PlayersService } from '@/players/players.service';

@Injectable()
export class RoundsService {
  constructor(
    private prisma: PrismaService,
    private players: PlayersService
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
}
