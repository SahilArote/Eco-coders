# ARCHITECTURAL DESIGN & IMPLEMENTATION MASTERPLAN
## Intelligent Agricultural Procurement & Queue Management Platform
**Target System:** Production-Grade Modular Monolith (NestJS + PostgreSQL + Redis + Socket.IO + FastAPI ML)  
**Document Code:** `AGRI-PROC-BACKEND-ARCH-V1.0`  
**Role:** Principal Backend Architect & Senior Full-Stack Lead  
**Status:** COMPLETE ARCHITECTURAL SPECIFICATION — PENDING USER APPROVAL FOR IMPLEMENTATION

---

## 1. REPOSITORY INSPECTION & VERIFIED BASELINE

A thorough, rigorous audit of the workspace was conducted on the repository. Every directory, file, and schema was inspected.

### 1.1 Filesystem Audit Findings

| Component / Path | Current Status | Description & Verified State |
|---|---|---|
| `backend/` | **MISSING — NEEDS IMPLEMENTATION** | Empty directory. No `package.json`, no NestJS source, no Prisma schema, no migrations, no configs. |
| `frontend/` | **MISSING — NEEDS IMPLEMENTATION** | Empty directory intended for the Operator & Admin Web Dashboard. |
| `app/` | **PARTIAL — NEEDS REVIEW** | React Native (Expo) Farmer Mobile App is present with complete UI screens, navigation, i18n (en/hi/mr), theme, and mock client state in `app/src/state/useAppStore.ts` and `app/src/services/authService.ts`. Uses mock in-memory and `AsyncStorage` state; no real backend API client or WebSocket integration hooked up yet. |
| `SRS-Agricultural-Procurement-Platform.md` | **EXISTS — BASELINE VERIFIED** | 466 lines. Authoritative functional & non-functional requirements specification (DoCA SIH PS 26032). |
| `SDD-Agricultural-Procurement-Platform.md` | **EXISTS — BASELINE VERIFIED** | 898 lines. Authoritative software design document detailing modular monolith architecture, schema, state machine, and ADRs. |
| `TDD-Implementation-Plan-Agricultural-Procurement-Platform.md` | **EXISTS — BASELINE VERIFIED** | 382 lines. Technical design document and implementation roadmap. |
| `docker-compose.yml` | **MISSING — NEEDS IMPLEMENTATION** | Not present at root or in `backend/`. |
| `.env.example` | **MISSING — NEEDS IMPLEMENTATION** | Not present at root or in `backend/`. |

---

### 1.2 Model & Feature Readiness Audit Matrix

| Domain Model / Feature | Status | Verification Detail |
|---|---|---|
| **Authentication System** | `MISSING — NEEDS IMPLEMENTATION` | Farmer mobile app simulates OTP (`123456`) and dummy login locally. No backend JWT, session management, or bcrypt hashing exists. |
| **JWT Implementation** | `MISSING — NEEDS IMPLEMENTATION` | No JWT signing, verification, or refresh token rotation strategy implemented in backend. |
| **User Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`id`, `phone`, `email`, `password_hash`, `role`, `status`), not yet in Prisma schema. |
| **Farmer Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 and typed in `app/src/types/index.ts` (`FarmerProfile`, `bankDetails`, `kycStatus`). Needs Prisma model. |
| **Role Model / RBAC** | `MISSING — NEEDS IMPLEMENTATION` | Roles `FARMER`, `CENTER_OPERATOR`, `ADMIN` typed in mobile app, but no NestJS RBAC guards, decorators, or permission checks exist. |
| **Booking Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2. No database table, no atomic transactional reservation logic, no capacity validation on backend. |
| **Procurement Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`procurements` table). No backend state machine or persistence. |
| **Queue Implementation** | `MISSING — NEEDS IMPLEMENTATION` | Mobile app uses client-side simulated counter increment. No server-side queue engine, no PostgreSQL `queue_events`, no Redis cache. |
| **Center Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`procurement_centers` table). Mobile app has static hardcoded mock centers in `useAppStore.ts`. |
| **Counter Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`counters` table with `center_id`, `counter_number`, `operator_id`, `status`). Not implemented. |
| **Schedule Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`procurement_schedules` table). Needs implementation. |
| **Slot Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`slots` table with `capacity`, `booked_count`). Concurrency-safe slot lock missing. |
| **Crop Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`crops` table with MSP rates and units). Needs implementation. |
| **Payment Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`payments` table for status tracking). Needs implementation. |
| **Quality Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`quality_checks` table with moisture, grade, status). Needs implementation. |
| **Weighment Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`weighments` table with gross, tare, net weight). Needs implementation. |
| **Notification Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`notifications` table). Mobile app has client-only notifications array. Needs backend persistence & push. |
| **Audit Log Model** | `MISSING — NEEDS IMPLEMENTATION` | Specified in SDD §6.2 (`audit_logs` table for immutable operational audit trail). Needs implementation. |
| **WebSocket Implementation**| `MISSING — NEEDS IMPLEMENTATION` | No Socket.IO gateway, room management, or event emitters exist. |
| **Redis Integration** | `MISSING — NEEDS IMPLEMENTATION` | No Redis client, transient queue store, distributed lock, or cache layer exists. |
| **ML Integration** | `MISSING — NEEDS IMPLEMENTATION` | No FastAPI ML service or NestJS ML HTTP client exists. |
| **Firebase FCM Integration**| `MISSING — NEEDS IMPLEMENTATION` | No Firebase Admin SDK integration exists. |

---

## 2. SOURCE OF TRUTH & ARCHITECTURAL FOUNDATION

The project requirements baseline is strictly anchored on:
1. **SRS (Software Requirements Specification)** — PS 26032 baseline, defining the exact problems: information asymmetry, physical queue uncertainty, uncoordinated arrivals, and status blind spots.
2. **SDD (Software Design Document)** — Architectural specification mandating a **Modular Monolith** in NestJS, PostgreSQL as authoritative source of truth, Redis as transient cache/queue, Socket.IO for real-time push, and an independent FastAPI ML service.
3. **TDD (Technical Implementation Plan)** — Engineering targets, test strategy, and phased deliverables.

### Technology Stack Constraints
- **Backend Framework:** Node.js (v20+ LTS), NestJS (v10+), TypeScript (v5+)
- **Transactional Database:** PostgreSQL 16+ (Strict ACID, 3NF transactional modeling)
- **Object-Relational Mapping:** Prisma ORM 5+ (Parameterized queries, type-safe migrations)
- **Transient State / Cache:** Redis 7+ (In-memory queue mirror, rate limiting, distributed locking)
- **Real-Time Push:** Socket.IO / WebSockets (Room-based pub/sub: `center:{id}`, `booking:{id}`, `user:{id}`)
- **Predictive AI/ML:** Python 3.11 + FastAPI + Scikit-Learn (Tabular waiting-time regression with non-ML deterministic fallback)
- **Push Notifications:** Firebase Cloud Messaging (FCM via Firebase Admin SDK)

### Non-Negotiable Architecture Constraints
- **No Microservices Sprawl:** Do not split into independent network services for Auth, Booking, Centers, etc. A **Modular Monolith** with strict module encapsulation inside NestJS delivers zero network serialization overhead, single-database ACID transactions, and atomic multi-entity operations.
- **No Heavy Distributed Streaming:** Kafka, RabbitMQ, and event sourcing are strictly out of scope for MVP. BullMQ over Redis or in-process EventEmitter2 handles asynchronous jobs.
- **No GraphQL:** High overhead and schema complexity for mobile low-bandwidth networks. Clean REST endpoints with JSON envelope contracts are required.
- **No Kubernetes / Service Mesh:** Docker Compose for development and single container / PaaS deployment for MVP.

---

## 3. BACKEND RESPONSIBILITY & DOMAIN BOUNDARIES

The backend is the **sole authoritative source of business truth**. Under no circumstances will business rules, state validations, or calculations be delegated to or trusted from the client:

1. **Authentication & RBAC:** All identity, token signing, role verification, and center-scoping are validated on every request.
2. **Capacity & Reservation Authority:** Slot availability, overbooking checks, and token generation are strictly executed inside PostgreSQL row-level locked transactions.
3. **State Machine Transitions:** The procurement lifecycle (`BOOKED` $\rightarrow$ `PAYMENT_COMPLETED`) is an immutable server-side finite state machine. Client requests attempting an illegal jump (e.g. `BOOKED` directly to `COMPLETED`) fail with HTTP 409 Conflict.
4. **Weighment & Payout Computations:** Net weight calculation (`gross - tare`) and MSP payment calculation (`quantity * mspRate`) are strictly computed on the backend.
5. **Real-time Event Orchestration:** The backend dictates when and what room receives a WebSocket broadcast upon transactional commit.
6. **Graceful Degradation:** Core operations (booking, checking in, weighing) continue without interruption even if Redis, ML service, or Firebase FCM are completely offline.

---

## 4. SYSTEM ARCHITECTURE

```
                               ┌────────────────────────┐
                               │   Farmer Mobile App    │
                               │  (React Native / Expo) │
                               └───────────┬────────────┘
                                           │
                                     HTTPS / WSS
                                           │
┌──────────────────────────────────────────▼────────────────────────────────────────┐
│                              NESTJS MODULAR MONOLITH                              │
│                                                                                   │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │      Auth Module      │ │      Users Module      │ │     Farmers Module     │  │
│  │ (JWT, Refresh, OTP)   │ │  (Identity, Password)  │ │   (Profile, KYC)       │  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │    Centers Module     │ │    Schedules Module    │ │      Slots Module      │  │
│  │  (Centers, Counters)  │ │   (Date Range, Cap)    │ │ (Availability, Locks)  │  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │    Bookings Module    │ │      Queue Module      │ │   Procurement Module   │  │
│  │ (Tx Capacity, Tokens) │ │(Arrival, Call, Events) │ │ (State Machine, Stages)│  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │    Quality Module     │ │    Weighment Module    │ │    Payments Module     │  │
│  │ (Moisture, Grading)   │ │ (Gross, Tare, Net Wt)  │ │ (Status Tracking, Sim) │  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │  Realtime / Gateway   │ │  Notifications Module  │ │    Analytics Module    │  │
│  │(Socket.IO Room Engine)│ │ (FCM Dispatch + Store) │ │(Aggregates, Center KPI)│  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │     Audit Module      │ │    Feedback Module     │ │       ML Module        │  │
│  │(Immutable Event Logs) │ │(Grievances, Ratings)   │ │(FastAPI Client+Fallback│  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
└──────────────────┬────────────────────────────────────────────┬───────────────────┘
                   │                                            │
        SQL Queries / Transactions                 Fast Cache / Transient Queue
                   │                                            │
         ┌─────────▼────────┐                         ┌─────────▼────────┐
         │    PostgreSQL    │                         │      Redis       │
         │ (Source of Truth)│                         │ (Transient State)│
         └─────────┬────────┘                         └──────────────────┘
                   │
            Queue Snapshots
                   │
         ┌─────────▼────────┐                         ┌──────────────────┐
         │    FastAPI ML    │                         │   Firebase FCM   │
         │   (Prediction)   │                         │  (Push Delivery) │
         └────────────────┘                         └──────────────────┘
```

### Component Roles & Responsibilities
1. **NestJS Modular Backend:** Hosts the application layers (Controllers, Services, Repositories). Coordinates database transactions, pushes real-time events to Socket.IO, manages Redis caching, calls the ML service with deterministic circuit breaking, and queues push notifications.
2. **PostgreSQL (System of Record):** Authoritative persistence for all users, profiles, centers, schedules, slots, bookings, tokens, procurements, quality checks, weighments, payments, notifications, queue history, and audit logs.
3. **Redis (Transient Acceleration & Lock Layer):** Holds live active queue snapshots per center, manages token counter sequences, provides distributed locks for slot-booking hotspots, rate limits auth endpoints, and serves cached master data. If Redis restarts or crashes, state is seamlessly reconstructed from PostgreSQL.
4. **FastAPI ML Service (Independent Python Container):** Exposes `POST /predict/waiting-time`. Consumes tabular queue metrics (queue length, active counters, arrival rates, time of day) and outputs predicted wait minutes. Does not touch the database directly; communicates via REST.
5. **Firebase Cloud Messaging (FCM):** Transports push notifications to Android farmer devices. Managed asynchronously via a background task pool so network latency or third-party downtime never slows HTTP API response times.

---

