# SharePoint List Schema — Sales Weekly Workflow System

## Context: What We've Built So Far

The current pipeline works like this:

```
Sales rep fills out Word doc (from Content Control template)
        ↓
Emails it to Sales Ops mailbox
        ↓
Flow 1 (Intake): Saves .docx to SharePoint Processing Queue
        ↓
Flow 2 (Extraction): Extracts XML → parses SDT sections (Wins, Opportunities, etc.)
        → Splits "Customer: UpdateText" bullets
        → Appends rows to SalesOps_Staging
        ↓
Flow 3 (Report Generation): Reads SalesOps_Staging → generates Word doc → emails stakeholders
```

---

## Lists to Create / Rebuild

| # | List Name | Status | Purpose |
|---|---|---|---|
| 1 | `SalesOps_Staging` | 🔁 Rebuild | Stores all extracted update rows |
| 2 | `Team_Roster` | ✅ Create new | Maps reps → managers → teams for routing |
| 3 | `Accounts` | ✅ Create new | Canonical account/customer name source |
| 4 | `Template_Registry` | ✅ Create new | Maps doc type → template file path |
| 5 | `Document_Generation_Log` | ✅ Create new | Audit trail for every generated document |
| 6 | `Submission_Log` | ✅ Create new | Audit trail for every submission event |

---

## 1. `SalesOps_Staging` (Rebuild)

> **Why rebuild instead of modify?** Your current list has `UpdateText` as Single line of text (255 char limit). Power Automate caches the old schema — changing a column type does not reliably refresh in flow connections. Creating a fresh list with the correct types from the start avoids all sync issues.

### Columns

| Column Name | SharePoint Type | Max Length / Options | Why This Type |
|---|---|---|---|
| `Title` | Single line of text | 255 | Auto-populated — used as row label in SharePoint UI |
| `Section` | Single line of text | 255 | The content control section (e.g. "Wins/Losses", "Opportunities") |
| `Customer` | Single line of text | 255 | Customer name extracted from left of `:` |
| `UpdateText` | **Multiple lines of text** | 63,999 | Update detail — exceeds 255 chars regularly. Must be multi-line. |
| `Region` | Single line of text | 255 | Reserved for old-format docs with region headings. Leave blank for new format. |
| `ReportDate` | Date and Time | — | The date the extraction ran (`utcNow('yyyy-MM-dd')`) |
| `SubmittedBy` | Single line of text | 255 | Sender email from the intake flow trigger |
| `TeamName` | Single line of text | 255 | Team name looked up from Team_Roster |
| `ManagerEmail` | Single line of text | 255 | Manager email looked up from Team_Roster |
| `Amount` | Currency | — | Dollar amount if parsed (null if not in the update) |
| `Status` | Choice | `Queued`, `Processing`, `Complete`, `Error` | Tracks processing state |
| `SourceFile` | Single line of text | 255 | Original .docx filename |

> [!IMPORTANT]
> `UpdateText` MUST be **Multiple lines of text** — set **Plain text**, **not Enhanced rich text**. Rich text adds HTML tags that will break your flow outputs.

> [!NOTE]
> `Region` stays as a column even though the new format doesn't use it. The old-format branch of your flow still writes to it. Leave it blank for new-format rows.

---

## 2. `Team_Roster`

> **Purpose:** The routing brain for the report generation flow. When a manager digest or weekly report needs to be sent, the flow looks here to find who gets it and what team they manage.

### Columns

| Column Name | SharePoint Type | Options | Why |
|---|---|---|---|
| `Title` | Single line of text | 255 | Full name of the person (e.g. `Bill Miller`) |
| `RepEmail` | Single line of text | 255 | Their M365 email — used as lookup key by flows |
| `Role` | Choice | `Rep`, `Manager`, `SalesOps`, `Executive` | Determines routing behavior |
| `ManagerEmail` | Single line of text | 255 | Their direct manager's email (blank if they are top-level) |
| `ManagerName` | Single line of text | 255 | Manager display name |
| `TeamName` | Single line of text | 255 | Team label (e.g. `Americas 1Finity Sales`) |
| `AccountCoverage` | Multiple lines of text | — | Comma-separated accounts this person covers (e.g. `AT&T, Verizon`) |
| `IsActive` | Yes/No | — | Set to No to disable without deleting |

> [!NOTE]
> `AccountCoverage` is stored as plain text here because one rep can cover multiple accounts. The flow uses `contains()` to check if a specific account is in their coverage. If you need stricter lookups later, this can become a multi-value lookup column.

---

## 3. `Accounts`

> **Purpose:** Single source of truth for account/customer names. Prevents free-text drift where "AT&T", "ATT", and "at&t" are treated as different accounts.

### Columns

| Column Name | SharePoint Type | Example | Why |
|---|---|---|---|
| `Title` (AccountName) | Single line of text | `AT&T` | The canonical display name used everywhere |
| `AccountCode` | Single line of text | `ATT` | Short code for file naming and filtering |
| `Segment` | Choice | `Tier 1 Carrier`, `Regional Carrier`, `Named Service Provider`, `International` | Groups accounts for filtering reports |
| `IsActive` | Yes/No | Yes | Allows retiring accounts without deleting history |

