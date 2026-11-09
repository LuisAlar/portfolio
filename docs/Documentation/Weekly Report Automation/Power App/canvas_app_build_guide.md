# Canvas Power App — Build Guide

> [!NOTE]
> This app uploads Word documents to a SharePoint folder (triggering your flow in the background) and shows processing status from a SharePoint list. It will be embedded as one section of your SharePoint weekly reports hub page.

---

## Prerequisites

Before you start building, set these up in SharePoint:

| Item | What to create | Purpose |
|---|---|---|
| **Document library folder** | A folder in an existing library (e.g., `Shared Documents/Processing Queue`) | Where uploaded files land; your flow triggers on new files here |
| **SharePoint list** | A list (e.g., `Processing Log`) with columns below | Where your flow writes results after extraction |

**SharePoint list columns to create:**

| Column Name | Type | Notes |
|---|---|---|
| `DocumentName` | Single line of text | File name of the uploaded doc |
| `DateSubmitted` | Date and time | When the file was uploaded |
| `Status` | Choice (`Queued`, `Processing`, `Complete`, `Error`) | Flow updates this as it processes |
| `SubmittedBy` | Person or Group (optional) | Who uploaded it |

---

## Step 1 — Create the Canvas App

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Click **+ Create** → **Blank app** → **Blank canvas app**
3. Name it: `Weekly Report - Document Processor`
4. Format: **Tablet** (best for SharePoint embed)
5. Click **Create**

---

## Step 2 — Add Data Connections

Once the editor opens:

1. Click the **Data** icon (cylinder) on the left sidebar
2. Click **+ Add data**
3. Search for **SharePoint**
4. Connect to your SharePoint site URL
5. Select **two** items:
   - The **document library** that contains your `Processing Queue` folder (e.g., `Shared Documents`)
   - The **SharePoint list** you created (e.g., `Processing Log`)
6. Click **Connect**

> [!TIP]
> If you don't see your site, paste the full site URL (e.g., `https://fujitsu.sharepoint.com/sites/1FinitySalesOps`) in the search box.

---

## Step 3 — Set Up the Screen Layout

You'll work with a **single screen** since this is one section of a larger SharePoint page. Keep it compact.

### 3a — Add a header label

1. **Insert** → **Text label**
2. Set these properties:

| Property | Value |
|---|---|
| `Text` | `"Submit Document for Processing"` |
| `Font` | `Font.'Segoe UI'` |
| `Size` | `20` |
| `FontWeight` | `FontWeight.Bold` |
| `Color` | `RGBA(33, 33, 33, 1)` |
| `X, Y` | `20, 15` |
| `Width` | `Parent.Width - 40` |

### 3b — Add a subtitle label

1. **Insert** → **Text label**
2. Properties:

| Property | Value |
|---|---|
| `Text` | `"Upload a Word document (.docx). It will be queued for automated data extraction."` |
| `Size` | `12` |
| `Color` | `RGBA(100, 100, 100, 1)` |
| `X, Y` | `20, 50` |

---

## Step 4 — Build the File Upload Section

### 4a — Add an Attachment control (via Edit Form)

Power Apps doesn't have a standalone file picker that saves to SharePoint directly. The standard approach is:

1. **Insert** → **Edit form** (`FormUpload`)
2. Set the form's **DataSource** to your **document library** (e.g., `'Shared Documents'`)
3. The form will auto-generate fields — **delete all fields except the Attachment/Name field** (or the file-related fields)
4. Position the form in the center of your upload area

> [!IMPORTANT]
> **Alternative (simpler) approach — use an Attachment control with a list:**
> If the document library form is tricky, you can instead:
> 1. Create a helper SharePoint list (e.g., `Upload Queue`) with just a `Title` column and enable **Attachments** on the list
> 2. Use an **Edit Form** connected to that list
> 3. Keep only the **Attachments** card in the form
> 4. When submitted, the attachment goes to the list, and your flow triggers on new items in that list instead of a folder
>
> This is often easier in Canvas Power Apps than writing directly to a document library folder.

### 4b — Configure the Attachments card

If using the helper list approach:

1. Inside the Edit Form, keep only the **Attachments** data card
2. Resize the Attachments card to fill the form area
3. Set the form to **New** mode by default:
   - Set the form's `DefaultMode` property to `FormMode.New`

---

## Step 5 — Add the Submit Button

1. **Insert** → **Button**
2. Set properties:

| Property | Value |
|---|---|
| `Text` | `"Submit Updates"` |
| `Fill` | `RGBA(230, 0, 18, 1)` *(Fujitsu red)* |
| `Color` | `White` |
| `BorderRadius` | `8` |
| `Width` | `200` |
| `OnSelect` | See formula below |

### Submit button `OnSelect` formula:

```
SubmitForm(FormUpload);
```

### 5b — Handle success and error

Set these properties on the **form** (`FormUpload`):

**`OnSuccess`:**
```
Notify("Document submitted for processing.", NotificationType.Success);
ResetForm(FormUpload);
```

**`OnFailure`:**
```
Notify("Upload failed. Please try again.", NotificationType.Error);
```

---

## Step 6 — Add the Processing Status Section

### 6a — Add a section header

1. **Insert** → **Text label**
2. Properties:

| Property | Value |
|---|---|
| `Text` | `"Processing Status"` |
| `Size` | `18` |
| `FontWeight` | `FontWeight.Bold` |
| `Y` | Position below the upload section |

### 6b — Add a Gallery for the SharePoint list

1. **Insert** → **Vertical gallery** (blank template)
2. Name it: `galProcessingStatus`
3. Set properties:

| Property | Value |
|---|---|
| `Items` | `SortByColumns(Filter('Processing Log', true), "DateSubmitted", SortOrder.Descending)` |
| `TemplateSize` | `45` |
| `Width` | `Parent.Width - 40` |

> [!TIP]
> Replace `'Processing Log'` with your actual SharePoint list name.

### 6c — Add labels inside the gallery template

Click into the first row of the gallery and add **three labels**:

| Label | `Text` property | Width | Notes |
|---|---|---|---|
| Document Name | `ThisItem.DocumentName` | 40% of gallery | |
| Date | `Text(ThisItem.DateSubmitted, "mm/dd/yyyy hh:mm")` | 30% of gallery | |
| Status | `ThisItem.Status.Value` | 20% of gallery | Color-code this one |

### 6d — Color-code the Status label

Set the **`Color`** property of the Status label to:

```
Switch(
    ThisItem.Status.Value,
    "Complete", RGBA(22, 163, 74, 1),
    "Processing", RGBA(217, 119, 6, 1),
    "Error", RGBA(220, 38, 38, 1),
    "Queued", RGBA(100, 100, 100, 1),
    RGBA(33, 33, 33, 1)
)
```

### 6e — Add a Refresh button

1. **Insert** → **Button** (or Icon → Refresh)
2. Properties:

| Property | Value |
|---|---|
| `Text` | `"Refresh"` |
| `OnSelect` | `Refresh('Processing Log')` |
| `Fill` | `RGBA(240, 240, 240, 1)` |
| `Color` | `RGBA(33, 33, 33, 1)` |

Position it to the right of the "Processing Status" heading.

---

## Step 7 — Resize the App for Embedding

Since this will be embedded in a SharePoint page alongside other content:

1. Go to **Settings** (gear icon) → **Display**
2. Turn **off** "Scale to fit"
3. Set a custom size that fits your SharePoint section:
   - Width: `1200` (or match your SharePoint column width)
   - Height: `700` (compact enough to not dominate the page)
4. Adjust your controls to fit within this space

---

## Step 8 — Save & Publish

1. **File** → **Save** (save to cloud)
2. **File** → **Publish**
3. Click **Publish this version**

---

## Step 9 — Embed in SharePoint Page

1. Go to your **SharePoint weekly reports hub page**
2. Click **Edit** on the page
3. Click **+** to add a new web part where you want the app
4. Search for **Power Apps** web part
5. Paste your **app ID** or **app web link**:
   - Find this in [make.powerapps.com](https://make.powerapps.com) → your app → **Details** → **Web link** or **App ID**
6. The web part properties let you set the display size — match it to your app dimensions
7. **Republish** the SharePoint page

> [!TIP]
> If you don't see the Power Apps web part, your SharePoint admin may need to enable it. An alternative is to use the **Embed** web part with the app's iframe URL.

---

## Summary — What You Built

```
┌──────────────────────────────────────────────┐
│  Submit Document for Processing              │
│  Upload a Word document (.docx)...           │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  📎 Attachments: [Click to add]        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [ Submit Updates ]                          │
│                                              │
│──────────────────────────────────────────────│
│  Processing Status                [Refresh]  │
│──────────────────────────────────────────────│
│  Weekly_Report.docx  07/31/2026  ● Complete  │
│  Q3_Forecast.docx    07/30/2026  ● Queued    │
│  Pipeline_Update.doc 07/29/2026  ● Error     │
└──────────────────────────────────────────────┘
```

---

## What Happens Next (Flow Side)

This guide covers the **app UI only**. Your Power Automate flow handles:
1. **Trigger**: New item in the `Upload Queue` list (or new file in folder)
2. **Extract**: Get the attachment/file content, process the Word doc
3. **Write**: Create/update an item in the `Processing Log` list with status
4. **Clean up**: Optionally move/delete the processed file

The app and flow are fully decoupled — the app writes, the flow reads and processes, the app reads the results.