## 5. BACKEND MODULE ARCHITECTURE (NESTJS MODULAR MONOLITH)

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/                          # Cross-cutting concerns & shared infrastructure
│   │   ├── constants/                   # Error codes, injection tokens, regex patterns
│   │   ├── decorators/                  # @CurrentUser(), @Roles(), @CenterScoped(), @Public()
│   │   ├── dto/                         # PaginationDto, BaseFilterDto
│   │   ├── enums/                       # Role, ProcurementStatus, SlotStatus, QualityGrade
│   │   ├── filters/                     # GlobalExceptionFilter (Standard Error Contract)
│   │   ├── guards/                      # JwtAuthGuard, RolesGuard, CenterScopeGuard
│   │   ├── interceptors/                # TransformResponseInterceptor, LoggingInterceptor
│   │   ├── middleware/                  # RequestIdMiddleware, CorrelationMiddleware
│   │   ├── pipes/                       # ValidationPipe, ParseDatePipe
│   │   └── utils/                       # TokenFormatter, DateHelpers, WeightCalculator
│   │
│   ├── config/                          # Typed ConfigModule (database, redis, jwt, ml, fcm)
│   ├── prisma/                          # PrismaService, PrismaModule, extensions
│   ├── redis/                           # RedisService, RedisModule, CacheService, LockService
│   ├── realtime/                        # RealtimeModule, EventsGateway, RoomManager
│   │
│   ├── auth/                            # Registration, login, refresh token, password hashing
│   ├── users/                           # Base user identity, credentials, role mapping
│   ├── farmers/                         # Farmer profile, KYC details, bank account validation
│   ├── operators/                       # Center operator management and center assignment
│   ├── admins/                          # Platform administration and system oversight
│   ├── centers/                         # Procurement centers, geofencing, capacity
│   ├── counters/                        # Counter allocation, operator-to-counter binding
│   ├── crops/                           # Crop master data, MSP rates, measurement units
│   ├── schedules/                       # Procurement window, center-crop schedule linkage
│   ├── slots/                           # Slot generation, real-time availability, capacity lock
│   ├── bookings/                        # Concurrency-safe booking engine, token creation
│   ├── queue/                           # Check-in, live queue state, token calling, queue events
│   ├── procurement/                     # Authoritative state machine engine, lifecycle records
│   ├── quality/                         # Quality inspection capture (moisture, grading, pass/fail)
│   ├── weighment/                       # Weighbridge integration, gross/tare/net calculation
│   ├── payments/                        # Payment tracking, DBT reference logging, status simulation
│   ├── notifications/                   # In-app notifications persistence & FCM push queue
│   ├── analytics/                       # Operational KPIs, wait time analytics, center metrics
│   ├── feedback/                        # Farmer grievances, ratings, resolution tracking
│   ├── audit/                           # Immutable audit log recorder
│   └── ml/                              # HTTP client for ML service with baseline fallback
│
├── prisma/
│   ├── schema.prisma                    # Complete PostgreSQL schema
│   ├── migrations/                      # Version-controlled migrations
│   └── seed.ts                          # Comprehensive synthetic seed script
│
├── test/                                # Jest unit, integration, and e2e test suites
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── tsconfig.json
```

### Module Boundaries & Circular Dependency Prevention
- **Core Principles:** Modules communicate via exported Services, never by directly querying another module's Prisma models.
- **Dependency Flow:** Higher-level domain modules (`BookingsModule`, `ProcurementModule`) inject services from foundational modules (`PrismaModule`, `RealtimeModule`, `NotificationsModule`, `AuditModule`).
- **Circular Dependency Elimination:** Foundational infrastructure modules (`PrismaModule`, `RedisModule`, `RealtimeModule`) never import domain feature modules. Domain events that trigger side effects (e.g. Booking Created $\rightarrow$ Notification & Real-Time Broadcast) utilize NestJS `EventEmitter2` or direct one-way service calls to decouple producer and consumer.

---

## 6. DOMAIN MODEL & CONCEPTUAL RELATIONSHIPS

```
                                  ┌──────────────┐
                                  │     User     │
                                  └──────┬───────┘
                                         │ 1:1
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
       ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
       │   Farmer    │            │  Operator   │            │    Admin    │
       └──────┬──────┘            └──────┬──────┘            └─────────────┘
              │                          │
              │                          │ assigned to
              │                          ▼
              │                   ┌──────────────┐
              │                   │  Procurement │ 1:N
              │                   │    Center    ├───────────┐
              │                   └──────┬───────┘           │
              │                          │ 1:N               ▼
              │                          │            ┌─────────────┐
              │                          ▼            │   Counter   │
              │                   ┌──────────────┐    └─────────────┘
              │ 1:N               │ Procurement  │
              │                   │   Schedule   │
              │                   └──────┬───────┘
              │                          │ 1:N
              │                          ▼
              │                   ┌──────────────┐
              │                   │     Slot     │
              │                   └──────┬───────┘
              │                          │ 1:N
              ▼                          ▼
       ┌─────────────────────────────────────────┐
       │                 Booking                 │
       │     (Center, Slot, Crop, TokenNumber)   │
       └────────────────────┬────────────────────┘
                            │ 1:1
                            ▼
       ┌─────────────────────────────────────────┐
       │               Procurement               │
       │            (Lifecycle State)            │
       └──────┬─────────────┬─────────────┬──────┘
              │ 1:1         │ 1:1         │ 1:1
              ▼             ▼             ▼
       ┌─────────────┐┌─────────────┐┌─────────────┐
       │   Quality   ││  Weighment  ││   Payment   │
       │    Check    ││             ││             │
       └─────────────┘└─────────────┘└─────────────┘
