import avatar from "../assets/avatar.jpg";
import type { Profile } from "./types";

// TODO(content): replace placeholders marked below with real values.
export const profile: Profile = {
  displayName: "Luis Alarcón",
  headline: "Platform & Operations Engineer",
  tagline: "Building the systems teams rely on, and keeping them from breaking.",
  location: "Remote / Planet Earth", // TODO(content): placeholder
  bioShort:
    "I help teams across very different domains replace manual work and fragile tools with systems that hold up, from sales operations to a live radio station.",
  // Paragraphs are separated by a blank line ("\n\n").
  bioLong:
    "I do my best work where a team meets the systems it depends on. Sales operations at Fujitsu, a live student radio station, a magazine's publishing workflow, a mentorship platform's dev environment: different domains, the same kind of problem. People are losing hours to a manual process, or to a tool that keeps breaking, and I help build the thing that makes that go away.\n\n" +
    "Sometimes that opportunity is handed to me. Often I have to find it. At 1Finity I was brought on to automate one weekly report, and before long other teams were bringing me their own workflows. At Indigo Magazine and Radio UTD, the work started with noticing where people were stuck and making the case for fixing it.\n\n" +
    "That's also what pulls me toward platform and infrastructure work. The systems I'm proudest of are the ones people stop thinking about: environments that build the same way every time, pipelines that run without babysitting, a station that stays on air. I care about stabilizing what's already there and making sure the things people rely on don't break.",
  philosophy:
    "The best infrastructure is the kind nobody has to think about. If people can do their jobs without worrying about the systems underneath, the work is done.",
  avatar,
  skills: ["TypeScript", "React", "Prisma", "PostgreSQL", "Node.js", "Zod"],
  currentlyLearning: ["AWS Lightsail", "Docker Automation", "Advanced Splay Trees"], // TODO(content): review
  interests: ["Platform Engineering", "Infrastructure & Reliability", "Operations Automation", "System Design"],
  links: {
    github: "https://github.com/luisAlar",
    linkedin: "https://linkedin.com/in/luis-alarcon",
    instagram: "https://instagram.com/", // TODO(content): add your Instagram handle
    // email: "", // TODO(content): DB had placeholder luis@example.com
  },
};
