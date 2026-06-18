/* ============================================================
   data.jsx — all mock data on window.NaturisData.
   The Requirement object is the spine; everything references it.
   slaStatus() helper lives here.
   ============================================================ */

/* ---------- ROLES (6, incl. labmgr) ---------- */
const ROLES = [
  { id: "spoc",    name: "Sales SPOC",     person: "Hardik Shah",     desc: "Owns client intake & relationship", initials: "HS" },
  { id: "manager", name: "Sales Manager",  person: "Kunal Shah",      desc: "Reviews, routes, owns the gate",     initials: "KS" },
  { id: "lab",     name: "Lab Technician", person: "Sumit Choudhary", desc: "Acknowledges & runs the bench",      initials: "SC" },
  { id: "labmgr",  name: "Lab Manager",    person: "Dipti OV",        desc: "Runs the daily lab-meeting gate",    initials: "DO" },
  { id: "mgmt",    name: "Management",     person: "Rahul Tandon",    desc: "Command centre & intelligence",      initials: "RT" },
  { id: "planner", name: "Lab Planner",    person: "Asha Rane",       desc: "Books lab stations · owns the slot board", initials: "AR" },
  { id: "admin",   name: "Super Admin",    person: "Abhijit Jhala",   desc: "Users, groups, rulebook, routing",   initials: "AJ" },
];

/* ---------- PROJECT TYPES & MANAGER GATE ---------- */
const PROJECT_TYPES = {
  EPD: { code: "EPD", label: "Exact",        full: "Exact Product Duplication", desc: "Exact reuse of an existing formula", turnaround: "2–3 wk", gate: "FYI", sla: { manager: 2, rd: 1, lab: 5 } },
  REN: { code: "REN", label: "Renovation",   full: "Renovation",                desc: "Existing formula, 1–2 modifications", turnaround: "3–5 wk", gate: "FYI", sla: { manager: 2, rd: 2, lab: 10 } },
  TT:  { code: "TT",  label: "Tech Transfer",full: "Technology Transfer",       desc: "Client brings their own formula",     turnaround: "5–7 wk", gate: "Required", sla: { manager: 3, rd: 5, lab: 15 } },
  NPD: { code: "NPD", label: "New Dev",      full: "New Product Development",    desc: "Full new development from brief",      turnaround: "7–10 wk", gate: "Required", sla: { manager: 3, rd: 7, lab: 21 } },
};
const SLA_MATRIX = Object.fromEntries(Object.entries(PROJECT_TYPES).map(([k, v]) => [k, v.sla]));

/* ---------- FLAG TYPES (12) ---------- */
const FLAG_TYPE_COLOR = {
  sla: "var(--coral)", aging: "var(--review-fg)", dissatisfaction: "var(--coral-dark)",
  unresponsive: "var(--review-fg)", manual: "var(--brand-accent)", quality: "var(--coral)",
  compat: "var(--review-fg)", material: "var(--coral-dark)", scope: "var(--brand-mid)",
  pricing: "var(--review-fg)", compliance: "var(--coral)", capacity: "var(--review-fg)", budget: "var(--review-fg)",
};
const FLAG_TYPES = [
  { code: "sla",            label: "SLA breach",        roles: ["manager","labmgr"], defaultNotify: ["manager"] },
  { code: "aging",          label: "Aging",             roles: ["manager"],          defaultNotify: ["manager"] },
  { code: "dissatisfaction",label: "Client dissatisfaction", roles: ["spoc","manager"], defaultNotify: ["manager","mgmt"] },
  { code: "unresponsive",   label: "Unresponsive SPOC", roles: ["manager"],          defaultNotify: ["manager"] },
  { code: "manual",         label: "Manual flag",       roles: ["spoc","manager","lab","labmgr"], defaultNotify: ["manager"] },
  { code: "quality",        label: "Quality concern",   roles: ["lab","labmgr"],     defaultNotify: ["labmgr","manager"] },
  { code: "compat",         label: "Compatibility",     roles: ["lab","labmgr"],     defaultNotify: ["spoc","labmgr"] },
  { code: "material",       label: "Material short",    roles: ["lab","labmgr"],     defaultNotify: ["labmgr"] },
  { code: "scope",          label: "Scope change",      roles: ["spoc","manager"],   defaultNotify: ["manager"] },
  { code: "pricing",        label: "Pricing",           roles: ["spoc","manager"],   defaultNotify: ["manager","mgmt"] },
  { code: "compliance",     label: "Compliance",        roles: ["manager","labmgr"], defaultNotify: ["manager","mgmt"] },
  { code: "capacity",       label: "Capacity",          roles: ["labmgr"],           defaultNotify: ["labmgr"] },
];

/* ---------- NTL LIBRARY ---------- */
const NTL_LIBRARY = [
  { code: "NTL-SR-014", name: "Hydra Serum Base",      base: "Aqueous gel",     category: "Serum",      maintainer: "Dipti OV" },
  { code: "NTL-CR-006", name: "Rich Cream Base",       base: "O/W emulsion",    category: "Cream",      maintainer: "Dipti OV" },
  { code: "NTL-CL-022", name: "Gentle Cleanser Base",  base: "Surfactant blend",category: "Cleanser",   maintainer: "Sumit Choudhary" },
  { code: "NTL-LP-009", name: "Velvet Lip Base",       base: "Anhydrous",       category: "Lip",        maintainer: "Sumit Choudhary" },
  { code: "NTL-SN-031", name: "Mineral Sun Base",      base: "Hybrid emulsion", category: "Sun Care",   maintainer: "Dipti OV" },
  { code: "NTL-HC-018", name: "Repair Hair Mask Base", base: "Cationic emulsion",category: "Hair Care", maintainer: "Dipti OV" },
  { code: "NTL-TN-022", name: "Botanical Face Mist Base", category: "Toner", base: "Aqueous", uses: 9 },
  { code: "NTL-HS-011", name: "Rosemary Scalp Tonic Base", category: "Hair Serum", base: "Aqueous", uses: 14 },
];

/* ---------- ACCOUNTS (CRM) ---------- */
const ACCOUNTS = [
  { id: "ACC-01", name: "Nykaa", website: "lumiere.paris", segment: "Luxury", rating: 5, vvip: true,
    avgOrderValue: "₹42L", productMix: ["Serum","Cream","Sun Care"],
    decisionMakers: [{ name: "Camille Roche", title: "Head of Product", sentiment: "positive", influence: 90 },
                     { name: "Léa Dubois", title: "R&D Lead", sentiment: "neutral", influence: 65 }],
    strategicNotes: "Anchor luxury account. Values provenance & clean claims. Slow to commit, high LTV." },
  { id: "ACC-02", name: "Plum", website: "banyanbotanics.in", segment: "Mass premium", rating: 4, vvip: false,
    avgOrderValue: "₹18L", productMix: ["Cleanser","Hair Care","Cream"],
    decisionMakers: [{ name: "Karthik Iyer", title: "Founder", sentiment: "positive", influence: 95 }],
    strategicNotes: "Founder-led, fast decisions. Price sensitive. Strong on Ayurveda positioning." },
  { id: "ACC-03", name: "Pilgrim", website: "aureliaskin.com", segment: "Premium", rating: 4, vvip: false,
    avgOrderValue: "₹25L", productMix: ["Serum","Lip"],
    decisionMakers: [{ name: "Megan Wallace", title: "Brand Director", sentiment: "neutral", influence: 80 }],
    strategicNotes: "Trend-driven, wants fast iterations. Marketing-led claims." },
  { id: "ACC-04", name: "Asaya", website: "kayanaturals.in", segment: "Mass", rating: 3, vvip: false,
    avgOrderValue: "₹9L", productMix: ["Cleanser","Cream"],
    decisionMakers: [{ name: "Sahil Gupta", title: "Category Manager", sentiment: "negative", influence: 55 }],
    strategicNotes: "Recent delays caused friction. Watch SLA closely." },
  { id: "ACC-05", name: "Nua", website: "noor.ae", segment: "Luxury", rating: 5, vvip: true,
    avgOrderValue: "₹55L", productMix: ["Serum","Cream","Sun Care","Lip"],
    decisionMakers: [{ name: "Fatima Al-Rashid", title: "CEO", sentiment: "positive", influence: 100 }],
    strategicNotes: "VVIP. Gulf luxury, gifting-led. Expects white-glove turnaround." },
];

/* ---------- helper to build NCL threads ---------- */
function ncl(code, by, at, delta, status) { return { code, by, at, delta, status }; }

/* ---------- REQUIREMENTS (the spine) ---------- */
/* ---------- REQUIREMENTS — 19 interconnected end-to-end workflows ----------
   Every record belongs to a complete story: timelines, queries, flags,
   evaluations, stability, deliverables and notifications all reference these. */
const REQ_DEFAULTS = { vvip: false, ntl: null, iteration: 1, aiSimilarWork: [], phaseDays: 1, flags: [], queries: [],
  manualFlag: false, tracker: null, ownership: "shared", owner: "Lab", clientKind: "existing",
  concerns: [], claims: [], goodToHave: [], nonNegotiable: [], actives: [] };

