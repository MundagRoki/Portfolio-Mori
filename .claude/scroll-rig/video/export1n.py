"""Writes step 1's turntable (the milk pail) from plan1n.json via extract1n.html:
144 turning frames at 600px tall and the sharp rest frame f000 at the video's scale."""
import json, os, sys, time
sys.path.insert(0, '.')
from drive import Page, save
ROOT = '/Users/mundagroki/Downloads/Work/Portfolio/art/how-i-work/pail-milk'
t0 = time.time(); P = json.load(open('plan1n.json')); ref = P['ref']
crop = {'cx': ref['cx'], 'bot': ref['bot'], 'x0': ref['cx'] - 505, 'y0': 87, 'w': 1010, 'h': 1268}   # held box, the rope's top to the base
pg = Page('extract1n.html', port=9443)
jobs = [dict(j=p['j'], src=p['src'], **P['frames'][str(p['src'])]) for p in P['pick']]
os.makedirs(ROOT + '/hi', exist_ok=True)
for i in range(0, 144, 12):
    for r in pg.ev('await renderHeld(%s, %s, 600, .6, .8)' % (json.dumps(jobs[i:i + 12]), json.dumps(crop))): save(r['url'], '%s/f%03d.webp' % (ROOT, r['j']))
    print('turning', i + 12, '%.0fs' % (time.time() - t0), flush=True)
for r in pg.ev('await renderHeld(%s, %s, %d, .85, 1.15)' % (json.dumps(jobs[:1]), json.dumps(crop), crop['h'])): save(r['url'], ROOT + '/hi/f000.webp')
json.dump({'crop': crop, 'w': round(600 * crop['w'] / crop['h']), 'hw': crop['w'], 'hh': crop['h']}, open('meta1n.json', 'w'))
print('done', json.load(open('meta1n.json')), '%.0fs' % (time.time() - t0)); pg.close()
