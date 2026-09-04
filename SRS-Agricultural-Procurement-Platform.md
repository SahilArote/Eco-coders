# Software Requirements Specification (SRS)

## Intelligent Agricultural Procurement & Queue Management Platform

**Solving SIH Problem Statement 26032** — *Farmers often face long waiting times, lack of information regarding procurement schedules, and uncertainty about procurement status.*

| Field | Value |
|---|---|
| Document Type | Software Requirements Specification |
| Standard Reference | IEEE 830 / ISO-IEC-IEEE 29148 (adapted) |
| Problem Statement ID | 26032 |
| Organization | Ministry of Consumer Affairs, Food & Public Distribution |
| Department | Department of Consumer Affairs (DoCA) |
| Category | Software |
| Theme | Smart Automation |
| Version | 1.0 |
| Status | Baseline for MVP development |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 0.1 | Draft | Initial problem/solution brainstorming and architecture exploration | Project Team |
| 1.0 | Current | Consolidated, structured SRS for development baseline | Project Team |

---

## Table of Contents

1. Introduction
2. Overall Description
3. System Features (Functional Requirements)
4. External Interface Requirements
5. Non-Functional Requirements
6. System Constraints & Scope Boundaries
7. Other Requirements
8. Appendices

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for the **Intelligent Agricultural Procurement & Queue Management Platform**, a digital system designed to eliminate information asymmetry, unplanned travel, physical queuing, and status uncertainty in the government agricultural procurement process. It is intended to serve as the single source of truth for what the system must do, for use by the development team, project mentors, and SIH evaluators.

### 1.2 Document Scope

This SRS covers the farmer-facing application, the procurement-center operator workflow, the administrator dashboard, and the AI-assisted waiting-time prediction capability, for the initial (MVP/prototype) release and its immediate hardening phase. It does not cover long-term national-scale rollout, which is addressed only at a roadmap level.

### 1.3 Intended Audience

- Development team (frontend, backend, ML, DevOps)
- Project mentor / faculty guide
- SIH evaluation panel
- Future procurement-center pilot partners

### 1.4 Definitions, Acronyms, Abbreviations

| Term | Definition |
|---|---|
| Farmer | End user who wishes to sell produce at a government procurement center |
| Procurement Center | Physical location where crops are received, quality-checked, weighed, and accepted |
| Center Operator | Staff member managing the queue/counter at a procurement center |
| Token | Digital sequence number assigned to a farmer's booking, used for queue ordering |
| Slot | A bookable time window within a procurement schedule with limited capacity |
| ETA | Estimated wait time, in minutes, until a farmer's token is called |
| MAE | Mean Absolute Error (ML evaluation metric) |
| RBAC | Role-Based Access Control |
| MVP | Minimum Viable Product |
| SIH | Smart India Hackathon |

### 1.5 References

- SIH Problem Statement 26032, Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs
- Architecture and requirements discussion log (project working notes)
- Companion documents: `SDD-Agricultural-Procurement-Platform.md`, `TDD-Implementation-Plan-Agricultural-Procurement-Platform.md`

### 1.6 Document Overview

Section 2 describes the product at a high level, including users and constraints. Section 3 enumerates functional requirements as discrete, testable features. Section 4 covers interfaces. Section 5 defines non-functional targets. Section 6 fixes scope boundaries. Section 7 and the appendices cover supporting material.

---

## 2. Overall Description

### 2.1 Product Perspective

The platform is a new, self-contained system. It is not a modification of an existing government IT system, though it is designed so that specific modules (payment status, farmer identity) can later integrate with authoritative government systems once official APIs are made available. For the MVP, payment and identity are represented as **status simulations** rather than live integrations, since direct financial/identity integration is explicitly out of scope (see Section 6.2).

### 2.2 Problem Statement

The core problem, as defined by PS 26032, is:

> Farmers often face long waiting times, lack of information regarding procurement schedules, and uncertainty about procurement status.

Restated precisely, the root cause is **uncertainty** across the entire procurement journey — not simply the physical act of waiting. A farmer today typically cannot answer any of the following without travelling to the center or asking around:

