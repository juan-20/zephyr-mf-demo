/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL. Managed by Zephyr: overridable per environment without a rebuild. */
  readonly ZE_PUBLIC_API_URL?: string;
}
