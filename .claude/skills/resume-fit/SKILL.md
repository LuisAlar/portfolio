---
name: resume-fit
description: Pick the best of the user's resume variants for a specific job posting, explain why, list gaps and edits, and (once approved) write a tailored resume into the portfolio repo's docs/resumes/<folder>/ and compile it to PDF locally with Tectonic, so no Overleaf trip is needed. Use this whenever the user pastes a job description or internship posting, names a company or role they are applying to, asks which resume to send, asks to tailor/adapt/rewrite a resume for a job, or asks to turn a resume .tex into a PDF, even if they don't say "skill" or name a file.
---

# Resume fit

The user keeps several resume variants, each framed for a different kind of role. Given a job posting, the job is to (1) pick the variant that already fits best, (2) say concretely what to change, and (3) on their go-ahead, write a tailored copy and build the PDF.

The value of this skill is judgment plus honesty: recruiters skim for evidence that matches the posting, so the right variant and the right top bullets matter more than adding keywords. Every claim in the output has to trace back to something the user actually did.

## Where things live

Everything is in the portfolio repo (`C:\Users\alarc\Developer\portfolio`); relative paths below are from its root.

**Resumes**, one folder per version:

```
docs/resumes/<folder>/Luis_Alarcon_Resume.tex   <- source
docs/resumes/<folder>/Luis_Alarcon_Resume.pdf   <- built PDF, the file the user submits
```

Folders are lowercase names for the focus or the company: `general` (the main one), `cloud`, `web`, `pm`, `sales`, `finance`, `ericsson`, `corgan`, and more over time, so list `docs/resumes/*/*.tex` rather than trusting this list.

| What | Path |
|---|---|
| Older notes and past resume PDFs (outside the repo) | `C:\Users\alarc\OneDrive\Documents\Academic\Applications`: `*.md`, `internships\*.md` (role write-ups, cover letters, responses to postings). Fine to mine for wording; its resumes are old drafts, not candidates to recommend, and new resumes never go there |
| Detailed work notes | `docs/Documentation/**`: 1Finity specs, PRDs, build guides (Weekly Report Automation, Salesforce Agent, Auditing Agent). `docs/radioUtdDocs/`: Radio UTD incident change log (reads like a postmortem) and the hosting readiness plan (reads like a runbook). `docs/1finity-notes.md`, `docs/1finity-writeup.md`, `docs/cover-letter-*.md` |
| Portfolio content (every role and project, with longer write-ups) | `src/content/experiences.ts` |
| Contact links (GitHub, LinkedIn) for when a posting asks for them | `src/content/profile.ts` |
| NFC Media Journal project docs | `C:\Users\alarc\Developer\NFC-Tag\docs` (if accessible). Mostly design docs: requirements, OpenAPI spec, data model, and an infrastructure comparison |
| PDF build script | `.claude/skills/resume-fit/scripts/build-pdf.ps1`; writes the PDF next to its `.tex` |

## Step 1: Read the posting

Pull out, in your head or a short scratch list:
- **What the team actually does** (the responsibilities). This matters more than the keyword list, because it tells you which *story* the resume should tell.
- **Required vs. preferred vs. nice-to-have** qualifications. Missing a required item is serious; missing a nice-to-have is not.
- **Application mechanics** that affect the resume: asks for coursework, GPA, portfolio or GitHub link, graduation window, location, a separate application or scholarship form.
- **The company name**, which usually becomes the new folder's name. If the posting doesn't say, ask for it when you offer to write the file.

## Step 2: Read every variant, compare them

Read only the body of each `.tex`; the preambles are near-identical. In Git Bash, `awk '/begin\{document\}/{f=1} f' docs/resumes/cloud/Luis_Alarcon_Resume.tex` prints just the body (a `sed` range with `\begin` tends to break on backslash escaping). For each variant, judge:
- Does its **framing** match the team's work? (e.g. building internal tools vs. infrastructure vs. client-facing sales)
- How many **responsibilities and required qualifications** does it already show evidence for?
- Is its **strongest material on page 1, near the top**?
- **Length**: some variants force a second page with `\newpage`. For an internship, a tight one-pager is a plus, so count it as a tiebreaker.

Pick one winner and one runner-up. Don't score with a formula; a variant that tells the right story with fewer keywords beats one that lists every keyword but is framed for a different job.

## Step 3: Mine the notes for missing evidence

Before calling something a gap, check whether the user has done it and it just isn't on that variant. Grep the notes and `experiences.ts` for the posting's key terms (e.g. `Power BI`, `React`, `API`, `Azure`, `dashboard`, `Agile`). Often another variant or a write-up already has a better bullet you can borrow.

Sort what you find into:
- **Already in the winner** → maybe reorder or sharpen.
- **In another variant or the notes** → borrow it (say from where).
- **Not anywhere** → a real gap. Do not invent it. Tell the user, and suggest it only as "if you've done X, add it". If one small side project would close several preferred gaps at once, you may mention it in one line, but keep it clearly separate from resume edits.

