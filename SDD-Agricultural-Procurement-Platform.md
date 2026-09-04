# Software Design Document (SDD)

## Intelligent Agricultural Procurement & Queue Management Platform

| Field | Value |
|---|---|
| Document Type | Software Design Document |
| Companion Document | `SRS-Agricultural-Procurement-Platform.md` (requirements baseline) |
| Architecture Style | Modular Monolith (NestJS) + Independent ML Microservice (FastAPI) |
| Version | 1.0 |
| Status | Design baseline for MVP implementation |

---

## Table of Contents

1. Introduction
2. Design Goals & Guiding Principles
3. System Architecture
4. Technology Stack
5. Component / Module Design
6. Database Design
7. API Design
8. Real-Time Communication Design
9. Procurement State Machine
10. Concurrency & Data Integrity
11. Caching Strategy
12. AI/ML Service Design
13. Security Design
14. Notification Design
15. Deployment & Repository Architecture
16. Architecture Decision Records (ADRs)
17. Appendix: Sequence Diagrams

---

## 1. Introduction

This document translates the functional and non-functional requirements in the SRS into a concrete technical design: architecture, technology choices, module boundaries, database schema, API contracts, and cross-cutting concerns (security, caching, real-time updates, concurrency, failure handling). It is the design of record that the Implementation Plan (see the TDD companion document) is built against.

### 1.1 Design Philosophy

> The core problem is not merely waiting — it is **uncertainty**. The architecture exists to convert an unpredictable physical process into a predictable, transparent digital workflow.

Engineering position: this system is deliberately **not** built as a microservices/Kubernetes/Kafka/service-mesh architecture from day one. For a student team building toward an SIH prototype (and a realistic first pilot), that adds operational complexity without proportional benefit. The recommended design is a **modular monolith** with a single, independently deployable **ML microservice**, because ML has a genuinely different development and runtime lifecycle from the transactional backend.

---

## 2. Design Goals & Guiding Principles

1. **PostgreSQL is the single source of truth.** Every other store (Redis) is derived/reconstructable.
2. **No secondary service is a single point of failure.** ML, notifications, and cache must degrade gracefully.
3. **Concurrency correctness over convenience.** Booking/slot capacity is enforced with database transactions and constraints — never optimistic client-side checks alone.
4. **Explicit state, not implicit status strings.** Procurement lifecycle is a real state machine with validated transitions.
5. **Build the boring core first.** Booking, queue, and procurement-status tracking must work reliably before AI is layered on top.
6. **Design for 10k DAU / 2k concurrent, not for a hypothetical million.** Avoid premature infrastructure complexity.

---

## 3. System Architecture

### 3.1 Architectural Style

**Modular Monolith + Independent ML Service.**

- The main backend (NestJS) is a single deployable unit internally organized into clearly bounded modules (auth, farmers, centers, schedules, bookings, queue, procurement, quality, weighment, payments, notifications, analytics).
- The ML service (Python/FastAPI) is deployed independently, communicates with the backend over internal HTTP, and can fail without affecting core transactional flows.
- Modules that later prove to need independent scaling or independent release cadence (notifications, analytics, ML) are designed with clean boundaries so they **can** be extracted into standalone services later, without a rewrite.

### 3.2 High-Level Architecture Diagram

```
                         ┌────────────────────────┐
                         │       FARMER APP       │
                         │ React Native / Expo    │
                         └───────────┬────────────┘
                                     │
                                     │ HTTPS / WebSocket
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NESTJS BACKEND (TypeScript)                │
│                                                                   │
│ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐              │
│ │  Auth   │ │ Booking  │ │  Queue  │ │ Procurement│              │
│ └─────────┘ └──────────┘ └─────────┘ └────────────┘              │
│ ┌────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│ │ Scheduling │ │ Notifications│ │  Analytics   │                 │
│ └────────────┘ └──────────────┘ └──────────────┘                 │
└──────────────┬──────────────────────┬────────────────────────────┘
               │                      │
               ▼                      ▼
       ┌───────────────┐       ┌───────────────┐
       │  PostgreSQL   │       │     Redis     │
       │ Source of     │       │ Cache / Queue │
       │ Truth         │       │ Transient     │
       └───────────────┘       └───────────────┘
               │
               ▼
       ┌────────────────┐
       │ Python ML API  │
       │ FastAPI        │
       │ Wait Prediction│
       └────────────────┘

              ┌───────────────────────┐
              │    ADMIN DASHBOARD    │
              │ React + TypeScript    │
              └───────────┬───────────┘
                          │
                          ▼
                     NestJS API (same backend)
```

