import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private groups: GroupsService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const userId = req.user.id;

    /* ────── normaliza o valor ────── */
    const groupId: string | undefined = req.params.groupId ?? req.headers['x-group-id'];

    /* ────── validações ────── */
    if (!groupId) throw new BadRequestException('groupId ausente');

    const member = await this.groups.isMember(userId, groupId);
    if (!member) throw new ForbiddenException('Acesso negado ao grupo');

    req.groupId = groupId;
    return true;
  }
}
