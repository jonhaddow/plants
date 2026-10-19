---
name: classify-plants
description: Name new plants from their photos and set their species, starting watering interval and a care note, in a batch. Use when Jon asks to label, identify, classify or set up plants, or to process the "To set up" list.
---

# Setting up plants from their photos

Plants added in the app wait on the Plants page under **To set up** (`plant.needs_setup`). This fills them in on the live database, then clears the flag. It's data only: no PR.

1. **Fetch**, from the repo: `.claude/skills/classify-plants/fetch.py /tmp/plant-setup` (or add plant ids after the folder to redo particular ones). It prints the list and writes `sheet0.png`, `sheet1.png`… (six numbered photos each) and each `<id>.jpg`.
2. **Look** at every sheet with Read. For a doubtful one, look at its full-size `<id>.jpg`.
3. **Decide** for each plant:
   - **Sure** of what it is: a common name (`name`) and the botanical one (`species`). Where a room has several of the same, tell them apart by something in the photo, like "Snake plant (yellow edges)" or "Pothos (hanging)"; plain numbers as a last resort.
   - **Not sure**: `name` is `[unknown]`, `species` stays NULL, and the note opens with the two or three likeliest suggestions, then care that suits them all. Better unknown than a wrong guess.
   - Keep a name Jon typed himself (anything but the default "<Room> plant N"), and any species or notes already there.
   - No photo: `[unknown]`, with "No photo yet: add one and ask again" as the note.
   - `interval_days`: null to keep the current one when it isn't the default 7 (Jon picked it). Plants already checked keep theirs anyway (apply.py sees to that). Otherwise a starting point for a UK home, leaning to the winter side (it learns from the Watered and Still damp buttons). Roughly: succulents, snake plant, ZZ 14 to 21; pothos, monstera, orchid 10; most foliage 7; calathea, prayer plant, ferns that like moisture 4 to 5; maidenhair 3.
   - `notes`: two to four short sentences: when to water (soil test), light, and one tip or warning sign. Match the existing notes' plain style.
4. **Apply**: write the decisions as JSON, `[{"id": 5, "name": "…", "species": "…" or null, "interval_days": 7, "notes": "…"}]`, then `.claude/skills/classify-plants/apply.py decisions.json > setup.sql`. It escapes quotes, clears `needs_setup` and moves each due date to match the new interval. Note the restore point (`wrangler d1 time-travel info plants`), then `wrangler d1 execute plants --remote --file setup.sql -y` (Wrangler with the token, as in CLAUDE.md).
5. **Check** nothing's left: `SELECT id, name FROM plant WHERE needs_setup`.
6. **Tell Jon**: how many were named, the `[unknown]` ones with their photos (one contact sheet, opened with Read) and suggestions, any you're least sure of, and the restore bookmark.