Other evidence that counts: the portfolio repo itself (its `package.json` and config show React, TypeScript, Tailwind, Vite and Vercel in a shipped site the user built). A role or bullet that appears only in a resume variant (no notes behind it) is still the user's own claim and can be reused as written, but don't embellish it beyond what that variant says.

Design docs, comparisons and plans are not proof of hands-on work. A doc that weighs Kubernetes against Cloud Run, or a PRD for a feature, shows research or planning, not that the user ran or shipped it. Only turn notes into resume claims when they describe something the user built, ran or delivered; otherwise word it as what it was ("evaluated", "designed", "planned").

## Step 4: Report (always do this before writing files)

Keep it scannable: aim for about 4–6 "why it fits" lines and at most 6–7 edits, one or two lines each. Use this shape:

```
**Use resumes\<folder> — <one-line reason>.**

Why it fits
- <responsibility/requirement> → <the specific bullet or project that shows it>
- ...

Runner-up: <file> — <why it's close and why it loses>.
Poor fits: <files> — <one line>.

Edits to make
1. <concrete change: move/swap/add/cut, with the source of any borrowed content>
2. ...

Can't fix from your notes (only add if true)
- <real gaps>

Application notes
- <coursework asked for, graduation-window check, required extra forms, etc.>
```

If you notice a LaTeX bug in the winning variant (a broken line break, an unescaped character), list it as an edit; the tailored copy will fix it. If the posting asks for things the repo doesn't hold (live site URLs, GPA), say so and ask the user for them.

Then say whether a new version is worth making. If the winner already fits well and the edits are small, you can suggest editing that folder's resume in place instead; otherwise propose a new folder name (usually the company, lowercase, hyphens). Ask which they want.

## Step 5: On approval, write the tailored version

1. **Copy the winner's preamble exactly** (everything up to and including `\begin{document}`); only change the comment title line to name the company/role. Then write the body.
2. Save it as `docs/resumes/<folder>/Luis_Alarcon_Resume.tex`, creating the folder. If that file already exists, ask before overwriting.
3. Apply the edits from Step 4. Guidelines that keep it credible:
   - Reorder experiences so the most relevant one is first; lead each with its most relevant bullet.
   - Borrow bullets from other variants or rewrite from the notes; keep the numbers exactly as the user's sources state them.
   - Anything you couldn't verify (e.g. a coursework list, an "interested in X" summary line) goes in with a `% TODO: confirm ...` comment above it, and you name it in your reply.
   - Escape LaTeX specials in new text: `\&`, `\%`, `\$`, `\#`, `\_`.
4. **Write the file with the Write tool (or Edit), not a shell heredoc or `echo`.** Shells on this machine can collapse `\\` into `\`, which silently breaks LaTeX line breaks: the name runs into the contact line and skills lines merge. The build script warns about this, but avoiding it is easier.
5. **Build the PDF** (Step 6) and report page count.

## Step 6: Build the PDF

```powershell
powershell -ExecutionPolicy Bypass -File .claude/skills/resume-fit/scripts/build-pdf.ps1 docs/resumes/<folder>/Luis_Alarcon_Resume.tex
```

Run it from the portfolio repo root. The PDF lands next to the `.tex` with the same name. `-All` rebuilds every `docs/resumes/<folder>/*.tex`. The script compiles with Tectonic, never edits the source `.tex` (it strips the pdfLaTeX-only `glyphtounicode` lines from a temp copy, since Tectonic uses XeTeX), and prints `pages=N`, the number of overfull-line warnings, and a `WARN` for any line ending in a single `\` where `\\` was probably meant. First run can take a minute while Tectonic downloads packages.

After building:
- **Check the layout.** Try reading the PDF with the Read tool (`pages: "1-2"`); on this machine that may fail because PDF rendering tools aren't installed. If it does, rely on the script's numbers: compare `pages=` with the variant you started from (build it too if needed), and treat any overfull-line warning as a line running into the margin that needs shortening. Either way, send the user the PDF so they can eyeball it for one-word lines or a lonely heading at a page bottom.
- If it's longer than the variant it came from, or spills onto a page it shouldn't, tighten (trim the weakest bullets of the least relevant roles) and rebuild. To learn how much it spills, build a throwaway copy in a temp folder with `\addtolength{\textheight}{0.5in}` added after the existing `\textheight` line: if that copy fits, the overflow is under half an inch (about 3 lines), so one or two short cuts will do.
- If the build fails, the script prints the LaTeX error. Fix the cause in the `.tex` (usually an unescaped `&`, `%` or `#`), then rebuild.

If Tectonic is missing, it lives at `%LOCALAPPDATA%\Programs\tectonic\tectonic.exe`; tell the user rather than installing something new without asking.

## Finish

Tell the user the full paths of the `.tex` and the `.pdf`, the page count, and every `% TODO` they need to confirm, and send them the PDF.
