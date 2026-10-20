# Plants

Which house plants need water today. One photo and a room per plant; each plant's watering interval learns from two buttons, Watered and Still damp. A push notification each morning lists what's due.

Stack: SvelteKit 3 (Svelte 5) on Cloudflare Workers, Drizzle ORM on Cloudflare D1 (SQLite, EU; photos too), Vitest and Playwright. Set up like the budget app.

## Installing on a phone

Open https://plants.app.haddow.me in Safari (iPhone) or Chrome (Android), sign in, then Share → Add to Home Screen. Open it from the home screen and turn on Settings → Notifications for the morning reminder.

## Running locally

```sh
npm install
npm run db:migrate:local
npx wrangler d1 execute plants --local --command "INSERT INTO user (email, name) VALUES ('you@example.com', 'You')"
cp .dev.vars.example .dev.vars
npm run dev    # the login page has dev-only "Sign in as" buttons
```

## Sign-in

Google OAuth, sharing budget's client, through the shared redirect `https://auth.app.haddow.me/callback` (`~/code/auth`), so the app's own address isn't registered with Google. Only emails in the `user` table can sign in: `wrangler d1 execute plants --remote --command "INSERT INTO user (email, name) VALUES ('you@example.com', 'You')"`.

## Your data

Everything, photos included, is in the D1 database `plants`: `npx wrangler d1 export plants --remote --output plants.sql`.

## Configuration

Vars in `wrangler.jsonc` (`APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `VAPID_PUBLIC_KEY`). Secrets (`wrangler secret put`): `GOOGLE_CLIENT_SECRET`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` (any long random string; authenticates the morning cron). Locally they go in `.dev.vars`; push stays off unless you fill in a VAPID key pair.

## Deploying

As budget: pushing to `main` deploys through Cloudflare Workers Builds, whose deploy command `npm run deploy:ci` applies migrations first.