const REQUIREMENTS = [
  /* ----- ARCHIVED: full success story (Plum) ----- */
  { id: "REQ-2026-0312", title: "Rose Hydrating Toner", brand: "Plum", categoryGroup: "Skin Care", category: "Toner", base: "Aqueous",
    status: "Archived", projectType: "EPD", ntl: "NTL-SR-014", currentNcl: "NCL-312-002", iteration: 2,
    ncls: [{ code: "NCL-312-001", by: "Divya Rao", at: "4 Mar", delta: "Exact reuse of rose toner base", status: "superseded" },
           { code: "NCL-312-002", by: "Sumit Choudhary", at: "22 Mar", delta: "Rose water upped to 12% after client iteration", status: "current" }],
    aiTrack: 1, aiCode: "NTL-SR-014", aiScore: 94, aiRationale: "Exact reuse of the hydra toner base — fast track.", aiSimilarWork: ["NTL-SR-014"],
    submittedBy: "Divya Rao", submittedAt: "2 Mar 2026", age: 100, phaseDays: 0,
    moq: "10,000 units", packaging: "150ml mist", targetSampleDate: "20 Mar 2026", budget: { unit: "₹44", batch: "₹4.4L" },
    actives: [{ ingredient: "Rose Water", concentration: "12%" }], nonNegotiable: [{ ingredient: "Rose Water", concentration: "12%" }],
    concerns: ["Sensitivity"], claims: ["Hydrating", "Soothing"],
    sensory: { fragrance: "Light · rose", colour: "Clear · pale pink", texture: "Watery mist" },
    briefDetail: { company: "Pureplay Skin Sciences", fillVol: "150ml", labelDesc: "Plum Rose Toner v2 · PLM-RT-002", shipping: "Plum DC, Bhiwandi, Maharashtra", rmBudget: "28", pmBudget: "14", fg: 44, notes: "Repeat hero SKU — replenishment refresh.", packaging: [{ desc: "150ml PET mist spray", source: "naturis", vendor: "PackPro Industries" }] },
    tracker: "Sumit Choudhary", owner: "Sales SPOC", committedDate: "18 Mar 2026",
    evaluation: { rm: "no", pm: "no", slot: "2026-03-12", availability: [{ name: "Rose Water", state: "available" }] },
    stability: { months: 3, month: 3, status: "passed", startedAt: "2 Apr" },
    deliverables: { ingredient: { done: true, by: "Sumit Choudhary", at: "12 May" }, marketing: { done: true, by: "Sumit Choudhary", at: "14 May" } },
    dispatch: { note: true, photos: 1, docket: "BLDART-66102" } },

  /* ----- IN STABILITY: client approved, 6-mo cycle running (Pilgrim) ----- */
  { id: "REQ-2026-0327", title: "Vitamin C Glow Serum", brand: "Pilgrim", categoryGroup: "Skin Care", category: "Serum", base: "Aqueous gel",
    status: "In stability", projectType: "NPD", currentNcl: "NCL-327-002", iteration: 2,
    ncls: [{ code: "NCL-327-001", by: "Hardik Shah", at: "16 Mar", delta: "Initial brief — SAP 10%", status: "superseded" },
           { code: "NCL-327-002", by: "Sumit Choudhary", at: "12 Apr", delta: "SAP stabilised at 12% — brighter glow per client feedback", status: "current" }],
    aiTrack: 3, aiCode: "NTL-SR-014", aiScore: 71, aiRationale: "New development on the hydra serum base; SAP for stability over L-AA.", aiSimilarWork: ["NCL-019-004"],
    submittedBy: "Hardik Shah", submittedAt: "14 Mar 2026", age: 88, phaseDays: 2,
    moq: "5,000 units", packaging: "30ml dropper", targetSampleDate: "30 Apr 2026", budget: { unit: "₹150", batch: "₹7.5L" },
    actives: [{ ingredient: "Sodium Ascorbyl Phosphate", concentration: "12%" }, { ingredient: "Ferulic Acid", concentration: "0.5%" }],
    nonNegotiable: [{ ingredient: "Sodium Ascorbyl Phosphate", concentration: "12%" }], goodToHave: [{ ingredient: "Vitamin E", concentration: "1%" }],
    concerns: ["Oxidation", "Brightening"], claims: ["Visible glow in 14 days", "Antioxidant shield"],
    sensory: { fragrance: "None", colour: "Pale straw · no oxidation", texture: "Serum · fast-absorbing" },
    briefDetail: { company: "Heavenly Secrets Pvt Ltd", fillVol: "30ml", labelDesc: "Pilgrim VitC Glow · PG-VCG-01", shipping: "Pilgrim WH, Andheri East, Mumbai", rmBudget: "96", pmBudget: "38", fg: 150, notes: "Hero launch for festive quarter.", references: [{ label: "Competitor glow serum", url: "nykaa.com/ref" }] },
    tracker: "Sumit Choudhary", owner: "Sales SPOC", committedDate: "2 May 2026",
    evaluation: { rm: "yes", pm: "no", slot: "2026-04-18", availability: [{ name: "Sodium Ascorbyl Phosphate", state: "available" }, { name: "Ferulic Acid", state: "available" }] },
    stability: { months: 6, month: 2, status: "running", startedAt: "12 May" },
    deliverables: { ingredient: { done: true, by: "Sumit Choudhary", at: "1 Jun" } },
    dispatch: { note: true, photos: 2, docket: "DTDC-771045" } },

  /* ----- SENT TO CLIENT + unresponsive flag + SLA breach (Asaya) ----- */
  { id: "REQ-2026-0340", title: "Coconut Milk Body Lotion", brand: "Asaya", categoryGroup: "Body Care", category: "Lotion", base: "O/W emulsion",
    status: "Sent to client", projectType: "EPD", ntl: "NTL-CR-006", currentNcl: "NCL-340-001",
    ncls: [{ code: "NCL-340-001", by: "Divya Rao", at: "30 Mar", delta: "Exact reuse + coconut fragrance swap", status: "current" }],
    aiTrack: 1, aiCode: "NTL-CR-006", aiScore: 90, aiRationale: "Exact reuse of rich cream base with fragrance change.", aiSimilarWork: ["NTL-CR-006"],
    submittedBy: "Divya Rao", submittedAt: "28 Mar 2026", age: 74, phaseDays: 9,
    moq: "15,000 units", packaging: "250ml pump", targetSampleDate: "25 May 2026", budget: { unit: "₹62", batch: "₹9.3L" },
    actives: [{ ingredient: "Coconut Milk", concentration: "5%" }], concerns: ["Dryness"], claims: ["48h nourishment"],
    sensory: { fragrance: "Moderate · coconut", colour: "White", texture: "Lotion · light" },
    briefDetail: { company: "Asaya Care", fillVol: "250ml", labelDesc: "Asaya Coco Lotion · AS-CL-09", shipping: "Asaya HQ, Lower Parel, Mumbai", rmBudget: "40", pmBudget: "22", fg: 62, notes: "Client reviewing dispatched sample." },
    flags: [{ id: "F-203", type: "client_unresp", typeLabel: "Client unresponsive", severity: "med", text: "No response on dispatched sample for 9 days; two follow-ups sent.", raisedBy: "Divya Rao", raisedByRole: "Sales SPOC", raisedAt: "7 Jun, 09:30", stage: "Sent", owner: "Sales Manager", resolved: false }],
    tracker: "Sumit Choudhary", owner: "Sales SPOC", committedDate: "28 May 2026",
    evaluation: { rm: "no", pm: "yes", slot: "2026-05-20", availability: [{ name: "Coconut Milk", state: "available" }] },
    dispatch: { note: true, photos: 2, docket: "DELHIVERY-99HG12" } },

  /* ----- DISPATCH AWAITING SPOC APPROVAL (Nykaa, VVIP) ----- */
  { id: "REQ-2026-0351", title: "SPF50 Mineral Fluid", brand: "Nykaa", categoryGroup: "Sun Care", category: "Sun Care", base: "Hybrid emulsion",
    status: "Dispatch awaiting SPOC approval", projectType: "NPD", vvip: true, currentNcl: "NCL-351-003", iteration: 3,
    ncls: [{ code: "NCL-351-001", by: "Hardik Shah", at: "9 Apr", delta: "Initial brief — ZnO 18%", status: "superseded" },
           { code: "NCL-351-002", by: "Sumit Choudhary", at: "2 May", delta: "Improved spreadability, reduced white cast", status: "superseded" },
           { code: "NCL-351-003", by: "Sumit Choudhary", at: "28 May", delta: "Final — passed in-vitro SPF50", status: "current" }],
    aiTrack: 3, aiCode: "NTL-SN-031", aiScore: 67, aiRationale: "New mineral system; closest base Mineral Sun Fluid. In-vitro SPF verified before dispatch.", aiSimilarWork: ["NTL-SN-031"],
    submittedBy: "Hardik Shah", submittedAt: "7 Apr 2026", age: 64, phaseDays: 2,
    moq: "5,000 units", packaging: "50ml tube", targetSampleDate: "5 Jun 2026", budget: { unit: "₹140", batch: "₹7L" },
    actives: [{ ingredient: "Zinc Oxide", concentration: "18%" }, { ingredient: "Niacinamide", concentration: "2%" }],
    nonNegotiable: [{ ingredient: "Zinc Oxide", concentration: "18%" }], goodToHave: [{ ingredient: "Vitamin E", concentration: "0.5%" }],
    concerns: ["White cast", "SPF stability", "Pilling"], claims: ["SPF50 PA++++", "No white cast", "Reef-safe"],
    sensory: { fragrance: "None", colour: "White → clear on rub-in", texture: "Fluid · lightweight" },
    briefDetail: { company: "FSN E-Commerce (Nykaa)", fillVol: "50ml", labelDesc: "Nykaa SPF50 Fluid · NYK-SPF-50", shipping: "Nykaa FC, Bhiwandi, Maharashtra", rmBudget: "88", pmBudget: "34", fg: 140, notes: "EU + India launch; gifting hero for Q4.", packaging: [{ desc: "50ml laminated tube, flip-top", source: "naturis", vendor: "EcoTube Pvt Ltd" }], references: [{ label: "Texture benchmark", url: "lab-archive/spf-bench" }] },
    tracker: "Sumit Choudhary", owner: "Lab", committedDate: "5 Jun 2026",
    evaluation: { rm: "yes", pm: "yes", slot: "2026-05-22", availability: [{ name: "Zinc Oxide", state: "available" }, { name: "Niacinamide", state: "available" }] },
    dispatch: { note: true, photos: 2, docket: "DTDC-885214" } },

  /* ----- READY FOR DISPATCH (Plum) ----- */
  { id: "REQ-2026-0358", title: "Green Tea Mattifying Gel", brand: "Plum", categoryGroup: "Skin Care", category: "Cream", base: "Aqueous gel",
    status: "Ready for dispatch", projectType: "REN", ntl: "NTL-SR-014", currentNcl: "NCL-358-001",
    ncls: [{ code: "NCL-358-001", by: "Divya Rao", at: "27 Apr", delta: "Green tea + zinc PCA on hydra gel base", status: "current" }],
    aiTrack: 2, aiCode: "NTL-SR-014", aiScore: 83, aiRationale: "Renovation of hydra gel — add green tea + mattifier.", aiSimilarWork: ["NTL-SR-014"],
    submittedBy: "Divya Rao", submittedAt: "25 Apr 2026", age: 46, phaseDays: 3,
    moq: "8,000 units", packaging: "50ml tube", targetSampleDate: "10 Jun 2026", budget: { unit: "₹78", batch: "₹6.2L" },
    actives: [{ ingredient: "Green Tea Extract", concentration: "3%" }, { ingredient: "Zinc PCA", concentration: "1%" }],
    concerns: ["Oil control", "Pore minimising"], claims: ["8h matte"],
    sensory: { fragrance: "Light · green tea", colour: "Off-white", texture: "Gel · oil-free" },
    briefDetail: { company: "Pureplay Skin Sciences", fillVol: "50ml", labelDesc: "Plum Green Tea Matte · PLM-GT-11", shipping: "Plum DC, Bhiwandi, Maharashtra", rmBudget: "48", pmBudget: "20", fg: 78 },
    tracker: "Sumit Choudhary", committedDate: "8 Jun 2026",
    evaluation: { rm: "no", pm: "yes", slot: "2026-06-02", availability: [{ name: "Green Tea Extract", state: "available" }, { name: "Zinc PCA", state: "available" }] } },

  /* ----- SENT TO CLIENT — awaiting feedback (Pilgrim, Hardik action demo) ----- */
  { id: "REQ-2026-0364", title: "Tea Tree Spot Gel", brand: "Pilgrim", categoryGroup: "Skin Care", category: "Serum", base: "Aqueous gel",
    status: "Sent to client", projectType: "EPD", ntl: "NTL-SR-014", currentNcl: "NCL-364-001",
    ncls: [{ code: "NCL-364-001", by: "Hardik Shah", at: "3 May", delta: "Exact reuse + tea tree 2%", status: "current" }],
    aiTrack: 1, aiCode: "NTL-SR-014", aiScore: 92, aiRationale: "Exact reuse — tea tree drop-in. Low risk.", aiSimilarWork: ["NTL-SR-014"],
    submittedBy: "Hardik Shah", submittedAt: "1 May 2026", age: 40, phaseDays: 4,
    moq: "7,000 units", packaging: "20ml tube", targetSampleDate: "2 Jun 2026", budget: { unit: "₹46", batch: "₹3.2L" },
    actives: [{ ingredient: "Tea Tree Oil", concentration: "2%" }, { ingredient: "Salicylic Acid", concentration: "1%" }],
    concerns: ["Acne", "Oil control"], claims: ["Spot reduction in 3 days"],
    sensory: { fragrance: "Light · tea tree", colour: "Clear", texture: "Gel" },
    briefDetail: { company: "Heavenly Secrets Pvt Ltd", fillVol: "20ml", labelDesc: "Pilgrim Spot Gel · PG-TT-04", shipping: "Pilgrim WH, Andheri East, Mumbai", rmBudget: "28", pmBudget: "12", fg: 46 },
    tracker: "Sumit Choudhary", owner: "Sales SPOC", committedDate: "30 May 2026",
    evaluation: { rm: "no", pm: "no", slot: "2026-05-26", availability: [{ name: "Tea Tree Oil", state: "available" }] },
    dispatch: { note: true, photos: 1, docket: "BLDART-70233" } },

  /* ----- QC + material flag with manager solution (Plum) ----- */
  { id: "REQ-2026-0375", title: "Keratin Repair Hair Mask", brand: "Plum", categoryGroup: "Hair Care", category: "Mask", base: "Cationic emulsion",
    status: "QC", projectType: "REN", ntl: "NTL-HC-018", currentNcl: "NCL-375-002", iteration: 2,
    ncls: [{ code: "NCL-375-001", by: "Divya Rao", at: "5 May", delta: "Repair mask base + keratin 2%", status: "superseded" },
           { code: "NCL-375-002", by: "Sumit Choudhary", at: "30 May", delta: "Boosted conditioning + coconut-vanilla fragrance", status: "current" }],
    aiTrack: 2, aiCode: "NTL-HC-018", aiScore: 84, aiRationale: "Renovation of repair mask base — keratin boost + fragrance swap.", aiSimilarWork: ["NTL-HC-018"],
    submittedBy: "Divya Rao", submittedAt: "3 May 2026", age: 38, phaseDays: 8,
    moq: "6,000 units", packaging: "200ml jar", targetSampleDate: "14 Jun 2026", budget: { unit: "₹72", batch: "₹4.3L" },
    actives: [{ ingredient: "Hydrolysed Keratin", concentration: "2%" }, { ingredient: "Argan Oil", concentration: "1%" }],
    nonNegotiable: [{ ingredient: "Hydrolysed Keratin", concentration: "2%" }],
    concerns: ["Damage", "Frizz"], claims: ["Repairs in 3 washes"],
    sensory: { fragrance: "Moderate · coconut-vanilla", colour: "Cream", texture: "Cream · rich mask" },
    briefDetail: { company: "Pureplay Skin Sciences", fillVol: "200ml", labelDesc: "Plum Keratin Mask · PLM-KM-07", shipping: "Plum DC, Bhiwandi, Maharashtra", rmBudget: "46", pmBudget: "18", fg: 72 },
    flags: [{ id: "F-202", type: "material", typeLabel: "Material short", severity: "high", text: "Hydrolysed keratin stock-out; current vendor lead 9 days — slot at risk.", raisedBy: "Sumit Choudhary", raisedByRole: "Lab Technician", raisedAt: "6 Jun, 10:20", stage: "QC", owner: "Lab Manager", resolved: false, solution: "Approved alternate supplier (Aarna Chem), 3-day lead. Slot moved to 14 Jun.", resolvedBy: "Kunal Shah", resolvedPending: true }],
    tracker: "Sumit Choudhary", committedDate: "12 Jun 2026",
    evaluation: { rm: "yes", pm: "no", slot: "2026-06-01", availability: [{ name: "Hydrolysed Keratin", state: "short" }, { name: "Argan Oil", state: "available" }] } },

  /* ----- TRIAL, iteration 2 + resolved sensory flag (Pilgrim) ----- */
  { id: "REQ-2026-0382", title: "Matte Velvet Lipstick — Rosewood", brand: "Pilgrim", categoryGroup: "Colour", category: "Lip", base: "Anhydrous",
    status: "Trial", projectType: "REN", ntl: "NTL-LP-009", currentNcl: "NCL-382-002", iteration: 2,
    ncls: [{ code: "NCL-382-001", by: "Hardik Shah", at: "13 May", delta: "Velvet lip base + rosewood shade", status: "superseded" },
           { code: "NCL-382-002", by: "Sumit Choudhary", at: "4 Jun", delta: "Natural vanillin blend; matte filler +2%", status: "current" }],
    aiTrack: 2, aiCode: "NTL-LP-009", aiScore: 88, aiRationale: "Renovation of velvet lip base — shade + matte modifier.", aiSimilarWork: ["NTL-LP-009"],
    submittedBy: "Hardik Shah", submittedAt: "11 May 2026", age: 30, phaseDays: 6,
    moq: "8,000 units", packaging: "Bullet, magnetic cap", targetSampleDate: "16 Jun 2026", budget: { unit: "₹95", batch: "₹7.6L" },
    actives: [{ ingredient: "Vitamin E", concentration: "1%" }, { ingredient: "Shea Butter", concentration: "3%" }],
    nonNegotiable: [{ ingredient: "Rosewood pigment match", concentration: "ΔE < 1" }],
    concerns: ["Transfer", "Shade match"], claims: ["12h wear", "Transfer-proof"],
    sensory: { fragrance: "Light · vanilla", colour: "Rosewood", texture: "Velvet matte" },
    briefDetail: { company: "Heavenly Secrets Pvt Ltd", fillVol: "4.2g", labelDesc: "Pilgrim Velvet Rosewood · PG-LP-21", shipping: "Pilgrim WH, Andheri East, Mumbai", rmBudget: "58", pmBudget: "26", fg: 95, notes: "Influencer launch SKU; shade match is critical.", packaging: [{ desc: "Bullet with magnetic cap", source: "client", vendor: "Client-supplied" }] },
    flags: [{ id: "F-204", type: "sensory", typeLabel: "Sensory", severity: "low", text: "Vanilla note reads synthetic in trial 1.", raisedBy: "Hardik Shah", raisedByRole: "Sales SPOC", raisedAt: "30 May, 15:00", stage: "Trial", owner: "Lab Technician", resolved: true, solution: "Switched to natural vanillin blend in iteration 2.", resolvedBy: "Sumit Choudhary" }],
    tracker: "Sumit Choudhary", committedDate: "14 Jun 2026",
    evaluation: { rm: "yes", pm: "yes", slot: "2026-05-26", availability: [{ name: "Rosewood pigment", state: "available" }, { name: "Shea Butter", state: "available" }] } },

  /* ----- FORMULATION, TT desk (Tariq) + resolved query (Asaya) ----- */
  { id: "REQ-2026-0390", title: "Charcoal Detox Cleanser", brand: "Asaya", categoryGroup: "Skin Care", category: "Cleanser", base: "Surfactant blend",
    status: "Formulation", projectType: "TT", ntl: "NTL-CL-022", currentNcl: "NCL-390-001",
    ncls: [{ code: "NCL-390-001", by: "Divya Rao", at: "25 May", delta: "Client formula transfer — charcoal 2%", status: "current" }],
    aiTrack: 2, aiCode: "NTL-CL-022", aiScore: 77, aiRationale: "Tech transfer onto gentle cleanser base; verify charcoal dispersion.", aiSimilarWork: ["NCL-088-003"],
    submittedBy: "Divya Rao", submittedAt: "23 May 2026", age: 18, phaseDays: 3,
    moq: "8,000 units", packaging: "150ml tube", targetSampleDate: "22 Jun 2026", budget: { unit: "₹52", batch: "₹4.2L" },
    actives: [{ ingredient: "Activated Charcoal", concentration: "2%" }, { ingredient: "Salicylic Acid", concentration: "0.5%" }],
    concerns: ["Oily scalp", "Acne"], claims: ["Deep detox"],
    sensory: { fragrance: "Light · mint", colour: "Charcoal grey", texture: "Gel-to-foam" },
    briefDetail: { company: "Asaya Care", fillVol: "150ml", labelDesc: "Asaya Charcoal Wash · AS-CW-03", shipping: "Asaya HQ, Lower Parel, Mumbai", rmBudget: "32", pmBudget: "14", fg: 52, notes: "Client-owned formula; NDA on file." },
    queries: [{ id: "Q-902", text: "Client formula lists 2% activated charcoal — confirm dispersion method (pre-mix slurry vs direct).", by: "Tariq Khan", at: "28 May, 12:10", resolved: true, answer: "Client confirmed pre-mix slurry method; SOP shared on mail.", answeredBy: "Divya Rao" }],
    tracker: "Tariq Khan", committedDate: "20 Jun 2026",
    evaluation: { rm: "yes", pm: "no", slot: "2026-06-08", availability: [{ name: "Activated Charcoal (cosmetic grade)", state: "available" }, { name: "Salicylic Acid", state: "available" }] } },

  /* ----- CLIENT APPROVED — stability prompt pending (Nua, TT) ----- */
  { id: "REQ-2026-0394", prePO: { cost: true, stability: true, marketing: false, ingredient: true, packaging: false }, title: "Kumkumadi Face Oil", brand: "Nua", categoryGroup: "Skin Care", category: "Serum", base: "Anhydrous",
    status: "Client approved", projectType: "TT", currentNcl: "NCL-394-001",
    ncls: [{ code: "NCL-394-001", by: "Hardik Shah", at: "27 May", delta: "Client ayurvedic oil formula transfer", status: "current" }],
    aiTrack: 2, aiCode: "NTL-LP-009", aiScore: 64, aiRationale: "Anhydrous oil system — tech transfer, verify saffron-oil stability.", aiSimilarWork: [],
    submittedBy: "Hardik Shah", submittedAt: "25 May 2026", age: 16, phaseDays: 1,
    moq: "3,000 units", packaging: "30ml glass dropper", targetSampleDate: "8 Jun 2026", budget: { unit: "₹310", batch: "₹9.3L" },
    actives: [{ ingredient: "Kumkumadi Tailam blend", concentration: "as supplied" }, { ingredient: "Saffron Extract", concentration: "0.3%" }],
    nonNegotiable: [{ ingredient: "Kumkumadi Tailam blend", concentration: "as supplied" }],
    concerns: ["Sensitivity"], claims: ["Ayurvedic radiance"],
    sensory: { fragrance: "Strong · herbal saffron", colour: "Amber gold", texture: "Oil · fast-absorbing" },
    briefDetail: { company: "Nua Wellness", fillVol: "30ml", labelDesc: "Nua Kumkumadi · NUA-KO-02", shipping: "Nua Fulfilment, Goregaon, Mumbai", rmBudget: "210", pmBudget: "58", fg: 310, notes: "White-glove account — CEO sponsored." },
    tracker: "Tariq Khan", owner: "Sales SPOC", committedDate: "4 Jun 2026",
    evaluation: { rm: "yes", pm: "yes", slot: "2026-06-01", availability: [{ name: "Kumkumadi blend (client)", state: "available" }, { name: "30ml glass dropper", state: "available" }] },
    dispatch: { note: true, photos: 2, docket: "DTDC-902211" } },

  /* ----- ACCEPTED — DATE COMMITTED (Nua, VVIP, TT desk) ----- */
  { id: "REQ-2026-0401", title: "Oud Renewal Night Cream", brand: "Nua", categoryGroup: "Skin Care", category: "Cream", base: "O/W emulsion",
    status: "Accepted — date committed", projectType: "TT", vvip: true, ntl: "NTL-CR-006", currentNcl: "NCL-401-001",
    ncls: [{ code: "NCL-401-001", by: "Hardik Shah", at: "31 May", delta: "Client-supplied formula intake", status: "current" }],
    aiTrack: 2, aiCode: "NTL-CR-006", aiScore: 81, aiRationale: "Client formula maps to rich cream base with oud fragrance load — verify emulsifier equivalence.", aiSimilarWork: ["NTL-CR-006"],
    submittedBy: "Hardik Shah", submittedAt: "29 May 2026", age: 12, phaseDays: 1,
    moq: "3,000 units", packaging: "50ml glass jar", targetSampleDate: "28 Jun 2026", budget: { unit: "₹240", batch: "₹7.2L" },
    actives: [{ ingredient: "Bakuchiol", concentration: "1%" }, { ingredient: "Squalane", concentration: "5%" }],
    nonNegotiable: [{ ingredient: "Oud fragrance system", concentration: "as supplied" }], goodToHave: [{ ingredient: "Ceramide NP", concentration: "0.5%" }],
    concerns: ["Fine lines", "Dryness"], claims: ["Overnight renewal", "Luxury sensorial"],
    sensory: { fragrance: "Strong · oud (client supplied)", colour: "Warm ivory", texture: "Cream · rich balm" },
    briefDetail: { company: "Nua Wellness", fillVol: "50ml", labelDesc: "Nua Oud Night · NUA-ON-01", shipping: "Nua Fulfilment, Goregaon, Mumbai", rmBudget: "150", pmBudget: "55", fg: 240, notes: "VVIP — gulf gifting line, white-glove TAT." },
    tracker: "Tariq Khan", committedDate: "25 Jun 2026",
    evaluation: { rm: "yes", pm: "yes", slot: "2026-06-14", availability: [{ name: "Oud fragrance system (client)", state: "available" }, { name: "Bakuchiol", state: "available" }, { name: "50ml glass jar", state: "short" }] } },

  /* ----- QUERY RAISED — open, with SPOC (Nua, VVIP) ----- */
  { id: "REQ-2026-0407", title: "Saffron Lux Eye Concentrate", brand: "Nua", categoryGroup: "Skin Care", category: "Serum", base: "Aqueous gel",
    status: "Query raised", projectType: "NPD", vvip: true, currentNcl: "NCL-407-001",
    ncls: [{ code: "NCL-407-001", by: "Hardik Shah", at: "2 Jun", delta: "Brief intake — saffron + caffeine eye gel", status: "current" }],
    aiTrack: 3, aiCode: "NTL-SR-014", aiScore: 66, aiRationale: "Novel saffron actives — new development on hydra gel base.", aiSimilarWork: ["NTL-SR-014"],
    submittedBy: "Hardik Shah", submittedAt: "31 May 2026", age: 10, phaseDays: 2,
    moq: "3,000 units", packaging: "15ml airless pump", targetSampleDate: "5 Jul 2026", budget: { unit: "₹310", batch: "₹9.3L" },
    actives: [{ ingredient: "Saffron Extract", concentration: "0.5%" }, { ingredient: "Caffeine", concentration: "3%" }],
    nonNegotiable: [{ ingredient: "Saffron Extract", concentration: "0.5%" }], goodToHave: [{ ingredient: "Peptides (Matrixyl)", concentration: "2%" }],
    concerns: ["Dark circles", "Fine lines"], claims: ["De-puffs in 7 days"],
    sensory: { fragrance: "None", colour: "Pale gold", texture: "Gel · cooling" },
    briefDetail: { company: "Nua Wellness", fillVol: "15ml", labelDesc: "Nua Saffron Eye · NUA-SE-05", shipping: "Nua Fulfilment, Goregaon, Mumbai", rmBudget: "215", pmBudget: "60", fg: 310, notes: "VVIP — needs colour-range confirmation from client." },
    queries: [{ id: "Q-901", text: "Saffron at 0.5% tints the gel amber — confirm acceptable colour range with the client, or we drop to 0.2%.", by: "Sumit Choudhary", at: "8 Jun, 16:40", resolved: false }],
    tracker: "Sumit Choudhary", owner: "Sales SPOC", ownership: "escalated",
    evaluation: { rm: "yes", pm: "no", slot: "", availability: [{ name: "Saffron Extract", state: "short" }, { name: "Caffeine", state: "available" }] } },

  /* ----- DECLINED — mandatory reason, back with SPOC (Pilgrim) ----- */
  { id: "REQ-2026-0412", title: "Ceramide Barrier Cream", brand: "Pilgrim", categoryGroup: "Skin Care", category: "Cream", base: "O/W emulsion",
    status: "Declined", projectType: "REN", ntl: "NTL-CR-006", currentNcl: "NCL-412-001",
    ncls: [{ code: "NCL-412-001", by: "Hardik Shah", at: "3 Jun", delta: "Rich cream base + ceramide 1%", status: "current" }],
    aiTrack: 2, aiCode: "NTL-CR-006", aiScore: 79, aiRationale: "Renovation candidate, but budget below feasible cost for ceramide load.", aiSimilarWork: ["NTL-CR-006"],
    submittedBy: "Hardik Shah", submittedAt: "1 Jun 2026", age: 9, phaseDays: 2,
    moq: "12,000 units", packaging: "50ml airless jar", targetSampleDate: "28 Jun 2026", budget: { unit: "₹38", batch: "₹4.6L" },
    actives: [{ ingredient: "Ceramide", concentration: "1%" }], nonNegotiable: [{ ingredient: "Ceramide", concentration: "1%" }],
    concerns: ["Dryness", "Sensitivity"], claims: ["Barrier repair"],
    sensory: { fragrance: "None", colour: "White", texture: "Cream · light" },
    briefDetail: { company: "Heavenly Secrets Pvt Ltd", fillVol: "50ml", labelDesc: "Pilgrim Barrier Cream · PG-CB-08", shipping: "Pilgrim WH, Andheri East, Mumbai", rmBudget: "26", pmBudget: "12", fg: 38, notes: "Budget-locked by client." },
    declineReason: "Unit cost ₹38 is unviable for 1% ceramide in an airless jar — need ₹55+ or descope to 0.5%.",
    tracker: "Sumit Choudhary", owner: "Sales SPOC", ownership: "escalated",
    evaluation: { rm: "yes", pm: "yes", slot: "", availability: [{ name: "Ceramide NP", state: "available" }] } },

  /* ----- IN EVALUATION (Plum) ----- */
  { id: "REQ-2026-0418", title: "Niacinamide 10% Booster", brand: "Plum", categoryGroup: "Skin Care", category: "Serum", base: "Aqueous gel",
    status: "In evaluation", projectType: "REN", ntl: "NTL-SR-014", currentNcl: "NCL-418-001",
    ncls: [{ code: "NCL-418-001", by: "Divya Rao", at: "6 Jun", delta: "Hydra gel base + niacinamide 10%", status: "current" }],
    aiTrack: 2, aiCode: "NTL-SR-014", aiScore: 86, aiRationale: "Renovation — niacinamide 10% on hydra serum base; same base, swap actives.", aiSimilarWork: ["NTL-SR-014"],
    submittedBy: "Divya Rao", submittedAt: "4 Jun 2026", age: 6, phaseDays: 2,
    moq: "9,000 units", packaging: "30ml dropper", targetSampleDate: "30 Jun 2026", budget: { unit: "₹88", batch: "₹7.9L" },
    actives: [{ ingredient: "Niacinamide", concentration: "10%" }, { ingredient: "Zinc PCA", concentration: "1%" }],
    nonNegotiable: [{ ingredient: "Niacinamide", concentration: "10%" }],
    concerns: ["Pore minimising", "Oil control"], claims: ["Pores refined in 4 weeks"],
    sensory: { fragrance: "None", colour: "Clear", texture: "Serum · watery" },
    briefDetail: { company: "Pureplay Skin Sciences", fillVol: "30ml", labelDesc: "Plum 10% Niacinamide · PLM-NB-12", shipping: "Plum DC, Bhiwandi, Maharashtra", rmBudget: "52", pmBudget: "22", fg: 88 },
    tracker: "Sumit Choudhary", ownership: "unassigned",
    evaluation: { rm: "no", pm: "yes", slot: "", availability: [{ name: "Niacinamide", state: "available" }, { name: "Zinc PCA", state: "short" }] } },

  /* ----- ACKNOWLEDGED — awaiting evaluation (Pilgrim) ----- */
  { id: "REQ-2026-0423", title: "Bakuchiol Night Elixir", brand: "Pilgrim", categoryGroup: "Skin Care", category: "Serum", base: "Anhydrous",
    status: "Acknowledged", projectType: "NPD", currentNcl: "NCL-423-001",
    ncls: [{ code: "NCL-423-001", by: "Hardik Shah", at: "7 Jun", delta: "Brief intake — bakuchiol retinol-alternative elixir", status: "current" }],
    aiTrack: 3, aiCode: "NTL-LP-009", aiScore: 62, aiRationale: "Anhydrous elixir — new development; bakuchiol stability is the main risk.", aiSimilarWork: [],
    submittedBy: "Hardik Shah", submittedAt: "5 Jun 2026", age: 5, phaseDays: 1,
    moq: "4,000 units", packaging: "30ml glass dropper", targetSampleDate: "10 Jul 2026", budget: { unit: "₹260", batch: "₹10.4L" },
    actives: [{ ingredient: "Bakuchiol", concentration: "2%" }, { ingredient: "Squalane", concentration: "10%" }],
    nonNegotiable: [{ ingredient: "Bakuchiol", concentration: "2%" }],
    concerns: ["Anti-ageing", "Sensitivity"], claims: ["Retinol results, zero irritation"],
    sensory: { fragrance: "None", colour: "Pale amber", texture: "Oil · silky" },
    briefDetail: { company: "Heavenly Secrets Pvt Ltd", fillVol: "30ml", labelDesc: "Pilgrim Bakuchiol Elixir · PG-BE-02", shipping: "Pilgrim WH, Andheri East, Mumbai", rmBudget: "175", pmBudget: "52", fg: 260 },
    tracker: "Sumit Choudhary" },

  /* ----- APPROVED — in lab incoming, to acknowledge (Plum) ----- */
  { id: "REQ-2026-0428", title: "Rice Water Strengthening Shampoo", brand: "Plum", categoryGroup: "Hair Care", category: "Cleanser", base: "Surfactant blend",
    status: "Approved", projectType: "REN", gated: true, ntl: "NTL-HC-018", currentNcl: "NCL-428-001",
    ncls: [{ code: "NCL-428-001", by: "Divya Rao", at: "8 Jun", delta: "Repair base + rice water + biotin", status: "current" }],
    aiTrack: 2, aiCode: "NTL-HC-018", aiScore: 80, aiRationale: "Renovation of repair hair base — rice water + biotin swap-in.", aiSimilarWork: ["NTL-HC-018"],
    submittedBy: "Divya Rao", submittedAt: "6 Jun 2026", age: 4, phaseDays: 0,
    moq: "12,000 units", packaging: "300ml pump", targetSampleDate: "4 Jul 2026", budget: { unit: "₹95", batch: "₹11.4L" },
    actives: [{ ingredient: "Rice Water Ferment", concentration: "8%" }, { ingredient: "Biotin", concentration: "0.5%" }],
    concerns: ["Hair fall", "Damage"], claims: ["3x stronger strands"],
    sensory: { fragrance: "Light · clean", colour: "Pearl white", texture: "Foam · creamy lather" },
    briefDetail: { company: "Pureplay Skin Sciences", fillVol: "300ml", labelDesc: "Plum Rice Water Shampoo · PLM-RW-15", shipping: "Plum DC, Bhiwandi, Maharashtra", rmBudget: "58", pmBudget: "24", fg: 95 } },

  /* ----- RETURNED TO SPOC by manager — manager-phase SLA breach (Asaya) ----- */
  { id: "REQ-2026-0429", title: "Redensyl Hair Growth Serum", brand: "Asaya", categoryGroup: "Hair Care", category: "Serum", base: "Aqueous",
    status: "Returned to SPOC", projectType: "NPD", currentNcl: "NCL-429-001",
    ncls: [{ code: "NCL-429-001", by: "Divya Rao", at: "7 Jun", delta: "Brief intake — redensyl 3% scalp serum", status: "current" }],
    aiTrack: 3, aiCode: "NTL-SR-014", aiScore: 58, aiRationale: "New development; redensyl sourcing and FG target unconfirmed.", aiSimilarWork: [],
    submittedBy: "Divya Rao", submittedAt: "7 Jun 2026", age: 3, phaseDays: 4,
    moq: "TBD", packaging: "50ml dropper", targetSampleDate: "TBD", budget: { unit: "₹165", batch: "—" },
    actives: [{ ingredient: "Redensyl", concentration: "3%" }, { ingredient: "Caffeine", concentration: "1%" }],
    concerns: ["Hair fall", "Scalp health"], claims: ["Visible regrowth in 90 days"],
    sensory: { fragrance: "None", colour: "Clear", texture: "Serum · non-sticky" },
    briefDetail: { company: "Asaya Care", fillVol: "50ml", labelDesc: "Asaya Regrow · AS-RG-01", shipping: "Asaya HQ, Lower Parel, Mumbai", rmBudget: "", pmBudget: "", fg: 165, notes: "FG target unconfirmed — client to revert." },
    returnNote: "Get a confirmed FG target and MOQ from the client before we commit NPD bandwidth.",
    owner: "Sales SPOC", ownership: "escalated" },

  /* ----- PENDING REVIEW — manager queue, VVIP, compliance flag unset (Nykaa) ----- */
  { id: "REQ-2026-0431", title: "Vitamin-C Brightening Serum", brand: "Nykaa", categoryGroup: "Skin Care", category: "Serum", base: "Aqueous gel",
    status: "Pending review", projectType: "NPD", vvip: true, currentNcl: "NCL-431-001",
    ncls: [{ code: "NCL-431-001", by: "Hardik Shah", at: "8 Jun", delta: "Brief intake — 15% L-AA brightening serum", status: "current" }],
    aiTrack: 3, aiCode: "NTL-SR-014", aiScore: 72, aiRationale: "High actives load suggests new development; watch L-AA stability at pH 3.4.", aiSimilarWork: ["NCL-019-004", "NTL-SR-014"],
    submittedBy: "Hardik Shah", submittedAt: "8 Jun 2026", age: 2, phaseDays: 2,
    moq: "5,000 units", packaging: "30ml airless pump", targetSampleDate: "20 Jul 2026", budget: { unit: "₹165", batch: "₹8.2L" },
    actives: [{ ingredient: "Vitamin C (L-Ascorbic Acid)", concentration: "15%" }, { ingredient: "Ferulic Acid", concentration: "0.5%" }],
    nonNegotiable: [{ ingredient: "Vitamin C (L-Ascorbic Acid)", concentration: "15%" }], goodToHave: [{ ingredient: "Vitamin E", concentration: "1%" }],
    concerns: ["Oxidation", "Brightening", "Sensitivity"], claims: ["Brighter skin in 10 days", "Antioxidant", "Vegan"],
    sensory: { fragrance: "None", colour: "Pale straw · no oxidation", texture: "Serum · light gel" },
    briefDetail: { company: "FSN E-Commerce (Nykaa)", fillVol: "30ml", labelDesc: "Nykaa VitC 15 · NYK-VC-15", shipping: "Nykaa FC, Bhiwandi, Maharashtra", rmBudget: "104", pmBudget: "42", fg: 165, notes: "EU launch planned Q4 — gifting hero SKU. Must pass EU stability.", references: [{ label: "Pack reference", url: "nykaa.com/vitc-ref" }] },
    flags: [{ id: "F-201", type: "compliance", typeLabel: "Compliance", severity: "unset", text: "Client wants EU launch — needs CPSR check before we commit claims.", raisedBy: "Hardik Shah", raisedByRole: "Sales SPOC", raisedAt: "9 Jun, 11:05", stage: "Review", owner: "Sales Manager", resolved: false }],
    owner: "Sales SPOC", ownership: "escalated" },

  /* ----- LOGGED — fresh this morning, straight to lab (Plum, EPD) ----- */
  { id: "REQ-2026-0434", title: "Aloe Daily Gel Cleanser", brand: "Plum", categoryGroup: "Skin Care", category: "Cleanser", base: "Surfactant blend",
    status: "Logged", projectType: "EPD", ntl: "NTL-CL-022", currentNcl: "NCL-434-001",
    ncls: [{ code: "NCL-434-001", by: "Divya Rao", at: "10 Jun", delta: "Exact reuse — green tint + aloe claim", status: "current" }],
    aiTrack: 1, aiCode: "NTL-CL-022", aiScore: 96, aiRationale: "Exact match to gentle cleanser base. Only tint + claim differ — low risk, fast track.", aiSimilarWork: ["NTL-CL-022"],
    submittedBy: "Divya Rao", submittedAt: "10 Jun 2026", age: 0, phaseDays: 0,
    moq: "10,000 units", packaging: "200ml flip-cap", targetSampleDate: "24 Jun 2026", budget: { unit: "₹58", batch: "₹5.8L" },
    actives: [{ ingredient: "Aloe Vera Extract", concentration: "2%" }], goodToHave: [{ ingredient: "Panthenol", concentration: "0.5%" }],
    concerns: ["Sensitivity"], claims: ["Soothing", "Sulphate-free"],
    sensory: { fragrance: "Light · aloe", colour: "Pale green", texture: "Gel" },
    briefDetail: { company: "Pureplay Skin Sciences", fillVol: "200ml", labelDesc: "Plum Aloe Cleanser · PLM-AC-19", shipping: "Plum DC, Bhiwandi, Maharashtra", rmBudget: "36", pmBudget: "16", fg: 58 },
    ownership: "unassigned" },
  { id: "REQ-2026-0437", title: "Saffron Glow Face Mist", brand: "Asaya", categoryGroup: "Skin Care", category: "Toner", base: "Aqueous",
    status: "Pending review", projectType: "TT", vvip: false, currentNcl: "NCL-437-001",
    ncls: [{ code: "NCL-437-001", by: "Divya Rao", at: "10 Jun", delta: "Brief intake — client's own saffron mist formula (tech transfer)", status: "current" }],
    aiTrack: 2, aiCode: "NTL-TN-022", aiScore: 64, aiRationale: "Tech transfer — client formula governs; check preservative system compatibility.", aiSimilarWork: ["NTL-TN-022"],
    submittedBy: "Divya Rao", submittedAt: "10 Jun 2026", age: 1, phaseDays: 1,
    moq: "8,000 units", packaging: "100ml PET mist spray", targetSampleDate: "12 Jul 2026", budget: { unit: "₹52", batch: "₹4.1L" },
    actives: [{ ingredient: "Saffron Extract", concentration: "0.2%" }], nonNegotiable: [{ ingredient: "Saffron Extract", concentration: "0.2%" }], goodToHave: [],
    concerns: ["Dullness"], claims: ["Instant glow", "100% saffron-infused"],
    sensory: { fragrance: "Saffron · warm", colour: "Pale gold", texture: "Fine mist" },
    briefDetail: { company: "Asaya Care", fillVol: "100ml", labelDesc: "Asaya Saffron Mist · ASY-SM-01", shipping: "Asaya WH, Gurugram", rmBudget: "31", pmBudget: "12", fg: 52, notes: "Client transfers their formula — TT gate applies." },
    flags: [], owner: "Sales SPOC", ownership: "escalated" },
  { id: "REQ-2026-0439", title: "Cica Calm Moisturiser", brand: "Plum", categoryGroup: "Skin Care", category: "Moisturiser", base: "O/W emulsion",
    status: "Pending review", projectType: "NPD", vvip: false, currentNcl: "NCL-439-001",
    ncls: [{ code: "NCL-439-001", by: "Hardik Shah", at: "10 Jun", delta: "Brief intake — cica + ceramide barrier moisturiser", status: "current" }],
    aiTrack: 3, aiCode: "NTL-CR-006", aiScore: 70, aiRationale: "Closest base is Rich Repair Cream; cica addition is a new development.", aiSimilarWork: ["NTL-CR-006"],
    submittedBy: "Hardik Shah", submittedAt: "10 Jun 2026", age: 1, phaseDays: 1,
    moq: "12,000 units", packaging: "50ml airless jar", targetSampleDate: "25 Jul 2026", budget: { unit: "₹88", batch: "₹10.5L" },
    actives: [{ ingredient: "Centella Asiatica (Cica)", concentration: "2%" }, { ingredient: "Ceramide", concentration: "0.5%" }],
    nonNegotiable: [{ ingredient: "Centella Asiatica (Cica)", concentration: "2%" }], goodToHave: [{ ingredient: "Panthenol", concentration: "1%" }],
    concerns: ["Sensitivity", "Barrier repair"], claims: ["Soothes in 60 seconds", "Derma-tested"],
    sensory: { fragrance: "None", colour: "Off-white", texture: "Whipped cream" },
    briefDetail: { company: "Pureplay Skin Sciences", fillVol: "50ml", labelDesc: "Plum Cica Calm · PLM-CC-04", shipping: "Plum DC, Bhiwandi, Maharashtra", rmBudget: "54", pmBudget: "21", fg: 88, notes: "Sensitive-skin hero for monsoon campaign." },
    flags: [], owner: "Sales SPOC", ownership: "escalated" },
  { id: "REQ-2026-0441", title: "Rosemary Scalp Tonic", brand: "Pilgrim", categoryGroup: "Hair Care", category: "Hair Serum", base: "Aqueous",
    status: "Pending review", projectType: "EPD", vvip: false, currentNcl: "NCL-441-001",
    ncls: [{ code: "NCL-441-001", by: "Divya Rao", at: "9 Jun", delta: "Brief intake — exact reuse of rosemary tonic base", status: "current" }],
    aiTrack: 1, aiCode: "NTL-HS-011", aiScore: 91, aiRationale: "Exact duplication of existing rosemary tonic — EPD.", aiSimilarWork: ["NTL-HS-011"],
    submittedBy: "Divya Rao", submittedAt: "9 Jun 2026", age: 2, phaseDays: 2,
    moq: "10,000 units", packaging: "100ml dropper bottle", targetSampleDate: "5 Jul 2026", budget: { unit: "₹61", batch: "₹6.1L" },
    actives: [{ ingredient: "Rosemary Extract", concentration: "1%" }], nonNegotiable: [{ ingredient: "Rosemary Extract", concentration: "1%" }], goodToHave: [],
    concerns: ["Hair fall", "Dandruff"], claims: ["Reduces hair fall in 4 weeks"],
    sensory: { fragrance: "Herbal rosemary", colour: "Clear", texture: "Watery tonic" },
    briefDetail: { company: "Heavenly Secrets (Pilgrim)", fillVol: "100ml", labelDesc: "Pilgrim Rosemary Tonic · PIL-RT-02", shipping: "Pilgrim WH, Bengaluru", rmBudget: "38", pmBudget: "14", fg: 61, notes: "SPOC flagged for budget confirmation before lab handoff." },
    flags: [{ id: "F-205", type: "budget", typeLabel: "Budget mismatch", text: "Client target FG ₹61 vs our last quote ₹68 — needs manager call before lab.", raisedBy: "Divya Rao", raisedByRole: "Sales SPOC", raisedAt: "9 Jun, 16:10", stage: "Review", owner: "Sales Manager", resolved: false }],
    owner: "Sales SPOC", ownership: "escalated" },
].map(function (r) { return Object.assign({}, REQ_DEFAULTS, r); });
var DESK_TECH = { EPD: "Sumit Choudhary", REN: "Meera Iyer", TT: "Tariq Khan", NPD: "Arjun Nair" };
/* ---- generated demo queries — gets the lab pipeline to ~70 live (12 Jun lab meeting scale) ---- */
(function generateLabQueries() {
  var BR = [["Plum", "Pureplay Skin Sciences"], ["Pilgrim", "Heavenly Secrets"], ["Nykaa", "FSN E-Commerce"], ["Asaya", "Asaya Care"], ["Nua", "Nirvana Being"], ["Mamaearth", "Honasa Consumer"]];
  var TPL = [
    ["Skin Care", "Serum", "Aqueous gel", "Niacinamide Clarifying Serum"], ["Skin Care", "Serum", "Aqueous gel", "Retinol Renewal Serum"],
    ["Skin Care", "Cream", "O/W emulsion", "Ceramide Night Cream"], ["Skin Care", "Moisturiser", "O/W emulsion", "Oil-Free Gel Moisturiser"],
    ["Skin Care", "Cleanser", "Surfactant blend", "Gentle Foaming Cleanser"], ["Skin Care", "Toner", "Aqueous", "Glow Tonic Exfoliating Toner"],
    ["Skin Care", "Face Oil", "Anhydrous", "Squalane Radiance Oil"], ["Skin Care", "Mask", "O/W emulsion", "Clay Detox Mask"],
    ["Hair Care", "Shampoo", "Surfactant blend", "Anti-Dandruff Shampoo"], ["Hair Care", "Conditioner", "O/W emulsion", "Smoothing Conditioner"],
    ["Hair Care", "Hair Oil", "Anhydrous", "Onion Growth Hair Oil"], ["Hair Care", "Hair Serum", "Aqueous", "Frizz-Control Hair Serum"],
    ["Hair Care", "Hair Mask", "O/W emulsion", "Keratin Repair Mask"], ["Hair Care", "Scalp Tonic", "Aqueous", "Caffeine Scalp Tonic"],
    ["Sun Care", "SPF Fluid", "Hybrid emulsion", "Invisible SPF 50 Fluid"], ["Sun Care", "Sunscreen Lotion", "O/W emulsion", "Hydrating SPF 30 Lotion"],
    ["Sun Care", "After-Sun Gel", "Aqueous gel", "Aloe After-Sun Gel"], ["Body Care", "Body Lotion", "O/W emulsion", "Vitamin E Body Lotion"],
    ["Body Care", "Body Wash", "Surfactant blend", "Shea Body Wash"], ["Body Care", "Body Butter", "Anhydrous", "Cocoa Body Butter"],
    ["Colour", "Lip Tint", "Anhydrous", "Matte Lip Tint — Berry"], ["Colour", "Lipstick", "Anhydrous", "Creamy Lipstick — Nude"],
    ["Skin Care", "Serum", "Aqueous gel", "Hyaluronic Hydra Serum"], ["Skin Care", "Cream", "O/W emulsion", "Brightening Day Cream"],
    ["Hair Care", "Shampoo", "Surfactant blend", "Rice Protein Shampoo"], ["Skin Care", "Cleanser", "Surfactant blend", "Salicylic Acne Wash"],
  ];
  var STAT = ["Logged", "Logged", "Approved", "Acknowledged", "In evaluation", "Formulation", "Trial", "QC", "Ready for dispatch", "In stability"];
  var TYPES = ["EPD", "REN", "EPD", "NPD", "TT", "REN", "EPD", "NPD"];
  var SPOCS = ["Hardik Shah", "Divya Rao"];
  var MON = ["12 Jun", "11 Jun", "10 Jun", "9 Jun", "6 Jun", "4 Jun", "2 Jun", "29 May", "26 May", "21 May", "15 May", "8 May"];
  var CHEM = ["Sumit Choudhary", "Meera Iyer", "Tariq Khan", "Arjun Nair", "Ritu Sharma", "Karan Malhotra"];
  var out = [];
  for (var i = 0; i < 50; i++) {
    var br = BR[i % BR.length], tpl = TPL[i % TPL.length], status = STAT[i % STAT.length], type = TYPES[i % TYPES.length];
    var seq = 601 + i, id = "REQ-2026-0" + seq, sub = SPOCS[i % 2], started = MON[i % MON.length] + " 2026";
    var fg = 40 + (i % 9) * 14, rm = Math.round(fg * 0.62), pm = fg - rm - 4;
    var ncl = "NCL-" + seq + "-001";
    out.push({
      id: id, title: tpl[3], brand: br[0], categoryGroup: tpl[0], category: tpl[1], base: tpl[2],
      status: status, projectType: type, currentNcl: ncl,
      ncls: [{ code: ncl, by: sub, at: MON[i % MON.length], delta: "Brief intake — " + tpl[3], status: "current" }],
      aiTrack: (i % 4) + 1, aiCode: "NTL-" + tpl[1].slice(0, 2).toUpperCase() + "-0" + (10 + (i % 80)), aiScore: 60 + (i % 38),
      aiRationale: "Auto-matched from the " + tpl[1].toLowerCase() + " base.", aiSimilarWork: [],
      submittedBy: sub, submittedAt: started, age: 1 + (i % 40), phaseDays: 1 + (i % 12),
      moq: (3 + (i % 12)) + ",000 units", packaging: tpl[1] === "Hair Oil" || tpl[1] === "Face Oil" ? "100ml dropper" : "50ml " + (tpl[2].indexOf("emulsion") >= 0 ? "jar" : "bottle"),
      targetSampleDate: MON[(i + 3) % MON.length] + " 2026", budget: { unit: "₹" + fg, batch: "₹" + (3 + i % 9) + "L" },
      actives: [], nonNegotiable: [], goodToHave: [],
      concerns: [], claims: [],
      sensory: { fragrance: "Per brief", colour: "Per brief", texture: tpl[1] },
      briefDetail: { company: br[1], fillVol: "50ml", labelDesc: br[0] + " " + tpl[3], shipping: br[0] + " WH", rmBudget: String(rm), pmBudget: String(pm), fg: fg, notes: "Generated demo query for lab-scale testing." },
      tracker: ["In evaluation", "Formulation", "Trial", "QC", "Ready for dispatch", "In stability"].indexOf(status) >= 0 ? CHEM[i % CHEM.length] : null,
      owner: "Lab", ownership: "shared",
    });
  }
  out.forEach(function (r) { REQUIREMENTS.push(Object.assign({}, REQ_DEFAULTS, r)); });
})();

