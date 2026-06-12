/* ============================================================
   screen-lab.jsx — Lab Technician (4 tabs)
   LB-01 Dashboard · LB-02 Incoming (acknowledge only) ·
   LB-EVAL Evaluation (acknowledged → evaluate → decide) ·
   LB-03 Work in progress (tab list → full view)
   ============================================================ */
window.SCREENS = window.SCREENS || {};
const DL = window.NaturisData;
const ME_LAB = "Sumit Choudhary";
const techOfReq = r => ((window.NaturisData.LAB_DESKS || {})[r.projectType] || {}).tech || ME_LAB;

const LAB_LIVE = ["Formulation", "Trial", "QC", "Fill", "Ready for dispatch", "Dispatch awaiting SPOC approval"];
const PRE_ACK = ["Approved", "R&D assessed", "R&D assessing", "Logged"];
const EVAL_ST = ["Acknowledged", "In evaluation"];
const DECIDED = ["Accepted — date committed", "Declined", "Query raised"];
const POST = ["Sent to client", "Client approved", "In stability", "Archived"];
const WIP = ["Accepted — date committed", ...LAB_LIVE, ...POST];
const TYPE_DESKS_LB = ["EPD", "REN", "TT", "NPD"];
const STAGE_STATUS = ["Formulation", "Trial", "QC", "Fill", "Ready for dispatch"];

/* ====================================================================
   LB-01 · DASHBOARD
   ==================================================================== */
function LB01_Dashboard({ nav }) {
  window.useStore();
  const reqs = DL.REQUIREMENTS;
  const needAck = window.vvipSort(reqs.filter(r => PRE_ACK.includes(r.status)));
  const inEval = reqs.filter(r => EVAL_ST.includes(r.status));
  const wip = reqs.filter(r => WIP.includes(r.status) && r.status !== "Archived");
  const inStab = reqs.filter(r => r.status === "In stability");
  const queries = reqs.filter(r => (r.queries || []).some(q => !q.resolved));

  return <div className="col gap-6">
    <div><div className="h1">Good morning, Sumit.</div><div className="body" style={{ color: "var(--muted)", marginTop: 4 }}>{needAck.length} to acknowledge · {inEval.length} to evaluate · {wip.length} in progress.</div></div>

    {/* 1 — METRICS ON TOP */}
    <div className="grid grid-4 gap-3">
      <Stat label="To acknowledge" value={needAck.length} attention={needAck.length > 0} sub="Seen & reviewed" onClick={() => nav("LB-02")} />
      <Stat label="To evaluate" value={inEval.length} attention={inEval.length > 0} sub="RM / PM / slot → decide" onClick={() => nav("LB-EVAL")} />
      <Stat label="Work in progress" value={wip.length} sub="Accepted → dispatch" onClick={() => nav("LB-03")} />
      <Stat label="Open queries" value={queries.length} attention={queries.length > 0} sub="Back with SPOC" onClick={() => nav("LB-EVAL")} />
      <Stat label="On the bench" value={reqs.filter(r => LAB_LIVE.includes(r.status)).length} sub="Formulation → ready" onClick={() => nav("LB-03")} />
      <Stat label="Awaiting dispatch" value={reqs.filter(r => ["Ready for dispatch", "Dispatch awaiting SPOC approval"].includes(r.status)).length} sub="Ready / sent" onClick={() => nav("LB-03")} />
      <Stat label="In stability" value={inStab.length} sub="3–6 mo cycle" onClick={() => nav("LB-03")} />
      <Stat label="Dispatched" value={reqs.filter(r => ["Sent to client", "Client approved"].includes(r.status)).length} sub="This week" onClick={() => nav("LB-03")} />
    </div>

    {/* 2 — ACKNOWLEDGEMENT (gradient header, no download icon) */}
    <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--sh-md)" }}>
      <div className="row between" style={{ padding: "16px 20px", background: "var(--grad-coral)" }}>
        <div className="row gap-2"><span className="h3" style={{ color: "#fff" }}>Needs your acknowledgement</span>
          {needAck.length > 0 && <span className="pill pill-sm" style={{ background: "rgba(255,255,255,.25)", color: "#fff" }}>{needAck.length}</span>}</div>
        <button className="btn btn-sm" style={{ background: "#fff", color: "var(--coral-dark)", fontWeight: 700 }} onClick={() => nav("LB-02")}>Open incoming</button>
      </div>
      <div className="col">
        {needAck.length ? needAck.slice(0, 5).map(r => <div key={r.id} className="row between clickable" style={{ padding: "13px 20px", borderTop: "1px solid var(--border)", cursor: "pointer" }} onClick={() => nav("LB-02")}>
          <div className="row gap-3">{r.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={r.projectType} /><span className="mono" style={{ fontSize: 12 }}>{r.id}</span><span style={{ fontWeight: 600 }}>{r.title}</span><span className="body-sm" style={{ fontSize: 12 }}>{r.brand}</span><StartDate req={r} /></div>
          <button className="btn btn-sm" onClick={e => { e.stopPropagation(); window.NaturisStore.acknowledge(r.id, techOfReq(r)); }}><Icon name="check" size={14} /> Acknowledge</button>
        </div>) : <div className="body-sm" style={{ padding: "20px", textAlign: "center" }}>All acknowledged — clear queue. 🎉</div>}
      </div>
    </div>

    <div className="card" style={{ padding: 0 }}>
      <div className="row between" style={{ padding: "16px 18px" }}><div className="h3">Work in progress</div><button className="btn btn-secondary btn-sm" onClick={() => nav("LB-03")}>Open</button></div>
      {wip.length ? <ReqTable rows={wip} onOpen={r => nav("LB-03", { reqId: r.id })} cols={["id", "brand", "title", "type", "code", "status"]} />
        : <div className="body-sm" style={{ padding: "16px 18px" }}>Nothing on the bench yet.</div>}
    </div>
  </div>;
}

