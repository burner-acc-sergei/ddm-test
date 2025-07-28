import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponse, UserMeResponse } from './users.types';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Public } from 'src/auth/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  register(@Body() dto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(dto);
  }

  @Get('me')
  async checkLogin(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserMeResponse> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const goodreadsTokens = await this.usersService.getGoodreadsToken(user.id);

    return {
      id: user.id,
      username: user.username,
      authenticated: true,
      goodreadsConnected: !!goodreadsTokens?.goodreadsToken,
      goodreadsTokens: goodreadsTokens
        ? {
            hasToken: true,
            userId: goodreadsTokens.goodreadsUserId,
          }
        : null,
    };
  }
}
