/* ============================================================
   shared.jsx — Icon set, StatusPill, AISuggestion, Drawer,
   Field, Stat, Avatar, Aging, StartDate, table primitives (Th/Td).
   Exports to window at file end.
   ============================================================ */
const { useState, useEffect, useRef, useMemo, createElement } = React;

/* ---------- ICON SET (inline stroke SVG, 1.6 stroke) ---------- */
function Icon({ name, size = 18, color = "currentColor", style }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round",
    style };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>,
    kanban: <><rect x="3" y="3" width="6" height="18" rx="1"/><rect x="10.5" y="3" width="6" height="12" rx="1"/><rect x="18" y="3" width="3" height="9" rx="1"/></>,
    report: <><path d="M4 4h16v16H4z"/><path d="M8 16v-4M12 16V8M16 16v-6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
    queue: <><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></>,
    team: <><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 3-5 6-5s6 1.7 6 5"/><circle cx="17.5" cy="9" r="2.6"/><path d="M16 14.5c3 .2 5 2 5 5.5"/></>,
    flag: <><path d="M5 21V4h12l-2 4 2 4H5"/></>,
    intel: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    overview: <><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/></>,
    brand: <><path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/></>,
    incoming: <><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    archive: <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></>,
    load: <><path d="M3 3v18h18"/><rect x="6" y="11" width="3" height="7"/><rect x="11" y="7" width="3" height="11"/><rect x="16" y="13" width="3" height="5"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14c3 0 5 2 5 5"/></>,
    groups: <><circle cx="12" cy="7" r="3"/><circle cx="5" cy="17" r="2.5"/><circle cx="19" cy="17" r="2.5"/><path d="M12 10v3M9 16l2-2M15 16l-2-2"/></>,
    accounts: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.4H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 6.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 3V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 .8 2.7H21a2 2 0 1 1 0 4z"/></>,
    chevron: <><polyline points="9 6 15 12 9 18"/></>,
    chevDown: <><polyline points="6 9 12 15 18 9"/></>,
    chevUp: <><polyline points="18 15 12 9 6 15"/></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x: <><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    search: <><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></>,
    star: <><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9"/></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></>,
    camera: <><path d="M4 7h3l2-2h6l2 2h3v13H4z"/><circle cx="12" cy="13" r="3.5"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
    phone: <><path d="M5 4h4l2 5-3 2a13 13 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2"/></>,
    note: <><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></>,
    sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></>,
    alert: <><path d="M12 3l9 16H3z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r=".6"/></>,
    dispatch: <><rect x="1" y="7" width="13" height="10" rx="1"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    moon: <><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z"/></>,
    sun: <><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></>,
    download: <><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/></>,
    edit: <><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M14 6l4 4"/></>,
    lily: <><path d="M12 2c1 3 3 4 3 7a3 3 0 0 1-6 0c0-3 2-4 3-7z"/><path d="M5 9c2 1 4 3 4 6 0 2-2 3-4 2s-2-5 0-8z"/><path d="M19 9c-2 1-4 3-4 6 0 2 2 3 4 2s2-5 0-8z"/><circle cx="12" cy="13" r="1.4"/></>,
  };
  return createElement("svg", p, paths[name] || paths.dashboard);
}

/* ---------- STATUS PILL ---------- */
// classify any status string -> attention/awaiting/progress/committed
const ATTENTION_STATES = ["Returned to SPOC","Returned — needs revision","Rejected","Dispatch awaiting SPOC approval","Needs revision","Flagged"];
const AWAITING_STATES = ["Pending review","Acknowledged","Awaiting","Awaiting lab meeting","Sent to client","Logged"];
const DONE_STATES = ["Approved","Accepted — date committed","Ready for dispatch","Sent","Archived","Committed"];