var SEED_LABSTAGE = { "Formulation": "Sheet pending", "Trial": "In trials", "QC": "QC testing in process", "Fill": "Ready to send", "Ready for dispatch": "Ready to send", "Dispatch awaiting SPOC approval": "Ready to send", "Sent to client": "Dispatched", "Client approved": "Dispatched", "In stability": "Dispatched", "Archived": "Dispatched" };
var SEED_DISPATCH_DATE = { "Dispatch awaiting SPOC approval": "9 Jun 2026", "Sent to client": "5 Jun 2026", "Client approved": "28 May 2026", "In stability": "22 May 2026", "Archived": "5 May 2026" };
var LAB_STARTED = ["In evaluation", "Accepted — date committed", "Formulation", "Trial", "QC", "Fill", "Ready for dispatch", "Dispatch awaiting SPOC approval", "Sent to client", "Client approved", "In stability", "Archived"];
REQUIREMENTS.forEach(function (r) {
  if (!r.labStage && SEED_LABSTAGE[r.status]) r.labStage = SEED_LABSTAGE[r.status];
  if (!r.dispatchedOn && SEED_DISPATCH_DATE[r.status]) r.dispatchedOn = SEED_DISPATCH_DATE[r.status];
  r.createdBy = r.submittedBy; r.account = r.account || r.brand; r.manualFlag = (r.flags || []).length > 0;
  var t = DESK_TECH[r.projectType];
  // anything the lab is actively working has been acknowledged & assigned to a chemist
  if (LAB_STARTED.indexOf(r.status) >= 0) { r.assigned = true; if (!r.tracker) r.tracker = t; }
  if (r.tracker) r.tracker = r.tracker;
  // seed the live-stage log (who + when per completed stage) for a convincing demo
  if (r.labStage) {
    var LS = ["RM / PM pending", "Sheet pending", "Sheet ready", "In trials", "QC testing pending", "QC testing in process", "Evaluation pending", "Rework / retrial", "Ready to send", "Dispatched"], idx = LS.indexOf(r.labStage);
    var chem = r.tracker || t || "Sumit Choudhary";
    var seedDays = [38, 32, 27, 21, 16, 12, 8, 5, 3, 1];
    r.labStageLog = r.labStageLog || {};
    for (var si = 0; si <= idx; si++) { var dd = new Date(2026, 5, 12); dd.setDate(dd.getDate() - (seedDays[si] || 1));
      r.labStageLog[LS[si]] = { by: chem, at: dd.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }; }
  }
  (r.queries || []).forEach(function (q) { if (q.by === "Sumit Choudhary" || q.by === "Tariq Khan") q.by = t; });
  (r.flags || []).forEach(function (f) { if (f.raisedByRole === "Lab Technician") f.raisedBy = t; if (f.resolvedBy === "Sumit Choudhary") f.resolvedBy = t; });
  (r.ncls || []).forEach(function (n) { if (n.by === "Sumit Choudhary" || n.by === "Tariq Khan") n.by = t; });
  if (r.deliverables) ["ingredient", "marketing"].forEach(function (k) { var dd = r.deliverables[k]; if (dd && dd.by) dd.by = t; });
});

