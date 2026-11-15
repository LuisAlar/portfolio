import { Link, useParams } from "react-router-dom";
import { getExperience } from "../content/experiences";
import { ExperienceDetail } from "../components/experience/ExperienceDetail";

export const ExperienceDetailPage = () => {
  const { id = "" } = useParams();
  const experience = getExperience(id);

  return (
    <div className="min-h-full bg-paper">
      <div className="max-w-4xl mx-auto px-4 md:px-12 py-12 font-afacad text-sage">
        <Link to="/" aria-label="Back to home" className="inline-block mb-10 text-4xl leading-none text-sage/70 hover:text-ember transition-colors">
          ←
        </Link>
        {experience ? <ExperienceDetail experience={experience} /> : <p className="text-2xl">Experience not found.</p>}
      </div>
    </div>
  );
};
