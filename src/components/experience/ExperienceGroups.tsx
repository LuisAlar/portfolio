import { useState } from "react";
import { Link } from "react-router-dom";
import type { Experience } from "../../content/types";

export interface ExperienceGroup {
  id: string;
  label: string;
  items: Experience[];
}

interface ExperienceGroupsProps {
  groups: ExperienceGroup[];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Thin plus; the vertical stroke collapses when `open` so it reads as a minus */
const PlusIcon = ({ open = false }: { open?: boolean }) => (
  <span aria-hidden className="relative block w-5 h-5 md:w-6 md:h-6 shrink-0">
    <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-current" />
    <span
      className={`absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-current transition-transform duration-300 ${
        open ? "scale-y-0" : ""
      }`}
    />
  </span>
);

// Each group heading carries a straight ember rule on its left and expands into a numbered table.
export const ExperienceGroups = ({ groups }: ExperienceGroupsProps) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="font-afacad text-sage">
      <ul className="space-y-8">
        {groups.map((group) => {
          const isOpen = openIds.has(group.id);
          const panelId = `group-panel-${group.id}`;
          // Newest first ("YYYY-MM" strings sort lexically)
          const items = [...group.items].sort((a, b) => b.startDate.localeCompare(a.startDate));

          return (
            <li key={group.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(group.id)}
                className="group w-full flex items-center justify-between gap-6 border-l-4 border-ember pl-6 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/40"
              >
                <span className="text-4xl md:text-[56px] leading-[1.1] tracking-tight transition-colors group-hover:text-ember">
                  {group.label}
                  <sup className="ml-2 text-sm md:text-base tracking-normal text-sage/50">{pad(items.length)}</sup>
                </span>
                <span className="transition-colors group-hover:text-ember">
                  <PlusIcon open={isOpen} />
                </span>
              </button>

              {/* Collapsible table: grid-rows 0fr -> 1fr animates to the content's natural height */}
              <div
                id={panelId}
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <ol className="ml-7 mt-4 border-b border-sage/25">
                    {items.map((exp, i) => (
                      <li
                        key={exp.id}
                        style={{ transitionDelay: isOpen ? `${100 + i * 60}ms` : "0ms" }}
                        className={`border-t border-sage/25 transition-[opacity,transform] duration-500 ease-out ${
                          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        }`}
                      >
                        <Link
                          to={`/experiences/${exp.id}`}
                          tabIndex={isOpen ? undefined : -1}
                          className="group grid grid-cols-[2.5rem_1fr] md:grid-cols-[1fr_2fr_4fr] items-baseline gap-x-4 gap-y-1 py-4 md:py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/40"
                        >
                          <span className="text-xl md:text-2xl tabular-nums">{pad(i + 1)}</span>
                          <span className="text-xl md:text-2xl leading-tight transition-colors group-hover:text-ember">
                            {exp.organization}
                          </span>
                          <span className="col-start-2 md:col-start-auto text-base md:text-xl leading-tight text-sage/70">
                            {exp.roleTitle}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
