import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  /** Cria o grupo e grava o criador como OWNER */
  async createGroup(name: string, ownerId: string) {
    return this.prisma.group.create({
      data: {
        name,
        inviteCode: generateCode(), // helper logo abaixo
        createdBy: ownerId,
        members: {
          create: { userId: ownerId, role: Role.OWNER },
        },
      },
    });
  }

  /** Lista todos os grupos do usuário */
  findUserGroups(userId: string) {
    return this.prisma.group.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true, createdAt: true },
    });
  }

  /** Adiciona usuário ao grupo pelo código de convite */
  async joinByCode(userId: string, code: string) {
    // 1. localizar grupo
    const group = await this.prisma.group.findUnique({
      where: { inviteCode: code.toUpperCase() },
    });
    if (!group) throw new BadRequestException('Código inválido');

    // 2. já é membro?
    const exists = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: group.id } },
    });
    if (exists) throw new BadRequestException('Você já pertence a esse grupo');

    // 3. inserir como MEMBER
    await this.prisma.groupMember.create({
      data: { userId, groupId: group.id, role: Role.MEMBER },
    });
    return group;
  }

  isMember(userId: string, groupId: string) {
    return this.prisma.groupMember
      .findUnique({
        where: { userId_groupId: { userId, groupId } },
      })
      .then(Boolean);
  }

  /* helper p/ guards */
  isAdmin(userId: string, groupId: string) {
    return this.prisma.groupMember
      .findFirst({
        where: {
          userId,
          groupId,
          role: { in: [Role.ADMIN, Role.OWNER] },
        },
      })
      .then(Boolean);
  }
}

/* ---- helper simples p/ código de convite (6 letras maiúsculas) ---- */
function generateCode(length = 6) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length }, () => alpha[Math.floor(Math.random() * 26)]).join('');
}
