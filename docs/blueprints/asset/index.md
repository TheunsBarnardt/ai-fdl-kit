---
title: "Asset"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 99
description: "Asset blueprints."
---

# Asset Blueprints

Asset blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Asset Maintenance Repairs]({{ site.baseurl }}/blueprints/asset/asset-maintenance-repairs/) | Asset maintenance scheduling and repair management with preventive and corrective tasks, repair cost capitalization, and stock consumption tracking for parts used during repairs.  | 1.0.0 |
| [Battery Health Tracking]({{ site.baseurl }}/blueprints/asset/battery-health-tracking/) | Monitors EV battery health over time by comparing reported range capacity against a manufacturer baseline, detecting degradation trends and alerting when capacity loss exceeds a threshold. | 1.0.0 |
| [Driver Behaviour Scoring]({{ site.baseurl }}/blueprints/asset/driver-behaviour-scoring/) | Analyses vehicle telemetry (speed and power time series) to detect hard braking and rapid acceleration events, producing a per-trip smoothness score for driver feedback. | 1.0.0 |
| [Ev Charging Cost Tariff]({{ site.baseurl }}/blueprints/asset/ev-charging-cost-tariff/) | Calculates EV charging session cost using location-linked tariffs (per-kWh or per-minute) with optional flat session fees and free-charging programme exemptions. | 1.0.0 |
| [Ev Charging Session]({{ site.baseurl }}/blueprints/asset/ev-charging-session/) | Records the full lifecycle of an EV charging session — opening on plug-in, appending per-reading telemetry throughout, and aggregating energy, duration, cost, and battery change on close. | 1.0.0 |
| [Fixed Asset Lifecycle]({{ site.baseurl }}/blueprints/asset/fixed-asset-lifecycle/) | Fixed asset lifecycle management covering registration, multi-book depreciation, asset movements, value adjustments, disposal, and capitalization with automatic GL entries.  | 1.0.0 |
| [Geofence Places]({{ site.baseurl }}/blueprints/asset/geofence-places/) | User-defined named circular geofences that tag trip start/end and charging events with place labels and optionally apply billing tariffs to sessions at that location. | 1.0.0 |
| [Location Visit History]({{ site.baseurl }}/blueprints/asset/location-visit-history/) | Tracks where a vehicle parks by linking trip and charge events to reverse-geocoded addresses and named geofences, enabling reporting on dwell time and visit frequency per location. | 1.0.0 |
| [Odometer Validation]({{ site.baseurl }}/blueprints/asset/odometer-validation/) | Validates vehicle odometer readings ingested from telemetry, enforcing minimum trip distance thresholds, detecting negative distance anomalies, and flagging unexpected odometer jumps. | 1.0.0 |
| [Trip Energy Consumption]({{ site.baseurl }}/blueprints/asset/trip-energy-consumption/) | Calculates energy consumed per trip from battery range delta and a per-vehicle efficiency factor derived statistically from charging history and updated after each qualifying session. | 1.0.0 |
| [Trip Replay]({{ site.baseurl }}/blueprints/asset/trip-replay/) | Records a dense telemetry time-series (position, speed, power, elevation, battery) throughout every trip, enabling post-hoc replay with full speed and elevation profiles. | 1.0.0 |
| [Vehicle Depreciation]({{ site.baseurl }}/blueprints/asset/vehicle-depreciation/) | Calculate and record periodic depreciation for fleet vehicles using configurable methods, track book value over time, and generate depreciation schedules per finance book. | 1.0.0 |
| [Vehicle Efficiency Metrics]({{ site.baseurl }}/blueprints/asset/vehicle-efficiency-metrics/) | Tracks a vehicle's energy efficiency (Wh/km) over time by statistically deriving an efficiency factor from charging sessions and applying it to trips for trend analysis. | 1.0.0 |
| [Vehicle Insurance]({{ site.baseurl }}/blueprints/asset/vehicle-insurance/) | Track insurance policies for fleet vehicles including coverage type, premium, excess, validity dates, and renewal lifecycle. | 1.0.0 |
| [Vehicle Master Data]({{ site.baseurl }}/blueprints/asset/vehicle-master-data/) | Maintain the canonical specification record for a fleet vehicle including make, model, year, VIN, fuel type, physical dimensions, and current assignment. | 1.0.0 |
| [Vehicle Registration]({{ site.baseurl }}/blueprints/asset/vehicle-registration/) | Register a vehicle into the fleet with legal identification, assign ownership, and track registration status and renewal dates. | 1.0.0 |
| [Vehicle Sleep Wake Detection]({{ site.baseurl }}/blueprints/asset/vehicle-sleep-wake-detection/) | Detects when a connected vehicle enters and exits sleep mode by observing API availability, persists sleep period records, and adapts the polling schedule to minimise battery drain. | 1.0.0 |
| [Vehicle State Machine]({{ site.baseurl }}/blueprints/asset/vehicle-state-machine/) | Tracks the real-time operational state of a connected vehicle (online, driving, charging, asleep, offline, updating) by polling a vehicle API and persisting state transitions. | 1.0.0 |
| [Vehicle Trip Segmentation]({{ site.baseurl }}/blueprints/asset/vehicle-trip-segmentation/) | Automatically detects trip start and end from gear state signals, records position telemetry, and aggregates each completed trip into a drive record with distance, duration, and energy metadata. | 1.0.0 |
