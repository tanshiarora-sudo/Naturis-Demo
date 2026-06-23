/* ============================================================
   screen-manager.jsx — Sales Manager screens
   SM-01 Dashboard · SM-02 Review queue · SM-03 Review detail ·
   SM-04 Team pipeline · SM-05 Flag review · SM-06 Team reports ·
   CI-01 Client intelligence (shared with Management)
   ============================================================ */
window.SCREENS = window.SCREENS || {};
const DM = window.NaturisData;

/* ====================================================================
   SM-01 · DASHBOARD
   ==================================================================== */
function SM01_Dashboard({ nav }) {
  window.useStore();
  const reqs = DM.REQUIREMENTS;
  const pending = reqs.filter(r => r.status === "Pending review");
  const flagged = reqs.filter(r => r.flags.some(f => !f.resolved));
  const flagCount = reqs.reduce((n, r) => n + r.flags.filter(f => !f.resolved).length, 0);
  const live = reqs.filter(r => r.status !== "Archived");
  const inLab = reqs.filter(r => ["Acknowledged", "In assessment (RM/PM/Slot)", "Accepted — date committed", "Formulation", "Trial", "QC", "Fill", "Ready for dispatch"].includes(r.status));
  const breaches = reqs.filter(r => DM.slaStatus(r).level === "red");
  const allFlags = reqs.flatMap(r => r.flags.filter(f => !f.resolved).map(f => ({ ...f, req: r })));
  return <div className="col gap-6">
    <div><div className="h1">Good morning, Kunal.</div>
      <div className="body" style={{ color: "var(--muted)", marginTop: 4 }}>{pending.length} awaiting approval · {flagCount} open flags · {inLab.length} in lab · {breaches.length} SLA breach{breaches.length !== 1 ? "es" : ""}.</div></div>

    {/* top metrics first line */}
    <div className="grid grid-4 gap-3">
      <Stat label="Live requirements" value={live.length} sub="Across the team" onClick={() => nav("SM-LIVE")} />
      <Stat label="Review pending" value={pending.length} attention={pending.length > 0} sub="Needs your decision" onClick={() => nav("SM-02")} />
      <Stat label="Open flags" value={flagCount} attention={flagCount > 0} sub={`Across ${flagged.length} req`} onClick={() => nav("SM-02")} />
      <Stat label="SLA breaches" value={breaches.length} attention={breaches.length > 0} sub="Action needed" onClick={() => nav("SM-02")} />
    </div>

    {/* pipeline by stage — click any tile to open the filtered Live view */}
    <div className="card">
      <div className="row between" style={{ marginBottom: 12 }}><div className="h3">Pipeline by stage</div>
        <button className="btn btn-ghost btn-sm" onClick={() => nav("SM-LIVE")}>Live requirements <Icon name="arrowRight" size={13} /></button></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
        {[["Pending review", ["Pending review", "Returned to SPOC"], "queue"],
          ["With lab", ["Logged", "Approved", "Acknowledged", "In evaluation", "Query raised"], "incoming"],
          ["On bench", ["Accepted — date committed", "Formulation", "Trial", "QC", "Fill"], "work"],
          ["Dispatch", ["Ready for dispatch", "Dispatch awaiting SPOC approval"], "dispatch"],
          ["With client", ["Sent to client"], "check"],
          ["Closed", ["Client approved", "In stability", "Archived", "Rejected", "Declined"], "archive"]].map(([l, sts, ic]) => {
          const n = reqs.filter(r => sts.includes(r.status)).length;
          return <button key={l} onClick={() => nav("SM-LIVE")} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", background: "var(--page)", textAlign: "left", cursor: "pointer" }}>
            <Icon name={ic} size={14} color="var(--brand)" />
            <div className="serif-num" style={{ fontSize: 22, marginTop: 2 }}>{n}</div>
            <div className="label" style={{ fontSize: 8.5, marginTop: 1 }}>{l}</div>
          </button>; })}
      </div>
    </div>

    {/* glimpse: under-review + flags */}
    <div className="grid gap-4" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ padding: 0 }}>
        <div className="row between" style={{ padding: "16px 18px" }}><div className="h3">Under review — awaiting your approval</div>
          <button className="btn btn-secondary btn-sm" onClick={() => nav("SM-02")}>Open review desk</button></div>
        {pending.length ? <ReqTable rows={window.vvipSort(pending)} onOpen={r => nav("SM-03", { reqId: r.id })} cols={["id", "brand", "title", "type", "status", "age"]} />
          : <div className="body-sm" style={{ padding: "16px 18px" }}>Nothing awaiting approval. 🎉</div>}
      </div>
      <div className="card">
        <div className="row between" style={{ marginBottom: 12 }}><div className="h3">Flags</div><button className="btn btn-ghost btn-sm" onClick={() => nav("SM-02")}>All <Icon name="arrowRight" size={13} /></button></div>
        <div className="col gap-2">
          {allFlags.length ? allFlags.slice(0, 5).map((f, i) => <div key={i} className="row between" style={{ padding: "9px 11px", borderRadius: 8, background: "var(--coral-wash)", cursor: "pointer" }} onClick={() => nav("SM-03", { reqId: f.req.id })}>
            <div className="row gap-2" style={{ minWidth: 0 }}><Icon name="flag" size={13} color="var(--coral-dark)" /><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--coral-dark)" }}>{f.typeLabel || f.type}</span><span className="body-sm" style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.req.brand}</span></div>
            <Icon name="chevron" size={14} color="var(--coral-dark)" />
          </div>) : <div className="body-sm">No open flags.</div>}
        </div>
        <hr className="divider" style={{ margin: "14px 0" }} />
        <div className="row between" style={{ marginBottom: 10 }}><div className="h3">Team load</div><button className="btn btn-ghost btn-sm" onClick={() => nav("SM-PIPE")}>Pipeline <Icon name="arrowRight" size={13} /></button></div>
        <div className="col gap-3">
          {["Hardik Shah", "Divya Rao"].map(nm => { const c = reqs.filter(r => r.submittedBy === nm && r.status !== "Archived").length; const pct = Math.min(100, c * 9 + 12);
            return <div key={nm}>
              <div className="row between" style={{ marginBottom: 4 }}><span className="row gap-2"><Avatar name={nm} size={22} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{nm}</span></span><span className="mono" style={{ fontSize: 11.5 }}>{c} live</span></div>
              <div className="bar-track" style={{ height: 9 }}><div className="bar-fill" style={{ width: pct + "%", background: pct > 80 ? "var(--coral)" : "var(--brand-accent)" }} /></div>
            </div>; })}
        </div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   SM-02 · REVIEW QUEUE (dense decision cards)
   ==================================================================== */
function SM02_Queue({ nav, embedded }) {
  window.useStore();
  const [decided, setDecided] = useState({});
  const queue = window.vvipSort(DM.REQUIREMENTS.filter(r => r.status === "Pending review"));
  function decide(id, action) {
    setDecided(d => ({ ...d, [id]: action }));
    if (action === "Approved") {
      const r = DM.REQUIREMENTS.find(x => x.id === id);
      window.NaturisStore.addAudit({ actor: "Kunal Shah", role: "Sales Manager", action: "Review decision", target: id, field: "status", before: r ? r.status : "", after: "Approved", note: "Quick approve from review desk" });
      window.NaturisStore.setStatus(id, "Approved", "Kunal Shah");
      window.NaturisStore._notify(id, "dispatch", "info", id + " approved by your manager", "Moving to the lab queue.", "NR-02");
    }
  }
  return <div className="col gap-5">
    {!embedded && <PageHead title="Review queue" sub={`${queue.length} requirements awaiting a decision · VVIP-first`} />}
    <div className="col gap-3">
      {queue.map(r => {
        const gate = ["TT", "NPD"].includes(r.projectType);
        const done = decided[r.id];
        return <div key={r.id} className="card" style={{ padding: 0, borderLeft: gate ? "4px solid var(--review-fg)" : undefined, opacity: done ? .6 : 1 }}>
          <div className="grid" style={{ gridTemplateColumns: "1.8fr 1.4fr auto", alignItems: "stretch" }}>
            {/* brief */}
            <div style={{ padding: 18, borderRight: "1px solid var(--border)" }}>
              <div className="row gap-2" style={{ marginBottom: 8 }}>
                {r.vvip && <VVIPBadge size="sm" />}<ProjectTypePill type={r.projectType} showLabel />
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{r.id}</span>
                <SLAIndicator req={r} />
                {r.flags.some(f => !f.resolved) && <span className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}><Icon name="flag" size={10} color="var(--coral-dark)" /> {r.flags.filter(f => !f.resolved).length}</span>}
              </div>
              <div className="h3" style={{ marginBottom: 4, cursor: "pointer" }} onClick={() => nav("SM-03", { reqId: r.id })}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
              <div className="body-sm" style={{ marginBottom: 10 }}>{r.category} · MOQ {r.moq}</div>
              <div className="row gap-2 wrap">{r.nonNegotiable.map((a, i) => <span key={i} className="chip" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)", height: 22, fontSize: 11 }}>{a.ingredient} {a.concentration}</span>)}</div>
            </div>
            {/* inline AI */}
            <div style={{ padding: 18, borderRight: "1px solid var(--border)" }}>
              <AISuggestion track={r.aiTrack} code={r.aiCode} score={r.aiScore} rationale={r.aiRationale} compact />
            </div>
            {/* quick actions */}
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", minWidth: 180 }}>
              {done ? <div className="col center gap-2" style={{ padding: 8 }}>
                <Icon name="check" size={20} color="var(--approved-fg)" />
                <span className="pill" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>{done}</span>
              </div> : <>
                <button className="btn" onClick={() => decide(r.id, "Approved")}><Icon name="check" size={15} /> Approve</button>
                <button className="btn btn-secondary" onClick={() => decide(r.id, "In discussion")}>Discuss</button>
                <button className="btn btn-destructive" title="Returning requires a note — opens the detail" onClick={() => nav("SM-03", { reqId: r.id })}>Return (with note)</button>
                <button className="btn btn-ghost btn-sm" onClick={() => nav("SM-03", { reqId: r.id })}>Open detail</button>
              </>}
            </div>
          </div>
        </div>;
      })}
      {!queue.length && <div className="card" style={{ textAlign: "center", padding: 40 }}><Icon name="check" size={24} color="var(--approved-fg)" /><div className="h3" style={{ marginTop: 8 }}>Queue clear</div></div>}
    </div>
  </div>;
}

