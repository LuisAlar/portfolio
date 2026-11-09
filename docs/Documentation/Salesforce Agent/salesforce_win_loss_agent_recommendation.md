# Salesforce Win/Loss Analysis Agent
## Consulting Recommendation — Building an AI-Assisted Pipeline

---

## Executive Summary

The goal is to give executives and the team a **more robust, data-driven way to understand why opportunities are being won or lost**. Today, this analysis is manual, fragmented, and difficult to surface at scale. The recommendation below outlines a phased approach to building an intelligent pipeline that connects Salesforce data to AI-powered analysis — using tools the organization already has access to within the Microsoft ecosystem.

This document lays out the **three foundational pillars** that must be in place before any AI agent can function effectively, the current state of progress, and an honest assessment of where the LLM integration layer stands today.

---

## The Problem

- Leadership needs clearer visibility into **win/loss patterns** across the opportunity pipeline.
- Current reporting doesn't surface the *why* — only the *what*.
- The team wants to leverage AI and automation but needs a structured foundation before that's possible.
- There is appetite and willingness to experiment with AI tools, which creates a window of opportunity to build this the right way from the ground up.

---

## The Three Pillars

Any AI-assisted analysis capability is only as good as the infrastructure underneath it. Before an agent can analyze wins and losses, **three foundational layers must be established**:

```
┌─────────────────────────────────────────────────────┐
│          PILLAR 3: AI & LANGUAGE MODEL LAYER        │
│     Copilot Studio · Prompt Engineering · Agent     │
├─────────────────────────────────────────────────────┤
│        PILLAR 2: AUTOMATION & ORCHESTRATION         │
│   Power Automate Flows · SharePoint Lists · Logic   │
├─────────────────────────────────────────────────────┤
│            PILLAR 1: DATA FOUNDATION                │
│    Salesforce → Power BI Semantic Model · Queries   │
└─────────────────────────────────────────────────────┘
```

Each pillar depends on the one below it. **You cannot skip to AI without the data and automation layers being solid first.**

---

### Pillar 1 — Data Foundation

**Objective:** Establish a reliable, queryable source of Salesforce opportunity data.

| Component | Detail |
|---|---|
| **Source** | Salesforce CRM (Opportunities, Accounts, Win/Loss fields) |
| **Destination** | Power BI Semantic Model |
| **Current State** | A Power BI semantic model of Salesforce data already exists. It is not fully robust, but it provides a working baseline to build on. |
| **Why Power BI?** | Power BI allows data to be queried, filtered, and structured in ways that Salesforce's native reporting does not easily support. It acts as the **knowledge base** that any downstream automation or AI will rely on. |

**Key Point:** The semantic model is the *single source of truth* for the agent. If the data here is incomplete, inconsistent, or missing key fields (e.g., loss reasons, competitor info, deal stage history), the AI layer above it will inherit those gaps. Strengthening this model over time is a continuous investment.

> **Recommendation:** Audit the existing semantic model for completeness of win/loss-relevant fields. Identify what's missing and what enrichments are needed. This model is the knowledge base — its quality directly determines the quality of any AI-driven insights.

---

### Pillar 2 — Automation & Orchestration

**Objective:** Build the connective tissue that moves data between systems, structures it, and makes it available for analysis.

| Component | Role |
|---|---|
| **Power Automate Flows** | Automate the retrieval and movement of data from the Power BI semantic model into structured formats. Handle scheduling, triggers, and data transformation. |
| **SharePoint Lists** | Serve as structured, accessible data stores that can hold processed opportunity data, logs, and metadata. They act as the organized workspace that both humans and automation can interact with. |
| **Microsoft Suite Integration** | Leverage the broader M365 ecosystem (Teams, Outlook, Excel) for notifications, distribution, and collaboration around the analysis outputs. |

**Current State:** A working Power Automate flow prototype already exists that can interact with the Power BI semantic model. This validates that the connection between Pillar 1 and Pillar 2 is technically feasible and functional.

> **Recommendation:** The existing flow serves as a proof of concept. The next step is to formalize it — define what data it pulls, how often, what structure it stores it in (SharePoint list schema), and what triggers downstream processes. This is the plumbing that everything else runs through.

---

### Pillar 3 — AI & Language Model Layer

**Objective:** Use a large language model (LLM) to analyze win/loss data and surface actionable insights that would be difficult or time-consuming to identify manually.

This is the layer where the most **exploration and learning** is still needed. Below is an honest assessment of where things stand and the key considerations.

#### What the LLM Would Do

- Receive structured opportunity data (from Pillar 2) as context
- Analyze patterns across wins and losses
- Generate narrative summaries and identify trends (e.g., *"Deals involving Competitor X in the Southeast region have a 70% loss rate when the sales cycle exceeds 90 days"*)
- Answer natural language questions about the pipeline (e.g., *"What are the top 3 reasons we lost deals last quarter?"*)

