export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
  apiMock: ((import.meta.env.VITE_API_MOCK as string | undefined) ?? 'true') === 'true',
}

