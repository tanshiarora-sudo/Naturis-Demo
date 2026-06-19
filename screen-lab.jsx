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

  const myDesk = reqs.filter(r => r.tracker === ME_LAB);
  const live = reqs.filter(r => WIP.includes(r.status) && r.status !== "Archived");
  const LS = DL.LAB_LIVE_STAGES;
  const byStage = LS.filter(s => s !== "Dispatched").map(s => ({ label: s.replace(" testing", "").replace(" / PM", "/PM"), value: reqs.filter(r => r.labStage === s).length }));
  const byType = ["EPD", "REN", "TT", "NPD"].map(t => ({ label: t, value: live.filter(r => r.projectType === t).length }));
  const tat = { green: live.filter(r => (r.age || 0) < 7).length, orange: live.filter(r => (r.age || 0) >= 7 && (r.age || 0) <= 10).length, red: live.filter(r => (r.age || 0) > 10).length };
  const onTimePct = live.length ? Math.round((tat.green + tat.orange) / live.length * 100) : 100;
  const BarChart = window.BarChart, Ring = window.Ring;
  return <div className="col gap-6">
    <div><div className="h1">Good morning, Sumit.</div><div className="body" style={{ color: "var(--muted)", marginTop: 4 }}>Lab at a glance — {live.length} active on the bench · {needAck.length} to acknowledge · {queries.length} open queries.</div></div>

    {/* KPI matrix */}
    <div className="grid grid-4 gap-3">
      <Stat label="Active in lab" value={live.length} sub="On the bench now" onClick={() => nav("LB-03")} />
      <Stat label="To acknowledge" value={needAck.length} attention={needAck.length > 0} sub="New on the query desk" onClick={() => nav("LB-02")} />
      <Stat label="To evaluate" value={inEval.length} attention={inEval.length > 0} sub="Assigned to a chemist" onClick={() => nav("LB-EVAL")} />
      <Stat label="On-time %" value={onTimePct} suffix="%" sub="Within TAT" />
    </div>

    {/* charts row */}
    <div className="grid gap-4" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card"><SectionTitle sub="Where the bench is right now">Live status distribution</SectionTitle>
        {BarChart ? <BarChart data={byStage.filter(d => d.value > 0).length ? byStage : [{ label: "—", value: 0 }]} /> : null}</div>
      <div className="card"><SectionTitle sub="Are queries within turnaround?">TAT health</SectionTitle>
        <div className="row gap-3" style={{ alignItems: "center", justifyContent: "center", marginTop: 6 }}>
          {Ring && <Ring value={onTimePct} size={104} color={onTimePct >= 80 ? "var(--ok)" : "var(--review-fg)"} label="on-time" />}
        </div>
        <div className="grid grid-3 gap-2" style={{ marginTop: 12 }}>
          {[["Green <7d", tat.green, "var(--approved-fg)", "var(--approved-bg)"], ["Orange 7–10", tat.orange, "var(--review-fg)", "var(--review-bg)"], ["Critical >10", tat.red, "var(--coral-dark)", "var(--coral-wash)"]].map(([lb, v, fg, bg]) =>
            <div key={lb} style={{ padding: "10px 8px", borderRadius: 10, background: bg, textAlign: "center" }}><div className="serif-num" style={{ fontSize: 22, color: fg }}>{v}</div><div className="label" style={{ fontSize: 8.5, marginTop: 2 }}>{lb}</div></div>)}
        </div>
      </div>
    </div>

    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="card"><SectionTitle sub="Active projects by project type">Project-type mix</SectionTitle>
        {BarChart ? <BarChart data={byType} /> : null}</div>
      <div className="card"><SectionTitle sub="Your desk vs the lab">My desk load</SectionTitle>
        <div className="row gap-3" style={{ alignItems: "center", marginTop: 8 }}>
          {Ring && <Ring value={Math.min(100, myDesk.filter(r => WIP.includes(r.status)).length * 18 + 10)} size={92} color="var(--brand-accent)" label="load" />}
          <div className="col gap-2" style={{ flex: 1 }}>
            {[["My active", myDesk.filter(r => WIP.includes(r.status) && r.status !== "Archived").length], ["My queries", myDesk.filter(r => (r.queries || []).some(q => !q.resolved)).length], ["My dispatched", myDesk.filter(r => ["Sent to client", "Client approved"].includes(r.status)).length]].map(([lb, v]) =>
              <div key={lb} className="row between" style={{ padding: "7px 10px", borderRadius: 8, background: "var(--page)" }}><span className="body-sm" style={{ fontSize: 12.5 }}>{lb}</span><span className="serif-num" style={{ fontSize: 18 }}>{v}</span></div>)}
          </div>
        </div>
      </div>
    </div>

    <div className="card" style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--brand-wash)" }}>
      <Icon name="list" size={18} color="var(--brand)" />
      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>Work the queue from the Query desk</div><div className="body-sm" style={{ fontSize: 12 }}>The full list — every query, all desks, filterable. Acknowledge & track from there.</div></div>
      <button className="btn btn-sm" onClick={() => nav("LB-02")}>Open query desk <Icon name="arrowRight" size={13} /></button>
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
/* LM-only: acknowledge & assign with auto-suggested desk (12 Jun meeting) */
/* LM-only inline chemist assignment (after the tech has acknowledged) */
function ChemistAssign({ req }) {
  const chems = window.NaturisData.LAB_CHEMISTS;
  const suggested = ((window.NaturisData.LAB_DESKS || {})[req.projectType] || {}).tech || chems[0];
  const [c, setC] = useState(suggested);
  return <span className="row gap-2" style={{ alignItems: "center" }}>
    <select className="select" style={{ height: 30, fontSize: 11.5, width: 150 }} value={c} onChange={e => setC(e.target.value)}>
      {chems.map(x => <option key={x} value={x}>{x}{x === suggested ? " · suggested" : ""}</option>)}
    </select>
    <button className="btn btn-sm" style={{ background: "var(--approved-fg)", color: "#fff" }} onClick={() => window.NaturisStore.assignChemist(req.id, c, "Dipti OV")}><Icon name="check" size={12} /> Assign</button>
  </span>;
}

