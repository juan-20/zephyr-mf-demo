const FALLBACK_API_URL = 'http://localhost:3000';

/**
 * Resolves the API URL at runtime.
 *
 * Zephyr writes every ZE_PUBLIC_* variable into /zephyr-manifest.json and serves the
 * values of the environment the page is loaded from (production, staging, ...), so the
 * same build can talk to different APIs without a rebuild. The build-time value is only
 * a fallback for local development, where the manifest does not exist.
 */
export async function resolveApiUrl(): Promise<string> {
  try {
    const res = await fetch('/zephyr-manifest.json', { cache: 'no-store' });
    if (res.ok) {
      const manifest = (await res.json()) as { zeVars?: Record<string, string> };
      const url = manifest.zeVars?.ZE_PUBLIC_API_URL;
      if (url) return url;
    }
  } catch {
    // No manifest (local dev server serves index.html here): use the fallback below.
  }
  return import.meta.env.ZE_PUBLIC_API_URL ?? FALLBACK_API_URL;
}
