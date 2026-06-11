/* ============================================================
   layout.jsx — Sidebar, TopBar, AppFrame, NAV map (role → screens)
   ============================================================ */

/* NAV MAP — id · label · icon. (b) = carries coral count badge */
const NAV = {
  spoc: [
    { id: "SP-01", label: "Dashboard", icon: "dashboard" },
    { id: "SP-03", label: "Requirements", icon: "list" },
    { id: "SP-09", label: "My Reports", icon: "report" },
    { id: "GL-02", label: "My Profile", icon: "user" },
  ],
  manager: [
    { id: "SM-01", label: "Dashboard", icon: "dashboard" },
    { id: "SM-02", label: "Review desk", icon: "queue", badge: true },
    { id: "SM-LIVE", label: "Live requirements", icon: "list" },
    { id: "CI-01", label: "Client intelligence", icon: "intel" },
    { id: "SM-PIPE", label: "Team pipeline", icon: "team" },
    { id: "GL-02", label: "Profile", icon: "user" },
  ],
  lab: [
    { id: "LB-01", label: "Dashboard", icon: "dashboard" },
    { id: "LB-02", label: "New requirements", icon: "incoming", badge: true },
    { id: "LB-EVAL", label: "Evaluation", icon: "queue", badge: true },
    { id: "LB-03", label: "Work in progress", icon: "work" },
  ],
  labmgr: [
    { id: "LM-01", label: "Dashboard", icon: "dashboard" },
    { id: "LM-02", label: "Daily lab meeting", icon: "calendar", badge: true },
    { id: "LM-03", label: "Planning & load", icon: "load" },
    { id: "LB-03", label: "Live work", icon: "work" },
    { id: "LM-04", label: "Reports", icon: "report" },
    { id: "LB-05", label: "Approved projects", icon: "archive" },
  ],
  mgmt: [
    { id: "MG-01", label: "Overview", icon: "overview" },
    { id: "MG-02", label: "Brands", icon: "brand" },
    { id: "MG-04", label: "Master tracker", icon: "list" },
    { id: "MG-03", label: "Intelligence reports", icon: "report" },
    { id: "CI-01", label: "Client intelligence", icon: "intel" },
  ],
  admin: [
    { id: "GL-01", label: "Notifications", icon: "bell", badge: true },
    { id: "AD-04", label: "Users", icon: "users" },
    { id: "AD-05", label: "Groups", icon: "groups" },
    { id: "AD-07", label: "Accounts", icon: "accounts" },
    { id: "AD-09", label: "Audit log", icon: "history" },
    { id: "AD-08", label: "Notif rules", icon: "settings" },
    { id: "GL-03", label: "Settings", icon: "settings" },
    { id: "GL-02", label: "Profile", icon: "user" },
  ],
};

/* breadcrumb titles per screen id */
const SCREEN_TITLES = {
  "SP-01": "Dashboard", "SP-02": "New requirement", "SP-03": "Requirements",
  "SP-04": "Requirement", "SP-07": "Live requirements", "SP-09": "My Reports",
  "SM-01": "Dashboard", "SM-02": "Review desk", "SM-03": "Review", "SM-04": "Team pipeline",
  "SM-05": "Flag review", "SM-06": "Team reports", "SM-LIVE": "Live requirements", "SM-PIPE": "Team pipeline", "CI-01": "Client intelligence",
  "LB-01": "Dashboard", "LB-02": "New requirements", "LB-EVAL": "Evaluation", "LB-03": "Work in progress", "LB-05": "Approved projects",
  "LM-01": "Dashboard", "LM-02": "Daily lab meeting", "LM-03": "Planning & load", "LM-04": "Reports",
  "MG-01": "Command centre", "MG-02": "Brands", "MG-03": "Intelligence reports", "MG-04": "Master tracker",
  "GL-01": "Notifications", "AD-04": "Users", "AD-05": "Groups & access", "AD-07": "Accounts",
  "AD-08": "Notification rules", "AD-09": "Audit log", "GL-03": "Settings", "GL-02": "Profile",
};

/* count of attention items per role, for badges */
function attentionCount(role, screen) {
  const D = window.NaturisData;
  if (!D) return 0;
  const R = D.REQUIREMENTS;
  if (role === "manager") return R.filter(r => r.status === "Pending review").length + R.filter(r => r.flags.some(f => !f.resolved)).length;
  if (role === "lab") {
    if (screen === "LB-EVAL") return R.filter(r => ["Acknowledged", "In evaluation"].includes(r.status)).length;
    return R.filter(r => ["Approved", "R&D assessed", "R&D assessing", "Logged"].includes(r.status)).length; // LB-02 incoming
  }
  if (role === "labmgr") return R.filter(r => ["Approved","R&D assessed","R&D assessing","Acknowledged","In evaluation"].includes(r.status) || (r.queries||[]).some(q=>!q.resolved) || ["Declined","Rejected"].includes(r.status)).length + R.reduce((n, r) => n + (r.flags||[]).filter(f => !f.resolved && /Lab/.test(f.owner || "")).length, 0);
  if (role === "admin") return D.NOTIFICATIONS.filter(n => !n.read).length;
  return 0;
}

