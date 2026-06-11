# Naturis Sampling Platform — Functional QA Review

**Reviewer:** Senior Functional QA Analyst
**Date:** 11 Jun 2026
**Scope reviewed:** `data.jsx`, `layout.jsx`, `app.jsx`, `screen-auth.jsx`, `screen-spoc.jsx`, `screen-manager.jsx`, `screen-lab.jsx`, `screen-labmgr.jsx`, `screen-mgmt.jsx`, `screen-admin.jsx`, `shared.jsx`, `shared-v2.jsx`, `LAB_FLOW.md`
**Method:** static functional review of implemented behaviour vs. LAB_FLOW.md spec and inline copy. Every finding distinguishes **confirmed** behaviour (seen in code) from **assumed** intent. My role is to review and question, not decide — every gap below ends in questions for the product owner.

**Totals: 5 Critical · 12 High · 15 Medium · 8 Low (40 findings)**

---

## 1. Intake (SP-02, data.jsx)

### Observation
VVIP status is never inherited or settable at intake. In `screen-spoc.jsx → submitRequirement()` the new requirement is hardcoded `vvip: false`, even when the selected existing account (e.g. Nykaa ACC-01, Nua ACC-05) is `vvip: true` in `ACCOUNTS`. Additionally, `NaturisStore.addRequirement()` creates **no notification at all** — rule NR-01 ("NPD/TT logged → Sales Manager") and NR-02 ("VVIP requirement created → All Management") exist only as seed rows in `NOTIFICATION_RULES`/`NOTIFICATIONS`; nothing fires them at runtime.
### Impact
A VVIP client's requirement enters the pipeline unbadged, loses VVIP-first sorting everywhere, and Management is never alerted. The only way to get VVIP set is a later manager override (SM-03), which is audit-logged as an override of something the SPOC never had the chance to set. Manager also receives no in-app signal that a TT/NPD landed in their queue.
### Clarification Required
1. Should a requirement raised against a VVIP account auto-inherit `vvip: true`, or is VVIP strictly a per-requirement manager decision?
2. Are NR-01/NR-02 expected to fire at creation in this prototype, or is the seeded feed considered sufficient for demo purposes?
3. If VVIP is manager-only, should the SPOC at least see "VVIP account" context at intake?
### Blocking Level
High

---

### Observation
New-client gating contradicts itself across three places. `LAB_FLOW.md` (§1, and `seedTimelines()` in `data.jsx` line 444: `gated = … || r.clientKind === "new" || TT/NPD`) and `lifecyclePhases()` in `screen-spoc.jsx` (line 763) both treat **new client** as manager-gated. But `submitRequirement()` computes `status = (gateLocked || flagManager) ? "Pending review" : "Logged"` where `gateLocked` is only TT/NPD — a new-client EPD/REN goes straight to "Logged" (lab incoming). The intake form even says: "EPD / REN go straight to the lab even for new clients — flag to your manager below if you want a review first."
### Impact
A brand never seen before can reach the lab bench with zero manager visibility, while the progress stepper for that same requirement **displays a "Manager review" phase that never happened** (lifecyclePhases adds the phase for `clientKind === "new"`). Reports on "gated" requirements will disagree with the timeline.
### Clarification Required
1. Is the manager gate mandatory for new clients (per LAB_FLOW §1 routing and the timeline generator) or optional (per the intake copy)?
2. If optional, should `lifecyclePhases()` stop rendering a Manager review phase for ungated new-client requirements?
### Blocking Level
High

---

### Observation
Target sample date is never captured at intake. Seed requirements all carry `targetSampleDate` (e.g. "20 Jul 2026"), but `submitRequirement()` hardcodes `targetSampleDate: "TBD"` and the form has no field for it. Similarly `briefDetail.region` is hardcoded `"India"`.
### Impact
The lab evaluates and commits a date with no client-side target to compare against; SLA/TAT and the Master Tracker show "TBD" for every runtime-created record; the Market Intelligence geography report can never be driven by real data because region is constant.
### Clarification Required
1. Is "target sample date" a mandatory intake field (client expectation) or is the lab's committed date the only date that matters?
2. Should region be captured per requirement (it drives MG-03 geography reporting) or per account?
### Blocking Level
Medium

---

### Observation
`canSubmit` requires only: 5 lab-handoff fields + category + project type + brand. Actives, product family, base, budgets, concerns and claims are all optional, and there is no duplicate check between Non-negotiable and Good-to-have rows (the same ingredient can appear in both with different concentrations). Concentration accepts any free text.
### Impact
The lab can receive a brief with zero actives and no base, yet the evaluation screen pre-fills availability from `req.aiCode` matched formulation actives — i.e., from a guess. Conflicting non-negotiable vs good-to-have entries for the same ingredient produce an ambiguous brief.
### Clarification Required
1. What is the minimum viable brief — should at least one active or a description be mandatory?
2. Should the form block the same ingredient appearing in both actives lists?
3. Is budget (RM/PM/FG) mandatory before a brief can reach the lab, given the lab's decline reason in seed data is budget-driven?
### Blocking Level
Medium

---

### Observation
Drafts (`NaturisDrafts`) use a single fixed localStorage key (`naturis.draft.intake`). Saving a draft silently overwrites any previous draft; the draft is browser-wide, not per-user/per-role.
### Impact
A SPOC working two briefs loses the first the moment they save the second, with no warning. In the role-switching demo, a draft saved as Hardik resurfaces for any persona that opens SP-02.
### Clarification Required
1. Is one draft slot acceptable for v1, or should drafts be a list (per user)?
2. Should "Save draft" warn when it will overwrite an existing draft?
### Blocking Level
Low

---

### Observation
The displayed "Reference ID · auto-generated" uses `peekId()` at form-mount, but the real ID is assigned by `nextId()` at submit. Any requirement created in between (another tab, another persona in the same session) shifts the sequence. Intake section numbering also jumps 9 → 11 (no section 10), and section numbers are passed as prop `n` but `IntakeSection` never renders them.
### Impact
The ID the SPOC may have quoted to a client can differ from the submitted ID. Section numbering inconsistency is cosmetic but visible in QA walkthroughs.
### Clarification Required
1. Is the reference ID promise ("auto-generated") meant to be a reservation, or just a preview that can change?
### Blocking Level
Low