/* ====================================================================
   shared: question / flag history
   ==================================================================== */
function QAHistory({ req }) {
  const qs = req.queries || [];
  const flags = req.flags || [];
  if (!qs.length && !flags.length) return <div className="body-sm" style={{ fontSize: 12 }}>No questions or flags raised yet.</div>;
  return <div className="col gap-2">
    {qs.map(q => <div key={q.id} style={{ padding: "8px 10px", borderRadius: 8, background: q.resolved ? "var(--approved-bg)" : "var(--review-bg)" }}>
      <div className="row gap-2"><Icon name="note" size={12} color={q.resolved ? "var(--approved-fg)" : "var(--review-fg)"} /><span className="body-sm" style={{ fontSize: 12, fontWeight: 600, color: q.resolved ? "var(--approved-fg)" : "var(--review-fg)" }}>Query · {q.resolved ? "resolved" : "open"}</span><span className="label" style={{ fontSize: 9 }}>{q.by} · {q.at}</span></div>
      <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{q.text}</div>
      {q.answer && <div className="body-sm" style={{ fontSize: 12, marginTop: 4, color: "var(--ink)" }}><b>Answer:</b> {q.answer}</div>}
    </div>)}
    {flags.map(f => <div key={f.id} style={{ padding: "8px 10px", borderRadius: 8, background: "var(--coral-wash)" }}>
      <div className="row gap-2"><Icon name="flag" size={12} color="var(--coral-dark)" /><span className="body-sm" style={{ fontSize: 12, fontWeight: 600, color: "var(--coral-dark)" }}>{f.typeLabel || f.type} · {f.resolved ? "resolved" : "open"}</span><span className="label" style={{ fontSize: 9 }}>{f.raisedBy}</span></div>
      <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{f.text}</div>
    </div>)}
  </div>;
}

/* ====================================================================
   LB-02 · INCOMING — acknowledge only (+ full brief + Q/flag history)
   ==================================================================== */