/* ====================================================================
   SM-03 · REVIEW DETAIL (2 tabs)
   ==================================================================== */
function ManagerLifecycleTimeline({ reqId }) {
  const [filter, setFilter] = useState("all");
  const base = DM.REQUIREMENT_TIMELINES[reqId] || [];
  const filters = [["manual", "Manual"], ["system", "System"], ["flags", "Flags"], ["comms", "Comms"], ["all", "All"]];
  const evs = base.filter(e => filter === "all" || (filter === "manual" && !e.system) || (filter === "system" && e.system) || (filter === "flags" && e.kind === "flag") || (filter === "comms" && e.kind === "comment"));
  const dot = { created: "var(--brand)", assigned: "var(--brand-light)", approval: "var(--approved-fg)", handoff: "var(--brand-accent)", flag: "var(--coral)", status: "var(--periwinkle)" };
  return <div>
    <div className="row gap-2" style={{ marginBottom: 16 }}>{filters.map(([v, l]) => <button key={v} onClick={() => setFilter(v)} className={"btn btn-sm " + (filter === v ? "" : "btn-secondary")}>{l}</button>)}</div>
    <div className="col">
      {evs.map((e, i) => <div key={i} className="row gap-3" style={{ alignItems: "flex-start", position: "relative", paddingBottom: 18 }}>
        {i < evs.length - 1 && <div style={{ position: "absolute", left: 15, top: 30, bottom: 0, width: 2, background: "var(--border)" }} />}
        <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--surface)", border: `2px solid ${dot[e.kind] || "var(--border-strong)"}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }} className={e.current ? "attention-pulse" : ""}>
          <Icon name={e.icon} size={15} color={dot[e.kind] || "var(--muted)"} /></div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div className="row gap-2"><span style={{ fontSize: 13.5, fontWeight: 600 }}>{e.stage}</span>
            {e.system && <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>AUTO</span>}
            {e.severity === "high" && <span className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}>high</span>}
            {e.current && <span className="pill pill-sm" style={{ background: "var(--periwinkle)", color: "var(--brand)" }}>current</span>}</div>
          <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{e.detail}</div>
          <div className="label" style={{ fontSize: 9, marginTop: 4 }}>{e.actor} · {e.role} · {e.at}{e.duration ? ` · ${e.duration}` : ""}</div>
        </div>
      </div>)}
    </div>
  </div>;
}

function ClientIntelMini({ req, nav }) {
  const acc = DM.ACCOUNTS.find(a => a.name === req.brand || a.name === req.account);
  if (!acc) return <div className="card">
    <div className="row gap-2" style={{ marginBottom: 8 }}><Icon name="intel" size={15} color="var(--brand-accent)" /><div className="h3">Client context</div></div>
    <div style={{ padding: "14px 12px", borderRadius: 10, background: "var(--page)", textAlign: "center" }}>
      <div style={{ fontWeight: 600, fontSize: 13.5 }}>No intelligence yet for {req.brand}</div>
      <div className="body-sm" style={{ fontSize: 12, marginTop: 4 }}>This client isn't in the account base yet — intelligence builds up once they're onboarded.</div>
    </div>
  </div>;
  const share = DM.ACCOUNT_SHARE[acc.id];
  const health = acc.rating * 18 + 8;
  return <div className="card">
    <div className="row between" style={{ marginBottom: 12 }}>
      <div className="row gap-2"><Icon name="intel" size={15} color="var(--brand-accent)" /><div className="h3">Client context</div>{acc.vvip && <VVIPBadge size="sm" />}</div>
      <button className="btn btn-ghost btn-sm" onClick={() => nav("CI-01")}>View all <Icon name="arrowRight" size={13} /></button>
    </div>
    <div className="row gap-3" style={{ alignItems: "center", marginBottom: 12 }}>
      <Ring value={health} size={62} color={health > 70 ? "var(--ok)" : "var(--review-fg)"} label="health" />
      <div><div style={{ fontWeight: 700, fontSize: 14 }}>{acc.name}</div><div className="body-sm" style={{ fontSize: 12 }}>{acc.segment} · avg order {acc.avgOrderValue}</div>
        {share && <div className="body-sm" style={{ fontSize: 11.5, marginTop: 2 }}>Our share: <b>{share.made}/{share.total}</b> SKUs</div>}</div>
    </div>
    <div className="row gap-2 wrap">{["Premium-led", acc.rating >= 4 ? "Responsive" : "Watch SLA", "Claims-driven"].map(t => <span key={t} className="chip" style={{ height: 22, fontSize: 11 }}>{t}</span>)}</div>
    <div className="body-sm" style={{ fontSize: 11.5, marginTop: 10 }}>{acc.strategicNotes}</div>
  </div>;
}

function FlagSolverInline({ req, f }) {
  window.useStore();
  const [sol, setSol] = useState("");
  return <div style={{ padding: 12, borderRadius: 10, background: "var(--coral-wash)" }}>
    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--coral-dark)" }}>{f.typeLabel || f.type}</div>
    <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{f.text}</div>
    <div className="label" style={{ fontSize: 8.5, marginTop: 4 }}>raised by {f.raisedBy} · {f.raisedAt || "recently"}</div>
    {f.solution ? <div className="row gap-2" style={{ marginTop: 8 }}><span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>Solution sent · awaiting SPOC confirmation</span></div>
      : <div className="col gap-2" style={{ marginTop: 8 }}>
        <textarea className="textarea" value={sol} onChange={e => setSol(e.target.value)} placeholder="Your response / solution for this flag…" style={{ minHeight: 56, background: "var(--surface)" }} />
        <button className="btn btn-sm" style={{ width: "fit-content" }} disabled={!sol.trim()} onClick={() => { window.NaturisStore.resolveFlag(req.id, f.id, sol.trim(), "Kunal Shah"); setSol(""); }}><Icon name="check" size={13} /> Send response</button>
      </div>}
  </div>;
}

