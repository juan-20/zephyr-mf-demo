import { isAllowedOrigin } from '../src/config';

describe('CORS origin allow-list', () => {
  it.each([
    'http://localhost:5173',
    // Environment URLs have no build number or hash.
    'https://staging-shell-zephyr-mf-demo-juan-20-ze.zephyrcloud.app',
    'https://production-shell-zephyr-mf-demo-juan-20-ze.zephyrcloud.app',
    'https://juanalvesandrade-29-auth-zephyr-mf-demo-juan-20-26a5ab7b8-ze.zephyrcloud.app',
    // Zephyr truncates long host names, so the org part can be cut short.
    'https://juanalvesandrade-31-composer-zephyr-mf-demo-juan--d80495006-ze.zephyrcloud.app',
  ])('allows %s', (origin) => {
    expect(isAllowedOrigin(origin)).toBe(true);
  });

  it.each([
    'http://evil.com',
    'https://staging-shell-other-project-juan-20-ze.zephyrcloud.app',
    'https://staging-shell-zephyr-mf-demo-acme-ze.zephyrcloud.app',
    'https://evil.zephyrcloud.app',
    'https://x-1-app-other-project-acme-1-ze.zephyrcloud.app',
    'https://juanalvesandrade-1-a-zephyr-mf-demo-juan-20-1-ze.zephyrcloud.app.evil.com',
  ])('blocks %s', (origin) => {
    expect(isAllowedOrigin(origin)).toBe(false);
  });
});