> [!TIP]
> Start with your current accounts: `AT&T`, `Verizon`, `Canada`, `NSP/Verticals`, `FiberLight`, `Brightspeed`, `Lumen`, `Fidium`. Add as you go.

---

## 4. `Template_Registry`

> **Purpose:** Maps each document type to its Word template file path in SharePoint. Flows look here to find which `.docx` template to use — no hardcoded paths in Power Automate.

### Columns

| Column Name | SharePoint Type | Example | Why |
|---|---|---|---|
| `Title` | Single line of text | `Manager Weekly Digest` | Human-readable template name |
| `DocumentType` | Choice | `Manager Digest`, `Executive Summary`, `Rep Receipt`, `Ops Report` | The key the flow passes in to find the right template |
| `TemplatePath` | Single line of text | `/Shared Documents/Templates/ManagerDigest_Template.docx` | Full SharePoint-relative path to the .docx file |
| `TemplateVersion` | Number | `1` | Increment when you update the template |
| `Description` | Multiple lines of text | — | Notes on what this template is for |
| `IsActive` | Yes/No | Yes | Allows swapping templates by deactivating old one |

---

## 5. `Document_Generation_Log`

> **Purpose:** Every time the report generation flow runs and produces a Word doc, it writes one row here. Gives you a full history of what was sent, when, and to whom.

### Columns

| Column Name | SharePoint Type | Options / Notes | Why |
|---|---|---|---|
| `Title` | Single line of text | Auto: `DocType - Stakeholder - Date` | Row label |
| `DocumentType` | Choice | Same options as Template_Registry | What kind of doc was generated |
| `SentTo` | Single line of text | Email address | Who received it |
| `StakeholderName` | Single line of text | Display name | Readable version of SentTo |
| `GeneratedOn` | Date and Time | `utcNow()` | When the flow ran |
| `ReportWeekDate` | Date and Time | The Monday of the report week | The period this doc covers |
| `FilePath` | Single line of text | SharePoint path of the saved file | Where the file lives |
| `Status` | Choice | `Success`, `Failed` | Did the generation + send succeed? |
| `ErrorDetails` | Multiple lines of text | — | Error message if Status = Failed |

> [!NOTE]
> This is the list that tells you "did Bill's manager digest actually go out this week?" You can build a simple SharePoint view filtered by `Status = Failed` to see any broken deliveries at a glance.

---

## 6. `Submission_Log`

> **Purpose:** Every time a sales rep submits a Word doc (via email), one row is created here. This is the audit trail for the intake pipeline — separate from the staging list rows it creates.

### Columns

| Column Name | SharePoint Type | Options / Notes | Why |
|---|---|---|---|
| `Title` | Single line of text | Auto: `SenderName - FileName - Date` | Row label |
| `SenderEmail` | Single line of text | — | Who sent the document |
| `SenderName` | Single line of text | — | Display name |
| `FileName` | Single line of text | — | Original .docx filename |
| `TeamName` | Single line of text | — | Resolved from Team_Roster at submission time |
| `ManagerEmail` | Single line of text | — | Resolved from Team_Roster at submission time |
| `SubmittedOn` | Date and Time | `utcNow()` | When the email arrived |
| `ReportDate` | Date and Time | — | The week being reported (if parseable) |
| `StagingRowsCreated` | Number | Count of rows written to SalesOps_Staging | How many update items were extracted |
| `Status` | Choice | `Received`, `Extracted`, `Failed` | Where the submission ended up |
| `ErrorDetails` | Multiple lines of text | — | Error detail if Status = Failed |
| `SourceFilePath` | Single line of text | SharePoint path of saved .docx | Where the original file was saved |

---

## Creation Order (Dependencies First)

```
1. Accounts               ← no dependencies
2. Team_Roster            ← no dependencies  
3. Template_Registry      ← no dependencies
4. SalesOps_Staging       ← no dependencies (rebuilt fresh)
5. Document_Generation_Log ← references DocumentType (same choices as Template_Registry)
6. Submission_Log         ← references SalesOps_Staging conceptually
```

---

## SharePoint Column Type Quick Reference

| When your data is... | Use this SharePoint type |
|---|---|
| Short text, always < 255 chars | Single line of text |
| Long text, notes, update details | **Multiple lines of text → Plain text** |
| True/False flags | Yes/No |
| A fixed set of options | Choice (add all options upfront) |
| A date with no time needed | Date and Time (set to Date Only) |
| A dollar value | Currency |
| A count or score | Number |
| Points to a row in another list | Lookup |

> [!CAUTION]
> Always create **Multiple lines of text** columns as **Plain text**, never Enhanced rich text. Rich text stores HTML which flows cannot easily parse or compare.

---

## What to Tell Power Automate After Rebuilding

After creating the new `SalesOps_Staging` list:
1. Open each flow that uses the old `SalesOps_Staging` list.
2. Click on any **Get items**, **Create item**, or **Update item** action that points to that list.
3. Change the **List Name** dropdown to point to your new list.
4. **Re-map all column fields** in those actions (Power Automate will show the new columns).
5. Save and test.

> [!IMPORTANT]
> Do NOT just rename the old list. Rename does not refresh the column schema that Power Automate cached. Always point to a fresh list by re-selecting it in the dropdown.
