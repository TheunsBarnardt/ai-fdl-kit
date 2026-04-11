# Vehicle Tracking & Fleet Management — FDL Extraction Plan

A strategic plan for building a complete vehicle tracking / fleet management feature set by extracting from five open-source repos. Each repo is assigned the features it implements best, avoiding overlap.

## Extraction order

Run these in order — each builds on the previous without re-extracting shared concepts.

```bash
# 1. GPS device protocols + live tracking + geofencing (non-negotiable core)
/fdl-extract-code-feature https://github.com/traccar/traccar

# 2. Fleet operations: dispatch, delivery, drivers, orders
/fdl-extract-code-feature https://github.com/fleetbase/fleetbase

# 3. Vehicle lifecycle: ownership, maintenance, fuel, service
/fdl-extract-code-feature https://github.com/frappe/erpnext

# 4. Trip analytics, charging sessions, places/geofence UX
/fdl-extract-code-feature https://github.com/adriankumpf/teslamate

# 5. Route optimization (VRP) + truck routing / ETAs
/fdl-extract-code-feature https://github.com/VROOM-Project/vroom
# Companion (routing engine, extract separately if needed):
# /fdl-extract-code-feature https://github.com/GIScience/openrouteservice
```

`/fdl-auto-evolve` will run automatically after each extraction to validate, generate docs, and commit.

> **Note on ERPNext:** It's a massive ERP — scope the feature menu to the **Vehicle** module only (fuel logs, service, odometer, etc.). Ignore the rest.

---

## 1. Traccar — GPS protocols, live tracking, geofencing, alerts

**Repo:** `https://github.com/traccar/traccar`
**Strength:** 200+ GPS device protocols, mature position pipeline, geofencing, events. The reference implementation for GPS ingestion.

Features to select:

1.  Device registration and identification (unique ID / IMEI)
2.  Multi-protocol GPS position ingestion
3.  Position history and playback
4.  Circular and polygon geofences
5.  Geofence entry and exit alerts
6.  Overspeed alerts
7.  Ignition on/off detection
8.  Device online/offline/unknown status
9.  Remote commands to devices
10. Driver identification (RFID / iButton)
11. Trip detection and segmentation
12. Stop detection and idle time tracking
13. Fuel level reporting (from device)
14. Odometer tracking
15. Engine hours tracking
16. Event notifications (SOS, panic, tamper)
17. Scheduled reports (daily summary, route, stops)
18. User permissions and device sharing groups
19. Maintenance reminders triggered by odometer
20. Battery and external power alerts

---

## 2. Fleetbase — Fleet operations, dispatch, delivery (TMS)

**Repo:** `https://github.com/fleetbase/fleetbase`
**Strength:** Full transport management system — orders, dispatch, drivers, customer flow. Everything around the vehicle, not just the vehicle itself.

Features to select:

1.  Order / delivery lifecycle management
2.  Dispatch and driver assignment
3.  Route planning with waypoints and stops
4.  Driver profiles, licenses, and hours-of-service
5.  Vehicle fleet registry and status
6.  Service areas and operational zones
7.  Proof of delivery (signature, photo, notes)
8.  Real-time driver location tracking
9.  Customer notifications (SMS / email on status change)
10. Trip-based billing and invoicing
11. Driver earnings and payouts
12. Webhooks for order lifecycle events
13. Multi-tenant organization model
14. Fleet performance dashboards
15. Issue and incident reporting from the field
16. Vehicle check-in / check-out workflow
17. Customer and contact management
18. Public API for third-party integrations
19. Service level / ETA tracking per order
20. Driver shift scheduling

---

## 3. ERPNext (Vehicle module) — Lifecycle, maintenance, ownership

**Repo:** `https://github.com/frappe/erpnext`
**Scope:** **Vehicle module only** — scope the feature menu carefully.
**Strength:** Mature ERP-grade lifecycle management: ownership, insurance, fuel, service, depreciation. The boring-but-critical records Traccar and Fleetbase don't touch.

Features to select:

1.  Vehicle registration and ownership records
2.  Vehicle master data (make, model, year, VIN, plate)
3.  Insurance policy tracking and renewal
4.  License / registration renewal reminders
5.  Fuel log entries (date, quantity, cost, odometer reading)
6.  Fuel cost analytics and efficiency trends
7.  Service / maintenance history log
8.  Scheduled maintenance reminders (by date or mileage)
9.  Odometer reading history and validation
10. Tyre change and lifecycle tracking
11. Accident and incident log
12. Driver-to-vehicle assignment history
13. Per-vehicle expense tracking
14. Depreciation calculation
15. Vehicle disposal / decommissioning workflow
16. Vehicle document management (permits, photos)
17. Workshop / service provider directory
18. Parts inventory consumption per service

---

## 4. TeslaMate — Trip analytics, places, charging, behavior