/* ---------- slaStatus(req) → {phase, level, daysOver, daysLeft, deadline, budget} ---------- */
const PHASE_OF = {
  "Logged": "rd", "Pending review": "manager",
  "Approved": "rd", "Returned to SPOC": "manager",
  "R&D assessing": "rd", "R&D assessed": "rd", "Acknowledged": "rd",
  "In assessment (RM/PM/Slot)": "rd", "In evaluation": "rd", "Query raised": "rd", "Declined": "rd", "Accepted — date committed": "lab", "Returned — needs revision": "rd", "Client approved": "lab", "In stability": "lab",
  "Formulation": "lab", "Trial": "lab", "QC": "lab", "Fill": "lab", "Ready for dispatch": "lab",
  "Dispatch awaiting SPOC approval": "lab", "Sent to client": "lab", "Archived": "lab",
};
function slaStatus(req) {
  const phase = PHASE_OF[req.status] || "lab";
  const budget = (SLA_MATRIX[req.projectType] || {})[phase];
  if (budget == null || req.status === "Archived" || req.status === "Rejected") return { phase: "na", level: "na", daysOver: 0, daysLeft: null, budget };
  const used = req.phaseDays != null ? req.phaseDays : 0;
  const left = budget - used;
  let level = "ok";
  if (left < 0) level = "red";
  else if (left <= Math.max(1, Math.ceil(budget * 0.25))) level = "amber";
  return { phase, level, daysOver: left < 0 ? -left : 0, daysLeft: left >= 0 ? left : 0, budget };
}

/* ---------- REQUIREMENT_TIMELINES (sample, keyed by req id) ---------- */
/* ---------- REQUIREMENT_TIMELINES — generated from each requirement's own
   story so every screen shows the same chronology with actors + timestamps. */
