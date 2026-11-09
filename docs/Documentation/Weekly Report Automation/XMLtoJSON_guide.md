# Implementation Plan - Word OpenXML Parser (Section Content Controls + Bold Region Tracking)

This updated plan incorporates your exact design choices:
1. **Direct OpenXML Extraction**: Parsing `word/document.xml` using `xpath()` expressions in Power Automate.
2. **Two Section Content Controls**: Outer wrapper controls (`WinLossSection` and `OpportunitySection`) circling each section.
3. **Dynamic Bold-Text State Machine**: Inside each section control, Power Automate iterates paragraphs (`<w:p>`), detecting bold formatting (`<w:b/>`) for region names (e.g., *AT&T*, *Verizon*) and collecting subsequent bullet points under that region.

---

## Architecture Overview

```text
+-------------------------------------------------------------------+
|  [Content Control: WinLossSection]                               |
|                                                                   |
|    Paragraph 1: **AT&T**  <-- OpenXML has <w:rPr><w:b/></w:rPr>    |
|    Paragraph 2:  * Won $500k expansion deal... (Bullet)           |
|    Paragraph 3:  * Lost test rig bid... (Bullet)                  |
|                                                                   |
|    Paragraph 4: **Verizon** <-- OpenXML has <w:rPr><w:b/></w:rPr> |
|    Paragraph 5:  * Secured $1.2M 1FINITY blade order... (Bullet)  |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|  [Content Control: OpportunitySection]                            |
|                                                                   |
|    Paragraph 1: **Horizon**  <-- OpenXML has <w:rPr><w:b/></w:rPr>  |
|    Paragraph 2:  * Pitching next-gen ROADM node upgrade...        |
+-------------------------------------------------------------------+
```

---

## Power Automate OpenXML Parsing Blueprint

### Step 1: Extract Document XML
In Power Automate:
- Get file content of `.docx` -> Unzip / read `word/document.xml` text into variable `xmlContent`.

---

### Step 2: Query Paragraphs Per Section Wrapper

Using Power Automate `xpath()` expressions:

#### Query Win/Loss Paragraphs:
```js
xpath(xml(variables('xmlContent')), '//w:sdt[w:sdtPr/w:tag/@w:val="WinLossSection"]//w:p')
```

#### Query Opportunity Paragraphs:
```js
xpath(xml(variables('xmlContent')), '//w:sdt[w:sdtPr/w:tag/@w:val="OpportunitySection"]//w:p')
```

---

### Step 3: Paragraph State-Machine Loop Logic

For each section (`Win/Loss` and `Opportunity`), run an **Apply to each** loop over the section's paragraph array (`item()`):

```mermaid
graph TD
    Start[Apply to each Paragraph in Section] --> CheckBold{Does paragraph contain bold run?<br/>xpath check: count(.//w:rPr/w:b) > 0}
    
    CheckBold -- Yes (Region Header) --> ExtractBold[Extract Text via XPath:<br/>string(.//w:t)<br/>Set varCurrentRegion = Bold Text]
    
    CheckBold -- No --> CheckBullet{Is paragraph a bullet?<br/>count(.//w:pPr/w:numPr) > 0 OR starts with bullet}
    
    CheckBullet -- Yes (Update Item) --> ExtractText[Extract Bullet Text via XPath:<br/>string(.)<br/>Append Object to varUpdatesArray]
    
    CheckBullet -- No --> Skip[Skip non-content paragraph]
    
    ExtractBold --> Next[Next Paragraph]
    ExtractText --> Next
    Skip --> Next
```

---

### Step 4: Power Automate Expressions Reference

#### A. Bold Check Expression (Condition Action):
```js
greater(xpath(xml(concat('<root xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">', string(item()), '</root>')), 'count(//w:rPr/w:b)'), 0)
```
- **If True**: This paragraph is a **Region Heading** (e.g. `AT&T`, `Verizon`).
- **Action**: `Set variable varCurrentRegion` =
  ```js
  trim(xpath(xml(concat('<root xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">', string(item()), '</root>')), 'string(//root)'))
  ```

#### B. Bullet / Update Text Extraction:
- **If Bold Check is False** and paragraph contains text:
- **Action**: Extract full paragraph text string:
  ```js
  trim(xpath(xml(concat('<root xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">', string(item()), '</root>')), 'string(//root)'))
  ```
- **Append to Array Variable (`varUpdatesList`)**:
  ```json
  {
    "Section": "Win / Loss", 
    "Region": "@variables('varCurrentRegion')",
    "UpdateText": "@variables('varExtractedText')"
  }
  ```

---

## Benefits of this Architecture

1. **Robust Section Boundary**: Encapsulating entire sections in `WinLossSection` and `OpportunitySection` content controls guarantees strict isolation without rigid controls inside the bullet lists.
2. **Freedom for End-Users**: Users can press Enter, format bold text, add/delete bullets freely inside Word without breaking XML tag boundaries.
3. **Pure OpenXML Efficiency**: Native `xpath()` expressions eliminate the need for third-party file converters or external APIs.

---

## Verification Plan

### Manual Testing in Power Automate
1. Create a Word doc with two rich text / group content controls named `WinLossSection` and `OpportunitySection`.
2. Type bold regions (*AT&T*, *Verizon*, *Horizon*) and bullet points inside the controls.
3. Run the flow and inspect the generated JSON array output to confirm all updates are grouped correctly.
