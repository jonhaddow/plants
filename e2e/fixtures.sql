-- Made-up data for the end-to-end tests. Days are relative to today (UTC,
-- close enough to UK time outside midnight).
INSERT INTO user (email, name) VALUES ('alex@example.com', 'Alex'), ('sam@example.com', 'Sam');
INSERT INTO room (name, sort_order) VALUES ('Living room', 0), ('Kitchen', 1), ('Bedroom', 2);
INSERT INTO plant (room_id, name, interval_days, due_on, last_watered_on, created_at, needs_setup) VALUES
	(1, 'Fern', 7, date('now', '-2 days'), date('now', '-9 days'), '2026-10-01T00:00:00.000Z', false),
	(1, 'Monstera', 7, date('now'), date('now', '-7 days'), '2026-10-01T00:00:00.000Z', false),
	(1, 'Spider plant (big)', 7, date('now'), date('now', '-7 days'), '2026-10-01T00:00:00.000Z', false),
	(1, 'Spider plant (small)', 7, date('now', '-1 days'), date('now', '-8 days'), '2026-10-01T00:00:00.000Z', false),
	(2, 'Basil', 3, date('now'), date('now', '-3 days'), '2026-10-01T00:00:00.000Z', false),
	(3, 'Cactus', 30, date('now', '+3 days'), date('now', '-27 days'), '2026-10-01T00:00:00.000Z', false),
	-- Edited and deleted by plants.spec.ts; not due, so Today's tests don't see it.
	(3, 'Aloe', 14, date('now', '+10 days'), date('now', '-4 days'), '2026-10-01T00:00:00.000Z', false);
-- Two of a kind, stacked on Today.
UPDATE plant SET species = 'Chlorophytum comosum' WHERE name LIKE 'Spider plant%';
UPDATE plant SET species = 'Monstera deliciosa' WHERE name = 'Monstera';
