<!-- AUTO-GENERATED FROM pub-sub-messaging.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Pub Sub Messaging

> Real-time fire-and-forget message broadcasting with direct channel subscriptions and pattern-based subscriptions; sharded variant for cluster deployments

**Category:** Integration · **Version:** 1.0.0 · **Tags:** pub-sub · real-time-messaging · broadcast · pattern-matching · no-persistence

## What this does

Real-time fire-and-forget message broadcasting with direct channel subscriptions and pattern-based subscriptions; sharded variant for cluster deployments

Specifies 17 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **channel_name** *(text, required)* — Channel Name
- **pattern** *(text, optional)* — Pattern
- **message** *(text, optional)* — Message
- **subscriber_count** *(number, optional)* — Subscriber Count
- **pattern_subscriber_count** *(number, optional)* — Pattern Subscriber Count

## What must be true

- **general:** Messages are fire-and-forget (no persistence, no replay), Subscribers must be connected when message published to receive it, Offline subscribers miss all messages published while disconnected, No message ordering guarantee across multiple subscribers, Subscriber enters "subscription mode" and can only use subscription commands, Pattern subscriptions use glob matching (* = any, ? = single char, [abc] = set), Sharded pub/sub messages routed by slot (like hash sharding), Sharded pub/sub only reaches nodes owning the shard, Subscriber can have multiple channel and pattern subscriptions, Unsubscribe with empty list = unsubscribe from all

## Success & failure scenarios

**✅ Success paths**

- **Publish Message** — when PUBLISH channel message; channel exists; message exists, then client receives count of subscribers that received the message.
- **Publish No Subscribers** — when subscriber_count eq 0; pattern_subscriber_count eq 0, then message discarded; client receives 0.
- **Sharded Publish** — when SPUBLISH shard_channel message; shard_owned_by_this_node eq true, then count of subscribers on this shard that received message.
- **Subscribe To Channels** — when SUBSCRIBE channel [channel ...]; channels exists, then client enters subscription mode; receives subscription confirmation; starts receiving messages.
- **Subscribe Pattern** — when PSUBSCRIBE pattern [pattern ...]; patterns exists, then client enters subscription mode; receives pattern subscription confirmation.
- **Receive Message** — when message_published exists; subscriber_state eq "subscribed", then message delivered to subscriber in format [type, channel/pattern, message].
- **Receive Pattern Match** — when channel_matches_pattern eq true; pattern_subscribed eq true, then message delivered in format [ptype, pattern, channel, message].
- **Sharded Subscribe** — when SSUBSCRIBE shard_channel [shard_channel ...], then client enters subscription mode; receives shard channel confirmations.
- **Unsubscribe From Channels** — when UNSUBSCRIBE [channel ...]; channels exists, then receives unsubscription confirmations; client exits subscription mode if no subscriptions remain.
- **Unsubscribe From Patterns** — when PUNSUBSCRIBE [pattern ...]; patterns exists, then receives unsubscription confirmations; exits subscription mode if no subscriptions remain.
- **Exit Subscription Mode** — when remaining_subscriptions eq 0, then subscriber back in normal mode; can execute non-pub/sub commands.
- **Sharded Unsubscribe** — when SUNSUBSCRIBE [shard_channel ...], then unsubscription confirmations.
- **Ping While Subscribed** — when subscriber_state eq "subscribed"; PING [message], then [pong, message-or-nil].
- **Pubsub Channels** — when PUBSUB CHANNELS [pattern]; pattern exists, then array of active channel names (with subscribers).
- **Pubsub Numsub** — when PUBSUB NUMSUB channel [channel ...], then flattened array [channel1, count1, channel2, count2, ...].
- **Pubsub Numpat** — when PUBSUB NUMPAT, then total count of pattern subscriptions across all clients.

**❌ Failure paths**

- **Command In Subscription Mode** — when subscriber_state eq "subscribed"; command not_in ["SUBSCRIBE","PSUBSCRIBE","UNSUBSCRIBE","PUNSUBSCRIBE","PING","QUIT","HELLO","RESET"], then error returned; command not executed; subscription mode unchanged. *(error: `SUBSCRIPTION_MODE`)*

## Errors it can return

- `SUBSCRIPTION_MODE` — Only (P)SUBSCRIBE / (P)UNSUBSCRIBE / PING / QUIT allowed in this context
- `WRONG_TYPE` — Operation against a key holding the wrong kind of value

## Events

**`pubsub.message_published`**

**`pubsub.published_to_empty`**

**`pubsub.sharded_published`**

**`pubsub.subscribed`**

**`pubsub.pattern_subscribed`**

**`pubsub.message_received`**

**`pubsub.pattern_message_received`**

**`pubsub.sharded_subscribed`**

**`pubsub.unsubscribed`**

**`pubsub.pattern_unsubscribed`**

**`pubsub.mode_exited`**

**`pubsub.sharded_unsubscribed`**

**`pubsub.invalid_command`**

**`pubsub.pong`**

**`pubsub.channels_listed`**

**`pubsub.numsub_queried`**

**`pubsub.numpat_queried`**

## Connects to

- **stream-event-log** *(optional)* — Both deliver messages; Pub/Sub is ephemeral, Streams are persistent
- **message-queue** *(optional)* — Pub/Sub is broadcast (no ack), message queues have ack and guaranteed delivery

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `███░░` | 3/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T1` **flat-rules-to-categorized** — rules: flat array (10) → rules.general
- `T3` **auto-field-labels** — added labels to 5 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/pub-sub-messaging/) · **Spec source:** [`pub-sub-messaging.blueprint.yaml`](./pub-sub-messaging.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
