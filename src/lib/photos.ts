import type { Photo, PhotoFormat } from "../content/types";

// Default "" = same origin (/photos/...): proxied to R2 by vercel.json in production and by
// vite.config.ts in dev. Set VITE_PHOTOS_BASE_URL=/photos-local to use `--target local` output.
const BASE_URL = (import.meta.env.VITE_PHOTOS_BASE_URL ?? "").replace(/\/+$/, "");

const MIME: Record<PhotoFormat, string> = { avif: "image/avif", webp: "image/webp" };

/** URL of one encoded variant. `width` snaps up to the nearest available size. */
export const photoUrl = (photo: Photo, width: number, format: PhotoFormat = "webp") => {
  const w = photo.widths.find((x) => x >= width) ?? photo.widths[photo.widths.length - 1];
  return `${BASE_URL}/${photo.path}/${w}.${format}`;
};

/** `srcset` string covering every encoded width, so the browser picks by viewport + DPR. */
export const photoSrcSet = (photo: Photo, format: PhotoFormat = "webp") =>
  photo.widths.map((w) => `${BASE_URL}/${photo.path}/${w}.${format} ${w}w`).join(", ");

/**
 * Everything a <picture> needs. AVIF first (smallest), WebP as the fallback `<img>`.
 *
 *   const { sources, img } = pictureProps(photo, "(min-width: 1024px) 33vw, 100vw");
 *   <picture>{sources.map(s => <source key={s.type} {...s} />)}<img {...img} /></picture>
 */
export const pictureProps = (photo: Photo, sizes: string, { eager = false } = {}) => ({
  sources: photo.formats
    .filter((f) => f !== "webp")
    .map((f) => ({ type: MIME[f], srcSet: photoSrcSet(photo, f), sizes })),
  /** Spread onto <img> too. Lowercase: React 18 doesn't map `fetchPriority` yet. */
  priority: { fetchpriority: eager ? "high" : "auto" } as Record<string, string>,
  img: {
    src: photoUrl(photo, 1200, "webp"),
    srcSet: photoSrcSet(photo, "webp"),
    sizes,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    loading: eager ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    style: {
      backgroundColor: photo.color,
      backgroundImage: `url("${photo.placeholder}")`,
      backgroundSize: "cover",
    },
  },
});

/** Warm the cache for a photo the user is likely to open next (e.g. lightbox neighbours). */
export const preloadPhoto = (photo: Photo, width: number) => {
  const img = new Image();
  img.decoding = "async";
  img.src = photoUrl(photo, width, photo.formats.includes("avif") ? "avif" : "webp");
};
