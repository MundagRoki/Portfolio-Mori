"""Step 3's plan from analyse3.json (the output of analyse3.html's analyse()):
an even 144-frame turn retimed by the crossbar's length (long at front and
back, short at the sides), and the pole's centre, slope and width per frame
for extract3.html. Writes plan3.json."""
import json, math
rows = json.loads(open('analyse3.json').read().strip().splitlines()[-1])['rows']; n = len(rows)
bar = [x['bar'] for x in rows]
side1 = min(range(45, 80), key=lambda i: bar[i]); back = max(range(90, 125), key=lambda i: bar[i]); side2 = min(range(135, 170), key=lambda i: bar[i])
bmin = (bar[side1] + bar[side2]) / 2
pts = [(0, 0.0), (side1, 90.0), (back, 180.0), (side2, 270.0), (n - 1, 360.0)]
for i in range(n):
    if i in (0, side1, back, side2, n - 1): continue
    if i < side1:   B, base, sg = bar[0], 0, 1
    elif i < back:  B, base, sg = bar[back], 180, -1
    elif i < side2: B, base, sg = bar[back], 180, 1
    else:           B, base, sg = bar[n - 1], 360, -1
    c = (bar[i] - bmin) / (B - bmin)                 # the bar's length is cos(angle) between side and front
    if .12 < c < .96: pts.append((i, base + sg * math.degrees(math.acos(max(-1, min(1, c))))))
pts.sort(); mono = []
for p in pts:
    if not mono or p[1] > mono[-1][1] + .05: mono.append(p)
def interp(i):
    for (i0, a0), (i1, a1) in zip(mono, mono[1:]):
        if i0 <= i <= i1: return a0 + (a1 - a0) * (i - i0) / (i1 - i0) if i1 > i0 else a0
    return mono[-1][1]
ang = [interp(i) for i in range(n)]
pick = []
for j in range(144):
    t = j * 2.5; k = min(range(n - 1), key=lambda k: abs(ang[k] - t)); pick.append({'j': j, 'src': k, 'err': round(ang[k] - t, 2)})
pole = []
for x in rows:
    (a0, b0), (a1, b1) = x['pole0'], x['pole60']
    pole.append({'c0': (a0 + b0) / 2, 's': ((a1 + b1) / 2 - (a0 + b0) / 2) / 58, 'w': b0 - a0 + 1})
json.dump({'pick': pick, 'pole': pole}, open('plan3.json', 'w'))
print('landmarks', side1, back, side2, 'max err %.2f' % max(abs(p['err']) for p in pick))
