---
title: "Customer Supplier Management Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Customer and supplier master data management with credit limits, territory and group hierarchies, portal access, lead conversion, internal parties, and supplier"
---

# Customer Supplier Management Blueprint

> Customer and supplier master data management with credit limits, territory and group hierarchies, portal access, lead conversion, internal parties, and supplier hold/block controls.


| | |
|---|---|
| **Feature** | `customer-supplier-management` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | customer, supplier, master-data, credit-limit, territory, customer-group, portal-access, lead-conversion |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/customer-supplier-management.blueprint.yaml) |
| **JSON API** | [customer-supplier-management.json]({{ site.baseurl }}/api/blueprints/data/customer-supplier-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sales_user` | Sales User | human | Creates and manages customer records, converts leads |
| `purchase_user` | Purchase User | human | Creates and manages supplier records, controls hold status |
| `accounts_user` | Accounts User | human | Manages credit limits, account mappings, and frozen status |
| `portal_user` | Portal User | external | Customer or supplier user accessing self-service portal |
| `system` | System | system | Validates credit limits, enforces naming rules, manages hierarchies |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `customer_name` | text | Yes | Customer Name |  |
| `customer_type` | select | Yes | Customer Type |  |
| `customer_accounts` | json | No | Customer Accounts |  |
| `credit_limits` | json | No | Credit Limits |  |
| `territory` | text | No | Territory |  |
| `customer_group` | text | No | Customer Group |  |
| `default_price_list` | text | No | Default Price List |  |
| `default_currency` | text | No | Default Currency |  |
| `sales_team` | json | No | Sales Team |  |
| `customer_disabled` | boolean | No | Disabled |  |
| `customer_is_frozen` | boolean | No | Is Frozen |  |
| `is_internal_customer` | boolean | No | Is Internal Customer |  |
| `portal_users` | json | No | Portal Users |  |
| `lead_name` | text | No | Source Lead |  |
| `supplier_name` | text | Yes | Supplier Name |  |
| `supplier_type` | select | No | Supplier Type |  |
| `supplier_accounts` | json | No | Supplier Accounts |  |
| `supplier_default_price_list` | text | No | Supplier Default Price List |  |
| `payment_terms` | text | No | Payment Terms |  |
| `supplier_disabled` | boolean | No | Disabled |  |
| `supplier_is_frozen` | boolean | No | Is Frozen |  |
| `on_hold` | boolean | No | On Hold |  |
| `hold_type` | select | No | Hold Type |  |
| `release_date` | date | No | Hold Release Date |  |
| `prevent_rfqs` | boolean | No | Prevent RFQs |  |
| `warn_rfqs` | boolean | No | Warn on RFQs |  |
| `prevent_pos` | boolean | No | Prevent Purchase Orders |  |
| `warn_pos` | boolean | No | Warn on Purchase Orders |  |
| `group_name` | text | No | Group Name |  |
| `parent_group` | text | No | Parent Group |  |
| `is_group` | boolean | No | Is Group Node |  |
| `group_default_accounts` | json | No | Group Default Accounts |  |
| `group_credit_limits` | json | No | Group Credit Limits |  |
| `territory_name` | text | No | Territory Name |  |
| `parent_territory` | text | No | Parent Territory |  |
| `territory_manager` | text | No | Territory Manager |  |
| `targets` | json | No | Territory Targets |  |

## Rules

- **naming_configurable:**
  - **description:** Customer and supplier names can be configured to use the party name directly or follow a naming series pattern. The naming rule is set at the system level and applies to all new records.

- **credit_limits_per_company:**
  - **description:** Credit limits are validated per company. When a customer's outstanding amount plus a new transaction exceeds the credit limit for that company, the transaction is blocked or a warning is shown.

- **cannot_assign_group_nodes:**
  - **description:** Group/parent nodes in customer group and territory hierarchies cannot be directly assigned to a customer. Only leaf nodes (is_group = false) are valid for assignment.

- **one_internal_party_per_company:**
  - **description:** Only one internal customer and one internal supplier can exist per company. This prevents duplicate inter-company transaction paths.

- **primary_contact_auto_created:**
  - **description:** When a customer or supplier is saved with contact details, a primary contact record is automatically created and linked.

- **primary_address_auto_created:**
  - **description:** When a customer or supplier is saved with address details, a primary address record is automatically created and linked.

- **portal_users_get_roles:**
  - **description:** Portal users added to a customer record are automatically assigned the customer portal role, granting access to orders, invoices, and support tickets for that customer.

- **account_currency_must_match:**
  - **description:** The currency of mapped receivable (customer) or payable (supplier) accounts must match the party's default currency. Mismatched currencies are rejected at save time.

- **lead_conversion_links:**
  - **description:** When a lead is converted to a customer, all addresses and contacts from the lead are automatically linked to the new customer record. The lead is marked as converted.


## Outcomes

### Create_customer (Priority: 1)

**Given:**
- sales user provides customer name and customer type
- customer name does not already exist (or naming series generates unique name)

**Then:**
- **create_record** — Create customer record with default values
- **create_record** — Auto-create primary contact if contact details provided
- **create_record** — Auto-create primary address if address details provided
- **emit_event** event: `customer.created`

**Result:** Customer created with linked primary contact and address

### Duplicate_name_rejected (Priority: 1) — Error: `PARTY_DUPLICATE_NAME`

**Given:**
- user creates a customer or supplier
- a record with the same name already exists

**Then:**
- **notify** — Show existing record name and suggest alternatives

**Result:** Creation blocked due to duplicate name

### Group_assignment_rejected (Priority: 1) — Error: `PARTY_GROUP_ASSIGNMENT`

**Given:**
- user assigns a customer to a group or territory node
- the selected node has is_group = true

**Then:**
- **notify** — Inform that only leaf nodes can be assigned

**Result:** Assignment blocked, select a non-group node

### Credit_exceeded (Priority: 1) — Error: `PARTY_CREDIT_EXCEEDED`

**Given:**
- transaction amount plus outstanding exceeds credit limit
- bypass_credit_limit_check is not enabled

**Then:**
- **notify** — Show outstanding amount, credit limit, and excess

**Result:** Transaction blocked until credit limit is increased or outstanding reduced

### Internal_duplicate_rejected (Priority: 1) — Error: `PARTY_INTERNAL_DUPLICATE`

**Given:**
- user creates an internal customer or supplier for a company
- an internal party of the same type already exists for that company

**Then:**
- **notify** — Show existing internal party for the company

**Result:** Only one internal customer/supplier allowed per company

### Account_currency_mismatch (Priority: 1) — Error: `PARTY_ACCOUNT_CURRENCY_MISMATCH`

**Given:**
- user maps a receivable or payable account to a party
- account currency does not match the party's default currency

**Then:**
- **notify** — Show expected currency vs account currency

**Result:** Account mapping rejected due to currency mismatch

### Create_supplier (Priority: 2)

**Given:**
- purchase user provides supplier name
- supplier name does not already exist (or naming series generates unique name)

**Then:**
- **create_record** — Create supplier record with default values
- **create_record** — Auto-create primary contact if contact details provided
- **create_record** — Auto-create primary address if address details provided
- **emit_event** event: `supplier.created`

**Result:** Supplier created with linked primary contact and address

### Convert_lead_to_customer (Priority: 3)

**Given:**
- a qualified lead exists in the system
- sales user initiates lead conversion

**Then:**
- **create_record** — Create customer from lead data
- **set_field** target: `lead_name` — Link back to original lead record
- **call_service** target: `link_service` — Transfer all addresses and contacts from lead to customer
- **emit_event** event: `lead.converted`

**Result:** Lead converted to customer with all contacts and addresses transferred

### Apply_credit_limit (Priority: 4)

**Given:**
- a transaction is being created or submitted for a customer
- customer has credit limits configured for the company
- `grand_total` (computed) gt `0`

**Then:**
- **notify** — Display credit limit warning with outstanding amount and limit
- **emit_event** event: `customer.credit_exceeded`

**Result:** Transaction blocked or warning shown based on credit limit configuration

### Manage_portal_access (Priority: 5)

**Given:**
- portal users are added to or removed from a customer record

**Then:**
- **call_service** target: `role_service` — Assign or revoke customer portal roles for affected users

**Result:** Portal user roles updated to match customer portal user list

### Freeze_party (Priority: 6)

**Given:**
- accounts user freezes a customer or supplier

**Then:**
- **set_field** target: `customer_is_frozen` value: `true` — Set frozen flag (applies to customer or supplier as appropriate)

**Result:** Party frozen, no new transactions can be created

### Put_supplier_on_hold (Priority: 7)

**Given:**
- purchase user places a supplier on hold
- hold type and optional release date are specified

**Then:**
- **set_field** target: `on_hold` value: `true`
- **set_field** target: `hold_type` — Set to All, Invoices, or Payments
- **emit_event** event: `supplier.on_hold`

**Result:** Supplier placed on hold, transactions restricted per hold type

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PARTY_DUPLICATE_NAME` | 409 | A customer or supplier with this name already exists. | No |
| `PARTY_GROUP_ASSIGNMENT` | 422 | Cannot assign a group node. Select a non-group (leaf) node. | No |
| `PARTY_CREDIT_EXCEEDED` | 403 | Customer credit limit exceeded. Outstanding plus this transaction exceeds the allowed limit. | No |
| `PARTY_INTERNAL_DUPLICATE` | 409 | Only one internal customer/supplier is allowed per company. | No |
| `PARTY_ACCOUNT_CURRENCY_MISMATCH` | 422 | Account currency must match the party's default currency. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `customer.created` | New customer record created | `customer_id`, `customer_name`, `customer_type` |
| `customer.credit_exceeded` | Customer credit limit exceeded during a transaction | `customer_id`, `company`, `outstanding`, `credit_limit`, `transaction_amount` |
| `supplier.created` | New supplier record created | `supplier_id`, `supplier_name`, `supplier_type` |
| `supplier.on_hold` | Supplier placed on hold with transaction restrictions | `supplier_id`, `hold_type`, `release_date` |
| `lead.converted` | Lead converted to a customer record | `lead_id`, `customer_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| sales-order-lifecycle | recommended | Sales order lifecycle uses customer credit limits and defaults |
| purchase-order-lifecycle | recommended | Purchase order lifecycle uses supplier hold status and defaults |
| lead-opportunity-pipeline | optional | Lead management and conversion to customer records |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source: https://github.com/frappe/erpnext
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Customer Supplier Management Blueprint",
  "description": "Customer and supplier master data management with credit limits, territory and group hierarchies, portal access, lead conversion, internal parties, and supplier",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "customer, supplier, master-data, credit-limit, territory, customer-group, portal-access, lead-conversion"
}
</script>
