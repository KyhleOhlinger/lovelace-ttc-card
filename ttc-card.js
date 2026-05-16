/**
 * TTC Transit Card
 * A Home Assistant Lovelace card showing a live TTC subway map,
 * per-line service status, and a route planner that filters alerts
 * to only the lines you'll use.
 *
 * Repository: https://github.com/KyhleOhlinger/lovelace-ttc-card
 * HACS: Dashboard (Plugin) category
 * License: MIT
 */

const CARD_VERSION = "1.1.0";

/* ─────────────────────────────────────────────
   DATA: stations, line colours, alert mapping
───────────────────────────────────────────── */
const LINE_COLORS = {
  1: "#F9BC1B",
  2: "#009E60",
  4: "#C0392B",
  eg: "#F4731C",
  fw: "#A8A8A8",
};

const STATIONS = [
  // ── LINE 1 YONGE LEG (x=420, vertical y=30→332) ────────────────────────
  { id:"finchy",        name:"Finch",               lines:[1],     x:420, y:30  },
  { id:"northy",        name:"North York Centre",   lines:[1],     x:420, y:52  },
  { id:"sheppardyonge", name:"Sheppard–Yonge",      lines:[1,4],   x:420, y:80  },
  { id:"yorkmills",     name:"York Mills",           lines:[1],     x:420, y:108 },
  { id:"lawrence",      name:"Lawrence",             lines:[1],     x:420, y:130 },
  { id:"eglinton",      name:"Eglinton",             lines:[1,"eg"],x:420, y:180 },
  { id:"davisville",    name:"Davisville",           lines:[1],     x:420, y:200 },
  { id:"stclair",       name:"St Clair",             lines:[1],     x:420, y:216 },
  { id:"summerhill",    name:"Summerhill",           lines:[1],     x:420, y:230 },
  { id:"rosedale",      name:"Rosedale",             lines:[1],     x:420, y:244 },
  { id:"blooryonge",    name:"Bloor–Yonge",          lines:[1,2],   x:420, y:260 },
  { id:"wellesley",     name:"Wellesley",            lines:[1],     x:420, y:276 },
  { id:"college",       name:"College",              lines:[1],     x:420, y:290 },
  { id:"tmu",           name:"TMU",                  lines:[1],     x:420, y:304 },
  { id:"queen",         name:"Queen",                lines:[1],     x:420, y:318 },
  { id:"king",          name:"King",                 lines:[1],     x:420, y:332 },

  // ── LINE 1 U-BASE (y=375, x=270→420) ──────────────────────────────────
  { id:"osgoode",       name:"Osgoode",              lines:[1],     x:294, y:375 },
  { id:"standrew",      name:"St Andrew",            lines:[1],     x:330, y:375 },
  { id:"union",         name:"Union",                lines:[1],     x:366, y:375 },

  // ── LINE 1 UNIVERSITY LEG (x=270, vertical y=120→332) ─────────────────
  { id:"finchw",        name:"Finch West",           lines:[1,"fw"],x:270, y:120 },
  { id:"downsview",     name:"Downsview Park",       lines:[1],     x:270, y:130 },
  { id:"sheppardw",     name:"Sheppard West",        lines:[1],     x:270, y:140 },
  { id:"wilson",        name:"Wilson",               lines:[1],     x:270, y:150 },
  { id:"yorkdale",      name:"Yorkdale",             lines:[1],     x:270, y:160 },
  { id:"lawrencew",     name:"Lawrence West",        lines:[1],     x:270, y:170 },
  { id:"glencairn",     name:"Glencairn",            lines:[1],     x:270, y:178 },
  { id:"eglintonw",     name:"Eglinton West",        lines:[1,"eg"],x:270, y:180 },
  { id:"stclairw",      name:"St Clair West",        lines:[1],     x:270, y:200 },
  { id:"dupont",        name:"Dupont",               lines:[1],     x:270, y:218 },
  { id:"spadina",       name:"Spadina",              lines:[1,2],   x:270, y:260 },
  { id:"college2",      name:"College",              lines:[1],     x:270, y:276 },
  { id:"dundasw",       name:"Dundas",               lines:[1],     x:270, y:290 },
  { id:"stpatrick",     name:"St Patrick",           lines:[1],     x:270, y:304 },
  { id:"museum",        name:"Museum",               lines:[1],     x:270, y:318 },
  { id:"queenspark",    name:"Queen's Park",         lines:[1],     x:270, y:332 },

  // ── LINE 1 VAUGHAN DIAGONAL (270,120) → (90,30), 3 intermediate stops ──
  // Each stop evenly spaced along the diagonal
  { id:"yorku",         name:"York University",      lines:[1],     x:225, y:98  },
  { id:"pioneer",       name:"Pioneer Village",      lines:[1],     x:180, y:75  },
  { id:"hwy407",        name:"Highway 407",          lines:[1],     x:135, y:52  },
  { id:"vaughan",       name:"Vaughan MC",           lines:[1],     x:90,  y:30  },

  // ── LINE 2 BLOOR-DANFORTH (y=260, x=30→650) ───────────────────────────
  { id:"kipling",       name:"Kipling",              lines:[2],     x:30,  y:260 },
  { id:"islington",     name:"Islington",            lines:[2],     x:47,  y:260 },
  { id:"royal-york",    name:"Royal York",           lines:[2],     x:64,  y:260 },
  { id:"old-mill",      name:"Old Mill",             lines:[2],     x:81,  y:260 },
  { id:"jane",          name:"Jane",                 lines:[2],     x:98,  y:260 },
  { id:"runnymede",     name:"Runnymede",            lines:[2],     x:113, y:260 },
  { id:"high-park",     name:"High Park",            lines:[2],     x:126, y:260 },
  { id:"keele",         name:"Keele",                lines:[2],     x:138, y:260 },
  { id:"dundas-west",   name:"Dundas West",          lines:[2],     x:149, y:260 },
  { id:"lansdowne",     name:"Lansdowne",            lines:[2],     x:160, y:260 },
  { id:"dufferin",      name:"Dufferin",             lines:[2],     x:170, y:260 },
  { id:"ossington",     name:"Ossington",            lines:[2],     x:179, y:260 },
  { id:"christie",      name:"Christie",             lines:[2],     x:188, y:260 },
  { id:"bathurst",      name:"Bathurst",             lines:[2],     x:222, y:260 },
  { id:"stgeorge",      name:"St George",            lines:[1,2],   x:336, y:260 },
  { id:"bay",           name:"Bay",                  lines:[2],     x:380, y:260 },
  { id:"sherbourne",    name:"Sherbourne",           lines:[2],     x:447, y:260 },
  { id:"castle-frank",  name:"Castle Frank",         lines:[2],     x:464, y:260 },
  { id:"broadview",     name:"Broadview",            lines:[2],     x:480, y:260 },
  { id:"chester",       name:"Chester",              lines:[2],     x:496, y:260 },
  { id:"pape",          name:"Pape",                 lines:[2],     x:511, y:260 },
  { id:"donlands",      name:"Donlands",             lines:[2],     x:526, y:260 },
  { id:"greenwood",     name:"Greenwood",            lines:[2],     x:540, y:260 },
  { id:"coxwell",       name:"Coxwell",              lines:[2],     x:554, y:260 },
  { id:"woodbine",      name:"Woodbine",             lines:[2],     x:567, y:260 },
  { id:"main-street",   name:"Main Street",          lines:[2],     x:580, y:260 },
  { id:"victoria-park", name:"Victoria Park",        lines:[2],     x:593, y:260 },
  { id:"warden",        name:"Warden",               lines:[2],     x:610, y:260 },
  { id:"kennedy",       name:"Kennedy",              lines:[2],     x:635, y:260 },

  // ── LINE 4 SHEPPARD (y=80, x=420→558) ─────────────────────────────────
  { id:"bayview",       name:"Bayview",              lines:[4],     x:450, y:80  },
  { id:"bessarion",     name:"Bessarion",            lines:[4],     x:486, y:80  },
  { id:"leslie",        name:"Leslie",               lines:[4],     x:522, y:80  },
  { id:"donmills",      name:"Don Mills",            lines:[4],     x:558, y:80  },

  // ── LINE 5 EGLINTON LRT (y=180, x=30→620) ─────────────────────────────
  { id:"eg-mount-dennis",  name:"Mount Dennis",      lines:["eg"],  x:30,  y:180 },
  { id:"eg-keelesdale",    name:"Keelesdale",        lines:["eg"],  x:65,  y:180 },
  { id:"eg-caledonia",     name:"Caledonia",         lines:["eg"],  x:98,  y:180 },
  { id:"eg-dufferin-lrt",  name:"Dufferin",          lines:["eg"],  x:130, y:180 },
  { id:"eg-fairbank",      name:"Fairbank",          lines:["eg"],  x:162, y:180 },
  { id:"eg-keel",          name:"Keel",              lines:["eg"],  x:192, y:180 },
  { id:"eg-cedarvale",     name:"Cedarvale",         lines:["eg"],  x:228, y:180 },
  { id:"eg-forest-hill",   name:"Forest Hill",       lines:["eg"],  x:302, y:180 },
  { id:"eg-chaplin",       name:"Chaplin",           lines:["eg"],  x:334, y:180 },
  { id:"eg-avenue",        name:"Avenue",            lines:["eg"],  x:366, y:180 },
  { id:"eg-midtown",       name:"Midtown",           lines:["eg"],  x:396, y:180 },
  { id:"eg-leaside",       name:"Leaside",           lines:["eg"],  x:452, y:180 },
  { id:"eg-laird",         name:"Laird",             lines:["eg"],  x:482, y:180 },
  { id:"eg-science",       name:"Science Centre",    lines:["eg"],  x:512, y:180 },
  { id:"eg-fairview",      name:"Fairview",          lines:["eg"],  x:540, y:180 },
  { id:"eg-ionview",       name:"Ionview",           lines:["eg"],  x:568, y:180 },
  { id:"eg-kennedy",       name:"Kennedy LRT",       lines:["eg"],  x:600, y:180 },

  // ── LINE 6 FINCH WEST LRT (y=120, x=30→270) ───────────────────────────
  { id:"fw-humber",        name:"Humber College",    lines:["fw"],  x:30,  y:120 },
  { id:"fw-habitant",      name:"Habitant",          lines:["fw"],  x:58,  y:120 },
  { id:"fw-dufferin-fw",   name:"Dufferin & Finch",  lines:["fw"],  x:84,  y:120 },
  { id:"fw-driftwood",     name:"Driftwood",         lines:["fw"],  x:108, y:120 },
  { id:"fw-jane-finch",    name:"Jane & Finch",      lines:["fw"],  x:132, y:120 },
  { id:"fw-sentinel",      name:"Sentinel",          lines:["fw"],  x:158, y:120 },
  { id:"fw-york-gate",     name:"York Gate",         lines:["fw"],  x:186, y:120 },
  { id:"fw-norfinch",      name:"Norfinch Oakdale",  lines:["fw"],  x:214, y:120 },
  { id:"fw-keele",         name:"Keele & Finch",     lines:["fw"],  x:242, y:120 },
];

