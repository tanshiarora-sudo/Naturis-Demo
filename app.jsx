/* ============================================================
   app.jsx — Root: auth gate, role+screen state, body router,
   Tweaks panel, role switcher, notifications drawer.
   ============================================================ */

const DEFAULT_SCREEN = { spoc: "SP-01", manager: "SM-01", lab: "LB-01", labmgr: "LM-01", mgmt: "MG-01", admin: "GL-01" };

/* ---------- TWEAKS PANEL (Appearance · Theme) ---------- */
function TweaksPanel({ open, onClose, onThemeChange }) {
  const [tw, setTw] = useState(window.NaturisTweaks.get());
  function set(patch) { const next = window.NaturisTweaks.set(patch); setTw(next); onThemeChange && onThemeChange(next); }
  if (!open) return null;
  const themes = [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]];
  return <>
    <div className="scrim" onClick={onClose} />
    <div className="drawer" style={{ width: 380, transform: "translateX(0)" }}>
      <div className="drawer-head">
        <div><div className="label" style={{ marginBottom: 4 }}>Prototype</div><div className="h2" style={{ fontSize: 22 }}>Tweaks</div></div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 32, padding: 0 }}><Icon name="x" size={18} /></button>
      </div>
      <div className="drawer-body">
        <div className="label" style={{ marginBottom: 8 }}>Appearance · Theme</div>
        <div className="row gap-2" style={{ marginBottom: 20 }}>
          {themes.map(([v, l]) => <button key={v} onClick={() => set({ theme: v })}
            className={"btn btn-sm " + (tw.theme === v ? "" : "btn-secondary")} style={{ flex: 1 }}>
            {v === "dark" && <Icon name="moon" size={14} />} {l}
          </button>)}
        </div>
        <div className="body-sm" style={{ marginBottom: 24 }}>Management defaults to dark. Preference is persisted to this browser. Light is the base for all other roles.</div>
        <hr className="divider" style={{ margin: "8px 0 20px" }} />
        <div className="row between" style={{ marginBottom: 14 }}>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Reduce motion</div><div className="body-sm" style={{ fontSize: 12 }}>Honour prefers-reduced-motion</div></div>
          <Toggle on={tw.motion === "off"} onChange={v => set({ motion: v ? "off" : "on" })} />
        </div>
        <div className="body-sm" style={{ fontSize: 12, marginTop: 24, padding: 12, background: "var(--brand-wash)", borderRadius: 8 }}>
          This is a clickable prototype on mock data. All numbers, clients and formulations are fictional.
        </div>
      </div>
    </div>
  </>;
}

/* ---------- ROLE SWITCHER ---------- */
function RoleSwitcher({ open, current, onPick, onClose }) {
  if (!open) return null;
  return <>
    <div className="scrim" onClick={onClose} />
    <div style={{ position: "fixed", left: 16, bottom: 86, width: 300, background: "var(--surface)",
      borderRadius: 12, boxShadow: "var(--sh-lg)", border: "1px solid var(--border)", zIndex: 92, padding: 8 }}>
      <div className="label" style={{ padding: "8px 10px 4px" }}>Switch persona (demo)</div>
      {window.NaturisData.ROLES.map(r => <button key={r.id} onClick={() => onPick(r.id)}
        style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 8,
          border: "none", background: r.id === current ? "var(--brand-wash)" : "transparent", cursor: "pointer", textAlign: "left" }}>
        <Avatar name={r.person} size={30} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{r.name}</div>
          <div className="body-sm" style={{ fontSize: 11 }}>{r.desc}</div>
        </div>
        {r.id === current && <Icon name="check" size={16} color="var(--brand)" />}
      </button>)}
    </div>
  </>;
}

