/* ============================================================
   screen-spoc.jsx — Sales SPOC screens
   SP-01 Dashboard · SP-02 Intake · SP-03 List · SP-04 Detail ·
   SP-07 Pipeline · SP-09 Reports
   Also defines shared screen helpers reused by other roles.
   ============================================================ */
window.SCREENS = window.SCREENS || {};
const D = window.NaturisData;

/* VVIP-first sort helper (global rule) */
function vvipSort(list) {
  return [...list].sort((a, b) => (b.vvip ? 1 : 0) - (a.vvip ? 1 : 0));
}

/* ---------- SHARED: ReqTable ---------- */
function TATZone({ days }) {
  const zone = days < 7 ? ["var(--approved-bg)", "var(--approved-fg)", "green"] : days <= 10 ? ["var(--review-bg)", "var(--review-fg)", "orange"] : ["var(--coral-wash)", "var(--coral-dark)", "critical"];
  return <span className="pill pill-sm" style={{ background: zone[0], color: zone[1], fontWeight: 700 }} title={days + " working days in pipeline"}>{zone[2]}</span>;
}
function ReqTable({ rows, onOpen, cols }) {
  const show = cols || ["id", "brand", "title", "type", "code", "status", "tat", "age"];
  const sorted = vvipSort(rows);
  if (!sorted.length) return <div style={{ textAlign: "center", padding: "34px 16px" }}>
    <Icon name="search" size={20} color="var(--brand-light)" />
    <div className="body-sm" style={{ marginTop: 6 }}>No requirements match this filter.</div>
  </div>;
  return <div className="tbl-wrap">
    <table className="tbl">
      <thead><tr>
        {show.includes("id") && <Th>Req ID</Th>}
        {show.includes("brand") && <Th>Brand</Th>}
        {show.includes("title") && <Th>Title</Th>}
        {show.includes("type") && <Th>Type</Th>}
        {show.includes("code") && <Th>NTL / NCL</Th>}
        {show.includes("status") && <Th>Status · SLA</Th>}
        {show.includes("tat") && <Th>TAT zone</Th>}
        {show.includes("age") && <Th>Started</Th>}
      </tr></thead>
      <tbody>
        {sorted.map(r => <tr key={r.id} className="clickable" onClick={() => onOpen(r)}>
          {show.includes("id") && <Td mono><span className="row gap-2">{r.vvip && <VVIPBadge size="sm" />}{r.id}</span></Td>}
          {show.includes("brand") && <Td><span style={{ fontWeight: 700 }}>{r.brand}</span></Td>}
          {show.includes("title") && <Td><span style={{ fontWeight: 500 }}>{r.title}</span></Td>}
          {show.includes("type") && <Td><ProjectTypePill type={r.projectType} /></Td>}
          {show.includes("code") && <Td><FormulationCode code={r.currentNcl || r.ntl} /></Td>}
          {show.includes("status") && <Td><div className="row gap-2"><StatusPill status={r.status} size="sm" /><SLAIndicator req={r} /></div></Td>}
          {show.includes("tat") && <Td>{["Archived", "Client approved", "Rejected"].includes(r.status) ? <span className="body-sm">—</span> : <TATZone days={r.age} />}</Td>}
          {show.includes("age") && <Td><StartDate req={r} /></Td>}
        </tr>)}
      </tbody>
    </table>
  </div>;
}

/* ---------- SHARED: StageStepper (state machine, horizontal or vertical) ---------- */
function StageStepper({ stages, current, vertical, done }) {
  const idx = stages.indexOf(current);
  return <div className={vertical ? "col" : "row"} style={{ gap: vertical ? 0 : 4, alignItems: vertical ? "stretch" : "center" }}>
    {stages.map((s, i) => {
      const isDone = done != null ? i < done : i < idx;
      const isCurrent = i === idx || s === current;
      const color = isCurrent ? "var(--periwinkle)" : isDone ? "var(--brand)" : "var(--border-strong)";
      return <div key={s} className={vertical ? "row" : "col"} style={{ alignItems: "center", flex: vertical ? "none" : 1, gap: vertical ? 12 : 6, position: "relative" }}>
        {vertical && i < stages.length - 1 && <div style={{ position: "absolute", left: 11, top: 24, bottom: -8, width: 2, background: isDone ? "var(--brand)" : "var(--border)" }} />}
        <div style={{ width: vertical ? 24 : 22, height: vertical ? 24 : 22, borderRadius: 999,
          background: isCurrent ? "#fff" : color, border: isCurrent ? "3px solid var(--periwinkle)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: isCurrent ? "var(--sh-sm)" : "none" }} className={isCurrent ? "attention-pulse" : ""}>
          {isDone && <Icon name="check" size={13} color="#fff" />}
        </div>
        <div style={{ fontSize: vertical ? 13 : 11, fontWeight: isCurrent ? 600 : 500,
          color: isCurrent ? "var(--ink)" : isDone ? "var(--brand)" : "var(--muted)",
          textAlign: vertical ? "left" : "center", flex: vertical ? 1 : "none", paddingBottom: vertical ? 16 : 0 }}>{s}</div>
        {!vertical && i < stages.length - 1 && <div style={{ position: "absolute", top: 11, left: "60%", right: "-40%", height: 2, background: isDone ? "var(--brand)" : "var(--border)", zIndex: -1 }} />}
      </div>;
    })}
  </div>;
}

/* ---------- SHARED: BarChart / Donut ---------- */
function BarChart({ data, height = 140, color = "var(--brand-accent)" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return <div className="row" style={{ alignItems: "flex-end", gap: 10, height, padding: "0 4px" }}>
    {data.map((d, i) => <div key={i} className="col center" style={{ flex: 1, gap: 6, height: "100%", justifyContent: "flex-end" }}>
      <div className="serif-num" style={{ fontSize: 14 }}>{d.value}</div>
      <div style={{ width: "100%", maxWidth: 44, height: `${(d.value / max) * 100}%`, minHeight: 4,
        background: d.color || color, borderRadius: "6px 6px 0 0", transition: "height .5s" }} />
      <div className="label" style={{ fontSize: 9, textAlign: "center" }}>{d.label}</div>
    </div>)}
  </div>;
}
function Donut({ segments, size = 120 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0; const r = size / 2 - 10, c = 2 * Math.PI * r;
  return <div style={{ position: "relative", width: size, height: size }}>
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const frac = s.value / total, dash = c * frac, off = c * acc; acc += frac;
        return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={18}
          strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-off}
          transform={`rotate(-90 ${size/2} ${size/2})`} />;
      })}
    </svg>
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <span className="serif-num" style={{ fontSize: 24 }}>{total}</span>
      <span className="label" style={{ fontSize: 8 }}>total</span>
    </div>
  </div>;
}

/* ====================================================================
   SP-01 · DASHBOARD
   ==================================================================== */
