# ==========================================
# Stage 1: Build Frontend Assets (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code and build production bundle
COPY index.html ./
COPY vite.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

# ==========================================
# Stage 2: Production Python Application
# ==========================================
FROM python:3.12-slim AS production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r ./requirements.txt

# Copy backend application
COPY backend ./backend

# Copy built frontend assets from Stage 1 into backend static directory
COPY --from=frontend-builder /app/dist ./dist

# Create storage directory for SQLite persistence
RUN mkdir -p /app/data

# Environment configuration defaults
ENV ENVIRONMENT=production
ENV DATABASE_URL=sqlite:////app/data/crm.db
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/dashboard/metrics || exit 1

# Start Uvicorn ASGI server
CMD ["python", "backend/run.py"]
