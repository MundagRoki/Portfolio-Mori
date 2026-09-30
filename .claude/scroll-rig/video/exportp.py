"""Writes the step 1 -> 2 pour (97 frames, every other video frame, 648x720)
and the new pail's still card for step 1 (its first frame) via extractp.html."""
import json, os, sys, time
sys.path.insert(0, '.')
from drive import Page, save
ROOT = '/Users/mundagroki/Downloads/Work/Portfolio/art/how-i-work'
t0 = time.time()
pg = Page('extractp.html', port=9402)
card = {'x0': 220, 'y0': 168, 'w': 1000, 'h': 1185}          # the pail in frame 0, bottom on its base
os.makedirs(f'{ROOT}/pail-milk/hi', exist_ok=True)
crop = {'x0': 80, 'y0': 0, 'w': 1296, 'h': 1440}; fade = {'tb': 50, 'lr': 30}
os.makedirs(f'{ROOT}/pour', exist_ok=True)
def band(f):
    # the edge fade, by video frame: short where the pail and the хөхүүр stand at rest (both
    # within 73-184px of an edge), long while the camera moves and they cross the frame's edges
    ramp = lambda a, b, x: min(1, max(0, (x - a) / (b - a)))
    k = ramp(24, 40, f) * (1 - ramp(150, 168, f))
    return {'tb': round(40 + 200 * k), 'lr': round(30 + 60 * k), 'floor': 6 <= f <= 35}   # the pail's floor shadow, before the хөхүүр comes in
jobs = [{'j': j, 'src': j, 'fade': band(j)} for j in range(193)]   # every frame: the pour is scrubbed by the wheel
for i in range(0, len(jobs), 8):
    for r in pg.ev('await render(%s, %s, 720, .6, .8, %s, "image/webp", .8)' % (json.dumps(jobs[i:i + 8]), json.dumps(crop), json.dumps(fade))):
        save(r['url'], '%s/pour/f%03d.webp' % (ROOT, r['j']))
    print('pour', i + 8, '%.0fs' % (time.time() - t0), flush=True)
json.dump({'card': card, 'pour': crop, 'fade': fade}, open('metap.json', 'w'))
pg.close()
print('done %.0fs' % (time.time() - t0))
