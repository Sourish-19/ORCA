# Multistage Dockerfile for ORCA System
FROM python:3.10-slim AS backend

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY data/ ./data/

EXPOSE 8000
CMD ["python", "backend/app/main.py"]
