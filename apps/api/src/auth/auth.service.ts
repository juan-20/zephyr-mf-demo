import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import type { User } from '@repo/types';
import { UserEntity } from '../entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
  ) {}

  private session(u: UserEntity): { user: User; token: string } {
    return {
      user: { id: u.id, username: u.username },
      token: this.jwt.sign({ sub: u.id, username: u.username }),
    };
  }

  async register(username: string, password: string) {
    if (await this.users.exists({ where: { username } })) {
      throw new ConflictException('Username already taken');
    }
    const user = await this.users.save(
      this.users.create({ username, passwordHash: await bcrypt.hash(password, 10) }),
    );
    return this.session(user);
  }

  async login(username: string, password: string) {
    const user = await this.users.findOne({ where: { username } });
    // Same error for unknown user and wrong password: no user enumeration.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.session(user);
  }
}