### 3.3 Component Overview

| Component | Responsibility |
|---|---|
| Farmer Mobile App | Discovery, booking, token, live queue, status, notifications |
| Admin/Operator Web App | Configuration, day-of-operations queue management, analytics |
| NestJS Backend | All business logic, auth, orchestration of Redis/WebSocket/ML/Firebase |
| PostgreSQL | Authoritative transactional data store |
| Redis | Transient queue state, cache, rate limiting, distributed locks |
| Socket.IO (in-backend) | Real-time event push to connected clients |
| Python/FastAPI ML Service | Waiting-time (and future crowd) prediction |
| Firebase Cloud Messaging | Push notification delivery |

---

## 4. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Farmer app | React Native + Expo + TypeScript | Fast Android-first development, push/QR/GPS support, shared TS types with backend |
| Admin dashboard | React + TypeScript + Vite | Fast dev loop, component ecosystem, Socket.IO client support |
| Backend | Node.js + NestJS + TypeScript | Modular architecture, DI, guards, validation pipes — better structure than raw Express for a multi-module domain |
| Database | PostgreSQL | Strong transactional guarantees for a genuinely relational domain (farmer → booking → slot → center → procurement → quality/weighment → payment) |
| ORM | Prisma | Type-safe queries, first-class migration tooling |
| Cache / transient state | Redis | Fast queue state, caching, rate limiting, locks — explicitly **not** the source of truth |
| Real-time | Socket.IO / WebSockets | Bidirectional, low-latency queue/status push to farmer and operator clients |
| ML service | Python + FastAPI + Pandas + NumPy + scikit-learn | Independent lifecycle from the main backend; mature tabular-ML tooling |
| Notifications | Firebase Cloud Messaging | Cross-platform push; SMS/WhatsApp deferred to future scope |
| Maps | Leaflet + OpenStreetMap | No licensing cost, sufficient for center discovery |
| API docs | Swagger / OpenAPI | Auto-generated from NestJS decorators |
| Testing | Jest + Supertest (backend), Pytest (ML) | Standard, well-supported tooling for the chosen stacks |
| Containerization | Docker / docker-compose | Reproducible dev and deployment environments |
| CI/CD | GitHub Actions | Native to GitHub-hosted repos, sufficient for this scale |
| Monitoring | Sentry (errors), Prometheus/Grafana (metrics, where available) | Error visibility + operational metrics without heavy infra |

**Explicitly rejected for MVP:** MongoDB (the domain is relational, not document-shaped), Kubernetes/service mesh/Kafka (operational overhead not justified at this scale), microservices-per-module (slows a small student team down without benefit).

---

## 5. Component / Module Design

### 5.1 Backend Module Structure

```
backend/
├── src/
│   ├── auth/            # login, register, refresh, RBAC guards
│   ├── users/            # base user records
│   ├── farmers/           # farmer profile
│   ├── centers/           # procurement center CRUD + discovery
│   ├── crops/             # crop master data
│   ├── schedules/         # procurement schedule config
│   ├── slots/              # slot generation + availability
│   ├── bookings/           # booking creation, concurrency-safe capacity checks
│   ├── queue/               # queue state, check-in, token calling
│   ├── procurement/          # state machine, lifecycle transitions
│   ├── quality/               # quality-check records
│   ├── weighment/              # weighment records
│   ├── payments/                # payment-status records
│   ├── notifications/            # event → notification → FCM delivery
│   ├── analytics/                 # metrics aggregation & reporting endpoints
│   ├── ml/                         # HTTP client to the ML service, fallback logic
│   ├── common/
│   │   ├── guards/                  # RBAC / JWT guards
│   │   ├── decorators/
│   │   ├── filters/                  # global exception → error-contract mapping
│   │   ├── interceptors/
│   │   └── middleware/
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── test/
├── Dockerfile
└── docker-compose.yml
```

