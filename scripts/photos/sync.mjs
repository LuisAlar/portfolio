#!/usr/bin/env node
/**
 * Photo pipeline: originals -> responsive AVIF/WebP variants -> object storage -> typed manifest.
 *
 *   photos/originals/<collection>/*.jpg|png|…  (git-ignored, full-res exports, one folder per collection)
 *   photos/photos.json                          (committed, hand-edited: per collection title/description/cover,
 *                                                per photo alt/title/caption/tags/order/hidden)
 *   src/content/photos.generated.json           (committed, generated: what the site reads)
 *
 * Object keys: photos/<collection>/<photo-slug>-<hash>/<width>.<avif|webp>
 *
 * Usage:
 *   npm run photos:sync                 # upload to the target in PHOTOS_TARGET (default: local)
 *   npm run photos:sync -- --target r2  # Cloudflare R2 (or any S3-compatible bucket)
 *   npm run photos:sync -- --force      # re-encode + re-upload everything
 *   npm run photos:sync -- --prune      # also delete remote objects no longer in the manifest
 *   npm run photos:sync -- --dry-run    # process, but don't upload or write files
 *
 * Every object key contains a hash of the original + encoder settings, so URLs are
 * immutable and served with a 1-year cache. Editing a photo produces new URLs.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import exifReader from "exif-reader";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ORIGINALS_DIR = path.join(ROOT, "photos/originals");
const META_PATH = path.join(ROOT, "photos/photos.json");
const MANIFEST_PATH = path.join(ROOT, "src/content/photos.generated.json");
const LOCAL_OUT_DIR = path.join(ROOT, "public/photos-local");

/** Encoder settings. Changing these changes the hash, so every photo is re-generated. */
const PIPELINE = {
  version: 1,
  widths: [400, 800, 1200, 1600, 2400],
  formats: {
    avif: { quality: 50, effort: 4, chromaSubsampling: "4:2:0" },
    webp: { quality: 78, effort: 5 },
  },
  placeholderWidth: 24,
};

const KEY_PREFIX = "photos";
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const INPUT_EXT = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".heic", ".heif", ".avif"]);

// ---------------------------------------------------------------- args

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const TARGET = option("target") ?? process.env.PHOTOS_TARGET ?? "local";
const FORCE = flag("force");
const PRUNE = flag("prune");
const DRY_RUN = flag("dry-run");

// ---------------------------------------------------------------- storage targets

/** @typedef {{ name: string, exists(key: string): Promise<boolean>, put(key: string, body: Buffer, contentType: string): Promise<void>, list(prefix: string): Promise<string[]>, remove(keys: string[]): Promise<void> }} Storage */

/** @returns {Storage} */
function localStorage() {
  const file = (key) => path.join(LOCAL_OUT_DIR, ...key.split("/"));
  return {
    name: `local (${path.relative(ROOT, LOCAL_OUT_DIR)})`,
    async exists(key) {
      return existsSync(file(key));
    },
    async put(key, body) {
      await mkdir(path.dirname(file(key)), { recursive: true });
      await writeFile(file(key), body);
    },
    async list(prefix) {
      const dir = file(prefix);
      if (!existsSync(dir)) return [];
      const entries = await readdir(dir, { recursive: true, withFileTypes: true });
      return entries
        .filter((e) => e.isFile())
        .map((e) => path.relative(LOCAL_OUT_DIR, path.join(e.parentPath, e.name)).split(path.sep).join("/"));
    },
    async remove(keys) {
      await Promise.all(keys.map((k) => rm(file(k), { force: true })));
    },
  };
}

