---
title: "Data"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 3
description: "CRUD, storage, versioning, and data management blueprints."
---

# Data Blueprints

CRUD, storage, versioning, and data management blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Bank Reconciliation]({{ site.baseurl }}/blueprints/data/bank-reconciliation/) | Bank reconciliation with statement import, auto/manual matching, reconciliation models, partial/full tracking, and write-off management.  | 1.0.0 |
| [Comments Annotations]({{ site.baseurl }}/blueprints/data/comments-annotations/) | Threaded comments on any entity (polymorphic) with rich text, @mentions, reactions, edit windows, and rate limiting | 1.0.0 |
| [Content Articles]({{ site.baseurl }}/blueprints/data/content-articles/) | Blog and news article system for advisors and portfolio managers to publish market insights, product updates, and investment articles to clients | 1.0.0 |
| [Content Tree]({{ site.baseurl }}/blueprints/data/content-tree/) | Hierarchical content tree with zone-based storage, tree walking, flattening, indexed lookups, and schema migration | 1.0.0 |
| [Customer Supplier Management]({{ site.baseurl }}/blueprints/data/customer-supplier-management/) | Customer and supplier master data management with credit limits, territory and group hierarchies, portal access, lead conversion, internal parties, and supplier hold/block controls.  | 1.0.0 |
| [Data Import Export]({{ site.baseurl }}/blueprints/data/data-import-export/) | Bulk data import and export supporting CSV, Excel, and JSON formats with column mapping, row validation, background processing, and configurable error handling | 1.0.0 |
| [Device Status Tracking]({{ site.baseurl }}/blueprints/data/device-status-tracking/) | Continuously monitor whether GPS devices are actively reporting, and automatically transition them between online, offline, and unknown states based on configurable inactivity thresholds, emitting notifications when devices go silent. | 1.0.0 |
| [Document Management]({{ site.baseurl }}/blueprints/data/document-management/) | Store, retrieve, manage, and generate documents with metadata, permissions, version control, and dynamic PDF generation | 1.0.0 |
| [Driver Identification]({{ site.baseurl }}/blueprints/data/driver-identification/) | Identify the driver operating a vehicle by matching hardware-reported credentials (RFID tag or iButton key) against a registry of named drivers, and emit an event whenever the driver assignment changes. | 1.0.0 |
| [Editor State]({{ site.baseurl }}/blueprints/data/editor-state/) | Centralized state management with sliced architecture, action dispatching, computed selections, and public API | 1.0.0 |
| [Engine Hours Tracking]({{ site.baseurl }}/blueprints/data/engine-hours-tracking/) | Accumulate the total time a vehicle engine has been running by measuring the duration between consecutive positions while the ignition is on, providing accurate engine-hours data for maintenance scheduling, rental billing, and equipment life-cycle management. | 1.0.0 |
| [Expense Approval]({{ site.baseurl }}/blueprints/data/expense-approval/) | Submit and approve employee expense reports with receipt validation | 1.0.0 |
| [Field Transforms]({{ site.baseurl }}/blueprints/data/field-transforms/) | Per-field-type transformation pipeline with read-only path resolution, async tracking, and trigger-based caching | 1.0.0 |
| [File Storage]({{ site.baseurl }}/blueprints/data/file-storage/) | Cloud storage abstraction with signed URLs, virus scanning, content type validation, checksum deduplication, and multi-provider support | 1.0.0 |
| [Fuel Level Reporting]({{ site.baseurl }}/blueprints/data/fuel-level-reporting/) | Read fuel sensor data transmitted by GPS hardware, detect significant fuel drops (theft or fast consumption) and unexpected increases (refuelling), and provide fuel consumption summaries across trips and time periods. | 1.0.0 |
| [General Ledger]({{ site.baseurl }}/blueprints/data/general-ledger/) | Manage hierarchical chart of accounts and post double-entry general ledger entries with period controls, cost center tracking, and party-level accounting | 1.0.0 |
| [Geofence Management]({{ site.baseurl }}/blueprints/data/geofence-management/) | Define named geographic boundary zones as circles (centre point + radius) or polygons (closed coordinate ring), optionally with altitude constraints and calendar-based activation schedules, and evaluate device positions for containment. | 1.0.0 |
| [Gps Device Registration]({{ site.baseurl }}/blueprints/data/gps-device-registration/) | Register and identify GPS tracking devices by unique hardware ID (IMEI or custom identifier), with per-device metadata, grouping, and lifecycle management. | 1.0.0 |
| [Gps Position History]({{ site.baseurl }}/blueprints/data/gps-position-history/) | Query, replay, and export the historical sequence of GPS positions recorded for one or more devices over a user-specified time range, supporting route visualisation, speed analysis, and multi-format export. | 1.0.0 |
| [Ignition Detection]({{ site.baseurl }}/blueprints/data/ignition-detection/) | Detect transitions in vehicle ignition state by comparing the ignition attribute between consecutive position records, and emit ignition-on and ignition-off events to drive engine hours calculation, trip segmentation, and driver notifications. | 1.0.0 |
| [List Queue Operations]({{ site.baseurl }}/blueprints/data/list-queue-operations/) | Ordered collection with efficient head/tail insertion, removal, and range queries; supports blocking operations and atomic moves between lists | 1.0.0 |
| [Odometer Tracking]({{ site.baseurl }}/blueprints/data/odometer-tracking/) | Track cumulative vehicle mileage either by reading the hardware odometer transmitted by the GPS device or by calculating distance from GPS coordinates, with per-position incremental distances and a running total for maintenance scheduling and reporting. | 1.0.0 |
| [Openclaw Session Management]({{ site.baseurl }}/blueprints/data/openclaw-session-management/) | Persistent conversation storage with automatic disk budgeting, transcript rotation, and session lifecycle tracking across messaging channels | 1.0.0 |
| [Pagination]({{ site.baseurl }}/blueprints/data/pagination/) | Cursor-based and offset-based pagination with configurable page sizes, stable sorting, and Link header support for REST APIs | 1.0.0 |
| [Payload Collections]({{ site.baseurl }}/blueprints/data/payload-collections/) | Full CRUD operations for document collections with pagination, filtering, hooks, bulk operations, and field selection | 1.0.0 |
| [Payload Document Locking]({{ site.baseurl }}/blueprints/data/payload-document-locking/) | Automatic document locking to prevent concurrent editing with configurable lock duration and override capability | 1.0.0 |
| [Payload Globals]({{ site.baseurl }}/blueprints/data/payload-globals/) | Singleton document management for site-wide settings, navigation, headers, and footers with versioning and access control | 1.0.0 |
| [Payload Preferences]({{ site.baseurl }}/blueprints/data/payload-preferences/) | Per-user preferences storage for admin UI state including collapsed fields, tab positions, column visibility, sort order, and list view settings | 1.0.0 |
| [Payload Uploads]({{ site.baseurl }}/blueprints/data/payload-uploads/) | File upload system with image resizing, focal-point cropping, MIME validation, cloud storage adapters, and range request support | 1.0.0 |
| [Payload Versions]({{ site.baseurl }}/blueprints/data/payload-versions/) | Document versioning with draft/publish workflow, autosave, version history, restore, scheduled publishing, and locale-specific status | 1.0.0 |
| [Portfolio Management]({{ site.baseurl }}/blueprints/data/portfolio-management/) | Retrieve, manage, and report on investment portfolio holdings, positions, valuations, and transaction history | 1.0.0 |
| [Prisma Crud]({{ site.baseurl }}/blueprints/data/prisma-crud/) | Execute type-safe database CRUD operations with Prisma Client query builder | 1.0.0 |
| [Prisma Migrations]({{ site.baseurl }}/blueprints/data/prisma-migrations/) | Manage database schema versioning and evolution with safe migrations | 1.0.0 |
| [Prisma Schema]({{ site.baseurl }}/blueprints/data/prisma-schema/) | Define application data models with fields, types, relationships, and validation rules in Prisma schema | 1.0.0 |
| [Product Configurator]({{ site.baseurl }}/blueprints/data/product-configurator/) | Product configuration with attributes, variant generation, exclusion rules, dynamic pricing, visual pickers, custom inputs, and matrix bulk ordering.  | 1.0.0 |
| [Proposals Quotations]({{ site.baseurl }}/blueprints/data/proposals-quotations/) | Creation, management, and approval workflow for investment proposals and quotations delivered to clients | 1.0.0 |
| [Search And Filtering]({{ site.baseurl }}/blueprints/data/search-and-filtering/) | Full-text search with faceted filters, sorting, relevance scoring, fuzzy matching, and saved searches | 1.0.0 |
| [Set Operations]({{ site.baseurl }}/blueprints/data/set-operations/) | Unordered collection of unique elements with set algebra operations (union, intersection, difference) and cardinality counting | 1.0.0 |
| [Soft Delete]({{ site.baseurl }}/blueprints/data/soft-delete/) | Trash/archive/restore pattern with soft deletion, configurable retention periods, automatic purging, and cascade rules for related records | 1.0.0 |
| [Sorted Set And Hash Operations]({{ site.baseurl }}/blueprints/data/sorted-set-and-hash-operations/) | Sorted collections with ranking and scoring; nested key-value maps with field-level operations and optional TTL per field | 1.0.0 |
| [Stream Event Log]({{ site.baseurl }}/blueprints/data/stream-event-log/) | Append-only event log with monotonically increasing IDs, consumer groups for distributed processing, and automatic acknowledgment tracking | 1.0.0 |
| [String Key Value]({{ site.baseurl }}/blueprints/data/string-key-value/) | Store and retrieve arbitrary-length string values with atomic increment, decrement, append, and range operations | 1.0.0 |
| [Tagging Categorization]({{ site.baseurl }}/blueprints/data/tagging-categorization/) | Tags, labels, and hierarchical categories for organizing entities with tag groups, colors, slug auto-generation, and category depth limits | 1.0.0 |
| [Tax Engine]({{ site.baseurl }}/blueprints/data/tax-engine/) | Tax engine with percentage, fixed, division, group, and formula-based tax types, repartition, cash-basis accounting, and fiscal position mapping.  | 1.0.0 |
| [Undo Redo]({{ site.baseurl }}/blueprints/data/undo-redo/) | Linear history stack with debounced recording, forward-branch destruction, and keyboard shortcut navigation | 1.0.0 |