/* ---------- NOTIFICATIONS DRAWER (bell) ---------- */
function NotificationsDrawer({ open, onClose, onOpenReq }) {
  const D = window.NaturisData;
  if (!open) return null;
  const typeIcon = { flag: "flag", vvip: "star", sla: "clock", dispatch: "dispatch", unresponsive: "phone" };
  return <Drawer open={open} onClose={onClose} eyebrow="Feed" title="Notifications" width={460}>
    <div className="col gap-2">
      {D.NOTIFICATIONS.map(n => <div key={n.id} onClick={() => { n.req && onOpenReq(n.req); onClose(); }}
        style={{ padding: 14, borderRadius: 10, border: "1px solid var(--border)", cursor: n.req ? "pointer" : "default",
          background: n.read ? "var(--surface)" : "var(--brand-wash)", display: "flex", gap: 12 }}>
        <Icon name={typeIcon[n.type] || "bell"} size={18}
          color={n.severity === "high" ? "var(--coral)" : "var(--brand-accent)"} style={{ marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div className="row between"><div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
            {!n.read && <span className="dot" style={{ width: 8, height: 8, borderRadius: 999, background: "var(--coral)" }} />}</div>
          <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{n.body}</div>
          <div className="row gap-2" style={{ marginTop: 6 }}>
            <span className="label" style={{ fontSize: 9 }}>{n.at}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--brand-light)" }}>{n.rule}</span>
          </div>
        </div>
      </div>)}
    </div>
  </Drawer>;
}

/* ---------- ROOT APP ---------- */
function App() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("spoc");
  const [screen, setScreen] = useState("SP-01");
  const [params, setParams] = useState({});      // e.g. { reqId }
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [dark, setDark] = useState(window.NaturisTweaks.get().theme === "dark");
  window.useStore(); // re-render whole app when the requirement store changes

  // single source of truth for the dark class — covers portaled drawers/scrims too.
  // Every role uses the same theme; management is no longer forced dark.
  useEffect(() => {
    document.documentElement.classList.toggle("naturis-dark", dark && authed);
    document.body.classList.toggle("naturis-dark", dark && authed);
  }, [dark, authed]);

  function toggleTheme() { setDark(d => { window.NaturisTweaks.set({ theme: !d ? "dark" : "light" }); return !d; }); }
  function nav(screenId, p = {}) { setScreen(screenId); setParams(p); window.scrollTo(0, 0); }
  function switchRole(r) { setRole(r); setScreen(DEFAULT_SCREEN[r]); setParams({}); setSwitcherOpen(false); }
  function auth(r) { setRole(r); setScreen(DEFAULT_SCREEN[r]); setAuthed(true); }

  if (!authed) {
    return <LoginScreen onAuth={auth} />;
  }

  // route: look up registered screen component
  const SCREENS = window.SCREENS || {};
  const Comp = SCREENS[screen];
  const screenProps = { role, nav, params, dark };

  return <>
    <AppFrame role={role} screen={screen} dark={dark}
      onNav={nav}
      onSwitchRole={() => setSwitcherOpen(true)}
      onBell={() => setBellOpen(true)}
      onToggleTheme={toggleTheme}>
      {Comp ? <Comp {...screenProps} /> : <ComingSoon screen={screen} />}
    </AppFrame>

    <RoleSwitcher open={switcherOpen} current={role} onClose={() => setSwitcherOpen(false)} onPick={switchRole} />
    <NotificationsDrawer open={bellOpen} onClose={() => setBellOpen(false)}
      onOpenReq={(reqId) => { const target = role === "lab" || role === "labmgr" ? "LB-03" : role === "manager" ? "SM-03" : "SP-04"; nav(target, { reqId }); }} />
  </>;
}

function ComingSoon({ screen }) {
  return <div className="card" style={{ textAlign: "center", padding: 60 }}>
    <Icon name="sparkle" size={28} color="var(--brand-light)" />
    <div className="h2" style={{ fontSize: 22, marginTop: 12 }}>{window.SCREEN_TITLES[screen] || screen}</div>
    <div className="body-sm" style={{ marginTop: 6 }}>Screen <span className="mono">{screen}</span> is part of this build.</div>
  </div>;
}

Object.assign(window, { App, TweaksPanel, RoleSwitcher, NotificationsDrawer });

/* ---------- MOUNT ---------- */
const _root = ReactDOM.createRoot(document.getElementById("root"));
_root.render(<App />);
