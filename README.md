# Guests Handler

A modern TypeScript-based web application for managing guests, invitations, RSVPs, and event attendance workflows.  
Edited on StackBlitz

> NOTE: This README is a comprehensive template based on the repository’s language composition (TypeScript & PL/pgSQL) and common guest management patterns. Update the placeholder sections (marked with TODO) with project-specific details as needed.

---

## Table of Contents
1. Overview
2. Core Features
3. Domain Model
4. Technology Stack
5. Project Structure
6. Data & Persistence
7. API Overview (Example)
8. Frontend Functionality
9. Workflows & Use Cases
10. Environment Configuration
11. Running the Project
12. Scripts
13. Testing
14. Deployment
15. Security & Compliance
16. Performance & Scalability
17. Roadmap
18. Contributing
19. License

---

## 1. Overview

Guests Handler streamlines event guest lifecycle management:
- Collect and process invitations
- Manage RSVP states
- Track onsite check-ins
- Trigger notifications (email/SMS/push) (optional / TODO confirm)
- Export guest and attendance data

Designed to be:
- Type-safe (TypeScript end-to-end)
- Extensible (modular service boundaries)
- Cloud-friendly (stateless app layer + persistent Postgres)
- Event-driven ready (hooks & message queue placeholders)

---

## 2. Core Features

| Area | Feature | Description |
|------|---------|-------------|
| Guests | Create / import guests | Bulk CSV / manual entry / API ingestion |
| Invitations | Generate unique invite tokens | Secure shareable links |
| RSVP | Accept / decline / update party size | Tracks history & timestamps |
| Check-In | Real-time attendance marking | Supports scanning (QR/barcode) (TODO) |
| Segmentation | Tagging & grouping | Filter by status, type, tags |
| Notifications | Email / SMS dispatch | Transactional templates (TODO integrate provider) |
| Analytics | Counts & funnel metrics | RSVP rate, no-show rate |
| Export | CSV / JSON export | For reporting or BI ingestion |
| Admin | Role-based access | Granular permissions (planned) |
| Audit | Change tracking | Who changed what & when (TODO) |

---

## 3. Domain Model

Core entities (indicative):
- Guest: id, name, email, status, tags[]
- Invitation: id, guestId, token, sentAt, expiresAt, status
- RSVP: id, guestId, response (yes/no/maybe), partySize, respondedAt
- Event (optional if multi-event): id, name, date
- CheckIn: id, guestId, eventId, checkedInAt, method
- NotificationLog: id, type, channel, guestId, status, providerMessageId
- AuditLog: id, actorId, entityType, entityId, action, diff, timestamp

---

## 4. Technology Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript (≈89%) |
| Database | PostgreSQL (PL/pgSQL routines ≈9%) |
| Backend Runtime | Node.js (assumed) |
| API Style | REST (GraphQL optional extension) |
| Auth | JWT / Session / Magic Link (TODO confirm) |
| Migrations | (e.g., Prisma / Knex / SQL files) (TODO) |
| Frontend | React / (StackBlitz template likely) |
| Build Tool | Vite / Webpack (TODO confirm) |
| Testing | Vitest / Jest / Playwright (TODO) |
| Deployment | Docker / Vercel / Render / Fly.io (TODO) |
| CI/CD | GitHub Actions (TODO) |
| Formatting | Prettier / ESLint |

---

## 5. Project Structure (Example)

```
.
├── src/
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── domain/
│   │   ├── guests/
│   │   ├── rsvp/
│   │   └── invitations/
│   ├── services/
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── utils/
│   └── frontend/ (or separate repo)
├── scripts/
├── prisma/ or knex/ (optional)
├── tests/
├── package.json
└── README.md
```

Adapt according to actual repository layout (TODO replace with real tree).

---

## 6. Data & Persistence

- PostgreSQL used for relational integrity and transactional guest workflows.
- PL/pgSQL likely handles:
  - RSVP state transitions
  - Check-in counters
  - Aggregated materialized views (e.g., guest_status_summary)
- Recommended indexes:
  - idx_guest_email (unique)
  - idx_invitation_token
  - idx_rsvp_guest
  - idx_checkin_event_guest
- Example retention policy: anonymize personal data after event closure + 180 days (TODO).

---

## 7. API Overview (Example Endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/guests | List guests (filters: status, tag) |
| POST | /api/guests | Create guest(s) |
| GET | /api/guests/:id | Retrieve guest profile |
| PATCH | /api/guests/:id | Update guest |
| POST | /api/guests/import | Bulk import |
| POST | /api/invitations/:id/send | Send invitation |
| GET | /api/rsvp/:token | Fetch RSVP form data |
| POST | /api/rsvp/:token | Submit RSVP |
| POST | /api/checkin | Mark a guest checked in |
| GET | /api/metrics/summary | Attendance + RSVP metrics |
| GET | /api/export/guests | Download dataset |