- When is procurement happening, and for which crop?
- Which center should I go to, and is it currently accepting produce?
- Are slots/capacity still available today?
- How many farmers are ahead of me right now?
- How long will I realistically wait?
- Has my produce been quality-checked and accepted?
- Has weighment been completed, and what did it record?
- Has my payment been initiated or completed?

This information gap produces unnecessary travel, overcrowding at centers, long physical queues, farmer frustration, and inefficient use of procurement-center capacity.

### 2.3 Proposed Solution Summary

A digital platform with three coordinated surfaces:

1. **Farmer Application** (mobile-first) — procurement discovery, slot booking, digital token, live queue position, AI-predicted wait time, procurement-status tracking, payment-status tracking, notifications, and feedback.
2. **Center Operator / Admin Dashboard** (web) — schedule and slot configuration, queue and counter management, procurement-stage updates (quality, weighment, acceptance), payment-status updates, and analytics.
3. **AI Prediction Layer** — a waiting-time (and, longer-term, crowd) prediction service that augments — but is never a hard dependency of — the core booking/queue/procurement workflow.

### 2.4 Problem → Solution Mapping

| Problem | System Capability |
|---|---|
| Lack of procurement information | Centralized procurement information module |
| Unclear schedule | Digital procurement calendar |
| Unplanned farmer arrivals | Appointment / slot booking |
| Long physical queues | Digital token system |
| Queue uncertainty | Live, real-time queue monitoring |
| Unknown waiting time | AI-based waiting-time prediction (with deterministic fallback) |
| Unexpected crowding | Crowd prediction (future) |
| Communication gaps | Push notifications at every lifecycle event |
| Procurement uncertainty | End-to-end status tracking via explicit state machine |
| Payment uncertainty | Payment-status tracking |
| Poor center management visibility | Operator/admin dashboard |
| Lack of performance data | Analytics and reporting |
| No channel for complaints | Feedback / grievance module |

### 2.5 Product Functions (Summary)

- Farmer registration, authentication, and profile management
- Procurement center discovery (list, map, distance)
- Procurement schedule and slot-availability browsing
- Slot booking with concurrency-safe capacity enforcement
- Digital token generation (with QR representation)
- Real-time queue position and counter status
- AI-assisted waiting-time estimation with non-ML fallback
- Procurement lifecycle tracking (booking → payment, via explicit states)
- Quality-check and weighment data capture
- Payment-status tracking
- Multi-channel notification delivery
- Operator dashboard for day-of-operations management
- Admin dashboard for configuration and analytics
- Feedback / grievance submission and tracking

### 2.6 User Classes and Characteristics

| Role | Description | Technical Proficiency | Primary Device |
|---|---|---|---|
| **Farmer** | Registers, books slots, tracks queue/status/payment | Low–moderate; may have limited connectivity | Android smartphone |
| **Center Operator** | Manages the day-of queue at one assigned center; updates procurement stages | Moderate | Tablet / desktop browser |
| **Administrator** | Configures centers, crops, schedules; views system-wide analytics | Moderate–high | Desktop browser |

### 2.7 Operating Environment

- Farmer app: Android (React Native), minimum supported OS to be fixed at implementation time; must tolerate low/intermittent network bandwidth.
- Admin/operator dashboard: modern evergreen browsers (Chrome, Edge, Firefox) on desktop and tablet.
- Backend: containerized (Docker), deployable to any standard cloud VM or PaaS.
- Database: PostgreSQL (managed or self-hosted).

### 2.8 Design and Implementation Constraints

- Must be buildable and demonstrable by a student team within a hackathon/academic project timeline (see Implementation Plan).
- Must not depend on unavailable government APIs (identity, payment, existing procurement ERP) for its MVP to function.
- Must degrade gracefully — no single secondary service (ML, notifications, cache) may be able to halt core booking/queue/procurement operations.
- Must use dummy/synthetic data for any personally identifiable farmer information during development and demonstration, unless explicit authorization for real data exists.

### 2.9 Assumptions and Dependencies

- Real historical procurement/queue data will **not** be available at MVP time; a clearly labeled synthetic/prototype dataset will be used to bootstrap the AI module.
- Push notification delivery depends on Firebase Cloud Messaging availability; SMS/WhatsApp channels are a future dependency pending provider selection and government approval.
- Center/counter/crop/schedule master data is configured by administrators; the system does not assume any pre-existing external master-data feed.

