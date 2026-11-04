import { useSearchParams } from "react-router-dom";
import { experiences } from "../content/experiences";
import type { ExperienceType } from "../content/types";
import { Timeline } from "../components/experience/Timeline";

const FILTERS: { label: string; value: ExperienceType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Work", value: "WORK" },
  { label: "Automations", value: "AUTOMATION" },
  { label: "Projects", value: "PROJECT" },
  { label: "Organizations", value: "ORGANIZATION" },
];

export const ExperiencesPage = () => {
  // Filter lives in the URL (?type=WORK) so it survives refresh and can be linked.
  const [params, setParams] = useSearchParams();
  const active = (params.get("type") ?? "ALL") as ExperienceType | "ALL";
  const visible = active === "ALL" ? experiences : experiences.filter((e) => e.type === active);

  return (
    <div className="min-h-full bg-paper">
      <div className="max-w-5xl mx-auto px-4 md:px-12 pt-12 font-afacad text-sage">
        <h1 className="text-5xl md:text-6xl tracking-tight">Experiences</h1>
        <div className="flex flex-wrap gap-3 mt-6" role="group" aria-label="Filter experiences">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setParams(f.value === "ALL" ? {} : { type: f.value })}
              aria-pressed={active === f.value}
              className={`px-4 py-1.5 rounded-full border text-sm uppercase tracking-widest transition-colors ${
                active === f.value ? "bg-sage text-paper border-sage" : "border-sage-light hover:border-sage"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-8 pb-12">
          <Timeline experiences={visible} />
        </div>
      </div>
    </div>
  );
};
