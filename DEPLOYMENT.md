# Belvo CRM - Production Deployment Guide

This guide details how to deploy the **Belvo CRM** system into production using Docker, Docker Compose, or Cloud Platforms (Render, Railway, Fly.io, or VPS).

---

## 1. Quick Start with Docker Compose (Recommended)

The easiest way to run the full application (Vite Frontend + FastAPI Backend + SQLite/PostgreSQL) in production is with Docker Compose.

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/budigeashwinigoud-glitch/CRMproject.git
cd CRMproject
cp .env.example .env
```
Edit `.env` to set a secure `JWT_SECRET` (at least 32 characters) and any optional third-party API keys (`OPENAI_API_KEY`, `META_APP_SECRET`).

### Step 2: Build and Launch
```bash
docker compose up -d --build
```

### Step 3: Verify Deployment
- Open your browser to `http://localhost:8000`
- The system automatically boots the database, seeds the administrative account, and serves both the FastAPI REST API (`/api/*`) and the compiled React frontend.

---

## 2. Cloud Platform Deployment

### Option A: Railway / Render / Fly.io (Single Container)
1. Link your GitHub repository (`budigeashwinigoud-glitch/CRMproject`).
2. Set Build Command: `Docker` (automatically uses `Dockerfile`).
3. Set Environment Variables:
   - `ENVIRONMENT=production`
   - `JWT_SECRET=<your-secure-32-char-random-string>`
   - `DATABASE_URL=sqlite:////app/data/crm.db` (or link a managed PostgreSQL service)
   - `CORS_ORIGINS=https://your-domain.com`
4. Deploy. The healthcheck endpoint at `/api/dashboard/metrics` will verify service health.

---

## 3. Production Security Checklist

- [x] **Secure JWT Secret**: Ensure `JWT_SECRET` is set to a 32+ character random string in production.
- [x] **Webhook Signatures**: Meta Lead Ads endpoint enforces HMAC-SHA256 (`x-hub-signature-256`) verification.
- [x] **Persistent Idempotency**: Webhook events are checked against the `processed_webhook_events` table before processing.
- [x] **CORS Lockdown**: Restrict `CORS_ORIGINS` to your registered production domains.
- [x] **HTTPS / TLS**: Always terminate SSL via Cloudflare, Nginx, or platform edge load balancer.

---

## 4. Verification & Testing

Run the full automated test suite to confirm 100% operational readiness:

```bash
# 1. Run Python backend pytest suite (46 tests)
python -m pytest backend/

# 2. Run JavaScript CRM service test suite (26 tests)
node test_crm_service.js

# 3. Verify Vite production build
npm run build
```
