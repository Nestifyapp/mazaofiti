import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/firebaseAdmin";
import { AuthedRequest } from "../middleware/verifyFirebaseToken";
import { DemandRequest } from "../types";

export const demandRequestsRouter = Router();

const createSchema = z.object({
  clientId: z.string().min(1),
  productId: z.string().min(1),
  grade: z.string().min(1),
  quantityDemanded: z.number().positive(),
});

// POST /demand-requests
// This is the endpoint behind the aggregator dashboard's main form:
// pick a client -> pick a product -> pick a grade -> enter quantity.
// The unit cost is never taken from the client — it's looked up from the
// product's grade in the catalog, so pricing stays consistent platform-wide.
demandRequestsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { clientId, productId, grade, quantityDemanded } = parsed.data;

  const [clientDoc, productDoc] = await Promise.all([
    db.collection("clients").doc(clientId).get(),
    db.collection("products").doc(productId).get(),
  ]);

  if (!clientDoc.exists) return res.status(404).json({ error: "Client not found" });
  const client = clientDoc.data()!;
  if (client.aggregatorId !== req.uid) {
    return res.status(403).json({ error: "Not your client" });
  }

  if (!productDoc.exists) return res.status(404).json({ error: "Product not found" });
  const product = productDoc.data()!;
  const gradeInfo = (product.grades ?? []).find((g: any) => g.grade === grade);
  if (!gradeInfo) {
    return res.status(400).json({ error: `Grade "${grade}" not found for this product` });
  }

  const now = new Date().toISOString();
  const doc: Omit<DemandRequest, "id"> = {
    aggregatorId: req.uid!,
    clientId,
    clientName: client.name,
    clientLocation: client.location,
    productId,
    productName: product.name,
    grade,
    unit: gradeInfo.unit,
    costPerUnit: gradeInfo.costPerUnit,
    currency: gradeInfo.currency,
    quantityDemanded,
    fulfilledQuantity: 0,
    totalCost: Math.round(quantityDemanded * gradeInfo.costPerUnit * 100) / 100,
    status: "open",
    createdAt: now,
  };

  const ref = await db.collection("demandRequests").add(doc);
  res.status(201).json({ id: ref.id, ...doc });
});

// GET /demand-requests?mine=true&status=open&clientId=...
demandRequestsRouter.get("/", async (req: AuthedRequest, res) => {
  let query: FirebaseFirestore.Query = db.collection("demandRequests");

  if (req.query.mine === "true") {
    query = query.where("aggregatorId", "==", req.uid);
  }
  if (typeof req.query.status === "string") {
    query = query.where("status", "==", req.query.status);
  }
  if (typeof req.query.clientId === "string") {
    query = query.where("clientId", "==", req.query.clientId);
  }

  const snap = await query.orderBy("createdAt", "desc").limit(100).get();
  const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json({ requests });
});

// PATCH /demand-requests/:id — update status or fulfilled quantity
const updateSchema = z.object({
  status: z.enum(["open", "in_progress", "fulfilled", "cancelled"]).optional(),
  fulfilledQuantity: z.number().min(0).optional(),
});

demandRequestsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const ref = db.collection("demandRequests").doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: "Request not found" });
  if (doc.data()?.aggregatorId !== req.uid) {
    return res.status(403).json({ error: "You don't own this request" });
  }

  await ref.update(parsed.data);
  const updated = await ref.get();
  res.json({ id: updated.id, ...updated.data() });
});
