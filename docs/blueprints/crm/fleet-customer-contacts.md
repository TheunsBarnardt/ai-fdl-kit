---
title: "Fleet Customer Contacts Blueprint"
layout: default
parent: "Crm"
grand_parent: Blueprint Catalog
description: "Manage customers and contacts who place orders, including contact details, order history, and communication preferences. 11 fields. 5 outcomes. 4 error codes. r"
---

# Fleet Customer Contacts Blueprint

> Manage customers and contacts who place orders, including contact details, order history, and communication preferences

| | |
|---|---|
| **Feature** | `fleet-customer-contacts` |
| **Category** | Crm |
| **Version** | 1.0.0 |
| **Tags** | fleet, crm, customer, contacts, delivery, communication |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/crm/fleet-customer-contacts.blueprint.yaml) |
| **JSON API** | [fleet-customer-contacts.json]({{ site.baseurl }}/api/blueprints/crm/fleet-customer-contacts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `dispatcher` | Dispatcher | human | Operations staff managing customer records |
| `customer` | Customer | external | Entity placing delivery orders |
| `system` | System | system | Automated contact linkage and history tracking |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `contact_id` | text | Yes | Contact ID |  |
| `internal_id` | text | No | Internal Reference ID |  |
| `user_uuid` | text | No | Linked User Account |  |
| `name` | text | Yes | Full Name |  |
| `title` | text | No | Title |  |
| `email` | email | No | Email Address |  |
| `phone` | phone | No | Phone Number |  |
| `type` | select | No | Contact Type |  |
| `photo_uuid` | text | No | Profile Photo |  |
| `meta` | json | No | Additional Attributes |  |
| `notification_preference` | select | No | Notification Preference |  |

## Rules

- **minimum_contact_method:** Each contact must have at least a name and one contact method (email or phone)
- **unique_email:** Email addresses must be valid format and unique within the organization
- **org_scoped:** Contacts are scoped to the organization; cross-tenant access is forbidden
- **user_link_optional:** A contact can be linked to a user account for self-service order tracking
- **opt_out_respected:** Notification opt-out preferences must be respected by the notification service
- **order_history:** Contact history tracks all orders placed by or for this contact
- **duplicate_detection:** Duplicate detection warns when creating contacts with matching email or phone
- **soft_delete:** Contact records are soft-deleted and retained for historical order references
- **e164_phone:** Phone numbers must be stored in E.164 format for consistent SMS delivery
- **photo_management:** Photos must be processed and stored as managed file references

## Outcomes

### Contact_created (Priority: 1)

**Given:**
- `name` (input) exists
- ANY: `email` (input) exists OR `phone` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `contact.created`

**Result:** Contact created and available for order assignment

### Duplicate_detected (Priority: 1) — Error: `CONTACT_POSSIBLE_DUPLICATE`

**Given:**
- a contact with the same email or phone already exists in the organization

**Result:** Warning: possible duplicate contact detected

### Contact_updated (Priority: 2)

**Given:**
- `contact_id` (db) exists

**Then:**
- **emit_event** event: `contact.updated`

**Result:** Contact details updated

### Missing_contact_method (Priority: 2) — Error: `CONTACT_MISSING_CONTACT_METHOD`

**Given:**
- `email` (input) not_exists
- `phone` (input) not_exists

**Result:** Contact creation rejected — email or phone required

### Contact_linked_to_order (Priority: 3)

**Given:**
- order is created with this contact as customer

**Then:**
- **emit_event** event: `contact.order_linked`

**Result:** Contact linked to order for history and notifications

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONTACT_POSSIBLE_DUPLICATE` | 409 | A contact with this email or phone number already exists. | No |
| `CONTACT_MISSING_CONTACT_METHOD` | 422 | A contact must have at least an email address or phone number. | No |
| `CONTACT_NOT_FOUND` | 404 | Contact not found. | No |
| `CONTACT_INVALID_EMAIL` | 422 | The email address provided is not valid. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `contact.created` | Fired when a new contact is created | `contact_id`, `name`, `email`, `phone`, `type` |
| `contact.updated` | Fired when contact information is updated | `contact_id`, `name` |
| `contact.deleted` | Fired when a contact is soft-deleted | `contact_id`, `name` |
| `contact.order_linked` | Fired when an order is linked to this contact | `contact_id`, `order_uuid` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| order-lifecycle | required | Contacts are assigned as customers on orders |
| delivery-notifications | required | Contact email and phone used for delivery notifications |
| multi-tenant-organization | required | Contacts are scoped to the organization |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fleet Customer Contacts Blueprint",
  "description": "Manage customers and contacts who place orders, including contact details, order history, and communication preferences. 11 fields. 5 outcomes. 4 error codes. r",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, crm, customer, contacts, delivery, communication"
}
</script>
