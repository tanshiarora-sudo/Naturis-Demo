/* ============================================================
   screen-admin.jsx — Platform Admin
   AD-04 Users · AD-05 Groups & access · AD-07 Accounts ·
   AD-08 Notif rules · GL-01 Notifications · GL-02 Profile · GL-03 Settings
   ============================================================ */
window.SCREENS = window.SCREENS || {};
const DA = window.NaturisData;

/* ====================================================================
   AD-04 · USERS
   ==================================================================== */
function AD04_Users() {
  const [edit, setEdit] = useState(null);
  const [invite, setInvite] = useState(false);
  return <div className="col gap-5">
    <PageHead title="Users" sub={`${DA.ADMIN_USERS.length} users · admin assigns region, group & reporting line`} actions={<button className="btn" onClick={() => setInvite(true)}><Icon name="plus" size={15} /> Invite user</button>} />
    <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Name</Th><Th>Emp ID</Th><Th>Role</Th><Th>Dept · Office</Th><Th>Region</Th><Th>Reports to</Th><Th>Status</Th><Th></Th></tr></thead>
      <tbody>{DA.ADMIN_USERS.map(u => <tr key={u.id} className="clickable" onClick={() => setEdit(u)}>
        <Td><span className="row gap-2"><Avatar name={u.name} size={26} /><div><div style={{ fontWeight: 600 }}>{u.name}</div><div className="body-sm" style={{ fontSize: 11 }}>{u.email}</div></div></span></Td>
        <Td mono>{u.empId}</Td>
        <Td>{u.role}</Td>
        <Td><div className="body-sm">{u.department}</div><div className="label" style={{ fontSize: 9 }}>{u.office}</div></Td>
        <Td>{u.role.includes("SPOC") ? <span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>{u.region}</span> : <span className="body-sm">{u.region}</span>}</Td>
        <Td>{u.reportsTo}</Td>
        <Td><span className="pill pill-sm" style={{ background: u.status === "active" ? "var(--approved-bg)" : "var(--review-bg)", color: u.status === "active" ? "var(--approved-fg)" : "var(--review-fg)" }}>{u.status === "active" ? "Enabled" : u.status}</span></Td>
        <Td><Icon name="edit" size={15} color="var(--muted)" /></Td></tr>)}</tbody></table></div>

    <Drawer open={!!edit || invite} onClose={() => { setEdit(null); setInvite(false); }} eyebrow={invite ? "New" : (edit?.empId || "Edit")} title={invite ? "Invite user" : (edit?.name || "")} width={480}
      footer={<div className="row end gap-2"><button className="btn btn-secondary" onClick={() => { setEdit(null); setInvite(false); }}>Cancel</button><button className="btn" onClick={() => { setEdit(null); setInvite(false); }}><Icon name="check" size={15} /> Save</button></div>}>
      <div className="col gap-3">
        <div className="grid grid-2 gap-3">
          <Field label="Employee ID"><input className="input" defaultValue={edit?.empId || ""} placeholder="NAT-…" /></Field>
          <Field label="Status"><select className="select" defaultValue={edit?.status}><option value="active">Enabled</option><option value="invited">Invited</option><option value="disabled">Disabled</option></select></Field>
        </div>
        <Field label="Full name"><input className="input" defaultValue={edit?.name || ""} /></Field>
        <div className="grid grid-2 gap-3">
          <Field label="Work email"><input className="input" defaultValue={edit?.email || ""} /></Field>
          <Field label="Phone"><input className="input" defaultValue={edit?.phone || ""} /></Field>
        </div>
        <div className="grid grid-2 gap-3">
          <Field label="Role"><select className="select" defaultValue={edit?.role}>{DA.ROLES.map(r => <option key={r.id}>{r.name}</option>)}</select></Field>
          <Field label="Group"><select className="select" defaultValue={edit?.group}>{DA.GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>
        </div>
        <div className="grid grid-2 gap-3">
          <Field label="Department"><input className="input" defaultValue={edit?.department || ""} /></Field>
          <Field label="Office"><input className="input" defaultValue={edit?.office || ""} /></Field>
        </div>
        <div className="grid grid-2 gap-3">
          <Field label="Region" hint="Admin-assigned (mainly for Sales SPOCs)"><select className="select" defaultValue={edit?.region}><option value="">—</option><option>All India</option>{DA.REGIONS.map(r => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Reporting line / manager"><input className="input" defaultValue={edit?.reportsTo || ""} /></Field>
        </div>
        <Field label="Brand map"><input className="input" defaultValue={(edit?.brands || []).join(", ")} /></Field>
        {edit && <CompatibilityNote severity="warn" title="Role change warning">Changing a role re-maps this user's permissions and nav immediately. Active assignments are preserved.</CompatibilityNote>}
      </div>
    </Drawer>
  </div>;
}

/* ====================================================================
   AD-09 · AUDIT LOG (immutable — override & system-data changes)
   ==================================================================== */
function AD09_Audit() {
  window.useStore();
  const [q, setQ] = useState("");
  const rows = window.NaturisStore.audit.filter(a => !q || `${a.actor} ${a.action} ${a.target} ${a.field}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="col gap-5">
    <PageHead title="Audit log" sub="Immutable — every override of a SPOC decision or change to system-generated data is recorded here."
      actions={<div style={{ position: "relative", width: 280 }}><span style={{ position: "absolute", left: 12, top: 11 }}><Icon name="search" size={16} color="var(--muted)" /></span><input className="input" style={{ paddingLeft: 36 }} placeholder="Search actor, action, target…" value={q} onChange={e => setQ(e.target.value)} /></div>} />
    <div style={{ background: "var(--brand-wash)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
      <Icon name="history" size={15} color="var(--brand-accent)" /><span className="body-sm">Records are append-only and cannot be edited or deleted — maintained by the Super Admin.</span></div>
    <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Target</Th><Th>Change</Th><Th>Note</Th></tr></thead>
      <tbody>{rows.map(a => <tr key={a.id}>
        <Td><span className="body-sm">{a.at}</span></Td>
        <Td><span className="row gap-2"><Avatar name={a.actor} size={22} /><div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.actor}</div><div className="label" style={{ fontSize: 8.5 }}>{a.role}</div></div></span></Td>
        <Td><span className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>{a.action}</span></Td>
        <Td mono>{a.target}</Td>
        <Td><span className="body-sm" style={{ fontSize: 12 }}>{a.field}: <span style={{ color: "var(--coral-dark)" }}>{a.before}</span> → <span style={{ color: "var(--approved-fg)", fontWeight: 600 }}>{a.after}</span></span></Td>
        <Td><span className="body-sm" style={{ fontSize: 12 }}>{a.note || "—"}</span></Td></tr>)}</tbody></table></div>
  </div>;
}

/* ====================================================================
   AD-05 · GROUPS & ACCESS (RBAC matrix)
   ==================================================================== */
function AD05_Groups() {
  const [sel, setSel] = useState(DA.GROUPS[0].id);
  const [dirty, setDirty] = useState(false);
  const group = DA.GROUPS.find(g => g.id === sel);
  return <div className="col gap-5">
    <PageHead title="Groups & access" sub="RBAC matrix · permission sections" />
    <div className="grid gap-4" style={{ gridTemplateColumns: "220px 1fr", alignItems: "start" }}>
      <div className="card" style={{ padding: 8 }}>{DA.GROUPS.map(g => <button key={g.id} onClick={() => setSel(g.id)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", background: sel === g.id ? "var(--brand-wash)" : "transparent", cursor: "pointer", marginBottom: 2 }}>
        <div style={{ fontWeight: sel === g.id ? 600 : 500, fontSize: 13, color: sel === g.id ? "var(--brand)" : "var(--ink)" }}>{g.name}</div><div className="body-sm" style={{ fontSize: 11 }}>{g.members} members</div></button>)}</div>
      <div className="card">
        <SectionTitle sub={`${group.members} members`}>{group.name} · permissions</SectionTitle>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Section</Th><Th>Actions</Th></tr></thead>
          <tbody>{DA.PERMISSION_SECTIONS.map(sec => {
            const have = group.perms[sec.id] || [];
            return <tr key={sec.id}><Td><span style={{ fontWeight: 600 }}>{sec.label}</span></Td>
              <Td><div className="row gap-2 wrap">{sec.actions.map(a => {
                const on = have.includes(a);
                return <button key={a} onClick={() => setDirty(true)} className="chip" style={{ cursor: "pointer", height: 24, fontSize: 11, background: on ? "var(--brand)" : "var(--page)", color: on ? "#fff" : "var(--muted)", border: on ? "none" : "1px solid var(--border)" }}>{on && <Icon name="check" size={11} color="#fff" />} {a}</button>;
              })}</div></Td></tr>;
          })}</tbody></table></div>
        <div className="body-sm" style={{ fontSize: 12, marginTop: 10, color: "var(--muted)" }}><Icon name="alert" size={12} /> Forbidden actions show a reason on hover for that group.</div>
      </div>
    </div>
    {dirty && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, boxShadow: "var(--sh-lg)", display: "flex", gap: 16, alignItems: "center", zIndex: 80 }}>
      <span style={{ fontSize: 13 }}>Unsaved permission changes</span><button className="btn btn-sm btn-secondary" onClick={() => setDirty(false)}>Discard</button><button className="btn btn-sm" onClick={() => setDirty(false)}>Save changes</button></div>}
  </div>;
}

/* ====================================================================
   AD-07 · ACCOUNTS (CRM + per-account notification routing)
   ==================================================================== */
function AD07_Accounts() {
  const [sel, setSel] = useState(DA.ACCOUNTS[0].id);
  const acc = DA.ACCOUNTS.find(a => a.id === sel);
  return <div className="col gap-5">
    <PageHead title="Accounts" sub="CRM profiles · per-account notification routing (≤ 5 users)" />
    <div className="grid gap-4" style={{ gridTemplateColumns: "240px 1fr", alignItems: "start" }}>
      <div className="card" style={{ padding: 8 }}>{DA.ACCOUNTS.map(a => <button key={a.id} onClick={() => setSel(a.id)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", background: sel === a.id ? "var(--brand-wash)" : "transparent", cursor: "pointer", marginBottom: 2 }}>
        <div className="row gap-2">{a.vvip && <Icon name="star" size={12} color="#D97706" />}<span style={{ fontWeight: sel === a.id ? 600 : 500, fontSize: 13 }}>{a.name}</span></div><div className="body-sm" style={{ fontSize: 11 }}>{a.segment}</div></button>)}</div>
      <div className="col gap-4">
        <div className="card"><SectionTitle sub={acc.website + " · " + acc.segment}>{acc.name}{acc.vvip && <span style={{ marginLeft: 6 }}><VVIPBadge size="sm" /></span>}</SectionTitle>
          <div className="grid grid-3 gap-3">{[["Avg order", acc.avgOrderValue], ["Rating", "★".repeat(acc.rating)], ["Product mix", acc.productMix.join(", ")]].map(([l, v]) => <div key={l}><div className="label">{l}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div></div>)}</div>
          <div className="label" style={{ margin: "14px 0 6px" }}>Strategic notes</div><div className="body-sm">{acc.strategicNotes}</div>
        </div>
        <div className="card"><SectionTitle sub="Role-aware · max 5 users">Notification routing</SectionTitle>
          {["Hardik Shah", "Kunal Shah", acc.vvip ? "Rahul Tandon (Mgmt)" : null].filter(Boolean).map(n => <div key={n} className="row between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span className="row gap-2"><Avatar name={n} size={24} /><span style={{ fontSize: 13 }}>{n}</span></span><Toggle on onChange={() => {}} size="sm" /></div>)}
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}><Icon name="plus" size={14} /> Add recipient</button>
        </div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   AD-08 · NOTIF RULES
   ==================================================================== */
function AD08_Rules() {
  const [rules, setRules] = useState(DA.NOTIFICATION_RULES);
  function toggle(id) { setRules(rs => rs.map(r => r.id === id ? { ...r, active: !r.active } : r)); }
  return <div className="col gap-5">
    <PageHead title="Notification rules" sub="All routing rules in one table" actions={<button className="btn"><Icon name="plus" size={15} /> New rule</button>} />
    <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Trigger</Th><Th>Account</Th><Th>Notifies</Th><Th>Channel</Th><Th>Enabled</Th></tr></thead>
      <tbody>{rules.map(r => <tr key={r.id}><Td><span style={{ fontWeight: 600 }}>{r.trigger}</span></Td><Td>{r.account}</Td>
        <Td><div className="row gap-1 wrap">{r.notify.map(n => <span key={n} className="pill pill-sm" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>{n}</span>)}</div></Td>
        <Td><span className="body-sm">{r.channel}</span></Td><Td><Toggle on={r.active} onChange={() => toggle(r.id)} size="sm" /></Td></tr>)}</tbody></table></div>
  </div>;
}

/* ====================================================================
   GL-01 · NOTIFICATIONS CENTRE
   ==================================================================== */
function GL01_Notifications({ nav }) {
  window.useStore();
  const typeIcon = { flag: "flag", vvip: "star", sla: "clock", dispatch: "dispatch", unresponsive: "phone", queue: "queue" };
  return <div className="col gap-5">
    <PageHead title="Notifications" sub="Every alert shows the rule + account that produced it" actions={<button className="btn btn-secondary btn-sm" onClick={() => window.NaturisStore.markAllRead()}>Mark all read</button>} />
    <div className="col gap-2">
      {DA.NOTIFICATIONS.map(n => <div key={n.id} className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start", background: n.read ? "var(--surface)" : "var(--brand-wash)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: n.severity === "high" ? "var(--coral-wash)" : "var(--brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={typeIcon[n.type] || "bell"} size={17} color={n.severity === "high" ? "var(--coral)" : "var(--brand-accent)"} /></div>
        <div style={{ flex: 1 }}>
          <div className="row between"><span style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</span><span className="label" style={{ fontSize: 9 }}>{n.at}</span></div>
          <div className="body-sm" style={{ fontSize: 12.5, marginTop: 2 }}>{n.body}</div>
          <div className="row gap-2" style={{ marginTop: 6 }}><span className="pill pill-sm" style={{ background: "var(--page)", color: "var(--muted)" }}>rule {n.rule}</span>{n.req && <span className="mono" style={{ fontSize: 11, color: "var(--brand-mid)", cursor: "pointer" }}>{n.req}</span>}</div>
        </div>
      </div>)}
    </div>
  </div>;
}

/* ====================================================================
   GL-02 · PROFILE (security + immutable activity log)
   ==================================================================== */
function GL02_Profile({ role }) {
  window.useStore();
  const r = DA.ROLES.find(x => x.id === role) || DA.ROLES[0];
  const p = DA.PROFILE_OF[role] || DA.PROFILE_OF.spoc;
  const roleKey = DA.PROFILE_OF[role] ? role : "spoc";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [savedMsg, setSavedMsg] = useState(false);
  const fileRef = useRef(null);
  function startEdit() { setDraft({ email: p.email, phone: p.phone, office: p.office }); setEditing(true); setSavedMsg(false); }
  function save() { window.NaturisStore.saveProfile(roleKey, draft, p.name); setEditing(false); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 3000); }
  function pickPhoto(e) { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { window.NaturisStore.saveProfile(roleKey, { photo: rd.result }, p.name); }; rd.readAsDataURL(f); }
  const log = [
    { at: "Today, 09:14", text: "Signed in", ip: "10.0.2.41" },
    { at: "Yesterday, 17:02", text: "Updated notification preferences", ip: "10.0.2.41" },
    { at: "3 Jun, 11:20", text: "Exported team report (PDF)", ip: "10.0.2.41" },
  ];
  const fields = [["Employee ID", p.empId, "user"], ["Work email", p.email, "mail"], ["Phone", p.phone, "phone"],
    ["Department", p.department, "groups"], ["Office", p.office, "brand"], ["Region", p.region, "intel"], ["Reporting manager", p.manager, "team"]];
  return <div className="col gap-5">
    <PageHead title="Profile" />
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.4fr", alignItems: "start" }}>
      <div className="card col gap-3" style={{ padding: 28, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          {p.photo ? <img src={p.photo} alt={p.name} style={{ width: 92, height: 92, borderRadius: 999, objectFit: "cover", border: "2px solid var(--border)" }} /> : <Avatar name={p.name} size={92} />}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickPhoto} />
          <button className="btn btn-secondary btn-sm" style={{ position: "absolute", right: -6, bottom: -6, padding: 6, borderRadius: 999 }} title="Change photo" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="camera" size={14} /></button>
        </div>
        <div style={{ textAlign: "center" }}><div className="h2" style={{ fontSize: 22 }}>{p.name}</div><div className="body-sm">{p.title}</div></div>
        <span className="pill" style={{ background: "var(--brand-wash)", color: "var(--brand-mid)" }}>{p.empId}</span>
        {!editing ? <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={startEdit}><Icon name="edit" size={13} /> Edit profile</button>
          : <div className="col gap-2" style={{ width: "100%" }}>
            <Field label="Work email"><input className="input" value={draft.email || ""} onChange={e => setDraft(x => ({ ...x, email: e.target.value }))} /></Field>
            <Field label="Phone"><input className="input" value={draft.phone || ""} onChange={e => setDraft(x => ({ ...x, phone: e.target.value }))} /></Field>
            <Field label="Office"><input className="input" value={draft.office || ""} onChange={e => setDraft(x => ({ ...x, office: e.target.value }))} /></Field>
            <div className="body-sm" style={{ fontSize: 11 }}>Region & reporting manager are admin-assigned.</div>
            <div className="row gap-2"><button className="btn btn-sm" style={{ flex: 1 }} onClick={save}><Icon name="check" size={13} /> Save</button><button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button></div>
          </div>}
        {savedMsg && <span className="pill pill-sm" style={{ background: "var(--approved-bg)", color: "var(--approved-fg)" }}>Profile saved ✓</span>}
      </div>
      <div className="col gap-4">
        <div className="card"><SectionTitle sub="Maintained with the admin">Details</SectionTitle>
          <div className="grid grid-2 gap-3">
            {fields.map(([l, v, ic]) => <div key={l} className="row gap-2" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--page)" }}>
              <Icon name={ic} size={15} color="var(--brand-light)" />
              <div style={{ minWidth: 0 }}><div className="label" style={{ fontSize: 8.5 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{v}</div></div></div>)}
          </div>
        </div>
        <div className="card"><SectionTitle>Security</SectionTitle>
          <div className="row between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}><span className="body-sm">Password</span><button className="btn btn-secondary btn-sm">Change</button></div>
          <div className="row between" style={{ padding: "8px 0" }}><span className="body-sm">Two-factor authentication</span><Toggle on onChange={() => {}} size="sm" /></div>
        </div>
        <div className="card"><SectionTitle sub="Immutable — audit trail">Activity log</SectionTitle>
          {log.map((l, i) => <div key={i} className="row gap-3" style={{ padding: "8px 0", borderBottom: i < log.length - 1 ? "1px solid var(--border)" : "none" }}>
            <Icon name="history" size={14} color="var(--brand-light)" style={{ marginTop: 2 }} /><div style={{ flex: 1 }}><div className="body-sm" style={{ fontSize: 12.5, color: "var(--ink)" }}>{l.text}</div><div className="label" style={{ fontSize: 9 }}>{l.at} · {l.ip}</div></div></div>)}
        </div>
      </div>
    </div>
  </div>;
}

/* ====================================================================
   GL-03 · SETTINGS
   ==================================================================== */
function GL03_Settings() {
  const [tab, setTab] = useState("sla");
  const [mailer, setMailer] = useState(false);
  return <div className="col gap-5">
    <PageHead title="Settings" />
    <div className="row gap-1" style={{ background: "var(--brand-wash)", padding: 4, borderRadius: 10, width: "fit-content" }}>
      {[["sla", "SLA matrix"], ["mailer", "Daily lab mailer"], ["ai", "AI thresholds"], ["email", "Email templates"]].map(([v, l]) =>
        <button key={v} onClick={() => setTab(v)} className="btn btn-sm" style={{ background: tab === v ? "#fff" : "transparent", color: tab === v ? "var(--brand)" : "var(--muted)", boxShadow: tab === v ? "var(--sh-sm)" : "none", border: "none" }}>{l}</button>)}
    </div>
    {tab === "sla" && <div className="card"><SectionTitle sub="Day budgets drive slaStatus() everywhere">SLA matrix editor</SectionTitle>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><Th>Type</Th><Th>Manager</Th><Th>R&D</Th><Th>Lab</Th><Th>Gate</Th></tr></thead>
        <tbody>{Object.values(DA.PROJECT_TYPES).map(t => <tr key={t.code}><Td><ProjectTypePill type={t.code} showLabel /></Td>
          {["manager", "rd", "lab"].map(k => <Td key={k}><input className="input" style={{ width: 64, height: 32 }} defaultValue={t.sla[k]} /></Td>)}
          <Td><span className="pill pill-sm" style={{ background: t.gate === "Required" ? "var(--review-bg)" : "var(--brand-wash)", color: t.gate === "Required" ? "var(--review-fg)" : "var(--brand-mid)" }}>{t.gate}</span></Td></tr>)}</tbody></table></div></div>}
    {tab === "mailer" && <div className="card"><SectionTitle>Daily lab mailer</SectionTitle>
      <div className="row between" style={{ padding: "8px 0" }}><div><div style={{ fontWeight: 600, fontSize: 13 }}>Send daily lab digest at 08:00</div><div className="body-sm" style={{ fontSize: 12 }}>To Lab Manager — incoming, aging, breaches</div></div><Toggle on={mailer} onChange={setMailer} /></div></div>}
    {tab === "ai" && <div className="card"><SectionTitle sub="AI is advisory — thresholds tune surfacing only">AI thresholds</SectionTitle>
      {[["Match confidence to surface", 60], ["Compatibility warning trigger", 75], ["Auto-flag aging (days)", 30]].map(([l, v]) => <div key={l} style={{ marginBottom: 14 }}>
        <div className="row between" style={{ marginBottom: 4 }}><span className="body-sm">{l}</span><span className="mono" style={{ fontWeight: 600 }}>{v}</span></div>
        <input type="range" defaultValue={v} max={100} style={{ width: "100%", accentColor: "var(--brand)" }} /></div>)}
      <CompatibilityNote severity="ok" title="Advisory only">AI never decides — it surfaces suggestions. No threshold turns AI into an auto-approver.</CompatibilityNote></div>}
    {tab === "email" && <div className="card"><SectionTitle>Email templates</SectionTitle>
      {["Requirement approved", "Dispatch ready for approval", "SLA breach alert", "VVIP logged"].map(t => <div key={t} className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontWeight: 500, fontSize: 13 }}>{t}</span><button className="btn btn-secondary btn-sm"><Icon name="edit" size={13} /> Edit</button></div>)}</div>}
  </div>;
}

/* ====================================================================
   AD-10 · SHIP-TO ADDRESS BOOK (dispatch directory)
   ==================================================================== */
function AD10_AddressBook() {
  window.useStore();
  const [q, setQ] = useState("");
  const all = DA.SHIP_ADDRESSES || [];
  const list = all.filter(s => !q || (s.client + " " + s.contact).toLowerCase().includes(q.toLowerCase()));
  return <div className="col gap-5">
    <PageHead title="Ship-to address book" sub="Dispatch directory · the Naturis lab is always the 'From'. Green = active, red = discarded."
      actions={<div style={{ position: "relative", width: 240 }}><span style={{ position: "absolute", left: 12, top: 11 }}><Icon name="search" size={16} color="var(--muted)" /></span><input className="input" style={{ paddingLeft: 36 }} placeholder="Search client…" value={q} onChange={e => setQ(e.target.value)} /></div>} />
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
      {list.map((s, i) => <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", opacity: s.status === "discarded" ? .6 : 1 }}>
        <div className="row between" style={{ padding: "9px 14px", background: s.status === "discarded" ? "var(--coral-wash)" : "var(--approved-bg)" }}>
          <span style={{ fontWeight: 700, fontSize: 13.5, color: s.status === "discarded" ? "var(--coral-dark)" : "var(--approved-fg)" }}>{s.client}</span>
          <span className="pill pill-sm" style={{ background: "var(--surface)", color: s.status === "discarded" ? "var(--coral-dark)" : "var(--approved-fg)", textTransform: "capitalize" }}>{s.status}</span>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div className="label" style={{ fontSize: 8 }}>To</div>
          <div className="body-sm" style={{ fontSize: 12.5, fontWeight: 600 }}>{s.contact}</div>
          {s.to.map((ln, k) => <div key={k} className="body-sm" style={{ fontSize: 11.5, color: "var(--muted)", textDecoration: s.status === "discarded" ? "line-through" : "none" }}>{ln}</div>)}
          <div className="label" style={{ fontSize: 8, marginTop: 8 }}>From</div>
          {(DA.NATURIS_LAB_ADDR || []).map((ln, k) => <div key={k} className="body-sm" style={{ fontSize: 10.5, color: "var(--grey)" }}>{ln}</div>)}
        </div>
      </div>)}
      {!list.length && <div className="body-sm">No clients match.</div>}
    </div>
  </div>;
}

Object.assign(window.SCREENS, {
  "AD-10": AD10_AddressBook, "AD-04": AD04_Users, "AD-05": AD05_Groups, "AD-07": AD07_Accounts, "AD-08": AD08_Rules, "AD-09": AD09_Audit,
  "GL-01": GL01_Notifications, "GL-02": GL02_Profile, "GL-03": GL03_Settings,
});
