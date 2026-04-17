<p align="center">
  <img src="docs/assets/logo.svg" alt="ai-fdl-kit — The AI Feature Definition Kit" width="720">
</p>

<h1 align="center">ai-fdl-kit</h1>
<p align="center"><strong>Build Production Apps With AI —</strong> interactive planning, prototype iteration, then automatic code generation.</p>
<p align="center"><em>Meet Bob. Ask him to build anything. He plans, shows you a prototype, gets your approval, then builds.</em></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-fdl-kit"><img src="https://img.shields.io/npm/v/ai-fdl-kit.svg?color=cb3837&label=npm" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="MIT"></a>
  <a href="blueprints/"><img src="https://img.shields.io/badge/blueprints-546-blue" alt="Blueprints"></a>
  <a href="https://theunsbarnardt.github.io/ai-fdl-kit/"><img src="https://img.shields.io/badge/docs-github_pages-green.svg" alt="Docs"></a>
</p>

---

## The Problem: AI Builds Wrong, Fast

You ask ChatGPT to "build a POS system":

- ❌ It generates 50 files in one shot
- ❌ You realize mid-way the UI is wrong
- ❌ Reworking 50 files is **painful**
- ❌ The business rules got lost in translation
- ❌ Half the features are missing edge cases

**Result:** You don't trust it. You still rewrite it yourself.

---

## The Solution: Meet BOB

**BOB is an orchestrator agent** that runs a two-stage pipeline:

### Stage 1: Plan → Prototype → Iterate ⚡

```
You:  "Build a Next.js POS with OTP login, inventory, and Square"
      ↓
Bob:  ✓ Drafts a plan (features, tech stack, risks)
      ✓ You review and approve
      ✓ Shows you an interactive prototype (single HTML file)
      ✓ You iterate with instant feedback
      ✓ You approve the prototype
      
Result: Plan + prototype frozen as your spec
```

### Stage 2: Production Build 🚀

```
Bob:  ✓ Reads your frozen plan (it's now the spec)
      ✓ Generates production code for every feature
      ✓ Validates each feature against the blueprint
      ✓ Independent QA review
      ✓ Auto-generates documentation
      ✓ Ready to deploy
      
Result: Production code that matches what you approved
```

**Why this works:**
- 🎯 **No surprises** — UI is approved before code is written
- 📦 **Scope lock** — Plan can't change during Stage 2 (scope creep is over)
- ⚡ **Fast iteration** — Iterate on 1 HTML file, not 50 source files
- ✅ **Approval checkpoints** — You control every decision
- 🔍 **Deterministic output** — Code matches spec exactly

---

## What Can You Build?

**Examples of full apps Bob has generated:**

| App | Time | Output |
|-----|------|--------|
| **Payment Terminal** (palm vein + PayShap) | 1 conversation | [Full proposal](docs/plans/payment-terminal-app.md) + 6 blueprints |
| **POS System** (OTP, inventory, receipts) | 1 conversation | Plan + prototype + code |
| **Fleet Management** (GPS, maintenance, geofencing) | 1 conversation | Full app with 12+ blueprints |
| **E-commerce** (auth, catalog, checkout, payments) | 1 conversation | Multi-tenant, multi-currency |
| **Admin Dashboard** (users, roles, audit logs) | 1 conversation | RBAC + compliance-ready |

All from **conversational prompts**. No YAML. No boilerplate. Bob handles everything.

---

## The Crew: Bob Dispatches 7 Specialists

You only talk to Bob. **The crew is invisible.**

```
              USER
               │
         ┌─────▼─────┐
         │ BOB (You) │ ← ask questions here
         │Orchestr.  │
         └─────┬─────┘
               │ direct dispatch
   ┌─┬────┬──┬─┬────┬──┬───┐
   ▼ ▼    ▼  ▼ ▼    ▼  ▼   ▼
  Scout Surveyor Sketcher Builder Inspector Scribe Reviewer
```

| Role | Job |
|------|-----|
| **Scout** | Find matching blueprints in the 546+ catalog |
| **Surveyor** | Identify gaps + recommend solutions |
| **Sketcher** | Build interactive prototype UI |
| **Builder** | Generate production code |
| **Inspector** | Validate each feature |
| **Scribe** | Auto-generate API docs |
| **Reviewer** | Cold-context independent QA |

---

## BOB's Personality: Jarvis from Iron Man

BOB is **opinionated, efficient, anticipatory:**

```
You: "Should I use JWT or SAML for auth?"

Bob: "I'd recommend SAML if you have enterprise SSO needs,
     JWT for consumer apps. You mentioned 'POS system' — 
     most retail uses JWT (simpler, faster). 
     Unless you're selling to enterprise, go JWT. Thoughts?"
```