---

## 3. System Features (Functional Requirements)

Each requirement below is uniquely identified, prioritized using MoSCoW (**M**ust, **S**hould, **C**ould), and testable.

### FR-01 — User Registration & Authentication

**Priority:** Must

**Description:** The system shall allow a person to register as a Farmer, Center Operator, or Administrator, and to authenticate securely thereafter.

**Inputs:** mobile number, password (or OTP for farmers), name, and role-specific profile fields.

**Processing:**
- Validate mobile number format and uniqueness.
- For farmers, support OTP-based verification (simulated OTP acceptable for MVP if no SMS provider is integrated).
- Issue a short-lived access token and a longer-lived, revocable refresh token on successful login.

**Outputs:** authenticated session (access + refresh token), user profile record.

**Business rules:**
- A mobile number maps to exactly one account.
- Passwords (where used) must be hashed, never stored or logged in plaintext.
- Failed login attempts shall be rate-limited (see NFR-Security).

### FR-02 — Farmer Profile Management

**Priority:** Must

Farmers shall be able to view and update their profile: name, village, district, state, preferred language, and registered crop interests. The system shall not require excessive personal data beyond what is needed to operate the platform.

### FR-03 — Procurement Center Discovery

**Priority:** Must

The system shall let a farmer browse or search procurement centers, filtered by crop and/or district, and shall display each center's location, current operating status, and distance from the farmer (where location is available). A map view (OpenStreetMap/Leaflet) showing nearby centers is required.

### FR-04 — Procurement Schedule & Slot Availability

**Priority:** Must

For a selected crop and center, the system shall display the active procurement schedule (date range), and for a selected date, the list of time slots with remaining capacity (e.g., "10:00–11:00, 3/20 slots available", "11:00–12:00, FULL").

### FR-05 — Slot Booking

**Priority:** Must

**Description:** A farmer shall be able to book an available slot for a specific crop, center, and quantity.

**Processing:**
- The system shall verify: procurement is open, the slot has remaining capacity, and the farmer does not already hold a conflicting/duplicate booking per configured business rules.
- The system shall enforce slot-capacity correctness under concurrent requests: if 10 farmers attempt to book the last available slot simultaneously, **exactly one** booking shall succeed and the other nine shall receive a `BOOKING_SLOT_FULL` error. This must be enforced at the database/service layer, not merely in the client.

**Outputs:** a confirmed booking record and a generated digital token.

### FR-06 — Digital Token Generation

**Priority:** Must

On successful booking, the system shall generate a unique token (e.g., `A105`) tied to the booking, center, and date, renderable as a QR code for operator scanning at check-in. The token and booking details shall remain accessible to the farmer even after app restart/network loss (cached locally).

### FR-07 — Live Queue Management

**Priority:** Must

The system shall display, for a farmer with an active booking: their token, the currently-serving token, the number of farmers ahead, the number of active counters, and the estimated wait time — updated in near real time without requiring a manual page refresh.

### FR-08 — AI Waiting-Time Prediction

**Priority:** Should (Must have a working baseline; ML enhancement is a stretch target)

The system shall estimate a farmer's waiting time using queue length, active counters, historical/average processing time, and time-of-day/day-of-week features. A deterministic baseline formula shall always be available; a trained ML model (Random Forest / Gradient Boosting, benchmarked against the baseline using MAE/RMSE/R²) may replace or augment it once sufficient data exists. If the ML service is unavailable, the system shall fall back to the baseline without any farmer-visible failure.

### FR-09 — Procurement Lifecycle Tracking

**Priority:** Must

The system shall track each booking through an explicit, enforced state machine (see Section 3 of the SDD for the full diagram): `BOOKED → ARRIVED → WAITING → PROCESSING → QUALITY_CHECK → WEIGHMENT → ACCEPTED → COMPLETED → PAYMENT_PROCESSING → PAYMENT_COMPLETED`, with a `REJECTED` branch from `QUALITY_CHECK`. Invalid transitions (e.g., `BOOKED → PAYMENT_COMPLETED`) shall be rejected by the backend regardless of client request.

### FR-10 — Quality & Weighment Recording

