"""Writes step 6's served frames from plan6.json + key6.json via extract6.html:
144 turning frames at 540px tall and the sharp rest frames at the video's own
scale (954px), all held on the bowl (see extract6.html)."""
import json, os, sys, time
sys.path.insert(0, '.')
from drive import Page, save
ROOT = '/Users/mundagroki/Downloads/Work/Portfolio/art/how-i-work'
out = f'{ROOT}/ayaga-khadag'
t0 = time.time()
pick = json.load(open('plan6.json'))['pick']
m = json.load(open('measure6.json'))
cx = json.load(open('key6.json'))['ref']['cx']
reach = max(max(cx - v['X0'] for v in m.values()), max(v['X1'] - cx for v in m.values())) + 10
Y0 = min(v['Y0'] for v in m.values()) - 6; Y1 = max(v['Y1'] for v in m.values()) + 6
crop = {'X0': cx - round(reach), 'Y0': round(Y0), 'w': 2 * round(reach), 'h': round(Y1 - Y0)}
print('crop', crop, flush=True)
pg = Page('extract6.html', port=9377)
pg.ev('setPlan(%s)' % open('key6.json').read())
if len(sys.argv) > 1:                       # a stylize.js: the set's look, applied to every frame
    pg.ev(open(sys.argv[1]).read() + '; 1'); print('stylize', sys.argv[1], pg.ev('typeof window.stylize'), flush=True)
os.makedirs(out + '/hi', exist_ok=True)
jobs = [{'j': x['j'], 'src': x['src']} for x in pick]
for i in range(0, len(jobs), 12):
    part = jobs[i:i + 12]
    for r in pg.ev('await render(%s, %s, 540, .6, .8)' % (json.dumps(part), json.dumps(crop))):
        save(r['url'], '%s/f%03d.webp' % (out, r['j']))
    print('turning', i + len(part), '%.0fs' % (time.time() - t0), flush=True)
HI = [0]
for r in pg.ev('await render(%s, %s, %d, .85, 1.15)' % (json.dumps([jobs[j] for j in HI]), json.dumps(crop), crop['h'])):
    save(r['url'], '%s/hi/f%03d.webp' % (out, r['j']))
w = round(540 * crop['w'] / crop['h']); hw = crop['w']
json.dump({'crop': crop, 'w': w, 'h': 540, 'hw': hw, 'hh': crop['h']}, open('meta6.json', 'w'))
print('done', {'w': w, 'hw': hw, 'hh': crop['h']}, '%.0fs' % (time.time() - t0), flush=True)
pg.close()
