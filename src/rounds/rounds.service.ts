import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Match } from '@prisma/client';

@Injectable()
export class RoundsService {
  constructor(private prisma: PrismaService) {}

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
}
