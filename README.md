# TTC Transit Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/KyhleOhlinger/lovelace-ttc-card.svg)](https://github.com/KyhleOhlinger/lovelace-ttc-card/releases)
[![Validate](https://github.com/KyhleOhlinger/lovelace-ttc-card/actions/workflows/validate.yml/badge.svg)](https://github.com/KyhleOhlinger/lovelace-ttc-card/actions/workflows/validate.yml)

A Home Assistant Lovelace card for Toronto commuters.

**Live TTC subway map · Per-line service status · Route planner with filtered alerts**

### What it does

- Draws a full schematic TTC subway map with all 75 stations across Line 1, Line 2, Line 4 Sheppard, and Eglinton LRT
- Colours each line based on live Home Assistant sensor states — yellow is normal, amber is delayed, red is a diversion
- Pulses an overlay directly on the affected map segment when there's an alert
- Route planner: pick any two stations and the card works out your route (including transfers) and filters the alerts panel to show only the lines you'll use
- Fires push notifications via HA automations when a line status changes

No API key required. Uses the public TTC live alerts feed at `alerts.ttc.ca`.

---

## How to Install

### Via HACS (recommended)

1. In Home Assistant, go to **HACS → Frontend**
2. Click the three-dot menu → **Custom repositories**
3. Add `https://github.com/KyhleOhlinger/lovelace-ttc-card` as category **Dashboard**
4. Search for **TTC Transit Card** and click **Install**
5. Restart Home Assistant

### Manual Installation

1. Download `dist/ttc-card.js` from the [latest release](https://github.com/KyhleOhlinger/lovelace-ttc-card/releases/latest)
2. Copy to `config/www/ttc-card.js`
3. In HA → Settings → Dashboards → Resources, add `/local/ttc-card.js` as **JavaScript module**
4. Restart Home Assistant

---

## How to Use the HA Integration

The card reads status from Home Assistant sensors. You need to configure:
1. A REST sensor that fetches live TTC alerts
2. Template sensors to parse each line's status
3. The Lovelace card itself

### Step 1: Configure the REST Sensor

Add the following to your `configuration.yaml` (or to a separate file using the packages approach — see below):

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

### Step 2: Configure Template Sensors

Add the following template sensors to parse the line statuses:

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

**Tip:** A full copy-paste-ready `configuration_ttc.yaml` is included in the [releases](https://github.com/KyhleOhlinger/lovelace-ttc-card/releases/latest).

### Using the Packages Approach (Recommended)

For easier maintenance, create `config/packages/ttc.yaml` and paste the full sensor YAML there. Then add to `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages/
```

This keeps all TTC config isolated and easy to update.

---

## How to Create a Dashboard

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
          line1:    sensor.ttc_line1_status
          line2:    sensor.ttc_line2_status
          line4:    sensor.ttc_line4_status
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

## Known Issues / Future Releases

- **Station Name Rendering:** Some major stations currently experience text overlap or line replacement issues due to the way labels are rendered on the map. Future updates will improve station name placement and rendering logic to prevent labels from obscuring TTC lines or other map elements.
- **Simplified Map Styling:** The current map includes both coloured line indicators and rendered line names. Since the map already contains a colour-based key, a future release may simplify the UI by removing embedded line names from the map itself to improve readability and reduce clutter.
- **Default Route Configuration:** Planned support for configurable default start and end stations will allow users to define commonly used routes for quicker access to service updates and travel information without requiring repeated manual input.
- **Improved Route Path Rendering:** Route mapping between stations currently uses straight-line interpolation, which can result in unrealistic visual paths. A future release will introduce coordinate-aware pathing that follows actual TTC track curvature and station routing more accurately for a more realistic visualization experience.

---

## License

MIT — see [LICENSE](LICENSE)
