# Schema Design: One List or Two?

Applying normalization rules (1NF → 3NF) and functional dependency analysis to your actual data to make this decision properly.

---

## Quick Refresher: Normal Forms & Functional Dependencies

**Functional Dependency (FD):** If knowing the value of column A always tells you the value of column B, then B is *functionally dependent* on A. Written as `A → B`.

| Normal Form | Rule | In Plain English |
|:---|:---|:---|
| **1NF** | Every column holds atomic (single) values. No repeating groups. | No arrays or comma-separated lists in a cell. Each row is unique. |
| **2NF** | 1NF + no **partial dependencies**. Every non-key column depends on the *entire* primary key, not just part of it. | Only matters if your key is composite (multi-column). If your PK is a single column (like `ID`), you're automatically in 2NF. |
| **3NF** | 2NF + no **transitive dependencies**. No non-key column depends on another non-key column. | If `A → B` and `B → C`, then C shouldn't be in the same table — it should live in a lookup table keyed by B. |

---

## Your Data: What Are the Functional Dependencies?

Let's look at the attributes you're storing for both Wins/Losses and Opportunity Updates:

### Attributes in Play

| Attribute | Wins/Losses | Opp Updates | Same? |
|:---|:---|:---|:---|
| Region | ✅ | ✅ | ✅ |
| CustomerName | ✅ | ✅ | ✅ |
| UpdateText | ✅ | ✅ | ✅ |
| Amount | ✅ | ✅ | ✅ |
| ReportDate | ✅ | ✅ | ✅ |
| Source (SF / Manual) | ✅ | ✅ | ✅ |
| SF_OpportunityId | ✅ | ✅ | ✅ |
| Status (Draft / Submitted / etc.) | ✅ | ✅ | ✅ |
| IncludeInReport | ✅ | ✅ | ✅ |
| SubmittedBy | ✅ | ✅ | ✅ |
| Stage (Closed Won, Open, etc.) | ✅ | ✅ | ✅ |

**The two sections share the exact same attribute set.** There is no column that exists for Wins/Losses but not for Opp Updates, or vice versa.

### FD Analysis (Primary Key = `ID`)

```
ID → Region, Section, CustomerName, UpdateText, Amount, ReportDate,
     Source, SF_OpportunityId, Status, IncludeInReport, SubmittedBy, Stage
```

Since `ID` is a single-column primary key:
- **1NF** ✅ — All values are atomic (no arrays, no comma lists)
- **2NF** ✅ — Automatic, because the PK is a single column (no partial dependencies possible)
- **3NF** — Let's check for transitive dependencies...

### Checking for Transitive Dependencies (3NF Violations)

A transitive dependency means: `ID → A → B` (a non-key column determines another non-key column).

| Possible FD | Is it real? | Problem? |
|:---|:---|:---|
| `SF_OpportunityId → CustomerName, Amount, Stage, Region` | **Yes** — for Salesforce-sourced rows, the Opp ID determines these fields | This IS a transitive dependency: `ID → SF_OpportunityId → CustomerName` |
| `Region → ???` | No — Region doesn't determine anything else on its own | Not a problem |
| `Section → ???` | No — knowing "Wins/Losses" doesn't tell you the customer or amount | Not a problem |
| `SubmittedBy → Region` | **Maybe** — if each person is always assigned to one region | Mild transitive dependency, but handled by your `UserRegionConfig` table |

> [!NOTE]
> **The one real transitive dependency** is `SF_OpportunityId → {CustomerName, Amount, Stage, Region}`. In a traditional relational database, this means you'd break out a separate `Opportunities` reference table keyed by `SF_OpportunityId`, and your main table would just store the foreign key.
>
> **But in SharePoint, this doesn't matter.** SharePoint lists don't support joins. If you normalize into two lists, every time the app loads you'd need to manually "join" them in Power Apps using `LookUp()` or in a flow — which is slower and more complex than just keeping the denormalized data in one list. The nightly batch flow handles data consistency anyway (it overwrites SF rows each night), so the denormalization risk (stale data) is managed by your refresh cycle.

