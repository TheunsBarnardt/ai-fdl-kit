<!-- AUTO-GENERATED FROM pub-sub-messaging.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Pub Sub Messaging

> Real-time fire-and-forget message broadcasting with direct channel subscriptions and pattern-based subscriptions; sharded variant for cluster deployments

**Category:** Integration · **Version:** 1.0.0 · **Tags:** pub-sub · real-time-messaging · broadcast · pattern-matching · no-persistence

## What this does

Real-time fire-and-forget message broadcasting with direct channel subscriptions and pattern-based subscriptions; sharded variant for cluster deployments

Specifies 17 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **channel_name** *(text, required)*
- **pattern** *(text, optional)*
- **message** *(text, optional)*
- **subscriber_count** *(number, optional)*
- **pattern_subscriber_count** *(number, optional)*

## What must be true

- **0:** Messages are fire-and-forget (no persistence, no replay)
- **1:** Subscribers must be connected when message published to receive it
- **2:** Offline subscribers miss all messages published while disconnected
- **3:** No message ordering guarantee across multiple subscribers
- **4:** Subscriber enters "subscription mode" and can only use subscription commands
- **5:** Pattern subscriptions use glob matching (* = any, ? = single char, [abc] = set)
- **6:** Sharded pub/sub messages routed by slot (like hash sharding)
- **7:** Sharded pub/sub only reaches nodes owning the shard
- **8:** Subscriber can have multiple channel and pattern subscriptions
- **9:** Unsubscribe with empty list = unsubscribe from all

## Success & failure scenarios

**✅ Success paths**

- **Publish Message** — when PUBLISH channel message; channel eq; message eq, then client receives count of subscribers that received the message.
- **Publish No Subscribers** — when subscriber_count eq 0; pattern_subscriber_count eq 0, then message discarded; client receives 0.
- **Sharded Publish** — when SPUBLISH shard_channel message; shard_owned_by_this_node eq true, then count of subscribers on this shard that received message.
- **Subscribe To Channels** — when SUBSCRIBE channel [channel ...]; channels eq, then client enters subscription mode; receives subscription confirmation; starts receiving messages.
- **Subscribe Pattern** — when PSUBSCRIBE pattern [pattern ...]; patterns eq, then client enters subscription mode; receives pattern subscription confirmation.
- **Receive Message** — when message published to subscribed channel; subscriber_state eq "subscribed", then message delivered to subscriber in format [type, channel/pattern, message].
- **Receive Pattern Match** — when channel_matches_pattern eq true; pattern_subscribed eq true, then message delivered in format [ptype, pattern, channel, message].
- **Sharded Subscribe** — when SSUBSCRIBE shard_channel [shard_channel ...], then client enters subscription mode; receives shard channel confirmations.
- **Unsubscribe From Channels** — when UNSUBSCRIBE [channel ...]; empty = unsubscribe from all channels, then receives unsubscription confirmations; client exits subscription mode if no subscriptions remain.
- **Unsubscribe From Patterns** — when PUNSUBSCRIBE [pattern ...]; patterns eq, then receives unsubscription confirmations; exits subscription mode if no subscriptions remain.
- **Exit Subscription Mode** — when remaining_subscriptions eq 0, then subscriber back in normal mode; can execute non-pub/sub commands.
- **Sharded Unsubscribe** — when SUNSUBSCRIBE [shard_channel ...], then unsubscription confirmations.
- **Ping While Subscribed** — when subscriber_state eq "subscribed"; PING [message], then [pong, message-or-nil].
- **Pubsub Channels** — when PUBSUB CHANNELS [pattern]; optional glob pattern filter, then array of active channel names (with subscribers).
- **Pubsub Numsub** — when PUBSUB NUMSUB channel [channel ...], then flattened array [channel1, count1, channel2, count2, ...].
- **Pubsub Numpat** — when PUBSUB NUMPAT, then total count of pattern subscriptions across all clients.

**❌ Failure paths**

- **Command In Subscription Mode** — when subscriber_state eq "subscribed"; command not_in ["SUBSCRIBE","PSUBSCRIBE","UNSUBSCRIBE","PUNSUBSCRIBE","PING","QUIT","HELLO","RESET"], then error returned; command not executed; subscription mode unchanged. *(error: `SUBSCRIPTION_MODE`)*

## Errors it can return

- `SUBSCRIPTION_MODE` — only (P)SUBSCRIBE / (P)UNSUBSCRIBE / PING / QUIT allowed in this context
- `WRONG_TYPE` — WRONGTYPE Operation against a key holding the wrong kind of value

## Connects to

- **stream-event-log** *(optional)* — Both deliver messages; Pub/Sub is ephemeral, Streams are persistent
- **message-queue** *(optional)* — Pub/Sub is broadcast (no ack), message queues have ack and guaranteed delivery

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/pub-sub-messaging/) · **Spec source:** [`pub-sub-messaging.blueprint.yaml`](./pub-sub-messaging.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
