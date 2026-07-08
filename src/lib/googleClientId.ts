/** Returns a trimmed Google OAuth client id, or empty when unset / still a placeholder. */
export function resolveGoogleClientId(): string {
  const raw = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes('YOUR_CLIENT_ID')) return '';
  return trimmed;
}