Each module follows a consistent internal layering:

```
Controller → Service → Repository (Prisma) → PostgreSQL
```

Controllers own HTTP concerns and validation only; services own business rules; Prisma owns persistence.

### 5.2 ML Service Structure

```
ml-service/
├── app/
│   ├── main.py
│   ├── routes/prediction.py
│   ├── models/wait_model.py
│   ├── schemas/prediction.py
│   └── services/predictor.py
├── training/
│   ├── dataset.py
│   ├── train.py
│   └── evaluate.py
├── models/wait_model.pkl
├── tests/
└── requirements.txt
```

### 5.3 Repository Layout (Monorepo)

```
agri-procurement-platform/
├── apps/
│   ├── farmer-mobile/
│   ├── admin-web/
│   ├── backend/
│   └── ml-service/
├── packages/
│   ├── shared-types/
│   └── api-client/
├── infrastructure/
│   ├── docker/
│   └── deployment/
├── docs/
│   ├── SRS-Agricultural-Procurement-Platform.md
│   ├── SDD-Agricultural-Procurement-Platform.md
│   └── TDD-Implementation-Plan-Agricultural-Procurement-Platform.md
└── README.md
```

---

## 6. Database Design

### 6.1 Entity-Relationship Overview

```
users ─┬─ farmers
       └─ admins/operators

procurement_centers ─┬─ counters
                      ├─ schedules ── slots ── bookings ── procurement
                      │                                       ├─ quality_checks
                      │                                       ├─ weighments
                      │                                       └─ payments
                      └─ (queue_events, per center, time-series)

farmers ─┬─ bookings
         ├─ notifications
         └─ feedback (future)
```

### 6.2 Full Schema

**users**
```
id                UUID PK
phone             VARCHAR UNIQUE
email             VARCHAR NULL
password_hash     VARCHAR
role              VARCHAR   -- FARMER | CENTER_OPERATOR | ADMIN
status            VARCHAR
created_at        TIMESTAMP
updated_at        TIMESTAMP
last_login_at     TIMESTAMP
```

**farmers**
```
id                    UUID PK
user_id               UUID FK -> users.id
full_name             VARCHAR
village               VARCHAR
district              VARCHAR
state                 VARCHAR
preferred_language    VARCHAR
created_at            TIMESTAMP
updated_at            TIMESTAMP

INDEX(user_id)
INDEX(district)
```

**procurement_centers**
```
id                  UUID PK
name                VARCHAR
code                VARCHAR UNIQUE
address             TEXT
village             VARCHAR
district             VARCHAR
latitude             DECIMAL
longitude            DECIMAL
status               VARCHAR
capacity_per_day     INT
created_at           TIMESTAMP
updated_at           TIMESTAMP

INDEX(district)
INDEX(status)
INDEX(code)
```

**counters**
```
id               UUID PK
center_id        UUID FK -> procurement_centers.id
counter_number   INT
status           VARCHAR
operator_id      UUID NULL FK -> users.id

UNIQUE(center_id, counter_number)
```

**crops**
```
id       UUID PK
name     VARCHAR
code     VARCHAR UNIQUE
unit     VARCHAR
active   BOOLEAN
```

**procurement_schedules**
```
id                UUID PK
center_id         UUID FK -> procurement_centers.id
crop_id           UUID FK -> crops.id
start_date        DATE
end_date          DATE
daily_capacity    INT
status            VARCHAR
created_at        TIMESTAMP
updated_at        TIMESTAMP

INDEX(center_id, crop_id)
INDEX(start_date, end_date)
```

**slots**
```
id             UUID PK
schedule_id    UUID FK -> procurement_schedules.id
slot_date      DATE
start_time     TIME
end_time       TIME
capacity       INT
booked_count   INT
status         VARCHAR

UNIQUE(schedule_id, slot_date, start_time)
```

