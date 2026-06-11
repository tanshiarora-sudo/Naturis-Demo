/* ============================================================
   screen-auth.jsx — AUTH-01 modern SaaS sign-in
   Left: vivid gradient showcase + lily + tagline "From brief to batches".
   Right: clean white sign-in card with persona picker.
   ============================================================ */
function LoginScreen({ onAuth }) {
  const ROLES = window.NaturisData.ROLES;
  const [picked, setPicked] = useState("spoc");
  const [email, setEmail] = useState("hardik@naturis.co");
  const [pw, setPw] = useState("••••••••");
  function submit(e) { e && e.preventDefault(); onAuth(picked); }

  const FloatCard = ({ style, children }) => <div className="glass" style={{ position: "absolute",
    borderRadius: 14, padding: "12px 14px", boxShadow: "0 12px 40px rgba(8,20,40,.35)",
    border: "1px solid rgba(255,255,255,.35)", ...style }}>{children}</div>;

  return <div style={{ height: "100vh", display: "flex", overflow: "hidden", background: "#0A1526" }}>
    {/* LEFT — gradient showcase */}
    <div style={{ flex: "0 0 52%", position: "relative", overflow: "hidden",
      background: "radial-gradient(130% 130% at 20% 10%, #2D6FA0 0%, #1B4E80 38%, #12395F 70%, #0A1526 100%)" }}>
      {/* ambient orbs */}
      <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", top: -120, right: -120,
        background: "radial-gradient(circle, rgba(178,189,224,.35), rgba(178,189,224,0) 70%)" }} />
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", bottom: -80, left: -60,
        background: "radial-gradient(circle, rgba(204,82,72,.28), rgba(204,82,72,0) 70%)" }} />

      <div style={{ position: "relative", zIndex: 2, padding: "48px 56px", height: "100%", display: "flex", flexDirection: "column" }}>
        <NaturisLogo size={22} onDark />

        <div style={{ marginTop: "auto", marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 56, color: "#fff", lineHeight: 1.02, letterSpacing: "-.03em" }}>
            From brief<br />to batches.
          </div>
          <div style={{ color: "#C7D2EC", marginTop: 18, fontSize: 16, lineHeight: 1.6, maxWidth: 440 }}>
            One thread from a client conversation to a dispatched sample — intake, the lab-meeting gate, iterations and dispatch, all in one place. No parallel WhatsApp truth.
          </div>
          <div className="row gap-4" style={{ marginTop: 26 }}>
            {[["Brief", "Capture every requirement"], ["Lab", "RM · PM · Slot gate"], ["Batch", "Dispatch & track"]].map(([k, v], i) =>
              <div key={k} className="row gap-2" style={{ alignItems: "center" }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{i + 1}</div>
                <div><div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>{k}</div><div style={{ color: "#9FB2D4", fontSize: 11 }}>{v}</div></div>
              </div>)}
          </div>
        </div>

        {/* floating glass stat cards (3D-ish) */}
        <FloatCard style={{ top: 120, right: 70, transform: "rotate(-4deg)" }}>
          <div className="label" style={{ color: "#1B4E80", fontSize: 9 }}>Query → PO</div>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 26, color: "#12395F" }}>68%</div>
        </FloatCard>
        <FloatCard style={{ top: 210, right: 150, transform: "rotate(3deg)", padding: "10px 12px" }}>
          <div className="row gap-2"><NaturisMark size={22} /><div><div style={{ fontSize: 11, fontWeight: 700, color: "#12395F" }}>Lab meeting</div><div style={{ fontSize: 10, color: "#5A6470" }}>RM · PM · Slot ✓</div></div></div>
        </FloatCard>
      </div>
    </div>

    {/* RIGHT — sign-in */}
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "#fff" }}>
      <form onSubmit={submit} style={{ width: 380 }}>
        <div style={{ marginBottom: 26 }}><NaturisLogo size={20} stacked /></div>
        <div className="h1" style={{ fontSize: 30 }}>Welcome back</div>
        <div className="body-sm" style={{ marginBottom: 24, marginTop: 4 }}>Sign in to the Naturis sampling platform.</div>

        <Field label="Work email"><input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" /></Field>
        <div style={{ height: 14 }} />
        <Field label="Password"><input className="input" value={pw} onChange={e => setPw(e.target.value)} type="password" /></Field>

        <button className="btn btn-lg" style={{ width: "100%", marginTop: 20, background: "var(--grad-brand)" }} type="submit">
          Sign in as {ROLES.find(r => r.id === picked).name} <Icon name="arrowRight" size={16} color="#fff" />
        </button>

        <div className="label" style={{ marginTop: 26, marginBottom: 10 }}>Demo · choose a persona</div>
        <div className="grid grid-2 gap-2">
          {ROLES.map(r => {
            const active = picked === r.id;
            return <button type="button" key={r.id} onClick={() => setPicked(r.id)}
              style={{ textAlign: "left", border: active ? "2px solid var(--brand)" : "1px solid var(--border)",
                borderRadius: 10, padding: "9px 11px", background: active ? "var(--brand-wash)" : "#fff", cursor: "pointer",
                display: "flex", gap: 9, alignItems: "center" }}>
              <Avatar name={r.person} size={28} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                <div className="body-sm" style={{ fontSize: 10.5 }}>{r.person}</div>
              </div>
            </button>;
          })}
        </div>
        <div className="body-sm" style={{ fontSize: 11, marginTop: 14 }}>Personas switch the whole app — nav, screens and permissions follow the role.</div>
      </form>
    </div>
  </div>;
}

Object.assign(window, { LoginScreen });
