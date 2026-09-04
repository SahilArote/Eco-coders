# Technical Design Document (TDD) + Implementation Plan

## Intelligent Agricultural Procurement & Queue Management Platform

**Prepared in the role of Principal Software Engineer / Solutions Architect**

| Field | Value |
|---|---|
| Document Type | Technical Design Document + Implementation Plan |
| Architecture Level | Production-oriented, SIH-ready |
| Recommended Architecture | Modular Monolith (NestJS) + Independent ML Service (FastAPI) |
| Primary Users | Farmers, Procurement Center Operators, Administrators |
| Primary Goal | Reduce uncertainty, unnecessary waiting, coordination problems, and lack of procurement-status visibility for farmers |
| Companion Documents | `SRS-Agricultural-Procurement-Platform.md`, `SDD-Agricultural-Procurement-Platform.md` |
| Version | 1.0 |

**Engineering position:** this project should not begin as a microservices/Kubernetes deployment. For a student-team SIH build (and a realistic first pilot), that adds operational complexity without proportional benefit. The recommendation is a modular NestJS backend, PostgreSQL as the system of record, Redis for transient/high-speed state, and a separately deployed Python ML service, because machine learning has a different build/release lifecycle than the core transactional application.

---

## Executive Summary

The deeper problem behind SIH PS 26032 is not "farmers wait in line" — it is that farmers operate with **almost no visibility** into procurement timing, queue position, or status, from booking through payment. This document specifies, at production-engineering rigor, how to build a platform that converts that uncertainty into a transparent, predictable digital workflow, and lays out a phased plan a student team can actually execute and demonstrate.

**Positioning for evaluators:** don't present this as *"an app where farmers book tokens."* Present it as: *"an intelligent, real-time agricultural procurement management platform that connects farmers and procurement centers, reduces information and execution uncertainty through digital scheduling and queue management, and uses predictive analytics to improve waiting-time visibility and resource utilization."*

---

# 1. Requirements Analysis