const REQUIREMENT_TIMELINES = {};
(function seedTimelines() {
  var DESK = { EPD: "Sumit Choudhary", REN: "Meera Iyer", TT: "Tariq Khan", NPD: "Arjun Nair" };
  var ANCHOR = new Date(2026, 5, 10, 18, 30);
  function fmt(daysAgo, h, m) {
    var dt = new Date(ANCHOR); dt.setDate(dt.getDate() - daysAgo);
    return dt.getDate() + " " + dt.toLocaleString("en-GB", { month: "short" }) + ", " + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }
  var RANK = { "Logged": 0, "Pending review": 1, "Returned to SPOC": 1.5, "Approved": 2, "Acknowledged": 3, "In evaluation": 4, "Query raised": 4.2, "Declined": 4.5, "Accepted — date committed": 5, "Formulation": 6, "Trial": 7, "QC": 8, "Fill": 9, "Ready for dispatch": 10, "Dispatch awaiting SPOC approval": 11, "Sent to client": 12, "Client approved": 13, "In stability": 14, "Archived": 15 };
  function evalDetail(r) {
    var ev = r.evaluation; if (!ev) return "Lab evaluation started (RM / PM / slot / availability).";
    var bits = [];
    if (ev.rm && ev.rm !== "unset") bits.push("RM " + (ev.rm === "yes" ? "procurement required" : "not needed"));
    if (ev.pm && ev.pm !== "unset") bits.push("PM " + (ev.pm === "yes" ? "procurement required" : "not needed"));
    if (ev.slot) bits.push("slot " + ev.slot);
    return "Evaluation: " + (bits.length ? bits.join(" · ") : "in progress") + ".";
  }
  REQUIREMENTS.forEach(function (r) {
    var rk = RANK[r.status] != null ? RANK[r.status] : 0;
    var tech = r.tracker || DESK[r.projectType] || "Sumit Choudhary";
    var mgr = "Kunal Shah", spoc = r.submittedBy;
    var gated = r.gated || r.clientKind === "new" || ["TT", "NPD"].indexOf(r.projectType) >= 0;
    var ms = [];
    ms.push({ kind: "created", icon: "note", stage: "Requirement logged", actor: spoc, role: "SPOC", detail: "Requirement logged from client brief (" + r.brand + ")." });
    if (gated) {
      ms.push({ kind: "assigned", icon: "team", stage: "Routed to manager", actor: "System", role: "System", system: true, detail: "Auto-routed to Sales Manager (" + (r.clientKind === "new" ? "new client" : r.projectType) + " gate)." });
      if (r.status === "Returned to SPOC") ms.push({ kind: "flag", icon: "alert", stage: "Returned to SPOC", actor: mgr, role: "Sales Manager", severity: "med", detail: "Returned: " + (r.returnNote || "needs revision before lab handoff.") });
      else if (rk >= 2) ms.push({ kind: "approval", icon: "check", stage: "Manager approved", actor: mgr, role: "Sales Manager", detail: "Approved for the lab" + (r.vvip ? " · marked VVIP" : "") + "." });
    }
    if (rk >= 3) ms.push({ kind: "handoff", icon: "incoming", stage: "Lab acknowledged", actor: tech, role: "Lab", detail: "Acknowledged — seen & reviewed (" + r.projectType + " desk). Lab Mgr Dipti OV looped in." });
    if (rk >= 4) ms.push({ kind: "status", icon: "work", stage: "Evaluation", actor: tech, role: "Lab", detail: evalDetail(r) });
    (r.queries || []).forEach(function (q) {
      ms.push({ kind: "flag", icon: "note", stage: "Query raised", actor: q.by, role: "Lab", severity: "med", detail: "Query to SPOC: " + q.text, at: q.at });
      if (q.resolved) ms.push({ kind: "approval", icon: "check", stage: "Query resolved", actor: q.answeredBy || spoc, role: "SPOC", detail: "Clarified: " + q.answer + " — back with the lab." });
    });
    if (r.status === "Declined") ms.push({ kind: "flag", icon: "alert", stage: "Declined", actor: tech, role: "Lab", severity: "high", detail: "Declined — " + (r.declineReason || "") });
    if (rk >= 5) ms.push({ kind: "approval", icon: "check", stage: "Accepted", actor: tech, role: "Lab", detail: "Accepted — tentative sample date " + (r.committedDate || "set") + ". Ownership with Lab." });
    ["Formulation", "Trial", "QC", "Fill", "Ready for dispatch"].forEach(function (st) {
      if (rk >= RANK[st]) ms.push({ kind: "status", icon: "work", stage: st, actor: tech, role: "Lab", detail: "Bench: " + st + (st === "Ready for dispatch" ? " — sample ready." : ".") });
    });
    (r.ncls || []).slice(1).forEach(function (n, i) {
      ms.push({ kind: "status", icon: "history", stage: "Iteration " + (i + 2), actor: n.by, role: "Lab", detail: "New iteration " + n.code + " — " + n.delta + " (one thread).", at: n.at ? n.at + ", 12:00" : undefined });
    });
    if (rk >= 11) ms.push({ kind: "handoff", icon: "dispatch", stage: "Dispatch drafted", actor: tech, role: "Lab", detail: "Dispatch note + " + ((r.dispatch && r.dispatch.photos) || 1) + " product photo(s) — awaiting SPOC approval" + (r.dispatch && r.dispatch.docket ? " · docket " + r.dispatch.docket : "") + "." });
    if (rk >= 12) ms.push({ kind: "handoff", icon: "dispatch", stage: "Sent to client", actor: spoc, role: "SPOC", detail: "SPOC approved — sample sent to client. Ownership with Sales." });
    if (rk >= 13) ms.push({ kind: "approval", icon: "check", stage: "Client approved", actor: spoc, role: "SPOC", detail: "Client approved the sample." });
    if (r.stability) {
      ms.push({ kind: "status", icon: "clock", stage: "Stability started", actor: tech, role: "Lab", detail: r.stability.months + "-month stability cycle initiated." });
      for (var i = 1; i <= r.stability.month; i++) ms.push({ kind: "status", icon: "clock", stage: "Stability M" + i, actor: tech, role: "Lab", detail: "Stability month " + i + "/" + r.stability.months + (i === r.stability.months && r.stability.status === "passed" ? " — passed ✓." : " — parameters ok.") });
    }
    if (r.deliverables) {
      ["ingredient", "marketing"].forEach(function (k) {
        var d = r.deliverables[k];
        if (d && d.done) ms.push({ kind: "approval", icon: "note", stage: k === "ingredient" ? "Ingredient sheet" : "Marketing brief", actor: d.by || tech, role: "Lab", detail: (k === "ingredient" ? "Ingredient sheet" : "Marketing brief") + " submitted to SPOC." });
      });
    }
    if (r.status === "Archived") ms.push({ kind: "approval", icon: "archive", stage: "Closed", actor: "Dipti OV", role: "Lab Mgr", detail: "Project closed & archived — full thread preserved." });
    (r.flags || []).forEach(function (f) {
      ms.push({ kind: "flag", icon: "flag", stage: "Flag · " + (f.typeLabel || f.type), actor: f.raisedBy, role: f.raisedByRole || "SPOC", severity: f.severity !== "unset" ? f.severity : undefined, detail: f.text, at: f.raisedAt });
      if (f.solution) ms.push({ kind: "approval", icon: "check", stage: "Flag solution", actor: f.resolvedBy || mgr, role: "Sales Manager", detail: f.solution });
      if (f.resolved) ms.push({ kind: "approval", icon: "check", stage: "Flag resolved", actor: f.raisedBy, role: f.raisedByRole || "SPOC", detail: "Flag marked resolved." });
    });
    var total = ms.length;
    ms.forEach(function (e, i) {
      if (!e.at) {
        var daysAgo = Math.max(0, Math.round(r.age * (1 - (i / Math.max(1, total - 1)))));
        e.at = fmt(daysAgo, 9 + (i % 8), (i * 13) % 60);
      }
    });
    ms[ms.length - 1].current = true;
    REQUIREMENT_TIMELINES[r.id] = ms;
  });
})();

/* ---------- RBAC: ADMIN_USERS / GROUPS / PERMISSION_SECTIONS ---------- */
const PERMISSION_SECTIONS = [
  { id: "req", label: "Requirements", actions: ["view", "create", "edit", "delete"] },
  { id: "review", label: "Review & Gate", actions: ["view", "approve", "veto"] },
  { id: "lab", label: "Lab Work", actions: ["view", "acknowledge", "accept", "advance"] },
  { id: "dispatch", label: "Dispatch", actions: ["view", "generate", "approve"] },
  { id: "intel", label: "Client Intelligence", actions: ["view"] },
  { id: "reports", label: "Reports", actions: ["view", "export"] },
  { id: "admin", label: "Administration", actions: ["view", "manage"] },
];
const GROUPS = [
  { id: "G-SALES", name: "Sales", members: 8, perms: { req: ["view","create","edit"], review: ["view"], intel: [], reports: ["view","export"], dispatch: ["view","approve"] } },
  { id: "G-SALESMGR", name: "Sales Managers", members: 3, perms: { req: ["view","create","edit","delete"], review: ["view","approve","veto"], intel: ["view"], reports: ["view","export"], dispatch: ["view","approve"] } },
  { id: "G-LAB", name: "Lab", members: 6, perms: { lab: ["view","acknowledge","advance"], dispatch: ["view","generate"], req: ["view"] } },
  { id: "G-LABMGR", name: "Lab Managers", members: 2, perms: { lab: ["view","acknowledge","accept","advance"], dispatch: ["view","generate"], req: ["view"], reports: ["view","export"] } },
  { id: "G-MGMT", name: "Management", members: 4, perms: { req: ["view"], review: ["view"], intel: ["view"], reports: ["view","export"], lab: ["view"], dispatch: ["view"] } },
  { id: "G-ADMIN", name: "Platform Admins", members: 2, perms: { admin: ["view","manage"], req: ["view"], reports: ["view","export"] } },
];
const ADMIN_USERS = [
  { id: "U-01", name: "Hardik Shah",   email: "hardik@naturis.co",  group: "G-SALES",    role: "Sales SPOC",     brands: ["Nykaa","Pilgrim","Nua"], reportsTo: "Kunal Shah", status: "active" },
  { id: "U-02", name: "Kunal Shah",    email: "kunal@naturis.co",  group: "G-SALESMGR", role: "Sales Manager",  brands: ["All"], reportsTo: "Rahul Tandon", status: "active" },
  { id: "U-03", name: "Sumit Choudhary",     email: "sumit@naturis.co",  group: "G-LAB",      role: "Lab Technician", brands: ["All"], reportsTo: "Dipti OV", status: "active" },
  { id: "U-04", name: "Dipti OV",email: "dipti@naturis.co",  group: "G-LABMGR",   role: "Lab Manager",    brands: ["All"], reportsTo: "Rahul Tandon", status: "active" },
  { id: "U-05", name: "Rahul Tandon",   email: "rahul@naturis.co", group: "G-MGMT",     role: "Management",     brands: ["All"], reportsTo: "—", status: "active" },
  { id: "U-06", name: "Abhijit Jhala",  email: "abhijit@naturis.co",  group: "G-ADMIN",    role: "Platform Admin", brands: ["All"], reportsTo: "Rahul Tandon", status: "active" },
  { id: "U-07", name: "Divya Rao",     email: "divya@naturis.co",  group: "G-SALES",    role: "Sales SPOC",     brands: ["Plum","Asaya"], reportsTo: "Kunal Shah", status: "active" },
  { id: "U-08", name: "Tariq Khan",    email: "tariq@naturis.co",  group: "G-LAB",      role: "Lab Technician", brands: ["All"], reportsTo: "Dipti OV", status: "invited" },
  { id: "U-09", name: "Meera Iyer",    email: "meera@naturis.co",  group: "G-LAB",      role: "Lab Technician", brands: ["All"], reportsTo: "Dipti OV", status: "active" },
  { id: "U-10", name: "Arjun Nair",    email: "arjun@naturis.co",  group: "G-LAB",      role: "Lab Technician", brands: ["All"], reportsTo: "Dipti OV", status: "active" },
];

/* ---------- NOTIFICATION_RULES / NOTIFICATIONS ---------- */
const NOTIFICATION_RULES = [
  { id: "NR-01", trigger: "NPD/TT logged", account: "All", notify: ["Sales Manager"], channel: "In-app + Email", active: true },
  { id: "NR-02", trigger: "VVIP requirement created", account: "All VVIP", notify: ["All Management"], channel: "In-app + Email", active: true },
  { id: "NR-03", trigger: "SLA breach", account: "All", notify: ["Sales Manager","Lab Manager"], channel: "In-app + Email", active: true },
  { id: "NR-04", trigger: "Dispatch awaiting approval", account: "All", notify: ["SPOC"], channel: "In-app", active: true },
  { id: "NR-05", trigger: "Flag raised (high)", account: "All", notify: ["Sales Manager","Lab Manager"], channel: "In-app + Email", active: true },
  { id: "NR-06", trigger: "Nykaa activity", account: "ACC-01", notify: ["Hardik Shah","Kunal Shah"], channel: "In-app", active: true },
  { id: "NR-07", trigger: "Daily lab mailer", account: "All", notify: ["Lab Manager"], channel: "Email 08:00", active: false },
];
const NOTIFICATIONS = [
  { id: "N-101", type: "dispatch", severity: "info", title: "Dispatch awaiting your approval — SPF50 Mineral Fluid", body: "Lab prepared the dispatch note + 2 photos (docket DTDC-885214). Approve to send to Nykaa.", at: "9 Jun, 14:05", read: false, req: "REQ-2026-0351", rule: "NR-04" },
  { id: "N-102", type: "flag", severity: "med", title: "Lab query on Saffron Lux Eye Concentrate", body: "Saffron 0.5% tints the gel amber — confirm acceptable colour range with Nua.", at: "8 Jun, 16:40", read: false, req: "REQ-2026-0407", rule: "NR-05" },
  { id: "N-103", type: "flag", severity: "high", title: "Lab declined Ceramide Barrier Cream", body: "₹38/unit unviable for 1% ceramide — revise budget or descope. Back with Sales.", at: "8 Jun, 11:20", read: false, req: "REQ-2026-0412", rule: "NR-05" },
  { id: "N-104", type: "vvip", severity: "info", title: "VVIP requirement logged — Vitamin-C Brightening Serum", body: "Nykaa NPD, EU Q4 launch. Awaiting Sales Manager review.", at: "8 Jun, 10:15", read: false, req: "REQ-2026-0431", rule: "NR-02" },
  { id: "N-105", type: "flag", severity: "med", title: "Manager returned Redensyl Hair Growth Serum", body: "Need confirmed FG target + MOQ from Asaya before NPD bandwidth.", at: "7 Jun, 17:05", read: false, req: "REQ-2026-0429", rule: "NR-05" },
  { id: "N-106", type: "sla", severity: "high", title: "SLA breach — Coconut Milk Body Lotion", body: "Client unresponsive 9 days post-dispatch; lab phase 4d over budget.", at: "7 Jun, 09:30", read: true, req: "REQ-2026-0340", rule: "NR-03" },
  { id: "N-107", type: "flag", severity: "high", title: "Material short on Keratin Repair Hair Mask — solution issued", body: "Kunal approved alternate supplier (Aarna Chem, 3-day lead). Slot moved to 14 Jun.", at: "6 Jun, 12:45", read: true, req: "REQ-2026-0375", rule: "NR-05" },
  { id: "N-108", type: "sla", severity: "info", title: "Stability update — Vitamin C Glow Serum", body: "Month 2/6 complete — all parameters ok. Next check 12 Jul.", at: "5 Jun, 08:00", read: true, req: "REQ-2026-0327", rule: "NR-03" },
  { id: "N-109", type: "dispatch", severity: "info", title: "Lab committed 25 Jun on Oud Renewal Night Cream", body: "VVIP · accepted with tentative sample date 25 Jun (jar lead 3d).", at: "4 Jun, 15:30", read: true, req: "REQ-2026-0401", rule: "NR-04" },
  { id: "N-110", type: "dispatch", severity: "info", title: "Client approved Kumkumadi Face Oil", body: "Nua approved the sample. Stability decision pending (TT — prompt).", at: "4 Jun, 11:10", read: true, req: "REQ-2026-0394", rule: "NR-04" },
];

/* ---------- expose namespace ---------- */
window.NaturisData = {
  ROLES, PROJECT_TYPES, SLA_MATRIX, FLAG_TYPES, FLAG_TYPE_COLOR, NTL_LIBRARY,
  ACCOUNTS, REQUIREMENTS, REQUIREMENT_TIMELINES, PERMISSION_SECTIONS, GROUPS,
  ADMIN_USERS, NOTIFICATION_RULES, NOTIFICATIONS, slaStatus, PHASE_OF,
  // status machine order (for steppers)
  STATUS_FLOW: ["Logged","Pending review","Approved","R&D assessing","R&D assessed","Acknowledged",
    "In assessment (RM/PM/Slot)","Accepted — date committed","Formulation","Trial","QC","Fill",
    "Ready for dispatch","Dispatch awaiting SPOC approval","Sent to client","Archived"],
  LAB_STAGES: ["Formulation sheet","Trial","QC","Fill","Ready"],
  RULEBOOK: [
    { pair: ["Salicylic Acid","Niacinamide"], severity: "warn", note: "Can reduce efficacy at low pH; buffer or separate phases." },
    { pair: ["Salicylic Acid","Anhydrous base"], severity: "error", note: "Crystallisation risk — use a hydro-alcoholic carrier." },
    { pair: ["L-Ascorbic Acid","Aqueous gel"], severity: "warn", note: "Oxidation risk; recommend airless pack + antioxidant network." },
    { pair: ["Retinol","Vitamin C"], severity: "warn", note: "pH conflict; consider AM/PM split or encapsulated retinol." },
    { pair: ["Zinc Oxide","Low pH"], severity: "warn", note: "Mineral filler may destabilise below pH 5." },
  ],
  VENDORS: ["PackPro Industries","GlassCraft Co.","EcoTube Pvt Ltd","Aurora Closures","Client-supplied"],
};

/* ============================================================
   NaturisStore — tiny observable store so the lifecycle "works".
   REQUIREMENTS is the canonical mutable array; mutations bump a
   version and the App root re-renders the whole tree.
   ============================================================ */
