# Email-Driven Document Processing Pipeline

## Architecture Overview

```
User emails .docx to Sales Ops mailbox
        ↓
┌─── Flow 1: INTAKE ─────────────────────────────┐
│  Trigger: When a new email arrives              │
│  • Grab attachment (.docx)                      │
│  • Save to SharePoint folder (Processing Queue) │
│  • Log to Processing Log list (Status: Queued)  │
└────────┬────────────────────────────────────────┘
         ↓
┌─── Flow 2: PROCESSING ─────────────────────────┐
│  Trigger: When a file is created in folder      │
│  • Get file content                             │
│  • Extract data (your XML extraction flow)      │
│  • Write extracted data to SharePoint list      │
│  • Update Processing Log (Status: Complete)     │
└────────┬────────────────────────────────────────┘
         ↓
┌─── Flow 3: REPORT GENERATION ──────────────────┐
│  Trigger: Manual or scheduled (e.g., weekly)    │
│  • Read from SharePoint list                    │
│  • Populate Word template                       │
│  • Save report to SharePoint / email it out     │
└─────────────────────────────────────────────────┘
```

---

## SharePoint Setup

Create these before building the flows:

### Folders

| Location | Path | Purpose |
|---|---|---|
| Document Library | `Shared Documents/Processing Queue` | Incoming files land here |
| Document Library | `Shared Documents/Processed` | Files move here after extraction (optional) |
| Document Library | `Shared Documents/Reports` | Generated reports saved here |

### Lists

**Processing Log** — tracks every submission

| Column | Type | Purpose |
|---|---|---|
| `Title` | Single line of text | Auto-filled (not user-facing) |
| `DocumentName` | Single line of text | Original file name |
| `SubmittedBy` | Single line of text | Sender's email address |
| `DateSubmitted` | Date and time | When the email came in |
| `Status` | Choice: `Queued`, `Processing`, `Complete`, `Error` | Flow updates this |
| `ErrorDetails` | Multiple lines of text | If something fails |

**Extracted Data** — your existing list where extraction results go (you may already have this)

---

## Flow 1: INTAKE (Email → SharePoint Folder)

### Trigger

**"When a new email arrives (V3)"** — Office 365 Outlook connector

| Setting | Value |
|---|---|
| **Folder** | Inbox (of the shared mailbox) |
| **To** | `[SALES_OPS_EMAIL@fujitsu.com]` |
| **Include Attachments** | Yes |
| **Only with Attachments** | Yes |

> [!TIP]
> If using a **shared mailbox**, use the trigger **"When a new email arrives in a shared mailbox (V2)"** and specify the mailbox address.

### Actions

```
1. Trigger: When a new email arrives in shared mailbox
   │
   ├─ 2. [Condition] Check if attachment exists
   │     └─ Yes branch:
   │
   ├─ 3. [Apply to each] → triggerOutputs()?['body/attachments']
   │     │
   │     ├─ 4. [Condition] Check file extension
   │     │     Expression: endsWith(items('Apply_to_each')?['name'], '.docx')
   │     │     └─ Yes branch:
   │     │
   │     ├─ 5. [Create file] — SharePoint
   │     │     Site: [YOUR SITE]
   │     │     Folder path: /Shared Documents/Processing Queue
   │     │     File name: items('Apply_to_each')?['name']
   │     │     File content: items('Apply_to_each')?['contentBytes']
   │     │
   │     └─ 6. [Create item] — SharePoint (Processing Log)
   │           Title: items('Apply_to_each')?['name']
   │           DocumentName: items('Apply_to_each')?['name']
   │           SubmittedBy: triggerOutputs()?['body/from']
   │           DateSubmitted: utcNow()
   │           Status: Queued
   │
   └─ 7. (Optional) [Reply to email]
         "Your document has been received and is queued for processing."
```

### Key Formulas

| Where | Formula |
|---|---|
| File extension check | `endsWith(items('Apply_to_each')?['name'], '.docx')` |
| File name | `items('Apply_to_each')?['name']` |
| File content (bytes) | `items('Apply_to_each')?['contentBytes']` |
| Sender email | `triggerOutputs()?['body/from']` |
| Current time | `utcNow()` |

---

## Flow 2: PROCESSING (SharePoint Folder → Extract → List)

### Trigger

**"When a file is created (properties only)"** — SharePoint connector

