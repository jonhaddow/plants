#!/usr/bin/env python3
"""Turns a JSON list of [{id, name, species, interval_days, notes}] into the
UPDATEs that set those plants up (species null for an [unknown]). The interval
and due date only change for a plant nobody has checked yet, and not at all
when interval_days is null, so a chosen or learned interval stays.
Usage: apply.py decisions.json > setup.sql"""
import json, sys

q = lambda s: 'NULL' if s is None else "'" + s.replace("'", "''") + "'"
unchecked = 'NOT EXISTS (SELECT 1 FROM "check" WHERE plant_id = plant.id)'
for p in json.load(open(sys.argv[1])):
    sets = [f"name = {q(p['name'])}", f"species = {q(p['species'])}", f"notes = {q(p['notes'])}", 'needs_setup = false']
    if p.get('interval_days') is not None:
        days = int(p['interval_days'])
        sets += [f'interval_days = CASE WHEN {unchecked} THEN {days} ELSE interval_days END',
                 f"due_on = CASE WHEN {unchecked} AND last_watered_on IS NOT NULL "
                 f"THEN date(last_watered_on, '+{days} days') ELSE due_on END"]
    print(f"UPDATE plant SET {', '.join(sets)} WHERE id = {int(p['id'])};")
