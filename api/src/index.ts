import express from "express";
import cors from "cors";
import { verifyFirebaseToken } from "./middleware/verifyFirebaseToken";
import { productsRouter } from "./routes/products";
import { clientsRouter } from "./routes/clients";
import { demandRequestsRouter } from "./routes/demandRequests";
import { routesRouter } from "./routes/routes";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);

// Health check — no auth required, useful for App Hosting/Cloud Run probes.
app.get("/health", (_req, res) => res.json({ ok: true }));

// Everything below requires a valid Firebase ID token, sent by both the
// Next.js web app and any future native mobile client.
app.use(verifyFirebaseToken);

app.use("/products", productsRouter);
app.use("/clients", clientsRouter);
app.use("/demand-requests", demandRequestsRouter);
app.use("/routes", routesRouter);

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
