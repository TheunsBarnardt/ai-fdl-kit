<!-- AUTO-GENERATED FROM team-organization.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Team Organization

> Multi-tenant organization and team management with member invitations and data isolation

**Category:** Access · **Version:** 1.0.0 · **Tags:** multi-tenancy · organizations · teams · workspaces · invitations · collaboration · saas

## What this does

Multi-tenant organization and team management with member invitations and data isolation

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **org_id** *(text, required)* — Organization ID
- **org_name** *(text, required)* — Organization Name
- **org_slug** *(text, required)* — Organization Slug
- **plan** *(select, required)* — Plan
- **owner_id** *(text, required)* — Owner User ID
- **member_user_id** *(text, required)* — Member User ID
- **member_role** *(select, required)* — Member Role
- **invite_email** *(email, required)* — Invite Email
- **invite_token** *(token, required)* — Invite Token
- **invited_at** *(datetime, required)* — Invited At
- **accepted_at** *(datetime, optional)* — Accepted At
- **invite_status** *(select, required)* — Invite Status

## What must be true

- **data_isolation → tenant_scope:** org_id
- **data_isolation → enforce_at:** query_layer
- **data_isolation → row_level_security:** true
- **slugs → globally_unique:** true
- **slugs → immutable_after_creation:** false
- **slugs → reserved:** api, admin, app, www, help, support, billing, status
- **invitations → token_length_bytes:** 32
- **invitations → expiry_hours:** 72
- **invitations → max_pending_per_org:** 100
- **invitations → resend_cooldown_minutes:** 5
- **roles → hierarchy:** owner, admin, member, viewer
- **roles → owner_minimum:** 1
- **roles → owner_transfer_requires_confirmation:** true
- **limits → free → max_members:** 5
- **limits → free → max_teams:** 1
- **limits → starter → max_members:** 25
- **limits → starter → max_teams:** 5
- **limits → pro → max_members:** 100
- **limits → pro → max_teams:** 25
- **limits → enterprise → max_members:** unlimited
- **limits → enterprise → max_teams:** unlimited

## Success & failure scenarios

**✅ Success paths**

- **Org Created** — when Organization name provided; Organization slug provided; Slug is not already taken, then organization created with the creator as owner.
- **Member Invited** — when Invite email provided; Email not already a member or pending invite in this org; Organization has not reached member limit for current plan, then invitation sent to the provided email address.
- **Invite Declined** — when Valid invite token provided; Invitation is still pending, then invitation declined.
- **Member Removed** — when Target member exists in the organization; Cannot remove the last owner — transfer ownership first, then member removed from the organization.
- **Member Role Changed** — when Target member exists in the organization; New role specified, then member role updated.

**❌ Failure paths**

- **Slug Taken** — when An organization with this slug already exists, then show "This organization URL is already taken". *(error: `ORG_SLUG_TAKEN`)*
- **Member Limit Reached** — when Organization has reached the member limit for its plan, then show "Your plan's member limit has been reached. Upgrade to add more members.". *(error: `ORG_MEMBER_LIMIT`)*
- **Invite Accepted** — when Valid invite token provided; Invitation is still pending; Invitation has not expired (72-hour window), then user added to the organization with the assigned role. *(error: `INVITE_ALREADY_ACCEPTED`)*
- **Invite Expired** — when Invitation is older than 72 hours, then show "This invitation has expired. Please request a new one.". *(error: `INVITE_EXPIRED`)*

## Errors it can return

- `ORG_SLUG_TAKEN` — This organization URL is already taken
- `ORG_MEMBER_LIMIT` — Member limit reached for your current plan
- `INVITE_EXPIRED` — This invitation has expired
- `INVITE_ALREADY_ACCEPTED` — This invitation has already been accepted
- `MEMBER_ALREADY_EXISTS` — This user is already a member of the organization
- `OWNER_TRANSFER_REQUIRED` — Cannot remove the last owner. Transfer ownership first.
- `INSUFFICIENT_ORG_PERMISSION` — You do not have permission to perform this action in this organization

## Events

**`org.created`** — New organization created
  Payload: `org_id`, `org_name`, `org_slug`, `owner_id`, `plan`, `timestamp`

**`member.invited`** — Member invitation sent
  Payload: `org_id`, `invite_email`, `invited_by`, `member_role`, `timestamp`

**`member.joined`** — Member accepted invitation and joined the organization
  Payload: `org_id`, `user_id`, `member_role`, `invited_by`, `timestamp`

**`member.removed`** — Member removed from the organization
  Payload: `org_id`, `user_id`, `removed_by`, `timestamp`

**`member.role_changed`** — Member role updated within the organization
  Payload: `org_id`, `user_id`, `old_role`, `new_role`, `changed_by`, `timestamp`

**`member.invite_declined`** — Member declined the invitation
  Payload: `org_id`, `invite_email`, `timestamp`

**`org.plan_changed`** — Organization plan upgraded or downgraded
  Payload: `org_id`, `old_plan`, `new_plan`, `changed_by`, `timestamp`

## Connects to

- **role-based-access** *(recommended)* — Roles within an organization map to RBAC permission checks
- **signup** *(required)* — Users must have an account before joining an organization
- **audit-logging** *(recommended)* — Organization membership changes should be logged
- **data-privacy-compliance** *(optional)* — Organizations may need GDPR/CCPA data isolation compliance

## Quality fitness 🟢 91/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `████████░░` | 8/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/team-organization/) · **Spec source:** [`team-organization.blueprint.yaml`](./team-organization.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