- ✅ **Gives opinions** — backed by tradeoffs
- ✅ **Shows reasoning** — explains the why
- ✅ **Never offers neutral menus** — no "A, B, or C?"
- ✅ **Anticipates needs** — "You'll need thermal printer middleware"
- ✅ **Quiet during production** — doesn't narrate builds
- ✅ **Dry wit** — occasionally witty without being annoying

Think **Jarvis** from Iron Man: Polished. Prepared. A little witty. Never flustered.

---

## Two-Stage Pipeline in Detail

### Stage 1: Interactive Planning (Your Control)

**Step 1: Draft Plan**
```
Bob reads your request and drafts a plan showing:
  ✓ All features (organized by blueprint)
  ✓ Tech stack recommendations (with reasoning)
  ✓ Dependencies and risks
  ✓ Integrations (Stripe? Clerk? Twilio?)
```

**🔴 Checkpoint 1: Plan Review**
```
You review Bob's plan:
  "Looks good, but swap Stripe for Square"
  "Add tax calculation"
  "Remove geofencing for now"
  
Bob updates the plan and proceeds.
```

**Step 2: Build Prototype**
```
Bob dispatches Sketcher to build a single HTML file:
  ✓ Full UI flow (login → POS screen → receipt)
  ✓ Interactive buttons and forms
  ✓ Shows exactly what users will see
  ✓ NO backend code yet
```

**🟡 Checkpoint 2: Prototype Iteration**
```
You open prototype.html in your browser:

  "The POS grid is too cramped"
  
Bob advises: "Bigger items = less overview. 
             Better: Add category tabs instead?"
             
You: "Yes, do that"

Bob updates prototype.html → you reload → see changes

Loop continues until: "Prototype approved!"
```

**🟢 Checkpoint 3: Final Sign-Off**
```
You approve:
  ✓ plan.md (frozen — won't change)
  ✓ prototype.html (frozen — what you approved)
  ✓ DESIGN.md (design decisions captured)
  
Archived to .fdl/history/{timestamp}/ for audit trail
```

### Stage 2: Non-Conversational Production Build

**Input:** Your frozen plan

**Bob orchestrates in parallel:**
- Builder × 4 (auth, inventory, pos, square) → code
- Inspector × 4 → validation gates
- Reviewer × 4 → independent QA
- Scribe × 1 → auto-docs

**Output:**
- ✅ Production code (matches plan exactly)
- ✅ API docs + system design
- ✅ Tests (optional)
- ✅ Ready to deploy

**Key:** Stage 2 is **non-conversational**. The plan IS the spec. If something is ambiguous, it fails — forcing you back to prototype loop. No rework surprises.

---

## Why This Matters

### Before BOB (Old Way)
```
User: "Build login"
AI: [generates 50 files]
User: "I wanted SAML, not JWT"
AI: [reworks 20 files]
User: "This UI looks wrong"
→ More rework. More friction. More waste.
```

### With BOB (New Way)
```
User: "Build login"
Bob: "Auth or SSO? JWT or SAML?"
     [shows prototype with your choices]
User: "Perfect, build it"
Bob: [generates exactly what you approved]
→ No surprises. No rework. Done.
```

---

## Get Started

### Option 1: No Clone (Fastest)

Use BOB in any existing project:

```bash
cd your-project
npx ai-fdl-kit@latest init --tool claude-code
```

Then in Claude Code:
```
/fdl-build "nextjs app with OTP login and POS"
```

Bob handles everything. You get a `.fdl/` folder with plans, prototypes, and code.

### Option 2: Clone & Contribute

```bash
git clone https://github.com/TheunsBarnardt/ai-fdl-kit.git
cd ai-fdl-kit
npm install
```

Then in Claude Code:
```
/fdl-build "the app you want to build"
```

---

## The Blueprints: 380+ Patterns

FDL ships with 546+ battle-tested blueprints encoding architectural patterns:

| Category | Examples | Count |
|----------|----------|-------|
| **Auth Pack** | OAuth, SAML, MFA, rate limiting, token lifecycle | 12 |
| **Data Pack** | CRUD, search, filtering, pagination, soft delete | 28 |
| **Payment Pack** | Stripe, Square, PayPal, subscriptions, refunds | 15 |
| **UI Pack** | Forms, modals, drag-drop, navigation, editors | 22 |
| **Workflow Pack** | Approvals, SLAs, state machines, events | 18 |
| **ERP Pack** | POS, inventory, tax, bank reconciliation | 31 |
| **Integration Pack** | Webhooks, async jobs, idempotency, retries | 14 |
| **Compliance Pack** | POPIA, GDPR, audit logs, data export | 12 |

