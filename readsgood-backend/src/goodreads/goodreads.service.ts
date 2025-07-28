/**
 * Goodreimport { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as xml2js from 'xml2js';
import { OAuth } from 'oauth';
import { SearchBooksResponse, BookDetails } from './types';
import { UsersService } from '../users/users.service';
import { UpdateGoodreadsTokenDto } from '../users/users.types';ervice
 *
 *  Oauth package has linting issues, so we disable linter rules here.
 */

/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore-file

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as xml2js from 'xml2js';
import { OAuth } from 'oauth';
import { SearchBooksResponse, BookDetails } from './goodreads.types';
import { UsersService } from '../users/users.service';

interface UserOAuthTokens {
  requestToken: string;
  requestTokenSecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
  isAuthenticated: boolean;
}

@Injectable()
export class GoodreadsService {
  private readonly apiKey = process.env.GOODREADS_API_KEY;
  private readonly apiSecret = process.env.GOODREADS_API_SECRET;
  private readonly apiUrl = 'https://www.goodreads.com';
  private readonly xmlParser: xml2js.Parser;
  private oauth: OAuth | null = null;

  // Store OAuth tokens per user session (temporary during OAuth flow)
  private userTokens = new Map<number, UserOAuthTokens>();

  constructor(private usersService: UsersService) {
    this.xmlParser = new xml2js.Parser({
      explicitArray: false, // Don't wrap single items in arrays
      ignoreAttrs: true, // Ignore XML attributes completely
      trim: true, // Trim whitespace
      explicitRoot: false, // Remove root wrapper
      normalizeTags: false, // Keep original tag names
      normalize: false, // Don't normalize text
    });

    if (this.apiKey && this.apiSecret) {
      const backendUrl =
        process.env.BACKEND_URL || 'https://rg.lushchik.com/api';
      this.oauth = new OAuth(
        'https://www.goodreads.com/oauth/request_token',
        'https://www.goodreads.com/oauth/access_token',
        this.apiKey,
        this.apiSecret,
        '1.0',
        `${backendUrl}/goodreads/auth/callback`,
        'HMAC-SHA1',
      );
    }
  }

