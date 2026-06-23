import { isRecord } from "@/lib/api/types"

interface ApiErrorOptions {
  status?: number
  details?: unknown
  isNetworkError?: boolean
  cause?: unknown
}

interface ApiRequestOptions<T> {
  method?: string
  body?: unknown
  headers?: HeadersInit
  validate?: (value: unknown) => value is T
  errorMessage?: string
  allowEmpty?: boolean
}

export class ApiError extends Error {
  status?: number
  details?: unknown
  isNetworkError: boolean
  cause?: unknown

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message)
    this.name = "ApiError"
    this.status = options.status
    this.details = options.details
    this.isNetworkError = options.isNetworkError ?? false
    this.cause = options.cause
  }
}

function readErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value
  }

  if (!isRecord(value)) {
    return null
  }

  if (typeof value.error === "string" && value.error.trim()) {
    return value.error
  }

  if (typeof value.message === "string" && value.message.trim()) {
    return value.message
  }

  return null
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions<T> = {}): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    validate,
    errorMessage,
    allowEmpty = false,
  } = options

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    const payload = await parseResponsePayload(response)

    if (!response.ok) {
      const message =
        readErrorMessage(payload) ??
        errorMessage ??
        `Request failed with status ${response.status}`
      console.error(`[api] ${method} ${url} failed`, {
        status: response.status,
        payload,
      })
      throw new ApiError(message, {
        status: response.status,
        details: payload,
      })
    }

    if (!allowEmpty && (payload === null || payload === "")) {
      console.error(`[api] ${method} ${url} returned an empty response`)
      throw new ApiError("Received empty response from server", {
        status: response.status,
      })
    }

    if (validate && !validate(payload)) {
      console.error(`[api] ${method} ${url} returned invalid data`, payload)
      throw new ApiError("Received invalid data from server", {
        status: response.status,
        details: payload,
      })
    }

    return payload as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    console.error(`[api] ${method} ${url} network error`, error)
    throw new ApiError("Network error. Please check your connection and try again.", {
      isNetworkError: true,
      cause: error,
    })
  }
}
