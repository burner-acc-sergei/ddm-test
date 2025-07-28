// =======================
// Backend Response Types
// =======================

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// User Authentication
export interface User {
  id: string
  username: string
  authenticated: boolean
  goodreadsConnected: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface LoginResponse {
  user: User
  token?: string
}

export interface AuthResponse {
  user: User
  token?: string
  accessToken?: string
  refreshToken?: string
  authorizeUrl?: string
}

export interface GoodreadsTokens {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  goodreadsToken?: string | null
  goodreadsSecret?: string | null
}

// =======================
// Goodreads Response Types (Raw XML parsed to objects)
// =======================

// Author information
export interface Author {
  id: string
  name: string
  role?: string
  image_url?: string
  small_image_url?: string
  link?: string
  average_rating?: string
  ratings_count?: string
  text_reviews_count?: string
}

// Work information (represents a "work" in Goodreads - the conceptual book)
export interface Work {
  id: string
  books_count?: string
  best_book_id?: string
  ratings_count?: string
  text_reviews_count?: string
  original_publication_year?: string
  original_publication_month?: string
  original_publication_day?: string
  average_rating?: string
  best_book?: {
    id: string
    title: string
    author: Author
    image_url?: string
    small_image_url?: string
  }
}

// Individual book within a work
export interface GoodreadsBook extends Work {
  id: string
  title?: string
  isbn?: string
  isbn13?: string
  text_reviews_count?: string
  original_title?: string
  language_code?: string
  format?: string
  edition_information?: string
  publisher?: string
  publication_day?: string
  publication_month?: string
  publication_year?: string
  average_rating?: string
  ratings_count?: string
  description?: string
  authors?: Author[]
  best_book?: {
    id: string
    title: string
    author: Author
    image_url?: string
    small_image_url?: string
  }
}

// API response format for search books
export interface SearchBooksResponse {
  books: Work[]
  total?: number
}

// Frontend Search Results with pagination
export interface SearchResponse {
  books: Work[]
  totalResults: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Book Details API Response
export interface BookDetails {
  id: string
  isbn?: string
  isbn13?: string
  text_reviews_count?: string
  reviews_count?: string
  ratings_count?: string
  ratings_sum?: string
  average_rating?: string
  num_pages?: string
  format?: string
  edition_information?: string
  publisher?: string
  publication_day?: string
  publication_month?: string
  publication_year?: string
  is_ebook?: string
  work?: {
    id: string
    uri?: string
    original_publication_year?: string
    original_publication_month?: string
    original_publication_day?: string
    original_title?: string
    books_count?: string
    ratings_count?: string
    text_reviews_count?: string
    reviews_count?: string
    average_rating?: string
  }
  title: string
  title_without_series?: string
  image_url?: string
  small_image_url?: string
  large_image_url?: string
  link?: string
  language_code?: string
  description?: string
  authors?: {
    author: Author | Author[]
  }
  popular_shelves?: {
    shelf: Array<{
      name: string
      count: string
    }>
  }
  book_links?: {
    book_link: Array<{
      id: string
      name: string
      link: string
    }>
  }
  buy_links?: {
    buy_link: Array<{
      id: string
      name: string
      link: string
    }>
  }
  series_works?: unknown
  similar_books?: {
    book: GoodreadsBook[]
  }
}

export interface BookDetailsResponse {
  book: BookDetails
}

export interface Book {
  id: string
  title: string
  author: string
  imageUrl?: string
  smallImageUrl?: string
  averageRating?: number
  ratingsCount?: number
  reviewsCount?: number
  publicationYear?: number
  publicationMonth?: number
  publicationDay?: number
  isbn?: string
  isbn13?: string
  description?: string
  pageCount?: number
  pages?: number // Alias for pageCount
  publisher?: string
  language?: string
  format?: string
  isEbook?: boolean
  genres?: string[]
  similarBooks?: Book[]
  buyLinks?: Array<{
    name: string
    url: string
  }>
}

export interface ApiErrorResponse {
  message?: string
  error?: string
  details?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
