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
| **EMPLOYEE** | View and manage assigned leads, update permitted stages, schedule follow-ups, add notes, view personal dashboard metrics. |

- Password hashing: `bcrypt` with unique salts.
- Token format: Signed HMAC-SHA256 JWT tokens with 24-hour expiration.

### Seeded Default Credentials (Development)
- **Administrator**: `admin@belvo.com` / `Admin@12345`
- **Employee 1**: `ashwini@belvo.com` / `Ashwini@12345`
- **Employee 2**: `carlos@belvo.com` / `Carlos@12345`
- **Employee 3**: `mariana@belvo.com` / `Mariana@12345`
- **Employee 4**: `alex@belvo.com` / `Alex@12345`

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
Runs 20 isolated test cases against in-memory SQLite:
```bash
cd backend
python -m pytest -v
```
**Coverage**:
- Authentication success, bad passwords, and role enforcement
- Admin vs Employee authorization boundaries
- Lead CRUD, pipeline stage updates, and soft archiving
- Follow-up creation, completion, and overdue classification
- Deterministic duplicate detection engine
- CSV / Excel import validation, row errors, and export sanitization
- Dashboard metrics and conversion rate calculations

### 2. Frontend Test Suite
```bash
npm test
```
**Result**: 26/26 functional persistence and state tests passed.

### 3. Production Build Check
```bash
npm run build
```
Builds cleanly with zero errors in `<1s`.

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
