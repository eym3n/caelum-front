export function generateSessionId() {
  // Prefix + UUID v4
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback (very rare in Next modern runtimes)
  return `${Math.random().toString(36).slice(2, 10)}-${Date.now()}`
}
