<!-- AUTO-GENERATED FROM mobile-push-notifications.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Mobile Push Notifications

> Delivery of real-time alert payloads to registered mobile devices via a push proxy service, with per-device session targeting, JWT signing for security, and content-level controls from minimal...

**Category:** Notification · **Version:** 1.0.0 · **Tags:** push · mobile · apns · fcm · proxy · device · jwt · notifications

## What this does

Delivery of real-time alert payloads to registered mobile devices via a push proxy service, with per-device session targeting, JWT signing for security, and content-level controls from minimal...

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **device_id** *(text, required)* — Unique identifier for the registered mobile device
- **platform** *(select, required)* — Mobile operating system platform
- **ack_id** *(token, required)* — Per-delivery unique identifier for acknowledgement tracking
- **notification_type** *(select, required)* — Category of notification payload
- **message** *(text, optional)* — Notification body text; may be omitted in ID-loaded or generic modes
- **badge** *(number, optional)* — Unread message count to display on the app badge
- **channel_id** *(hidden, optional)* — Channel where the triggering message was posted
- **sender_name** *(text, optional)* — Display name of the message author
- **content_level** *(select, required)* — How much message content to include in the payload
- **signature** *(token, required)* — ES256 JWT signature covering the ack_id and device_id to prevent spoofing

## What must be true

- **rule_01:** Push notifications are delivered independently to each active mobile session for the recipient user; each session receives its own uniquely signed payload with a distinct ack_id.
- **rule_02:** Notifications are suppressed entirely when the user's status is DND (Do Not Disturb); this check takes priority over all other preferences.
- **rule_03:** Push is also suppressed when the user is currently active in the same channel where the triggering message was posted (unless the notify-active-channel setting overrides this).
- **rule_04:** The id_loaded content level sends only the channel ID and post ID; the device fetches the full message content after receiving the notification, protecting content from being stored in push infrastructure.
- **rule_05:** Direct messages and group messages use "all" push logic regardless of the user's global push preference of "mention", because every DM is implicitly a personal communication.
- **rule_06:** Muted channels (mark_unread = mention) suppress push notifications for non-mention messages.
- **rule_07:** Each notification payload is signed with the server's asymmetric key using ES256; the push proxy validates the signature before forwarding to APNS or FCM.
- **rule_08:** When the push proxy responds with "remove", the device's push token is considered stale and the session is flagged for cleanup.
- **rule_09:** Plugin hooks can intercept, modify, or cancel push notifications before delivery.
- **rule_10:** Bots do not receive push notifications.

## Success & failure scenarios

**✅ Success paths**

- **Push Suppressed Dnd** — when notification would be delivered; user's status is dnd, then Notification not delivered; reason recorded as user_status.
- **Push Suppressed Active Channel** — when notification would be delivered; user is actively viewing the channel where the message was posted, then Notification not delivered; user is already aware of the message.
- **Push Suppressed Muted Channel** — when notification would be delivered; channel is muted for the recipient (mark_unread = mention); message does not directly mention the user, then Notification not delivered; channel is muted.
- **Push Device Stale** — when notification sent to push proxy; push proxy returns 'remove' response for a device, then Stale device registration removed; future notifications skip this device.
- **Push Proxy Error** — when push proxy returns an error response, then Delivery failure logged; no retry (stateless delivery model).
- **Push Delivered** — when message triggers a notification for the recipient; recipient has at least one active mobile session with a registered device; user's push preference permits the notification type (all or mention when mentioned); user is not in DND status; user is not active in the triggering channel (or notify-when-active is set); no plugin hook rejected the notification, then Signed payload delivered to push proxy; proxy forwards to APNS or FCM.

## Errors it can return

- `PUSH_PROXY_ERROR` — Push notification could not be delivered. Please check your connection.
- `PUSH_NOT_ENABLED` — Mobile push notifications are not configured on this server.
- `PUSH_NOT_LICENSED` — Mobile push notifications require an active license for the hosted proxy service.

## Events

**`push.notification_sent`** — Push notification payload dispatched to the proxy service
  Payload: `user_id`, `device_id`, `ack_id`, `platform`, `channel_id`, `post_id`, `timestamp`

**`push.notification_suppressed`** — Push notification eligible but suppressed for a documented reason
  Payload: `user_id`, `reason`, `channel_id`, `post_id`, `timestamp`

**`push.delivery_failed`** — Push proxy reported a delivery error
  Payload: `user_id`, `device_id`, `error_reason`, `timestamp`

**`push.device_removed`** — Device registration removed because push proxy reported stale token
  Payload: `user_id`, `device_id`, `timestamp`

## Connects to

- **notification-preferences-dnd** *(required)* — User preferences and DND status are checked before every push delivery
- **session-management-revocation** *(required)* — Mobile sessions carry device IDs; session revocation removes device registrations
- **email-notifications** *(recommended)* — Email and push share notification trigger logic; the two complement each other

## Quality fitness 🟡 71/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/mobile-push-notifications/) · **Spec source:** [`mobile-push-notifications.blueprint.yaml`](./mobile-push-notifications.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