function SP01_Dashboard({ nav }) {
  const reqs = D.REQUIREMENTS;
  const live = reqs.filter(r => !["Archived", "Logged"].includes(r.status));
  const pending = reqs.filter(r => r.status === "Pending review");
  const inLab = reqs.filter(r => ["Formulation", "Trial", "QC", "Fill", "Ready for dispatch"].includes(r.status));
  const aging = reqs.filter(r => r.age >= 30 && r.status !== "Archived");
  const recent = vvipSort(reqs.filter(r => r.status !== "Archived")).slice(0, 6);

  return <div className="col gap-6">
    <div className="row between" style={{ alignItems: "flex-start" }}>
      <div>
        <div className="h1">Good morning, Hardik.</div>
        <div className="body" style={{ color: "var(--muted)", marginTop: 4 }}>
          You have <b style={{ color: "var(--ink)" }}>{live.length} live requirements</b> · {pending.length} awaiting manager review · {aging.length} aging past 30 days.
        </div>
      </div>
    </div>

    {/* prominent primary CTA */}
    <div className="kpi-grad" style={{ background: "var(--grad-brand)", borderRadius: 16, padding: "22px 26px",
      display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--sh-md)" }}>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={24} color="#fff" /></div>
        <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 19, fontFamily: "var(--f-display)" }}>Log a new requirement</div>
          <div style={{ color: "#C7D2EC", fontSize: 13 }}>From a client brief or call — capture it in one place and route it to the lab.</div></div>
      </div>
      <button className="btn btn-lg" onClick={() => nav("SP-02")} style={{ background: "#fff", color: "var(--brand)", fontWeight: 700 }}>
        <Icon name="plus" size={18} color="var(--brand)" /> New requirement
      </button>
    </div>

    <div className="grid grid-4 gap-3">
      <Stat label="Live requirements" value={live.length} sub="Across all brands" onClick={() => nav("SP-03")} />
      <Stat label="Pending review" value={pending.length} sub="With Sales Manager" onClick={() => nav("SP-03")} />
      <Stat label="In lab" value={inLab.length} sub="Formulation → dispatch" onClick={() => nav("SP-07")} />
      <Stat label="Aging" value={aging.length} attention sub="Past 30 days" onClick={() => nav("SP-03")} />
    </div>

    <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
      <div className="card" style={{ padding: 0 }}>
        <div className="row between" style={{ padding: "16px 18px" }}>
          <div className="h3">Recent requirements</div>
          <button className="btn btn-secondary btn-sm" onClick={() => nav("SP-03")}>View all</button>
        </div>
        <ReqTable rows={recent} onOpen={r => nav("SP-04", { reqId: r.id })} cols={["id", "brand", "title", "type", "status", "age"]} />
      </div>

      <div className="card">
        <SectionTitle sub="Latest activity on your requirements">Notifications</SectionTitle>
        <div className="col">
          {D.NOTIFICATIONS.slice(0, 6).map(n => <div key={n.id} className="row gap-3" onClick={() => n.req && nav("SP-04", { reqId: n.req })}
            style={{ alignItems: "flex-start", padding: "9px 4px", borderBottom: "1px solid var(--border)", cursor: n.req ? "pointer" : "default" }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, marginTop: 6, flexShrink: 0, background: n.read ? "var(--border-strong)" : "var(--coral)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 600 }}>{n.title}</div>
              <div className="body-sm" style={{ fontSize: 11.5 }}>{n.body}</div>
              <div className="label" style={{ fontSize: 8.5, marginTop: 2 }}>{n.req ? n.req + " · " : ""}{n.at}</div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   SP-02 · INTAKE FORM (progressive disclosure)
   ==================================================================== */
const CONCERN_MASTER = ["Acne", "Pigmentation", "Dryness", "Anti-ageing", "Brightening", "Sensitivity",
  "Sun protection", "Hair fall", "Dandruff", "Hydration", "Pore minimising", "Oil control",
  "Redness", "Fine lines", "Dark circles", "Frizz"];

function Segmented({ value, onChange, options }) {
  return <div style={{ display: "inline-flex", background: "var(--page)", borderRadius: 10, padding: 3, border: "1px solid var(--border)" }}>
    {options.map(([v, l]) => <button key={v} type="button" onClick={() => onChange(v)}
      style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
        background: value === v ? "var(--surface)" : "transparent", color: value === v ? "var(--brand)" : "var(--muted)",
        boxShadow: value === v ? "var(--sh-sm)" : "none" }}>{l}</button>)}
  </div>;
}
function SensoryRow({ icon, title, options, value, onPick, spec, onSpec, placeholder, dots }) {
  return <div style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)" }}>
    <div className="row gap-3" style={{ alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--brand-wash)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={16} color="var(--brand-accent)" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{title}</div>
        <div className="row gap-2 wrap" style={{ marginBottom: 10 }}>
          {options.map(o => { const on = value === o;
            return <button key={o} type="button" onClick={() => onPick(on ? "" : o)} className="chip"
              style={{ cursor: "pointer", background: on ? "var(--brand)" : "var(--surface)", color: on ? "#fff" : "var(--ink)", border: on ? "none" : "1px solid var(--border)" }}>
              {dots && dots[o] && <span style={{ width: 11, height: 11, borderRadius: 999, background: dots[o], border: dots[o] === "transparent" ? "1px solid var(--border-strong)" : "none", display: "inline-block" }} />}
              {o}</button>; })}
        </div>
        <input className="input" placeholder={placeholder} value={spec} onChange={e => onSpec(e.target.value)} />
      </div>
    </div>
  </div>;
}

function IntakeSection({ n, title, desc, children, danger, action }) {
  return <div className="card" style={{ borderLeft: danger ? "3px solid var(--coral)" : undefined }}>
    <div className="row between" style={{ marginBottom: 14, alignItems: "flex-start" }}>
      <div><div className="h3">{title}</div>{desc && <div className="body-sm" style={{ fontSize: 12.5 }}>{desc}</div>}</div>
      {action}
    </div>
    {children}
  </div>;
}

function freshIntakeForm() {
  return { brand: "", company: "", clientName: "", existingAcct: "", family: "", category: "", base: "", desc: "", selectedFormulation: "", manualCode: "", noBase: false, ttSheet: false,
    nonNeg: [{ ingredient: "", concentration: "" }], good: [{ ingredient: "", concentration: "" }],
    concerns: [], customConcernInput: "", claims: [], claimInput: "",
    sensory: { fragLevel: "", fragSpec: "", colour: "", colourSpec: "", texture: "", textureSpec: "" },
    packaging: [{ desc: "", source: "naturis", vendor: "", note: "", img: false }], packLabel: "", packUrl: "", packRef: false,
    references: [],
    type: "", rmBudget: "", pmBudget: "", fgManual: "", units: "", packSize: "", fillVol: "",
    labelDesc: "", shipping: "", shipName: "", shipPhone: "", title: "", recommend: "" };
}

function SP02_Intake({ nav, role }) {
  window.useStore();
  const SectionCard = IntakeSection;
  const [clientKind, setClientKind] = useState("existing");
  const [ruleOpen, setRuleOpen] = useState(false);
  const [addrChoice, setAddrChoice] = useState(""); // "" = pick from saved, "custom" = new address, or a saved-address index
  const [form, setForm] = useState(freshIntakeForm);
  const [flagManager, setFlagManager] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [refId, setRefId] = useState(() => window.NaturisStore.peekId());
  const [draftMsg, setDraftMsg] = useState("");
  const [draftAvail, setDraftAvail] = useState(() => !!window.NaturisDrafts.load());
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSensory = (k, v) => setForm(f => ({ ...f, sensory: { ...f.sensory, [k]: v } }));

  function saveDraft() { window.NaturisDrafts.save({ clientKind, form }); setDraftMsg("Draft saved — you can leave and resume later."); setDraftAvail(true); setTimeout(() => setDraftMsg(""), 3000); }
  function resumeDraft() { const d = window.NaturisDrafts.load(); if (d && d.payload) { setClientKind(d.payload.clientKind || "existing"); setForm(d.payload.form); setDraftAvail(false); setDraftMsg("Draft restored."); setTimeout(() => setDraftMsg(""), 2500); } }
  function resetForm() { setForm(freshIntakeForm()); setClientKind("existing"); setFlagManager(false); setSubmittedId(null); setRefId(window.NaturisStore.peekId()); window.scrollTo(0, 0); }

  // AI recommendations from past formulations (rulebook-aware)
  const suggestions = window.suggestFormulations(form.category, [...form.nonNeg, ...form.good].map(a => a.ingredient).filter(Boolean), form.base);
  // category-wise common actives for the dropdowns
  const activeOptions = window.NaturisData.CATEGORY_ACTIVES[form.family] || window.NaturisData.CATEGORY_ACTIVES["Skin Care"];
  const concernOptions = window.NaturisData.CATEGORY_CONCERNS[form.family] || window.NaturisData.CATEGORY_CONCERNS["Skin Care"];

  const gateLocked = form.type === "TT" || form.type === "NPD";
  useEffect(() => { setFlagManager(gateLocked); }, [gateLocked]);
  const fgAuto = (parseFloat(form.rmBudget) || 0) + (parseFloat(form.pmBudget) || 0);
  const fg = form.fgManual !== "" ? parseFloat(form.fgManual) || 0 : fgAuto;

  const actives = [...form.nonNeg, ...form.good].filter(a => a.ingredient);
  const ruleHits = window.checkRulebook(actives.map(a => a.ingredient), form.base);
  const aiType = actives.length >= 2 ? "NPD" : form.base === "Anhydrous" ? "REN" : "EPD";

  const required = { units: form.units, packSize: form.packSize, fillVol: form.fillVol, labelDesc: form.labelDesc, shipping: form.shipping };
  const filledReq = Object.values(required).filter(Boolean).length;
  const brandOk = clientKind === "new" ? form.brand && form.clientName : form.brand;
  const canSubmit = filledReq === 5 && form.category && form.type && brandOk;
  const missingFields = [
    [!brandOk, clientKind === "new" ? "Client name & brand" : "Brand / account"],
    [!form.category, "Product category"],
    [!form.units, "Units / MOQ"],
    [!form.packSize, "Pack size"],
    [!form.fillVol, "Fill volume"],
    [!form.labelDesc, "Label description"],
    [!form.shipping, "Shipping address"],
    [!form.type, "Project type"],
  ].filter(([miss]) => miss).map(([, label]) => label);

  function submitRequirement() {
    const id = window.NaturisStore.nextId();
    const seq = id.slice(-3);
    const me = (window.NaturisData.ROLES.find(r => r.id === role) || window.NaturisData.ROLES.find(r => r.id === "spoc")).person;
    // a custom / new-client delivery address is logged to the address book under the brand
    const brandAddrs = (D.SHIP_ADDRESSES || []).filter(a => a.client === form.brand && a.status !== "discarded");
    if ((addrChoice === "custom" || brandAddrs.length === 0) && form.shipping.trim()) {
      const firstLine = form.shipping.split("\n")[0].trim();
      const dup = (D.SHIP_ADDRESSES || []).some(a => a.client === form.brand && a.to.join(" ").includes(firstLine));
      if (!dup) window.NaturisStore.addShipAddress({ client: form.brand, contact: form.shipName || form.clientName || "—", to: form.shipping.split("\n").map(l => l.trim()).filter(Boolean).concat(form.shipPhone ? ["PH: " + form.shipPhone] : []), status: "active" });
    }
    const status = (gateLocked || flagManager) ? "Pending review" : "Logged";
    const s = form.sensory;
    const req = {
      id, title: form.title || `${form.brand} ${form.category}`, brand: form.brand,
      account: form.company || form.existingAcct || form.brand, categoryGroup: form.family, category: form.category, base: form.base,
      status, projectType: form.type,
      vvip: !!(D.ACCOUNTS.find(a => a.name === (form.existingAcct || form.brand)) || {}).vvip,
      ntl: aiType === "EPD" || aiType === "REN" ? (form.base === "Anhydrous" ? "NTL-LP-009" : "NTL-SR-014") : null,
      currentNcl: `NCL-${seq}-001`,
      ncls: [{ code: `NCL-${seq}-001`, by: me, at: "just now", delta: "Initial brief", status: "current" }],
      aiTrack: aiType === "NPD" ? 3 : aiType === "REN" ? 2 : 1,
      aiCode: form.base === "Anhydrous" ? "NTL-LP-009" : "NTL-SR-014", aiScore: actives.length ? 72 : 88,
      aiRationale: `${actives.length} actives captured — leans ${aiType}.`, aiSimilarWork: [],
      submittedBy: me, createdBy: me, submittedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), age: 0, phaseDays: 0,
      moq: form.units, packaging: form.packaging[0] ? `${form.packaging[0].desc || form.packSize} (${form.packaging[0].source === "client" ? "client" : "Naturis"})` : form.packSize,
      targetSampleDate: "TBD", budget: { unit: "₹" + fg, batch: "—" },
      actives, nonNegotiable: form.nonNeg.filter(a => a.ingredient), goodToHave: form.good.filter(a => a.ingredient),
      concerns: form.concerns, claims: form.claims,
      sensory: { fragrance: [s.fragLevel, s.fragSpec].filter(Boolean).join(" · ") || "—", colour: [s.colour, s.colourSpec].filter(Boolean).join(" · ") || "—", texture: [s.texture, s.textureSpec].filter(Boolean).join(" · ") || "—" },
      briefDetail: { region: "India", notes: form.recommend, fillVol: form.fillVol, labelDesc: form.labelDesc, shipping: form.shipping, shipName: form.shipName, shipPhone: form.shipPhone, refId: id, packaging: form.packaging, packLabel: form.packLabel, packUrl: form.packUrl, packRef: form.packRef, references: form.references, company: form.company, clientName: form.clientName, rmBudget: form.rmBudget, pmBudget: form.pmBudget, fg },
      flags: [], manualFlag: false, tracker: null, ownership: gateLocked ? "escalated" : "unassigned",
      recommend: form.recommend, clientKind,
    };
    window.NaturisStore.addRequirement(req);
    window.NaturisDrafts.clear();
    if (status === "Pending review") window.NaturisStore._notify(id, "queue", "info", id + " awaiting your review", (req.title || form.brand) + " — submitted by " + me + ".", "NR-02");
    setSubmittedId(id);
    window.scrollTo(0, 0);
  }

  function addRow(key) { setForm(f => ({ ...f, [key]: [...f[key], { ingredient: "", concentration: "" }] })); }
  function setRow(key, i, field, val) { setForm(f => { const arr = [...f[key]]; arr[i] = { ...arr[i], [field]: val }; return { ...f, [key]: arr }; }); }
  function rmRow(key, i) { setForm(f => ({ ...f, [key]: f[key].filter((_, j) => j !== i) })); }
  // concerns
  function toggleConcern(c) { setForm(f => ({ ...f, concerns: f.concerns.includes(c) ? f.concerns.filter(x => x !== c) : [...f.concerns, c] })); }
  function addCustomConcern() { const v = form.customConcernInput.trim(); if (!v) return; setForm(f => ({ ...f, concerns: [...f.concerns, v], customConcernInput: "" })); }
  // claims
  function addClaim() { const v = form.claimInput.trim(); if (!v) return; setForm(f => ({ ...f, claims: [...f.claims, v], claimInput: "" })); }
  // packaging
  function addPack() { setForm(f => ({ ...f, packaging: [...f.packaging, { desc: "", source: "naturis", vendor: "", note: "", img: false }] })); }
  function setPack(i, patch) { setForm(f => { const arr = [...f.packaging]; arr[i] = { ...arr[i], ...patch }; return { ...f, packaging: arr }; }); }
  function rmPack(i) { setForm(f => ({ ...f, packaging: f.packaging.filter((_, j) => j !== i) })); }
  // references
  function addRef() { setForm(f => ({ ...f, references: [...f.references, { label: "", url: "", desc: "", img: false }] })); }
  function setRef(i, patch) { setForm(f => { const arr = [...f.references]; arr[i] = { ...arr[i], ...patch }; return { ...f, references: arr }; }); }
  function rmRef(i) { setForm(f => ({ ...f, references: f.references.filter((_, j) => j !== i) })); }

  const ALL_CONCERNS = Object.values(window.NaturisData.CATEGORY_CONCERNS).flat();
  const isCustom = c => !ALL_CONCERNS.includes(c);

  if (submittedId) {
    const sreq = window.NaturisStore.get(submittedId);
    return <div className="col" style={{ minHeight: "70vh", alignItems: "center", justifyContent: "center" }}>
      <div className="card col gap-3" style={{ maxWidth: 540, width: "100%", padding: 40, alignItems: "center", textAlign: "center", boxShadow: "var(--sh-md)" }}>
        <div style={{ width: 78, height: 78, borderRadius: 999, background: "var(--approved-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="check" size={40} color="var(--approved-fg)" />
        </div>
        <div className="h1" style={{ fontSize: 28 }}>Requirement submitted!</div>
        <div className="row gap-2" style={{ justifyContent: "center" }}>
          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--brand)" }}>{submittedId}</span>
          <StatusPill status={sreq ? sreq.status : "Logged"} size="sm" />
        </div>
        <div className="body-sm" style={{ maxWidth: 400 }}>
          {sreq && sreq.status === "Pending review"
            ? "Routed to Kunal Shah (Sales Manager) for review — you'll be notified on his decision. Track it any time from your Requirements tab."
            : "Logged live — it's already in the lab's incoming queue for acknowledgement. Track it any time from your Requirements tab."}
        </div>
        <div className="row gap-2" style={{ marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-lg" onClick={resetForm} style={{ background: "var(--grad-brand)" }}><Icon name="plus" size={16} /> Add another requirement</button>
          <button className="btn btn-lg" style={{ background: "var(--grad-brand)", boxShadow: "0 4px 14px rgba(18,57,95,.3)" }} onClick={() => setViewOpen(true)}><Icon name="list" size={16} /> View requirement</button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => nav("SP-01")}>Go to dashboard</button>
      </div>
    <RequirementPopup open={viewOpen} onClose={() => setViewOpen(false)} reqId={submittedId} />
    </div>;
  }

  return <div>
    <RulebookDrawer open={ruleOpen} onClose={() => setRuleOpen(false)} />
    <PageHead title="New requirement" sub="Capture the client brief — the lab builds from exactly this." serif
      actions={<><button className="btn btn-secondary" onClick={() => setRuleOpen(true)}><Icon name="book" size={15} /> Rulebook</button><button className="btn btn-secondary" onClick={() => nav("SP-03")}>Cancel</button></>} />

    {draftAvail && <div className="row between" style={{ background: "var(--brand-wash)", border: "1px solid var(--brand-tint)", borderRadius: 10, padding: "10px 16px", marginBottom: 16 }}>
      <div className="row gap-2"><Icon name="history" size={16} color="var(--brand-accent)" /><span className="body-sm" style={{ color: "var(--ink)" }}>You have a saved draft from a previous session.</span></div>
      <div className="row gap-2"><button className="btn btn-sm" onClick={resumeDraft}>Resume draft</button><button className="btn btn-sm btn-ghost" onClick={() => { window.NaturisDrafts.clear(); setDraftAvail(false); }}>Discard</button></div>
    </div>}

    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 400px", alignItems: "start" }}>
      <div className="col gap-4">
        <SectionCard n="1" title="Client" desc="Existing relationship or a new client?">
          <div className="grid grid-2 gap-3">
            {[["existing", "Existing client", "Already in CRM"], ["new", "New client", "Pre-flags the manager"]].map(([v, l, dd]) =>
              <button key={v} onClick={() => setClientKind(v)} style={{ textAlign: "left", padding: 14, borderRadius: 10,
                border: clientKind === v ? "2px solid var(--brand)" : "1px solid var(--border)",
                background: clientKind === v ? "var(--brand-wash)" : "var(--surface)", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{l}</div>
                <div className="body-sm" style={{ fontSize: 12 }}>{dd}</div>
              </button>)}
          </div>
          {clientKind === "new" && <><div className="grid grid-3 gap-3" style={{ marginTop: 14 }}>
            <Field label="Client name" required><input className="input" placeholder="e.g. Élan Beauté" value={form.clientName} onChange={e => set("clientName", e.target.value)} /></Field>
            <Field label="Company (umbrella)" hint="One company can hold multiple brands"><input className="input" value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. House of Beauty Co." /></Field>
            <Field label="Brand" required><input className="input" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Anti-Acne" /></Field>
          </div>
          <div style={{ marginTop: 12 }}><CompatibilityNote severity="ok" title="New client">EPD / REN go straight to the lab even for new clients — flag to your manager below if you want a review first.</CompatibilityNote></div></>}
          {clientKind === "existing" && <div className="grid grid-2 gap-3" style={{ marginTop: 14 }}>
            <Field label="Existing company / account" required>
              <select className="select" value={form.existingAcct} onChange={e => { const acc = D.ACCOUNTS.find(a => a.name === e.target.value); set("existingAcct", e.target.value); setForm(f => ({ ...f, brand: e.target.value })); }}>
                <option value="">Select account…</option>
                {D.ACCOUNTS.map(a => <option key={a.id} value={a.name}>{a.name}{a.vvip ? " ★ VVIP" : ""}</option>)}
              </select>
            </Field>
            <Field label="Brand under this company" required hint="Umbrella may hold a different / new brand">
              <input className="input" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="Defaults to the company — edit if a different brand" />
            </Field>
          </div>}
        </SectionCard>

        <SectionCard n="2" title="Basics" desc="Product family → category → base">
          <div className="grid grid-3 gap-3">
            <Field label="Product family" required><SmartSelect value={form.family} onChange={v => { setForm(f => ({ ...f, family: v, category: "" })); }} options={["Skin Care", "Hair Care", "Colour", "Sun Care", "Body Care"]} /></Field>
            <Field label="Category" required hint={!form.family ? "Pick a product family first" : undefined}>
              {form.family ? <SmartSelect value={form.category} onChange={v => set("category", v)} options={D.FAMILY_CATEGORIES[form.family] || ["Serum", "Cream", "Cleanser"]} />
                : <div className="input" style={{ display: "flex", alignItems: "center", color: "var(--muted)", fontSize: 13 }}>Select a product family first…</div>}
            </Field>
            <Field label="Base"><SmartSelect value={form.base} onChange={v => set("base", v)} options={["Aqueous gel", "O/W emulsion", "Anhydrous", "Surfactant blend", "Hybrid emulsion"]} /></Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="Description / base-formulation notes" hint="Free text — describe the base formulation, the ask, anything the dropdowns don't capture">
              <textarea className="textarea" value={form.desc} onChange={e => set("desc", e.target.value)} placeholder="e.g. Lightweight gel-cream on a water base, fast-absorbing, sits well under makeup; client wants a 'glass-skin' finish." /></Field>
          </div>
        </SectionCard>

        <SectionCard n="3" title="Actives" desc={form.family ? `Common ${form.family} actives — or add a custom one. Non-negotiable vs good-to-have.` : "Pick a product family in Basics to see common actives. Non-negotiable vs good-to-have."}>
          <div className="grid grid-2 gap-4">
            <div>
              <div className="label" style={{ color: "var(--coral)", marginBottom: 8 }}>Non-negotiable</div>
              <div className="col gap-2">
                {form.nonNeg.map((row, i) => <div key={i} className="row gap-2" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--coral-wash)", background: "var(--coral-wash)" }}>
                  <div style={{ flex: 1 }}><SmartSelect value={row.ingredient} onChange={v => setRow("nonNeg", i, "ingredient", v)} options={activeOptions} placeholder="Ingredient" /></div>
                  <input className="input" placeholder="%" style={{ width: 70 }} value={row.concentration} onChange={e => setRow("nonNeg", i, "concentration", e.target.value)} />
                  <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => rmRow("nonNeg", i)}><Icon name="x" size={14} /></button>
                </div>)}
                <button className="btn btn-ghost btn-sm" onClick={() => addRow("nonNeg")}><Icon name="plus" size={14} /> Add</button>
              </div>
            </div>
            <div>
              <div className="label" style={{ color: "var(--brand)", marginBottom: 8 }}>Good-to-have</div>
              <div className="col gap-2">
                {form.good.map((row, i) => <div key={i} className="row gap-2" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--brand-tint)", background: "var(--brand-wash)" }}>
                  <div style={{ flex: 1 }}><SmartSelect value={row.ingredient} onChange={v => setRow("good", i, "ingredient", v)} options={activeOptions} placeholder="Ingredient" /></div>
                  <input className="input" placeholder="%" style={{ width: 70 }} value={row.concentration} onChange={e => setRow("good", i, "concentration", e.target.value)} />
                  <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => rmRow("good", i)}><Icon name="x" size={14} /></button>
                </div>)}
                <button className="btn btn-ghost btn-sm" onClick={() => addRow("good")}><Icon name="plus" size={14} /> Add</button>
              </div>
            </div>
          </div>
          {ruleHits.length > 0 && <div className="col gap-2" style={{ marginTop: 12 }}>
            {ruleHits.map((h, i) => <CompatibilityNote key={i} severity={h.severity} title={`Rulebook · ${h.pair[0]} + ${h.pair[1]}`}>{h.note}</CompatibilityNote>)}
          </div>}
        </SectionCard>

        {/* 4 — CONCERNS (separate, category-wise) */}
        <SectionCard n="4" title="Concerns to be addressed" desc={form.family ? `Concerns for ${form.family}. Select all that apply, or add a custom one.` : "Pick a product family in Basics to see relevant concerns."}>
          <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
            {concernOptions.map(c => { const on = form.concerns.includes(c);
              return <button key={c} type="button" onClick={() => toggleConcern(c)} className="chip"
                style={{ cursor: "pointer", background: on ? "var(--brand)" : "var(--surface)", color: on ? "#fff" : "var(--ink)", border: on ? "none" : "1px solid var(--border)" }}>
                {on && <Icon name="check" size={12} color="#fff" />}{c}</button>; })}
          </div>
          {form.concerns.filter(isCustom).length > 0 && <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
            {form.concerns.filter(isCustom).map(c => <span key={c} className="chip" style={{ background: "var(--ncl-body)", color: "#6D28D9", border: "1px dashed #A78BFA" }}>{c}<span className="x" onClick={() => toggleConcern(c)} style={{ color: "#6D28D9" }}>×</span></span>)}
          </div>}
          <div className="row gap-2">
            <input className="input" placeholder='Add a custom concern, e.g. "Photo-sensitivity"' value={form.customConcernInput}
              onChange={e => set("customConcernInput", e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomConcern(); } }} />
            <button className="btn btn-secondary" onClick={addCustomConcern} style={{ whiteSpace: "nowrap" }}><Icon name="plus" size={14} /> Add custom</button>
          </div>
          <div className="body-sm" style={{ fontSize: 11.5, marginTop: 8 }}><Icon name="alert" size={11} /> Custom concerns are submitted to Admin as suggestions for the master list.</div>
        </SectionCard>

        {/* CLAIMS (separate) */}
        <SectionCard n="5" title="Claims" desc="What the product wants to claim — be specific.">
          {form.claims.length > 0 && <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
            {form.claims.map((c, i) => <span key={i} className="chip" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>{c}<span className="x" onClick={() => set("claims", form.claims.filter((_, j) => j !== i))} style={{ color: "var(--approved-fg)" }}>×</span></span>)}
          </div>}
          <div className="row gap-2">
            <input className="input" placeholder='e.g. "Acne scars visibly reduced in 5 days"' value={form.claimInput}
              onChange={e => set("claimInput", e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addClaim(); } }} />
            <button className="btn btn-secondary" onClick={addClaim} style={{ whiteSpace: "nowrap" }}><Icon name="plus" size={14} /> Add claim</button>
          </div>
        </SectionCard>

        {/* 6 — SENSORY (chip rows + spec) */}
        <SectionCard n="6" title="Sensory profile" desc='Tap an intensity / type, then note the precise spec if the client gave one — "regular", "fragrance-free", or "neroli top note".'>
          <div className="col gap-3">
            <SensoryRow icon="sparkle" title="Fragrance" options={["None", "Light", "Moderate", "Strong", "Specific"]}
              value={form.sensory.fragLevel} onPick={v => setSensory("fragLevel", v)} spec={form.sensory.fragSpec} onSpec={v => setSensory("fragSpec", v)} placeholder="e.g. neroli top, musk base" />
            <SensoryRow icon="intel" title="Colour" options={["Clear", "White", "Off-white", "Tinted", "Specific"]}
              dots={{ Clear: "transparent", White: "#FFFFFF", "Off-white": "#EDE6DF", Tinted: "#E3C27E", Specific: "#B23E35" }}
              value={form.sensory.colour} onPick={v => setSensory("colour", v)} spec={form.sensory.colourSpec} onSpec={v => setSensory("colourSpec", v)} placeholder="e.g. light amber, no oxidation" />
            <SensoryRow icon="work" title="Texture" options={["Gel", "Lotion", "Cream", "Serum", "Balm", "Oil", "Foam", "Powder"]}
              value={form.sensory.texture} onPick={v => setSensory("texture", v)} spec={form.sensory.textureSpec} onSpec={v => setSensory("textureSpec", v)} placeholder="e.g. lightweight, non-greasy" />
          </div>
        </SectionCard>

        {/* 7 — PACKAGING (multi-item) */}
        <SectionCard n="7" title="Packaging" desc="Toggle who supplies it. Naturis-supplied items map to a vendor; both modes accept a reference image."
          action={<button className="btn btn-secondary btn-sm" onClick={addPack}><Icon name="plus" size={14} /> Add packaging item</button>}>
          <div className="col gap-3">
            {form.packaging.map((p, i) => <div key={i} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)" }}>
              <div className="row gap-2" style={{ marginBottom: 12 }}>
                <input className="input" placeholder="e.g. 30ml glass dropper, frosted" value={p.desc} onChange={e => setPack(i, { desc: e.target.value })} />
                <Segmented value={p.source} onChange={v => setPack(i, { source: v })} options={[["naturis", "Naturis provides"], ["client", "Client provides"]]} />
                {form.packaging.length > 1 && <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => rmPack(i)}><Icon name="x" size={15} /></button>}
              </div>
              <div className="grid gap-3" style={{ marginBottom: 12, gridTemplateColumns: p.source === "naturis" ? "1fr 1fr" : "1fr" }}>
                {p.source === "naturis" && <Field label="Vendor · from vendor DB">
                  <select className="select" value={p.vendor} onChange={e => setPack(i, { vendor: e.target.value })}><option value="">Select vendor…</option>{D.VENDORS.map(v => <option key={v}>{v}</option>)}</select></Field>}
                <Field label="Reference image">
                  <button type="button" className="btn btn-secondary" onClick={() => setPack(i, { img: !p.img })} style={{ width: "100%", justifyContent: "center" }}>
                    <Icon name={p.img ? "check" : "plus"} size={15} /> {p.img ? "Image attached" : "Upload image"}</button></Field>
              </div>
              <Field label="Note"><input className="input" placeholder="Client's specific ask, cost commitments, etc." value={p.note} onChange={e => setPack(i, { note: e.target.value })} /></Field>
            </div>)}
          </div>
          <hr className="divider" style={{ margin: "16px 0" }} />
          <div className="label" style={{ marginBottom: 8 }}>Label / packaging reference · one competitor / shade / inspiration ref</div>
          <div className="row gap-2">
            <input className="input" placeholder="Label" style={{ maxWidth: 200 }} value={form.packLabel} onChange={e => set("packLabel", e.target.value)} />
            <input className="input" placeholder="Paste URL" value={form.packUrl} onChange={e => set("packUrl", e.target.value)} />
            <button type="button" className="btn btn-secondary" onClick={() => set("packRef", !form.packRef)} style={{ whiteSpace: "nowrap" }}><Icon name={form.packRef ? "check" : "plus"} size={14} /> {form.packRef ? "Uploaded" : "Upload"}</button>
          </div>
        </SectionCard>

        {/* 8 — LAB-HANDOFF (mandatory) */}
        <SectionCard n="8" title="Lab handoff" desc="Units, pack size, fill volume, label and address — the lab builds from exactly these.">
          <div className="grid grid-2 gap-3">
            <Field label="Units / MOQ" required><input className="input" value={form.units} onChange={e => set("units", e.target.value)} placeholder="e.g. 5,000" /></Field>
            <Field label="Pack size" required><input className="input" value={form.packSize} onChange={e => set("packSize", e.target.value)} placeholder="e.g. 30ml airless" /></Field>
            <Field label="Fill volume" required><input className="input" value={form.fillVol} onChange={e => set("fillVol", e.target.value)} placeholder="e.g. 30ml" /></Field>
            <Field label="Reference ID · auto-generated">
              <div className="input mono" style={{ display: "flex", alignItems: "center", background: "var(--brand-wash)", fontWeight: 700, color: "var(--brand)" }}>{refId}</div></Field>
            <Field label="Label description" required full><input className="input" value={form.labelDesc} onChange={e => set("labelDesc", e.target.value)} id="f-label" placeholder="What goes on the label" /></Field>
            {(() => {
              const brandAddrs = (D.SHIP_ADDRESSES || []).filter(a => a.client === form.brand && a.status !== "discarded");
              const pickSaved = (a) => { const i = brandAddrs.indexOf(a); setAddrChoice(String(i)); setForm(f => ({ ...f, shipping: a.to.join("\n"), shipName: a.contact, shipPhone: ((a.to.find(l => /PH:/i.test(l)) || "").replace(/.*PH:\s*/i, "")) })); };
              const sel = brandAddrs[parseInt(addrChoice, 10)];
              return <>
                <Field label="Delivery address" required full>
                  {brandAddrs.length > 0 ? <div className="col gap-2">
                    <div className="body-sm" style={{ fontSize: 11.5 }}><b>{form.brand}</b> has {brandAddrs.length} saved address{brandAddrs.length > 1 ? "es" : ""} — pick one, or add a new address.</div>
                    <select className="select" value={addrChoice} onChange={e => { const v = e.target.value; if (v === "custom") { setAddrChoice("custom"); setForm(f => ({ ...f, shipping: "", shipName: "", shipPhone: "" })); } else { pickSaved(brandAddrs[parseInt(v, 10)]); } }}>
                      <option value="" disabled>Select a saved address…</option>
                      {brandAddrs.map((a, i) => <option key={i} value={String(i)}>{(a.label ? a.label + " — " : "") + a.contact + " · " + (a.to[1] || a.to[0])}</option>)}
                      <option value="custom">➕ Add a new address…</option>
                    </select>
                    {sel && addrChoice !== "custom" && <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--brand-wash)", border: "1px solid var(--brand-tint)" }}>
                      <div className="row gap-2" style={{ alignItems: "center", marginBottom: 2 }}>{sel.label && <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--brand-mid)", fontWeight: 700 }}>{sel.label}</span>}<span style={{ fontWeight: 700, fontSize: 12.5 }}>{sel.contact}</span></div>
                      <div className="body-sm" style={{ fontSize: 11.5 }}>{sel.to.join(", ")}</div></div>}
                  </div> : <div className="body-sm" style={{ fontSize: 11.5, color: "var(--muted)" }}>New client — the address you enter is saved to the address book under <b>{form.brand || "this brand"}</b>.</div>}
                </Field>
                {(addrChoice === "custom" || brandAddrs.length === 0) && <>
                  <Field label="Ship to — contact name"><input className="input" value={form.shipName} onChange={e => set("shipName", e.target.value)} placeholder="Who receives the sample" /></Field>
                  <Field label="Phone number"><input className="input" value={form.shipPhone} onChange={e => set("shipPhone", e.target.value)} placeholder="+91 …" /></Field>
                  <Field label="Shipping address" required full><textarea id="f-shipping" className="textarea" placeholder="Full shipping address (one line per row)" value={form.shipping} onChange={e => set("shipping", e.target.value)} /></Field>
                </>}
              </>;
            })()}
          </div>
        </SectionCard>

        {/* 9 — BUDGETS */}
        <SectionCard n="9" title="Budgets" desc="RM + PM auto-sums to FG — or enter FG manually">
          <div className="row gap-3" style={{ alignItems: "flex-end" }}>
            <Field label="RM cost"><input className="input" type="number" value={form.rmBudget} onChange={e => set("rmBudget", e.target.value)} placeholder="40" /></Field>
            <span className="serif-num" style={{ fontSize: 22, paddingBottom: 4 }}>+</span>
            <Field label="PM cost"><input className="input" type="number" value={form.pmBudget} onChange={e => set("pmBudget", e.target.value)} placeholder="25" /></Field>
            <span className="serif-num" style={{ fontSize: 22, paddingBottom: 4 }}>=</span>
            <Field label="FG (auto or manual)"><input className="input" type="number" value={form.fgManual} onChange={e => set("fgManual", e.target.value)} placeholder={String(fgAuto || 0)} style={{ background: "var(--brand-wash)", fontWeight: 700 }} /></Field>
          </div>
          <div className="body-sm" style={{ fontSize: 11.5, marginTop: 8 }}>FG = ₹{fg || 0}{form.fgManual === "" ? " (auto from RM+PM)" : " (manual override)"}. Client may give RMC-only or FG-only — both work.</div>
        </SectionCard>

        {/* 11 — REFERENCES (non-mandatory) */}
        <SectionCard n="11" title={<span className="row gap-2">References {form.references.length > 0 && <span className="pill pill-sm" style={{ background: "var(--page)", color: "var(--muted)" }}>{form.references.length}</span>}</span>}
          desc="Competitor products, shade refs, inspiration links. URL or screenshot per row."
          action={<button className="btn btn-secondary btn-sm" onClick={addRef}><Icon name="plus" size={14} /> Add another reference</button>}>
          {form.references.length === 0 && <div className="body-sm">No references yet — optional. Click “Add another reference”.</div>}
          <div className="col gap-3">
            {form.references.map((r, i) => <div key={i} className="row gap-2" style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", alignItems: "center" }}>
              <input className="input" placeholder="Label" style={{ maxWidth: 200 }} value={r.label} onChange={e => setRef(i, { label: e.target.value })} />
              <input className="input" placeholder="Paste URL" value={r.url} onChange={e => setRef(i, { url: e.target.value })} />
              <button type="button" className="btn btn-secondary" onClick={() => setRef(i, { img: !r.img })} style={{ whiteSpace: "nowrap" }}>{r.img ? <><Icon name="check" size={14} /> Added</> : "Upload"}</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => rmRef(i)}><Icon name="x" size={16} /></button>
            </div>)}
          </div>
        </SectionCard>

        {/* 12 — BRIEF / RECOMMENDATION */}
        <SectionCard n="12" title="Client brief & onboarding note">
          <Field label="Title (optional)"><input className="input" value={form.title} onChange={e => set("title", e.target.value)} placeholder={`${form.brand || "Brand"} ${form.category || "product"}`} /></Field>
          <div style={{ height: 12 }} />
          <Field label={clientKind === "new" ? "Your onboarding recommendation (feeds manager decision)" : "Full brief"} >
            <textarea className="textarea" value={form.recommend} onChange={e => set("recommend", e.target.value)}
              placeholder={clientKind === "new" ? "e.g. High-potential brand, fast mover — recommend we onboard. Verbal approval taken." : "Paste or summarise the client conversation…"} /></Field>
        </SectionCard>

        {/* PROJECT TYPE — decided last, suggested from the formulation */}
        <SectionCard title="Project type" desc="Suggested from your formulation (base + actives). Decide last — once the brief is complete. AI-assisted, a suggestion not a decision.">
          <ProjectTypePicker value={form.type} onChange={v => set("type", v)} aiSuggested={aiType} gateLocked={gateLocked} />
          {form.type === "TT" && <div onClick={() => set("ttSheet", !form.ttSheet)} style={{ marginTop: 12, border: "2px dashed " + (form.ttSheet ? "var(--border)" : "var(--pt-tt-fg)"), borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer" }}>
            <Icon name={form.ttSheet ? "check" : "upload"} size={18} color={form.ttSheet ? "var(--approved-fg)" : "var(--pt-tt-fg)"} />
            <div className="body-sm" style={{ marginTop: 4, fontWeight: form.ttSheet ? 600 : 400 }}>{form.ttSheet ? "Tech-transfer sheet attached ✓ — click to remove" : "Upload the client's tech-transfer sheet (formula + process) — skips manual ingredient entry"}</div>
          </div>}
        </SectionCard>

        <div className="card" style={{ background: "var(--brand-wash)" }}>
          <div className="row between">
            <div className="row gap-3">
              <Toggle on={flagManager} onChange={setFlagManager} disabled={gateLocked} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>Submit to manager for review</div>
                <div className="body-sm" style={{ fontSize: 12 }}>{gateLocked ? "Auto-locked ON for TT / NPD" : "Optional for EPD / REN — they go straight to the lab unless you flag them"}</div>
              </div>
            </div>
            <div className="row gap-2">
              <button className="btn btn-secondary btn-lg" onClick={saveDraft}><Icon name="note" size={15} /> Save draft</button>
              <button className="btn btn-lg" disabled={!canSubmit} onClick={submitRequirement} style={{ background: canSubmit ? "var(--grad-brand)" : undefined }}>
                <Icon name="check" size={16} /> Submit requirement
              </button>
            </div>
          </div>
          {draftMsg && <div className="row gap-2" style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "var(--approved-bg)" }}>
            <Icon name="check" size={14} color="var(--approved-fg)" /><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--approved-fg)" }}>{draftMsg} It also appears under Requirements → Drafts.</span></div>}
          {!canSubmit && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "var(--review-bg)" }}>
            <div className="row gap-2" style={{ marginBottom: 7 }}><Icon name="alert" size={13} color="var(--review-fg)" /><span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--review-fg)" }}>Still needed before you can submit ({missingFields.length})</span></div>
            <div className="row gap-2 wrap">{missingFields.map(mf => { const tgt = { "Units / MOQ": "f-units", "Pack size": "f-pack", "Fill volume": "f-fill", "Label description": "f-label", "Shipping address": "f-shipping" }[mf];
              return <span key={mf} className="pill pill-sm" onClick={() => { if (!tgt) { window.scrollTo({ top: 0, behavior: "smooth" }); return; } const el = document.getElementById(tgt); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); } }}
                style={{ background: "var(--surface)", color: "var(--review-fg)", border: "1px dashed var(--review-fg)", cursor: "pointer" }}>{mf}</span>; })}</div>
          </div>}
          {canSubmit && <div className="body-sm" style={{ marginTop: 10, color: "var(--ok)" }}>Ready — this will create <b>{form.title || `${form.brand} ${form.category}`}</b> and route it {(gateLocked || flagManager) ? "to the Sales Manager's review queue" : "live to the lab pipeline"}.</div>}
        </div>
      </div>

      <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* AI similar-formulations picker — built from past work, rulebook-aware */}
        <div className="card" style={{ borderLeft: "3px solid var(--brand)", background: "var(--brand-wash)" }}>
          <div className="row gap-2" style={{ marginBottom: 4 }}><Icon name="sparkle" size={15} color="var(--brand-accent)" /><span className="ai-eyebrow">AI · similar formulations</span></div>
          <div className="body-sm" style={{ fontSize: 11.5, marginBottom: 12 }}>From our past work. Usually the <b>base stays the same</b> and only the <b>actives change</b> — so we can reuse a proven formula and just tweak the actives. A suggestion, not a decision.</div>
          <div className="col gap-2">
            {(form.category || actives.length) ? suggestions.map(s => {
              const sel = form.selectedFormulation === s.code;
              const wanted = actives.map(a => a.ingredient);
              const toAdd = wanted.filter(w => w && !s.actives.some(fa => fa.toLowerCase().includes(w.toLowerCase().split(" ")[0])));
              const shared = s.actives.filter(fa => wanted.some(w => fa.toLowerCase().includes((w||"").toLowerCase().split(" ")[0])));
              return <div key={s.code} onClick={() => set("selectedFormulation", sel ? "" : s.code)}
                style={{ padding: 12, borderRadius: 10, background: "var(--surface)", cursor: "pointer",
                  border: sel ? "2px solid var(--brand)" : "1px solid var(--border)" }}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <FormulationCode code={s.code} />
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-mid)" }}>{s.score}% match</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</div>
                <div className="body-sm" style={{ fontSize: 11.5, marginTop: 2 }}>{s.delta}</div>
                {/* base stays / actives change detail */}
                <div style={{ marginTop: 8, padding: "7px 9px", borderRadius: 8, background: "var(--brand-wash)" }}>
                  <div className="row gap-2" style={{ marginBottom: 3 }}><span className="label" style={{ fontSize: 8.5 }}>Base · keep</span>
                    <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--brand-mid)", border: "1px solid var(--border)" }}>{s.base}</span></div>
                  {shared.length > 0 && <div className="body-sm" style={{ fontSize: 11 }}>✓ Reuse: {shared.join(", ")}</div>}
                  {toAdd.length > 0 && <div className="body-sm" style={{ fontSize: 11, color: "var(--coral-dark)" }}>↻ Change/add: {toAdd.join(", ")}</div>}
                  {toAdd.length === 0 && shared.length > 0 && <div className="body-sm" style={{ fontSize: 11, color: "var(--ok)" }}>Actives already match — reuse as-is.</div>}
                </div>
                <div className="label" style={{ fontSize: 9, marginTop: 6 }}>sold to {s.soldTo} · has {s.actives.join(", ")}</div>
                {s.ruleWarn && <div className="body-sm" style={{ fontSize: 11, marginTop: 4, color: "var(--coral)" }}>⚠ {s.ruleWarn.note}</div>}
                <div className="row gap-2" style={{ marginTop: 8 }}>
                  <button className={"btn btn-sm " + (sel ? "" : "btn-secondary")} onClick={e => { e.stopPropagation(); set("selectedFormulation", sel ? "" : s.code); if (!sel && !form.base) set("base", s.base); }}>
                    {sel ? <><Icon name="check" size={13} /> Selected</> : "Use this base"}</button>
                </div>
              </div>;
            }) : <div className="body-sm" style={{ fontSize: 12 }}>Pick a category and add actives to see matches.</div>}
          <hr className="divider" style={{ margin: "12px 0" }} />
          <Field label="Or enter a base code manually" hint="NTL / NCL code — fallback if the AI match isn't right">
            <div className="row gap-2">
              <input className="input mono" placeholder="e.g. NTL-SR-014" value={form.manualCode || ""} onChange={e => set("manualCode", e.target.value)} />
              <button className="btn btn-sm btn-secondary" disabled={!(form.manualCode || "").trim()} onClick={() => set("selectedFormulation", form.manualCode.trim())}>{form.selectedFormulation && form.selectedFormulation === (form.manualCode || "").trim() ? "✓ Used" : "Use code"}</button>
            </div>
          </Field>
          <button type="button" onClick={() => setForm(f => ({ ...f, selectedFormulation: "", manualCode: "", noBase: !f.noBase, type: !f.noBase ? "NPD" : f.type }))}
            style={{ marginTop: 10, width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              border: form.noBase ? "2px solid var(--pt-npd-fg)" : "1px dashed var(--border)", background: form.noBase ? "var(--pt-npd-bg)" : "transparent" }}>
            <div className="row gap-2"><Icon name="sparkle" size={14} color="var(--pt-npd-fg)" /><span style={{ fontWeight: 600, fontSize: 12.5 }}>No existing base — new development</span></div>
            <div className="body-sm" style={{ fontSize: 11, marginTop: 2 }}>{form.noBase ? "NPD path — base selection skipped, project type set to NPD." : "Creating something we've never made? Skip base selection — goes straight to the NPD path."}</div>
          </button>

          </div>
        </div>

        {ruleHits.length > 0 && <CompatibilityNote severity="warn" title="Live compatibility check">{ruleHits.length} rulebook note{ruleHits.length > 1 ? "s" : ""} — verify before submit.</CompatibilityNote>}

        <div className="card">
          <div className="label" style={{ marginBottom: 12 }}>Progress checklist</div>
          {[["Client selected", clientKind === "new" || form.brand],
            ["Category set", form.category], ["Actives captured", actives.length > 0],
            ["Lab-handoff fields", filledReq === 5], ["Budgets", fg > 0], ["Project type", form.type]].map(([l, ok]) =>
            <div key={l} className="row gap-2" style={{ padding: "7px 0" }}>
              <div style={{ width: 18, height: 18, borderRadius: 999, background: ok ? "var(--approved-bg)" : "var(--page)",
                border: ok ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ok && <Icon name="check" size={12} color="var(--approved-fg)" />}</div>
              <span className="body-sm" style={{ fontSize: 12.5, color: ok ? "var(--ink)" : "var(--muted)" }}>{l}</span>
            </div>)}
        </div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   SP-03 · REQUIREMENTS LIST
   ==================================================================== */
function SP03_List({ nav }) {
  window.useStore();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [, force] = useState(0);
  const draft = (window.NaturisDrafts && window.NaturisDrafts.load()) || null;
  const TABS = [
    ["review", "Pending manager review", "queue"],
    ["ack", "Lab acknowledgement pending", "incoming"],
    ["eval", "Under lab evaluation", "work"],
    ["inlab", "In lab", "work"],
    ["dispatch", "Ready for dispatch", "dispatch"],
    ["sent", "Sent to client", "check"],
    ["approved", "Approved", "star"],
    ["rejected", "Rejected", "x"],
    ["drafts", "Drafts", "note"],
    ["all", "All", "list"],
  ];
  const TAB_STATUS = {
    review: ["Pending review", "Returned to SPOC"],
    ack: ["Logged", "Approved"],
    eval: ["Acknowledged", "In evaluation", "Query raised", "Declined"],
    inlab: ["Accepted — date committed", "Formulation", "Trial", "QC", "Fill"],
    dispatch: ["Ready for dispatch", "Dispatch awaiting SPOC approval"],
    sent: ["Sent to client"],
    approved: ["Client approved", "In stability", "Archived", "Won"],
    rejected: ["Rejected"],
  };
  const countOf = v => v === "all" ? D.REQUIREMENTS.length : v === "drafts" ? (draft ? 1 : 0) : D.REQUIREMENTS.filter(r => (TAB_STATUS[v] || []).includes(r.status)).length;
  function match(r) {
    if (tab === "drafts") return false;
    if (tab !== "all" && !(TAB_STATUS[tab] || []).includes(r.status)) return false;
    if (q && !(`${r.id} ${r.title} ${r.brand}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }
  const rows = D.REQUIREMENTS.filter(match);
  const df = draft && draft.payload && draft.payload.form;
  const draftTitle = df ? (df.title || `${df.brand || df.existingAcct || "Untitled"} ${df.category || ""}`.trim()) : "";
  const DraftCard = draft ? <div className="card row between wrap gap-3" style={{ border: "1px dashed var(--review-fg)", background: "var(--review-bg)" }}>
    <div className="row gap-3" style={{ minWidth: 0 }}>
      <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--review-fg)", fontWeight: 700 }}>DRAFT</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{draftTitle || "Untitled draft"}</div>
        <div className="body-sm" style={{ fontSize: 12 }}>Not submitted yet · saved {draft.at ? new Date(draft.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "earlier"}</div>
      </div>
    </div>
    <div className="row gap-2">
      <button className="btn btn-sm" onClick={() => nav("SP-02")}><Icon name="edit" size={13} /> Resume draft</button>
      <button className="btn btn-ghost btn-sm" onClick={() => { window.NaturisDrafts.clear(); force(x => x + 1); }}>Discard</button>
    </div>
  </div> : null;
  return <div className="col gap-5">
    <PageHead title="Requirements" sub={`${rows.length} shown · VVIP-sorted`}
      actions={<button className="btn" onClick={() => nav("SP-02")}><Icon name="plus" size={16} /> New requirement</button>} />
    {/* stage filter — horizontal tiles (same pattern as the manager's Live requirements) */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 8 }}>
      {TABS.map(([v, l, ic]) => { const on = tab === v; const n = countOf(v);
        const amber = v === "drafts";
        return <button key={v} onClick={() => setTab(v)} style={{ border: on ? "none" : "1px solid var(--border)", cursor: "pointer",
          borderRadius: 12, padding: "12px 10px", textAlign: "left", transition: "all .15s",
          background: on ? (amber ? "var(--review-fg)" : "var(--grad-brand)") : "var(--surface)",
          color: on ? "#fff" : "var(--ink)", boxShadow: on ? "0 6px 16px rgba(18,57,95,.25)" : "none" }}>
          <Icon name={ic} size={15} color={on ? "#fff" : (amber ? "var(--review-fg)" : "var(--brand)")} />
          <div className="serif-num" style={{ fontSize: 22, marginTop: 4 }}>{n}</div>
          <div style={{ fontSize: 10, fontWeight: 600, marginTop: 1, opacity: on ? .9 : .65, lineHeight: 1.25 }}>{l}</div>
        </button>; })}
    </div>
    <div className="row between">
      <div />
      <div style={{ position: "relative", width: 280 }}>
        <span style={{ position: "absolute", left: 12, top: 11 }}><Icon name="search" size={16} color="var(--muted)" /></span>
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Search id, title, brand…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
    </div>
    {(tab === "all" || tab === "drafts") && DraftCard}
    {tab === "drafts" && !draft && <div className="card" style={{ textAlign: "center", padding: 36 }}><Icon name="note" size={22} color="var(--brand-light)" /><div className="h3" style={{ marginTop: 8 }}>No drafts</div><div className="body-sm" style={{ marginTop: 4 }}>Use "Save draft" on the intake form — it'll wait for you here.</div></div>}
    {tab !== "drafts" && <ReqTable rows={rows} onOpen={r => nav("SP-04", { reqId: r.id })} />}
  </div>;
}

/* ====================================================================
   SP-04 · REQUIREMENT DETAIL
   ==================================================================== */
function CommLog({ reqId, by }) {
  const [mode, setMode] = useState("note");
  const [text, setText] = useState("");
  const [entries, setEntries] = useState(() => ((window.NaturisData.COMM_LOGS || {})[reqId] || []).slice());
  const modes = [["note", "note", "Note"], ["screenshot", "camera", "Screenshot"], ["email", "mail", "Email"], ["call", "phone", "Call"]];
  const ic = { note: "note", screenshot: "camera", email: "mail", call: "phone" };
  const me = by || "Hardik Shah";
  function add() {
    if (!text.trim()) return;
    setEntries(e => [{ mode, who: me, at: "just now", text: text.trim(), milestone: null }, ...e]);
    if (reqId) window.NaturisStore.log(reqId, { kind: "comment", icon: ic[mode], stage: "Communication", actor: me, role: "SPOC", at: "just now", detail: `${mode}: ${text.trim()}` }) , window.NaturisStore.update(reqId, {});
    setText("");
  }
  return <div className="card">
    <SectionTitle sub="No parallel WhatsApp — capture here">Communication log</SectionTitle>
    <div className="row gap-2" style={{ marginBottom: 12 }}>
      {modes.map(([v, icon, l]) => <button key={v} onClick={() => setMode(v)} className={"btn btn-sm " + (mode === v ? "" : "btn-secondary")}>
        <Icon name={icon} size={14} /> {l}</button>)}
      <div className="grow" />
      <button className="btn btn-ghost btn-sm" onClick={() => text.trim() && setText(text.trim() + " — (AI summary appended)")}><Icon name="sparkle" size={14} /> AI summarise</button>
    </div>
    <textarea className="textarea" placeholder={`Capture a ${mode}…`} style={{ marginBottom: 10 }} value={text} onChange={e => setText(e.target.value)} />
    <div className="row end" style={{ marginBottom: 16 }}><button className="btn btn-sm" disabled={!text.trim()} onClick={add}><Icon name="plus" size={13} /> Add to log</button></div>
    <div className="col gap-3">
      {entries.length === 0 && <div className="body-sm" style={{ fontSize: 12 }}>No communications captured yet — add the first note above.</div>}
      {entries.map((l, i) => <div key={i} className="row gap-3" style={{ alignItems: "flex-start" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--brand-wash)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={ic[l.mode]} size={15} color="var(--brand-accent)" /></div>
        <div style={{ flex: 1 }}>
          <div className="row gap-2"><span style={{ fontWeight: 600, fontSize: 13 }}>{l.who}</span>
            <span className="label" style={{ fontSize: 9 }}>{l.at}</span>
            {l.milestone && <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>{l.milestone}</span>}</div>
          <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{l.text}</div>
        </div>
      </div>)}
    </div>
  </div>;
}

/* ---------- SHARED: RaiseFlagDrawer (used by SPOC/manager/lab) ---------- */
const FLAG_OPTIONS = [
  { code: "formulation", label: "Formulation", owner: "Lab Manager" },
  { code: "commercial", label: "Commercial", owner: "Sales Manager" },
  { code: "sensory", label: "Sensory", owner: "Lab Technician" },
  { code: "coverage", label: "Coverage", owner: "Lab Technician" },
  { code: "packaging", label: "Packaging", owner: "PM / Procurement" },
  { code: "unresponsive", label: "Lab unresponsive", owner: "Lab Manager" },
  { code: "client_unresp", label: "Client unresponsive", owner: "Sales Manager" },
  { code: "other", label: "Other", owner: "Sales Manager" },
];
function RaiseFlagDrawer({ open, onClose, reqId, role }) {
  const _req = reqId ? window.NaturisStore.get(reqId) : null;
  const flagHold = !!(_req && _req.status === "Sent to client" && (_req.phaseDays || 0) < 3);
  const [type, setType] = useState("formulation");
  const [text, setText] = useState("");
  const me = window.NaturisData.ROLES.find(r => r.id === role)?.person || "User";
  const opt = FLAG_OPTIONS.find(o => o.code === type);
  function raise() {
    window.NaturisStore.addFlag(reqId, { type, typeLabel: opt.label, text,
      raisedBy: me, raisedByRole: window.NaturisData.ROLES.find(r => r.id === role)?.name, stage: "Open", owner: opt.owner });
    setText(""); onClose();
  }
  return <Drawer open={open} onClose={onClose} eyebrow={reqId} title="Raise a flag" width={460}
    footer={<div className="row end gap-2">
      {flagHold && <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--review-bg)", marginBottom: 12 }}>
        <div className="row gap-2"><Icon name="clock" size={14} color="var(--review-fg)" /><span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--review-fg)" }}>Flagging opens 3 days after dispatch</span></div>
        <div className="body-sm" style={{ fontSize: 12, color: "var(--review-fg)", marginTop: 2 }}>This sample reached the client {_req.phaseDays || 0} day{(_req.phaseDays || 0) !== 1 ? "s" : ""} ago. Give them 3 days before raising a flag — keeps the manager's desk noise-free.</div>
      </div>}<button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-destructive" disabled={flagHold || !text} onClick={raise}><Icon name="flag" size={15} /> Raise flag</button></div>}>
    <div className="col gap-3">
      <Field label="Flag type — routes to the responsible person">
        <div className="grid grid-2 gap-2">{FLAG_OPTIONS.map(o => { const on = type === o.code; return <button key={o.code} type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); setType(o.code); }}
          style={{ textAlign: "left", padding: "8px 10px", borderRadius: 8, border: on ? "2px solid var(--brand)" : "1px solid var(--border)", background: on ? "var(--brand-wash)" : "var(--surface)", cursor: "pointer" }}>
          <div className="row between"><div style={{ fontSize: 12.5, fontWeight: 600 }}>{o.label}</div>{on && <Icon name="check" size={13} color="var(--brand)" />}</div><div className="body-sm" style={{ fontSize: 10.5 }}>→ {o.owner}</div></button>; })}</div>
      </Field>
      <Field label="What's the issue?"><textarea className="textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Describe what needs intervention…" /></Field>
      <CompatibilityNote severity="ok" title="Routed to your Sales Manager">You raise the flag; your Sales Manager provides a solution, and you mark it resolved once satisfied.</CompatibilityNote>
    </div>
  </Drawer>;
}
function RulebookDrawer({ open, onClose }) {
  return <Drawer open={open} onClose={onClose} eyebrow="Reference" title="Compatibility rulebook" width={480}>
    <div className="body-sm" style={{ marginBottom: 14 }}>Maintained by the Super Admin. The lab's known incompatibilities — shown live while you build an intake.</div>
    <div className="col gap-2">{window.NaturisData.RULEBOOK.map((r, i) => <div key={i} className="card" style={{ padding: 12 }}>
      <div className="row gap-2" style={{ marginBottom: 4 }}><span className="chip" style={{ height: 22, fontSize: 11 }}>{r.pair[0]}</span><Icon name="x" size={12} color="var(--muted)" /><span className="chip" style={{ height: 22, fontSize: 11 }}>{r.pair[1]}</span>
        <span className="pill pill-sm" style={{ marginLeft: "auto", background: r.severity === "error" ? "var(--coral-wash)" : "var(--review-bg)", color: r.severity === "error" ? "var(--coral-dark)" : "var(--review-fg)" }}>{r.severity}</span></div>
      <div className="body-sm" style={{ fontSize: 12.5 }}>{r.note}</div></div>)}</div>
  </Drawer>;
}

function lifecyclePhases(req) {
  const gated = ["TT", "NPD"].includes(req.projectType) || req.clientKind === "new" ||
    ["Pending review", "Returned to SPOC"].includes(req.status);
  const phases = ["Requirement logged"];
  if (gated) phases.push("Manager review");
  phases.push("Lab acknowledged", "In lab", "Dispatch", "Sent to client");
  const map = {
    "Logged": "Requirement logged",
    "Pending review": "Manager review", "Returned to SPOC": "Manager review",
    "Approved": "Lab acknowledged", "R&D assessing": "Lab acknowledged", "R&D assessed": "Lab acknowledged",
    "Acknowledged": "Lab acknowledged", "In evaluation": "Lab acknowledged", "In assessment (RM/PM/Slot)": "Lab acknowledged",
    "Query raised": "Lab acknowledged", "Declined": "Lab acknowledged", "Accepted — date committed": "Lab acknowledged",
    "Formulation": "In lab", "Trial": "In lab", "QC": "In lab", "Fill": "In lab", "Returned — needs revision": "In lab",
    "Ready for dispatch": "Dispatch", "Dispatch awaiting SPOC approval": "Dispatch",
    "Sent to client": "Sent to client", "Client approved": "Sent to client", "In stability": "Sent to client", "Archived": "Sent to client", "Won": "Sent to client",
  };
  return { phases, current: map[req.status] || "Requirement logged" };
}

/* Progress stepper + chronological who/when log (flags highlighted) */
function ProgressTimeline({ req }) {
  const { phases, current } = lifecyclePhases(req);
  const events = (window.NaturisData.REQUIREMENT_TIMELINES[req.id] || []);
  const dot = { created: "var(--brand)", assigned: "var(--brand-light)", approval: "var(--approved-fg)", handoff: "var(--brand-accent)", flag: "var(--coral)", status: "var(--periwinkle)" };
  return <div>
    <StageStepper stages={phases} current={current} />
    <hr className="divider" style={{ margin: "16px 0" }} />
    <div className="label" style={{ marginBottom: 10 }}>Timestamps</div>
    {events.length === 0 ? <div className="body-sm">Logged just now.</div> :
    <div className="col">
      {[...events].reverse().map((e, i) => <div key={i} className="row gap-3" style={{ alignItems: "flex-start", padding: "7px 0", borderBottom: i < events.length - 1 ? "1px solid var(--border)" : "none" }}>
        <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--surface)", border: `2px solid ${e.kind === "flag" ? "var(--coral)" : (dot[e.kind] || "var(--border-strong)")}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={e.icon || "work"} size={13} color={e.kind === "flag" ? "var(--coral)" : (dot[e.kind] || "var(--muted)")} /></div>
        <div style={{ flex: 1 }}>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{e.stage}</span>
            {e.kind === "flag" && <span className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}>flag</span>}
            {e.system && <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>AUTO</span>}
          </div>
          <div className="body-sm" style={{ fontSize: 12.5 }}>{e.detail}</div>
          <div className="label" style={{ fontSize: 9, marginTop: 2 }}>{e.at}{e.duration ? " · " + e.duration : ""}</div>
        </div>
      </div>)}
    </div>}
  </div>;
}