/* ─────────────────────────────────────────────
   ROUTING LOGIC
───────────────────────────────────────────── */
function getStn(id) { return STATIONS.find((s) => s.id === id); }
function sharedLines(a, b) { return a.lines.filter((l) => b.lines.includes(l)); }

function findRoute(fromId, toId) {
  const f = getStn(fromId), t = getStn(toId);
  if (!f || !t) return null;
  const direct = sharedLines(f, t);
  if (direct.length) return { type: "direct", line: direct[0], from: f, to: t };
  const ics = STATIONS.filter((s) => s.lines.length > 1);
  for (const ic of ics) {
    const l1 = sharedLines(f, ic), l2 = sharedLines(ic, t);
    if (l1.length && l2.length)
      return { type: "transfer", line1: l1[0], line2: l2[0], from: f, via: ic, to: t };
  }
  return { type: "unknown", from: f, to: t };
}

function lineName(l) {
  return (
    { 1: "Line 1 Yonge–University", 2: "Line 2 Bloor–Danforth", 4: "Line 4 Sheppard", eg: "Line 5 Eglinton LRT", fw: "Line 6 Finch West LRT" }[l] || "Transit"
  );
}

/* ─────────────────────────────────────────────
   STATUS HELPERS
───────────────────────────────────────────── */
function statusColor(status, lineDefault) {
  return (
    { delays: "#EF9F27", diversion: "#C0392B", suspended: "#666", slow_zone: "#9B59B6", unknown: "#555" }[status] ||
    lineDefault
  );
}

