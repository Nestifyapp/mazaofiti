/**
 * Seeds (or updates) the product catalog in Firestore.
 *
 * Run locally against the emulator:
 *   FIRESTORE_EMULATOR_HOST=localhost:8085 npm run seed
 *
 * Run against the real "mazaofiti" project:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
 *   FIREBASE_PROJECT_ID=mazaofiti npm run seed
 *
 * Products are matched by name — re-running this script updates existing
 * products' grades/costs rather than duplicating them, so it's safe to run
 * again whenever prices change.
 */
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID ?? "mazaofiti",
  });
}
const db = getFirestore();

async function seed() {
  const seedPath = path.join(__dirname, "products.seed.json");
  const products = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  const existing = await db.collection("products").get();
  const byName = new Map(existing.docs.map((d) => [d.data().name, d]));

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const now = new Date().toISOString();
    const existingDoc = byName.get(product.name);

    if (existingDoc) {
      await existingDoc.ref.update({ ...product, updatedAt: now });
      updated++;
    } else {
      await db.collection("products").add({ ...product, updatedAt: now });
      created++;
    }
  }

  console.log(`Seed complete: ${created} created, ${updated} updated.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
