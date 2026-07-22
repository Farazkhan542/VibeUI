// The backend's clean_error() always includes the word "quota" in the
// message it sends for a Gemini rate-limit/quota exhaustion — used here to
// decide whether an error deserves the prominent global popup instead of
// just inline text.
export function isQuotaError(message: string): boolean {
  return /quota/i.test(message)
}
