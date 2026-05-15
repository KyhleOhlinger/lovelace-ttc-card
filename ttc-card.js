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

const CARD_VERSION = "1.0.0";

/* ─────────────────────────────────────────────
   DATA: stations, line colours, alert mapping
───────────────────────────────────────────── */
const LINE_COLORS = {
  1: "#F9BC1B",
  2: "#009E60",
  4: "#C0392B",
  eg: "#9B59B6",
};

const STATIONS = [
  { id: "vaughan",       name: "Vaughan MC",           lines: [1],      x: 175, y: 18  },
  { id: "hwy407",        name: "Highway 407",           lines: [1],      x: 175, y: 34  },
  { id: "pioneer",       name: "Pioneer Village",       lines: [1],      x: 175, y: 50  },
  { id: "yorku",         name: "York University",       lines: [1],      x: 175, y: 66  },
  { id: "finchw",        name: "Finch West",            lines: [1],      x: 175, y: 82  },
  { id: "downsview",     name: "Downsview Park",        lines: [1],      x: 175, y: 98  },
  { id: "sheppardw",     name: "Sheppard West",         lines: [1],      x: 175, y: 114 },
  { id: "wilson",        name: "Wilson",                lines: [1],      x: 175, y: 130 },
  { id: "yorkdale",      name: "Yorkdale",              lines: [1],      x: 175, y: 146 },
  { id: "spadina",       name: "Spadina",               lines: [1, 2],   x: 175, y: 165 },
  { id: "stgeorge",      name: "St George",             lines: [1, 2],   x: 230, y: 165 },
  { id: "blooryonge",    name: "Bloor–Yonge",           lines: [1, 2],   x: 315, y: 165 },
  { id: "rosedale",      name: "Rosedale",              lines: [1],      x: 315, y: 146 },
  { id: "summerhill",    name: "Summerhill",            lines: [1],      x: 315, y: 130 },
  { id: "stclair",       name: "St Clair",              lines: [1],      x: 315, y: 114 },
  { id: "davisville",    name: "Davisville",            lines: [1],      x: 315, y: 98  },
  { id: "eglinton",      name: "Eglinton",              lines: [1],      x: 315, y: 82  },
  { id: "lawrence",      name: "Lawrence",              lines: [1],      x: 315, y: 66  },
  { id: "yorkmills",     name: "York Mills",            lines: [1],      x: 315, y: 50  },
  { id: "northy",        name: "North York Centre",     lines: [1],      x: 315, y: 34  },
  { id: "finchy",        name: "Finch",                 lines: [1],      x: 315, y: 18  },
  { id: "sheppardyonge", name: "Sheppard–Yonge",        lines: [1, 4],   x: 315, y: 58  },
  { id: "queenspark",    name: "Queens Park",           lines: [1],      x: 315, y: 181 },
  { id: "college",       name: "College",               lines: [1],      x: 315, y: 197 },
  { id: "union",         name: "Union",                 lines: [1],      x: 250, y: 205 },
  { id: "osgoode",       name: "Osgoode",               lines: [1],      x: 225, y: 205 },
  { id: "standrew",      name: "St Andrew",             lines: [1],      x: 200, y: 205 },
  { id: "kipling",       name: "Kipling",               lines: [2],      x: 18,  y: 165 },
  { id: "islington",     name: "Islington",             lines: [2],      x: 50,  y: 165 },
  { id: "royal-york",    name: "Royal York",            lines: [2],      x: 82,  y: 165 },
  { id: "old-mill",      name: "Old Mill",              lines: [2],      x: 110, y: 165 },
  { id: "jane",          name: "Jane",                  lines: [2],      x: 136, y: 165 },
  { id: "bay",           name: "Bay",                   lines: [2],      x: 263, y: 165 },
  { id: "sherbourne",    name: "Sherbourne",            lines: [2],      x: 355, y: 165 },
  { id: "castle-frank",  name: "Castle Frank",          lines: [2],      x: 393, y: 165 },
  { id: "broadview",     name: "Broadview",             lines: [2],      x: 428, y: 165 },
  { id: "chester",       name: "Chester",               lines: [2],      x: 460, y: 165 },
  { id: "pape",          name: "Pape",                  lines: [2],      x: 490, y: 165 },
  { id: "donlands",      name: "Donlands",              lines: [2],      x: 520, y: 165 },
  { id: "greenwood",     name: "Greenwood",             lines: [2],      x: 550, y: 165 },
  { id: "coxwell",       name: "Coxwell",               lines: [2],      x: 578, y: 165 },
  { id: "kennedy",       name: "Kennedy",               lines: [2],      x: 602, y: 165 },
  { id: "bayview",       name: "Bayview",               lines: [4],      x: 358, y: 58  },
  { id: "bessarion",     name: "Bessarion",             lines: [4],      x: 400, y: 58  },
  { id: "leslie",        name: "Leslie",                lines: [4],      x: 445, y: 58  },
  { id: "donmills",      name: "Don Mills",             lines: [4],      x: 490, y: 58  },
  { id: "eg-mount-dennis", name: "Mount Dennis (LRT)", lines: ["eg"],   x: 18,  y: 240 },
  { id: "eg-keelesdale",   name: "Keelesdale (LRT)",   lines: ["eg"],   x: 100, y: 240 },
  { id: "eg-eglintonw",    name: "Eglinton West (LRT)",lines: [1,"eg"], x: 175, y: 240 },
  { id: "eg-avenue",       name: "Avenue (LRT)",        lines: ["eg"],   x: 245, y: 240 },
  { id: "eg-eglinton",     name: "Eglinton (LRT)",      lines: [1,"eg"], x: 315, y: 240 },
  { id: "eg-leaside",      name: "Leaside (LRT)",       lines: ["eg"],   x: 393, y: 240 },
  { id: "eg-science",      name: "Science Centre (LRT)",lines: ["eg"],   x: 490, y: 240 },
  { id: "eg-ionview",      name: "Ionview (LRT)",       lines: ["eg"],   x: 560, y: 240 },
  { id: "eg-kennedy",      name: "Kennedy (LRT)",       lines: ["eg"],   x: 602, y: 240 },
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
    { 1: "Line 1 Yonge–University", 2: "Line 2 Bloor–Danforth", 4: "Line 4 Sheppard", eg: "Eglinton LRT" }[l] || "Transit"
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
   SVG MAP BUILDER
───────────────────────────────────────────── */
function buildMap(l1c, l2c, l4c, egc, l1s, l2s, egS) {
  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("id", "ttc-svg");
  svg.setAttribute("viewBox", "0 0 620 310");
  svg.style.cssText = "width:100%;height:auto;display:block";

  function el(tag, attrs) {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }
  function txt(content, attrs) {
    const t = el("text", attrs);
    t.textContent = content;
    return t;
  }

  /* Lines */
  svg.appendChild(el("line",     { x1:18,   y1:165, x2:602, y2:165, stroke:l2c, "stroke-width":7, "stroke-linecap":"round" }));
  svg.appendChild(el("polyline", { points:"175,18 175,165",          fill:"none", stroke:l1c, "stroke-width":7, "stroke-linecap":"round", "stroke-linejoin":"round" }));
  svg.appendChild(el("polyline", { points:"175,165 175,205 250,205 315,205", fill:"none", stroke:l1c, "stroke-width":7, "stroke-linecap":"round", "stroke-linejoin":"round" }));
  svg.appendChild(el("polyline", { points:"315,205 315,165 315,18", fill:"none", stroke:l1c, "stroke-width":7, "stroke-linecap":"round", "stroke-linejoin":"round" }));
  svg.appendChild(el("line",     { x1:315,  y1:58,  x2:490, y2:58,  stroke:l4c, "stroke-width":7, "stroke-linecap":"round" }));
  svg.appendChild(el("line",     { x1:18,   y1:240, x2:602, y2:240, stroke:egc, "stroke-width":5, "stroke-linecap":"round", "stroke-dasharray":"10,5" }));

  /* Status overlays */
  if (l2s !== "normal" && l2s !== "unknown") {
    const ov = el("rect", { x:18, y:158, width:587, height:14, rx:3, fill: l2s === "diversion" ? "#C0392B" : "#F9BC1B", "fill-opacity":0.18 });
    ov.id = "ov-l2";
    svg.appendChild(ov);
  }
  if (l1s !== "normal" && l1s !== "unknown") {
    svg.appendChild(el("rect", { x:168, y:18, width:14, height:147, rx:3, fill:"#F9BC1B", "fill-opacity":0.22 }));
    svg.appendChild(el("rect", { x:308, y:18, width:14, height:147, rx:3, fill:"#F9BC1B", "fill-opacity":0.22 }));
  }
  if (egS !== "normal" && egS !== "unknown") {
    svg.appendChild(el("rect", { x:18, y:234, width:587, height:12, rx:3, fill:"#EF9F27", "fill-opacity":0.18 }));
  }

  /* Route overlay group (JS-controlled) */
  const rog = document.createElementNS(ns, "g");
  rog.id = "ttc-route-overlay";
  rog.style.opacity = "0";
  svg.appendChild(rog);

  /* Stations */
  function stn(cx, cy, r, stroke, fill = "#fff", sw = 2) {
    return el("circle", { cx, cy, r, fill, stroke, "stroke-width": sw });
  }
  function interchange(cx, cy, dotFill) {
    svg.appendChild(stn(cx, cy, 8, "#888", "#fff", 2));
    svg.appendChild(el("circle", { cx, cy, r: 3.5, fill: dotFill }));
  }

  /* Line 1 west */
  [18,34,50,66,82,98,114,130,146].forEach((y,i) =>
    svg.appendChild(stn(175, y, i===0?5:3.5, l1c, "#fff", i===0?2.5:2))
  );
  interchange(175, 165, l1c);

  /* Line 1 east */
  [18,34,50,66,82,98,114,130,146].forEach((y,i) =>
    svg.appendChild(stn(315, y, i===0?5:3.5, l1c, "#fff", i===0?2.5:2))
  );
  svg.appendChild(stn(315, 181, 3.5, l1c));
  svg.appendChild(stn(315, 197, 3.5, l1c));

  /* Bloor-Yonge interchange */
  svg.appendChild(stn(315, 165, 9, "#888", "#fff", 2.5));
  svg.appendChild(el("circle", { cx:315, cy:165, r:4, fill:l2c }));

  /* Union */
  interchange(250, 205, l1c);
  svg.appendChild(stn(225, 205, 3.5, l1c));
  svg.appendChild(stn(200, 205, 3.5, l1c));

  /* Line 2 */
  [[18,4.5],[50,3.5],[82,3.5],[110,3.5],[136,3.5]].forEach(([x,r]) => svg.appendChild(stn(x,165,r,l2c)));
  interchange(230, 165, "#888");
  svg.appendChild(stn(263, 165, 3.5, l2c));
  [355,393,428,460,490,520,550].forEach(x => svg.appendChild(stn(x,165,3.5,l2c)));
  svg.appendChild(stn(578, 165, 4, l2c));
  svg.appendChild(stn(602, 165, 4.5, l2c));

  /* Line 4 */
  svg.appendChild(stn(315, 58, 7, "#888", "#fff", 2));
  svg.appendChild(el("circle", { cx:315, cy:58, r:3, fill:l4c }));
  [358,400,445].forEach(x => svg.appendChild(stn(x,58,3.5,l4c)));
  svg.appendChild(stn(490, 58, 4.5, l4c, "#fff", 2.5));

  /* Eglinton LRT */
  [18,100].forEach(x => svg.appendChild(stn(x,240,3.5,egc,"#fff",1.5)));
  svg.appendChild(stn(175, 240, 6, "#888", "#fff", 1.5));
  svg.appendChild(el("circle", { cx:175, cy:240, r:2.5, fill:egc }));
  svg.appendChild(stn(245, 240, 3.5, egc, "#fff", 1.5));
  svg.appendChild(stn(315, 240, 6, "#888", "#fff", 1.5));
  svg.appendChild(el("circle", { cx:315, cy:240, r:2.5, fill:egc }));
  [393,490,560,602].forEach(x => svg.appendChild(stn(x,240,3.5,egc,"#fff",1.5)));

  /* Status warning labels */
  if (l2s === "delays")    svg.appendChild(txt("⚠ Delays",    { x:458, y:155, "text-anchor":"middle", "font-size":9, fill:"#F9BC1B", "font-weight":"bold" }));
  if (l2s === "diversion") svg.appendChild(txt("✕ Diversion", { x:458, y:155, "text-anchor":"middle", "font-size":9, fill:"#C0392B", "font-weight":"bold" }));
  if (l2s === "suspended") svg.appendChild(txt("⊘ Suspended", { x:458, y:155, "text-anchor":"middle", "font-size":9, fill:"#888",    "font-weight":"bold" }));
  if (l1s !== "normal" && l1s !== "unknown")
    svg.appendChild(txt("⚠", { x:155, y:90, "text-anchor":"end", "font-size":10, fill:"#EF9F27", "font-weight":"bold" }));
  if (egS !== "normal" && egS !== "unknown")
    svg.appendChild(txt("⚠ Slow zone", { x:310, y:258, "text-anchor":"middle", "font-size":8, fill:"#EF9F27", "font-weight":"bold" }));

  /* Labels */
  const labels = [
    ["Vaughan MC",    175,  12, "middle"],
    ["Finch",         315,  12, "middle"],
    ["Spadina",       161, 173, "end"],
    ["Union",         237, 218, "middle"],
    ["Bloor–Yonge",   322, 178, "start"],
    ["Kipling",        14, 159, "start"],
    ["Kennedy",       606, 159, "start"],
    ["Don Mills",     495,  52, "start"],
    ["Eglinton (W)",  178, 252, "start"],
    ["Eglinton",      319, 252, "start"],
  ];
  labels.forEach(([t,x,y,a]) => svg.appendChild(txt(t, { x, y, "text-anchor":a, "font-size":8, fill:"#888" })));

  const lineLabels = [
    ["Line 1", 175, 108, l1c],
    ["Line 2",  58, 157, l2c],
    ["Line 4", 378,  50, l4c],
    ["Eglinton LRT", 258, 232, egc],
  ];
  lineLabels.forEach(([t,x,y,fill]) => svg.appendChild(txt(t, { x, y, "font-size":8, fill, "font-weight":"500" })));

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
      :host { display: block; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--primary-font-family, sans-serif); }
      .root { display: grid; grid-template-columns: 1fr 290px; gap: 12px; }
      @media (max-width: 680px) { .root { grid-template-columns: 1fr; } }
      .card { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; overflow: hidden; }
      .card-hd { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
      .card-hd-l { display: flex; align-items: center; gap: 9px; }
      .ht { font-size: 14px; font-weight: 500; color: var(--primary-text-color); }
      .hs { font-size: 11px; color: var(--secondary-text-color); margin-top: 1px; }
      .map-wrap { background: #0d0f12; padding: 10px; }
      .legend { display: flex; gap: 12px; padding: 7px 12px; border-bottom: 1px solid var(--divider-color, #e0e0e0); flex-wrap: wrap; }
      .li { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--secondary-text-color); }
      .ld { width: 18px; height: 6px; border-radius: 3px; }
      .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
      .stat { background: var(--secondary-background-color, #f5f5f5); border-radius: 8px; padding: 8px 10px; text-align: center; }
      .stat-n { font-size: 20px; font-weight: 500; }
      .stat-l { font-size: 10px; color: var(--secondary-text-color); margin-top: 2px; }
      .right-col { display: flex; flex-direction: column; gap: 12px; }
      .rp { padding: 12px 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
      .rp-row { display: grid; grid-template-columns: 1fr 32px 1fr; gap: 8px; align-items: end; }
      .fl { font-size: 11px; color: var(--secondary-text-color); margin-bottom: 4px; }
      select { width: 100%; font-size: 12px; padding: 6px 8px; border-radius: 8px; border: 1px solid var(--divider-color, #ccc); background: var(--secondary-background-color, #f5f5f5); color: var(--primary-text-color); cursor: pointer; }
      .swap-btn { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--divider-color, #ccc); background: var(--secondary-background-color, #f5f5f5); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; color: var(--secondary-text-color); }
      .route-btn { width: 100%; margin-top: 10px; padding: 8px; font-size: 12px; font-weight: 500; border-radius: 8px; border: 1px solid var(--divider-color, #ccc); background: var(--secondary-background-color, #f5f5f5); color: var(--primary-text-color); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .route-btn.active { background: #185FA5; color: #E6F1FB; border-color: #185FA5; }
      .route-summary { padding: 10px 14px; background: var(--secondary-background-color, #f5f5f5); border-bottom: 1px solid var(--divider-color, #e0e0e0); display: none; }
      .route-summary.show { display: block; }
      .rs-title { font-size: 12px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px; }
      .rs-steps { display: flex; flex-direction: column; gap: 4px; }
      .rs-step { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--secondary-text-color); }
      .rs-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .sl { font-size: 10px; font-weight: 500; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .06em; padding: 10px 14px 6px; }
      .alert-item { padding: 9px 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); display: flex; align-items: flex-start; gap: 9px; }
      .alert-item:last-child { border-bottom: none; }
      .ai-icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
      .ai-ok      { background: #1D9E7518; color: #1D9E75; }
      .ai-warn    { background: #BA751718; color: #BA7517; }
      .ai-danger  { background: #A32D2D18; color: #A32D2D; }
      .ai-info    { background: #185FA518; color: #185FA5; }
      .ai-muted   { background: #88888818; color: #888; }
      .ai-name { font-size: 12px; font-weight: 500; color: var(--primary-text-color); }
      .ai-desc { font-size: 11px; color: var(--secondary-text-color); margin-top: 2px; line-height: 1.4; }
      .badge { font-size: 10px; padding: 2px 7px; border-radius: 999px; font-weight: 500; margin-left: 4px; }
      .b-ok     { background: #1D9E7512; color: #0F6E56; }
      .b-warn   { background: #BA751712; color: #854F0B; }
      .b-danger { background: #A32D2D12; color: #791F1F; }
      .b-info   { background: #185FA512; color: #0C447C; }
      .b-muted  { background: #88888812; color: #666; }
      .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #1D9E75; display: inline-block; margin-right: 4px; animation: pdot 2s infinite; }
      @keyframes pdot { 0%,100%{opacity:1}50%{opacity:.35} }
      .refresh-btn { font-size: 11px; border: 1px solid var(--divider-color,#ccc); border-radius: 8px; padding: 4px 9px; cursor: pointer; background: transparent; color: var(--secondary-text-color); }
    `;
    root.appendChild(style);

    /* Root grid */
    const rootDiv = document.createElement("div");
    rootDiv.className = "root";

    /* Left: map card */
    const leftCard = document.createElement("div");
    leftCard.className = "card";

    /* Header */
    const hd = document.createElement("div");
    hd.className = "card-hd";
    hd.innerHTML = `
      <div class="card-hd-l">
        <span style="font-size:20px">🚇</span>
        <div>
          <div class="ht">TTC Transit</div>
          <div class="hs" id="ttc-updated"><span class="live-dot"></span>Live · Loading…</div>
        </div>
      </div>
      <button class="refresh-btn" id="ttc-refresh-btn">↻ Refresh</button>
    `;
    leftCard.appendChild(hd);

    /* Map */
    const mapWrap = document.createElement("div");
    mapWrap.className = "map-wrap";
    mapWrap.id = "ttc-map-wrap";
    leftCard.appendChild(mapWrap);

    /* Legend */
    const legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML = `
      <div class="li"><div class="ld" style="background:#F9BC1B"></div>Line 1</div>
      <div class="li"><div class="ld" style="background:#009E60"></div>Line 2</div>
      <div class="li"><div class="ld" style="background:#C0392B"></div>Line 4</div>
      <div class="li"><div class="ld" style="background:#9B59B6"></div>Eglinton LRT</div>
      <div class="li"><div class="ld" style="background:#F9BC1B;opacity:.35;border-radius:2px"></div>Active alert</div>
    `;
    leftCard.appendChild(legend);

    /* Stats */
    const statRow = document.createElement("div");
    statRow.className = "stat-row";
    statRow.id = "ttc-stat-row";
    statRow.innerHTML = `
      <div class="stat"><div class="stat-n" id="st-alerts">—</div><div class="stat-l">Active alerts</div></div>
      <div class="stat"><div class="stat-n" style="font-size:13px" id="st-l1">—</div><div class="stat-l">Line 1</div></div>
      <div class="stat"><div class="stat-n" style="font-size:13px" id="st-l2">—</div><div class="stat-l">Line 2</div></div>
    `;
    leftCard.appendChild(statRow);

    rootDiv.appendChild(leftCard);

    /* Right column */
    const rightCol = document.createElement("div");
    rightCol.className = "right-col";

    /* Route planner card */
    const rpCard = document.createElement("div");
    rpCard.className = "card";
    rpCard.innerHTML = `
      <div class="card-hd">
        <div class="card-hd-l">
          <span style="font-size:18px">🗺</span>
          <div><div class="ht">Route planner</div><div class="hs">Filter alerts to your trip</div></div>
        </div>
      </div>
      <div class="rp">
        <div class="rp-row">
          <div><div class="fl">From</div><select id="ttc-from"></select></div>
          <div style="display:flex;align-items:flex-end">
            <button class="swap-btn" id="ttc-swap">⇄</button>
          </div>
          <div><div class="fl">To</div><select id="ttc-to"></select></div>
        </div>
        <button class="route-btn" id="ttc-plan-btn">🔍 Find route &amp; alerts</button>
      </div>
      <div class="route-summary" id="ttc-route-summary">
        <div class="rs-title" id="ttc-rs-title"></div>
        <div class="rs-steps" id="ttc-rs-steps"></div>
      </div>
    `;
    rightCol.appendChild(rpCard);

    /* Alerts card */
    const alertCard = document.createElement("div");
    alertCard.className = "card";
    alertCard.style.flex = "1";
    alertCard.innerHTML = `
      <div class="card-hd">
        <div class="card-hd-l">
          <span style="font-size:18px">⚠️</span>
          <div>
            <div class="ht" id="ttc-alerts-title">Service alerts</div>
            <div class="hs" id="ttc-alerts-sub">All monitored routes</div>
          </div>
        </div>
      </div>
      <div id="ttc-alerts-list"></div>
    `;
    rightCol.appendChild(alertCard);
    rootDiv.appendChild(rightCol);
    root.appendChild(rootDiv);

    /* Populate station selects */
    this._populateSelects();

    /* Wire events */
    root.getElementById("ttc-refresh-btn").addEventListener("click", () => this._forceRefresh());
    root.getElementById("ttc-plan-btn").addEventListener("click", () => this._planRoute());
    root.getElementById("ttc-swap").addEventListener("click", () => this._swap());
    root.getElementById("ttc-from").addEventListener("change", () => this._clearRoute());
    root.getElementById("ttc-to").addEventListener("change", () => this._clearRoute());

    /* Initial map (blank) */
    mapWrap.appendChild(buildMap("#F9BC1B", "#009E60", "#C0392B", "#9B59B6", "normal", "normal", "normal"));

    /* Pulse animation on delay overlay */
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
    const list = this.shadowRoot.getElementById("ttc-alerts-list");
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
    if (this._currentRoute && title && sub) {
      title.textContent = "Alerts for your route";
      sub.textContent = `${visible} alert${visible !== 1 ? "s" : ""} on your lines`;
    } else if (title && sub) {
      title.textContent = "Service alerts";
      sub.textContent = "All monitored routes";
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
      steps.innerHTML = `<div class="rs-step"><div class="rs-dot" style="background:${LINE_COLORS[route.line] || "#888"}"></div><span>Take ${lineName(route.line)} — no transfer needed</span></div>`;
    } else if (route.type === "transfer") {
      title.textContent = `${route.from.name} → ${route.to.name}`;
      const c1 = LINE_COLORS[route.line1] || "#888";
      const c2 = LINE_COLORS[route.line2] || "#888";
      steps.innerHTML = `
        <div class="rs-step"><div class="rs-dot" style="background:${c1}"></div><span>Take ${lineName(route.line1)} to ${route.via.name}</span></div>
        <div class="rs-step"><div class="rs-dot" style="background:#aaa;opacity:.5"></div><span>Transfer at ${route.via.name}</span></div>
        <div class="rs-step"><div class="rs-dot" style="background:${c2}"></div><span>Take ${lineName(route.line2)} to ${route.to.name}</span></div>`;
    } else {
      title.textContent = `${route.from.name} → ${route.to.name}`;
      steps.innerHTML = `<div class="rs-step"><div class="rs-dot" style="background:#888"></div><span>Route requires bus/streetcar connection — check ttc.ca</span></div>`;
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

  getCardSize() { return 6; }
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
