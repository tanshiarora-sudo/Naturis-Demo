/* ============================================================
   shared-v2.jsx — VVIPBadge, ProjectTypePill, FormulationCode,
   SLAIndicator, Toggle, CompatibilityNote, ProjectTypePicker.
   ============================================================ */

/* ---------- VVIP BADGE (gold; force-sorts top everywhere) ---------- */
function VVIPBadge({ size = "md", subtle }) {
  const dims = { sm: [20, 10], md: [22, 11], lg: [28, 12] }[size] || [22, 11];
  const base = {
    display: "inline-flex", alignItems: "center", gap: 4, height: dims[0],
    padding: `0 ${dims[0] / 2.4}px`, borderRadius: 999, fontSize: dims[1],
    fontWeight: 700, letterSpacing: ".04em", whiteSpace: "nowrap",
  };
  const style = subtle
    ? { ...base, background: "#FEF3C7", color: "#92400E" }
    : { ...base, background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#fff",
        boxShadow: "0 2px 6px rgba(217,119,6,.35)" };
  return <span style={style}>
    <Icon name="star" size={dims[1]} color={subtle ? "#92400E" : "#fff"} /> VVIP
  </span>;
}

/* ---------- PROJECT TYPE PILL ---------- */
const PT_COLOR = {
  EPD: ["var(--pt-epd-bg)", "var(--pt-epd-fg)"],
  REN: ["var(--pt-ren-bg)", "var(--pt-ren-fg)"],
  TT:  ["var(--pt-tt-bg)",  "var(--pt-tt-fg)"],
  NPD: ["var(--pt-npd-bg)", "var(--pt-npd-fg)"],
};
function ProjectTypePill({ type, size = "sm", showLabel }) {
  const [bg, fg] = PT_COLOR[type] || PT_COLOR.EPD;
  const dims = size === "lg" ? [28, 12] : [22, 10.5];
  const labels = { EPD: "Exact", REN: "Renovation", TT: "Tech Transfer", NPD: "New Dev" };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: dims[0],
    padding: `0 ${dims[0] / 2.6}px`, borderRadius: 6, background: bg, color: fg,
    fontSize: dims[1], fontWeight: 600 }}>
    <span className="mono" style={{ fontWeight: 700, fontSize: dims[1] }}>{type}</span>
    {showLabel && <span style={{ fontWeight: 500, fontFamily: "var(--f-ui)" }}>{labels[type]}</span>}
  </span>;
}

/* ---------- FORMULATION CODE (two-tone) ---------- */
function FormulationCode({ code, size = "md" }) {
  if (!code) return <span className="body-sm">—</span>;
  const isNCL = code.startsWith("NCL");
  const chipBg = isNCL ? "var(--ncl-chip)" : "var(--brand)";
  const bodyBg = isNCL ? "var(--ncl-body)" : "var(--brand-wash)";
  const bodyFg = isNCL ? "#5B21B6" : "var(--brand-mid)";
  const prefix = isNCL ? "NCL" : "NTL";
  const rest = code.slice(prefix.length).replace(/^-/, "");
  const h = size === "lg" ? 26 : 22;
  return <span style={{ display: "inline-flex", height: h, borderRadius: 6, overflow: "hidden",
    fontFamily: "var(--f-mono)", fontSize: size === "lg" ? 13 : 12, fontWeight: 600, border: "1px solid var(--border)" }}>
    <span style={{ background: chipBg, color: "#fff", padding: "0 7px", display: "flex", alignItems: "center" }}>{prefix}</span>
    <span style={{ background: bodyBg, color: bodyFg, padding: "0 8px", display: "flex", alignItems: "center" }}>{rest}</span>
  </span>;
}