Every blueprint is available as **JSON** for any AI tool:

```
GET https://theunsbarnardt.github.io/api-fdl-kit/api/blueprints/auth/login.json
```

[Browse all blueprints →](blueprints/)

---

## Static JSON API

Every blueprint is queryable via HTTP — no AI scraping:

```bash
curl https://theunsbarnardt.github.io/ai-fdl-kit/api/registry.json
curl https://theunsbarnardt.github.io/ai-fdl-kit/api/blueprints/auth/login.json
```

Use with **ChatGPT, Gemini, Copilot** — no Claude required.

---

## How Blueprints Work

A blueprint is a **YAML spec** that describes a feature completely:

```yaml
feature: login
category: auth
description: "User authentication with email + password"

fields:
  email: { type: email, required: true }
  password: { type: password, required: true }
  remember_me: { type: boolean, default: false }

rules:
  rate_limit: 5 attempts per 15 minutes
  password_min_length: 8 characters
  require_verification: true

outcomes:
  success:
    given: "valid credentials"
    then: ["create session", "emit login.success event"]
    
  invalid_credentials:
    given: "invalid password"
    error: LOGIN_INVALID_CREDENTIALS
    
  rate_limited:
    given: "5+ failed attempts in 15 min"
    error: LOGIN_RATE_LIMITED
```

**BOB reads this and generates complete implementation** (Node, React, SQL, UI, tests).

---

## Plans: Client-Ready Proposals

`/fdl-brainstorm` generates a full **business proposal** from a rough idea:

**Input:** *"Build a payment terminal with palm vein + Card payments"*

**Output:** 
- Executive summary (for stakeholders)
- User journeys with diagrams
- System architecture
- Security & compliance checklist
- Risk assessment
- 4-phase roadmap (16 weeks)
- 6 new blueprints created
- 11 existing blueprints linked

[See full example →](docs/plans/payment-terminal-app.md)

---

## Data Protection: Zero-Tolerance for Secrets

FDL enforces **secret scanning at every layer:**

| Layer | Protection |
|-------|-----------|
| **Policy** | CLAUDE.md — refuse to process secrets |
| **Validator** | Scan all blueprint strings for API keys, JWTs, credentials |
| **Completeness** | Secondary secret detection |
| **Skills** | Extract and redact before generating blueprints |

Any blueprint containing `sk-...`, `AKIA...`, `ghp_...`, connection strings, or SA ID numbers **fails validation**. No exceptions.

---

## AGI-Ready Layer

All 458 blueprints include an `agi` section for autonomous agents:

```yaml
agi:
  autonomy: semi_autonomous
  verification: "error_rate < 1% and latency < 200ms"
  safety: human_required  # for production deploys
  evolution: "if errors > threshold, add circuit breaker"
  coordination: ["auth.verified", "user.id"]
```

Run `/fdl-propagate-agi` to auto-generate AGI sections.

---

## Documentation

Full docs at **[theunsbarnardt.github.io/ai-fdl-kit](https://theunsbarnardt.github.io/ai-fdl-kit/)**:

- [Commands Reference](https://theunsbarnardt.github.io/ai-fdl-kit/commands/) — all 11 commands explained
- [Blueprint Format](https://theunsbarnardt.github.io/ai-fdl-kit/blueprint-format/) — schema reference
- [Examples & Walkthroughs](https://theunsbarnardt.github.io/ai-fdl-kit/examples/) — real projects
- [Using with ChatGPT, Copilot, Gemini](https://theunsbarnardt.github.io/ai-fdl-kit/using-with-other-ai/)
- [FAQ](https://theunsbarnardt.github.io/ai-fdl-kit/faq/)

---

## Why BOB Works

1. **Iteration happens early** — on 1 HTML file, not 50 source files
2. **Plan is authoritative** — no ambiguity during production build
3. **Approval gates work** — you control every decision point
4. **Crew is invisible** — you talk to Bob, not 7 agents
5. **Opinionated not neutral** — Bob gives advice with reasoning
6. **Deterministic output** — code matches spec exactly

---

## License

MIT — Use freely for any purpose, commercial or personal.

---

## Questions?

- 💬 Open an [issue on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/issues)
- 📖 Read the [docs](https://theunsbarnardt.github.io/ai-fdl-kit/)
- 🚀 Try `/fdl-build` in Claude Code

**Ready to build?**

```bash
npx ai-fdl-kit@latest init
```

Then ask Bob to build something amazing.
