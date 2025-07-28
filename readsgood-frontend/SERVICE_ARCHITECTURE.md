# Frontend Services Architecture

## Overview

This project follows a clean, modular service-oriented architecture that separates concerns and provides a maintainable codebase for your family's future needs.

## Structure

```
src/services/
├── index.ts              # Main exports and convenience object
├── types.ts              # All TypeScript interfaces and types
├── httpClient.ts         # Axios-based HTTP client with interceptors
├── authService.ts        # Authentication and user management
├── goodreadsService.ts   # Goodreads integration (tokens, OAuth)
└── bookService.ts        # Book search and utilities
```

## Service Layers

### 1. **HTTP Client** (`httpClient.ts`)
- **Purpose**: Centralized HTTP communication using Axios
- **Features**:
  - Automatic authentication headers
  - Request/response interceptors
  - Proper error handling with custom `ApiError` class
  - Timeout configuration
  - Base URL management

### 2. **Authentication Service** (`authService.ts`)
- **Purpose**: User authentication and credential management
- **Methods**:
  - `register()` - User registration
  - `login()` - User authentication
  - `logout()` - Clear credentials
  - `storeCredentials()` - Save to localStorage
  - `isAuthenticated()` - Check auth status
  - `getCurrentUsername()` - Get logged-in user

### 3. **Goodreads Service** (`goodreadsService.ts`)
- **Purpose**: Goodreads API integration
- **Methods**:
  - `getTokens()` - Retrieve stored tokens
  - `uploadTokens()` - Store tokens manually
  - `removeTokens()` - Delete tokens
  - `initializeOAuth()` - Start OAuth flow
  - `completeOAuth()` - Finish OAuth flow
  - `hasValidTokens()` - Check token validity

### 4. **Book Service** (`bookService.ts`)
- **Purpose**: Book search and data utilities
- **Methods**:
  - `searchBooks()` - Search Goodreads API
  - `getBookDetails()` - Get single book info
  - `formatBookTitle()` - Title formatting
  - `formatBookAuthor()` - Author formatting
  - `getBookCoverUrl()` - Cover image URLs
  - `formatRating()` - Rating display

## Usage Patterns

### In Pinia Stores
```typescript
import { authService, bookService, ApiError } from '@/services'

// Use services directly
const success = await authService.login(username, password)
const results = await bookService.searchBooks(query)
```

### In Components
```typescript
import { services } from '@/services'

// Use convenience object
const user = services.auth.getCurrentUsername()
const coverUrl = services.books.getBookCoverUrl(book)
```

### Error Handling
```typescript
try {
  await bookService.searchBooks(query)
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`API Error ${error.status}: ${error.message}`)
  }
}
```

## Benefits

### 🏗️ **Clean Architecture**
- **Separation of Concerns**: Each service handles one domain
- **Single Responsibility**: Clear, focused functionality
- **Dependency Injection**: Easy testing and mocking

### 🔧 **Maintainability**
- **Centralized Logic**: Business logic in services, not components
- **Consistent Patterns**: Standard service interfaces
- **Easy Refactoring**: Change implementation without touching UI

### 🛡️ **Type Safety**
- **Full TypeScript**: Complete type coverage
- **Interface Contracts**: Clear service boundaries
- **Error Types**: Structured error handling

### 🚀 **Developer Experience**
- **Auto-completion**: Full IDE support
- **Documentation**: Self-documenting code
- **Testing**: Easy unit testing of services

### 👨‍👩‍👧‍👦 **Family-Friendly**
- **Easy Onboarding**: Clear structure for new developers
- **Scalable**: Can grow with additional features
- **Future-Proof**: Modern patterns that will age well

## Best Practices

1. **Always use services for API calls** - Never call HTTP directly from components
2. **Handle errors consistently** - Use ApiError for all service errors
3. **Keep utilities in services** - Formatting, validation, etc.
4. **Use TypeScript strictly** - All services are fully typed
5. **Test services independently** - Services can be unit tested easily

## Migration Guide

### From Old Utils Pattern
```typescript
// ❌ Old way
import { api } from '@/utils/api'
const result = await api.searchBooks(query)

// ✅ New way
import { bookService } from '@/services'
const result = await bookService.searchBooks(query)
```

### For New Features
1. Add types to `types.ts`
2. Create service class with static methods
3. Export from `index.ts`
4. Use in stores/components via services

This architecture ensures your codebase remains clean, testable, and maintainable for years to come! 🎉
