// Flattened from yourOwn's Prisma models: Experience + one chosen ExperienceVariant.

export type ExperienceType = "WORK" | "AUTOMATION" | "PROJECT" | "ORGANIZATION" | "EVENT" | "VOLUNTEER";

export interface Experience {
  /** URL slug, used at /experiences/:id */
  id: string;
  type: ExperienceType;
  title: string;
  organization: string;
  roleTitle: string;
  /** "YYYY-MM" */
  startDate: string;
  /** "YYYY-MM"; omit when isCurrent */
  endDate?: string;
  isCurrent: boolean;
  summaryShort: string;
  summaryLong: string;
  problemStatement?: string;
  solutionDetails?: string;
  impactBullets: string[];
  techStack: string[];
  /** Imported image URL; shown left of the row on the home page and beside the title on the detail page */
  logo?: string;
  links?: { label: string; url: string }[];
  /** Live, try-it-now link; shown as a button under the detail page header */
  demo?: { label: string; url: string };
  /** Line under roleTitle on the detail page */
  subtitle?: string;
  heroImage?: { src: string; alt: string };
  /** Narrative sections; when set, the detail page shows the story layout with tools up top */
  story?: { heading?: string; paragraphs: string[] }[];
  /** Click-to-expand sections shown after the story */
  expandables?: {
    heading: string;
    summary?: string;
    items: { title: string; body: string }[];
    tags?: string[];
  }[];
}

export type SocialKey = "github" | "linkedin" | "instagram" | "email";

export interface Profile {
  displayName: string;
  headline: string;
  tagline: string;
  location: string;
  bioShort: string;
  bioLong: string;
  philosophy: string;
  avatar: string;
  skills: string[];
  currentlyLearning: string[];
  interests: string[];
  links: Partial<Record<SocialKey, string>>;
}

/** One photograph, as written to photos.generated.json by scripts/photos/sync.mjs. */
export type PhotoFormat = "avif" | "webp";

export interface Photo {
  /** `<collection>-<file slug>`; stable across re-edits */
  id: string;
  /** Collection id (folder name under photos/originals/) */
  collection: string;
  /** Object-key prefix: `photos/<collection>/<slug>-<hash>`. Variants live at `<path>/<width>.<format>` */
  path: string;
  /** Intrinsic size after EXIF rotation, used for aspect ratio / layout before load */
  width: number;
  height: number;
  /** Encoded widths, ascending; the last one is the largest available */
  widths: number[];
  formats: PhotoFormat[];
  /** ~24px blurred WebP data URI, shown while the real image loads */
  placeholder: string;
  /** Dominant color, a cheaper placeholder background */
  color: string;
  alt: string;
  title?: string;
  caption?: string;
  tags?: string[];
  featured?: boolean;
  order?: number;
  location?: string;
  exif?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutter?: string;
    iso?: number;
    /** Camera-local wall time, "YYYY-MM-DDTHH:mm:ss" (EXIF has no time zone) */
    takenAt?: string;
  };
}

/** A folder of photos under photos/originals/, e.g. "eternal". */
export interface PhotoCollection {
  id: string;
  title: string;
  description?: string;
  order?: number;
  /** Shown as "(year)" next to the title */
  year?: number;
  /** Photo id used as the cover */
  cover: string;
  count: number;
  /** Earliest / latest capture time in the collection */
  startDate?: string;
  endDate?: string;
}