Use OpenAPI / Swagger generation (TODO integrate).

---

## 8. Frontend Functionality (Indicative)

- Dashboard: metrics (Invited / Confirmed / Declined / Checked-In / No-Show)
- Guest List Table: search, tag filters, bulk actions
- Guest Detail: contact info, RSVP history, logs
- Invitation Composer: template + preview
- RSVP Public Page: minimal friction mobile-first form
- Check-In Mode: large input + scanner surface (mobile)
- Settings: event configuration, branding, notification templates

---

## 9. Workflows & Use Cases

1. Bulk Import -> Normalize -> Auto-create Invitations -> Send Batch
2. Guest opens RSVP link -> Submits response -> Triggers notification to organizer
3. Event Day -> Staff opens Check-In view -> Scans code -> Real-time metrics update
4. Post Event -> Export final attendance -> Archive guest list

State Machine (RSVP):
PENDING -> { ACCEPTED | DECLINED | MAYBE } -> (MODIFIED) -> LOCKED (after cutoff)

---

## 10. Environment Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | HTTP port | 3000 |
| NODE_ENV | Environment | production |
| DATABASE_URL | Postgres connection string | postgres://user:pass@host/db |
| JWT_SECRET | Token signing | (long random) |
| INVITE_BASE_URL | Base URL for invitation links | https://app.example.com/invite |
| EMAIL_PROVIDER_KEY | API key for email service | (secret) |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 60000 |
| RATE_LIMIT_MAX | Requests per window | 100 |

Create a `.env.example` with safe placeholders (TODO).

---

## 11. Running the Project

Development (example):
```
pnpm install
pnpm dev
```

Database migration (example):
```
pnpm migrate:dev
```

Seeding (example):
```
pnpm seed
```

Build:
```
pnpm build
pnpm start
```

---

## 12. Scripts (Hypothetical)

| Script | Purpose |
|--------|---------|
| dev | Start dev server |
| build | Compile TypeScript |
| start | Run production build |
| test | Run unit tests |
| test:e2e | Run end-to-end tests |
| lint | ESLint |
| format | Prettier formatting |
| migrate:* | Database migrations |
| seed | Seed initial data |

Update based on actual `package.json`.

---

## 13. Testing

Recommended Layers:
- Unit: pure domain logic (RSVP transitions)
- Integration: DB + API endpoints
- E2E: RSVP flow, Check-in workflow
- Performance: Concurrent RSVP submissions, check-in bursts

Frameworks (assumed): Vitest/Jest + Supertest + Playwright (TODO confirm)

---

## 14. Deployment

Deployment Targets:
- Containerized: Dockerfile multi-stage
- Serverless (optional): Split API & web
- DB Migrations: Run automatically on release

Scaling:
- Stateless app instances behind load balancer
- Connection pooling (pgBouncer)
- Caching layer (Redis) for metrics (future)

---

## 15. Security & Compliance

- Input validation (zod / yup / custom)
- Rate limiting + brute-force protection
- Invitation token hashing (if sensitive)
- Secure headers (helmet)
- GDPR alignment: Data export + deletion workflow (TODO)
- Audit trail for admin changes

---

## 16. Performance & Scalability

- N+1 avoidance with batched queries
- Incremental counters via SQL functions
- Optional queue for bulk email dispatch
- Caching RSVP counts (invalidate on write)

---

## 17. Roadmap (Proposed)

| Status | Item |
|--------|------|
| TODO | Add OpenAPI schema |
| TODO | Implement check-in QR codes |
| TODO | Notification provider abstraction |
| TODO | Role-based access control (RBAC) |
| TODO | Message bus for async tasks |
| TODO | Data anonymization job |
| Planned | Multi-event tenancy |
| Planned | Webhooks for external integrations |

---

## 18. Contributing

1. Fork & branch (`feat/<name>`)
2. Add/Update tests
3. Run lint & format
4. Submit PR with clear description

Conventional Commits suggested:
feat:, fix:, chore:, docs:, refactor:, perf:, test:

---

## 19. License

Specify license (MIT / Apache-2.0 / Proprietary).  
Add a LICENSE file (TODO).

---

## Related Documentation

- Architecture: See [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) (if present)
- API Reference: TODO link
- Deployment Guide: TODO link

---

## Quick Start (TL;DR)

```
git clone https://github.com/PricyEgg95/guests-handler.git
cd guests-handler
pnpm install
cp .env.example .env   # fill in values
pnpm migrate:dev
pnpm dev
```

Open: http://localhost:3000

---

## Badges (Optional Examples)

![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-TBD-lightgray)

---

## Final Notes

Replace assumptions with concrete implementation details:
- Real endpoint paths
- Actual script names
- Confirm tech: build tool, testing libraries
- Fill in license, contribution standards, security policy

Happy building! 🚀