```

---

## 7. DATABASE ARCHITECTURE (POSTGRESQL & PRISMA)

The PostgreSQL schema is structured in strict Third Normal Form (3NF). Every entity includes UUID primary keys, audit timestamps, explicit constraints, and foreign key relations.

### 7.1 Prisma Schema Definition

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  FARMER
  CENTER_OPERATOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

enum CenterStatus {
  OPEN
  BUSY
  CLOSED
  MAINTENANCE
}

enum SlotStatus {
  AVAILABLE
  FEW_LEFT
  FULL
  CANCELLED
}

enum ProcurementStatus {
  BOOKED
  ARRIVED
  WAITING
  PROCESSING
  QUALITY_CHECK
  WEIGHMENT
  ACCEPTED
  REJECTED
  COMPLETED
  PAYMENT_PROCESSING
  PAYMENT_COMPLETED
  CANCELLED
}

enum QualityGrade {
  GRADE_A
  GRADE_B
  REJECTED
}

enum QualityStatus {
  PASSED
  FAILED
}

enum PaymentStatus {
  PAYMENT_PENDING
  PAYMENT_PROCESSING
  PAYMENT_COMPLETED
  PAYMENT_FAILED
}

enum NotificationType {
  TOKEN_CALLED
  STATUS_CHANGE
  PAYMENT
  REMINDER
  URGENT_ALERT
}

model User {
  id            String       @id @default(uuid()) @db.Uuid
  phone         String       @unique @db.VarChar(15)
  email         String?      @unique @db.VarChar(255)
  passwordHash  String       @map("password_hash") @db.VarChar(255)
  role          Role         @default(FARMER)
  status        UserStatus   @default(ACTIVE)
  lastLoginAt   DateTime?    @map("last_login_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  farmerProfile Farmer?
  operator      CenterOperator?
  qualityChecks QualityCheck[]
  weighments    Weighment[]
  notifications Notification[]
  sessions      UserSession[]

  @@index([phone])
  @@index([role, status])
  @@map("users")
}

model UserSession {
  id           String    @id @default(uuid()) @db.Uuid
  userId       String    @map("user_id") @db.Uuid
  refreshToken String    @unique @map("refresh_token") @db.VarChar(512)
  ipAddress    String?   @map("ip_address") @db.VarChar(45)
  userAgent    String?   @map("user_agent") @db.Text
  isRevoked    Boolean   @default(false) @map("is_revoked")
  expiresAt    DateTime  @map("expires_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([refreshToken])
  @@map("user_sessions")
}

model Farmer {
  id                 String       @id @default(uuid()) @db.Uuid
  userId             String       @unique @map("user_id") @db.Uuid
  fullName           String       @map("full_name") @db.VarChar(100)
  village            String       @db.VarChar(100)
  district           String       @db.VarChar(100)
  state              String       @db.VarChar(100)
  preferredLanguage  String       @default("en") @map("preferred_language") @db.VarChar(5)
  landSizeAcres      Decimal      @default(0.0) @map("land_size_acres") @db.Decimal(6, 2)
  registeredCrops    String[]     @default([]) @map("registered_crops")
  kycStatus          String       @default("NOT_COMPLETED") @map("kyc_status") @db.VarChar(20)
  bankAccountHolder  String?      @map("bank_account_holder") @db.VarChar(100)
  bankName           String?      @map("bank_name") @db.VarChar(100)
  bankAccountMasked  String?      @map("bank_account_masked") @db.VarChar(30)
  bankAccountNumber  String?      @map("bank_account_number") @db.VarChar(30)
  ifscCode           String?      @map("ifsc_code") @db.VarChar(15)
  bankVerifiedAt     DateTime?    @map("bank_verified_at")
  createdAt          DateTime     @default(now()) @map("created_at")
  updatedAt          DateTime     @updatedAt @map("updated_at")

  user               User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookings           Booking[]
  procurements       Procurement[]
  feedback           Feedback[]

  @@index([userId])
  @@index([district, state])
  @@map("farmers")
}

model ProcurementCenter {
  id                   String            @id @default(uuid()) @db.Uuid
  code                 String            @unique @db.VarChar(30)
  name                 String            @db.VarChar(150)
  address              String            @db.Text
  village              String            @db.VarChar(100)
  district             String            @db.VarChar(100)
  state                String            @db.VarChar(100)
  latitude             Decimal           @db.Decimal(9, 6)
  longitude            Decimal           @db.Decimal(9, 6)
  status               CenterStatus      @default(OPEN)
  dailyCapacityQuintals Int              @default(1000) @map("daily_capacity_quintals")
  contactPhone         String?           @map("contact_phone") @db.VarChar(20)
  createdAt            DateTime          @default(now()) @map("created_at")
  updatedAt            DateTime          @updatedAt @map("updated_at")

  counters             Counter[]
  operators            CenterOperator[]
  schedules            ProcurementSchedule[]
  bookings             Booking[]
  procurements         Procurement[]
  queueEvents          QueueEvent[]

  @@index([district, state])
  @@index([status])
  @@map("procurement_centers")
}

model Counter {
  id             String            @id @default(uuid()) @db.Uuid
  centerId       String            @map("center_id") @db.Uuid
  counterNumber  Int               @map("counter_number")
  operatorId     String?           @map("operator_id") @db.Uuid
  status         String            @default("ACTIVE") @db.VarChar(20)
  createdAt      DateTime          @default(now()) @map("created_at")
  updatedAt      DateTime          @updatedAt @map("updated_at")

  center         ProcurementCenter @relation(fields: [centerId], references: [id], onDelete: Cascade)
  operator       CenterOperator?   @relation(fields: [operatorId], references: [id])

  @@unique([centerId, counterNumber])
  @@index([centerId, status])
  @@map("counters")
}

model CenterOperator {
  id         String            @id @default(uuid()) @db.Uuid
  userId     String            @unique @map("user_id") @db.Uuid
  centerId   String            @map("center_id") @db.Uuid
  createdAt  DateTime          @default(now()) @map("created_at")
  updatedAt  DateTime          @updatedAt @map("updated_at")

  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  center     ProcurementCenter @relation(fields: [centerId], references: [id], onDelete: Cascade)
  counters   Counter[]

  @@index([centerId])
  @@map("center_operators")
}

model Crop {
  id                 String                @id @default(uuid()) @db.Uuid
  code               String                @unique @db.VarChar(30)
  name               String                @db.VarChar(100)
  nameHi             String?               @map("name_hi") @db.VarChar(100)
  category           String                @db.VarChar(50)
  mspRatePerQuintal  Decimal               @map("msp_rate_per_quintal") @db.Decimal(10, 2)
  unit               String                @default("Quintal") @db.VarChar(20)
  isActive           Boolean               @default(true) @map("is_active")
  createdAt          DateTime              @default(now()) @map("created_at")
  updatedAt          DateTime              @updatedAt @map("updated_at")

  schedules          ProcurementSchedule[]
  bookings           Booking[]

  @@index([code])
  @@index([isActive])
  @@map("crops")
}

model ProcurementSchedule {
  id            String            @id @default(uuid()) @db.Uuid
  centerId      String            @map("center_id") @db.Uuid
  cropId        String            @map("crop_id") @db.Uuid
  startDate     DateTime          @map("start_date") @db.Date
  endDate       DateTime          @map("end_date") @db.Date
  dailyCapacity Int               @map("daily_capacity")
  status        String            @default("ACTIVE") @db.VarChar(20)
  createdAt     DateTime          @default(now()) @map("created_at")
  updatedAt     DateTime          @updatedAt @map("updated_at")

  center        ProcurementCenter @relation(fields: [centerId], references: [id], onDelete: Cascade)
  crop          Crop              @relation(fields: [cropId], references: [id], onDelete: Cascade)
  slots         Slot[]

  @@index([centerId, cropId])
  @@index([startDate, endDate])
  @@map("procurement_schedules")
}

model Slot {
  id           String              @id @default(uuid()) @db.Uuid
  scheduleId   String              @map("schedule_id") @db.Uuid
  slotDate     DateTime            @map("slot_date") @db.Date
  startTime    String              @map("start_time") @db.VarChar(10)
  endTime      String              @map("end_time") @db.VarChar(10)
  capacity     Int
  bookedCount  Int                 @default(0) @map("booked_count")
  status       SlotStatus          @default(AVAILABLE)
  createdAt    DateTime            @default(now()) @map("created_at")
  updatedAt    DateTime            @updatedAt @map("updated_at")

  schedule     ProcurementSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  bookings     Booking[]

  @@unique([scheduleId, slotDate, startTime])
  @@index([slotDate, status])
  @@map("slots")
}

model Booking {
  id                        String            @id @default(uuid()) @db.Uuid
  farmerId                  String            @map("farmer_id") @db.Uuid
  slotId                    String            @map("slot_id") @db.Uuid
  centerId                  String            @map("center_id") @db.Uuid
  cropId                    String            @map("crop_id") @db.Uuid
  estimatedQuantityQuintals Decimal           @map("estimated_quantity_quintals") @db.Decimal(8, 2)
  vehicleType               String?           @map("vehicle_type") @db.VarChar(30)
  tokenNumber               String            @map("token_number") @db.VarChar(20)
  status                    ProcurementStatus @default(BOOKED)
  qrPayload                 String            @map("qr_payload") @db.Text
  arrivalAt                 DateTime?         @map("arrival_at")
  processingStartedAt       DateTime?         @map("processing_started_at")
  completedAt               DateTime?         @map("completed_at")
  cancelledAt               DateTime?         @map("cancelled_at")
  createdAt                 DateTime          @default(now()) @map("created_at")
  updatedAt                 DateTime          @updatedAt @map("updated_at")

  farmer                    Farmer            @relation(fields: [farmerId], references: [id])
  slot                      Slot              @relation(fields: [slotId], references: [id])
  center                    ProcurementCenter @relation(fields: [centerId], references: [id])
  crop                      Crop              @relation(fields: [cropId], references: [id])
  procurement               Procurement?
  queueEvents               QueueEvent[]
  feedback                  Feedback[]

  @@unique([centerId, slotId, tokenNumber])
  @@index([farmerId, status])
  @@index([centerId, status, createdAt])
  @@index([slotId])
  @@map("bookings")
}

model QueueEvent {
  id             String            @id @default(uuid()) @db.Uuid
  centerId       String            @map("center_id") @db.Uuid
  bookingId      String?           @map("booking_id") @db.Uuid
  eventType      String            @map("event_type") @db.VarChar(50)
  queueLength    Int               @map("queue_length")
  activeCounters Int               @map("active_counters")
  eventTimestamp DateTime          @default(now()) @map("event_timestamp")
  metadata       Json?

  center         ProcurementCenter @relation(fields: [centerId], references: [id], onDelete: Cascade)
  booking        Booking?          @relation(fields: [bookingId], references: [id], onDelete: SetNull)

  @@index([centerId, eventTimestamp])
  @@map("queue_events")
}

model Procurement {
  id                String            @id @default(uuid()) @db.Uuid
  bookingId         String            @unique @map("booking_id") @db.Uuid
  farmerId          String            @map("farmer_id") @db.Uuid
  centerId          String            @map("center_id") @db.Uuid
  status            ProcurementStatus @default(BOOKED)
  acceptedQuantity  Decimal?          @map("accepted_quantity") @db.Decimal(8, 2)
  rejectionReason   String?           @map("rejection_reason") @db.Text
  startedAt         DateTime          @default(now()) @map("started_at")
  completedAt       DateTime?         @map("completed_at")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  booking           Booking           @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  farmer            Farmer            @relation(fields: [farmerId], references: [id])
  center            ProcurementCenter @relation(fields: [centerId], references: [id])
  qualityCheck      QualityCheck?
  weighment         Weighment?
  payment           Payment?

  @@index([centerId, status])
  @@index([farmerId])
  @@map("procurements")
}

model QualityCheck {
  id                      String        @id @default(uuid()) @db.Uuid
  procurementId           String        @unique @map("procurement_id") @db.Uuid
  moisturePercentage      Decimal       @map("moisture_percentage") @db.Decimal(5, 2)
  moistureStandardMax     Decimal       @default(12.0) @map("moisture_standard_max") @db.Decimal(5, 2)
  foreignMatterPercentage Decimal       @default(0.0) @map("foreign_matter_percentage") @db.Decimal(5, 2)
  qualityGrade            QualityGrade  @map("quality_grade")
  qualityStatus           QualityStatus @map("quality_status")
  remarks                 String?       @db.Text
  checkedById             String        @map("checked_by_id") @db.Uuid
  checkedAt               DateTime      @default(now()) @map("checked_at")

  procurement             Procurement   @relation(fields: [procurementId], references: [id], onDelete: Cascade)
  inspector               User          @relation(fields: [checkedById], references: [id])

  @@map("quality_checks")
}

model Weighment {
  id             String      @id @default(uuid()) @db.Uuid
  procurementId  String      @unique @map("procurement_id") @db.Uuid
  grossWeightKg  Decimal     @map("gross_weight_kg") @db.Decimal(10, 2)
  tareWeightKg   Decimal     @map("tare_weight_kg") @db.Decimal(10, 2)
  netWeightKg    Decimal     @map("net_weight_kg") @db.Decimal(10, 2)
  netQuintals    Decimal     @map("net_quintals") @db.Decimal(10, 2)
  weighbridgeId  String?     @map("weighbridge_id") @db.VarChar(50)
  weighedById    String      @map("weighed_by_id") @db.Uuid
  weighedAt      DateTime    @default(now()) @map("weighed_at")

  procurement    Procurement @relation(fields: [procurementId], references: [id], onDelete: Cascade)
  operator       User        @relation(fields: [weighedById], references: [id])

  @@map("weighments")
}

model Payment {
  id                 String        @id @default(uuid()) @db.Uuid
  procurementId      String        @unique @map("procurement_id") @db.Uuid
  amount             Decimal       @db.Decimal(12, 2)
  mspRate            Decimal       @map("msp_rate") @db.Decimal(10, 2)
  quantityQuintals   Decimal       @map("quantity_quintals") @db.Decimal(8, 2)
  currency           String        @default("INR") @db.VarChar(5)
  status             PaymentStatus @default(PAYMENT_PENDING)
  dbtReferenceNumber String?       @map("dbt_reference_number") @db.VarChar(100)
  bankName           String?       @map("bank_name") @db.VarChar(100)
  accountMasked      String?       @map("account_masked") @db.VarChar(30)
  initiatedAt        DateTime?     @map("initiated_at")
  completedAt        DateTime?     @map("completed_at")
  createdAt          DateTime      @default(now()) @map("created_at")
  updatedAt          DateTime      @updatedAt @map("updated_at")

  procurement        Procurement   @relation(fields: [procurementId], references: [id], onDelete: Cascade)

  @@index([status])
  @@map("payments")
}

model Notification {
  id         String           @id @default(uuid()) @db.Uuid
  userId     String           @map("user_id") @db.Uuid
  type       NotificationType
  title      String           @db.VarChar(150)
  message    String           @db.Text
  channel    String           @default("IN_APP") @db.VarChar(20)
  isRead     Boolean          @default(false) @map("is_read")
  metadata   Json?
  sentAt     DateTime?        @map("sent_at")
  readAt     DateTime?        @map("read_at")
  createdAt  DateTime         @default(now()) @map("created_at")

  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  actorId    String   @map("actor_id") @db.Uuid
  actorRole  String   @map("actor_role") @db.VarChar(30)
  action     String   @db.VarChar(100)
  entityType String   @map("entity_type") @db.VarChar(50)
  entityId   String   @map("entity_id") @db.Uuid
  oldValue   Json?    @map("old_value")
  newValue   Json?    @map("new_value")
  ipAddress  String?  @map("ip_address") @db.VarChar(45)
  requestId  String?  @map("request_id") @db.VarChar(100)
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([entityType, entityId])
  @@index([actorId, createdAt])
  @@map("audit_logs")
}

model Feedback {
  id         String   @id @default(uuid()) @db.Uuid
  farmerId   String   @map("farmer_id") @db.Uuid
  bookingId  String?  @map("booking_id") @db.Uuid
  category   String   @db.VarChar(50)
  rating     Int      @default(5)
  comments   String   @db.Text
  status     String   @default("SUBMITTED") @db.VarChar(20)
  resolvedAt DateTime? @map("resolved_at")
  createdAt  DateTime @default(now()) @map("created_at")

  farmer     Farmer   @relation(fields: [farmerId], references: [id], onDelete: Cascade)
  booking    Booking? @relation(fields: [bookingId], references: [id], onDelete: SetNull)

  @@index([farmerId])
  @@map("feedback")
}
```

---

## 8. TRANSACTIONAL INTEGRITY & CONCURRENCY CONTROLS

The Agricultural Procurement platform processes mission-critical physical operations. The table below documents where **PostgreSQL transactions (`prisma.$transaction`)** are strictly required and how race conditions are prevented:

| Operation | Concurrency Threat | Required Strategy & Isolation Level | Fail-Safe Behavior |
|---|---|---|---|
| **Slot Booking** | Multiple farmers race for the final available slot capacity. | `prisma.$transaction(async (tx) => { ... })` with raw query `SELECT id, capacity, booked_count FROM slots WHERE id = $1 FOR UPDATE`. Re-check `booked_count < capacity`. Increment `booked_count`. | Returns HTTP 409 `BOOKING_SLOT_FULL` if limit exceeded. Database constraint acts as safety net. |
| **Token Numbering** | Multiple simultaneous bookings at the same center generate identical token strings. | Center-scoped daily atomic counter sequence in Redis `INCR center:{id}:date:{date}:seq`, mirrored and verified in database transaction. | Unique constraint `@@unique([centerId, slotId, tokenNumber])` aborts transaction if collision occurs. |
| **Check-in / Arrival** | Operator scans QR code multiple times or concurrent network duplicate requests occur. | Idempotency key evaluation + transactional check that booking status is currently `BOOKED`. | If already `ARRIVED` or beyond, returns current state idempotently without duplicate insertion. |
| **Token Calling** | Two operators at different counters click "Call Next" simultaneously. | Redis distributed lock on center queue `redlock.acquire('queue:call:' + centerId)` + DB update with `WHERE current_token = expected_token`. | Second operator receives next available token or `QUEUE_EMPTY`; no two counters serve the same token. |
| **Quality & Weighment** | Concurrent operator submissions overwrite grade or weight. | 1:1 relation with unique constraint `procurement_id` on `quality_checks` and `weighments` inside a transaction. | Existing record update requires explicit version / timestamp check; duplicate insert returns HTTP 409 Conflict. |
| **Payment Status Update** | Simultaneous status transition calls. | State transition matrix check inside transaction with row lock on `payments` and `procurements`. | Rejects unauthorized or skipped state jumps with HTTP 409 `PROCUREMENT_INVALID_TRANSITION`. |

---

## 9. BOOKING SYSTEM & TOKEN GENERATION

### 9.1 End-to-End Booking Execution Sequence

```
Farmer Client           NestJS Backend              PostgreSQL                 Redis / Realtime
     │                         │                         │                            │
     │── POST /api/v1/bookings─▶│                         │                            │
     │   (centerId, slotId,    │                         │                            │
     │    cropId, quantity)    │                         │                            │
     │                         │── BEGIN TRANSACTION ───▶│                            │
     │                         │── SELECT slot           │                            │
     │                         │   FOR UPDATE ──────────▶│                            │
     │                         │◀─ slot (capacity, count)│                            │
     │                         │                         │                            │
     │                         │ [Capacity Check]        │                            │
     │                         │ If full: ROLLBACK       │                            │
     │                         │                         │                            │
     │                         │── Generate Token Num ──▶│                            │
     │                         │── INSERT Booking ──────▶│                            │
     │                         │── INSERT Procurement ──▶│                            │
     │                         │── UPDATE Slot count++ ─▶│                            │
     │                         │── COMMIT TRANSACTION ──▶│                            │
     │                         │                         │                            │
     │                         │── Invalidate Slot Cache ────────────────────────────▶│
     │                         │── Push WebSocket (SLOT_AVAILABILITY_CHANGED) ───────▶│
     │                         │── Enqueue Notification ─────────────────────────────▶│
     │◀── 201 Created ─────────│                                                      │
     │    (bookingId, token,   │                                                      │
     │     qrPayload)          │                                                      │
```

### 9.2 Token Generation Specification
- **Format:** `[CenterPrefix][DailySequence]` (e.g. `A105`, `B024`, `N112`).
- **Prefix:** Centers use an alphabetical prefix (A, B, C...) derived from their counter group or schedule code.
- **Sequence:** Daily 1-indexed sequential integer reset at 00:00 IST.
- **QR Payload Format:** Standard pipe-delimited payload signed with HMAC:
  `AGRI-PROC-TOKEN|{tokenNumber}|{centerCode}|{cropCode}|{quantityQuintals}Q|{farmerName}|{hmacSignature}`

---

## 10. QUEUE MANAGEMENT & RECOVERY

