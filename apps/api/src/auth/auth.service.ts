import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtPayload } from './jwt-auth.guard';

const userSelect = { id: true, email: true, role: true, createdAt: true, updatedAt: true } as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async presentWithToken(user: { id: string; email: string; role: string; createdAt: Date; updatedAt: Date }) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return { user, accessToken: await this.jwt.signAsync(payload) };
  }

  async register(input: RegisterDto) {
    const email = this.normalizeEmail(input.email);
    const exists = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) throw new ConflictException('An account with this email already exists');
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({ data: { email, passwordHash }, select: userSelect });
    return this.presentWithToken(user);
  }

  async login(input: LoginDto) {
    const email = this.normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    return this.presentWithToken({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    if (!user) throw new UnauthorizedException('User account is no longer available');
    return { user };
  }
}
