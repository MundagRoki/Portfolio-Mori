# scroll rig — headless-Chrome wheel tests for how-i-work-3d.html

The desktop app's browser pane stops requestAnimationFrame whenever it is
hidden, so nothing on this page can move there. This rig drives the page in
headless Chrome over the DevTools protocol (stdlib Python, no installs) and
fires realistic wheel streams at it.

Start the site first (`python3 serve.py` with the absolute path, see CLAUDE.md), then:

```bash
cd ".claude/scroll-rig"
python3 cdp.py "http://localhost:4173/how-i-work-3d.html?debug" 1440 900 sim.js -- \
  "await __sim.suite(['swipe','flick','slowDrag','tiny','twoSwipes','quickTwo','reverse','notch','spin5'], 1)" | python3 report.py
```

- `cdp.py URL W H JSFILE… -- EXPR…` loads the page, injects the files, then
  evaluates each expression (top-level await works) and prints one JSON line
  each. `!shot file.png`, `!sleep ms`, `!cast ms dir js` (records a screencast
  while `js` runs) and `!Domain.method {json}` are raw commands. `CDP_PORT` picks the port,
  `REDUCED=1` emulates reduced motion.
- `sim.js` — `__sim.trackpad(dir, opts)` / `__sim.mouse()` build event
  streams (finger ramp, hold, momentum tail; jitter, wobble, integer deltas);
  `__sim.suite(names, startScene)` runs the named scenarios in `__sim.S` and
  scores each: scenes moved vs expected, speed, per-frame speed change, settle
  time, spin continuity and where the swap happened (needs `?debug`). Set
  `window.__simMomentum = true` to also stamp Chrome's `WheelEvent.momentum`.
- `tests2.js` — keys, held keys, index clicks, a scrollbar grab mid-glide,
  starting between scenes, narrow width.
- `fuzz.js` — `__fuzz.run(seed, n)`: random singles, pairs and reversals.
- `overlap.js` — `__ov()`: at rest on each scene, the object's box against
  the copy, and the card's top against the header.

Synthetic events carry the time they were scheduled for (as a real OS stamp
would), not the time a frame got round to dispatching them; without that the
rig reports double pages that real hardware never sees.

## Turning a turntable video into frames

`video/` holds the pages that cut steps 1–3 (copy the video next to them
and change the `src`): `sheet.html` (`await sheet(cols, rows, tile)`: a
contact sheet plus background whiteness), `analyse.html` (per-frame bounding
box, base centre, ear spread and a 48px thumbnail for finding a clean splice),
and `extract.html` (`measure(list)` then `render(jobs, crop, 600)`: cuts out
the white with edge decontamination, crops and exports WebP with alpha, held
on the `baseC` each job gives). Run them with
`EXTRA_FLAGS=--allow-file-access-from-files python3 cdp.py file://…/extract.html …`,
or from Python with `drive.py` (`Page(path).ev('await …')`, `save(dataURL, file)`).
Step 3 adds `analyse3.html` (pole, crossbar and body per frame), `plan3.py`
(the even retime and the pole per frame) and `extract3.html`, which draws the
pole's missing top above each frame and keys out the turntable plate;
`export23.py 3` (or `2`) writes the served folders. Hold the crop on a fixed
turn axis: find it from the plate, or from a front and back pair (the left
edge at one angle mirrors the right edge half a turn later). A flat object's
silhouette centre swings as it turns, so centring each frame on it adds a
wobble. Check the turn count first: an AI "360" can turn 1.5 times. Step 6 (a bowl on a хадаг) adds `vid6.html` (`analyse()` boxes, `bowl()`
the rim's centre, widest row and width per frame, `flow()` a strip's
sideways shift frame to frame, `peek`/`sheetAt` crops), `plan6.py` (the turn
from the bowl's texture flow, normalised to one turn and retimed even; its
inputs bowl6.json and flow6.json are here), `extract6.html` (held on the bowl,
not a fixed axis, because that video's bowl orbits off-centre; keys out the
fixed turntable plate by its ellipse and a bowl profile; a flood from the
frame edge keeps pale patches shut inside the object; `setPlan(key6.json)`,
`measure`, `render`) and `export6.py`. A symmetric object hides its own turn,
so time it from its surface texture, not its silhouette; check a flood-kept
region is not real background by viewing the cut on a saturated colour.
The step 1→2 pour adds `extractp.html` (white key plus a warm-tint key for
ivory milk, a closing of that mask for the milk's white core, and a flood
that keeps only warm enclosed patches) and `exportp.py` (the still card for
step 1 from the video's first frame, then 97 pour frames with an edge fade
that is short at rest and long while the camera moves). On the page,
`__hw.pour` reads the pour's progress (null outside it) and `__hw.pours`
how many pours are ready; `!cast` a swipe from scene 1 to see it.
From scene 1 in paging mode the wheel scrubs the pour instead of paging, so
run `sim.js` suites from scene 2 on (a swipe from scene 1 pours part of the
way and holds, by design), and test the pour with `scrub.js`:
`await __scrub.throughAndBack()`, `reverseMid()`, `mouse()`, `keyMid()`,
`keyPour()`; `__hw.scrub` reads `{ p, d }` (the wheel's and the drawn progress). `pagejolt.js`
scores smoothness from the page's own frames (`?debug` records `dbg.trace`),
which is the truth when the rig's own sampling hiccups.
