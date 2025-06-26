import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

export const CurrentGroup = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<RequestWithUser>();
  if (!req.groupId) throw new BadRequestException('groupId ausente');
  return req.groupId;
});
