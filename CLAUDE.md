# Portfolio site

Static site. No build step, no package dependencies, no framework — plain HTML,
two stylesheets, four scripts, inline scripts on two pages, and GSAP from
cdnjs plus Lenis from jsdelivr on the landing page only. Edit a file and reload.

## Running it

```bash
python3 /Users/mundagroki/Downloads/Work/Portfolio/serve.py
```

Serves on `http://localhost:4173` (a port argument or `PORT` overrides it).
`serve.py` serves its own folder (`ROOT` from `__file__`, since 2026-09-30:
a hardcoded path broke when the folder was renamed from "Portfolio Website").
In the sandbox run it by its absolute path: `os.getcwd()` is blocked there, so
a relative `python3 serve.py` can't resolve itself.

`.claude/launch.json` only *attaches* to that URL; it does not start the
server. A managed server does not work here — the preview sandbox cannot read
files under `~/Downloads` (macOS TCC), so the server has to be started by hand.
If every path suddenly 404s, the server has gone stale: kill it and restart.

## Pages

| File | Page |
|---|---|
| `index.html` | landing, one page (2026-09-28/29, owner's asking): the chest-opening hero, then About and My Work under it, on one ground. The categories menu that came up on the black is gone; About rises out of the blackout (`.one`, `margin-top:-48vh`: the blackout is done at 86 of the timeline's 100, and a spacer tween keeps the timeline 100 long so the frame windows keep their place). About began as a copy of `about.html` (without its closing "Open to work" block, taken off on 2026-09-29), scoped to its section; about.html is gone now (2026-09-30), so this is the only one. My Work sits on About's ground: its хана and grain laid on `.one` as backgrounds that scroll with the page (`.one::before`/`::after`; the хана's 14° lean baked into a seamless 346px tile). They are never pinned to the screen here: pinned, as on about.html, across this length they made the owner feel sick (2026-09-29). The grain lies under the words at .1 (about.html lays it over them at .13, which specked every letter and made the text hard to read): My Work opens on a transition after trionn.com's (`.tz`, owner's asking 2026-09-29, "copy this transition, change the colours"), measured off theirs in headless Chrome: one screen pinned and five full-width stripes that each grow up from their own foot, the lowest first (theirs: each starts .214 of a screen after the one under it and fills in .858, so the screen is covered at 1.72 and holds; theirs also has a huge marquee drifting left, which ours no longer has). Ours are faster, `STEP` .17 and `LEN` .75, so they close in 1.4 screens of scroll (they were .12 and .52, one screen, after "still so much space"; slowed on 2026-09-29 when the owner found the transition "comes in too fast"), and the pin lets go the moment they close (`RUN` = 4×STEP + LEN), since a held covered screen read as empty clouds (owner: "reduce the space"). Our stripes carry the timeline's own ground (black, the gold clouds anchored at the screen's foot, the grain), so the covered screen is already the timeline and it scrolls on without a seam. Behind the words, the pinned screen carries the page's own хана and grain (`.tz-bg`, owner's asking 2026-09-29: "keep түмэн өлзий хээ on that section"), their tiles set where the page's lie when it arrives (`--tz-hx`, `--tz-y`; no seam at full resolution); pinned, it holds still with the screen and the stripes rise over it. **Before the stripes, the owner's sentence in Mongol bichig is written in on the scroll** (`.wr`, the owner's pick on 2026-09-29 of three ideas): "ухаан бодол нь ундарга шиг ундарж, уран бүтээл нь уул шиг сүндэрлэг" (given by the owner; don't respell it; the visually hidden `<p class="sr" lang="mn-Mong">` carries it for screen readers). The whole of it is set large in four lines, each clause two (`.wr-l`, the second clause .28em further down), left-aligned in a block centred on the screen, `clamp(30px,min(7vw,10.5vh),128px)` (94.5px at 1440×900; it was 112 until the owner asked for it "a little bit smaller"). A brush writes it in left to right, line after line, as the page scrolls: its edge is soft (`FEATHER` .35em), the ink just behind it is fresh, paler and still wet (`WET` 1.3em, fading from rgb(241,227,191) into the matte gold), and between lines it lifts for `LIFT` .9em of its travel. Scroll back and it unwrites. The words it hasn't reached wait as a faint trace (the text itself at rgba(239,231,218,.08), as on a practice sheet). The ink is a canvas laid exactly over the text (`.wr-ink`): each line is drawn once, whole, into its own bitmap at the font's own baseline (so its letters keep their joined forms), and each frame only reveals them (one line through a scratch canvas: `source-atop` for the wet ink, `destination-in` for the edge), so nothing in the page repaints. **When the writing is done, the four lines roll up into rings and turn** (owner's asking, 2026-09-29: "spin them like previous animation but without any additional elements"): the drum after Nika D.'s "Moving text animation" (dribbble.com/shots/13916052), words only (no ✣, glow or frame), the front in gold and the back seen through mirrored at .3. Each ring is its written line repeated round one shared circumference with plain gaps (`drum()` picks the circumference, a radius between 3.1 and 5.2 of the text's ems and no more than .4 of the screen's width, that gives every line a gap nearest 1.1em; so the drum shrinks with the words), drawn into a texture and dealt across flat panels 34px wide (`PANEL`, a whole number so the joins fall on whole pixels) with two faces each; 316 panels at 1440. Each line coils into its ring as soon as the brush has written it and is half way through its lift to the next, so the drum builds from the top while the lines under it are still being written (owner's asking, 2026-09-29: "when I turn here, the upper line spins into the drum, and lines 2, 3, 4 the same"; "snap into the drum fast"; then "it bends on both sides: I want the first side to bend first and circle, then the letters after follow it, like the snake game"). It plays on its own, in time, not on the scroll, over `UP` 3s (2.2 at first; owner: "spin them a bit slowly"); scrolled back before that point (with a hundredth of the writing's hysteresis, so it doesn't flicker there), it runs back out onto its written line in `DOWN` 1.8s. **The coil is the snake game** (`rollRing()`): the line's first letter is the head; it curls back into a circle that starts small (`RHO0` .3 of the drum's radius) at that letter, and the rest of the line follows exactly along its path, the flat body sliding left after the head and turning into the coil where the head turned, never bending on its own. As it goes the circle grows to the drum's size and glides from the line's head to the middle, on a quick-off-the-mark ease with a long soft landing (1 − (1 − f)³(1 + 3f)). L, how much of the snake has gone into the coil, is the coil's own part (C·ρ·e) plus the turn in time (S, eased in over the first .7), so the moment it closes it is already turning and just goes on round and round like the drum it came from. The snake is the whole ring's length, the line and then its copies with plain gaps; the copies are its tail, unseen while flat (shown, they read as a second line sliding in to the right of the first before it bent) and fading in over .8em as they go round into the coil, all of it up by the end. Closed, S wraps every copy (`off`, which copy the head is on), so rolled back the snake runs back out and lands on the written line. Tried the same day and taken off: a line bending into the drum all at once about its middle, on the scroll and then snapped ("it bends on both sides"); all four waiting for the whole sentence then rolling one by one; a belt round a shrinking racetrack (the text piled up). Each line's ink hands over to the panels over the first `HAND` .05 of its coil while the snake holds still (it used to move during the crossfade, and the line looked doubled for a moment: owner, "they transition into something before bending"); the canvas lies over the rings, so a line still flat shows the canvas and never the panels' joins; its ghost trace fades out, and the ring tilts to −7° about its own front line. It turns at 66/87/75/96s a turn (1.5× the first drum's 44/58/50/64, at the owner's asking), front moving left, easing up to pace over 1.2s, and stops only off screen or once the stripes have covered it. While coiling, a ring's panels are laid again every frame (about 80 a ring); closed, only the ring turns. A waiting ring's panels lie flat on its written line at opacity .01 under the canvas, and the drum is put up so as the writing starts, so the pictures are on the GPU before they take over (put up on first sight, they cost a frame). **The drum can be taken in the hand, as the About cards can** (owner's asking, 2026-09-29: "move them like how I move my cards"; a fine pointer only, once a ring has closed; `cursor: grab`). A mouse over it leans it toward the pointer, eased a tenth a frame as the cards' tilt is: the side under the pointer goes back (`rotateX` up to `LEAN_X` 5°, about the drum's own axis, `transform-origin` z −R) and the eye swings round with it (`perspective-origin` up to `LEAN_O` .12 of the block's width). Grabbed, the closed rings turn 1:1 with the hand, each on its own spring after it (`KS` .16/.12/.095/.075, top tightest, damping .8, after the cards' k .06 and .82), so they twist a little and settle, and their own turn holds while held; let go, the hand's speed carries on and runs down (`GLIDE` .94 a frame; a hand still for 90ms throws nothing), then each ring eases back up to its own pace. Measured: a 290px drag turns it .78 rad, the throw carries it about .7 rad more and settles within a second, 60fps throughout. **The hearth** (owner's asking, 2026-09-30: "add some button inside of it and when I click it'll lighten up like гал голомт"): a round button with a drawn flame (`.wr-hearth`, 52px, `aria-pressed`, "Light the fire" / "Put the fire out") at the drum's heart, across on its axis and down between the second and third lines (`placeHearth()`, `--fx/--fy`), outside `.wr` so it is reachable (`.wr` is `aria-hidden`) and can't start a drag; it shows once all four rings have closed (`.tz.is-closed`) and the fire goes out if they unroll. Pressed, a fire kindles from the centre in 1.5s (`.tz.is-lit`): one light layer over the pinned screen in colour-dodge (`.wr-fire`, over the screen and not in `.wr`, whose isolated group turned a dodge over nothing into an orange blob), so the black stays black and only gold takes the fire (the letters amber to hot yellow, the хана near it embers); the inner walls seen through come up from .3 to .62; a small screen-blended haze (`.wr-glow`) is the fire's own light; it flickers by opacity and transform only (`wr-flick` 2.9s, `wr-lick` 2.3s). Pressed again it dies down over 2.2s. Measured in headless Chrome at 1440×900: 60fps, no frame over 20ms, lit and turning. `index.html?debug` exposes `window.__drum.pose(ring, f, S)` to hold a ring at a moment of its coil, and `release()`. Timing, in screens of scroll: the writing starts .35 before the pin (`LEAD`), as the screen comes up, and takes 1.2 (`PLAY`); the full drum turns for .75 (`SPIN`, .45 until the owner found the stripes came in too fast) before the stripes start (`HOLD` = PLAY − LEAD + SPIN), so the section is about 4 screens tall. Apart from the turn, nothing moves on its own. Each line is lifted .295em in its 1.18 row, because the face keeps .6em of empty ascent over this sentence's ink (measured at 100px: ink .84em over the baseline, .26em under). Without the script or the font, on a narrow screen or with reduced motion it is the finished sentence in gold, still, and nothing pins. Measured at 1440×900: a steady 60fps through the whole section at 400 and 1200px/s of scroll, and while the rings snap and turn. Tried before it on 2026-09-29 and taken off, don't bring back unasked: the same sentence as the two pictures in it (a spring line welling up through a rippling water line, then a mountain of its six words stacked 1-2-3 rising through a ground line; the owner: "nvm lets try step2"); a marquee of the sentence on a flat gold ribbon (#b08a45, white bichig; it replaced "Research ✣ Design ✣ Test" and a vertical-column setting); the sentence on a turning drum of its own (four rings of the clauses A, B, A, B with ✣ between copies, turned by CSS; the rings above are its heir, rolled up from the written lines); that drum shaped as a гал голомт, first as CSS-built 3D iron ("it looks so bad"), then a gold line drawing, then wrapped round the owner's AI render of an iron fire basket ("i dont like it"; the render and its cut-out are in `art/site/_source/golomt*`; the drum's code is in git history only if committed, else gone). The screen sits just under the bar (`.tz-pin` padding-top `clamp(64px,8vh,80px)`; About's `.ab-wrap` bottom padding 40px). The gold clouds are decoded a screen and a half early, since decoding them on first sight cost one 316ms frame. Made smoother the same day (owner: "make it more smooth"): each stripe is a window with a door that slides up while the ground inside slides down by the same amount (`.tz-s` > `.tz-d` overflow hidden > `.tz-g`), all transforms, so nothing repaints (it was a clip-path that repainted five screens of clouds every frame); each stripe eases in and out of its run (sine; theirs are linear); and with Lenis the transition and the timeline draw in Lenis's own scroll callback, the same frame the page moves, not the next. Measured with trusted wheel events: stripe lag 0px, the ground inside the stripes moves 0px. Then the work in order (below). Removed on 2026-09-29 when the owner picked the timeline over it: a Selected work band after trionn.com (`.tr`: half-screen case panels slid sideways, 0.35px a pixel of scroll, cards rising into line, a Mongol-bichig digit rail, gold clouds held still behind; it took about 10 000px of scroll and showed the same cases, and Playground and the only landing link to work.html went with it). The last copy with it is in the session scratchpad only; git has none. The work in order comes straight after the transition, after designxhand.com/experience's agenda ("Pre-Event / After Hours"; `.tl`, 2026-09-29, the owner's pick of that section's two parts): measured off theirs in headless Chrome, one screen held while a row slides left (theirs 0.9px per pixel of scroll, ours `RATE` 0.5), a thin wavy line along the row (a sine, `AMP` 22px, `PERIOD` 1700px, drawn as an SVG path in the script), one case on it at a time, arriving as designxhand's events do (owner's asking, 2026-09-30: "mine is so dull"): the line is lit behind a reading point at .62 of the screen and dim ahead (`.tl-lit`, a copy of the path in a window whose right edge moves, window and line counter-translated so it is all transforms, a 220px soft edge), and when a case's place reaches that point it gets `.is-in` (off again past .7 on the way back): a gold diamond lights there with a halo (`.tl-node`, a diamond so it isn't Experience's round dot), a hairline drops from it beside the words (`.tl-item::before`, scaleY), and the plaque, name and line rise in 22px, staggered .1s, on CSS transitions; the pictures follow designxhand's stack and micro-motion, measured off theirs (owner's asking, 2026-09-30): two frames per case to the right of its place, the case's cover and its low-fidelity drawing (owner's asking, 2026-09-30: "show their first pic and their low fidelity"; NetPay's and Voice's are the `svg.lofi` drawings of their case pages, captured whole and flattened to `art/netpay/lofi.webp` 1600×823 and `art/voice/lofi.webp` 1600×1182, originals in `art/<case>/_source/lofi.png`; OhayoFX and HUB have no low-fi, so they keep two screens each; for a moment the user flows were shown instead, their captures are kept in `art/<case>/_source/flow-landing.png`), rounded 12px with a gold hairline and a deep shadow, the upper one lifted more (the owner's "give me radius"; designxhand's are square), the low-fi drawings framed at their own proportions and zoomed only 1.04 so the pan barely trims them; sized for a 900px-high screen ( scaled with the screen's height, `K` .78–1.2, from `data-dx/-y/-w/-h`), overlapping, the bigger on top (`data-z`) and crossing the line, the words under the line clear of them (checked along the whole row at four sizes); as a frame crosses the screen it drifts from p to −p (`data-p`, ±25 or ±70) and the picture in it, held at `data-s` 1.2 or 1.25, pans the other way across its room (all of it at 1.2, .6 of it at 1.25, theirs exactly), straight with the scroll; no zoom change, no hover; cases 1100px (or .76 of the screen) apart; 60fps measured at 500 and 1200px/s (no dates since 2026-09-30, at the owner's asking: with them it looked like a second Experience, and the dates are there; HUB's "First UI/UX project" sits under its line, `.tl-note`), a discipline plaque — `.tl-chip`, after designxhand's "Inner Circle" badge at the owner's asking ("use exactly this"); theirs is a PNG with its words baked in, ours is drawn in CSS: scooped corners (four masked circles), brushed gold with a fine brown tooth, engraved dark-bronze serif caps, a flourish drawn for it at each end — the name linking to its case page, a line of copy), two pictures per case (see below for their stack and motion). **It is "Recent work", about the projects, not the companies** (owner's asking, 2026-09-30: "keep Experience and My Work, change them to recent works and focus on project not company"; About's Experience tells where): the four case studies newest first, NetPay V2 (2025–present), Voice mini app (2025), OhayoFX (2024), HUB ("First UI/UX project", its page's own words), and each project's name is the largest thing on the line (`.tl-t`, `clamp(32px,2.8vw,42px)`; it was 30px). Until then it ran oldest first as "From the first project to now", with a big italic chapter heading top left naming where each was made (First project / CSKIT / NetCapital); that heading is gone, don't bring it back. The intro "Recent work" (sub: "Four case studies, the newest first.") sits near the screen's head (`.tl-intro` top `clamp(74px,9.5vh,96px)`), so it shows about 126px of scroll after the transition's stripes close (it was mid-screen, 310px of empty clouds first; owner: "reduce the empty space"); it fades out as it slides off, gone by .36 of a screen. The ground is the transition's gold clouds carried on (the stripes' tile sits on that screen's foot and this screen starts where it ends, so `--tl-cy` is 0 and the grain `--tl-gy` −one screen; no seam at full resolution) and held still. Pinned only on a wide screen with motion allowed (`.tl.is-on`); otherwise a stacked list with the pictures in a row. **How I Work came back to the landing on 2026-09-30, after trionn.com's Our services** (`.hw#how`, after Recent work; owner's asking: "like this web, but instead of the stone our 3D models' transition"): one pinned screen, the label "How I Work" on top, the six steps of the draft how-i-work-3d.html as huge stacked words in Golos 600 uppercase (Brief, Research, Flows & code, Design, Check, Release; each tagged Me or AI with its airag name in gold, its line from the draft visually hidden for screen readers), the lit step at full ivory in front of the model and the others at .2 behind it; the draft's h1 as the line at the foot ("✦ AI does the churning. I decide when it's ready."); "See the full process →" (to how-i-work.html) sat in the corner until that page was removed on 2026-09-30. Behind the words the draft's own models play on a canvas, gliding after the scroll (`GLIDE` .35s, as the chest's scrub glides; a jump of more than 2.5 screens lands at once) and held to a top speed of `PACE` .55 screens of runway a second, about the draft's own pace, so a swipe sets them going and they play on for a few seconds (owner, 2026-09-30: "the 3D model animation goes too fast"; measured: a 1100px swipe plays for 2.8s); more than `CATCH` 1 screen behind they hurry, so at 600px/s of steady scroll they are about a screen behind when the pin lets go and finish as the section leaves; over 7.8 screens (`SEG`, with a .55 hold at the end; it was 3.75, then 5.6): the pail turns once; the pour; the хөхүүр turns into the хөхүүр with its бүлүүр (swapped at the half turn, both on the draft's world scale `H`, so the sack keeps its size); the pull; the хөхүүр at rest dissolves into the bowl on its хадаг, which turns once; the lit word changes half way through each change. The pour and the pull are framed by the draft's own formula (`box`, `from`, `to`: scale and anchor eased from one card at rest to the next, the pull dipping to .72). About 300 of the draft's frames (every second of the хөхүүр's turn, where 10° steps showed a double pole, every third of the rest; ~11MB), fetched from 2.5 screens away, warmed as they decode, neighbours crossfaded. 60fps measured at 500, 600 and 1200px/s. `?debug` exposes `window.__hwS()` (drawn and scrolled place). Below 861px or under reduced motion: the words stacked over a still of the bowl, nothing fetched. The bar's How I Work jumps to it; the bar's Contact came off with contact.html (2026-09-30). **The bar is laid out after benjamincreative.me's** (`.onav`, owner's asking, 2026-09-30: "copy this one's nav bar, and remove ours"; the old one was a dark blurred strip of small gold-lit caps): no ground of its own, "Portfolio" at the left, About, Work and How I Work in even columns from a third of the way across (theirs measured: 32.5%, then 14.7% each; ours land within 2px of theirs at 1175px), "Let's talk" at the right (a mailto to the footer's address), 15px Golos 500 at .75 ivory, the lit section full ivory. Each name rolls up on hover: letters split by the script (`.roll i`, the word kept whole in a `.sr` for screen readers), each carrying its copy one line below as a text-shadow, rising a line 18ms apart over .55s; fine pointers only, none under reduced motion, plain text without the script. Their small grey marks are ours in bichig digits ᠑ ᠒ ᠓. It passes clicks through where it has no link. Over About's cream card a link turns dark ink (`.is-light`, the bar's scroll check tests each link's centre against `.pass`); a difference blend was tried first and left the bar unpainted over the chest's layers. `--nav-h` is now `--nav-pad` + 30px (58px at 1440, the old bar's 59.8), so the rows under it keep their place. Below 861px the columns close up; below 561px "Portfolio" goes and the rest fit in one row at 375. **The first screen** (owner's brief, 2026-09-30, phase 1 of a landing redesign on branch `landing-redesign`): the bar is up from scroll 0 (it used to come down with About) and is first in the document, so Tab reaches it first; under it the labels, centred (left below 640px; below 520px only "Open to work"), and the sound toggle on the right, each in its own row; the chest rests in the band between that row and "Scroll to open" (`measureBand()`/`restRect()`), so no text sits on the painted border; on a portrait screen it rests cropped to the lion medallion (`CROP` .52 of the frame's width) and the dive opens out from there; the footer has 16px sides and stacks on a phone, with "Skip intro" (jumps to #about and takes the focus) in the right corner. A real `<button id="latch" aria-label="Open the chest">` covers the painted hasp (`HASP`, placed from the rest rect by `layout()`, which also sizes the canvas); click, Enter or Space glides to p .56 (`OPEN_AT`, the held-open beat) in 1.8s with Lenis (jumps under reduced motion, goes to About without GSAP); it is disabled once the lid moves. A name tag hung from the latch (a little pass card with Мөрөнгуа and the role, on a gold cord) was tried the same day and came off at the owner's asking ("rmv this"); don't bring it back. Frames load in two goes: f000, then `FIRST` (1, 2, 3 and every seventh), the rest once the page is idle after load or at the first scroll, key, touch or click; `render()` draws the nearest frame below, else above. |
| `work-netpay.html` | NetPay V2 — the deepest one, 8 sections |
| `work-voice.html` | Voice mini app |
| `work-ohayofx.html` | OhayoFX |
| `work-hub.html` | HUB — NetPay/Voice layout (`.step.wide` + `.annot` rows); four roles in chain order, and its own chain section (`.hb-chainsec`, s02) |

