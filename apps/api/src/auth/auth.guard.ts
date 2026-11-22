import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type AuthPayload = { sub: string; username: string };
export type AuthedRequest = Request & { user: AuthPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined;
    const token = (req.cookies?.token as string | undefined) ?? bearer;
    if (!token) throw new UnauthorizedException();
    try {
      req.user = this.jwt.verify<AuthPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