function LB02_Incoming({ nav, role }) {
  window.useStore();
  const reqs = DL.REQUIREMENTS;
  const isLM = role === "labmgr";
  const [popup, setPopup] = useState(null);
  const [fam, setFam] = useState("all");
  const [brand, setBrand] = useState("all");
  const [type, setType] = useState("all");
  const [spoc, setSpoc] = useState("all");
  const [q, setQ] = useState("");
  const [full, setFull] = useState(false);
  const [need, setNeed] = useState("all");
  const Popup = window.RequirementPopup;
  const tatZone = days => days < 7 ? ["var(--approved-bg)", "var(--approved-fg)", "green"] : days <= 10 ? ["var(--review-bg)", "var(--review-fg)", "orange"] : ["var(--coral-wash)", "var(--coral-dark)", "critical"];
  // the acknowledgement inbox — purely new queries awaiting the lab's "seen & reviewed".
  // Once acknowledged, a requirement moves to Under evaluation (chemist assignment is optional, done there / at planning).
  const lab = reqs.filter(r => PRE_ACK.includes(r.status));
  const fams = ["all", ...Array.from(new Set(lab.map(r => r.categoryGroup).filter(Boolean)))];
  const brands = Array.from(new Set(lab.map(r => r.brand)));
  const spocs = Array.from(new Set(lab.map(r => r.submittedBy)));
  const filtered = lab.filter(r =>
    (fam === "all" || r.categoryGroup === fam) && (brand === "all" || r.brand === brand) &&
    (type === "all" || r.projectType === type) && (spoc === "all" || r.submittedBy === spoc) &&
    (!q || (r.id + " " + r.brand + " " + r.title).toLowerCase().includes(q.toLowerCase())));
  const rows = window.vvipSort(filtered);
  const stChip = s => <StatusPill status={s} size="sm" />;
  return <div className="col gap-4">
    <PageHead title="New requirements" sub={isLM ? "Fresh requirements awaiting the lab's acknowledgement. Once the lab tech acknowledges, they move to Under evaluation." : "New requirements to acknowledge (seen & reviewed). Acknowledging moves it to Under evaluation for the doability review."} />
    {/* filters — all left-aligned dropdowns + search */}
    <div className="row gap-2 wrap" style={{ alignItems: "center" }}>
      <div style={{ position: "relative", width: 230 }}><span style={{ position: "absolute", left: 10, top: 9 }}><Icon name="search" size={15} color="var(--muted)" /></span>
        <input className="input" style={{ paddingLeft: 32, height: 34, fontSize: 12 }} placeholder="Search id, brand, title…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <select className="select" style={{ width: 150, height: 34, fontSize: 12 }} value={fam} onChange={e => setFam(e.target.value)}><option value="all">All categories</option>{fams.filter(f => f !== "all").map(f => <option key={f}>{f}</option>)}</select>
      <select className="select" style={{ width: 140, height: 34, fontSize: 12 }} value={brand} onChange={e => setBrand(e.target.value)}><option value="all">All brands</option>{brands.map(b => <option key={b}>{b}</option>)}</select>
      <select className="select" style={{ width: 120, height: 34, fontSize: 12 }} value={type} onChange={e => setType(e.target.value)}><option value="all">All types</option>{["EPD", "REN", "TT", "NPD"].map(t => <option key={t}>{t}</option>)}</select>
      <select className="select" style={{ width: 150, height: 34, fontSize: 12 }} value={spoc} onChange={e => setSpoc(e.target.value)}><option value="all">All SPOCs</option>{spocs.map(s => <option key={s}>{s}</option>)}</select>
    </div>
    <div className="row between wrap gap-2">
      <div className="body-sm" style={{ fontSize: 12 }}>{lab.length} awaiting acknowledgement</div>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <span className="label" style={{ fontSize: 8.5 }}>Last updated · just now</span>
        <button className="btn btn-sm btn-secondary" onClick={() => setFull(f => !f)}>{full ? "Compact columns" : "Full columns"}</button>
      </div>
    </div>
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto", maxHeight: "66vh", overflowY: "auto" }}>
        <table className="tbl" style={{ minWidth: full ? 1560 : 1180 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr>{["Req ID", "Brand", "Title", "Category", "Type", "Code", "Status", "Responsible", "Sales POC", ...(full ? ["Requested", "Target dispatch"] : []), "TAT", ...(full ? ["Remarks"] : []), "Action"].map(h =>
              <th key={h} style={{ background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", padding: "9px 12px", textAlign: h === "Action" ? "right" : "left", whiteSpace: "nowrap", ...(h === "Action" ? { position: "sticky", right: 0, zIndex: 3, boxShadow: "-8px 0 12px -8px rgba(0,0,0,.18)" } : {}) }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(r => <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><span className="row gap-1" style={{ alignItems: "center" }}>{r.vvip && <Icon name="star" size={12} color="#D97706" title="VVIP" />}<span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brand-mid)" }}>{r.id}</span></span></td>
              <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>{r.brand}</td>
              <td style={{ padding: "8px 12px", fontSize: 12.5, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
              <td style={{ padding: "8px 12px", fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap" }}>{r.categoryGroup} · {r.category}</td>
              <td style={{ padding: "8px 12px" }}><ProjectTypePill type={r.projectType} /></td>
              <td style={{ padding: "8px 12px" }}><span className="mono" style={{ fontSize: 11 }}>{r.currentNcl || "—"}</span></td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{stChip(r.status)}{r.labStage ? <span className="body-sm" style={{ fontSize: 10, display: "block", color: "var(--brand)", marginTop: 2 }}>{r.labStage}</span> : null}</td>
              <td style={{ padding: "8px 12px", fontSize: 11.5, whiteSpace: "nowrap" }}>{r.tracker || techOfReq(r)}</td>
              <td style={{ padding: "8px 12px", fontSize: 11.5, whiteSpace: "nowrap" }}>{r.submittedBy}</td>
              {full && <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{(r.submittedAt || "—").replace(" 2026", "")}</td>}
              {full && <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{(r.targetSampleDate || "—").replace(" 2026", "")}</td>}
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{["Archived", "Client approved", "Rejected"].includes(r.status) ? <span className="body-sm">—</span> : (() => { const z = tatZone(r.age || 0); return <span className="pill pill-sm" style={{ background: z[0], color: z[1], fontWeight: 700 }} title={(r.age || 0) + " days in pipeline"}>{z[2]}</span>; })()}</td>
              {full && <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--muted)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(r.briefDetail || {}).notes || "—"}</td>}
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap", position: "sticky", right: 0, background: "var(--surface)", boxShadow: "-8px 0 12px -8px rgba(0,0,0,.12)" }}>
                <span className="row gap-2" style={{ alignItems: "center", justifyContent: "flex-end" }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setPopup({ id: r.id, tab: "brief" })} title="View initial requirement"><Icon name="note" size={12} /></button>
                  {isLM ? <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)" }}>awaiting tech ack</span>
                    : <button className="btn btn-sm" style={{ background: "var(--approved-fg)", color: "#fff" }} onClick={() => window.NaturisStore.acknowledge(r.id, techOfReq(r))}><Icon name="check" size={12} /> Acknowledge</button>}
                </span>
              </td>
            </tr>)}
            {!rows.length && <tr><td colSpan={full ? 13 : 10} style={{ padding: 34, textAlign: "center" }}><span className="body-sm">{lab.length ? "No queries match these filters." : "Inbox clear — nothing awaiting acknowledgement. 🎉"}</span></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
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
  // RM / PM procurement lines — what material is needed and by when (so planning can schedule around arrival)
  const procItems = (key, label, hint) => { const items = ev[key] || []; const upd = arr => set({ [key]: arr });
    return <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--page)", marginBottom: 12 }}>
      <div className="label" style={{ marginBottom: 6 }}>{label} — what's needed & by when</div>
      <div className="col gap-2">
        {items.map((it, i) => <div key={i} className="row gap-2 wrap" style={{ alignItems: "center" }}>
          <input className="input" style={{ flex: "1 1 150px", height: 30, fontSize: 12 }} placeholder={hint} value={it.material || ""} onChange={e => upd(items.map((x, j) => j === i ? { ...x, material: e.target.value } : x))} />
          <input className="input" type="date" style={{ width: 150, height: 30, fontSize: 12 }} title="Expected by" value={it.byDate || ""} onChange={e => upd(items.map((x, j) => j === i ? { ...x, byDate: e.target.value } : x))} />
          {it.byDate && <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)" }}>by {it.byDate.slice(5)}</span>}
          <button className="btn btn-ghost btn-sm" onClick={() => upd(items.filter((_, j) => j !== i))}><Icon name="x" size={12} /></button>
        </div>)}
        <button className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => upd([...items, { material: "", byDate: "" }])}><Icon name="plus" size={12} /> Add item</button>
      </div>
    </div>;
  };
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
    {ev.rm === "yes" && procItems("rmItems", "Raw material to procure", "e.g. Zinc PCA, Niacinamide")}
    {ev.pm === "yes" && procItems("pmItems", "Packaging material to procure", "e.g. 30ml airless pump, jar")}
    {/* slot allotment is centralised — planning desk books at the lab meeting (12 Jun decision) */}
    <div className="row between wrap gap-2" style={{ padding: "12px 14px", borderRadius: 10, background: "var(--page)", marginBottom: 16 }}>
      <div className="row gap-2" style={{ alignItems: "center" }}><Icon name="calendar" size={15} color="var(--brand-accent)" />
        <div><div style={{ fontSize: 13, fontWeight: 600 }}>Station slot — booked by the planning desk</div>
          <div className="body-sm" style={{ fontSize: 11.5 }}>Allocation happens at the lab meeting (FIFO + VVIP priority). You'll see your slot here once booked.</div></div></div>
      {ev.booking ? <span className="pill" style={{ background: "var(--brand)", color: "#fff", fontWeight: 600 }}>{ev.slot}</span>
        : <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)", fontWeight: 600 }}>pending planning desk</span>}
    </div>
    <div className="label" style={{ marginBottom: 4 }}>Raw material / ingredient availability</div>
    {past && <div className="body-sm" style={{ fontSize: 11.5, marginBottom: 8 }}>Pre-filled from the selected formulation <b className="mono">{past.code}</b> ({past.name}) plus the brief's actives.</div>}
    <div className="col gap-2">
      {avail.map((a, i) => <div key={i} className="row between" style={{ padding: "8px 12px", borderRadius: 8, background: "var(--page)", flexWrap: "wrap" }}>
        <span className="row gap-2"><span className="body-sm" style={{ fontSize: 13 }}>{a.name}</span>{a.manual && <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>added manually</span>}</span>
        <div className="row gap-1">{[["available", "Available", "var(--ok)"], ["short", "Not available", "var(--coral)"]].map(([v, l, c]) =>
          <button key={v} onClick={() => setAvail(i, v)} className="btn btn-sm" style={{ background: a.state === v ? c : "transparent", color: a.state === v ? "#fff" : "var(--muted)", border: a.state === v ? "none" : "1px solid var(--border)" }}>{l}</button>)}</div>
        {a.state === "short" && <div className="row gap-2 wrap" style={{ width: "100%", marginTop: 8 }}>
          <input className="input" style={{ width: 110, height: 30, fontSize: 11.5 }} placeholder="Qty needed" value={a.qty || ""} onChange={e => set({ availability: avail.map((x, j) => j === i ? { ...x, qty: e.target.value } : x) })} />
          <input className="input" style={{ width: 130, height: 30, fontSize: 11.5 }} type="date" title="Expected arrival" value={a.eta || ""} onChange={e => set({ availability: avail.map((x, j) => j === i ? { ...x, eta: e.target.value } : x) })} />
          <input className="input" style={{ width: 150, height: 30, fontSize: 11.5 }} placeholder="Vendor" value={a.vendor || ""} onChange={e => set({ availability: avail.map((x, j) => j === i ? { ...x, vendor: e.target.value } : x) })} />
          {a.eta && <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)" }}>arriving {a.eta.slice(5)}</span>}
        </div>}
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
  ].filter(([m]) => m).map(([, lbl]) => lbl);
  const todayStr = new Date().toISOString().slice(0, 10);
  const dateOk = date && date >= todayStr;
  return <div className="card">
    <SectionTitle sub="Accept with a date · Decline with a reason · Ask the SPOC a question">Decision</SectionTitle>
    {!mode && <div className="row gap-2">
      <button className="btn" onClick={() => setMode("accept")}><Icon name="check" size={15} /> Accept</button>
      <button className="btn btn-destructive" onClick={() => setMode("decline")}><Icon name="x" size={15} /> Decline</button>
      <button className="btn btn-secondary" onClick={() => setMode("query")}><Icon name="note" size={15} /> Ask a question</button>
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
      <Field label="Question for the Sales SPOC"><textarea className="textarea" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. 5% vitamin C not feasible in this base — confirm 3% or change base." style={{ minHeight: 70 }} /></Field>
      <div className="row gap-2"><button className="btn" disabled={!query.trim()} onClick={() => window.NaturisStore.raiseQuery(req.id, query.trim(), techOfReq(req))}><Icon name="note" size={15} /> Send question</button><button className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Cancel</button></div>
    </div>}
  </div>;
}

function LB_Eval({ params, nav }) {
  window.useStore();
  const reqs = DL.REQUIREMENTS;
  const list = window.vvipSort(reqs.filter(r => EVAL_ST.includes(r.status))); // acknowledged flows straight in; chemist assignment is optional
  const [openId, setOpenId] = useState(params.reqId || null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [q, setQ] = useState(""); const [fam, setFam] = useState("all"); const [brand, setBrand] = useState("all"); const [type, setType] = useState("all");
  const req = openId ? reqs.find(r => r.id === openId) : null;
  useEffect(() => { if (req && req.status === "Acknowledged") window.NaturisStore.startEvaluation(req.id, techOfReq(req)); }, [req && req.id, req && req.status]);
  const Popup = window.RequirementPopup;

  // full-page detail (no modal) — takes the whole screen
  if (req) {
    return <div className="col gap-4">
      <button className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setOpenId(null)}><Icon name="arrowRight" size={14} style={{ transform: "rotate(180deg)" }} /> Back to evaluation queue</button>
      <div className="card">
        <div className="row between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div><div className="row gap-2" style={{ marginBottom: 6, flexWrap: "wrap" }}>{req.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={req.projectType} showLabel /><span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{req.id}</span><StatusPill status={req.status} /></div>
            <div className="h2" style={{ fontSize: 24 }}><span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title}</div>
            <div className="body-sm">SPOC {req.submittedBy} · default desk {(DL.LAB_DESKS[req.projectType] || {}).tech}</div></div>
          <button className="btn" style={{ background: "var(--grad-brand)", boxShadow: "0 4px 12px rgba(18,57,95,.25)" }} onClick={() => setBriefOpen(true)}><Icon name="note" size={15} /> View initial requirement</button>
        </div>
        {/* assigning a specific chemist is optional — the lab manager recommends one only if needed */}
        <div className="row between wrap gap-2" style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "var(--page)" }}>
          <div className="row gap-2" style={{ alignItems: "center" }}><Icon name="team" size={15} color="var(--brand-accent)" />
            <div><div style={{ fontSize: 13, fontWeight: 700 }}>Chemist {req.assigned ? "assigned" : "— optional"}</div>
              <div className="body-sm" style={{ fontSize: 11.5 }}>{req.assigned ? "Lab manager recommended a specific chemist." : "Defaults to the desk chemist. Assign a specific one only if needed."}</div></div></div>
          {req.assigned ? <span className="pill" style={{ background: "var(--brand)", color: "#fff", fontWeight: 700 }}><Avatar name={req.tracker} size={18} /> {req.tracker}</span> : <ChemistAssign req={req} />}
        </div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.4fr 1fr", alignItems: "start" }}>
        <EvaluationPanel req={req} />
        <DecisionPanel req={req} nav={(s, p) => { setOpenId(null); nav && nav(s, p); }} />
      </div>
      {Popup && <Popup open={briefOpen} onClose={() => setBriefOpen(false)} reqId={req.id} />}
    </div>;
  }

  const fams = Array.from(new Set(list.map(r => r.categoryGroup).filter(Boolean)));
  const brands = Array.from(new Set(list.map(r => r.brand)));
  const rows = list.filter(r => (fam === "all" || r.categoryGroup === fam) && (brand === "all" || r.brand === brand) && (type === "all" || r.projectType === type) && (!q || (r.id + " " + r.brand + " " + r.title + " " + (r.tracker || "")).toLowerCase().includes(q.toLowerCase())));
  return <div className="col gap-4">
    <PageHead title="Under evaluation" sub="Queries assigned to a chemist — open any row to record RM / PM / slot / availability and take the decision." />
    {list.length === 0 ? <div className="card" style={{ textAlign: "center", padding: 40 }}><Icon name="check" size={24} color="var(--approved-fg)" /><div className="h3" style={{ marginTop: 8 }}>Nothing to evaluate</div><div className="body-sm" style={{ marginTop: 4 }}>Queries appear here once the lab manager assigns them to a chemist.</div></div>
    : <>
      <div className="row gap-2 wrap" style={{ alignItems: "center" }}>
        <div style={{ position: "relative", width: 230 }}><span style={{ position: "absolute", left: 10, top: 9 }}><Icon name="search" size={15} color="var(--muted)" /></span>
          <input className="input" style={{ paddingLeft: 32, height: 34, fontSize: 12 }} placeholder="Search id, brand, title, chemist…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="select" style={{ width: 150, height: 34, fontSize: 12 }} value={fam} onChange={e => setFam(e.target.value)}><option value="all">All categories</option>{fams.map(f => <option key={f}>{f}</option>)}</select>
        <select className="select" style={{ width: 140, height: 34, fontSize: 12 }} value={brand} onChange={e => setBrand(e.target.value)}><option value="all">All brands</option>{brands.map(b => <option key={b}>{b}</option>)}</select>
        <select className="select" style={{ width: 120, height: 34, fontSize: 12 }} value={type} onChange={e => setType(e.target.value)}><option value="all">All types</option>{["EPD", "REN", "TT", "NPD"].map(t => <option key={t}>{t}</option>)}</select>
      </div>
      <div className="body-sm" style={{ fontSize: 12 }}>{rows.length} to evaluate</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }}>
          <table className="tbl" style={{ minWidth: 1100 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}><tr>{["S.No", "Req ID", "Brand", "Product", "Category", "Type", "Code", "Chemist", "Status", ""].map(h => <th key={h} style={{ background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", padding: "9px 12px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => <tr key={r.id} className="clickable" onClick={() => setOpenId(r.id)} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <td style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)" }}>{i + 1}</td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><span className="row gap-1" style={{ alignItems: "center" }}>{r.vvip && <Icon name="star" size={12} color="#D97706" />}<span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brand-mid)" }}>{r.id}</span></span></td>
                <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>{r.brand}</td>
                <td style={{ padding: "8px 12px", fontSize: 12.5, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
                <td style={{ padding: "8px 12px", fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap" }}>{r.categoryGroup} · {r.category}</td>
                <td style={{ padding: "8px 12px" }}><ProjectTypePill type={r.projectType} /></td>
                <td style={{ padding: "8px 12px" }}><span className="mono" style={{ fontSize: 11 }}>{r.currentNcl || "—"}</span></td>
                <td style={{ padding: "8px 12px", fontSize: 11.5, whiteSpace: "nowrap" }}>{r.tracker || "—"}</td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><StatusPill status={r.status} size="sm" /></td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><button className="btn btn-sm" style={{ background: "var(--grad-brand)" }} onClick={e => { e.stopPropagation(); setOpenId(r.id); }}><Icon name="queue" size={12} /> Evaluate</button></td>
              </tr>)}
              {!rows.length && <tr><td colSpan={10} style={{ padding: 34, textAlign: "center" }}><span className="body-sm">No matches.</span></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>}
  </div>;
}

/* ====================================================================
   LB-03 · WORK IN PROGRESS (tab list → full view)
   ==================================================================== */
function DispatchPanel({ req }) {
  const [photos, setPhotos] = useState([]); const [generated, setGenerated] = useState(false);
  const [note, setNote] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [shipIdx, setShipIdx] = useState(0);
  const [docket, setDocket] = useState("");
  const [sentTo, setSentTo] = useState((req.briefDetail || {}).shipName || "");
  const [pcs, setPcs] = useState("2");
  const [courier, setCourier] = useState("DTDC");
  const [purpose, setPurpose] = useState("Samples as per request for evaluation");
  const [mktBrief, setMktBrief] = useState(false);
  const [ingList, setIngList] = useState(false);
  const flow = req.status === "Sent to client" || POST.includes(req.status) ? "Sent" : req.status === "Dispatch awaiting SPOC approval" ? "Awaiting SPOC approval" : "Drafted";
  const steps = ["Drafted", "Awaiting SPOC approval", "Sent"];
  // a client can have several offices — the lab picks which address this dispatch goes to (from the address book)
  const myAddrs = (window.NaturisData.SHIP_ADDRESSES || []).filter(a => a.client === req.brand && a.status !== "discarded");
  const shipAddr = myAddrs[shipIdx] || myAddrs[0] || null;
  const addr = shipAddr ? "ok" : "";
  const dd = req.dispatch || {};
  const dv = (k, fb) => dd[k] || fb || "";
  function buildEmail() {
    return [
      "To: " + (req.submittedBy || "Sales SPOC") + " (Sales SPOC)",
      "Subject: Sample dispatched — " + req.brand + " · " + req.title + " (" + req.id + ")",
      "",
      "Hi " + (req.submittedBy || "team") + ",",
      "",
      "The following sample has been dispatched from the Naturis lab. Please share with the client.",
      "",
      "Client / Brand : " + req.brand,
      "Product        : " + req.title,
      "Batch / NCL    : " + (req.currentNcl || req.id),
      "Pieces         : " + dv("pcs", pcs) || "—",
      "Packaging      : " + (req.packaging || "—"),
      "Courier        : " + (dv("courier", courier) || "—") + (dv("docket", docket) ? "   ·   Docket " + dv("docket", docket) : ""),
      "Sent to        : " + (shipAddr ? shipAddr.contact : (dv("sentTo", sentTo) || (req.briefDetail || {}).shipName || "—")),
      "Ship address   : " + (shipAddr ? shipAddr.to.join(", ") : "—"),
      "Photos         : " + (dd.photos || photos.length || 0) + " product photo(s) attached",
      "Enclosures     : " + [(dd.marketingBrief || mktBrief) ? "Marketing brief" : null, (dd.ingredientList || ingList) ? "Ingredient list" : null].filter(Boolean).join(", ") || "—",
      "",
      "Purpose: " + (dv("purpose", purpose) || "Samples for evaluation"),
      (dv("note", note) ? "\nNote from the lab: " + dv("note", note) : ""),
      "",
      "Regards,",
      techOfReq(req) + " · Naturis Lab",
    ].join("\n");
  }
  return <div className="card">
    <SectionTitle sub="Generated note + product photos → SPOC approval">Dispatch</SectionTitle>
    <div className="row between wrap gap-2" style={{ marginBottom: 16 }}>
      <div className="row gap-2">{steps.map((s, i) => <React.Fragment key={s}><span className="pill pill-sm" style={{ background: steps.indexOf(flow) >= i ? "var(--brand)" : "var(--brand-wash)", color: steps.indexOf(flow) >= i ? "#fff" : "var(--muted)" }}>{s}</span>{i < 2 && <Icon name="chevron" size={12} color="var(--border-strong)" />}</React.Fragment>)}</div>
      <button className="btn btn-secondary btn-sm" onClick={() => setEmailOpen(o => !o)}><Icon name="note" size={13} /> {emailOpen ? "Hide email draft" : "Generate email to SPOC"}</button>
    </div>
    {emailOpen && (() => { const txt = buildEmail(); return <div style={{ padding: 12, borderRadius: 10, background: "var(--page)", marginBottom: 14 }}>
      <div className="row between" style={{ marginBottom: 8 }}><span className="label">Auto-generated dispatch email → {req.submittedBy}</span>
        <div className="row gap-2">
          <button className="btn btn-sm btn-secondary" onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText(txt); } catch (e) {} }}><Icon name="note" size={12} /> Copy</button>
          <button className="btn btn-sm btn-secondary" onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" })); a.download = "dispatch-email-" + req.id + ".txt"; a.click(); URL.revokeObjectURL(a.href); }}><Icon name="download" size={12} /> Download</button>
        </div>
      </div>
      <textarea className="textarea mono" readOnly value={txt} style={{ minHeight: 230, fontSize: 11.5, width: "100%" }} />
      <div className="body-sm" style={{ fontSize: 11, marginTop: 6, color: "var(--muted)" }}>Copy or download and send to the SPOC — they forward it to the client.</div>
    </div>; })()}
    <div className="grid grid-2 gap-3" style={{ marginBottom: 14 }}>
      {[["Client", req.brand], ["Product", req.title], ["Packaging", req.packaging], ["Qty", req.moq]].map(([l, v]) => <div key={l}><div className="label">{l}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div></div>)}
    </div>
    <div style={{ padding: "10px 12px", borderRadius: 8, background: addr ? "var(--page)" : "var(--coral-wash)", marginBottom: 14 }}>
      {shipAddr ? <div className="col gap-2">
        <div className="row between wrap gap-2" style={{ alignItems: "center" }}>
          <span className="label">Ship to (from the address book)</span>
          {myAddrs.length > 1 && <select className="select" style={{ height: 30, fontSize: 11.5, maxWidth: 280 }} value={shipIdx} onChange={e => setShipIdx(+e.target.value)}>
            {myAddrs.map((a, i) => <option key={i} value={i}>{a.to[0]} · {(a.to[1] || "")}</option>)}
          </select>}
        </div>
        <div className="row gap-2" style={{ alignItems: "flex-start" }}><Icon name="dispatch" size={14} color="var(--brand-accent)" style={{ marginTop: 2 }} />
          <div className="body-sm" style={{ fontSize: 12 }}><b>{shipAddr.contact}</b><br />{shipAddr.to.join(", ")}</div></div>
        {myAddrs.length > 1 && <span className="body-sm" style={{ fontSize: 10.5, color: "var(--muted)" }}>{myAddrs.length} addresses on file for {req.brand} — pick the right office.</span>}
      </div> : <div className="row gap-2"><Icon name="dispatch" size={14} color="var(--coral-dark)" /><span className="body-sm" style={{ fontSize: 12, color: "var(--coral-dark)" }}>No address on file for {req.brand} — add one in the Address book before sending.</span></div>}
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
        <div className="grid grid-2 gap-3">
          <Field label="Sent to (contact person)"><input className="input" value={sentTo} onChange={e => setSentTo(e.target.value)} placeholder="e.g. Kavya Menon" /></Field>
          <Field label="Pieces"><input className="input" value={pcs} onChange={e => setPcs(e.target.value)} placeholder="e.g. 2" /></Field>
          <Field label="Courier partner"><input className="input" value={courier} onChange={e => setCourier(e.target.value)} placeholder="DTDC / Blue Dart / By hand" /></Field>
          <Field label="Courier docket no."><input className="input mono" value={docket} onChange={e => setDocket(e.target.value)} placeholder="e.g. DTDC-884521" /></Field>
        </div>
        <Field label="Purpose of dispatch"><input className="input" value={purpose} onChange={e => setPurpose(e.target.value)} /></Field>
        <div className="grid grid-2 gap-3">
          {[["Marketing brief", mktBrief, () => setMktBrief(v => !v)], ["Ingredient list", ingList, () => setIngList(v => !v)]].map(([lbl, on, toggle]) =>
            <div key={lbl} onClick={toggle} style={{ border: "2px dashed " + (on ? "var(--border)" : "var(--brand-light)"), borderRadius: 10, padding: 14, textAlign: "center", cursor: "pointer" }}>
              <Icon name={on ? "check" : "upload"} size={17} color={on ? "var(--approved-fg)" : "var(--brand-light)"} />
              <div className="body-sm" style={{ marginTop: 4, fontWeight: on ? 600 : 400 }}>{on ? lbl + " attached ✓ — click to remove" : "Upload " + lbl.toLowerCase()}</div>
            </div>)}
        </div>
        <div className="row gap-2">
          <button className={"btn " + (generated ? "btn-secondary" : "")} onClick={() => setGenerated(true)}><Icon name="note" size={15} /> {generated ? "Note generated ✓" : "Generate dispatch note"}</button>
          <button className="btn" disabled={!generated || photos.length < 1 || !addr} onClick={() => window.NaturisStore.dispatch(req.id, { photos: photos.length, note: true, noteText: note.trim(), docket: docket.trim(), sentTo: sentTo.trim(), pcs: pcs.trim(), courier: courier.trim(), purpose: purpose.trim(), marketingBrief: mktBrief, ingredientList: ingList }, techOfReq(req))}><Icon name="dispatch" size={15} /> Mark dispatched → SPOC approval</button>
        </div>
      </div>}
  </div>;
}

// --- placeholder AI generators (stubs — refined once Dhruv shares the brief DB / actives / format) ---
function genIngredientList(req) {
  const ings = [...(req.nonNegotiable || []), ...(req.goodToHave || [])].map(a => a.ingredient).filter(Boolean);
  const inci = ["Aqua", "Glycerin", ...ings, "Cetearyl Alcohol", "Caprylic/Capric Triglyceride", "Phenoxyethanol", "Parfum"];
  return "INGREDIENT LIST — " + req.brand + " · " + req.title + "  (" + (req.currentNcl || req.id) + ")\n\n" +
    "INCI, in descending order of concentration:\n\n" + inci.join(", ") + ".\n\n" +
    "[Placeholder output. The final list is computed from the uploaded formulation sheet — cosmetic/INCI names mapped, then ordered high → low % composition — once the lab shares the working format.]";
}
function genMarketingBrief(req) {
  const actives = [...(req.nonNegotiable || []), ...(req.goodToHave || [])].map(a => a.ingredient).filter(Boolean);
  const benefits = (req.keyBenefits || (req.briefDetail || {}).benefits || []);
  return "MARKETING BRIEF — " + req.brand + " · " + req.title + "\n\n" +
    "Positioning: a " + (req.category || "product") + " formulated to help " + (benefits[0] || "address the brand's core concern") + ".\n\n" +
    "Key claims (soft, label-safe):\n" + (actives.length ? actives : ["the hero active"]).map(a => "• Powered by " + a + " — helps support, aid and boost visible results.").join("\n") + "\n\n" +
    "Texture & experience: lightweight, fast-absorbing, non-greasy finish.\n\n" +
    "[Placeholder tone. Claims will be tightened against the actives/label-claim sheet and learned from the existing marketing-brief database once loaded.]";
}
function PostApproval({ req }) {
  window.useStore();
  const [gen, setGen] = useState(null); // { key, text }
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
      {[["ingredient", "Ingredient sheet", "INCI list for the client", genIngredientList], ["marketing", "Marketing brief", "Claims + usage the brand can market with", genMarketingBrief]].map(([key, l, sub, builder]) => {
        const d = del[key];
        return <div key={key} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div className="row between">
            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{l} <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)", fontWeight: 700 }}>AI · beta</span></div><div className="body-sm" style={{ fontSize: 12 }}>{sub}</div></div>
            <div className="row gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setGen({ key, text: builder(req) })}><Icon name="note" size={13} /> Generate (AI)</button>
              {d && d.done ? <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}><Icon name="check" size={11} color="var(--approved-fg)" /> Submitted</span>
                : <button className="btn btn-sm" onClick={() => window.NaturisStore.setDeliverable(req.id, key, techOfReq(req))}>Mark submitted</button>}
            </div>
          </div>
          {gen && gen.key === key && <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "var(--page)" }}>
            <div className="row between" style={{ marginBottom: 6 }}><span className="label">Generated draft — review & edit before sending</span>
              <button className="btn btn-sm btn-secondary" onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText(gen.text); } catch (e) {} }}><Icon name="note" size={12} /> Copy</button></div>
            <textarea className="textarea" defaultValue={gen.text} style={{ minHeight: 180, fontSize: 11.5, width: "100%" }} />
            <div className="body-sm" style={{ fontSize: 10.5, marginTop: 4, color: "var(--muted)" }}>Placeholder generation — wired to the real brief DB / actives sheet / formulation format once shared.</div>
          </div>}
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
  const LSTAGES = DL.LAB_LIVE_STAGES;
  // dispatch only unlocks once the live status has genuinely reached "Ready to send" (QC done) — not by jumping ahead
  const readyIdx = (LSTAGES || []).indexOf("Ready to send");
  const liveIdx = req.labStage ? (LSTAGES || []).indexOf(req.labStage) : -1;
  const reachedReady = liveIdx >= readyIdx || ["Ready for dispatch", "Dispatch awaiting SPOC approval"].includes(req.status);
  const showDispatch = reachedReady && !POST.includes(req.status);
  const postApproval = ["Client approved", "In stability", "Archived"].includes(req.status);
  const booking = (req.evaluation || {}).booking;
  const curLS = req.labStage || (req.status === "Accepted — date committed" ? null : null);
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
          <ProductBriefButton req={req} />
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

    {/* your station slot for this deal — booked by the planning desk, read-only here */}
    {!postApproval && <div className="card" style={{ padding: "12px 16px" }}>
      <div className="row between wrap gap-2" style={{ alignItems: "center" }}>
        <div className="row gap-2" style={{ alignItems: "center" }}><Icon name="calendar" size={16} color="var(--brand-accent)" />
          <div><div style={{ fontSize: 13, fontWeight: 700 }}>Your station slot</div>
            <div className="body-sm" style={{ fontSize: 11.5 }}>Booked by the Lab Planner — you can't change it here.</div></div></div>
        {booking ? <span className="pill" style={{ background: "var(--brand)", color: "#fff", fontWeight: 700 }}><Icon name="check" size={12} color="#fff" /> {req.evaluation.slot}</span>
          : <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)", fontWeight: 700 }}>awaiting a slot from planning</span>}
      </div>
    </div>}

    {!postApproval && (() => {
      const isLab = (role || "lab") === "lab";
      const curIdx = curLS ? LSTAGES.indexOf(curLS) : -1;
      const REWORK = "Rework / retrial";
      const reworkIdx = LSTAGES.indexOf(REWORK);
      const qcStart = LSTAGES.indexOf("QC testing pending");
      const lastSettable = LSTAGES.indexOf("Ready to send"); // Dispatched is set on SPOC approval, not here
      // forward target — the next stage, skipping "Rework / retrial" (rework is a QC-fail branch, not a mandatory step)
      const fwdIdx = (() => { let n = (curIdx < 0 ? 0 : curIdx + 1); if (LSTAGES[n] === REWORK) n += 1; return n; })();
      const setStage = st => { if (st !== "Dispatched") window.NaturisStore.setLabStage(req.id, st, techOfReq(req)); };
      // sequential rule: advance one (rework skipped), step back one, or branch to rework once QC has begun
      const canClick = si => { if (!isLab || LSTAGES[si] === "Dispatched") return false;
        if (curIdx < 0) return si === 0;
        if (si === curIdx - 1) return true;                       // back one
        if (si === fwdIdx && fwdIdx <= lastSettable) return true;  // forward one
        if (LSTAGES[si] === REWORK && curIdx >= qcStart) return true; // QC fail → rework
        return false; };
      return <div className="card" style={{ borderTop: "3px solid var(--brand-accent)" }}>
        <div className="row between wrap" style={{ alignItems: "flex-start", gap: 8 }}>
          <SectionTitle sub={isLab ? "You own this — move one stage at a time (the next step or back one). Sales sees the update instantly." : "The 10 live stages the lab runs — updated by the lab technician; you're viewing it live."}>Live lab status</SectionTitle>
          {isLab && <div className="row gap-2">
            <button className="btn btn-secondary btn-sm" disabled={curIdx <= 0} onClick={() => { const p = LSTAGES[curIdx - 1]; if (p) setStage(p); }} title="Move the live status back one stage">‹ Back a stage</button>
            <button className="btn btn-sm" disabled={curIdx >= lastSettable} onClick={() => { const n = LSTAGES[fwdIdx]; if (n && fwdIdx <= lastSettable) setStage(n); }} title="Advance the live status to the next stage">Advance stage ›</button>
          </div>}
        </div>
        {isLab && curIdx < 0 && <div className="body-sm" style={{ fontSize: 12, color: "var(--coral-dark)", marginTop: 6 }}><Icon name="alert" size={12} color="var(--coral-dark)" /> No live status set yet — click the first stage to start tracking.</div>}
        <div className="col" style={{ marginTop: 8 }}>
          {LSTAGES.map((st, si) => { const onSt = curLS === st; const doneSt = curIdx > si;
            const meta = (req.labStageLog || {})[st]; const reached = onSt || doneSt; const locked = st === "Dispatched"; const clickable = canClick(si);
            return <div key={st} style={{ borderBottom: si < LSTAGES.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div role={clickable ? "button" : undefined} onClick={clickable ? () => setStage(st) : undefined}
                onMouseEnter={clickable ? e => { if (!onSt) e.currentTarget.style.background = "var(--brand-wash)"; } : undefined}
                onMouseLeave={clickable ? e => { e.currentTarget.style.background = onSt ? "var(--brand-wash)" : "transparent"; } : undefined}
                className="row gap-3" style={{ alignItems: "center", padding: "9px 8px", borderRadius: 8, cursor: clickable ? "pointer" : "default", background: onSt ? "var(--brand-wash)" : "transparent", transition: "background .1s" }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: onSt ? "var(--brand)" : doneSt ? "var(--approved-bg)" : "var(--page)", border: onSt ? "none" : "1px solid var(--border)" }}>
                  {doneSt ? <Icon name="check" size={12} color="var(--approved-fg)" /> : onSt ? <span style={{ width: 7, height: 7, borderRadius: 999, background: "#fff" }} /> : <span className="body-sm" style={{ fontSize: 9, color: "var(--muted)" }}>{si + 1}</span>}</span>
                <span style={{ fontSize: 13, fontWeight: reached ? 700 : 500, color: onSt ? "var(--brand)" : reached ? "var(--ink)" : "var(--muted)" }}>{st}</span>
                {onSt && <span className="pill pill-sm" style={{ background: "var(--brand)", color: "#fff", fontWeight: 700 }}>current</span>}
                {locked && <span className="pill pill-sm" style={{ background: "var(--page)", color: "var(--muted)", fontWeight: 600 }} title="Set automatically when the SPOC approves dispatch"><Icon name="lock" size={9} color="var(--muted)" /> on SPOC approval</span>}
                <div className="grow" />
                {meta && <span className="body-sm" style={{ fontSize: 11, color: "var(--grey)" }}>{meta.at} · {meta.by}</span>}
              </div>
              {/* optional note (e.g. QC remark) — editable by the lab tech on reached stages, read-only elsewhere */}
              {isLab && reached ? <div className="row gap-2" style={{ alignItems: "center", padding: "0 8px 8px 33px" }}>
                <Icon name="note" size={12} color="var(--muted)" />
                <input className="input" style={{ height: 30, fontSize: 12, flex: 1, maxWidth: 520 }} placeholder="Add a note for this stage (optional) — e.g. QC: viscosity ok, pH 5.4"
                  defaultValue={(meta || {}).note || ""} onClick={e => e.stopPropagation()}
                  onBlur={e => { const v = e.target.value.trim(); if (v !== (((meta || {}).note) || "")) window.NaturisStore.setLabStageNote(req.id, st, v, techOfReq(req)); }} />
              </div> : (meta && meta.note) ? <div className="body-sm" style={{ fontSize: 11.5, color: "var(--muted)", padding: "0 8px 8px 33px" }}><Icon name="note" size={11} color="var(--muted)" /> {meta.note}</div> : null}
            </div>; })}
        </div>
      </div>;
    })()}
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
  const [q, setQ] = useState(""); const [fam, setFam] = useState("all"); const [brand, setBrand] = useState("all"); const [type, setType] = useState("all"); const [stat, setStat] = useState("all");
  const req = sel && reqs.find(r => r.id === sel);
  const fams = Array.from(new Set(all.map(r => r.categoryGroup).filter(Boolean)));
  const brands = Array.from(new Set(all.map(r => r.brand)));
  const LIVE_STAGES = DL.LAB_LIVE_STAGES || [];
  const shown = all.filter(r => (fam === "all" || r.categoryGroup === fam) && (brand === "all" || r.brand === brand) && (type === "all" || r.projectType === type) && (stat === "all" || r.labStage === stat) && (!q || (r.id + " " + r.brand + " " + r.title + " " + (r.tracker || "")).toLowerCase().includes(q.toLowerCase())));
  const tatZone = days => days < 7 ? ["var(--approved-bg)", "var(--approved-fg)", days + " days"] : days <= 10 ? ["var(--review-bg)", "var(--review-fg)", days + " days"] : ["var(--coral-wash)", "var(--coral-dark)", days + " days"];

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

  return <div className="col gap-4">
    <PageHead title="Live query tracking" sub={"Every live lab query — acknowledged through dispatch · Last updated " + new Date().toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} actions={<button className="btn btn-secondary btn-sm" onClick={() => { const esc = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; const csv = ["S.No,Query Code,Sales POC,Product,Client,Status,Requested,Target Dispatch,TAT (days),Project Type,Remarks"].concat(shown.map((r, i) => [i + 1, r.id, r.submittedBy, r.title, r.brand, r.status, r.submittedAt, r.targetSampleDate, r.age, r.projectType, (r.briefDetail || {}).notes || ""].map(esc).join(","))).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" })); a.download = "live-query-tracking.csv"; a.click(); URL.revokeObjectURL(a.href); }}><Icon name="download" size={14} /> Export</button>} />
    <div className="row gap-2 wrap" style={{ alignItems: "center" }}>
      <div style={{ position: "relative", width: 230 }}><span style={{ position: "absolute", left: 10, top: 9 }}><Icon name="search" size={15} color="var(--muted)" /></span>
        <input className="input" style={{ paddingLeft: 32, height: 34, fontSize: 12 }} placeholder="Search id, brand, title, chemist…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <select className="select" style={{ width: 150, height: 34, fontSize: 12 }} value={fam} onChange={e => setFam(e.target.value)}><option value="all">All categories</option>{fams.map(f => <option key={f}>{f}</option>)}</select>
      <select className="select" style={{ width: 140, height: 34, fontSize: 12 }} value={brand} onChange={e => setBrand(e.target.value)}><option value="all">All brands</option>{brands.map(b => <option key={b}>{b}</option>)}</select>
      <select className="select" style={{ width: 120, height: 34, fontSize: 12 }} value={type} onChange={e => setType(e.target.value)}><option value="all">All types</option>{["EPD", "REN", "TT", "NPD"].map(t => <option key={t}>{t}</option>)}</select>
      <select className="select" style={{ width: 180, height: 34, fontSize: 12 }} value={stat} onChange={e => setStat(e.target.value)}><option value="all">All stages</option>{LIVE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}</select>
    </div>
    <div className="body-sm" style={{ fontSize: 12 }}>{shown.length} live quer{shown.length !== 1 ? "ies" : "y"}</div>
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }}>
        <table className="tbl" style={{ minWidth: 1420 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}><tr>{["S.No", "Query Code", "Sales POC", "Product", "Client", "Status", "Requested", "Target dispatch", "TAT", "Type", "Remarks", ""].map(h => <th key={h} style={{ background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", padding: "9px 12px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>
            {shown.map((r, i) => { const z = tatZone(r.age || 0); const term = ["Archived", "Client approved"].includes(r.status);
              return <tr key={r.id} className="clickable" onClick={() => setSel(r.id)} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
              <td style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)" }}>{i + 1}</td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><span className="row gap-1" style={{ alignItems: "center" }}>{r.vvip && <Icon name="star" size={12} color="#D97706" />}<span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brand-mid)" }}>{r.id}</span></span></td>
              <td style={{ padding: "8px 12px", fontSize: 11.5, whiteSpace: "nowrap" }}>{r.submittedBy}</td>
              <td style={{ padding: "8px 12px", fontSize: 12.5, fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
              <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>{r.brand}</td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><StatusPill status={r.status} size="sm" />{r.labStage ? <span className="body-sm" style={{ fontSize: 10, display: "block", color: "var(--brand)", marginTop: 2 }}>{r.labStage}</span> : null}</td>
              <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{(r.submittedAt || "—").replace(" 2026", "")}</td>
              <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{(r.targetSampleDate || r.committedDate || "—").replace(" 2026", "")}</td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{term ? <span className="body-sm">—</span> : <span className="pill pill-sm" style={{ background: z[0], color: z[1], fontWeight: 700 }}>{z[2]}</span>}</td>
              <td style={{ padding: "8px 12px" }}><ProjectTypePill type={r.projectType} /></td>
              <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--muted)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(r.briefDetail || {}).notes || "—"}</td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); setSel(r.id); }}>Open <Icon name="arrowRight" size={12} /></button></td>
            </tr>; })}
            {!shown.length && <tr><td colSpan={12} style={{ padding: 34, textAlign: "center" }}><span className="body-sm">No live queries match these filters.</span></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}

/* LB-05 archive kept (reachable via deep link / search) */
function LB05_Approved() {
  window.useStore();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const done = DL.REQUIREMENTS.filter(r => ["Dispatch awaiting SPOC approval", "Sent to client", "Client approved", "In stability", "Archived"].includes(r.status));
  const parse = s => { const t2 = Date.parse(s); return isNaN(t2) ? null : t2; };
  const rows = done.filter(r => { const dd = parse(r.dispatchedOn); if (!dd) return !from && !to;
    if (from && dd < Date.parse(from)) return false; if (to && dd > Date.parse(to) + 86399000) return false; return true; });
  return <div className="col gap-5">
    <PageHead title="Dispatch record" sub="Every dispatch, past and current — filter any date range. QC intimation, stability start & approval are editable inline."
      actions={<div className="row gap-2" style={{ alignItems: "center" }}>
        <span className="label" style={{ fontSize: 9 }}>From</span><input className="input" type="date" style={{ width: 150, height: 34 }} value={from} onChange={e => setFrom(e.target.value)} />
        <span className="label" style={{ fontSize: 9 }}>To</span><input className="input" type="date" style={{ width: 150, height: 34 }} value={to} onChange={e => setTo(e.target.value)} />
        {(from || to) && <button className="btn btn-ghost btn-sm" onClick={() => { setFrom(""); setTo(""); }}>Clear</button>}
      </div>} />
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {rows.length ? <div style={{ overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }}><table className="tbl" style={{ minWidth: 1700 }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 2 }}><tr>{["S.No", "Product", "Client", "Sent to", "Code", "Pcs", "Qty", "Dispatched", "Dispatch note", "Photos", "Purpose", "Docket", "Courier", "Intimation to QC", "Stability start", "Approval"].map(h => <th key={h} style={{ background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", padding: "8px 10px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
        <tbody>{window.vvipSort(rows).map((r, i) => { const dp = r.dispatch || {}; const set = (k, v) => window.NaturisStore.setDispatchField(r.id, k, v, techOfReq(r));
          return <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "6px 10px", fontSize: 11, color: "var(--muted)" }}>{i + 1}</td>
            <td style={{ padding: "6px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}><span className="row gap-2">{r.vvip && <VVIPBadge size="sm" />}{r.title}</span></td>
            <td style={{ padding: "6px 10px", fontSize: 12, whiteSpace: "nowrap" }}><b>{r.brand}</b></td>
            <td style={{ padding: "6px 10px", fontSize: 11.5, whiteSpace: "nowrap" }}>{dp.sentTo || ((r.briefDetail || {}).shipName) || (r.brand + " · " + (r.submittedBy || ""))}</td>
            <td style={{ padding: "6px 10px" }}><span className="mono" style={{ fontSize: 11 }}>{r.currentNcl || "—"}</span></td>
            <td style={{ padding: "6px 10px", fontSize: 11.5 }}>{dp.pcs || 2}</td>
            <td style={{ padding: "6px 10px", fontSize: 11.5, whiteSpace: "nowrap" }}>{r.moq}</td>
            <td style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>{(r.dispatchedOn || "—").replace(" 2026", "")}</td>
            <td style={{ padding: "6px 10px", fontSize: 11, color: "var(--muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={dp.noteText || ""}>{dp.noteText || (dp.note ? "Dispatch note attached" : "—")}</td>
            <td style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>{dp.photos ? <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)", fontWeight: 700 }}><Icon name="camera" size={10} color="var(--brand-mid)" /> {dp.photos}</span> : "—"}</td>
            <td style={{ padding: "6px 10px", fontSize: 11, color: "var(--muted)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dp.purpose || "Samples as per request for evaluation"}</td>
            <td style={{ padding: "6px 10px" }}><span className="mono" style={{ fontSize: 10.5 }}>{dp.docket || ("DTDC-88" + (4200 + (parseInt(r.id.slice(-3)) || 0)))}</span></td>
            <td style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>{dp.courier || (dp.docket && dp.docket.indexOf("Z") === 0 ? "Blue Dart" : "DTDC")}</td>
            <td style={{ padding: "4px 8px" }}><select className="select" style={{ height: 28, fontSize: 11, width: 90 }} value={dp.qcIntimation || "No"} onChange={e => set("qcIntimation", e.target.value)}><option>No</option><option>Yes</option></select></td>
            <td style={{ padding: "4px 8px" }}><input className="input" type="date" style={{ height: 28, fontSize: 11, width: 130 }} value={dp.stabilityStart || ""} onChange={e => set("stabilityStart", e.target.value)} /></td>
            <td style={{ padding: "4px 8px" }}><select className="select" style={{ height: 28, fontSize: 11, width: 120 }} value={dp.approvalStatus || (["Client approved", "In stability", "Archived"].includes(r.status) ? "Approved" : "Pending")} onChange={e => set("approvalStatus", e.target.value)}><option>Pending</option><option>Approved</option><option>Rejected</option><option>Rework</option></select></td>
          </tr>; })}</tbody></table></div>
        : <div style={{ textAlign: "center", padding: 36 }}><Icon name="search" size={20} color="var(--brand-light)" /><div className="body-sm" style={{ marginTop: 6 }}>No dispatches in this date range.</div></div>}
    </div>
  </div>;
}

/* ====================================================================
   PRODUCT BRIEF — client-ready spec sheet (Mr. DIY catalog format)
   ==================================================================== */
function ProductBriefPopup({ open, onClose, reqId }) {
  window.useStore();
  const r = reqId ? window.NaturisStore.get(reqId) : null;
  if (!open || !r) return null;
  const bd = r.briefDetail || {};
  const sen = r.sensory || {};
  const _seen = {}; const actives = [...(r.nonNegotiable || []), ...(r.goodToHave || []), ...(r.actives || [])].filter(a => { if (!a || !a.ingredient || _seen[a.ingredient]) return false; _seen[a.ingredient] = 1; return true; });
  const keyActive = actives[0] ? (actives[0].ingredient + (actives[0].concentration ? " (" + actives[0].concentration + ")" : "")) : "Per formulation";
  const famSkin = { "Skin Care": "Normal to Dull Skin", "Hair Care": "All Hair Types", "Sun Care": "All Skin Types", "Body Care": "All Skin Types", "Colour": "All Skin Types" }[r.categoryGroup] || "All Skin Types";
  const rows = [
    ["Core Function", r.category],
    ["Texture", sen.texture || r.category],
    ["Skin Type", famSkin],
    ["Key Active", keyActive],
    ["pH Range", r.categoryGroup === "Hair Care" ? "4.50 – 5.50" : "5.50 – 6.50"],
    ["Pack Size", bd.fillVol || r.packaging || "—"],
    ["Packaging", bd.packSize || r.packaging || "Tube"],
    ["Mineral Oil Free", "Yes"], ["Silicone Free", "Yes"],
  ];
  const benefits = [];
  (r.claims || []).forEach(c => benefits.push(c));
  actives.slice(0, 4).forEach(a => benefits.push(a.ingredient + (a.concentration ? " (" + a.concentration + ")" : "") + " — targeted active in this formulation"));
  if (!benefits.length) benefits.push("Clean, breathable formulation — mineral-oil and silicone free");
  return <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.35)", zIndex: 95 }} />
    <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(720px, 94vw)", maxHeight: "90vh", overflowY: "auto", background: "var(--surface)", borderRadius: 16, boxShadow: "0 24px 64px rgba(15,23,42,.3)", zIndex: 96 }}>
      <div style={{ padding: "20px 28px", borderBottom: "2px solid var(--brand)" }}>
        <div className="row between"><NaturisLogo size={16} /><button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button></div>
        <div className="body-sm" style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>| Product Brief — {r.brand} | 2026</div>
        <div style={{ marginTop: 14, background: "var(--brand)", color: "#fff", padding: "8px 14px", borderRadius: 6, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: ".04em" }}>{r.categoryGroup} — {r.category}</div>
      </div>
      <div style={{ padding: "20px 28px" }}>
        <div className="row gap-2" style={{ alignItems: "baseline" }}><span className="mono" style={{ color: "var(--brand-mid)", fontWeight: 700, fontSize: 14 }}>{r.currentNcl || r.aiCode || r.id}</span><span className="h2" style={{ fontSize: 22 }}>| {r.title}</span></div>
        <div className="body-sm" style={{ fontStyle: "italic", color: "var(--brand-accent)", marginTop: 2 }}>{r.category} · {sen.fragrance || "signature"} · crafted for {r.brand}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
          <tbody>{rows.map(([k, v], i) => <tr key={k} style={{ background: i % 2 ? "var(--page)" : "var(--surface)" }}>
            <td style={{ padding: "9px 14px", fontWeight: 700, fontSize: 12.5, width: 200, borderBottom: "1px solid var(--border)" }}>{k}</td>
            <td style={{ padding: "9px 14px", fontSize: 12.5, borderBottom: "1px solid var(--border)" }}>{v}</td>
          </tr>)}</tbody>
        </table>
        <div className="h3" style={{ color: "var(--brand)", marginTop: 22, marginBottom: 10 }}>Key Benefits</div>
        <div className="col gap-2">{benefits.map((b, i) => <div key={i} className="row gap-2" style={{ alignItems: "flex-start" }}><Icon name="check" size={14} color="var(--approved-fg)" style={{ marginTop: 2, flexShrink: 0 }} /><span className="body-sm" style={{ fontSize: 12.5 }}>{b}</span></div>)}</div>
        <div className="body-sm" style={{ fontSize: 10, color: "var(--grey)", marginTop: 24, paddingTop: 12, borderTop: "1px solid var(--border)", textAlign: "center" }}>Confidential — For Trade Reference Only · Naturis Cosmetics Pvt. Ltd. · info@naturiscosmetics.in</div>
      </div>
    </div>
  </>;
}
function ProductBriefButton({ req }) {
  const [open, setOpen] = useState(false);
  return <><button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}><Icon name="note" size={13} /> Product brief</button>
    <ProductBriefPopup open={open} onClose={() => setOpen(false)} reqId={req.id} /></>;
}

/* ====================================================================
   LB-06 · STABILITY TRACKER (6-month log — matches the stability sheet)
   ==================================================================== */
function LB06_Stability({ nav }) {
  window.useStore();
  const D = window.NaturisData;
  const now = new Date();
  const parseDMY = s => { const p = (s || "").split("-"); return p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]) : null; };
  // live in-stability requirements first, then the seeded historical log
  const live = D.REQUIREMENTS.filter(r => r.status === "In stability").map((r, i) => {
    const st = r.stability || {}; const cat = D.fitCategory ? D.fitCategory(D.fitFinal ? D.fitFinal(D.FIT_SCORES[(D.ACCOUNTS.find(a => a.name === r.brand) || {}).id] || {}) : 6) : { label: "" };
    return { sno: "L" + (i + 1), reqId: r.id, charged: (r.dispatchedOn || "—").replace(" 2026", ""), product: r.title, batch: r.currentNcl || r.id, mfg: "—", initial: (r.dispatchedOn || "—").replace(" 2026", ""), m: st.m || ["", "", "", "", "", ""], done: st.month || 1, location: "NC/RD/live", client: r.brand, type: (st.months || 3) + "-mo", grade: (cat && cat.label || "—").replace(" fit", ""), condition: "RT + 40/75°C", live: true };
  });
  const rows = [...live, ...(D.STABILITY_RUNS || [])];
  return <div className="col gap-4">
    <PageHead title="Stability tracker" sub="6-month shelf-life log · RT + 40/75°C accelerated. Green = pull completed; live in-stability projects are pinned on top."
      actions={<button className="btn btn-secondary btn-sm"><Icon name="download" size={14} /> Export</button>} />
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto", maxHeight: "72vh", overflowY: "auto" }}>
        <table className="tbl" style={{ minWidth: 1700 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}><tr>{["S.No", "Charged", "Product", "Client", "Location", "Batch No", "MFG", "Initial", "M1", "M2", "M3", "M4", "M5", "M6", "Type", "Grade", "Condition"].map(h => <th key={h} style={{ background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", padding: "8px 10px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>{rows.map(r => <tr key={r.sno} style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "6px 10px", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{r.live ? <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)", fontWeight: 700 }}>live</span> : r.sno}</td>
            <td style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>{r.charged}</td>
            <td style={{ padding: "6px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{r.product}</td>
            <td style={{ padding: "6px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{r.client}</td>
            <td style={{ padding: "6px 10px", fontSize: 10.5, whiteSpace: "nowrap" }}><span className="mono">{r.location}</span></td>
            <td style={{ padding: "6px 10px" }}><span className="mono" style={{ fontSize: 10.5 }}>{r.batch}</span></td>
            <td style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>{r.mfg}</td>
            <td style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>{r.initial}</td>
            {[0, 1, 2, 3, 4, 5].map(k => { const done = k < r.done; const dt = (r.m || [])[k];
              // live in-stability runs are editable: the lab tech logs the actual pull date per month
              if (r.reqId) return <td key={k} style={{ padding: "4px 4px", textAlign: "center", background: dt ? "var(--approved-bg)" : "var(--page)" }}>
                <input type="date" className="input" style={{ height: 26, fontSize: 9.5, width: 116, padding: "2px 4px", border: "1px solid var(--border)" }} value={dt || ""} title={"Month " + (k + 1) + " pull date"}
                  onChange={e => window.NaturisStore.setStabilityMonth(r.reqId, k, e.target.value)} /></td>;
              return <td key={k} style={{ padding: "6px 8px", fontSize: 10, whiteSpace: "nowrap", textAlign: "center", background: done ? "var(--approved-bg)" : "var(--page)", color: done ? "var(--approved-fg)" : "var(--border-strong)", fontWeight: done ? 700 : 400 }}>{done ? (dt || "✓") : (dt || "—")}</td>; })}
            <td style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}>{r.type}</td>
            <td style={{ padding: "6px 10px" }}><span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)", fontWeight: 700 }}>{r.grade}</span></td>
            <td style={{ padding: "6px 10px", fontSize: 10.5, whiteSpace: "nowrap" }}>{r.condition}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

Object.assign(window, { ProductBriefButton, ProductBriefPopup });
Object.assign(window.SCREENS, {
  "LB-06": LB06_Stability,
  "LB-01": LB01_Dashboard, "LB-02": LB02_Incoming, "LB-EVAL": LB_Eval, "LB-03": LB03_Live, "LB-05": LB05_Approved,
});
