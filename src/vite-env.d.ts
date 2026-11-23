/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Unset or "/" = same origin (proxied to R2), "/photos-local" for local output, or a full URL */
  readonly VITE_PHOTOS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