function SM03_Review({ params, nav }) {
  window.useStore();
  const req = DM.REQUIREMENTS.find(r => r.id === params.reqId);
  const [vvip, setVvip] = useState(req ? req.vvip : false);
  const [type, setType] = useState(req ? req.projectType : "EPD");
  const gate = ["TT", "NPD"].includes(type);
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState("");
  const [discussNote, setDiscussNote] = useState("");
  const [threadNote, setThreadNote] = useState("");
  const [threadSent, setThreadSent] = useState(false);
  if (!req) return <div className="card" style={{ textAlign: "center", padding: 48 }}>
    <Icon name="search" size={24} color="var(--brand-light)" />
    <div className="h3" style={{ marginTop: 8 }}>Requirement not found</div>
    <div className="body-sm" style={{ marginTop: 4 }}>It may have been removed, or the link is stale.</div>
    <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={() => nav("SM-02")}>Back to review desk</button>
  </div>;
  const openFlags = (req.flags || []).filter(f => !f.resolved);
  // once the lab has acknowledged, the brief is locked — no more type/VVIP overrides
  const overrideLocked = !["Pending review", "Logged", "R&D assessing", "R&D assessed", "Returned to SPOC", "Approved"].includes(req.status);
  function addThreadNote() {
    if (!threadNote.trim()) return;
    (window.NaturisData.REQUIREMENT_TIMELINES[req.id] = window.NaturisData.REQUIREMENT_TIMELINES[req.id] || []).push({
      kind: "status", icon: "note", stage: "Manager note", actor: "Kunal Shah", role: "Sales Manager", at: "just now", detail: threadNote.trim() });
    window.NaturisStore.update(req.id, {});
    setThreadNote(""); setThreadSent(true);
  }

  function commitDecision(kind) {
    setDecision(kind);
    // immutable audit when the manager overrides the SPOC's project type or VVIP
    if (type !== req.projectType) window.NaturisStore.addAudit({ actor: "Kunal Shah", role: "Sales Manager", action: "Project type override", target: req.id, field: "projectType", before: req.projectType, after: type, note });
    if (vvip !== req.vvip) window.NaturisStore.addAudit({ actor: "Kunal Shah", role: "Sales Manager", action: "VVIP override", target: req.id, field: "vvip", before: String(req.vvip), after: String(vvip), note });
    window.NaturisStore.addAudit({ actor: "Kunal Shah", role: "Sales Manager", action: "Review decision", target: req.id, field: "status", before: req.status, after: kind, note });
    if (kind === "Approved") { window.NaturisStore.update(req.id, { projectType: type, vvip }); window.NaturisStore.setStatus(req.id, "Approved", "Kunal Shah"); window.NaturisStore._notify(req.id, "dispatch", "info", req.id + " approved by your manager", "Moving to the lab queue." + (note ? " Note: " + note : ""), "NR-02"); }
    if (kind === "Returned to SPOC") window.NaturisStore.returnToSpoc(req.id, note.trim(), "Kunal Shah");
  }

  return <div>
    <div className="row between" style={{ marginBottom: 14, alignItems: "flex-start" }}>
      <div>
        <div className="row gap-2" style={{ marginBottom: 8 }}>{vvip && <VVIPBadge size="md" />}<ProjectTypePill type={type} showLabel size="lg" /><span className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>{req.id}</span><StatusPill status={req.status} /><SLAIndicator req={req} mini={false} /></div>
        <div className="h1" style={{ fontSize: 32 }}><span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title}</div>
        <div className="body" style={{ color: "var(--muted)" }}>submitted by {req.submittedBy} · {req.submittedAt}</div>
      </div>
      <button className="btn btn-secondary" onClick={() => nav("SM-02")}><Icon name="queue" size={15} /> Back to review desk</button>
    </div>

    {openFlags.length > 0 && <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: "var(--coral-wash)", border: "1px solid var(--coral)" }}>
      <div className="row gap-2" style={{ marginBottom: 6 }}><Icon name="flag" size={16} color="var(--coral-dark)" /><span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--coral-dark)" }}>{openFlags.length} open flag{openFlags.length > 1 ? "s" : ""} on this requirement</span></div>
      {openFlags.map((f, i) => <div key={f.id || i} className="body-sm" style={{ fontSize: 12.5, color: "var(--coral-dark)", paddingLeft: 24 }}>• {f.typeLabel || f.type}{f.text ? " — " + f.text : ""} <span style={{ opacity: .7 }}>(raised by {f.raisedBy})</span></div>)}
    </div>}
    <div className="grid gap-4" style={{ gridTemplateColumns: "1.5fr 1fr", alignItems: "start" }}>
      <div className="col gap-4">
        {/* stage progress WITH timestamps — no separate activity tab */}
        <div className="card"><SectionTitle sub="Every action stamped with who & when">Stage progress</SectionTitle>
          <ProgressTimeline req={req} /></div>
        {/* client context — on the left to balance the page */}
        <ClientIntelMini req={req} nav={nav} />
        {/* full requirement — popup */}
        <div className="card row between" style={{ alignItems: "center" }}>
          <div><div className="h3">Full requirement</div><div className="body-sm" style={{ fontSize: 12 }}>Everything captured at intake — brief, handoff, commercials, references.</div></div>
          {window.FullBriefButton && <window.FullBriefButton req={req} />}
        </div>
      </div>

      <div className="col gap-4">
        {!overrideLocked ? <>
        {/* VVIP — its own gold card, visually distinct from the type override */}
        <div className="card" style={{ borderTop: "3px solid #D97706", background: "linear-gradient(150deg, #FEF3C7 0%, var(--surface) 55%)" }}>
          <div className="row between" style={{ alignItems: "center" }}>
            <div className="row gap-3" style={{ alignItems: "center" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(217,119,6,.35)" }}><Icon name="star" size={19} color="#fff" /></span>
              <div><div className="h3">VVIP status</div><div className="body-sm" style={{ fontSize: 12 }}>Gold badge · force-sorted to the top everywhere · Management notified</div></div>
            </div>
            <Toggle on={vvip} onChange={setVvip} />
          </div>
          {vvip && <div className="row gap-2" style={{ marginTop: 10 }}><VVIPBadge size="sm" /><span className="body-sm" style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>This requirement is treated as VVIP across all roles.</span></div>}
        </div>
        <div className="card"><SectionTitle sub="A suggestion, not a decision — your call as the gate">Project type override</SectionTitle>
          <ProjectTypePicker value={type} onChange={setType} aiSuggested={req.projectType} gateLocked={gate} />
        </div>
        </> : <div className="card">
          <SectionTitle sub="Lab has acknowledged — type & VVIP are locked">Add a note to the thread</SectionTitle>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--page)", marginBottom: 10 }}>
            <div className="body-sm" style={{ fontSize: 12 }}><Icon name="alert" size={12} /> Overrides are disabled once the lab acknowledges. Use a note to communicate context — it lands on the requirement timeline.</div></div>
          <textarea className="textarea" value={threadNote} onChange={e => setThreadNote(e.target.value)} placeholder="e.g. Client pushed the launch by 2 weeks — deprioritise vs Nykaa serum…" style={{ minHeight: 64 }} />
          <div className="row gap-2" style={{ marginTop: 10 }}>
            <button className="btn btn-sm" disabled={!threadNote.trim()} onClick={addThreadNote}><Icon name="note" size={13} /> Add note to thread</button>
            {threadSent && <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>Note added to timeline</span>}
          </div>
        </div>}

        {overrideLocked && openFlags.length > 0 && <div className="card" style={{ border: "1px solid var(--coral)" }}>
          <SectionTitle sub="The lab is engaged — there's no approve / reject here, respond to the flag instead">Respond to open flags</SectionTitle>
          <div className="col gap-3">
            {openFlags.map((f, fi) => <FlagSolverInline key={f.id || fi} req={req} f={f} />)}
          </div>
        </div>}
        {!overrideLocked && <div className="card">
          <SectionTitle sub={gate ? "Required gate for TT / NPD" : "EPD / REN — optional"}>Decision</SectionTitle>
          {decision === "Approved" || decision === "Returned to SPOC" ? <div className="col center gap-2" style={{ padding: 16 }}>
            <span className="pill" style={{ background: decision === "Approved" ? "var(--approved-bg)" : "var(--coral-wash)", color: decision === "Approved" ? "var(--approved-fg)" : "var(--coral-dark)" }}>{decision}</span>
            {note && <div className="body-sm" style={{ fontSize: 12, textAlign: "center" }}>“{note}”</div>}
            <button className="btn btn-ghost btn-sm" onClick={() => setDecision(null)}>Undo</button>
          </div> : decision === "In discussion" ? <>
            <div style={{ padding: "10px 12px", background: "var(--review-bg)", borderRadius: 8, marginBottom: 12 }}>
              <div className="body-sm" style={{ fontSize: 12.5, color: "var(--review-fg)" }}><b>In discussion with SPOC.</b> Override any detail above (type/VVIP), add a note, then take the final decision.</div></div>
            <Field label="Decision note"><textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="What changed, what you decided & why…" style={{ minHeight: 70 }} /></Field>
            <div className="row gap-2" style={{ marginTop: 12 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => commitDecision("Approved")}><Icon name="check" size={15} /> Approve & move on</button>
              <button className="btn btn-destructive" style={{ flex: 1 }} disabled={!note.trim()} title="A note is mandatory when returning" onClick={() => commitDecision("Returned to SPOC")}>Reject / return</button>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setDecision(null)}>Cancel discussion</button>
          </> : <>
            <Field label="Decision note (mandatory to return, optional to approve)"><textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Comment for the SPOC…" style={{ minHeight: 60, marginBottom: 12 }} /></Field>
            <div className="col gap-2">
              <button className="btn" onClick={() => commitDecision("Approved")}><Icon name="check" size={15} /> Approve {gate ? "for R&D" : ""}</button>
              <button className="btn btn-secondary" onClick={() => setDecision("In discussion")}>Mark in discussion</button>
              <button className="btn btn-destructive" disabled={!note.trim()} title="A note is mandatory when returning" onClick={() => commitDecision("Returned to SPOC")}>Reject / return</button>
            </div>
          </>}
        </div>}
      </div>
    </div>
  </div>;
}

/* ====================================================================
   SM-04 · TEAM PIPELINE (2 tabs)
   ==================================================================== */
