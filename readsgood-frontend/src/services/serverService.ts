import { httpClient } from './httpClient'

export class ServerService {
  static async checkStatus(): Promise<boolean> {
    try {
      const response = await httpClient.get<{ success: boolean }>('/')
      return response.success === true
    } catch {
      return false
    }
  }
}

// Export singleton instance for convenience
export const serverService = ServerService
