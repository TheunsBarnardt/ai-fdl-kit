---
title: "Contract Management Blueprint"
layout: default
parent: "Crm"
grand_parent: Blueprint Catalog
description: "Contract lifecycle management with signing workflow, date-driven status transitions, fulfilment tracking, and template-based term generation. . 18 fields. 8 out"
---

# Contract Management Blueprint

> Contract lifecycle management with signing workflow, date-driven status transitions, fulfilment tracking, and template-based term generation.


| | |
|---|---|
| **Feature** | `contract-management` |
| **Category** | Crm |
| **Version** | 1.0.0 |
| **Tags** | contract, agreement, fulfilment, signing, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/crm/contract-management.blueprint.yaml) |
| **JSON API** | [contract-management.json]({{ site.baseurl }}/api/blueprints/crm/contract-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `contract_owner` | Contract Owner | human | Creates, manages, and monitors contracts |
| `signee` | Signee | human | Reviews and signs the contract on behalf of the counterparty |
| `system` | System | system | Auto-updates contract status based on dates, tracks fulfilment deadlines |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `party_type` | select | Yes | Party Type |  |
| `party_name` | text | Yes | Party Name |  |
| `contract_status` | select | Yes | Contract Status |  |
| `is_signed` | boolean | No | Is Signed |  |
| `signed_on` | datetime | No | Signed On |  |
| `signed_by_company` | text | No | Signed By (Company Representative) |  |
| `signee` | text | No | Signee (Counterparty) |  |
| `start_date` | date | Yes | Start Date |  |
| `end_date` | date | No | End Date |  |
| `contract_template` | text | No | Contract Template |  |
| `contract_terms` | rich_text | No | Contract Terms |  |
| `requires_fulfilment` | boolean | No | Requires Fulfilment |  |
| `fulfilment_status` | select | No | Fulfilment Status |  |
| `fulfilment_deadline` | date | No | Fulfilment Deadline |  |
| `fulfilment_terms` | json | No | Fulfilment Terms |  |
| `document_type` | select | No | Linked Document Type |  |
| `document_name` | text | No | Linked Document Name |  |
| `ip_address` | text | No | IP Address |  |

## States

**State field:** `contract_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `Unsigned` | Yes |  |
| `Active` |  |  |
| `Inactive` |  |  |
| `Cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `Unsigned` | `Active` | system | is_signed == true and start_date <= today |
|  | `Unsigned` | `Inactive` | system | is_signed == true and start_date > today |
|  | `Active` | `Inactive` | system | end_date is not null and end_date < today |
|  | `Inactive` | `Active` | system | start_date <= today and (end_date is null or end_date >= today) |
|  | `Unsigned,Active,Inactive` | `Cancelled` | contract_owner |  |

## Rules

- **end_date_after_start:**
  - **description:** If an end date is provided, it must be on or after the start date.

- **unsigned_until_signed:**
  - **description:** Contracts remain in Unsigned status until the is_signed flag is set to true.

- **active_status_date_driven:**
  - **description:** Active status is automatically computed when start_date <= today and (end_date is null or end_date >= today) and the contract is signed.

- **inactive_outside_range:**
  - **description:** Contracts outside their active date range are automatically set to Inactive.

- **indefinite_contracts:**
  - **description:** Contracts with no end_date remain active indefinitely until explicitly cancelled.

- **fulfilment_checklist:**
  - **description:** Fulfilment is tracked via checklist items in fulfilment_terms. Each item has a requirement, fulfilled flag, and optional notes.

- **lapsed_on_missed_deadline:**
  - **description:** When the fulfilment deadline passes with incomplete fulfilment items, the fulfilment status is set to Lapsed.

- **signed_by_auto_set:**
  - **description:** The signed_by_company field is automatically set to the current user when the contract is submitted/signed.

- **contract_terms_templating:**
  - **description:** Contract terms support template rendering with party context variables (party name, address, dates) for dynamic document generation.

- **daily_status_update_job:**
  - **description:** A daily background job evaluates all contracts and updates their status based on current date against start_date and end_date.


## Outcomes

### Create_contract (Priority: 1)

**Given:**
- contract owner provides party type, party name, and start date
- `party_name` (input) exists

**Then:**
- **create_record** — Contract created in Unsigned status
- **set_field** target: `contract_status` value: `Unsigned`

**Result:** New contract created and ready for review and signing

### End_before_start_rejected (Priority: 1) — Error: `CONTRACT_END_BEFORE_START`

**Given:**
- `end_date` (input) exists
- `end_date` (input) lt `start_date`

**Then:**
- **notify** — Show that end date must be on or after start date

**Result:** Contract rejected — end date cannot be before start date

### Already_cancelled_rejected (Priority: 1) — Error: `CONTRACT_ALREADY_CANCELLED`

**Given:**
- `contract_status` (db) eq `Cancelled`

**Then:**
- **notify** — Inform that cancelled contracts cannot be modified

**Result:** Action rejected — contract is already cancelled

### Sign_contract (Priority: 2)

**Given:**
- contract is in Unsigned status
- signee reviews and agrees to terms

**Then:**
- **set_field** target: `is_signed` value: `true`
- **set_field** target: `signed_on` — Set to current timestamp
- **set_field** target: `signed_by_company` — Set to current user
- **set_field** target: `ip_address` — Capture signee IP address for audit
- **emit_event** event: `contract.signed`

**Result:** Contract is signed and status will transition based on date range

### Track_fulfilment (Priority: 3)

**Given:**
- contract has requires_fulfilment set to true
- contract owner updates fulfilment term items

**Then:**
- **set_field** target: `fulfilment_status` — Computed from fulfilment_terms (all fulfilled = Fulfilled, some = Partially Fulfilled)
- **emit_event** event: `contract.fulfilled` when: `fulfilment_status == "Fulfilled"`

**Result:** Fulfilment status updated based on completed checklist items

### Cancel_contract (Priority: 4)

**Given:**
- contract is not already cancelled
- contract owner initiates cancellation

**Then:**
- **transition_state** field: `contract_status` to: `Cancelled`
- **emit_event** event: `contract.cancelled`

**Result:** Contract is cancelled and no longer active

### Lapse_contract (Priority: 5)

**Given:**
- contract has requires_fulfilment set to true
- `fulfilment_deadline` (db) lt `today`
- fulfilment_terms has incomplete items

**Then:**
- **set_field** target: `fulfilment_status` value: `Lapsed`
- **emit_event** event: `contract.lapsed`

**Result:** Contract fulfilment has lapsed due to missed deadline

### Renew_contract (Priority: 6)

**Given:**
- contract is in Active or Inactive status
- contract owner creates a renewal

**Then:**
- **create_record** — New contract created with updated dates, linked to original
- **emit_event** event: `contract.activated`

**Result:** New contract created as a renewal of the original

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONTRACT_END_BEFORE_START` | 400 | Contract end date cannot be before the start date. | No |
| `CONTRACT_ALREADY_CANCELLED` | 409 | This contract has already been cancelled and cannot be modified. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `contract.signed` | Contract signed by both parties | `contract_id`, `party_name`, `signed_on` |
| `contract.activated` | Contract entered active status | `contract_id`, `start_date`, `end_date` |
| `contract.lapsed` | Contract fulfilment deadline passed with incomplete items | `contract_id`, `fulfilment_deadline` |
| `contract.fulfilled` | All contract fulfilment requirements completed | `contract_id`, `fulfilment_status` |
| `contract.cancelled` | Contract cancelled by contract owner | `contract_id`, `party_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| customer-supplier-management | required | Contracts are linked to customer, supplier, or employee party records |
| sales-order-lifecycle | optional | Contracts may be linked to sales orders or purchase orders |
| lead-opportunity-pipeline | optional | Won opportunities may result in contract creation |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python/Frappe Framework
  files_traced: 6
  entry_points:
    - erpnext/crm/doctype/contract/contract.py
    - erpnext/crm/doctype/contract_template/contract_template.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Contract Management Blueprint",
  "description": "Contract lifecycle management with signing workflow, date-driven status transitions, fulfilment tracking, and template-based term generation.\n. 18 fields. 8 out",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "contract, agreement, fulfilment, signing, compliance"
}
</script>
