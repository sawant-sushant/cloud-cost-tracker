import client from "prom-client";

client.collectDefaultMetrics();

export const register = client.register;

export const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

export const costGauge = new client.Gauge({
  name: "cloud_cost_usd",
  help: "Month-to-date cost per AWS service in USD",
  labelNames: ["service"],
});

export const totalGauge = new client.Gauge({
  name: "cloud_cost_total_usd",
  help: "Month-to-date total cost in USD",
});