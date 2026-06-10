const REMOTE_API_URL = import.meta.env.VITE_API_URL || 'https://ratai24.onrender.com';
const LOCAL_API_URL = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:3000';
const FORCE_REMOTE = import.meta.env.VITE_API_FORCE_REMOTE === 'true';
const LOCAL_PROBE_MS = Number(import.meta.env.VITE_API_LOCAL_PROBE_MS || 1000);

async function probeHealth(baseUrl: string, timeoutMs: number): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Dev: use local API when /health responds, otherwise remote.
 * Prod: always remote (VITE_API_URL or default hosted URL).
 * Set VITE_API_FORCE_REMOTE=true to always use remote during local dev.
 */
export async function resolveApiBaseUrl(): Promise<string> {
  if (import.meta.env.PROD || FORCE_REMOTE) {
    return REMOTE_API_URL.replace(/\/$/, '');
  }

  const localAvailable = await probeHealth(LOCAL_API_URL, LOCAL_PROBE_MS);
  if (localAvailable) {
    const local = LOCAL_API_URL.replace(/\/$/, '');
    console.info(`[ratai24] API: local backend (${local})`);
    return local;
  }

  const remote = REMOTE_API_URL.replace(/\/$/, '');
  console.info(`[ratai24] API: remote backend (${remote}) — local not reachable at ${LOCAL_API_URL}`);
  return remote;
}

export { REMOTE_API_URL, LOCAL_API_URL };
