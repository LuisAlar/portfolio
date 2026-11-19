import type { Experience } from "./types";
import weeklyReportsSlide from "../assets/1finity-weekly-reports.webp";
import radioUtdLogo from "../assets/radionewlogo.png";
import oneFinityLogo from "../assets/1finitylogo.jpg";
import orbitalLogo from "../assets/orbitalLogo.jpg";
import xtensibleLogo from "../assets/Xtensible_logo.png";
import indigoLogo from "../assets/indigologoblack.png";
import luzifer808 from "../assets/luzifer-808.svg";

// Migrated from the yourOwn Postgres DB (session a2b428b1…), one variant per experience.
// Alternate variants not used: Indigo "Product Focus", Orbital "Leadership Focus" — see docs/CONTEXT.md.
// Fujitsu, Radio UTD, Orbital, Xtensible, Indigo and both 2026 projects refreshed from the Oct 2026 resume.
export const experiences: Experience[] = [
  {
    id: "radio-utd",
    type: "WORK",
    title: "Now-Playing API Caching",
    organization: "Radio UTD",
    logo: radioUtdLogo,
    roleTitle: "Systems Administrator",
    startDate: "2026-08",
    isCurrent: true,
    summaryShort: "Fixed the now-playing API after its traffic got the station's site paused.",
    // Story drafted from docs/radioUtdDocs (change log + Hobby readiness plan).
    subtitle: "Keeping the station's live show data online",
    summaryLong:
      "Radio UTD's website shows what's on air right now: the show, who's hosting it, and each song as it plays. In November that feed used up our hosting plan's limit and the site was paused. I found out why, fixed it, and set up tracking so we can tell when it's safe to go back to the free plan.",
    impactBullets: [
      "Capped the current-show response at the 20 most recent songs, taking it from a playlist that grew past 10 KB during a show to under 1 KB.",
      "Added CDN caching to the three public endpoints so listeners share one cached response instead of each one running the function.",
      "Built a usage report on Vercel's billing API that compares our numbers to the free plan's limits, with a written rule for when to downgrade.",
    ],
    techStack: ["Vercel", "Node.js", "MongoDB", "CDN Caching", "JavaScript"],
    story: [
      {
        paragraphs: [
          "Every song the station plays is logged to a small API on Vercel that stores it in MongoDB. The tuner page on our website asks that API what's playing: the current show, the DJ, and the songs so far. Every open tab asked every 15 to 30 seconds, including tabs left in the background, and none of the answers were cached.",
        ],
      },
      {
        heading: "What broke",
        paragraphs: [
          "In late October our usage jumped from almost nothing to as much as 2 GB a day. On November 3 the project went over the free Hobby plan's 10 GB limit for Fast Origin Transfer, the data our functions send back, and Vercel paused the site. We moved to the Pro plan to get back on air.",
          "The dashboard showed two problems. Function runs almost matched requests, so about 99% of requests ran the code and hit the database. And the current-show endpoint sent back every song since the show started, so each response kept growing over a 3 to 4 hour show. At the October rate we were using about 280% of the limit.",
        ],
      },
      {
        heading: "The fix",
        paragraphs: [
          "On the server, I added cache headers to the three public endpoints so Vercel's CDN serves one copy to everyone for 15 to 60 seconds. Only successful responses are cached, so an error never gets stuck. I also capped the current-show response at the 20 most recent songs, so its size stays the same no matter how long the show runs. After the change it measured 937 bytes.",
          "On the tuner page, polling stops while the tab is hidden, and I took out the action-link poll, which was about a quarter of all requests. I also fixed a bug where a failed request called a function that didn't exist.",
        ],
      },
      {
        heading: "A trade-off I chose",
        paragraphs: [
          "The API could already send only the songs after a given time. I chose not to use that. A CDN caches one response per exact URL, so if every listener sent their own timestamp, none of them would share a cached copy and every poll would reach the function again. The 20-song cap solved the growing-response problem while keeping one shared URL. The cost is that now-playing can lag a song change by up to about 45 seconds, which is fine for a radio show.",
        ],
      },
      {
        heading: "Proving it holds",
        paragraphs: [
          "I didn't want to downgrade on a guess. I wrote a Node script that pulls daily usage from Vercel's billing API and compares it to each Hobby limit, with before-and-after rates around the fix. We agreed on the rule ahead of time: go back to Hobby once a full 30 days after the fix stays under 70% of every limit, because going over pauses the site and there's no option to pay extra.",
          "Transfer should drop to about 13% of the limit. The one I'm watching is Active CPU, which was the next limit we would have hit. If it stays high, the next step is longer cache times, which needs no change to the tuner.",
        ],
      },
    ],
    expandables: [
      {
        heading: "Also at the station",
        items: [
          {
            title: "Broadcast and catalog systems",
            body: "I administer the station's broadcast infrastructure and DJ music cataloging platforms that daily live shows depend on.",
          },
          {
            title: "Track submission automation",
            body: "I built file ingestion and sync workflows with Power Automate and Box so DJ track submissions no longer depend on manual file handling.",
          },
          {
            title: "Catalog migration",
            body: "I'm leading discovery and migration planning to move the station off its legacy Snowflake catalog system.",
          },
          {
            title: "Security follow-ups",
            body: "While fixing the API I flagged two risks: an environment file with database credentials committed to the repo's history, and endpoints that take passwords as URL parameters, which end up in the logs.",
          },
        ],
        tags: ["Power Automate", "Box API", "Snowflake"],
      },
    ],
  },
  {
    id: "fujitsu-1finity",
    type: "WORK",
    title: "Enterprise AI Workflow Automation",
    organization: "Fujitsu | 1Finity",
    logo: oneFinityLogo,
    roleTitle: "AI Workflow Automation Intern",
    startDate: "2026-06",
    endDate: "2026-08",
    isCurrent: false,
    summaryShort: "Turned a 3-hour weekly sales report into a seconds-long automated pipeline.",
    // Story layout drafted in docs/1finity-writeup.md; background in docs/1finity-notes.md.
    subtitle: "Worked with the Global Sales Operations team",
    summaryLong: "Assisted in implementing automations for the weekly Sales & Marketing reports.",
    heroImage: {
      src: weeklyReportsSlide,
      alt: "Slide titled Global Sales Operations: Automating Sales & Marketing Weekly Reports, listing time consuming, scattered data and static data beside the blank weekly summary template.",
    },
    impactBullets: [],
    techStack: ["Power Automate", "Copilot Studio", "SharePoint Lists", "Power Apps"],
    story: [
      {
        paragraphs: [
          "Every week, the Sales & Marketing summary was put together by hand. Updates on wins, losses, new opportunities, and customer concerns came in as notes and email chains from every region and account. Someone had to collect it all, format it into a document, and send it out. Once it was sent, the information was static. It sat in an inbox where no one could search it or build on it.",
          "I worked with the sales team to build an ingestion platform that turns those unorganized notes into queryable information. The main job was to take the data arriving as a document through an email chain and transform it into something structured.",
        ],
      },
      {
        heading: "Data first, AI second",
        paragraphs: [
          "I chose not to start with an AI solution. I parsed and broke the information down into a database that an agent could easily access, in this case a Copilot agent. Once each weekly report lands in that database, the pipeline becomes malleable and progressive. Every week adds to it, and anything built on top of it gets better as the data grows.",
        ],
      },
      {
        heading: "How it evolved",
        paragraphs: [
          "I kept the database separate from the interface on purpose, so the system never had to care how a note got entered. While I was there, I built several input interfaces for different teams to enter their own notes. Each team had its own idea of how it wanted to work, and some went their own way. All of those approaches worked, because every one of them landed in the same SharePoint list.",
          "The data evolved too. As more notes were added, the Copilot agent had more to work from and its answers got more accurate. Compiling the weekly report went from hours of manual work to seconds. More importantly, it left behind a foundational pipeline, built in-house and flexible enough to keep growing.",
        ],
      },
      {
        heading: "The bigger picture",
        paragraphs: [
          "Companies are moving into an agentic layer of work, and that brings a lot of data with it. Most of that data is tied up in legacy systems like SAP and Salesforce. Those systems are too risky to change at the core, and migrating off them can take years. What I learned here is that you don't have to wait. You can build the idea a company wants at a micro level: small, separate data silos in SharePoint lists, connected through tools like Power Automate, that agents can work with right away.",
          "That was my pitch to the sales team. Write your notes however and wherever you want, and the system organizes them into a database that's actually worth something to you, because you can ask it questions about your own work. On top of that sits a management layer where, with each person's permission, the same data feeds the broader analysis the company wanted in the first place.",
        ],
      },
    ],
    expandables: [
      {
        heading: "Consulted",
        summary: "Beyond the weekly reports, other teams came to me for help with their own automation tools.",
        items: [
          {
            title: "Document auditing: Knowledge Creation team",
            body: "The team's manager asked me to help improve and implement their document auditing system, a tool that checks documents against the policies in their manuals and catches errors before they slip through.",
          },
          {
            title: "Win/loss analytics",
            body: "A finance lead was asked to explain why the company was winning and losing opportunities, and came to me for guidance. I put together a plan that tied into my main project: pull that data into its own SharePoint list, separate from Salesforce, where it could feed analysis in Power BI and more agentic workflows.",
          },
        ],
        tags: ["Salesforce", "Power BI"],
      },
    ],
  },
  {
    id: "obsidian-expense-tracker",
    type: "AUTOMATION",
    title: "Obsidian Automated Expense Tracker",
    organization: "Obsidian Expense Tracker",
    roleTitle: "Creator",
    startDate: "2026-01", // TODO(content): resume only says 2026, confirm month
    isCurrent: true,
    summaryShort: "Email receipts flow straight into my notes as a live weekly budget.",
    summaryLong:
      "A personal finance pipeline that turns incoming email receipts into structured data in my Obsidian vault. Power Automate parses each receipt into JSON, and a custom dashboard widget renders weekly budget summaries and spending analytics right inside my daily notes.",
    problemStatement: "Tracking spending meant manually copying receipt totals into notes or a separate budgeting app.",
    solutionDetails:
      "I built an event-driven ingestion pipeline in Power Automate that parses receipts into a JSON schema synced to a local vault, plus an Obsidian widget that renders the results.",
    impactBullets: [
      "Engineered an event-driven receipt ingestion pipeline using Power Automate to parse incoming email receipts into structured JSON schemas synced to a local vault.",
      "Built a custom Obsidian dashboard widget to render dynamic weekly budget summaries and real-time spending analytics within daily operational notes.",
    ],
    techStack: ["Power Automate", "Obsidian", "JavaScript", "JSON"],
  },
  {
    id: "syllabus-automator",
    type: "AUTOMATION",
    title: "AI Syllabus Task & Schedule Automator",
    organization: "Syllabus Automator",
    roleTitle: "Creator",
    startDate: "2026-01", // TODO(content): resume only says 2026, confirm month
    isCurrent: true,
    summaryShort: "Gemini reads my syllabi so every deadline lands in my calendar automatically.",
    summaryLong:
      "A Google Workspace tool that uses the Gemini API to read unstructured course syllabi and extract assignments, deadlines, and exams into Google Sheets. An Apps Script workflow then pushes everything into Google Calendar and Google Tasks with reminders.",
    problemStatement: "Every semester meant hand-copying dozens of deadlines from inconsistently formatted syllabi.",
    solutionDetails:
      "I used the Gemini API to parse syllabi into structured JSON, then wrote an Apps Script workflow that batch-syncs deliverables to Calendar and Tasks.",
    impactBullets: [
      "Leveraged the Google Gemini API to parse unstructured course syllabi into structured assignment, deadline, and examination JSON schemas within Google Sheets.",
      "Developed a Google Apps Script workflow to batch-generate and synchronize deliverables directly into Google Calendar and Google Tasks with automated reminders.",
    ],
    techStack: ["Gemini API", "Google Apps Script", "Google Workspace APIs"],
  },
  {
    id: "luzifer",
    type: "PROJECT",
    title: "Luzifer: Guitar → Strudel",
    organization: "Luzifer",
    logo: luzifer808,
    roleTitle: "Creator",
    subtitle: "Play a beat on guitar, get a Strudel pattern back.",
    startDate: "2026-10",
    isCurrent: true,
    // TODO(Luis): placeholder copy; write the full story later.
    summaryShort: "Turns guitar takes of an 808, snare and hi-hat into a live-coded Strudel beat.",
    summaryLong:
      "Record each layer of a beat on guitar (bass notes for the 808, muted-string scratches for the snare and hi-hat) and Luzifer transcribes them onto a tempo grid and writes the Strudel code to play them back.",
    demo: { label: "Try the live demo", url: "https://luzaltar-luzifer.hf.space" },
    links: [{ label: "Hugging Face Space", url: "https://huggingface.co/spaces/LuzAltar/Luzifer" }],
    impactBullets: [],
    techStack: ["Python", "Basic Pitch", "librosa", "ONNX Runtime", "Gradio", "Strudel"],
  },
  {
    id: "yourown",
    type: "PROJECT",
    title: "YourOwn",
    organization: "YourOwn",
    roleTitle: "Team Lead & System Architect",
    startDate: "2025-01",
    isCurrent: true,
    summaryShort: "Architected the migration to an enterprise-grade, feature-based system.",
    summaryLong:
      "As the System Architect for a full-stack platform, I drove the complex migration from a monolithic file structure to a highly modular, feature-based architecture. I focused on robust data consistency and advanced server-side caching to guarantee maximum uptime for data-intensive portfolios.",
    problemStatement:
      "The existing monolithic codebase was becoming difficult to maintain, and heavy data loads were causing synchronization and performance issues.",
    solutionDetails:
      "I mapped out and executed a modular architectural overhaul, implementing sophisticated state synchronization and caching pipelines across the stack.",
    impactBullets: [
      "Spearheaded a massive migration to an enterprise feature-based architecture, significantly improving system maintainability.",
      "Engineered advanced server-side caching and state synchronization pipelines, optimizing load times for heavy data loads.",
      "Guided architectural decisions across front-end and back-end integration, successfully guaranteeing 100% data consistency for dynamic UIs.",
    ],
    techStack: ["TypeScript", "React", "Node.js", "System Architecture", "Caching"],
  },
  {
    id: "orbital",
    type: "WORK",
    title: "Orbital Mentorship Platform",
    organization: "Orbital Mentorship",
    logo: orbitalLogo,
    roleTitle: "DevOps Lead",
    startDate: "2024-11",
    endDate: "2026-06",
    isCurrent: false,
    summaryShort: "Engineered a Docker-based onboarding system and observability tooling that cut page requests by 90%.",
    summaryLong:
      "As DevOps Lead, I standardized how the team deployed and onboarded by moving to a Docker-based setup driven by automation scripts. I also built in-house API observability tooling to find network bottlenecks, and architected a backend data management system for fast CRUD on large operational datasets.",
    problemStatement:
      "Developers faced inconsistent environments and dependency errors during setup, and pages were firing excessive network requests that slowed the platform down.",
    solutionDetails:
      "I built a Docker-based deployment and onboarding flow with automation scripts, plus an API monitoring tool for continuous performance tracking, and optimized backend querying.",
    impactBullets: [
      "Engineered a Docker-based deployment and onboarding solution using automation scripts, standardizing environments and reducing configuration time by 50% while eliminating dependency errors.",
      "Built an in-house API observability and monitoring tool to identify network bottlenecks, enabling continuous performance tracking and reducing per-page network requests from 20 to 1-2.",
      "Architected a scalable backend data management system, optimizing querying and enabling high-performance CRUD operations for large operational datasets.",
    ],
    techStack: ["Docker", "Python", "Bash", "CI/CD", "Linux"],
  },
  {
    id: "xtensible",
    type: "WORK",
    title: "Cloud Infrastructure Automation",
    organization: "Xtensible Solutions",
    logo: xtensibleLogo,
    roleTitle: "Solutions Engineer Intern",
    startDate: "2024-04",
    endDate: "2024-08",
    isCurrent: false,
    summaryShort: "Developed automation scripts and testing workflows for cloud deployments.",
    summaryLong:
      "During my internship, I focused on automating cloud instance management and quality assurance processes. I built Python-based tools to handle cloud instances, snapshots, and GitHub integration, and integrated automated API tests to catch regressions before deployment.",
    problemStatement:
      "Manual cloud deployments and localized testing processes were creating bottlenecks and increasing the risk of defects in production.",
    solutionDetails:
      "I engineered Python automation for cloud instance creation and GitHub integration, alongside automated functional and regression API testing workflows.",
    impactBullets: [
      "Developed Python automation scripts to manage cloud instance creation, snapshot retrieval, and automated GitHub integration, significantly reducing manual deployment overhead.",
      "Integrated automated API testing workflows for functional and regression testing, ensuring high reliability and stability of web services before production deployment.",
      "Accelerated QA feedback loops and continuous integration processes by systematically identifying and reporting system defects to engineering leadership.",
    ],
    techStack: ["Python", "AWS", "GitHub", "Postman", "API Testing"],
  },
  {
    id: "indigo-magazine",
    type: "WORK",
    title: "Indigo Magazine Collective",
    organization: "Indigo Magazine",
    logo: indigoLogo,
    roleTitle: "Web Development Lead & Creative Director",
    startDate: "2023-12",
    isCurrent: true,
    summaryShort: "Built the publishing platform and AI agent harness that let a student team ship on their own.",
    summaryLong:
      "I lead the technical side of the magazine's web presence. I moved our media onto an automated Box-to-Cloudflare CDN pipeline, built an end-to-end publishing platform so editors can publish without a developer, and set up an agentic development harness so non-technical contributors can ship features with AI coding agents without compromising the magazine's design and editorial voice.",
    problemStatement:
      "Media assets bloated the static codebase, every content update needed a developer, and student contributors without engineering backgrounds had no safe way to build features.",
    solutionDetails:
      "I automated media delivery through a Cloudflare CDN, built an internal publishing and submission platform for editorial staff, and created an agent harness with custom skills and guardrails backed by team AI governance.",
    impactBullets: [
      "Architected an automated media pipeline fetching assets from Box and deploying to a Cloudflare CDN, cutting static codebase bloat and accelerating asset delivery speeds.",
      "Engineered an internal end-to-end publishing and article submission platform, replacing manual developer updates and empowering non-technical editorial staff to publish independently.",
      "Built an agentic development harness equipped with custom skills and guardrails, enabling non-technical student contributors across 10+ web projects to ship features using AI coding agents safely.",
      "Established team AI governance and developer workflows, balancing agent-assisted development velocity with strict design standards to protect authentic artistic and editorial styling.",
    ],
    techStack: ["React", "Node.js", "Cloudflare CDN", "Box API", "AI Agents"],
  },
  {
    id: "shpe",
    // Stored as WORK in the DB; ORGANIZATION fits a student org better.
    type: "ORGANIZATION",
    title: "Corporate Liaison Initiatives",
    organization: "Society of Hispanic Professional Engineers",
    roleTitle: "Corporate Liaison",
    startDate: "2023-10",
    endDate: "2024-04",
    isCurrent: false,
    summaryShort: "Secured corporate funding and coordinated professional networking events.",
    summaryLong:
      "In my role as Corporate Liaison, I bridged the gap between student members and industry professionals. I actively pitched to corporate partners to secure funding and planned professional development events that resulted in tangible career opportunities for students.",
    impactBullets: [
      "Secured $300 in initial corporate partnership funding to directly support student-led engineering initiatives.",
      "Orchestrated and hosted targeted professional engagement events, significantly expanding member access to networking.",
    ],
    techStack: ["Public Speaking", "Event Coordination", "Partnership Building"],
  },
];

export const getExperience = (id: string) => experiences.find((e) => e.id === id);