const PT_TINT = { EPD: "var(--pt-epd-bg)", REN: "var(--pt-ren-bg)", TT: "var(--pt-tt-bg)", NPD: "var(--pt-npd-bg)" };
const PT_INK = { EPD: "var(--pt-epd-fg)", REN: "var(--pt-ren-fg)", TT: "var(--pt-tt-fg)", NPD: "var(--pt-npd-fg)" };
function LB02_Incoming({ nav }) {
  window.useStore();
  const reqs = DL.REQUIREMENTS;
  const [popup, setPopup] = useState(null);
  const queue = window.vvipSort(reqs.filter(r => PRE_ACK.includes(r.status)));
  const Popup = window.RequirementPopup;
  return <div className="col gap-5">
    <PageHead title="New requirements" sub="Review the brief and the timeline, then acknowledge. Acknowledge = seen & reviewed, not acceptance — the accept / decline call happens in Evaluation." />
    {queue.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40 }}><Icon name="check" size={24} color="var(--approved-fg)" /><div className="h3" style={{ marginTop: 8 }}>Nothing new</div><div className="body-sm" style={{ marginTop: 4 }}>All caught up. 🎉</div></div>}
    {TYPE_DESKS_LB.map(t => { const items = queue.filter(r => r.projectType === t); if (!items.length) return null;
      const desk = DL.LAB_DESKS[t] || {};
      return <div key={t} className="card" style={{ padding: 0, overflow: "hidden", background: `linear-gradient(180deg, ${PT_TINT[t]} 0%, var(--surface) 140px)` }}>
        {/* one continuous desk section — type-tinted card, gradient header, rows inside */}
        <div className="row between" style={{ padding: "16px 20px", background: `linear-gradient(120deg, ${PT_TINT[t]} 0%, var(--surface) 72%)`, borderBottom: "1px solid var(--border)" }}>
          <div className="row gap-3">
            <span style={{ width: 42, height: 42, borderRadius: 12, background: PT_INK[t], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="incoming" size={20} color="#fff" /></span>
            <div>
              <div className="row gap-2"><span style={{ fontWeight: 800, fontSize: 15 }}>{t} desk</span><ProjectTypePill type={t} showLabel /></div>
              <div className="body-sm" style={{ fontSize: 12 }}>{desk.tech} · Lab Mgr {DL.LAB_MANAGER} looped in</div>
            </div>
          </div>
          <span className="pill" style={{ background: PT_INK[t], color: "#fff", fontWeight: 700 }}>{items.length} new</span>
        </div>
        {items.map((r, i) => <div key={r.id} className="row between" style={{ padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--border)" : "none", gap: 14, flexWrap: "wrap" }}>
          <div className="row gap-3" style={{ minWidth: 0, flex: 1 }}>
            <div style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: PT_INK[t], flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                {r.vvip && <VVIPBadge size="sm" />}
                <span className="mono" style={{ fontSize: 11.5, color: "var(--brand-mid)", fontWeight: 600 }}>{r.id}</span>
                <StartDate req={r} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 2 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
              <div className="body-sm" style={{ fontSize: 12 }}>SPOC {r.submittedBy} · {r.category}</div>
            </div>
          </div>
          <div className="row gap-2" style={{ flexShrink: 0 }}>
            <button className="btn btn-sm" style={{ background: "var(--grad-brand)" }} onClick={() => setPopup({ id: r.id, tab: "brief" })}><Icon name="note" size={13} /> View initial requirement</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setPopup({ id: r.id, tab: "timeline" })}><Icon name="history" size={13} /> Open timeline</button>
            <button className="btn btn-sm" style={{ background: "var(--approved-fg)", color: "#fff" }} onClick={() => window.NaturisStore.acknowledge(r.id, desk.tech || ME_LAB)}><Icon name="check" size={13} /> Acknowledge</button>
          </div>
        </div>)}
      </div>; })}
    {Popup && <Popup open={!!popup} onClose={() => setPopup(null)} reqId={popup && popup.id} tab={popup && popup.tab} />}
  </div>;
}

/* ====================================================================
   LB-EVAL · EVALUATION (master-detail, spacious)
   ==================================================================== */
function EvaluationPanel({ req }) {
  window.useStore();
  const ev = req.evaluation || { rm: "unset", pm: "unset", slot: "", availability: [] };
  const past = (DL.PAST_FORMULATIONS || []).find(p => p.code === req.aiCode);
  const briefIngs = [...(req.nonNegotiable || []), ...(req.goodToHave || [])].map(a => a.ingredient).filter(Boolean);
  const baseIngs = Array.from(new Set([...(past ? past.actives : []), ...briefIngs]));
  const avail = ev.availability && ev.availability.length ? ev.availability : baseIngs.map(n => ({ name: n, state: "available" }));
  const [newIng, setNewIng] = useState("");
  function set(patch) { window.NaturisStore.setEvaluation(req.id, patch); }
  function setAvail(i, state) { set({ availability: avail.map((x, j) => j === i ? { ...x, state } : x) }); }
  function addIng() { const n = newIng.trim(); if (!n) return; set({ availability: [...avail, { name: n, state: "available", manual: true }] }); setNewIng(""); }
  const YN = ({ val, onYes, onNo }) => <div className="row gap-1">
    {[["yes", "Required", "var(--coral)"], ["no", "Not needed", "var(--ok)"]].map(([v, l, c]) =>
      <button key={v} onClick={() => v === "yes" ? onYes() : onNo()} className="btn btn-sm" style={{ background: val === v ? c : "transparent", color: val === v ? "#fff" : "var(--muted)", border: val === v ? "none" : "1px solid var(--border)" }}>{l}</button>)}
  </div>;
  return <div className="card">
    <SectionTitle sub="Procurement, slot & availability — saved as you go">Lab evaluation</SectionTitle>
    <div className="grid grid-2 gap-3" style={{ marginBottom: 16 }}>
      <div className="row between" style={{ padding: "10px 12px", borderRadius: 8, background: "var(--page)" }}><span className="body-sm">RM procurement required?</span><YN val={ev.rm} onYes={() => set({ rm: "yes" })} onNo={() => set({ rm: "no" })} /></div>
      <div className="row between" style={{ padding: "10px 12px", borderRadius: 8, background: "var(--page)" }}><span className="body-sm">PM procurement required?</span><YN val={ev.pm} onYes={() => set({ pm: "yes" })} onNo={() => set({ pm: "no" })} /></div>
    </div>
    {/* slot allotment — 2-week station calendar */}
    <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", marginBottom: 16 }}>
      <LabStationCalendar value={ev.slotSel} onChange={sel => set({ slotSel: sel, slot: sel ? sel.label : "" })} />
    </div>
    <div className="label" style={{ marginBottom: 4 }}>Raw material / ingredient availability</div>
    {past && <div className="body-sm" style={{ fontSize: 11.5, marginBottom: 8 }}>Pre-filled from the selected formulation <b className="mono">{past.code}</b> ({past.name}) plus the brief's actives.</div>}
    <div className="col gap-2">
      {avail.map((a, i) => <div key={i} className="row between" style={{ padding: "8px 12px", borderRadius: 8, background: "var(--page)" }}>
        <span className="row gap-2"><span className="body-sm" style={{ fontSize: 13 }}>{a.name}</span>{a.manual && <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>added manually</span>}</span>
        <div className="row gap-1">{[["available", "Available", "var(--ok)"], ["short", "Not available", "var(--coral)"]].map(([v, l, c]) =>
          <button key={v} onClick={() => setAvail(i, v)} className="btn btn-sm" style={{ background: a.state === v ? c : "transparent", color: a.state === v ? "#fff" : "var(--muted)", border: a.state === v ? "none" : "1px solid var(--border)" }}>{l}</button>)}</div>
      </div>)}
    </div>
    <div className="row gap-2" style={{ marginTop: 10 }}>
      <input className="input" style={{ flex: 1 }} placeholder="Missing an ingredient? Add it manually…" value={newIng}
        onChange={e => setNewIng(e.target.value)} onKeyDown={e => e.key === "Enter" && addIng()} />
      <button className="btn btn-secondary" disabled={!newIng.trim()} onClick={addIng}><Icon name="plus" size={14} /> Add ingredient</button>
    </div>
  </div>;
}

function DecisionPanel({ req, nav }) {
  window.useStore();
  const [mode, setMode] = useState(null);
  const [date, setDate] = useState(""); const [reason, setReason] = useState(""); const [query, setQuery] = useState("");
  const ev = req.evaluation || {};
  const evalMissing = [
    [!ev.rm || ev.rm === "unset", "RM decision"],
    [!ev.pm || ev.pm === "unset", "PM decision"],
    [!ev.slot, "slot booking"],
  ].filter(([m]) => m).map(([, lbl]) => lbl);
  const todayStr = new Date().toISOString().slice(0, 10);
  const dateOk = date && date >= todayStr;
  return <div className="card">
    <SectionTitle sub="Accept with a date · Decline with a reason · Raise a query to the SPOC">Decision</SectionTitle>
    {!mode && <div className="row gap-2">
      <button className="btn" onClick={() => setMode("accept")}><Icon name="check" size={15} /> Accept</button>
      <button className="btn btn-destructive" onClick={() => setMode("decline")}><Icon name="x" size={15} /> Decline</button>
      <button className="btn btn-secondary" onClick={() => setMode("query")}><Icon name="note" size={15} /> Raise query</button>
    </div>}
    {mode === "accept" && <div className="col gap-2">
      <Field label="Tentative sample / completion date"><input className="input" type="date" min={todayStr} value={date} onChange={e => setDate(e.target.value)} /></Field>
      {evalMissing.length > 0 && <div className="body-sm" style={{ color: "var(--review-fg)", fontSize: 12 }}><Icon name="alert" size={12} color="var(--review-fg)" /> Complete the evaluation first — missing: {evalMissing.join(", ")}.</div>}
      {date && !dateOk && <div className="body-sm" style={{ color: "var(--coral)", fontSize: 12 }}>Date must be today or later.</div>}
      <div className="row gap-2"><button className="btn" disabled={!dateOk || evalMissing.length > 0} onClick={() => { window.NaturisStore.accept(req.id, date, techOfReq(req)); nav && nav("LB-03", { reqId: req.id }); }}><Icon name="check" size={15} /> Confirm accept → bench</button><button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Cancel</button></div>
    </div>}
    {mode === "decline" && <div className="col gap-2">
      <Field label="Decline reason (mandatory)"><textarea className="textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why can't the lab take this on?" style={{ minHeight: 70 }} /></Field>
      <div className="row gap-2">{window.ConfirmBtn ? <window.ConfirmBtn disabled={!reason.trim()} confirmLabel="Click again — decline this lead" onConfirm={() => window.NaturisStore.decline(req.id, reason.trim(), techOfReq(req))}>Confirm decline</window.ConfirmBtn> : <button className="btn btn-destructive" disabled={!reason.trim()} onClick={() => window.NaturisStore.decline(req.id, reason.trim(), techOfReq(req))}>Confirm decline</button>}<button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Cancel</button></div>
    </div>}
    {mode === "query" && <div className="col gap-2">
      <Field label="Query to Sales SPOC"><textarea className="textarea" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. 5% vitamin C not feasible in this base — confirm 3% or change base." style={{ minHeight: 70 }} /></Field>
      <div className="row gap-2"><button className="btn" disabled={!query.trim()} onClick={() => window.NaturisStore.raiseQuery(req.id, query.trim(), techOfReq(req))}><Icon name="note" size={15} /> Send query</button><button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Cancel</button></div>
    </div>}
  </div>;
}

function LB_Eval({ params, nav }) {
  window.useStore();
  const reqs = DL.REQUIREMENTS;
  const list = window.vvipSort(reqs.filter(r => EVAL_ST.includes(r.status)));
  const recent = window.vvipSort(reqs.filter(r => DECIDED.includes(r.status)));
  const [sel, setSel] = useState(params.reqId || (list[0] && list[0].id));
  const [briefOpen, setBriefOpen] = useState(false);
  const req = reqs.find(r => r.id === sel && EVAL_ST.includes(r.status)) || list[0];
  // the evaluation form shows by default — opening a lead silently moves it to "In evaluation"
  useEffect(() => { if (req && req.status === "Acknowledged") window.NaturisStore.startEvaluation(req.id, techOfReq(req)); }, [req && req.id, req && req.status]);
  const Popup = window.RequirementPopup;
  return <div className="col gap-5">
    <PageHead title="Evaluation" sub="Pick a requirement tile — the evaluation form (RM / PM / slot / availability) opens straight away, then take the decision." />
    {list.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40 }}><Icon name="check" size={24} color="var(--approved-fg)" /><div className="h3" style={{ marginTop: 8 }}>Nothing to evaluate</div><div className="body-sm" style={{ marginTop: 4 }}>Acknowledge items under New requirements and they'll appear here.</div></div>}
    {list.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(235px, 1fr))", gap: 10 }}>
      {list.map(r => { const on = req && r.id === req.id;
        return <button key={r.id} onClick={() => setSel(r.id)} style={{ textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "14px 16px", transition: "all .15s",
          border: on ? "none" : "1px solid var(--border)",
          background: on ? "var(--grad-brand)" : PT_TINT[r.projectType], color: on ? "#fff" : "var(--ink)",
          boxShadow: on ? "0 8px 20px rgba(18,57,95,.28)" : "var(--sh-sm)" }}>
          <div className="row gap-2">{r.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={r.projectType} /><span className="mono" style={{ fontSize: 10.5, opacity: .85 }}>{r.id.slice(-4)}</span></div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 6 }}><span style={{ opacity: .92 }}>{r.brand}</span> · {r.title}</div>
          <div style={{ fontSize: 11.5, opacity: .78, marginTop: 2 }}>{r.submittedBy}</div>
        </button>; })}
    </div>}
    {list.length > 0 && req && <div className="col gap-4">
      <div className="card">
        <div className="row between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div><div className="row gap-2" style={{ marginBottom: 6 }}>{req.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={req.projectType} showLabel /><span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{req.id}</span><StatusPill status={req.status} /></div>
            <div className="h2" style={{ fontSize: 22 }}><span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title}</div>
            <div className="body-sm">SPOC {req.submittedBy} · {(DL.LAB_DESKS[req.projectType] || {}).tech} desk</div></div>
          <button className="btn" style={{ background: "var(--grad-brand)", boxShadow: "0 4px 12px rgba(18,57,95,.25)" }} onClick={() => setBriefOpen(true)}><Icon name="note" size={15} /> View initial requirement</button>
        </div>
      </div>
      <EvaluationPanel req={req} />
      <DecisionPanel req={req} nav={nav} />
    </div>}
    {recent.length > 0 && <div className="card" style={{ padding: 8 }}>
      <div className="label" style={{ padding: "6px 8px" }}>Recently decided</div>
      {recent.slice(0, 6).map(r => <div key={r.id} className="row between" style={{ padding: "7px 8px" }}><span className="body-sm" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span><StatusPill status={r.status} size="sm" /></div>)}
    </div>}
    {Popup && <Popup open={briefOpen} onClose={() => setBriefOpen(false)} reqId={req && req.id} />}
  </div>;
}

