/* ============================================================
   screen-mgmt.jsx — Management (dark mode, read-only — no action buttons)
   MG-01 Command centre · MG-02 Brands · MG-03 Reports
   (CI-01 shared from screen-manager.jsx)
   ============================================================ */
window.SCREENS = window.SCREENS || {};
const DG = window.NaturisData;

/* ====================================================================
   MG-01 · COMMAND CENTRE
   ==================================================================== */
function Funnel({ steps, onStep, active }) {
  const max = steps[0].value || 1;
  return <div className="col gap-2">{steps.map((s, i) => <div key={i} onClick={() => onStep && onStep(s.label)} style={{ cursor: onStep ? "pointer" : "default", padding: 2, borderRadius: 8, background: active === s.label ? "var(--brand-wash)" : "transparent" }}>
    <div className="row between" style={{ marginBottom: 3 }}><span className="body-sm" style={{ fontSize: 12 }}>{s.label}</span><span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{s.value}</span></div>
    <div style={{ height: 26, borderRadius: 6, background: "var(--brand-wash)", overflow: "hidden" }}>
      <div style={{ width: `${(s.value / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, var(--brand), var(--brand-accent))`, borderRadius: 6, transition: "width .5s" }} /></div>
  </div>)}</div>;
}

const FUNNEL_BUCKETS = {
  "Logged": null, // all
  "Approved": ["Approved", "Acknowledged", "In evaluation", "Query raised", "Accepted — date committed", "Formulation", "Trial", "QC", "Fill", "Ready for dispatch", "Dispatch awaiting SPOC approval", "Sent to client", "Client approved", "In stability", "Archived"],
  "In lab": ["Acknowledged", "In evaluation", "Accepted — date committed", "Formulation", "Trial", "QC", "Fill", "Ready for dispatch"],
  "Dispatched": ["Dispatch awaiting SPOC approval", "Sent to client", "Client approved", "In stability", "Archived"],
  "Client-approved": ["Client approved", "In stability", "Archived"],
};
function MG01_Command({ nav }) {
  window.useStore();
  const reqs = DG.REQUIREMENTS;
  const vvips = reqs.filter(r => r.vvip && r.status !== "Archived");
  const breaches = reqs.filter(r => DG.slaStatus(r).level === "red");
  const openFlags = reqs.flatMap(r => (r.flags || []).filter(f => !f.resolved).map(f => ({ f, r })));
  const poAwaited = reqs.filter(r => r.prePOComplete);
  const typeCounts = ["EPD", "REN", "TT", "NPD"].map(t => ({ t, n: reqs.filter(r => r.projectType === t).length }));
  const [popupId, setPopupId] = useState(null);
  const [stage, setStage] = useState(null);
  const [vvipPick, setVvipPick] = useState("");
  const funnelSteps = Object.keys(FUNNEL_BUCKETS).map(label => ({ label, value: FUNNEL_BUCKETS[label] ? reqs.filter(r => FUNNEL_BUCKETS[label].includes(r.status)).length : reqs.length }));
  const stageReqs = stage ? (FUNNEL_BUCKETS[stage] ? reqs.filter(r => FUNNEL_BUCKETS[stage].includes(r.status)) : reqs) : [];
  const stakeholderOf = r => { const acc = DG.ACCOUNTS.find(a => a.name === r.brand); const ci = (DG.CI_DATA || {})[acc && acc.id] || {}; const smx = (ci.stakeholders && ci.stakeholders[0]) || (acc && acc.decisionMakers[0]); return smx ? smx.name : "—"; };
  const jobValue = r => { const qty = parseInt(String(r.moq).replace(/[^0-9]/g, "")) || 0; const fg = (r.briefDetail || {}).fg || 0; return qty && fg ? "₹" + ((qty * fg) / 100000).toFixed(1) + "L" : "—"; };
  return <div className="col gap-5">
    {window.RequirementPopup && <window.RequirementPopup open={!!popupId} onClose={() => setPopupId(null)} reqId={popupId} />}
    <div><div className="h1">Command centre</div><div className="body" style={{ color: "var(--muted)", marginTop: 4 }}>Read-only · live across all roles · {vvips.length} VVIP projects in flight.</div></div>

    {/* 1 — VVIP projects, always top */}
    <div className="card" style={{ borderTop: "3px solid #D97706" }}>
      <div className="row gap-2" style={{ marginBottom: 14 }}><Icon name="star" size={16} color="#D97706" /><span className="h3">VVIP projects</span></div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {vvips.map(r => <div key={r.id} onClick={() => setPopupId(r.id)} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--brand-wash)", cursor: "pointer" }}>
          <div className="row gap-2" style={{ marginBottom: 3 }}><VVIPStar /><span style={{ fontWeight: 700, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</span></div>
          <div className="row gap-2" style={{ marginBottom: 7 }}><ProjectTypePill type={r.projectType} /><StatusPill status={r.status} size="sm" /></div>
          <div className="grid grid-2" style={{ gap: "2px 8px" }}>
            {[["SPOC", r.submittedBy.split(" ")[0]], ["Started", r.submittedAt ? r.submittedAt.replace(" 2026", "") : "—"], ["Qty × price", (r.moq || "—").replace(" units", "") + ((r.briefDetail || {}).fg ? " × ₹" + r.briefDetail.fg : "")], ["Job value", jobValue(r)]].map(([l, v]) =>
              <div key={l} style={{ minWidth: 0 }}><span className="label" style={{ fontSize: 7 }}>{l}</span><div style={{ fontWeight: 600, fontSize: 10.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div></div>)}
          </div>
        </div>)}
      </div>
      {/* management override — quiet footer, not competing with the cards */}
      <div className="row gap-2" style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--border)", alignItems: "center", flexWrap: "wrap" }}>
        <span className="body-sm" style={{ fontSize: 11.5 }}>Management override — promote a project the system didn't flag:</span>
        <select className="select" style={{ width: 240, height: 32, fontSize: 12 }} value={vvipPick} onChange={e => setVvipPick(e.target.value)}>
          <option value="">Choose a project…</option>
          {reqs.filter(r => !r.vvip && r.status !== "Archived").map(r => <option key={r.id} value={r.id}>{r.brand} · {r.title}</option>)}
        </select>
        <button className="btn btn-sm btn-secondary" disabled={!vvipPick} onClick={() => { window.NaturisStore.setVvipOverride(vvipPick, true, "Rahul Tandon"); setVvipPick(""); }}><Icon name="star" size={13} /> Mark VVIP</button>
      </div>
    </div>

    {/* 2+3 — red flags & immediate attention, side by side to save scroll */}
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
    <div className="card" style={{ borderTop: "3px solid var(--coral)" }}>
      <SectionTitle sub="Open flags across the pipeline">Red flags</SectionTitle>
      {openFlags.length ? <div className="col gap-2">{openFlags.slice(0, 6).map(({ f, r }, k) => <div key={k} className="row between clickable" style={{ padding: "9px 12px", borderRadius: 8, background: "var(--coral-wash)", cursor: "pointer" }} onClick={() => setPopupId(r.id)}>
        <div className="row gap-2" style={{ minWidth: 0 }}><Icon name="flag" size={13} color="var(--coral-dark)" /><span style={{ fontWeight: 700, fontSize: 12.5, color: "var(--coral-dark)" }}>{f.typeLabel || f.type}</span><span style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</span></div>
        <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--coral-dark)" }}>owner · {f.owner}</span>
      </div>)}{openFlags.length > 6 && <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => nav("MG-04")}>+{openFlags.length - 6} more → Master tracker</button>}</div> : <div className="body-sm">No open flags. 🎉</div>}
    </div>

    {/* 3 — immediate attention: SLA breaches + customer-ready awaiting PO */}
    <div className="col gap-4">
    <div className="card" style={{ borderTop: "3px solid var(--review-fg)" }}>
      <SectionTitle sub="SLA breaches and customer-ready projects whose PO hasn't landed">Immediate attention</SectionTitle>
      <div className="col gap-2">
        {poAwaited.slice(0, 5).map(r => <div key={"po" + r.id} className="row between clickable" style={{ padding: "9px 12px", borderRadius: 8, background: "#FEF3C7", cursor: "pointer" }} onClick={() => setPopupId(r.id)}>
          <span className="row gap-2" style={{ minWidth: 0, alignItems: "center" }}>{r.vvip ? <VVIPStar /> : <Icon name="clock" size={12} color="#92400E" />}<span style={{ fontSize: 12.5, fontWeight: 600 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</span></span>
          <span className="pill pill-sm" style={{ background: "var(--surface)", color: "#92400E", fontWeight: 700 }}>Customer-ready · PO awaited</span></div>)}
        {breaches.slice(0, 5).map(r => <div key={r.id} className="row between clickable" style={{ padding: "9px 12px", borderRadius: 8, background: "var(--page)", cursor: "pointer" }} onClick={() => setPopupId(r.id)}>
          <span className="row gap-2" style={{ minWidth: 0, alignItems: "center" }}>{r.vvip && <VVIPStar />}<span style={{ fontSize: 12.5, fontWeight: 600 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</span></span><SLAIndicator req={r} /></div>)}
        {(poAwaited.length + breaches.length) > 10 && <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => nav("MG-04")}>+{(poAwaited.length + breaches.length) - 10} more → Master tracker</button>}
        {!breaches.length && !poAwaited.length && <div className="body-sm">Nothing needs immediate attention.</div>}
      </div>
    </div>
    <div className="grid grid-2 gap-3">
      <Stat label="Conversion (brief→approved)" value="68" suffix="%" sub="+5% vs last Q" color="var(--ink)" />
      <Stat label="First-iteration success" value="61" suffix="%" sub="target 65%" color="var(--ink)" />
    </div>
    </div>
    </div>

    {/* compact analytics strip: type mix · funnel · top clients in one short row */}
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.1fr 1fr", alignItems: "start" }}>
      <div className="card">
        <SectionTitle>Project-type distribution</SectionTitle>
        <div className="col gap-2">
          {typeCounts.map(({ t, n }) => { const max = Math.max(...typeCounts.map(x => x.n), 1);
            return <div key={t} className="row gap-2" style={{ alignItems: "center" }}>
              <span style={{ width: 44, flexShrink: 0 }}><ProjectTypePill type={t} /></span>
              <div className="bar-track" style={{ flex: 1, height: 10 }}><div className="bar-fill" style={{ width: (n / max * 100) + "%" }} /></div>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, width: 18, textAlign: "right" }}>{n}</span>
            </div>; })}
        </div>
      </div>
      <div className="card">
        <SectionTitle sub="Click a stage to drill in">Lifecycle funnel</SectionTitle>
        <div className="col" style={{ gap: 2 }}>
          {funnelSteps.map(s => { const max = funnelSteps[0].value || 1; const on = stage === s.label;
            return <div key={s.label} onClick={() => setStage(on ? null : s.label)} className="row gap-2" style={{ alignItems: "center", cursor: "pointer", padding: "3px 6px", borderRadius: 8, background: on ? "var(--brand-wash)" : "transparent" }}>
              <span className="body-sm" style={{ width: 102, flexShrink: 0, fontSize: 11.5, fontWeight: on ? 700 : 500, color: on ? "var(--brand)" : undefined }}>{s.label}</span>
              <div className="bar-track" style={{ flex: 1, height: 8 }}><div style={{ width: (s.value / max * 100) + "%", height: "100%", borderRadius: 6, background: "linear-gradient(90deg, var(--brand), var(--brand-accent))" }} /></div>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, width: 20, textAlign: "right" }}>{s.value}</span>
            </div>; })}
        </div>
      </div>
      <div className="card">
        <SectionTitle action={<span className="body-sm" style={{ fontSize: 10.5 }}>tap → intelligence</span>}>Top clients</SectionTitle>
        <div className="col">
          {DG.ACCOUNTS.map((a, ai) => <div key={a.id} className="row between clickable" onClick={() => nav("CI-01")} style={{ padding: "5px 4px", borderBottom: ai < DG.ACCOUNTS.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
            <span className="row gap-2" style={{ alignItems: "center", fontSize: 12.5, fontWeight: 600 }}>{a.vvip && <VVIPStar size={12} />}{a.name}</span>
            <span className="row gap-3" style={{ alignItems: "center" }}><span className="mono" style={{ fontSize: 11.5 }}>{a.avgOrderValue}</span><span style={{ fontSize: 10, color: "#D97706", letterSpacing: 1 }}>{"★".repeat(a.rating)}</span></span>
          </div>)}
        </div>
      </div>
    </div>
    {stage && <div className="card" style={{ padding: 0 }}>
      <div className="row between" style={{ padding: "14px 18px" }}><div className="h3">{stage} — {stageReqs.length} requirement{stageReqs.length !== 1 ? "s" : ""}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setStage(null)}><Icon name="x" size={14} /> Close</button></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Req</Th><Th>Brand</Th><Th>Project</Th><Th>SPOC</Th><Th>Status</Th><Th>Started</Th></tr></thead>
        <tbody>{window.vvipSort(stageReqs).map(r => <tr key={r.id} className="clickable" onClick={() => setPopupId(r.id)}>
          <Td mono>{r.id}</Td><Td><b>{r.brand}</b></Td><Td>{r.title}</Td><Td>{r.submittedBy}</Td><Td><StatusPill status={r.status} size="sm" /></Td><Td><StartDate req={r} /></Td></tr>)}</tbody></table></div>
    </div>}

  </div>;
}