function statusBadge(status) {
  const map = {
    normal:    { cls: "b-ok",     label: "Normal"    },
    delays:    { cls: "b-warn",   label: "Delays"    },
    diversion: { cls: "b-danger", label: "Diversion" },
    suspended: { cls: "b-danger", label: "Suspended" },
    slow_zone: { cls: "b-info",   label: "Slow zone" },
    unknown:   { cls: "b-muted",  label: "Unknown"   },
  };
  return map[status] || map.unknown;
}

function iconFor(status) {
  return { normal: "ai-ok", delays: "ai-warn", diversion: "ai-danger", suspended: "ai-danger", slow_zone: "ai-info" }[status] || "ai-muted";
}

/* ─────────────────────────────────────────────
   SENSOR PARSING
   Reads HA sensor states to derive per-line status.
   Falls back gracefully if sensors are unavailable.
───────────────────────────────────────────── */
function parseLineStatus(hass, entityId) {
  if (!hass || !hass.states[entityId]) return "unknown";
  const state = hass.states[entityId].state;
  return state || "unknown";
}

function getAlertDesc(hass, entityId) {
  if (!hass || !hass.states[entityId]) return null;
  const attrs = hass.states[entityId].attributes;
  if (attrs && attrs.friendly_description) return attrs.friendly_description;
  return null;
}

