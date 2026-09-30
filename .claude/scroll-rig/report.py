import json, sys
fails = 0
for line in sys.stdin:
    v = json.loads(line)
    if isinstance(v, dict) and '__error' in v: print('ERROR', v['__error']); fails += 1; continue
    if not isinstance(v, list): print(json.dumps(v)); continue
    for r in v:
        ok = r['ok']
        if 'maxDTheta' in r and r['maxDTheta'] > 1.5: ok = False
        if 'swapAtPi' in r and any(abs(x - 1) > .12 for x in r['swapAtPi']): ok = False
        fails += not ok
        print(('PASS ' if ok else 'FAIL ') + json.dumps(r))
print('failures:', fails)
