/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "/" (same-origin via the vercel.json proxy), a full bucket URL, or unset for /photos-local */
  readonly VITE_PHOTOS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
