import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

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
}
