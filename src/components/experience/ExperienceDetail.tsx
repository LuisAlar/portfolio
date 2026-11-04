import type { Experience } from "../../content/types";
import { formatRange } from "./formatDate";

const TechChips = ({ techStack, className = "" }: { techStack: string[]; className?: string }) => (
  <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Skills and tools">
    {techStack.map((tech) => (
      <li key={tech} className="px-3 py-1 text-sm tracking-wider uppercase border border-sage-light rounded-full">
        {tech}
      </li>
    ))}
  </ul>
);

// Structure from yourOwn's ExperienceCard + NarrativeCard, restyled for the cream/sage theme.
export const ExperienceDetail = ({ experience: exp }: { experience: Experience }) => (
  <article className="font-afacad text-sage">
    <header className="border-b-4 border-ember pb-8 mb-10">
      <span className="text-sm md:text-base tracking-[0.3em] uppercase text-ember">
        {exp.type} — {formatRange(exp)}
      </span>
      <h1 className="text-5xl md:text-7xl leading-none tracking-tight mt-4">{exp.organization}</h1>
      <p className="text-2xl md:text-3xl font-light mt-3">{exp.roleTitle}</p>
      {exp.subtitle && <p className="text-lg md:text-xl text-sage/70 mt-2">{exp.subtitle}</p>}
    </header>

    <p className="text-xl md:text-2xl leading-relaxed font-light max-w-3xl mb-12">{exp.summaryLong}</p>

    {exp.heroImage && (
      <img src={exp.heroImage.src} alt={exp.heroImage.alt} className="w-full rounded-lg border border-sage-light/50 mb-8" />
    )}

    {exp.story && exp.techStack.length > 0 && <TechChips techStack={exp.techStack} className="mb-12" />}

    {exp.story?.map((section, i) => (
      <section key={section.heading ?? i} className="max-w-3xl mb-10 space-y-5">
        {section.heading && <h2 className="text-2xl md:text-3xl tracking-tight">{section.heading}</h2>}
        {section.paragraphs.map((p) => (
          <p key={p} className="text-lg leading-relaxed">
            {p}
          </p>
        ))}
      </section>
    ))}

    {exp.expandables?.map((group) => (
      <details key={group.heading} className="group max-w-3xl mb-12 border-y border-sage-light/50 py-5">
        <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <h2 className="text-2xl md:text-3xl tracking-tight">{group.heading}</h2>
          <span aria-hidden className="text-3xl text-ember transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="pt-5 space-y-6">
          {group.summary && <p className="text-lg leading-relaxed">{group.summary}</p>}
          {group.items.map((item) => (
            <div key={item.title} className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-sage/60">{item.title}</h3>
              <p className="text-lg leading-relaxed">{item.body}</p>
            </div>
          ))}
          {group.tags && <TechChips techStack={group.tags} />}
        </div>
      </details>
    ))}

    {(exp.problemStatement || exp.solutionDetails) && (
      <div className="grid md:grid-cols-2 gap-8 py-8 mb-12 border-y border-sage-light/50">
        {exp.problemStatement && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-sage/60">Problem</h2>
            <p className="text-lg leading-relaxed">{exp.problemStatement}</p>
          </section>
        )}
        {exp.solutionDetails && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-sage/60">Solution</h2>
            <p className="text-lg leading-relaxed">{exp.solutionDetails}</p>
          </section>
        )}
      </div>
    )}

    {exp.impactBullets.length > 0 && (
      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-sage/60 mb-5">Impact</h2>
        <ul className="space-y-4">
          {exp.impactBullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-4 text-lg leading-relaxed">
              <span className="mt-3 h-1.5 w-1.5 rounded-full bg-ember shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
      </section>
    )}

    {!exp.story && exp.techStack.length > 0 && <TechChips techStack={exp.techStack} />}

    {exp.links && exp.links.length > 0 && (
      <div className="flex flex-wrap gap-6 mt-10">
        {exp.links.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="underline decoration-ember underline-offset-4 hover:text-ember">
            {link.label} →
          </a>
        ))}
      </div>
    )}
  </article>
);
