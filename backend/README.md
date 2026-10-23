# Belvo CRM — Backend Architecture & Engineering Documentation

**Author / Maintainer:** Pavan (Backend Engineer)  
**Technology Stack:** Python 3.13, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyJWT, bcrypt, openpyxl, pandas  
**Database:** SQLite (`crm.db` for local development) & PostgreSQL compatible with automated Alembic migrations  
**Test Suite Status:** **44 / 44 tests passed (100% pass rate)**

---

## 1. System Architecture & Components

```
                     ┌───────────────────────────────┐
                     │   FastAPI Application Layer   │
                     └───────────────┬───────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
┌───────────────┐            ┌───────────────┐             ┌───────────────┐
│ Authentication│            │  Core CRM API │             │ Integrations  │
│    & RBAC     │            │ Leads/Stages  │             │   & AI Core   │
│ (Admin/Emp)   │            │ Followups/Logs│             │ Webhooks & ML │
└───────┬───────┘            └───────┬───────┘             └───────┬───────┘
        │                            │                             │
        └────────────────────────────┼─────────────────────────────┘
                                     ▼
                     ┌───────────────────────────────┐
                     │   SQLAlchemy 2.0 / Alembic    │
                     │  (Users, Leads, Events, etc)  │
                     └───────────────────────────────┘
```

---

## 2. Security & Authorization Matrix

Internal CRM endpoints require mandatory JWT authentication. Anonymous requests are strictly rejected with HTTP 401 Unauthorized.

| Route Group | Endpoint | Method | Allowed Roles | Isolation Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | POST | Public | Credential verification |
| **Auth** | `/api/auth/me` | GET | Admin, Employee | Returns authenticated user profile |
| **Users** | `/api/users` | GET, POST | **Admin only** | User provisioning and management |
| **Users** | `/api/users/{id}/*` | PATCH | **Admin only** | Role, password, and status updates |
| **Leads** | `/api/leads` | GET | Admin, Employee | Employees strictly isolated to assigned leads |
| **Leads** | `/api/leads` | POST | Admin, Employee | Automatically logs creation activity |
| **Leads** | `/api/leads/{id}` | GET, PUT, PATCH | Admin, Employee | Employees can only access assigned leads |
| **Leads** | `/api/leads/{id}` | DELETE | Admin, Employee | Soft archive (ownership verified) |
| **Leads** | `/api/leads/{id}/assignment` | PATCH | **Admin only** | Reassignment target must be active account |
| **Pipeline**| `/api/pipeline/stages` | GET | Admin, Employee | List active stages in display order |
| **Pipeline**| `/api/pipeline/stages/*` | POST, PATCH, DEL| **Admin only** | Stage lifecycle mutations |
| **Follow-ups**| `/api/follow-ups` | GET, POST | Admin, Employee | Employees only access assigned tasks |
| **Follow-ups**| `/api/follow-ups/{id}/*` | PATCH, POST, DEL | Admin, Employee | Ownership verified prior to mutation |
| **Activities**| `/api/activities` | GET, POST | Admin, Employee | Activity filtering respects lead assignment |
| **Dashboard** | `/api/dashboard/*` | GET | Admin, Employee | `?employee` query param overridden for Employees |
| **Data I/O** | `/api/export/leads` | GET | Admin, Employee | Export strictly filters by authenticated employee |
| **Data I/O** | `/api/import/leads` | POST | Admin, Employee | Imported leads assigned to authenticated user |
| **Webhooks** | `/api/integrations/webhooks/*`| POST | Public / Verified | Signature validated & crash-resilient dedup |

---

## 3. Production Hardening & Safety Controls

1. **Production Secret Enforcement:**
   - Startup and `Settings` validation raises an immediate `ValueError` if `ENVIRONMENT=production` and `SECRET_KEY` is the default development fallback or has fewer than 32 characters.
2. **Zero Auto-DDL in Production:**
   - In production, `Base.metadata.create_all()` is bypassed. Schema state is exclusively managed via Alembic migrations (`python -m alembic upgrade head`).
3. **No Synthetic Demo Seeding in Production:**
   - `seed_database` automatically aborts synthetic lead, task, and activity seeding when `ENVIRONMENT=production`.
4. **Dedicated Administrator Provisioning:**
   - Production administrators are provisioned via secure CLI without synthetic demo artifacts:
     ```bash
     python app/seed.py --provision-admin --email admin@belvo.com --password "StrongProductionPassword123!" --name "Lead Admin"
     ```

---

## 4. Third-Party Integrations & Webhook Architecture

- **Meta Lead Ads Webhook (`POST /api/integrations/webhooks/meta-lead-ads`):**
  - Verifies HMAC-SHA256 signatures via the `X-Hub-Signature-256` header using `settings.META_APP_SECRET`.
  - Crash-resilient deduplication backed by the `processed_webhook_events` database table. Replayed events return `isDuplicate: true` with action `ignored_duplicate_webhook`.
- **WhatsApp Cloud API (`/api/integrations/webhooks/whatsapp`):**
  - GET endpoint responds to standard Meta webhook verification challenge tokens.
  - POST endpoint parses nested Meta Cloud API message structures and associates interactions with lead timelines.
- **Provider Status Transparency (`GET /api/integrations/status`):**
  - Diagnostic endpoint that reports provider capabilities. Clearly distinguishes offline simulation stubs (`CONFIRMED_LOCAL`) from authenticated live connectors (`LIVE`).

---

## 5. AI / ML Contracts for Thrija

The backend defines modular interfaces for lead scoring, probability prediction, and recommendations:

- **Independent Metrics:**
  - `aiScore` (integer 0–100): Composite lead qualification score.
  - `conversionProbability` (float 0.0–1.0): Calibrated conversion likelihood without heuristic distortion.
  - Schema preserves model provenance: `aiModelVersion` and `aiScoredAt`.
- **Daily Manager Contract:**
  - Heuristic recommendations return `isHeuristicTemplate: true` and `confidence: null` so downstream consumers do not confuse template rules with trained ML inference.

---

## 6. Running Tests & Verification

```bash
# Execute full backend test suite (44 tests)
cd backend
python -m pytest -v

# Run database migrations
python -m alembic upgrade head
```

---

## 7. Frontend Integration & RBAC Verification

The frontend seamlessly bridges to this FastAPI backend:
- **Auto-Bootstrapping**: On initial visit, if a healthy backend is detected, the frontend auto-authenticates with the default demo account, establishes a secure JWT bearer session, and populates live database records.
- **Interactive Role Switcher**: Click the user profile in the navigation header to switch live between **Pavan Kumar (Employee)** and **CRM Administrator (Admin)**. This immediately demonstrates:
  - Employee lead portfolio isolation (Pavan only sees assigned leads: Nubank, Clip, Mercado Pago).
  - Admin team-wide oversight (full pipeline view and lead reassignment permissions).
- **Authenticated File Downloads**: Exports (`GET /api/export/leads`) are triggered using authenticated token blobs for clean, secure CSV and Excel downloads.
