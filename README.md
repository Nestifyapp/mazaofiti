# Mazaofiti

A demand-aggregation platform for agricultural products. Any signed-in user
works as an aggregator: they build a book of their own clients, and post
demand on behalf of those clients for a product/grade from the shared
catalog. Client locations are captured so routes to fulfil demand can be
worked out — no fleet/vehicle management is included; aggregators use their
own means of delivery.

Repo: https://github.com/Nestifyapp/mazaofiti
Firebase project: `mazaofiti`

See **DEPLOY.md** for the first-time GitHub push + Firebase App Hosting
setup, start to finish.

## Structure

Two independently deployable Firebase App Hosting backends in one Firebase
project:

```
mazaofiti/
├── web/     Next.js app — aggregator dashboard (clients, demand, catalog)
├── api/     Express API — business logic, called by web AND any future
│            native mobile app
├── firestore.rules
├── firestore.indexes.json
└── .firebaserc   (pins the default project to "mazaofiti")
```

Both talk to the same Firebase project: Firebase Auth (Email/Password +
Google) and Firestore.

## Why two backends instead of one

- `web` is the Next.js dashboard — pages, forms.
- `api` is a plain Express/TypeScript service — no HTML, just JSON
  endpoints, so a future native mobile app can call the exact same backend
  as the web dashboard with no duplicated logic.
- Both run as Firebase App Hosting backends (Node.js, no containers to
  manage), in the same project, same billing.

## Data model

Source of truth: `api/src/types.ts` (mirrored in `web/src/lib/types.ts` for
the frontend).

- **`users`** — Firebase Auth profile (`name`, `email`). Every user is an
  aggregator; there's no separate role system.
- **`clients`** — the aggregator's own client book: `name`, `contact`,
  `location` (lat/lng + address). Each aggregator only sees their own
  clients.
- **`products`** — the shared catalog: `name`, `category`, and a `grades`
  array, where each grade (`"Grade A"`, `"Grade 1"`, etc.) carries its own
  `unit` and `costPerUnit`. Read-only through the API — seeded via
  `api/scripts/seedProducts.ts`.
- **`demandRequests`** — a client demands a quantity of a product at a
  grade. Created by choosing an existing client, a product, and a grade;
  the cost is looked up from the catalog and snapshotted onto the request
  (so historical records don't drift if catalog prices change later), and
  the client's location is snapshotted too so it's available for route
  planning without a join.

```
demandRequests/{id}
  aggregatorId, clientId, clientName, clientLocation,
  productId, productName, grade, unit, costPerUnit, currency,
  quantityDemanded, fulfilledQuantity, totalCost, status, createdAt
```

## Local development

Prereqs: Node 20+, Firebase CLI (`npm i -g firebase-tools`).

```bash
# 1. Emulators (optional but recommended)
firebase emulators:start --only auth,firestore

# 2. API service
cd api
cp .env.example .env
npm install
npm run dev                # http://localhost:8080

# 3. Web app (new terminal)
cd web
cp .env.local.example .env.local
npm install
npm run dev                # http://localhost:3000
```

## Seeding the product catalog

```bash
cd api
npm run seed
```

Re-running the seed script updates existing products (matched by name)
rather than duplicating them — safe to re-run whenever catalog prices
change. See `api/scripts/products.seed.json` for the starter list and
`api/scripts/seedProducts.ts` for the script itself.

## Deploying

See **DEPLOY.md** for the full first-deploy walkthrough (GitHub push,
creating both App Hosting backends, deploying Firestore rules, and running
the seed script against production).

## What's intentionally left out (for now)

- Fleet/vehicle management and live vehicle tracking. Client locations are
  still captured on every client record so a delivery route can be worked
  out — see `api/src/routes/routes.ts`, a nearest-neighbour route-ordering
  endpoint that takes a start point and a set of stops (e.g. your clients'
  locations) and returns a suggested visiting order using the coordinates
  already on file. Swap it for Google Directions/Distance Matrix later if
  you need real road-network routing.
- Supply-side (farmer) interface, payments, SMS/USSD integration, and a
  native mobile app are noted as future work — the `api` service is built
  so a mobile client can call it directly, using the same Firebase Auth
  tokens as the web app.
