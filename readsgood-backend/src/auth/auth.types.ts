import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  goodreadsToken?: string | null;
  goodreadsSecret?: string | null;
  goodreadsUserId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
