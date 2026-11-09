# Plan - Content Control Stabilization (Flat-List Pattern)

This plan addresses the issue where adding new bullet points (N+1 bullets) inside the Word document template causes the nested repeating `BulletSection` content control to break, delete itself, or fail to wrap new updates. This prevents Power Automate from extracting updates correctly.

## User Review Required

We are switching the architecture of both the **Word Template** and the **Power Automate Inbound Parser** to a **Flat-List Pattern**.

> [!IMPORTANT]
> **Key Architecture Change**:
>
> - We will **remove the nested repeating `BulletSection` content controls** from the Word template.
> - We will keep only the inline controls (`CustomerName`/`Customer`, `UpdateText`, and `Amount`) inside standard bullet paragraphs.
> - We will update the Power Automate XPath parsing logic to read the paragraphs inside the parent region wrapper as a flat sequence, dynamically grouping bullets under their respective regions.
>
> **Why this is bulletproof**:
>
> - Word is extremely fragile with nested repeating controls. When a user presses **Enter** to add a new bullet, Word does not duplicate block-level wrappers like `BulletSection`, but it *does* preserve inline controls inside the paragraph.
> - Removing the nested repeating wrapper means users can add, delete, and copy-paste bullets exactly like they do in a normal Word doc without breaking any control boundaries.

---

## Open Questions

> [!NOTE]
> 1. **Active Template Filename**: In your `templates/` folder, you have multiple files (e.g., `Sales_Mkting WK Template.docx` and `Sales_Mkting WK TemplateV.2.docx`). Can you confirm which one is the active template you want to stabilize?
> 2. **Sharing active doc**: If you have the specific document that got messed up, please feel free to share it or place it in the workspace folder. I can run an analysis on it to see exactly how Word modified the XML.

---

## Proposed Changes

### 1. Word Document Template Design

We will modify the Word template to remove the `BulletSection` content controls while keeping:

- `WinsRegionSection` / `OppsRegionSection` (as parent wrapper controls around the entire list).
- `RegionName` (as a plain text control inside the region heading paragraph).
- `CustomerName` (or `Customer`), `UpdateText`, and `Amount` (as inline plain text controls inside the update paragraphs).

### 2. Power Automate Flow Parsing Logic

We will change the XPath queries in `ParseWordWeeklyUpdates` to use the flat-list parsing strategy.

#### Old Logic (Fragile):

1. Query region blocks: `//w:sdt[w:sdtPr/w:tag/@w:val='WinsRegionSection']`
2. Inside each region, query bullet blocks: `//w:sdt[w:sdtPr/w:tag/@w:val='BulletSection']`
3. Inside each bullet block, extract child values: `CustomerName`, `UpdateText`, `Amount`.

#### New Logic (Robust):

1. Query all paragraphs (`<w:p>`) inside the parent section:
   `xpath(xml(xmlContent), '//w:sdt[w:sdtPr/w:tag/@w:val="WinsRegionSection"]//w:p')`
2. Loop through each paragraph in Power Automate:
   - **Condition 1**: If the paragraph contains a `RegionName` control (XPath check: `count(.//w:sdt[w:sdtPr/w:tag/@w:val="RegionName"]) > 0`):
     - Store the text of `RegionName` as `CurrentRegion`.
   - **Condition 2**: If the paragraph contains a `CustomerName` control (XPath check: `count(.//w:sdt[w:sdtPr/w:tag/@w:val="CustomerName"]) > 0`):
     - Extract `CustomerName`, `UpdateText`, and `Amount` from this paragraph.
     - Append a new item to our updates array using `CurrentRegion` and the extracted values.

---

## Verification Plan

### Automated/Local Verification

We will write a local Python simulation script `parse_docx_flat.py` in the `scratch/` folder that:

1. Unzips the target template `.docx` file.
2. Implements the flat-list XPath parsing logic.
3. Successfully extracts all region names and customer updates even when we manually add new bullet points.
4. Outputs the parsed JSON for inspection.

### Manual Verification

1. We will ask you to open the updated Word template.
2. Manually add N+1 bullet points, delete a bullet point, and copy-paste an update.
3. Run the processing flow to confirm that every update is correctly captured and written to SharePoint.
