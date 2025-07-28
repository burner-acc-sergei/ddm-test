import { httpClient } from './httpClient'
import type { SearchResponse, BookDetails, SearchBooksResponse } from './types'

export class BookService {
  static async searchBooks(query: string, page: number = 1): Promise<SearchResponse> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty')
    }

    if (page < 1) {
      throw new Error('Page number must be 1 or greater')
    }

    const encodedQuery = encodeURIComponent(query.trim())

    try {
      const response = await httpClient.get<unknown>(
        `/goodreads/search?q=${encodedQuery}&page=${page}`,
      )
      return this.handleSearchResponse(response, page)
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  // Handle whatever format the backend actually returns
  private static handleSearchResponse(response: unknown, currentPage: number = 1): SearchResponse {
    try {
      // Type guard helper
      const isObject = (val: unknown): val is Record<string, unknown> => {
        return typeof val === 'object' && val !== null
      }

      if (!isObject(response)) {
        return {
          books: [],
          totalResults: 0,
          currentPage: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      }

      // Check for new clean format
      if ('books' in response && Array.isArray(response.books)) {
        return this.transformSearchResponse(response as unknown as SearchBooksResponse, currentPage)
      }

      // Check for old nested format
      if ('GoodreadsResponse' in response && isObject(response.GoodreadsResponse)) {
        const goodreadsResponse = response.GoodreadsResponse as Record<string, unknown>
        if ('search' in goodreadsResponse && isObject(goodreadsResponse.search)) {
          const search = goodreadsResponse.search as Record<string, unknown>
          if ('results' in search && isObject(search.results)) {
            const results = search.results as Record<string, unknown>
            if ('work' in results) {
              const works = results.work
              const worksArray = Array.isArray(works) ? works : [works]
              const totalResults =
                typeof search.total_results === 'string'
                  ? parseInt(search.total_results)
                  : worksArray.length
              const perPage = 20 // Goodreads default
              const totalPages = Math.ceil(totalResults / perPage)

              return {
                books: worksArray.map((work) => work),
                totalResults,
                currentPage,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
              }
            }
          }
        }
      }

      // If it's just an array of books directly
      if (Array.isArray(response)) {
        const totalResults = response.length
        const perPage = 20
        const totalPages = Math.ceil(totalResults / perPage)

        return {
          books: response.map((book) => book),
          totalResults,
          currentPage,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        }
      }

      return {
        books: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    } catch (error) {
      console.error('Error handling search response:', error, response)
      return {
        books: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    }
  }

  // Transform clean API response to our internal format
  private static transformSearchResponse(
    response: SearchBooksResponse,
    currentPage: number = 1,
  ): SearchResponse {
    try {
      if (!response || !response.books) {
        return {
          books: [],
          totalResults: 0,
          currentPage: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      }

      const books = response.books

      // Calculate pagination info
      const totalResults = response.total || books.length
      const perPage = 20 // Goodreads default
      const totalPages = Math.ceil(totalResults / perPage)
      const page = currentPage

      return {
        books,
        totalResults,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    } catch (error) {
      console.error('Error transforming search response:', error, response)
      return {
        books: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    }
  }

  // Book details (for future use)
  static async getBookDetails(bookId: string): Promise<BookDetails> {
    const response = await httpClient.get<BookDetails>(`/goodreads/books/${bookId}`)
    return response
  }

  // Search suggestions/autocomplete (for future use)
  static async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) {
      return []
    }

    const encodedQuery = encodeURIComponent(query.trim())
    return httpClient.get<string[]>(`/goodreads/suggestions?q=${encodedQuery}`)
  }

  // Utility methods
  static formatBookTitle(book: BookDetails): string {
    return book.title || 'Unknown Title'
  }

  static formatBookAuthor(book: BookDetails): string {
    // Handle authors (can be single author or array)
    if (book.authors?.author) {
      if (Array.isArray(book.authors.author)) {
        return book.authors.author[0]?.name || 'Unknown Author'
      } else {
        return book.authors.author.name || 'Unknown Author'
      }
    }
    return 'Unknown Author'
  }

  static getBookCoverUrl(book: BookDetails, size: 'small' | 'medium' | 'large' = 'medium'): string {
    // Use the appropriate image size from Goodreads
    if (size === 'small' && book.small_image_url) {
      return book.small_image_url
    }

    if (book.image_url) {
      return book.image_url
    }

    // Fallback placeholder based on size
    const dimensions = {
      small: '100x150',
      medium: '160x240',
      large: '320x480',
    }

    return `https://placehold.co/${dimensions[size]}?text=No+Cover`
  }

  static formatPublicationYear(book: BookDetails): string {
    const year = book.publication_year || book.work?.original_publication_year
    return year ? `(${year})` : ''
  }

  static formatRating(book: BookDetails): string {
    if (!book.average_rating) return 'No rating'

    const rating = Math.round(parseFloat(book.average_rating) * 10) / 10
    const ratingsCount = book.ratings_count ? parseInt(book.ratings_count, 10) : 0
    const ratingsText = ratingsCount ? ` (${ratingsCount.toLocaleString()} ratings)` : ''

    return `${rating}/5${ratingsText}`
  }
}

// Export singleton instance for convenience
export const bookService = BookService
