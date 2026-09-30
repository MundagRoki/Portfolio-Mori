"""Step 1's new pail (the milk pail, beige rope): the turn from the staves'
texture (flow1n.json, two strips, less the body's travel), normalised to one
turn and retimed to an even 144; each frame held on the body (a round tub's
outline is centred on its axis): centre, base and width smoothed.
Writes plan1n.json."""
import json
rows = json.load(open('pail1rows.json')); fl = json.load(open('flow1n.json')); n = len(rows)
def sm(a, k=4): return [sum(a[max(0, i - k):i + k + 1]) / len(a[max(0, i - k):i + k + 1]) for i in range(len(a))]
cx = sm([r['cx'] for r in rows]); bw = sm([r['bw'] for r in rows]); bot = sm([r['bot'] for r in rows], 6)
def rel(name):
    r = [0.0] * n
    for x in fl[name]: r[x['f']] = (x['abs'] - (cx[x['f']] - cx[x['f'] - 1])) / bw[x['f']]
    o = r[:]
    for i in range(1, n):
        w = sorted(r[max(1, i - 3):i + 4]); m = w[len(w) // 2]
        if abs(r[i] - m) > 3.5 / bw[i]: o[i] = m
    return o
L, U = rel('low'), rel('up')
sp = [0.0] + sm([(a + b) / 2 for a, b in zip(L, U)][1:], 2)
ang = [0.0]
for i in range(1, n): ang.append(ang[-1] - sp[i])
ang = [a * 360 / ang[-1] for a in ang]
pick = []
for j in range(144):
    t = j * 2.5; k = min(range(n), key=lambda k: abs(ang[k] - t)); pick.append({'j': j, 'src': k, 'err': round(ang[k] - t, 2)})
ref = {'cx': cx[0], 'bot': bot[0], 'bw': bw[0]}
frames = {str(i): {'cx': round(cx[i], 2), 'bot': round(bot[i], 2), 'k': round(bw[i] / bw[0], 5)} for i in range(n)}
# the held box: every picked frame's extent in the reference frame
top = min(ref['bot'] + (rows[p['src']]['top'] - frames[str(p['src'])]['bot']) / frames[str(p['src'])]['k'] for p in pick)
reach = max(max(ref['cx'] - (ref['cx'] + (rows[p['src']]['l'] - frames[str(p['src'])]['cx']) / frames[str(p['src'])]['k']),
                (ref['cx'] + (rows[p['src']]['r'] - frames[str(p['src'])]['cx']) / frames[str(p['src'])]['k']) - ref['cx']) for p in pick)
low = max(ref['bot'] + (rows[p['src']]['bot'] - frames[str(p['src'])]['bot']) / frames[str(p['src'])]['k'] for p in pick)
json.dump({'pick': pick, 'ang': [round(a, 3) for a in ang], 'frames': frames, 'ref': ref}, open('plan1n.json', 'w'))
print('ref', ref, 'max err %.2f' % max(abs(p['err']) for p in pick), 'held top %.1f reach %.1f low %.1f' % (top, reach, low))
print('repeats', sum(1 for a, b in zip(pick, pick[1:]) if a['src'] == b['src']), 'deg/frame', ' '.join('%.2f' % (ang[i + 1] - ang[i]) for i in range(0, n - 1, 12)))
