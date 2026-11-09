# Stakeholder Pitch: The Integrated Weekly Updates Hub

This document is a high-level guide you can use to build a quick slide deck or guide your conversation with stakeholders when introducing the new **Weekly Updates Hub**.

---

## Slide 1: The "Before vs. After" (The Problem & Solution)

### Visual Layout:
```
  [ THE OLD WAY ]                           [ THE NEW WAY ]
  Co-Authoring Word Doc                     The Weekly Updates Hub
  ─────────────────────                     ──────────────────────
  ❌ Fragile: formatting breaks easily      ✅ Bullet-proof: structured entries
  ❌ Duplicate data: typing CRM data again  ✅ Integrated: Pulls directly from Salesforce
  ❌ Zero tracking: no draft states         ✅ Controlled: Clear Draft -> Submit workflow
  ❌ High friction: hard to write bullets   ✅ Low friction: Carry forward last week's data
```

### Key Talking Points:
*   We want to make the weekly updates process **painless** for the sales team while ensuring the data is **100% secure** and accurate for management.
*   The old Word document co-authoring model causes database corruption, is easily broken by manual edits, and creates "ghost" edits.
*   This new system automates the tedious parts (retrieving opportunity names and amounts) so users can focus on writing high-quality context.

---

## Slide 2: High-Level Architecture (The 3-Step Pipeline)

### Visual Layout:
```
  1. SYNC & STAGE                  2. CHERRY-PICK & POLISH           3. COMBINE & GENERATE
  ┌──────────────────────┐         ┌──────────────────────┐         ┌──────────────────────┐
  │  Power Automate      │  ───>   │  Power App Canvas    │  ───>   │  Master database     │
  │  Pulls active deals  │         │  User reviews, edits │         │  combines all and    │
  │  from Salesforce     │         │  & checks the box    │         │  produces final PDF  │
  └──────────────────────┘         └──────────────────────┘         └──────────────────────┘
```

### Key Talking Points:
*   **Automatic Fetching**: The system automatically pulls active Salesforce deals for the user based on their login. No copy-pasting required.
*   **Human Control (Staging)**: We don't just dump all Salesforce data into the report. The user has a **"Staging Area"** (Sandbox) where they check the box next to the updates they want to highlight, and can polish the text or add private tracking notes.
*   **Clean Output**: Once approved, the selected items are sent to the master list and compiled into the final report automatically.

---

## Slide 3: Key Benefits for the Team

### Visual Layout:
```
  🚀 80% Time Saved       🔒 Data Integrity        📊 Added Value for Reps
  ──────────────────       ─────────────────        ───────────────────────
  Your pipeline is         Management gets a        You get a private history
  fetched for you.         clean, locked PDF        tab and personal notes
  Just review and submit.  report. No broken        to track your deals 
                           formatting or typos.     week-over-week.
```

### Key Talking Points:
*   **No Double Work**: We incentivize reps to keep Salesforce updated, because the cleaner their Salesforce data, the faster they can submit their weekly updates (just a few clicks!).
*   **Audit Trail & Stability**: SharePoint version history tracks who made what edit at every stage of approval, keeping the process secure.
*   **Private Sandbox**: The private notes field is a safe space for reps to track follow-up tasks without management seeing them.
