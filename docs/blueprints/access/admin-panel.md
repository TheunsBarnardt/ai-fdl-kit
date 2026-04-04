---
title: "Admin Panel Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Administrative dashboard for user management, account linking, notification broadcasting, and system configuration. 12 fields. 14 outcomes. 7 error codes. rules"
---

# Admin Panel Blueprint

> Administrative dashboard for user management, account linking, notification broadcasting, and system configuration

| | |
|---|---|
| **Feature** | `admin-panel` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | admin, user-management, account-linking, notification-broadcast, system-administration, wealth-management |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/access/admin-panel.blueprint.yaml) |
| **JSON API** | [admin-panel.json]({{ site.baseurl }}/api/blueprints/access/admin-panel.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `super_admin` | Super Administrator | human | Full system access, manages all users and accounts |
| `admin` | Administrator | human | Manages users, links accounts, sends notifications |
| `system` | System | system | Automated processes and scheduled tasks |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | text | Yes |  | Validations: required |
| `email` | email | Yes |  | Validations: required, email |
| `full_name` | text | Yes |  | Validations: required |
| `user_status` | select | Yes |  |  |
| `linked_accounts` | json | No | Linked Investment Accounts |  |
| `assigned_roles` | json | Yes | Assigned Roles |  |
| `notification_target` | select | Yes | Notification Target |  |
| `notification_title` | text | Yes |  | Validations: required, maxLength |
| `notification_body` | rich_text | Yes |  | Validations: required |
| `notification_channel` | multiselect | Yes | Delivery Channels |  |
| `target_product_id` | text | No | Target Product |  |
| `target_user_id` | text | No | Target User |  |

## Rules

- **permissions:** Only super_admin and admin roles can access the admin panel, super_admin can manage all users including other admins, admin can manage regular users but cannot modify admin accounts, All admin actions must be audit-logged
- **user_management:** Cannot deactivate own account, Cannot remove own admin role, Suspended users cannot log in until reactivated, User search supports email, name, and account number
- **account_linking:** An investment account can be linked to exactly one user, Linking an account transfers all associated portfolios and holdings, Unlinking requires confirmation and creates an audit entry, Account data is fetched from CRM (Dynamics) for linking
- **notifications:** Broadcast notifications are queued and processed asynchronously, Product-specific notifications require a valid product ID, Notification history is retained for 90 days, Admin can preview notification before sending

## Outcomes

### Unauthorized_access (Priority: 1) — Error: `ADMIN_ACCESS_DENIED`

**Given:**
- `user.role` (session) not_in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.access_denied`

**Result:** Deny access to admin panel

### Self_modification_blocked (Priority: 2) — Error: `SELF_MODIFICATION_BLOCKED`

**Given:**
- `target_user_id` (input) eq `current_user_id`
- ANY: `action_type` (input) eq `deactivate` OR `action_type` (input) eq `remove_admin_role`

**Result:** Cannot deactivate own account or remove own admin role

### Account_already_linked (Priority: 3) — Error: `ACCOUNT_ALREADY_LINKED`

**Given:**
- `account_id` (db) exists

**Result:** Account is already linked to another user

### List_users (Priority: 10)

**Given:**
- `user.role` (session) in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.users_listed`

**Result:** Return paginated list of users with status, roles, and linked accounts

### Search_users (Priority: 11)

**Given:**
- `search_query` (input) exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.users_searched`

**Result:** Return filtered user list matching search query

### View_user_detail (Priority: 12)

**Given:**
- `target_user_id` (input) exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.user_viewed`

**Result:** Return full user profile with linked accounts, roles, activity log

### Update_user_status (Priority: 20)

**Given:**
- `target_user_id` (input) exists
- `user_status` (input) in `active,suspended,deactivated`
- `user.role` (session) in `super_admin,admin`
- `target_user_id` (input) neq `current_user_id`

**Then:**
- **set_field** target: `user_status` value: `from_input`
- **emit_event** event: `admin.user_status_changed`

**Result:** User status updated

### Link_account (Priority: 30)

**Given:**
- `target_user_id` (input) exists
- `account_id` (input) exists
- `account_id` (db) not_exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **create_record** target: `linked_accounts`
- **emit_event** event: `admin.account_linked`

**Result:** Investment account linked to user

### Unlink_account (Priority: 31)

**Given:**
- `target_user_id` (input) exists
- `account_id` (input) exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **delete_record** target: `linked_accounts`
- **emit_event** event: `admin.account_unlinked`

**Result:** Investment account unlinked from user

### Send_notification_all (Priority: 40)

**Given:**
- `notification_target` (input) eq `all_users`
- `notification_title` (input) exists
- `notification_body` (input) exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.notification_broadcast`

**Result:** Notification queued for delivery to all users

### Send_notification_single (Priority: 41)

**Given:**
- `notification_target` (input) eq `single_user`
- `target_user_id` (input) exists
- `notification_title` (input) exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.notification_sent`

**Result:** Notification sent to specific user

### Send_notification_product (Priority: 42)

**Given:**
- `notification_target` (input) eq `product_holders`
- `target_product_id` (input) exists
- `notification_title` (input) exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.notification_product_broadcast`

**Result:** Notification queued for all users holding the specified product

### Assign_role (Priority: 50)

**Given:**
- `target_user_id` (input) exists
- `role_id` (input) exists
- `user.role` (session) in `super_admin,admin`

**Then:**
- **create_record** target: `assigned_roles`
- **emit_event** event: `admin.role_assigned`

**Result:** Role assigned to user

### View_system_stats (Priority: 60)

**Given:**
- `user.role` (session) in `super_admin,admin`

**Then:**
- **emit_event** event: `admin.stats_viewed`

**Result:** Return system statistics (total users, active sessions, recent signups, notifications sent)

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ADMIN_ACCESS_DENIED` | 403 | You do not have permission to access the admin panel | No |
| `SELF_MODIFICATION_BLOCKED` | 403 | You cannot modify your own admin status | No |
| `ACCOUNT_ALREADY_LINKED` | 409 | This account is already linked to another user | No |
| `USER_NOT_FOUND` | 404 | The specified user was not found | No |
| `ACCOUNT_NOT_FOUND` | 404 | The specified investment account was not found | No |
| `INVALID_NOTIFICATION_TARGET` | 400 | Invalid notification target configuration | No |
| `PRODUCT_NOT_FOUND` | 404 | The specified product was not found | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `admin.access_denied` | Unauthorized access attempt to admin panel | `user_id`, `attempted_action`, `ip_address`, `timestamp` |
| `admin.users_listed` | Admin viewed user list | `admin_user_id`, `filters`, `timestamp` |
| `admin.users_searched` | Admin searched for users | `admin_user_id`, `search_query`, `result_count`, `timestamp` |
| `admin.user_viewed` | Admin viewed user detail | `admin_user_id`, `target_user_id`, `timestamp` |
| `admin.user_status_changed` | Admin changed a user status | `admin_user_id`, `target_user_id`, `old_status`, `new_status`, `timestamp` |
| `admin.account_linked` | Investment account linked to user | `admin_user_id`, `target_user_id`, `account_id`, `timestamp` |
| `admin.account_unlinked` | Investment account unlinked from user | `admin_user_id`, `target_user_id`, `account_id`, `timestamp` |
| `admin.notification_broadcast` | Notification broadcast to all users | `admin_user_id`, `notification_target`, `channel`, `user_count`, `timestamp` |
| `admin.notification_sent` | Notification sent to single user | `admin_user_id`, `target_user_id`, `channel`, `timestamp` |
| `admin.notification_product_broadcast` | Notification sent to product holders | `admin_user_id`, `target_product_id`, `channel`, `user_count`, `timestamp` |
| `admin.role_assigned` | Role assigned to user by admin | `admin_user_id`, `target_user_id`, `role_id`, `timestamp` |
| `admin.stats_viewed` | Admin viewed system statistics | `admin_user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| role-based-access | required | Admin panel requires RBAC to determine admin vs super_admin capabilities |
| login | required | Admins must authenticate before accessing the panel |
| in-app-notifications | required | Notification broadcasting depends on the notification delivery system |
| email-notifications | recommended | Email is a key notification channel for admin broadcasts |
| push-notifications | recommended | Push notifications extend admin broadcast reach to mobile devices |
| audit-logging | required | All admin actions must be audit-logged for compliance |
| dataverse-client | recommended | Account data may be fetched from CRM for linking |
| notification-preferences | recommended | Respect user notification preferences when broadcasting |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: sidebar_with_content
primary_nav:
  - label: Dashboard
    icon: layout-dashboard
  - label: Users
    icon: users
  - label: Accounts
    icon: link
  - label: Notifications
    icon: bell
  - label: System
    icon: settings
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Admin Panel Blueprint",
  "description": "Administrative dashboard for user management, account linking, notification broadcasting, and system configuration. 12 fields. 14 outcomes. 7 error codes. rules",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "admin, user-management, account-linking, notification-broadcast, system-administration, wealth-management"
}
</script>
