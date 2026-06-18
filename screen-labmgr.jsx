/* ============================================================
   screen-labmgr.jsx — Lab Manager (looped into every lab workflow)
   LM-01 Command dashboard · LM-02 Oversight (daily lab meeting) ·
   LM-03 Planning & load · LM-04 Reports & analytics
   ============================================================ */
window.SCREENS = window.SCREENS || {};
const DLM = window.NaturisData;
const TYPE_DESKS = ["EPD", "REN", "TT", "NPD"];

/* bucket the whole lab pipeline by phase */
function labBuckets(reqs) {
  const has = (...s) => r => s.includes(r.status);
  return {
    toAck: reqs.filter(has("Approved", "R&D assessed", "R&D assessing", "Logged")),
    inEval: reqs.filter(has("Acknowledged", "In evaluation")),
    accepted: reqs.filter(has("Accepted — date committed")),
    onBench: reqs.filter(has("Formulation", "Trial", "QC", "Fill")),
    awaitingDispatch: reqs.filter(has("Ready for dispatch", "Dispatch awaiting SPOC approval")),
    sent: reqs.filter(has("Sent to client", "Client approved")),
    inStab: reqs.filter(r => r.status === "In stability" || (r.stability && r.stability.status === "running")),
    declined: reqs.filter(has("Declined")),
    rejected: reqs.filter(has("Rejected")),
    queries: reqs.filter(r => (r.queries || []).some(q => !q.resolved)),
    closed: reqs.filter(has("Archived")),
    active: reqs.filter(r => !["Archived", "Logged", "Pending review"].includes(r.status)),
  };
}
function techOf(r) { return (DLM.LAB_DESKS[r.projectType] || {}).tech || "—"; }

/* ====================================================================
   LM-01 · COMMAND DASHBOARD
   ==================================================================== */
function LM01_Dashboard({ nav }) {
  window.useStore();
  const reqs = DLM.REQUIREMENTS;
  const b = labBuckets(reqs);
  const escalations = reqs.filter(r => r.flags.some(f => !f.resolved) || DLM.slaStatus(r).level === "red" || r.status === "Declined" || (r.queries || []).some(q => !q.resolved));
  const tiles = [
    ["To acknowledge", b.toAck.length, "LB-02", b.toAck.length > 0],
    ["In evaluation", b.inEval.length, "LB-02", false],
    ["On the bench", b.onBench.length + b.accepted.length, "LM-02", false],
    ["Awaiting dispatch", b.awaitingDispatch.length, "LM-02", false],
    ["In stability", b.inStab.length, "LM-02", false],
    ["Open queries", b.queries.length, "LM-02", b.queries.length > 0],
    ["Declined", b.declined.length, "LM-02", b.declined.length > 0],
    ["Dispatched", b.sent.length, "LM-04", false],
  ];
  return <div className="col gap-5">
    <div><div className="h1">Lab command</div><div className="body" style={{ color: "var(--muted)", marginTop: 4 }}>You're looped into every lab workflow. {b.active.length} active · {b.queries.length} queries · {escalations.length} need oversight.</div></div>

    <div className="grid grid-4 gap-3">
      {tiles.map(([l, v, to, warn]) => <Stat key={l} label={l} value={v} attention={warn} onClick={() => nav(to)} />)}
    </div>

    {/* per-desk / per-tech load */}
    <div className="grid grid-4 gap-3">
      {TYPE_DESKS.map(t => {
        const items = window.vvipSort(reqs.filter(r => r.projectType === t && b.active.includes(r)));
        const aging = items.filter(r => DLM.slaStatus(r).level === "red").length;
        const cap = Math.min(98, items.length * 20 + 14);
        const desk = DLM.LAB_DESKS[t] || {};
        return <div key={t} className="card" style={{ padding: 14 }}>
          <div className="row between" style={{ marginBottom: 8 }}><ProjectTypePill type={t} showLabel /><span className="label" style={{ fontSize: 9 }}>{items.length} active</span></div>
          <div className="row gap-2" style={{ marginBottom: 8 }}><Avatar name={desk.tech} size={22} /><span className="body-sm" style={{ fontSize: 12 }}>{desk.tech}</span></div>
          <div className="bar-track" style={{ marginBottom: 6 }}><div className="bar-fill" style={{ width: cap + "%", background: cap > 80 ? "var(--coral)" : "var(--brand-accent)" }} /></div>
          <div className="row between"><span className="label" style={{ fontSize: 9 }}>capacity {cap}%</span>{aging > 0 && <span className="coral-text" style={{ fontSize: 11, fontWeight: 600 }}>{aging} aging</span>}</div>
        </div>;
      })}
    </div>

    <div className="grid gap-4" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
      <div className="card"><div className="row between" style={{ marginBottom: 12 }}><div className="h3">Pipeline by stage</div><button className="btn btn-sm" onClick={() => nav("LM-02")}><Icon name="calendar" size={14} /> Open lab meeting</button></div>
        <div className="col gap-2">{[["To acknowledge", b.toAck.length], ["In evaluation", b.inEval.length], ["Accepted", b.accepted.length], ["On bench", b.onBench.length], ["Awaiting dispatch", b.awaitingDispatch.length], ["In stability", b.inStab.length]].map(([lb, v]) => { const max = Math.max(b.toAck.length, b.inEval.length, b.accepted.length, b.onBench.length, b.awaitingDispatch.length, b.inStab.length, 1);
          return <div key={lb} className="row gap-2" style={{ alignItems: "center" }}><span className="body-sm" style={{ width: 130, fontSize: 12 }}>{lb}</span><div className="bar-track" style={{ flex: 1, height: 12 }}><div className="bar-fill" style={{ width: (v / max * 100) + "%" }} /></div><span className="mono" style={{ fontSize: 12, fontWeight: 700, width: 22, textAlign: "right" }}>{v}</span></div>; })}</div>
      </div>
      <div className="card" style={{ borderTop: "3px solid var(--coral)" }}><SectionTitle>Needs oversight</SectionTitle>
        <div className="col gap-2">{escalations.length ? escalations.slice(0, 6).map(r => <div key={r.id} className="row between clickable" style={{ padding: "9px 11px", borderRadius: 8, background: "var(--page)", cursor: "pointer" }} onClick={() => nav("LB-03", { reqId: r.id })}>
          <div className="row gap-2" style={{ minWidth: 0 }}>{r.vvip && <VVIPBadge size="sm" />}<span className="mono" style={{ fontSize: 11 }}>{r.id.slice(-4)}</span><span className="body-sm" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span></div>
          <StatusPill status={r.status} size="sm" /></div>) : <div className="body-sm">All clear.</div>}</div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   LM-02 · OVERSIGHT (daily lab meeting — every workflow visible)
   ==================================================================== */
function LMFlagRow({ f, r, nav }) {
  const [sol, setSol] = useState("");
  return <div style={{ padding: 12, borderRadius: 10, background: "var(--coral-wash)" }}>
    <div className="row between wrap gap-2">
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--coral-dark)" }}>{f.typeLabel || f.type}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--brand-mid)", fontWeight: 600 }}>{r.id}</span>
          <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--coral-dark)" }}>owner · {f.owner}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 3 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
        <div className="body-sm clamp2" style={{ fontSize: 12.5, marginTop: 2 }}>{f.text}</div>
        <div className="label" style={{ fontSize: 8.5, marginTop: 3 }}>raised by {f.raisedBy} · {f.raisedAt || "recently"}</div>
      </div>
      <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }} onClick={() => nav("LB-03", { reqId: r.id })}>Open project</button>
    </div>
    {f.solution ? <div className="row gap-2" style={{ marginTop: 8 }}><span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>Solution sent · awaiting raiser's confirmation</span></div>
      : <div className="row gap-2" style={{ marginTop: 8 }}>
        <input className="input" style={{ flex: 1, background: "var(--surface)" }} value={sol} onChange={e => setSol(e.target.value)} placeholder="Your resolution — alternate vendor, schedule change, rework plan…" />
        <button className="btn btn-sm" disabled={!sol.trim()} onClick={() => { window.NaturisStore.resolveFlag(r.id, f.id, sol.trim(), "Dipti OV"); setSol(""); }}><Icon name="check" size={13} /> Send</button>
      </div>}
  </div>;
}

