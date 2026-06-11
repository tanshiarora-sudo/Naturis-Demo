# Naturis — Lab Tech & Lab Manager Flow (PRD-ready)

> Scope: holistic rework of the Lab Technician and Lab Manager experience and **all dependent modules** (Sales SPOC, Sales Manager, timeline, dashboards, notifications, audit, ownership). This is the implemented behaviour in the prototype plus the spec it is built to.

---

## 1. Roles, permissions & ownership

| Role | Can do | Cannot do |
|---|---|---|
| **Sales SPOC** (Hardik Shah) | Log requirement, answer lab queries, approve dispatch → send to client, record client feedback/iteration, raise flags, resolve own flags | Accept/decline lab work, advance bench stages |
| **Lab Technician** (Sumit Choudhary; Tariq Khan = TT desk) | Acknowledge, evaluate (RM/PM/slot/availability), **decide (Accept/Decline/Raise Query)**, run bench, dispatch, stability, deliverables, iterate | Approve a requirement into the lab (manager gate), set flag severity |
| **Lab Manager** (Dipti OV) | **Looped into every lab workflow** — full visibility, oversight board, intervene/override (audit-logged), workload & analytics, close project | — |
| **Sales Manager** (Kunal Shah) | Gate NPD/TT/new-client, set flag severity, provide flag solutions | — |

**Ownership transfer** (tracked on `req.owner`, audit-logged):
`Sales SPOC → Lab` on **Accept**; `Lab → Sales SPOC` on **Decline / Query raised / Sent to client**.

---

## 2. Status model (requirement spine)

```
Logged → Pending review → Approved
  → Acknowledged → In evaluation
      → Accepted — date committed | Declined | Query raised
  → Formulation → Trial → QC → Fill → Ready for dispatch
  → Dispatch awaiting SPOC approval → Sent to client
  → Client approved | Rejected | (iteration ↺ back to Formulation)
  → In stability → Archived (Closed)
```
Routing: `Approved` requirements auto-route to the **lab-tech desk for their project type** (`LAB_DESKS`: EPD/REN/NPD → Sumit, TT → Tariq). The Lab Manager is auto-subscribed to all.

---

## 3. User flows

### 3.1 Acknowledgement (LB-02)
1. Tech opens Incoming (grouped by query-type desk, VVIP-first).
2. First screen shows the **full requirement + discussion/activity trail** (collapsible).
3. Only action = **Acknowledge** → explicitly "**Seen & Reviewed**, not acceptance/commitment".
4. Records actor + timestamp → timeline event; status `Acknowledged`.

**Acceptance criteria:** AC1 only Acknowledge is offered pre-ack. AC2 disclaimer visible. AC3 timeline records who/when. AC4 Lab Manager sees it in oversight immediately.

### 3.2 Evaluation (LB-02 → "Begin evaluation")
Tech records: RM procurement required (Y/N) · PM procurement required (Y/N) · **Slot allotment** (date/calendar) · **RM/ingredient availability** per item (Available / Not available).

**AC:** evaluation persists on `req.evaluation`; decision panel enabled once started.

### 3.3 Decision
- **Accept** → mandatory tentative sample/completion **date** → status `Accepted — date committed`, owner→Lab, SPOC notified.
- **Decline** → **mandatory reason** → status `Declined`, owner→SPOC, SPOC notified, SPOC can revise & resend.
- **Raise Query** → free-text to SPOC → status `Query raised`, owner→SPOC; **query history** kept on `req.queries[]`; SPOC answers (SP-04) → `resolveQuery` → back to `Acknowledged`/Lab.

**Edge cases:** declined with no reason blocked; multiple sequential queries supported; query while RM short allowed.

### 3.4 Project-type routing
Auto-route by type to the configured desk; Lab Manager looped in for visibility on all four desks (EPD/REN/TT/NPD + any future type via `LAB_DESKS`).

### 3.5 Sample completion & dispatch (LB-03)
Advance bench `Formulation→Trial→QC→Fill→Ready`. Then **Dispatch**: generate note + **upload ≥1 product photo** + shipping address (required) → `Mark dispatched` → status `Dispatch awaiting SPOC approval`. **SPOC approves** (SP-04 "Approve & send to client") → `Sent to client`, **ownership → Sales SPOC**.

