<!-- AUTO-GENERATED FROM message-queue.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Message Queue

> Process asynchronous jobs and events through a provider-agnostic message queue supporting publish, subscribe, acknowledge, retry with backoff, and dead-letter queues

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** queue · messaging · async · events · jobs · pubsub

## What this does

Process asynchronous jobs and events through a provider-agnostic message queue supporting publish, subscribe, acknowledge, retry with backoff, and dead-letter queues

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **queue_name** *(text, required)* — Queue or topic name
- **message_id** *(text, optional)* — Unique message identifier assigned by the queue
- **payload** *(json, required)* — Message payload (serialized as JSON)
- **priority** *(number, optional)* — Message priority (higher value = higher priority)
- **delay_seconds** *(number, optional)* — Delay before message becomes visible to consumers
- **retry_count** *(number, optional)* — Number of times this message has been retried
- **max_retries** *(number, optional)* — Maximum retry attempts before dead-lettering
- **dead_letter_queue** *(text, optional)* — Dead-letter queue name for failed messages
- **visibility_timeout** *(number, optional)* — Seconds a message is hidden after being consumed (processing window)
- **group_id** *(text, optional)* — Message group for FIFO ordering guarantee
- **deduplication_id** *(text, optional)* — Deduplication ID for exactly-once within dedup window
- **processing_status** *(select, optional)* — Current message processing status

## What must be true

- **delivery:** At-least-once delivery guarantee by default; consumers must be idempotent, FIFO ordering available when group_id is set; messages in same group processed in order, Exactly-once delivery available with deduplication_id (5-minute dedup window)
- **message_size:** Maximum message payload size is 256KB, For larger payloads, store data in cloud storage and pass a reference in the message
- **retry:** Failed messages are retried with exponential backoff: delay = base_delay * 2^retry_count, Default max_retries is 3; configurable per queue, Messages exceeding max_retries are moved to the dead-letter queue, Dead-letter queue messages retain original payload and all retry metadata
- **visibility:** Visibility timeout must exceed expected processing time, If processing exceeds visibility timeout, message becomes visible to other consumers, Consumers must explicitly acknowledge (ack) successful processing, Negative acknowledgment (nack) returns message to queue immediately for retry
- **ordering:** Standard queues provide best-effort ordering (no strict guarantee), FIFO queues guarantee order within a message group_id, FIFO queues have lower throughput than standard queues

## Success & failure scenarios

**✅ Success paths**

- **Message Published** — when queue_name exists; payload exists; Queue exists and publisher has write permission, then Message accepted by queue; message_id returned for tracking.
- **Message Consumed** — when Consumer polls queue and message is available; visibility_timeout gt 0, then Message delivered to consumer; hidden from other consumers for visibility_timeout duration.
- **Message Acknowledged** — when processing_status eq "processing"; Consumer sends explicit acknowledgment, then Message permanently removed from queue; processing complete.
- **Message Retried** — when processing_status eq "processing"; Consumer sends negative acknowledgment or visibility timeout expires; retry_count lt "max_retries", then Message returned to queue with incremented retry count; exponential backoff delay applied.
- **Queue Empty** — when Consumer polls queue but no messages are available, then Empty response returned; consumer should back off with polling interval.
- **Duplicate Message** — when deduplication_id exists; Message with same deduplication_id published within dedup window, then Duplicate detected; message not re-queued; original message_id returned.

**❌ Failure paths**

- **Message Dead Lettered** — when retry_count gte "max_retries"; dead_letter_queue exists, then Message moved to dead-letter queue with full retry history for investigation. *(error: `DEAD_LETTER_QUEUE_FULL`)*
- **Message Too Large** — when Serialized payload exceeds 256KB, then Publish rejected; store large payloads externally and pass a reference. *(error: `MESSAGE_SIZE_EXCEEDED`)*
- **Queue Not Found** — when Specified queue_name does not exist, then Operation rejected; queue must be created before publishing or consuming. *(error: `QUEUE_NOT_FOUND`)*

## Errors it can return

- `MESSAGE_SIZE_EXCEEDED` — Message payload exceeds 256KB limit. Store large data externally and pass a reference.
- `QUEUE_NOT_FOUND` — Queue does not exist. Create the queue before publishing or consuming messages.
- `QUEUE_PERMISSION_DENIED` — Caller does not have permission to publish to or consume from this queue.
- `VISIBILITY_TIMEOUT_EXPIRED` — Message processing exceeded visibility timeout. Message returned to queue.
- `DEAD_LETTER_QUEUE_FULL` — Dead-letter queue has reached its retention limit. Investigate and drain failed messages.

## Events

**`queue.message_published`**
  Payload: `queue_name`, `message_id`, `priority`

**`queue.message_consumed`**
  Payload: `queue_name`, `message_id`, `consumer_id`

**`queue.message_acknowledged`**
  Payload: `queue_name`, `message_id`

**`queue.message_dead_lettered`**
  Payload: `queue_name`, `message_id`, `retry_count`, `dead_letter_queue`

**`queue.publish_failed`**
  Payload: `queue_name`, `error_code`, `error_reason`

## Connects to

- **webhook-ingestion** *(optional)* — Incoming webhooks can be queued for async processing
- **email-service** *(optional)* — Email sends can be queued for reliable delivery
- **cloud-storage** *(optional)* — Large message payloads stored in cloud storage with queue reference

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/message-queue/) · **Spec source:** [`message-queue.blueprint.yaml`](./message-queue.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