  private parseXML(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.xmlParser.parseString(xml, (err: any, result: any) => {
        if (err) {
          reject(new Error('Error parsing XML response'));
        } else {
          resolve(result);
        }
      });
    });
  }

  private async oauthGet(url: string, userId: number): Promise<string> {
    // First try to get stored tokens from database
    const storedTokens = await this.usersService.getGoodreadsToken(userId);

    // If user has stored tokens, use them
    if (storedTokens?.goodreadsToken && storedTokens?.goodreadsSecret) {
      if (!this.oauth) {
        throw new HttpException(
          'OAuth not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return new Promise((resolve, reject) => {
        this.oauth.get(
          url,
          storedTokens.goodreadsToken,
          storedTokens.goodreadsSecret,
          (error, data) => {
            if (error) {
              reject(<HttpException>error);
            } else {
              resolve(data as string);
            }
          },
        );
      });
    }

    // Fallback to temporary session tokens (during OAuth flow)
    const userTokens = this.userTokens.get(userId);

    if (!this.oauth || !userTokens?.isAuthenticated) {
      throw new HttpException(
        'OAuth not configured or user not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return new Promise((resolve, reject) => {
      this.oauth.get(
        url,
        userTokens.accessToken || userTokens.requestToken,
        userTokens.accessTokenSecret || userTokens.requestTokenSecret,
        (error, data) => {
          if (error) {
            reject(<HttpException>error);
          } else {
            resolve(data as string);
          }
        },
      );
    });
  }

  async initOAuth(userId: number): Promise<{ authorizeUrl: string }> {
    if (!this.oauth) {
      throw new HttpException(
        'OAuth configuration missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Create callback URL with user ID in path
    const backendUrl = process.env.BACKEND_URL || 'https://rg.lushchik.com/api';
    const callbackUrl = `${backendUrl}/goodreads/oauth/return/${userId}`;

    return new Promise((resolve, reject) => {
      // Pass callback URL as the first parameter to getOAuthRequestToken
      this.oauth.getOAuthRequestToken(
        { oauth_callback: callbackUrl },
        (error, oauthToken, oauthTokenSecret) => {
          if (error) {
            console.error(
              'OAuth request token error:',
              JSON.stringify(error, null, 2),
            );
            reject(
              new HttpException(
                `Failed to get OAuth request token: ${JSON.stringify(error)}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            // Store tokens for this user
            this.userTokens.set(userId, {
              requestToken: oauthToken,
              requestTokenSecret: oauthTokenSecret,
              isAuthenticated: false,
            });

            // Return the authorization URL
            resolve({
              authorizeUrl: `${this.apiUrl}/oauth/authorize?oauth_token=${oauthToken}&oauth_callback=${encodeURIComponent(callbackUrl)}`,
            });
          }
        },
      );
    });
  }

  async handleOAuthCallback(
    userId: number,
    oauthToken: string,
    oauthVerifier: string,
  ): Promise<void> {
    console.log('Handling OAuth callback for user:', userId, {
      oauthToken,
      oauthVerifier,
    });

    const userTokens = this.userTokens.get(userId);
    if (!userTokens) {
      throw new HttpException(
        'No OAuth session found for user',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Goodreads simplified OAuth flow
    if (oauthVerifier === '1' || oauthVerifier === oauthToken) {
      console.log('Goodreads simplified OAuth flow detected for user:', userId);
      // Mark as authenticated and use request tokens - save to database
      userTokens.isAuthenticated = true;
      this.userTokens.set(userId, userTokens);

      // Save tokens to database
      await this.usersService.updateGoodreadsToken(userId, {
        goodreadsToken: userTokens.requestToken,
        goodreadsSecret: userTokens.requestTokenSecret,
      });

      return Promise.resolve();
    }

    // Traditional OAuth flow if we have a proper verifier
    if (!this.oauth) {
      throw new HttpException(
        'OAuth configuration missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(
        oauthToken,
        userTokens.requestTokenSecret,
        oauthVerifier,
        async (error, accessToken, accessTokenSecret) => {
          if (error) {
            console.error('OAuth access token error for user:', userId, error);
            reject(
              new HttpException(
                `Failed to get OAuth access token: ${JSON.stringify(error)}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            console.log('OAuth access token received for user:', userId);
            // Update user tokens with access tokens
            userTokens.accessToken = accessToken;
            userTokens.accessTokenSecret = accessTokenSecret;
            userTokens.isAuthenticated = true;
            this.userTokens.set(userId, userTokens);

            // Save tokens to database
            try {
              await this.usersService.updateGoodreadsToken(userId, {
                goodreadsToken: accessToken,
                goodreadsSecret: accessTokenSecret,
              });
            } catch (dbError) {
              console.error('Failed to save tokens to database:', dbError);
            }

            resolve();
          }
        },
      );
    });
  }

  async searchBooks(
    userId: number,
    query: string,
    page: number = 1,
  ): Promise<SearchBooksResponse> {
    // Check if user has stored tokens in database
    const storedTokens = await this.usersService.getGoodreadsToken(userId);
    const hasStoredTokens =
      storedTokens?.goodreadsToken && storedTokens?.goodreadsSecret;

    // Check if user has temporary session tokens
    const hasSessionTokens = this.userTokens.get(userId)?.isAuthenticated;

    if (!hasStoredTokens && !hasSessionTokens) {
      throw new HttpException(
        'User not authenticated with Goodreads',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Use actual Goodreads search API endpoint with pagination
      const searchUrl = `${this.apiUrl}/search/index.xml?key=${this.apiKey}&q=${encodeURIComponent(query)}&page=${page}`;
      const xmlData = await this.oauthGet(searchUrl, userId);

      const parsedData = await this.parseXML(xmlData);

      // With the new parser settings, the structure might be different
      const searchResults = parsedData.search;
      const works = searchResults?.results?.work;

      const books = Array.isArray(works) ? works : works ? [works] : [];

      return {
        books,
        total: parseInt(String(searchResults?.['total-results'] || '0'), 10),
      };
    } catch (error) {
      console.error('Search error for user:', userId, 'page:', page, error);
      throw new HttpException(
        'Failed to search books on Goodreads',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBookById(userId: number, bookId: string): Promise<BookDetails> {
    // Check if user has stored tokens in database
    const storedTokens = await this.usersService.getGoodreadsToken(userId);
    const hasStoredTokens =
      storedTokens?.goodreadsToken && storedTokens?.goodreadsSecret;

    // Check if user has temporary session tokens
    const hasSessionTokens = this.userTokens.get(userId)?.isAuthenticated;

    if (!hasStoredTokens && !hasSessionTokens) {
      throw new HttpException(
        'User not authenticated with Goodreads',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Use Goodreads book show API endpoint
      const bookUrl = `${this.apiUrl}/book/show/${bookId}.xml?key=${this.apiKey}`;
      const xmlData = await this.oauthGet(bookUrl, userId);
      const parsedData = await this.parseXML(xmlData);

      // With the new parser settings, the structure is different
      const book = parsedData.book || parsedData.goodreadsresponse?.book;

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      // Return the raw parsed book data - xml2js will make it pretty
      return book as BookDetails;
    } catch (error) {
      console.error('Get book by ID error for user:', userId, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to get book details from Goodreads',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