/* ─────────────────────────────────────────────
   SVG MAP BUILDER — matches reference screenshot
   viewBox: 0 0 680 420
   Yonge leg:       x=420, y=30 (Finch) → y=332 (King) → U-corner
   University leg:  x=270, y=120 (Finch West) → y=332 → U-corner
   Vaughan diagonal: (90,30) → (270,120)  [NW to SE]
   U-base:          y=375, x=270 → x=420
   Line 2:          y=260 horizontal
   Line 5 Eglinton: y=180 horizontal (continuous through both legs)
   Line 6 Finch W:  y=120 horizontal west of Finch West (x=30 → x=270)
   Line 4 Sheppard: y=80 horizontal east of Sheppard-Yonge (x=420 → x=570)
───────────────────────────────────────────── */
function buildMap(l1c, l2c, l4c, egc, l1s, l2s, egS) {
  const fwc = LINE_COLORS.fw;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("id", "ttc-svg");
  svg.setAttribute("viewBox", "0 0 680 420");
  svg.style.cssText = "width:100%;height:100%;display:block;background:#111318";

  function el(tag, attrs) {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }
  function txt(content, attrs) {
    const t = el("text", { "font-family":"sans-serif", fill:"#bbb", ...attrs });
    t.textContent = content;
    return t;
  }
  function stn(cx, cy, r, stroke, sw) {
    return el("circle", { cx, cy, r, fill:"#111318", stroke, "stroke-width":sw });
  }
  function ic(cx, cy, dot, r=9) {
    svg.appendChild(el("circle", { cx, cy, r, fill:"#111318", stroke:"#999", "stroke-width":2.5 }));
    svg.appendChild(el("circle", { cx, cy, r:r*0.42, fill:dot }));
  }

  const LW = 8;

  // ── LINE 6 FINCH WEST LRT (grey, y=120, horizontal west of Finch West) ─
  svg.appendChild(el("line", { x1:30, y1:120, x2:270, y2:120,
    stroke:fwc, "stroke-width":6, "stroke-linecap":"round" }));

  // ── LINE 5 EGLINTON (orange, y=180, continuous through both legs) ───────
  svg.appendChild(el("line", { x1:30, y1:180, x2:620, y2:180,
    stroke:egc, "stroke-width":7, "stroke-linecap":"round" }));

  // ── LINE 2 BLOOR-DANFORTH (green, y=260, continuous) ────────────────────
  svg.appendChild(el("line", { x1:30, y1:260, x2:650, y2:260,
    stroke:l2c, "stroke-width":LW, "stroke-linecap":"round" }));

  // ── LINE 1 VAUGHAN DIAGONAL (from Vaughan 90,30 → Finch West 270,120) ──
  svg.appendChild(el("line", { x1:90, y1:30, x2:270, y2:120,
    stroke:l1c, "stroke-width":LW, "stroke-linecap":"round" }));

  // ── LINE 1 MAIN U (University leg + U-base + Yonge leg) ─────────────────
  // University leg: Finch West (270,120) straight south to U-corner
  // U-base: across to Yonge corner
  // Yonge leg: straight north to Finch (420,30)
  svg.appendChild(el("path", {
    d:"M270,120 L270,352 Q270,375 294,375 L396,375 Q420,375 420,352 L420,30",
    fill:"none", stroke:l1c, "stroke-width":LW,
    "stroke-linecap":"round", "stroke-linejoin":"round"
  }));

  // ── LINE 4 SHEPPARD (dark red, y=80, east of Sheppard-Yonge) ────────────
  svg.appendChild(el("line", { x1:420, y1:80, x2:570, y2:80,
    stroke:l4c, "stroke-width":LW, "stroke-linecap":"round" }));

  // ── STATUS OVERLAYS ───────────────────────────────────────────────────────
  if (l2s !== "normal" && l2s !== "unknown") {
    svg.appendChild(el("rect", { x:30, y:253, width:620, height:14, rx:4,
      fill: l2s === "diversion" ? "#C0392B" : "#F9BC1B", "fill-opacity":0.25, id:"ov-l2" }));
  }
  if (l1s !== "normal" && l1s !== "unknown") {
    svg.appendChild(el("rect", { x:262, y:120, width:16, height:255, rx:4, fill:"#F9BC1B", "fill-opacity":0.22 }));
    svg.appendChild(el("rect", { x:412, y:30,  width:16, height:322, rx:4, fill:"#F9BC1B", "fill-opacity":0.22 }));
  }
  if (egS !== "normal" && egS !== "unknown") {
    svg.appendChild(el("rect", { x:30, y:173, width:590, height:14, rx:4, fill:"#EF9F27", "fill-opacity":0.22 }));
  }

  // ── ROUTE OVERLAY ────────────────────────────────────────────────────────
  const rog = document.createElementNS(ns, "g");
  rog.id = "ttc-route-overlay";
  rog.style.opacity = "0";
  svg.appendChild(rog);

  // ── INTERCHANGES ─────────────────────────────────────────────────────────
  ic(270, 120, l1c);           // Finch West  L1+L6
  ic(270, 180, l1c);           // Eglinton West L1+L5
  ic(420, 180, l1c);           // Eglinton L1+L5
  ic(270, 260, l1c);           // Spadina L1+L2
  ic(336, 260, l2c);           // St George L1+L2
  svg.appendChild(el("circle", { cx:420, cy:260, r:11, fill:"#111318", stroke:"#999", "stroke-width":3 }));
  svg.appendChild(el("circle", { cx:420, cy:260, r:5, fill:l2c }));  // Bloor-Yonge
  ic(420, 80,  l4c);           // Sheppard-Yonge L1+L4

  // ── REGULAR STATIONS ─────────────────────────────────────────────────────
  STATIONS.forEach(s => {
    if (s.lines.length > 1) return;
    const col = s.lines[0] === 1 ? l1c
              : s.lines[0] === 2 ? l2c
              : s.lines[0] === 4 ? l4c
              : s.lines[0] === "fw" ? fwc : egc;
    const term = ["vaughan","finchy","kipling","kennedy","donmills","eg-mount-dennis","eg-kennedy","fw-humber"].includes(s.id);
    svg.appendChild(stn(s.x, s.y, term ? 5 : 3.5, col, term ? 2.5 : 1.8));
  });

  // ── STATUS LABELS ─────────────────────────────────────────────────────────
  if (l2s === "delays")    svg.appendChild(txt("⚠ Delays",    { x:560, y:250, "text-anchor":"middle", "font-size":8, fill:"#F9BC1B", "font-weight":"bold" }));
  if (l2s === "diversion") svg.appendChild(txt("✕ Diversion", { x:560, y:250, "text-anchor":"middle", "font-size":8, fill:"#C0392B", "font-weight":"bold" }));
  if (l1s !== "normal" && l1s !== "unknown")
    svg.appendChild(txt("⚠", { x:435, y:200, "font-size":10, fill:"#EF9F27", "font-weight":"bold" }));
  if (egS !== "normal" && egS !== "unknown")
    svg.appendChild(txt("⚠", { x:500, y:170, "font-size":10, fill:"#EF9F27", "font-weight":"bold" }));

  // ── LABELS ────────────────────────────────────────────────────────────────
  [
    ["Vaughan MC",      90,  20, "middle", "#ccc",   false],
    ["Finch West",     270, 110, "middle", "#ccc",   false],
    ["Finch",          420,  20, "middle", "#ccc",   false],
    ["Humber College",  30, 110, "middle", "#ccc",   false],
    ["Kipling",         30, 252, "middle", "#ccc",   false],
    ["Kennedy",        650, 252, "middle", "#ccc",   false],
    ["Don Mills",      558,  68, "middle", "#ccc",   false],
    ["Mt Dennis",       30, 170, "middle", "#ccc",   false],
    ["Spadina",        256, 265, "end",    "#ccc",   false],
    ["St George",      336, 250, "middle", "#ccc",   false],
    ["Bloor–Yonge",    436, 265, "start",  "#ccc",   false],
    ["Sheppard–Yonge", 436,  83, "start",  "#ccc",   false],
    ["Union",          344, 390, "middle", "#ccc",   false],
    ["Line 1",         285, 200, "start",  l1c,      true],
    ["Line 2",          65, 252, "start",  l2c,      true],
    ["Line 4",         455,  68, "start",  l4c,      true],
    ["Line 5",         200, 170, "start",  egc,      true],
    ["Line 6",         148, 110, "middle", fwc,      true],
  ].forEach(([t,x,y,a,fill,bold]) =>
    svg.appendChild(txt(t, { x, y, "text-anchor":a, "font-size":9, fill,
      ...(bold ? { "font-weight":"600" } : {}) }))
  );

  return svg;
}

