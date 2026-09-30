"""Step 6's plan: the turn from the bowl's own texture (flow6.json, the front
wall and the wood band tracked frame to frame, less the bowl's own travel),
normalised to one turn, retimed to an even 144; and each frame's bowl (centre,
rim row, rim width, top) smoothed, to hold the bowl still. Writes plan6.json."""
import json, math
bowl = json.load(open('bowl6.json')); fl = json.load(open('flow6.json')); n = len(bowl)
def smooth(a, k=4):
    return [sum(a[max(0, i - k):i + k + 1]) / len(a[max(0, i - k):i + k + 1]) for i in range(len(a))]
cx = smooth([r['cx'] for r in bowl]); ry = smooth([r['rimY'] for r in bowl]); rw = smooth([r['rimW'] for r in bowl]); tp = smooth([r['top'] for r in bowl])
def clean(rows):
    rel = [0.0] * n
    for r in rows: f = r['f']; rel[f] = (r['abs'] - (cx[f] - cx[f - 1])) / rw[f]
    out = rel[:]
    for i in range(1, n):
        win = sorted(rel[max(1, i - 3):i + 4]); med = win[len(win) // 2]
        if abs(rel[i] - med) > 3.5 / rw[i]: out[i] = med
    return out
w, d = clean(fl['wall']), clean(fl['wood'])
sp = [(a + b) / 2 for a, b in zip(w, d)]
sp = [0.0] + smooth(sp[1:], 2)
ang = [0.0]
for i in range(1, n): ang.append(ang[-1] - sp[i])
tot = ang[-1]; ang = [a * 360 / tot for a in ang]
pick = []
for j in range(144):
    t = j * 2.5; k = min(range(n), key=lambda k: abs(ang[k] - t)); pick.append({'j': j, 'src': k, 'err': round(ang[k] - t, 2)})
frames = {str(i): {'cx': round(cx[i], 2), 'rimY': round(ry[i], 2), 'rimW': round(rw[i], 2), 'top': round(tp[i], 2)} for i in range(n)}
json.dump({'pick': pick, 'ang': [round(a, 3) for a in ang], 'frames': frames}, open('plan6.json', 'w'))
print('raw total (rim widths)', round(tot, 4), 'max err %.2f' % max(abs(p['err']) for p in pick))
print('deg per frame', ' '.join('%.2f' % (ang[i + 1] - ang[i]) for i in range(0, n - 1, 6)))
print('srcs', [p['src'] for p in pick])
dup = sum(1 for a, b in zip(pick, pick[1:]) if a['src'] == b['src']); print('repeated src', dup)
