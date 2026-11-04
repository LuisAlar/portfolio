import { profile } from "../content/profile";

const TagList = ({ title, items }: { title: string; items: string[] }) => (
  <section>
    <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-sage/60 mb-4">{title}</h2>
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="px-3 py-1 text-sm border border-sage-light rounded-full">{item}</li>
      ))}
    </ul>
  </section>
);

export const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-4 md:px-12 py-12 lg:py-20 font-afacad text-sage">
    <h1 className="text-5xl md:text-6xl tracking-tight mb-10">About</h1>
    <div className="space-y-6 mb-12">
      {profile.bioLong.split("\n\n").map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="text-xl md:text-2xl font-light leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>

    <blockquote className="border-l-4 border-ember pl-6 text-2xl md:text-3xl font-light italic mb-16">
      {profile.philosophy}
    </blockquote>

    <div className="grid md:grid-cols-3 gap-10">
      <TagList title="Skills" items={profile.skills} />
      <TagList title="Learning" items={profile.currentlyLearning} />
      <TagList title="Interests" items={profile.interests} />
    </div>
  </div>
);
