import { httpClient } from './httpClient'
import type { AuthResponse } from './types'

export class GoodreadsService {
  static async initializeOAuth(): Promise<string> {
    const response = await httpClient.get<AuthResponse>('/goodreads/auth/init')
    return response.authorizeUrl || ''
  }

  static async completeOAuth(oauthToken: string, oauthVerifier: string): Promise<void> {
    const params = new URLSearchParams({
      oauth_token: oauthToken,
      authorize: oauthVerifier,
    })

    return httpClient.get<void>(`/goodreads/auth/callback?${params.toString()}`)
  }
}

// Export singleton instance for convenience
export const goodreadsService = GoodreadsService