| Setting | Value |
|---|---|
| **Site** | `[YOUR SITE URL]` |
| **Library** | `Shared Documents` |
| **Folder** | `/Shared Documents/Processing Queue` |

### Actions

```
1. Trigger: When a file is created in Processing Queue
   │
   ├─ 2. [Get file content] — SharePoint
   │     Site: [YOUR SITE]
   │     File identifier: triggerOutputs()?['body/{Identifier}']
   │
   ├─ 3. [Update item] — Processing Log
   │     Filter: DocumentName eq triggerOutputs()?['body/{FilenameWithExtension}']
   │     Status: Processing
   │
   ├─ 4. ──── YOUR EXISTING XML EXTRACTION LOGIC HERE ────
   │     (Parse the .docx, extract XML, pull out data fields)
   │
   ├─ 5. [Create item] — Extracted Data list
   │     (Write the extracted fields to your data list)
   │
   ├─ 6. [Update item] — Processing Log
   │     Status: Complete
   │
   └─ 7. (Optional) [Move file] to /Shared Documents/Processed
         Use: Create file in Processed folder + Delete from Processing Queue
```

> [!IMPORTANT]
> **Connecting your existing extraction flow:** If your XML extraction is already a separate flow, you can call it using a **"Run a child flow"** action instead of rebuilding the logic. The child flow would accept the file content as input and return the extracted data.

### Error Handling

Wrap steps 4-6 in a **Scope** action, then add a parallel branch that runs on failure:

```
Scope: Process Document
  ├─ (steps 4, 5, 6)
  │
  └─ [Configure run after: has failed]
     └─ [Update item] — Processing Log
        Status: Error
        ErrorDetails: result('Scope')?['error']?['message']
```

---

## Flow 3: REPORT GENERATION (List → Word Document)

### Trigger

Choose one:

| Option | Trigger | When |
|---|---|---|
| **Manual** | "Manually trigger a flow" with a button | User clicks "Generate Report" |
| **Scheduled** | "Recurrence" | Weekly (e.g., every Friday at 4 PM) |
| **From Power App** | "PowerApps (V2)" | Button in your SharePoint page |

### Actions

```
1. Trigger: (manual / scheduled / Power App)
   │
   ├─ 2. [Get items] — SharePoint
   │     List: Extracted Data
   │     Filter: Status eq 'Complete' (or date range filter)
   │     Top count: 100 (or however many you need)
   │
   ├─ 3. [Populate a Microsoft Word template] — Word Online connector
   │     Location: SharePoint
   │     Document library: Shared Documents
   │     File: /Shared Documents/Templates/WeeklyReport_Template.docx
   │     (Map your list fields to template placeholders)
   │
   ├─ 4. [Create file] — SharePoint
   │     Folder: /Shared Documents/Reports
   │     File name: "Weekly_Report_" & formatDateTime(utcNow(), 'yyyy-MM-dd')
   │     File content: body('Populate_a_Microsoft_Word_template')
   │
   └─ 5. (Optional) [Send email] with report attached
         To: [DISTRIBUTION LIST]
         Attachment: output from step 4
```

> [!NOTE]
> **Word Template setup:** Create a Word document with **content controls** (Developer tab → Plain Text Content Control). Name each control to match your data fields. The "Populate a Microsoft Word template" action maps list columns to these content controls. [Microsoft docs on Word templates](https://learn.microsoft.com/en-us/power-automate/fill-in-a-word-template)

---

## Setup Checklist

- [ ] **Shared mailbox** — Confirm you have access to the Sales Ops mailbox or can create a rule for it
- [ ] **SharePoint folders** — Create `Processing Queue`, `Processed`, `Reports`, and `Templates` folders
- [ ] **SharePoint lists** — Create `Processing Log` list with the columns above
- [ ] **Word template** — Create a `.docx` template with content controls for Flow 3
- [ ] **Flow 1** — Build and test with a test email
- [ ] **Flow 2** — Build and test with a test file dropped in the folder
- [ ] **Flow 3** — Build and test manually first, then schedule

---

## What Users Need to Know

Send them one simple instruction:

> **To submit your weekly updates:**
> Email your Word document (.docx) to **[SALES_OPS_EMAIL@fujitsu.com]**
>
> Your document will be processed automatically. You can check the status on the Weekly Reports hub page.

No app to learn. No login. Just email.
