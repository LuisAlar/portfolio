import { profile } from "../content/profile";
import insta from "../assets/insta.svg";

const instagramUrl = profile.links.instagram ?? "https://www.instagram.com/luz.altar/";

// Placeholder until the Photography section is built.
export const PhotographyPage = () => (
  <div className="min-h-full flex flex-col items-center justify-center p-10 text-center">
    <h1 className="text-4xl font-bold text-sage">Photography</h1>

    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className="mt-6 transition-transform duration-300 hover:-translate-y-1 hover:opacity-80"
    >
      <img src={insta} alt="" className="w-10 h-10 object-contain" />
    </a>
  </div>
);
