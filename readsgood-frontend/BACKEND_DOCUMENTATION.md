# API Documentation

## Authentication

All endpoints (except `/users/register`) require Basic Authentication:

```
Authorization: Basic <base64-encoded-username:password>
```

## User Endpoints

### Register User

- **POST** `/users/register`
- **Body**:

```json
{
  "username": "testuser",
  "password": "password123"
}
```

- **Response**: User object with id, username, createdAt

### Upload Goodreads Token (Manual)

- **PUT** `/users/goodreads-token`
- **Headers**: `Authorization: Basic <credentials>`
- **Body**:

```json
{
  "goodreadsToken": "your-oauth-token",
  "goodreadsSecret": "your-oauth-token-secret",
  "goodreadsUserId": "optional-goodreads-user-id"
}
```

- **Response**: Updated user object with token information

### Get Goodreads Token

- **GET** `/users/goodreads-token`
- **Headers**: `Authorization: Basic <credentials>`
- **Response**:

```json
{
  "goodreadsToken": "your-oauth-token",
  "goodreadsSecret": "your-oauth-token-secret",
  "goodreadsUserId": "optional-goodreads-user-id"
}
```

### Remove Goodreads Token

- **DELETE** `/users/goodreads-token`
- **Headers**: `Authorization: Basic <credentials>`
- **Response**: User object without token information

## Goodreads Endpoints

### Search Books

- **GET** `/goodreads/search?q=<query>`
- **Headers**: `Authorization: Basic <credentials>`
- **Note**: Requires user to have Goodreads tokens (either via OAuth flow or manual upload)

### Initialize OAuth

- **GET** `/goodreads/auth/init`
- **Headers**: `Authorization: Basic <credentials>`
- **Response**:

```json
{
  "authorizeUrl": "https://goodreads.com/oauth/authorize?..."
}
```

### OAuth Callback

- **GET** `/goodreads/auth/callback?oauth_token=<token>&authorize=<verifier>`
- **Headers**: `Authorization: Basic <credentials>`
- **Note**: This automatically saves tokens to database after successful OAuth

## Token Storage Flow

### Automatic (OAuth Flow)

1. User calls `/goodreads/auth/init` to get authorization URL
2. User visits URL and authorizes application
3. User calls `/goodreads/auth/callback` with OAuth parameters
4. Tokens are automatically saved to database

### Manual Upload

1. User obtains Goodreads OAuth tokens externally
2. User calls `/users/goodreads-token` (PUT) to upload tokens
3. Tokens are stored in database for future use

### Using Stored Tokens

- Once tokens are stored (via either method), they persist in the database
- All Goodreads API calls will use stored tokens automatically
- No need to re-authenticate unless tokens are revoked
