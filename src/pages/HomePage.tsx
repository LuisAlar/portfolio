import { profile } from "../content/profile";
import { experiences } from "../content/experiences";
import type { ExperienceType } from "../content/types";
import { ExperienceGroups, type ExperienceGroup } from "../components/experience/ExperienceGroups";

const GROUPS: { type: ExperienceType; label: string }[] = [
  { type: "WORK", label: "Work" },
  { type: "AUTOMATION", label: "Automations" },
  { type: "PROJECT", label: "Projects" },
];

const groups: ExperienceGroup[] = GROUPS.map(({ type, label }) => ({
  id: type.toLowerCase(),
  label,
  items: experiences.filter((e) => e.type === type),
}));

// Hero across the top, then the work groupings, with About/Skills underneath.
export const HomePage = () => (
  <div className="max-w-6xl mx-auto px-4 md:px-12 py-12 lg:py-20 font-afacad text-sage">
    <header className="mb-16">
      <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none">{profile.displayName}</h1>
      <p className="text-2xl md:text-3xl font-light mt-6 max-w-3xl">{profile.tagline}</p>
    </header>

    <section aria-label="Work groupings">
      <ExperienceGroups groups={groups} />
    </section>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-sage/60 mb-4">About</h2>
        <p className="text-lg leading-relaxed">{profile.bioShort}</p>
      </div>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-sage/60 mb-4">Skills</h2>
        <ul className="flex flex-wrap gap-2">
          {profile.skills.map((s) => (
            <li key={s} className="px-3 py-1 text-sm border border-sage-light rounded-full">{s}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
