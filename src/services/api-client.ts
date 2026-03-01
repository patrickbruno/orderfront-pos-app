const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 500
const DEFAULT_TIMEOUT_MS = 15_000

export class ApiError extends Error {
  code: string
  statusCode: number
  retryable: boolean

  constructor(opts: { message: string; code: string; statusCode: number; retryable: boolean }) {
    super(opts.message)
    this.name = 'ApiError'
    this.code = opts.code
    this.statusCode = opts.statusCode
    this.retryable = opts.retryable
  }
}

interface RequestOptions {
  timeout?: number
  signal?: AbortSignal
}

export class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  setAccessToken(token: string): void {
    this.accessToken = token
  }

  clearAccessToken(): void {
    this.accessToken = null
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  private restaurantId: string | null = null

  setRestaurantId(id: string): void {
    this.restaurantId = id
  }

  async get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, opts)
  }

  async post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, opts)
  }

  async patch<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, opts)
  }

  async put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, opts)
  }

  async delete<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, opts)
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    opts?: RequestOptions,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const timeout = opts?.timeout ?? DEFAULT_TIMEOUT_MS

    let lastError: ApiError | null = null

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }

        if (this.accessToken) {
          headers['Authorization'] = `Bearer ${this.accessToken}`
        }

        if (this.restaurantId) {
          headers['X-Restaurant-Id'] = this.restaurantId
        }

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: opts?.signal ?? controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          const error = new ApiError({
            message: errorBody.message ?? errorBody.error ?? response.statusText,
            code: errorBody.code ?? 'HTTP_ERROR',
            statusCode: response.status,
            retryable: response.status >= 500,
          })

          if (!error.retryable || attempt === MAX_RETRIES - 1) {
            throw error
          }

          lastError = error
          await this.backoff(attempt)
          continue
        }

        return (await response.json()) as T
      } catch (err) {
        if (err instanceof ApiError) throw err

        const isTimeout = err instanceof DOMException && err.name === 'AbortError'
        const error = new ApiError({
          message: isTimeout ? 'Request timed out' : 'Network error',
          code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          statusCode: 0,
          retryable: true,
        })

        if (attempt === MAX_RETRIES - 1) throw error

        lastError = error
        await this.backoff(attempt)
      }
    }

    throw lastError!
  }

  private backoff(attempt: number): Promise<void> {
    const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
    return new Promise((resolve) => setTimeout(resolve, delay))
  }
}