---

## 2. Manager review (SM-01/02/03, data.jsx)

### Observation
"Returned to SPOC" is a dead-end state for the SPOC. The manager can return a requirement (SM-02 `decide("Returned")` or SM-03 `commitDecision("Returned to SPOC")`), but in SP-04 `SpocActionCard` there is **no branch for `status === "Returned to SPOC"`** — the SPOC sees the requirement under the "Pending manager review" tab with no action to revise or resubmit. Furthermore, runtime returns never set `returnNote` (only seed data has it), and the SM-03 decision note is written only to the audit log, which the SPOC cannot see (audit is Admin-only nav).
### Impact
Confirmed broken journey: every runtime return strands the requirement permanently with the SPOC, and the SPOC may never learn *why* it was returned (no notification is generated either). The seed record REQ-2026-0429 demonstrates the intended note (`returnNote`) but no runtime path produces it.
### Clarification Required
1. What is the intended SPOC flow after a return — edit the brief and resubmit (status → "Pending review"), or withdraw/cancel?
2. Should the manager's return reason be mandatory, and where should the SPOC see it (action card, notification, timeline)?
3. Should a return generate a notification to the submitting SPOC (seed N-105 implies yes)?
### Blocking Level
Critical

---

### Observation
The same manager decision has two implementations with different audit behaviour. SM-03 `commitDecision()` writes audit records (decision + type/VVIP overrides) before setting status. SM-02 quick actions (`decide()`) call only `setStatus()` — **no audit entry**, no override capture, no note. Also, SM-03's "Undo" button only does `setDecision(null)` (resets local UI) — the status change and the immutable audit entry already happened and are not reverted.
### Impact
Audit completeness depends on which screen the manager happened to use, undermining the "immutable audit for overrides" requirement. The fake Undo invites a manager to believe a decision was reverted when the requirement is already "Approved" in the lab's incoming queue.
### Clarification Required
1. Should SM-02 quick approve/return write the same audit entries as SM-03?
2. Is Undo meant to truly revert (status back to "Pending review" + compensating audit entry), or should the button be removed?
3. Is "Mark in discussion" supposed to persist anywhere? Currently it is local component state, lost on navigation, and the requirement stays "Pending review" with no record of the discussion.
### Blocking Level
High

---

### Observation
Manager decisions produce no notifications. `setStatus()` creates a timeline event only. Approve does not notify the SPOC or the lab desk; Return does not notify the SPOC; the VVIP toggle's caption says "Gold badge + notify Management" but committing it sends nothing.
### Impact
The SPOC discovers outcomes only by polling their list; the lab's awareness relies solely on the LB-02 queue badge. The promise printed in the UI ("notify Management") is unfulfilled — a confirmed copy/behaviour mismatch.
### Clarification Required
1. Which manager actions must notify whom (approve → SPOC + lab desk? return → SPOC? VVIP set → Management)?
2. Should these run through `NOTIFICATION_RULES` so Admin toggles in AD-08 actually govern behaviour?
### Blocking Level
High

---

### Observation
The SM-02 queue filter is `status === "Pending review" || (TT/NPD && status in ["Logged","R&D assessing"])`. Intake always routes TT/NPD to "Pending review", and nothing in the runtime produces "R&D assessing". The legacy "R&D assessing / R&D assessed / In assessment (RM/PM/Slot)" statuses also persist in `STATUS_FLOW`, `PRE_ACK`, `PHASE_OF`, `KanbanBoard`, and SM-01's `inLab` filter, though no code path sets them anymore.
### Impact
Dead filter branches make counts fragile: if any future path creates a Logged TT/NPD, it would sit simultaneously in the manager queue and the lab incoming queue (PRE_ACK includes "Logged"), allowing parallel approve + acknowledge on the same record.
### Clarification Required
1. Are R&D-assessment statuses formally retired (remove from STATUS_FLOW and filters), or planned for a future phase?
2. Can a requirement ever legitimately be in the manager queue and lab incoming at once? If not, which filter wins?
### Blocking Level
Medium

---

### Observation
Re-approval is not guarded. SM-03 renders the Decision card for any status; `overrideLocked` only disables the override card. A manager can open an already-"Approved" (or any post-ack) requirement via deep links and commit "Approved" again — re-running audit + setStatus and resetting the status of an in-flight record (e.g. from "Trial" back to "Approved").
### Impact
Invalid state transition not blocked: an in-lab requirement can be knocked back to "Approved", corrupting stage filters, SLA phase and lab queues; the timeline records a confusing second approval.
### Clarification Required
1. Should the Decision panel render only for "Pending review" (and possibly "Logged")?
2. If late returns are a real need ("pull it back from the lab"), what is the sanctioned mechanism and does it require lab acknowledgement?
### Blocking Level
High

---

### Observation
`ClientIntelMini` (SM-03) and MG-03's client suite match accounts by `a.name === req.brand`. Intake explicitly supports a brand different from the umbrella company (`form.brand` vs `form.existingAcct`/`company`), and stores `account` separately.
### Impact
A requirement for a new brand under an existing CRM account shows "No intelligence yet for {brand}" even though the account exists; client-suite report metrics silently exclude such requirements.
### Clarification Required
1. Should intelligence lookups resolve via `req.account` → ACCOUNTS, falling back to brand?
2. Is "brand" or "account" the canonical reporting dimension?
### Blocking Level
Medium

---

### Observation
SM-04/SM-06 contain orphaned and fictional elements: the "Assign" / "Self-assign" buttons in the "Other live requirements" tab have no onClick; SM-06's bar chart lists SPOC "Aarav" who does not exist in `ADMIN_USERS` (SPOCs are Hardik Shah and Divya Rao); SLA%, escalations and TAT figures are hardcoded.
### Impact
Buttons that do nothing in a flow named "needs an owner" suggest assignment exists when it doesn't; a non-existent person in a team report will be caught immediately in stakeholder demos.
### Clarification Required
1. Is tracker/ownership assignment in scope for the Sales Manager (the `ownership: "unassigned"` field exists on requirements)? Who can assign whom?
2. Should hardcoded report data at least be derived from the live store like SM-04's scoreboard is?
### Blocking Level
Medium