function FullBrief({ req, defaultOpen, bare }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const bd = req.briefDetail || {};
  const Row = ({ l, v }) => v ? <div className="row between" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
    <span className="body-sm">{l}</span><span style={{ fontSize: 13, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span></div> : null;
  const Block = ({ title, children }) => <div style={{ marginBottom: 16 }}><div className="label" style={{ marginBottom: 8 }}>{title}</div>{children}</div>;
  return <div className={bare ? "" : "card"}>
    <div className="row between" style={{ cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div><div className="h3">Full requirement — as submitted by {req.submittedBy}</div>
        <div className="body-sm" style={{ fontSize: 12 }}>Everything captured at intake. Click to {open ? "collapse" : "expand"}.</div></div>
      <Icon name={open ? "chevUp" : "chevDown"} size={18} color="var(--muted)" />
    </div>
    {open && <div style={{ marginTop: 16 }}>
      <div className="grid grid-2 gap-6">
        <div>
          <Block title="Client">
            <Row l="Brand" v={req.brand} /><Row l="Company / account" v={bd.company || req.account} /><Row l="Client name" v={bd.clientName} /><Row l="Relationship" v={req.clientKind === "new" ? "New client" : "Existing"} />
          </Block>
          <Block title="Product">
            <Row l="Family" v={req.categoryGroup} /><Row l="Category" v={req.category} /><Row l="Base" v={req.base} /><Row l="Project type" v={req.projectType} />
          </Block>
          <Block title="Formulation code — selected">
            <div className="row gap-3" style={{ alignItems: "center" }}>
              {req.ntl ? <div><div className="label" style={{ fontSize: 8.5 }}>Base</div><FormulationCode code={req.ntl} /></div> : <span className="body-sm">New development — no base</span>}
              {req.ntl && <Icon name="arrowRight" size={14} color="var(--muted)" />}
              <div><div className="label" style={{ fontSize: 8.5 }}>Current</div><FormulationCode code={req.currentNcl} /></div>
            </div>
          </Block>
          {bd.notes && <Block title="Description / base notes"><div className="body-sm" style={{ fontSize: 12.5, color: "var(--ink)" }}>{bd.notes}</div></Block>}
          <Block title="Actives — non-negotiable">
            {req.nonNegotiable.length ? req.nonNegotiable.map((a, i) => <div key={i} className="row between" style={{ padding: "6px 10px", borderRadius: 6, background: "var(--coral-wash)", marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{a.ingredient}</span><span className="mono" style={{ fontSize: 12 }}>{a.concentration}</span></div>) : <span className="body-sm">—</span>}
            <div className="label" style={{ margin: "10px 0 6px" }}>Good-to-have</div>
            {req.goodToHave.length ? req.goodToHave.map((a, i) => <div key={i} className="row between" style={{ padding: "6px 10px", borderRadius: 6, background: "var(--brand-wash)", marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{a.ingredient}</span><span className="mono" style={{ fontSize: 12 }}>{a.concentration}</span></div>) : <span className="body-sm">—</span>}
          </Block>
        </div>
        <div>
          <Block title="Concerns">{req.concerns.length ? <div className="row gap-2 wrap">{req.concerns.map(c => <span key={c} className="chip" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}>{c}</span>)}</div> : <span className="body-sm">None</span>}</Block>
          <Block title="Claims">{req.claims.length ? <div className="row gap-2 wrap">{req.claims.map((c, i) => <span key={i} className="chip" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>{c}</span>)}</div> : <span className="body-sm">None</span>}</Block>
          <Block title="Sensory">{req.sensory && Object.entries(req.sensory).map(([k, v]) => <Row key={k} l={k[0].toUpperCase() + k.slice(1)} v={v} />)}</Block>
          <Block title="Lab handoff">
            <Row l="Units / MOQ" v={req.moq} /><Row l="Pack size" v={bd.packSize || req.packaging} /><Row l="Fill volume" v={bd.fillVol} /><Row l="Label" v={bd.labelDesc} /><Row l="Reference ID" v={bd.refId} /><Row l="Ship to" v={bd.shipName ? bd.shipName + (bd.shipPhone ? " · " + bd.shipPhone : "") : null} /><Row l="Shipping" v={bd.shipping} />
          </Block>
          <Block title="Commercials">
            <Row l="RM cost" v={bd.rmBudget ? "₹" + bd.rmBudget : null} /><Row l="PM cost" v={bd.pmBudget ? "₹" + bd.pmBudget : null} /><Row l="FG" v={(bd.fg != null ? "₹" + bd.fg : (req.budget && req.budget.unit))} /><Row l="Target date" v={req.targetSampleDate} />
          </Block>
          {bd.packaging && bd.packaging.length > 0 && <Block title="Packaging">{bd.packaging.map((p, i) => <div key={i} className="body-sm" style={{ fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>{p.desc || "—"} · <span className="muted">{p.source === "client" ? "client" : "Naturis"}{p.vendor ? " · " + p.vendor : ""}</span></div>)}</Block>}
          {bd.references && bd.references.length > 0 && <Block title="References">{bd.references.map((r, i) => <div key={i} className="body-sm" style={{ fontSize: 12.5 }}>{r.label || "ref"}{r.url ? " — " + r.url : ""}</div>)}</Block>}
        </div>
      </div>
    </div>}
  </div>;
}

/* two-step confirm for destructive actions */
function ConfirmBtn({ className, onConfirm, children, confirmLabel, disabled, style }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3500); return () => clearTimeout(t); }, [armed]);
  return <button className={className || "btn btn-destructive"} disabled={disabled} style={style}
    onClick={() => { if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}>
    {armed ? <><Icon name="alert" size={14} /> {confirmLabel || "Click again to confirm"}</> : children}
  </button>;
}

/* one answer box per open lab query */
function QueryAnswerRow({ req, q }) {
  const [answer, setAnswer] = useState("");
  return <div style={{ padding: "10px 12px", background: "var(--review-bg)", borderRadius: 8, marginBottom: 8 }}>
    <div className="body-sm" style={{ color: "var(--review-fg)", fontWeight: 600 }}>{q.text}</div>
    <div className="label" style={{ fontSize: 9, marginTop: 2 }}>{q.by} · {q.at}</div>
    <div className="row gap-2" style={{ marginTop: 8 }}>
      <input className="input" style={{ flex: 1, background: "var(--surface)" }} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your clarification for this query…" />
      <button className="btn btn-sm" disabled={!answer.trim()} onClick={() => window.NaturisStore.resolveQuery(req.id, q.id, answer.trim(), "Hardik Shah")}><Icon name="check" size={13} /> Answer</button>
    </div>
  </div>;
}

function SpocActionCard({ req }) {
  const [answer, setAnswer] = useState("");
  const [fb, setFb] = useState("");
  const openQ = (req.queries || []).filter(q => !q.resolved);
  // 1. Lab raised a query → SPOC answers
  if (req.status === "Query raised" && openQ.length) {
    return <div className="card" style={{ borderLeft: "4px solid var(--review-fg)", marginBottom: 16 }}>
      <SectionTitle sub={openQ.length > 1 ? openQ.length + " open queries — it returns to the lab once every one is answered" : "The lab needs clarification before it can proceed"}>Lab quer{openQ.length > 1 ? "ies" : "y"} — your response needed</SectionTitle>
      {openQ.map(q => <QueryAnswerRow key={q.id} req={req} q={q} />)}
    </div>;
  }
  // 1b. Manager returned it → SPOC must clear the question & resend for approval
  if (req.status === "Returned to SPOC") {
    return <div className="card" style={{ borderLeft: "4px solid var(--review-fg)", marginBottom: 16 }}>
      <SectionTitle sub="Your manager sent this back — clear the question, then resend for approval">Returned by your manager</SectionTitle>
      <div style={{ padding: "10px 12px", background: "var(--review-bg)", borderRadius: 8, marginBottom: 10 }}>
        <div className="label" style={{ fontSize: 9, marginBottom: 3, color: "var(--review-fg)" }}>Manager's note</div>
        <div className="body-sm" style={{ fontSize: 12.5, color: "var(--review-fg)", fontWeight: 600 }}>{req.returnNote || "Details unclear — please revise before lab handoff."}</div>
      </div>
      <Field label="Your clarification (required — goes back to the manager)"><textarea className="textarea" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="e.g. Confirmed with the client — fill volume is 50ml, label artwork attached now." style={{ minHeight: 60 }} /></Field>
      <button className="btn" style={{ marginTop: 10 }} disabled={!answer.trim()} onClick={() => window.NaturisStore.resendForApproval(req.id, answer.trim(), "Hardik Shah")}><Icon name="check" size={15} /> Resend for approval</button>
    </div>;
  }
  // 1c. Client rejected → iterate, or close as lost
  if (req.status === "Rejected") {
    return <div className="card" style={{ borderLeft: "4px solid var(--coral)", marginBottom: 16 }}>
      <SectionTitle sub="The client rejected this sample — iterate with their feedback, or close it as lost">Client rejected — your move</SectionTitle>
      <Field label="What to change / why it was lost"><textarea className="textarea" value={fb} onChange={e => setFb(e.target.value)} placeholder="e.g. Texture too heavy — client wants a gel-cream. / Client moved to a competitor on price." style={{ minHeight: 56 }} /></Field>
      <div className="row gap-2" style={{ marginTop: 10 }}>
        <button className="btn" disabled={!fb.trim()} onClick={() => window.NaturisStore.newIteration(req.id, "Client feedback: " + fb.trim(), "Hardik Shah")}><Icon name="history" size={15} /> Start iteration v{(req.iteration || 1) + 1}</button>
        <ConfirmBtn disabled={!fb.trim()} confirmLabel="Confirm — close as lost" onConfirm={() => window.NaturisStore.closeLost(req.id, fb.trim(), "Hardik Shah")}><Icon name="archive" size={15} /> Close as lost</ConfirmBtn>
      </div>
    </div>;
  }
  // 2. Lab declined → SPOC revise & resubmit
  if (req.status === "Declined") {
    return <div className="card" style={{ borderLeft: "4px solid var(--coral)", marginBottom: 16 }}>
      <SectionTitle sub="The lab could not take this on">Declined — your move</SectionTitle>
      <div className="body-sm" style={{ marginBottom: 10 }}>{req.declineReason}</div>
      {(() => { const gated = ["TT", "NPD"].includes(req.projectType);
        return <button className="btn btn-secondary" onClick={() => window.NaturisStore.setStatus(req.id, gated ? "Pending review" : "Logged", "Hardik Shah")}><Icon name="history" size={15} /> Revise & resend to {gated ? "manager" : "lab"}</button>; })()}
    </div>;
  }
  // 3. Sample sent → SPOC records client outcome (approve / iteration / reject)
  if (req.status === "Sent to client") {
    return <div className="card" style={{ borderLeft: "4px solid var(--brand)", marginBottom: 16 }}>
      <SectionTitle sub="Client → SPOC → Lab — capture the client's response">Client feedback</SectionTitle>
      <Field label="Feedback (texture / fragrance / formula / other)"><textarea className="textarea" value={fb} onChange={e => setFb(e.target.value)} placeholder="e.g. Loves the texture; wants the fragrance softer." style={{ minHeight: 56 }} /></Field>
      <div className="body-sm" style={{ fontSize: 11.5, marginBottom: 8, color: "var(--muted)" }}>The client gives feedback to you; relay it here. Feedback returns to the lab as a fresh formulation (new NCL, same requirement) for re-evaluation.</div>
      <div className="row gap-2" style={{ marginTop: 4 }}>
        <button className="btn" onClick={() => window.NaturisStore.clientOutcome(req.id, "approved", "Hardik Shah")}><Icon name="check" size={15} /> Client approved → PO</button>
        <button className="btn btn-secondary" disabled={!fb.trim()} onClick={() => { window.NaturisStore.clientFeedback(req.id, fb.trim(), "Hardik Shah"); }}><Icon name="history" size={15} /> Send feedback to lab (re-evaluate)</button>
        <ConfirmBtn confirmLabel="Confirm — close as lost" onConfirm={() => window.NaturisStore.closeLost(req.id, fb.trim() || "Client did not proceed", "Hardik Shah")}>Close as lost</ConfirmBtn>
      </div>
    </div>;
  }
  // 4. Client approved → lab runs stability (if its verdict was 'needed') + deliverables, then marks won
  if (req.status === "Client approved") {
    const needs = (req.evaluation || {}).stabilityNeeded === "yes";
    return <div className="card" style={{ borderLeft: "4px solid var(--ok)", marginBottom: 16 }}>
      <div className="row gap-2"><Icon name="check" size={16} color="var(--ok)" /><span className="body-sm"><b>Client approved.</b> The lab {needs ? "runs stability + " : ""}prepares the ingredient sheet & marketing brief, then closes this as Won.</span></div>
    </div>;
  }
  // 5. Won — positive terminal
  if (req.status === "Won") {
    return <div className="card" style={{ borderLeft: "4px solid #16A34A", marginBottom: 16 }}>
      <div className="row gap-2"><Icon name="check" size={16} color="#16A34A" /><span className="body-sm"><b style={{ color: "#16A34A" }}>Won 🎉</b> — sample approved and the project is closed. PO to follow.</span></div>
    </div>;
  }
  return null;
}

function SP04_Detail({ params, nav, role }) {
  window.useStore();
  const req = window.NaturisStore.get(params.reqId);
  const openFlags = req ? req.flags.filter(f => !f.resolved) : [];
  const [histOpen, setHistOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  if (!req) return <div className="card" style={{ textAlign: "center", padding: 48 }}>
    <Icon name="search" size={24} color="var(--brand-light)" />
    <div className="h3" style={{ marginTop: 8 }}>Requirement not found</div>
    <div className="body-sm" style={{ marginTop: 4 }}>It may have been removed, or the link is stale.</div>
    <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={() => nav("SP-03")}>Back to requirements</button>
  </div>;
  const awaitingApproval = req.status === "Dispatch awaiting SPOC approval";
  const alreadySent = req.status === "Sent to client";
  const { phases, current } = lifecyclePhases(req);

  return <div>
    <RaiseFlagDrawer open={flagOpen} onClose={() => setFlagOpen(false)} reqId={req.id} role={role || "spoc"} />
    <RulebookDrawer open={ruleOpen} onClose={() => setRuleOpen(false)} />
    <div className="row between" style={{ marginBottom: 6, alignItems: "flex-start" }}>
      <div>
        <div className="row gap-2" style={{ marginBottom: 8 }}>
          {req.vvip && <VVIPBadge size="md" />}
          <ProjectTypePill type={req.projectType} showLabel size="lg" />
          <span className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>{req.id}</span>
          <StatusPill status={req.status} />
          {req.labStage && <span className="pill pill-sm" style={{ background: "var(--lab-bg)", color: "var(--lab-fg)", fontWeight: 700 }}><Icon name="work" size={10} color="var(--lab-fg)" /> Lab: {req.labStage}</span>}
          <SLAIndicator req={req} mini={false} />
          <StartDate req={req} />
        </div>
        <div className="h1" style={{ fontSize: 34 }}><span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title}</div>
        <div className="body" style={{ color: "var(--muted)", marginTop: 2 }}>{req.category} · {req.base || "—"}</div>
      </div>
      <div className="row gap-2">
        <button className="btn btn-ghost" onClick={() => nav("SP-03")}><Icon name="arrowRight" size={14} style={{ transform: "rotate(180deg)" }} /> Back</button>
        <button className="btn btn-secondary" onClick={() => setRuleOpen(true)}><Icon name="book" size={15} /> Rulebook</button>
        <button className="btn btn-secondary" onClick={() => setFlagOpen(true)}><Icon name="flag" size={15} /> Raise flag</button>
        {awaitingApproval && <button className="btn" onClick={() => window.NaturisStore.sendToClient(req.id, "Hardik Shah")}><Icon name="dispatch" size={15} /> Approve & send to client</button>}
        {alreadySent && <span className="pill" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}><Icon name="check" size={12} color="var(--approved-fg)" /> Sent to client</span>}
      </div>
    </div>

    {/* 1 — PROGRESS BAR FIRST (with who/when) */}
    <div className="card" style={{ margin: "18px 0" }}>
      <SectionTitle sub="Requirement logged → manager review (if flagged) → lab → dispatch · every action stamped">Progress</SectionTitle>
      <ProgressTimeline req={req} />
    </div>

    <SpocActionCard req={req} />
    {req.labStage && <div className="card" style={{ borderTop: "3px solid var(--brand-accent)" }}>
      <SectionTitle sub="Live from the lab — updated by the lab technician as work progresses">Lab status</SectionTitle>
      <div className="col">
        {(window.NaturisData.LAB_LIVE_STAGES || []).map((st, si) => { const curIdx = (window.NaturisData.LAB_LIVE_STAGES || []).indexOf(req.labStage); const onSt = req.labStage === st; const doneSt = curIdx > si; const meta = (req.labStageLog || {})[st]; const reached = onSt || doneSt;
          return <div key={st} className="row gap-3" style={{ alignItems: "center", padding: "6px 4px", borderBottom: si < 9 ? "1px solid var(--border)" : "none", opacity: reached ? 1 : .5 }}>
            <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: onSt ? "var(--brand)" : doneSt ? "var(--approved-bg)" : "var(--page)", border: onSt ? "none" : "1px solid var(--border)" }}>
              {doneSt ? <Icon name="check" size={11} color="var(--approved-fg)" /> : onSt ? <span style={{ width: 6, height: 6, borderRadius: 999, background: "#fff" }} /> : <span className="body-sm" style={{ fontSize: 8.5, color: "var(--muted)" }}>{si + 1}</span>}</span>
            <span style={{ fontSize: 12.5, fontWeight: reached ? 700 : 500, color: onSt ? "var(--brand)" : "var(--ink)" }}>{st}</span>
            {onSt && <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand)", fontWeight: 700 }}>current</span>}
            <div className="grow" />
            {meta && <span className="body-sm" style={{ fontSize: 11, color: "var(--grey)" }}>{meta.at} · {meta.by}</span>}
          </div>; })}
      </div>
    </div>}
        {["Client approved", "In stability", "Won"].includes(req.status) && (() => {
          const ev = req.evaluation || {}; const del = req.deliverables || {}; const st = req.stability;
          const stabNeeded = ev.stabilityNeeded === "yes";
          const delRow = (l, d) => <div className="row between" style={{ padding: "8px 12px", borderRadius: 8, background: "var(--page)" }}>
            <span className="body-sm" style={{ fontSize: 12.5 }}>{l}</span>
            {d && d.done ? <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)", fontWeight: 700 }}><Icon name="check" size={10} color="var(--approved-fg)" /> Submitted{d.at && d.at !== "just now" ? " · " + d.at : ""}</span>
              : <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)", fontWeight: 700 }}>Pending with lab</span>}</div>;
          return <div className="card" style={{ borderTop: "3px solid var(--brand-accent)" }}>
            <SectionTitle sub="Read-only — the lab runs these after approval; you can see progress here">Stability & deliverables</SectionTitle>
            <div className="col gap-2">
              <div className="row between" style={{ padding: "8px 12px", borderRadius: 8, background: "var(--page)" }}>
                <span className="body-sm" style={{ fontSize: 12.5 }}>Stability / shelf-life</span>
                {!stabNeeded ? <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--muted)", fontWeight: 700 }}>Not required (lab verdict)</span>
                  : st ? <span className="pill pill-sm" style={{ background: st.status === "passed" ? "var(--approved-bg)" : "var(--review-bg)", color: st.status === "passed" ? "var(--approved-fg)" : "var(--review-fg)", fontWeight: 700 }}>{st.status === "passed" ? "Passed ✓" : st.months + "-mo · month " + st.month + "/" + st.months}</span>
                    : <span className="pill pill-sm" style={{ background: "var(--review-bg)", color: "var(--review-fg)", fontWeight: 700 }}>Required · not started</span>}</div>
              {delRow("Ingredient sheet", del.ingredient)}
              {delRow("Marketing brief", del.marketing)}
            </div>
          </div>; })()}
        {["Client approved", "In stability", "Won"].includes(req.status) && <PrePOChecklist req={req} role={role === "admin" ? "admin" : "spoc"} />}

    <div className="grid gap-4" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
      <div className="col gap-4">
        {/* 2 — ACTIVE FLAGS — resolve only AFTER the manager has replied */}
        {openFlags.length > 0 && <div className="card" style={{ borderLeft: "4px solid var(--coral)" }}>
          <SectionTitle sub="The manager replies first; resolve once you're satisfied with the solution">Active flags ({openFlags.length})</SectionTitle>
          <div className="col gap-2">
            {openFlags.map(f => <div key={f.id} style={{ background: "var(--coral-wash)", borderRadius: 10, padding: "12px 14px" }}>
              <div className="row gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>
                <Icon name="flag" size={15} color="var(--coral-dark)" />
                <b style={{ color: "var(--coral-dark)" }}>{f.typeLabel || f.type}</b>
                
                {f.owner && <span className="label" style={{ fontSize: 9 }}>→ {f.owner}</span>}
              </div>
              <div className="body-sm" style={{ fontSize: 12.5, marginTop: 4 }}>{f.text}</div>
              {f.solution ? <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff", borderRadius: 8 }}>
                <div className="label" style={{ fontSize: 9 }}>Manager solution — {f.resolvedBy}</div>
                <div className="body-sm" style={{ fontSize: 12.5 }}>{f.solution}</div>
                <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => window.NaturisStore.confirmResolve(req.id, f.id, "Hardik Shah")}><Icon name="check" size={13} /> Resolve flag (I'm satisfied)</button>
              </div> : <div className="body-sm" style={{ fontSize: 11.5, marginTop: 8, color: "var(--muted)" }}><Icon name="clock" size={11} /> Awaiting your manager's reply — you can resolve once they respond.</div>}
            </div>)}
          </div>
        </div>}

        {/* 3 — FULL REQUIREMENT (popup) */}
        <div className="card row between" style={{ alignItems: "center" }}>
          <div><div className="h3">Full requirement</div><div className="body-sm" style={{ fontSize: 12 }}>Everything captured at intake — brief, handoff, commercials, references.</div></div>
          <FullBriefButton req={req} />
        </div>

        {/* formulation codes + history */}
        <div className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="h3">Formulation codes</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setHistOpen(!histOpen)}><Icon name="history" size={14} /> History ({req.ncls.length})</button>
          </div>
          <div className="row gap-4">
            <div><div className="label" style={{ marginBottom: 6 }}>Base (NTL)</div>{req.ntl ? <FormulationCode code={req.ntl} size="lg" /> : <span className="body-sm">New development — no base</span>}</div>
            <Icon name="arrowRight" size={18} color="var(--muted)" />
            <div><div className="label" style={{ marginBottom: 6 }}>Current (NCL)</div><FormulationCode code={req.currentNcl} size="lg" /></div>
          </div>
          {histOpen && <div className="col gap-2" style={{ marginTop: 16 }}>
            {req.ncls.map((n, i) => <div key={i} className="row gap-3" style={{ padding: "8px 12px", borderRadius: 8, background: n.status === "current" ? "var(--brand-wash)" : "var(--page)" }}>
              <FormulationCode code={n.code} />
              <div style={{ flex: 1 }}><div className="body-sm" style={{ fontSize: 12.5, color: "var(--ink)" }}>{n.delta}</div>
                <div className="label" style={{ fontSize: 9 }}>{n.by} · {n.at}</div></div>
              {n.status === "current" && <span className="pill pill-sm" style={{ background: "var(--brand)", color: "#fff" }}>current</span>}
            </div>)}
            <div className="body-sm" style={{ fontSize: 11, marginTop: 4 }}>One thread — iterations version inside this record, never a new one.</div>
          </div>}
        </div>

        {/* 4 — COMMUNICATION LOG LAST */}
        <CommLog reqId={req.id} by="Hardik Shah" />
      </div>

      <div className="col gap-4">
        <div className="card">
          <div className="label" style={{ marginBottom: 10 }}>People</div>
          {(() => {
            const labEngaged = !["Logged", "Pending review", "Approved", "R&D assessing", "R&D assessed", "Returned to SPOC"].includes(req.status);
            const people = [["Sales SPOC", req.submittedBy], ["Sales Manager", "Kunal Shah"]];
            if (labEngaged) people.push(["Lab", req.tracker || "Sumit Choudhary"]);
            return people.map(([l, v]) => <div key={l} className="row between" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
              <span className="body-sm">{l}</span><span className="row gap-2"><Avatar name={v} size={22} /><span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span></span></div>);
          })()}
          {["Logged", "Pending review", "Approved", "R&D assessing", "R&D assessed", "Returned to SPOC"].includes(req.status) &&
            <div className="body-sm" style={{ fontSize: 11, marginTop: 8 }}>The lab tech appears here once they acknowledge.</div>}
        </div>
      </div>
    </div>
  </div>;
}

function ActivityMini({ reqId }) {
  const tl = (D.REQUIREMENT_TIMELINES[reqId] || []).slice(-4).reverse();
  if (!tl.length) return <div className="body-sm">No recent activity.</div>;
  return <div className="col">{tl.map((e, i) => <div key={i} className="row gap-2" style={{ padding: "6px 0", alignItems: "flex-start" }}>
    <Icon name={e.icon} size={14} color={e.severity === "high" ? "var(--coral)" : "var(--brand-light)"} style={{ marginTop: 2 }} />
    <div><div className="body-sm" style={{ fontSize: 12, color: "var(--ink)" }}>{e.detail}</div>
      <div className="label" style={{ fontSize: 9 }}>{e.actor} · {e.at}</div></div></div>)}</div>;
}

/* ====================================================================
   SP-07 · PIPELINE (kanban) — shared KanbanBoard
   ==================================================================== */
function KanbanBoard({ rows, onOpen, stages }) {
  const cols = stages || [
    { key: "review", label: "In review", match: r => ["Logged", "Pending review", "R&D assessing", "R&D assessed"].includes(r.status) },
    { key: "ack", label: "Acknowledged", match: r => ["Acknowledged", "In assessment (RM/PM/Slot)", "Accepted — date committed"].includes(r.status) },
    { key: "lab", label: "In lab", match: r => ["Formulation", "Trial", "QC", "Fill"].includes(r.status) },
    { key: "dispatch", label: "Dispatch", match: r => ["Ready for dispatch", "Dispatch awaiting SPOC approval"].includes(r.status) },
    { key: "sent", label: "Sent / done", match: r => ["Sent to client", "Archived"].includes(r.status) },
  ];
  return <div className="row gap-3" style={{ alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
    {cols.map(col => {
      const items = vvipSort(rows.filter(col.match));
      return <div key={col.key} style={{ minWidth: 250, flex: 1, background: "var(--page)", borderRadius: 12, padding: 10, border: "1px solid var(--border)" }}>
        <div className="row between" style={{ padding: "4px 6px 10px" }}>
          <span className="label">{col.label}</span>
          <span className="pill pill-sm" style={{ background: "var(--brand-tint)", color: "var(--brand-mid)" }}>{items.length}</span>
        </div>
        <div className="col gap-2">
          {items.map(r => <div key={r.id} onClick={() => onOpen(r)} className="card" style={{ padding: 12, cursor: "pointer", boxShadow: "var(--sh-sm)" }}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: 11 }}>{r.id}</span>
              {r.vvip && <VVIPBadge size="sm" />}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{r.title}</div>
            <div className="row between">
              <ProjectTypePill type={r.projectType} />
              <SLAIndicator req={r} />
            </div>
          </div>)}
          {!items.length && <div className="body-sm" style={{ textAlign: "center", padding: 16, fontSize: 12 }}>—</div>}
        </div>
      </div>;
    })}
  </div>;
}

function SP07_Pipeline({ nav }) {
  window.useStore();
  const rows = D.REQUIREMENTS.filter(r => r.status !== "Archived");
  // group by brand first, VVIP brands first
  const brands = [];
  window.vvipSort(rows).forEach(r => { if (!brands.includes(r.brand)) brands.push(r.brand); });
  return <div className="col gap-6">
    <PageHead title="Pipeline" sub="By brand → requirement · VVIP-first · SLA on every row" />
    {brands.map(brand => {
      const items = window.vvipSort(rows.filter(r => r.brand === brand));
      const anyVvip = items.some(r => r.vvip);
      return <div key={brand} className="card" style={{ padding: 0 }}>
        <div className="row between" style={{ padding: "14px 18px" }}>
          <div className="row gap-3">
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--brand-wash)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="brand" size={17} color="var(--brand)" /></div>
            <div><div className="h3">{brand}{anyVvip && <span style={{ marginLeft: 6 }}><VVIPStar /></span>}</div>
              <div className="body-sm" style={{ fontSize: 12 }}>{items.length} live requirement{items.length !== 1 ? "s" : ""}</div></div>
          </div>
        </div>
        <ReqTable rows={items} onOpen={r => nav("SP-04", { reqId: r.id })} cols={["id", "title", "type", "code", "status", "age"]} />
      </div>;
    })}
  </div>;
}

/* ====================================================================
   SP-09 · MY REPORTS
   ==================================================================== */
function ReportKPI({ label, value, suffix, delta, good }) {
  return <div className="card">
    <div className="label" style={{ marginBottom: 8 }}>{label}</div>
    <div className="row gap-2" style={{ alignItems: "baseline" }}>
      <span className="serif-num" style={{ fontSize: 30 }}>{value}</span>{suffix && <span className="body-sm">{suffix}</span>}
    </div>
    {delta && <div className="body-sm" style={{ fontSize: 12, marginTop: 4, color: good ? "var(--approved-fg)" : "var(--coral)" }}>{delta}</div>}
  </div>;
}

function SP09_Reports() {
  return <div className="col gap-5">
    <PageHead title="My Reports" sub="Your performance across all requirements"
      actions={<><select className="select" style={{ width: 150 }}><option>Last 90 days</option><option>This quarter</option></select><button className="btn btn-secondary"><Icon name="download" size={15} /> Export</button></>} />
    <div className="grid grid-4 gap-3">
      <ReportKPI label="Live / completed" value="12 / 38" delta="+4 vs last period" good />
      <ReportKPI label="NPD projects" value="5" suffix="active" />
      <ReportKPI label="Delays" value="2" delta="1 over SLA" />
      <ReportKPI label="SLA adherence" value="92" suffix="%" delta="+3%" good />
      <ReportKPI label="Conversion" value="68" suffix="%" delta="brief → approved" good />
      <ReportKPI label="Avg turnaround" value="18" suffix="days" delta="-2d" good />
      <ReportKPI label="Aging items" value="3" delta="past 30d" />
      <ReportKPI label="First-iteration success" value="61" suffix="%" />
    </div>
    <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
      <div className="card">
        <SectionTitle>Requirements by month</SectionTitle>
        <BarChart data={[{ label: "Feb", value: 5 }, { label: "Mar", value: 8 }, { label: "Apr", value: 6 }, { label: "May", value: 11 }, { label: "Jun", value: 4 }]} />
      </div>
      <div className="card">
        <SectionTitle>Project-type mix</SectionTitle>
        <div className="row gap-4" style={{ alignItems: "center" }}>
          <Donut segments={[{ value: 14, color: "var(--pt-epd-fg)" }, { value: 9, color: "var(--pt-ren-fg)" }, { value: 6, color: "var(--pt-tt-fg)" }, { value: 9, color: "var(--pt-npd-fg)" }]} />
          <div className="col gap-2">
            {[["EPD", "var(--pt-epd-fg)"], ["REN", "var(--pt-ren-fg)"], ["TT", "var(--pt-tt-fg)"], ["NPD", "var(--pt-npd-fg)"]].map(([l, c]) =>
              <div key={l} className="row gap-2"><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /><span className="body-sm" style={{ fontSize: 12 }}>{l}</span></div>)}
          </div>
        </div>
      </div>
    </div>
    <div className="card" style={{ background: "var(--brand-wash)", borderLeft: "3px solid var(--brand)" }}>
      <div className="row gap-2" style={{ marginBottom: 8 }}><Icon name="sparkle" size={16} color="var(--brand-accent)" /><span className="ai-eyebrow">Quality coaching · a suggestion, not a decision</span></div>
      <div className="body-sm" style={{ color: "var(--ink)" }}>Your NPD briefs average 2.3 iterations vs team 1.8. Capturing non-negotiables earlier (you fill them on 60% of intakes) could cut a cycle. Two aging items both stalled awaiting client PO — consider an earlier pricing checkpoint.</div>
    </div>
  </div>;
}

/* register */

/* ---------- FULL REQUIREMENT — button + popup (used across all roles) ---------- */
function FullBriefButton({ req, label }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="btn" style={{ background: "var(--grad-brand)", boxShadow: "0 4px 12px rgba(18,57,95,.22)", width: "fit-content" }} onClick={() => setOpen(true)}>
      <Icon name="note" size={15} /> {label || "View initial requirement"}</button>
    <RequirementPopup open={open} onClose={() => setOpen(false)} reqId={req.id} />
  </>;
}

/* ---------- PRE-PO CHECKLIST (bridge to the ERP — per 11 Jun meeting) ---------- */
function PrePOChecklist({ req, role }) {
  window.useStore();
  const items = window.NaturisData.PRE_PO_ITEMS;
  const p = req.prePO || {};
  const [costDraft, setCostDraft] = useState("");
  const done = items.filter(it => p[it[0]]).length;
  const complete = done === items.length;
  const canTick = it => (role === "spoc" && it[2] === "Sales SPOC") || (role === "lab" && it[2] === "Lab") || role === "admin";
  const me = role === "lab" ? (((window.NaturisData.LAB_DESKS || {})[req.projectType] || {}).tech || "Lab") : role === "admin" ? "Abhijit Jhala" : "Hardik Shah";
  return <div className="card" style={{ borderTop: complete ? "3px solid #D97706" : "3px solid var(--brand-accent)" }}>
    <div className="row between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      <div><div className="h3">Pre-PO checklist</div><div className="body-sm" style={{ fontSize: 12 }}>The bridge to the ERP — all five confirmed = customer-ready, awaiting PO.</div></div>
      {complete ? <span className="pill" style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#fff", fontWeight: 700 }}><Icon name="star" size={12} color="#fff" /> Customer-ready · PO awaited</span>
        : <span className="pill" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)", fontWeight: 700 }}>{done} / {items.length} confirmed</span>}
    </div>
    <div className="col gap-2">
      {items.map(it => { const [key, label, owner] = it; const on = !!p[key]; const mine = canTick(it);
        const isCost = key === "cost"; const doc = !!p[key + "Doc"];
        return <div key={key} className="row between" style={{ padding: "9px 12px", borderRadius: 8, background: on ? "var(--approved-bg)" : "var(--page)", gap: 10, flexWrap: "wrap" }}>
          <div className="row gap-2" style={{ minWidth: 0, alignItems: "center", flexWrap: "wrap" }}>
            <Icon name={on ? "check" : "clock"} size={14} color={on ? "var(--approved-fg)" : "var(--muted)"} />
            <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{label}</span>
            <span className="pill pill-sm" style={{ background: "var(--surface)", color: owner === "Lab" ? "var(--lab-fg)" : "var(--brand-mid)" }}>{owner}</span>
            {doc && <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--brand-mid)" }}><Icon name="note" size={10} color="var(--brand-mid)" /> doc attached</span>}
            {isCost && on && p.costValue && <span className="pill pill-sm" style={{ background: "var(--surface)", color: "var(--approved-fg)", fontWeight: 700 }}>{p.costValue}</span>}
          </div>
          <div className="row gap-2" style={{ alignItems: "center", flexShrink: 0 }}>
            {mine && !isCost && <button className="btn btn-sm btn-secondary" title={doc ? "Replace the attached document" : "Attach the " + label.toLowerCase()} onClick={() => window.NaturisStore.update(req.id, { prePO: Object.assign({}, p, { [key + "Doc"]: !doc }) })}><Icon name="upload" size={13} /> {doc ? "Replace" : "Upload"}</button>}
            {mine && isCost && !on && <input className="input mono" style={{ width: 180, height: 32, fontSize: 12.5 }} placeholder="e.g. ₹48 / unit" value={costDraft} onChange={e => setCostDraft(e.target.value)} />}
            {mine ? <button className={"btn btn-sm " + (on ? "btn-ghost" : "")} disabled={isCost && !on && !costDraft.trim()} title={isCost && !on ? "Type the final confirmed cost first" : undefined}
              onClick={() => { if (isCost && !on) { window.NaturisStore.update(req.id, { prePO: Object.assign({}, p, { costValue: costDraft.trim() }) }); setCostDraft(""); } window.NaturisStore.setPrePO(req.id, key, !on, me); }}>{on ? "Un-tick" : "Confirm"}</button>
              : <span className="body-sm" style={{ fontSize: 11 }}>{on ? "confirmed" : "with " + owner}</span>}
          </div>
        </div>; })}
    </div>
    {complete && <div className="body-sm" style={{ fontSize: 12, marginTop: 10, color: "var(--review-fg)" }}><Icon name="alert" size={12} color="var(--review-fg)" /> Everything is customer-approved but the PO hasn't landed — follow up with the client.</div>}
  </div>;
}

/* ---------- REQUIREMENT POPUP (centered modal: brief + timeline/history) ---------- */
function RequirementPopup({ open, onClose, reqId, tab: initialTab }) {
  window.useStore();
  const [tab, setTab] = useState(initialTab || "brief");
  useEffect(() => { setTab(initialTab || "brief"); }, [reqId, open]);
  const req = reqId ? window.NaturisStore.get(reqId) : null;
  if (!open || !req) return null;
  const openFlags = (req.flags || []).filter(f => !f.resolved);
  const queries = req.queries || [];
  return <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.35)", zIndex: 95 }} />
    <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      width: "min(1080px, 96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", background: "var(--surface)",
      borderRadius: 16, boxShadow: "0 24px 64px rgba(15,23,42,.3)", zIndex: 96, overflow: "hidden" }}>
      <div style={{ padding: "18px 24px 0", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="row between">
          <div>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              {req.vvip && <VVIPBadge size="sm" />}
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-mid)" }}>{req.id}</span>
              <ProjectTypePill type={req.projectType} />
              <StatusPill status={req.status} size="sm" />
              {req.labStage && <span className="pill pill-sm" style={{ background: "var(--lab-bg)", color: "var(--lab-fg)", fontWeight: 700 }}>Lab: {req.labStage}</span>}
              {openFlags.length > 0 && <span className="pill pill-sm" style={{ background: "var(--coral-wash)", color: "var(--coral-dark)" }}>
                <Icon name="flag" size={10} color="var(--coral-dark)" /> {openFlags.length} open flag{openFlags.length > 1 ? "s" : ""}</span>}
            </div>
            <div className="h2" style={{ fontSize: 20, marginTop: 6 }}><span style={{ color: "var(--brand-mid)" }}>{req.brand}</span> · {req.title}</div>
            <div className="body-sm" style={{ fontSize: 12.5 }}>{req.category} · {req.submittedBy}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="row gap-1" style={{ marginTop: 14 }}>
          {[["brief", "Initial requirement"], ["timeline", "Timeline & history"]].map(([v, l]) =>
            <button key={v} onClick={() => setTab(v)} style={{ border: "none", background: "transparent", cursor: "pointer",
              padding: "8px 14px", fontSize: 13, fontWeight: 600, fontFamily: "var(--f-ui)",
              color: tab === v ? "var(--brand)" : "var(--muted)",
              borderBottom: tab === v ? "2.5px solid var(--brand)" : "2.5px solid transparent" }}>{l}</button>)}
        </div>
      </div>
      <div style={{ overflowY: "auto", padding: 20 }} className="col gap-4">
        {tab === "brief" && <FullBrief req={req} defaultOpen bare />}
        {tab === "timeline" && <>
          {openFlags.length > 0 && <div className="card" style={{ border: "1px solid var(--coral)", background: "var(--coral-wash)" }}>
            <div className="label" style={{ color: "var(--coral-dark)", marginBottom: 8 }}>Open flags</div>
            {openFlags.map((f, i) => <div key={f.id || i} style={{ padding: "6px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.typeLabel || f.type}</div>
              <div className="body-sm" style={{ fontSize: 12 }}>{f.text} — {f.raisedBy} · {f.raisedAt || "recently"}</div>
            </div>)}
          </div>}
          {queries.length > 0 && <div className="card">
            <div className="label" style={{ marginBottom: 8 }}>Questions raised</div>
            {queries.map((q, i) => <div key={q.id || i} style={{ padding: "8px 0", borderBottom: i < queries.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="row gap-2"><Icon name="note" size={14} color="var(--review-fg)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{q.text}</span>
                <span className="pill pill-sm" style={{ background: q.resolved ? "var(--approved-bg)" : "var(--review-bg)", color: q.resolved ? "var(--approved-fg)" : "var(--review-fg)" }}>{q.resolved ? "answered" : "open"}</span></div>
              {q.answer && <div className="body-sm" style={{ fontSize: 12.5, marginTop: 4, paddingLeft: 22 }}>↳ {q.answer}</div>}
              <div className="label" style={{ fontSize: 8.5, marginTop: 3, paddingLeft: 22 }}>{q.at}</div>
            </div>)}
          </div>}
          {req.prePO && <div className="card" style={{ borderTop: "2px solid var(--brand-accent)" }}>
            <div className="label" style={{ marginBottom: 8 }}>Pre-PO checklist {Object.values(req.prePO).filter(Boolean).length}/{(window.NaturisData.PRE_PO_ITEMS || []).length}{req.prePOComplete ? " · customer-ready, PO awaited" : ""}</div>
            <div className="row gap-2 wrap">{(window.NaturisData.PRE_PO_ITEMS || []).map(([k, lbl]) => <span key={k} className="pill pill-sm" style={{ background: req.prePO[k] ? "var(--approved-bg)" : "var(--page)", color: req.prePO[k] ? "var(--approved-fg)" : "var(--muted)" }}>{req.prePO[k] ? "✓ " : "○ "}{lbl}</span>)}</div>
          </div>}
          <div className="card"><ProgressTimeline req={req} /></div>
        </>}
      </div>
    </div>
  </>;
}

Object.assign(window, { RequirementPopup, FullBriefButton, ConfirmBtn, PrePOChecklist, vvipSort, ReqTable, StageStepper, BarChart, Donut, KanbanBoard, ReportKPI, ActivityMini, RaiseFlagDrawer, RulebookDrawer, FLAG_OPTIONS, FullBrief, ProgressTimeline, lifecyclePhases });
Object.assign(window.SCREENS, {
  "SP-01": SP01_Dashboard, "SP-02": SP02_Intake, "SP-03": SP03_List,
  "SP-04": SP04_Detail, "SP-07": SP07_Pipeline, "SP-09": SP09_Reports,
});
