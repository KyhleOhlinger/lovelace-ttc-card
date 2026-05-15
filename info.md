# TTC Transit Card

A Home Assistant Lovelace card for Toronto commuters — live TTC subway map,
per-line service status, and a route planner that filters alerts down to only
the lines your trip actually uses.

## Features

- Schematic subway map with all 4 lines (Line 1, Line 2, Line 4 Sheppard, Eglinton LRT)
- Line colours update live from Home Assistant sensors — amber for delays, red for diversions
- Pulsing overlays mark affected segments directly on the map
- Route planner with all 55 stations — pick origin + destination and see only relevant alerts
- Supports transfers with step-by-step breakdown
- Push notifications via HA automations when line status changes
- No API key required — uses the public TTC alerts feed

## Requirements

- Home Assistant 2023.9+
- The included sensor configuration (see README for setup)
