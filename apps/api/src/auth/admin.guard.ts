import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from './jwt-auth.guard';

type RequestWithUser = Request & { user?: JwtPayload };

/**
 * Must be used after JwtAuthGuard. It grants access only to JWTs issued for
 * administrator accounts; clients cannot choose this role during registration.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Administrator access is required');
    }
    return true;
  }
}