**bookings**
```
id                        UUID PK
farmer_id                 UUID FK -> farmers.id
slot_id                   UUID FK -> slots.id
center_id                 UUID FK -> procurement_centers.id
crop_id                   UUID FK -> crops.id
quantity                  DECIMAL
token_number               VARCHAR
status                     VARCHAR
booked_at                  TIMESTAMP
arrival_at                 TIMESTAMP NULL
processing_started_at      TIMESTAMP NULL
completed_at               TIMESTAMP NULL
cancelled_at               TIMESTAMP NULL
created_at                 TIMESTAMP
updated_at                 TIMESTAMP

INDEX(farmer_id, created_at)
INDEX(slot_id, status)
INDEX(center_id, slot_id, status)
INDEX(center_id, token_number)
```

**queue_events** *(time-series, feeds analytics and future ML training)*
```
id                 UUID PK
center_id          UUID FK -> procurement_centers.id
booking_id         UUID NULL FK -> bookings.id
event_type         VARCHAR
queue_length       INT
active_counters    INT
event_timestamp    TIMESTAMP
metadata           JSONB NULL
```

**procurements**
```
id                    UUID PK
booking_id            UUID UNIQUE FK -> bookings.id
farmer_id             UUID FK -> farmers.id
center_id             UUID FK -> procurement_centers.id
status                VARCHAR
accepted_quantity     DECIMAL NULL
rejection_reason      TEXT NULL
started_at            TIMESTAMP
completed_at          TIMESTAMP NULL
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

**quality_checks**
```
id                     UUID PK
procurement_id         UUID UNIQUE FK -> procurements.id
moisture_percentage    DECIMAL NULL
quality_grade          VARCHAR NULL
quality_status         VARCHAR
remarks                TEXT NULL
checked_by             UUID FK -> users.id
checked_at             TIMESTAMP
```

**weighments**
```
id                UUID PK
procurement_id    UUID UNIQUE FK -> procurements.id
gross_weight      DECIMAL
tare_weight       DECIMAL
net_weight        DECIMAL
weighed_by        UUID FK -> users.id
weighed_at        TIMESTAMP
```

**payments**
```
id                  UUID PK
procurement_id       UUID UNIQUE FK -> procurements.id
amount               DECIMAL
currency             VARCHAR
status               VARCHAR
reference_number      VARCHAR NULL
initiated_at          TIMESTAMP NULL
completed_at          TIMESTAMP NULL
updated_at            TIMESTAMP
```

**notifications**
```
id            UUID PK
user_id       UUID FK -> users.id
type          VARCHAR
title         VARCHAR
message       TEXT
channel       VARCHAR
status        VARCHAR
sent_at       TIMESTAMP NULL
read_at       TIMESTAMP NULL
created_at    TIMESTAMP

INDEX(user_id, created_at)
INDEX(user_id, status)
```

**audit_logs**
```
id            UUID PK
actor_id      UUID
action        VARCHAR
entity_type   VARCHAR
entity_id     UUID
old_value     JSONB
new_value     JSONB
ip_address    VARCHAR
created_at    TIMESTAMP
```

### 6.3 Normalization Strategy

Transactional entities are modeled to roughly **Third Normal Form (3NF)**. Master data (farmer name, center name, crop name) is referenced by foreign key from `bookings`/`procurements` rather than duplicated inline. Selective, deliberate denormalization is permitted only for **read-optimized analytics views** and **materialized queue snapshots**, never for the primary transactional tables.

---

## 7. API Design

### 7.1 Conventions

- Base path: `/api/v1`
- Auth: `Authorization: Bearer <access_token>` on all protected routes
- All responses use a consistent envelope; all errors use a consistent error contract (below)
- Every write endpoint validates its request body via a DTO with class-validator decorators

**Error contract**
```json
{
  "success": false,
  "error": {
    "code": "SLOT_FULL",
    "message": "The selected slot is no longer available.",
    "requestId": "req-123456",
    "details": {}
  }
}
```

Error code catalogue (non-exhaustive): `AUTH_INVALID_CREDENTIALS`, `AUTH_UNAUTHORIZED`, `BOOKING_SLOT_FULL`, `BOOKING_ALREADY_EXISTS`, `BOOKING_INVALID_SLOT`, `QUEUE_NOT_FOUND`, `PROCUREMENT_INVALID_TRANSITION`, `RATE_LIMIT_EXCEEDED`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.

### 7.2 Endpoints by Module

**Auth**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

Register request/response:
```json
// Request
{ "phone": "9876543210", "password": "StrongPassword", "name": "Farmer Name" }