let _seq = 500;
var _evSeq = 900; // flags / queries / notifications — separate from requirement IDs
const _listeners = new Set();
function _bump() { _listeners.forEach(fn => fn()); }
window.NaturisStore = {
  subscribe(fn) { _listeners.add(fn); return () => _listeners.delete(fn); },
  nextId() { _seq += 1; return "REQ-2026-0" + _seq; },
  peekId() { return "REQ-2026-0" + (_seq + 1); },
  all() { return REQUIREMENTS; },
  get(id) { return REQUIREMENTS.find(r => r.id === id); },
  addRequirement(r) { REQUIREMENTS.unshift(r); this.log(r.id, { kind: "created", icon: "note", stage: "Intake", actor: r.submittedBy, role: "SPOC", at: "just now", detail: "Requirement logged from client brief.", current: true }); _bump(); return r; },
  update(id, patch) { const r = this.get(id); if (r) Object.assign(r, patch); _bump(); },
  setStatus(id, status, by) { const r = this.get(id); if (r) { r.status = status; this.log(id, { kind: "status", icon: "work", stage: status, actor: by || "System", role: "System", at: "just now", detail: "Status → " + status, current: true }); } _bump(); },
  // manager returns with a mandatory note → SPOC must clarify & resend
  returnToSpoc(id, note, by) { const r = this.get(id); if (r) { r.status = "Returned to SPOC"; r.returnNote = note; r.owner = "Sales SPOC"; this.log(id, { kind: "flag", icon: "alert", stage: "Returned to SPOC", actor: by, role: "Sales Manager", at: "just now", detail: "Returned: " + note, current: true }); this._notify(id, "flag", "med", id + " returned by your manager", note, "NR-02"); } _bump(); },
  resendForApproval(id, clarification, by) { const r = this.get(id); if (r) { r.status = "Pending review"; r.spocClarification = clarification; this.log(id, { kind: "approval", icon: "history", stage: "Resent for approval", actor: by, role: "SPOC", at: "just now", detail: "Clarified & resent: " + clarification, current: true }); this._notify(id, "queue", "info", id + " resent for your review", clarification, "NR-02"); } _bump(); },
  closeLost(id, reason, by) { const r = this.get(id); if (r) { r.status = "Archived"; r.lost = true; r.lostReason = reason; this.log(id, { kind: "status", icon: "archive", stage: "Closed — lost", actor: by, role: "SPOC", at: "just now", detail: "Closed as lost: " + reason, current: true }); this._notify(id, "flag", "med", id + " closed as lost", reason, "NR-04"); } _bump(); },
  markAllRead() { NOTIFICATIONS.forEach(n => { n.read = true; }); _bump(); },
  assign(id, tech, by) { const r = this.get(id); if (r) { r.tracker = tech; r.status = "Acknowledged"; r.owner = "Lab"; this.log(id, { kind: "assigned", icon: "team", stage: "Acknowledged & assigned", actor: by, role: "Lab Manager", at: "just now", detail: "Lab manager acknowledged — assigned to " + tech + ".", current: true }); this._notify(id, "queue", "info", id + " assigned to " + tech, "Acknowledged by the lab manager.", "NR-04"); } _bump(); },
  setDispatchField(id, key, val, by) { const r = this.get(id); if (r) { r.dispatch = r.dispatch || {}; r.dispatch[key] = val; this.log(id, { kind: "status", icon: "note", stage: "Dispatch record", actor: by || "Lab", role: "Lab", at: "just now", detail: ({ qcIntimation: "QC intimation", stabilityStart: "Stability start date", approvalStatus: "Approval status" }[key] || key) + " → " + val }); } _bump(); },
  setLabStage(id, stage, by) { const r = this.get(id); if (r) { r.labStage = stage; r.labStageLog = r.labStageLog || {}; r.labStageLog[stage] = { by: by, at: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }; const core = window.NaturisData.LAB_STAGE_TO_STATUS[stage]; if (core && ["Accepted — date committed", "Formulation", "Trial", "QC", "Fill", "Ready for dispatch"].includes(r.status)) r.status = core; this.log(id, { kind: "status", icon: "work", stage: stage, actor: by, role: "Lab", at: "just now", detail: "Live lab status → " + stage, current: true }); this._notify(id, "dispatch", "info", id + " — " + stage, "Live lab status updated. Visible to sales.", "NR-04"); } _bump(); },
  setPrePO(id, key, val, by) { const r = this.get(id); if (r) { r.prePO = r.prePO || {}; r.prePO[key] = val; const item = (window.NaturisData.PRE_PO_ITEMS.find(x => x[0] === key) || [])[1] || key; this.log(id, { kind: val ? "approval" : "status", icon: val ? "check" : "work", stage: "Pre-PO checklist", actor: by, role: "System", at: "just now", detail: item + (val ? " ✓ confirmed" : " un-ticked") }); const all = window.NaturisData.PRE_PO_ITEMS.every(x => r.prePO[x[0]]); if (all && !r.prePOComplete) { r.prePOComplete = true; this.log(id, { kind: "approval", icon: "star", stage: "Customer-ready", actor: "System", role: "System", at: "just now", detail: "Pre-PO checklist complete — customer-ready, awaiting PO.", current: true }); this._notify(id, "dispatch", "info", id + " is customer-ready — PO awaited", "All pre-PO checks done. Follow up for the PO.", "NR-04"); } if (!all) r.prePOComplete = false; } _bump(); },
  setVvipOverride(id, val, by) { const r = this.get(id); if (r) { this.addAudit({ actor: by, role: "Management", action: "VVIP override", target: id, field: "vvip", before: String(r.vvip), after: String(val), note: "Management override from command centre" }); r.vvip = val; this.log(id, { kind: "status", icon: "star", stage: "VVIP " + (val ? "set" : "removed"), actor: by, role: "Management", at: "just now", detail: "Management " + (val ? "marked this VVIP" : "removed VVIP") + " (override)." }); } _bump(); },
  addShipAddress(rec) { (window.NaturisData.SHIP_ADDRESSES = window.NaturisData.SHIP_ADDRESSES || []).unshift(rec); _bump(); },
  saveProfile(roleKey, patch, by) { const p = window.NaturisData.PROFILE_OF[roleKey]; if (p) { Object.assign(p, patch); this.addAudit({ actor: by || p.name, role: "Self", action: "Profile updated", target: p.empId, field: Object.keys(patch).join(", "), before: "—", after: "updated", note: "Edited from profile screen" }); } _bump(); },
  addFlag(id, flag) { const r = this.get(id); if (r) { flag.id = flag.id || ("F-" + (++_evSeq)); flag.resolved = false; r.flags.push(flag); r.manualFlag = true; this.log(id, { kind: "flag", icon: "flag", stage: "Flag", actor: flag.raisedBy, role: flag.raisedByRole || "SPOC", at: "just now", severity: flag.severity, detail: (flag.typeLabel || flag.type) + ": " + flag.text }); NOTIFICATIONS.unshift({ id: "N-" + (++_evSeq), type: "flag", severity: flag.severity, title: (flag.typeLabel || flag.type) + " flag on " + id, body: flag.text, at: "just now", read: false, req: id, rule: "NR-05" }); } _bump(); },
  setSeverity(id, flagId, severity) { const r = this.get(id); const f = r && r.flags.find(x => x.id === flagId); if (f) f.severity = severity; _bump(); },
  resolveFlag(id, flagId, solution, by) { const r = this.get(id); const f = r && r.flags.find(x => x.id === flagId); if (f) { f.solution = solution; f.resolvedBy = by; f.resolvedPending = true; } _bump(); },
  confirmResolve(id, flagId, by) { const r = this.get(id); const f = r && r.flags.find(x => x.id === flagId); if (f) { f.resolved = true; f.resolvedPending = false; this.log(id, { kind: "approval", icon: "check", stage: "Flag resolved", actor: by, role: "SPOC", at: "just now", detail: "Flag resolved: " + (f.solution || "") }); } _bump(); },
  log(id, ev) { (REQUIREMENT_TIMELINES[id] = REQUIREMENT_TIMELINES[id] || []).forEach(e => e.current = false); (REQUIREMENT_TIMELINES[id] = REQUIREMENT_TIMELINES[id] || []).push(ev); },
  // ---- lab lifecycle ----
  acknowledge(id, by) { const r = this.get(id); if (r) { r.status = "Acknowledged"; r.assigned = false; this.log(id, { kind: "handoff", icon: "incoming", stage: "Acknowledged", actor: by, role: "Lab", at: "just now", detail: "Lab acknowledged (seen & reviewed) — awaiting chemist assignment by the lab manager.", current: true }); this._notify(id, "queue", "info", id + " acknowledged — assign a chemist", "Reviewed by " + by + ". Assign it to a lab chemist.", "NR-04"); } _bump(); },
  assignChemist(id, chemist, by) { const r = this.get(id); if (r) { r.tracker = chemist; r.assigned = true; if (r.status !== "Acknowledged" && !["In evaluation"].includes(r.status)) r.status = "Acknowledged"; this.log(id, { kind: "assigned", icon: "team", stage: "Chemist assigned", actor: by, role: "Lab Manager", at: "just now", detail: "Assigned to " + chemist + " for evaluation.", current: true }); this._notify(id, "queue", "info", id + " assigned to " + chemist, "Lab manager assigned this query to you.", "NR-04"); } _bump(); },
  acceptCommit(id, days, by) { const r = this.get(id); if (r) { r.status = "Accepted — date committed"; r.committedDays = days; this.log(id, { kind: "approval", icon: "check", stage: "Accepted", actor: by, role: "Lab Mgr", at: "just now", detail: `Accepted at lab meeting — earliest dispatch ~${days}d.`, current: true }); NOTIFICATIONS.unshift({ id: "N-" + (++_evSeq), type: "dispatch", severity: "info", title: "Lab committed a date on " + id, body: `Earliest dispatch ~${days} days.`, at: "just now", read: false, req: id, rule: "NR-04" }); } _bump(); },
  sendBack(id, note, by) { const r = this.get(id); if (r) { r.status = "Returned — needs revision"; this.log(id, { kind: "flag", icon: "alert", stage: "Returned", actor: by, role: "Lab Mgr", at: "just now", severity: "med", detail: "Sent back: " + (note || "needs revision"), current: true }); } _bump(); },
  advanceStage(id, status, by) { const r = this.get(id); if (r) { r.status = status; this.log(id, { kind: "status", icon: "work", stage: status, actor: by, role: "Lab", at: "just now", detail: "Advanced to " + status, current: true }); } _bump(); },
  newIteration(id, delta, by) { const r = this.get(id); if (r && !["Archived", "In stability"].includes(r.status)) { const seq = (r.id.match(/\d{3,}$/) || ["001"])[0].slice(-3); const iter = (r.ncls.length + 1).toString().padStart(3, "0"); const code = `NCL-${seq}-${iter}`; r.ncls.forEach(n => n.status = "superseded"); r.ncls.push({ code, by, at: "just now", delta: delta || "New iteration", status: "current" }); r.currentNcl = code; r.iteration = (r.iteration || 1) + 1; r.status = "Formulation"; this.log(id, { kind: "status", icon: "history", stage: "Iteration " + r.iteration, actor: by, role: "Lab", at: "just now", detail: "New iteration " + code + (delta ? " — " + delta : "") + " (back to bench)", current: true }); } _bump(); },
  // ---- ownership + notify helpers ----
  _notify(id, type, sev, title, body, rule) { NOTIFICATIONS.unshift({ id: "N-" + (++_evSeq), type, severity: sev, title, body, at: "just now", read: false, req: id, rule: rule || "NR-04" }); },
  transferOwnership(id, to, by) { const r = this.get(id); if (r) { const from = r.owner || "Sales SPOC"; r.owner = to; this.log(id, { kind: "handoff", icon: "team", stage: "Ownership", actor: by, role: "System", at: "just now", detail: `Ownership: ${from} → ${to}` }); this._notify(id, "dispatch", "info", id + " changed hands", from + " → " + to + ".", "NR-04"); } _bump(); },
  // ---- evaluation ----
  startEvaluation(id, by) { const r = this.get(id); if (r) { r.status = "In evaluation"; r.evaluation = r.evaluation || { rm: "unset", pm: "unset", slot: "", availability: [] }; this.log(id, { kind: "status", icon: "work", stage: "Evaluation", actor: by, role: "Lab", at: "just now", detail: "Lab evaluation started (RM / PM / slot / availability).", current: true }); } _bump(); },
  setEvaluation(id, patch) { const r = this.get(id); if (r) { r.evaluation = Object.assign({ rm: "unset", pm: "unset", slot: "", availability: [] }, r.evaluation, patch); } _bump(); },
  // ---- decision ----
  accept(id, date, by) { const r = this.get(id); if (r) { r.status = "Accepted — date committed"; r.committedDate = date; r.owner = "Lab"; this.log(id, { kind: "approval", icon: "check", stage: "Accepted", actor: by, role: "Lab", at: "just now", detail: `Accepted — tentative sample date ${date}.`, current: true }); this._notify(id, "dispatch", "info", "Lab accepted " + id, "Tentative sample date " + date + ".", "NR-04"); } _bump(); },
  decline(id, reason, by) { const r = this.get(id); if (r) { r.status = "Declined"; r.declineReason = reason; r.owner = "Sales SPOC"; this.log(id, { kind: "flag", icon: "alert", stage: "Declined", actor: by, role: "Lab", at: "just now", severity: "high", detail: "Declined — " + reason, current: true }); this._notify(id, "flag", "high", "Lab declined " + id, reason, "NR-05"); } _bump(); },
  raiseQuery(id, text, by) { const r = this.get(id); if (r) { r.status = "Query raised"; (r.queries = r.queries || []).push({ id: "Q-" + (++_evSeq), text, by, at: "just now", resolved: false, answer: "" }); r.owner = "Sales SPOC"; this.log(id, { kind: "flag", icon: "note", stage: "Query raised", actor: by, role: "Lab", at: "just now", severity: "med", detail: "Query to SPOC: " + text, current: true }); this._notify(id, "unresponsive", "med", "Lab raised a query on " + id, text, "NR-05"); } _bump(); },
  resolveQuery(id, qid, answer, by) { const r = this.get(id); const q = r && (r.queries || []).find(x => x.id === qid); if (q) { q.resolved = true; q.answer = answer; q.answeredBy = by; const remaining = (r.queries || []).filter(x => !x.resolved).length; if (!remaining) { r.status = "Acknowledged"; r.owner = "Lab"; } this.log(id, { kind: "approval", icon: "check", stage: "Query resolved", actor: by, role: "SPOC", at: "just now", detail: "Query answered: " + answer + (remaining ? ` — ${remaining} still open.` : " — all answered, back to lab."), current: true }); this._notify(id, "dispatch", "info", "Query resolved on " + id, remaining ? remaining + " quer" + (remaining > 1 ? "ies" : "y") + " still open." : "All queries answered — back with the lab.", "NR-05"); } _bump(); },
  // ---- dispatch ----
  dispatch(id, payload, by) { const r = this.get(id); if (r) { r.status = "Dispatch awaiting SPOC approval"; r.dispatch = Object.assign({ note: true, photos: 0, docket: "" }, payload); this.log(id, { kind: "handoff", icon: "dispatch", stage: "Dispatch drafted", actor: by, role: "Lab", at: "just now", detail: "Dispatch note + photos ready" + (payload && payload.docket ? " · docket " + payload.docket : "") + " — awaiting SPOC approval.", current: true }); this._notify(id, "dispatch", "info", "Dispatch awaiting your approval — " + id, "Note + " + ((payload && payload.photos) || 0) + " photo(s)" + (payload && payload.docket ? " · docket " + payload.docket : "") + ".", "NR-04"); } _bump(); },
  sendToClient(id, by) { const r = this.get(id); if (r) { r.status = "Sent to client"; r.owner = "Sales SPOC"; r.dispatchedOn = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); this.log(id, { kind: "handoff", icon: "dispatch", stage: "Sent to client", actor: by, role: "SPOC", at: "just now", detail: "SPOC approved — sample sent to client. Ownership with Sales.", current: true }); } _bump(); },
  // ---- client feedback / iteration outcome ----
  clientOutcome(id, outcome, by) { const r = this.get(id); if (r) { if (outcome === "approved") { r.status = "Client approved"; this.log(id, { kind: "approval", icon: "check", stage: "Client approved", actor: by, role: "SPOC", at: "just now", detail: "Client approved the sample.", current: true }); } else if (outcome === "rejected") { r.status = "Rejected"; this.log(id, { kind: "flag", icon: "x", stage: "Rejected", actor: by, role: "SPOC", at: "just now", severity: "high", detail: "Client rejected.", current: true }); } } _bump(); },
  // ---- stability ----
  startStability(id, months, by) { const r = this.get(id); if (r) { r.stability = { months, month: 0, status: "running", startedAt: "just now" }; r.status = "In stability"; this.log(id, { kind: "status", icon: "clock", stage: "Stability started", actor: by, role: "Lab", at: "just now", detail: `${months}-month stability cycle initiated.`, current: true }); } _bump(); },
  advanceStability(id, by) { const r = this.get(id); if (r && r.stability) { r.stability.month = Math.min(r.stability.months, r.stability.month + 1); if (r.stability.month >= r.stability.months) r.stability.status = "passed"; this.log(id, { kind: "status", icon: "clock", stage: "Stability M" + r.stability.month, actor: by || "System", role: "Lab", at: "just now", detail: `Stability month ${r.stability.month}/${r.stability.months} ${r.stability.status === "passed" ? "— passed ✓" : "ok"}.`, current: true }); this._notify(id, "sla", "info", "Stability update — " + id, `Month ${r.stability.month}/${r.stability.months}.`, "NR-03"); } _bump(); },
  // ---- post-stability deliverables ----
  setDeliverable(id, key, by) { const r = this.get(id); if (r) { r.deliverables = Object.assign({}, r.deliverables, { [key]: { done: true, by, at: "just now" } }); this.log(id, { kind: "approval", icon: "note", stage: key === "ingredient" ? "Ingredient sheet" : "Marketing brief", actor: by, role: "Lab", at: "just now", detail: (key === "ingredient" ? "Ingredient sheet" : "Marketing brief") + " submitted." }); } _bump(); },
  closeRequirement(id, by) { const r = this.get(id); if (r) { r.status = "Archived"; this.log(id, { kind: "approval", icon: "archive", stage: "Closed", actor: by, role: "Lab Mgr", at: "just now", detail: "Project closed & archived.", current: true }); } _bump(); },
};