function statusKind(status) {
  if (!status) return "progress";
  const s = status.toLowerCase();
  if (s === "won") return "won";
  if (ATTENTION_STATES.some(x => s.includes(x.toLowerCase())) || s.includes("reject") || s.includes("return") || s.includes("overdue") || s.includes("breach")) return "attention";
  if (DONE_STATES.some(x => s.includes(x.toLowerCase())) || s.includes("approv") || s.includes("commit") || s.includes("archiv") || s.includes("sent")) return "committed";
  if (AWAITING_STATES.some(x => s.includes(x.toLowerCase())) || s.includes("await") || s.includes("pending") || s.includes("review")) return "awaiting";
  return "progress";
}
const KIND_STYLE = {
  attention: { bg: "var(--coral-wash)", fg: "var(--coral-dark)" },
  awaiting:  { bg: "var(--review-bg)",  fg: "var(--review-fg)" },
  progress:  { bg: "var(--brand-tint)", fg: "var(--brand-mid)" },
  committed: { bg: "var(--approved-bg)",fg: "var(--approved-fg)" },
  won:       { bg: "#16A34A",           fg: "#FFFFFF" },
  lab:       { bg: "var(--lab-bg)",     fg: "var(--lab-fg)" },
};
function StatusPill({ status, size, kind }) {
  const k = kind || (status && status.toLowerCase().includes("lab") ? "lab" : statusKind(status));
  const st = KIND_STYLE[k] || KIND_STYLE.progress;
  return <span className={"pill" + (size === "sm" ? " pill-sm" : "")}
    style={{ background: st.bg, color: st.fg }}>
    <span className="dot" /> {status}
  </span>;
}

/* ---------- AVATAR ---------- */
function Avatar({ name = "?", size = 30, color }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const palette = ["#1B4E80","#2D6FA0","#3F7D5B","#C08A2D","#B23E35","#6E86B8"];
  const hue = color || palette[(name.charCodeAt(0) || 0) % palette.length];
  return <div style={{ width: size, height: size, borderRadius: 999, background: hue,
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.38, fontWeight: 600, flexShrink: 0, fontFamily: "var(--f-ui)" }}>
    {initials}
  </div>;
}

/* ---------- STAT / KPI TILE ---------- */
function Stat({ label, value, sub, attention, onClick, suffix, color }) {
  return <div className={"kpi" + (attention ? " attention" : "")} onClick={onClick} role={onClick ? "button" : undefined}>
    {onClick && <span className="chev"><Icon name="chevron" size={15} /></span>}
    <div className="label" style={{ marginBottom: 8 }}>{label}</div>
    <div className="row gap-2" style={{ alignItems: "baseline" }}>
      <span className="serif-num" style={{ color: color || (attention ? "var(--coral)" : "var(--ink)") }}>{value}</span>
      {suffix && <span className="body-sm">{suffix}</span>}
    </div>
    {sub && <div className="body-sm" style={{ marginTop: 6 }}>{sub}</div>}
  </div>;
}

/* ---------- AGING ---------- */
function StartDate({ req }) {
  const d = ((req && req.submittedAt) || "").replace(" 2026", "");
  return <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap" }}>{d || "—"}</span>;
}
function Aging({ days, threshold = 7 }) {
  const over = days >= threshold;
  return <span className="mono" style={{ fontSize: 12, color: over ? "var(--coral)" : "var(--muted)",
    fontWeight: over ? 600 : 500 }}>
    {days}d{over ? " ●" : ""}
  </span>;
}

/* ---------- FIELD ---------- */
function Field({ label, required, children, hint, full }) {
  return <div className="field" style={{ gridColumn: full ? "1 / -1" : undefined }}>
    {label && <label className="field-label">{label}{required && <span className="req">*</span>}</label>}
    {children}
    {hint && <div className="body-sm" style={{ fontSize: 12 }}>{hint}</div>}
  </div>;
}