// Response
{ "user": { "id": "uuid", "role": "FARMER" }, "accessToken": "..." }
```

**Centers & Schedules**
```
GET /api/v1/centers
GET /api/v1/centers/:centerId
GET /api/v1/centers/:centerId/schedules
GET /api/v1/centers/:centerId/slots?cropId=&date=
```

**Bookings**
```
POST /api/v1/bookings
```
```json
// Request
{ "centerId": "center-uuid", "slotId": "slot-uuid", "cropId": "crop-uuid", "quantity": 850 }

// Response
{ "bookingId": "booking-uuid", "token": "A105", "status": "BOOKED",
  "slot": { "start": "10:00", "end": "11:00" } }
```

**Queue**
```
GET /api/v1/queue/:centerId
GET /api/v1/queue/my-position
GET /api/v1/bookings/:bookingId/queue-position
```
```json
{
  "token": "A105",
  "currentToken": "A087",
  "peopleAhead": 18,
  "activeCounters": 3,
  "estimatedWaitMinutes": 42,
  "lastUpdatedAt": "2026-09-04T10:22:10Z"
}
```

**Procurement**
```
GET   /api/v1/procurements/:id
PATCH /api/v1/procurements/:id/status
POST  /api/v1/procurements/:id/quality
POST  /api/v1/procurements/:id/weighment
```

**Payments**
```
GET   /api/v1/procurements/:id/payment
PATCH /api/v1/payments/:id/status
```

**ML (internal)**
```
POST /predict/waiting-time
```
```json
// Request
{ "centerId": "center-123", "queueLength": 18, "activeCounters": 3,
  "averageProcessingMinutes": 11, "arrivalsLast30Minutes": 12,
  "bookedFarmers": 35, "hour": 10, "dayOfWeek": 5 }

// Response
{ "estimatedWaitMinutes": 42, "modelVersion": "wait-v1", "confidence": 0.81 }
```

> Design note: the raw `confidence` value from the model is an internal signal only. The farmer-facing UI must never display a false precision like "81% confidence" — it should show a plain estimate, e.g. "Estimated waiting time: ~42 minutes."

---

## 8. Real-Time Communication Design

Clients subscribe to channels:
```
center:{centerId}
booking:{bookingId}
```

Events pushed to subscribed clients:
```json
{
  "event": "QUEUE_UPDATED",
  "data": { "currentToken": "A088", "peopleAhead": 17, "estimatedWaitMinutes": 38 }
}
```

Event catalogue: `QUEUE_UPDATED`, `TOKEN_CALLED`, `PROCUREMENT_STATUS_CHANGED`, `CENTER_DELAYED`, `SLOT_AVAILABILITY_CHANGED`, `PAYMENT_UPDATED`.

**Design rule:** the server broadcasts only on *meaningful* state transitions, never on every database write — indiscriminate broadcasting is both a performance and noise problem at 2,000 concurrent connections.

---

## 9. Procurement State Machine

```
BOOKED
   ↓
ARRIVED
   ↓
WAITING
   ↓
PROCESSING
   ↓
QUALITY_CHECK ──→ REJECTED (terminal)
   ↓
WEIGHMENT
   ↓
ACCEPTED
   ↓
COMPLETED
   ↓
PAYMENT_PROCESSING
   ↓