### 10.1 Dual-Store Queue Architecture
- **PostgreSQL (Ground Truth):** The `queue_events` table logs every state event (`ARRIVED`, `CALLED`, `PROCESSING`, `COMPLETED`, `SKIPPED`). The authoritative queue is the set of bookings for today at `centerId` where `status IN ('ARRIVED', 'WAITING', 'PROCESSING')`.
- **Redis (High-Speed Transient Cache):**
  - Key: `center:{centerId}:queue:active` (Redis Sorted Set `ZSET` scored by arrival timestamp).
  - Key: `center:{centerId}:serving` (String storing currently called token and assigned counter).
  - Key: `center:{centerId}:stats` (Hash with active counter count, wait estimates).

### 10.2 Self-Healing Queue Recovery Workflow
If the Redis instance restarts, loses memory, or crashes:
1. NestJS `QueueRecoveryService` catches the Redis cache-miss or connection error.
2. Direct fallback query executes against PostgreSQL:
   ```sql
   SELECT id, token_number, arrival_at, status 
   FROM bookings 
   WHERE center_id = $1 
     AND DATE(created_at) = CURRENT_DATE 
     AND status IN ('ARRIVED', 'WAITING', 'PROCESSING')
   ORDER BY arrival_at ASC;
   ```
3. The queue is instantly rebuilt into Redis `ZSET` in the background.
4. Client requests never experience downtime or data loss.

---

## 11. PROCUREMENT STATE MACHINE

The procurement lifecycle is strictly controlled by an authoritative finite state machine on the NestJS backend.

### 11.1 State Transition Matrix

| Current State | Allowed Next States | Trigger Actor | Action Required |
|---|---|---|---|
| `BOOKED` | `ARRIVED`, `CANCELLED` | Operator (scan QR) / Farmer | Arrival check-in at center entrance or user cancellation prior to slot date |
| `ARRIVED` | `WAITING` | Operator | Added to live physical waiting queue |
| `WAITING` | `PROCESSING` | Operator (at Counter) | Counter operator calls next token |
| `PROCESSING` | `QUALITY_CHECK` | Operator / Inspector | Farmer arrives at inspection counter |
| `QUALITY_CHECK` | `WEIGHMENT`, `REJECTED` | Quality Inspector | Submission of moisture & grading report. Rejection ends procurement. |
| `WEIGHMENT` | `ACCEPTED` | Weighbridge Operator | Capture of gross, tare, and net weights |
| `ACCEPTED` | `COMPLETED` | Center Supervisor | Final verification and procurement receipt issued |
| `COMPLETED` | `PAYMENT_PROCESSING` | System / Operator | Payout batch initiated |
| `PAYMENT_PROCESSING` | `PAYMENT_COMPLETED`, `PAYMENT_FAILED` | System / Operator | DBT confirmation received or payout error flagged |
| `REJECTED` | *(Terminal)* | None | No further transitions permitted |
| `PAYMENT_COMPLETED`| *(Terminal)* | None | Workflow finished |

### 11.2 State Machine Enforcement Rule
Any request attempting an unlisted transition (e.g. `BOOKED` $\rightarrow$ `ACCEPTED`, or transitioning a `REJECTED` batch to `WEIGHMENT`) must immediately throw a `409 Conflict` containing error code `PROCUREMENT_INVALID_TRANSITION`.

---

## 12. QUALITY CHECK & WEIGHMENT ARCHITECTURE

### 12.1 Quality Check Validation Rules
- `moisturePercentage`: Validated $0.0\% \le \text{moisture} \le 100.0\%$. If moisture exceeds `moistureStandardMax` (e.g. 12.0% for wheat), state machine sets `qualityStatus = FAILED` and permits `REJECTED` transition.
- `qualityGrade`: Must be one of `GRADE_A`, `GRADE_B`, `REJECTED`.
- `remarks`: Mandatory if rejected, documenting reason for farmer review.

### 12.2 Weighment Math & Backend Verification
The client cannot supply calculated net weights. The backend strictly recalculates:
$$\text{netWeightKg} = \text{grossWeightKg} - \text{tareWeightKg}$$
$$\text{netQuintals} = \frac{\text{netWeightKg}}{100}$$
- **Backend Rules:**
  - $\text{grossWeightKg} > 0$
  - $\text{tareWeightKg} \ge 0$
  - $\text{grossWeightKg} > \text{tareWeightKg}$ (Net weight must be strictly positive)
  - Decimal precision strictly capped at 2 decimal places.

---

## 13. PAYMENT STATUS ARCHITECTURE (STATUS TRACKING)

For the MVP release (per SRS §6.2), payment is an **asynchronous status simulation & tracking workflow**, eliminating premature dependency on live banking, PFMS, or DBT gateways:
1. **Status Flow:** `PAYMENT_PENDING` $\rightarrow$ `PAYMENT_PROCESSING` $\rightarrow$ `PAYMENT_COMPLETED`.
2. **Payout Computation:**
   $$\text{amount} = \text{netQuintals} \times \text{mspRatePerQuintal}$$
3. **DBT Reference Generation:** On transition to `PAYMENT_PROCESSING`, the system generates a simulated Direct Benefit Transfer reference number: `DBT-IN-{YYYYMMDD}-{Random8Chars}`.
4. **Boundary Isolation:** The `PaymentsService` is isolated with a clear interface `PaymentGatewayInterface` so that a live NPCI/e-Kuber adapter can be slotted in during future phases without altering domain models.

---

## 14. AUTHENTICATION & SECURE RBAC

### 14.1 Token Security Strategy
- **Access Token:** Short-lived JWT (15 minutes). Payload contains: `{ sub: userId, role: Role, centerId?: string }`.
- **Refresh Token:** Long-lived JWT (7 days), stored in the `user_sessions` database table. On refresh, token rotation is enforced: the old refresh token is revoked and a new pair is issued.
- **Farmer OTP Support:** For local dev and demo, simulated OTP `123456` is accepted. For staging/production, integrated with SMS gateway with strict Redis rate-limiting (3 attempts per 10 minutes per phone).
- **Password Security:** Salted and hashed using `bcrypt` (12 salt rounds). Plaintext passwords are never logged, persisted, or returned.

### 14.2 RBAC & Center-Scoping Engine
- **`@Roles(Role.FARMER, Role.OPERATOR, Role.ADMIN)` Guard:** Evaluates JWT role claim against endpoint requirements.
- **Center-Scoping Guard (`@CenterScoped()`):** Critical security boundary for `CENTER_OPERATOR`.
  - Center operators can ONLY query and mutate data for their assigned `centerId`.
  - Operator A assigned to Center 01 attempting to call `POST /api/v1/operator/queue/call` with `centerId = 02` is rejected with HTTP 403 Forbidden.
  - Admins bypass center scoping and hold global administrative visibility.

---

## 15. COMPREHENSIVE API SPECIFICATIONS

All endpoints reside under `/api/v1`.

### 15.1 Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user (Farmer, Operator, Admin) |
| `POST` | `/api/v1/auth/login` | Public | Authenticate with phone/email and password |
| `POST` | `/api/v1/auth/send-otp` | Public | Request OTP for mobile verification |
| `POST` | `/api/v1/auth/verify-otp` | Public | Verify OTP and authenticate farmer |
| `POST` | `/api/v1/auth/refresh` | Public | Exchange valid refresh token for new access token |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke refresh token and invalidate session |

### 15.2 Farmer Endpoints (`/api/v1/farmers`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/farmers/profile` | Farmer | Retrieve authenticated farmer profile and bank details |
| `PATCH`| `/api/v1/farmers/profile` | Farmer | Update personal profile, village, language preferences |
| `POST` | `/api/v1/farmers/kyc/bank`| Farmer | Submit and validate bank account & IFSC for DBT |
| `GET` | `/api/v1/farmers/bookings` | Farmer | Retrieve booking history and active pass |
| `GET` | `/api/v1/farmers/notifications` | Farmer | List in-app notifications with unread counts |
| `PATCH`| `/api/v1/farmers/notifications/:id/read` | Farmer | Mark notification as read |
| `POST` | `/api/v1/farmers/feedback`| Farmer | Submit grievance or feedback for completed procurement |

### 15.3 Discovery & Scheduling Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/centers` | Public/Auth | List procurement centers with distance, filter by district/crop |
| `GET` | `/api/v1/centers/:id` | Public/Auth | Retrieve procurement center details, counters, operating status |
| `GET` | `/api/v1/crops` | Public/Auth | List available MSP crops with rates and units |
| `GET` | `/api/v1/centers/:id/schedules` | Public/Auth | List active procurement schedules for a center |
| `GET` | `/api/v1/centers/:id/slots` | Public/Auth | Real-time slot availability for selected crop & date |

### 15.4 Booking Endpoints (`/api/v1/bookings`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/bookings` | Farmer | Create concurrency-safe slot booking & digital token |
| `GET` | `/api/v1/bookings/:id` | Farmer/Op/Admin | Retrieve booking pass details and QR payload |
| `DELETE`| `/api/v1/bookings/:id` | Farmer | Cancel active booking and release slot capacity |
| `GET` | `/api/v1/bookings/:id/queue-position`| Farmer | Live queue position, token ahead, and AI wait ETA |

### 15.5 Operator Day-of-Operations Endpoints (`/api/v1/operator`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/operator/dashboard` | Operator | Summary counts: arrived, waiting, processing, completed |
| `GET` | `/api/v1/operator/queue` | Operator | Live queue list for assigned center |
| `POST` | `/api/v1/operator/bookings/scan-qr` | Operator | Scan farmer QR pass & verify booking validity |
| `POST` | `/api/v1/operator/bookings/:id/arrive` | Operator | Check in farmer and transition status to `ARRIVED` |
| `POST` | `/api/v1/operator/queue/call-next` | Operator | Call next available token to operator's counter |
| `POST` | `/api/v1/operator/procurements/:id/quality` | Operator | Record moisture, grade, and inspection result |
| `POST` | `/api/v1/operator/procurements/:id/weighment`| Operator | Record gross, tare, and net weights from weighbridge |
| `POST` | `/api/v1/operator/procurements/:id/accept` | Operator | Accept procurement batch after successful weighment |
| `POST` | `/api/v1/operator/procurements/:id/reject` | Operator | Reject procurement batch during quality check |
| `POST` | `/api/v1/operator/procurements/:id/complete`| Operator | Finalize procurement and generate receipt |
| `PATCH`| `/api/v1/operator/payments/:id/status` | Operator | Update simulated payment status |

### 15.6 Administrator Endpoints (`/api/v1/admin`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/admin/centers` | Admin | Create new procurement center |
| `PATCH`| `/api/v1/admin/centers/:id` | Admin | Update center configuration, capacity, status |
| `POST` | `/api/v1/admin/operators` | Admin | Register operator and assign to center |
| `POST` | `/api/v1/admin/crops` | Admin | Create or update crop MSP rates |
| `POST` | `/api/v1/admin/schedules` | Admin | Configure procurement window and daily quotas |
| `POST` | `/api/v1/admin/slots/generate` | Admin | Batch-generate time slots for a schedule |
| `GET` | `/api/v1/admin/analytics/overview` | Admin | System-wide operational and financial KPIs |
| `GET` | `/api/v1/admin/audit-logs` | Admin | Paginated immutable operational audit trail |

---

## 16. API DESIGN STANDARDS & ERROR CONTRACT

### 16.1 Standard JSON Response Envelope
All successful responses are wrapped in a standard structure:
```json
{
  "success": true,
  "data": {
    "bookingId": "c6a1e34b-8712-42ef-9810-72161bce1d11",
    "tokenNumber": "A105",
    "status": "BOOKED",
    "slotTime": "10:00 - 11:00 AM"
  },
  "timestamp": "2026-09-06T18:55:00.000Z",
  "requestId": "req-9b87c12f-410e-49b8-bdf4-f8b1e4c9e830"
}
```

