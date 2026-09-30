"""Writes the step 3 -> 4 pull (193 frames) and step 4's still card (the last frame)
via extractpull.html and planpull.json."""
import json, os, sys, time
sys.path.insert(0, '.')
from drive import Page, save
ROOT = '/Users/mundagroki/Downloads/Work/Portfolio/art/how-i-work'
t0 = time.time()
pg = Page('extractpull.html', port=9500)
pg.ev('window.PLAN = %s; 1' % open('planpull.json').read())
crop = {'x0': 60, 'y0': -860, 'w': 1340, 'h': 2300}; fade = {'b': 30, 'lr': 30}   # the box: the drawn pole's height above the frame, to the head below the sack
os.makedirs(f'{ROOT}/pull', exist_ok=True)
jobs = [{'j': j, 'src': j} for j in range(193)]
for i in range(0, 193, 8):
    for r in pg.ev('await render(%s, %s, 966, .6, .8, %s)' % (json.dumps(jobs[i:i + 8]), json.dumps(crop), json.dumps(fade))):
        save(r['url'], '%s/pull/f%03d.webp' % (ROOT, r['j']))
    print('pull', min(193, i + 8), '%.0fs' % (time.time() - t0), flush=True)
card = {'x0': 70, 'y0': 60, 'w': 1330, 'h': 1360}   # step 4 at rest: the sack, the pole across it, its head on the ground
os.makedirs(f'{ROOT}/khokhuur-rest/hi', exist_ok=True)
for r in pg.ev('await render(%s, %s, 1360, .85, 1.15)' % (json.dumps([{'j': 0, 'src': 192}]), json.dumps(card))): save(r['url'], f'{ROOT}/khokhuur-rest/hi/f000.webp')
for r in pg.ev('await render(%s, %s, 600, .6, .8)' % (json.dumps([{'j': 0, 'src': 192}]), json.dumps(card))): save(r['url'], f'{ROOT}/khokhuur-rest/f000.webp')
json.dump({'pull': crop, 'card': card, 'pullSize': [round(966 * 1340 / 2300), 966], 'cardSize': [round(600 * 1330 / 1360), 600]}, open('metapull.json', 'w'))
print('done %.0fs' % (time.time() - t0)); pg.close()