PAYMENT_COMPLETED
```

**Rule:** transitions are validated server-side against an explicit allow-list. A request that attempts `BOOKED → PAYMENT_COMPLETED` (or any other skip) is rejected with `PROCUREMENT_INVALID_TRANSITION` (HTTP 409), regardless of which role issues it.

---

## 10. Concurrency & Data Integrity

### 10.1 Double-Booking Prevention

**Incorrect (race-prone) approach:**
```
if (slot.bookedCount < slot.capacity) { slot.bookedCount++ }
```
Two concurrent requests can both read a stale `bookedCount` and both proceed.

**Correct approach — row-locked transaction:**
```
BEGIN TRANSACTION
SELECT slot FOR UPDATE
  if capacity available:
      create booking
      increment booked_count
COMMIT
```

This is backed by a database-level uniqueness/capacity constraint as a second line of defense, so correctness does not depend solely on application logic.

### 10.2 Queue Consistency

```
Operator calls token
        │
        ▼
NestJS transaction
        ├── PostgreSQL status update
        ├── queue_events insert
        └── Redis queue-state update
                 │
                 ▼
             WebSocket broadcast → Farmers
```

If Redis is unavailable, the queue state is rebuilt from PostgreSQL once Redis recovers — Redis is never the only copy of queue truth.

---

## 11. Caching Strategy

**Good cache candidates:** center details, crop list, procurement schedules, public configuration, frequently-viewed slot availability.

**Never cache long-lived:** payment state, procurement state, critical booking state, authorization state.

**Invalidation triggers:**
```
Schedule updated  → invalidate center:schedule:*
Booking created   → invalidate slot-availability cache for that slot
```

Redis additionally backs: rate limiting counters, and (where justified) short-lived distributed locks around booking hotspots.

---

## 12. AI/ML Service Design

### 12.1 Pipeline

```
Historical procurement/queue_events data
      ↓
Data cleaning
      ↓
Feature engineering
      ↓
Train/validation/test split
      ↓
Model training (Linear Regression → Random Forest → Gradient Boosting)
      ↓
Evaluation (MAE, RMSE, R² vs. baseline)
      ↓
Best model saved
      ↓
Served via FastAPI
      ↓
Consumed by NestJS backend
```

### 12.2 Input Features

`current_queue_length`, `active_counters`, `average_processing_time`, `arrivals_last_30_min`, `arrivals_last_60_min`, `booked_farmers`, `checked_in_farmers`, `hour_of_day`, `day_of_week`, `center_capacity`, `historical_processing_rate`.

### 12.3 Fallback (Baseline) Formula

When the ML service is unreachable or returns an error, the backend computes:

```
Estimated Wait ≈ (People Ahead × Average Processing Time) ÷ Active Counters
```
Example: `18 × 11 / 3 ≈ 66 minutes` (refined with currently-processing farmers and center-specific historical averages in the actual implementation).

**Design rule:** ML *improves* the estimate; it is never a dependency the farmer-facing feature can fail on.

### 12.4 Data Strategy

Real historical procurement data will not exist at MVP time. Phase 1 uses a clearly labeled **synthetic/prototype dataset**; Phase 2 incorporates pilot-collected data (if authorized); Phase 3 retrains on genuine operational data. Synthetic data must never be presented as real in any report or demo.

### 12.5 Smart Slot Recommendation (Future)

```
Farmer requirement + available slots + historical crowd + current capacity
      ↓
Recommendation engine
      ↓
"Recommended: 1:00–2:00 PM — expected crowd: LOW, expected wait: ~18 min"
```

---

## 13. Security Design

### 13.1 Authentication & Token Lifecycle

- Short-lived **access token** (e.g., minutes), longer-lived **refresh token** (e.g., days), both JWT-based.
- Refresh tokens are stored/revocable server-side via a session record — not purely stateless — so a compromised refresh token can be invalidated.
- Expirations are environment-configurable (`JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`).

### 13.2 RBAC

```
FARMER
  ├── create booking
  ├── view own queue
  └── view own procurement

CENTER_OPERATOR
  ├── manage assigned center's queue
  ├── process bookings
  └── update procurement stages

ADMIN
  ├── manage centers, users, crops
  ├── configure schedules
  └── view system-wide analytics