/* ====================================================================
   MG-02 · BRANDS
   ==================================================================== */
const BRAND_HUES = {
  Nykaa:   ["#C77C9E", "#FDF5F9"],
  Plum:    ["#9C8FD0", "#F7F5FD"],
  Pilgrim: ["#6FA8A0", "#F2FAF8"],
  Asaya:   ["#C9A35E", "#FCF8EF"],
  Nua:     ["#C68F88", "#FBF3F2"],
};
function MG02_Brands({ nav }) {
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState("all");
  const segments = ["all", ...Array.from(new Set((DG.ACCOUNTS || []).map(a => a.segment).filter(Boolean)))];
  const list = (DG.ACCOUNTS || []).filter(a => (seg === "all" || a.segment === seg) && (!q || (a.name + " " + (a.segment || "") + " " + (a.website || "")).toLowerCase().includes(q.toLowerCase())));
  return <div className="col gap-5">
    <PageHead title="Brands" sub={(DG.ACCOUNTS || []).length + " brands · per-brand performance & mix"}
      actions={<div className="row gap-2" style={{ alignItems: "center" }}>
        <div style={{ position: "relative", width: 220 }}><span style={{ position: "absolute", left: 12, top: 11 }}><Icon name="search" size={16} color="var(--muted)" /></span>
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search brand…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="select" style={{ width: 160, height: 38 }} value={seg} onChange={e => setSeg(e.target.value)}><option value="all">All segments</option>{segments.filter(s => s !== "all").map(s => <option key={s}>{s}</option>)}</select>
      </div>} />
    <div className="body-sm" style={{ fontSize: 12 }}>{list.length} brand{list.length !== 1 ? "s" : ""}</div>
    <div className="grid grid-2 gap-4">
      {list.map(a => {
        const mix = ["EPD", "REN", "TT", "NPD"].map((t, i) => ({ t, n: ((a.id.charCodeAt(5) + i * 3) % 5) + 1 }));
        const [hue, wash] = BRAND_HUES[a.name] || ["var(--brand)", "var(--brand-wash)"];
        return <div key={a.id} className="card" style={{ padding: 0, overflow: "hidden", borderTop: `3px solid ${hue}` }}>
          <div style={{ padding: "18px 20px 16px", background: `linear-gradient(150deg, ${wash} 0%, var(--surface) 50%)` }}>
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="row gap-3"><div style={{ width: 40, height: 40, borderRadius: 10, background: wash, border: `1px solid ${hue}44`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: hue, fontWeight: 800, fontSize: 16, fontFamily: "var(--f-ui)" }}>{a.name[0]}</span></div>
              <div><div className="h3">{a.name}{a.vvip && <span style={{ marginLeft: 6 }}><VVIPStar /></span>}</div><div className="body-sm" style={{ fontSize: 12 }}>{a.segment} · {a.website}</div></div></div>
            <span className="pill pill-sm" style={{ background: "var(--surface)", color: hue, fontWeight: 700 }}>{a.rating}★</span>
          </div>
          <div className="grid grid-3 gap-2" style={{ marginBottom: 12 }}>
            {[["Avg order", a.avgOrderValue], ["Live", mix.reduce((s, m) => s + m.n, 0)], ["Approved", a.rating * 2]].map(([l, v]) => <div key={l} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}><div className="serif-num" style={{ fontSize: 22 }}>{v}</div><div className="label" style={{ fontSize: 9 }}>{l}</div></div>)}
          </div>
          <div className="label" style={{ marginBottom: 6 }}>Project-type mix</div>
          <div className="row gap-2">{mix.map(m => <div key={m.t} className="row gap-1"><ProjectTypePill type={m.t} /><span className="mono" style={{ fontSize: 11 }}>{m.n}</span></div>)}</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: "100%", color: hue, borderColor: `${hue}66` }} onClick={() => nav("CI-01")}><Icon name="intel" size={14} color={hue} /> Client intelligence</button>
          </div>
        </div>;
      })}
      {!list.length && <div className="card" style={{ textAlign: "center", padding: 32, gridColumn: "1 / -1" }}><div className="body-sm">No brands match your search.</div></div>}
    </div>
  </div>;
}