---

## The Verdict: One List or Two?

### Test 1: Do the sections have different schemas?

```
Wins/Losses columns:    {Region, Customer, Update, Amount, Date, Source, SF_ID, Status, Stage, ...}
Opp Updates columns:    {Region, Customer, Update, Amount, Date, Source, SF_ID, Status, Stage, ...}
                         ────────────────────────────────────────────────────────────────────────
                         IDENTICAL
```

**Result: No reason to split.** You split tables when they have different attributes. Yours don't.

### Test 2: Does combining them create normalization violations?

The `Section` column (`Wins/Losses` vs `Opportunities/Updates`) is just a **categorical attribute** — it classifies the row but doesn't change the schema. It's the same as having a `Color` column with values `Red` and `Blue`. You wouldn't make a `RedItems` table and a `BlueItems` table.

**Result: No new violations from combining.** The transitive dependency through `SF_OpportunityId` exists regardless of whether you use one list or two.

### Test 3: Does splitting create any benefit?

| Concern | One List | Two Lists |
|:---|:---|:---|
| **Query performance** | Filter by `Section` column — fast in SP (indexed choice column) | Each list is smaller, but you need two data sources in the app |
| **Schema maintenance** | One list to update | Two identical lists to keep in sync |
| **Batch flow complexity** | One flow writes to one list (with a Section value per row) | Two flows, or one flow writing to two lists |
| **App complexity** | One gallery, one data source, filter by Section | Two galleries or two data sources merged with `ClearCollect` |
| **Permissions** | One set of permissions | Two sets (but they'd be identical) |
| **Normalization** | Same normal form either way | Same — splitting by a categorical value doesn't change NF level |

**Result: Splitting adds complexity with zero normalization benefit.**

---

## Recommendation: One List — `SalesOps_Staging`

Keep your existing `SalesOps_Staging` list as the single table. Add the columns needed for the Salesforce hybrid model. Here's the complete schema:

### `SalesOps_Staging` — Final Schema

| Column | Type | Values / Purpose | Source: SF | Source: Manual |
|:---|:---|:---|:---|:---|
| `ID` | Auto (PK) | SharePoint auto-generated | ✅ | ✅ |
| `Title` | Single line | Region name (`AT&T`, `Canada`, etc.) | ✅ Set by flow | ✅ Set by user |
| `Section` | Choice | `Wins/Losses`, `Opportunities/Updates` | ✅ Set by flow | ✅ Set by user |
| `CustomerName` | Single line | Customer or sub-account | ✅ From SM | ✅ User input |
| `UpdateText` | Multi-line (plain) | The update narrative | ✅ From SM | ✅ User input |
| `Amount` | Single line | Dollar amount | ✅ From SM | ✅ User input |
| `Stage` | Single line | Salesforce stage name | ✅ From SM | ⬜ Optional |
| `ReportDate` | Date | The Friday this belongs to | ✅ Set by flow | ✅ Set by user/app |
| `Source` | Choice | **`Salesforce`** or **`Manual`** | `Salesforce` | `Manual` |
| `SF_OpportunityId` | Single line | Salesforce record ID (for dedup + linking) | ✅ From SM | ⬜ Blank |
| `SF_Link` | Single line | Deep link URL to SF record | ✅ Built by flow | ⬜ Blank |
| `Status` | Choice | `Draft`, `Submitted`, `Approved`, `Published` | Auto: `Submitted` | User: `Draft` |
| `IncludeInReport` | Yes/No | User selects which items go into the weekly report | Default: `No` | Default: `No` |
| `SubmittedBy` | Person | Who added this row | ⬜ System/blank | ✅ Current user |
| `SubmittedOn` | Date/Time | Timestamp | ✅ Flow run time | ✅ `Now()` |
| `Notes` | Multi-line (plain) | Private notes (never in report) | ⬜ Blank | ✅ Optional |
| `CarriedForward` | Yes/No | Flag for recurring deals | ⬜ N/A | ✅ User flag |
| `PriorWeekID` | Number | Links to previous week's version | ⬜ N/A | ✅ If carried |

---

### How the Batch Flow Uses This Schema

```
NIGHTLY BATCH FLOW
──────────────────

1. Query Power BI Semantic Model
   → Get all Closed Won / Closed Lost opps (for Wins/Losses)
   → Get all modified open opps (for Opp Updates)

2. Get existing SF rows from SalesOps_Staging
   → Filter: Source = "Salesforce" AND ReportDate = currentFriday

3. UPSERT logic:
   For each query result:
   ├── IF row with matching SF_OpportunityId exists:
   │   └── UPDATE that row (Amount, Stage, UpdateText, etc.)
   └── IF no match:
       └── CREATE new row with Source = "Salesforce"

4. CLEANUP orphaned SF rows:
   For each existing SF row where SF_OpportunityId
   is NOT in the current query results:
   └── DELETE that row (it was removed/changed in SF)

5. NEVER TOUCH rows where Source = "Manual"
```

---

### How the App Uses This Schema

```
POWER APP
─────────

On Load:
  → Read SalesOps_Staging (no flow call, just SP data source)
  → Filter by user's region (from UserRegionConfig)
  → Filter by Section toggle (Wins/Losses or Opps)

Gallery shows:
  ┌──────────┬──────────┬──────────────────┬────────┬───────┬──────┐
  │ Source   │ Customer │ Update           │ Amount │ ☐ Rpt │ 🔗   │
  ├──────────┼──────────┼──────────────────┼────────┼───────┼──────┤
  │ 🔵 SF    │ CA North │ 3x Large OR UOS │ $130K  │ ☐     │ 🔗→SF│
  │ 🔵 SF    │ CA South │ 3x Type 1 MVC   │ $75K   │ ☑     │ 🔗→SF│
  │ 🟡 Manual│ Rogers   │ T700 run rate   │ $130K  │ ☑     │ +Add │
  └──────────┴──────────┴──────────────────┴────────┴───────┴──────┘

  🔵 SF rows: Read-only. Link button opens SF record.
  🟡 Manual rows: Editable. "+Add to SF" button opens SF new opp page.
  ☐ Rpt checkbox: User toggles IncludeInReport
```

---

## What About `UserRegionConfig`? — Keep It Separate

`UserRegionConfig` is a **lookup/reference table**. It has a completely different schema and purpose — it maps users to regions and roles. Merging it into `SalesOps_Staging` would be a clear **3NF violation** (user-region mapping is independent of individual updates).

### Final Table Count

| List | Purpose | Type |
|:---|:---|:---|
| `SalesOps_Staging` | All sales updates (SF + Manual, Wins + Opps) | Transactional data |
| `UserRegionConfig` | User → Region → Team → Role mapping | Reference/config data |
| `WeeklyUpdates_Master_Final` | Published, approved report entries | Production/archive data |

**Three lists total for the sales ops pipeline.** Clean, minimal, and each list has a distinct entity type (updates vs. users vs. published reports).

> [!TIP]
> If/when Marketing and Commercial teams join, they get their own staging list (different schema = different table). But within Sales Ops, one list handles everything.

---

## Summary of Decisions Locked In

| Decision | Answer |
|:---|:---|
| Scheduling | Scheduled (recurrence trigger, timed after PBI refresh) |
| Refresh logic | Upsert by `SF_OpportunityId` |
| SF data in app | Read-only for users. Link/button to SF handled later. |
| Report selection | Users manually toggle `IncludeInReport` per item |
| Number of lists | **One** — `SalesOps_Staging` with `Section` choice column |
| Section handling | `Section` choice column: `Wins/Losses` or `Opportunities/Updates` |
| Manual entries | Same list, `Source = "Manual"`, editable by user |
| SF entries | Same list, `Source = "Salesforce"`, read-only, refreshed nightly |

**Ready for the OpenAPI-style flow spec doc when you say go.**
