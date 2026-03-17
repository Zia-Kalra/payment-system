type JwtPayload = Record<string, unknown> & { exp?: number }

function base64UrlEncode(obj: unknown) {
  const json = JSON.stringify(obj)
  // btoa expects Latin1; for our ascii payload, this is fine.
  const b64 = btoa(json)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(b64url: string) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')
  const json = atob(padded)
  return JSON.parse(json) as JwtPayload
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    return base64UrlDecode(parts[1]!)
  } catch {
    return null
  }
}

export function isJwtExpired(token: string, skewSeconds = 15) {
  const payload = decodeJwt(token)
  const exp = payload?.exp
  if (!exp) return false
  const now = Math.floor(Date.now() / 1000)
  return exp <= now + skewSeconds
}

export function createMockJwt(payload: JwtPayload) {
  // Header and signature are not verified; this is for frontend-only demos.
  const header = { alg: 'none', typ: 'JWT' }
  const head = base64UrlEncode(header)
  const body = base64UrlEncode(payload)
  return `${head}.${body}.`
}