/* ====================================================================
   LB-03 · WORK IN PROGRESS (tab list → full view)
   ==================================================================== */
function DispatchPanel({ req }) {
  const [photos, setPhotos] = useState([]); const [generated, setGenerated] = useState(false);
  const [note, setNote] = useState("");
  const [docket, setDocket] = useState("");
  const [mktBrief, setMktBrief] = useState(false);
  const [ingList, setIngList] = useState(false);
  const flow = req.status === "Sent to client" || POST.includes(req.status) ? "Sent" : req.status === "Dispatch awaiting SPOC approval" ? "Awaiting SPOC approval" : "Drafted";
  const steps = ["Drafted", "Awaiting SPOC approval", "Sent"];
  const addr = (req.briefDetail && req.briefDetail.shipping) ? "On file" : "";
  return <div className="card">
    <SectionTitle sub="Generated note + product photos → SPOC approval">Dispatch</SectionTitle>
    <div className="row gap-2" style={{ marginBottom: 16 }}>
      {steps.map((s, i) => <React.Fragment key={s}><span className="pill pill-sm" style={{ background: steps.indexOf(flow) >= i ? "var(--brand)" : "var(--brand-wash)", color: steps.indexOf(flow) >= i ? "#fff" : "var(--muted)" }}>{s}</span>{i < 2 && <Icon name="chevron" size={12} color="var(--border-strong)" />}</React.Fragment>)}
    </div>
    <div className="grid grid-2 gap-3" style={{ marginBottom: 14 }}>
      {[["Client", req.brand], ["Product", req.title], ["Packaging", req.packaging], ["Qty", req.moq]].map(([l, v]) => <div key={l}><div className="label">{l}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div></div>)}
    </div>
    <div style={{ padding: "8px 12px", borderRadius: 8, background: addr ? "var(--page)" : "var(--coral-wash)", marginBottom: 14 }}>
      <div className="row gap-2"><Icon name="dispatch" size={14} color={addr ? "var(--muted)" : "var(--coral-dark)"} /><span className="body-sm" style={{ fontSize: 12, color: addr ? "var(--ink)" : "var(--coral-dark)" }}>{addr ? "Shipping address from address book" : "No shipping address — required before send"}</span></div>
    </div>
    {flow !== "Sent" && <div onClick={() => setPhotos(p => [...p, p.length + 1])} style={{ border: "2px dashed " + (photos.length ? "var(--border)" : "var(--coral)"), borderRadius: 10, padding: 18, textAlign: "center", cursor: "pointer", marginBottom: 14 }}>
      <Icon name="camera" size={20} color={photos.length ? "var(--brand-light)" : "var(--coral)"} />
      <div className="body-sm" style={{ marginTop: 6 }}>{photos.length ? `${photos.length} product photo(s) attached — click to add` : "Upload ≥ 1 product photo to enable send"}</div>
    </div>}
    {flow === "Sent" ? <span className="pill" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}><Icon name="check" size={12} color="var(--approved-fg)" /> Sent to client · ownership with Sales</span>
      : flow === "Awaiting SPOC approval" ? <div style={{ padding: "10px 12px", background: "var(--review-bg)", borderRadius: 8 }}><div className="body-sm" style={{ fontSize: 12.5, color: "var(--review-fg)" }}><Icon name="clock" size={12} /> Dispatch note + photos sent — awaiting SPOC approval.</div></div>
      : <div className="col gap-2">
        <Field label="Dispatch note to SPOC" hint="Auto-generated draft — add anything custom (batch quirks, handling, what to check)">
          <textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Slight colour shift vs v1 — intentional, from the new antioxidant. Store below 25°C." style={{ minHeight: 64 }} /></Field>
        <Field label="Courier docket no." hint="From the courier slip — lands on the timeline & the master tracker">
          <input className="input mono" style={{ maxWidth: 260 }} value={docket} onChange={e => setDocket(e.target.value)} placeholder="e.g. DTDC-884521" /></Field>
        <div className="grid grid-2 gap-3">
          {[["Marketing brief", mktBrief, () => setMktBrief(v => !v)], ["Ingredient list", ingList, () => setIngList(v => !v)]].map(([lbl, on, toggle]) =>
            <div key={lbl} onClick={toggle} style={{ border: "2px dashed " + (on ? "var(--border)" : "var(--brand-light)"), borderRadius: 10, padding: 14, textAlign: "center", cursor: "pointer" }}>
              <Icon name={on ? "check" : "upload"} size={17} color={on ? "var(--approved-fg)" : "var(--brand-light)"} />
              <div className="body-sm" style={{ marginTop: 4, fontWeight: on ? 600 : 400 }}>{on ? lbl + " attached ✓ — click to remove" : "Upload " + lbl.toLowerCase()}</div>
            </div>)}
        </div>
        <div className="row gap-2">
          <button className={"btn " + (generated ? "btn-secondary" : "")} onClick={() => setGenerated(true)}><Icon name="note" size={15} /> {generated ? "Note generated ✓" : "Generate dispatch note"}</button>
          <button className="btn" disabled={!generated || photos.length < 1 || !addr} onClick={() => window.NaturisStore.dispatch(req.id, { photos: photos.length, note: true, noteText: note.trim(), docket: docket.trim(), marketingBrief: mktBrief, ingredientList: ingList }, techOfReq(req))}><Icon name="dispatch" size={15} /> Mark dispatched → SPOC approval</button>
        </div>
      </div>}
  </div>;
}

