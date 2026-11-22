import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { isProd } from '../config';
import { CredentialsDto } from './auth.dto';
import { AuthedRequest, JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

// The frontends and the API live on different sites, so in production the
// cookie must be SameSite=None; Secure.
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: CredentialsDto, @Res({ passthrough: true }) res: Response) {
    const s = await this.auth.register(dto.username, dto.password);
    res.cookie('token', s.token, cookieOptions);
    return s;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: CredentialsDto, @Res({ passthrough: true }) res: Response) {
    const s = await this.auth.login(dto.username, dto.password);
    res.cookie('token', s.token, cookieOptions);
    return s;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthedRequest) {
    return { id: req.user.sub, username: req.user.username };
  }
}