### 16.2 Standard Error Contract
All errors adhere to the project's canonical error contract:
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_SLOT_FULL",
    "message": "The selected time slot has reached its maximum quota.",
    "details": {
      "slotId": "d82092cb-1ef4-4f01-b75d-3571d79860b7",
      "available": 0,
      "capacity": 20
    }
  },
  "timestamp": "2026-09-06T18:55:00.000Z",
  "requestId": "req-9b87c12f-410e-49b8-bdf4-f8b1e4c9e830"
}
```

### 16.3 Standardized Application Error Codes

| Error Code | HTTP Status | Description |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid phone/email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token expired |
| `AUTH_FORBIDDEN` | 403 | Insufficient role permissions |
| `CENTER_ACCESS_DENIED` | 403 | Operator unauthorized for requested center |
| `BOOKING_SLOT_FULL` | 409 | Slot capacity exhausted during booking attempt |
| `BOOKING_ALREADY_ACTIVE` | 409 | Farmer already holds an active booking for this crop |
| `PROCUREMENT_INVALID_TRANSITION`| 409 | Requested state transition violates state machine |
| `QUEUE_EMPTY` | 404 | No waiting farmers in the center queue |
| `RESOURCE_NOT_FOUND` | 404 | Entity ID does not exist |
| `VALIDATION_FAILED` | 422 | DTO field validation failure |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled runtime exception |

---

## 17. REAL-TIME ARCHITECTURE (SOCKET.IO)

### 17.1 Gateway Room Topology
The backend mounts a NestJS WebSocket Gateway at path `/ws/socket.io`:
- **`center:{centerId}`:** Subscribed by center operators and in-center displays. Receives:
  - `QUEUE_UPDATED`: `{ currentToken, peopleWaiting, activeCounters }`
  - `TOKEN_CALLED`: `{ tokenNumber, counterNumber, estimatedWait }`
- **`booking:{bookingId}`:** Subscribed by the specific farmer's mobile app. Receives:
  - `PROCUREMENT_STATUS_CHANGED`: `{ status, stageData }`
  - `MY_QUEUE_POSITION_UPDATED`: `{ peopleAhead, estimatedWaitMinutes }`
- **`user:{userId}`:** Personal broadcast channel for user notifications. Receives:
  - `NOTIFICATION_CREATED`: `{ id, title, message, type }`

### 17.2 WebSocket Authentication & Lifecycle
- Handshake validates JWT passed in query auth object: `{ token: "Bearer ..." }`.
- Disconnections handled gracefully; upon reconnect, clients issue `sync_state` to receive immediate snapshot without data loss.

---

## 18. NOTIFICATION ARCHITECTURE (FIREBASE FCM + IN-APP)

### 18.1 Guaranteed Non-Blocking Principle
A business transaction (e.g. creating a booking, recording weighment) **never** depends on FCM delivery. The transaction writes to PostgreSQL first. Once committed:
1. An in-app `Notification` record is inserted into PostgreSQL.
2. An asynchronous task or BullMQ job is dispatched to call Firebase Admin SDK.
3. If FCM fails or device is offline, notification is retried up to 3 times with exponential backoff.
4. The farmer will always see the notification inside the in-app notification center regardless of push delivery success.

---

## 19. PREDICTIVE AI/ML ARCHITECTURE & FALLBACK

### 19.1 FastAPI Service Contract (`POST /predict/waiting-time`)
- **Request Payload:**
  ```json
  {
    "centerId": "center-uuid",
    "queueLength": 18,
    "activeCounters": 3,
    "averageProcessingMinutes": 11.5,
    "arrivalsLast30Minutes": 14,
    "hourOfDay": 10,
    "dayOfWeek": 2
  }
  ```
- **Response Payload:**
  ```json
  {
    "estimatedWaitMinutes": 42,
    "modelVersion": "rf-v1.0",
    "confidence": 0.88
  }
  ```

### 19.2 Deterministic Circuit Breaker & Fallback
The NestJS `MlService` wraps the HTTP call in a 1000ms timeout. If the ML container is unreachable, returns 5xx, or times out:
1. Log warning: `ML_SERVICE_DOWN_USING_FALLBACK`.
2. Compute deterministic mathematical formula:
   $$\text{estimatedWaitMinutes} = \left\lceil \frac{\text{peopleAhead} \times \text{averageProcessingMinutes}}{\max(1, \text{activeCounters})} \right\rceil$$
3. Return the calculated estimate to the client seamlessly. The farmer sees the estimated wait time without any UI error or disruption.

---

## 20. ANALYTICS & AUDIT LOGGING

### 20.1 Operational & Administrative Metrics
The `AnalyticsService` generates non-blocking dashboard aggregates:
- **Queue Metrics:** Average wait time, average processing duration, peak arrival hours.
- **Center Utilization:** Daily slot utilization rate ($\frac{\text{bookedCount}}{\text{capacity}}$), no-show rate.
- **Procurement Throughput:** Total quintals accepted vs. rejected, crop-wise procurement volume, daily financial disbursement.

### 20.2 Immutable Audit Logging
Any administrative change (center config, slot quota changes, operator assignments) and any procurement stage transition writes to `audit_logs`:
- Records `actorId`, `actorRole`, `action`, `entityType`, `entityId`, `oldValue`, `newValue`, `ipAddress`, and `requestId`.
- Strict append-only table. No update or delete operations are permitted on audit logs.

---

## 21. CONCURRENCY & RACE CONDITIONS ANALYSIS

### Race Condition 1: Double Booking on Final Slot
- **Trigger:** Two farmers attempt to book the last remaining slot simultaneously.
- **Vulnerability:** Unsafe read-then-write creates negative slot capacity.
- **Mitigation:**
  1. Wrap booking creation in `prisma.$transaction`.
  2. Execute raw PostgreSQL lock: `SELECT id, booked_count, capacity FROM slots WHERE id = $1 FOR UPDATE`.
  3. Verify `booked_count < capacity`. If false, throw `BOOKING_SLOT_FULL`.
  4. Increment `booked_count` and insert `Booking` record.
  5. Backed by database check constraint: `CONSTRAINT chk_slot_capacity CHECK (booked_count <= capacity)`.

### Race Condition 2: Simultaneous Token Calling
- **Trigger:** Operators at Counter 1 and Counter 2 click "Call Next" at the exact same millisecond.
- **Vulnerability:** Both operators call and assign the same waiting farmer.
- **Mitigation:**
  1. Redis distributed lock acquired on `lock:center:{centerId}:queue`.
  2. Transactional query fetches the oldest `WAITING` booking and atomically updates status to `PROCESSING` and sets `counter_id`.
  3. Release lock. Exactly one operator receives the farmer; second operator receives the subsequent farmer.

---

## 22. SECURITY, PRIVACY & COMPLIANCE

1. **Input Validation:** Strict class-validator DTO validation on every controller. Malformed fields rejected at the HTTP boundary.
2. **Rate Limiting:** NestJS Throttler backed by Redis:
   - Auth endpoints: 5 req/min per IP.
   - OTP endpoints: 3 req/10 min per phone.
   - Booking mutations: 10 req/min per user.
   - General queries: 100 req/min per user.
3. **PII Protection:** Farmer phone numbers and bank account numbers are masked in API responses (`•••• •••• •••• 9012`). Real farmer PII is never stored in synthetic dev environments.
4. **Secret Management:** Secrets (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `FIREBASE_PRIVATE_KEY`) loaded strictly from environment variables. Zero hardcoded secrets.

---

## 23. TESTING ARCHITECTURE

The test strategy encompasses three discrete layers:
1. **Unit Tests (Jest):** Services, state machine validators, token generators, net weight recalculation, and fallback math formulas.
2. **Integration Tests (Jest + TestContainers / Postgres):** Prisma transactional boundaries, slot locking concurrency tests (simulating 10 concurrent requests racing for 1 slot), and Redis queue synchronization.
3. **End-to-End (E2E) Flow Tests (Supertest):**
   - **Flow 1 (Farmer Journey):** Register $\rightarrow$ Login $\rightarrow$ Discover Centers $\rightarrow$ Query Slots $\rightarrow$ Book Slot $\rightarrow$ Receive Token $\rightarrow$ Query Queue Position.
   - **Flow 2 (Operator Workflow):** Login $\rightarrow$ View Center Queue $\rightarrow$ Check In Farmer $\rightarrow$ Call Token $\rightarrow$ Submit Quality Check $\rightarrow$ Record Weighment $\rightarrow$ Accept $\rightarrow$ Complete.
   - **Flow 3 (Admin Setup):** Login $\rightarrow$ Create Center $\rightarrow$ Create Crop $\rightarrow$ Create Schedule $\rightarrow$ Generate Slots $\rightarrow$ View System Analytics.

---

## 24. SYNTHETIC SEED DATA DESIGN

The system will include a complete, deterministic seed script (`backend/prisma/seed.ts`):
- **Admin:** 1 system admin (`admin@agriprocure.gov.in` / `Admin@123456`)
- **Procurement Centers:** 5 centers across Maharashtra (Nashik Main Yard, Pimpalgaon Grain Hub, Dindori Sub-Mandi, Malegaon Mandi, Lasalgaon APMC)
- **Counters:** 3 to 5 active counters per center with assigned operators
- **Center Operators:** 10 operators (`operator.nsk1@agriprocure.gov.in`, etc.)
- **Crops:** Wheat, Soybean, Chana (Gram), Maize, Paddy with official MSP rates
- **Schedules & Slots:** Current season schedules with daily slots (09:00 to 17:00, 1-hour windows, capacity 15 per slot)
- **Farmers:** 25 synthetic farmers with varied KYC and bank details
- **Active Transactions:** Pre-populated bookings in various states (`BOOKED`, `ARRIVED`, `WAITING`, `PROCESSING`, `COMPLETED`, `PAYMENT_COMPLETED`) to immediately demonstrate live queues and dashboards upon first startup.

---

## 25. LOCAL DEVELOPMENT & DOCKER TOPOLOGY

### `docker-compose.yml` Service Architecture

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: agri_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: agri_procurement
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: agri_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: agri_backend
    environment:
      NODE_ENV: development
      PORT: 4000
      DATABASE_URL: "postgresql://postgres:postgrespassword@postgres:5432/agri_procurement?schema=public"
      REDIS_URL: "redis://redis:6379"
      JWT_ACCESS_SECRET: "dev_jwt_secret_key_access_token_12345"
      JWT_REFRESH_SECRET: "dev_jwt_secret_key_refresh_token_67890"
      ML_SERVICE_URL: "http://ml-service:8000"
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  ml-service:
    build:
      context: ./ml-service
      dockerfile: Dockerfile
    container_name: agri_ml_service
    ports:
      - "8000:8000"

volumes:
  postgres_data:
  redis_data:
```

---

## 26. API-BACKEND DEPENDENCY MATRIX

| Feature Area | Controller | Service | PostgreSQL | Redis | WebSocket | ML Service | Notification |
|---|---|---|---|---|---|---|---|
| **User Authentication** | `AuthController` | `AuthService` | Yes | Yes (Rate limit) | No | No | No |
| **Farmer Profile & KYC** | `FarmersController` | `FarmersService` | Yes | No | No | No | No |
| **Center Discovery** | `CentersController` | `CentersService` | Yes | Yes (Cache) | No | No | No |
| **Slot Availability** | `SlotsController` | `SlotsService` | Yes | Yes (Cache) | Yes (Availability change) | No | No |
| **Slot Booking** | `BookingsController` | `BookingsService` | Yes (Tx Lock) | Yes (Locks/Tokens)| Yes (`QUEUE_UPDATED`) | Optional (ETA) | Yes (Confirmed) |
| **Live Queue Engine** | `QueueController` | `QueueService` | Yes | Yes (Active Set) | Yes (`TOKEN_CALLED`) | Optional (ETA) | Yes (Approaching)|
| **Check-in / Arrival** | `OperatorController`| `OperatorService` | Yes (Tx) | Yes | Yes (`QUEUE_UPDATED`) | No | Yes (Arrived) |
| **Quality Inspection** | `ProcurementController`| `QualityService`| Yes (Tx) | No | Yes (`STATUS_CHANGED`)| No | Yes (Checked) |
| **Weighment Capture** | `ProcurementController`| `WeighmentService`| Yes (Tx) | No | Yes (`STATUS_CHANGED`)| No | Yes (Weighed) |
| **Procurement Acceptance**| `ProcurementController`| `ProcurementService`| Yes (Tx) | Yes | Yes (`STATUS_CHANGED`)| No | Yes (Accepted) |
| **Payment Status** | `PaymentsController`| `PaymentsService`| Yes (Tx) | No | Yes (`PAYMENT_UPDATED`)| No | Yes (Paid) |
| **Admin Analytics** | `AnalyticsController`| `AnalyticsService`| Yes | Yes (Aggregates) | No | Optional (MAE) | No |

---

## 27. BACKEND GAPS & REQUIRED CHANGES