function PostApproval({ req }) {
  window.useStore();
  const defaultStab = req.projectType === "NPD" ? true : req.projectType === "EPD" ? false : "prompt";
  const stab = req.stability; const del = req.deliverables || {}; const stabPassed = stab && stab.status === "passed";
  return <div className="card">
    <SectionTitle sub="After client approval — runs in one thread">Post-approval · stability & deliverables</SectionTitle>
    <div className="col gap-3">
      <div style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)" }}>
        <div className="row between"><div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Stability / shelf-life</div>
          <div className="body-sm" style={{ fontSize: 12 }}>Default {defaultStab === true ? "ON (NPD)" : defaultStab === false ? "off (EPD)" : "prompt (Renovation)"} · monthly updates mirrored to SPOC</div></div>
          {!stab && <div className="row gap-2"><button className="btn btn-secondary btn-sm" onClick={() => window.NaturisStore.startStability(req.id, 3, techOfReq(req))}>Start 3-mo</button><button className="btn btn-sm" onClick={() => window.NaturisStore.startStability(req.id, 6, techOfReq(req))}>Start 6-mo</button></div>}
        </div>
        {stab && <div style={{ marginTop: 10 }}>
          <div className="row between" style={{ marginBottom: 6 }}><span className="body-sm">{stab.months}-month cycle · month {stab.month}/{stab.months}</span>
            <span className="pill pill-sm" style={{ background: stabPassed ? "var(--approved-bg)" : "var(--review-bg)", color: stabPassed ? "var(--approved-fg)" : "var(--review-fg)" }}>{stabPassed ? "Passed ✓" : "Running"}</span></div>
          <StageStepper stages={Array.from({ length: stab.months }, (_, i) => "M" + (i + 1))} current={"M" + Math.max(1, stab.month)} done={stab.month} />
          {!stabPassed && <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => window.NaturisStore.advanceStability(req.id, techOfReq(req))}><Icon name="arrowRight" size={13} /> Log next month</button>}
        </div>}
      </div>
      {[["ingredient", "Ingredient sheet", "INCI list for the client"], ["marketing", "Marketing brief", "Claims + usage the brand can market with"]].map(([key, l, sub]) => {
        const d = del[key];
        return <div key={key} className="row between" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{l}</div><div className="body-sm" style={{ fontSize: 12 }}>{sub}</div></div>
          {d && d.done ? <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}><Icon name="check" size={11} color="var(--approved-fg)" /> Submitted</span>
            : <button className="btn btn-secondary btn-sm" onClick={() => window.NaturisStore.setDeliverable(req.id, key, techOfReq(req))}><Icon name="note" size={13} /> Submit</button>}
        </div>;
      })}
      {stabPassed && del.ingredient && del.ingredient.done && del.marketing && del.marketing.done &&
        <button className="btn" onClick={() => window.NaturisStore.closeRequirement(req.id, DL.LAB_MANAGER)}><Icon name="archive" size={15} /> Close & archive project</button>}
    </div>
  </div>;
}

