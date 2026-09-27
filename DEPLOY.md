# First deploy — Mazaofiti

Repo: https://github.com/Nestifyapp/mazaofiti
Firebase project: `mazaofiti`

## 0. One-time Firebase project setup (console)

Before any of the commands below, in the Firebase console for the
`mazaofiti` project:

1. **Authentication → Sign-in method** → enable **Email/Password** and
   **Google**.
2. **Firestore Database** → create a database (production mode, pick a
   region close to your users — e.g. `europe-west1` or `us-central1`).
3. Under **Project settings → General → Your apps**, add a **Web app** and
   copy its config (`apiKey`, `authDomain`, `projectId`) — you'll need these
   for `web/apphosting.yaml` and `web/.env.local`.

## 1. Push the code to GitHub

```bash
cd mazaofiti
git init
git add .
git commit -m "Initial commit: Mazaofiti aggregator app"
git branch -M main
git remote add origin https://github.com/Nestifyapp/mazaofiti.git
git push -u origin main
```

## 2. Log in and select the Firebase project

```bash
npm install -g firebase-tools   # if not already installed
firebase login
firebase use mazaofiti          # matches .firebaserc
```

## 3. Fill in real config before deploying

- `web/apphosting.yaml` — replace `your-mazaofiti-web-api-key` with the real
  Firebase Web API key from step 0.3. Leave the `NEXT_PUBLIC_API_URL`
  placeholder for now; you'll update it after the `api` backend exists
  (step 4 tells you how).
- `api/apphosting.yaml` — the `ALLOWED_ORIGIN` placeholder similarly gets
  updated once the `web` backend's URL is known.

Commit and push these once filled in — App Hosting deploys straight from
the connected GitHub branch.

## 4. Create the two App Hosting backends

Each backend connects to this same GitHub repo, but points at a different
`rootDir` (`./web` or `./api`) — App Hosting will prompt for these when you
run the command:

```bash
# Backend 1 — the Next.js dashboard
firebase apphosting:backends:create --project mazaofiti
#   name: web
#   region: pick the same region as your Firestore database
#   GitHub repo: Nestifyapp/mazaofiti, branch: main, root directory: web

# Backend 2 — the Express API
firebase apphosting:backends:create --project mazaofiti
#   name: api
#   region: same region
#   GitHub repo: Nestifyapp/mazaofiti, branch: main, root directory: api
```

Once both exist, each push to `main` auto-deploys both. To trigger a first
rollout manually instead of waiting for a push:

```bash
firebase apphosting:rollouts:create web --project mazaofiti
firebase apphosting:rollouts:create api --project mazaofiti
```

After both are live, note their URLs (`firebase apphosting:backends:list`)
and cross-wire them:
- Put the `api` backend's URL into `web/apphosting.yaml` →
  `NEXT_PUBLIC_API_URL`.
- Put the `web` backend's URL into `api/apphosting.yaml` → `ALLOWED_ORIGIN`.
Commit and push again to redeploy both with the correct URLs.

## 5. Deploy Firestore rules and indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes --project mazaofiti
```

## 6. Seed the product catalog

Run this once (and again any time catalog prices change) using a service
account with access to the `mazaofiti` project:

```bash
cd api
npm install
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
FIREBASE_PROJECT_ID=mazaofiti \
npm run seed
```

To get a service account key: Firebase console → Project settings →
Service accounts → Generate new private key. Keep this file out of git (the
`.gitignore` already excludes `*serviceAccountKey*.json` /
`*service-account*.json`).

## 7. Verify

Visit the `web` backend's URL, sign in with Google or create an
email/password account, add a client, and post a demand request against one
of the seeded products.
