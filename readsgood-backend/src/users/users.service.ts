import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateGoodreadsTokenDto,
  UserResponse,
  UserWithGoodreadsTokens,
  GoodreadsTokenInfo,
} from './users.types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { username, password } = createUserDto;
    const hashed = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: { username, password: hashed },
        select: { id: true, username: true, createdAt: true },
      });
      return user;
    } catch (error: unknown) {
      // Handle unique constraint violation for username
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002' &&
        'meta' in error &&
        error.meta &&
        typeof error.meta === 'object' &&
        'target' in error.meta &&
        Array.isArray(error.meta.target) &&
        error.meta.target.includes('username')
      ) {
        throw new ConflictException('Username already exists');
      }

      throw error;
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async updateGoodreadsToken(
    userId: number,
    tokenData: UpdateGoodreadsTokenDto,
  ): Promise<UserWithGoodreadsTokens> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        goodreadsToken: tokenData.goodreadsToken,
        goodreadsSecret: tokenData.goodreadsSecret,
        goodreadsUserId: tokenData.goodreadsUserId,
      },
      select: {
        id: true,
        username: true,
        goodreadsToken: true,
        goodreadsSecret: true,
        goodreadsUserId: true,
        createdAt: true,
      },
    });
  }

  async getGoodreadsToken(userId: number): Promise<GoodreadsTokenInfo | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        goodreadsToken: true,
        goodreadsSecret: true,
        goodreadsUserId: true,
      },
    });
    return user;
  }
}
