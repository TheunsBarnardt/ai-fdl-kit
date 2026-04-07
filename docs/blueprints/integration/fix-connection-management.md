---
title: "Fix Connection Management Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Manages TCP connections for FIX protocol engines including server-side acceptors, client-side initiators, SSL/TLS encryption, automatic reconnection, and socket"
---

# Fix Connection Management Blueprint

> Manages TCP connections for FIX protocol engines including server-side acceptors, client-side initiators, SSL/TLS encryption, automatic reconnection, and socket configuration

| | |
|---|---|
| **Feature** | `fix-connection-management` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | fix-protocol, tcp, acceptor, initiator, ssl, reconnection, financial-messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/fix-connection-management.blueprint.yaml) |
| **JSON API** | [fix-connection-management.json]({{ site.baseurl }}/api/blueprints/integration/fix-connection-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `socket_acceptor` | Socket Acceptor | system | Server-side component that binds to a port and accepts incoming TCP connections from trading counterparties |
| `socket_initiator` | Socket Initiator | system | Client-side component that establishes outbound TCP connections to remote FIX servers |
| `ssl_layer` | SSL/TLS Layer | system | Optional TLS termination layer wrapping plain socket connections for encrypted FIX messaging |
| `application` | Application Layer | system | Business application that receives connection lifecycle events |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `connection_type` | select | Yes |  |  |
| `socket_accept_port` | number | No |  |  |
| `socket_connect_host` | text | No |  |  |
| `socket_connect_port` | number | No |  |  |
| `socket_connect_source_host` | text | No |  |  |
| `socket_connect_source_port` | number | No |  |  |
| `reconnect_interval` | number | No |  |  |
| `socket_nodelay` | boolean | No |  |  |
| `socket_send_buffer_size` | number | No |  |  |
| `socket_receive_buffer_size` | number | No |  |  |
| `socket_reuse_address` | boolean | No |  |  |
| `host_selection_policy` | select | No |  |  |
| `ssl_certificate` | text | No |  |  |
| `ssl_private_key` | text | No |  |  |
| `ssl_ca_certificate` | text | No |  |  |

## States

**State field:** `connection_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `stopped` | Yes |  |
| `pending` |  |  |
| `connected` |  |  |
| `disconnected` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `stopped` | `pending` | socket_initiator |  |
|  | `stopped` | `connected` | socket_acceptor |  |
|  | `pending` | `connected` | socket_initiator |  |
|  | `pending` | `disconnected` | socket_initiator |  |
|  | `connected` | `disconnected` | system |  |
|  | `disconnected` | `pending` | socket_initiator |  |

## Rules

- **acceptor_binding:** Acceptor binds to SocketAcceptPort and listens for incoming connections, Each accepted connection is mapped to a session based on SenderCompID/TargetCompID in the Logon message, SocketReuseAddress=Y allows the acceptor to restart without waiting for OS port release
- **initiator_reconnection:** On connection loss, initiator waits ReconnectInterval seconds before reattempting, Multiple target hosts can be configured (SocketConnectHost1, SocketConnectHost2, etc.) for failover, HostSelectionPolicy controls which host is tried first and how priority-based failover works
- **ssl_security:** SSL sessions use the same configuration as plain sessions but wrap the socket in TLS, Certificate and private key paths must be configured before starting, CA certificate path enables mutual TLS (mTLS) peer verification, SSL and non-SSL sessions cannot mix on the same port
- **socket_tuning:** TCP_NODELAY disables Nagle's algorithm for sub-millisecond message delivery; recommended for low-latency trading, Buffer sizes should be tuned based on expected message throughput; larger buffers reduce system calls
- **threading:** Each connection runs I/O on a dedicated thread pool; session callbacks are invoked from I/O threads, Applications sharing state across sessions must synchronize access or use SynchronizedApplication wrapper

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| reconnect_interval | 30s |  |
| connection_timeout | 10s |  |

## Outcomes

### Port_bind_failed (Priority: 1) — Error: `PORT_BIND_FAILED`

**Given:**
- acceptor is starting
- configured SocketAcceptPort is already in use

**Then:**
- **emit_event** event: `fix.connection.error`

**Result:** Acceptor startup fails with ConfigError; application is notified

### Ssl_handshake_failed (Priority: 2) — Error: `SSL_HANDSHAKE_FAILED`

**Given:**
- TCP connection established
- SSL/TLS is enabled
- certificate verification or cipher negotiation fails

**Then:**
- **transition_state** field: `connection_state` from: `pending` to: `disconnected`
- **emit_event** event: `fix.connection.error`

**Result:** Connection dropped; initiator will retry after reconnect interval

### Connection_refused (Priority: 3) — Error: `CONNECTION_REFUSED`

**Given:**
- initiator is attempting to connect
- target host refuses the connection or is unreachable

**Then:**
- **transition_state** field: `connection_state` from: `pending` to: `disconnected`
- **emit_event** event: `fix.connection.failed`

**Result:** Connection attempt fails; initiator waits ReconnectInterval before retrying

### Connection_lost (Priority: 4) — Error: `CONNECTION_LOST`

**Given:**
- session is in connected or logged_on state
- TCP socket receives error or zero-byte read (peer closed connection)

**Then:**
- **transition_state** field: `connection_state` from: `connected` to: `disconnected`
- **emit_event** event: `fix.connection.lost`

**Result:** Session is disconnected; initiator begins reconnect cycle

### Connection_established (Priority: 9)

**Given:**
- initiator completes TCP handshake OR acceptor accepts incoming connection
- SSL handshake succeeds (if SSL is enabled)

**Then:**
- **transition_state** field: `connection_state` from: `pending` to: `connected`
- **emit_event** event: `fix.connection.established`

**Result:** TCP connection ready; FIX session logon can begin

### Graceful_stop (Priority: 10)

**Given:**
- application calls stop() on acceptor or initiator

**Then:**
- **emit_event** event: `fix.connection.stopped`

**Result:** All sessions are logged out and sockets closed cleanly

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PORT_BIND_FAILED` | 500 | Failed to bind to configured port | No |
| `SSL_HANDSHAKE_FAILED` | 500 | SSL/TLS handshake failed | No |
| `CONNECTION_REFUSED` | 503 | Connection refused by remote host | No |
| `CONNECTION_LOST` | 503 | Connection lost unexpectedly | No |
| `CONFIG_ERROR` | 500 | Connection configuration is invalid | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fix.connection.established` | TCP connection (and optional TLS) successfully established | `remote_host`, `remote_port`, `session_id`, `is_ssl` |
| `fix.connection.lost` | Active connection dropped unexpectedly | `session_id`, `remote_host`, `error_detail` |
| `fix.connection.failed` | Outbound connection attempt failed | `remote_host`, `remote_port`, `error_detail` |
| `fix.connection.stopped` | Connection layer stopped cleanly | `connection_type` |
| `fix.connection.error` | Non-fatal connection-level error | `remote_host`, `error_detail` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fix-session-management | required | FIX sessions are established on top of connections managed here |
| fix-message-persistence | recommended | Message store maintains sequences across connection drops and recoveries |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C++
  framework: FIX Protocol Engine
  protocol: TCP/IP with optional TLS 1.2+
implementations:
  - SocketAcceptor: plain TCP server
  - SocketInitiator: plain TCP client
  - SSLSocketAcceptor: TLS server using OpenSSL
  - SSLSocketInitiator: TLS client using OpenSSL
  - ThreadedSocketAcceptor: multi-threaded variant for high-connection-count scenarios
  - ThreadedSocketInitiator: multi-threaded outbound variant
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fix Connection Management Blueprint",
  "description": "Manages TCP connections for FIX protocol engines including server-side acceptors, client-side initiators, SSL/TLS encryption, automatic reconnection, and socket",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix-protocol, tcp, acceptor, initiator, ssl, reconnection, financial-messaging"
}
</script>
