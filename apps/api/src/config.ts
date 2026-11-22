export const isProd = process.env.NODE_ENV === 'production';

export function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s) return s;
  if (isProd) throw new Error('JWT_SECRET must be set in production');
  return 'dev-only-secret';
}

// Zephyr serves every deploy from its own origin, so allow the deploy URLs
// of this project by pattern instead of a fixed list.
const DEFAULT_PATTERN =
  String.raw`^https://(?:[a-z0-9]+-\d+-)?[a-z0-9-]+-zephyr-mf-demo-juan-(?:20)?(?:-[a-z0-9]+)?-ze\.zephyrcloud\.app$`;

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // same-origin tools, curl, tests
  const list = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (list.includes(origin)) return true;
  return new RegExp(process.env.CORS_ORIGIN_PATTERN ?? DEFAULT_PATTERN).test(origin);
}
