# 1Finity internship: background notes

Raw context from conversations, kept so the writeup can be revisited without losing the reasoning. The polished copy lives in `1finity-writeup.md` and `src/content/experiences.ts`. These notes leave out people's names because the repo may be public.

## Main project: weekly Sales & Marketing report
- The report came in as a document through an email chain. It was time consuming to put together, the data was scattered, and the result was static.
- Built an ingestion platform that turns unorganized notes into queryable information.
- Chose to put the data in a database before building any AI. The info is parsed into a SharePoint list, which a Copilot Studio agent reads from.
- **Kept the interface separate from the database.** I built multiple input interfaces for different teams. Teams wanted to work in different ways, and some went off and did their own thing. All of it worked, because everything landed in the same SharePoint list.
- **The data evolved too.** As more notes were added, the agent got more accurate.
- Result: saved time and cut tedious work (3 hrs → seconds, per resume). More importantly, it was a foundational pipeline built in-house, so it could keep evolving.

## Consultation 1: Knowledge Creation team, document auditing
- The team's manager reached out for help with an auditing project.
- Their auditing work means checking documents against the policies in their manuals. The tool is meant to catch errors in any document.
- Short version: the manager reached out for help improving and implementing their document auditing system.
- Open: which tools were used, and what I specifically built or recommended.

## Consultation 2: win/loss analytics (finance-side lead)
- A lead on the finance side ("the money guy") was asked to get insights and analytics on why the company wins and loses opportunities, and asked me for guidance.
- I gave him a plan and tied it into my main project: move the data into its own SharePoint list.
- Why: that list is disconnected from Salesforce and other services. As an external database, it supports more agile, agentic workflows and broader use of AI.
- Tools involved: Salesforce, Power BI.

## The bigger thesis (what I learned)
- Companies are entering an "AI war," moving to an agentic layer of working. That creates a lot of data, and it all needs to be managed.
- The core legacy systems (SAP, Salesforce) are tightly coupled, sometimes across tenants, and too risky to touch. This company had been migrating for years.
- My approach: build the separate entity at a micro level. Use individual SharePoint lists as small data silos, connected and automated through harness-like tools such as Power Automate.
- Implementing that at small scale was the real lesson of the internship.
- **The pitch to sales:** put your notes anywhere, as scattered as you like, and the system organizes them into a database worth having, because you can ask it questions based on your own work. A management layer sits on top, so with each person's permission the data can be used for further analysis, which is what the company wanted in the first place. That connects the two sides.
- **Honest note:** I fell a bit short of fully selling that product to the sales team before the internship ended. (Could go on the site as a reflection. Not used yet.)
