# Context: where this site came from

This site was extracted from **yourOwn** (`C:\Users\alarc\Developer\yourOwn-repo`), a multi-user portfolio engine that never shipped. Only the UI and content came across. All the engine machinery was left behind.

To see any original file:
```
cd ../yourOwn-repo
git show 923be6c:yourOwn/<path>        # 923be6c = tip of origin/dev/layoutDesign
```
UI paths: `packages/ui-patterns/src/patterns/**`, `packages/layouts/*`, `packages/assets/*`, `apps/client/src/theme.css`.

## What was ported (copied, then adapted)
| Here | Original | Changes |
|---|---|---|
| `components/experience/Timeline.tsx` | `patterns/homes/Timeline.tsx` | Typed props. Reads flat `summaryShort` (was `variants[0]`). Connector SVG is now an ES import (the old `/assets/...` path never resolved, so the `onError` DOM fallback always ran). Entries link to the detail page. Optional `logo`. |
| `components/nav/SideNav.tsx` | `patterns/homes/VerticalNav.tsx` | Editor actions removed. Static tabs. Horizontal mode for mobile. Fixed the invalid `group-hover-[...]` class. |
| `components/profile/SocialLinks.tsx` | `patterns/SocialLinkCard.tsx` | Typed links. |
| `components/profile/ProfileIdentity.tsx` | `patterns/homes/ProfileIdentity.tsx` | Avatar comes from content. Fixed `alt` (was `data.name`). Compact mode. |
| `components/layout/SiteShell.tsx` | `layouts/SidebarProfileLayout.tsx` + client `shells/SplitPaneShell.tsx` | Normal children instead of slots. Cream/sage styling. Mobile top bar. |
| `components/experience/ExperienceDetail.tsx` | structure of `patterns/homes/ExperienceCard.tsx` + `NarrativeCard.tsx` | New component. Restyled, debug footers dropped. |
| `pages/HomePage.tsx` | composition idea of `layouts/HomeLayoutV2.tsx` | Hero on top, then a 12-column grid: featured work (8 columns) and an aside (4 columns). |

## Design tokens (`tailwind.config.js`)
- `cream #FCF3D9`: page background (was `--portfolio-bg`)
- `paper #FDFFE8`: timeline/content panels
- `sage #4E5D4B`: text. `sage-light #ACC2A7`: nav text and star. `sage-mist #d7dfda`
- `ember #E56565`: timeline track, social icons, accents
- Font: **Afacad** (Google Fonts). `font-afacad` was used in yourOwn but never configured, so it never applied there.
- The original `theme.css` also had `--portfolio-primary #3b82f6`, `--portfolio-button #dfe323` and a `.theme-dark` override. These weren't ported.

## Content
`src/content/*.ts` was migrated from the yourOwn Postgres DB (session `a2b428b1-47a4-4d05-901e-239cf3851ea4`). Each experience had one or more **variants** (different framings of the same role). One was chosen per experience. These alternates weren't used:
- **Indigo Magazine — "Product Focus":** led product direction and technical execution to grow active readership by 400+ users. Bullets about digital strategy, cross-functional launches and streamlined creator workflows. Tech: Product Strategy, Cross-functional Leadership, Web Development.
- **Orbital — "Leadership Focus":** led DevOps initiatives to streamline onboarding and stabilize platform infrastructure. Bullets about automated onboarding scripts, architectural guidance and observability tools for the team. Tech: Docker, Team Leadership, Automation.

The raw dump is in `scratch/db-export.json` (gitignored). SHPE was stored as `WORK` and is now `ORGANIZATION`.

## Not ported
- **Patterns:** HeroBasic, GenericCard, DefaultPattern, JobSummary (light card with image placeholders; possibly useful for a projects page), ProjectCard/ProjectGrid, ProfileHero, ProfessionalHero.
- **Layouts:** Bento, Home, About, Projects. All are grid placeholders, plus HomeLayoutV2 beyond its composition.
- **Engine:** Express/Prisma server, sessions/JWT, `PATTERN_REGISTRY`/`LAYOUT_REGISTRY`, slots and placements, `useHydratedLayout`, manifest, editor, export jobs, renderer app.
