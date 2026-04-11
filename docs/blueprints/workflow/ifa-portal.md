---
title: "Ifa Portal Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Independent Financial Advisor portal for client management, onboarding assistance, client-view impersonation, messaging, product suggestions, and lead referral "
---

# Ifa Portal Blueprint

> Independent Financial Advisor portal for client management, onboarding assistance, client-view impersonation, messaging, product suggestions, and lead referral handling

| | |
|---|---|
| **Feature** | `ifa-portal` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | ifa, advisor, client-management, financial-services, wealth-management, lead-referral, messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/ifa-portal.blueprint.yaml) |
| **JSON API** | [ifa-portal.json]({{ site.baseurl }}/api/blueprints/workflow/ifa-portal.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ifa` | Independent Financial Advisor | human | Financial advisor who manages clients, assists with onboarding, and generates business |
| `client` | Client | human | Investment client managed by the IFA |
| `admin` | Administrator | human | System administrator managing IFA assignments |
| `system` | System | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `ifa_id` | text | Yes | Ifa Id | Validations: required |
| `client_id` | text | Yes | Client Id | Validations: required |
| `ifa_status` | select | Yes | Ifa Status |  |
| `assigned_clients` | json | No | Assigned Client IDs |  |
| `message_id` | text | No | Message Id |  |
| `message_subject` | text | No | Message Subject | Validations: maxLength |
| `message_body` | rich_text | No | Message Body |  |
| `message_type` | select | No | Message Type |  |
| `suggested_product_ids` | json | No | Suggested Products |  |
| `suggestion_reason` | rich_text | No | Reason for Product Suggestion |  |
| `lead_id` | text | No | Lead Id |  |
| `lead_name` | text | No | Lead Name | Validations: maxLength |
| `lead_email` | email | No | Lead Email |  |
| `lead_phone` | phone | No | Lead Phone |  |
| `lead_source` | select | No | Lead Source |  |
| `lead_notes` | rich_text | No | Lead Notes |  |
| `lead_status` | select | No | Lead Status |  |
| `impersonation_active` | boolean | No | Client View Active |  |

## Rules

- **permissions:** IFA can only view and manage their assigned clients, IFA cannot modify client financial data directly, IFA can impersonate client view (read-only) for troubleshooting, Impersonation sessions are audit-logged with IFA and client IDs, IFA can initiate onboarding on behalf of a client, IFA can suggest products but client must accept
- **messaging:** Messages between IFA and client are stored and retrievable, Product suggestion messages include product details and personalized reason, Client receives notification when IFA sends a message, IFA receives notification when client responds
- **leads:** IFA can submit leads received from existing clients, Leads are tracked through qualification pipeline, Converted leads become new clients assigned to the referring IFA, Lead referral source tracks which client provided the referral, Commission tracking linked to converted lead accounts
- **client_view:** Client view shows exactly what the client sees: dashboard, portfolios, holdings, documents, Client view is strictly read-only for the IFA, Client view session expires after 30 minutes, All client view sessions create audit trail entries

## Outcomes

### Ifa_suspended (Priority: 0) — Error: `IFA_SUSPENDED`

**Given:**
- `user.role` (session) eq `IFA`
- `ifa_status` (db) in `suspended,deactivated`

**Then:**
- **emit_event** event: `ifa.access_denied`

**Result:** IFA access denied due to suspended or deactivated status

### Ifa_login (Priority: 1)

**Given:**
- `user.role` (session) eq `IFA`
- `ifa_status` (db) eq `active`

**Then:**
- **emit_event** event: `ifa.logged_in`

**Result:** IFA accesses their portal dashboard with client overview

### Unauthorized_client_access (Priority: 2) — Error: `CLIENT_NOT_ASSIGNED`

**Given:**
- `client_id` (input) exists
- `client_id` (db) not_in `assigned_clients`
- `user.role` (session) eq `IFA`

**Result:** IFA cannot access clients not assigned to them

### Get_ifa_dashboard (Priority: 5)

**Given:**
- `user.role` (session) eq `IFA`
- `ifa_status` (db) eq `active`

**Then:**
- **emit_event** event: `ifa.dashboard_viewed`

**Result:** Return IFA dashboard with client count, pending onboardings, recent messages, lead pipeline, AUM summary

### List_clients (Priority: 10)

**Given:**
- `user.role` (session) eq `IFA`
- `ifa_status` (db) eq `active`

**Then:**
- **emit_event** event: `ifa.clients_listed`

**Result:** Return paginated list of assigned clients with status, portfolios, and recent activity

### View_client_detail (Priority: 11)

**Given:**
- `client_id` (input) exists
- `client_id` (db) in `assigned_clients`
- `user.role` (session) eq `IFA`

**Then:**
- **emit_event** event: `ifa.client_viewed`

**Result:** Return full client profile including portfolios, holdings, onboarding status, and documents

### Start_client_view (Priority: 20)

**Given:**
- `client_id` (input) exists
- `client_id` (db) in `assigned_clients`
- `user.role` (session) eq `IFA`

**Then:**
- **set_field** target: `impersonation_active` value: `true`
- **emit_event** event: `ifa.client_view_started`

**Result:** IFA sees exactly what the client sees (read-only dashboard, portfolios, holdings)

### End_client_view (Priority: 21)

**Given:**
- `impersonation_active` (session) eq `true`
- `user.role` (session) eq `IFA`

**Then:**
- **set_field** target: `impersonation_active` value: `false`
- **emit_event** event: `ifa.client_view_ended`

**Result:** Client view session ended, IFA returns to their portal

### Assist_onboarding (Priority: 30)

**Given:**
- `client_id` (input) exists
- `client_id` (db) in `assigned_clients`
- `user.role` (session) eq `IFA`

**Then:**
- **emit_event** event: `ifa.onboarding_assisted`

**Result:** IFA can view and guide client through onboarding steps

### Initiate_onboarding_for_client (Priority: 31)

**Given:**
- `client_id` (input) exists
- `user.role` (session) eq `IFA`

**Then:**
- **create_record** target: `onboardings`
- **emit_event** event: `ifa.onboarding_initiated`
- **notify** target: `client`

**Result:** Onboarding initiated on behalf of client, client notified to continue

### Send_message (Priority: 40) — Error: `MESSAGE_SEND_FAILED`

**Given:**
- `client_id` (input) exists
- `message_body` (input) exists
- `client_id` (db) in `assigned_clients`
- `user.role` (session) eq `IFA`

**Then:**
- **create_record** target: `messages`
- **emit_event** event: `ifa.message_sent`
- **notify** target: `client`

**Result:** Message sent to client with notification

### Suggest_product (Priority: 41)

**Given:**
- `client_id` (input) exists
- `suggested_product_ids` (input) exists
- `suggestion_reason` (input) exists
- `client_id` (db) in `assigned_clients`
- `user.role` (session) eq `IFA`

**Then:**
- **create_record** target: `product_suggestions`
- **emit_event** event: `ifa.product_suggested`
- **notify** target: `client`

**Result:** Product suggestion sent to client with personalized reason and product details

### View_message_history (Priority: 42)

**Given:**
- `client_id` (input) exists
- `client_id` (db) in `assigned_clients`
- `user.role` (session) eq `IFA`

**Then:**
- **emit_event** event: `ifa.messages_viewed`

**Result:** Return paginated message history between IFA and client

### Submit_lead (Priority: 50)

**Given:**
- `lead_name` (input) exists
- `lead_source` (input) exists
- `user.role` (session) eq `IFA`

**Then:**
- **create_record** target: `leads`
- **set_field** target: `lead_status` value: `new`
- **emit_event** event: `ifa.lead_submitted`

**Result:** Lead submitted and tracked in pipeline

### Update_lead_status (Priority: 51) — Error: `INVALID_LEAD_STATUS`

**Given:**
- `lead_id` (input) exists
- `lead_status` (input) exists
- `user.role` (session) eq `IFA`

**Then:**
- **set_field** target: `lead_status` value: `from_input`
- **emit_event** event: `ifa.lead_updated`

**Result:** Lead status updated

### Convert_lead_to_client (Priority: 52)

**Given:**
- `lead_id` (input) exists
- `lead_status` (db) eq `qualified`
- `user.role` (session) eq `IFA`

**Then:**
- **set_field** target: `lead_status` value: `converted`
- **create_record** target: `clients`
- **emit_event** event: `ifa.lead_converted`
- **notify** target: `new_client`

**Result:** Lead converted to client, assigned to IFA, welcome email sent

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IFA_SUSPENDED` | 403 | Your advisor account is currently suspended | No |
| `CLIENT_NOT_ASSIGNED` | 403 | You do not have access to this client | No |
| `IFA_NOT_FOUND` | 404 | Advisor account not found | No |
| `CLIENT_NOT_FOUND` | 404 | Client not found | No |
| `LEAD_NOT_FOUND` | 404 | Lead not found | No |
| `INVALID_LEAD_STATUS` | 400 | Invalid lead status transition | No |
| `MESSAGE_SEND_FAILED` | 500 | Failed to send message. Please try again | Yes |
| `IMPERSONATION_EXPIRED` | 401 | Client view session has expired | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `ifa.logged_in` | IFA logged into portal | `ifa_id`, `timestamp` |
| `ifa.access_denied` | IFA access denied | `ifa_id`, `ifa_status`, `timestamp` |
| `ifa.clients_listed` | IFA viewed client list | `ifa_id`, `client_count`, `timestamp` |
| `ifa.client_viewed` | IFA viewed client detail | `ifa_id`, `client_id`, `timestamp` |
| `ifa.client_view_started` | IFA started client view impersonation | `ifa_id`, `client_id`, `timestamp` |
| `ifa.client_view_ended` | IFA ended client view session | `ifa_id`, `client_id`, `duration_minutes`, `timestamp` |
| `ifa.onboarding_assisted` | IFA assisted with client onboarding | `ifa_id`, `client_id`, `onboarding_id`, `timestamp` |
| `ifa.onboarding_initiated` | IFA initiated onboarding for client | `ifa_id`, `client_id`, `onboarding_id`, `timestamp` |
| `ifa.message_sent` | IFA sent message to client | `ifa_id`, `client_id`, `message_type`, `timestamp` |
| `ifa.product_suggested` | IFA suggested products to client | `ifa_id`, `client_id`, `suggested_product_ids`, `timestamp` |
| `ifa.lead_submitted` | IFA submitted a new lead | `ifa_id`, `lead_id`, `lead_source`, `referring_client_id`, `timestamp` |
| `ifa.lead_updated` | IFA updated lead status | `ifa_id`, `lead_id`, `old_status`, `new_status`, `timestamp` |
| `ifa.lead_converted` | Lead converted to client | `ifa_id`, `lead_id`, `new_client_id`, `timestamp` |
| `ifa.messages_viewed` | IFA viewed message history with client | `ifa_id`, `client_id`, `timestamp` |
| `ifa.dashboard_viewed` | IFA viewed portal dashboard | `ifa_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| client-onboarding | required | IFA assists clients through the onboarding process |
| account-opening | required | IFA guides clients through account opening and product selection |
| portfolio-management | required | IFA views client portfolios and holdings |
| login | required | IFA must authenticate to access the portal |
| role-based-access | required | IFA role permissions control what advisors can access |
| in-app-notifications | recommended | IFA receives notifications about client activity and messages |
| email-notifications | recommended | Email notifications for lead conversions and client messages |
| lead-opportunity-pipeline | recommended | Leads submitted by IFA feed into the deal pipeline |
| product-configurator | recommended | IFA needs product catalog to make suggestions |
| audit-trail | required | Client view impersonation and all IFA actions must be audit-logged |
| document-management | recommended | IFA views client documents during assistance |

## AGI Readiness

### Goals

#### Reliable Ifa Portal

Independent Financial Advisor portal for client management, onboarding assistance, client-view impersonation, messaging, product suggestions, and lead referral handling

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `client_onboarding` | client-onboarding | degrade |
| `account_opening` | account-opening | degrade |
| `portfolio_management` | portfolio-management | degrade |
| `login` | login | degrade |
| `role_based_access` | role-based-access | degrade |
| `audit_trail` | audit-trail | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| ifa_login | `autonomous` | - | - |
| ifa_suspended | `human_required` | - | - |
| list_clients | `autonomous` | - | - |
| view_client_detail | `autonomous` | - | - |
| unauthorized_client_access | `autonomous` | - | - |
| start_client_view | `autonomous` | - | - |
| end_client_view | `autonomous` | - | - |
| assist_onboarding | `autonomous` | - | - |
| initiate_onboarding_for_client | `autonomous` | - | - |
| send_message | `autonomous` | - | - |
| suggest_product | `autonomous` | - | - |
| submit_lead | `autonomous` | - | - |
| update_lead_status | `supervised` | - | - |
| convert_lead_to_client | `autonomous` | - | - |
| view_message_history | `autonomous` | - | - |
| get_ifa_dashboard | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: sidebar_with_content
primary_nav:
  - label: Dashboard
    icon: layout-dashboard
  - label: My Clients
    icon: users
  - label: Messages
    icon: message-square
  - label: Leads
    icon: user-plus
  - label: Products
    icon: package
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ifa Portal Blueprint",
  "description": "Independent Financial Advisor portal for client management, onboarding assistance, client-view impersonation, messaging, product suggestions, and lead referral ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ifa, advisor, client-management, financial-services, wealth-management, lead-referral, messaging"
}
</script>
