# Cloud Cost Tracker

![CI](https://github.com/sawant-sushant/cloud-cost-tracker/actions/workflows/ci.yml/badge.svg)

Tracks AWS spend per service, exposes Prometheus metrics, and ships through a CI pipeline.

## Stack
Node.js, Express, Docker, Docker Compose, Prometheus, Grafana, GitHub Actions, Trivy

## Run locally
    docker compose up -d --build

- App: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin / admin)

## Endpoints
- `/health`: health check
- `/api/costs`: cost per AWS service
- `/metrics`: Prometheus metrics

## Modes
Set `COST_MODE=aws` to use real AWS Cost Explorer data. The default is `mock`.