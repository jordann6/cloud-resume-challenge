# Portfolio UI Kit

High-fidelity React recreation of [jordandesigns.io](https://jordandesigns.io) — the single-page portfolio for Jordan Nelson.

## Files

| File | Purpose |
|---|---|
| `index.html` | Click-thru demo. Mounts the full portfolio with working nav, scroll, project modal, and fake visitor counter. |
| `colors_and_type.css` | Design tokens (copied from project root). |
| `components-core.jsx` | `Nav`, `Hero`, `BtnPrimary`, `BtnSecondary`, `Badge`, `Tag`, `SectionHeader` |
| `components-sections.jsx` | `About` (with `Stat`), `Experience` |
| `components-content.jsx` | `Projects`, `ProjectCard`, `Skills`, `SkillGroup`, `Certs`, `CertCard`, `Contact`, `ContactLink`, `Footer` |

## Interactivity

- **Nav links** smooth-scroll to anchors and update the active state.
- **Project cards** open a modal with full description and tags. Press the close button or click the backdrop to dismiss.
- **All hover states** match the source — background fades, border shifts, contact rows slide right with arrow translation.
- **Visitor counter** is faked (resolves to "4,217 Views" after 800ms) — the real implementation pings API Gateway.

## Caveats

- The `LinkedIn` and `GitHub` outbound links are dead in the prototype (no `href`). Add real targets if reusing for production.
- The fade-in observer applies a single class per section rather than per child element. The source staggers by 80ms within each section — replicate that on production rebuilds.
- No mobile burger menu — the source CSS hides nav links under 900px without offering an alternative. The kit inherits this behavior.
