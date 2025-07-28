// Export all services
export { authService, AuthService } from './authService'
export { goodreadsService, GoodreadsService } from './goodreadsService'
export { bookService, BookService } from './bookService'
export { serverService, ServerService } from './serverService'
export { httpClient } from './httpClient'

// Export all types
export * from './types'

// Import for convenience object
import { authService } from './authService'
import { goodreadsService } from './goodreadsService'
import { bookService } from './bookService'
import { serverService } from './serverService'

// Re-export specific services for convenience
export const services = {
  auth: authService,
  goodreads: goodreadsService,
  books: bookService,
  server: serverService,
} as const
