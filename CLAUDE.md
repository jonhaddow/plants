# Plants

Which house plants need water today, for a two-person household. A PWA at https://plants.app.haddow.me. Each plant has a photo, a room and a watering interval that learns from the two buttons, Watered and Still damp. A push each morning lists what's due.

Stack, workflow, commands and shared gotchas: the `app-stack` skill.

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

## Review focus

UK days (BST), the interval maths in `watering.ts`, photos left behind when a plant changes or goes.
