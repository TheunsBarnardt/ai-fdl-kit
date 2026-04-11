<!-- AUTO-GENERATED FROM customer-supplier-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Customer Supplier Management

> Customer and supplier master data management with credit limits, territory and group hierarchies, portal access, lead conversion, internal parties, and supplier hold/block controls.

**Category:** Data · **Version:** 1.0.0 · **Tags:** customer · supplier · master-data · credit-limit · territory · customer-group · portal-access · lead-conversion

## What this does

Customer and supplier master data management with credit limits, territory and group hierarchies, portal access, lead conversion, internal parties, and supplier hold/block controls.

Specifies 12 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **customer_name** *(text, required)* — Customer Name
- **customer_type** *(select, required)* — Customer Type
- **customer_accounts** *(json, optional)* — Customer Accounts
- **credit_limits** *(json, optional)* — Credit Limits
- **territory** *(text, optional)* — Territory
- **customer_group** *(text, optional)* — Customer Group
- **default_price_list** *(text, optional)* — Default Price List
- **default_currency** *(text, optional)* — Default Currency
- **sales_team** *(json, optional)* — Sales Team
- **customer_disabled** *(boolean, optional)* — Disabled
- **customer_is_frozen** *(boolean, optional)* — Is Frozen
- **is_internal_customer** *(boolean, optional)* — Is Internal Customer
- **portal_users** *(json, optional)* — Portal Users
- **lead_name** *(text, optional)* — Source Lead
- **supplier_name** *(text, required)* — Supplier Name
- **supplier_type** *(select, optional)* — Supplier Type
- **supplier_accounts** *(json, optional)* — Supplier Accounts
- **supplier_default_price_list** *(text, optional)* — Supplier Default Price List
- **payment_terms** *(text, optional)* — Payment Terms
- **supplier_disabled** *(boolean, optional)* — Disabled
- **supplier_is_frozen** *(boolean, optional)* — Is Frozen
- **on_hold** *(boolean, optional)* — On Hold
- **hold_type** *(select, optional)* — Hold Type
- **release_date** *(date, optional)* — Hold Release Date
- **prevent_rfqs** *(boolean, optional)* — Prevent RFQs
- **warn_rfqs** *(boolean, optional)* — Warn on RFQs
- **prevent_pos** *(boolean, optional)* — Prevent Purchase Orders
- **warn_pos** *(boolean, optional)* — Warn on Purchase Orders
- **group_name** *(text, optional)* — Group Name
- **parent_group** *(text, optional)* — Parent Group
- **is_group** *(boolean, optional)* — Is Group Node
- **group_default_accounts** *(json, optional)* — Group Default Accounts
- **group_credit_limits** *(json, optional)* — Group Credit Limits
- **territory_name** *(text, optional)* — Territory Name
- **parent_territory** *(text, optional)* — Parent Territory
- **territory_manager** *(text, optional)* — Territory Manager
- **targets** *(json, optional)* — Territory Targets

## What must be true

- **naming_configurable:** Customer and supplier names can be configured to use the party name directly or follow a naming series pattern. The naming rule is set at the system level and applies to all new records.
- **credit_limits_per_company:** Credit limits are validated per company. When a customer's outstanding amount plus a new transaction exceeds the credit limit for that company, the transaction is blocked or a warning is shown.
- **cannot_assign_group_nodes:** Group/parent nodes in customer group and territory hierarchies cannot be directly assigned to a customer. Only leaf nodes (is_group = false) are valid for assignment.
- **one_internal_party_per_company:** Only one internal customer and one internal supplier can exist per company. This prevents duplicate inter-company transaction paths.
- **primary_contact_auto_created:** When a customer or supplier is saved with contact details, a primary contact record is automatically created and linked.
- **primary_address_auto_created:** When a customer or supplier is saved with address details, a primary address record is automatically created and linked.
- **portal_users_get_roles:** Portal users added to a customer record are automatically assigned the customer portal role, granting access to orders, invoices, and support tickets for that customer.
- **account_currency_must_match:** The currency of mapped receivable (customer) or payable (supplier) accounts must match the party's default currency. Mismatched currencies are rejected at save time.
- **lead_conversion_links:** When a lead is converted to a customer, all addresses and contacts from the lead are automatically linked to the new customer record. The lead is marked as converted.

## Success & failure scenarios

**✅ Success paths**

- **Create Customer** — when sales user provides customer name and customer type; customer name does not already exist (or naming series generates unique name), then Customer created with linked primary contact and address.
- **Create Supplier** — when purchase user provides supplier name; supplier name does not already exist (or naming series generates unique name), then Supplier created with linked primary contact and address.
- **Convert Lead To Customer** — when a qualified lead exists in the system; sales user initiates lead conversion, then Lead converted to customer with all contacts and addresses transferred.
- **Apply Credit Limit** — when a transaction is being created or submitted for a customer; customer has credit limits configured for the company; Transaction amount plus outstanding exceeds credit limit, then Transaction blocked or warning shown based on credit limit configuration.
- **Manage Portal Access** — when portal users are added to or removed from a customer record, then Portal user roles updated to match customer portal user list.
- **Freeze Party** — when accounts user freezes a customer or supplier, then Party frozen, no new transactions can be created.
- **Put Supplier On Hold** — when purchase user places a supplier on hold; hold type and optional release date are specified, then Supplier placed on hold, transactions restricted per hold type.

**❌ Failure paths**

- **Duplicate Name Rejected** — when user creates a customer or supplier; a record with the same name already exists, then Creation blocked due to duplicate name. *(error: `PARTY_DUPLICATE_NAME`)*
- **Group Assignment Rejected** — when user assigns a customer to a group or territory node; the selected node has is_group = true, then Assignment blocked, select a non-group node. *(error: `PARTY_GROUP_ASSIGNMENT`)*
- **Credit Exceeded** — when transaction amount plus outstanding exceeds credit limit; bypass_credit_limit_check is not enabled, then Transaction blocked until credit limit is increased or outstanding reduced. *(error: `PARTY_CREDIT_EXCEEDED`)*
- **Internal Duplicate Rejected** — when user creates an internal customer or supplier for a company; an internal party of the same type already exists for that company, then Only one internal customer/supplier allowed per company. *(error: `PARTY_INTERNAL_DUPLICATE`)*
- **Account Currency Mismatch** — when user maps a receivable or payable account to a party; account currency does not match the party's default currency, then Account mapping rejected due to currency mismatch. *(error: `PARTY_ACCOUNT_CURRENCY_MISMATCH`)*

## Errors it can return

- `PARTY_DUPLICATE_NAME` — A customer or supplier with this name already exists.
- `PARTY_GROUP_ASSIGNMENT` — Cannot assign a group node. Select a non-group (leaf) node.
- `PARTY_CREDIT_EXCEEDED` — Customer credit limit exceeded. Outstanding plus this transaction exceeds the allowed limit.
- `PARTY_INTERNAL_DUPLICATE` — Only one internal customer/supplier is allowed per company.
- `PARTY_ACCOUNT_CURRENCY_MISMATCH` — Account currency must match the party's default currency.

## Connects to

- **sales-order-lifecycle** *(recommended)* — Sales order lifecycle uses customer credit limits and defaults
- **purchase-order-lifecycle** *(recommended)* — Purchase order lifecycle uses supplier hold status and defaults
- **lead-opportunity-pipeline** *(optional)* — Lead management and conversion to customer records

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/customer-supplier-management/) · **Spec source:** [`customer-supplier-management.blueprint.yaml`](./customer-supplier-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
