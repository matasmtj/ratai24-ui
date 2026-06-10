/** Decode the current user id from the stored access token (JWT `sub` claim). */
export function getCurrentUserId(): number | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized)) as { sub?: number | string };
    const id = typeof payload.sub === 'number' ? payload.sub : parseInt(String(payload.sub), 10);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}
