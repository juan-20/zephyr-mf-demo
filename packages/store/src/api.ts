let baseUrl = 'http://localhost:3000';

/** Called once by the shell; remotes share this module as a singleton. */
export function configureApi(url: string) {
  baseUrl = url.replace(/\/$/, '');
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(baseUrl + path, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {
      // keep the status text
    }
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
