import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiError, type ApiErrorResponse } from './types'

class HttpClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const auth = this.getStoredAuth()
        if (auth && config.headers) {
          config.headers.Authorization = `Basic ${btoa(`${auth.username}:${auth.password}`)}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const errorData: ApiErrorResponse = error.response.data || {}
          const message =
            errorData.message ||
            errorData.error ||
            `HTTP ${error.response.status}: ${error.response.statusText}`

          throw new ApiError(message, error.response.status, errorData.details || 'API_ERROR')
        } else if (error.request) {
          throw new ApiError('Network error - no response received', 0)
        } else {
          throw new ApiError(error.message || 'Request setup error', 0)
        }
      },
    )
  }

  private getStoredAuth(): { username: string; password: string } | null {
    try {
      const stored = localStorage.getItem('readsgood-auth')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }

  async postWithoutAuth<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const configWithoutAuth = {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: undefined, // Remove auth header
      },
    }

    const response: AxiosResponse<T> = await this.client.post(url, data, configWithoutAuth)
    return response.data
  }

  async testAuth(username: string, password: string): Promise<boolean> {
    try {
      await this.client.get('/users/me', {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      })
      return true
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return true
      }
      return false
    }
  }
}

// Export singleton instance
export const httpClient = new HttpClient()