**Removed on 2026-09-30, at the owner's asking** ("rmv them"): `work.html`, `how-i-work.html`, `playground.html`, `about.html`, `contact.html` and the unlinked draft `how-i-work-3d.html`, with the 690 turntable frames only the draft used and the 10 pictures only those pages used (how-i-work's masthead and step SVGs, `art/steps/`, and the gallery's placeholder `hero.svg` tiles). The site is the landing and the four case pages. Their links now go to the landing's sections: Work `index.html#work`, About `#about`, How I Work `#how`, and each case page's back link ("Сонгосон ажлууд", OhayoFX's "Selected work", "Works", "All work") to `#timeline`, the Recent work list; Playground and Contact links came off, and so did the landing's "See the full process →". There is no contact route on the site now. The last copies are in git history (commit 0ed4c46 of the old `portfolio` repo). Don't bring them back unasked.

`leaf.css` is the shared base; `work.css` holds everything case-specific and
loads on the four case pages. `index.html` is self-contained: inline style, no
`leaf.css` (its About carries what it needed from it).

**Scripts.** Scrolling is native on every page but the landing. A weighted wheel scroll used to
live in `scroll.js` and came out because it lagged a Mac trackpad's own
momentum; don't bring one back to the interior pages. **The landing is the
exception, at the owner's asking (2026-09-29: "when i scroll i feel dizzy and
things go bit blurry")**: `index.html` runs Lenis 1.3.23 from jsdelivr, the
version trionn.com runs, a little softer and slower than its defaults since 2026-09-30 (lerp .075 for .1, `wheelMultiplier` .8; owner: "make scroll more smooth and slow"), wheel only (touch, keys
and scrollbar native; ctrl+wheel left to the browser), driven by GSAP's ticker
so the chest's scrub steps with it; off under reduced motion and without the
CDN script. Every scroll the page makes itself goes through `goScroll()`
(Lenis's `scrollTo`). Measured in headless Chrome at 1x on a trackpad-like
flick of 507px: same distance, peak 1 018px/s against native's 3 614, and no
frame-to-frame spike (native jumped 3 614px/s in one frame). At the rig's
default 2x the synthetic wheel reports half its delta, so Lenis looked to move
half as far; that is the emulation, not Lenis. If the owner finds it laggy on
a trackpad, the first thing to try is a higher `lerp` (back to .1, or .15).

- `scroll.js` — `work-netpay.html`, `work-voice.html` and `work-hub.html`
  (HUB takes the scroll reveals, the held phone screens and the skeletons;
  every other part checks for its page or its markup and skips). Gallery dots,
  the `.shift` ledger ruling itself in, NetPay ground, pointer field, Voice spark height, the
  scroll reveals on both case pages (`.rv-near`; hover lifts in `work.css` match),
  play/pause for the device videos, and the long phone screens (`.screen`,
  `.device.tall .screen-scroll`): on a fine pointer they get `.held`, so the
  wheel always scrolls the page and a screen scrolls by drag. As plain scroll
  boxes they trapped the wheel and stalled the page. Also the skeletons: any
  `main img`/`video` not yet arrived gets `.skel` (panel fill plus a faint
  sweeping band, `work.css` at the end), removed after `decode()` or on
  `loadeddata`. Static under reduced motion; unmarked without the script.
- `chart-hover.js` — the Outcome charts on NetPay and Voice: draws each at its
  box's measured width, wires the hover readout. Data is each page's own
  `<script type="application/json" id="chart-data">`; the markup keeps a static
  SVG per chart, drawn by this same code, for no-JS. The Outcome is `.oc`: a
  one-line finding, then a panel. NetPay: one hero figure (+10.0%) with its
  trend, then a before → after ledger (`.oc-row`) — a mixed result reads as
  failure if every change is set equally big. Voice: reach → depth tiles
  (`.oc-stat`, each number with its base), then the `season` chart (weekly
  users on the broadcast rounds, unlogged weeks hatched). Trends are `spark`
  specs with a fixed ±22% range around the before-mean, so tiles compare.
  Under the panel a segmented control (`.oc-seg`, bottom of `chart-hover.js`)
  switches Тойм and the tables — NetPay: Хүснэгт; Voice: Хэсгээр, 7 хоногоор,
  Викторин — with Motion's smooth-tabs motion measured off the example: the
  pill springs on a `linear()` curve in `work.css`, views blur-slide in the
  direction of travel. The views share one grid cell (inactive ones are
  `visibility:hidden` + `inert`), so the control never moves; without JS
  they stack. Every chart has its numbers in one of those tables. The old
  tabbed `.cbook` code in this file and `work.css` is unused now.
- `cursor.js` — the cursor on every page (see Conventions); self-contained, its style injected.
- `about-motion.js` — About on `index.html` (it runs wherever there is a `.pass-stage`); carries its own scroll listeners. Under the chest the card is far below the fold, so its entrance waits until it is scrolled to, and the tilt waits on the entrance. The Experience years (bichig digits) brighten as their row nears mid-screen but never grow: the scale-up came off at the owner's asking (2026-09-29, "I don't like how it gets bigger").
- Inline: `index.html` (hero; the only page with GSAP 3.12.5 + ScrollTrigger,
  from cdnjs, and it has a no-GSAP path: the shut chest as a title screen over
  the page; plus the bar, the transition with its bichig sentence, and the timeline), and `work-ohayofx.html` (the access counter: visits
  from this browser, in `localStorage`; dashes without it).

**Still owed by the owner** — placeholders, don't invent them: the email,
LinkedIn and Telegram (the site has no contact route since contact.html went); NetPay's "Апп үзэх"
`href="#"`. There are no og tags yet; they wait on the production domain.

## Conventions worth knowing

**Gold is matte** (owner's asking, 2026-09-29: the gradient gold "is too AI-like",
"more matte"). `--ab-gold` is #c4a464, a matte yellow gold (the old #d8ad5c's hue, flatter;
#c9976b, the hero's tan `--gold`, was tried first and read as not yellow), and
`--ab-gold-hi` #d8c297, on `index.html`,
with every gold hairline and the хана tile in the same rgb(196,164,100). No
gold gradients clipped to text (the band heading is flat gold, Contact's title
flat ivory, the timeline's years flat gold), no gold glows
(the timeline's line and lit dots, the rail's mark; the one light on the site is the drum's hearth fire, and only while it is lit), and Contact's round button
is a flat disc. The pass card's foil spine keeps its leaf gradient: it is gold
leaf on paper, not type. The timeline's plaques (`.tl-chip`) are brushed gold too, at the owner's asking: metal objects, not gold type. At 10.5px, #c4a464 sits near 8.8:1 on black.

**The cursor is after milancompain.com's** (`cursor.js`, owner's asking, 2026-09-30: "nvm copy this cursor"), measured off theirs in headless Chrome and matched frame for frame: a 5px ivory dot that all but sits on the pointer (.9 of the way a frame) and a 28px 1px ring that glides after it (.14 a frame, settled in ~.7s), both in difference so they go dark on About's cream card; over a link, a button or anything draggable (`.gerege-hang`, `.xp-card.is-draggable`, the drum's `.wr-t.is-grab`, a case page's `.held` screens, whose grab hand is hidden with the native cursor) the ring eases to 1.57; pressed, to .92 of that with a matte gold rim (theirs green) and the dot to 1.39; the bar's links lean up to 4px toward it; moving, it sheds gold dust, a grain every 26px of the pointer's path, 16 at most. Their "visit" bubble with its star is ours as a 76px ring reading "◆ View" on a blurred dark disc over any `a[href^="work-"]`. It injects its own style, runs only while something still moves, hides off the window, and rechecks what is under a still pointer on scroll. Fine pointer with motion allowed only; on touch or under reduced motion the system cursor stays. **A click tosses four шагай** (owner's asking, 2026-09-30: "I want шагай to appear when I click my mouse", with their sheet of the four sides): from the pointer they fly up and out spinning, land 12–26px below on a random side, 30px apart, bounce once, rest and fade (1.5–1.8s, 28ms apart; `.cur-shagai`, WAAPI, `throwOne()`). **Dragged** (the button held while it moves; the owner's asking the same day: "when I drag I want them to appear constantly"), one hops off the path every 30px of it, a smaller throw (up 12–26px, 1.1–1.35s), so a drag leaves a trail of them, on the drum, the gerege and the cards too (a press there used to throw none). 22px tall (30 at first: "a little bit smaller"); 40 at most in the air. None for a click on a link or a button (`a[href]`, `button`, `[role=button]`, `[role=tab]`, `label[for]`, `summary`; the owner's asking the same day: not when clicking the navigation or a case), nor a trail for a drag that starts on one. A drag over words still selects them, as it always did. On every page (`cursor.js?v=5`). The хэт цахиур cursor drawn the same day came off for it (a traveller's fire striker turned so its steel's horn was the tip, with a strike version and sparks on click); its drawings are kept in `art/site/_source/cursor/`, its PNGs are in git history (c141a78); don't bring it back unasked.

**Motion.** Grain never moves — animated grain made the owner nauseous. The
slow light is a different thing and the owner wants it: NetPay's ground canvas
drifts (paced in time, not frames, so 120Hz screens don't run it double speed)
and Voice's `.vo-spark` runs down its lines on a 9s cycle. The spark moves by
`transform` (the masked `i` slides, its `::before` lines slide back), never by
animating `mask-position`, which re-rasterised the page every frame and
dropped ~145 frames a scroll.
Both were stopped once under a blanket "backgrounds never move" rule and put
back at the owner's asking on 2026-09-25 — don't stop them again to save
frames; both go still under reduced motion. The pointer field moves only in answer to
the pointer, and not at all under reduced motion. `scroll.js` and
`about-motion.js` leave the page readable if they never run; keep new motion
that way.

**Language.** `<html lang>` says which way a page runs. NetPay, Voice and HUB
are `lang="mn"`: body copy is Mongolian, and English section
headings and hero titles carry `lang="en"` so screen readers switch voices.
`index` and OhayoFX are `lang="en"`, and any
Mongolian inside them is marked `lang="mn"` (the landing's labels, OhayoFX's
one block — the page is English; its Japanese is only inside the
screenshots, at the owner's asking).

**Case-page theming** is driven by four custom properties, declared per page
family and read by every panel on it:

```
--glass       panel fill
--glass-veil  backdrop-filter (or `none`)
--glass-hi    inset top hairline
--glass-lift  drop shadow
```

NetPay's live in `body.case-dark:not(.case-voice)` in `work.css`. The `:not()`
matters — Voice is also `case-dark` but has its own panels: `--glass:#0a0b10`,
`--glass-veil:none` on `body.case-voice`. That fill is the colour its old
`blur(16px)` frost measured on screen; the frost came out because re-blurring
fourteen panels every scroll frame made the page lag. HUB is
`case-dark` too, so the rule reaches it at (0,2,1); HUB's own violet set is
therefore declared on `body.case-dark.case-hub` (and `… .dark`) — equal weight,
later in the file. Drop the `.case-dark` there and HUB's panels silently turn
NetPay's `#202b37`. Change these four and the whole page turns together; do
not restyle panels individually.

Voice has no `.dark` wrapper, so it redeclares the `--np-*` and `--c-axis`
tokens on `body.case-voice`. If a component looks unstyled there, it is
probably reading a token only declared on `.dark`.

**Fonts.** Interior pages share one Google Fonts URL: Source Serif 4 (opsz +
wght, roman and italic) and Golos Text `wght@400..700`, one variable file, so
700 is real. Copy that `<link>` as-is onto a new page. The one exception is
`work-ohayofx.html`, dressed as a Japanese homepage of about 2002 (its own
`.oh-*` markup; none of leaf.css's header, paper or footer): DotGothic16 for
the chrome and headings, only at 16/32px so the dots stay on whole pixels, and
M PLUS 1p for everything else — the one Google Japanese gothic that also has
Mongolian ө/ү. DotGothic16 lacks them, so Mongolian never goes in it. Its
captures are cropped thumbnails that open full size; no inner scroll box. `index.html` takes the
interior URL too, now that About is under the chest. `--f-label` is Golos.

Noto Sans Mongolian loads only on `index.html`, as a
`text=` subset of the ten traditional digits U+1810–1819; on `index.html` the subset
also holds every character of the transition's bichig sentence (letters, the vowel
separator U+180E, ᠂ and ᠃). Google's text subset keeps the joining forms: the sentence
measured the same set in it as in the full font. A new traditional-script character
has to be added, URL-encoded, to `text=` on the page that uses it, or it falls
through to another font.

Body text on `use-gip` pages (NetPay, Voice, HUB) is GIP; the landing's About
names it directly on its reading text instead of using the class. GIP ships
five files: Light, Regular, Medium, SemiBold (300–600) and RegularItalic.
Nothing above 600 exists, so don't ask GIP for 700 — it comes out
synthesised. The other italic cuts are in `fonts/gip/_source/`.

**Images.** Every `<img>` carries intrinsic `width`/`height`. Without them the
page reflows for seconds after load and deep links land thousands of pixels
off. Keep doing this.

Any CSS rule that sizes an image by `width` + `aspect-ratio` also sets
`height:auto`; otherwise the height attribute beats the aspect ratio and the
image stretches (a 1600×2000 gallery tile would render 2000px tall).

Below the fold, `loading="lazy"`. Above-the-fold heroes are eager with
`fetchpriority="high"`: the NetPay and Voice covers, and the OhayoFX landing. HUB's four
phones under the title (`.hb-fan`) are eager without a priority.

Content rasters are WebP, most at their original pixel size (HUB's phone
captures are halved to 750px wide; `khadag`, `netcapital-building` and `gerege`
are cut down). Voice's ten phone captures ship twice, `-480` and `-900`, in a
`srcset`: a Voice screen never renders past ~226px, so 480 covers 2x (3x on a
phone) and the 900 is there for zoom; the 900s alone were decoding four times
the pixels shown. Encoding: `cwebp -m 4 -q 85 -sharp_yuv` for photos and screens,
`-near_lossless 60` or `-lossless` for design-system sheets. The original goes
in that folder's own `_source/` (`art/netpay/_source/`, `art/site/_source/` for the
landing's grounds, and so on; see art/ below). Left as-is on purpose:
`voice/system/{mark,nav-icons}.png`, `hub/sitemap.png`, `site/cloud-bg.jpg`,
and `netpay/cover.jpg`
(fallback in a `<picture>` of `cover-1100.webp` / `cover-2200.webp`).

The NetPay and Voice covers ride up over a pinned title —
`.hero-stack` plus `position:sticky` in `work.css`, no JS, static under
reduced motion. HUB shares NetPay's hero rules (eyebrow, title,
`.hero-desc`, spec row); its selectors sit in the same lists. Both are
16:10. NetPay's is a finished photo (4:3 file, cropped by CSS). Voice's is a
render of the phone on ribbed black (`voice/cover-{1100,2200}.webp`, exported
already 16:10 from `art/voice/_source/Purple Gradient Smartphone Mockup on Textured
Black.png`), with two still overlays on one ellipse fitted to the phone: a
spotlight on `.hero-plate::after` and a masked blurred copy (depth of field)
on `::before`, both eased with smootherstep over many stops — fewer stops
show a halo ring. A new cover means refitting that ellipse to where its phone
sits. Both plates must stay opaque in the middle, or the title shows through.
Earlier Voice covers are kept in `art/voice/_source/` (`cover-studio-*`,
`cover-cord-*`, `cover-keyart.webp`).

Videos never autoplay: `muted loop playsinline preload="metadata"`, with the
src ending `#t=0.001` so iOS paints the first frame. `scroll.js` plays a clip
near the viewport and stops it once it has gone; with reduced motion it gets
`controls` instead.

Phone screenshots go in `.device` frames, which expect roughly a 1500×3248
ratio (HUB's 750×1624 captures are exactly half of it; its taller ones sit in
`.device.tall`). HUB's captures carry their own notch, so the drawn `.island`
is hidden on that page. Long scrolling captures use `.device.tall` — a
correct-ratio frame whose contents scroll — because a 1:5 image stretches the
frame until it stops reading as a phone.

**Hero.** `index.html` picks a frame set once at load: `frames-1152/` when
`innerWidth <= 600`, else `frames/`, and `FRAME_W` follows. Frames go through
`img.decode()`; don't switch to `createImageBitmap`, which has no AVIF decoder
in every engine and fails silently. `decode()` does not resolve in a hidden
tab, so a background tab's loader waits until it is shown — known. Dev HUD
only at `index.html?hud`. `README.md` covers the hero in depth.

## art/

- `art/hero/` — landing-page chest animation: `frames/` (36 AVIF, 2304×1300,
  ~7.9MB), `frames-1152/` (36 AVIF, 1152×650, ~2.3MB), `poster.jpg` (stands in
  if f000 won't decode), `open-hires.avif`, `chest.m4a`. **Served**, ~11MB
- `art/site/` — `cloud-bg.jpg`, `frieze.webp`, `khadag.webp`,
  `shagai/shagai-1…4.webp` (the four шагай a click tosses, cut out of the owner's sheet
  `_source/shagai/shagai-sheet.jpg` by flooding its paper and shadows from the edges up to each piece's closed
  tan outline, 96px tall), and `cloud-gold.webp`
  (the landing's transition stripes and timeline ground, 1600px lossless,
  149KB). **Served**, ~380KB
- `art/about/` — `gerege.webp`, `hee.svg`. **Served**, ~136KB
- `art/how-i-work/<object>/` — the frames the landing's How I Work plays, 302 since 2026-09-30 (the draft
  `how-i-work-3d.html` that used all 992 is gone, and with it every frame the landing doesn't draw: pail-milk 48,
  pour 65, khokhuur 37, khokhuur-buluur 37, pull 65, khokhuur-rest 1, ayaga-khadag 48 + `hi/f000`; ~11MB). What follows
  describes the full sets as they were cut; the tools are in `.claude/scroll-rig/video/`. Originally turntable frames for `how-i-work-3d.html`:
  one even 360° turn as transparent WebP, `f000.webp`…, built in a template
  literal (`F.dir + 'f' + pad + '.webp'`). `pail-milk/` is step 1 now: 144
  frames 478×600 + `hi/` f000 1010×1268 (~6.2MB), from
  `art/how-i-work/_source/step 1 milk.mp4`, whose first frame is the pour's.
  Cut by `extract1n.html`/`export1n.py` with the pour's key (plus small shine
  specks shut inside, the rivets, kept solid); timed by the staves' texture
  (`plan1n.py`); held on the body, since a round tub's outline is centred on
  its axis (it wandered ±20px and 24px up and down). The box runs from the
  rope standing up mid-turn to the base, so `H` is 2.19 and the pail keeps
  its size; the pour's `from` is that box in the video.
  `pour/` is the step 1→2 pour: 193 frames, 648×720 (~7.3MB, q .80), every
  frame of `art/how-i-work/_source/step 1-2 pour.mp4` cropped to x 80–1376,
  cut by `extractp.html`/`exportp.py`: keyed off the white, plus the milk by
  its warmth (ivory's blue dips below its red and green; paper's never does),
  the milk's white core by closing that mask, and near-white milk shut inside
  the pail by an edge flood that keeps enclosed patches only if they are warm
  (the paper under the rope's arc is not). The floor's shadow under the lifting pail is keyed out in its first 35 frames (grey below each column's lowest coloured pixel), since the card keeps its own blob. The frame's edges fade, 40px where
  the objects stand at rest and 240px while the camera moves and they cross
  them. `pull/` is the step 3→4 pull: 193
  frames, 563×966 (~7.5MB), every frame of `art/how-i-work/_source/step 3-4
  pull.mp4`, box x 60–1400, y −860–1440: the pole's top, cut off by the
  video's first frame, is drawn back in above it (`extractpull.html`, step 3's
  method with a length per frame from `planpull.json`: step 3's 328 rows while
  the sack turns, up to 839 as the head comes out of the neck, back to 0 by the
  time the pole's own top comes into the frame). `khokhuur-rest/` is step 4's
  still: the pull's last frame, 587×600 + `hi/` 1330×1360. The start and end
  frames made for regenerating it with room above are
  `art/how-i-work/_source/step 3-4 start.png` / `end.png`. The old pail (below) is archived, unserved, in
  `art/how-i-work/_source/archive/pail-v1-frames/`. It was step 1: 144 frames,
  458×600, ~5.0MB, plus `pail/hi/`: 13 sharp 916×1200 frames (~1.4MB) for
  the angles it can rest at (frames 134–143, 0–2), cut from a Kling video and sharpened inside the silhouette only (unsharp mask .85/1.15px on `hi/`, .6/.8px on the turning frames; `extract.html` `render(…, amount, radius)`) (the video turned 1.5 times; the
  clean turn is source frames 0–110 + 150–192, retimed to an even 2.5° by
  the ears' spread). `khokhuur/` is step 2: 144 frames 607×600 (~5.6MB) + `hi/`
  13 at 1214×1200 (~2.1MB, frames 142–143, 0–10: it rests on the left), one clean
  turn retimed by the crossbar's length. `khokhuur-buluur/` is step 3: 144 frames
  497×600 (~3.9MB) + `hi/` 13 at 994×1200 (~1.3MB, frames 134–143, 0–2). Its
  video cut the pole off at the top edge, so `extract3.html` draws the missing
  top on every frame: 328px added above the frame, the pole's axis carried on
  at its measured slope, its cross-section averaged along rows 1–80 plus a
  little mirrored detail, and a rounded end. The turntable plate under it is
  keyed out as neutral grey below the lowest leather in each column. Steps 2
  and 3 are cut on a fixed turn axis (x 710 and 722 of 1440): step 3's plate
  shows the camera never moves, and the sack's own silhouette swings ±50px as
  it turns, so a centre of mass or base centre adds a sideways wobble. Both
  crops end at source row 1434, so their sacks share a scale. Turntables load
  in step order, each after the previous one's rest frames. `ayaga-khadag/` is
  step 6: 144 frames 988×540 (~4.2MB) + `hi/` f000 at 1746×954 (~120KB: it
  rests straight on, see `face`), cut by `extract6.html`. Its
  video's bowl sits off the turntable's centre and orbits ±70px, so each frame
  is held on the bowl itself (its rim's centre, widest row and width, smoothed)
  rather than a fixed axis. The turn is timed from the bowl's own texture
  (the front wall and wood band tracked frame to frame, less the bowl's
  travel): the video eases in and out, near still for its first and last
  half second. The turntable plate stays put in the frame, so it is keyed out
  inside its fixed ellipse wherever a pixel is neither bowl (a measured
  profile) nor хадаг blue (saturation); background is only what the paper
  reaches from the frame edge, so sheen and creases shut inside the хадаг
  stay; the near-white airag is held solid inside the rim, and along the rim
  only paper-white counts as paper. Where the fringe ran off the frame edge
  (about 8–69°, 173–214° and at 250° of the turn) it fades out. Its video was photographic next to
  the set's clean renders ("too realistic", the owner), so every frame then
  goes through `stylize6.js` (in the rig's `video/`, `export6.py stylize6.js`):
  in OKLab, an edge-preserving smoothing that flattens the tarnish and the
  silk's weave into satin, and a calmer, deeper blue at the set's saturation;
  alpha untouched, fixed parameters so the turn doesn't shimmer. The padded
  still it was made from is `art/how-i-work/_source/step 6 still.png`. Originals in
  `art/how-i-work/_source/`. **Served**
- `art/<case>/` — one folder per case study, straight under `art/` since 2026-09-30
  (it was `art/work/<case>/`): `netpay/`, `voice/`, `ohayofx/`, `hub/`. Design-system
  sheets live in `netpay/system/` and `voice/system/`. Filenames carry no case
  prefix — the folder is the prefix (`art/netpay/cover.jpg`). **Served**, ~16MB
- `_source/` inside each folder (`art/<project>/_source/`, `fonts/gip/_source/`) —
  that project's originals, exports, screen recordings and the rasters the WebPs
  replaced, sorted there on 2026-09-30 at the owner's asking ("netpay folder only
  netpay"); until then they were all in one `art/_source/`, sorted by case with a
  mixed `misc/`. NetPay's holds its old `misc/` things too (QA sheets under `qa/`, the
  loan, wallet and trust-fund flows and animations, the phone mockups), and
  `netpay-design-system/`. Tracked in git since that day (the owner's asking: the
  repo is how they move laptops), **never deployed** (`.vercelignore`: `_source/`).
  `art/netpay/_source/Netpay-mockup.png` (16000×12000, 130MB) is over GitHub's
  100MB limit, so it stays on disk only (gitignored) and its lossless WebP beside it,
  proven identical pixel for pixel, is the tracked copy. ~700MB in all.
- `art/_archive/` — originals of projects taken off the site (`smileline/`,
  `playground/`, and an old `misc/ai.html`). Tracked, never deployed.

Sizes are `du -sh`. Before moving anything in `art/`, grep the HTML, CSS and JS
for the path. Every served file is referenced and every reference resolves:
193 distinct paths (188 under `art/`, 5 under `fonts/`) for 193 files (the four newest: the шагай), plus the 302 frames under `art/how-i-work/` that the landing's How I Work draws (`index.html`, in a template literal: `D + S[k].dir + 'f' + pad + '.webp'`). SmileLine was taken off the site on 2026-09-27; its page and art are kept in `art/_archive/smileline/`. There
are no orphans, so a file that nothing references is a bug, not spare stock.

Count with a script, not a grep for `src=`/`url(`, which misses two things:
`index.html` builds its frame paths in a template literal
(`art/hero/${SET}/f${pad(i)}.avif`, both sets) and its How I Work frames
(`D + S[k].dir + 'f' + pad + '.webp'`, from each step's `idx` list). Include `srcset` candidates, and skip
`.DS_Store` and paths that only appear in comments.

## Caching

- `serve.py` sends `Cache-Control: no-cache`: a plain reload shows edits,
  unchanged files come back 304, Back is instant. It has no Range support, so
  Safari may refuse the mp4s locally — judge video on a Vercel preview.
- `vercel.json`: `art/hero/*` is `public, max-age=31536000, immutable`, which
  is safe only because every hero URL carries `?v`. Other `art/*` and `fonts/*`
  get `public, max-age=86400, stale-while-revalidate=604800`, so a file
  replaced in place can stay stale for returning visitors for a day, and for
  one more visit in the week after while it revalidates. HTML, CSS and JS keep
  Vercel's default revalidation.
- `.vercelignore` keeps `CLAUDE.md`, `README.md`, `serve.py`, `.claude/`,
  every `_source/`, `art/_archive/`, `*.log` and `.DS_Store` out of the deploy. `outputDirectory`
  is `.`, so anything not listed there ships as a public URL.
- When a CSS or JS file changes, bump its `?v=` to the same new number on every
  page that links it. Check with
  `grep -ho '[a-z-]*\.\(css\|js\)?v=[0-9]*' *.html | sort | uniq -c` — one
  line per file means they agree.
- `ASSET_V` in `index.html` is the `?v` on the frames, poster and open-hires.
  Bump it together with the `?v` on both f000 `<link rel=preload>` lines in
  `<head>` (one per set, split by media query), or f000 downloads twice.
  `chest.m4a` carries its own `?v`.

## Data

Outcome figures on NetPay and Voice come from
`~/Downloads/NetPay v1 vs v2 Voice Engagement Sept 18 (1).xlsx`. Two traps:

- The Voice funnel in the workbook mixes sources. `voice_activity_log` starts
  2025-12-02; the quiz table covers 2025-10-27 → 2025-12-21. Counts from the
  two cannot be chained into one funnel, and the page says so. On Voice's
  chart book the quiz is its own sheet with its own caption for that reason.
- Voice's 6 138 is people who opened the section, distinct over the 13 weeks
  (from the workbook's summary sheet). The weekly counts sum to 6 755 because
  people return; never add them up as a total.
- NetPay's four-month windows are 2025-05…08 against 2025-10…2026-01. Derived
  rates are recomputed from the raw columns (MAU, total minutes, active
  user-days), never from the workbook's own ratio columns.

Recompute from raw columns and re-verify contrast after changing a panel fill —
the faintest ink sits near the 4.5:1 line at 10.5px.
