/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the PulseMonitor API, without a trailing slash or /api/v1. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
