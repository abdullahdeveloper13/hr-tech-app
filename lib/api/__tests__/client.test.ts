import { apiRequest } from "@/lib/api/client"

function createMockResponse({
  ok = true,
  status = 200,
  body = "",
}: {
  ok?: boolean
  status?: number
  body?: string
}): Response {
  return {
    ok,
    status,
    text: jest.fn().mockResolvedValue(body),
  } as unknown as Response
}

describe("apiRequest", () => {
  const fetchMock = jest.fn()
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("returns parsed JSON payload for successful responses", async () => {
    fetchMock.mockResolvedValue(
      createMockResponse({
        body: JSON.stringify({ ok: true, value: "ready" }),
      }),
    )

    const result = await apiRequest<{ ok: boolean; value: string }>("/api/test")

    expect(result).toEqual({ ok: true, value: "ready" })
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({ method: "GET" }),
    )
  })

  it("throws ApiError with server message for failed responses", async () => {
    fetchMock.mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 400,
        body: JSON.stringify({ error: "Bad request" }),
      }),
    )

    await expect(apiRequest("/api/test")).rejects.toMatchObject({
      name: "ApiError",
      message: "Bad request",
      status: 400,
    })
  })

  it("throws ApiError when response is empty and allowEmpty is false", async () => {
    fetchMock.mockResolvedValue(createMockResponse({ body: "" }))

    await expect(apiRequest("/api/test")).rejects.toMatchObject({
      name: "ApiError",
      message: "Received empty response from server",
    })
  })

  it("returns null when empty responses are explicitly allowed", async () => {
    fetchMock.mockResolvedValue(createMockResponse({ body: "" }))

    const result = await apiRequest<null>("/api/test", { allowEmpty: true })

    expect(result).toBeNull()
  })

  it("throws ApiError when response validation fails", async () => {
    fetchMock.mockResolvedValue(
      createMockResponse({
        body: JSON.stringify({ unexpected: true }),
      }),
    )

    await expect(
      apiRequest("/api/test", {
        validate: (value): value is { ok: true } =>
          typeof value === "object" && value !== null && "ok" in value,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Received invalid data from server",
    })
  })

  it("converts network failures into ApiError with network metadata", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))

    await expect(apiRequest("/api/test")).rejects.toMatchObject({
      name: "ApiError",
      isNetworkError: true,
      message: "Network error. Please check your connection and try again.",
    })
  })
})
