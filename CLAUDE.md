# Plants

Which house plants need water today, for a two-person household. A PWA at https://plants.app.haddow.me. Each plant has a photo, a room and a watering interval that learns from the two buttons, Watered and Still damp. A push each morning lists what's due. SvelteKit 3 (Svelte 5) on Cloudflare Workers, D1 via Drizzle (photos too). The same stack and setup as `~/code/budget` and `~/code/energy` (copy code patterns from there, not their look: plants has its own, see `app.css`).

## Where things are

- `src/lib/watering.ts`: how a plant's interval learns (Watered, Still damp); pure, unit tested
- `src/lib/server/plants.ts`: rooms, plants, due and upcoming lists, recording checks and undo, history
- `src/lib/server/check-actions.ts`: the water / damp / undo form actions shared by Today and a plant's page
- `src/lib/server/plant-form.ts`: reading the add and edit forms (room picked or new, default names)
- `src/lib/server/photos.ts`, `src/routes/photos/[key]`: photos as base64 in D1's `photo` table, served to signed-in people only. `src/lib/photo.ts` shrinks them on the phone before upload.
- `src/lib/server/reminders.ts`, `src/routes/remind`: the morning push, called by the cron (`worker/entry.js`) with `CRON_SECRET`
- `src/lib/server/push.ts`, `src/service-worker/`: web push and the app icon badge (from budget)
- `src/lib/dates.ts`: UK days
- `src/lib/stacks.ts`: stacking the same species in a room (Today, the push)
- `PlantTile.svelte`: a plant on Today's grid; `/plants/new` is the camera page
- Routes: `/` Today, `/plants` (+ `/plants/new`, `/plants/[id]`, `/plants/[id]/edit`), `/settings`, `/notifications`
- `.claude/skills/classify-plants`: naming new plants (the To set up list) from their photos, with species, interval and care note
- Schema: `src/lib/server/db/schema.ts`. Product choices: `docs/decisions.md`; what's next: `docs/roadmap.md`.

## Commands

Same as budget: `npm test`, `npm run test:e2e`, `npm run check`, `npm run lint`, `scripts/shot.sh <path>`, `scripts/worktree.sh <branch>`. Wrangler: `CLOUDFLARE_API_TOKEN='op://Claude/Cloudflare/credential' op-claude run -- npx wrangler ...`

## Workflow

- Work in a worktree (`scripts/worktree.sh <branch>`), never in `~/code/plants` itself.
- `main` is what's live, so never push to it directly. Every change goes through a PR:
  1. Branch, commit, push, `gh pr create` (gh needs the PAT: `GH_TOKEN='op://Claude/GitHub Personal Access Token/token' op-claude run -- gh ...`).
  2. Straight away, run the `bug-hunter` and `simplifier` agents in parallel on the branch (repo path, base `main`). Apply real findings; skip any you disagree with and say why. Docs-only PRs skip this step.
  3. Push the fixes, then `scripts/pr-wait.sh` (with the PAT) for the Checks run (lint, types, unit, e2e).
  4. When green, send Jon the PR link, one line per finding (applied or skipped) and a screenshot if the UI changed (open it with Read).
  5. When Jon approves, merge (`gh pr merge --squash`); Cloudflare Workers Builds deploys `main` by itself, so then just `scripts/wait-deploy.sh`.
- Schema change: edit `schema.ts`, `npm run db:generate`, `npm run db:migrate:local`. The deploy applies migrations before the new code. Before merging, note a restore point (`wrangler d1 time-travel info plants`).
- Keep docs current; record product or architecture choices (including ideas turned down) in `docs/decisions.md`, and planned features in `docs/roadmap.md`.

## Review focus

A small household app: simple beats defensive. Cutting code is a good outcome, and bugs only matter if someone's likely to hit them. Watch for: UK days (BST), the interval maths in `watering.ts`, Workers CPU and D1 limits, photos left behind when a plant changes or goes, sign-in checks on new routes.

## Gotchas

budget's CLAUDE.md gotchas apply here too (SvelteKit 3 imports, Workers CPU limit, unbound `fetch`, D1 limits, `db.batch` tuples, strict CSP). Also:

- `scripts/shot.sh` and the e2e tests use `.wrangler/e2e`, a fresh database with the fixtures in `e2e/fixtures.sql`, on port 5182 (budget has 5180, energy 5181).
- Client code can't import from `#lib/server`, even types: shared types live in `src/lib` (e.g. `Check`, `Done` in `watering.ts`).
