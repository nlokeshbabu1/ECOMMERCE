#FRom python with builder
FROM python:3.11-slim AS builder

#Working directory
WORKDIR /app

#Install the build dependency
RUN apt-get update && apt-get install -y build-essential gcc

#Copy the requirement file
COPY requirements.txt .

#Install requriement file in path /install
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

#Copy the source file
COPY . .

#Step : production
FROM python:3.11-slim
WORKDIR /app

# Create non-root user for security
RUN groupadd -r appuser && useradd -m -r -g appuser appuser
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY --from=builder /app /app

# Set permissions for appuser
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD curl -f http://localhost:5000/healthz || exit 1

CMD ["python3", "app.py"]