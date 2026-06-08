# ── Stock Time Nexus – Dockerfile ────────────────────────────────────────────
# Phase 4: Production Docker build
# Build:  docker build -t stock-nexus-backend .
# Run:    docker run -p 8000:8000 --env-file .env stock-nexus-backend

FROM python:3.11-slim

WORKDIR /app

# Install system deps (yfinance needs these)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY backend_main.py .

# Expose port
EXPOSE 8000

CMD ["uvicorn", "backend_main:app", "--host", "0.0.0.0", "--port", "8000"]
