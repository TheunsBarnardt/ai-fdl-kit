---
title: "Biometric Auth Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Palm vein biometric authentication — alternative to password login with enrollment of up to 2 palms per user. 8 fields. 11 outcomes. 6 error codes. rules: enrol"
---

# Biometric Auth Blueprint

> Palm vein biometric authentication — alternative to password login with enrollment of up to 2 palms per user

| | |
|---|---|
| **Feature** | `biometric-auth` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | biometric, palm-vein, authentication, passwordless, enrollment |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/biometric-auth.blueprint.yaml) |
| **JSON API** | [biometric-auth.json]({{ site.baseurl }}/api/blueprints/auth/biometric-auth.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Person enrolling their palm or authenticating via palm vein scan |
| `palm_scanner` | Palm Vein Scanner | external | Biometric scanning hardware that captures palm vein patterns |
| `auth_system` | Authentication System | system | Backend that stores templates, performs matching, and issues sessions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | hidden | Yes | User ID |  |
| `palm_label` | select | Yes | Which Hand | Validations: required |
| `palm_template` | json | No | Palm Vein Template |  |
| `palm_feature` | json | No | Palm Vein Feature |  |
| `enrollment_status` | select | Yes | Enrollment Status |  |
| `auth_method` | select | No | Authentication Method |  |
| `enrolled_palm_count` | number | No | Number of Enrolled Palms | Validations: min, max |
| `email` | email | Yes | Email Address | Validations: required, email |

## States

**State field:** `enrollment_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unenrolled` | Yes |  |
| `enrolling` |  |  |
| `enrolled` |  |  |
| `failed` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `unenrolled` | `enrolling` | user |  |
|  | `enrolling` | `enrolled` | auth_system | SDK registration returns success and template is stored |
|  | `enrolling` | `failed` | palm_scanner | SDK registration fails (timeout, poor quality, positioning) |
|  | `failed` | `enrolling` | user |  |
|  | `enrolled` | `enrolling` | user | User has fewer than 2 palms enrolled |
|  | `enrolled` | `unenrolled` | user | User removes all enrolled palms |

## Rules

- **enrollment:**
  - **max_palms:** 2
  - **unique_per_hand:** Only one template per hand per user — re-enrolling the same hand replaces the old template
  - **must_be_authenticated:** User must be logged in (via password) to enroll a palm
  - **capture_count:** 4
- **authentication:**
  - **alternative_to_password:** Palm vein scan can be used instead of password to log in
  - **email_required:** User must provide their email to identify which templates to match against
  - **match_any_palm:** If user has 2 enrolled palms, feature is matched against both — either can authenticate
  - **template_auto_update:** On successful match, the updated template from the SDK replaces the old one to improve future accuracy
- **rate_limiting:**
  - **max_attempts_per_email:** 5
  - **lockout_duration:** 15m
  - **max_attempts_per_ip:** 10
  - **ip_window:** 1m
- **fallback:**
  - **scanner_unavailable:** If palm scanner is not connected or busy, user falls back to password login
- **security:**
  - **template_encryption:** Palm templates must be encrypted at rest in the database
  - **feature_not_persisted:** Extracted features are used only for matching and never stored
  - **constant_time_match:** Template matching is performed by the SDK algorithm — timing is hardware-controlled
  - **audit_logging:** All enrollment and authentication attempts must be logged for security audit

## Outcomes

### Rate_limited (Priority: 1) — Error: `BIOMETRIC_RATE_LIMITED`

**Given:**
- `failed_biometric_attempts` (computed) gte `5`

**Then:**
- **emit_event** event: `biometric.login.rate_limited`

**Result:** Too many failed attempts — account locked for 15 minutes

### Scanner_unavailable (Priority: 2) — Error: `BIOMETRIC_SCANNER_UNAVAILABLE`

**Given:**
- Palm vein scanner is not connected or device is busy

**Then:**
- **emit_event** event: `biometric.scanner.unavailable`

**Result:** Scanner not available — please use password login instead

### No_palms_enrolled (Priority: 3) — Error: `BIOMETRIC_NOT_ENROLLED`

**Given:**
- `enrolled_palm_count` (db) eq `0`

**Then:**
- **emit_event** event: `biometric.login.no_enrollment`

**Result:** No palms enrolled — user must log in with password and enroll from account settings

### Biometric_login_success (Priority: 4) | Transaction: atomic

**Given:**
- `email` (input) exists
- `palm_feature` (system) exists
- Feature matches one of the user's enrolled templates

**Then:**
- **set_field** target: `failed_biometric_attempts` value: `0` — Reset attempt counter on success
- **set_field** target: `palm_template` value: `updated template from SDK match` — Auto-update template for improved future accuracy
- **emit_event** event: `biometric.login.success`

**Result:** Identity verified via palm vein — session created

### Biometric_login_failed (Priority: 5) — Error: `BIOMETRIC_AUTH_FAILED`

**Given:**
- `email` (input) exists
- `palm_feature` (system) exists
- Feature does not match any of the user's enrolled templates

**Then:**
- **set_field** target: `failed_biometric_attempts` value: `increment by 1`
- **emit_event** event: `biometric.login.failed`

**Result:** Palm vein does not match — please try again or use password login

### Enrollment_success (Priority: 6) | Transaction: atomic

**Given:**
- User is authenticated via password
- `enrolled_palm_count` (db) lt `2`
- `palm_label` (input) exists
- SDK registration completes successfully (4 images captured and fused)

**Then:**
- **create_record** target: `palm_enrollments` — Store encrypted palm template linked to user_id and palm_label
- **transition_state** field: `enrollment_status` from: `enrolling` to: `enrolled`
- **emit_event** event: `biometric.enrolled`

**Result:** Palm enrolled successfully — you can now use it to log in

### Enrollment_replaces_existing (Priority: 7) | Transaction: atomic

**Given:**
- User is authenticated via password
- `palm_label` (input) exists
- A template already exists for this hand
- SDK registration completes successfully

**Then:**
- **set_field** target: `palm_template` value: `new template from SDK registration` — Replace old template with newly registered one
- **emit_event** event: `biometric.re_enrolled`

**Result:** Palm re-enrolled — old template replaced with new one

### Enrollment_failed (Priority: 8) — Error: `BIOMETRIC_ENROLLMENT_FAILED`

**Given:**
- User is authenticated via password
- SDK registration fails (timeout, poor image quality, hand positioning)

**Then:**
- **transition_state** field: `enrollment_status` from: `enrolling` to: `failed`
- **emit_event** event: `biometric.enrollment_failed`

**Result:** Enrollment failed — please reposition your hand and try again

### Max_palms_reached (Priority: 9) — Error: `BIOMETRIC_MAX_PALMS`

**Given:**
- User is authenticated
- `enrolled_palm_count` (db) gte `2`
- User attempts to enroll another palm without removing one first

**Then:**
- **emit_event** event: `biometric.enrollment.max_reached`

**Result:** Maximum of 2 palms already enrolled — remove one before adding another

### Palm_removed (Priority: 10) | Transaction: atomic

**Given:**
- User is authenticated via password
- `palm_label` (input) exists
- A template exists for the selected hand

**Then:**
- **delete_record** target: `palm_enrollments` — Remove palm template from database
- **emit_event** event: `biometric.removed`

**Result:** Palm removed — if no palms remain, biometric login is disabled

### User_not_found (Priority: 11) — Error: `BIOMETRIC_AUTH_FAILED`

**Given:**
- `email` (input) exists
- `user_id` (db) not_exists

**Then:**
- **emit_event** event: `biometric.login.failed`

**Result:** Authentication failed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BIOMETRIC_AUTH_FAILED` | 401 | Biometric authentication failed | Yes |
| `BIOMETRIC_RATE_LIMITED` | 429 | Too many authentication attempts — please wait before trying again | Yes |
| `BIOMETRIC_SCANNER_UNAVAILABLE` | 500 | Palm vein scanner is not available — please use password login | No |
| `BIOMETRIC_NOT_ENROLLED` | 404 | No palm enrolled for this account — please enroll from account settings | No |
| `BIOMETRIC_ENROLLMENT_FAILED` | 422 | Palm enrollment failed — please reposition your hand and try again | Yes |
| `BIOMETRIC_MAX_PALMS` | 409 | Maximum of 2 palms already enrolled — remove one to add another | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `biometric.enrolled` | Palm vein template registered and stored for a user | `user_id`, `palm_label`, `timestamp` |
| `biometric.re_enrolled` | Existing palm template replaced with a new registration | `user_id`, `palm_label`, `timestamp` |
| `biometric.removed` | Palm vein template removed from user's account | `user_id`, `palm_label`, `timestamp` |
| `biometric.login.success` | User successfully authenticated via palm vein scan | `user_id`, `email`, `palm_label`, `ip_address`, `timestamp` |
| `biometric.login.failed` | Palm vein authentication failed — no match or user not found | `user_id`, `email`, `ip_address`, `timestamp` |
| `biometric.login.rate_limited` | Biometric auth blocked due to too many failed attempts | `email`, `ip_address` |
| `biometric.login.no_enrollment` | User attempted biometric login but has no enrolled palms | `user_id` |
| `biometric.enrollment_failed` | Palm enrollment failed due to SDK error | `user_id`, `palm_label`, `error_code` |
| `biometric.enrollment.max_reached` | User attempted to enroll a third palm but max is 2 | `user_id` |
| `biometric.scanner.unavailable` | Palm scanner is disconnected or busy when auth was attempted | `error_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | extends | Adds palm vein as an alternative authentication method to password |
| palm-vein | required | Requires the biometric scanner SDK integration for scanner operations |
| signup | recommended | Users may enroll palms during or after account creation |
| palm-pay | optional | Palm pay extends biometric auth to enable hands-free payment |
| terminal-enrollment | optional | At-terminal palm enrollment for payment terminal walk-up registration |

## AGI Readiness

### Goals

#### Reliable Biometric Auth

Palm vein biometric authentication — alternative to password login with enrollment of up to 2 palms per user

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `palm_vein` | palm-vein | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| rate_limited | `autonomous` | - | - |
| scanner_unavailable | `autonomous` | - | - |
| no_palms_enrolled | `autonomous` | - | - |
| biometric_login_success | `autonomous` | - | - |
| biometric_login_failed | `autonomous` | - | - |
| enrollment_success | `autonomous` | - | - |
| enrollment_replaces_existing | `autonomous` | - | - |
| enrollment_failed | `autonomous` | - | - |
| max_palms_reached | `autonomous` | - | - |
| palm_removed | `human_required` | - | - |
| user_not_found | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
login_form:
  layout: Add a 'Log in with palm vein' button below the password field
  scanner_feedback: Show real-time scanner status (waiting, scanning, matched, failed)
enrollment:
  location: Account settings page under 'Security' section
  show_enrolled: Display which palms are enrolled with option to remove
  guidance: Show hand positioning guide during enrollment (15-30cm from scanner)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Biometric Auth Blueprint",
  "description": "Palm vein biometric authentication — alternative to password login with enrollment of up to 2 palms per user. 8 fields. 11 outcomes. 6 error codes. rules: enrol",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "biometric, palm-vein, authentication, passwordless, enrollment"
}
</script>
