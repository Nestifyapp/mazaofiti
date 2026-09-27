import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/firebaseAdmin";
import { AuthedRequest } from "../middleware/verifyFirebaseToken";
import { Client } from "../types";

export const clientsRouter = Router();

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
});

const clientSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  location: locationSchema,
});

// POST /clients — add a client to the current aggregator's book
clientsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const doc: Omit<Client, "id"> = {
    aggregatorId: req.uid!,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  const ref = await db.collection("clients").add(doc);
  res.status(201).json({ id: ref.id, ...doc });
});

// GET /clients — list the current aggregator's own clients
clientsRouter.get("/", async (req: AuthedRequest, res) => {
  const snap = await db
    .collection("clients")
    .where("aggregatorId", "==", req.uid)
    .orderBy("createdAt", "desc")
    .get();
  const clients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json({ clients });
});

// GET /clients/:id
clientsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const doc = await db.collection("clients").doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "Client not found" });
  if (doc.data()?.aggregatorId !== req.uid) {
    return res.status(403).json({ error: "Not your client" });
  }
  res.json({ id: doc.id, ...doc.data() });
});

// PATCH /clients/:id — update a client's details
clientsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const parsed = clientSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const ref = db.collection("clients").doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: "Client not found" });
  if (doc.data()?.aggregatorId !== req.uid) {
    return res.status(403).json({ error: "Not your client" });
  }

  await ref.update(parsed.data);
  const updated = await ref.get();
  res.json({ id: updated.id, ...updated.data() });
});

// DELETE /clients/:id
clientsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const ref = db.collection("clients").doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: "Client not found" });
  if (doc.data()?.aggregatorId !== req.uid) {
    return res.status(403).json({ error: "Not your client" });
  }
  await ref.delete();
  res.status(204).send();
});
