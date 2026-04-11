<!-- AUTO-GENERATED FROM fix-session-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fix Session Management

> Manages stateful FIX protocol sessions including logon/logout lifecycle, heartbeat monitoring, sequence number integrity, and time-window enforcement

**Category:** Trading · **Version:** 1.0.0 · **Tags:** fix-protocol · session · heartbeat · sequence-numbers · financial-messaging

## What this does

Manages stateful FIX protocol sessions including logon/logout lifecycle, heartbeat monitoring, sequence number integrity, and time-window enforcement

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **sender_comp_id** *(text, required)* — Sender Comp Id
- **target_comp_id** *(text, required)* — Target Comp Id
- **begin_string** *(select, required)* — Begin String
- **session_qualifier** *(text, optional)* — Session Qualifier
- **heartbeat_interval** *(number, required)* — Heartbeat Interval
- **logon_timeout** *(number, optional)* — Logon Timeout
- **logout_timeout** *(number, optional)* — Logout Timeout
- **next_sender_seq_num** *(number, optional)* — Next Sender Seq Num
- **next_target_seq_num** *(number, optional)* — Next Target Seq Num
- **reset_seq_num_flag** *(boolean, optional)* — Reset Seq Num Flag
- **default_appl_ver_id** *(text, optional)* — Default Appl Ver Id

## What must be true

- **session_identity:** Both SenderCompID and TargetCompID must match configured session identity on every received message, A SessionQualifier can be added to distinguish parallel sessions between the same counterparties
- **sequence_numbers:** All messages are numbered sequentially starting at 1; gaps trigger a ResendRequest, Out-of-sequence messages are queued until a Resend fills the gap, ResetSeqNumFlag=Y in a Logon message causes both parties to reset to sequence number 1, Application may manually set next sender or target sequence number before logon
- **heartbeat:** Heartbeat messages are sent at the configured interval when no other messages are sent, If no message is received within heartbeat_interval seconds, a TestRequest is sent, If no response to TestRequest arrives within heartbeat_interval, the session disconnects, Heartbeat interval is negotiated during Logon (sent by initiator, may be overridden by acceptor)
- **logon_time_window:** Sessions can be restricted to a time window (e.g., market hours) via StartTime/EndTime, A session received outside its valid logon window is immediately disconnected, NonStopSession=Y disables time-window enforcement for 24/7 operation
- **session_recovery → ResetOnLogon:** reset sequence numbers each time a logon occurs
- **session_recovery → ResetOnLogout:** reset when a logout is processed
- **session_recovery → ResetOnDisconnect:** reset whenever the TCP connection drops

## Success & failure scenarios

**✅ Success paths**

- **Logon Successful** — when session is enabled; current time is within logon time window; Logon message contains valid SenderCompID and TargetCompID; application does not throw RejectLogon, then Session is fully established; application receives onLogon callback.
- **Logout Successful** — when Logout message received or application calls logout(); session is in logged_on state, then Session cleanly terminated; application receives onLogout callback.

**❌ Failure paths**

- **Session Disabled** — when session enabled flag is false, then Logon request is ignored; disconnect is triggered. *(error: `SESSION_DISABLED`)*
- **Logon Outside Time Window** — when logon is received; current time is outside configured logon time window, then Connection is immediately terminated. *(error: `LOGON_OUTSIDE_TIME_WINDOW`)*
- **Logon Rejected By Application** — when logon is received; application throws RejectLogon exception in fromAdmin callback, then Logout message sent, then disconnected. *(error: `LOGON_REJECTED`)*
- **Comp Id Mismatch** — when message received; SenderCompID or TargetCompID does not match configured session values, then Message rejected with SessionReject; may force logout. *(error: `COMP_ID_MISMATCH`)*
- **Logon Timeout Elapsed** — when logon request was sent; no logon response received within logon_timeout seconds, then Session disconnected; initiator will attempt reconnect after interval. *(error: `LOGON_TIMEOUT`)*
- **Heartbeat Timeout** — when session is in logged_on state; no message received for heartbeat_interval seconds; TestRequest was sent but no response after heartbeat_interval more seconds, then Session terminated due to heartbeat timeout. *(error: `HEARTBEAT_TIMEOUT`)*
- **Sequence Gap Detected** — when message received with sequence number higher than expected, then ResendRequest sent for the missing range; message queued until gap filled. *(error: `SEQUENCE_GAP`)*

## Business flows

**Logon Flow** — FIX session establishment between initiator and acceptor

1. **Send Logon message with HeartBtInt, EncryptMethod, and optional ResetSeqNumFlag** *(initiator)*
1. **Validate SenderCompID/TargetCompID, check logon time window, call application.fromAdmin()** *(acceptor)*
1. **Send Logon response (same HeartBtInt)** *(acceptor)*
1. **Receive Logon response; call application.onLogon(); session is now active** *(initiator)*
1. **Call application.onLogon(); session is now active** *(acceptor)*

**Heartbeat Flow** — Keepalive mechanism to detect dead connections

1. **Track time since last sent/received message** *(system)*
1. **Send Heartbeat if heartbeat_interval elapsed since last outgoing message** *(system)*
1. **If heartbeat_interval elapsed since last incoming message, send TestRequest** *(system)*
1. **If TestRequest response not received within heartbeat_interval, disconnect** *(system)*

## Errors it can return

- `SESSION_DISABLED` — Session is not enabled for logon
- `LOGON_OUTSIDE_TIME_WINDOW` — Received logon outside of valid logon time
- `LOGON_REJECTED` — Logon rejected by application
- `COMP_ID_MISMATCH` — SenderCompID/TargetCompID mismatch
- `LOGON_TIMEOUT` — Timed out waiting for logon response
- `HEARTBEAT_TIMEOUT` — Timed out waiting for heartbeat
- `SEQUENCE_GAP` — Message sequence gap detected

## Connects to

- **fix-message-building** *(required)* — Session sends and receives FIX messages structured by the message-building feature
- **fix-connection-management** *(required)* — Session requires an active TCP connection managed by the connection layer
- **fix-message-persistence** *(required)* — All sent and received messages are persisted for sequence number recovery
- **fix-protocol-validation** *(recommended)* — Incoming messages are validated against a DataDictionary before delivery

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 11 fields
- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/fix-session-management/) · **Spec source:** [`fix-session-management.blueprint.yaml`](./fix-session-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
