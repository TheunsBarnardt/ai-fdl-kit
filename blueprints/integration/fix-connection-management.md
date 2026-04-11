<!-- AUTO-GENERATED FROM fix-connection-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fix Connection Management

> Manages TCP connections for FIX protocol engines including server-side acceptors, client-side initiators, SSL/TLS encryption, automatic reconnection, and socket configuration

**Category:** Integration · **Version:** 1.0.0 · **Tags:** fix-protocol · tcp · acceptor · initiator · ssl · reconnection · financial-messaging

## What this does

Manages TCP connections for FIX protocol engines including server-side acceptors, client-side initiators, SSL/TLS encryption, automatic reconnection, and socket configuration

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **connection_type** *(select, required)* — Connection Type
- **socket_accept_port** *(number, optional)* — Socket Accept Port
- **socket_connect_host** *(text, optional)* — Socket Connect Host
- **socket_connect_port** *(number, optional)* — Socket Connect Port
- **socket_connect_source_host** *(text, optional)* — Socket Connect Source Host
- **socket_connect_source_port** *(number, optional)* — Socket Connect Source Port
- **reconnect_interval** *(number, optional)* — Reconnect Interval
- **socket_nodelay** *(boolean, optional)* — Socket Nodelay
- **socket_send_buffer_size** *(number, optional)* — Socket Send Buffer Size
- **socket_receive_buffer_size** *(number, optional)* — Socket Receive Buffer Size
- **socket_reuse_address** *(boolean, optional)* — Socket Reuse Address
- **host_selection_policy** *(select, optional)* — Host Selection Policy
- **ssl_certificate** *(text, optional)* — Ssl Certificate
- **ssl_private_key** *(text, optional)* — Ssl Private Key
- **ssl_ca_certificate** *(text, optional)* — Ssl Ca Certificate

## What must be true

- **acceptor_binding:** Acceptor binds to SocketAcceptPort and listens for incoming connections, Each accepted connection is mapped to a session based on SenderCompID/TargetCompID in the Logon message, SocketReuseAddress=Y allows the acceptor to restart without waiting for OS port release
- **initiator_reconnection:** On connection loss, initiator waits ReconnectInterval seconds before reattempting, Multiple target hosts can be configured (SocketConnectHost1, SocketConnectHost2, etc.) for failover, HostSelectionPolicy controls which host is tried first and how priority-based failover works
- **ssl_security:** SSL sessions use the same configuration as plain sessions but wrap the socket in TLS, Certificate and private key paths must be configured before starting, CA certificate path enables mutual TLS (mTLS) peer verification, SSL and non-SSL sessions cannot mix on the same port
- **socket_tuning:** TCP_NODELAY disables Nagle's algorithm for sub-millisecond message delivery; recommended for low-latency trading, Buffer sizes should be tuned based on expected message throughput; larger buffers reduce system calls
- **threading:** Each connection runs I/O on a dedicated thread pool; session callbacks are invoked from I/O threads, Applications sharing state across sessions must synchronize access or use SynchronizedApplication wrapper

## Success & failure scenarios

**✅ Success paths**

- **Connection Established** — when initiator completes TCP handshake OR acceptor accepts incoming connection; SSL handshake succeeds (if SSL is enabled), then TCP connection ready; FIX session logon can begin.
- **Graceful Stop** — when application calls stop() on acceptor or initiator, then All sessions are logged out and sockets closed cleanly.

**❌ Failure paths**

- **Port Bind Failed** — when acceptor is starting; configured SocketAcceptPort is already in use, then Acceptor startup fails with ConfigError; application is notified. *(error: `PORT_BIND_FAILED`)*
- **Ssl Handshake Failed** — when TCP connection established; SSL/TLS is enabled; certificate verification or cipher negotiation fails, then Connection dropped; initiator will retry after reconnect interval. *(error: `SSL_HANDSHAKE_FAILED`)*
- **Connection Refused** — when initiator is attempting to connect; target host refuses the connection or is unreachable, then Connection attempt fails; initiator waits ReconnectInterval before retrying. *(error: `CONNECTION_REFUSED`)*
- **Connection Lost** — when session is in connected or logged_on state; TCP socket receives error or zero-byte read (peer closed connection), then Session is disconnected; initiator begins reconnect cycle. *(error: `CONNECTION_LOST`)*

## Errors it can return

- `PORT_BIND_FAILED` — Failed to bind to configured port
- `SSL_HANDSHAKE_FAILED` — SSL/TLS handshake failed
- `CONNECTION_REFUSED` — Connection refused by remote host
- `CONNECTION_LOST` — Connection lost unexpectedly
- `CONFIG_ERROR` — Connection configuration is invalid

## Connects to

- **fix-session-management** *(required)* — FIX sessions are established on top of connections managed here
- **fix-message-persistence** *(recommended)* — Message store maintains sequences across connection drops and recoveries

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 15 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/fix-connection-management/) · **Spec source:** [`fix-connection-management.blueprint.yaml`](./fix-connection-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
