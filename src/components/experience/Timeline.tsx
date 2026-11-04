import { Link } from "react-router-dom";
import type { Experience } from "../../content/types";
import { formatRange } from "./formatDate";

interface TimelineProps {
  experiences: Experience[];
}

export const Timeline = ({ experiences }: TimelineProps) => {
  if (experiences.length === 0) {
    return (
      <div className="p-8 text-center text-sage/50 font-afacad">
        <p>No experiences to show.</p>
      </div>
    );
  }

  // Newest first ("YYYY-MM" strings sort lexically)
  const sorted = [...experiences].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    // Compact scroll window; the mask fades entries out at the top and bottom edges
    <div className="timeline-scroll relative w-full max-w-xl h-[22rem] overflow-y-auto overflow-x-hidden overscroll-contain snap-y snap-proximity font-afacad text-sage">
      <div className="relative py-[7.5rem]">
        {/* Continuous vertical track */}
        <div aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-ember" />

        <ol className="space-y-10">
          {sorted.map((exp) => (
            <li key={exp.id} className="timeline-entry snap-center">
              <Link
                to={`/experiences/${exp.id}`}
                className="timeline-shift group block pl-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/40"
              >
                <div className="flex items-center gap-4 pr-4">
                  <div className="flex-1 min-w-0">
                    {/* Date (left) and role (right) */}
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-0.5">
                      <span className="text-xs leading-none tracking-wide -ml-1">{formatRange(exp)}</span>
                      <span className="text-sm leading-none sm:text-right">{exp.roleTitle} with</span>
                    </div>

                    <h3 className="relative mt-1.5 text-2xl sm:text-[32px] leading-[1.1] tracking-tight transition-colors group-hover:text-ember">
                      {/* Tick crossing the track; stretches to follow the entry as it slides */}
                      <span
                        aria-hidden
                        className="timeline-tick absolute top-[0.55em] -left-[22px] h-[2px] bg-ember"
                      />
                      {exp.organization}
                    </h3>
                  </div>

                  {exp.logo ? (
                    <img
                      src={exp.logo}
                      alt={`${exp.organization} logo`}
                      className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-[#d9d9d9] flex items-center justify-center">
                      <span className="text-[10px] text-black">LOGO</span>
                    </div>
                  )}
                </div>

                <p className="mt-2 sm:ml-auto sm:max-w-[26rem] text-sm sm:text-base leading-snug sm:text-right text-sage/90">
                  {exp.summaryShort}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
