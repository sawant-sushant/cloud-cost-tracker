import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getCosts } from "./costs.js";
import { register, httpRequests, costGauge, totalGauge } from "./metrics.js";

const app = express();
const PORT = process.env.PORT || 3000;
const BUDGET = Number(process.env.MONTHLY_BUDGET_USD || 100);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequests.inc({
      method: req.method,
      route: req.route?.path || "other",
      status: res.statusCode,
    });
  });
  next();
});

app.use(express.static(path.join(__dirname, "public")));

async function refreshCostMetrics() {
  const data = await getCosts();
  costGauge.reset();
  data.items.forEach((i) => costGauge.set({ service: i.service }, i.cost));
  totalGauge.set(data.total);
  return data;
}

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/costs", async (req, res) => {
  try {
    const data = await refreshCostMetrics();
    res.json({ ...data, budget: BUDGET, overBudget: data.total > BUDGET });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch costs" });
  }
});

app.get("/metrics", async (req, res) => {
  try {
    await refreshCostMetrics();
  } catch (err) {
    console.error(err);
  }
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));