/* ─────────────────────────────────────────────
   LOVELACE CARD DEFINITION
───────────────────────────────────────────── */
class TtcTransitCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._currentRoute = null;
    this._pulseTimer = null;
  }

  static getConfigElement() {
    return document.createElement("ttc-transit-card-editor");
  }

  static getStubConfig() {
    return {
      entities: {
        line1:    "sensor.ttc_line1_status",
        line2:    "sensor.ttc_line2_status",
        line4:    "sensor.ttc_line4_status",
        eglinton: "sensor.ttc_eglinton_status",
        s504:     "sensor.ttc_504_status",
        s29:      "sensor.ttc_29_status",
        alerts:   "sensor.ttc_alerts_raw",
        updated:  "sensor.ttc_last_updated",
      },
    };
  }

  setConfig(config) {
    this._config = {
      ...TtcTransitCard.getStubConfig(),
      ...config,
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  /* ── FULL RENDER (called once on setConfig) ── */
  _render() {
    const root = this.shadowRoot;
    root.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = `
      :host { display: flex; flex-direction: column; width: 100%; height: calc(100vh - 120px); min-height: 500px; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--primary-font-family, sans-serif); }

      /* ── TOP BAR: route planner ── */
      .top-bar { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex-shrink: 0; margin-bottom: 8px; }
      .top-bar-title { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      .ht { font-size: 14px; font-weight: 500; color: var(--primary-text-color); }
      .hs { font-size: 11px; color: var(--secondary-text-color); }
      .rp-row { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; flex-wrap: wrap; }
      .fl { font-size: 10px; color: var(--secondary-text-color); margin-bottom: 3px; }
      .sel-wrap { display: flex; flex-direction: column; flex: 1; min-width: 140px; }
      select { width: 100%; font-size: 12px; padding: 6px 8px; border-radius: 8px; border: 1px solid var(--divider-color, #ccc); background: var(--secondary-background-color, #f5f5f5); color: var(--primary-text-color); cursor: pointer; }
      .swap-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--divider-color, #ccc); background: var(--secondary-background-color, #f5f5f5); cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; color: var(--secondary-text-color); flex-shrink: 0; margin-top: 16px; }
      .route-btn { padding: 7px 14px; font-size: 12px; font-weight: 500; border-radius: 8px; border: 1px solid var(--divider-color, #ccc); background: var(--secondary-background-color, #f5f5f5); color: var(--primary-text-color); cursor: pointer; white-space: nowrap; flex-shrink: 0; margin-top: 16px; }
      .route-btn.active { background: #185FA5; color: #E6F1FB; border-color: #185FA5; }
      .refresh-btn { font-size: 11px; border: 1px solid var(--divider-color,#ccc); border-radius: 8px; padding: 4px 9px; cursor: pointer; background: transparent; color: var(--secondary-text-color); flex-shrink: 0; }
      .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #1D9E75; display: inline-block; margin-right: 4px; animation: pdot 2s infinite; }
      @keyframes pdot { 0%,100%{opacity:1}50%{opacity:.35} }

      /* ── ROUTE SUMMARY STRIP ── */
      .route-strip { background: var(--secondary-background-color, #f5f5f5); border: 1px solid var(--divider-color, #e0e0e0); border-radius: 10px; padding: 8px 16px; display: none; align-items: center; gap: 16px; flex-wrap: wrap; flex-shrink: 0; margin-bottom: 8px; }
      .route-strip.show { display: flex; }
      .rs-title { font-size: 12px; font-weight: 500; color: var(--primary-text-color); }
      .rs-steps { display: flex; gap: 12px; flex-wrap: wrap; }
      .rs-step { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--secondary-text-color); }
      .rs-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

      /* ── MAP: fills remaining space ── */
      .map-card { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; overflow: hidden; flex: 1; display: flex; flex-direction: column; min-height: 0; }
      .map-hd { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); flex-shrink: 0; }
      .map-hd-l { display: flex; align-items: center; gap: 10px; }
      .map-wrap { background: #0d0f12; flex: 1; min-height: 0; display: flex; align-items: stretch; }
      .map-wrap svg { width: 100%; height: 100%; display: block; }
      .map-footer { display: flex; align-items: center; justify-content: space-between; padding: 6px 14px; border-top: 1px solid var(--divider-color, #e0e0e0); flex-shrink: 0; flex-wrap: wrap; gap: 8px; }
      .legend { display: flex; gap: 12px; flex-wrap: wrap; }
      .li { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--secondary-text-color); }
      .ld { width: 18px; height: 6px; border-radius: 3px; }
      .stats { display: flex; gap: 16px; }
      .stat { display: flex; align-items: center; gap: 6px; font-size: 11px; }
      .stat-label { color: var(--secondary-text-color); }
      .stat-val { font-weight: 500; color: var(--primary-text-color); }

      /* ── ALERTS PANEL (slides in below route strip) ── */
      .alerts-panel { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); border-radius: 10px; display: none; flex-shrink: 0; max-height: 200px; overflow-y: auto; margin-bottom: 8px; }
      .alerts-panel.show { display: block; }
      .alerts-hd { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); position: sticky; top: 0; background: var(--card-background-color, #fff); z-index: 1; }
      .alerts-ht { font-size: 12px; font-weight: 500; color: var(--primary-text-color); }
      .alerts-sub { font-size: 10px; color: var(--secondary-text-color); }
      .alert-item { padding: 7px 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); display: flex; align-items: flex-start; gap: 8px; }
      .alert-item:last-child { border-bottom: none; }
      .ai-icon { width: 22px; height: 22px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
      .ai-ok    { background: #1D9E7518; color: #1D9E75; }
      .ai-warn  { background: #BA751718; color: #BA7517; }
      .ai-danger{ background: #A32D2D18; color: #A32D2D; }
      .ai-info  { background: #185FA518; color: #185FA5; }
      .ai-muted { background: #88888818; color: #888; }
      .ai-name { font-size: 11px; font-weight: 500; color: var(--primary-text-color); }
      .ai-desc { font-size: 10px; color: var(--secondary-text-color); margin-top: 1px; line-height: 1.4; }
      .badge { font-size: 9px; padding: 1px 6px; border-radius: 999px; font-weight: 500; margin-left: 4px; }
      .b-ok    { background: #1D9E7512; color: #0F6E56; }
      .b-warn  { background: #BA751712; color: #854F0B; }
      .b-danger{ background: #A32D2D12; color: #791F1F; }
      .b-info  { background: #185FA512; color: #0C447C; }
      .b-muted { background: #88888812; color: #666; }
    `;
    root.appendChild(style);

    /* ── TOP BAR ── */
    const topBar = document.createElement("div");
    topBar.className = "top-bar";
    topBar.innerHTML = `
      <div class="top-bar-title">
        <span style="font-size:20px">🚇</span>
        <div>
          <div class="ht">TTC Transit</div>
          <div class="hs" id="ttc-updated"><span class="live-dot"></span>Loading…</div>
        </div>
      </div>
      <div class="rp-row">
        <div class="sel-wrap"><div class="fl">From</div><select id="ttc-from"></select></div>
        <button class="swap-btn" id="ttc-swap" title="Swap">⇄</button>
        <div class="sel-wrap"><div class="fl">To</div><select id="ttc-to"></select></div>
        <button class="route-btn" id="ttc-plan-btn">🔍 Find route</button>
      </div>
      <button class="refresh-btn" id="ttc-refresh-btn">↻ Refresh</button>
    `;
    root.appendChild(topBar);

    /* ── ROUTE SUMMARY STRIP ── */
    const routeStrip = document.createElement("div");
    routeStrip.className = "route-strip";
    routeStrip.id = "ttc-route-summary";
    routeStrip.innerHTML = `
      <div class="rs-title" id="ttc-rs-title"></div>
      <div class="rs-steps" id="ttc-rs-steps"></div>
    `;
    root.appendChild(routeStrip);

    /* ── ALERTS PANEL ── */
    const alertsPanel = document.createElement("div");
    alertsPanel.className = "alerts-panel";
    alertsPanel.id = "ttc-alerts-panel";
    alertsPanel.innerHTML = `
      <div class="alerts-hd">
        <span class="alerts-ht" id="ttc-alerts-title">Service alerts</span>
        <span class="alerts-sub" id="ttc-alerts-sub">All monitored routes</span>
      </div>
      <div id="ttc-alerts-list"></div>
    `;
    root.appendChild(alertsPanel);

    /* ── MAP CARD ── */
    const mapCard = document.createElement("div");
    mapCard.className = "map-card";

    const mapHd = document.createElement("div");
    mapHd.className = "map-hd";
    mapHd.innerHTML = `
      <div class="map-hd-l">
        <div class="stats">
          <div class="stat"><span class="stat-label">Line 1</span><span class="stat-val" id="st-l1">—</span></div>
          <div class="stat"><span class="stat-label">Line 2</span><span class="stat-val" id="st-l2">—</span></div>
          <div class="stat"><span class="stat-label">Alerts</span><span class="stat-val" id="st-alerts">—</span></div>
        </div>
      </div>
    `;
    mapCard.appendChild(mapHd);

    const mapWrap = document.createElement("div");
    mapWrap.className = "map-wrap";
    mapWrap.id = "ttc-map-wrap";
    mapCard.appendChild(mapWrap);

    const mapFooter = document.createElement("div");
    mapFooter.className = "map-footer";
    mapFooter.innerHTML = `
      <div class="legend">
        <div class="li"><div class="ld" style="background:#F9BC1B"></div>Line 1</div>
        <div class="li"><div class="ld" style="background:#009E60"></div>Line 2</div>
        <div class="li"><div class="ld" style="background:#C0392B"></div>Line 4</div>
        <div class="li"><div class="ld" style="background:#9B59B6"></div>Eglinton LRT</div>
        <div class="li"><div class="ld" style="background:#F9BC1B;opacity:.35;border-radius:2px"></div>Active alert</div>
      </div>
    `;
    mapCard.appendChild(mapFooter);
    root.appendChild(mapCard);

    /* Populate station selects */
    this._populateSelects();

    /* Wire events */
    root.getElementById("ttc-refresh-btn").addEventListener("click", () => this._forceRefresh());
    root.getElementById("ttc-plan-btn").addEventListener("click", () => this._planRoute());
    root.getElementById("ttc-swap").addEventListener("click", () => this._swap());
    root.getElementById("ttc-from").addEventListener("change", () => this._clearRoute());
    root.getElementById("ttc-to").addEventListener("change", () => this._clearRoute());

    /* Initial map */
    mapWrap.appendChild(buildMap("#F9BC1B", "#009E60", "#C0392B", "#9B59B6", "normal", "normal", "normal"));

    /* Pulse animation */
    this._startPulse();
  }

  /* ── INCREMENTAL UPDATE (called on every hass change) ── */
  _update() {
    if (!this._hass || !this.shadowRoot.getElementById("ttc-map-wrap")) return;
    const h = this._hass;
    const cfg = this._config.entities || {};

    const l1s  = parseLineStatus(h, cfg.line1    || "sensor.ttc_line1_status");
    const l2s  = parseLineStatus(h, cfg.line2    || "sensor.ttc_line2_status");
    const l4s  = parseLineStatus(h, cfg.line4    || "sensor.ttc_line4_status");
    const egS  = parseLineStatus(h, cfg.eglinton || "sensor.ttc_eglinton_status");
    const s504 = parseLineStatus(h, cfg.s504     || "sensor.ttc_504_status");
    const s29  = parseLineStatus(h, cfg.s29      || "sensor.ttc_29_status");
    const updated = h.states[cfg.updated || "sensor.ttc_last_updated"]?.state || "—";

    const l1c = statusColor(l1s, LINE_COLORS[1]);
    const l2c = statusColor(l2s, LINE_COLORS[2]);
    const l4c = statusColor(l4s, LINE_COLORS[4]);
    const egc = statusColor(egS, LINE_COLORS.eg);

    /* Rebuild map */
    const mapWrap = this.shadowRoot.getElementById("ttc-map-wrap");
    const old = this.shadowRoot.getElementById("ttc-svg");
    const newSvg = buildMap(l1c, l2c, l4c, egc, l1s, l2s, egS);
    if (old) mapWrap.replaceChild(newSvg, old);

    /* Redraw route overlay if a route is active */
    if (this._currentRoute) this._drawOverlay(this._currentRoute);

    /* Updated time */
    const updEl = this.shadowRoot.getElementById("ttc-updated");
    if (updEl) updEl.innerHTML = `<span class="live-dot"></span>Live · Updated ${updated}`;

    /* Stats */
    const statuses = [l1s, l2s, l4s, egS, s504, s29];
    const alertCount = statuses.filter(s => s !== "normal" && s !== "unknown").length;
    const stAlerts = this.shadowRoot.getElementById("st-alerts");
    const stL1 = this.shadowRoot.getElementById("st-l1");
    const stL2 = this.shadowRoot.getElementById("st-l2");
    if (stAlerts) {
      stAlerts.textContent = alertCount;
      stAlerts.style.color = alertCount > 0 ? "#BA7517" : "#1D9E75";
    }
    if (stL1) {
      stL1.textContent = l1s === "normal" ? "Normal" : (l1s.replace(/_/g, " "));
      stL1.style.color = l1s === "normal" ? "#1D9E75" : (l1s === "delays" ? "#BA7517" : "#A32D2D");
    }
    if (stL2) {
      stL2.textContent = l2s === "normal" ? "Normal" : (l2s.replace(/_/g, " "));
      stL2.style.color = l2s === "normal" ? "#1D9E75" : (l2s === "delays" ? "#BA7517" : "#A32D2D");
    }

    /* Build alerts list from live sensor data */
    this._renderAlerts([
      { label: "Line 1 Yonge–University", status: l1s, icon: "🚇", lines: [1],
        desc: l1s === "normal" ? "Service running normally." : `${l1s.replace(/_/g," ")} on Line 1. Check ttc.ca.` },
      { label: "Line 2 Bloor–Danforth",   status: l2s, icon: "🚇", lines: [2],
        desc: l2s === "normal" ? "Service running normally." : `${l2s.replace(/_/g," ")} on Line 2. Check ttc.ca.` },
      { label: "Line 4 Sheppard",          status: l4s, icon: "🚇", lines: [4],
        desc: l4s === "normal" ? "Service running normally." : `${l4s.replace(/_/g," ")} on Line 4.` },
      { label: "Eglinton Crosstown LRT",   status: egS, icon: "🚋", lines: ["eg"],
        desc: egS === "slow_zone" ? "Reduced speed zone in effect." : (egS === "normal" ? "Service running normally." : `${egS.replace(/_/g," ")} on the LRT.`) },
      { label: "504 King Streetcar",        status: s504, icon: "🚌", lines: [],
        desc: s504 === "diversion" ? "Buses replacing streetcars. Check ttc.ca for the diversion segment." : (s504 === "normal" ? "Service running normally." : `${s504.replace(/_/g," ")} on 504 King.`) },
      { label: "29 Dufferin Bus",           status: s29, icon: "🚌", lines: [],
        desc: s29 === "normal" ? "Service running normally." : `${s29.replace(/_/g," ")} on 29 Dufferin.` },
    ]);
  }

  _renderAlerts(alerts) {
    const list  = this.shadowRoot.getElementById("ttc-alerts-list");
    const panel = this.shadowRoot.getElementById("ttc-alerts-panel");
    if (!list) return;
    list.innerHTML = "";

    const usedLines = this._currentRoute ? new Set() : null;
    if (this._currentRoute) {
      if (this._currentRoute.line)  usedLines.add(this._currentRoute.line);
      if (this._currentRoute.line1) usedLines.add(this._currentRoute.line1);
      if (this._currentRoute.line2) usedLines.add(this._currentRoute.line2);
    }

    let visible = 0;
    alerts.forEach((a) => {
      const relevant = !usedLines || a.lines.length === 0 || a.lines.some(l => usedLines.has(l));
      const item = document.createElement("div");
      item.className = "alert-item";
      item.style.display = relevant ? "flex" : "none";
      if (relevant) visible++;

      const badge = statusBadge(a.status);
      item.innerHTML = `
        <div class="ai-icon ${iconFor(a.status)}">${a.icon}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;flex-wrap:wrap">
            <span class="ai-name">${a.label}</span>
            <span class="badge ${badge.cls}">${badge.label}</span>
          </div>
          <div class="ai-desc">${a.desc}</div>
        </div>
      `;
      list.appendChild(item);
    });

    const title = this.shadowRoot.getElementById("ttc-alerts-title");
    const sub   = this.shadowRoot.getElementById("ttc-alerts-sub");

    if (this._currentRoute) {
      if (title) title.textContent = "Alerts for your route";
      if (sub)   sub.textContent   = `${visible} alert${visible !== 1 ? "s" : ""} on your lines`;
      if (panel) panel.classList.add("show");
    } else {
      if (title) title.textContent = "Service alerts";
      if (sub)   sub.textContent   = "All monitored routes";
      // only show panel if there are active alerts
      const hasAlerts = alerts.some(a => a.status !== "normal" && a.status !== "unknown");
      if (panel) panel.classList.toggle("show", hasAlerts);
    }
  }

  _populateSelects() {
    const sorted = [...STATIONS].sort((a, b) => a.name.localeCompare(b.name));
    ["ttc-from", "ttc-to"].forEach((id) => {
      const sel = this.shadowRoot.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '<option value="">Select station</option>';
      sorted.forEach((s) => {
        const o = document.createElement("option");
        o.value = s.id;
        o.textContent = s.name;
        sel.appendChild(o);
      });
    });
  }

  _planRoute() {
    const fromId = this.shadowRoot.getElementById("ttc-from")?.value;
    const toId   = this.shadowRoot.getElementById("ttc-to")?.value;
    if (!fromId || !toId || fromId === toId) return;

    this._currentRoute = findRoute(fromId, toId);
    this._renderSummary(this._currentRoute);
    this._drawOverlay(this._currentRoute);
    this.shadowRoot.getElementById("ttc-plan-btn")?.classList.add("active");
    this._update(); /* re-filter alerts */
  }

  _renderSummary(route) {
    const el    = this.shadowRoot.getElementById("ttc-route-summary");
    const title = this.shadowRoot.getElementById("ttc-rs-title");
    const steps = this.shadowRoot.getElementById("ttc-rs-steps");
    if (!el) return;
    el.classList.add("show");

    if (route.type === "direct") {
      title.textContent = `${route.from.name} → ${route.to.name}`;
      steps.innerHTML = `<div class="rs-step"><div class="rs-dot" style="background:${LINE_COLORS[route.line] || "#888"}"></div><span>Take ${lineName(route.line)} — direct</span></div>`;
    } else if (route.type === "transfer") {
      title.textContent = `${route.from.name} → ${route.to.name}`;
      const c1 = LINE_COLORS[route.line1] || "#888";
      const c2 = LINE_COLORS[route.line2] || "#888";
      steps.innerHTML = `
        <div class="rs-step"><div class="rs-dot" style="background:${c1}"></div><span>${lineName(route.line1)} to ${route.via.name}</span></div>
        <div class="rs-step"><div class="rs-dot" style="background:#aaa;opacity:.5"></div><span>transfer</span></div>
        <div class="rs-step"><div class="rs-dot" style="background:${c2}"></div><span>${lineName(route.line2)} to ${route.to.name}</span></div>`;
    } else {
      title.textContent = `${route.from.name} → ${route.to.name}`;
      steps.innerHTML = `<div class="rs-step"><div class="rs-dot" style="background:#888"></div><span>Requires bus/streetcar — check ttc.ca</span></div>`;
    }
  }

  _drawOverlay(route) {
    const rog = this.shadowRoot.getElementById("ttc-route-overlay");
    if (!rog) return;
    rog.innerHTML = "";
    rog.style.opacity = "1";

    if (!route || route.type === "unknown") return;

    const ns = "http://www.w3.org/2000/svg";
    function seg(x1, y1, x2, y2, col) {
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", x1); l.setAttribute("y1", y1);
      l.setAttribute("x2", x2); l.setAttribute("y2", y2);
      l.setAttribute("stroke", col); l.setAttribute("stroke-width", "11");
      l.setAttribute("stroke-linecap", "round"); l.setAttribute("stroke-opacity", "0.35");
      rog.appendChild(l);
    }
    function dot(x, y, col) {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", "7");
      c.setAttribute("fill", col); c.setAttribute("fill-opacity", "0.55");
      c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", "2");
      rog.appendChild(c);
    }

    if (route.type === "direct") {
      const col = LINE_COLORS[route.line] || "#888";
      seg(route.from.x, route.from.y, route.to.x, route.to.y, col);
      dot(route.from.x, route.from.y, col);
      dot(route.to.x, route.to.y, col);
    } else {
      const c1 = LINE_COLORS[route.line1] || "#888", c2 = LINE_COLORS[route.line2] || "#888";
      seg(route.from.x, route.from.y, route.via.x, route.via.y, c1);
      seg(route.via.x, route.via.y, route.to.x, route.to.y, c2);
      dot(route.from.x, route.from.y, c1);
      dot(route.via.x, route.via.y, "#fff");
      dot(route.to.x, route.to.y, c2);
    }
  }

  _clearRoute() {
    this._currentRoute = null;
    const rog = this.shadowRoot.getElementById("ttc-route-overlay");
    if (rog) { rog.style.opacity = "0"; rog.innerHTML = ""; }
    this.shadowRoot.getElementById("ttc-route-summary")?.classList.remove("show");
    this.shadowRoot.getElementById("ttc-plan-btn")?.classList.remove("active");
    this.shadowRoot.getElementById("ttc-alerts-panel")?.classList.remove("show");
    this._update();
  }

  _swap() {
    const f = this.shadowRoot.getElementById("ttc-from");
    const t = this.shadowRoot.getElementById("ttc-to");
    if (!f || !t) return;
    const tmp = f.value; f.value = t.value; t.value = tmp;
    this._clearRoute();
  }

  _forceRefresh() {
    const el = this.shadowRoot.getElementById("ttc-updated");
    if (el) el.innerHTML = `<span class="live-dot"></span>Refreshing…`;
    /* Fire a hass update_entity service call */
    if (this._hass) {
      this._hass.callService("homeassistant", "update_entity", {
        entity_id: this._config.entities?.alerts || "sensor.ttc_alerts_raw",
      });
    }
  }

  _startPulse() {
    let op = 0.15, dir = 1;
    this._pulseTimer = setInterval(() => {
      const ov = this.shadowRoot.getElementById("ov-l2");
      if (!ov) return;
      op += dir * 0.012;
      if (op > 0.32) dir = -1;
      if (op < 0.05) dir = 1;
      ov.setAttribute("fill-opacity", op.toFixed(3));
    }, 50);
  }

  disconnectedCallback() {
    if (this._pulseTimer) clearInterval(this._pulseTimer);
  }

  /* ── EDITOR CONFIG SCHEMA ── */
  static get properties() {
    return { hass: {}, _config: {} };
  }

  getCardSize() { return 10; }
}

customElements.define("ttc-transit-card", TtcTransitCard);

/* ── CARD PICKER REGISTRATION ── */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "ttc-transit-card",
  name: "TTC Transit Card",
  description: "Live TTC subway map with route planner and filtered service alerts",
  preview: false,
  documentationURL: "https://github.com/KyhleOhlinger/lovelace-ttc-card",
});

console.info(
  `%c TTC-TRANSIT-CARD %c v${CARD_VERSION} `,
  "background:#F9BC1B;color:#000;font-weight:bold",
  "background:#222;color:#F9BC1B;font-weight:bold"
);