function LM02_Oversight({ nav }) {
  window.useStore();
  const [view, setView] = useState("stage");
  const [phase, setPhase] = useState("all");
  const [q, setQ] = useState("");
  const reqs = DLM.REQUIREMENTS;
  const srch = r => !q || (r.id + " " + r.brand + " " + r.title + " " + (r.tracker || "")).toLowerCase().includes(q.toLowerCase());
  const b = labBuckets(reqs);
  const PHASES = [
    ["toAck", "To acknowledge", b.toAck, "var(--review-bg)", "var(--review-fg)", "incoming"],
    ["inEval", "In evaluation", b.inEval, "var(--lab-bg)", "var(--lab-fg)", "work"],
    ["accepted", "Accepted", b.accepted, "var(--approved-bg)", "var(--approved-fg)", "check"],
    ["onBench", "On bench", b.onBench, "var(--brand-wash)", "var(--brand)", "work"],
    ["dispatch", "Awaiting dispatch", b.awaitingDispatch, "var(--pt-tt-bg)", "var(--pt-tt-fg)", "dispatch"],
    ["stab", "In stability", b.inStab, "var(--pt-npd-bg)", "var(--pt-npd-fg)", "clock"],
    ["risk", "Queries / declined / rejected", Array.from(new Set([...b.queries, ...b.declined, ...b.rejected])), "var(--coral-wash)", "var(--coral-dark)", "alert"],
  ];
  const allItems = PHASES.flatMap(p => p[2]);
  const shown = phase === "all" ? allItems : (PHASES.find(p => p[0] === phase) || [0, 0, []])[2];
  const techs = Array.from(new Set(Object.values(DLM.LAB_DESKS).map(d => d.tech)));
  const phaseOf = r => PHASES.find(p => p[2].some(x => x.id === r.id));
  const labFlags = reqs.flatMap(r => (r.flags || []).filter(f => !f.resolved && (/Lab/.test(f.owner || "") || f.raisedByRole === "Lab Technician")).map(f => ({ f, r })));
  const stageOf = r => { const p = PHASES.find(p => p[2].some(x => x.id === r.id)); return p ? p[1] : "—"; };
  const rows = window.vvipSort(shown.filter(srch));
  return <div className="col gap-4">
    <PageHead title="Lab meeting" sub="Every active lab workflow in one sheet — filter by stage, search, open any row to intervene."
      actions={<button className="btn btn-secondary btn-sm" onClick={() => { const esc = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; const csv = ["Req,Brand,Title,Type,Status,Chemist,Live stage,Stage bucket"].concat(rows.map(r => [r.id, r.brand, r.title, r.projectType, r.status, r.tracker || "", r.labStage || "", stageOf(r)].map(esc).join(","))).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" })); a.download = "lab-meeting.csv"; a.click(); URL.revokeObjectURL(a.href); }}><Icon name="download" size={14} /> Export</button>} />
    {/* lab-owned flags — your response needed (kept on top) */}
    {labFlags.length > 0 && <div className="card" style={{ border: "1px solid var(--coral)", padding: 0, overflow: "hidden" }}>
      <div className="row between" style={{ padding: "12px 18px", background: "var(--coral-wash)", borderBottom: "1px solid var(--border)" }}>
        <span className="row gap-2"><Icon name="flag" size={15} color="var(--coral-dark)" /><span style={{ fontWeight: 700, fontSize: 14, color: "var(--coral-dark)" }}>Lab flags — your response needed</span></span>
        <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--coral-dark)", fontWeight: 700 }}>{labFlags.length}</span>
      </div>
      <div className="col gap-3" style={{ padding: 16 }}>
        {labFlags.map(({ f, r }) => <LMFlagRow key={(r.id || "") + (f.id || "")} f={f} r={r} nav={nav} />)}
      </div>
    </div>}
    {/* stage filter tiles */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
      {[["all", "All active", allItems, "var(--brand-wash)", "var(--brand)", "list"], ...PHASES].map(([k, label, items, bg, fg, ic]) => { const on = phase === k;
        return <button key={k} onClick={() => setPhase(k)} style={{ border: on ? "none" : "1px solid var(--border)", cursor: "pointer", borderRadius: 12, padding: "11px 10px", textAlign: "left", transition: "all .15s",
          background: on ? fg : "var(--surface)", color: on ? "#fff" : "var(--ink)", boxShadow: on ? "0 6px 16px rgba(18,57,95,.22)" : "none" }}>
          <Icon name={ic} size={14} color={on ? "#fff" : fg} />
          <div className="serif-num" style={{ fontSize: 20, marginTop: 4 }}>{items.length}</div>
          <div style={{ fontSize: 9.5, fontWeight: 600, marginTop: 1, opacity: on ? .9 : .6, lineHeight: 1.2 }}>{label}</div>
        </button>; })}
    </div>
    <div className="row gap-2 wrap" style={{ alignItems: "center" }}>
      <div style={{ position: "relative", width: 260 }}><span style={{ position: "absolute", left: 12, top: 10 }}><Icon name="search" size={15} color="var(--muted)" /></span>
        <input className="input" style={{ paddingLeft: 36, height: 34, fontSize: 12 }} placeholder="Search id, brand, title, chemist…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <span className="body-sm" style={{ fontSize: 12 }}>{rows.length} in view</span>
    </div>
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto", maxHeight: "66vh", overflowY: "auto" }}>
        <table className="tbl" style={{ minWidth: 1200 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}><tr>{["Req ID", "Brand", "Product", "Type", "Chemist", "Stage bucket", "Status", "Live stage", "SLA", ""].map(h => <th key={h} style={{ background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", padding: "9px 12px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(r => <tr key={r.id} className="clickable" onClick={() => nav("LB-03", { reqId: r.id })} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><span className="row gap-1" style={{ alignItems: "center" }}>{r.vvip && <Icon name="star" size={12} color="#D97706" />}<span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brand-mid)" }}>{r.id}</span></span></td>
              <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>{r.brand}</td>
              <td style={{ padding: "8px 12px", fontSize: 12.5, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
              <td style={{ padding: "8px 12px" }}><ProjectTypePill type={r.projectType} /></td>
              <td style={{ padding: "8px 12px", fontSize: 11.5, whiteSpace: "nowrap" }}><span className="row gap-2" style={{ alignItems: "center" }}><Avatar name={techOf(r)} size={20} />{techOf(r)}</span></td>
              <td style={{ padding: "8px 12px", fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap" }}>{stageOf(r)}</td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><StatusPill status={r.status} size="sm" /></td>
              <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--brand)", fontWeight: 600, whiteSpace: "nowrap" }}>{r.labStage || "—"}</td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><SLAIndicator req={r} /></td>
              <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); nav("LB-03", { reqId: r.id }); }}>Open <Icon name="arrowRight" size={12} /></button></td>
            </tr>)}
            {!rows.length && <tr><td colSpan={10} style={{ padding: 34, textAlign: "center" }}><span className="body-sm">Nothing in this stage right now.</span></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   LM-03 · PLANNING & LOAD (slot calendar + workload + ageing)
   ==================================================================== */
function LM03_Planning({ nav }) {
  window.useStore();
  const [tab, setTab] = useState("load");
  const [lmSlot, setLmSlot] = useState(null);
  const reqs = DLM.REQUIREMENTS;
  const b = labBuckets(reqs);
  const benchItems = window.vvipSort([...b.accepted, ...b.onBench]);
  const stations = [["Emulsion bench", 82], ["Cold process", 45], ["Anhydrous", 60], ["Filling line", 38], ["QC station", 71]];
  const techs = Array.from(new Set(Object.values(DLM.LAB_DESKS).map(d => d.tech)));
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ageing = window.vvipSort(b.active.filter(r => r.age >= 20)).slice(0, 8);
  return <div className="col gap-5">
    <PageHead title="Planning & load" sub="Slot calendar · workload distribution · ageing" />
    <div className="row gap-1" style={{ background: "var(--brand-wash)", padding: 4, borderRadius: 10, width: "fit-content" }}>
      {[["load", "Station load"], ["calendar", "Slot calendar"], ["workload", "Workload by tech"], ["ageing", "Ageing"]].map(([v, l]) =>
        <button key={v} onClick={() => setTab(v)} className="btn btn-sm" style={{ background: tab === v ? "var(--surface)" : "transparent", color: tab === v ? "var(--brand)" : "var(--muted)", boxShadow: tab === v ? "var(--sh-sm)" : "none", border: "none" }}>{l}</button>)}
    </div>
    {tab === "load" && <div className="card"><SectionTitle>Station load</SectionTitle>
      <div className="col gap-3">{stations.map(([s, load]) => <div key={s}>
        <div className="row between" style={{ marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 500 }}>{s}</span><span className="mono" style={{ fontSize: 12, color: load > 80 ? "var(--coral)" : "var(--muted)" }}>{load}%</span></div>
        <div className="bar-track" style={{ height: 12 }}><div className="bar-fill" style={{ width: load + "%", background: load > 80 ? "var(--coral)" : load > 60 ? "var(--warn)" : "var(--ok)" }} /></div></div>)}</div></div>}
    {tab === "calendar" && <div className="card">
      <LabStationCalendar value={lmSlot} onChange={setLmSlot} readOnly title="Station board — view only (booked by the Lab Planner)"
        sub="Two-week board across the 8 stations. Booking is done by the Lab Planner; this is your read-only view." />
    </div>}
    {tab === "workload" && <div className="card"><SectionTitle>Workload distribution by technician</SectionTitle>
      <div className="col gap-3">{techs.map(t => { const n = b.active.filter(r => techOf(r) === t).length; const pct = Math.min(100, n * 18);
        return <div key={t}><div className="row between" style={{ marginBottom: 4 }}><span className="row gap-2"><Avatar name={t} size={22} /><span style={{ fontSize: 13, fontWeight: 500 }}>{t}</span></span><span className="mono" style={{ fontSize: 12 }}>{n} active</span></div>
          <div className="bar-track" style={{ height: 12 }}><div className="bar-fill" style={{ width: pct + "%", background: pct > 80 ? "var(--coral)" : "var(--brand-accent)" }} /></div></div>; })}</div></div>}
    {tab === "ageing" && <div className="card" style={{ padding: 0 }}><div style={{ padding: "16px 18px" }}><SectionTitle>Ageing analysis · oldest active</SectionTitle></div>
      {ageing.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Req</Th><Th>Brand</Th><Th>Tech</Th><Th>Status</Th><Th>Started</Th></tr></thead>
        <tbody>{ageing.map(r => <tr key={r.id} className="clickable" onClick={() => nav("LB-03", { reqId: r.id })}><Td mono>{r.id}</Td><Td>{r.brand}</Td><Td>{techOf(r)}</Td><Td><StatusPill status={r.status} size="sm" /></Td><Td><StartDate req={r} /></Td></tr>)}</tbody></table></div>
        : <div className="body-sm" style={{ padding: "0 18px 18px" }}>Nothing ageing past 20 days.</div>}</div>}
  </div>;
}

/* ====================================================================
   LM-04 · REPORTS & ANALYTICS (weekly / monthly)
   ==================================================================== */
function LM04_Reports() {
  window.useStore();
  const [period, setPeriod] = useState("week");
  const reqs = DLM.REQUIREMENTS;
  const b = labBuckets(reqs);
  const mult = period === "week" ? 1 : 4;
  const techs = Array.from(new Set(Object.values(DLM.LAB_DESKS).map(d => d.tech)));
  const kpis = [
    ["Requirements received", (b.toAck.length + b.inEval.length + b.accepted.length + b.onBench.length) ],
    ["Accepted", b.accepted.length + b.onBench.length + b.awaitingDispatch.length + b.sent.length],
    ["Declined", b.declined.length],
    ["Queries raised", reqs.reduce((n, r) => n + (r.queries || []).length, 0)],
    ["Avg TAT (days)", 14],
    ["RM procurement", reqs.filter(r => r.evaluation && r.evaluation.rm === "yes").length],
    ["PM procurement", reqs.filter(r => r.evaluation && r.evaluation.pm === "yes").length],
    ["Slot utilisation", "72%"],
    ["Samples dispatched", b.sent.length],
    ["Stability tests", b.inStab.length + reqs.filter(r => r.stability).length],
    ["Client iterations", reqs.reduce((n, r) => n + Math.max(0, (r.ncls ? r.ncls.length - 1 : 0)), 0)],
    ["Pending tasks", b.toAck.length + b.inEval.length + b.queries.length],
  ];
  return <div className="col gap-5">
    <PageHead title="Lab reports & analytics" sub="Weekly & monthly lab performance"
      actions={<><div className="row gap-1" style={{ background: "var(--brand-wash)", padding: 4, borderRadius: 10 }}>
        {[["week", "Weekly"], ["month", "Monthly"]].map(([v, l]) => <button key={v} onClick={() => setPeriod(v)} className="btn btn-sm" style={{ background: period === v ? "var(--surface)" : "transparent", color: period === v ? "var(--brand)" : "var(--muted)", boxShadow: period === v ? "var(--sh-sm)" : "none", border: "none" }}>{l}</button>)}
      </div><button className="btn btn-secondary"><Icon name="download" size={15} /> Export</button></>} />
    <div className="grid grid-4 gap-3">
      {kpis.map(([l, v]) => <ReportKPI key={l} label={l} value={typeof v === "number" ? v : v} />)}
    </div>
    <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
      <div className="card"><SectionTitle>Received vs dispatched ({period === "week" ? "by day" : "by week"})</SectionTitle>
        <BarChart data={(period === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri"] : ["W1", "W2", "W3", "W4"]).map((label, i) => ({ label, value: 4 + ((i * 3 + 5) % 9) }))} /></div>
      <div className="card"><SectionTitle>By project type</SectionTitle>
        <Donut segments={TYPE_DESKS.map((t, i) => ({ value: reqs.filter(r => r.projectType === t).length || 1, color: [`var(--pt-epd-fg)`, `var(--pt-ren-fg)`, `var(--pt-tt-fg)`, `var(--pt-npd-fg)`][i] }))} /></div>
    </div>
    {/* per-tech productivity */}
    <div className="card"><SectionTitle>Individual technician productivity & timeline adherence</SectionTitle>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Technician</Th><Th>Active</Th><Th>Dispatched</Th><Th>Queries</Th><Th>Avg TAT</Th><Th>On-time</Th></tr></thead>
        <tbody>{techs.map((t, i) => { const active = b.active.filter(r => techOf(r) === t).length; const disp = b.sent.filter(r => techOf(r) === t).length;
          return <tr key={t}><Td><span className="row gap-2"><Avatar name={t} size={22} />{t}</span></Td><Td mono>{active}</Td><Td mono>{disp}</Td><Td mono>{reqs.filter(r => techOf(r) === t).reduce((n, r) => n + (r.queries || []).length, 0)}</Td><Td mono>{12 + i * 3}d</Td><Td mono>{90 - i * 4}%</Td></tr>; })}</tbody></table></div>
    </div>
    {/* bottlenecks */}
    <div className="card" style={{ borderTop: "3px solid var(--coral)" }}><SectionTitle>Bottlenecks & ageing</SectionTitle>
      <div className="grid grid-3 gap-3">
        {[["Stuck > 20d", b.active.filter(r => r.age >= 20).length], ["Open queries", b.queries.length], ["SLA breaches", reqs.filter(r => DLM.slaStatus(r).level === "red").length]].map(([l, v]) =>
          <div key={l} style={{ padding: 12, borderRadius: 10, background: "var(--coral-wash)", textAlign: "center" }}><div className="serif-num" style={{ fontSize: 26, color: "var(--coral-dark)" }}>{v}</div><div className="label" style={{ fontSize: 9 }}>{l}</div></div>)}
      </div>
    </div>
  </div>;
}

/* ====================================================================
   LM-05 · PLANNING DESK (centralised station allocation — 12 Jun meeting)
   ==================================================================== */
function LM05_Planning({ nav }) {
  window.useStore();
  const reqs = DLM.REQUIREMENTS;
  const STN = ["Emulsion / cream", "Gel / serum", "SPF / hybrid", "Cleanser / wash", "Oil / balm", "Mask / leave-on", "Colour / lip", "Hair / scalp"];
  const OPS = window.NaturisData.STATION_OPERATORS;
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // each row = a one-hour slot, 09:00 → 18:00
  const hLabel = h => String(h).padStart(2, "0") + ":00";
  // upcoming working days (Mon–Fri), like a calendar week strip
  const days = (function () { var arr = [], dt = new Date(), n = 0; while (n < 6) { var d = dt.getDay(); if (d !== 0 && d !== 6) { arr.push(new Date(dt)); n++; } dt.setDate(dt.getDate() + 1); } return arr; })();
  const [dayIdx, setDayIdx] = useState(0);
  const day = days[dayIdx];
  const dayKey = day.toISOString().slice(0, 10);
  const fmtFull = d => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  const fmtShort = d => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  const hasBooking = r => r.evaluation && r.evaluation.booking;
  const queue = window.vvipSort(reqs.filter(r => ["Accepted — date committed", "Formulation", "Trial", "QC"].includes(r.status) && !hasBooking(r)));
  const bookedAll = reqs.filter(hasBooking);
  const [sel, setSel] = useState(null);
  const [pq, setPq] = useState("");
  const fqueue = queue.filter(r => !pq || (r.id + " " + r.brand + " " + r.title + " " + techOf(r)).toLowerCase().includes(pq.toLowerCase()));
  const selReq = sel && reqs.find(r => r.id === sel);

  // bookings landing on the visible day
  const dayBookings = bookedAll.filter(r => r.evaluation.booking.dateKey === dayKey).map(r => ({ r, b: r.evaluation.booking }));
  const stationData = STN.map((name, si) => {
    const items = dayBookings.filter(x => x.b.station === si);
    const startMap = {}; const covered = {};
    items.forEach(({ r, b }) => { startMap[b.startHour] = { r, b }; for (var h = b.startHour; h < b.endHour; h++) covered[h] = true; });
    return { name, si, startMap, covered, freeAt: h => !covered[h] };
  });
  const hoursBookedToday = dayBookings.reduce((s, x) => s + (x.b.endHour - x.b.startHour), 0);

  // drag-to-book — Google-calendar feel; can never cross an occupied hour
  const [drag, setDrag] = useState(null); // { station, startH, endH }
  function startDrag(si, h) { if (!sel || !stationData[si].freeAt(h)) return; setDrag({ station: si, startH: h, endH: h }); }
  function overDrag(si, h) {
    if (!drag || si !== drag.station || h < drag.startH) return;
    const sd = stationData[si]; for (var x = drag.startH; x <= h; x++) if (!sd.freeAt(x)) return; // stop at a wall
    setDrag(d => (d ? { ...d, endH: h } : d));
  }
  function commit() {
    if (!drag || !sel) { setDrag(null); return; }
    const { station, startH, endH } = drag, sd = stationData[station];
    for (var x = startH; x <= endH; x++) if (!sd.freeAt(x)) { setDrag(null); return; }
    const booking = { dateKey: dayKey, dayLabel: fmtShort(day), station, startHour: startH, endHour: endH + 1, hours: endH + 1 - startH, stationName: STN[station] };
    const label = STN[station] + " · " + fmtShort(day) + " · " + hLabel(startH) + "–" + hLabel(endH + 1);
    window.NaturisStore.setEvaluation(sel, { booking, slot: label });
    window.NaturisStore._notify(sel, "dispatch", "info", sel + " slot booked", label + " · by the planning desk.", "NR-04");
    setDrag(null); const next = queue.filter(r => r.id !== sel)[0]; setSel(next ? next.id : null);
  }
  function release(r) { window.NaturisStore.setEvaluation(r.id, { booking: null, slot: "" }); }
  const inDrag = (si, h) => drag && drag.station === si && h >= drag.startH && h <= drag.endH;
  const ROWH = 46;

  return <div className="col gap-4" style={{ userSelect: "none" }}>
    <PageHead title="Planning desk" sub="Book any block on any station — drag across the hours you need (2h, 4h, a full day). Overlaps are blocked automatically." />
    <div className="grid grid-4 gap-3">
      <Stat label="Awaiting a slot" value={queue.length} attention={queue.length > 0} sub="VVIP first, then FIFO" />
      <Stat label="Booked (all days)" value={bookedAll.length} sub="Across the horizon" />
      <Stat label="VVIP waiting" value={queue.filter(r => r.vvip).length} attention={queue.filter(r => r.vvip).length > 0} sub="Priority allocation" />
      <Stat label="Hours booked · this day" value={hoursBookedToday} sub={fmtShort(day)} />
    </div>

    {/* day strip — like a calendar week selector */}
    <div className="row gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>
      {days.map((d, di) => { const on = di === dayIdx; const cnt = bookedAll.filter(r => r.evaluation.booking.dateKey === d.toISOString().slice(0, 10)).length;
        return <button key={di} onClick={() => setDayIdx(di)} style={{ border: on ? "none" : "1px solid var(--border)", cursor: "pointer", borderRadius: 12, padding: "8px 14px", minWidth: 96, textAlign: "center", background: on ? "var(--brand)" : "var(--surface)", color: on ? "#fff" : "var(--ink)", boxShadow: on ? "0 6px 16px rgba(18,57,95,.22)" : "none" }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, opacity: on ? .85 : .6 }}>{di === 0 ? "TODAY" : d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase()}</div>
          <div className="serif-num" style={{ fontSize: 19, lineHeight: 1.1 }}>{d.getDate()}</div>
          <div style={{ fontSize: 9.5, fontWeight: 600, opacity: on ? .85 : .55 }}>{d.toLocaleDateString("en-GB", { month: "short" })}{cnt ? " · " + cnt : ""}</div>
        </button>; })}
    </div>

    <div className="grid gap-4" style={{ gridTemplateColumns: "300px 1fr", alignItems: "start" }}>
      {/* queue rail */}
      <div className="col gap-3">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 10, borderBottom: "1px solid var(--border)" }}>
            <div className="label" style={{ marginBottom: 6 }}>Awaiting a slot ({queue.length}) · pick one, then drag on the grid</div>
            <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: 9 }}><Icon name="search" size={14} color="var(--muted)" /></span>
              <input className="input" style={{ paddingLeft: 30, height: 32, fontSize: 12 }} placeholder="Search the queue…" value={pq} onChange={e => setPq(e.target.value)} /></div>
          </div>
          <div style={{ maxHeight: "52vh", overflowY: "auto" }}>
            {fqueue.length ? fqueue.map(r => { const on = r.id === sel;
              return <button key={r.id} onClick={() => setSel(on ? null : r.id)} style={{ width: "100%", textAlign: "left", padding: "9px 12px", border: "none", borderLeft: on ? "3px solid var(--brand)" : "3px solid transparent", borderBottom: "1px solid var(--border)", cursor: "pointer", background: on ? "var(--brand-wash)" : "transparent" }}>
                <div className="row gap-2" style={{ flexWrap: "wrap", alignItems: "center" }}>{r.vvip && <Icon name="star" size={11} color="#D97706" />}<ProjectTypePill type={r.projectType} /><span className="mono" style={{ fontSize: 10 }}>{r.id.slice(-4)}</span></div>
                <div style={{ fontSize: 12.5, fontWeight: on ? 700 : 600, color: on ? "var(--brand)" : "var(--ink)", marginTop: 2 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
                <div className="body-sm" style={{ fontSize: 10.5 }}>{techOf(r)} · {r.status}</div>
              </button>; }) : <div className="body-sm" style={{ padding: 16, textAlign: "center" }}>{queue.length ? "No matches." : "Everything has a slot. 🎉"}</div>}
          </div>
        </div>
        <div className="card" style={{ padding: "10px 12px", background: sel ? "var(--brand-wash)" : "var(--page)", borderLeft: sel ? "3px solid var(--brand)" : "3px solid var(--border)" }}>
          {selReq ? <div className="body-sm" style={{ fontSize: 12 }}><b style={{ color: "var(--brand)" }}>Booking:</b> {selReq.brand} · {selReq.title}<div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Drag across the hours on any station →</div></div>
            : <div className="body-sm" style={{ fontSize: 12 }}>Select a query above to start booking.</div>}
        </div>
      </div>

      {/* calendar grid */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row between" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div className="row gap-2" style={{ alignItems: "center" }}>
            <button className="btn btn-sm btn-secondary" disabled={dayIdx === 0} onClick={() => setDayIdx(i => Math.max(0, i - 1))} style={{ fontSize: 16, lineHeight: 1, padding: "4px 10px" }}>‹</button>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{fmtFull(day)}{dayIdx === 0 ? " · today" : ""}</span>
            <button className="btn btn-sm btn-secondary" disabled={dayIdx === days.length - 1} onClick={() => setDayIdx(i => Math.min(days.length - 1, i + 1))} style={{ fontSize: 16, lineHeight: 1, padding: "4px 10px" }}>›</button>
          </div>
          <span className="body-sm" style={{ fontSize: 11.5 }}>{dayBookings.length} booked · {hoursBookedToday}h allocated</span>
        </div>
        <div style={{ overflowX: "auto" }} onMouseUp={commit} onMouseLeave={() => setDrag(null)}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1080 }}>
            <thead><tr>
              <th style={{ position: "sticky", left: 0, zIndex: 2, background: "var(--brand)", color: "#fff", width: 62, minWidth: 62, padding: "8px 6px", fontSize: 10, fontWeight: 700 }}>Time</th>
              {STN.map((name, si) => <th key={si} style={{ background: "var(--brand)", color: "#fff", padding: "7px 8px", textAlign: "left", borderLeft: "1px solid rgba(255,255,255,.14)", minWidth: 124 }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>Station {si + 1}</div>
                <div style={{ fontSize: 9.5, opacity: .85, lineHeight: 1.25 }}>{name}<br />{OPS[si]}</div></th>)}
            </tr></thead>
            <tbody>
              {HOURS.map(h => { const rowCells = []; const skip = {};
                return <tr key={h}>
                  <td style={{ position: "sticky", left: 0, zIndex: 1, background: "var(--page)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "0 6px", fontSize: 10.5, fontWeight: 700, color: "var(--muted)", verticalAlign: "top", height: ROWH }}>{hLabel(h)}</td>
                  {stationData.map((sd, si) => {
                    const ev = sd.startMap[h];
                    if (ev) { const dur = ev.b.endHour - ev.b.startHour; const r = ev.r;
                      return <td key={si} rowSpan={dur} style={{ borderLeft: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: 4, verticalAlign: "top" }}>
                        <div style={{ height: dur * ROWH - 8, borderRadius: 9, padding: "6px 8px", background: r.vvip ? "linear-gradient(135deg,#F59E0B,#D97706)" : "var(--grad-brand)", color: "#fff", position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => nav("LB-03", { reqId: r.id })}>
                          <div className="row gap-1" style={{ alignItems: "center", flexWrap: "wrap" }}>{r.vvip && <Icon name="star" size={10} color="#fff" />}<span style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.15 }}>{r.title}</span></div>
                          <div style={{ fontSize: 10, opacity: .9, marginTop: 1 }}>{r.brand} · {r.tracker || "—"}</div>
                          <div className="mono" style={{ fontSize: 9.5, opacity: .85 }}>{hLabel(ev.b.startHour)}–{hLabel(ev.b.endHour)} · {dur}h</div>
                          <button title="Release this slot" onClick={e => { e.stopPropagation(); release(r); }} style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 5, border: "none", background: "rgba(255,255,255,.25)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={11} color="#fff" /></button>
                        </div>
                      </td>;
                    }
                    if (!sd.freeAt(h)) return null; // covered by a rowSpan above
                    const on = inDrag(si, h); const can = !!sel;
                    return <td key={si} onMouseDown={() => startDrag(si, h)} onMouseEnter={() => overDrag(si, h)}
                      style={{ borderLeft: "1px solid var(--border)", borderBottom: "1px solid var(--border)", height: ROWH, cursor: can ? "pointer" : "default", background: on ? "var(--brand)" : "transparent", transition: "background .08s" }}
                      onMouseOver={e => { if (can && !on && !drag) e.currentTarget.style.background = "var(--brand-wash)"; }}
                      onMouseOut={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                      {on && h === drag.startH && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", paddingLeft: 6 }}>{selReq ? selReq.title.slice(0, 14) : ""}</span>}
                    </td>;
                  })}
                </tr>; })}
            </tbody>
          </table>
        </div>
        <div className="row gap-4" style={{ padding: "10px 16px", flexWrap: "wrap" }}>
          <span className="row gap-2" style={{ alignItems: "center" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--grad-brand)", display: "inline-block" }} /><span className="body-sm" style={{ fontSize: 11.5 }}>Booked block</span></span>
          <span className="row gap-2" style={{ alignItems: "center" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "inline-block" }} /><span className="body-sm" style={{ fontSize: 11.5 }}>VVIP</span></span>
          <span className="body-sm" style={{ fontSize: 11.5, color: "var(--muted)" }}>Drag empty cells to book · click a block to open · ✕ to release. No overlaps allowed.</span>
        </div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   LM-06 · STATION BOARD (daily grid — matches the lab planning sheet)
   ==================================================================== */
function LM06_StationBoard({ nav }) {
  window.useStore();
  const D = window.NaturisData;
  const reqs = D.REQUIREMENTS;
  const OPS = D.STATION_OPERATORS;
  const STN = ["Emulsion / cream", "Gel / serum", "SPF / hybrid", "Cleanser / wash", "Oil / balm", "Mask / leave-on", "Colour / lip", "Hair / scalp"];
  const SLOT_TIMES = ["09:00 – 11:00", "11:00 – 13:00", "14:00 – 16:00", "16:00 – 18:00"];
  // upcoming working days
  const days = (function () {
    var arr = [], dt = new Date(), added = 0;
    while (added < 4) { var dow = dt.getDay(); if (dow !== 0 && dow !== 6) { arr.push(new Date(dt)); added++; } dt.setDate(dt.getDate() + 1); }
    return arr;
  })();
  const [dayIdx, setDayIdx] = useState(0);
  const fmt = d => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const bench = window.vvipSort(reqs.filter(r => ["Accepted — date committed", "Formulation", "Trial", "QC", "Fill"].includes(r.status)));
  // deterministic fill: rotate by day so each day shows a different arrangement
  const board = {};
  bench.forEach(function (r, k) { var st = (k + dayIdx) % 8; (board[st] = board[st] || []); if (board[st].length < 4) board[st].push(r); });
  return <div className="col gap-5">
    <PageHead title="Station board" sub="Daily allocation across the 8 stations — 3–4 products per station. Booked by the Lab Planner at the lab meeting."
      actions={<div className="row gap-1" style={{ background: "var(--brand-wash)", padding: 4, borderRadius: 10 }}>
        {days.map((d, di) => <button key={di} onClick={() => setDayIdx(di)} className="btn btn-sm" style={{ background: dayIdx === di ? "#fff" : "transparent", color: dayIdx === di ? "var(--brand)" : "var(--muted)", boxShadow: dayIdx === di ? "var(--sh-sm)" : "none", border: "none" }}>{di === 0 ? "Today" : fmt(d).split(",")[0]}</button>)}
      </div>} />
    <div style={{ padding: "10px 16px", borderRadius: 10, background: "var(--grad-coral)", color: "#fff", fontWeight: 700 }}>{fmt(days[dayIdx])}{dayIdx === 0 ? " · TODAY" : ""}</div>
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl" style={{ minWidth: 1500, borderCollapse: "collapse" }}>
          <thead><tr><th style={{ background: "var(--brand)", color: "#fff", padding: "8px 10px", textAlign: "left", borderRight: "1px solid rgba(255,255,255,.15)", minWidth: 96, position: "sticky", left: 0, zIndex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 800 }}>Time</div><div style={{ fontSize: 10, opacity: .85 }}>slot</div></th>{STN.map((kind, s) => <th key={s} style={{ background: "var(--brand)", color: "#fff", padding: "8px 10px", textAlign: "left", borderRight: "1px solid rgba(255,255,255,.15)", minWidth: 175 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800 }}>Station {s + 1}</div>
            <div style={{ fontSize: 10, opacity: .85 }}>{kind} · {OPS[s]}</div></th>)}</tr></thead>
          <tbody>
            {[0, 1, 2, 3].map(slot => <tr key={slot}>
              <td style={{ padding: "8px 10px", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--page)", position: "sticky", left: 0, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{SLOT_TIMES[slot]}</td>
              {STN.map((kind, s) => { const item = (board[s] || [])[slot];
                return <td key={s} style={{ padding: "8px 10px", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", verticalAlign: "top", height: 58 }}>
                  {item ? <div onClick={() => nav("LB-03", { reqId: item.id })} style={{ cursor: "pointer" }}>
                    <div className="row gap-1" style={{ alignItems: "center", flexWrap: "wrap" }}>{item.vvip && <VVIPBadge size="sm" />}<span style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.2 }}>{item.title}</span></div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--brand-mid)", marginTop: 2 }}>{item.currentNcl || item.id}</div>
                    <div className="body-sm" style={{ fontSize: 9.5, color: "var(--muted)" }}>{item.brand} · {item.tracker || "—"}</div>
                  </div> : <span style={{ fontSize: 10, color: "var(--border-strong)" }}>{slot + 1}</span>}
                </td>; })}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    <div className="body-sm" style={{ fontSize: 11.5, color: "var(--muted)" }}>{bench.length} active bench projects · VVIP-first. Click any cell to open the project.</div>
  </div>;
}

Object.assign(window.SCREENS, {
  "LM-06": LM06_StationBoard,
  "LM-05": LM05_Planning,
  "LM-01": LM01_Dashboard, "LM-02": LM02_Oversight, "LM-03": LM03_Planning, "LM-04": LM04_Reports,
});