/* ---------- SLA INDICATOR (computes from slaStatus) ---------- */
function SLAIndicator({ req, mini = true }) {
  const sla = window.NaturisData ? window.NaturisData.slaStatus(req) : { level: "na" };
  const map = {
    ok:    ["var(--approved-bg)", "var(--ok)", "On track"],
    amber: ["var(--review-bg)", "var(--review-fg)", "Due soon"],
    red:   ["var(--coral-wash)", "var(--coral-dark)", "Breached"],
    na:    ["var(--brand-wash)", "var(--muted)", "—"],
  };
  const [bg, fg] = map[sla.level] || map.na;
  let txt = sla.level === "red" ? `${sla.daysOver}d over`
    : sla.level === "amber" ? `${sla.daysLeft != null ? sla.daysLeft + "d left" : "due soon"}`
    : sla.level === "ok" ? (sla.daysLeft != null ? `${sla.daysLeft}d` : "ok") : "—";
  return <span className="sla-chip" style={{ background: bg, color: fg, height: mini ? 18 : 22 }}>
    {sla.level === "red" && <Icon name="alert" size={11} color={fg} />}
    {txt}
  </span>;
}

/* ---------- TOGGLE ---------- */
function Toggle({ on, onChange, size = "md", disabled }) {
  return <button type="button" disabled={disabled}
    className={"toggle" + (on ? " on" : "") + (size === "sm" ? " sm" : "")}
    onClick={() => !disabled && onChange(!on)} aria-pressed={on}
    style={{ opacity: disabled ? .5 : 1 }}>
    <span className="knob" />
  </button>;
}

/* ---------- COMPATIBILITY NOTE (rulebook warning) ---------- */
function CompatibilityNote({ severity = "warn", title, children }) {
  const styles = {
    warn: ["var(--review-bg)", "var(--review-fg)", "alert"],
    error: ["var(--coral-wash)", "var(--coral-dark)", "alert"],
    ok: ["var(--approved-bg)", "var(--ok)", "check"],
  }[severity];
  return <div style={{ background: styles[0], borderRadius: 8, padding: "10px 12px",
    display: "flex", gap: 10, alignItems: "flex-start" }}>
    <Icon name={styles[2]} size={16} color={styles[1]} style={{ marginTop: 2, flexShrink: 0 }} />
    <div>
      {title && <div style={{ fontSize: 12.5, fontWeight: 600, color: styles[1] }}>{title}</div>}
      <div className="body-sm" style={{ color: styles[1], fontSize: 12.5 }}>{children}</div>
    </div>
  </div>;
}

/* ---------- PROJECT TYPE PICKER (AI-assisted, conflict warning) ---------- */
function ProjectTypePicker({ value, onChange, aiSuggested, gateLocked }) {
  const PT = window.NaturisData ? window.NaturisData.PROJECT_TYPES : {};
  const order = ["EPD", "REN", "TT", "NPD"];
  return <div className="col gap-3">
    <div className="grid grid-4 gap-3">
      {order.map(code => {
        const t = PT[code] || {};
        const active = value === code;
        const [bg, fg] = PT_COLOR[code];
        const sugg = aiSuggested === code;
        return <button key={code} type="button" onClick={() => onChange(code)}
          style={{ textAlign: "left", border: active ? `2px solid ${fg}` : "1px solid var(--border)",
            borderRadius: 10, padding: "12px 14px", background: active ? bg : "var(--surface)",
            cursor: "pointer", position: "relative", transition: "all .15s" }}>
          {sugg && <span style={{ position: "absolute", top: 8, right: 8 }}>
            <Icon name="sparkle" size={13} color="var(--brand-accent)" /></span>}
          <div className="row gap-2"><ProjectTypePill type={code} /></div>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>{t.full || code}</div>
          <div className="body-sm" style={{ fontSize: 11.5, marginTop: 2 }}>{t.desc}</div>
          <div className="label" style={{ fontSize: 9, marginTop: 8 }}>
            {t.turnaround || ""} · gate {t.gate || "—"}
          </div>
        </button>;
      })}
    </div>
    {aiSuggested && value && aiSuggested !== value &&
      <CompatibilityNote severity="warn" title="Type conflict with AI suggestion">
        AI suggested <b>{aiSuggested}</b> from the brief; you selected <b>{value}</b>. Confirm this is intentional — a suggestion, not a decision.
      </CompatibilityNote>}
    {gateLocked && (value === "TT" || value === "NPD") &&
      <CompatibilityNote severity="ok" title="Manager gate required">
        {value} always routes to the Sales Manager for a decision. Flag-to-manager is auto-locked ON.
      </CompatibilityNote>}
  </div>;
}


