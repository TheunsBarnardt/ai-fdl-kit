<!-- AUTO-GENERATED FROM admin-panel.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Admin Panel

> Administrative dashboard for user management, account linking, notification broadcasting, and system configuration

**Category:** Access · **Version:** 1.0.0 · **Tags:** admin · user-management · account-linking · notification-broadcast · system-administration · wealth-management

## What this does

Administrative dashboard for user management, account linking, notification broadcasting, and system configuration

Specifies 14 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user_id** *(text, required)*
- **email** *(email, required)*
- **full_name** *(text, required)*
- **user_status** *(select, required)*
- **linked_accounts** *(json, optional)* — Linked Investment Accounts
- **assigned_roles** *(json, required)* — Assigned Roles
- **notification_target** *(select, required)* — Notification Target
- **notification_title** *(text, required)*
- **notification_body** *(rich_text, required)*
- **notification_channel** *(multiselect, required)* — Delivery Channels
- **target_product_id** *(text, optional)* — Target Product
- **target_user_id** *(text, optional)* — Target User

## What must be true

- **permissions:** Only super_admin and admin roles can access the admin panel, super_admin can manage all users including other admins, admin can manage regular users but cannot modify admin accounts, All admin actions must be audit-logged
- **user_management:** Cannot deactivate own account, Cannot remove own admin role, Suspended users cannot log in until reactivated, User search supports email, name, and account number
- **account_linking:** An investment account can be linked to exactly one user, Linking an account transfers all associated portfolios and holdings, Unlinking requires confirmation and creates an audit entry, Account data is fetched from CRM (Dynamics) for linking
- **notifications:** Broadcast notifications are queued and processed asynchronously, Product-specific notifications require a valid product ID, Notification history is retained for 90 days, Admin can preview notification before sending

## Success & failure scenarios

**✅ Success paths**

- **List Users** — when user.role in ["super_admin","admin"], then Return paginated list of users with status, roles, and linked accounts.
- **Search Users** — when search_query exists; user.role in ["super_admin","admin"], then Return filtered user list matching search query.
- **View User Detail** — when target_user_id exists; user.role in ["super_admin","admin"], then Return full user profile with linked accounts, roles, activity log.
- **Update User Status** — when target_user_id exists; user_status in ["active","suspended","deactivated"]; user.role in ["super_admin","admin"]; Cannot modify own status, then User status updated.
- **Link Account** — when target_user_id exists; account_id exists; Account not already linked to another user; user.role in ["super_admin","admin"], then Investment account linked to user.
- **Unlink Account** — when target_user_id exists; account_id exists; user.role in ["super_admin","admin"], then Investment account unlinked from user.
- **Send Notification All** — when notification_target eq "all_users"; notification_title exists; notification_body exists; user.role in ["super_admin","admin"], then Notification queued for delivery to all users.
- **Send Notification Single** — when notification_target eq "single_user"; target_user_id exists; notification_title exists; user.role in ["super_admin","admin"], then Notification sent to specific user.
- **Send Notification Product** — when notification_target eq "product_holders"; target_product_id exists; notification_title exists; user.role in ["super_admin","admin"], then Notification queued for all users holding the specified product.
- **Assign Role** — when target_user_id exists; role_id exists; user.role in ["super_admin","admin"], then Role assigned to user.
- **View System Stats** — when user.role in ["super_admin","admin"], then Return system statistics (total users, active sessions, recent signups, notifications sent).

**❌ Failure paths**

- **Unauthorized Access** — when user.role not_in ["super_admin","admin"], then Deny access to admin panel. *(error: `ADMIN_ACCESS_DENIED`)*
- **Self Modification Blocked** — when target_user_id eq "current_user_id"; action_type eq "deactivate" OR action_type eq "remove_admin_role", then Cannot deactivate own account or remove own admin role. *(error: `SELF_MODIFICATION_BLOCKED`)*
- **Account Already Linked** — when Account is already linked to a user, then Account is already linked to another user. *(error: `ACCOUNT_ALREADY_LINKED`)*

## Errors it can return

- `ADMIN_ACCESS_DENIED` — You do not have permission to access the admin panel
- `SELF_MODIFICATION_BLOCKED` — You cannot modify your own admin status
- `ACCOUNT_ALREADY_LINKED` — This account is already linked to another user
- `USER_NOT_FOUND` — The specified user was not found
- `ACCOUNT_NOT_FOUND` — The specified investment account was not found
- `INVALID_NOTIFICATION_TARGET` — Invalid notification target configuration
- `PRODUCT_NOT_FOUND` — The specified product was not found

## Connects to

- **role-based-access** *(required)* — Admin panel requires RBAC to determine admin vs super_admin capabilities
- **login** *(required)* — Admins must authenticate before accessing the panel
- **in-app-notifications** *(required)* — Notification broadcasting depends on the notification delivery system
- **email-notifications** *(recommended)* — Email is a key notification channel for admin broadcasts
- **push-notifications** *(recommended)* — Push notifications extend admin broadcast reach to mobile devices
- **audit-logging** *(required)* — All admin actions must be audit-logged for compliance
- **dataverse-client** *(recommended)* — Account data may be fetched from CRM for linking
- **notification-preferences** *(recommended)* — Respect user notification preferences when broadcasting

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/admin-panel/) · **Spec source:** [`admin-panel.blueprint.yaml`](./admin-panel.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