#### How It Would Get There — The Knowledge Base is Key

Before an LLM can generate useful insights, it needs to be **grounded in the right data**. This is not about training a model — it's about:

1. **Structuring the knowledge base** — The data from Pillars 1 and 2 must be clean, well-organized, and contextually rich enough for the LLM to reason over.
2. **Providing the right context window** — The LLM needs to receive the relevant data at the time of the query. This means the automation layer (Pillar 2) must feed it the right information.
3. **Defining the instructions** — The LLM's behavior is shaped by its prompt and instructions. This is where you define *what* it should analyze, *how* it should reason, and *what format* the output should take.

#### Current Tooling: Copilot Studio

| Aspect | Assessment |
|---|---|
| **What it offers** | A low-code way to build agents that can be connected to data sources, given instructions, and deployed to users within the Microsoft ecosystem (Teams, web, etc.) |
| **Harness layer** | Copilot Studio provides a basic orchestration/harness layer — it can manage conversation flow, call actions (Power Automate flows), and apply some guardrails to LLM behavior |
| **Limitations** | The harness layer is **not as robust** as what purpose-built agent frameworks offer. Fine-grained control over reasoning steps, multi-step analysis chains, and complex tool-use patterns may be limited |
| **Current reality** | The primary method of shaping agent behavior is through **prompting and instructions**. This is effective for many use cases but requires careful prompt engineering to get reliable, consistent outputs |

#### What Needs to Be Explored Further

- **How to best feed structured data into the LLM context** — batch summaries vs. row-level detail vs. pre-aggregated metrics
- **Prompt engineering for analysis** — crafting instructions that guide the LLM to perform win/loss pattern recognition rather than simple Q&A
- **Output format and distribution** — how the analysis gets delivered (Teams message, report, dashboard card, email digest)
- **Evaluation and trust** — how to validate that the LLM's insights are accurate and useful before putting them in front of executives
- **Copilot Studio's evolving capabilities** — Microsoft is actively developing this platform; capabilities may expand

> **Recommendation:** Start with a controlled experiment. Use the existing Power Automate flow to pull a defined set of win/loss data, feed it into a Copilot Studio agent with well-crafted instructions, and evaluate the quality of the output. This builds institutional knowledge about what works and what doesn't — without over-committing.

---

## Implementation Roadmap

```
PHASE 1                    PHASE 2                      PHASE 3
Data Foundation            Automation Pipeline           AI Integration
─────────────────          ──────────────────────        ─────────────────────
                                                        
• Audit & strengthen       • Formalize Power Automate   • Design prompt &
  Power BI semantic          flows for data retrieval     instruction set
  model                                                   
                           • Define SharePoint list     • Build Copilot Studio
• Identify key fields        schemas for structured       agent prototype
  for win/loss analysis      data storage                 
                                                        • Test with controlled
• Validate data quality    • Build scheduling &           data set
  & completeness             trigger logic                
                                                        • Evaluate output
• Establish baseline       • Connect to M365 for          quality & accuracy
  queryable dataset          notifications & delivery     
                                                        • Iterate on knowledge
       ✓ IN PROGRESS              ✓ PROTOTYPE EXISTS      base & instructions
                                                        
                                                             ○ EXPLORATION PHASE
```

> **Note:** Phases are sequential but overlapping. Pillar 1 work (data quality) is ongoing and never truly "done" — it improves as the team learns what the AI layer needs.

---

## Key Takeaways for the Team

1. **AI is the top of the stack, not the starting point.** The data foundation and automation plumbing must be solid before an agent can deliver reliable insights.

2. **We already have building blocks in place.** The Power BI semantic model exists. A Power Automate flow prototype exists. We are not starting from zero.

3. **The LLM integration is an exploration phase.** We know the direction, we have the tools (Copilot Studio), and we understand the general approach (knowledge base + instructions). But this layer requires experimentation to get right.

4. **Prompt engineering is the current control mechanism.** Until more robust agent frameworks are available within the Microsoft ecosystem, the quality of the AI output will depend heavily on how well we structure the instructions and the data we feed in.

5. **Start small, validate, then scale.** A controlled proof-of-concept with a defined dataset will teach us more than any amount of planning.

---

## Next Steps

| # | Action | Owner |
|---|---|---|
| 1 | Review and validate the Power BI semantic model for win/loss field completeness | Luis - AI Automation Intern |
| 2 | Formalize the Power Automate flow and define the data retrieval schema | Luis - AI Automation Intern |
| 3 | Define the SharePoint list structure for staging processed opportunity data | PDG Team |
| 4 | Draft initial prompt/instruction set for win/loss analysis agent | TDB |
| 5 | Build a Copilot Studio proof-of-concept with a controlled data set |TDB |
| 6 | Evaluate POC output quality and iterate | Full Team |

---

*Document prepared as a consulting recommendation for the Salesforce Win/Loss Analysis initiative.*
