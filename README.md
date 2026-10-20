# Belvo Internal CRM & AI-Powered Lead Management System

A production-grade, secure, responsive B2B Open Finance CRM & Lead Intelligence platform engineered for LatAm sales operations.

- **Frontend**: React 19, React Router DOM 7, Lucide React, Vite, Accessible Design Tokens
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyJWT, bcrypt, openpyxl, pandas
- **Persistence**: SQLite (local development) and PostgreSQL (production deployment) with automated schema migrations

---

## 🚀 System Architecture & Capabilities

```
┌────────────────────────────────────────────────────────┐
│               React 19 Frontend (Vite)                 │
│  Dashboard | Leads Table | Kanban Pipeline | Tasks     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (JSON / Multipart)
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Backend Layer (/api)               │
│  - JWT Bearer Authentication & RBAC (Admin / Employee) │
│  - RESTful Leads, Pipeline, Follow-ups, Activities     │
│  - CSV / Excel Validation & Safe Export Engine         │
│  - Deterministic Duplicate Detection Service           │
│  - Modular AI / ML Provider Interface (Thrija Ready)   │
└───────────────────────────┬────────────────────────────┘
                            │ SQLAlchemy 2.0 ORM
                            ▼
┌────────────────────────────────────────────────────────┐
│         Relational Database (SQLite / Postgres)        │
│  users | pipeline_stages | leads | follow_ups |        │
│  activities | notes | alembic_version                  │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Core Modules

### 1. Executive Dashboard (`/` & `/api/dashboard/metrics`)
- Real-time aggregated metrics: Total Leads, In-Progress, Won Revenue ($ USD), Conversion Rate (%), Overdue Tasks.
- Live pipeline stage distribution with volume and dollar value calculations.
- Acquisition channel performance (Referral, LinkedIn, Website, Inbound, Partner, Event, Outbound).
- Employee-specific workload and conversion metrics (`/api/dashboard/employee-metrics`).

### 2. Lead Management & CRUD (`/leads` & `/api/leads`)
- Full lifecycle CRUD with server-side validation.
- Live search across contact name, company, email, phone, and lead ID.
- Dynamic filtering by Pipeline Stage, Priority, Source, and Assigned Specialist.
- Multi-column sorting (Created Date, Expected Value, Company, Priority).
- Soft archiving (`POST /api/leads/{id}/archive`) and restoring (`POST /api/leads/{id}/restore`).
- Lead reassignment with automatic audit trail generation (`PATCH /api/leads/{id}/assignment`).

### 3. Configurable Sales Pipeline (`/pipeline` & `/api/pipeline/stages`)
- 8-stage interactive deal progression:
  $$\text{New} \longrightarrow \text{Contacted} \longrightarrow \text{Qualified} \longrightarrow \text{Meeting} \longrightarrow \text{Proposal} \longrightarrow \text{Negotiation} \longrightarrow \text{Won} \mathbin{/} \text{Lost}$$
- Dynamic pipeline stages managed via database (`GET`, `POST`, `PATCH`, `DELETE /api/pipeline/stages`).
- Safe deletion validation (prevents removing stages containing active leads).

### 4. Follow-ups & Task Scheduling (`/follow-ups` & `/api/follow-ups`)
- Task scheduling (Calls, Meetings, Emails, Reviews) linked to lead accounts.
- Status classification: `Pending`, `Due Today`, `Overdue`, and `Completed`.
- One-click task completion (`POST /api/follow-ups/{id}/complete`).

### 5. Activity Audit Trail & Notes (`/activities` & `/api/leads/{id}/notes`)
- Chronological company-wide audit log for stage transitions, lead creation, and reassignments.
- Dedicated lead notes with author attribution and timestamping.

### 6. CSV & Excel Import / Export (`/api/import/leads` & `/api/export/leads`)
- Import `.csv` and `.xlsx` spreadsheets with row-level validation and clear error reports.
- Preview / dry-run mode (`?dry_run=true`) to validate files prior to database insertion.
- Formula injection defense: automatically escapes cells starting with `=`, `+`, `-`, or `@`.

### 7. Deterministic Duplicate Detection (`/api/leads/duplicates/check`)
- Multi-factor duplicate analysis: exact email match, normalized phone match, company match, and company + contact match.
- Returns potential matching records with confidence levels (`High` / `Medium`) without destructive auto-merging.

---

## 🔐 Authentication & RBAC

| Role | Permissions & Capabilities |
| :--- | :--- |
| **ADMIN** | Full system access. Create/manage team accounts, manage pipeline stages, view all leads/metrics, assign leads, import/export data. |
| **EMPLOYEE** | View and manage assigned leads, update permitted stages, schedule follow-ups, add notes, view personal dashboard metrics. Data isolation strictly enforced. |

- **Password Hashing**: `bcrypt` with unique per-user salts.
- **Token Security**: Signed HMAC-SHA256 JWT bearer tokens with 24-hour expiration.
- **Interactive UI Role Switcher**: Click the user badge in the top navigation header to toggle between **Admin** (`admin@belvo.com`) and **Employee** (`ashwini@belvo.com` / `carlos@belvo.com`) to test live permissions, role restrictions, and employee lead isolation in real time.

### Seeded Default Credentials (Development)
- **Administrator**: `admin@belvo.com` / `Admin@12345` (Admin role, full team view)
- **Employee 1**: `ashwini@belvo.com` / `Ashwini@12345` (Employee role, Nubank, Clip portfolio)
- **Employee 2**: `carlos@belvo.com` / `Carlos@12345` (Employee role, Clara Cards, Creditas portfolio)
- **Employee 3**: `mariana@belvo.com` / `Mariana@12345`
- **Employee 4**: `alex@belvo.com` / `Alex@12345`

### 🎨 Frontend UI / UX Highlights & Enhancements
- **Dynamic Perspective Pill**: Executive Dashboard header immediately displays whether viewing an individual employee portfolio (`👤 Portfolio: Ashwini Sharma`) or the team-wide view (`👑 Team-wide View (Admin)`).
- **One-Click Role Switcher**: Interactive popover in Header allows instant RBAC switching without manual token entry.
- **Authenticated Blob Export**: One-click direct file download for CSV and Excel (.xlsx) exports using secure Bearer authentication tokens.
- **Enhanced AI Lead Intelligence**: Client Profile displays composite `aiScore` (0–100), calibrated win probability percentage (`% Win Prob`), and model version provenance.
- **Real-Time Notification Popover**: Header alert bell surfaces impending and overdue follow-up tasks with one-click navigation.

---

## 🛠️ API Endpoint Reference

Interactive OpenAPI documentation is available live at **[http://localhost:8000/api/docs](http://localhost:8000/api/docs)**.

### Authentication
- `POST /api/auth/login` — Authenticate and receive JWT access token
- `GET /api/auth/me` — Retrieve current authenticated user profile

### User Management (Admin Only)
- `GET /api/users` — List employee accounts
- `POST /api/users` — Register new employee account
- `GET /api/users/{user_id}` — Get employee account details
- `PATCH /api/users/{user_id}` — Update user name, email, role, or password
- `PATCH /api/users/{user_id}/status` — Activate or deactivate account

### Leads
- `GET /api/leads` — List leads with search, filters, sorting, and pagination
- `POST /api/leads` — Create lead (automatically logs activity and follow-up)
- `GET /api/leads/{id}` — Get single lead details
- `PUT /api/leads/{id}` — Full update of lead record
- `PATCH /api/leads/{id}` — Partial update of lead record
- `DELETE /api/leads/{id}` — Soft delete / archive lead
- `POST /api/leads/{id}/archive` — Explicit lead archive
- `POST /api/leads/{id}/restore` — Restore archived lead
- `PATCH /api/leads/{id}/stage` — Update pipeline stage
- `PATCH /api/leads/{id}/assignment` — Reassign lead to team member
- `POST /api/leads/duplicates/check` — Check potential duplicate matches

### Activities & Notes
- `GET /api/activities` — Company-wide activity audit trail
- `POST /api/activities` — Log manual activity
- `GET /api/leads/{id}/activities` — Audit logs specific to lead
- `GET /api/leads/{id}/notes` — Notes attached to lead
- `POST /api/leads/{id}/notes` — Add note to lead

### Follow-ups
- `GET /api/follow-ups` — List follow-ups (filters: status, employee, priority)
- `POST /api/follow-ups` — Schedule follow-up task
- `GET /api/follow-ups/{id}` — Get follow-up details
- `PATCH /api/follow-ups/{id}` — Update follow-up
- `PATCH /api/follow-ups/{id}/status` — Update status
- `POST /api/follow-ups/{id}/complete` — Mark task completed
- `DELETE /api/follow-ups/{id}` — Delete follow-up

### Pipeline Stages
- `GET /api/pipeline/stages` — List active stages in display order
- `POST /api/pipeline/stages` — Create new stage
- `PATCH /api/pipeline/stages/{stage_id}` — Update stage metadata
- `DELETE /api/pipeline/stages/{stage_id}` — Remove stage (safe validation)

### Dashboard Metrics
- `GET /api/dashboard/metrics` — Aggregate metrics and breakdowns
- `GET /api/dashboard/employee-metrics` — Employee-filtered performance
- `GET /api/dashboard/pipeline` — Stage distribution list
- `GET /api/dashboard/lead-sources` — Lead channel ranking

### Import & Export
- `POST /api/import/leads` — Upload `.csv` or `.xlsx` spreadsheet with report
- `GET /api/export/leads` — Download sanitized CSV or Excel file

---

## 🏃 Setup & Local Development

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.11+)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Seed initial Latin America test data and users
python app/seed.py

# Start FastAPI server (runs on port 8000)
python run.py
```
Backend API will be running at **[http://localhost:8000](http://localhost:8000)**.
Interactive Swagger documentation: **[http://localhost:8000/api/docs](http://localhost:8000/api/docs)**.

---

### 2. Frontend Setup

```bash
# In project root
npm install

# Start Vite development server
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

The frontend automatically detects the live FastAPI backend on port 8000 and activates **FastAPI Live** mode with SQLite persistence.

---

## 🧪 Automated Testing

### 1. Backend Test Suite (pytest)
Runs **46 isolated test cases** against in-memory SQLite with 100% pass rate:
```bash
cd backend
python -m pytest -v
```
**Coverage Across Verification Suites**:
- **Authentication & RBAC (`test_auth.py`, `test_permissions.py`)**: Token issuance, password verification, Admin and Employee boundaries.
- **Security Audit & Isolation (`test_security_audit.py`)**: Mandatory authentication on all CRM endpoints, parameter tampering prevention, employee lead isolation, pipeline mutation restrictions, production configuration fail-safes.
- **Leads & Pipeline Management (`test_leads.py`)**: Full CRUD lifecycle, search, multi-attribute filtering, admin-only reassignments, archiving, and restoration.
- **Follow-ups & Activities (`test_follow_ups_and_activities.py`)**: Task scheduling, completion, notes attribution, and activity audit logging.
- **Dashboard & Performance Metrics (`test_dashboard_metrics.py`)**: Aggregate stage counts, revenue calculations, conversion rates, and employee metric isolation.
- **Data I/O & Deduplication (`test_duplicates_and_io.py`)**: CSV/Excel uploads, row-level error reporting, formula injection defense, and multi-factor duplicate detection.
- **Third-Party Integrations (`test_integrations.py`)**: Meta Lead Ads HMAC-SHA256 signature verification, persistent crash-resilient event deduplication, WhatsApp challenge verification, and adapter status reporting.
- **AI Contracts (`test_ai_contracts.py`)**: Modular ML contracts for Thrija, unskewed conversion probability calibration, and transparent heuristic labeling.

---

---

## 📊 Project Roadmap, Deliverables & Testing Status

### 🎯 Overall Status: ~85% Complete (Ahead of Schedule for Week 2 Review)

| Milestone & Module | Status | Deliverables Completed | Pending / Next Steps |
| :--- | :---: | :--- | :--- |
| **Week 1: CRM Foundation** (7–13 Oct) | **100% DONE** | User authentication (JWT + bcrypt), Admin & Employee roles, Lead CRUD, search, multi-filter, prioritization, notes, configurable 8-stage pipeline (`New` $\rightarrow$ `Won`/`Lost`), database schema & Alembic migrations. | None (Fully complete). |
| **Week 2: Sales Pipeline & Follow-Ups** (14–20 Oct) | **100% DONE** | Kanban board with drag-and-drop stage movement, task scheduling (Today / Upcoming / Overdue), centralized client profiles, activity audit trail, table pagination, and strict employee data isolation. | None (Fully complete). |
| **Week 3: Dashboards & Data Management** (21–27 Oct) | **90% DONE** | Executive & Employee dashboard metrics, CSV & Excel import/export with formula injection defense, multi-factor duplicate detection, webhook architecture (Meta HMAC-SHA256, WhatsApp). | Connection of live third-party API credentials (Meta, WhatsApp, Google OAuth). |
| **Week 4: AI/ML, Testing & Deployment** (28 Oct–3 Nov) | **50% DONE** | REST endpoints for AI Lead Scoring (`Hot`/`Warm`/`Cold`), conversion probability, summaries, next-best action, AI message drafts, daily manager. Decoupled DB columns. 46 backend tests, 26 frontend tests, Vite build verified. | Custom ML model training / LLM fine-tuning weights; live cloud hosting setup. |

---

### 🔍 Status Breakdown: What is Done, What Needs to be Built, and What Needs to be Verified / Tested

```
┌────────────────────────┬────────────────────────┬────────────────────────┐
│      1. WHAT IS        │     2. WHAT NEEDS      │     3. WHAT NEEDS      │
│         DONE           │      TO BE BUILT       │   TO BE TESTED /       │
│  (Verified & Working)  │  (Remaining Modules)   │      VERIFIED          │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

#### 1. What is Done (Built, Integrated & Operational)
- **Core Architecture & Persistence**:
  - Relational schema (users, leads, pipeline stages, follow-ups, activities, notes) with Alembic migration version control.
  - Zero mock data startup guarantee: Clean database with zero fake demo records on boot.
  - Cloud PostgreSQL compatibility: `psycopg2-binary` driver and `postgres://` URL normalization ready for Supabase/Neon/Render.
- **Authentication, Security & Roles**:
  - JWT Bearer authentication with bcrypt password hashing.
  - Dedicated `/login` page with secure token management and `ProtectedRoute` redirection.
  - Role-based authorization: Employees cannot access other employees' records or administrative settings.
  - User management page (`/users`) for viewing, creating accounts, and toggling active/inactive status.
  - Production security validation: Settings validator prevents default or weak JWT secrets in production.
- **Lead Lifecycle & Pipeline Management**:
  - Full CRUD lifecycle with search, dynamic multi-attribute filtering, priority, source, and notes.
  - 8-stage interactive Kanban board (`New → Contacted → Qualified → Meeting → Proposal → Negotiation → Won / Lost`) with drag-and-drop.
  - Dedicated `/archived-leads` page with instant lead restoration.
  - Centralized client profiles with contact cards and full historical activity timeline.
- **Follow-ups & Activity Audit**:
  - Task scheduling with `Today`, `Upcoming`, and `Overdue` filtering and one-click completion.
  - Unified company-wide activity audit trail tracking stage transitions, outreach, and user events.
  - Table pagination across Activities and Clients tables.
- **Dashboards & Data Management**:
  - Executive and Employee dashboard metrics (lead counts, won revenue, conversion rates, pipeline values).
  - Bulk CSV and Excel (`.xlsx`) import with row-level validation.
  - CSV and Excel export triggers protected by formula injection defense (`=`, `+`, `-`, `@` escaped).
  - Multi-factor duplicate lead detection (matching by email, phone, company, and contact name).
- **Integrations & AI Architecture**:
  - Webhook security: HMAC-SHA256 signature validation with persistent crash-resilient event deduplication.
  - AI backend endpoints: Lead scoring, conversion probability, NLP summaries, next-best action, AI message drafting, and Daily Manager.
- **Automated Test Suites**:
  - 46 backend pytest tests passing (100%).
  - 26 frontend functional tests passing (100%).
  - Clean Vite production build in < 1 second.

---

#### 2. What Needs to be Built (Remaining Scope)
- **Custom Trained ML Inference Models (AI/ML Module)**:
  - Connect custom-trained classification models (e.g. Scikit-learn / XGBoost lead scoring model) to replace the heuristic fallbacks in `backend/app/services/ai_service.py`.
  - Connect live Google Gemini API or OpenAI API keys for generative natural language response drafting.
- **Live Provider Handshake Pipelines (Integrations Module)**:
  - Plug in Meta Developer App ID and App Secret (`META_APP_SECRET`) for live Facebook/Instagram Lead Ads webhook subscriptions.
  - Plug in WhatsApp Cloud API permanent system access token & Phone Number ID for live two-way messaging.
  - Implement live Google Workspace & Microsoft Graph OAuth 2.0 token exchange routes for calendar meetings and email sync (upgrading from the current `CONFIRMED_LOCAL` local adapter).
- **Cloud Hosting & Production Deployment Setup**:
  - Create Render / Fly.io web service configuration for the FastAPI backend.
  - Create Vercel / Netlify static hosting configuration for the React frontend.
  - Provision a production cloud PostgreSQL database on Supabase or Neon.

---

#### 3. What Needs to be Verified / Tested (QA & Pre-Submission Checklist)
- **Live Third-Party Webhook Testing**:
  - Test Meta Lead Ads webhook with real Facebook Graph API test payloads and verify HMAC-SHA256 signature calculation against live credentials.
  - Test WhatsApp webhook verification handshake (`hub.challenge` and `hub.verify_token`) with live Meta Developer portal.
- **Cloud Database Load & Persistence Verification**:
  - Execute live Alembic migrations against the production PostgreSQL instance (`alembic upgrade head`).
  - Verify concurrent read/write transactions under multi-user access.
- **End-to-End User Acceptance Testing (UAT)**:
  - Multi-user browser testing: Verify simultaneously logging in as Admin (`admin@belvo.com`) in one browser window and Employee (`ashwini@belvo.com`) in an incognito window to verify real-time data isolation.
  - Test large spreadsheet uploads (1,000+ rows) via CSV/Excel bulk import to verify memory and timeout thresholds.
  - Verify exported CSV/Excel files open safely in Microsoft Excel and Google Sheets without formula injection security warnings.
- **Mobile & Cross-Browser Responsiveness**:
  - Verify the Kanban board and dashboard layout render cleanly on tablet and mobile viewports.
- **Final Security & Penetration Audit**:
  - Verify that running with `ENVIRONMENT=production` rejects any insecure or default `JWT_SECRET`.
  - Confirm CORS headers only allow verified frontend production domains.

### 2. Frontend Test Suite
```bash
npm test
```
**Result**: 26/26 functional persistence and state tests passed (100% success).

### 3. Production Build Check
```bash
npm run build
```
**Result**: Vite production bundle compiled cleanly with zero errors in ~1.1s.

---

## 🔌 Teammate & ML Integration Notes

### For Teammate Thrija (AI / ML Engineer)
- An abstract AI scoring interface is available in `backend/app/integrations/interfaces.py`:
  - Extend `BaseAIScoringProvider` to integrate custom LLM scoring or PyTorch models.
  - The Lead schema stores `aiScore` (0–100) and `aiSummary` (text) attributes directly compatible with the frontend UI score badge.

---

## 📂 Project Structure

```
CRMPROJECT/
├── backend/
│   ├── alembic/              # Database schema migration files
│   ├── app/
│   │   ├── config.py         # App configuration & JWT settings
│   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   ├── main.py           # FastAPI application & middleware
│   │   ├── seed.py           # Database seeder (users, stages, demo leads)
│   │   ├── integrations/     # AI / ML and webhook interfaces
│   │   ├── models/           # SQLAlchemy ORM models (User, Lead, etc.)
│   │   ├── routers/          # API route handlers
│   │   ├── schemas/          # Pydantic v2 request/response schemas
│   │   └── services/         # Business logic (duplicate, metrics, IO)
│   ├── tests/                # Automated pytest test suite
│   ├── alembic.ini
│   ├── requirements.txt
│   └── run.py
├── public/
├── src/
│   ├── components/
│   │   ├── common/           # Toast, Badge, Modal, ConfirmDialog
│   │   ├── layout/           # Header, Sidebar, Layout
│   │   ├── leads/            # LeadFormModal, LeadDetailModal
│   │   └── pipeline/         # KanbanColumn, KanbanCard
│   ├── context/
│   │   └── CRMContext.jsx    # Central state provider with live backend integration
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── LeadsPage.jsx     # Table view with CSV Import / Export
│   │   ├── PipelinePage.jsx  # Interactive Kanban board
│   │   ├── ClientsPage.jsx
│   │   ├── FollowUpsPage.jsx
│   │   └── ActivitiesPage.jsx
│   ├── services/
│   │   ├── api.js            # Unified HTTP REST API client
│   │   ├── dataService.js    # LocalStorage demo fallback store
│   │   └── mockData.js       # Standard Belvo LatAm dataset
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── test_crm_service.js       # Frontend Node verification suite
├── package.json
└── README.md
```