function SM04_Team({ nav, embedded }) {
  const [tab, setTab] = useState("team");
  const [who, setWho] = useState("all");
  const auditLog = (window.NaturisStore && window.NaturisStore.audit) || [];
  const spocs = ["Hardik Shah", "Divya Rao"].map(name => {
    const all = DM.REQUIREMENTS.filter(r => r.submittedBy === name);
    const mine = all.filter(r => r.status !== "Archived");
    const myIds = new Set(all.map(r => r.id));
    const dispatched = all.filter(r => ["Dispatch awaiting SPOC approval", "Sent to client", "Client approved", "In stability", "Archived"].includes(r.status));
    const onTime = dispatched.filter(r => DM.slaStatus(r).level !== "red");
    return { name, capacity: Math.min(95, mine.length * 11 + 18), active: mine.length,
      pending: mine.filter(r => r.status === "Pending review").length,
      delayed: mine.filter(r => DM.slaStatus(r).level === "red").length,
      flags: mine.reduce((n, r) => n + r.flags.filter(f => !f.resolved).length, 0),
      // performance scoreboard — good work vs watch-outs
      dispatched: dispatched.length,
      onTimePct: dispatched.length ? Math.round(onTime.length / dispatched.length * 100) : null,
      approvals: all.filter(r => ["Client approved", "In stability", "Archived"].includes(r.status)).length,
      overrides: auditLog.filter(a => myIds.has(a.target) && /override/i.test(a.action || "")).length,
      sendBacks: all.filter(r => r.status === "Declined" || r.status === "Returned to SPOC").length
        + auditLog.filter(a => myIds.has(a.target) && a.after === "Returned to SPOC").length,
      queries: all.reduce((n, r) => n + (r.queries || []).length, 0),
      overrideLog: auditLog.filter(a => myIds.has(a.target) && /override/i.test(a.action || "")),
      flagsByCat: all.reduce((acc, r) => { (r.flags || []).filter(f => f.raisedByRole === "Sales SPOC").forEach(f => { const k = f.typeLabel || f.type; acc[k] = (acc[k] || 0) + 1; }); return acc; }, {}) };
  });
  const reqs = DM.REQUIREMENTS;
  return <div className="col gap-5">
    {!embedded && <PageHead title="Team pipeline" />}
    <FilterTiles min={200} value={tab} onChange={setTab} options={[
      { key: "team", label: "Team members", icon: "team", count: spocs.length },
      { key: "other", label: "Other live requirements", icon: "list", count: reqs.filter(r => r.ownership !== "shared" && r.status !== "Archived").length },
    ]} />
    {tab === "team" && <FilterTiles min={150} value={who} onChange={setWho} options={[
      { key: "all", label: "All SPOCs", icon: "team", count: spocs.length },
      ...spocs.map(sp => ({ key: sp.name, label: sp.name, icon: "user", count: sp.active, sub: sp.flags ? sp.flags + " flag" + (sp.flags > 1 ? "s" : "") : "no flags" })),
    ]} />}
    {tab === "team" ? <>
      {/* view angle: person → brand → requirement */}
      <div className="col gap-4">
        {spocs.filter(s => who === "all" || s.name === who).map(s => {
          const items = reqs.filter(r => r.submittedBy === s.name && r.status !== "Archived");
          const brands = Array.from(new Set(items.map(r => r.brand)));
          return <div key={s.name} className="card">
            <div className="row between" style={{ marginBottom: 14 }}>
              <div className="row gap-3">
                <Ring value={s.capacity} size={56} label="load" color={s.capacity > 75 ? "var(--coral)" : "var(--brand-accent)"} />
                <div><div className="h3">{s.name}</div><div className="body-sm" style={{ fontSize: 12 }}>Sales SPOC · {brands.length} brand{brands.length !== 1 ? "s" : ""} · {items.length} live</div></div>
              </div>
              <div className="row gap-2">{s.flags > 0 && <span className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}>{s.flags} flag</span>}{s.delayed > 0 && <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)" }}>{s.delayed} delayed</span>}</div>
            </div>
            {/* flags raised, by category */}
            {Object.keys(s.flagsByCat).length > 0 && <div className="row gap-2 wrap" style={{ marginBottom: 10 }}>
              <span className="label" style={{ fontSize: 8.5, alignSelf: "center" }}>Flags raised</span>
              {Object.entries(s.flagsByCat).map(([cat, n]) => <span key={cat} className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}><Icon name="flag" size={10} color="var(--coral-dark)" /> {cat} · {n}</span>)}
            </div>}
            {/* manager overrides on this SPOC's requirements */}
            {s.overrideLog.length > 0 && <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "var(--review-bg)" }}>
              <div className="label" style={{ fontSize: 8.5, marginBottom: 6, color: "var(--review-fg)" }}>Manager overrides · {s.overrideLog.length}</div>
              {s.overrideLog.map(a => <div key={a.id} className="body-sm" style={{ fontSize: 11.5, padding: "3px 0", color: "var(--review-fg)" }}>
                <b>{a.action}</b> on <span className="mono">{a.target}</span> — {a.before} → {a.after} · {a.at}</div>)}
            </div>}
            {/* performance scoreboard: the good work and the watch-outs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 14 }}>
              {[
                ["On-time dispatch", s.onTimePct === null ? "—" : s.onTimePct + "%", s.onTimePct === null ? 0 : (s.onTimePct >= 80 ? 1 : -1)],
                ["Client approvals", s.approvals, s.approvals > 0 ? 1 : 0],
                ["Dispatches", s.dispatched, s.dispatched > 0 ? 1 : 0],
                ["Mgr overrides", s.overrides, s.overrides > 0 ? -1 : 1],
                ["Lab send-backs", s.sendBacks, s.sendBacks > 0 ? -1 : 1],
                ["Lab queries", s.queries, s.queries > 2 ? -1 : 0],
              ].map(([l, v, tone]) => <div key={l} style={{ padding: "10px 12px", borderRadius: 10,
                background: tone > 0 ? "var(--approved-bg)" : tone < 0 ? "var(--coral-wash)" : "var(--page)" }}>
                <div className="serif-num" style={{ fontSize: 21, color: tone > 0 ? "var(--approved-fg)" : tone < 0 ? "var(--coral-dark)" : "var(--ink)" }}>{v}</div>
                <div className="label" style={{ fontSize: 8.5, marginTop: 2 }}>{l}</div>
              </div>)}
            </div>
            <div className="col gap-3">
              {brands.map(b => <div key={b} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <div className="row gap-2" style={{ padding: "9px 12px", background: "var(--page)" }}><Icon name="brand" size={14} color="var(--brand)" /><span style={{ fontWeight: 600, fontSize: 13 }}>{b}</span><span className="label" style={{ fontSize: 9 }}>{items.filter(r => r.brand === b).length} requirement(s)</span></div>
                {window.vvipSort(items.filter(r => r.brand === b)).map(r => <div key={r.id} className="row between clickable" style={{ padding: "9px 12px", borderTop: "1px solid var(--border)", cursor: "pointer" }} onClick={() => nav("SM-03", { reqId: r.id })}>
                  <div className="row gap-2" style={{ minWidth: 0 }}>{r.vvip && <VVIPBadge size="sm" />}<span className="mono" style={{ fontSize: 11 }}>{r.id.slice(-4)}</span><span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span><ProjectTypePill type={r.projectType} /></div>
                  <div className="row gap-2"><StatusPill status={r.status} size="sm" /><SLAIndicator req={r} /></div>
                </div>)}
              </div>)}
              {brands.length === 0 && <div className="body-sm">No live requirements.</div>}
            </div>
          </div>;
        })}
      </div>
      <div className="card"><SectionTitle>Approval bottlenecks</SectionTitle>
        {reqs.filter(r => r.status === "Pending review" || DM.slaStatus(r).level === "red").map(r => <div key={r.id} className="row between" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 6, cursor: "pointer" }} onClick={() => nav("SM-03", { reqId: r.id })}>
          <div className="row gap-2">{r.vvip && <VVIPBadge size="sm" />}<span className="mono" style={{ fontSize: 12 }}>{r.id}</span><span style={{ fontWeight: 500 }}>{r.title}</span></div>
          <div className="row gap-2"><StatusPill status={r.status} size="sm" /><SLAIndicator req={r} /></div></div>)}
      </div>
    </> : <div className="grid grid-2 gap-4">
      {reqs.filter(r => r.ownership !== "shared" && r.status !== "Archived").map(r => {
        const colour = { unassigned: ["var(--review-bg)", "var(--review-fg)"], escalated: ["var(--coral-wash)", "var(--coral-dark)"] }[r.ownership] || ["var(--brand-wash)", "var(--brand-mid)"];
        return <div key={r.id} className="card">
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="pill pill-sm" style={{ background: colour[0], color: colour[1], textTransform: "capitalize" }}>{r.ownership}</span>
            {r.vvip && <VVIPBadge size="sm" />}</div>
          <div className="h3" style={{ marginBottom: 2 }}>{r.title}</div>
          <div className="body-sm" style={{ marginBottom: 10 }}>{r.brand} · <span className="mono">{r.id}</span></div>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: colour[0], marginBottom: 12 }}>
            <div className="body-sm" style={{ fontSize: 12, color: colour[1] }}>{r.ownership === "unassigned" ? "No tracker assigned — needs an owner." : r.ownership === "escalated" ? "Escalated — VVIP / risk needs manager attention." : "Shared between SPOC & lab."}</div></div>
          <div className="row gap-2">
            <button className="btn btn-sm" onClick={() => nav("SM-03", { reqId: r.id })}>Take action</button>
            <button className="btn btn-secondary btn-sm">{r.ownership === "unassigned" ? "Assign" : "Self-assign"}</button></div>
        </div>;
      })}
    </div>}
  </div>;
}

/* ====================================================================
   SM-05 · FLAG REVIEW (risk command centre)
   ==================================================================== */
function FlagSolver({ f }) {
  const [open, setOpen] = useState(false);
  const [sol, setSol] = useState(f.solution || "");
  return <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
    <div className="row gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>
      <div className="grow" />
      {f.solution ? <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>Solution sent · awaiting SPOC</span>
        : <button className="btn btn-sm btn-secondary" onClick={() => setOpen(!open)}>Provide solution</button>}
    </div>
    {open && !f.solution && <div className="col gap-2" style={{ marginTop: 8 }}>
      <textarea className="textarea" value={sol} onChange={e => setSol(e.target.value)} placeholder="Resolution / guidance for the SPOC…" style={{ minHeight: 60 }} />
      <button className="btn btn-sm" disabled={!sol} onClick={() => { window.NaturisStore.resolveFlag(f.req.id, f.id, sol, "Kunal Shah"); setOpen(false); }}>Send solution</button>
    </div>}
  </div>;
}
function SM05_Flags({ nav, embedded }) {
  window.useStore();
  const reqs = DM.REQUIREMENTS;
  const flags = reqs.flatMap(r => r.flags.filter(f => !f.resolved).map(f => ({ ...f, req: r })));
  return <div className="col gap-5">
    {!embedded && <PageHead title="Flag review" sub="Open flags across the team — provide a solution to close the loop." />}
    <div className="col gap-2">
      {flags.map((f, i) => {
        const color = DM.FLAG_TYPE_COLOR[f.type] || "var(--coral-dark)";
        return <div key={(f.req.id || "") + "-" + (f.id || i)} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row between wrap gap-2" style={{ padding: "10px 16px", background: "var(--coral-wash)", borderBottom: "1px solid var(--border)" }}>
            <span className="row gap-2">
              <Icon name="flag" size={14} color="var(--coral-dark)" />
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--coral-dark)" }}>{f.typeLabel || DM.FLAG_TYPES.find(x => x.code === f.type)?.label || f.type}</span>
              {f.owner && <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--coral-dark)" }}>owner · {f.owner}</span>}
            </span>
            <span className="label" style={{ fontSize: 9 }}>raised by {f.raisedBy} · {f.raisedAt || "just now"}</span>
          </div>
          <div style={{ padding: 16 }}>
            <div className="row between wrap" style={{ gap: 14, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                  {f.req.vvip && <VVIPBadge size="sm" />}
                  <span className="mono" style={{ fontSize: 11, color: "var(--brand-mid)", fontWeight: 600 }}>{f.req.id}</span>
                  <StatusPill status={f.req.status} size="sm" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 4 }}><span style={{ color: "var(--brand-mid)" }}>{f.req.brand}</span> · {f.req.title}</div>
                <div className="body-sm clamp2" style={{ fontSize: 12.5, marginTop: 4 }}>{f.text}</div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }} onClick={() => nav("SM-03", { reqId: f.req.id })}>Open requirement</button>
            </div>
            <FlagSolver f={f} />
          </div>
        </div>;
      })}
      {!flags.length && <div className="card" style={{ textAlign: "center", padding: 30 }}><div className="body-sm">No open flags. All clear.</div></div>}
    </div>
  </div>;
}