**Priority:** Must

Center operators shall be able to record quality-check results (grade, moisture percentage, status, remarks) and weighment results (gross, tare, net weight) against a procurement record, each visible to the farmer in real time.

### FR-11 — Payment Status Tracking

**Priority:** Must

The system shall track and display payment status (`PAYMENT_PROCESSING`, `PAYMENT_COMPLETED`) against a completed procurement. For the MVP, this is a status simulation rather than a live banking integration.

### FR-12 — Notifications

**Priority:** Should

The system shall send notifications for key lifecycle events: booking confirmed, slot reminder, queue significantly changed, token approaching/called, quality/weighment completed, procurement completed, payment updated. Primary delivery channel: Firebase Cloud Messaging (push). If delivery fails, the notification shall be retried and always remains visible in-app; a failed notification shall never roll back the underlying business transaction.

### FR-13 — Operator Dashboard & Center Management

**Priority:** Must

Center operators shall have a dashboard showing today's booked/arrived/waiting/processing/completed farmer counts, active counters, average processing/waiting time, and controls to: call the next token, mark arrival, start processing, record quality/weighment, accept/reject, complete procurement, and update payment status.

### FR-14 — Admin Configuration & Analytics

**Priority:** Must

Administrators shall be able to manage centers, counters, crops, operators, and schedules; configure slot capacity; and view system-wide and per-center analytics (average wait, average processing time, slot utilization, no-show rate, rejection rate, payment-pending count, prediction MAE).

### FR-15 — Feedback / Grievance

**Priority:** Could

Farmers shall be able to submit feedback or a grievance (delay complaint, payment complaint, quality dispute, service complaint) linked to a specific booking/procurement, viewable by administrators.

---

## 4. External Interface Requirements

### 4.1 User Interfaces

- **Farmer App:** mobile-first, low-bandwidth-tolerant UI; dashboard with schedule, booking, token, live queue, status timeline, notifications, and feedback entry points.
- **Operator/Admin Dashboard:** web dashboard with today's-operations view, management screens (centers/slots/crops/schedules), and analytics/reporting views.

### 4.2 Hardware Interfaces

- Farmer device GPS (optional, for nearest-center discovery).
- QR code scanning capability at operator check-in stations (camera-based; no proprietary hardware required for MVP).

### 4.3 Software Interfaces

- **Firebase Cloud Messaging** — push notification delivery.
- **OpenStreetMap / Leaflet** — map rendering and center geolocation.
- **Internal ML Service (FastAPI)** — waiting-time prediction, consumed over internal HTTP.

### 4.4 Communication Interfaces

- REST/HTTPS for all client-server request/response interactions.
- WebSocket (Socket.IO) for real-time queue, token, and status-change events.

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Operation | Target |
|---|---|
| Standard API response | < 300 ms |
| Cached read | < 100 ms |
| Booking API (write, transactional) | < 500 ms |
| Queue position update propagation | < 2 s |
| Notification trigger latency | < 5 s |
| ML prediction response | < 1 s |
| Dashboard initial load | < 2 s |

These are engineering design targets for the prototype/pilot, to be validated by load testing, not measured production SLAs.

### 5.2 Scalability

The architecture shall be designed for approximately **10,000 daily active farmers**, **peak 2,000 concurrent connections**, **100–300 requests/second** at peak, and **100+ procurement centers**, without requiring a redesign. Larger scale (state/national rollout) is addressed only as a future roadmap item (Section 6.3).

### 5.3 Availability & Reliability

- Target availability: **99.5%** for MVP, **99.9%** for a production pilot.
- Core functions (authentication, booking, queue, procurement-status) must remain available even if a secondary service (ML prediction, notifications, analytics) is degraded or down.
- The system shall implement documented fallback behavior for ML-service and notification-service failure (Section 65 and 67 equivalents in the TDD).

### 5.4 Security

- HTTPS for all traffic.
- JWT-based authentication with short-lived access tokens and revocable refresh tokens.
- Role-Based Access Control (Farmer / Center Operator / Administrator), enforced server-side.
- Password hashing; no plaintext secrets in code, logs, or version control.
- Input validation on every write endpoint (DTO-level).
- Rate limiting on authentication, OTP, and booking endpoints.
- SQL-injection protection via parameterized queries/ORM.
- Audit logging of all administrative and procurement-status-changing actions.

