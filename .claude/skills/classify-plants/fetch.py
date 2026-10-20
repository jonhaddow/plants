#!/usr/bin/env python3
"""Downloads the photos of plants waiting to be set up (or the plant ids given)
into a folder, with numbered contact sheets of six to look at.
Usage: fetch.py [out dir] [id ...]   (run from the repo; needs op-claude and Pillow)"""
import base64, json, os, subprocess, sys
from PIL import Image, ImageDraw

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/plant-setup'
ids = [int(i) for i in sys.argv[2:]]
os.makedirs(out, exist_ok=True)

def d1(sql):
    env = dict(os.environ, CLOUDFLARE_API_TOKEN='op://Claude/Cloudflare/credential')
    res = subprocess.run(['op-claude', 'run', '--', 'npx', 'wrangler', 'd1', 'execute', 'plants', '--remote',
                          '--json', '--command', sql], env=env, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)[0]['results']

where = f"p.id IN ({','.join(map(str, ids))})" if ids else 'p.needs_setup'
plants = d1(f"""SELECT p.id, r.name AS room, p.name, p.species, p.notes, p.photo_key, p.interval_days,
                       (SELECT count(*) FROM "check" c WHERE c.plant_id = p.id) AS checks
                FROM plant p JOIN room r ON r.id = p.room_id WHERE {where} ORDER BY p.id""")
for p in plants:
    print(p['id'], p['room'], '|', p['name'], '|', p['species'], '|', p['notes'], '|', f"{p['interval_days']}d, {p['checks']} checks", '|', 'photo' if p['photo_key'] else 'NO PHOTO')

# Species already in use, to reuse: the same species in a room stacks on Today.
used = d1('SELECT species, count(*) AS n FROM plant WHERE species IS NOT NULL GROUP BY species ORDER BY species')
print('\nSpecies in use:', ', '.join(f"{s['species']} ({s['n']})" for s in used))

# A few at a time: each photo is about 270 KB of base64.
with_photo = [p['id'] for p in plants if p['photo_key']]
for i in range(0, len(with_photo), 10):
    chunk = ','.join(map(str, with_photo[i:i + 10]))
    for row in d1(f'SELECT p.id, ph.data FROM plant p JOIN photo ph ON ph.key = p.photo_key WHERE p.id IN ({chunk})'):
        open(f"{out}/{row['id']}.jpg", 'wb').write(base64.b64decode(row['data']))

for s in range(0, len(with_photo), 6):
    sheet = Image.new('RGB', (1200, 840), 'white')
    draw = ImageDraw.Draw(sheet)
    for i, n in enumerate(with_photo[s:s + 6]):
        im = Image.open(f'{out}/{n}.jpg')
        im.thumbnail((400, 400))
        x, y = (i % 3) * 400, (i // 3) * 420
        sheet.paste(im, (x, y + 20))
        draw.text((x + 5, y + 3), f'#{n}', fill='black')
    sheet.save(f'{out}/sheet{s // 6}.png')
print(f'{len(plants)} plants, sheets in {out}')