/* ====================================================================
   SM-06 · TEAM REPORTS
   ==================================================================== */
function SM06_Reports({ embedded }) {
  const reports = ["Overview", "SPOC comparison", "Escalations", "Delayed", "Interventions", "Risk", "Bottlenecks"];
  const [sel, setSel] = useState("Overview");
  return <div className="col gap-5">
    {!embedded && <PageHead title="Team reports" actions={<><select className="select" style={{ width: 140 }}><option>This quarter</option></select><button className="btn btn-secondary"><Icon name="download" size={15} /> Export</button></>} />}
    <div className="grid gap-4" style={{ gridTemplateColumns: "200px 1fr", alignItems: "start" }}>
      <div className="card" style={{ padding: 8 }}>
        {reports.map(r => <button key={r} onClick={() => setSel(r)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", background: sel === r ? "var(--brand-wash)" : "transparent", color: sel === r ? "var(--brand)" : "var(--muted)", fontWeight: sel === r ? 600 : 500, fontSize: 13, cursor: "pointer" }}>{r}</button>)}
      </div>
      <div className="col gap-4">
        <div className="grid grid-4 gap-3">
          <ReportKPI label="Team SLA" value="89" suffix="%" delta="+2%" good />
          <ReportKPI label="Escalations" value="3" delta="this month" />
          <ReportKPI label="Avg review time" value="1.4" suffix="days" good delta="under 2d gate" />
          <ReportKPI label="Interventions" value="6" />
        </div>
        <div className="card"><SectionTitle>{sel} — by SPOC</SectionTitle>
          <BarChart data={[{ label: "Aarav", value: 38 }, { label: "Divya", value: 24 }, { label: "Team avg", value: 31, color: "var(--periwinkle)" }]} /></div>
        <div className="card"><SectionTitle>Detail</SectionTitle>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>SPOC</Th><Th>Live</Th><Th>SLA%</Th><Th>Escalations</Th><Th>Avg TAT</Th></tr></thead>
            <tbody>{[["Hardik Shah", 8, "92%", 2, "18d"], ["Divya Rao", 5, "85%", 1, "21d"]].map(r => <tr key={r[0]}>{r.map((c, i) => <Td key={i} mono={i > 0}>{c}</Td>)}</tr>)}</tbody></table></div>
        </div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   CI-01 · CLIENT INTELLIGENCE (restricted: Mgr + Mgmt) — infographic-led
   ==================================================================== */
function FitScorePanel({ accId, isMgmt }) {
  window.useStore();
  const s = DM.FIT_SCORES[accId] || { bp: 5, pf: 5, ei: 5, sv: 5, history: [] };
  const final = DM.fitFinal(s);
  const cat = DM.fitCategory(final);
  const TONES = { rejected: { bg: "var(--rejected-bg)", fg: "var(--rejected-fg)" }, review: { bg: "var(--review-bg)", fg: "var(--review-fg)" }, lab: { bg: "var(--lab-bg)", fg: "var(--lab-fg)" }, approved: { bg: "var(--approved-bg)", fg: "var(--approved-fg)" } };
  const tone = TONES[cat.tone] || TONES.lab;
  const dims = [["bp", "Business Potential · 25%", "Can they generate revenue currently?"], ["pf", "Product Fit · 25%", "Do our products match their requirements?"], ["ei", "Engagement & Intent · 25%", "How serious and responsive the client is"], ["sv", "Strategic Value · 25%", "Long-term brand or market value"]];
  return <div className="card" style={{ borderTop: "3px solid " + tone.fg }}>
    <div className="row between" style={{ marginBottom: 12 }}>
      <div><div className="h3">Client fit score</div><div className="body-sm" style={{ fontSize: 12 }}>4 dimensions × 25% · management-only · audit-tracked</div></div>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <div style={{ textAlign: "right" }}><div className="serif-num" style={{ fontSize: 34, color: tone.fg }}>{final}</div><div className="label" style={{ fontSize: 9 }}>/ 10</div></div>
        <div style={{ textAlign: "center" }}><span className="pill" style={{ background: tone.bg, color: tone.fg }}>{cat.label}</span>{cat.hint && <div className="label" style={{ fontSize: 8.5, marginTop: 4, color: tone.fg }}>{cat.hint}</div>}</div>
      </div>
    </div>
    <div className="grid grid-2 gap-3">
      {dims.map(([k, label, hint]) => <div key={k} style={{ padding: 12, borderRadius: 10, background: "var(--page)" }}>
        <div className="row between"><span style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</span><span className="mono" style={{ fontWeight: 700, color: "var(--brand)" }}>{s[k]}/10</span></div>
        <div className="body-sm" style={{ fontSize: 10.5, margin: "2px 0 8px" }}>{hint}</div>
        {isMgmt ? <input type="range" min="0" max="10" value={s[k]} onChange={e => window.NaturisStore.setFit(accId, k, +e.target.value, "Rahul Tandon")} style={{ width: "100%", accentColor: "var(--brand)" }} />
          : <div className="bar-track"><div className="bar-fill" style={{ width: (s[k] * 10) + "%" }} /></div>}
      </div>)}
    </div>
    <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "var(--page)" }}>
      <div className="body-sm" style={{ fontSize: 11.5 }}><b>Final = (BP × 0.25) + (PF × 0.25) + (EI × 0.25) + (SV × 0.25)</b> · out of 10</div>
      <div className="row gap-2 wrap" style={{ marginTop: 6 }}>
        {[["0–3", "Low fit — avoid / low priority", "var(--rejected-bg)", "var(--rejected-fg)"], ["4–6", "Medium fit — can be explored", "var(--review-bg)", "var(--review-fg)"], ["7–8", "High fit — focus", "var(--lab-bg)", "var(--lab-fg)"], ["9–10", "Ideal client — prioritize aggressively", "var(--approved-bg)", "var(--approved-fg)"]].map(([band, lbl, bg, fg]) =>
          <span key={band} className="pill pill-sm" style={{ background: bg, color: fg }}><b>{band}</b>&nbsp;{lbl}</span>)}
      </div>
    </div>
    {s.history.length > 0 && <div style={{ marginTop: 12 }}>
      <div className="label" style={{ marginBottom: 6 }}>Audit trail</div>
      <div className="col gap-1">{s.history.slice(0, 5).map((h, i) => <div key={i} className="row gap-2" style={{ fontSize: 11.5, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
        <Icon name="history" size={12} color="var(--brand-light)" /><span className="mono" style={{ color: "var(--brand)", fontWeight: 600 }}>{h.final}</span><span style={{ flex: 1 }}>{h.note}</span><span className="label" style={{ fontSize: 9 }}>{h.by} · {h.at}</span></div>)}</div>
    </div>}
  </div>;
}
function CI01_Intelligence({ role }) {
  window.useStore();
  const [accId, setAccId] = useState(DM.ACCOUNTS[0].id);
  const acc = DM.ACCOUNTS.find(a => a.id === accId);
  const isMgmt = role === "mgmt" || role === "admin";
  const health = acc.rating * 18 + 8;
  const ci = (DM.CI_DATA[accId] || {});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ci);
  useEffect(() => { setDraft(DM.CI_DATA[accId] || {}); setEditing(false); }, [accId]);
  const personaChips = (editing ? draft.persona : ci.persona) || ["Premium-led", "Provenance-focused", "High LTV", "Claims-driven"];
  function saveCI() { window.NaturisStore.setCI(accId, { decisionStyle: draft.decisionStyle, responseSpeed: draft.responseSpeed, commPref: draft.commPref, notes: draft.notes, persona: draft.persona }, "Rahul Tandon"); setEditing(false); }
  return <div className="col gap-5">
    <div style={{ background: "var(--coral-wash)", border: "1px solid var(--coral)", borderRadius: 10, padding: "10px 16px", display: "flex", gap: 10, alignItems: "center" }}>
      <Icon name="eye" size={16} color="var(--coral-dark)" /><span className="body-sm" style={{ color: "var(--coral-dark)" }}><b>Confidential</b> · AI-generated labels — restricted to Sales Managers & Management.</span></div>

    {/* PROMINENT brand selector — the main control */}
    <div className="card" style={{ background: "var(--tile-tint)" }}>
      <div className="row between" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}><Icon name="brand" size={12} /> Choose a brand</div>
          <div className="row gap-2 wrap">
            {DM.ACCOUNTS.map(a => { const on = a.id === accId; return <button key={a.id} onClick={() => setAccId(a.id)}
              style={{ textAlign: "left", minWidth: 124, padding: "12px 16px", borderRadius: 12, cursor: "pointer", transition: "all .15s",
                border: on ? "2px solid var(--brand)" : "1px solid var(--border)", background: on ? "var(--brand)" : "var(--surface)", color: on ? "#fff" : "var(--ink)",
                boxShadow: on ? "0 6px 16px rgba(18,57,95,.25)" : "var(--sh-sm)" }}>
              <div className="row gap-2">{a.vvip && <VVIPBadge size="sm" />}<span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span></div>
              <div style={{ fontSize: 11, opacity: .75, marginTop: 2 }}>{a.segment}</div>
            </button>; })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}><div className="h1" style={{ fontSize: 28 }}>{acc.name}</div><div className="body-sm">{acc.segment} · avg order {acc.avgOrderValue}</div></div>
      </div>
    </div>

    {isMgmt ? <FitScorePanel accId={accId} isMgmt={isMgmt} />
      : <CompatibilityNote severity="ok" title="Fit score is management-only">The 4-dimension client fit score is visible to Management profiles only.</CompatibilityNote>}
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
      <div className="card"><div className="row between" style={{ marginBottom: 12 }}><div className="label">Persona & communication</div>
        {isMgmt && (editing ? <button className="btn btn-sm" onClick={saveCI}><Icon name="check" size={13} /> Save</button> : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><Icon name="edit" size={13} /> Edit</button>)}</div>
        {editing ? <div className="col gap-2">
          <Field label="Persona chips (comma-sep)"><input className="input" defaultValue={personaChips.join(", ")} onChange={e => setDraft(d => ({ ...d, persona: e.target.value.split(",").map(x => x.trim()).filter(Boolean) }))} /></Field>
          <Field label="Decision style"><input className="input" value={draft.decisionStyle || ""} onChange={e => setDraft(d => ({ ...d, decisionStyle: e.target.value }))} /></Field>
          <Field label="Response speed"><input className="input" value={draft.responseSpeed || ""} onChange={e => setDraft(d => ({ ...d, responseSpeed: e.target.value }))} /></Field>
          <Field label="Comm preference"><input className="input" value={draft.commPref || ""} onChange={e => setDraft(d => ({ ...d, commPref: e.target.value }))} /></Field>
          <Field label="Notes"><textarea className="textarea" value={draft.notes || acc.strategicNotes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} style={{ minHeight: 60 }} /></Field>
        </div> : <>
          <div className="row gap-2 wrap" style={{ marginBottom: 10 }}>{personaChips.map(t => <span key={t} className="chip">{t}</span>)}</div>
          {ci.decisionStyle && <div className="body-sm" style={{ fontSize: 12 }}><b>Decision:</b> {ci.decisionStyle}</div>}
          {ci.responseSpeed && <div className="body-sm" style={{ fontSize: 12 }}><b>Response:</b> {ci.responseSpeed}</div>}
          {ci.commPref && <div className="body-sm" style={{ fontSize: 12 }}><b>Prefers:</b> {ci.commPref}</div>}
          <div className="body-sm" style={{ fontSize: 12.5, marginTop: 8 }}>{ci.notes || acc.strategicNotes}</div>
          {isMgmt && <div className="label" style={{ fontSize: 9, marginTop: 8 }}>Editable by management · changes are audit-logged</div>}
        </>}</div>
      <div className="card center col"><div className="label" style={{ marginBottom: 8 }}>Relationship health</div>
        <Ring value={health} size={110} color={health > 70 ? "var(--ok)" : "var(--review-fg)"} label="score" />
        <div className="body-sm" style={{ fontSize: 12, marginTop: 8 }}>{health > 70 ? "Healthy & engaged" : "Needs attention"}</div></div>
      <div className="card"><div className="label" style={{ marginBottom: 12 }}>Engagement</div>
        {[["Avg order", acc.avgOrderValue], ["Rating", "★".repeat(acc.rating)], ["Product mix", acc.productMix.join(", ")]].map(([l, v]) => <div key={l} className="row between" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}><span className="body-sm">{l}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span></div>)}</div>
    </div>

    {/* Naturis share of this brand's SKU portfolio */}
    {(() => { const sh = DM.ACCOUNT_SHARE[accId]; if (!sh) return null;
      const pct = Math.round((sh.made / sh.total) * 100);
      const segs = [["Naturis makes", sh.made, "var(--ok)"], ["Missed (lost)", sh.missed, "var(--coral)"], ["Can't make (capability)", sh.cantMake, "var(--review-fg)"], ["Whitespace (can make)", sh.canMakeNotMaking, "var(--brand-light)"]];
      return <div className="card">
        <div className="row between" style={{ marginBottom: 14 }}>
          <div><div className="h3">Our share of {acc.name}</div><div className="body-sm" style={{ fontSize: 12 }}>How much of their portfolio Naturis manufactures — and the whitespace.</div></div>
          <div className="row gap-3" style={{ alignItems: "center" }}><Ring value={pct} size={64} label="share" color={pct >= 40 ? "var(--ok)" : "var(--review-fg)"} />
            <div style={{ textAlign: "right" }}><div className="serif-num" style={{ fontSize: 26 }}>{sh.made}<span style={{ fontSize: 16, color: "var(--muted)" }}> / {sh.total}</span></div><div className="label" style={{ fontSize: 9 }}>SKUs we make</div></div></div>
        </div>
        {/* stacked bar */}
        <div className="row" style={{ height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
          {segs.map(([l, v, c]) => <div key={l} title={`${l}: ${v}`} style={{ width: (v / sh.total * 100) + "%", background: c }} />)}
        </div>
        <div className="grid grid-4 gap-2">
          {segs.map(([l, v, c]) => <div key={l} style={{ padding: 10, borderRadius: 8, background: "var(--page)" }}>
            <div className="row gap-2"><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /><span className="serif-num" style={{ fontSize: 20 }}>{v}</span></div>
            <div className="label" style={{ fontSize: 9, marginTop: 2 }}>{l}</div></div>)}
        </div>
        <div className="ai-suggest" style={{ marginTop: 12 }}><span className="ai-eyebrow">AI · opportunity</span><div className="body-sm" style={{ fontSize: 12, marginTop: 4 }}>{sh.canMakeNotMaking} SKUs are whitespace we can formulate but don't yet supply — the biggest near-term growth lever for {acc.name}.</div></div>
      </div>;
    })()}
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="card">
        <div className="row between" style={{ marginBottom: 12 }}><div className="label">Stakeholder mapping · manually maintained</div>
          {isMgmt && <button className="btn btn-ghost btn-sm" onClick={() => { const list = (ci.stakeholders || acc.decisionMakers.map(x => ({ name: x.name, title: x.title, dept: "—", power: "Influencer", influence: x.influence, relationship: "Good", engagement: "Monthly", pref: "Email" }))).concat([{ name: "New stakeholder", title: "Title", dept: "Dept", power: "Influencer", influence: 50, relationship: "New", engagement: "—", pref: "Email" }]); window.NaturisStore.setCI(accId, { stakeholders: list }, "Rahul Tandon"); }}><Icon name="plus" size={13} /> Add</button>}
        </div>
        {(ci.stakeholders || []).length > 0 ? <div className="col gap-2">
          {ci.stakeholders.map((sm2, si) => <div key={si} style={{ padding: 10, borderRadius: 10, background: "var(--page)" }}>
            {isMgmt ? <div className="grid grid-4 gap-2">
              {[["name", "Name"], ["title", "Designation"], ["dept", "Department"], ["power", "Decision power"], ["relationship", "Relationship"], ["engagement", "Engagement freq."], ["pref", "Comm preference"], ["influence", "Influence %"]].map(([k, lbl]) =>
                <div key={k}><div className="label" style={{ fontSize: 8 }}>{lbl}</div>
                  <input className="input" style={{ height: 30, fontSize: 12 }} value={sm2[k] != null ? sm2[k] : ""} onChange={e => { const list = ci.stakeholders.map((x, xi) => xi === si ? { ...x, [k]: e.target.value } : x); window.NaturisStore.setCI(accId, { stakeholders: list }, "Rahul Tandon"); }} /></div>)}
            </div> : <div>
              <div className="row between"><span style={{ fontWeight: 600, fontSize: 13 }}>{sm2.name} · {sm2.title}</span><span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>{sm2.power}</span></div>
              <div className="body-sm" style={{ fontSize: 11.5 }}>{sm2.dept} · {sm2.relationship} · {sm2.engagement} · prefers {sm2.pref}</div>
            </div>}
          </div>)}
        </div> : null}
        <div className="label" style={{ margin: "12px 0 8px", fontSize: 8.5 }}>From order history</div>
        {acc.decisionMakers.map(dm => <div key={dm.name} style={{ marginBottom: 12 }}>
          <div className="row between" style={{ marginBottom: 4 }}><div className="row gap-2"><Avatar name={dm.name} size={26} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>{dm.name}</div><div className="body-sm" style={{ fontSize: 11 }}>{dm.title}</div></div></div>
            <span className="pill pill-sm" style={{ background: dm.sentiment === "positive" ? "var(--approved-bg)" : dm.sentiment === "negative" ? "var(--coral-wash)" : "var(--review-bg)", color: dm.sentiment === "positive" ? "var(--approved-fg)" : dm.sentiment === "negative" ? "var(--coral-dark)" : "var(--review-fg)" }}>{dm.sentiment}</span></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: dm.influence + "%" }} /></div>
          <div className="label" style={{ fontSize: 9, marginTop: 2 }}>influence {dm.influence}%</div></div>)}</div>
      <div className="card"><div className="label" style={{ marginBottom: 12 }}>Risk & opportunity · AI recommendations</div>
        <div className="col gap-2">
          {[["Opportunity", "Cross-sell sun care into existing serum line", "ok"], ["Risk", "Slow to commit — keep cadence tight", "warn"], ["Action", "Propose VVIP fast-track for Q4 gifting SKUs", "ok"]].map(([k, v, s], i) =>
            <div key={i} style={{ padding: 10, borderRadius: 8, background: "var(--brand-wash)", borderLeft: `3px solid ${s === "ok" ? "var(--ok)" : "var(--review-fg)"}` }}>
              <div className="label" style={{ fontSize: 9 }}>{k}</div><div className="body-sm" style={{ fontSize: 12.5, color: "var(--ink)" }}>{v}</div></div>)}
        </div>
        <div className="ai-suggest" style={{ marginTop: 12 }}><span className="ai-eyebrow">AI · a suggestion, not a decision</span><div className="body-sm" style={{ fontSize: 12, marginTop: 4 }}>Confidence labels are generated from communication patterns and order history.</div></div></div>
    </div>
  </div>;
}

/* ====================================================================
   SM-02 · AWAITING INTERVENTION  (approvals section + flags section)
   ==================================================================== */
function ReviewOverviewPopup({ item, onClose, nav }) {
  if (!item) return null;
  const { kind, r, f } = item;
  const Fact = ({ l, v }) => <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--page)" }}>
    <div className="label" style={{ fontSize: 8.5 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{v || "—"}</div></div>;
  return <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.35)", zIndex: 95 }} />
    <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(560px, 92vw)", background: "var(--surface)", borderRadius: 16, boxShadow: "0 24px 64px rgba(15,23,42,.3)", zIndex: 96, padding: 22 }}>
      <div className="row between" style={{ marginBottom: 4 }}>
        <span className="pill pill-sm" style={kind === "flag" ? { background: "var(--coral-wash)", color: "var(--coral-dark)", fontWeight: 700 } : { background: "var(--review-bg)", color: "var(--review-fg)", fontWeight: 700 }}>{kind === "flag" ? "FLAG" : "APPROVAL NEEDED"}</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
      </div>
      <div className="h2" style={{ fontSize: 19 }}><span style={{ color: "var(--brand-mid)" }}>{r.brand}</span> · {r.title}</div>
      <div className="body-sm" style={{ fontSize: 12 }}><span className="mono">{r.id}</span> · {r.submittedBy}</div>
      <div className="grid grid-3 gap-2" style={{ margin: "14px 0" }}>
        <Fact l="Status" v={r.status} /><Fact l="Type" v={r.projectType} /><Fact l="Started" v={(r.submittedAt || "—").replace(" 2026", "")} />
        <Fact l="Submitted" v={r.submittedAt} /><Fact l="Committed date" v={r.committedDate} /><Fact l="MOQ" v={r.moq} />
      </div>
      <div style={{ padding: "10px 12px", borderRadius: 10, background: kind === "flag" ? "var(--coral-wash)" : "var(--review-bg)", marginBottom: 14 }}>
        <div className="label" style={{ fontSize: 8.5, marginBottom: 3, color: kind === "flag" ? "var(--coral-dark)" : "var(--review-fg)" }}>{kind === "flag" ? "Why it's flagged" : "What's needed"}</div>
        <div className="body-sm" style={{ fontSize: 12.5, color: kind === "flag" ? "var(--coral-dark)" : "var(--review-fg)" }}>
          {kind === "flag" ? (f.typeLabel || f.type) + " — " + f.text + " (raised by " + f.raisedBy + ")" : "Awaiting your review decision — approve for the lab, discuss, or return with a note."}</div>
      </div>
      <div className="row gap-2">
        <button className="btn" style={{ flex: 1 }} onClick={() => { onClose(); nav("SM-03", { reqId: r.id }); }}><Icon name="arrowRight" size={14} /> Open full detail</button>
        {window.FullBriefButton && <window.FullBriefButton req={r} label="Initial requirement" />}
      </div>
    </div>
  </>;
}

function SM02_Intervention({ nav }) {
  window.useStore();
  const reqs = DM.REQUIREMENTS;
  const approvals = window.vvipSort(reqs.filter(r => r.status === "Pending review"));
  const flags = reqs.flatMap(r => r.flags.filter(f => !f.resolved).map(f => ({ f, r })));
  const [ov, setOv] = useState(null);
  const todo = [
    ...flags.map(x => ({ kind: "flag", r: x.r, f: x.f, prio: (x.r.vvip ? 0 : 2) })),
    ...approvals.map(r => ({ kind: "approval", r, prio: (r.vvip ? 1 : 3) })),
  ].sort((a, b) => a.prio - b.prio || b.r.age - a.r.age);
  return <div className="col gap-4">
    <ReviewOverviewPopup item={ov} onClose={() => setOv(null)} nav={nav} />
    <PageHead title="Review desk" sub="Everything that needs your action — one glance, no tabs. Red = flags, amber = approvals." />
    <div className="row gap-3 wrap">
      <span className="pill" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)", fontWeight: 700 }}><Icon name="flag" size={12} color="var(--coral-dark)" /> {flags.length} flag{flags.length !== 1 ? "s" : ""}</span>
      <span className="pill" style={{ background: "var(--review-bg)", color: "var(--review-fg)", fontWeight: 700 }}><Icon name="queue" size={12} color="var(--review-fg)" /> {approvals.length} awaiting approval</span>
      <span className="body-sm" style={{ alignSelf: "center", fontSize: 12 }}>{todo.length} to-dos · click a row for the quick overview</span>
    </div>
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {todo.map((it, i) => { const flag = it.kind === "flag";
        return <div key={(it.r.id || "") + (it.f ? it.f.id : "ap") + i} onClick={() => setOv(it)}
          className="row between"
          style={{ padding: "11px 16px", gap: 12, cursor: "pointer", borderTop: i > 0 ? "1px solid var(--border)" : "none",
            borderLeft: `4px solid ${flag ? "var(--coral)" : "var(--review-fg)"}`,
            background: flag ? "var(--coral-wash)" : "var(--review-bg)" }}>
          <div className="row gap-2" style={{ minWidth: 0, flex: 1 }}>
            <Icon name={flag ? "flag" : "queue"} size={14} color={flag ? "var(--coral-dark)" : "var(--review-fg)"} />
            {it.r.vvip && <VVIPBadge size="sm" />}
            <span className="mono" style={{ fontSize: 11, color: "var(--brand-mid)", fontWeight: 600 }}>{it.r.id.slice(-4)}</span>
            <span style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span style={{ color: "var(--brand-mid)" }}>{it.r.brand}</span> · {it.r.title}</span>
            <span className="body-sm" style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{flag ? (it.f.typeLabel || it.f.type) : "review & decide"}</span>
          </div>
          <div className="row gap-2" style={{ flexShrink: 0, alignItems: "center" }}>
            <span className="row gap-2" style={{ alignItems: "center" }}><Avatar name={it.r.submittedBy} size={20} /><span className="body-sm" style={{ fontSize: 12, fontWeight: 600 }}>{it.r.submittedBy}</span></span>
            <ProjectTypePill type={it.r.projectType} />
            <button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); nav("SM-03", { reqId: it.r.id }); }}>Open</button>
          </div>
        </div>; })}
      {!todo.length && <div style={{ textAlign: "center", padding: 40 }}><Icon name="check" size={24} color="var(--approved-fg)" /><div className="h3" style={{ marginTop: 8 }}>Desk clear</div><div className="body-sm" style={{ marginTop: 4 }}>No approvals or flags waiting. 🎉</div></div>}
    </div>
  </div>;
}

