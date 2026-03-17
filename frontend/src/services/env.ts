export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
  apiMock: ((import.meta.env.VITE_API_MOCK as string | undefined) ?? 'true') === 'true',
}

export function assertFrontendEnv() {
  if (!env.apiMock && !env.apiBaseUrl) {
    // Fail fast for misconfigured deployments.
    throw new Error('VITE_API_BASE_URL is required when VITE_API_MOCK=false')
  }
}

