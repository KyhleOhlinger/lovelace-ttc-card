# lovelace-ttc-card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/KyhleOhlinger/lovelace-ttc-card.svg)](https://github.com/KyhleOhlinger/lovelace-ttc-card/releases)
[![Validate](https://github.com/KyhleOhlinger/lovelace-ttc-card/actions/workflows/validate.yml/badge.svg)](https://github.com/KyhleOhlinger/lovelace-ttc-card/actions/workflows/validate.yml)

A Home Assistant Lovelace card for Toronto commuters.

**Live TTC subway map · Per-line service status · Route planner with filtered alerts**

---

## What it does

- Draws a full schematic TTC subway map with all 75 stations across Line 1, Line 2, Line 4 Sheppard, and Eglinton LRT
- Colours each line based on live Home Assistant sensor states — yellow is normal, amber is delayed, red is a diversion
- Pulses an overlay directly on the affected map segment when there's an alert
- Route planner: pick any two stations and the card works out your route (including transfers) and filters the alerts panel to show only the lines you'll use
- Fires push notifications via HA automations when a line status changes

No API key required. Uses the public TTC live alerts feed at `alerts.ttc.ca`.

---

## Installation

### Via HACS (recommended)

1. In Home Assistant, go to **HACS → Frontend**
2. Click the three-dot menu → **Custom repositories**
3. Add `https://github.com/KyhleOhlinger/lovelace-ttc-card` as category **Dashboard**
4. Search for **TTC Transit Card** and click **Install**
5. Restart Home Assistant

### Manual

1. Download `dist/ttc-card.js` from the [latest release](https://github.com/KyhleOhlinger/lovelace-ttc-card/releases/latest)
2. Copy to `config/www/ttc-card.js`
3. In HA → Settings → Dashboards → Resources, add `/local/ttc-card.js` as **JavaScript module**
4. Restart Home Assistant

---

## Sensor setup (required)

The card reads status from HA sensors you configure. Add the following to your `configuration.yaml` (or use the package approach — see below).

### REST sensor (polls TTC live alerts API)

```yaml
rest:
  - resource: "https://alerts.ttc.ca/api/alerts/live"
    scan_interval: 120
    sensor:
      - name: "ttc_alerts_raw"
        unique_id: ttc_alerts_raw
        value_template: "{{ value_json | length }}"
        json_attributes_path: "$"
        json_attributes:
          - routes
```

### Template sensors (one per line)

```yaml
template:
  - sensor:
      - name: "ttc_line1_status"
        unique_id: ttc_line1_status
        state: >
          {% set routes = state_attr('sensor.ttc_alerts_raw', 'routes') %}
          {% if routes is none %}unknown{% else %}
          {% set ns = namespace(status='normal') %}
          {% for r in routes %}
            {% set t = (r.title | default('')) | lower %}
            {% if 'line 1' in t or 'yonge' in t or 'university' in t %}
              {% if 'delay' in t %}{% set ns.status = 'delays' %}
              {% elif 'divert' in t %}{% set ns.status = 'diversion' %}
              {% elif 'suspend' in t %}{% set ns.status = 'suspended' %}
              {% endif %}
            {% endif %}
          {% endfor %}
          {{ ns.status }}{% endif %}

      - name: "ttc_line2_status"
        unique_id: ttc_line2_status
        state: >
          {% set routes = state_attr('sensor.ttc_alerts_raw', 'routes') %}
          {% if routes is none %}unknown{% else %}
          {% set ns = namespace(status='normal') %}
          {% for r in routes %}
            {% set t = (r.title | default('')) | lower %}
            {% if 'line 2' in t or 'bloor' in t or 'danforth' in t %}
              {% if 'delay' in t %}{% set ns.status = 'delays' %}
              {% elif 'divert' in t %}{% set ns.status = 'diversion' %}
              {% elif 'suspend' in t %}{% set ns.status = 'suspended' %}
              {% endif %}
            {% endif %}
          {% endfor %}
          {{ ns.status }}{% endif %}

      - name: "ttc_line4_status"
        unique_id: ttc_line4_status
        state: >
          {% set routes = state_attr('sensor.ttc_alerts_raw', 'routes') %}
          {% if routes is none %}unknown{% else %}
          {% set ns = namespace(status='normal') %}
          {% for r in routes %}
            {% set t = (r.title | default('')) | lower %}
            {% if 'line 4' in t or 'sheppard' in t %}
              {% if 'delay' in t %}{% set ns.status = 'delays' %}{% endif %}
            {% endif %}
          {% endfor %}
          {{ ns.status }}{% endif %}

      - name: "ttc_eglinton_status"
        unique_id: ttc_eglinton_status
        state: >
          {% set routes = state_attr('sensor.ttc_alerts_raw', 'routes') %}
          {% if routes is none %}unknown{% else %}
          {% set ns = namespace(status='normal') %}
          {% for r in routes %}
            {% set t = (r.title | default('')) | lower %}
            {% if 'eglinton' in t or 'crosstown' in t %}
              {% if 'slow' in t or 'speed' in t %}{% set ns.status = 'slow_zone' %}
              {% elif 'delay' in t %}{% set ns.status = 'delays' %}
              {% endif %}
            {% endif %}
          {% endfor %}
          {{ ns.status }}{% endif %}

      - name: "ttc_504_status"
        unique_id: ttc_504_status
        state: >
          {% set routes = state_attr('sensor.ttc_alerts_raw', 'routes') %}
          {% if routes is none %}unknown{% else %}
          {% set ns = namespace(status='normal') %}
          {% for r in routes %}
            {% set t = (r.title | default('')) | lower %}
            {% if '504' in t or 'king streetcar' in t %}
              {% if 'divert' in t or 'bus' in t %}{% set ns.status = 'diversion' %}
              {% elif 'delay' in t %}{% set ns.status = 'delays' %}
              {% endif %}
            {% endif %}
          {% endfor %}
          {{ ns.status }}{% endif %}

      - name: "ttc_29_status"
        unique_id: ttc_29_status
        state: >
          {% set routes = state_attr('sensor.ttc_alerts_raw', 'routes') %}
          {% if routes is none %}unknown{% else %}
          {% set ns = namespace(status='normal') %}
          {% for r in routes %}
            {% set t = (r.title | default('')) | lower %}
            {% if '29 dufferin' in t or ('29' in t and 'dufferin' in t) %}
              {% if 'divert' in t %}{% set ns.status = 'diversion' %}
              {% elif 'delay' in t %}{% set ns.status = 'delays' %}
              {% endif %}
            {% endif %}
          {% endfor %}
          {{ ns.status }}{% endif %}

      - name: "ttc_last_updated"
        unique_id: ttc_last_updated
        state: >
          {{ states.sensor.ttc_alerts_raw.last_updated.strftime('%H:%M')
             if states.sensor.ttc_alerts_raw is defined else 'unknown' }}

      - name: "ttc_active_alerts_count"
        unique_id: ttc_active_alerts_count
        unit_of_measurement: alerts
        state: >
          {{ [states('sensor.ttc_line1_status'),
              states('sensor.ttc_line2_status'),
              states('sensor.ttc_line4_status'),
              states('sensor.ttc_eglinton_status'),
              states('sensor.ttc_504_status'),
              states('sensor.ttc_29_status')]
             | reject('eq','normal') | reject('eq','unknown') | list | length }}
```

A full copy-paste-ready `configuration_ttc.yaml` is included in the [releases](https://github.com/KyhleOhlinger/lovelace-ttc-card/releases/latest).

---

## Lovelace card configuration

```yaml
type: custom:ttc-transit-card
entities:
  line1:    sensor.ttc_line_1_status
  line2:    sensor.ttc_line_2_status
  line4:    sensor.ttc_line_4_status
  eglinton: sensor.ttc_eglinton_status
  s504:     sensor.ttc_504_status
  s29:      sensor.ttc_29_status
  alerts:   sensor.ttc_alerts_raw
  updated:  sensor.ttc_last_updated
  # Optional: persist selected route across HA restarts (see below)
  # route_from: input_select.ttc_route_from
  # route_to:   input_select.ttc_route_to
# Optional: pre-select stations on load (use station IDs from the list below)
default_from: ""
default_to:   ""
```

All `entities` keys are optional — the defaults match the sensor names above.

### Default route configuration

You can configure a default start and end station so your most-used commute route loads automatically every time the dashboard opens, with the route already highlighted on the map and alerts pre-filtered to your lines.

**Option A — Simple defaults (card YAML only):**

```yaml
type: custom:ttc-transit-card
default_from: spadina
default_to:   blooryonge
entities:
  ...
```

The card will pre-select these stations and auto-plan the route on every load. If you change the selection manually it updates immediately, but the defaults will reappear on the next full page load.

**Option B — Persistent defaults (survives HA restarts and dashboard reloads):**

Add `input_select` helpers and link them in the card config. The card reads from these on load and writes back every time you plan a route, so your last-used route is remembered permanently.

Step 1 — add to `configuration.yaml`:
```yaml
input_select:
  ttc_route_from:
    name: "TTC From station"
    options:
      - ""
      - "Spadina"
      - "Bloor–Yonge"
      - "Union"
      - "Finch West"
      # add any stations you commonly use
    icon: mdi:map-marker

  ttc_route_to:
    name: "TTC To station"
    options:
      - ""
      - "Spadina"
      - "Bloor–Yonge"
      - "Union"
      - "Finch West"
    icon: mdi:map-marker-check
```

Step 2 — link in the card config:
```yaml
type: custom:ttc-transit-card
entities:
  ...
  route_from: input_select.ttc_route_from
  route_to:   input_select.ttc_route_to
```

With this setup: when you pick a route and tap "Find route", the card calls `input_select.select_option` to save both stations to HA. On next load, the card reads those helpers and auto-plans the saved route immediately.

### Station IDs

Use these IDs in `default_from` / `default_to`:

| Station | ID | Line |
|---|---|---|
| Vaughan MC | `vaughan` | 1 |
| Finch West | `finchw` | 1, 6 |
| Finch | `finchy` | 1 |
| Sheppard West | `sheppardw` | 1 |
| Sheppard–Yonge | `sheppardyonge` | 1, 4 |
| Eglinton West | `eglintonw` | 1, 5 |
| Eglinton | `eglinton` | 1, 5 |
| Spadina | `spadina` | 1, 2 |
| St George | `stgeorge` | 1, 2 |
| Bloor–Yonge | `blooryonge` | 1, 2 |
| Union | `union` | 1 |
| Osgoode | `osgoode` | 1 |
| Kipling | `kipling` | 2 |
| Kennedy | `kennedy` | 2 |
| Don Mills | `donmills` | 4 |
| Humber College | `fw-humber` | 6 |
| Mount Dennis | `eg-mount-dennis` | 5 |

Full station ID list is in `dist/ttc-card.js` in the `STATIONS` array.

---

## Creating the dashboard

The card is designed to run in **panel mode** — a single full-screen view with the route planner bar pinned at the top and the map filling the remaining height.

### Step 1 — Create a new dashboard

1. In Home Assistant, go to **Settings → Dashboards**
2. Click **Add Dashboard**
3. Give it a title (e.g. `Transit`) and choose an icon (`mdi:subway-variant`)
4. Click **Create**

### Step 2 — Switch to panel mode and add the card

1. Open the new dashboard and click the **pencil icon** (Edit)
2. Click the **three-dot menu** → **Raw config editor**
3. Replace the entire contents with the YAML below and click **Save**

```yaml
views:
  - title: TTC
    path: ttc
    icon: mdi:subway-variant
    type: panel
    cards:
      - type: custom:ttc-transit-card
        entities:
          line1:    sensor.ttc_line_1_status
          line2:    sensor.ttc_line_2_status
          line4:    sensor.ttc_line_4_status
          eglinton: sensor.ttc_eglinton_status
          s504:     sensor.ttc_504_status
          s29:      sensor.ttc_29_status
          alerts:   sensor.ttc_alerts_raw
          updated:  sensor.ttc_last_updated
```

> **Note on entity IDs:** If you created the template sensors via the HA Helpers UI (Settings → Helpers), Home Assistant automatically slugifies the names — `TTC Line 1 Status` becomes `sensor.ttc_line_1_status` (with underscores between each word). If you added them manually via `configuration.yaml` using the names in the sensor setup section above, the entity IDs will be `sensor.ttc_line1_status` (no extra underscores). Check **Developer Tools → States** and search for `ttc` to confirm the exact entity IDs on your instance, then update the YAML accordingly.

### Step 3 — Verify

After saving, the dashboard will appear in your sidebar. The card fills the entire screen:

- **Top bar** — TTC branding, live update time, route planner dropdowns, refresh button
- **Route summary strip** — appears below the top bar after you plan a route, showing your lines and any transfers
- **Alerts panel** — slides in automatically when there are active alerts or when a route is planned, filtered to only your lines
- **Map** — fills the remaining screen height; line colours update live from your sensors

### Troubleshooting

| Symptom | Fix |
|---|---|
| Card shows "Custom element doesn't exist: ttc-transit-card" | The JS resource isn't registered. Go to Settings → Dashboards → Resources and confirm `/hacsfiles/lovelace-ttc-card/ttc-card.js` is listed. If not, reinstall via HACS. |
| Map renders but all lines are grey | The template sensors exist but can't reach `sensor.ttc_alerts_raw`. Check that the REST sensor is configured in `configuration.yaml` and HA has been restarted. |
| Sensors show `unknown` | The REST sensor hasn't pulled data yet. Go to Developer Tools → Services, call `homeassistant.update_entity` with `entity_id: sensor.ttc_alerts_raw`, then check the state again. |
| Entity IDs don't match | Open Developer Tools → States and search `ttc` to find the exact IDs on your instance. Update the dashboard YAML to match. |

---

## Using the packages approach (optional, recommended)

Create `config/packages/ttc.yaml` and paste the full sensor YAML there. Then add to `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages/
```

This keeps all TTC config isolated and easy to update.

---

## Automations (optional)

Automations for push notifications when line status changes are included in `automations_ttc.yaml` in the [releases](https://github.com/KyhleOhlinger/lovelace-ttc-card/releases/latest). Append to your `automations.yaml`.

---

## Repository structure

```
lovelace-ttc-card/
├── dist/
│   └── ttc-card.js          ← the Lovelace card (HACS downloads this)
├── .github/
│   └── workflows/
│       ├── release.yml      ← auto-creates GitHub releases on version tags
│       └── validate.yml     ← HACS validation on every push/PR
├── hacs.json                ← HACS metadata
├── info.md                  ← shown in the HACS UI
└── README.md                ← this file
```

---

## Data sources

| Source | URL | Interval |
|---|---|---|
| TTC Live Alerts | `https://alerts.ttc.ca/api/alerts/live` | Every 2 min |
| Community RSS bridge | `https://liventnick.github.io/TTC-Alerts-RSS/ttc_feed.xml` | Backup |

No API key required.

---

## Publishing to the default HACS store

To be included in the default HACS store (so anyone can find it without adding a custom repo), submit a pull request to [hacs/default](https://github.com/hacs/default) following their [inclusion requirements](https://hacs.xyz/docs/publish/include/). Your repo must have at least one GitHub release and pass HACS validation.

---

## License

MIT — see [LICENSE](LICENSE)