---

## 3. Lab flow (LB-01/02/EVAL/03, data.jsx)

### Observation
Opening LB-EVAL silently mutates state. The `useEffect` in `LB_Eval` calls `startEvaluation()` whenever the selected requirement is "Acknowledged" — including the **default auto-selection of the first tile** on page load. Status flips to "In evaluation" and a timeline event "Lab evaluation started" is logged with no user action.
### Impact
Merely visiting the Evaluation tab advances every first-listed requirement's state and pollutes the timeline/audit trail with events the technician never intended. SLA phase reporting ("rd") starts its clock on a passive page view.
### Clarification Required
1. Should evaluation start require an explicit "Begin evaluation" action (LAB_FLOW §3.2 names the trigger "Begin evaluation")?
2. Is "In evaluation" meaningful as a status if it can be entered by navigation alone?
### Blocking Level
Medium

---

### Observation
The decision panel enforces no evaluation completeness. `accept()` can be called with RM/PM still "unset", no slot selected, and availability untouched; the date input has no min (past dates accepted). LAB_FLOW §3.2 AC says "decision panel enabled once started" — in code it is always enabled, even before evaluation fields are touched.
### Impact
"Accepted — date committed" records can exist with an empty evaluation object and a committed date in the past, which downstream surfaces (LM-04 "RM procurement" counts, tracker, SLA) treat as authoritative.
### Clarification Required
1. Must RM, PM and slot be answered before Accept is allowed? Is ingredient availability also mandatory?
2. Should the committed date be restricted (≥ today, ≤ some horizon) and validated against the slot selection?
3. Can a technician accept while an ingredient is marked "short" (REQ-2026-0401 seed shows jar "short" but accepted) — is that a warning or a block?
### Blocking Level
High

---

### Observation
The "Formulation" bench stage is skipped at runtime. `WipDetail.advance()` maps status "Accepted — date committed" to `stageIdx 0` and advances to `STAGE_STATUS[1]` = "Trial". The status "Formulation" is only ever set by seed data or `newIteration()`. The displayed stepper labels also differ from statuses ("Formulation sheet"/"Ready" vs "Formulation"/"Ready for dispatch").
### Impact
Confirmed: a normally accepted requirement's timeline goes Accepted → Trial, never recording Formulation. Stage-based reports (LM-02 buckets, SM-LIVE "In lab") undercount Formulation; the LAB_FLOW §2 status model (`Formulation → Trial → QC → Fill`) is violated for every first pass.
### Clarification Required
1. Should "Advance" from Accepted first move to "Formulation" (5 advances total), or is Accepted considered equivalent to Formulation (then why does `newIteration` set "Formulation")?
### Blocking Level
High

---