/* project-type → assigned lab-tech desk (lab manager looped into all) */
window.NaturisData.LAB_DESKS = {
  EPD: { tech: "Sumit Choudhary", initials: "SC" },
  REN: { tech: "Meera Iyer", initials: "MI" },
  TT:  { tech: "Tariq Khan", initials: "TK" },
  NPD: { tech: "Arjun Nair", initials: "AN" },
};
window.NaturisData.LAB_MANAGER = "Dipti OV";
window.NaturisData.LAB_CHEMISTS = ["Sumit Choudhary", "Meera Iyer", "Tariq Khan", "Arjun Nair", "Ritu Sharma", "Karan Malhotra"];
window.NaturisData.STATION_OPERATORS = ["Sanjay", "Sushma", "Vishal Charak", "Koyal", "Khushi", "Sparsh", "Amit", "Sunita"];
/* ---- 6-month stability tracking log (matches the lab stability sheet) ---- */
window.NaturisData.STABILITY_RUNS = [
  { sno: 1, charged: "06-01-2026", product: "10% Vit.C Serum (with Label)", batch: "NCL 16450", mfg: "27-12-2025", initial: "06-01-2026", m: ["07-02-2026", "08-03-2026", "09-04-2026", "10-05-2026", "11-06-2026", "12-07-2026"], done: 5, location: "NC/RD/025/O", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 2, charged: "07-01-2026", product: "10% Vit.C Serum (without Label)", batch: "NCL 16450", mfg: "27-12-2025", initial: "07-01-2026", m: ["08-02-2026", "09-03-2026", "10-04-2026", "11-05-2026", "12-06-2026", "13-07-2026"], done: 5, location: "NC/RD/025M", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 3, charged: "08-01-2026", product: "Salon Range Gold Face Scrub", batch: "NCL 15722", mfg: "02-01-2026", initial: "08-01-2026", m: ["09-02-2026", "10-03-2026", "11-04-2026", "12-05-2026", "13-06-2026", "14-07-2026"], done: 5, location: "NC/RD/025/J", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 4, charged: "08-01-2026", product: "Salon Range Red vine Day Cream", batch: "NCL 15794", mfg: "17-12-2025", initial: "08-01-2026", m: ["09-02-2026", "10-03-2026", "11-04-2026", "12-05-2026", "13-06-2026", "14-07-2026"], done: 5, location: "NC/RD/025/J", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 5, charged: "08-01-2026", product: "Salon Range Red vine Massage Cream", batch: "NCL 15727", mfg: "13-12-2025", initial: "08-01-2026", m: ["09-02-2026", "10-03-2026", "11-04-2026", "12-05-2026", "13-06-2026", "14-07-2026"], done: 5, location: "NC/RD/025/H", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 6, charged: "08-01-2026", product: "Salon Range Red vine Face Scrub", batch: "NCL 15728", mfg: "15-12-2025", initial: "08-01-2026", m: ["09-02-2026", "10-03-2026", "11-04-2026", "12-05-2026", "13-06-2026", "14-07-2026"], done: 5, location: "NC/RD/025/I", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 7, charged: "08-01-2026", product: "Salon Range Gold Day Cream", batch: "NCL 15794", mfg: "13-12-2025", initial: "08-01-2026", m: ["09-02-2026", "10-03-2026", "11-04-2026", "12-05-2026", "13-06-2026", "14-07-2026"], done: 5, location: "NC/RD/025/L", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 8, charged: "08-01-2026", product: "Salon Range Gold Cream Cleanser", batch: "NCL 15721", mfg: "05-01-2026", initial: "08-01-2026", m: ["09-02-2026", "10-03-2026", "11-04-2026", "12-05-2026", "13-06-2026", "14-07-2026"], done: 5, location: "NC/RD/025/K", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 9, charged: "10-01-2026", product: "Salon Range Vitamin C Scrub", batch: "NCL 15717", mfg: "12-12-2025", initial: "10-01-2026", m: ["11-02-2026", "12-03-2026", "13-04-2026", "14-05-2026", "15-06-2026", "16-07-2026"], done: 4, location: "NC/RD/026/Q", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 10, charged: "10-01-2026", product: "Salon Range Vit.C cream Cleanser", batch: "NCL 15716", mfg: "12-12-2025", initial: "10-01-2026", m: ["11-02-2026", "12-03-2026", "13-04-2026", "14-05-2026", "15-06-2026", "16-07-2026"], done: 4, location: "NC/RD/026/J", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 11, charged: "10-01-2026", product: "Salon Range Redvine Cream Cleanser", batch: "NCL 15725", mfg: "16-12-2025", initial: "10-01-2026", m: ["11-02-2026", "12-03-2026", "13-04-2026", "14-05-2026", "15-06-2026", "16-07-2026"], done: 4, location: "NC/RD/026/8", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
  { sno: 12, charged: "10-01-2026", product: "Salon Range Redvine Toning Gel", batch: "NCL 15729", mfg: "13-12-2025", initial: "10-01-2026", m: ["11-02-2026", "12-03-2026", "13-04-2026", "14-05-2026", "15-06-2026", "16-07-2026"], done: 4, location: "NC/RD/026/5", client: "Pilgrim", type: "Normal X 1", grade: "A+", condition: "RT + 40/75°C" },
];
window.NaturisData.NATURIS_LAB_ADDR = ["Naturis Cosmetic Pvt. Ltd. (Lab)", "Plot No-1, EPIP", "SIDCO Industrial complex Bari Brahmana", "Jammu, J&K-181133", "PH- 8899 008 965"];
window.NaturisData.SHIP_ADDRESSES = [
  { client: "Plum", contact: "Ms. Dolly Suri", to: ["Pureplay Skin Sciences", "B-1201, Shalimar Gallant, Mahanagar", "Lucknow 226006", "PH: 84477 30688"], status: "active" },
  { client: "Pilgrim", contact: "Mr. Anurag Singh", to: ["Heavenly Secrets Pvt. Ltd.", "WeWork, Embassy TechVillage", "Bengaluru 560103", "PH: 98860 11221"], status: "active" },
  { client: "Nykaa", contact: "Ms. Priya Nair", to: ["FSN E-Commerce Ventures", "104 Vinod Silicon Bldg, Andheri E", "Mumbai 400069", "PH: 90040 55667"], status: "active" },
  { client: "Asaya", contact: "Ms. Akaljyot Kour", to: ["Asaya Care", "39, 2nd floor, The Lilac 2, Sector 49", "Gurugram, Haryana 122001", "PH: 91725 90285"], status: "active" },
  { client: "Nua", contact: "Ms. Ravneet Sethi", to: ["Nirvana Being Pvt. Ltd.", "Vasant Kunj", "New Delhi 110070", "PH: 99100 33445"], status: "active" },
  { client: "Mamaearth", contact: "Jigna Patel", to: ["Honasa Consumer Ltd.", "Capital Cyberscape, Sector 59", "Gurugram 122102", "PH: 89281 41879"], status: "active" },
  { client: "MyGlamm", contact: "Sanghvi Beauty & Technologies", to: ["The Good Glamm Group", "Phoenix Paragon Plaza, Kurla", "Mumbai 400070", "PH: 89281 41879"], status: "active" },
  { client: "Belora Cosmetic", contact: "Ms. Ainara", to: ["Belora Cosmetic", "890P, Sector 43, Opp. Galaxy Apts", "Gurugram 122001", "PH: 91725 90285"], status: "active" },
  { client: "TNW — The Natural Wash", contact: "Asha", to: ["A-92 First Floor, Wazirpur", "Ashok Vihar", "Delhi 110052", "PH: 93193 95404"], status: "discarded" },
];
window.NaturisData.LAB_PLANNER = "Asha Rane";

/* ---------- Client fit score (4 dimensions, management-only) ---------- */
const FIT_SCORES = {
  "ACC-01": { bp: 9, pf: 8, ei: 8, sv: 9, history: [{ at: "12 May 2026", by: "Rahul Tandon", final: 8.5, note: "Anchor account — raised SV after Q4 plan." }, { at: "2 Apr 2026", by: "Rahul Tandon", final: 7.8, note: "Initial scoring." }] },
  "ACC-02": { bp: 7, pf: 8, ei: 7, sv: 6, history: [{ at: "20 May 2026", by: "Rahul Tandon", final: 7.0, note: "Founder-led, fast." }] },
  "ACC-03": { bp: 6, pf: 7, ei: 6, sv: 5, history: [{ at: "18 May 2026", by: "Rahul Tandon", final: 6.0, note: "Trend-driven, mid potential." }] },
  "ACC-04": { bp: 4, pf: 5, ei: 3, sv: 4, history: [{ at: "10 May 2026", by: "Rahul Tandon", final: 4.0, note: "Watch SLA friction." }] },
  "ACC-05": { bp: 9, pf: 9, ei: 9, sv: 10, history: [{ at: "30 May 2026", by: "Rahul Tandon", final: 9.25, note: "VVIP gulf luxury — prioritise." }] },
};
function fitFinal(s) { return Math.round(((s.bp + s.pf + s.ei + s.sv) * 0.25) * 100) / 100; }
function fitCategory(final) { return final <= 3 ? { label: "Low fit", hint: "avoid / low priority", tone: "rejected" } : final <= 6 ? { label: "Medium fit", hint: "can be explored", tone: "review" } : final <= 8 ? { label: "High fit", hint: "focus", tone: "lab" } : { label: "Ideal client", hint: "prioritize aggressively", tone: "approved" }; }
window.NaturisData.FIT_SCORES = FIT_SCORES;
window.NaturisData.fitFinal = fitFinal;
window.NaturisData.fitCategory = fitCategory;
window.NaturisStore.setFit = function (accId, dim, val, by) {
  const s = FIT_SCORES[accId] || (FIT_SCORES[accId] = { bp: 5, pf: 5, ei: 5, sv: 5, history: [] });
  const dimLabel = { bp: "Business Potential", pf: "Product Fit", ei: "Engagement & Intent", sv: "Strategic Value" }[dim] || dim;
  if (window.NaturisStore.addAudit) window.NaturisStore.addAudit({ actor: by || "Rahul Tandon", role: "Management", action: "Fit score edited", target: accId, field: dimLabel, before: String(s[dim]), after: String(val) });
  s[dim] = val;
  s.history.unshift({ at: "just now", by: by || "Rahul Tandon", final: fitFinal(s), note: `Updated ${dim.toUpperCase()} → ${val}` });
  if (s.history.length > 12) s.history.length = 12;
  _bump();
};

/* ---------- Naturis share of each brand's SKU portfolio ---------- */
window.NaturisData.ACCOUNT_SHARE = {
  "ACC-01": { total: 60, made: 14, missed: 5, cantMake: 8, canMakeNotMaking: 33 }, // Nykaa
  "ACC-02": { total: 20, made: 6,  missed: 2, cantMake: 2, canMakeNotMaking: 10 }, // Plum
  "ACC-03": { total: 35, made: 9,  missed: 4, cantMake: 3, canMakeNotMaking: 19 }, // Pilgrim
  "ACC-04": { total: 12, made: 3,  missed: 1, cantMake: 2, canMakeNotMaking: 6  }, // Asaya
  "ACC-05": { total: 18, made: 7,  missed: 1, cantMake: 1, canMakeNotMaking: 9  }, // Nua
};

/* ---------- Past formulations the AI matches against ---------- */
window.NaturisData.PAST_FORMULATIONS = [
  { code: "NTL-SR-014", name: "Hydra Brightening Serum", category: "Serum", base: "Aqueous gel", actives: ["Niacinamide", "Hyaluronic Acid"], soldTo: "Nykaa", note: "Workhorse brightening serum base." },
  { code: "NCL-019-004", name: "Vit-C Glow Serum", category: "Serum", base: "Aqueous gel", actives: ["L-Ascorbic Acid", "Ferulic Acid"], soldTo: "Pilgrim", note: "Antioxidant serum, airless pack." },
  { code: "NTL-CR-006", name: "Rich Repair Cream", category: "Cream", base: "O/W emulsion", actives: ["Ceramide", "Shea Butter"], soldTo: "Nua", note: "Barrier cream, mature skin." },
  { code: "NCL-077-002", name: "Peptide Firming Cream", category: "Cream", base: "O/W emulsion", actives: ["Matrixyl 3000", "Bakuchiol"], soldTo: "Nykaa", note: "Anti-ageing, premium." },
  { code: "NTL-CL-022", name: "Gentle Gel Cleanser", category: "Cleanser", base: "Surfactant blend", actives: ["Aloe Vera", "Panthenol"], soldTo: "Plum", note: "Sulphate-free daily cleanser." },
  { code: "NCL-088-003", name: "Charcoal Detox Wash", category: "Cleanser", base: "Surfactant blend", actives: ["Activated Charcoal", "Salicylic Acid"], soldTo: "Asaya", note: "Oily / acne skin." },
  { code: "NTL-LP-009", name: "Velvet Matte Lip", category: "Lip", base: "Anhydrous", actives: ["Vitamin E"], soldTo: "Pilgrim", note: "Transfer-resistant matte." },
  { code: "NTL-SN-031", name: "Mineral Sun Fluid", category: "Sun Care", base: "Hybrid emulsion", actives: ["Zinc Oxide", "Niacinamide"], soldTo: "Nykaa", note: "SPF50, no white cast." },
];

/* suggest top-3 similar formulations, rulebook-aware */
window.suggestFormulations = function (category, activeNames, base) {
  const acts = (activeNames || []).map(a => (a || "").toLowerCase()).filter(Boolean);
  const scored = window.NaturisData.PAST_FORMULATIONS.map(f => {
    let score = 0;
    if (f.category === category) score += 45;
    if (f.base === base) score += 15;
    const overlap = f.actives.filter(fa => acts.some(a => fa.toLowerCase().includes(a.split(" ")[0]) || a.includes(fa.toLowerCase().split(" ")[0])));
    score += overlap.length * 18;
    // missing actives the client wants that this formula lacks → the "change 1 active" story
    const missing = acts.filter(a => !f.actives.some(fa => fa.toLowerCase().includes(a.split(" ")[0])));
    score += Math.max(0, 22 - missing.length * 8);
    const ruleHits = window.checkRulebook([...f.actives, ...(activeNames || [])], base);
    let delta;
    if (overlap.length && missing.length === 0) delta = "Exact actives match — reuse as-is (EPD).";
    else if (missing.length === 1) delta = `Add ${activeNames.find(a => !f.actives.some(fa => fa.toLowerCase().includes(a.toLowerCase().split(" ")[0]))) || "1 active"} → renovation.`;
    else if (overlap.length) delta = `Shares ${overlap.join(", ")}; adjust ${missing.length} active(s).`;
    else delta = "Same category base — new development from here.";
    return { ...f, score: Math.min(99, Math.round(score)), delta, ruleWarn: ruleHits[0] };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
};

/* ---------- Category-wise actives & concerns (drive the intake form) ---------- */
window.NaturisData.CATEGORY_ACTIVES = {
  "Skin Care": ["Niacinamide", "Vitamin C (L-Ascorbic Acid)", "Hyaluronic Acid", "Salicylic Acid", "Retinol", "Bakuchiol", "Ceramide", "Peptides (Matrixyl)", "Glycolic Acid", "Alpha Arbutin", "Kojic Acid", "Vitamin E", "Azelaic Acid", "Centella (Cica)"],
  "Hair Care": ["Hydrolysed Keratin", "Biotin", "Argan Oil", "Caffeine", "Redensyl", "Niacinamide", "Salicylic Acid", "Ketoconazole", "Amino Acids", "Onion Extract", "Rosemary Oil"],
  "Sun Care": ["Zinc Oxide", "Titanium Dioxide", "Niacinamide", "Vitamin E", "Avobenzone", "Iron Oxides"],
  "Colour": ["Vitamin E", "Shea Butter", "Hyaluronic Acid", "Jojoba Oil", "Mica / Pigments"],
  "Body Care": ["Shea Butter", "Coconut", "Niacinamide", "Urea", "Lactic Acid", "Vitamin E"],
};
window.NaturisData.CATEGORY_CONCERNS = {
  "Skin Care": ["Acne", "Pigmentation", "Dryness", "Anti-ageing", "Brightening", "Sensitivity", "Pore minimising", "Oil control", "Redness", "Fine lines", "Dark circles", "Oxidation"],
  "Hair Care": ["Dandruff", "Hair fall", "Frizz", "Scalp health", "Dryness", "Damage", "Oily scalp", "Split ends"],
  "Sun Care": ["Sun protection", "White cast", "SPF stability", "Pilling", "Sensitivity"],
  "Colour": ["Shade match", "Transfer", "Bleeding", "Long wear", "Dryness"],
  "Body Care": ["Dryness", "Tan removal", "Fragrance", "Sun protection", "Firming"],
};

/* ---------- Per-requirement communication logs (SPOC-captured) ---------- */
window.NaturisData.COMM_LOGS = {
  "REQ-2026-0351": [
    { mode: "call", who: "Hardik Shah", at: "9 Jun, 12:30", text: "Nykaa confirmed launch PO will follow sample approval; dispatch this week.", milestone: "Pre-PO confirmed" },
    { mode: "email", who: "Hardik Shah", at: "28 May, 10:02", text: "Shared in-vitro SPF50 report; client thrilled with no-white-cast result.", milestone: null },
    { mode: "note", who: "System (AI summary)", at: "20 May", text: "4 calls summarised: texture is the deciding factor; benchmark is the Korean fluid reference.", milestone: null }],
  "REQ-2026-0407": [
    { mode: "call", who: "Hardik Shah", at: "9 Jun, 10:15", text: "Asked Nua founder office about amber tint tolerance — reverting by Friday.", milestone: null },
    { mode: "note", who: "Hardik Shah", at: "31 May, 17:40", text: "Brief captured at Nua office; saffron 0.5% is the story ingredient, non-negotiable.", milestone: "Brief confirmed" }],
  "REQ-2026-0431": [
    { mode: "email", who: "Hardik Shah", at: "9 Jun, 09:50", text: "Sent EU CPSR checklist to Nykaa regulatory; awaiting their counsel's view.", milestone: null },
    { mode: "call", who: "Hardik Shah", at: "8 Jun, 11:30", text: "Nykaa wants 15% L-AA headline; open to airless pack for stability.", milestone: "Brief confirmed" }],
  "REQ-2026-0364": [
    { mode: "screenshot", who: "Hardik Shah", at: "6 Jun, 18:20", text: "Client WhatsApp: texture lovely — checking spot results with panel this week.", milestone: null },
    { mode: "email", who: "Hardik Shah", at: "31 May, 09:10", text: "Dispatch note + docket shared with Pilgrim; panel test started.", milestone: "Sample delivered" }],
  "REQ-2026-0382": [
    { mode: "call", who: "Hardik Shah", at: "4 Jun, 16:00", text: "Walked client through iteration 2 changes — natural vanillin approved on call.", milestone: null },
    { mode: "screenshot", who: "Hardik Shah", at: "30 May, 14:45", text: "Client WhatsApp on trial 1: shade is perfect, fragrance reads synthetic.", milestone: "Iteration requested" },
    { mode: "note", who: "Hardik Shah", at: "13 May, 12:00", text: "Shade chip ΔE<1 against client's rosewood reference confirmed at intake.", milestone: null }],
  "REQ-2026-0401": [
    { mode: "call", who: "Hardik Shah", at: "4 Jun, 15:00", text: "Confirmed 25 Jun tentative date with Nua; jar lead-time flagged transparently.", milestone: "Date committed" },
    { mode: "email", who: "Hardik Shah", at: "29 May, 10:30", text: "Received client formula + oud fragrance system under NDA.", milestone: "Brief confirmed" }],
  "REQ-2026-0340": [
    { mode: "email", who: "Divya Rao", at: "8 Jun, 09:00", text: "Second follow-up to Asaya on dispatched sample — no response yet.", milestone: null },
    { mode: "call", who: "Divya Rao", at: "2 Jun, 12:20", text: "Reception confirmed sample received at Asaya HQ; feedback owner on leave.", milestone: null }],
  "REQ-2026-0327": [
    { mode: "call", who: "Hardik Shah", at: "5 Jun, 11:00", text: "Shared stability M2 update with Pilgrim — on track for festive launch.", milestone: null },
    { mode: "email", who: "Hardik Shah", at: "10 May, 10:00", text: "Client approved iteration 2 glow level; initiating 6-month stability.", milestone: "Client approved" }],
};

/* ---------- Drafts (save-to-draft so the form isn't lost) ---------- */
window.NaturisDrafts = {
  KEY: "naturis.draft.intake",
  save(payload) { try { localStorage.setItem(this.KEY, JSON.stringify({ payload, at: Date.now() })); } catch (e) {} },
  load() { try { const r = localStorage.getItem(this.KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } },
  clear() { try { localStorage.removeItem(this.KEY); } catch (e) {} },
};

/* ---------- Immutable audit trail (override / system-data changes) ---------- */
const AUDIT = [
  Object.freeze({ id: "AUD-007", at: "6 Jun 2026, 11:42", actor: "Kunal Shah", role: "Sales Manager", action: "Project type override", target: "REQ-2026-0375", field: "projectType", before: "EPD", after: "REN", note: "Keratin rework counts as renovation — 1–2 mods on the base." }),
  Object.freeze({ id: "AUD-008", at: "4 Jun 2026, 09:15", actor: "Kunal Shah", role: "Sales Manager", action: "VVIP override", target: "REQ-2026-0418", field: "vvip", before: "true", after: "false", note: "Plum booster is standard priority — VVIP reserved for launch heroes." }),
  Object.freeze({ id: "AUD-001", at: "9 Jun 2026, 11:40", actor: "Kunal Shah", role: "Sales Manager", action: "VVIP override", target: "REQ-2026-0431", field: "vvip", before: "false", after: "true", note: "Nykaa EU gifting hero — fast-track, Management notified." }),
  Object.freeze({ id: "AUD-002", at: "7 Jun 2026, 17:05", actor: "Kunal Shah", role: "Sales Manager", action: "Review decision", target: "REQ-2026-0429", field: "status", before: "Pending review", after: "Returned to SPOC", note: "Need confirmed FG target + MOQ before NPD bandwidth." }),
  Object.freeze({ id: "AUD-003", at: "6 Jun 2026, 10:12", actor: "Kunal Shah", role: "Sales Manager", action: "Review decision", target: "REQ-2026-0428", field: "status", before: "Pending review", after: "Approved", note: "Optional REN gate — cleared same day." }),
  Object.freeze({ id: "AUD-004", at: "11 May 2026, 12:30", actor: "Kunal Shah", role: "Sales Manager", action: "Project type override", target: "REQ-2026-0382", field: "projectType", before: "EPD", after: "REN", note: "Shade + matte change exceeds exact reuse — reclassified." }),
  Object.freeze({ id: "AUD-005", at: "12 May 2026, 09:20", actor: "Rahul Tandon", role: "Management", action: "Fit score edited", target: "ACC-01 · Nykaa", field: "Strategic Value", before: "8", after: "9", note: "Raised SV after Q4 gifting plan." }),
  Object.freeze({ id: "AUD-006", at: "20 May 2026, 15:45", actor: "Rahul Tandon", role: "Management", action: "Client intelligence edited", target: "ACC-02 · Plum", field: "commPref", before: "Email", after: "WhatsApp + email", note: "Founder prefers WhatsApp for speed." }),
];
window.NaturisStore.audit = AUDIT;
window.NaturisStore.addAudit = function (rec) {
  const r = Object.freeze(Object.assign({ id: "AUD-" + (++_seq), at: "just now" }, rec));
  AUDIT.unshift(r); _bump(); return r;
};

/* ---------- Regions + rich person profiles ---------- */
window.NaturisData.REGIONS = ["North", "South", "East", "West", "Central"];
/* 10-stage live lab status — exactly Dhruv's list (12 Jun lab meeting) */
window.NaturisData.LAB_LIVE_STAGES = [
  "RM / PM pending", "Sheet pending", "Sheet ready", "In trials", "QC testing pending",
  "QC testing in process", "Evaluation pending", "Rework / retrial", "Ready to send", "Dispatched",
];
window.NaturisData.LAB_STAGE_TO_STATUS = {
  "RM / PM pending": "Formulation", "Sheet pending": "Formulation", "Sheet ready": "Formulation",
  "In trials": "Trial", "QC testing pending": "QC", "QC testing in process": "QC", "Evaluation pending": "QC",
  "Rework / retrial": "Trial", "Ready to send": "Ready for dispatch",
};
window.NaturisData.FAMILY_CATEGORIES = {
  "Skin Care": ["Serum", "Cream", "Moisturiser", "Cleanser", "Toner", "Face Oil", "Mask", "Lotion"],
  "Hair Care": ["Shampoo", "Conditioner", "Hair Oil", "Hair Serum", "Hair Mask", "Scalp Tonic"],
  "Colour": ["Lipstick", "Lip Tint", "Foundation", "Kajal", "Blush"],
  "Sun Care": ["Sunscreen Lotion", "SPF Fluid", "SPF Stick", "After-Sun Gel"],
  "Body Care": ["Body Lotion", "Body Wash", "Body Butter", "Body Oil", "Deodorant"],
};
/* category market intelligence — manually maintained by management (per 11 Jun meeting) */
window.NaturisData.CATEGORY_MARKET = [
  { category: "Shampoo", avgMrp: "₹449", avgSp: "₹312", avgQty: "250ml", perMl: "₹1.25" },
  { category: "Serum", avgMrp: "₹699", avgSp: "₹489", avgQty: "30ml", perMl: "₹16.30" },
  { category: "Moisturiser", avgMrp: "₹499", avgSp: "₹374", avgQty: "50ml", perMl: "₹7.48" },
  { category: "Cleanser", avgMrp: "₹349", avgSp: "₹262", avgQty: "100ml", perMl: "₹2.62" },
  { category: "Face Oil", avgMrp: "₹899", avgSp: "₹674", avgQty: "30ml", perMl: "₹22.47" },
  { category: "Sunscreen Lotion", avgMrp: "₹549", avgSp: "₹412", avgQty: "50ml", perMl: "₹8.24" },
];
/* Pre-PO checklist definition — owner per item (per Rahul's handwritten sheet, 11 Jun meeting) */
window.NaturisData.PRE_PO_ITEMS = [
  ["cost", "Cost reconfirmed", "Sales SPOC"],
  ["stability", "Stability confirmed", "Lab"],
  ["marketing", "Marketing sheet ready", "Lab"],
  ["ingredient", "Ingredient list — primary & final", "Lab"],
  ["packaging", "Packaging · fill · leak · compatibility", "Lab"],
];
window.NaturisData.PROFILE_OF = {
  spoc:    { empId: "NAT-SP-018", name: "Hardik Shah", email: "hardik@naturis.co", phone: "+91 98200 11018", office: "Mumbai HQ", department: "Sales", manager: "Kunal Shah", region: "West", title: "Sales SPOC" },
  manager: { empId: "NAT-SM-004", name: "Kunal Shah", email: "kunal@naturis.co", phone: "+91 98200 11004", office: "Mumbai HQ", department: "Sales", manager: "Rahul Tandon", region: "All India", title: "Sales Manager" },
  lab:     { empId: "NAT-LB-031", name: "Sumit Choudhary", email: "sumit@naturis.co", phone: "+91 99100 22031", office: "Jammu Lab", department: "R&D Lab", manager: "Dipti OV", region: "—", title: "Lab Technician" },
  labmgr:  { empId: "NAT-LM-002", name: "Dipti OV", email: "dipti@naturis.co", phone: "+91 99100 22002", office: "Jammu Lab", department: "R&D Lab", manager: "Rahul Tandon", region: "—", title: "Lab Manager" },
  mgmt:    { empId: "NAT-MG-001", name: "Rahul Tandon", email: "rahul@naturis.co", phone: "+91 98200 10001", office: "Mumbai HQ", department: "Leadership", manager: "—", region: "All India", title: "Management" },
  admin:   { empId: "NAT-AD-007", name: "Abhijit Jhala", email: "abhijit@naturis.co", phone: "+91 98200 10007", office: "Mumbai HQ", department: "Platform / IT", manager: "Rahul Tandon", region: "All India", title: "Super Admin" },
  planner: { empId: "NAT-PL-003", name: "Asha Rane", email: "asha@naturis.co", phone: "+91 99100 22055", office: "Jammu Lab", department: "R&D Lab · Planning", manager: "Dipti OV", region: "—", title: "Lab Planner" },
};
// augment admin users with employee details + region
(function () {
  const extra = {
    "U-01": { empId: "NAT-SP-018", phone: "+91 98200 11018", office: "Mumbai HQ", department: "Sales", region: "West" },
    "U-02": { empId: "NAT-SM-004", phone: "+91 98200 11004", office: "Mumbai HQ", department: "Sales", region: "All India" },
    "U-03": { empId: "NAT-LB-031", phone: "+91 99100 22031", office: "Jammu Lab", department: "R&D Lab", region: "—" },
    "U-04": { empId: "NAT-LM-002", phone: "+91 99100 22002", office: "Jammu Lab", department: "R&D Lab", region: "—" },
    "U-05": { empId: "NAT-MG-001", phone: "+91 98200 10001", office: "Mumbai HQ", department: "Leadership", region: "All India" },
    "U-06": { empId: "NAT-AD-007", phone: "+91 98200 10007", office: "Mumbai HQ", department: "Platform / IT", region: "All India" },
    "U-07": { empId: "NAT-SP-022", phone: "+91 98200 11022", office: "Delhi office", department: "Sales", region: "North" },
    "U-08": { empId: "NAT-LB-040", phone: "+91 99100 22040", office: "Jammu Lab", department: "R&D Lab", region: "—" },
    "U-09": { empId: "NAT-LB-044", phone: "+91 99100 22044", office: "Jammu Lab", department: "R&D Lab", region: "—" },
    "U-10": { empId: "NAT-LB-047", phone: "+91 99100 22047", office: "Jammu Lab", department: "R&D Lab", region: "—" },
  };
  ADMIN_USERS.forEach(u => Object.assign(u, extra[u.id] || { empId: "NAT-XX-000", phone: "—", office: "—", department: "—", region: "—" }));
})();

/* ---------- editable client-intelligence narrative (management) ---------- */
window.NaturisData.CI_DATA = {
  "ACC-01": { decisionStyle: "Category-led, data-driven; quarterly range reviews", responseSpeed: "Fast on launches — avoid Mondays", commPref: "In-person + email", persona: ["Premium-led", "Launch-calendar driven", "High LTV", "Claims-driven"], notes: "Anchor account. EU + India launches; gifting-heavy Q4. Wants EU-compliant claims." },
  "ACC-02": { decisionStyle: "Founder-led, fast yes/no on WhatsApp", responseSpeed: "Same-day on actives & costs", commPref: "WhatsApp + email", persona: ["Value-conscious", "Fast mover", "Ingredient-led", "Repeat SKUs"], notes: "Quick iterations; very price-sensitive on PM. Strong repeat business on hair & cleansers." },
  "ACC-03": { decisionStyle: "Brand-director sign-off; trend-led briefs", responseSpeed: "Moderate — 2-3 day turnarounds", commPref: "Email + monthly reviews", persona: ["Trend-driven", "Marketing-led claims", "Iteration-happy"], notes: "Wants fast trend SKUs; expects 2+ iterations per launch. Watch claim feasibility." },
  "ACC-04": { decisionStyle: "Committee — category manager + founder", responseSpeed: "Slow — chase after 5 days", commPref: "Email; calls for escalations", persona: ["Budget-locked", "Cautious", "Recently re-engaged"], notes: "Friction from past delays; budgets locked before briefs. Keep SLA tight & expectations explicit." },
  "ACC-05": { decisionStyle: "CEO-sponsored, white-glove; verbal goes, paper follows", responseSpeed: "Immediate via founder office", commPref: "In-person + WhatsApp", persona: ["Luxury gifting", "VVIP", "Story-led", "High margin"], notes: "Gulf luxury, gifting-led. Expects white-glove TAT and saffron/oud story ingredients." },
};
window.NaturisStore.setCI = function (accId, patch, by) {
  const d = window.NaturisData.CI_DATA[accId] || (window.NaturisData.CI_DATA[accId] = {});
  const field = Object.keys(patch)[0];
  this.addAudit({ actor: by || "Rahul Tandon", role: "Management", action: "Client intelligence edited", target: accId, field, before: String(d[field] || "—").slice(0, 40), after: String(patch[field]).slice(0, 40) });
  Object.assign(d, patch); _bump();
};

/* React hook: re-render on any store change */
window.useStore = function useStore() {
  const [, set] = React.useState(0);
  React.useEffect(() => window.NaturisStore.subscribe(() => set(v => v + 1)), []);
};

/* rulebook check helper used by intake */
window.checkRulebook = function (ingredients, base) {
  const names = ingredients.map(i => (i || "").toLowerCase());
  const hits = [];
  (window.NaturisData.RULEBOOK || []).forEach(rule => {
    const [a, b] = rule.pair;
    const aLow = a.toLowerCase(), bLow = b.toLowerCase();
    const aIn = names.some(n => n.includes(aLow.split(" ")[0]));
    const bIsBase = /base|anhydrous|aqueous|pH/i.test(b);
    const bIn = bIsBase ? (base || "").toLowerCase().includes(b.toLowerCase().split(" ")[0]) : names.some(n => n.includes(bLow.split(" ")[0]));
    if (aIn && bIn) hits.push(rule);
  });
  return hits;
};

/* ---------- persistence — created/updated records survive reloads (real-platform feel) ---------- */
var NATURIS_STATE_KEY = "naturis.state.v9";
function _persist() {
  try {
    localStorage.setItem(NATURIS_STATE_KEY, JSON.stringify({
      seq: _seq, eseq: _evSeq, profiles: window.NaturisData.PROFILE_OF, addr: window.NaturisData.SHIP_ADDRESSES, reqs: REQUIREMENTS, tl: REQUIREMENT_TIMELINES, notifs: NOTIFICATIONS,
      audit: AUDIT.slice(), fit: FIT_SCORES, ci: window.NaturisData.CI_DATA }));
  } catch (e) {}
}
(function restoreState() {
  try {
    var raw = localStorage.getItem(NATURIS_STATE_KEY);
    if (!raw) return;
    var st = JSON.parse(raw);
    if (!st || !st.reqs || !st.reqs.length) return;
    REQUIREMENTS.length = 0; st.reqs.forEach(function (r) { REQUIREMENTS.push(r); });
    Object.keys(REQUIREMENT_TIMELINES).forEach(function (k) { delete REQUIREMENT_TIMELINES[k]; });
    Object.keys(st.tl || {}).forEach(function (k) { REQUIREMENT_TIMELINES[k] = st.tl[k]; });
    if (st.notifs) { NOTIFICATIONS.length = 0; st.notifs.forEach(function (n) { NOTIFICATIONS.push(n); }); }
    if (st.audit) { AUDIT.length = 0; st.audit.forEach(function (a) { AUDIT.push(Object.freeze(a)); }); }
    if (st.fit) Object.keys(st.fit).forEach(function (k) { FIT_SCORES[k] = st.fit[k]; });
    if (st.ci) Object.keys(st.ci).forEach(function (k) { window.NaturisData.CI_DATA[k] = st.ci[k]; });
    if (st.seq) if (st.profiles) Object.keys(st.profiles).forEach(function (k) { Object.assign(window.NaturisData.PROFILE_OF[k] = window.NaturisData.PROFILE_OF[k] || {}, st.profiles[k]); });
    _seq = Math.max(_seq, st.seq);
    if (st.eseq) _evSeq = Math.max(_evSeq, st.eseq);
    if (st.addr) window.NaturisData.SHIP_ADDRESSES = st.addr;
  } catch (e) {}
})();
var _bumpCore = _bump;
_bump = function () { _bumpCore(); _persist(); };
window.NaturisStore.resetDemo = function () { try { localStorage.removeItem(NATURIS_STATE_KEY); } catch (e) {} location.reload(); };