/* ====================================================================
   MG-03 · REPORTS SUITE
   ==================================================================== */
/* ====================================================================
   MG-04 · MASTER PROJECT TRACKER (full column set, replaces the Excel)
   ==================================================================== */
const TRK_COLS = [
  ["brand", "Brand", "Name of the client"],
  ["project", "Project", "The project we are working on"],
  ["size", "Size", "Size of the SKU — 5ml, 10ml, 50g…"],
  ["packType", "Packaging Type", "Description of packaging affecting viscosity — dropper, tube, roll-on"],
  ["tt", "TT / Nat Custom", "Tech Transfer = client's formulation · Nat Custom = ours"],
  ["targetFg", "Target FG", "Price charged to the customer (RM + PM + conversion)"],
  ["targetRmc", "Target RMC", "Target cost of the formulation (raw material only)"],
  ["lastCode", "Last Sampled Code", "Formulation code last sampled to the customer"],
  ["stage", "Stage", "Current status of the project"],
  ["remarks", "Remarks", "All discussions with the client, updated date-wise"],
  ["lastDate", "Last Sampled Date", "Date the last sample went out"],
  ["docket", "Docket No.", "Courier tracking number"],
  ["feedback", "Client Feedback", "All feedback received from the client, date-wise"],
  ["stClient", "Status · Client", "Action points pending from the client"],
  ["stNaturis", "Status · Naturis", "Action points pending from Naturis"],
  ["locked", "Locked Code", "Final approved product code"],
  ["cost", "Cost Closed", "Per-unit cost accepted & closed at"],
  ["po", "PO Received", "Yes / No"],
  ["rmOrd", "RM Ordered", "Yes / No"],
  ["rmConn", "RM Connectivity", "Date RM is expected at the Naturis warehouse"],
  ["artwork", "Artwork", "Approved / Pending"],
  ["pmStatus", "PM Status", "Ordered / Pending"],
  ["pmConn", "PM Connectivity", "Date PM is expected at the Naturis warehouse"],
  ["mfgDate", "Planned Mfg Date", "Date we plan to manufacture the PO at the factory"],
  ["dispatchBy", "Dispatch By", "Planned consignment dispatch date"],
  ["launchQty", "Launch Qty", "Quantity of the PO"],
  ["proj6m", "6M Projection", "Expected order quantity for the next 6 months"],
];
function trackerRows() {
  const POST_PO = ["Client approved", "In stability", "Archived"];
  const SENTISH = ["Sent to client", "Rejected", ...POST_PO];
  return window.vvipSort(DG.REQUIREMENTS).map((r, i) => {
    const bd = r.briefDetail || {};
    const tl = (DG.REQUIREMENT_TIMELINES[r.id] || []);
    const last = tl[tl.length - 1] || {};
    const approved = POST_PO.includes(r.status);
    const sent = SENTISH.includes(r.status);
    const lastCode = (r.ncls && r.ncls.length ? r.ncls[r.ncls.length - 1].code : r.aiCode) || "—";
    const qty = parseInt(String(r.moq).replace(/[^0-9]/g, "")) || 0;
    const fb = r.clientFeedback || (r.status === "Rejected" ? "Sample rejected — see iteration note" : approved ? "Sample approved" : "—");
    return { id: r.id, vvip: r.vvip, status: r.status,
      brand: r.brand, project: r.title, size: bd.fillVol || r.packaging || "—",
      packType: bd.packSize || r.packaging || "—",
      tt: r.projectType === "TT" ? "Tech Transfer" : "Nat Custom",
      targetFg: bd.fg ? "₹" + bd.fg : "—", targetRmc: bd.rmBudget ? "₹" + bd.rmBudget : "—",
      lastCode, stage: r.status,
      remarks: (last.detail || "—").slice(0, 60) + ((last.detail || "").length > 60 ? "…" : ""),
      lastDate: sent ? r.committedDate || "2 Jun" : r.committedDate || "—",
      docket: sent ? "DTDC-88" + (4210 + i * 7) : "—",
      feedback: sent ? fb : "—",
      stClient: r.status === "Sent to client" ? "Feedback awaited" : r.status === "Dispatch awaiting SPOC approval" ? "—" : (r.queries || []).some(q => !q.resolved) ? "Answer lab query" : approved ? "PO confirmation" : "—",
      stNaturis: approved ? (r.deliverables && r.deliverables.ingredient && r.deliverables.ingredient.done ? "—" : "Ingredient sheet + marketing brief") : ["Formulation", "Trial", "QC", "Fill"].includes(r.status) ? "Sample on bench" : r.status === "Ready for dispatch" ? "Dispatch note + photos" : "—",
      locked: approved ? lastCode : "—",
      cost: approved ? "₹" + (bd.fg || 48) + "/unit" : "—",
      po: approved && i % 3 !== 2 ? "Yes" : "No",
      rmOrd: approved && i % 3 !== 2 ? "Yes" : "No",
      rmConn: approved && i % 3 !== 2 ? "24 Jun" : "—",
      artwork: approved ? (i % 2 ? "Approved" : "Pending") : "—",
      pmStatus: approved ? (i % 2 ? "Ordered" : "Pending") : "—",
      pmConn: approved && i % 2 ? "28 Jun" : "—",
      mfgDate: approved && i % 3 !== 2 ? "8 Jul" : "—",
      dispatchBy: approved && i % 3 !== 2 ? "15 Jul" : "—",
      launchQty: qty ? qty.toLocaleString("en-IN") : "—",
      proj6m: qty ? (qty * 6).toLocaleString("en-IN") : "—" };
  });
}
function MG04_Tracker({ nav }) {
  window.useStore();
  const [brand, setBrand] = useState("");
  const [q, setQ] = useState("");
  const [popupId, setPopupId] = useState(null);
  const [colsOpen, setColsOpen] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const COMPACT_COLS = ["brand", "project", "size", "packType", "tt", "targetFg", "targetRmc", "lastCode", "stage", "feedback", "stClient", "locked", "po", "launchQty"];
  const [visCols, setVisCols] = useState(() => { try { const v = JSON.parse(localStorage.getItem("naturis.tracker.cols")); return Array.isArray(v) && v.length ? v : TRK_COLS.map(c => c[0]); } catch (e) { return TRK_COLS.map(c => c[0]); } });
  function saveCols(v) { setVisCols(v); try { localStorage.setItem("naturis.tracker.cols", JSON.stringify(v)); } catch (e) {} }
  const SHOWN = TRK_COLS.filter(c => visCols.includes(c[0]));
  function exportCsv(rows2) {
    const esc = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const csv = [SHOWN.map(c => c[1]).join(",")].concat(rows2.map(r => SHOWN.map(([k]) => esc(r[k])).join(","))).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    a.download = "naturis-master-tracker.csv"; a.click(); URL.revokeObjectURL(a.href);
  }
  let rows = trackerRows().filter(r => (!brand || r.brand === brand) && (!q || (r.brand + " " + r.project + " " + r.stage).toLowerCase().includes(q.toLowerCase())));
  if (sortKey) rows = [...rows].sort((a, b) => String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""), undefined, { numeric: true }) * sortDir);
  const brands = Array.from(new Set(DG.REQUIREMENTS.map(r => r.brand)));
  const YN = v => v === "Yes" ? <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>Yes</span>
    : v === "No" ? <span className="pill pill-sm" style={{ background: "var(--page)", color: "var(--muted)" }}>No</span> : v;
  const AP = v => v === "Approved" || v === "Ordered" ? <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>{v}</span>
    : v === "Pending" ? <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)" }}>{v}</span> : v;
  return <div className="col gap-4">
    <PageHead title="Master project tracker" sub="One row per project — sampling, costing, PO & launch readiness. Hover any column header for its definition."
      actions={<div className="row gap-2" style={{ position: "relative" }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setColsOpen(o => !o)}><Icon name="settings" size={14} /> Columns ({SHOWN.length}/{TRK_COLS.length})</button>
        <button className="btn btn-secondary btn-sm" onClick={() => exportCsv(rows)}><Icon name="download" size={14} /> Export CSV</button>
        {colsOpen && <div style={{ position: "absolute", right: 0, top: 38, zIndex: 50, width: 320, maxHeight: 420, overflowY: "auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--sh-lg)", padding: 12 }}>
          <div className="row gap-2" style={{ marginBottom: 10 }}>
            <button className="btn btn-sm" onClick={() => saveCols(TRK_COLS.map(c => c[0]))}>Master view (all)</button>
            <button className="btn btn-sm btn-secondary" onClick={() => saveCols(COMPACT_COLS)}>Compact (14)</button>
          </div>
          {TRK_COLS.map(([k, label]) => <label key={k} className="row gap-2" style={{ padding: "5px 4px", cursor: "pointer", fontSize: 12.5 }}>
            <input type="checkbox" checked={visCols.includes(k)} disabled={k === "brand"} onChange={e => saveCols(e.target.checked ? [...visCols, k] : visCols.filter(x => x !== k))} />
            <span>{label}</span></label>)}
        </div>}
      </div>} />
    <div className="row gap-3 wrap">
      <select className="select" style={{ width: 160 }} value={brand} onChange={e => setBrand(e.target.value)}><option value="">All brands</option>{brands.map(b => <option key={b}>{b}</option>)}</select>
      <div style={{ position: "relative", width: 260 }}><span style={{ position: "absolute", left: 12, top: 11 }}><Icon name="search" size={16} color="var(--muted)" /></span>
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Search brand, project, stage…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <span className="body-sm" style={{ alignSelf: "center", fontSize: 12 }}>{rows.length} project{rows.length !== 1 ? "s" : ""}</span>
    </div>
    {rows.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40 }}>
      <Icon name="search" size={22} color="var(--brand-light)" />
      <div className="h3" style={{ marginTop: 8 }}>No projects match</div>
      <div className="body-sm" style={{ marginTop: 4 }}>Try clearing the brand filter or the search.</div>
    </div>}
    {rows.length > 0 && <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto", maxHeight: "74vh", overflowY: "auto" }}>
        <table className="tbl" style={{ minWidth: SHOWN.length > 16 ? 2250 : SHOWN.length * 100 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr>{SHOWN.map(([k, label, def]) => <th key={k} title={def + " — click to sort"} onClick={() => { if (sortKey === k) setSortDir(d => -d); else { setSortKey(k); setSortDir(1); } }}
              style={{ position: k === "brand" ? "sticky" : undefined, left: k === "brand" ? 0 : undefined, zIndex: k === "brand" ? 3 : undefined, background: "var(--brand)", color: "#fff", fontSize: 8.5, fontWeight: 700, letterSpacing: ".02em", textTransform: "uppercase", padding: "6px 6px", whiteSpace: "nowrap", textAlign: "left", cursor: "pointer", userSelect: "none" }}>
              {label}{sortKey === k ? (sortDir > 0 ? " ▲" : " ▼") : ""}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(r => <tr key={r.id} className="clickable" title="Click to open the full requirement" onClick={() => setPopupId(r.id)}>
              {SHOWN.map(([k]) => <td key={k} style={{ padding: "4px 6px", fontSize: 10.5, whiteSpace: "nowrap", borderBottom: "1px solid var(--border)", position: k === "brand" ? "sticky" : undefined, left: k === "brand" ? 0 : undefined, zIndex: k === "brand" ? 1 : undefined, background: k === "brand" ? "var(--surface)" : undefined, maxWidth: k === "remarks" || k === "feedback" ? 180 : undefined, overflow: "hidden", textOverflow: "ellipsis" }}>
                {k === "brand" ? <span className="row gap-1" style={{ alignItems: "center" }}>{r.vvip && <VVIPStar />}<b>{r.brand}</b></span>
                  : k === "stage" ? <StatusPill status={r.stage} size="sm" />
                  : k === "lastCode" || k === "locked" ? <span className="mono" style={{ fontSize: 11.5 }}>{r[k]}</span>
                  : k === "po" || k === "rmOrd" ? YN(r[k])
                  : k === "artwork" || k === "pmStatus" ? AP(r[k])
                  : r[k]}
              </td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>}
    {window.RequirementPopup && <window.RequirementPopup open={!!popupId} onClose={() => setPopupId(null)} reqId={popupId} />}
  </div>;
}

/* ====================================================================
   MG-03 · INTELLIGENCE REPORTS (Client · Market · TAT · Critical)
   ==================================================================== */
const REGION_SPLIT = { North: 9, South: 14, East: 4, West: 18, Central: 6 };
const REGION_REACH = { North: 4, South: 6, East: 2, West: 8, Central: 3 };
const REGION_PREF = { North: "Creams & lotions", South: "Hair oils & serums", East: "Cleansers", West: "Serums & SPF", Central: "Lip & colour" };
function MG03_Reports({ nav }) {
  window.useStore();
  const [suite, setSuite] = useState("client");
  const [accId, setAccId] = useState(DG.ACCOUNTS[0].id);
  const reqs = DG.REQUIREMENTS;
  const acc = DG.ACCOUNTS.find(a => a.id === accId);
  const SUITES = [
    { key: "client", label: "Client Intelligence", icon: "intel", desc: "Decision & sample cycles, categories, our share" },
    { key: "market", label: "Market Intelligence", icon: "overview", desc: "Geography, product types, reach, growth" },
    { key: "tat", label: "TAT Intelligence", icon: "clock", desc: "Response & turnaround times across the funnel" },
    { key: "critical", label: "Critical Intelligence", icon: "alert", desc: "Unanswered queries & stuck pipeline" },
    { key: "category", label: "Category Intelligence", icon: "brand", desc: "Market pricing & volumes — manually maintained" },
  ];
  /* ---- client suite data ---- */
  const mine = reqs.filter(r => r.brand === acc.name);
  const sentCount = mine.filter(r => ["Sent to client", "Client approved", "In stability", "Archived", "Rejected"].includes(r.status)).length;
  const finalised = mine.filter(r => ["Client approved", "In stability", "Archived"].includes(r.status)).length;
  const avgIter = mine.length ? (mine.reduce((n, r) => n + (r.iteration || 1), 0) / mine.length).toFixed(1) : "—";
  const catCounts = {}; mine.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
  const share = DG.ACCOUNT_SHARE[accId];
  const decisionDays = { "ACC-01": 21, "ACC-02": 34, "ACC-03": 18, "ACC-04": 41, "ACC-05": 27 }[accId] || 28;
  /* ---- market suite data ---- */
  const byType = {}; reqs.forEach(r => { byType[r.projectType] = (byType[r.projectType] || 0) + 1; });
  const byCat = {}; reqs.forEach(r => { byCat[r.category] = (byCat[r.category] || 0) + 1; });
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const allSent = reqs.filter(r => ["Sent to client", "Client approved", "In stability", "Archived", "Rejected"].includes(r.status));
  const successRate = allSent.length ? Math.round(reqs.filter(r => ["Client approved", "In stability", "Archived"].includes(r.status)).length / allSent.length * 100) : 0;
  /* ---- critical suite data (real, live) ---- */
  const openQueries = reqs.flatMap(r => (r.queries || []).filter(qq => !qq.resolved).map(qq => ({ ...qq, req: r })));
  const stuck = window.vvipSort(reqs.filter(r => r.age >= 30 && r.status !== "Archived"));
  return <div className="col gap-5">
    <PageHead title="Intelligence reports" sub="Four suites — exactly the report set agreed with the leadership team. Software scope ends at PO receipt."
      actions={<><button className="btn btn-secondary btn-sm"><Icon name="calendar" size={14} /> Schedule</button><button className="btn btn-secondary btn-sm"><Icon name="download" size={14} /> Export</button></>} />
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
      {SUITES.map(t => { const on = suite === t.key;
        return <button key={t.key} onClick={() => setSuite(t.key)} style={{ textAlign: "left", border: on ? "none" : "1px solid var(--border)", cursor: "pointer", borderRadius: 14, padding: "14px 16px", transition: "all .15s",
          background: on ? (t.key === "critical" ? "var(--grad-coral)" : "var(--grad-brand)") : "var(--surface)", color: on ? "#fff" : "var(--ink)", boxShadow: on ? "0 8px 20px rgba(18,57,95,.26)" : "none" }}>
          <Icon name={t.icon} size={17} color={on ? "#fff" : (t.key === "critical" ? "var(--coral-dark)" : "var(--brand)")} />
          <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 6 }}>{t.label}</div>
          <div style={{ fontSize: 11, opacity: .75, marginTop: 2 }}>{t.desc}</div>
        </button>; })}
    </div>

    {suite === "client" && <>
      <div className="row gap-2 wrap">
        {DG.ACCOUNTS.map(a => { const on = a.id === accId; return <button key={a.id} onClick={() => setAccId(a.id)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, cursor: "pointer",
            border: on ? "2px solid var(--brand)" : "1px solid var(--border)", background: on ? "var(--brand)" : "var(--surface)", color: on ? "#fff" : "var(--ink)", fontWeight: 600, fontSize: 13 }}>
          {a.vvip && <VVIPStar />}{a.name}</button>; })}
      </div>
      <div className="grid grid-4 gap-3">
        <ReportKPI label="Decision cycle · query → PO" value={String(decisionDays)} suffix="days" delta="avg, last 4 projects" good={decisionDays < 30} />
        <ReportKPI label="Sample cycle · samples : finalisation" value={finalised ? (sentCount / finalised).toFixed(1) + ":1" : sentCount + ":0"} delta={`${sentCount} sampled · ${finalised} finalised`} good={finalised > 0} />
        <ReportKPI label="Avg iterations per sample" value={String(avgIter)} good={parseFloat(avgIter) <= 2} />
        <ReportKPI label="Live projects" value={String(mine.filter(r => r.status !== "Archived").length)} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        <div className="card"><SectionTitle sub={"What " + acc.name + " samples with us"}>Preferred product categories</SectionTitle>
          <BarChart data={Object.entries(catCounts).map(([label, value]) => ({ label, value }))} /></div>
        {share && <div className="card">
          <SectionTitle sub={"Of " + share.total + " total SKUs in their portfolio"}>Naturis share of {acc.name}</SectionTitle>
          <div className="row" style={{ height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
            {[["var(--ok)", share.made], ["var(--coral)", share.missed], ["var(--review-fg)", share.cantMake], ["var(--brand-light)", share.canMakeNotMaking]].map(([c, v], k) => <div key={k} style={{ width: (v / share.total * 100) + "%", background: c }} />)}
          </div>
          <div className="grid grid-4 gap-2">
            {[["We make", share.made, "var(--ok)"], ["Missed (lost)", share.missed, "var(--coral)"], ["Can't make", share.cantMake, "var(--review-fg)"], ["Whitespace", share.canMakeNotMaking, "var(--brand-light)"]].map(([l, v, c]) => <div key={l} style={{ padding: 10, borderRadius: 8, background: "var(--page)" }}>
              <div className="row gap-2"><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /><span className="serif-num" style={{ fontSize: 20 }}>{v}</span></div>
              <div className="label" style={{ fontSize: 9, marginTop: 2 }}>{l}</div></div>)}
          </div>
          <div className="body-sm" style={{ fontSize: 11.5, marginTop: 10 }}><b>{share.canMakeNotMaking} whitespace SKUs</b> we can formulate but don't yet supply — the near-term growth lever.</div>
        </div>}
      </div>
    </>}

    {suite === "market" && <>
      <div className="grid grid-4 gap-3">
        <ReportKPI label="Queries this quarter" value={String(reqs.length + 32)} delta="+18% vs last qtr" good />
        <ReportKPI label="New clients this month" value="3" delta="West 2 · South 1" good />
        <ReportKPI label="Product success rate" value={String(successRate)} suffix="%" delta="approved for production ÷ sampled" good={successRate >= 50} />
        <ReportKPI label="Regions serviced" value="5" delta={Object.values(REGION_REACH).reduce((a, b) => a + b, 0) + " active companies"} />
      </div>
      <div className="grid grid-2 gap-4">
        <div className="card"><SectionTitle sub="Where demand comes from">Queries by geography</SectionTitle>
          <BarChart data={Object.entries(REGION_SPLIT).map(([label, value]) => ({ label, value }))} /></div>
        <div className="card"><SectionTitle sub="EPD / REN / TT / NPD mix">Queries by product type</SectionTitle>
          <BarChart data={Object.entries(byType).map(([label, value]) => ({ label, value }))} /></div>
      </div>
      <div className="grid grid-2 gap-4">
        <div className="card"><SectionTitle sub="Companies serviced + what each region prefers">Market reach & region preference</SectionTitle>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Region</Th><Th>Companies</Th><Th>Queries</Th><Th>Preferred products</Th></tr></thead>
            <tbody>{Object.keys(REGION_SPLIT).map(rg => <tr key={rg}><Td><b>{rg}</b></Td><Td mono>{REGION_REACH[rg]}</Td><Td mono>{REGION_SPLIT[rg]}</Td><Td>{REGION_PREF[rg]}</Td></tr>)}</tbody></table></div></div>
        <div className="card"><SectionTitle sub="By sampling volume, this quarter">Fastest-growing SKU categories</SectionTitle>
          <BarChart data={topCats.map(([label, value]) => ({ label, value }))} /></div>
      </div>
      <div className="card"><SectionTitle sub="Individual · zone · total">New clients onboarded monthly</SectionTitle>
        <BarChart data={[["Jan", 1], ["Feb", 2], ["Mar", 1], ["Apr", 3], ["May", 2], ["Jun", 3]].map(([label, value]) => ({ label, value }))} /></div>
    </>}

    {suite === "tat" && <>
      <div className="grid grid-4 gap-3">
        <ReportKPI label="First response after a query" value="5.2" suffix="hrs" delta="target < 8h" good />
        <ReportKPI label="Query → lab (sales handoff)" value="1.8" suffix="days" delta="target < 2d" good />
        <ReportKPI label="Lab → sample dispatch" value="16.4" suffix="days" delta="target 14d" />
        <ReportKPI label="Customer response from receipt" value="6.5" suffix="days" delta="PO or feedback" good />
      </div>
      <div className="card"><SectionTitle sub="Average days per stage, this quarter vs last">Turnaround by stage</SectionTitle>
        <BarChart data={[{ label: "First response (h)", value: 5.2 }, { label: "Sales → lab", value: 1.8 }, { label: "Lab evaluation", value: 3.1 }, { label: "Bench → dispatch", value: 16.4 }, { label: "Client response", value: 6.5, color: "var(--periwinkle)" }]} /></div>
      <div className="card"><SectionTitle sub="Who waits on whom">Where the days go</SectionTitle>
        <div className="col gap-2">{[["Sales-side (intake, approvals, client comms)", 22, "var(--brand-accent)"], ["Lab-side (evaluation, bench, dispatch)", 58, "var(--brand)"], ["Client-side (feedback, PO decisions)", 20, "var(--periwinkle)"]].map(([l, v, c]) => <div key={l}>
          <div className="row between" style={{ marginBottom: 4 }}><span className="body-sm" style={{ fontSize: 12.5 }}>{l}</span><span className="mono" style={{ fontSize: 12 }}>{v}%</span></div>
          <div className="bar-track" style={{ height: 10 }}><div className="bar-fill" style={{ width: v + "%", background: c }} /></div></div>)}</div></div>
    </>}

    {suite === "critical" && <>
      <div className="grid grid-2 gap-3">
        <ReportKPI label="Queries unanswered by internal team" value={String(openQueries.length)} delta="oldest open below" good={openQueries.length === 0} />
        <ReportKPI label="Stuck in pipeline ≥ 30 days" value={String(stuck.length)} delta="excluding archived" good={stuck.length === 0} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 18px 0" }}><SectionTitle sub="Lab questions the SPOC / client hasn't answered yet">Unanswered queries</SectionTitle></div>
        {openQueries.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Req</Th><Th>Brand</Th><Th>Query</Th><Th>Raised by</Th><Th>When</Th></tr></thead>
          <tbody>{openQueries.map((qq, k) => <tr key={k}><Td mono>{qq.req.id}</Td><Td><b>{qq.req.brand}</b></Td><Td><span style={{ fontSize: 12.5 }}>{qq.text}</span></Td><Td>{qq.by}</Td><Td>{qq.at}</Td></tr>)}</tbody></table></div>
          : <div className="body-sm" style={{ padding: "4px 18px 18px" }}>None — every query has an answer. 🎉</div>}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 18px 0" }}><SectionTitle sub="Live projects ageing past 30 days">Stuck pipeline</SectionTitle></div>
        {stuck.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Req</Th><Th>Brand</Th><Th>Project</Th><Th>Status</Th><Th>Started</Th></tr></thead>
          <tbody>{stuck.map(r => <tr key={r.id}><Td mono><span className="row gap-2">{r.vvip && <VVIPBadge size="sm" />}{r.id}</span></Td><Td><b>{r.brand}</b></Td><Td>{r.title}</Td><Td><StatusPill status={r.status} size="sm" /></Td><Td><StartDate req={r} /></Td></tr>)}</tbody></table></div>
          : <div className="body-sm" style={{ padding: "4px 18px 18px" }}>Nothing stuck. 🎉</div>}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 18px 0" }}><SectionTitle sub="Auto-flagged the moment any stage exceeds its SLA — no manual tagging">SLA breaches by stage</SectionTitle></div>
        {(() => { const br = window.vvipSort(reqs.filter(r => DG.slaStatus(r).level === "red"));
          return br.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Req</Th><Th>Brand</Th><Th>Project</Th><Th>Stage</Th><Th>Phase</Th><Th>Days over</Th></tr></thead>
            <tbody>{br.map(r => { const sla = DG.slaStatus(r); return <tr key={r.id}><Td mono>{r.id}</Td><Td><b>{r.brand}</b></Td><Td>{r.title}</Td><Td><StatusPill status={r.status} size="sm" /></Td><Td><span className="pill pill-sm" style={{ background: "var(--page)", color: "var(--muted)", textTransform: "capitalize" }}>{sla.phase}</span></Td><Td><span className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)", fontWeight: 700 }}>{sla.daysOver}d over</span></Td></tr>; })}</tbody></table></div>
            : <div className="body-sm" style={{ padding: "4px 18px 18px" }}>No SLA breaches right now. 🎉</div>; })()}
      </div>
      <div className="body-sm" style={{ fontSize: 11.5, color: "var(--muted)" }}>Scope note: the software ends at PO receipt — lifetime value, repeat orders and PO-to-PO gaps are intentionally out of scope.</div>
    </>}

    {suite === "category" && <>
      <div style={{ padding: "10px 16px", borderRadius: 10, background: "var(--review-bg)", display: "flex", gap: 10, alignItems: "center" }}>
        <Icon name="alert" size={15} color="var(--review-fg)" /><span className="body-sm" style={{ color: "var(--review-fg)" }}><b>Manually maintained</b> market data · visible to Management & Super Admin only. (Marketplace scraping is parked pending legal review.)</span></div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 18px 0" }}><SectionTitle sub="Average MRP, selling price & pack volume per category">Category market benchmarks</SectionTitle></div>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Category</Th><Th>Avg MRP</Th><Th>Avg selling price</Th><Th>Avg pack qty</Th><Th>Price per ml</Th><Th>Our sampled SKUs</Th></tr></thead>
          <tbody>{DG.CATEGORY_MARKET.map(c => <tr key={c.category}><Td><b>{c.category}</b></Td><Td mono>{c.avgMrp}</Td><Td mono>{c.avgSp}</Td><Td mono>{c.avgQty}</Td><Td mono>{c.perMl}</Td><Td mono>{reqs.filter(r => r.category === c.category || (r.category || "").includes(c.category.split(" ")[0])).length}</Td></tr>)}</tbody></table></div>
      </div>
    </>}
  </div>;
}

Object.assign(window.SCREENS, { "MG-01": MG01_Command, "MG-02": MG02_Brands, "MG-03": MG03_Reports, "MG-04": MG04_Tracker });
