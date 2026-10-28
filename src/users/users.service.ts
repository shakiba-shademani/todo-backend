import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { toPublicUser } from '../common/user-public.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  me(user: User) {
    return toPublicUser(user, this.publicUrl());
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { displayName: dto.displayName.trim() },
    });
    return toPublicUser(updated, this.publicUrl());
  }

  async changePassword(user: User, dto: ChangePasswordDto) {
    const ok = await compare(dto.currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return { ok: true };
  }

  async updateAvatar(user: User, filename: string) {
    if (!filename) {
      throw new BadRequestException('Please choose an image');
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { avatarPath: filename },
    });
    if (user.avatarPath && user.avatarPath !== filename) {
      const oldPath = join(process.cwd(), 'uploads', 'avatars', user.avatarPath);
      await unlink(oldPath).catch(() => undefined);
    }
    return toPublicUser(updated, this.publicUrl());
  }

  private publicUrl() {
    return this.config.get<string>('PUBLIC_URL') ?? 'http://localhost:3001';
  }
}
