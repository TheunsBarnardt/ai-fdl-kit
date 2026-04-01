---
name: fdl-create
description: Create a new FDL blueprint from a feature description
user_invocable: true
command: fdl-create
arguments: "<feature-name> [category]"
---

# FDL Create — Blueprint Authoring Skill

Create a new FDL blueprint YAML file from a feature description. Ensures the blueprint follows the FDL meta-schema and connects properly to existing blueprints.

## Usage

```
/fdl-create checkout payment
/fdl-create file-upload data
/fdl-create roles access
/fdl-create dashboard ui
```

## Arguments

- `<feature-name>` — Kebab-case feature identifier (e.g., `checkout`, `file-upload`)
- `[category]` — Optional. One of: auth, data, access, ui, integration, notification, payment. If omitted, will be inferred or asked.

## Workflow

### Step 1: Gather Requirements

Ask the user (if not already clear from context):
1. What does this feature do? (one sentence)
2. What fields/inputs does it need?
3. Are there security concerns? (rate limiting, auth required, etc.)
4. Does it relate to any existing blueprints?

If the user says something simple like `/fdl-create checkout`, use domain knowledge to fill in sensible defaults and confirm with the user.

### Step 2: Check Existing Blueprints

1. Glob for `blueprints/**/*.blueprint.yaml`
2. Parse all existing blueprints
3. Check if this feature already exists (error if so)
4. Identify potential relationships:
   - Does any existing blueprint reference this feature in `related`?
   - Should this feature reference existing ones?

### Step 3: Load the Meta-Schema

1. Read `schema/blueprint.schema.yaml`
2. Use it as the template for the new blueprint
3. Ensure all required fields are included

### Step 4: Generate the Blueprint

Create the YAML file with ALL sections:

```yaml
# ============================================================
# {FEATURE_NAME} — Feature Blueprint
# FDL v0.1.0 | Blueprint v1.0.0
# ============================================================
# {Description of what this feature does and why it matters}
# ============================================================

feature: {feature-name}
version: "1.0.0"
description: {one-line description}
category: {category}
tags: [{relevant, tags}]

fields:
  # Every input the feature needs
  # Include type, required, label, validation

rules:
  # Business logic and security policies
  # Include rate_limit if public-facing
  # Include security section if handling sensitive data

flows:
  # happy_path is REQUIRED
  # Add error flows for every failure case
  # Each flow has steps with id, action, description

errors:
  # Standardized error codes
  # UPPER_SNAKE_CASE codes
  # User-safe messages (never leak internals)

events:
  # Signals for other features to consume
  # dot.notation names
  # Include payload fields

related:
  # Connections to other features
  # required, recommended, optional, extends

ui_hints:
  # Layout suggestions
  # Field ordering
  # Action buttons and links
  # Accessibility

extensions:
  # Framework-specific overrides (optional)
```

### Step 5: Validate

1. Run the blueprint through the JSON Schema validator (mentally or via script)
2. Check:
   - [ ] `feature` is kebab-case
   - [ ] `version` is valid semver
   - [ ] `description` is under 200 chars
   - [ ] `category` is a valid enum value
   - [ ] Every field has `name`, `type`, `required`
   - [ ] Every field name is snake_case
   - [ ] Every validation rule has `type` and `message`
   - [ ] Every error code is UPPER_SNAKE_CASE
   - [ ] Every event name is dot.notation
   - [ ] `flows` has at least a `happy_path`
   - [ ] Every flow step that can fail has an `on_fail` reference
   - [ ] Related features use valid relationship types

### Step 6: Update Related Blueprints

If this new feature should be referenced by existing blueprints:
1. Show the user which blueprints should add a `related` entry
2. Ask for confirmation
3. Add the relationship entries

Example: Creating `mfa` should add a reference in `login.blueprint.yaml`:
```yaml
related:
  - feature: mfa
    type: optional
    reason: "Second factor after password verification"
```

### Step 7: Write and Confirm

1. Write the file to `blueprints/{category}/{feature}.blueprint.yaml`
2. Run `node scripts/validate.js` on the new file
3. Show the user a summary:
   ```
   Created: blueprints/payment/checkout.blueprint.yaml

   Feature: checkout v1.0.0
   Fields: 4 (card_token, amount, currency, billing_address)
   Flows: 5 (happy_path, payment_failed, card_declined, insufficient_funds, rate_limited)
   Errors: 5
   Events: 3 (checkout.success, checkout.failed, checkout.refunded)
   Related: cart (required), login (required), receipt (recommended)

   Validation: PASS
   ```

## Blueprint Quality Checklist

When creating a blueprint, ensure:

### Security
- [ ] Public-facing features have `rate_limit` rules
- [ ] Sensitive fields are marked `sensitive: true`
- [ ] Error messages don't leak internal state
- [ ] Authentication requirements are specified
- [ ] Input validation covers XSS/injection vectors (maxLength, pattern)

### Completeness
- [ ] Every user action has a flow
- [ ] Every flow that can fail has an error flow
- [ ] Every error has a code, status, and message
- [ ] Related features are identified
- [ ] Events cover success AND failure cases

### Usability
- [ ] Fields have labels and placeholders
- [ ] UI hints include field ordering
- [ ] Accessibility hints are present (autofocus, autocomplete, aria)
- [ ] Loading states are defined
- [ ] Links to related features are specified

### Conventions
- [ ] Feature name: kebab-case
- [ ] Field names: snake_case
- [ ] Error codes: UPPER_SNAKE_CASE
- [ ] Event names: dot.notation
- [ ] Comments explain WHY, not WHAT

## Common Patterns to Reuse

### Rate Limiting (copy into any public feature)
```yaml
rules:
  security:
    rate_limit:
      window_seconds: 60
      max_requests: 10
      scope: per_ip
```

### Standard CRUD Flows
```yaml
flows:
  create:
    steps:
      - id: validate
        action: validate_fields
      - id: authorize
        action: check_permissions
      - id: create
        action: create_record
      - id: emit
        action: emit
        event: {feature}.created
  read:
    steps: [authorize, fetch, return]
  update:
    steps: [validate, authorize, update, emit]
  delete:
    steps: [authorize, soft_delete, emit]
```

### Authentication Guard
```yaml
rules:
  access:
    requires_auth: true
    roles: ["user", "admin"]
```

## Examples

### Simple Feature
```
/fdl-create search data
```
Creates a search blueprint with query field, pagination rules, result flows.

### Complex Feature
```
/fdl-create checkout payment
```
Creates a full checkout blueprint with payment fields, fraud rules, success/failure/retry flows, Stripe/PayPal extensions.

### Feature That Extends Another
```
/fdl-create mfa auth
```
Creates MFA blueprint that `extends` login, with TOTP/SMS fields, verification flows, backup codes.
