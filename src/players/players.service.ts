import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  list(groupId: string) {
    return this.prisma.player.findMany({ where: { groupId } });
  }

  create(groupId: string, dto: { name: string; level: number }) {
    return this.prisma.player.create({ data: { ...dto, groupId } });
  }

  update(id: string, groupId: string, dto: Partial<{ name: string; level: number; active: boolean }>) {
    return this.prisma.player.update({
      where: { id_groupId: { id, groupId } },
      data: dto,
    });
  }

  remove(id: string, groupId: string) {
    return this.prisma.player.delete({ where: { id_groupId: { id, groupId } } });
  }

  /** MatchCount ±1 para vários jogadores */
  async bumpMatchCount(playerIds: string[], delta: 1 | -1, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    await client.player.updateMany({
      where: { id: { in: playerIds } },
      data: { matchCount: { increment: delta } },
    });
  }

  /** PartnerCount ±1 para ambas as direções (A↔B) */
  async bumpPartnerCount(
    playerId: string,
    partnerId: string,
    groupId: string,
    delta: 1 | -1,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma;

    const upsert = (a: string, b: string) =>
      client.playerPartner.upsert({
        where: { playerId_partnerId: { playerId: a, partnerId: b } },
        create: { playerId: a, partnerId: b, groupId, count: Math.max(delta, 0) },
        update: { count: { increment: delta } },
      });

    await Promise.all([upsert(playerId, partnerId), upsert(partnerId, playerId)]);
  }
}
