import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { GoodreadsService } from './goodreads.service';
import { SearchBooksResponse } from './goodreads.types';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Public } from '../auth/public.decorator';

@Controller('goodreads')
export class GoodreadsController {
  private readonly frontendAppUrl =
    process.env.FRONTEND_APP_URL || 'http://localhost:5173';

  constructor(private readonly goodreadsService: GoodreadsService) {}

  @Get('search')
  async searchBooks(
    @Query('q') query: string,
    @Query('page') page: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<SearchBooksResponse> {
    if (!query) {
      throw new HttpException(
        'Query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Parse page number, default to 1
    const pageNumber = page ? parseInt(page, 10) : 1;
    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new HttpException(
        'Page parameter must be a positive number',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Use authenticated user ID from BasicAuthGuard
    const userId = req.user?.id ? req.user.id : 1; // Default to user ID 1
    return this.goodreadsService.searchBooks(userId, query, pageNumber);
  }

  @Get('books/:id')
  async getBookById(
    @Param('id') bookId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    if (!bookId) {
      throw new HttpException(
        'Book ID parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Use authenticated user ID from BasicAuthGuard
    const userId = req.user?.id ? req.user.id : 1; // Default to user ID 1
    return this.goodreadsService.getBookById(userId, bookId);
  }

  @Get('auth/init')
  async initOAuth(
    @Request() req: AuthenticatedRequest,
  ): Promise<{ authorizeUrl: string }> {
    // Use authenticated user ID from BasicAuthGuard
    const userId = req.user?.id ? req.user.id : 1; // Default to user ID 1
    return this.goodreadsService.initOAuth(userId);
  }

  @Public()
  @Get('oauth/return/:userId')
  async handleOAuthReturn(
    @Param('userId') userIdParam: string,
    @Query('oauth_token') oauthToken: string,
    @Query('authorize') authorize: string,
    @Res() res: Response,
  ): Promise<void | { success: boolean; message: string }> {
    try {
      const userId = parseInt(userIdParam, 10);
      if (isNaN(userId)) {
        return {
          success: false,
          message: 'Invalid user ID provided',
        };
      }

      await this.goodreadsService.handleOAuthCallback(
        userId,
        oauthToken,
        authorize,
      );

      // Redirect to success page
      res.redirect(`${this.frontendAppUrl}/auth/success`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      // Redirect to error page with message
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }
}
