import { Router } from "express";
import { db } from "../lib/firebaseAdmin";

export const productsRouter = Router();

// The product catalogue (name, category, grades + cost per unit) is seeded
// via scripts/seedProducts.ts using the Firebase Admin SDK. It's read-only
// through this API on purpose — every aggregator sees the same platform
// price list, so it's not something individual users mutate from the app.

// GET /products — list active products with their grades/costs
productsRouter.get("/", async (_req, res) => {
  const snap = await db.collection("products").where("isActive", "==", true).get();
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json({ products });
});

// GET /products/:id
productsRouter.get("/:id", async (req, res) => {
  const doc = await db.collection("products").doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "Product not found" });
  res.json({ product: { id: doc.id, ...doc.data() } });
});