| Gap ID | Problem & Current State | Required Backend Change | Architectural Rationale | Priority |
|---|---|---|---|---|
| **GAP-01** | `backend/` directory is completely empty. No runtime, no package config. | Initialize NestJS application with complete dependencies (`@nestjs/core`, `@nestjs/platform-express`, `prisma`, `ioredis`, `@nestjs/jwt`, `socket.io`). | Absolute prerequisite for any backend execution. | **CRITICAL** |
| **GAP-02** | No database schema or Prisma models exist. | Create `schema.prisma` covering all 16 domain models, constraints, and indexes. Generate migrations. | Transactional source of truth required for data persistence. | **CRITICAL** |
| **GAP-03** | Farmer mobile app runs entirely on mock client-side state. | Implement real REST API endpoints matching mobile app data contracts (`/api/v1/auth`, `/api/v1/centers`, `/api/v1/bookings`, `/api/v1/queue`). | Eliminates mock state and connects mobile app to real backend. | **CRITICAL** |
| **GAP-04** | No concurrency control exists for booking slots. | Implement PostgreSQL row-level locked transactions (`SELECT FOR UPDATE`) and capacity check constraints. | Prevents overselling and double booking under concurrent requests. | **CRITICAL** |
| **GAP-05** | No state machine validation exists for procurement lifecycle. | Implement centralized `ProcurementStateMachine` service rejecting illegal state transitions with HTTP 409. | Guarantees audit compliance and data integrity across inspection stages. | **HIGH** |
| **GAP-06** | Real-time push does not exist; clients rely on manual state mutations. | Implement NestJS Socket.IO gateway with room-based pub/sub (`center:{id}`, `booking:{id}`). | Delivers instantaneous queue and status updates to farmers without polling. | **HIGH** |
| **GAP-07** | Operator access is not scoped to assigned center. | Implement `@CenterScoped()` guard verifying operator center assignment in database before allowing queue actions. | Prevents operators from tampering with queues at centers other than their own. | **HIGH** |
| **GAP-08** | No prediction fallback logic exists if ML service fails. | Implement timeout circuit breaker in `MlService` returning deterministic mathematical ETA. | Prevents secondary ML service failure from interrupting core queue operations. | **MEDIUM** |
| **GAP-09** | Push notification failure could potentially affect transactions if unhandled. | Implement async decoupled notification dispatch; PostgreSQL commit occurs first. | Guarantees business transactions commit reliably regardless of external FCM status. | **MEDIUM** |
| **GAP-10** | Admin & Operator Web Dashboard directory is empty. | Plan Phase 12-13 web dashboard APIs to enable operators and admins to execute actions. | Provides web interfaces for center staff and system administrators. | **HIGH** |

---

## 28. ARCHITECTURAL DECISION RECORDS (ADRS)

### ADR-001: PostgreSQL as Single Source of Truth
- **Context:** The platform coordinates farmers, schedules, slots, queues, procurement stages, and payments.
- **Decision:** Use PostgreSQL as the single, authoritative, ACID-compliant database.
- **Rationale:** The agricultural procurement domain is inherently relational. Foreign keys, row-level locks, unique constraints, and ACID transactions are essential to prevent double-booking, overbooking, and state inconsistencies. Document stores (e.g. MongoDB) would require complex, error-prone application-level transaction management.

### ADR-002: Redis as Transient Cache and Acceleration Layer Only
- **Context:** Queue state and slot availability require fast reads and low latency.
- **Decision:** Redis is strictly an acceleration layer, cache, and transient queue representation. Redis is **never** the source of truth.
- **Rationale:** If Redis restarts, crashes, or suffers data eviction, the entire queue and slot state can be 100% reconstructed from PostgreSQL records.

### ADR-003: Modular Monolith Architecture over Microservices
- **Context:** Deciding deployment topology for MVP release.
- **Decision:** Build a Modular Monolith in NestJS.
- **Rationale:** Avoids distributed transactions, network latency, complex service meshes, and multi-repo deployment overhead. Clear module boundaries inside NestJS allow future extraction of specific services (e.g. ML, Notifications) if state or national scale demands it.

### ADR-004: Independent Python/FastAPI Service for Machine Learning
- **Context:** Waiting-time prediction requires tabular machine learning libraries (scikit-learn, pandas).
- **Decision:** Host ML models in an independent Python/FastAPI microservice communicating via internal HTTP.
- **Rationale:** Node.js lacks native mature machine learning tooling. Python models can be retrained and deployed independently without redeploying the transactional backend.

### ADR-005: Socket.IO for Bidirectional Real-Time Updates
- **Context:** Farmers in waiting queues require instantaneous token and queue updates.
- **Decision:** Implement Socket.IO with room-based scoping (`center:{id}`, `booking:{id}`).
- **Rationale:** Eliminates aggressive HTTP client polling (which would overload backend during peak hours) and delivers <2s event propagation to farmer devices.

### ADR-006: Server-Enforced Procurement State Machine
- **Context:** Produce transitions through inspection, weighment, and payment.
- **Decision:** The backend enforces an explicit state transition matrix. Any invalid state jump returns HTTP 409 Conflict.
- **Rationale:** Prevents unauthorized, accidental, or malicious state modifications (e.g. marking produce accepted before weighment occurs).

### ADR-007: Server-Enforced RBAC with Center-Scoping
- **Context:** Operators must manage only their assigned center; farmers must view only their own bookings; admins hold global oversight.
- **Decision:** Implement custom NestJS guards (`RolesGuard`, `CenterScopeGuard`) that verify identity and center ownership on every request.
- **Rationale:** Frontend route protection is purely cosmetic. Server-side query filtering and guard evaluation prevent privilege escalation and unauthorized cross-center manipulation.

### ADR-008: Non-Blocking Asynchronous Notifications
- **Context:** Push notifications must be sent upon booking, arrival, token calling, and payment.
- **Decision:** PostgreSQL transactional commits precede notification dispatch. Firebase push runs asynchronously.
- **Rationale:** External network latency or third-party outages in Firebase must never roll back a successful booking or delay an HTTP response to a farmer.

---

## 29. WHAT NOT TO BUILD (MVP EXCLUSIONS & BOUNDARIES)

To maintain disciplined engineering focus and prevent scope creep, the following features are **explicitly out of scope for the MVP release**:
1. **Direct Live Banking / Payment Gateway Integration:** No live NEFT, RTGS, or NPCI integrations. Payments are modeled as a status-tracking simulation with DBT reference logging.
2. **Aadhaar / Government Identity APIs:** No direct integration with UIDAI or external government single sign-on. Identity is validated via phone number and OTP.
3. **Computer Vision Quality Grading:** No automated image-based grain inspection. Inspectors manually record moisture and grade parameters in the dashboard.
4. **Physical IoT Weighbridge Automation:** No direct RS-232 serial hardware integration. Operators input verified weighbridge gross and tare figures.
5. **Microservices & Kubernetes Cluster:** No multi-repo microservices, service meshes (Istio), or Kubernetes orchestration.
6. **Kafka / Distributed Event Streaming:** No Apache Kafka or RabbitMQ clusters.
7. **Multi-Region Database Replication:** Single primary PostgreSQL with read replica support when required.
8. **Blockchain Ledger:** No hyperledger or blockchain smart contracts. Immutable audit logs in PostgreSQL meet compliance requirements.

---

## 30. COMPREHENSIVE EDGE CASE CHECKLIST

The backend architecture explicitly handles and resolves every edge case below:

- [x] **Double Booking Race:** Prevented by PostgreSQL `SELECT FOR UPDATE` row locks inside `prisma.$transaction`.
- [x] **Slot Becomes Full During Selection:** Real-time WebSocket emits `SLOT_AVAILABILITY_CHANGED`; stale client submissions receive friendly HTTP 409 `BOOKING_SLOT_FULL`.
- [x] **Operator Network Loss:** Operator mobile/tablet stores offline actions; upon reconnection, idempotent requests sync state without duplicating arrivals.
- [x] **Redis Unavailable:** Backend transparently catches Redis connection errors and queries PostgreSQL directly.
- [x] **PostgreSQL Unavailable:** Global exception filter catches database outage, logs critical alert, and returns standardized 503 Service Unavailable with friendly message.
- [x] **WebSocket Disconnect:** Client automatically reconnects with exponential backoff and issues a state sync request on re-establishment.
- [x] **ML Service Unavailable:** Circuit breaker trips after 1000ms timeout; backend seamlessly computes deterministic formula.
- [x] **Firebase FCM Unavailable:** Transaction commits successfully; notification is saved in PostgreSQL in-app table and queued for background retry.
- [x] **Duplicate HTTP Request:** Idempotency key header (`Idempotency-Key`) verified; duplicate POST returns original response without duplicate write.
- [x] **Duplicate Token Generation:** Database unique constraint `@@unique([centerId, slotId, tokenNumber])` guarantees zero duplicate tokens per center/day.
- [x] **Invalid State Transition Attempted:** State machine rejects transition with HTTP 409 `PROCUREMENT_INVALID_TRANSITION`.
- [x] **Unauthorized Center Access by Operator:** `CenterScopeGuard` validates operator center assignment and blocks cross-center queries with HTTP 403.
- [x] **Expired JWT Access Token:** Returns HTTP 401 `AUTH_TOKEN_EXPIRED`; client automatically triggers `/api/v1/auth/refresh`.
- [x] **Refresh Token Revocation / Theft:** Session record marked revoked in `user_sessions`; stolen refresh tokens rejected immediately.
- [x] **Procurement Center Deactivated:** Center status marked `CLOSED`; slot engine automatically blocks future bookings and notifies active ticket holders.
- [x] **Operator Deactivated:** User account marked `DEACTIVATED`; existing sessions revoked immediately in Redis/DB.
- [x] **Slot Capacity Reduced Below Booked Count:** Admin quota reduction checks existing bookings; prevents reduction below currently confirmed count.
- [x] **Farmer Cancels Booking:** Slot `booked_count` atomically decremented; queue state updated; notification issued.
- [x] **Farmer No-Show:** Scheduled end-of-day cleanup job transitions expired `BOOKED` tickets to `CANCELLED` and marks no-show in farmer history.
- [x] **Token Skipped by Operator:** Operator marks ticket `SKIPPED`; ticket moved to secondary recall buffer rather than deleted.
- [x] **Counter Deactivated During Shift:** Counter marked inactive; remaining assigned tickets automatically redistributed to active counters.
- [x] **Payment Status Update Failure:** Database transaction ensures state transition and payment record update succeed atomically or roll back completely.

---

## 31. IMPLEMENTATION PHASES & DETAILED TASK SPECIFICATIONS

The backend implementation is organized into 16 structured, dependency-aware phases. Each phase follows the mandatory implementation template.

---

### PHASE 0 — Repository & Architecture Audit
- **Objective:** Establish the development baseline, verify repository state, and freeze architectural contracts.
- **Prerequisites:** Workspace access, documentation review.
- **Tasks:**
  1. Complete filesystem inspection across `backend/`, `frontend/`, and `app/`.
  2. Audit mobile app state store and type interfaces.
  3. Freeze technology choices and ADRs.
  4. Create `backend/BACKEND_IMPLEMENTATION_PLAN.md`.
- **Database Changes:** None.
- **API Changes:** None.
- **Business Logic:** None.
- **Redis Changes:** None.
- **WebSocket Changes:** None.
- **External Service Changes:** None.
- **Tests:** Verify file paths and directory structures.
- **Files to Create:** `backend/BACKEND_IMPLEMENTATION_PLAN.md`.
- **Files to Modify:** None.
- **Definition of Done:** Architecture plan document complete and reviewed.
- **Risks:** Scope ambiguity (mitigated by explicit ADRs).
- **Rollback / Recovery:** Git revert.

---

### PHASE 1 — Backend Foundation & Infrastructure
- **Objective:** Scaffold the NestJS application, configure environment variables, Prisma ORM, logging, and global error handling.
- **Prerequisites:** Phase 0 complete.
- **Tasks:**
  1. Initialize NestJS TypeScript project in `backend/`.
  2. Install dependencies: `@nestjs/config`, `@prisma/client`, `prisma`, `class-validator`, `class-transformer`, `ioredis`.
  3. Implement `PrismaService` and `PrismaModule` with connection pooling.
  4. Implement `GlobalExceptionFilter` returning canonical error contract.
  5. Implement `TransformResponseInterceptor` wrapping responses in envelope.
  6. Configure Swagger/OpenAPI at `/api/docs`.
  7. Implement `/api/v1/health` endpoint checking DB and Redis connectivity.
- **Database Changes:** Setup initial Prisma connection string.
- **API Changes:** `GET /api/v1/health`, `GET /api/docs`.
- **Business Logic:** Standardized response wrapping and exception mapping.
- **Redis Changes:** Configure IORedis connection client.
- **WebSocket Changes:** None.
- **External Service Changes:** None.
- **Tests:** Health check unit test, global filter unit test.
- **Files to Create:**
  - `backend/package.json`
  - `backend/tsconfig.json`
  - `backend/src/main.ts`
  - `backend/src/app.module.ts`
  - `backend/src/prisma/prisma.service.ts`
  - `backend/src/prisma/prisma.module.ts`
  - `backend/src/common/filters/global-exception.filter.ts`
  - `backend/src/common/interceptors/transform-response.interceptor.ts`
  - `backend/src/config/configuration.ts`
  - `backend/src/health/health.controller.ts`
- **Files to Modify:** None.
- **Definition of Done:** `npm run build` succeeds, server starts on port 4000, `/api/v1/health` returns 200 OK.
- **Risks:** Dependency version conflicts (pin exact LTS versions).
- **Rollback / Recovery:** Revert directory state.

---

### PHASE 2 — Authentication & RBAC Engine
- **Objective:** Implement secure JWT authentication, session management, password hashing, and role-based guards.
- **Prerequisites:** Phase 1 complete.
- **Tasks:**
  1. Implement `User` and `UserSession` Prisma models.
  2. Implement `AuthService` (register, login, refresh, logout, password hashing via bcrypt).
  3. Implement JWT strategy and `JwtAuthGuard`.
  4. Implement `RolesGuard` and `@Roles()` decorator (`FARMER`, `CENTER_OPERATOR`, `ADMIN`).
  5. Implement simulated OTP verification service for farmers.
