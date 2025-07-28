// User-related types for the application

export interface CreateUserDto {
  username: string;
  password: string;
}

export interface UpdateGoodreadsTokenDto {
  goodreadsToken: string;
  goodreadsSecret: string;
  goodreadsUserId?: string;
}

export interface User {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  goodreadsToken?: string | null;
  goodreadsSecret?: string | null;
  goodreadsUserId?: string | null;
}

export interface UserResponse {
  id: number;
  username: string;
  createdAt: Date;
}

export interface UserWithGoodreadsTokens {
  id: number;
  username: string;
  createdAt: Date;
  goodreadsToken: string | null;
  goodreadsSecret: string | null;
  goodreadsUserId: string | null;
}

export interface GoodreadsTokenInfo {
  goodreadsToken: string | null;
  goodreadsSecret: string | null;
  goodreadsUserId: string | null;
}

export interface UserMeResponse {
  id: number;
  username: string;
  authenticated: boolean;
  goodreadsConnected: boolean;
  goodreadsTokens: {
    hasToken: boolean;
    userId?: string | null;
  } | null;
}
