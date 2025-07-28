// Types for basic XML parser output (ignoreAttrs: true, clean structure)

// Author interface - simplified without attributes
export interface Author {
  id: string;
  name: string;
  role?: string;
  image_url?: string;
  small_image_url?: string;
  link?: string;
  average_rating?: string;
  ratings_count?: string;
  text_reviews_count?: string;
}

// Work interface for search results - based on actual parser output
export interface Work {
  id: string;
  books_count?: string;
  ratings_count?: string;
  text_reviews_count?: string;
  original_publication_year?: string;
  original_publication_month?: string;
  original_publication_day?: string;
  average_rating?: string;
  best_book: {
    id: string;
    title: string;
    author: Author;
    image_url: string;
    small_image_url: string;
  };
}

// Search response structure
export interface SearchBooksResponse {
  books: Work[];
  total: number;
}

// Book work details - simplified structure
export interface BookWork {
  id?: string;
  books_count?: string;
  best_book_id?: string;
  reviews_count?: string;
  ratings_sum?: string;
  ratings_count?: string;
  text_reviews_count?: string;
  original_publication_year?: string;
  original_publication_month?: string;
  original_publication_day?: string;
  original_title?: string;
  original_language_id?: string;
  media_type?: string;
  rating_dist?: string;
  desc_user_id?: string;
  default_chaptering_book_id?: string;
  default_description_language_code?: string;
  work_uri?: string;
}

// Series work interface - simplified
export interface SeriesWork {
  id?: string;
  user_position?: string;
  series?: {
    id?: string;
    title?: string;
    description?: string;
    note?: string;
    series_works_count?: string;
    primary_work_count?: string;
    numbered?: string;
  };
}

// Similar book interface - based on actual output
export interface SimilarBook {
  id?: string;
  uri?: string;
  title?: string;
  title_without_series?: string;
  link?: string;
  small_image_url?: string;
  image_url?: string;
  num_pages?: string;
  work?: {
    id?: string;
  };
  isbn?: string;
  isbn13?: string;
  average_rating?: string;
  ratings_count?: string;
  publication_year?: string;
  publication_month?: string;
  publication_day?: string;
  authors?: {
    author: Author;
  };
}

// Link interface - basic structure
export interface Link {
  id?: string;
  name?: string;
  link?: string;
}

// Complete book details interface - based on actual simplified parser output
export interface BookDetails {
  id: string;
  title: string;
  isbn?: string;
  isbn13?: string;
  asin?: string;
  kindle_asin?: string;
  marketplace_id?: string;
  country_code?: string;
  image_url?: string;
  small_image_url?: string;
  publication_year?: string;
  publication_month?: string;
  publication_day?: string;
  publisher?: string;
  language_code?: string;
  is_ebook?: string;
  description?: string;
  work?: BookWork;
  average_rating?: string;
  num_pages?: string;
  format?: string;
  edition_information?: string;
  ratings_count?: string;
  text_reviews_count?: string;
  url?: string;
  link?: string;

  // Author can be single or array
  authors?: {
    author: Author | Author[];
  };

  // HTML widget content
  reviews_widget?: string;

  // Note: popular_shelves data is lost with ignoreAttrs: true
  // This would be empty strings or missing data
  popular_shelves?: {
    shelf: string[] | any[];
  };

  // Links - can be single or array
  book_links?: {
    book_link: Link | Link[];
  };
  buy_links?: {
    buy_link: Link[];
  };

  // Series information
  series_works?: {
    series_work: SeriesWork;
  };

  // Similar books
  similar_books?: {
    book: SimilarBook[];
  };
}

// Legacy types for backward compatibility
/** @deprecated Use Work instead */
export type GoodreadsBook = Work;

/** @deprecated Use SearchBooksResponse instead */
export interface GoodreadsSearchResponse {
  GoodreadsResponse: {
    search: {
      results: {
        work: GoodreadsBook[] | GoodreadsBook;
      };
      total_results: string;
    };
  };
}

/** @deprecated Use SearchBooksResponse instead */
export interface GoodreadsSearchResponse {
  GoodreadsResponse: {
    search: {
      results: {
        work: GoodreadsBook[] | GoodreadsBook;
      };
      total_results: string;
    };
  };
}
