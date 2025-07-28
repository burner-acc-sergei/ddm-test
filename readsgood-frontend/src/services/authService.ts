import { httpClient } from './httpClient'
import type { User, RegisterRequest } from './types'

export class AuthService {
  private static readonly AUTH_STORAGE_KEY = 'readsgood-auth'

  // Authentication methods
  static async register(userData: RegisterRequest): Promise<User> {
    return httpClient.postWithoutAuth<User>('/users/register', userData)
  }

  static async login(username: string, password: string): Promise<boolean> {
    const isValid = await httpClient.testAuth(username, password)

    if (isValid) {
      this.storeCredentials(username, password)
      return true
    }

    return false
  }

  static logout(): void {
    this.clearCredentials()
  }

  // Credential management
  static storeCredentials(username: string, password: string): void {
    const credentials = { username, password }
    localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(credentials))
  }

  static getStoredCredentials(): { username: string; password: string } | null {
    try {
      const stored = localStorage.getItem(this.AUTH_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  static clearCredentials(): void {
    localStorage.removeItem(this.AUTH_STORAGE_KEY)
  }

  static isAuthenticated(): boolean {
    return this.getStoredCredentials() !== null
  }

  static getCurrentUsername(): string | null {
    const credentials = this.getStoredCredentials()
    return credentials?.username || null
  }

  // Get current user info from backend
  static async getCurrentUser(): Promise<User | null> {
    try {
      return await httpClient.get<User>('users/me')
    } catch {
      return null
    }
  }
}

// Export singleton instance for convenience
export const authService = AuthService