/* ---------- SIDEBAR ---------- */
function Sidebar({ role, screen, onNav, onSwitchRole }) {
  const items = NAV[role] || [];
  const roleObj = window.NaturisData.ROLES.find(r => r.id === role);
  return <aside style={{ width: 240, background: "var(--sidebar)", borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" }}>
    {/* brand mark */}
    <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
      <NaturisLogo size={19} stacked />
    </div>
    {/* nav */}
    <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
      {items.map(it => {
        const active = it.id === screen;
        const count = it.badge ? attentionCount(role, it.id) : 0;
        return <button key={it.id + it.label} onClick={() => onNav(it.id)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, height: 38, padding: "0 10px",
            borderRadius: 8, border: "none", background: active ? "var(--brand-wash)" : "transparent",
            color: active ? "var(--brand)" : "var(--muted)", fontWeight: active ? 600 : 500, fontSize: 13.5,
            cursor: "pointer", marginBottom: 2, textAlign: "left", fontFamily: "var(--f-ui)" }}>
          <Icon name={it.icon} size={18} color={active ? "var(--brand)" : "var(--muted)"} />
          <span style={{ flex: 1 }}>{it.label}</span>
          {count > 0 && <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999,
            background: "var(--coral)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex",
            alignItems: "center", justifyContent: "center" }}>{count}</span>}
        </button>;
      })}
    </nav>
    {/* role switcher (demo) */}
    <div style={{ borderTop: "1px solid var(--border)", padding: 12 }}>
      <div className="label" style={{ fontSize: 8.5, marginBottom: 6, paddingLeft: 4 }}>Demo · switch persona</div>
      <button onClick={onSwitchRole} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)",
        cursor: "pointer" }}>
        <Avatar name={roleObj.person} size={32} />
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{roleObj.person}</div>
          <div className="body-sm" style={{ fontSize: 11 }}>{roleObj.name}</div>
        </div>
        <Icon name="chevDown" size={15} color="var(--muted)" />
      </button>
    </div>
  </aside>;
}

/* ---------- TOP BAR ---------- */
function TopBar({ role, screen, onNav, onBell, dark, onToggleTheme }) {
  const D = window.NaturisData;
  const roleObj = D.ROLES.find(r => r.id === role);
  const unread = D.NOTIFICATIONS.filter(n => !n.read).length;
  const title = SCREEN_TITLES[screen] || screen;
  return <header style={{ height: 60, background: "var(--surface)", borderBottom: "1px solid var(--border)",
    padding: "0 28px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="body-sm" style={{ fontSize: 12.5 }}>{roleObj.name}</span>
      <Icon name="chevron" size={13} color="var(--border-strong)" />
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{title}</span>
    </div>
    <div style={{ flex: 1 }} />
    <button onClick={onToggleTheme} title={dark ? "Switch to light" : "Switch to dark"}
      style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      <Icon name={dark ? "sun" : "moon"} size={17} color="var(--muted)" />
    </button>
    <button onClick={onBell} style={{ position: "relative", width: 38, height: 38, borderRadius: 8,
      border: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer" }}>
      <Icon name="bell" size={18} color="var(--muted)" />
      {unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16,
        padding: "0 4px", borderRadius: 999, background: "var(--coral)", color: "#fff", fontSize: 10,
        fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
    </button>
    <Avatar name={roleObj.person} size={36} />
  </header>;
}

/* ---------- APP FRAME ---------- */
function AppFrame({ role, screen, onNav, onSwitchRole, onBell, dark, onToggleTheme, children }) {
  return <div className={"row" + (dark ? " naturis-dark" : "")} style={{ height: "100vh", background: "var(--grad-page)", alignItems: "stretch" }}>
    <Sidebar role={role} screen={screen} onNav={onNav} onSwitchRole={onSwitchRole} />
    <div className="col grow" style={{ height: "100vh", overflow: "hidden" }}>
      <TopBar role={role} screen={screen} onNav={onNav} onBell={onBell} dark={dark} onToggleTheme={onToggleTheme} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "var(--page-pad)", maxWidth: "var(--content-max)", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  </div>;
}

/* ---------- PAGE HEADER (serif greeting / title row) ---------- */
function PageHead({ title, sub, actions, serif }) {
  return <div className="row between" style={{ marginBottom: 24, alignItems: "flex-end" }}>
    <div>
      <div className={serif ? "h1" : "h2"} style={!serif ? { fontSize: 24 } : undefined}>{title}</div>
      {sub && <div className="body" style={{ color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
    {actions && <div className="row gap-2">{actions}</div>}
  </div>;
}

Object.assign(window, { NAV, SCREEN_TITLES, attentionCount, Sidebar, TopBar, AppFrame, PageHead });
