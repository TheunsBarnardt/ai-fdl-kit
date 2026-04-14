<!-- AUTO-GENERATED FROM ifa-portal.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Ifa Portal

> Independent Financial Advisor portal for client management, onboarding assistance, client-view impersonation, messaging, product suggestions, and lead referral handling

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** ifa · advisor · client-management · financial-services · wealth-management · lead-referral · messaging

## What this does

Independent Financial Advisor portal for client management, onboarding assistance, client-view impersonation, messaging, product suggestions, and lead referral handling

Specifies 16 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **ifa_id** *(text, required)* — Ifa Id
- **client_id** *(text, required)* — Client Id
- **ifa_status** *(select, required)* — Ifa Status
- **assigned_clients** *(json, optional)* — Assigned Client IDs
- **message_id** *(text, optional)* — Message Id
- **message_subject** *(text, optional)* — Message Subject
- **message_body** *(rich_text, optional)* — Message Body
- **message_type** *(select, optional)* — Message Type
- **suggested_product_ids** *(json, optional)* — Suggested Products
- **suggestion_reason** *(rich_text, optional)* — Reason for Product Suggestion
- **lead_id** *(text, optional)* — Lead Id
- **lead_name** *(text, optional)* — Lead Name
- **lead_email** *(email, optional)* — Lead Email
- **lead_phone** *(phone, optional)* — Lead Phone
- **lead_source** *(select, optional)* — Lead Source
- **lead_notes** *(rich_text, optional)* — Lead Notes
- **lead_status** *(select, optional)* — Lead Status
- **impersonation_active** *(boolean, optional)* — Client View Active

## What must be true

- **permissions:** IFA can only view and manage their assigned clients, IFA cannot modify client financial data directly, IFA can impersonate client view (read-only) for troubleshooting, Impersonation sessions are audit-logged with IFA and client IDs, IFA can initiate onboarding on behalf of a client, IFA can suggest products but client must accept
- **messaging:** Messages between IFA and client are stored and retrievable, Product suggestion messages include product details and personalized reason, Client receives notification when IFA sends a message, IFA receives notification when client responds
- **leads:** IFA can submit leads received from existing clients, Leads are tracked through qualification pipeline, Converted leads become new clients assigned to the referring IFA, Lead referral source tracks which client provided the referral, Commission tracking linked to converted lead accounts
- **client_view:** Client view shows exactly what the client sees: dashboard, portfolios, holdings, documents, Client view is strictly read-only for the IFA, Client view session expires after 30 minutes, All client view sessions create audit trail entries

## Success & failure scenarios

**✅ Success paths**

- **Ifa Login** — when user.role eq "IFA"; ifa_status eq "active", then IFA accesses their portal dashboard with client overview.
- **Get Ifa Dashboard** — when user.role eq "IFA"; ifa_status eq "active", then Return IFA dashboard with client count, pending onboardings, recent messages, lead pipeline, AUM summary.
- **List Clients** — when user.role eq "IFA"; ifa_status eq "active", then Return paginated list of assigned clients with status, portfolios, and recent activity.
- **View Client Detail** — when client_id exists; client_id in "assigned_clients"; user.role eq "IFA", then Return full client profile including portfolios, holdings, onboarding status, and documents.
- **Start Client View** — when client_id exists; client_id in "assigned_clients"; user.role eq "IFA", then IFA sees exactly what the client sees (read-only dashboard, portfolios, holdings).
- **End Client View** — when impersonation_active eq true; user.role eq "IFA", then Client view session ended, IFA returns to their portal.
- **Assist Onboarding** — when client_id exists; client_id in "assigned_clients"; user.role eq "IFA", then IFA can view and guide client through onboarding steps.
- **Initiate Onboarding For Client** — when client_id exists; user.role eq "IFA", then Onboarding initiated on behalf of client, client notified to continue.
- **Suggest Product** — when client_id exists; suggested_product_ids exists; suggestion_reason exists; client_id in "assigned_clients"; user.role eq "IFA", then Product suggestion sent to client with personalized reason and product details.
- **View Message History** — when client_id exists; client_id in "assigned_clients"; user.role eq "IFA", then Return paginated message history between IFA and client.
- **Submit Lead** — when lead_name exists; lead_source exists; user.role eq "IFA", then Lead submitted and tracked in pipeline.
- **Convert Lead To Client** — when lead_id exists; lead_status eq "qualified"; user.role eq "IFA", then Lead converted to client, assigned to IFA, welcome email sent.

**❌ Failure paths**