### 5.5 Usability & Accessibility

- The farmer-facing UI shall be usable by low digital-literacy users; primary flows (book slot, check queue, check status) shall require minimal steps.
- Multilingual support (English, Hindi, Marathi, and other regional languages) is a **future** requirement, not MVP.

### 5.6 Maintainability

- TypeScript across frontend and backend; modular architecture with clear module boundaries.
- Automated unit, integration, and API tests.
- API documented via Swagger/OpenAPI.
- Version-controlled (Git), with CI enforcing lint/type-check/tests before merge.

### 5.7 Data Privacy & Compliance

- Collect only data necessary for platform operation.
- Do not publicly expose farmer phone numbers or other identifying data.
- Use synthetic/dummy identities during development and demonstration unless explicitly authorized to use real farmer data.

---

## 6. System Constraints & Scope Boundaries

### 6.1 In Scope (MVP)

Farmer: registration/login, profile, center discovery, schedule/slot browsing, booking, digital token, live queue, waiting-time estimate, notifications, procurement tracking, payment-status tracking, feedback.

Operator/Admin: center/crop/schedule/slot/counter management, queue and token management, procurement-stage updates, payment-status updates, analytics and reporting.

AI: waiting-time prediction with deterministic fallback.

### 6.2 Out of Scope (MVP)

- Full integration with existing government procurement ERP systems.
- Direct bank/financial-transaction processing.
- Aadhaar or other government identity-verification integration.
- Automated/computer-vision quality grading.
- IoT hardware or large-scale sensor deployment.
- Voice assistant.
- Blockchain-based record-keeping.
- Fully autonomous procurement allocation.
- Nationwide-scale distributed infrastructure (Kubernetes, service mesh, multi-region).

### 6.3 Future Scope

- AI-based crowd forecasting and smart center/slot recommendation.
- Multilingual UI and voice interaction.
- Offline-first support for poor-connectivity areas.
- SMS/WhatsApp notification channels.
- Grievance-management workflow with escalation.
- Government-system integration once official APIs are available.
- Horizontal scaling infrastructure (load balancers, managed clusters, message queues, CDN) if/when actual load requires it.

---

## 7. Other Requirements

### 7.1 Data Requirements

- All transactional data (users, bookings, procurement, payments) is authoritative in PostgreSQL.
- Queue/cache state in Redis is transient and reconstructable from PostgreSQL at any time — it is never the sole record of truth.
- Historical queue-event data shall be retained to support future AI model training and analytics.

### 7.2 Legal / Regulatory

- Any use of real farmer personal data requires explicit authorization; the MVP and demonstration environment shall use synthetic data only.
- Payment-related claims shown to farmers must be clearly marked as **status information**, not a substitute for official payment confirmation, until a real financial integration exists.

---

## 8. Appendices

### Appendix A — Glossary

See Section 1.4.

### Appendix B — User Roles & Permission Matrix

| Capability | Farmer | Center Operator | Administrator |
|---|:---:|:---:|:---:|
| Register / login | ✅ | ✅ | ✅ |
| Book a slot | ✅ | ❌ | ❌ |
| View own queue/token/status | ✅ | ❌ | ❌ |
| View assigned center's queue | ❌ | ✅ | ✅ |
| Call token / manage counter | ❌ | ✅ | ✅ |
| Record quality/weighment | ❌ | ✅ | ✅ |
| Update payment status | ❌ | ✅ (own center) | ✅ |
| Manage centers/crops/schedules | ❌ | ❌ | ✅ |
| Manage operators/users | ❌ | ❌ | ✅ |
| View system-wide analytics | ❌ | ❌ | ✅ |
| Submit feedback/grievance | ✅ | ❌ | ❌ (views only) |

### Appendix C — Success Metrics (Prototype/Pilot Evaluation)

- Average farmer waiting time
- Average processing time per farmer
- Average queue length
- Farmers served per day
- Slot utilization %
- No-show rate %
- ML prediction error (MAE, RMSE, R²) vs. baseline
- Notification delivery success rate
- Procurement completion time (booking → payment complete)
- API p95 latency
