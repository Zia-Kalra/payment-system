export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function passwordScore(pw: string) {
  const v = pw ?? ''
  let score = 0
  if (v.length >= 8) score += 1
  if (/[A-Z]/.test(v)) score += 1
  if (/[a-z]/.test(v)) score += 1
  if (/[0-9]/.test(v)) score += 1
  if (/[^A-Za-z0-9]/.test(v)) score += 1
  return score // 0..5
}

export function passwordRequirements(pw: string) {
  return {
    minLength: (pw?.length ?? 0) >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  }
}

