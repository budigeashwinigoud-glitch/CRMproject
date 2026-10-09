<<<<<<< HEAD
# Belvo Internal CRM & AI-Powered Lead Management System

A polished, high-performance, responsive React CRM frontend engineered for internal B2B Open Finance lead management and sales pipeline operations across Latin America.

---

## 🚀 Key Highlights & Completed Scope

### 1. Executive Dashboard (`/`)
- **Real-time Derived Metrics**: Total active leads, active pipeline value ($ USD), won deal revenue, win/loss conversion rate percentage, and scheduled vs. overdue follow-ups.
- **Visual Pipeline Distribution**: Stage progress bars with deal volume breakdown.
- **Lead Acquisition Channels**: Source attribution breakdown (LinkedIn, Referral, Inbound, Website, Partner, Event, Outbound).
- **Recent High-Value Prospects & Activity Stream**: Real-time audit of recent deal movements.

### 2. Full Lead Management & CRUD (`/leads`)
- **Comprehensive Table View**: Clear column structure (Company & Contact, Stage, Priority, Source, Deal Value, Assigned Specialist, Next Follow-up, Actions).
- **Search & Multi-Filtering**: Live search across contact name, company, email, phone, and Lead ID; filtering by Stage, Priority, Source, and Assignee.
- **Column Sorting**: Sort by Company, Priority, Value ($), Created Date, and Follow-up Date.
- **Form Validation & Modals**: Create and edit lead modals with required field checks, email format validation, and value type coercion.
- **Lead Archiving**: Safe lead archiving with confirmation dialogs and cascading follow-up cleanup.
- **Pagination**: Configurable pagination with page size controls.

### 3. 8-Stage Sales Pipeline Kanban (`/pipeline`)
- **Horizontal Kanban Board**:
  $$\text{New} \longrightarrow \text{Contacted} \longrightarrow \text{Qualified} \longrightarrow \text{Meeting} \longrightarrow \text{Proposal} \longrightarrow \text{Negotiation} \longrightarrow \text{Won} \mathbin{/} \text{Lost}$$
- **Interactive Stage Progression**: Move deals instantly across any stage with quick-select dropdowns or detail inspection.
- **Stage Metrics**: Total deal volume and count headers on every stage column.
- **Kanban Search & Filters**: Search cards by name or company, and filter by priority or assignee.

### 4. Client & Account Directory (`/clients` & `/leads/:id`)
- **Enterprise Client Profiles**: Dedicated client profiles showing company metadata, contact details, deal sizes, and locations.
- **Interactive Timeline**: Chronological interaction and stage progression history.
- **Linked Follow-ups**: Dedicated client task lists with instant completion toggling.
- **AI Readiness Cards**: Non-intrusive placeholders for AI lead scoring (0–100) and predictive conversion insights.

### 5. Follow-ups & Task Management (`/follow-ups`)
- **Tabbed Views**: `All`, `Overdue`, `Due Today`, `Upcoming`, and `Completed`.
- **Status Toggling**: Direct one-click completion checkbox.
- **Schedule Task Modal**: Schedule calls, meetings, emails, and review tasks with due dates, times, and assignee allocation.

### 6. Activity Audit Trail (`/activities`)
- Chronological company-wide audit trail capturing stage transitions, new lead creation, notes, and task completion.
- Filter events by type and team member.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Design System**: Vanilla CSS tokens in `src/index.css` (Dark navy sidebar `#090e1a`, crisp workspace `#f8fafc`, accessible contrast badges, toast alert system, modal dialogs).
- **State & Persistence**: Centralized `CRMContext` backed by `dataService` with LocalStorage persistence (`belvo_crm_leads_v1`, `belvo_crm_followups_v1`, `belvo_crm_activities_v1`).
- **Reset Demo Data**: Built-in reset button in the sidebar to restore standard test datasets anytime.

---

## 🔌 Teammate Integration Layer

### Backend REST API Layer (`src/services/api.js`)
Configured via `.env` with fallback to LocalStorage in Demo Mode:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```
Pre-configured endpoint methods:
- `GET /api/leads` | `POST /api/leads`
- `GET /api/leads/:id` | `PUT /api/leads/:id` | `DELETE /api/leads/:id`
- `PATCH /api/leads/:id/stage`
- `GET /api/dashboard/metrics`
- `GET /api/follow-ups` | `POST /api/follow-ups` | `PATCH /api/follow-ups/:id/status`
- `GET /api/activities`

### AI / ML Model Hooks
Lead schema includes `aiScore` (0–100) and `aiSummary` properties ready for ML model predictions.

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```
CRMPROJECT/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/         # Badge, StatCard, Toast, Modal, ConfirmDialog, EmptyState
│   │   ├── layout/         # Sidebar, Header, Layout
│   │   ├── leads/          # LeadFormModal, LeadDetailModal
│   │   └── pipeline/       # KanbanColumn, KanbanCard
│   ├── context/
│   │   └── CRMContext.jsx  # Centralized React state provider
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── LeadsPage.jsx
│   │   ├── PipelinePage.jsx
│   │   ├── ClientsPage.jsx
│   │   ├── FollowUpsPage.jsx
│   │   ├── ActivitiesPage.jsx
│   │   └── LeadDetailPage.jsx
│   ├── services/
│   │   ├── api.js          # HTTP REST API client
│   │   ├── dataService.js  # Persistence, CRUD & metric calculations
│   │   └── mockData.js     # Initial dataset & pipeline stages
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── test_crm_service.js     # Automated node test suite
├── package.json
└── README.md
```
=======
# CRMproject
>>>>>>> 86480190ed2adb44a7f93ecd332b7947e4cdd64e