**AC:** send blocked without note + ≥1 photo + address. Replaces the WhatsApp dispatch group.

### 3.6 Stability testing (LB-03 post-approval)
After **Client approved**, run **3-month or 6-month** cycle; status `In stability`; per-month logging (`advanceStability`) with status + expected completion; monthly updates notified to SPOC; appears in the timeline. Default-ON by type (EPD off · NPD on · Renovation prompt; defer-until-PO supported).

### 3.7 Client feedback & iterations
Flow: **Client → SPOC → Lab Team → Assigned Lab Tech → Completion → SPOC → Client.** SPOC records feedback (texture/fragrance/formula/other) on SP-04 → **Request iteration** → `newIteration` (code auto-increments inside **one thread**, status back to `Formulation`, `iteration++`). Full version history preserved on `req.ncls[]`.

### 3.8 Post-stability deliverables
Track **Ingredient sheet** and **Marketing brief** submission (status + pending). Once stability passed and both submitted → Lab Manager can **Close & archive**.

### 3.9 Requirement timeline (omnipresent)
Every lab event is appended to `REQUIREMENT_TIMELINES[id]` and rendered by the shared `ProgressTimeline` (with actor·role·timestamp) on **SP-04, LB-02 history, LB-05 archive, SM-03**: acknowledgement, evaluation, RM/PM, slot, accept/decline, query raised/resolved, sample prep (each stage), dispatch, stability months, client iterations, ingredient sheet, marketing brief, final closure.

### 3.10 Dashboards & analytics (LM-01, LM-04)
LM-01 command tiles + per-desk/per-tech load + "needs oversight". LM-04 weekly/monthly: requirements received, accepted/declined, queries, pending, TAT, RM/PM requirements, slot utilisation, samples dispatched, stability tests, client iterations, **per-tech productivity & timeline adherence**, bottlenecks & ageing.

### 3.11 Lab Manager visibility (LM-02 Oversight)
Every active workflow, viewable **by stage** or **by technician**; historical logs (timeline), pending approvals, escalations (flags/declines/queries/breaches), workload distribution (LM-03), timeline adherence (LM-04).

---

## 4. Adjacent modules impacted (and updated)
- **Sales SPOC (SP-04):** lab-query response, decline→revise, client outcome/iteration, dispatch approval; people panel reveals lab tech only after acknowledgement; progress stepper maps all lab statuses.
- **Sales Manager (SM-03 / Review desk):** gate feeds the lab; sees lab status via Live requirements/timeline.
- **Notifications:** decision, dispatch, query, stability, decline all push to the feed (rules NR-03/04/05).
- **Audit log (Admin AD-09):** manager overrides recorded immutably; per-requirement timeline is the operational audit trail (append-only).
- **Status mappings:** SPOC pipeline, manager Live-requirements stage filters, lifecycle stepper updated to new statuses.
- **Layout/permissions:** lab & lab-mgr nav badges recomputed on new statuses; LM-02 = Oversight.

## 5. Assumptions & dependencies
- **A1 — Decision owner:** per this spec the **Lab Tech decides** (Accept/Decline/Query) with the Lab Manager looped in for visibility/override. (Supersedes the earlier "lab-meeting is the sole accept gate" model; the daily lab meeting is now the Manager's oversight board.)
- **A2 — Desk routing** is by project type (`LAB_DESKS`); multiple techs per type and a dual SPOC+Lab login are future config.
- **A3 — Stability** cadence is 3 or 6 months; accelerated-chamber data logging is simulated (month counter), not real sensor data.
- **A4 — Uploads** (photos, dispatch note, ingredient/marketing docs) are represented as attached/generated flags in the prototype (no file storage backend).
- **A5 — Slot calendar** is a 1–2 week horizon; full station scheduling/inventory is the Phase-2 mini-ERP.
- **D1** depends on the shared `NaturisStore` (in-memory) — resets on reload. **D2** timeline rendering depends on `window.ProgressTimeline`/`FullBrief` (defined in screen-spoc, loaded first).
