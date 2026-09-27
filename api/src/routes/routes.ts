import { Router } from "express";
import { z } from "zod";

export const routesRouter = Router();

const pointSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lng: z.number(),
  label: z.string().optional(),
});

const optimizeSchema = z.object({
  start: pointSchema, // e.g. the aggregator's warehouse/collection point
  stops: z.array(pointSchema).min(1),
});

// Haversine distance in km between two lat/lng points.
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// POST /routes/optimize
// Given a start point and a set of delivery/pickup locations already stored
// against demand requests or supply offers, returns a suggested visiting
// order using a simple nearest-neighbour heuristic — good enough for
// planning a manual delivery run without any vehicle-fleet infrastructure.
// Swap this out for Google Directions/Distance Matrix if you need real
// road-network distances and turn-by-turn directions later.
routesRouter.post("/optimize", (req, res) => {
  const parsed = optimizeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { start, stops } = parsed.data;

  const remaining = [...stops];
  const ordered: typeof stops = [];
  let current = start;
  let totalKm = 0;

  while (remaining.length) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((stop, idx) => {
      const d = distanceKm(current, stop);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = idx;
      }
    });
    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    totalKm += nearestDist;
    current = next;
  }

  res.json({
    order: ordered.map((s, i) => ({ sequence: i + 1, ...s })),
    estimatedDistanceKm: Math.round(totalKm * 10) / 10,
  });
});