```

Role claims are never trusted from the client; every protected route is guarded server-side against the authenticated user's stored role.

### 13.3 Threat Model

| Threat | Mitigation |
|---|---|
| Credential theft | HTTPS everywhere + secure token lifecycle |
| Brute force | Rate limiting on auth/OTP endpoints |
| Unauthorized admin access | Server-enforced RBAC |
| SQL injection | Prisma parameterized queries |
| XSS | Output encoding + framework defaults |
| CSRF | Token/cookie strategy appropriate to the chosen session model |
| Token theft | Short-lived access tokens, revocable refresh tokens |
| Double booking | DB transaction + row lock + unique constraint |
| Data tampering | Audit logs on all admin/status-changing actions |
| API abuse | Per-user/per-IP rate limiting |
| Secret leakage | Environment variables / secret manager, never committed |

---

## 14. Notification Design

```
Business event (e.g. TOKEN_CALLED)
      ↓
Notification service
      ├── persist notification record
      ├── send via Firebase
      └── on failure → retry queue
```

**Design rule:** a failed push notification never rolls back the underlying booking/procurement transaction — the transaction commits first; notification delivery is best-effort with retry.

---

## 15. Deployment & Repository Architecture

### 15.1 Development

```
docker-compose
├── postgres
├── redis
├── backend
└── ml-service
```
Frontend apps run independently during development (Vite/Expo dev servers).

### 15.2 Production (Prototype/Pilot Scale)

```
Frontend  → Vercel (or equivalent static hosting)
Backend   → Render / Railway / AWS (containerized)
PostgreSQL → managed Postgres
Redis      → managed Redis
ML service → Dockerized FastAPI, deployed alongside backend
```

Environment variables (never hard-coded): `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ML_SERVICE_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

### 15.3 Scale-Up Path (Not Built Until Needed)

Load balancer → multiple API instances → managed Postgres (read replicas) → Redis cluster → message queue → object storage → CDN → advanced monitoring. Kubernetes/service mesh are deliberately deferred until actual load demonstrates the need.

---

## 16. Architecture Decision Records (ADRs)

**ADR-001 — PostgreSQL over MongoDB**
Decision: PostgreSQL. Reason: the domain (farmer → booking → slot → center → procurement → payment) is inherently relational and transaction-heavy; MongoDB would require simulating relational integrity the database already provides natively.

**ADR-002 — Redis is not the source of truth**
Decision: Redis for cache/transient queue state only. Reason: queue state must always be reconstructable from PostgreSQL; treating Redis as authoritative would create a data-loss risk on cache failure.

**ADR-003 — Modular monolith instead of microservices**
Decision: single NestJS deployable, internally modular. Reason: smaller operational footprint, simpler transactions, faster development for a small team; specific modules (notifications, ML, analytics) are designed to be extractable later if needed.

**ADR-004 — Separate ML service**
Decision: Python/FastAPI, independently deployed. Reason: Python's ML ecosystem and the need to iterate on/redeploy models without touching the transactional backend.

**ADR-005 — WebSocket (Socket.IO) for real-time queue updates**
Decision: Socket.IO over polling. Reason: genuine bidirectional low-latency updates are needed for the queue/token experience, at acceptable implementation complexity for this team size.

---

## 17. Appendix: Key Sequence Flows (Text Form)

**Booking flow**
```
Farmer → select crop/center/date/slot → POST /bookings
Backend → BEGIN TX → SELECT slot FOR UPDATE → check capacity
        → create booking → generate token → COMMIT
        → write queue_event → update Redis queue state
        → call ML (or fallback) for ETA → WebSocket: QUEUE_UPDATED
        → enqueue BOOKING_CONFIRMED notification
Farmer ← booking + token + initial ETA
```

**Check-in / queue-progress flow**
```
Operator → mark ARRIVED → status update (TX) → queue_event
         → call next token → status update (TX) → queue_event
         → Redis queue state update → WebSocket: TOKEN_CALLED / QUEUE_UPDATED
Farmer app ← live update, no manual refresh
```

**ML-unavailable flow**
```
Backend → POST /predict/waiting-time → timeout/error
        → fallback formula computed in-process
        → response returned to farmer indistinguishably (no error surfaced)
```
