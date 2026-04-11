---
title: "Message Queue Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Process asynchronous jobs and events through a provider-agnostic message queue supporting publish, subscribe, acknowledge, retry with backoff, and dead-letter q"
---

# Message Queue Blueprint

> Process asynchronous jobs and events through a provider-agnostic message queue supporting publish, subscribe, acknowledge, retry with backoff, and dead-letter queues

| | |
|---|---|
| **Feature** | `message-queue` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | queue, messaging, async, events, jobs, pubsub |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/message-queue.blueprint.yaml) |
| **JSON API** | [message-queue.json]({{ site.baseurl }}/api/blueprints/infrastructure/message-queue.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `queue_name` | text | Yes | Queue or topic name | Validations: pattern |
| `message_id` | text | No | Unique message identifier assigned by the queue |  |
| `payload` | json | Yes | Message payload (serialized as JSON) |  |
| `priority` | number | No | Message priority (higher value = higher priority) | Validations: min, max |
| `delay_seconds` | number | No | Delay before message becomes visible to consumers | Validations: min, max |
| `retry_count` | number | No | Number of times this message has been retried |  |
| `max_retries` | number | No | Maximum retry attempts before dead-lettering | Validations: min, max |
| `dead_letter_queue` | text | No | Dead-letter queue name for failed messages |  |
| `visibility_timeout` | number | No | Seconds a message is hidden after being consumed (processing window) | Validations: min, max |
| `group_id` | text | No | Message group for FIFO ordering guarantee |  |
| `deduplication_id` | text | No | Deduplication ID for exactly-once within dedup window |  |
| `processing_status` | select | No | Current message processing status |  |

## Rules

- **delivery:** At-least-once delivery guarantee by default; consumers must be idempotent, FIFO ordering available when group_id is set; messages in same group processed in order, Exactly-once delivery available with deduplication_id (5-minute dedup window)
- **message_size:** Maximum message payload size is 256KB, For larger payloads, store data in cloud storage and pass a reference in the message
- **retry:** Failed messages are retried with exponential backoff: delay = base_delay * 2^retry_count, Default max_retries is 3; configurable per queue, Messages exceeding max_retries are moved to the dead-letter queue, Dead-letter queue messages retain original payload and all retry metadata
- **visibility:** Visibility timeout must exceed expected processing time, If processing exceeds visibility timeout, message becomes visible to other consumers, Consumers must explicitly acknowledge (ack) successful processing, Negative acknowledgment (nack) returns message to queue immediately for retry
- **ordering:** Standard queues provide best-effort ordering (no strict guarantee), FIFO queues guarantee order within a message group_id, FIFO queues have lower throughput than standard queues

## Outcomes

### Message_published (Priority: 1)

**Given:**
- `queue_name` (input) exists
- `payload` (input) exists
- Queue exists and publisher has write permission

**Then:**
- **create_record**
- **emit_event** event: `queue.message_published`

**Result:** Message accepted by queue; message_id returned for tracking

### Message_consumed (Priority: 2)

**Given:**
- Consumer polls queue and message is available
- `visibility_timeout` (input) gt `0`

**Then:**
- **set_field** target: `processing_status` value: `processing`
- **emit_event** event: `queue.message_consumed`

**Result:** Message delivered to consumer; hidden from other consumers for visibility_timeout duration

### Message_acknowledged (Priority: 3)

**Given:**
- `processing_status` (db) eq `processing`
- Consumer sends explicit acknowledgment

**Then:**
- **set_field** target: `processing_status` value: `completed`
- **delete_record**

**Result:** Message permanently removed from queue; processing complete

### Message_retried (Priority: 4)

**Given:**
- `processing_status` (db) eq `processing`
- Consumer sends negative acknowledgment or visibility timeout expires
- `retry_count` (db) lt `max_retries`

**Then:**
- **set_field** target: `retry_count` value: `retry_count + 1`
- **set_field** target: `processing_status` value: `pending`

**Result:** Message returned to queue with incremented retry count; exponential backoff delay applied

### Message_dead_lettered (Priority: 5) — Error: `DEAD_LETTER_QUEUE_FULL`

**Given:**
- `retry_count` (db) gte `max_retries`
- `dead_letter_queue` (db) exists

**Then:**
- **set_field** target: `processing_status` value: `dead_lettered`
- **emit_event** event: `queue.message_dead_lettered`

**Result:** Message moved to dead-letter queue with full retry history for investigation

### Queue_empty (Priority: 6)

**Given:**
- Consumer polls queue but no messages are available

**Result:** Empty response returned; consumer should back off with polling interval

### Message_too_large (Priority: 7) — Error: `MESSAGE_SIZE_EXCEEDED`

**Given:**
- Serialized payload exceeds 256KB

**Then:**
- **emit_event** event: `queue.publish_failed`

**Result:** Publish rejected; store large payloads externally and pass a reference

### Queue_not_found (Priority: 8) — Error: `QUEUE_NOT_FOUND`

**Given:**
- Specified queue_name does not exist

**Result:** Operation rejected; queue must be created before publishing or consuming

### Duplicate_message (Priority: 9)

**Given:**
- `deduplication_id` (input) exists
- Message with same deduplication_id published within dedup window

**Result:** Duplicate detected; message not re-queued; original message_id returned

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MESSAGE_SIZE_EXCEEDED` | 413 | Message payload exceeds 256KB limit. Store large data externally and pass a reference. | No |
| `QUEUE_NOT_FOUND` | 404 | Queue does not exist. Create the queue before publishing or consuming messages. | No |
| `QUEUE_PERMISSION_DENIED` | 403 | Caller does not have permission to publish to or consume from this queue. | No |
| `VISIBILITY_TIMEOUT_EXPIRED` | 400 | Message processing exceeded visibility timeout. Message returned to queue. | No |
| `DEAD_LETTER_QUEUE_FULL` | 500 | Dead-letter queue has reached its retention limit. Investigate and drain failed messages. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `queue.message_published` |  | `queue_name`, `message_id`, `priority` |
| `queue.message_consumed` |  | `queue_name`, `message_id`, `consumer_id` |
| `queue.message_acknowledged` |  | `queue_name`, `message_id` |
| `queue.message_dead_lettered` |  | `queue_name`, `message_id`, `retry_count`, `dead_letter_queue` |
| `queue.publish_failed` |  | `queue_name`, `error_code`, `error_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| webhook-ingestion | optional | Incoming webhooks can be queued for async processing |
| email-service | optional | Email sends can be queued for reliable delivery |
| cloud-storage | optional | Large message payloads stored in cloud storage with queue reference |

## AGI Readiness

### Goals

#### Reliable Message Queue

Process asynchronous jobs and events through a provider-agnostic message queue supporting publish, subscribe, acknowledge, retry with backoff, and dead-letter queues

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| availability | cost | infrastructure downtime impacts all dependent services |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| message_published | `autonomous` | - | - |
| message_consumed | `autonomous` | - | - |
| message_acknowledged | `autonomous` | - | - |
| message_retried | `autonomous` | - | - |
| message_dead_lettered | `autonomous` | - | - |
| queue_empty | `autonomous` | - | - |
| message_too_large | `autonomous` | - | - |
| queue_not_found | `autonomous` | - | - |
| duplicate_message | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Message Queue Blueprint",
  "description": "Process asynchronous jobs and events through a provider-agnostic message queue supporting publish, subscribe, acknowledge, retry with backoff, and dead-letter q",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "queue, messaging, async, events, jobs, pubsub"
}
</script>