- **Ifa Suspended** — when user.role eq "IFA"; ifa_status in ["suspended","deactivated"], then IFA access denied due to suspended or deactivated status. *(error: `IFA_SUSPENDED`)*
- **Unauthorized Client Access** — when client_id exists; client_id not_in "assigned_clients"; user.role eq "IFA", then IFA cannot access clients not assigned to them. *(error: `CLIENT_NOT_ASSIGNED`)*
- **Send Message** — when client_id exists; message_body exists; client_id in "assigned_clients"; user.role eq "IFA", then Message sent to client with notification. *(error: `MESSAGE_SEND_FAILED`)*
- **Update Lead Status** — when lead_id exists; lead_status exists; user.role eq "IFA", then Lead status updated. *(error: `INVALID_LEAD_STATUS`)*

## Errors it can return

- `IFA_SUSPENDED` — Your advisor account is currently suspended
- `CLIENT_NOT_ASSIGNED` — You do not have access to this client
- `IFA_NOT_FOUND` — Advisor account not found
- `CLIENT_NOT_FOUND` — Client not found
- `LEAD_NOT_FOUND` — Lead not found
- `INVALID_LEAD_STATUS` — Invalid lead status transition
- `MESSAGE_SEND_FAILED` — Failed to send message. Please try again
- `IMPERSONATION_EXPIRED` — Client view session has expired

## Events

**`ifa.logged_in`** — IFA logged into portal
  Payload: `ifa_id`, `timestamp`

**`ifa.access_denied`** — IFA access denied
  Payload: `ifa_id`, `ifa_status`, `timestamp`

**`ifa.clients_listed`** — IFA viewed client list
  Payload: `ifa_id`, `client_count`, `timestamp`

**`ifa.client_viewed`** — IFA viewed client detail
  Payload: `ifa_id`, `client_id`, `timestamp`

**`ifa.client_view_started`** — IFA started client view impersonation
  Payload: `ifa_id`, `client_id`, `timestamp`

**`ifa.client_view_ended`** — IFA ended client view session
  Payload: `ifa_id`, `client_id`, `duration_minutes`, `timestamp`

**`ifa.onboarding_assisted`** — IFA assisted with client onboarding
  Payload: `ifa_id`, `client_id`, `onboarding_id`, `timestamp`

**`ifa.onboarding_initiated`** — IFA initiated onboarding for client
  Payload: `ifa_id`, `client_id`, `onboarding_id`, `timestamp`

**`ifa.message_sent`** — IFA sent message to client
  Payload: `ifa_id`, `client_id`, `message_type`, `timestamp`

**`ifa.product_suggested`** — IFA suggested products to client
  Payload: `ifa_id`, `client_id`, `suggested_product_ids`, `timestamp`

**`ifa.lead_submitted`** — IFA submitted a new lead
  Payload: `ifa_id`, `lead_id`, `lead_source`, `referring_client_id`, `timestamp`

**`ifa.lead_updated`** — IFA updated lead status
  Payload: `ifa_id`, `lead_id`, `old_status`, `new_status`, `timestamp`

**`ifa.lead_converted`** — Lead converted to client
  Payload: `ifa_id`, `lead_id`, `new_client_id`, `timestamp`

**`ifa.messages_viewed`** — IFA viewed message history with client
  Payload: `ifa_id`, `client_id`, `timestamp`

**`ifa.dashboard_viewed`** — IFA viewed portal dashboard
  Payload: `ifa_id`, `timestamp`

## Connects to

- **client-onboarding** *(required)* — IFA assists clients through the onboarding process
- **account-opening** *(required)* — IFA guides clients through account opening and product selection
- **portfolio-management** *(required)* — IFA views client portfolios and holdings
- **login** *(required)* — IFA must authenticate to access the portal
- **role-based-access** *(required)* — IFA role permissions control what advisors can access
- **in-app-notifications** *(recommended)* — IFA receives notifications about client activity and messages
- **email-notifications** *(recommended)* — Email notifications for lead conversions and client messages
- **lead-opportunity-pipeline** *(recommended)* — Leads submitted by IFA feed into the deal pipeline
- **product-configurator** *(recommended)* — IFA needs product catalog to make suggestions
- **audit-trail** *(required)* — Client view impersonation and all IFA actions must be audit-logged
- **document-management** *(recommended)* — IFA views client documents during assistance

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 14 fields
- `T5` **bind-orphan-errors** — bound 2 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/ifa-portal/) · **Spec source:** [`ifa-portal.blueprint.yaml`](./ifa-portal.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