function WipDetail({ req, nav, role }) {
  window.useStore();
  const stages = DL.LAB_STAGES;
  const stageIdx = { "Accepted — date committed": 0, "Formulation": 0, "Trial": 1, "QC": 2, "Fill": 3, "Ready for dispatch": 4, "Dispatch awaiting SPOC approval": 4, "Sent to client": 4, "Client approved": 4, "In stability": 4, "Archived": 4 }[req.status] ?? 0;
  const [flagOpen, setFlagOpen] = useState(false);
  const openFlags = req.flags.filter(f => !f.resolved);
  const showDispatch = stageIdx >= 4 && !POST.includes(req.status);
  const postApproval = ["Client approved", "In stability", "Archived"].includes(req.status);
  function advance() { window.NaturisStore.advanceStage(req.id, req.status === "Accepted — date committed" ? STAGE_STATUS[0] : STAGE_STATUS[Math.min(stageIdx + 1, 4)], techOfReq(req)); }
  return <div className="col gap-4">
    {window.RaiseFlagDrawer && <window.RaiseFlagDrawer open={flagOpen} onClose={() => setFlagOpen(false)} reqId={req.id} role={role || "lab"} />}
    <div className="card">
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="row gap-2" style={{ marginBottom: 6 }}>{req.vvip && <VVIPBadge size="sm" />}<span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{req.id}</span><StatusPill status={req.status} /><ProjectTypePill type={req.projectType} showLabel />{req.committedDate && <span className="body-sm" style={{ fontSize: 12 }}>committed {req.committedDate}</span>}</div>
          <div className="h2" style={{ fontSize: 24 }}><span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title}</div>
          <div className="body-sm" style={{ marginTop: 2 }}>iteration {req.iteration || 1} · owner {req.owner || "Lab"}</div>
        </div>
        <div className="row gap-2">
          {window.FullBriefButton && <window.FullBriefButton req={req} />}
          <button className="btn btn-secondary btn-sm" onClick={() => setFlagOpen(true)}><Icon name="flag" size={14} /> Flag</button>
          {["Sent to client", "Rejected"].includes(req.status) && <button className="btn btn-secondary btn-sm" onClick={() => window.NaturisStore.newIteration(req.id, "Reformulated per client feedback", techOfReq(req))}><Icon name="plus" size={14} /> Iteration</button>}
        </div>
      </div>
    </div>

    {openFlags.length > 0 && <div className="card" style={{ borderLeft: "4px solid var(--coral)" }}>
      {openFlags.map(f => <div key={f.id} className="row between" style={{ marginBottom: 4 }}><div className="row gap-2"><Icon name="flag" size={14} color="var(--coral-dark)" /><span className="body-sm" style={{ color: "var(--coral-dark)" }}>{f.typeLabel || f.type}: {f.text}</span></div><button className="btn btn-sm" style={{ background: "var(--coral)", color: "#fff" }} onClick={() => window.NaturisStore.confirmResolve(req.id, f.id, techOfReq(req))}>Resolve</button></div>)}
    </div>}

    <div className="card" style={{ padding: "12px 18px" }}>
      <div className="row gap-4" style={{ alignItems: "center" }}>
        <div><div className="label" style={{ fontSize: 9 }}>BASE</div>{req.ntl ? <FormulationCode code={req.ntl} /> : <span className="body-sm">new dev</span>}</div>
        <Icon name="arrowRight" size={16} color="var(--muted)" />
        <div style={{ flex: 1 }}><div className="label" style={{ fontSize: 9 }}>NAME</div><span style={{ fontWeight: 600 }}>{req.title}</span></div>
        <div><div className="label" style={{ fontSize: 9 }}>CURRENT</div><FormulationCode code={req.currentNcl} /></div>
        <span className="body-sm" style={{ fontSize: 11 }}>{req.ncls.length} iteration{req.ncls.length !== 1 ? "s" : ""}</span>
      </div>
    </div>

    {!postApproval && <div className="card"><SectionTitle sub="One thread — advance through the bench">Stage</SectionTitle>
      <StageStepper stages={stages} current={stages[Math.min(stageIdx, 4)]} vertical done={stageIdx} />
      {stageIdx < 4 && <button className="btn" style={{ marginTop: 14 }} onClick={advance}><Icon name="arrowRight" size={15} /> Advance to {stages[stageIdx + 1]}</button>}
      {stageIdx >= 4 && <div className="row gap-2" style={{ marginTop: 14 }}><span className="pill" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}><Icon name="check" size={12} color="var(--approved-fg)" /> Ready — generate dispatch</span></div>}
    </div>}
    {showDispatch && <DispatchPanel req={req} />}
    {postApproval && <PostApproval req={req} />}
    {["Client approved", "In stability", "Archived"].includes(req.status) && window.PrePOChecklist && <window.PrePOChecklist req={req} role="lab" />}
    {window.ProgressTimeline && <div className="card"><SectionTitle>Timeline</SectionTitle><window.ProgressTimeline req={req} /></div>}
  </div>;
}