- **Database Changes:** Create migrations for `users` and `user_sessions`.
- **API Changes:**
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/send-otp`
  - `POST /api/v1/auth/verify-otp`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
- **Business Logic:** Bcrypt password hashing (12 rounds), JWT access/refresh token generation, refresh token rotation.
- **Redis Changes:** Track login attempts for rate limiting.
- **WebSocket Changes:** None.
- **External Service Changes:** None.
- **Tests:** Auth controller and service unit tests, JWT validation tests.
- **Files to Create:**
  - `backend/src/auth/auth.module.ts`
  - `backend/src/auth/auth.controller.ts`
  - `backend/src/auth/auth.service.ts`
  - `backend/src/auth/strategies/jwt.strategy.ts`
  - `backend/src/auth/dto/register.dto.ts`
  - `backend/src/auth/dto/login.dto.ts`
  - `backend/src/common/guards/roles.guard.ts`
  - `backend/src/common/decorators/roles.decorator.ts`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Users can register, log in, receive JWTs, refresh tokens, and access protected endpoints based on roles.
- **Risks:** Insecure token storage (enforce HTTP-only/Bearer standards).
- **Rollback / Recovery:** Roll back migration and auth module commits.

---

### PHASE 3 — Master Data Management (Centers, Crops, Counters, Operators)
- **Objective:** Implement data models and CRUD services for procurement centers, crops, counters, and operators.
- **Prerequisites:** Phase 2 complete.
- **Tasks:**
  1. Implement Prisma models: `ProcurementCenter`, `Crop`, `Counter`, `CenterOperator`.
  2. Implement `CentersService` with distance calculation and district filtering.
  3. Implement `CropsService` with active status and MSP rate queries.
  4. Implement `CountersService` and operator assignment logic.
  5. Implement `CenterScopeGuard` to restrict operators to their center.
- **Database Changes:** Create migrations for `procurement_centers`, `crops`, `counters`, `center_operators`.
- **API Changes:**
  - `GET /api/v1/centers`
  - `GET /api/v1/centers/:id`
  - `GET /api/v1/crops`
  - `POST /api/v1/admin/centers`
  - `POST /api/v1/admin/crops`
  - `POST /api/v1/admin/operators/assign`
- **Business Logic:** Haversine distance formula for nearest center lookup, unique counter number constraints per center.
- **Redis Changes:** Cache center list (`centers:all`) and crop list (`crops:active`) with 1-hour TTL.
- **WebSocket Changes:** None.
- **External Service Changes:** None.
- **Tests:** Centers service unit test, distance calculation test.
- **Files to Create:**
  - `backend/src/centers/*`
  - `backend/src/crops/*`
  - `backend/src/counters/*`
  - `backend/src/operators/*`
  - `backend/src/common/guards/center-scope.guard.ts`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Centers, crops, and counters can be configured by admins and discovered by farmers.
- **Risks:** Stale center cache (implement cache invalidation on update).
- **Rollback / Recovery:** Prisma migration down.

---

### PHASE 4 — Schedules & Slot Management Engine
- **Objective:** Build procurement schedule windows, daily quotas, slot generation, and real-time slot availability.
- **Prerequisites:** Phase 3 complete.
- **Tasks:**
  1. Implement Prisma models: `ProcurementSchedule`, `Slot`.
  2. Implement slot generation algorithm (e.g. 09:00 to 17:00, 1-hour windows, configurable capacity).
  3. Implement real-time slot availability service calculating `capacity - bookedCount` and status (`AVAILABLE`, `FEW_LEFT`, `FULL`).
  4. Implement admin endpoints for schedule creation and batch slot generation.
- **Database Changes:** Create migrations for `procurement_schedules` and `slots`.
- **API Changes:**
  - `GET /api/v1/centers/:id/schedules`
  - `GET /api/v1/centers/:id/slots?cropId=&date=`
  - `POST /api/v1/admin/schedules`
  - `POST /api/v1/admin/slots/generate`
- **Business Logic:** Date range overlap validation, automatic slot status derivation based on remaining percentage.
- **Redis Changes:** Cache daily slot availability with event-driven invalidation.
- **WebSocket Changes:** None.
- **External Service Changes:** None.
- **Tests:** Slot generator algorithm unit test, slot status calculation test.
- **Files to Create:**
  - `backend/src/schedules/*`
  - `backend/src/slots/*`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Admins can generate slots for schedules; farmers can query real-time remaining capacity per slot.
- **Risks:** Timezone mismatch in slot dates (standardize strictly on UTC and IST string conversion).
- **Rollback / Recovery:** Prisma migration rollback.

---

### PHASE 5 — Concurrency-Safe Booking Engine & Token Generator
- **Objective:** Implement the atomic booking transaction, row-level slot locking, token generation, and QR payload creation.
- **Prerequisites:** Phase 4 complete.
- **Tasks:**
  1. Implement Prisma model: `Booking`.
  2. Implement `BookingsService.createBooking` wrapped in `prisma.$transaction`.
  3. Execute `SELECT ... FOR UPDATE` row lock on target slot.
  4. Verify farmer does not hold a conflicting active booking for the same crop.
  5. Generate unique daily token (`A105`) and signed QR payload.
  6. Increment `booked_count` on slot; update slot status if full.
  7. Emit real-time slot availability change event.
- **Database Changes:** Create migration for `bookings` with unique constraint `[centerId, slotId, tokenNumber]`.
- **API Changes:**
  - `POST /api/v1/bookings`
  - `GET /api/v1/bookings/:id`
  - `DELETE /api/v1/bookings/:id`
  - `GET /api/v1/farmers/bookings`
- **Business Logic:** Atomic slot reservation, daily sequential token numbering, HMAC-signed QR string.
- **Redis Changes:** Atomic token sequence increment `INCR center:{id}:date:{date}:seq`.
- **WebSocket Changes:** Broadcast `SLOT_AVAILABILITY_CHANGED` to room `center:{centerId}`.
- **External Service Changes:** None.
- **Tests:** Concurrency test: execute 10 simultaneous booking requests for a slot with capacity 1; verify exactly 1 succeeds and 9 receive 409 Conflict.
- **Files to Create:**
  - `backend/src/bookings/*`
  - `backend/src/common/utils/token-formatter.util.ts`
  - `backend/src/common/utils/qr-signer.util.ts`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Concurrency test passes; farmer receives valid booking record, digital token, and signed QR code.
- **Risks:** Deadlock under high concurrency (ensure consistent locking order).
- **Rollback / Recovery:** Revert migration and booking service.

---

### PHASE 6 — Live Queue Engine & Operator Day-of-Operations
- **Objective:** Implement arrival check-in, live queue state tracking, token calling, and counter assignments.
- **Prerequisites:** Phase 5 complete.
- **Tasks:**
  1. Implement Prisma model: `QueueEvent`.
  2. Implement operator arrival check-in (`POST /api/v1/operator/bookings/:id/arrive` or scan QR) transitioning ticket to `ARRIVED`.
  3. Implement `QueueService.callNextToken` with Redis distributed lock to prevent counter race conditions.
  4. Implement live queue state query (`peopleAhead`, `currentToken`, `activeCounters`).
  5. Implement `QueueRecoveryService` to reconstruct Redis queue state from PostgreSQL if cache is lost.
- **Database Changes:** Create migration for `queue_events`.
- **API Changes:**
  - `GET /api/v1/operator/queue`
  - `POST /api/v1/operator/bookings/scan-qr`
  - `POST /api/v1/operator/bookings/:id/arrive`
  - `POST /api/v1/operator/queue/call-next`
  - `GET /api/v1/bookings/:id/queue-position`
- **Business Logic:** FIFO queue ordering by arrival timestamp, token state progression (`ARRIVED` $\rightarrow$ `WAITING` $\rightarrow$ `PROCESSING`).
- **Redis Changes:** Active queue ZSET `center:{id}:queue:active`, current serving token key.
- **WebSocket Changes:** Emit `QUEUE_UPDATED` and `TOKEN_CALLED`.
- **External Service Changes:** None.
- **Tests:** Queue ordering test, duplicate call prevention test, Redis recovery test.
- **Files to Create:**
  - `backend/src/queue/*`
  - `backend/src/redis/lock.service.ts`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Operators can check in farmers, call tokens to counters; queue advances sequentially and broadcasts live state.
- **Risks:** Desynchronization between Redis and Postgres (handled by transactional write + recovery service).
- **Rollback / Recovery:** Revert queue module.

---

### PHASE 7 — Procurement Lifecycle & State Machine Engine
- **Objective:** Build the authoritative finite state machine governing produce from check-in to completion.
- **Prerequisites:** Phase 6 complete.
- **Tasks:**
  1. Implement Prisma model: `Procurement`.
  2. Implement `ProcurementStateMachine` service with transition validation matrix.
  3. Wire transitions: `BOOKED` $\rightarrow$ `ARRIVED` $\rightarrow$ `WAITING` $\rightarrow$ `PROCESSING` $\rightarrow$ `ACCEPTED` / `REJECTED` $\rightarrow$ `COMPLETED`.
  4. Enforce strict 409 Conflict rejection for illegal transition attempts.
- **Database Changes:** Create migration for `procurements`.
- **API Changes:**
  - `GET /api/v1/procurements/:id`
  - `POST /api/v1/operator/procurements/:id/process`
  - `POST /api/v1/operator/procurements/:id/accept`
  - `POST /api/v1/operator/procurements/:id/reject`
  - `POST /api/v1/operator/procurements/:id/complete`
- **Business Logic:** State machine transition enforcement, duration tracking (`startedAt`, `completedAt`).
- **Redis Changes:** None.
- **WebSocket Changes:** Emit `PROCUREMENT_STATUS_CHANGED` to room `booking:{bookingId}`.
- **External Service Changes:** None.
- **Tests:** State machine unit tests covering all valid transitions and 10 invalid transition permutations.
- **Files to Create:**
  - `backend/src/procurement/*`
  - `backend/src/procurement/procurement-state-machine.service.ts`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** All procurement stages transition strictly according to the state machine matrix; invalid transitions fail with 409.
- **Risks:** Unhandled state combinations (exhaustive unit test coverage).
- **Rollback / Recovery:** Roll back migration.

---

### PHASE 8 — Quality Inspection & Weighment Engine
- **Objective:** Implement quality check recording (moisture, grading) and weighbridge gross/tare/net weight recalculation.
- **Prerequisites:** Phase 7 complete.
- **Tasks:**
  1. Implement Prisma models: `QualityCheck`, `Weighment`.
  2. Implement `QualityService`: validate moisture, foreign matter, grade. If failed, trigger `REJECTED` state.
  3. Implement `WeighmentService`: strictly calculate `netWeightKg = grossWeightKg - tareWeightKg` and `netQuintals = netWeightKg / 100`.
  4. Attach quality report and weighment slip to procurement record.
- **Database Changes:** Create migrations for `quality_checks` and `weighments`.
- **API Changes:**
  - `POST /api/v1/operator/procurements/:id/quality`
  - `POST /api/v1/operator/procurements/:id/weighment`
- **Business Logic:** Server-side weight verification, moisture threshold compliance check.
- **Redis Changes:** None.
- **WebSocket Changes:** Emit `QUALITY_UPDATED` and `WEIGHMENT_UPDATED`.
- **External Service Changes:** None.
- **Tests:** Net weight calculation test, negative weight rejection test, moisture threshold test.
- **Files to Create:**
  - `backend/src/quality/*`
  - `backend/src/weighment/*`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Quality inspection and weighbridge data can be recorded and are visible on farmer's procurement status screen.
- **Risks:** Floating point precision errors (use `Decimal` type across Prisma and math utils).
- **Rollback / Recovery:** Revert quality and weighment migrations.

---

### PHASE 9 — Payment Status & Payout Workflow
- **Objective:** Implement payout calculation, DBT reference simulation, and payment status progression.
- **Prerequisites:** Phase 8 complete.
- **Tasks:**
  1. Implement Prisma model: `Payment`.
  2. Implement `PaymentsService`: calculate total amount from `netQuintals * mspRate`.
  3. Generate simulated DBT reference number `DBT-IN-{date}-{id}`.
  4. Implement status transitions: `PAYMENT_PENDING` $\rightarrow$ `PAYMENT_PROCESSING` $\rightarrow$ `PAYMENT_COMPLETED`.
  5. Implement farmer payment status view.
- **Database Changes:** Create migration for `payments`.
- **API Changes:**
  - `GET /api/v1/procurements/:id/payment`
  - `PATCH /api/v1/operator/payments/:id/status`
- **Business Logic:** Automated payout computation from MSP rate and net quintals.
- **Redis Changes:** None.
- **WebSocket Changes:** Emit `PAYMENT_UPDATED`.
- **External Service Changes:** None.
- **Tests:** Payment amount calculation test, status transition test.
- **Files to Create:**
  - `backend/src/payments/*`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Farmer can track payment initiation, DBT reference number, and payment completion in real time.
- **Risks:** Currency rounding discrepancies (standardize on INR with 2 decimal places).
- **Rollback / Recovery:** Revert payment migration.

---

### PHASE 10 — Real-Time WebSocket Layer (Socket.IO)
- **Objective:** Build the Socket.IO gateway, room subscription manager, and transactional event broadcasters.
- **Prerequisites:** Phases 5-9 complete.
- **Tasks:**
  1. Implement `RealtimeGateway` using `@nestjs/websockets` and `socket.io`.
  2. Implement JWT handshake authentication for WebSocket connections.
  3. Implement room join/leave logic (`center:{centerId}`, `booking:{bookingId}`, `user:{userId}`).
  4. Wire event broadcasters into booking, queue, procurement, and payment services.
- **Database Changes:** None.
- **API Changes:** WebSocket path `/ws/socket.io`.
- **Business Logic:** Room authorization checks (farmers can only join their own booking rooms).
- **Redis Changes:** Redis adapter support for multi-instance socket scaling (`@socket.io/redis-adapter`).
- **WebSocket Changes:** Full implementation of event catalog.
- **External Service Changes:** None.
- **Tests:** WebSocket client connection test, room broadcast isolation test.
- **Files to Create:**
  - `backend/src/realtime/realtime.module.ts`
  - `backend/src/realtime/realtime.gateway.ts`
  - `backend/src/realtime/room-manager.service.ts`
- **Files to Modify:** Domain services to inject `RealtimeGateway`.
- **Definition of Done:** Two test clients connected to a room receive instant broadcasts upon backend state mutations without polling.
- **Risks:** Memory leaks from uncleaned socket connections (implement disconnect cleanup handlers).
- **Rollback / Recovery:** Disable gateway in `AppModule`.

---

### PHASE 11 — Notification Engine & Firebase FCM
- **Objective:** Implement in-app notification persistence, push notification queue, and Firebase Admin SDK integration.
- **Prerequisites:** Phase 10 complete.
- **Tasks:**
  1. Implement Prisma model: `Notification`.
  2. Implement `NotificationsService.sendNotification` (stores in DB first, dispatches FCM async).
  3. Implement Firebase Admin SDK client with graceful mock fallback when credentials are absent.
  4. Implement farmer notification center endpoints (list notifications, mark as read).
- **Database Changes:** Create migration for `notifications`.
- **API Changes:**
  - `GET /api/v1/farmers/notifications`
  - `PATCH /api/v1/farmers/notifications/:id/read`
- **Business Logic:** Decoupled asynchronous delivery; failed push never rolls back DB transaction.
- **Redis Changes:** Push retry queue backed by BullMQ/Redis.
- **WebSocket Changes:** Emit `NOTIFICATION_CREATED` to room `user:{userId}`.
- **External Service Changes:** Firebase Cloud Messaging SDK initialization.
- **Tests:** In-app notification creation test, FCM error handling test.
- **Files to Create:**
  - `backend/src/notifications/*`
  - `backend/src/notifications/fcm.service.ts`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Notifications are reliably saved in the database, viewable in-app, and pushed via FCM.
- **Risks:** Firebase downtime (handled by try/catch and retry queue).
- **Rollback / Recovery:** Revert notification module.

---

### PHASE 12 — Predictive ML Integration & Deterministic Fallback
- **Objective:** Integrate the Python FastAPI waiting-time prediction service with a circuit-breaking fallback.
- **Prerequisites:** Phase 6 complete.
- **Tasks:**
  1. Implement `MlService` HTTP client calling `POST /predict/waiting-time`.
  2. Implement 1000ms timeout circuit breaker.
  3. Implement deterministic baseline mathematical calculation:
     $$\text{waitMinutes} = \frac{\text{peopleAhead} \times \text{avgProcessingMinutes}}{\text{activeCounters}}$$
  4. Integrate ETA output into `GET /api/v1/bookings/:id/queue-position` and WebSocket queue updates.
- **Database Changes:** None.
- **API Changes:** None (internal service call).
- **Business Logic:** Dynamic wait time estimation, automatic fallback when ML container is stopped.
- **Redis Changes:** Cache recent prediction per queue length for 60 seconds.
- **WebSocket Changes:** Emit estimated wait in `QUEUE_UPDATED`.
- **External Service Changes:** Connect to `http://ml-service:8000`.
- **Tests:** Fallback test: stop ML container and verify queue position API still returns a valid wait time estimate without throwing an error.
- **Files to Create:**
  - `backend/src/ml/ml.module.ts`
  - `backend/src/ml/ml.service.ts`
  - `backend/src/ml/fallback-calculator.util.ts`
- **Files to Modify:** `backend/src/queue/queue.service.ts`.
- **Definition of Done:** Accurate wait time estimation returned to farmers under both normal and ML-offline conditions.
- **Risks:** Network latency to ML service (strictly capped with 1s timeout).
- **Rollback / Recovery:** Force fallback calculation mode.

---

### PHASE 13 — Operational Analytics & Immutable Audit Engine
- **Objective:** Implement operational KPIs, center performance summaries, and append-only audit logging.
- **Prerequisites:** Phases 7-9 complete.
- **Tasks:**
  1. Implement Prisma model: `AuditLog`.
  2. Implement `AuditService` recording actor, action, entity, before/after JSON diffs, IP, and request ID.
  3. Implement `AnalyticsService` executing non-blocking SQL aggregate queries (wait times, slot utilization, daily procurement volume).
  4. Implement admin endpoints for analytics overview and audit log inspection.
- **Database Changes:** Create migration for `audit_logs`.
- **API Changes:**
  - `GET /api/v1/admin/analytics/overview`
  - `GET /api/v1/admin/audit-logs`
- **Business Logic:** Immutable audit log guarantees, KPI calculations.
- **Redis Changes:** Cache dashboard summary metrics for 5 minutes.
- **WebSocket Changes:** None.
- **External Service Changes:** None.
- **Tests:** Audit log insertion test, analytics aggregate query test.
- **Files to Create:**
  - `backend/src/audit/*`
  - `backend/src/analytics/*`
- **Files to Modify:** `backend/src/app.module.ts`, `backend/prisma/schema.prisma`.
- **Definition of Done:** Admin can view system KPIs and inspect complete audit trail of state changes.
- **Risks:** Heavy analytical queries impacting write throughput (use read-optimized indexes and aggregation queries).
- **Rollback / Recovery:** Revert analytics and audit modules.

---

### PHASE 14 — Security Hardening, Rate Limiting & Optimization
- **Objective:** Apply security headers, rate limiting, PII protection, database indexes, and connection pool optimization.
- **Prerequisites:** Phases 1-13 complete.
- **Tasks:**
  1. Configure Helmet middleware for security headers.
  2. Configure CORS allowing mobile app and admin dashboard origins.
  3. Configure `@nestjs/throttler` with Redis store for endpoint rate limiting.
  4. Verify all database indexes from Prisma schema are applied in PostgreSQL.
  5. Implement PII masking utility for phone numbers and bank accounts.
- **Database Changes:** Verify index creation in PostgreSQL.
- **API Changes:** Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).
- **Business Logic:** Phone and bank masking in serializer interceptor.
- **Redis Changes:** Throttler storage keys.
- **WebSocket Changes:** Rate limit socket messages.
- **External Service Changes:** None.
- **Tests:** Rate limit test: send 20 rapid booking requests; verify 429 Too Many Requests after limit.
- **Files to Create:**
  - `backend/src/common/interceptors/pii-masking.interceptor.ts`
- **Files to Modify:** `backend/src/main.ts`, `backend/src/app.module.ts`.
- **Definition of Done:** System passes security audit, enforces rate limits, masks PII, and handles load smoothly.
- **Risks:** Overly aggressive rate limits blocking valid users (tune thresholds based on load testing).
- **Rollback / Recovery:** Adjust rate limit configuration.

---

### PHASE 15 — End-to-End Testing & Synthetic Demo Seed
- **Objective:** Seed the database with comprehensive synthetic demo data and execute full automated test suites.
- **Prerequisites:** All prior phases complete.
- **Tasks:**
  1. Write `backend/prisma/seed.ts` populating admin, operators, farmers, centers, crops, schedules, slots, active bookings, queues, and procurements.
  2. Implement E2E test suites for Farmer Flow, Operator Flow, and Admin Setup Flow.
  3. Validate API documentation in Swagger UI (`/api/docs`).
  4. Verify the Farmer Mobile App successfully connects to real backend endpoints.
- **Database Changes:** Execute `npx prisma db seed`.
- **API Changes:** None.
- **Business Logic:** Complete end-to-end integration verified.
- **Redis Changes:** Initialized with demo queue state.
- **WebSocket Changes:** Verified with end-to-end socket events.
- **External Service Changes:** Verified with simulated services.
- **Tests:** Execute full unit, integration, and E2E test suite (`npm run test:e2e`).
- **Files to Create:**
  - `backend/prisma/seed.ts`
  - `backend/test/farmer-flow.e2e-spec.ts`
  - `backend/test/operator-flow.e2e-spec.ts`
  - `backend/test/admin-flow.e2e-spec.ts`
- **Files to Modify:** `backend/package.json`.
- **Definition of Done:** All tests pass 100%, database seeds cleanly in <15 seconds, and complete demo workflows run without failure.
- **Risks:** Seed data conflicts (ensure idempotent upsert logic in `seed.ts`).
- **Rollback / Recovery:** Reset database via `npx prisma migrate reset`.

---

## 32. DEFINITIVE IMPLEMENTATION ORDER

The implementation must proceed strictly in the following sequence. No phase may begin until its prerequisites are verified and completed:

```
[Phase 0] Architecture Freeze & Audit Baseline
    │
    ▼
[Phase 1] NestJS Foundation & Prisma Infrastructure
    │
    ▼
[Phase 2] Authentication & RBAC Engine (Users, Sessions, JWT, Guards)
    │
    ▼
[Phase 3] Master Data Management (Centers, Crops, Counters, Operators)
    │
    ▼
[Phase 4] Schedules & Slot Generation Engine
    │
    ▼
[Phase 5] Concurrency-Safe Booking Engine & Token Generator (Locking Tx)
    │
    ▼
[Phase 6] Live Queue Engine & Operator Day-of-Operations (Redis ZSET)
    │
    ▼
[Phase 7] Procurement Lifecycle & State Machine Engine (Matrix Enforcement)
    │
    ▼
[Phase 8] Quality Inspection & Weighment Engine (Net Weight Math)
    │
    ▼
[Phase 9] Payment Status & Payout Workflow (DBT Reference Simulation)
    │
    ▼
[Phase 10] Real-Time WebSocket Layer (Socket.IO Gateway & Rooms)
    │
    ▼
[Phase 11] Notification Engine & Firebase FCM Integration (Decoupled Queue)
    │
    ▼
[Phase 12] Predictive ML Integration & Deterministic Fallback (FastAPI Client)
    │
    ▼
[Phase 13] Operational Analytics & Immutable Audit Engine
    │
    ▼
[Phase 14] Security Hardening, Rate Limiting & PII Protection
    │
    ▼
[Phase 15] End-to-End Testing & Synthetic Demo Seed Data
```

---

## 33. ENGINEERING RULES & GOVERNANCE

Every developer and subagent contributing to this codebase must adhere strictly to these 17 rules:
1. **Rule 1:** Never write backend code before completing the approved architecture plan.
2. **Rule 2:** Never invent fictitious APIs. Every endpoint must conform to this document.
3. **Rule 3:** Never create ad-hoc database tables without updating `schema.prisma` and generating a migration.
4. **Rule 4:** Never duplicate existing backend services or introduce competing libraries.
5. **Rule 5:** Never delegate business logic or mathematical calculations to the frontend.
6. **Rule 6:** The backend is the sole, final authority for authentication, roles, and permissions.
7. **Rule 7:** PostgreSQL is the single authoritative source of truth.
8. **Rule 8:** Redis is transient; all state in Redis must be reconstructable from PostgreSQL.
9. **Rule 9:** ML prediction is an optional enhancement; core operations must never fail if ML is down.
10. **Rule 10:** Notification delivery failures must never roll back database transactions.
11. **Rule 11:** Procurement state transitions must be strictly enforced on the server.
12. **Rule 12:** Operator queries and actions must be strictly center-scoped.
13. **Rule 13:** Admin access is system-wide and auditable.
14. **Rule 14:** All sensitive administrative and status-changing actions must write to `audit_logs`.
15. **Rule 15:** Never introduce premature distributed infrastructure (Kafka, Kubernetes, microservices) into the MVP.
16. **Rule 16:** Use only synthetic/demo data during development and demonstration.
17. **Rule 17:** If an external dependency cannot be verified, explicitly mark it as `VERIFY` and implement a safe fallback.

---

PROJECT STATUS

Backend Planning: COMPLETE
Backend Implementation: NOT STARTED

Next Step:
Review and approve the architecture.
Then begin Phase 0 implementation.