*(Full detail lives in the SRS; this section restates the requirements baseline at the precision this TDD's design decisions depend on.)*

### 1.1 Core User Flows (Functional Requirements Summary)

| Flow | Actor | Outcome |
|---|---|---|
| Register/authenticate | Farmer / Operator / Admin | Authenticated session (JWT access + refresh) |
| Discover centers & schedule | Farmer | List/map of centers, crop schedule, slot availability |
| Book a slot | Farmer | Confirmed booking + digital token, concurrency-safe |
| Track live queue | Farmer | Real-time token position, active counters, ETA |
| Predict waiting time | System (AI + fallback) | `estimatedWaitMinutes` shown to farmer |
| Progress procurement lifecycle | Operator | State-machine-enforced transitions from `BOOKED` to `PAYMENT_COMPLETED` |
| Record quality & weighment | Operator | Quality grade, moisture %, weights attached to procurement |
| Track payment status | Farmer | Payment status visibility (simulated for MVP) |
| Receive notifications | Farmer | Push notification at each lifecycle milestone |
| Manage operations | Operator/Admin | Center/schedule/slot/counter config, queue control, analytics |

### 1.2 Non-Functional Requirements (Design Targets)

| Category | Target |
|---|---|
| API latency (standard) | < 300 ms |
| API latency (booking, transactional) | < 500 ms |
| Queue update propagation | < 2 s |
| ML prediction latency | < 1 s |
| Scale assumption | 10,000 DAU, 2,000 peak concurrent connections, 100–300 req/s peak, 100+ centers |
| Availability | 99.5% (MVP) → 99.9% (production pilot) |
| Security | HTTPS, JWT + refresh, RBAC, hashed passwords, input validation, rate limiting, audit logs |
| Maintainability | TypeScript end-to-end, modular structure, automated tests, OpenAPI docs |

### 1.3 Constraints & Out-of-Scope Boundaries

**Constraints:** buildable by a student team on an academic/hackathon timeline; no dependency on unavailable government identity/payment/ERP APIs; every secondary service (ML, notifications, cache) must be individually failure-tolerant; only synthetic/dummy PII during development.

**Out of scope for MVP:** government ERP integration, live bank transactions, Aadhaar/identity verification, computer-vision quality grading, IoT/sensor deployment, voice assistant, blockchain, fully autonomous allocation, nationwide distributed infrastructure. (Full future-scope roadmap in SRS §6.3.)

---

# 2. System Architecture & High-Level Design

### 2.1 Component & Service Topology

```
                         ┌────────────────────────┐
                         │       FARMER APP       │
                         │ React Native / Expo    │
                         └───────────┬────────────┘
                                     │ HTTPS / WebSocket
┌────────────────────────────────────┴────────────────────────────┐
│                        NESTJS BACKEND (TypeScript)                │
│  Auth · Booking · Queue · Procurement · Scheduling · Notifications │
│                          · Analytics                              │
└──────────────┬──────────────────────┬────────────────────────────┘
               ▼                      ▼
       ┌───────────────┐       ┌───────────────┐
       │  PostgreSQL   │       │     Redis     │
       │ Source of     │       │ Cache/Queue   │
       │ Truth         │       │ Transient     │
       └───────┬───────┘       └───────────────┘
               │ historical data
               ▼
       ┌────────────────┐
       │ Python ML API  │  (FastAPI — waiting-time / crowd prediction)
       └────────────────┘

              ┌───────────────────────┐
              │    ADMIN DASHBOARD    │  React + TypeScript
              └───────────┬───────────┘
                          ▼
                     NestJS API (same backend)
```

Background/async concerns (notification dispatch + retry, queue-event ingestion, future scheduled ML retraining) run as in-process workers/queues backed by Redis for the MVP — a separate worker fleet is not justified at this scale.

### 2.2 Data Flow — Booking → Queue → Procurement → Payment

```
Farmer
  → select crop → center → date → slot
  → POST /bookings
  → PostgreSQL transaction (SELECT slot FOR UPDATE → capacity check)
      ├─ success → generate token → Redis queue state update
      │              → ML wait-time (or fallback) → WebSocket QUEUE_UPDATED
      │              → Farmer app
      └─ failure → BOOKING_SLOT_FULL

Operator
  → check-in (ARRIVED) → call token (WAITING → PROCESSING)
  → quality check → weighment → ACCEPTED → COMPLETED
  → payment status update → PAYMENT_PROCESSING → PAYMENT_COMPLETED
  → every transition: PostgreSQL TX + queue_event + WebSocket broadcast
    + notification enqueue
```

### 2.3 Database Schema Design

Full field-level schema (entities, keys, indexes, normalization rationale) is specified in `SDD-Agricultural-Procurement-Platform.md`, Section 6. Summary of entities: `users → farmers`, `procurement_centers → counters/schedules → slots → bookings → procurements → {quality_checks, weighments, payments}`, plus supporting `crops`, `queue_events`, `notifications`, `audit_logs`. Design target: ~3NF for transactional tables; denormalization reserved for analytics/reporting views only.

### 2.4 API Specifications

Full REST endpoint list, request/response payloads, and the error contract are specified in the SDD, Section 7. Conventions carried into implementation:

- Base path `/api/v1`, `Authorization: Bearer <token>` on protected routes.
- Every write validated via DTO (`class-validator`).
- Uniform error envelope:
```json
{ "success": false, "error": { "code": "SLOT_FULL", "message": "...", "requestId": "req-123", "details": {} } }
```
- Internal ML endpoint `POST /predict/waiting-time` is never called directly by clients — only by the backend, which owns the fallback decision.

---

# 3. Deep Dives & Edge-Case Handling

### 3.1 Authentication & Authorization

**Token lifecycle:** short-lived JWT access token + longer-lived, server-tracked (revocable) refresh token. Expirations are environment-configurable:
```
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```
Refresh tokens are stored as session records so a compromised token can be explicitly revoked — this is deliberately not a purely stateless refresh design, trading a small lookup cost for real revocability.

**RBAC:** three roles (`FARMER`, `CENTER_OPERATOR`, `ADMIN`), enforced entirely server-side via NestJS guards. The client's claimed role is never trusted — every protected controller method re-checks the authenticated user's persisted role and, for operators, their center assignment.

### 3.2 Concurrency, Caching, and Failover

**Concurrency (double-booking prevention):** all capacity-affecting writes go through `BEGIN TX → SELECT slot FOR UPDATE → capacity check → write → COMMIT`, backed by a DB-level unique/capacity constraint as defense-in-depth. This guarantees that if 10 requests race for the last slot, exactly one succeeds.

**Caching strategy:** Redis caches center/crop/schedule/slot-availability reads; it never caches payment, procurement, or authorization state. Cache invalidation is event-driven (`schedule updated → invalidate center:schedule:*`, `booking created → invalidate slot availability`).

**Failover behavior (the core resilience principle of this system):**

| Failure | Behavior |
|---|---|
| Redis down | Backend reads/writes fall back to PostgreSQL directly; system continues; Redis is rebuilt from PostgreSQL once it recovers |
| ML service down | Backend computes the deterministic baseline ETA (`peopleAhead × avgProcessingTime ÷ activeCounters`); farmer sees an estimate, never an error |
| Notification/Firebase down | Booking/procurement transaction still commits; notification is queued and retried; delivery failure never rolls back business state |

### 3.3 Rate Limiting, Validation, Error Boundaries

**Rate limiting (baseline, to be tuned by load testing):**
```
Login:    5 requests / minute / IP
OTP:      3 requests / 10 minutes / phone
Booking: 10 requests / minute / user
General: 100 requests / minute / user
```
Implemented via Redis-backed counters so limits hold across multiple backend instances if/when the deployment scales horizontally.

**Validation:** every mutating endpoint uses a DTO, e.g.:
```ts
class CreateBookingDto {
  @IsUUID() centerId: string;
  @IsUUID() slotId: string;
  @IsUUID() cropId: string;
  @IsNumber() @Min(1) quantity: number;
}
```
Frontend validation is UX sugar only — the backend is the actual boundary.

**Error boundaries:** client errors (4xx) vs. server errors (5xx) vs. external-service errors are handled distinctly; external-service failures (ML, Firebase) resolve to an in-process fallback rather than propagating as a user-facing 5xx wherever a safe fallback exists (see 3.2).

### 3.4 Procurement State Machine Enforcement

```
BOOKED → ARRIVED → WAITING → PROCESSING → QUALITY_CHECK
   → (REJECTED, terminal)  |  → WEIGHMENT → ACCEPTED → COMPLETED
   → PAYMENT_PROCESSING → PAYMENT_COMPLETED
```
Transitions are validated against an explicit allow-list server-side; an attempted skip (e.g. `BOOKED → PAYMENT_COMPLETED`) returns `409 PROCUREMENT_INVALID_TRANSITION` regardless of caller role.

### 3.5 Security Threat Model

| Threat | Mitigation |
|---|---|
| Credential theft | HTTPS + secure token lifecycle |
| Brute force | Rate limiting |
| Unauthorized admin access | Server-enforced RBAC |
| SQL injection | Prisma parameterized queries |
| XSS / CSRF | Output encoding + appropriate token/cookie strategy |
| Token theft | Short-lived access tokens |
| Double booking | DB transaction + row lock + unique constraint |
| Data tampering | Audit logs |
| API abuse | Rate limiting |
| Secret leakage | Env vars / secret manager, never committed to Git |

---

# 4. Phased Implementation & Rollout Plan

### 4.1 Milestone Breakdown

| Phase | Duration | Scope | Exit Milestone |
|---|---|---|---|
| **Phase 0 — Architecture & Research** | 2–4 days | SRS, SDD, TDD, ER diagram, API spec, wireframes, repo + dev env | Documents baselined, repo scaffolded |
| **Phase 1 — MVP Foundation** | 1 week | NestJS project, PostgreSQL, Prisma, auth, RBAC, farmer profile, admin login, base React admin, base React Native app, Docker dev setup | Farmer and admin can register/login |
| **Phase 2 — Procurement & Scheduling** | 1 week | Centers, crops, schedules, slot generation/availability, booking, cancellation, digital token | Farmer can select crop → center → slot → book → receive token (**first demo-ready flow**) |
| **Phase 3 — Queue Management** | 1 week | Check-in, queue engine, token calling, active counters, queue events, Redis, WebSockets | Two devices show: operator calls token → farmer screen updates automatically |
| **Phase 4 — Procurement Lifecycle** | 1 week | Full state machine (ARRIVED → PAYMENT_COMPLETED), quality, weighment, payment status | Complete farmer journey from booking to procurement completion demonstrable |
| **Phase 5 — AI Layer** | 1–2 weeks | Synthetic dataset, feature engineering, baseline formula, ML models (Linear Regression → Random Forest → Gradient Boosting), evaluation, FastAPI, NestJS integration | Queue of 18 → AI estimate of ~42 min shown live |
| **Phase 6 — Notifications & Analytics** | 3–5 days | Firebase integration, lifecycle notifications, admin analytics (center performance, utilization) | Notifications fire on real events; analytics dashboard populated |
| **Phase 7 — Hardening** | 1 week | Security review, validation coverage, error handling, load testing, WebSocket stability, DB indexing, logging, monitoring, backups, UI polish, low-connectivity testing | System survives simulated 2,000-concurrent-user load and documented failure scenarios |
| **Phase 8 — Demo Preparation** | Final days | Seeded demo dataset (5 centers, 20 counters, 500 farmers, multiple crops/schedules, historical queue data), rehearsed demo script | End-to-end scripted demo runs reliably without live external dependencies |

**Recommended team split (5 members):** Frontend (farmer app) · Backend (NestJS APIs + auth) · Database/Queue (PostgreSQL + Prisma + queue logic) · AI/ML (dataset + prediction service) · Admin/Integration (admin dashboard + notifications + deployment). Every member should understand the full architecture, not only their slice.

### 4.2 CI/CD & Deployment Strategy

**Pipeline (GitHub Actions):**
```
Push → Pull Request
  → CI: lint → type-check → unit tests → integration tests → build → security checks
  → Merge to main
  → Build Docker image
  → Deploy to staging
  → Smoke tests
  → Deploy to production
```

**Environment variables** (never hard-coded, never committed):
```
NODE_ENV=production
DATABASE_URL=...
REDIS_URL=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ML_SERVICE_URL=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

**Migrations:** Prisma-managed only — no manual production schema edits.
```
Schema change → prisma migrate → review migration → CI → staging → production
```
Production migrations run as a controlled, separate deployment step, never implicitly on app boot.

**Deployment targets:**
```
Prototype:  Frontend → Vercel | Backend → Render/Railway/AWS | DB → managed Postgres | Redis → managed Redis | ML → Dockerized FastAPI
Production: AWS/Azure/GCP + managed container platform + managed Postgres/Redis + object storage + monitoring
```
Kubernetes is explicitly **not** introduced at MVP/pilot scale — it would add operational cost without a corresponding benefit at 10k DAU / 2k concurrent connections.

### 4.3 Observability & Monitoring

**Logging:** structured JSON, one event per significant business action:
```json
{ "timestamp": "2026-09-04T10:20:00Z", "level": "INFO", "service": "booking-service",
  "event": "BOOKING_CREATED", "bookingId": "BK-123", "userId": "USR-123", "requestId": "REQ-123" }
```
Never logged: passwords, JWTs, OTPs, private keys, unnecessary PII.

**Metrics to track:**
```
http_request_duration, http_requests_total, http_5xx_total
booking_success_total, booking_failure_total, slot_full_total
queue_length, active_counters
average_wait_time, average_processing_time
ml_prediction_latency, ml_prediction_error
notification_success_total, notification_failure_total
```

**Alert thresholds (starting points, to be tuned against real workload):**

| Condition | Severity |
|---|---|
| 5xx error rate > 5% for 5 min | Critical |
| API p95 > 1 s for 10 min | Warning |
| Database CPU > 80% | Warning |
| Redis unavailable | Critical |
| ML failure rate > 20% | Warning |
| Notification failure rate > 30% | Warning |

**Disaster recovery priorities:** 1) Database (automated backups + point-in-time recovery where supported) → 2) Backend → 3) Redis (rebuilt from PostgreSQL) → 4) ML service → 5) Notifications. Redis being reconstructable from PostgreSQL is a deliberate architectural property, not an afterthought.

### 4.4 Testing Strategy

**Levels:** unit (BookingService, QueueService, ProcurementService, PaymentService, PredictionService, authorization logic) → integration (farmer create → center create → schedule create → slot create → book → token) → API tests (Postman/automated) → UI tests (farmer booking flow) → load tests (100/500/1,000/2,000 simulated concurrent users via k6/Artillery/JMeter, focused on booking and queue endpoints).

**Critical test cases (must pass before Phase 7 exit):**

| # | Scenario | Expected Result |
|---|---|---|
| 1 | Last slot, 10 simultaneous booking requests | Exactly 1 succeeds; 9 receive `SLOT_FULL` |
| 2 | Invalid procurement transition (`BOOKED → PAYMENT_COMPLETED`) | 409, `INVALID_STATUS_TRANSITION` |
| 3 | Operator A modifies Center B (not assigned) | 403 `FORBIDDEN` |
| 4 | ML service unavailable during ETA request | Fallback estimate returned, no visible failure |
| 5 | Farmer closes and reopens app | Booking/token still visible (cached locally) |
| 6 | Duplicate booking, same farmer + same slot | Rejected per configured business rule |
| 7 | Queue becomes empty | No negative queue position or invalid ETA |
| 8 | Two farmers refresh during a live queue update | Both see consistent, current state |

### 4.5 Recommended Demo Script (SIH Presentation)

```
1. Farmer opens app → sees Wheat procurement at ABC Center, today 10:00–11:00, 18 slots available, expected wait ~22 min
2. Farmer books → receives Token A105
3. Farmer's queue screen: 18 farmers ahead, estimated wait 42 min
4. Operator calls A088 on the dashboard → farmer's app updates automatically (no refresh)
5. Operator processes the farmer through WAITING → PROCESSING → QUALITY_CHECK → WEIGHMENT → ACCEPTED
6. Farmer receives a "Procurement completed, payment processing" notification
7. Payment status updates to PAYMENT_COMPLETED on the farmer's screen
```
This single flow exercises booking, concurrency-safe slots, digital tokens, live queue/WebSocket updates, the state machine, notifications, and payment-status tracking — nearly the entire architecture in under two minutes. Use a pre-seeded synthetic dataset (Phase 8) rather than depending on live/government data sources during the presentation.

### 4.6 MVP Cut-Line

**Must have (Phases 1–4):** farmer login, center/schedule information, slot booking, digital token, admin/operator dashboard, check-in, live queue, WebSocket updates, procurement status, payment status.

**High value (Phase 5–6):** waiting-time prediction, push notifications, analytics.

**Future (post-SIH):** crowd forecasting, smart slot/center recommendation, voice assistant, multilingual support, offline-first support, grievance-management workflow, government API integration.

**Sequencing rule:** do not start with AI. Build reliable booking, queue, and procurement-state management first — the AI layer becomes both easier and more credible once real event data (from `queue_events`) exists to train and evaluate against.

### 4.7 Architecture Decision Records (Recap)

See `SDD-Agricultural-Procurement-Platform.md`, Section 16 for full ADRs: **ADR-001** PostgreSQL over MongoDB, **ADR-002** Redis is not the source of truth, **ADR-003** modular monolith over microservices, **ADR-004** separate ML service, **ADR-005** WebSocket/Socket.IO for real-time updates.

---

## Final Requirement-to-Technology Mapping

| Business Problem | Technical Solution |
|---|---|
| Lack of procurement information | Procurement information module |
| Unclear schedule | Schedule/calendar module |
| Unplanned farmer arrivals | Appointment slots |
| Long physical queues | Digital tokens |
| Unknown queue position | Real-time queue (WebSocket) |
| Unknown waiting time | ML prediction + deterministic fallback |
| Unexpected crowd | Crowd prediction (future) |
| Communication gap | Push notifications |
| Procurement uncertainty | State-machine tracking |
| Quality/weight uncertainty | Quality + weighment modules |
| Payment uncertainty | Payment-status tracking |
| Center overload | Admin/operator dashboard |
| Poor operational visibility | Analytics |
| Double booking | DB transaction + constraints |
| ML failure | Baseline fallback |
| Redis failure | PostgreSQL-backed recovery |
| Unauthorized access | JWT + RBAC |
| API abuse | Rate limiting |
| Data-modification ambiguity | Audit logs |

---

*Note on source material: the architectural notes and requirements this document formalizes were developed across an earlier working session; any research-paper-specific claims or figures should only be incorporated once the source papers themselves have been reviewed directly, rather than assumed from unread attachments.*