const WIP_TABS = [
  ["ackpend", "Acknowledgement pending", ["Acknowledged"], "incoming"],
  ["evalpend", "Evaluation pending", ["In evaluation", "Query raised"], "queue"],
  ["accepted", "Accepted", ["Accepted — date committed"], "check"],
  ["bench", "On the bench", ["Formulation", "Trial", "QC", "Fill"], "work"],
  ["dispatch", "Ready / dispatch", ["Ready for dispatch", "Dispatch awaiting SPOC approval"], "dispatch"],
  ["stability", "In stability", ["In stability"], "clock"],
  ["done", "Dispatched / done", ["Sent to client", "Client approved", "Archived"], "archive"],
  ["all", "All", null, "list"],
];
const WIP_ALL = [...EVAL_ST, "Accepted — date committed", ...LAB_LIVE, ...POST];

function LB03_Live({ params, nav, role }) {
  window.useStore();
  const reqs = DL.REQUIREMENTS;
  const all = window.vvipSort(reqs.filter(r => WIP_ALL.includes(r.status)));
  const [tab, setTab] = useState("all");

  const [sel, setSel] = useState(params.reqId || null);
  const req = sel && reqs.find(r => r.id === sel);
  const tabDef = WIP_TABS.find(t => t[0] === tab);
  const shown = tab === "all" ? all : all.filter(r => tabDef[2].includes(r.status));

  // detail view (clicked a tile)
  if (req) {
    const pending = EVAL_ST.includes(req.status);
    return <div className="col gap-4">
      <button className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setSel(null)}><Icon name="arrowRight" size={14} style={{ transform: "rotate(180deg)" }} /> Back to all projects</button>
      {pending ? <div className="card">
        <div className="row gap-2" style={{ marginBottom: 8 }}>{req.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={req.projectType} showLabel /><span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{req.id}</span><StatusPill status={req.status} /></div>
        <div className="h2" style={{ fontSize: 22 }}><span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title}</div>
        <div className="body-sm" style={{ marginBottom: 12 }}>acknowledged, not yet accepted / rejected.</div>
        <CompatibilityNote severity="warn" title="Awaiting your decision">This lead is acknowledged. Evaluate (RM/PM/slot) and decide in the Evaluation tab.</CompatibilityNote>
        <button className="btn" style={{ marginTop: 12 }} onClick={() => nav("LB-EVAL", { reqId: req.id })}><Icon name="queue" size={15} /> Go to Evaluation</button>
      </div> : <WipDetail req={req} nav={nav} role={role} />}
    </div>;
  }

  return <div className="col gap-5">
    <PageHead title="Work in progress" sub="Every lab project as a tile — status up top. Filter by stage; click a tile to open the full view." />
    {/* status tabs */}
    <FilterTiles min={140} value={tab} onChange={setTab} options={WIP_TABS.map(([v, lbl, sts, ic]) => ({
      key: v, label: lbl, icon: ic,
      count: sts ? all.filter(r => sts.includes(r.status)).length : all.length,
    }))} />
    {shown.length === 0 ? <div className="card" style={{ textAlign: "center", padding: 40 }}><Icon name="work" size={24} color="var(--brand-light)" /><div className="h3" style={{ marginTop: 8 }}>Nothing here</div><div className="body-sm" style={{ marginTop: 4 }}>Accept a lead in Evaluation and it lands here.</div></div>
      : <div className="grid grid-3 gap-3">
        {shown.map(r => { const pending = EVAL_ST.includes(r.status); const ink = PT_INK[r.projectType];
          return <div key={r.id} className="card" onClick={() => setSel(r.id)} style={{ cursor: "pointer", padding: 0, overflow: "hidden", transition: "transform .15s, box-shadow .15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--sh-md)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            {/* status up top */}
            <div className="row between" style={{ padding: "10px 14px", background: pending ? "var(--review-bg)" : "var(--brand-wash)" }}>
              <StatusPill status={r.status} size="sm" />
              {r.vvip && <VVIPBadge size="sm" />}
            </div>
            <div style={{ padding: "12px 14px", borderTop: `3px solid ${ink}` }}>
              <div className="row gap-2" style={{ marginBottom: 6 }}><ProjectTypePill type={r.projectType} /><span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{r.id.slice(-4)}</span></div>
              <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.25 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
              <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{r.category}</div>
              <div className="row between" style={{ marginTop: 10 }}>
                <FormulationCode code={r.currentNcl} />
                {r.committedDate ? <span className="body-sm" style={{ fontSize: 11 }}>{r.committedDate}</span> : <SLAIndicator req={r} />}
              </div>
              {r.stability && <div className="body-sm" style={{ fontSize: 11, marginTop: 8, color: "var(--review-fg)" }}><Icon name="clock" size={11} /> Stability {r.stability.month}/{r.stability.months} mo</div>}
            </div>
          </div>; })}
      </div>}
  </div>;
}

/* LB-05 archive kept (reachable via deep link / search) */
function LB05_Approved() {
  window.useStore();
  const reqs = DL.REQUIREMENTS.filter(r => ["Archived"].includes(r.status));
  return <div className="col gap-5"><PageHead title="Approved projects" sub="Archived — immutable thread" />
    {reqs.length ? <ReqTable rows={reqs} onOpen={() => {}} cols={["id", "brand", "title", "type", "code", "status"]} /> : <div className="card"><div className="body-sm">No archived projects yet.</div></div>}
  </div>;
}

Object.assign(window.SCREENS, {
  "LB-01": LB01_Dashboard, "LB-02": LB02_Incoming, "LB-EVAL": LB_Eval, "LB-03": LB03_Live, "LB-05": LB05_Approved,
});