/* ---------- FILTER TILES — consistent big-box filter selector ---------- */
function FilterTiles({ options, value, onChange, min }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min || 150}px, 1fr))`, gap: 8 }}>
    {options.map(o => { const on = value === o.key; const fg = o.fg || "var(--brand)";
      return <button key={o.key} onClick={() => onChange(o.key)} style={{ border: on ? "none" : "1px solid var(--border)", cursor: "pointer",
        borderRadius: 12, padding: "12px 12px", textAlign: "left", transition: "all .15s",
        background: on ? (o.grad || "var(--grad-brand)") : "var(--surface)", color: on ? "#fff" : "var(--ink)",
        boxShadow: on ? "0 6px 16px rgba(18,57,95,.22)" : "none" }}>
        {o.icon && <Icon name={o.icon} size={15} color={on ? "#fff" : fg} />}
        {o.count != null && <div className="serif-num" style={{ fontSize: 22, marginTop: o.icon ? 4 : 0 }}>{o.count}</div>}
        <div style={{ fontSize: o.count != null ? 10.5 : 12.5, fontWeight: 600, marginTop: 2, opacity: on ? .92 : .7, lineHeight: 1.25 }}>{o.label}</div>
        {o.sub && <div style={{ fontSize: 10, opacity: .65, marginTop: 1 }}>{o.sub}</div>}
      </button>; })}
  </div>;
}

/* ---------- LAB STATION BOOKING CALENDAR (2-week view) ---------- */
const CAL_STATIONS = [["Station 1", "Emulsion / cream"], ["Station 2", "Gel / serum"], ["Station 3", "SPF / hybrid"], ["Station 4", "Cleanser / wash"], ["Station 5", "Oil / balm"], ["Station 6", "Mask / leave-on"], ["Station 7", "Colour / lip"], ["Station 8", "Hair / scalp"]];
const CAL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
/* real-date booking horizon: week 1 = current week (Mon–Fri, or next Mon on weekends), week 2 = the week after */
const CAL_DATES = (() => {
  const now = new Date();
  const dow = now.getDay(); // 0 Sun … 6 Sat
  const mon = new Date(now);
  mon.setDate(now.getDate() + (dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow));
  const fmt = d => d.getDate() + " " + d.toLocaleString("en-GB", { month: "short" });
  const week = start => Array.from({ length: 5 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return fmt(d); });
  const mon2 = new Date(mon); mon2.setDate(mon.getDate() + 7);
  return { 1: week(mon), 2: week(mon2), today: fmt(now) };
})();
const CAL_TIMES = ["09:00", "11:00", "14:00", "16:00"];
function LabStationCalendar({ value, onChange, title, sub, readOnly }) {
  const [week, setWeek] = useState((value && value.week) || 1);
  const booked = (w, si, di, ti) => ((si * 7 + di * 5 + ti * 3 + w * 4) % 11) === 0;
  const sel = value || null;
  const isSel = (si, di, ti) => sel && sel.week === week && sel.si === si && sel.di === di && sel.ti === ti;
  return <div>
    <div className="row between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
      <div><div className="h3">{title || "Lab station booking"}</div>
        <div className="body-sm" style={{ fontSize: 12 }}>{sub || "8 stations · 3–4 products per station per day · FIFO with VVIP priority. Replaces the Excel-based scheduling."}</div></div>
      <div className="row gap-1" style={{ background: "var(--brand-wash)", padding: 4, borderRadius: 10 }}>
        {[1, 2].map(w => <button key={w} onClick={() => setWeek(w)} className="btn btn-sm" style={{ background: week === w ? "#fff" : "transparent", color: week === w ? "var(--brand)" : "var(--muted)", boxShadow: week === w ? "var(--sh-sm)" : "none", border: "none" }}>Week {w}</button>)}
      </div>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 3 }}>
        <thead>
          <tr><th></th>{CAL_DAYS.map((day, di) => <th key={day} colSpan={4} style={{ fontSize: 12.5, fontWeight: 600, color: (CAL_DATES[week] || [])[di] === CAL_DATES.today ? "var(--brand)" : "var(--muted)", padding: "2px 4px", textAlign: "left", borderBottom: (CAL_DATES[week] || [])[di] === CAL_DATES.today ? "2px solid var(--brand)" : "1px solid var(--border)" }}>{day} <span style={{ fontWeight: 500, color: (CAL_DATES[week] || [])[di] === CAL_DATES.today ? "var(--brand)" : "var(--grey)", fontSize: 11 }}>· {(CAL_DATES[week] || [])[di]}</span>{(CAL_DATES[week] || [])[di] === CAL_DATES.today && <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, color: "var(--brand)", letterSpacing: ".04em" }}>TODAY</span>}</th>)}</tr>
          <tr><th></th>{CAL_DAYS.map(day => CAL_TIMES.map(t => <th key={day + t} className="mono" style={{ fontSize: 9.5, fontWeight: 500, color: "var(--grey)", padding: "2px 0 6px", minWidth: 42 }}>{t}</th>))}</tr>
        </thead>
        <tbody>
          {CAL_STATIONS.map(([name, kind], si) => <tr key={name}>
            <td style={{ paddingRight: 14, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{name}</div>
              <div className="body-sm" style={{ fontSize: 11 }}>{kind}</div>
            </td>
            {CAL_DAYS.map((day, di) => CAL_TIMES.map((t, ti) => {
              const b = booked(week, si, di, ti), seld = isSel(si, di, ti);
              return <td key={day + t}>
                <button disabled={readOnly || (b && !seld)} onClick={() => !readOnly && onChange && onChange(seld ? null : { week, si, di, ti, label: name + " · " + kind.split(" /")[0] + " · " + day + " " + ((CAL_DATES[week] || [])[di] || "") + " · " + t })}
                  style={{ width: 44, height: 34, borderRadius: 8, border: "none", cursor: b ? "not-allowed" : "pointer",
                    background: seld ? "var(--brand)" : b ? "var(--rejected-bg)" : "var(--approved-bg)",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .1s" }}
                  onMouseEnter={e => { if (!b && !seld) e.currentTarget.style.transform = "scale(1.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
                  {seld && <Icon name="check" size={15} color="#fff" />}
                </button>
              </td>;
            }))}
          </tr>)}
        </tbody>
      </table>
    </div>
    <div className="row gap-4" style={{ marginTop: 12 }}>
      {[["var(--approved-bg)", "Available"], ["var(--brand)", "Your booking"], ["var(--rejected-bg)", "Booked"]].map(([c, l]) =>
        <span key={l} className="row gap-2" style={{ alignItems: "center" }}><span style={{ width: 16, height: 16, borderRadius: 5, background: c, display: "inline-block" }} /><span className="body-sm" style={{ fontSize: 12.5 }}>{l}</span></span>)}
    </div>
    {sel && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "var(--brand-wash)" }}>
      <span className="body-sm" style={{ fontSize: 13 }}><b style={{ color: "var(--brand)" }}>Booked:</b> {sel.label}</span></div>}
  </div>;
}

Object.assign(window, {
  FilterTiles, LabStationCalendar, VVIPBadge, ProjectTypePill, PT_COLOR, FormulationCode, SLAIndicator,
  Toggle, CompatibilityNote, ProjectTypePicker
});
