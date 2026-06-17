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
      <div className="card" style={{ padding: 0 }}>
        <div className="row between" style={{ padding: "16px 18px" }}><div className="h3">Lab meeting / oversight</div><button className="btn btn-sm" onClick={() => nav("LM-02")}><Icon name="calendar" size={14} /> Open oversight</button></div>
        <ReqTable rows={[...b.toAck, ...b.inEval, ...b.accepted]} onOpen={r => nav("LM-02")} cols={["id", "brand", "title", "type", "status", "age"]} />
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
  const reqs = DLM.REQUIREMENTS;
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
  const Tile = r => { const ph = phaseOf(r) || PHASES[0];
    return <div key={r.id} onClick={() => nav("LB-03", { reqId: r.id })} className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer", transition: "transform .12s, box-shadow .12s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--sh-lg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div className="row between" style={{ padding: "8px 14px", background: ph[3] }}>
        <span className="row gap-2" style={{ fontSize: 11, fontWeight: 700, color: ph[4] }}><Icon name={ph[5]} size={12} color={ph[4]} /> {ph[1]}</span>
        <SLAIndicator req={r} />
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 4 }}>{r.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={r.projectType} /><span className="mono" style={{ fontSize: 10.5, color: "var(--muted)" }}>{r.id.slice(-4)}</span></div>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
        <div className="body-sm" style={{ fontSize: 11.5, marginBottom: 8 }}>{r.category}</div>
        <div className="row between">
          <span className="row gap-2"><Avatar name={techOf(r)} size={20} /><span className="body-sm" style={{ fontSize: 11 }}>{techOf(r)}</span></span>
          <span className="row gap-2"><StatusPill status={r.status} size="sm" /><StartDate req={r} /></span>
        </div>
      </div>
    </div>; };
  const labFlags = reqs.flatMap(r => (r.flags || []).filter(f => !f.resolved && (/Lab/.test(f.owner || "") || f.raisedByRole === "Lab Technician")).map(f => ({ f, r })));
  return <div className="col gap-5">
    <PageHead title="Lab meeting" sub="Every active lab workflow — click a stage tile to focus, click a card to intervene"
      actions={<div className="row gap-1" style={{ background: "var(--brand-wash)", padding: 4, borderRadius: 10 }}>
        {[["stage", "By stage"], ["tech", "By technician"]].map(([v, l]) => <button key={v} onClick={() => setView(v)} className="btn btn-sm" style={{ background: view === v ? "var(--surface)" : "transparent", color: view === v ? "var(--brand)" : "var(--muted)", boxShadow: view === v ? "var(--sh-sm)" : "none", border: "none" }}>{l}</button>)}
      </div>} />
    {/* lab-owned flags — the Lab Manager's flag queue */}
    {labFlags.length > 0 && <div className="card" style={{ border: "1px solid var(--coral)", padding: 0, overflow: "hidden" }}>
      <div className="row between" style={{ padding: "12px 18px", background: "var(--coral-wash)", borderBottom: "1px solid var(--border)" }}>
        <span className="row gap-2"><Icon name="flag" size={15} color="var(--coral-dark)" /><span style={{ fontWeight: 700, fontSize: 14, color: "var(--coral-dark)" }}>Lab flags — raised by or owned by the lab, your response needed</span></span>
        <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--coral-dark)", fontWeight: 700 }}>{labFlags.length}</span>
      </div>
      <div className="col gap-3" style={{ padding: 16 }}>
        {labFlags.map(({ f, r }) => <LMFlagRow key={(r.id || "") + (f.id || "")} f={f} r={r} nav={nav} />)}
      </div>
    </div>}
    {view === "stage" ? <>
      {/* stage filter tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
        {[...PHASES, ["all", "All active", allItems, "var(--brand-wash)", "var(--brand)", "list"]].map(([k, label, items, bg, fg, ic]) => { const on = phase === k;
          return <button key={k} onClick={() => setPhase(k)} style={{ border: on ? "none" : "1px solid var(--border)", cursor: "pointer", borderRadius: 12, padding: "12px 10px", textAlign: "left", transition: "all .15s",
            background: on ? fg : "var(--surface)", color: on ? "#fff" : "var(--ink)", boxShadow: on ? "0 6px 16px rgba(18,57,95,.22)" : "none" }}>
            <Icon name={ic} size={14} color={on ? "#fff" : fg} />
            <div className="serif-num" style={{ fontSize: 22, marginTop: 4 }}>{items.length}</div>
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 1, opacity: on ? .9 : .6 }}>{label}</div>
          </button>; })}
      </div>
      {shown.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {window.vvipSort(shown).map(Tile)}
      </div> : <div className="card" style={{ textAlign: "center", padding: 32 }}><div className="body-sm">Nothing in this stage right now.</div></div>}
    </> : <div className="col gap-4">
      {techs.map(tech => { const items = window.vvipSort(allItems.filter(r => techOf(r) === tech));
        const deskCode = Object.keys(DLM.LAB_DESKS).find(k => DLM.LAB_DESKS[k].tech === tech);
        return <div key={tech} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row between" style={{ padding: "14px 18px", background: "linear-gradient(120deg, var(--brand-wash) 0%, var(--surface) 70%)", borderBottom: "1px solid var(--border)" }}>
            <div className="row gap-3"><Avatar name={tech} size={34} />
              <div><div className="h3">{tech}</div><div className="body-sm" style={{ fontSize: 12 }}>{deskCode} desk · {items.length} active task{items.length !== 1 ? "s" : ""}</div></div></div>
            <div style={{ width: 160 }}><div className="bar-track" style={{ height: 10 }}><div className="bar-fill" style={{ width: Math.min(100, items.length * 16) + "%", background: items.length > 5 ? "var(--coral)" : "var(--brand-accent)" }} /></div>
              <div className="label" style={{ fontSize: 8.5, marginTop: 3, textAlign: "right" }}>load</div></div>
          </div>
          {items.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12, padding: 16 }}>{items.map(Tile)}</div>
            : <div className="body-sm" style={{ padding: 16 }}>No active tasks.</div>}
        </div>; })}
    </div>}
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
  // queue: accepted / on-bench queries without a booked slot — FIFO with VVIP first
  const queue = window.vvipSort(reqs.filter(r => ["Accepted — date committed", "Formulation", "Trial"].includes(r.status) && !(((r.evaluation || {}).slot || "").includes("Station"))));
  const booked = reqs.filter(r => ((r.evaluation || {}).slot || "").includes("Station"));
  const [sel, setSel] = useState(queue[0] ? queue[0].id : null);
  const [slotSel, setSlotSel] = useState(null);
  const req = sel && reqs.find(r => r.id === sel);
  function book() {
    if (!req || !slotSel) return;
    window.NaturisStore.setEvaluation(req.id, { slot: slotSel.label + " — " + req.id, slotSel });
    window.NaturisStore._notify(req.id, "dispatch", "info", req.id + " slot booked", slotSel.label + " · by the planning desk.", "NR-04");
    setSlotSel(null); const next = queue.filter(r => r.id !== req.id)[0]; setSel(next ? next.id : null);
  }
  return <div className="col gap-5">
    <PageHead title="Planning desk" sub="Asha & Vikram · centralised station allocation at the lab meeting — 8 stations, 3–4 products per station per day, FIFO with VVIP priority." />
    <div className="grid gap-4" style={{ gridTemplateColumns: "330px 1fr", alignItems: "start" }}>
      <div className="col gap-3">
        <div className="card" style={{ padding: 8 }}>
          <div className="label" style={{ padding: "6px 8px" }}>Awaiting a slot ({queue.length}) · VVIP first, then FIFO</div>
          {queue.length ? queue.map(r => { const on = r.id === sel;
            return <button key={r.id} onClick={() => setSel(r.id)} style={{ width: "100%", textAlign: "left", padding: 10, borderRadius: 8, border: "none", marginBottom: 2, cursor: "pointer", background: on ? "var(--brand-wash)" : "transparent" }}>
              <div className="row gap-2" style={{ flexWrap: "wrap" }}>{r.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={r.projectType} /><span className="mono" style={{ fontSize: 10.5 }}>{r.id.slice(-4)}</span></div>
              <div style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? "var(--brand)" : "var(--ink)", marginTop: 2 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
              <div className="body-sm" style={{ fontSize: 11 }}>{techOf(r)} · {r.status}</div>
            </button>; }) : <div className="body-sm" style={{ padding: "4px 8px" }}>Everything has a slot. 🎉</div>}
        </div>
        <div className="card" style={{ padding: 8 }}>
          <div className="label" style={{ padding: "6px 8px" }}>Booked ({booked.length})</div>
          {booked.slice(0, 8).map(r => <div key={r.id} style={{ padding: "7px 8px", borderBottom: "1px solid var(--border)" }}>
            <div className="row between"><span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.brand} · {r.title}</span></div>
            <div className="body-sm mono" style={{ fontSize: 10.5, color: "var(--brand-mid)" }}>{(r.evaluation || {}).slot}</div>
          </div>)}
        </div>
      </div>
      <div className="card">
        {req ? <div className="row between wrap gap-2" style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "var(--brand-wash)" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Booking for: <span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title} <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{req.id}</span></span>
          <button className="btn btn-sm" disabled={!slotSel} onClick={book}><Icon name="check" size={13} /> Book this slot</button>
        </div> : <div className="body-sm" style={{ marginBottom: 12 }}>Pick a query from the queue to allocate its station.</div>}
        <LabStationCalendar value={slotSel} onChange={setSlotSel} title="Station allocation" />
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
          <thead><tr>{STN.map((kind, s) => <th key={s} style={{ background: "var(--brand)", color: "#fff", padding: "8px 10px", textAlign: "left", borderRight: "1px solid rgba(255,255,255,.15)", minWidth: 175 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800 }}>Station {s + 1}</div>
            <div style={{ fontSize: 10, opacity: .85 }}>{kind} · {OPS[s]}</div></th>)}</tr></thead>
          <tbody>
            {[0, 1, 2, 3].map(slot => <tr key={slot}>
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
