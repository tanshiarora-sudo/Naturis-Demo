# Naturis Sampling Platform — Prototype

A fully interactive, clickable front-end prototype of the Naturis cosmetics **sampling platform**, built screen-for-screen from the Engineering Build Spec (PRD v2.0).

- **6 roles** · **31 screens** · single shared state machine
- **No build step** — CDN React 18 + Babel Standalone, JSX transpiled in-browser
- All data is mock data on `window.NaturisData`; clients, formulations and numbers are fictional.

## Run it

The app loads its `.jsx` files over HTTP (browsers block that over `file://`), so serve the folder with the tiny included server:

```bash
cd ~/Desktop/Naturis
python3 serve.py
```

Then open **http://127.0.0.1:4178** in your browser.

> First run may prompt macOS to grant Terminal/Python access to the Desktop folder — allow it.
> Any static server works too (e.g. `npx serve`), as long as it serves this directory.

## Using the prototype

- **Sign in** with any of the 6 demo personas on the login screen (email/password are pre-filled — just click *Sign in*).
- Switch roles any time via the **persona switcher** at the bottom of the sidebar.
- **Management** opens in dark mode; everything else is light. Toggle theme in **Tweaks** (top bar).
- Rows open detail; buttons act. VVIP items always sort to the top. SLA chips compute live.

## Roles & key screens

| Role | Highlights |
|------|-----------|
| **Sales SPOC** | Progressive-disclosure intake (SP-02), requirement detail with one-thread iteration history, pipeline kanban |
| **Sales Manager** | Decision review queue, gated review detail + lifecycle timeline, flag review (incident dashboard), client intelligence |
| **Lab Technician** | Acknowledge-first dashboard, incoming queue with RM/PM availability, live bench + software dispatch |
| **Lab Manager** | The lab-meeting gate (3-part RM/PM/Slot, derived earliest-dispatch date), planning & load |
| **Management** | Read-only dark command centre, brands, reports |
| **Platform Admin** | Users, RBAC matrix, accounts + notification routing, SLA matrix editor |

## File map

| File | Owns |
|------|------|
| `index.html` | CDN host + load order |
| `tokens.css` | All design tokens, type scale, utility classes, dark theme |
| `tweaks-panel.js` | Persisted theme preference (loads before tokens) |
| `shared.jsx` | Icon set, StatusPill, AISuggestion, Drawer, Field, Stat, Avatar, Aging, table primitives, Ring |
| `shared-v2.jsx` | VVIPBadge, ProjectTypePill, FormulationCode, SLAIndicator, Toggle, CompatibilityNote, ProjectTypePicker |
| `data.jsx` | `window.NaturisData` — requirements, accounts, project types, SLA matrix, flags, RBAC, notifications, `slaStatus()` |
| `layout.jsx` | Sidebar, TopBar, AppFrame, NAV map |
| `screen-auth.jsx` | Cinematic login (AUTH-01) |
| `screen-spoc.jsx` | SP-01/02/03/04/07/09 + shared ReqTable / StageStepper / Kanban / charts |
| `screen-manager.jsx` | SM-01…06 + CI-01 |
| `screen-lab.jsx` | LB-01/02/03/05 (+ dispatch) |
| `screen-labmgr.jsx` | LM-01/02/03/04 |
| `screen-mgmt.jsx` | MG-01/02/03 |
| `screen-admin.jsx` | AD-04/05/07/08, GL-01/02/03 |
| `app.jsx` | Root: auth gate, role+screen router, Tweaks, role switcher, notifications |

## Notes & deviations from the PRD

- The PRD prescribes a no-build CDN setup; this prototype follows that exactly (no Node toolchain required).
- AI output is always advisory ("a suggestion, not a decision", never a green check), per the global rules.
- "Active" is avoided in user-facing strings ("Live" / "Open" / "Enabled" instead).
- Phase-2 lab-ops modules (inventory, stability logging, address book) are shown as stubs under Planning & load, as specified.