### Observation
Actor attribution is hardcoded to one technician. `ME_LAB = "Sumit Choudhary"` signs acknowledgements (LB-01 path), evaluations, accept/decline/query, bench advances, dispatch, stability and deliverables — regardless of the desk routing (`LAB_DESKS`: TT → Tariq Khan, REN → Meera Iyer, NPD → Arjun Nair) that LB-02 headers proudly display. LB-02's acknowledge button does use `desk.tech`, so the same action has two different actor sources. Two more misattributions: SP-04's "Request iteration" (a SPOC action) records `newIteration(…, "Sumit Choudhary")`, and the "Close & archive" button in `PostApproval` passes `DL.LAB_MANAGER` ("Dipti OV") even when a lab technician clicks it.
### Impact
The timeline — described as "the operational audit trail (append-only)" — systematically records the wrong person. Per-tech productivity reports (LM-04) are computed by desk, not by recorded actor, masking the inconsistency until someone cross-checks a timeline.
### Clarification Required
1. Should the acting persona (current role's person) sign every event, with desk routing only determining queue ownership?
2. Is closing/archiving reserved for the Lab Manager (LAB_FLOW §1 says LM closes) — and if so, why is the button rendered in the technician's LB-03?
### Blocking Level
High

---

### Observation
Post-approval actions are available before the client approves. `POST = ["Sent to client", "Client approved", "In stability", "Archived"]`, and `WipDetail` renders `PostApproval` (titled "After client approval — …") whenever the status is in `POST` — including "Sent to client". The lab can start a 3/6-month stability cycle and submit deliverables while the client is still evaluating the sample. Conversely, the type defaults (EPD off, REN prompt, defer-until-PO from LAB_FLOW §3.6) are not enforced: every type gets the same two start buttons.
### Impact
Invalid transition not blocked: stability resources can be committed on a sample the client later rejects/iterates; "In stability" then conflicts with the iteration loop (newIteration would yank it back to Formulation mid-cycle, see next finding). The EPD default-off rule combined with the archive gate creates a separate dead end (see Stability section).
### Clarification Required
1. Should stability/deliverables be gated on `status === "Client approved"` only?
2. How are the per-type stability defaults (EPD off, NPD on, REN prompt, defer-until-PO) supposed to manifest in the UI?
### Blocking Level
High

---

### Observation
The "Iteration" button in `WipDetail` is unguarded: it is rendered for every WIP/post status (including "Dispatch awaiting SPOC approval", "In stability", and even "Archived" when deep-linked), always with the hardcoded delta "Reformulated per client feedback", and `newIteration()` immediately resets status to "Formulation". There is no confirm step, so a double click creates two iterations (NCL codes increment twice).
### Impact
A stray click on an archived or in-stability project reopens it onto the bench, supersedes the locked NCL, and increments the iteration count — with no audit/severity trail beyond a timeline entry attributed to Sumit. The client-feedback loop defined in LAB_FLOW §3.7 (Client → SPOC → Lab) is bypassed because the lab can self-iterate at any time.
### Clarification Required
1. Which statuses legitimately allow a new iteration, and who can trigger it (SPOC on client feedback only, or lab too)?
2. Should iteration require a mandatory delta note and a confirmation, and should iterating an archived/locked code be blocked outright?
### Blocking Level
Critical

---

### Observation
Multiple open queries are mishandled. `raiseQuery()` supports sequential queries (LAB_FLOW §3.3 edge case), but the SPOC's `SpocActionCard` answers only `openQ[0]` with a single textarea, and `resolveQuery()` flips status back to "Acknowledged" the moment **one** query is answered — any remaining open queries strand on a requirement whose status no longer says "Query raised".
### Impact
Open-query counts (LB-01 stat, LM-01 tile, MG-03 Critical suite, labmgr badge) keep counting the stranded queries while the SPOC's action card disappears (it renders only for `status === "Query raised"`), leaving no UI to answer them.
### Clarification Required
1. Should status return to the lab only when **all** open queries are resolved?
2. Should the SPOC action card list and answer each open query individually?
### Blocking Level
High

---

### Observation
Dispatch has data gaps and a dead end. The runtime `dispatch()` payload never captures a docket/courier number (seed data has dockets; MG-04 fabricates `"DTDC-88" + index` for sent rows). The address check is binary — if `briefDetail.shipping` is missing the send button is disabled and **no screen offers a way to add the address afterwards**. Photos are simulated clicks with no removal control.
### Impact
The Master Tracker's "Docket No." column — explicitly an Excel-replacement column — can never carry a real value for runtime dispatches; an intake that somehow lacks a shipping address (it is required at SP-02, but old/imported data may lack it) is permanently undeliverable.
### Clarification Required
1. Where is the docket number entered — at "Mark dispatched", or by the SPOC at "Approve & send" after physically shipping?
2. Should the lab (or SPOC) be able to add/correct the shipping address on a requirement post-intake, with the change logged?
### Blocking Level
Medium

---

### Observation
Small confirmed UI bugs in lab screens: (a) LB-03 tile uses `req && req.committedDate` instead of `r.committedDate` — committed dates never show on tiles (the variable `req` is null in list view); (b) LB-05 "Approved projects" lists only `Archived` records and its `ReqTable` is wired `onOpen={() => {}}` — rows are styled clickable but do nothing; (c) LB-01's "Work in progress" stat uses `WIP` (excludes Acknowledged/In evaluation) while LB-03's "All" tab includes them, so the dashboard number and the destination list disagree.
### Impact
Misleading affordances and inconsistent counts erode trust in the numbers during review demos.
### Clarification Required
1. Should archived projects open a read-only detail (timeline & brief)?
2. What is the canonical definition of "work in progress" — accepted onwards, or acknowledged onwards?
3. Is "Approved projects" the right label for an archive of *closed* projects?
### Blocking Level
Low

---

## 4. Dispatch & client loop (SP-04, data.jsx)

### Observation
SPOC dispatch approval bypasses the ownership transfer. SP-04's "Approve & send to client" calls `advanceStage(req.id, "Sent to client", "Hardik Shah")` — a generic status setter. The dedicated `sendToClient()` store method (which sets `owner = "Sales SPOC"` and writes the "Ownership with Sales" handoff event) exists but is never called from any screen. `transferOwnership()` is similarly never called by any UI.
### Impact
Confirmed violation of the LAB_FLOW §1 ownership rule ("Lab → Sales SPOC on … Sent to client"): after a runtime dispatch approval, `req.owner` stays "Lab", so the lab dashboard's `owner` display, the SM-04 ownership board, and any "who holds this" logic are wrong from that point onwards. There is also no notification to the lab that their dispatch was approved.
### Clarification Required
1. Should the SP-04 button call `sendToClient()` (confirmed available) instead of `advanceStage()`?
2. Are there other ownership transfer points (Accept, Decline, Query) that should use `transferOwnership()` for a consistent handoff trail? (`accept`/`decline`/`raiseQuery` set `r.owner` directly without the handoff timeline event.)
### Blocking Level
Critical

---

### Observation
"Rejected" is a dead-end status. `clientOutcome(id, "rejected")` sets status "Rejected", which (a) is absent from `PHASE_OF` (slaStatus silently defaults its phase to "lab" and keeps burning lab SLA), (b) is absent from the lab's `WIP_ALL` so the project vanishes from every lab queue, (c) has no branch in `SpocActionCard`, so the SPOC sees no next action — no iterate, no close, no archive. It appears only in passive lists (SP-03 "sent" tab, SM-LIVE "sent / done").
### Impact
Confirmed broken journey: a client rejection orphans the record forever. The iteration loop ("client approves/rejects (iteration loop)") cannot be entered from "Rejected" because the iteration button on SP-04 renders only when `status === "Sent to client"`.
### Clarification Required
1. After a rejection, what are the sanctioned outcomes — iterate (back to Formulation), renegotiate (back to SPOC/manager), or close/archive as lost?
2. Should "Rejected" stop SLA clocks, and should it notify the lab and manager?
3. Is a "closed — lost" terminal status missing from the model? (Archive currently requires stability passed + both deliverables, which a rejected project will never have.)
### Blocking Level
Critical

---

### Observation
The Communication log diverges from the timeline. `CommLog` seeds local component state from `COMM_LOGS[reqId]` and appends new entries **only to local state** (plus a timeline event). `COMM_LOGS` itself is never updated and is not persisted.
### Impact
A note added in SP-04 disappears from the Communication log card on navigation (it survives only as a timeline event in a different format). Two "sources of truth" for client communication contradict the product's own "no parallel WhatsApp truth" pitch.
### Clarification Required
1. Should communications persist on the requirement (e.g. `req.comms[]`) and into localStorage like everything else?
2. Are milestones (e.g. "Brief confirmed", "Sample delivered") user-selectable when logging? Seed data has them; the input UI doesn't.
### Blocking Level
Medium

---

### Observation
`RequirementPopup` (used by lab "Open timeline", intake success "View requirement", and FullBriefButton everywhere) renders flags with `f.reason` / `f.note` / `f.at` and queries with `q.q` / `q.a` — but the actual data model uses `f.typeLabel`/`f.text`/`f.raisedAt` and `q.text`/`q.answer`.
### Impact
Confirmed rendering bug: in the popup's "Timeline & history" tab, open flags show as blank rows and queries render an empty title with only the open/answered pill — reviewers (lab deciding whether to acknowledge, managers) see flags/queries with no content.
### Clarification Required
1. Confirm the canonical field names so the popup can be aligned (`text`/`answer`/`raisedAt`)?
### Blocking Level
High

---

## 5. Flags

### Observation
There are two unconnected flag taxonomies. `data.jsx FLAG_TYPES` defines 12 codes with `roles` (who may raise) and `defaultNotify` routing; the actual UI (`RaiseFlagDrawer.FLAG_OPTIONS`) uses 8 different codes (formulation, commercial, sensory, coverage, packaging, unresponsive, client_unresp, other) with hardcoded owners including "PM / Procurement" — a role that does not exist in the system. `FLAG_TYPES.roles` and `defaultNotify` are never read anywhere; `FLAG_TYPE_COLOR` is keyed by the 12 unused codes, so every runtime-raised flag falls back to grey in SM-05.
### Impact
Flag routing ("Flags route to owners") is decorative: every flag, regardless of its labelled owner, lands only in the Sales Manager's SM-05 list (the Lab Manager has **no flag screen at all**, despite owning quality/material/capacity flags in FLAG_TYPES and being the owner on the seed F-202 material flag). Colour-coding and per-type notify rules silently never apply.
### Clarification Required
1. Which taxonomy is canonical — the 12-type config or the 8-option drawer?
2. Where does a "Lab Manager"-owned flag surface for Dipti? Is an LM flag queue missing from scope?
3. Should `defaultNotify` actually drive who gets the notification when a flag is raised?
### Blocking Level
Critical

---

### Observation
Flag severity can never be set, and the resolution loop can be bypassed. LAB_FLOW §1 says the Sales Manager "sets flag severity"; the store method `setSeverity()` exists but **no screen calls it** — every runtime flag stays `severity: "unset"` forever (severity badges render only when ≠ unset). Separately, the defined loop is raise → manager `resolveFlag()` (solution, `resolvedPending`) → SPOC `confirmResolve()`. But `WipDetail` gives the lab a one-click "Resolve" that calls `confirmResolve()` directly with no solution and no SPOC involvement; `RaiseFlagDrawer`'s footer copy claims "Routed to your Sales Manager… you mark it resolved once satisfied" even when the chosen owner is Lab Technician or PM/Procurement, and even when the raising role is the lab.
### Impact
Severity-driven behaviour (NR-05 "Flag raised (high)" notifications, severity pills, escalation logic) is dead on arrival; the three-step accountability loop can be silently short-circuited by the lab on any flag, including ones the SPOC raised about the lab.
### Clarification Required
1. Where does the manager set severity — SM-05 cards, SM-03, or at solution time?
2. May the lab self-resolve flags it raised (e.g. sensory fixed in next iteration, like seed F-204), and if so, does that still require the raiser's confirmation?
3. Should `addFlag` honour `FLAG_TYPES.roles` so a role can only raise flags it is allowed to?
### Blocking Level
Critical

---

### Observation
Manager nav badge math doesn't match any visible list. `attentionCount("manager")` = (count of requirements Pending review) + (count of requirements with ≥ 1 unresolved flag), while the SM-02 tab tiles show (pending requirements) and (count of flag *instances*). A requirement with two open flags counts once in the badge but twice in the flags tab.
### Impact
The sidebar badge, the tab tile counts and the SM-01 stats can all show different numbers simultaneously — a classic demo question with no good answer.
### Clarification Required
1. Should badges count actionable items (flag instances + pending reviews) consistently across badge, tiles and dashboard?
### Blocking Level
Low

---

## 6. Stability & deliverables

### Observation
The archive gate makes EPD projects unclosable without stability. `PostApproval` shows "Close & archive" only when `stab.status === "passed"` **and** both deliverables are done. But the stated default for EPD is stability OFF. An EPD project whose client approved and whose deliverables are submitted can never be archived unless the lab runs a stability cycle it isn't supposed to need. (Seed archived REQ-2026-0312 only closes because it has a passed stability record.)
### Impact
Confirmed dead end for the most common project type: EPD records accumulate in "Client approved" forever, polluting live counts and SLA views.
### Clarification Required
1. Should the archive gate be "stability passed **or** stability not required for this type/decision"?
2. Who records the decision to skip/defer stability (the LAB_FLOW "defer-until-PO" case), and is it audit-worthy?
### Blocking Level
High

---

### Observation
`advanceStability()` notifications are emitted under rule "NR-03" (SLA breach) with type "sla"; the monthly update is also supposed to be "mirrored to SPOC" but the global feed has no per-recipient routing at all (see Notifications). Also, "Log next month" can be clicked repeatedly in a demo (no time gating), instantly "passing" a 6-month study.
### Impact
Stability updates masquerade as SLA alerts in any rule-based filtering; the simulated month counter is fine for a prototype (LAB_FLOW A3 admits simulation) but unconstrained clicking produces nonsense timelines.
### Clarification Required
1. Should a dedicated rule (e.g. NR-08 "Stability update") exist rather than reusing NR-03?
2. Is any minimal pacing/confirmation wanted on "Log next month" for demo credibility?
### Blocking Level
Low

---

## 7. Notifications

### Observation
Notifications are global, untargeted, and can never be marked read. One `NOTIFICATIONS` array is shown identically to every role (SPOC dashboard card, bell drawer, Admin GL-01). Clicking a notification opens the requirement but never sets `read = true`; GL-01's "Mark all read" button has no handler. The `notify` lists on `NOTIFICATION_RULES`, `FLAG_TYPES.defaultNotify`, and AD-07's per-account routing (≤ 5 users) are all display-only — nothing filters the feed by recipient. AD-08 rule toggles mutate local component state only.
### Impact
Confirmed module-connectivity gap: the unread badge (top bar + admin nav) monotonically increases for the life of the localStorage state; every role sees alerts addressed to other roles (a SPOC sees "Dispatch awaiting your approval" for another SPOC's requirement; Management-only VVIP alerts are visible to all); disabling a rule in Admin changes nothing.
### Clarification Required
1. Is per-role (or per-user) notification targeting in scope for this prototype, or is a single feed acceptable if clearly labelled?
2. Should click and "Mark all read" set `read` (and persist)?
3. Are AD-08 toggles expected to gate runtime `_notify` calls?
### Blocking Level
Critical

---

### Observation
Most runtime actions emit no notification at all. Confirmed emitters: addFlag, accept, decline, raiseQuery, resolveQuery, dispatch, advanceStability, acceptCommit (dead method). Confirmed silent: requirement creation (incl. VVIP/NPD/TT), manager approve/return, send-to-client, client approved/rejected, iteration requested, deliverables submitted, close/archive, SLA breaches and aging (no runtime engine ever evaluates NR-03/aging — breaches exist only as seeded rows).
### Impact
The notification feed reflects seed fiction more than live activity; "does action X update notifications?" fails for roughly half of the lifecycle.
### Clarification Required
1. Please confirm the canonical event → notify matrix (the NR table is a good start, but NR-01/02/03 have no runtime triggers).
2. Should an SLA engine (recompute `slaStatus` on bump and emit NR-03 once per breach) be part of this prototype?
### Blocking Level
High

---

### Observation
The bell drawer's deep link routes by role: lab/labmgr → LB-03, manager → SM-03, **everyone else (mgmt, admin, spoc) → SP-04**. SP-04 renders SPOC action buttons (Approve & send, flag raising, client outcome buttons) for whichever role arrived.
### Impact
Management — explicitly "read-only, no action buttons" per screen-mgmt.jsx's own header comment — can approve dispatches and record client outcomes via a notification click. Same for Admin. Role permission leak, confirmed by code path.
### Clarification Required
1. What should mgmt/admin see when opening a requirement from a notification — a read-only popup (RequirementPopup) instead of SP-04?
2. More generally, should SP-04 gate its action buttons on `role === "spoc"`? (`SP04_Detail` receives `role` but only forwards it to the flag drawer.)
### Blocking Level
High

---

## 8. Audit & permissions

### Observation
Audit coverage is partial and inconsistent with the stated rule ("Immutable audit for overrides… manager overrides recorded immutably"). Audited: SM-03 decisions/overrides, fit-score edits, CI edits. Not audited: SM-02 quick decisions, lab accept/decline/query (decline is arguably an override of a SPOC expectation), dispatch approval, iteration creation, stability skip, close/archive, ownership changes, severity (unsettable), Lab-Manager interventions (LM-02's "click a card to intervene" just opens LB-03 where actions are signed as the technician — no LM override trail exists at all despite LAB_FLOW §1 "intervene/override (audit-logged)").
### Impact
The Lab Manager's defining capability (audited override) does not exist in the build; the audit log will not withstand the "show me every override" question it is designed for.
### Clarification Required
1. Exactly which actions are "overrides" requiring AUDIT entries vs. ordinary timeline events?
2. What does a Lab Manager intervention look like concretely (reassign desk? force-advance stage? override a decline?) — none of these actions exist as buttons today.
### Blocking Level
High

---

### Observation
RBAC is display-only and contradicts the flow spec. The AD-05 matrix chips toggle nothing (only a `dirty` flag; Save/Discard reset it); no screen consults `GROUPS.perms` at runtime — the persona switch grants full screen access per the NAV map alone. Notably, group `G-LAB` (technicians) **lacks the `lab.accept` permission** (only G-LABMGR has it), while the implemented flow and LAB_FLOW A1 have the technician performing Accept/Decline.
### Impact
The seeded permission model says technicians can't accept; the working UI says they do. Whichever is true, one artifact is wrong, and the Admin "Groups & access" screen implies enforceable control that does not exist.
### Clarification Required
1. Is decision authority with the Lab Technician (A1) or the Lab Manager (the G-LAB/G-LABMGR perms)? Please reconcile the GROUPS seed.
2. Is runtime permission enforcement in scope for the prototype, or should AD-05 be labelled as design-preview?
### Blocking Level
Medium

---

### Observation
Dead store methods reveal an unresolved model change: `acceptCommit()` and `sendBack()` (lab-meeting era — "Accepted at lab meeting", "Returned — needs revision") are never called by any screen, yet "Returned — needs revision" still lives in `PHASE_OF` and `lifecyclePhases`, and `acknowledge()` still logs "Lab acknowledged — awaiting lab meeting."
### Impact
Stale copy ("awaiting lab meeting") contradicts LAB_FLOW A1 (lab meeting superseded; tech decides); orphan statuses confuse anyone mapping the state machine.
### Clarification Required
1. Confirm the lab-meeting accept gate is fully retired so the methods, status and copy can be removed/updated?
### Blocking Level
Low

---

## 9. Reports & tracker

### Observation
MG-04 Master Tracker fabricates operational columns. For "sent-ish" rows: docket = `"DTDC-88" + (4210 + i*7)`; PO/RM Ordered/RM Connectivity/Artwork/PM Status/Mfg Date/Dispatch By are derived from row index parity (`i % 3`, `i % 2`); cost falls back to ₹48; lastDate falls back to "2 Jun"; 6M projection = MOQ × 6. None of these have any input surface anywhere in the app.
### Impact
The screen explicitly positions itself as "replaces the Excel", but more than a third of its columns cannot ever reflect reality (no data entry path), and the fabricated values change when row order changes (vvipSort + filters), which sharp-eyed users will notice.
### Clarification Required
1. Which tracker columns are in scope to be *captured* in v1 (docket at dispatch? PO received by whom? artwork status?) versus explicitly deferred to the Phase-2 mini-ERP?
2. Should out-of-scope columns render as "—"/"Phase 2" instead of fabricated values?
3. Tracker is Management-only today; should Sales Manager / SPOC have (filtered) access, since the legacy Excel was the team's shared tool?
### Blocking Level
Medium

---

### Observation
Headline KPIs across report suites are hardcoded or pseudo-derived: MG-01 funnel (38/31/22/16/11), conversion 68%, delivery 18d; MG-02 per-brand mix from `charCodeAt`; MG-03 TAT suite entirely static; SP-09 all eight KPIs; SM-06 all values; LM-04 Avg TAT 14, slot utilisation 72%, per-tech TAT/on-time formulas `12+i*3`/`90-i*4`; LM-04's weekly/monthly toggle computes `mult` but never uses it (only bar labels change). Meanwhile `age`/`phaseDays` are static seed numbers that never advance — there is no clock, so even live-derived SLA/aging figures freeze for runtime-created records (always age 0, phase 0, "on track" forever).
### Impact
Reports look live (they re-render on store changes) but most numbers don't move when users act, and no SLA can ever breach for a record created in the demo. The "4 intelligence report suites" requirement is visually met but functionally hollow in places.
### Clarification Required
1. Which KPIs must be genuinely live-derived for the demo (suggest: counts, queries, declines, iterations, stuck list — already live) vs. acceptably illustrative?
2. Should a simulated clock (e.g. "advance day" dev control or date-diff from `submittedAt`) drive age/phaseDays so SLA states can change during a session?
### Blocking Level
Medium

---

## 10. Cross-module / state machine

### Observation
`STATUS_FLOW` (exposed "for steppers") omits statuses the app actually produces — "In evaluation", "Query raised", "Declined", "Returned to SPOC", "Client approved", "Rejected", "In stability" — while retaining retired ones ("R&D assessing/assessed", "In assessment (RM/PM/Slot)"). Different screens therefore define their own stage maps (SP-03 TAB_STATUS, SM LIVE_STAGE_STATUS, lab PRE_ACK/EVAL_ST/WIP, labmgr labBuckets, KanbanBoard, lifecyclePhases) — seven partially overlapping state machines.
### Impact
Each new status (e.g. "Rejected") must be added in seven places; misses are exactly what produced the dead ends above. There is no single authoritative transition table, so "invalid transitions not blocked" is structural: `setStatus`/`advanceStage` accept any string from anywhere.
### Clarification Required
1. Should a canonical status registry + allowed-transition map live in data.jsx, with screens deriving their filters from it?
2. Please confirm the full intended status list so retired ones can be deleted everywhere.
### Blocking Level
High

---

### Observation
Persistence has stale-state and concurrency traps. State (`naturis.state.v6`) restores the entire REQUIREMENTS array wholesale, so any later change to seed data in code is shadowed by old localStorage until manually cleared; `resetDemo()` exists in the store but **no UI invokes it** (only the console). Two open tabs each rewrite the whole state on every `_bump()` with no `storage` listener — last write silently wins, dropping the other tab's changes (the "simultaneous edits" edge case).
### Impact
Demo machines accumulate divergent states; QA repros become non-deterministic; multi-tab usage (common with a tracker + detail open) loses work invisibly.
### Clarification Required
1. Should a visible "Reset demo data" control exist (e.g. in the Tweaks panel)?
2. Is a seed-version stamp (invalidate stored state when seed changes) acceptable for the prototype?
3. Is multi-tab support a requirement, or should the second tab warn?
### Blocking Level
Medium

---

### Observation
SP-04 and SM-03 fall back to `REQUIREMENTS[0]` when `params.reqId` is missing or stale (e.g. a deep link to a record deleted by a state reset). `NaturisStore.log()` is also inconsistent about the `current` marker: `addFlag`, `setDeliverable` and `transferOwnership` push events without `current: true` after clearing all others, leaving timelines with no current event.
### Impact
A bad link silently shows the wrong requirement (high risk of acting on the wrong record — the action buttons are live); timelines intermittently lose their "current" highlight after flag/deliverable events.
### Clarification Required
1. Should an unknown reqId show a "not found" state instead of an arbitrary record?
### Blocking Level
Medium

---

### Observation
`PHASE_OF` maps "Logged" to the **manager** SLA phase, but for unflagged EPD/REN, "Logged" requirements sit in the lab's incoming queue (PRE_ACK includes "Logged") — the manager SLA budget burns while the work waits on the lab. Conversely "Approved" maps to "rd" before any lab acknowledgement.
### Impact
SLA breach attribution (manager vs lab) is wrong for the straight-to-lab path, which feeds SM-06/LM-04 adherence reporting and the breach lists.
### Clarification Required
1. For ungated requirements, should "Logged" count against the lab (rd) budget from the moment it lands in incoming?
### Blocking Level
Medium

---

## 11. UI consistency & terminology

### Observation
Status/label mismatches across roles: SP-03 tab "Lab acknowledged" includes pre-acknowledgement statuses (Logged, Approved); KanbanBoard column "In review" includes "Logged" (which for EPD is already with the lab); labmgr nav "Approved projects" (LB-05) shows Archived; LM-01 tiles deep-link "To acknowledge"/"In evaluation" to LB-02 which is not in the labmgr nav (content renders, sidebar shows no active item); decline flow button says "Revise & resend to manager" and sets status "Pending review" even for EPD/REN that never required a manager — and offers no actual brief revision before resending.
### Impact
Each is small, but together they make the same record appear under differently-named buckets per role, inviting "which number is right?" challenges. The decline-resend path also quietly converts an ungated EPD into a gated one.
### Clarification Required
1. After a lab decline, should the SPOC resend go to the manager always, or back to the lab for EPD/REN?
2. Should the SPOC be able to edit the brief (new NCL version) before resending? Currently nothing changes except the status.
3. Please confirm preferred labels for the tab/bucket names listed above.
### Blocking Level
Medium

---

### Observation
Assorted low-severity polish items (confirmed): login accepts any password (demo); "AI summarise" in CommLog just appends a suffix string to the typed text; the Donut centre shows total count even when segments are placeholder `|| 1` values (LM-04 by-type); `Funnel`/region tables hardcoded; GL-02 activity log is static; AD-04/AD-07/AD-08 Save/Add/Invite buttons do not persist; the SM-03 review screen offers no "Open requirement detail" path to SP-04-style info other than the popup (fine, noting for parity).
### Impact
Acceptable for a clickable prototype if stakeholders are told; risky if presented as functional.
### Clarification Required
1. Which admin CRUD operations (user invite, rule create, account recipient add) must actually mutate state for the demo script?
### Blocking Level
Low

---

# A. Consistency checklist — per major flow

Legend: ✓ implemented & consistent · ✗ missing/broken · ? partial or inconsistent (see findings)

| Flow | Entry point | Exit point(s) | Data stored | Permissions | Notifications | Audit/timeline | Error handling |
|---|---|---|---|---|---|---|---|
| Intake (SP-02) | ✓ dashboard CTA / list | ? "Logged" or "Pending review" (new-client gate contradiction) | ? req created; no targetSampleDate/region; vvip lost | ? SPOC-only by nav, not enforced | ✗ none fired (NR-01/02 dead) | ? timeline "created" only | ? 5-field check; weak content validation |
| Manager review (SM-02/03) | ✓ queue + detail | ✗ "Returned to SPOC" dead-ends; re-approve unguarded | ? returnNote never set at runtime | ? manager-only by nav | ✗ approve/return silent | ? audited in SM-03 only; fake Undo | ✗ no mandatory return reason |
| Lab acknowledge (LB-02) | ✓ desk-grouped incoming | ✓ "Acknowledged" | ✓ actor+time event | ? actor source inconsistent (desk vs Sumit) | ✗ none | ✓ timeline event | ✓ single action pre-ack |
| Evaluation & decision (LB-EVAL) | ? auto-starts on view | ✓ Accept / Decline / Query | ✓ req.evaluation persisted | ? G-LAB perms say no "accept" | ✓ accept/decline/query notify (untargeted) | ? timeline yes, audit no | ✗ accept with empty eval / past date allowed |
| Bench stages (LB-03) | ✓ from Accept | ? skips "Formulation"; iteration unguarded | ✓ status + NCL versions | ? labmgr acts as tech | ✗ stage advances silent | ✓ timeline per stage | ✗ no transition guard |
| Dispatch & SPOC approval | ✓ note+photo+address gate | ✗ owner not transferred on send | ? docket never captured | ? mgmt/admin can reach SP-04 actions | ✓ dispatch→SPOC (untargeted); ✗ approval→lab | ✓ drafted/sent events | ? address dead-end if missing |
| Client feedback & iteration | ✓ SP-04 action card | ✗ "Rejected" dead end; multi-query stranding | ? feedback text only in iteration delta | ✓ SPOC card | ✗ outcome silent | ? iteration actor wrong | ✗ approve allowed with empty feedback |
| Stability & deliverables | ? available pre-client-approval | ✗ EPD can never archive | ✓ stability/deliverables objects | ? close button actor forced to LM | ? stability under NR-03 only | ✓ timeline events | ✗ no pacing/type defaults |
| Flags | ✓ drawer (all roles) | ? lab can bypass confirm loop | ✓ flags[] on req | ✗ FLAG_TYPES.roles unenforced; no LM queue | ? always NR-05, untargeted | ? timeline yes; severity unsettable | ✗ owner routing decorative |
| Queries | ✓ DecisionPanel | ? resolves on first answer only | ✓ queries[] history | ✓ | ✓ raise/resolve (untargeted) | ✓ | ✗ multi-query stranding |
| Notifications | ✓ feed renders | ✗ never marked read | ✓ persisted | ✗ same feed for all roles | — | — | ✗ "Mark all read" orphaned |
| Audit | ✓ AD-09 immutable view | ✓ append-only | ✓ persisted, frozen rows | ✓ admin nav only | — | ? coverage partial (no LM/lab/quick-approve) | ✓ search |
| Reports & tracker | ✓ all suites render | — | ✗ many fabricated/hardcoded values | ? tracker mgmt-only | — | — | ? no clock → SLA frozen for new records |
| Admin / RBAC | ✓ screens render | — | ✗ edits don't persist | ✗ matrix display-only; G-LAB conflicts with flow | ✗ rule toggles inert | ✓ audit screen | — |

---

# B. Top 10 unresolved questions for the product owner (prioritised)

1. **Returned & Rejected journeys:** What are the sanctioned next actions for "Returned to SPOC" (revise/resubmit with mandatory reason visible to SPOC?) and "Rejected" (iterate / renegotiate / close-as-lost)? Both are confirmed dead ends today.
2. **Ownership transfer:** Should "Approve & send to client" use the existing `sendToClient()` (owner → Sales SPOC) — and should Accept/Decline/Query handoffs use `transferOwnership()` so every ownership change is a logged event, per LAB_FLOW §1?
3. **Flag model:** Which flag taxonomy is canonical (12-type config vs 8-option drawer)? Where do Lab-Manager-owned flags surface, who sets severity (no UI exists), and may the lab self-resolve without the raiser's confirmation?
4. **Notifications:** Is per-role targeting in scope, which lifecycle events must notify whom (creation, manager decision, send, client outcome, deliverables, close are all silent today), and should read-state and AD-08 toggles actually work?
5. **New-client gate:** Mandatory manager review for new clients (per LAB_FLOW + timeline generator) or optional (per intake copy)? The build currently does both, in different places.
6. **Iteration governance:** Who may create an iteration, from which statuses, with what mandatory inputs — and should iterating archived/in-stability/awaiting-approval records be blocked?
7. **Evaluation completeness:** Must RM/PM/slot/availability be answered before Accept, can the committed date be in the past, and can a tech accept while a non-negotiable ingredient is "short"?
8. **Archive gate for EPD:** Should "Close & archive" accept "stability not required" (EPD default-off, defer-until-PO) instead of demanding a passed cycle — and is closing reserved for the Lab Manager?
9. **Audit scope:** Which actions count as auditable overrides (SM-02 quick decisions? lab declines? LM interventions — which currently have no UI at all)? What does a Lab Manager "intervene/override" concretely look like?
10. **Tracker & reports honesty:** Which Master Tracker columns get real capture flows in v1 (docket, PO, artwork…) vs marked Phase-2, and which KPIs must be live-derived — including whether a simulated clock should drive age/SLA so anything can ever breach during a demo?

---

*End of review. All findings are phrased as questions for decision; nothing here prescribes a business rule. Confirmed behaviours cite the file and function observed; anything inferred is marked as assumed.*