**Repo:** `https://github.com/adriankumpf/teslamate`
**Strength:** Best-in-class patterns for **trip segmentation, places/geofence UX, charging sessions, and energy analytics**. Tesla-specific but the data model is fully extractable.

Features to select:

1.  Automatic trip segmentation (start / end detection)
2.  Idle vs drive vs park state machine
3.  Energy consumption per trip
4.  Charging session tracking (start, end, kWh, cost)
5.  Charging cost calculation by tariff
6.  Driving efficiency metrics over time
7.  Geofence-based "places" (home, work, favourites)
8.  Visit history (where parked, duration, frequency)
9.  Trip replay with speed and elevation profile
10. Sleep / wake state detection
11. Battery health degradation tracking
12. Odometer drift and sanity checks
13. Driver behaviour scoring (hard braking, acceleration)

---

## 5. VROOM — Route optimization (VRP)

**Repo:** `https://github.com/VROOM-Project/vroom`
**Companion:** `https://github.com/GIScience/openrouteservice` (routing engine with truck/HGV profile)
**Strength:** Solves the Vehicle Routing Problem — multi-vehicle, constraints, time windows. Pairs with any tracking system for intelligent dispatch.

Features to select:

1.  Vehicle routing problem (VRP) solving
2.  Multi-vehicle route optimization
3.  Time window constraints (pickup / delivery windows)
4.  Vehicle capacity constraints (weight, volume, items)
5.  Driver shift and break constraints
6.  Pickup-and-delivery pairing (linked stops)
7.  Truck / HGV routing profile
8.  ETA calculation per stop
9.  Distance matrix calculation
10. Skill-based assignment (which drivers can do which jobs)
11. Priority / urgency weighting
12. Cost-based optimization (fuel, time, distance)

---

## Optional add-ons

Pull these only if you need the niche:

### OBD-II / diagnostics

```bash
/fdl-extract-code-feature https://github.com/brendan-w/python-OBD
```

- OBD-II port connection and discovery
- PID (Parameter ID) reading
- Diagnostic Trouble Code (DTC) read and clear
- Real-time RPM, speed, coolant, throttle, MAF, fuel level
- VIN extraction

### Personal / minimal tracking

```bash
/fdl-extract-code-feature https://github.com/owntracks/recorder
```

- MQTT location ingestion
- Waypoints and regions
- Minimal location history storage
- Friends / shared location patterns

### Google Maps Timeline alternative

```bash
/fdl-extract-code-feature https://github.com/Freika/dawarich
```

- Location history visualization
- Visited places detection
- Trip and stay timeline rendering

---

## Coverage matrix

| Concern                                           | Covered by                        |
| ------------------------------------------------- | --------------------------------- |
| GPS device protocols, ingestion, live positions   | Traccar                           |
| Geofencing (circular, polygon, entry/exit)        | Traccar + TeslaMate (UX patterns) |
| Device commands, alerts, events                   | Traccar                           |
| Trip detection and segmentation                   | Traccar + TeslaMate               |
| Dispatch, orders, delivery lifecycle              | Fleetbase                         |
| Proof of delivery, customer notifications         | Fleetbase                         |
| Driver management, shifts, earnings               | Fleetbase                         |
| Multi-tenant fleet organizations                  | Fleetbase                         |
| Vehicle ownership, insurance, licenses            | ERPNext                           |
| Fuel logs, service history, maintenance schedules | ERPNext                           |
| Depreciation, disposal, expense tracking          | ERPNext                           |
| Charging sessions (EV)                            | TeslaMate                         |
| Places / favourites / visit history               | TeslaMate                         |
| Driver behaviour scoring, efficiency              | TeslaMate                         |
| Route optimization (VRP), time windows, capacity  | VROOM                             |
| Truck / HGV routing profiles, ETAs                | VROOM + OpenRouteService          |
| OBD-II diagnostics (optional)                     | python-OBD                        |

**Total:** ~83 features across 5 core repos — a near-complete vehicle tracking + fleet management feature surface with minimal duplication.

---

## Minimum viable stack

If you only want three repos to get 80% of the value:

1. **Traccar** — GPS, tracking, geofencing (non-negotiable)
2. **Fleetbase** — everything operational around the vehicle
3. **ERPNext vehicle module** — maintenance and ownership records

Add **TeslaMate** if you need trip analytics / EV charging, and **VROOM** if you need routing optimization.

---

## Why these repos

- **Traccar** → the undisputed reference for GPS device ingestion; nothing else comes close on protocol coverage
- **Fleetbase** → the only modern open-source TMS with dispatch, orders, and driver workflows built-in
- **ERPNext** → mature lifecycle patterns that pure "tracking" tools ignore (insurance, depreciation, service)
- **TeslaMate** → best open-source reference for trip/charging analytics and places UX
- **VROOM** → industry-grade VRP solver; no competitive open-source alternative for multi-constraint routing
