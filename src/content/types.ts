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
  /** Imported image URL; Timeline shows a placeholder square when missing */
  logo?: string;
  links?: { label: string; url: string }[];
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
