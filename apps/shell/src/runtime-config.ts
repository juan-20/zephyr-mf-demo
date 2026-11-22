const FALLBACK_API_URL = 'http://localhost:3000';

/**
 * Resolves the API URL at runtime.
 *
 * Zephyr writes every ZE_PUBLIC_* variable into /zephyr-manifest.json and serves the
 * values of the environment the page is loaded from (production, staging, ...), so the
 * same build can talk to different APIs without a rebuild. Local development has no
 * manifest and uses the fallback.
 *
 * Do not read ZE_PUBLIC_* through import.meta.env here: the Zephyr plugin rewrites those
 * reads into an import that only resolves on a deployed page, which breaks the dev server.
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
    // No manifest (the dev server answers with index.html): use the fallback below.
  }
  return FALLBACK_API_URL;
}
