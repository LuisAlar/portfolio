import type { Profile, SocialKey } from "../../content/types";
import github from "../../assets/github.svg";
import insta from "../../assets/insta.svg";
import linkedin from "../../assets/linkedin.svg";

// No email icon yet — email links are skipped until one is added.
const ICONS: Partial<Record<SocialKey, string>> = { github, linkedin, instagram: insta };

interface SocialLinksProps {
  links: Profile["links"];
  className?: string;
}

export const SocialLinks = ({ links, className }: SocialLinksProps) => (
  <div className={`w-full py-8 flex flex-row items-center justify-center gap-6 ${className ?? ""}`}>
    {(Object.entries(links) as [SocialKey, string | undefined][]).map(([key, url]) => {
      const icon = ICONS[key];
      if (!url || !icon) return null;

      return (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:-translate-y-1 hover:opacity-80"
          aria-label={key}
        >
          <img src={icon} alt="" className="w-8 h-8 object-contain" />
        </a>
      );
    })}
  </div>
);