/** Cloudflare R2 via its S3-compatible API. Also works for Backblaze B2, MinIO, AWS S3. */
async function s3Storage() {
  const { S3Client, HeadObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } =
    await import("@aws-sdk/client-s3");

  const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
  const missing = required.filter((k) => !process.env[k] && !(k === "R2_ACCOUNT_ID" && process.env.S3_ENDPOINT));
  if (missing.length) {
    throw new Error(`Missing env vars for target "r2": ${missing.join(", ")} (see .env.example)`);
  }
  const Bucket = process.env.R2_BUCKET;
  const client = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT ?? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  return {
    name: `r2 (bucket ${Bucket})`,
    async exists(Key) {
      try {
        await client.send(new HeadObjectCommand({ Bucket, Key }));
        return true;
      } catch (err) {
        if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NotFound") return false;
        throw err;
      }
    },
    async put(Key, Body, ContentType) {
      // The SDK retries HTTP errors, but not dropped TLS connections; retry those here.
      for (let attempt = 1; ; attempt++) {
        try {
          await client.send(new PutObjectCommand({ Bucket, Key, Body, ContentType, CacheControl: CACHE_CONTROL }));
          return;
        } catch (err) {
          if (attempt >= 4 || err?.$metadata?.httpStatusCode === 403) throw err;
          await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        }
      }
    },
    async list(Prefix) {
      const keys = [];
      let ContinuationToken;
      do {
        const res = await client.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken }));
        for (const o of res.Contents ?? []) if (o.Key) keys.push(o.Key);
        ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (ContinuationToken);
      return keys;
    },
    async remove(keys) {
      for (let i = 0; i < keys.length; i += 1000) {
        const Objects = keys.slice(i, i + 1000).map((Key) => ({ Key }));
        await client.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects } }));
      }
    },
  };
}

async function getStorage() {
  if (TARGET === "local") return localStorage();
  if (TARGET === "r2" || TARGET === "s3") return s3Storage();
  throw new Error(`Unknown target "${TARGET}". Use "local" or "r2".`);
}

// ---------------------------------------------------------------- helpers

const readJson = async (file, fallback) => (existsSync(file) ? JSON.parse(await readFile(file, "utf8")) : fallback);

const slugify = (name) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toHex = ({ r, g, b }) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

const formatShutter = (s) => (s >= 1 ? `${s}s` : `1/${Math.round(1 / s)}s`);

function readExif(buffer) {
  if (!buffer) return undefined;
  try {
    const { Image = {}, Photo = {} } = exifReader(buffer);
    const exif = {
      camera: [Image.Make, Image.Model].filter(Boolean).join(" ").trim() || undefined,
      lens: Photo.LensModel?.trim() || undefined,
      focalLength: Photo.FocalLength ? `${Math.round(Photo.FocalLength)}mm` : undefined,
      aperture: Photo.FNumber ? `f/${Photo.FNumber}` : undefined,
      shutter: Photo.ExposureTime ? formatShutter(Photo.ExposureTime) : undefined,
      iso: Photo.ISOSpeedRatings ? Number([].concat(Photo.ISOSpeedRatings)[0]) : undefined,
      // EXIF times have no zone; exif-reader parses them as UTC, so slicing keeps the camera-local wall time.
      takenAt: Photo.DateTimeOriginal instanceof Date ? Photo.DateTimeOriginal.toISOString().slice(0, 19) : undefined,
    };
    // Avoid "Canon Canon EOS R6" style duplication.
    if (Image.Make && Image.Model?.startsWith(Image.Make)) exif.camera = Image.Model.trim();
    const clean = Object.fromEntries(Object.entries(exif).filter(([, v]) => v !== undefined));
    return Object.keys(clean).length ? clean : undefined;
  } catch {
    return undefined;
  }
}

/** Encode one original into every width × format, plus a tiny blurred placeholder. */
async function processImage(file) {
  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;
  if (!width || !height) throw new Error(`Could not read dimensions of ${file}`);

  // Only widths smaller than the original, plus the original itself if it's under the max.
  const maxW = Math.min(width, PIPELINE.widths.at(-1));
  const widths = [...new Set([...PIPELINE.widths.filter((w) => w < maxW), maxW])].sort((a, b) => a - b);

  const base = () => sharp(input, { failOn: "none" }).rotate(); // .rotate() = apply EXIF orientation
  const variants = [];
  for (const w of widths) {
    for (const [format, opts] of Object.entries(PIPELINE.formats)) {
      const body = await base().resize({ width: w, withoutEnlargement: true })[format](opts).toBuffer();
      variants.push({ width: w, format, body });
    }
  }

  const tiny = await base().resize({ width: PIPELINE.placeholderWidth }).blur(0.6).webp({ quality: 40 }).toBuffer();
  const { dominant } = await base().resize({ width: 64 }).stats();

  return {
    width,
    height,
    widths,
    variants,
    placeholder: `data:image/webp;base64,${tiny.toString("base64")}`,
    color: toHex(dominant),
    exif: readExif(meta.exif),
  };
}

