---
title: "Notification"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 99
description: "Notification blueprints."
---

# Notification Blueprints

Notification blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Device Alarm Notifications]({{ site.baseurl }}/blueprints/notification/device-alarm-notifications/) | Process hardware alarm codes embedded in device position transmissions, generate individual alert events per alarm type (SOS, tamper, vibration, accident, jamming, etc.), and route notifications to... | 1.0.0 |
| [Device Power Alerts]({{ site.baseurl }}/blueprints/notification/device-power-alerts/) | Monitor battery voltage, battery level percentage, and external power supply state transmitted by GPS tracking hardware, and emit alerts when power conditions threaten continuous device operation (... | 1.0.0 |
| [Email Notifications]({{ site.baseurl }}/blueprints/notification/email-notifications/) | Send transactional and system emails with template rendering, delivery tracking, and bounce handling | 1.0.0 |
| [Geofence Alerts]({{ site.baseurl }}/blueprints/notification/geofence-alerts/) | Detect and emit events when a tracked device crosses the boundary of a geofence zone, distinguishing entry (device was outside, now inside) from exit (device was inside, now outside), with calendar... | 1.0.0 |
| [In App Notifications]({{ site.baseurl }}/blueprints/notification/in-app-notifications/) | Real-time in-app notification center with read state, grouping, deep links, and persistent storage | 1.0.0 |
| [Notification Preferences]({{ site.baseurl }}/blueprints/notification/notification-preferences/) | Manage per-user notification preferences across channels and categories with quiet hours and frequency caps | 1.0.0 |
| [Overspeed Alerts]({{ site.baseurl }}/blueprints/notification/overspeed-alerts/) | Detect when a tracked device exceeds a configured speed limit for a minimum duration, using a four-level speed limit hierarchy (position > geofence > device > server), and emit a single event at th... | 1.0.0 |
| [Push Notifications]({{ site.baseurl }}/blueprints/notification/push-notifications/) | Deliver mobile and web push notifications with device management, topic subscriptions, and rich media | 1.0.0 |
| [Sens Eod Data Delivery]({{ site.baseurl }}/blueprints/notification/sens-eod-data-delivery/) | End-of-day SENS announcements delivery via NewsML-G2 XML — text and PDF variants disseminated as end-of-day compressed packages covering company, exchange, and regulatory institution announcements | 1.0.0 |
| [Sms Notifications]({{ site.baseurl }}/blueprints/notification/sms-notifications/) | Send SMS messages for OTP codes, alerts, and marketing with provider abstraction and compliance | 1.0.0 |
| [Webhook Outbound]({{ site.baseurl }}/blueprints/notification/webhook-outbound/) | Deliver outbound webhooks to external systems with signing, retries, and endpoint health monitoring | 1.0.0 |
