# 1Finity internship: writeup draft

Working draft for the `fujitsu-1finity` detail page. **This is now live:** the current copy is in `src/content/experiences.ts` (story, the "Bigger picture" section, and the Consulted section were added there). Edit there first. This file keeps the planning and open questions, and `1finity-notes.md` holds the raw background.

---

## Page layout (top to bottom)

1. **Title:** Enterprise AI Workflow Automation (or something new, see open questions)
2. **Subtitle:** Worked with the Global Sales Operations team
3. **One-liner:** Assisted in implementing automations for the weekly Sales & Marketing reports
4. **Hero image:** the "Global Sales Operations: Automating Sales & Marketing Weekly Reports" slide (time consuming / scattered data / static data, plus the blank weekly summary template)
5. **Tools row:** Power Automate · Copilot Studio · SharePoint Lists · Power Apps
   Keep it simple, Devpost style: small labeled chips. Not a big visual feature.
6. **The story:** a few paragraphs (draft below)
7. **Before / after diagrams** (optional, maybe later): the organizational workflow before vs. after
8. **Where it ended:** time saved, but mainly a foundation that keeps evolving
9. **Consulted** (expandable): a clickable heading that opens inline, not as a pop-up. The story gives the main idea, and this is for anyone who wants to see the other work. Inside: a short summary plus the two side consultations (Salesforce, Power BI). Room for a reference or image later.

---

## Draft copy

### Subtitle
Worked with the Global Sales Operations team

### One-liner
Assisted in implementing automations for the weekly Sales & Marketing reports.

### The story

Every week, the Sales & Marketing summary came together by hand. Updates on wins, losses, new opportunities, and customer concerns lived in notes and email chains spread across regions and accounts. Someone had to collect all of it, format it into a document, and send it out. Once it went out, the information was static. It sat in an inbox and couldn't be searched or built on.

I worked with the sales team to build an ingestion platform that turns those unorganized notes into queryable information. The core of the project was taking the data that arrived as a document through an email chain and transforming it into something structured.

My call was not to reach for an AI solution first. I wanted to parse and break that information down into a database first, one that an agent could easily access. In this case that agent was a Copilot agent. Once each weekly report lands in that database, the pipeline becomes malleable and progressive. Every week adds to it, and anything built on top of it gets better as the data grows.

### Before vs. after
*(Diagrams go here if included. The text around them should stress the organizational change, not just the technical one.)*

- **Before:** notes scattered across email threads → manually compiled into a document → sent out → static, not searchable
- **After:** updates collected through a structured intake → stored as records in SharePoint Lists → the report is generated from that data → a Copilot agent can query the full history

### Where it ended

The immediate win was saving time and eliminating tedious work. The weekly report went from hours of manual compiling to being generated from the data. *(Keep the "3 hours → seconds" number? It's on the resume.)*

The bigger result was a foundational pipeline. I kept the database separate from the interface on purpose, so the system never had to care how a note got entered. While I was there, I built several input interfaces for different teams to enter their own notes. Each team had its own idea of how it wanted to work, and some went their own way with it. All of those approaches worked, because every one of them landed in the same place: one SharePoint list.

The data evolved too. As more notes were added, the Copilot agent had more to work from, and its answers became more accurate. Because it was built in-house, the pipeline stayed flexible enough to keep growing past the original report.

### Consulted (expandable)

**Heading:** Consulted

**Inside:**
I also consulted other teams and outside organizations on their automation tools. That meant figuring out where automation would actually help them and which tools fit their existing workflows.

- **Salesforce consultation:** *(what was the problem, and what did you recommend or build?)*
- **Power BI consultation:** *(same)*

*(Space for a reference or image later.)*

---

## Your phrasing to keep

Lines from your notes that carry the voice. Hold on to these when editing:

- "give unorganized notes queryable information"
- "rather than implement an AI solution first, I'd rather parse and deconstruct that information into a database"
- "easily available to be accessed by an agent"
- "malleable, progressive infrastructure pipeline"
- "save time and eliminate tedious work, but ultimately … a foundational pipeline"
- "made in-house … flexible for it to continue to evolve, which is what happened"
- "the database was separate from the interface"
- "they went and did their own separate ways, and all of them worked … because ultimately they were landing in my database"
- "once more notes started to be added, the agent was more intelligent … more accurate"

The arc to keep: **where it came from → what I thought about it → why I chose this approach → how it ended and kept going.**

---

## Open questions

- **Title:** keep "Enterprise AI Workflow Automation", or reframe around the reports / data pipeline? The story is now more about data foundations than AI.
- **Interfaces:** were the team input interfaces built in Power Apps? If so, the story can name it ("several Power Apps front ends").
- **Document auditing:** which tools, and what did you build vs. recommend? (The current copy is general.)
- **Reflection line:** add a short honest note that the pitch to sales didn't fully land before the internship ended? (See notes.)
- **Leadership discovery sessions:** fold them into "Consulted", or leave them out?
- **Placement:** put "Consulted" after the story (current plan), or in the middle of it?
- **Diagrams:** include now, or add them later?

**Settled:** Salesforce and Power BI move out of the main tools row and into "Consulted". The main tools are Power Automate, Copilot Studio, SharePoint Lists, Power Apps. "Evolving" means two things: the separate interfaces all landing in one list, and the agent getting more accurate as data built up.
- **Image placement:** hero at the top, or right after the one-liner as described above?

## Implementation notes (for later)

- Save the slide image to `src/assets/` (for example `1finity-weekly-reports.webp`).
- `Experience` will need new optional fields: `subtitle`, `heroImage`, and something like `story: string[]` (paragraphs), plus optional before/after images and `expandables: { heading, body, items?, image? }[]` for "Consulted". Render with a native `<details>`/`<summary>` so it expands inline. `ExperienceDetail.tsx` renders them when they exist and falls back to Problem / Solution / Impact for the other experiences.