// ---------------------------------------------------------------- main

async function main() {
  if (!existsSync(ORIGINALS_DIR)) {
    await mkdir(ORIGINALS_DIR, { recursive: true });
    console.log(`Created ${path.relative(ROOT, ORIGINALS_DIR)}/ — add a folder per collection (originals/<collection>/) and run again.`);
  }

  const storage = await getStorage();
  console.log(`Target: ${storage.name}${DRY_RUN ? " (dry run)" : ""}`);

  const pipelineHash = createHash("sha256").update(JSON.stringify(PIPELINE)).digest("hex");
  const meta = await readJson(META_PATH, {});
  const previous = await readJson(MANIFEST_PATH, { photos: [] });
  const previousById = new Map(previous.photos.map((p) => [p.id, p]));

  const warnings = [];
  const collectionDirs = [];
  for (const entry of await readdir(ORIGINALS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) collectionDirs.push(entry.name);
    else if (INPUT_EXT.has(path.extname(entry.name).toLowerCase()))
      warnings.push(`Skipping ${entry.name}: photos must be inside a collection folder (originals/<collection>/)`);
  }
  collectionDirs.sort();

  const photos = [];
  const collections = [];
  let encoded = 0;
  let uploaded = 0;

  for (const dirName of collectionDirs) {
    const collection = slugify(dirName);
    const dir = path.join(ORIGINALS_DIR, dirName);
    const files = (await readdir(dir)).filter((f) => INPUT_EXT.has(path.extname(f).toLowerCase())).sort();
    if (!files.length) continue;

    // Seed metadata stubs so you only have to fill in the blanks.
    const cMeta = (meta[collection] ??= { title: dirName, description: "", cover: "", photos: {} });
    cMeta.photos ??= {};
    if (cMeta.hidden) continue;

    console.log(`\n${collection}/`);
    const seen = new Set();
    const collectionPhotos = [];

    for (const fileName of files) {
      const slug = slugify(path.parse(fileName).name);
      if (seen.has(slug)) {
        warnings.push(`Skipping ${dirName}/${fileName}: another file already maps to "${slug}"`);
        continue;
      }
      seen.add(slug);
      const id = `${collection}-${slug}`;

      const file = path.join(dir, fileName);
      const hash = createHash("sha256")
        .update(await readFile(file))
        .update(pipelineHash)
        .digest("hex")
        .slice(0, 12);
      const keyBase = `${KEY_PREFIX}/${collection}/${slug}-${hash}`;

      const info = (cMeta.photos[slug] ??= { alt: "", title: "", caption: "", tags: [] });
      if (info.hidden) continue;
      if (!info.alt) warnings.push(`${collection}/${slug}: missing alt text in photos/photos.json`);

      const prev = previousById.get(id);
      const largestKey = (p) => `${p.path}/${p.widths.at(-1)}.webp`;
      const unchanged = !FORCE && prev?.path === keyBase && (DRY_RUN || (await storage.exists(largestKey(prev))));

      let core;
      if (unchanged) {
        const { width, height, widths, placeholder, color, exif } = prev;
        core = { width, height, widths, placeholder, color, exif };
        console.log(`  ✓ ${slug} (unchanged)`);
      } else {
        process.stdout.write(`  ⟳ ${slug} … `);
        const result = await processImage(file);
        encoded++;
        if (!DRY_RUN) {
          await Promise.all(
            result.variants.map(({ width, format, body }) =>
              storage.put(`${keyBase}/${width}.${format}`, body, `image/${format}`),
            ),
          );
          uploaded += result.variants.length;
        }
        const kb = Math.round(result.variants.reduce((n, v) => n + v.body.length, 0) / 1024);
        console.log(`${result.variants.length} files, ${kb} KB`);
        const { variants: _variants, ...rest } = result;
        core = rest;
      }

      collectionPhotos.push({
        id,
        collection,
        path: keyBase,
        ...core,
        formats: Object.keys(PIPELINE.formats),
        alt: info.alt ?? "",
        ...(info.title && { title: info.title }),
        ...(info.caption && { caption: info.caption }),
        ...(info.tags?.length && { tags: info.tags }),
        ...(info.featured && { featured: true }),
        ...(info.order !== undefined && { order: info.order }),
        ...(info.location && { location: info.location }),
        ...(info.takenAt && { exif: { ...core.exif, takenAt: info.takenAt } }),
      });
    }

    if (!collectionPhotos.length) continue;

    // Within a collection: explicit `order` first, then oldest → newest, then by id.
    collectionPhotos.sort(
      (a, b) =>
        (a.order ?? Infinity) - (b.order ?? Infinity) ||
        (a.exif?.takenAt ?? "").localeCompare(b.exif?.takenAt ?? "") ||
        a.id.localeCompare(b.id),
    );

    const dates = collectionPhotos.map((p) => p.exif?.takenAt).filter(Boolean).sort();
    const coverId = cMeta.cover && `${collection}-${slugify(cMeta.cover)}`;
    const cover = collectionPhotos.find((p) => p.id === coverId) ?? collectionPhotos[0];
    if (cMeta.cover && cover.id !== coverId) warnings.push(`${collection}: cover "${cMeta.cover}" not found, using ${cover.id}`);

    collections.push({
      id: collection,
      title: cMeta.title || dirName,
      ...(cMeta.description && { description: cMeta.description }),
      ...(cMeta.order !== undefined && { order: cMeta.order }),
      // Shown as "(year)". Set in photos.json; falls back to the newest capture date.
      ...((cMeta.year || dates.length) && { year: Number(cMeta.year || dates.at(-1).slice(0, 4)) }),
      cover: cover.id,
      count: collectionPhotos.length,
      ...(dates.length && { startDate: dates[0], endDate: dates.at(-1) }),
    });
    photos.push(...collectionPhotos);
  }

  // Collections: explicit `order` first, then most recent first.
  collections.sort(
    (a, b) =>
      (a.order ?? Infinity) - (b.order ?? Infinity) ||
      (b.endDate ?? "").localeCompare(a.endDate ?? "") ||
      a.id.localeCompare(b.id),
  );
  const rank = new Map(collections.map((c, i) => [c.id, i]));
  photos.sort((a, b) => rank.get(a.collection) - rank.get(b.collection)); // stable: keeps in-collection order

  const removed = previous.photos.filter((p) => !photos.some((n) => n.id === p.id)).map((p) => p.id);

  if (!DRY_RUN) {
    await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
    await writeFile(
      MANIFEST_PATH,
      JSON.stringify({ version: PIPELINE.version, collections, photos }, null, 2) + "\n",
    );
    await mkdir(path.dirname(META_PATH), { recursive: true });
    const sortedMeta = Object.fromEntries(Object.entries(meta).sort(([a], [b]) => a.localeCompare(b)));
    await writeFile(META_PATH, JSON.stringify(sortedMeta, null, 2) + "\n");
  }

  if (PRUNE) {
    // Object keys look like photos/<collection>/<slug>-<hash>/<width>.<format>
    const live = new Set(photos.map((p) => p.path));
    const orphans = (await storage.list(`${KEY_PREFIX}/`)).filter(
      (key) => !live.has(key.split("/").slice(0, 3).join("/")),
    );
    if (orphans.length && !DRY_RUN) await storage.remove(orphans);
    console.log(`Pruned ${orphans.length} orphaned object(s)${DRY_RUN ? " (dry run, nothing deleted)" : ""}.`);
  }

  console.log(
    `\n${collections.length} collection(s) · ${photos.length} photo(s) · ${encoded} encoded · ${uploaded} object(s) uploaded` +
      (removed.length ? ` · removed from manifest: ${removed.join(", ")}` : ""),
  );
  for (const w of warnings) console.warn(`  ! ${w}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