/* select that offers "+ Add custom…" terminal option */
function SmartSelect({ value, onChange, options, placeholder = "Select…" }) {
  const [custom, setCustom] = useState(false);
  if (custom) {
    return <input className="input" autoFocus placeholder="Type custom value…"
      value={value && !options.includes(value) ? value : ""}
      onChange={e => onChange(e.target.value)}
      onBlur={() => { if (!value) setCustom(false); }} />;
  }
  return <select className="select" value={options.includes(value) ? value : ""}
    onChange={e => { e.target.value === "__custom" ? setCustom(true) : onChange(e.target.value); }}>
    <option value="" disabled>{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
    <option value="__custom">+ Add custom…</option>
  </select>;
}

/* ---------- DRAWER ---------- */
function Drawer({ open, onClose, title, eyebrow, width = 620, children, footer }) {
  useEffect(() => {
    function esc(e) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open) return null;
  return <>
    <div className="scrim" onClick={onClose} />
    <div className="drawer" style={{ width, transform: "translateX(0)" }} onClick={e => e.stopPropagation()}>
      <div className="drawer-head">
        <div>
          {eyebrow && <div className="label" style={{ marginBottom: 4 }}>{eyebrow}</div>}
          <div className="h2" style={{ fontSize: 22 }}>{title}</div>
        </div>
        <button className="btn-ghost btn btn-sm" onClick={onClose} style={{ height: 32, width: 32, padding: 0 }}>
          <Icon name="x" size={18} />
        </button>
      </div>
      <div className="drawer-body">{children}</div>
      {footer && <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>{footer}</div>}
    </div>
  </>;
}

/* ---------- AI SUGGESTION (advisory only, never a green check) ---------- */
function AISuggestion({ track, code, score, rationale, similar = [], compact }) {
  return <div className="ai-suggest">
    <div className="row between">
      <div className="row gap-2">
        <Icon name="sparkle" size={15} color="var(--brand-accent)" />
        <span className="ai-eyebrow">AI · a suggestion, not a decision</span>
      </div>
      {score != null && <span className="mono" style={{ fontSize: 12, color: "var(--brand-mid)", fontWeight: 600 }}>{score}% match</span>}
    </div>
    {(track || code) && <div className="row gap-2" style={{ marginTop: 10 }}>
      {track && <span className="pill pill-sm" style={{ background: "#fff", color: "var(--brand-mid)", border: "1px solid var(--brand-tint)" }}>Track {track}</span>}
      {code && <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)" }}>{code}</span>}
    </div>}
    {rationale && <div className="body-sm" style={{ marginTop: 10, color: "var(--ink)", lineHeight: 1.5 }}>{rationale}</div>}
    {!compact && similar.length > 0 && <div style={{ marginTop: 10 }}>
      <div className="label" style={{ fontSize: 10, marginBottom: 6 }}>Similar work</div>
      <div className="row gap-2 wrap">
        {similar.map((s, i) => <span key={i} className="mono" style={{ fontSize: 11, padding: "3px 8px",
          background: "#fff", borderRadius: 6, color: "var(--brand-mid)", border: "1px solid var(--brand-tint)" }}>{s}</span>)}
      </div>
    </div>}
  </div>;
}

/* ---------- TABLE PRIMITIVES ---------- */
function Th({ children, style }) { return <th style={style}>{children}</th>; }
function Td({ children, mono, style }) {
  return <td style={Object.assign({ fontFamily: mono ? "var(--f-mono)" : undefined,
    fontSize: mono ? 12 : undefined }, style)}>{children}</td>;
}

/* ---------- SECTION HEADER ---------- */
function SectionTitle({ children, sub, action }) {
  return <div className="row between" style={{ marginBottom: 14 }}>
    <div>
      <div className="h3">{children}</div>
      {sub && <div className="body-sm">{sub}</div>}
    </div>
    {action}
  </div>;
}

/* ---------- SCORE RING (for intelligence / capacity) ---------- */
function Ring({ value, size = 64, stroke = 7, color = "var(--brand-accent)", label }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return <div style={{ position: "relative", width: size, height: size }}>
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--brand-wash)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset .6s" }} />
    </svg>
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center" }}>
      <span className="serif-num" style={{ fontSize: size * 0.3 }}>{value}</span>
      {label && <span className="label" style={{ fontSize: 8 }}>{label}</span>}
    </div>
  </div>;
}

/* ---------- NATURIS LOGO (lily mark + wordmark) ---------- */
function NaturisMark({ size = 40 }) {
  // official Naturis lily artwork (cropped, transparent)
  return <img src="lily.png" alt="Naturis" draggable="false"
    style={{ height: size * 1.16, width: "auto", display: "block", objectFit: "contain" }} />;
}
function NaturisLogo({ size = 30, stacked, onDark }) {
  return <div className="row" style={{ gap: 10, alignItems: "center" }}>
    <NaturisMark size={size * 1.25} />
    <div className="col" style={{ lineHeight: 1 }}>
      <span style={{ fontFamily: "var(--f-wordmark)", fontWeight: 600, fontSize: size, letterSpacing: ".14em",
        color: onDark ? "#fff" : "var(--brand)" }}>NATURIS</span>
      {stacked && <span style={{ fontFamily: "var(--f-ui)", fontSize: size * 0.34, letterSpacing: ".34em",
        color: "var(--grey)", marginTop: 2, textTransform: "lowercase" }}>cosmetics</span>}
    </div>
  </div>;
}

Object.assign(window, {
  Icon, StatusPill, statusKind, KIND_STYLE, Avatar, Stat, Aging, Field, SmartSelect,
  Drawer, AISuggestion, Th, Td, SectionTitle, Ring, NaturisMark, NaturisLogo,
  useState, useEffect, useRef, useMemo, createElement
});