/* ====================================================================
   SM-LIVE · LIVE REQUIREMENTS  (all requirements across the team)
   ==================================================================== */
const LIVE_STAGES = [
  ["all", "All stages", "list"],
  ["review", "Pending review", "queue"],
  ["ack", "Lab acknowledgement", "incoming"],
  ["eval", "Lab evaluation", "work"],
  ["lab", "In lab", "work"],
  ["dispatch", "Dispatch", "dispatch"],
  ["sent", "Sent / done", "check"],
  ["rejected", "Rejected", "x"],
  ["flags", "Open flags", "flag"],
];
const LIVE_STAGE_STATUS = {
  review: ["Pending review", "R&D assessing", "R&D assessed", "Returned to SPOC"],
  ack: ["Logged", "Approved", "Acknowledged"],
  eval: ["In evaluation", "Query raised", "Declined"],
  lab: ["Accepted — date committed", "Formulation", "Trial", "QC", "Fill"],
  dispatch: ["Ready for dispatch", "Dispatch awaiting SPOC approval"],
  sent: ["Sent to client", "Client approved", "In stability", "Archived"],
  rejected: ["Rejected"],
};
function liveStageMatch(tab, r) {
  if (tab === "all") return true;
  if (tab === "flags") return (r.flags || []).some(f => !f.resolved);
  return (LIVE_STAGE_STATUS[tab] || []).includes(r.status);
}
function LiveTable({ rows, nav }) {
  return <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Req ID</Th><Th>Brand</Th><Th>Title</Th><Th>SPOC</Th><Th>Type</Th><Th>Status · SLA</Th><Th>Started</Th></tr></thead>
    <tbody>{window.vvipSort(rows).map(r => <tr key={r.id} className="clickable" onClick={() => nav("SM-03", { reqId: r.id })}>
      <Td mono><span className="row gap-2">{r.vvip && <VVIPBadge size="sm" />}{r.id}</span></Td><Td><span style={{ fontWeight: 700 }}>{r.brand}</span></Td><Td><span style={{ fontWeight: 500 }}>{r.title}</span></Td>
      <Td><span className="row gap-2"><Avatar name={r.submittedBy} size={22} /><span className="body-sm" style={{ fontSize: 12 }}>{r.submittedBy}</span></span></Td>
      <Td><ProjectTypePill type={r.projectType} /></Td><Td><div className="row gap-2"><StatusPill status={r.status} size="sm" />{r.labStage && <span className="pill pill-sm" style={{ background: "var(--lab-bg)", color: "var(--lab-fg)" }}>{r.labStage}</span>}<SLAIndicator req={r} />{(r.flags || []).some(f => !f.resolved) && <span className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}><Icon name="flag" size={10} color="var(--coral-dark)" /> {(r.flags || []).filter(f => !f.resolved).length}</span>}</div></Td><Td><StartDate req={r} /></Td></tr>)}</tbody></table></div>;
}
function SMLive_Requirements({ nav }) {
  window.useStore();
  const [tab, setTab] = useState("all");
  const [spoc, setSpoc] = useState("all");
  const [group, setGroup] = useState(false); // off by default — toggle to segregate by persona
  const [q, setQ] = useState("");
  const reqs = DM.REQUIREMENTS;
  const spocs = Array.from(new Set(reqs.map(r => r.submittedBy)));
  function match(r) {
    if (!liveStageMatch(tab, r)) return false;
    if (spoc !== "all" && r.submittedBy !== spoc) return false;
    if (q && !(`${r.id} ${r.title} ${r.brand} ${r.submittedBy}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }
  const rows = reqs.filter(match);
  return <div className="col gap-5">
    <PageHead title="Live requirements" sub={`${rows.length} shown · every requirement raised by the team`} />
    {/* STAGE filter — horizontal tiles */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 8 }}>
      {LIVE_STAGES.map(([v, l, ic]) => { const on = tab === v;
        const n = reqs.filter(r => liveStageMatch(v, r)).length;
        const coral = v === "flags";
        return <button key={v} onClick={() => setTab(v)} style={{ border: on ? "none" : "1px solid var(--border)", cursor: "pointer",
          borderRadius: 12, padding: "12px 10px", textAlign: "left", transition: "all .15s",
          background: on ? (coral ? "var(--grad-coral)" : "var(--grad-brand)") : "var(--surface)",
          color: on ? "#fff" : "var(--ink)", boxShadow: on ? "0 6px 16px rgba(18,57,95,.25)" : "none" }}>
          <Icon name={ic} size={15} color={on ? "#fff" : (coral ? "var(--coral-dark)" : "var(--brand)")} />
          <div className="serif-num" style={{ fontSize: 22, marginTop: 4 }}>{n}</div>
          <div style={{ fontSize: 10.5, fontWeight: 600, marginTop: 1, opacity: on ? .9 : .65 }}>{l}</div>
        </button>; })}
    </div>
    <div className="row between wrap gap-3">
      <div className="row gap-2 wrap">
        {/* PERSONA filter + group toggle */}
        <select className="select" style={{ width: 170 }} value={spoc} onChange={e => setSpoc(e.target.value)}><option value="all">All SPOCs</option>{spocs.map(s => <option key={s}>{s}</option>)}</select>
        <button className={"btn btn-sm " + (group ? "" : "btn-secondary")} onClick={() => setGroup(g => !g)}><Icon name="team" size={14} /> Group by SPOC</button>
      </div>
      <div style={{ position: "relative", width: 260 }}><span style={{ position: "absolute", left: 12, top: 11 }}><Icon name="search" size={16} color="var(--muted)" /></span>
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} /></div>
    </div>
    {group ? <div className="col gap-4">
      {spocs.filter(s => spoc === "all" || s === spoc).map(s => { const items = rows.filter(r => r.submittedBy === s); if (!items.length) return null;
        return <div key={s} className="card" style={{ padding: 0 }}>
          <div className="row gap-3" style={{ padding: "14px 18px" }}><Avatar name={s} size={30} /><div><div className="h3">{s}</div><div className="body-sm" style={{ fontSize: 12 }}>{items.length} live requirement{items.length !== 1 ? "s" : ""}</div></div></div>
          <LiveTable rows={items} nav={nav} />
        </div>; })}
    </div> : <LiveTable rows={rows} nav={nav} />}
  </div>;
}

/* ====================================================================
   SM-PIPE · TEAM PIPELINE  (team members + reports)
   ==================================================================== */
function SMPipe_TeamPipeline({ nav }) {
  const [tab, setTab] = useState("team");
  return <div className="col gap-5">
    <PageHead title="Team pipeline" sub="Team workload & performance reports" actions={<button className="btn btn-secondary"><Icon name="download" size={15} /> Export</button>} />
    <div style={{ maxWidth: 460 }}><FilterTiles min={200} value={tab} onChange={setTab} options={[
      { key: "team", label: "Team & workload", icon: "team" },
      { key: "reports", label: "Reports", icon: "report" },
    ]} /></div>
    {tab === "team" ? <SM04_Team nav={nav} embedded /> : <SM06_Reports embedded />}
  </div>;
}

Object.assign(window, { ManagerLifecycleTimeline, CI01_Intelligence, SM02_Intervention, SMLive_Requirements, SMPipe_TeamPipeline });
Object.assign(window.SCREENS, {
  "SM-01": SM01_Dashboard, "SM-02": SM02_Intervention, "SM-03": SM03_Review,
  "SM-04": SM04_Team, "SM-05": SM05_Flags, "SM-06": SM06_Reports, "CI-01": CI01_Intelligence,
  "SM-LIVE": SMLive_Requirements, "SM-PIPE": SMPipe_TeamPipeline,
});
