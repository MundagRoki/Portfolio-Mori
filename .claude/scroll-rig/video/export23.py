import json, os, sys, time
sys.path.insert(0, '.')
from drive import Page, save
ROOT = '/Users/mundagroki/Downloads/Work/Portfolio Website/art/how-i-work'
which = sys.argv[1]
t0 = time.time()
if which == '3':
    plan = json.load(open('plan3.json')); P = plan['pole']; pick = plan['pick']; C = 722; E = 328
    pg = Page('extract3.html', port=9351)
    pg.ev('window.P = ' + json.dumps({str(i): P[i] for i in range(len(P))}))
    srcs = sorted({x['src'] for x in pick})
    m = pg.ev('await measure(%s, P)' % json.dumps(srcs))
    top = min(v['top'] for v in m.values()); bot = max(v['bot'] for v in m.values())
    ext = max(max(C - v['l'], v['r'] - C) for v in m.values())
    crop = {'top': max(0, top - 4), 'h': 1434 + E - max(0, top - 4), 'w': int((2 * ext + 24) // 2 * 2)}
    print('measured', {'top': top, 'bot': bot, 'bottomEdge': 1434 + E, 'ext': ext}, 'crop', crop, flush=True)
    assert bot < 1434 + E - 4
    out = f'{ROOT}/khokhuur-buluur'; extra = ', P'
    HI = list(range(134, 144)) + [0, 1, 2]
else:
    plan = json.load(open('plan2.json')); pick = plan['pick']; C = 710
    pg = Page('extract2.html', port=9352)
    srcs = sorted({x['src'] for x in pick})
    m = pg.ev('await measure(%s)' % json.dumps(srcs))
    ext = max(max(C - v['l'], v['r'] - C) for v in m.values())
    crop = {'top': 50, 'h': 1384, 'w': int((2 * ext + 24) // 2 * 2)}
    print('measured ext', ext, 'crop', crop, 'bot', max(v['bot'] for v in m.values()), flush=True)
    out = f'{ROOT}/khokhuur'; extra = ''
    HI = [142, 143] + list(range(0, 11))
os.makedirs(out + '/hi', exist_ok=True)
jobs = [{'j': x['j'], 'src': x['src'], 'baseC': C} for x in pick]
for i in range(0, len(jobs), 12):
    part = jobs[i:i + 12]
    for r in pg.ev('await render(%s, %s, 600, .6, .8%s)' % (json.dumps(part), json.dumps(crop), extra)):
        save(r['url'], '%s/f%03d.webp' % (out, r['j']))
    print('turning', i + len(part), '%.0fs' % (time.time() - t0), flush=True)
hj = [jobs[j] for j in HI]
for r in pg.ev('await render(%s, %s, 1200, .85, 1.15%s)' % (json.dumps(hj), json.dumps(crop), extra)):
    save(r['url'], '%s/hi/f%03d.webp' % (out, r['j']))
w600 = round(600 * crop['w'] / crop['h']); w1200 = round(1200 * crop['w'] / crop['h'])
json.dump({'crop': crop, 'centre': C, 'w': w600, 'hw': w1200}, open(f'meta{which}.json', 'w'))
print('done', {'crop': crop, 'w': w600, 'hw': w1200}, '%.0fs' % (time.time() - t0), flush=True)
pg.close()
