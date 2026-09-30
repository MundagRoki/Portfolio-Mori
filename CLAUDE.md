# Portfolio site

Static site. No build step, no package dependencies, no framework — plain HTML,
two stylesheets, three scripts, inline scripts on six pages, and GSAP from
cdnjs plus Lenis from jsdelivr on the landing page only. Edit a file and reload.

## Running it

```bash
python3 "/Users/mundagroki/Downloads/Work/Portfolio Website/serve.py"
```

Serves on `http://localhost:4173` (a port argument or `PORT` overrides it). Use
the absolute path: `os.getcwd()` is blocked in the sandbox, which is why
`serve.py` hardcodes `ROOT` and why `python3 serve.py` from a relative path
fails.

`.claude/launch.json` only *attaches* to that URL; it does not start the
server. A managed server does not work here — the preview sandbox cannot read
files under `~/Downloads` (macOS TCC), so the server has to be started by hand.
If every path suddenly 404s, the server has gone stale: kill it and restart.

## Pages

| File | Page |
|---|---|
| `index.html` | landing, one page (2026-09-28/29, owner's asking): the chest-opening hero, then About and My Work under it, on one ground. The categories menu that came up on the black is gone; About rises out of the blackout (`.one`, `margin-top:-48vh`: the blackout is done at 86 of the timeline's 100, and a spacer tween keeps the timeline 100 long so the frame windows keep their place). About is a **copy** of `about.html` (without its closing "Open to work" block, taken off on 2026-09-29), scoped to its section; change the two together. My Work sits on About's ground: its хана and grain laid on `.one` as backgrounds that scroll with the page (`.one::before`/`::after`; the хана's 14° lean baked into a seamless 346px tile). They are never pinned to the screen here: pinned, as on about.html, across this length they made the owner feel sick (2026-09-29). The grain lies under the words at .1 (about.html lays it over them at .13, which specked every letter and made the text hard to read): My Work opens on a transition after trionn.com's (`.tz`, owner's asking 2026-09-29, "copy this transition, change the colours"), measured off theirs in headless Chrome: one screen pinned and five full-width stripes that each grow up from their own foot, the lowest first (theirs: each starts .214 of a screen after the one under it and fills in .858, so the screen is covered at 1.72 and holds; theirs also has a huge marquee drifting left, which ours no longer has). Ours are faster, `STEP` .17 and `LEN` .75, so they close in 1.4 screens of scroll (they were .12 and .52, one screen, after "still so much space"; slowed on 2026-09-29 when the owner found the transition "comes in too fast"), and the pin lets go the moment they close (`RUN` = 4×STEP + LEN), since a held covered screen read as empty clouds (owner: "reduce the space"). Our stripes carry the timeline's own ground (black, the gold clouds anchored at the screen's foot, the grain), so the covered screen is already the timeline and it scrolls on without a seam. Behind the words, the pinned screen carries the page's own хана and grain (`.tz-bg`, owner's asking 2026-09-29: "keep түмэн өлзий хээ on that section"), their tiles set where the page's lie when it arrives (`--tz-hx`, `--tz-y`; no seam at full resolution); pinned, it holds still with the screen and the stripes rise over it. **Before the stripes, the owner's sentence in Mongol bichig is written in on the scroll** (`.wr`, the owner's pick on 2026-09-29 of three ideas): "ухаан бодол нь ундарга шиг ундарж, уран бүтээл нь уул шиг сүндэрлэг" (given by the owner; don't respell it; the visually hidden `<p class="sr" lang="mn-Mong">` carries it for screen readers). The whole of it is set large in four lines, each clause two (`.wr-l`, the second clause .28em further down), left-aligned in a block centred on the screen, `clamp(30px,min(7vw,10.5vh),128px)` (94.5px at 1440×900; it was 112 until the owner asked for it "a little bit smaller"). A brush writes it in left to right, line after line, as the page scrolls: its edge is soft (`FEATHER` .35em), the ink just behind it is fresh, paler and still wet (`WET` 1.3em, fading from rgb(241,227,191) into the matte gold), and between lines it lifts for `LIFT` .9em of its travel. Scroll back and it unwrites. The words it hasn't reached wait as a faint trace (the text itself at rgba(239,231,218,.08), as on a practice sheet). The ink is a canvas laid exactly over the text (`.wr-ink`): each line is drawn once, whole, into its own bitmap at the font's own baseline (so its letters keep their joined forms), and each frame only reveals them (one line through a scratch canvas: `source-atop` for the wet ink, `destination-in` for the edge), so nothing in the page repaints. **When the writing is done, the four lines roll up into rings and turn** (owner's asking, 2026-09-29: "spin them like previous animation but without any additional elements"): the drum after Nika D.'s "Moving text animation" (dribbble.com/shots/13916052), words only (no ✣, glow or frame), the front in gold and the back seen through mirrored at .3. Each ring is its written line repeated round one shared circumference with plain gaps (`drum()` picks the circumference, a radius between 3.1 and 5.2 of the text's ems and no more than .4 of the screen's width, that gives every line a gap nearest 1.1em; so the drum shrinks with the words), drawn into a texture and dealt across flat panels 34px wide (`PANEL`, a whole number so the joins fall on whole pixels) with two faces each; 316 panels at 1440. Each line coils into its ring as soon as the brush has written it and is half way through its lift to the next, so the drum builds from the top while the lines under it are still being written (owner's asking, 2026-09-29: "when I turn here, the upper line spins into the drum, and lines 2, 3, 4 the same"; "snap into the drum fast"; then "it bends on both sides: I want the first side to bend first and circle, then the letters after follow it, like the snake game"). It plays on its own, in time, not on the scroll, over `UP` 3s (2.2 at first; owner: "spin them a bit slowly"); scrolled back before that point (with a hundredth of the writing's hysteresis, so it doesn't flicker there), it runs back out onto its written line in `DOWN` 1.8s. **The coil is the snake game** (`rollRing()`): the line's first letter is the head; it curls back into a circle that starts small (`RHO0` .3 of the drum's radius) at that letter, and the rest of the line follows exactly along its path, the flat body sliding left after the head and turning into the coil where the head turned, never bending on its own. As it goes the circle grows to the drum's size and glides from the line's head to the middle, on a quick-off-the-mark ease with a long soft landing (1 − (1 − f)³(1 + 3f)). L, how much of the snake has gone into the coil, is the coil's own part (C·ρ·e) plus the turn in time (S, eased in over the first .7), so the moment it closes it is already turning and just goes on round and round like the drum it came from. The snake is the whole ring's length, the line and then its copies with plain gaps; the copies are its tail, unseen while flat (shown, they read as a second line sliding in to the right of the first before it bent) and fading in over .8em as they go round into the coil, all of it up by the end. Closed, S wraps every copy (`off`, which copy the head is on), so rolled back the snake runs back out and lands on the written line. Tried the same day and taken off: a line bending into the drum all at once about its middle, on the scroll and then snapped ("it bends on both sides"); all four waiting for the whole sentence then rolling one by one; a belt round a shrinking racetrack (the text piled up). Each line's ink hands over to the panels over the first `HAND` .05 of its coil while the snake holds still (it used to move during the crossfade, and the line looked doubled for a moment: owner, "they transition into something before bending"); the canvas lies over the rings, so a line still flat shows the canvas and never the panels' joins; its ghost trace fades out, and the ring tilts to −7° about its own front line. It turns at 66/87/75/96s a turn (1.5× the first drum's 44/58/50/64, at the owner's asking), front moving left, easing up to pace over 1.2s, and stops only off screen or once the stripes have covered it. While coiling, a ring's panels are laid again every frame (about 80 a ring); closed, only the ring turns. A waiting ring's panels lie flat on its written line at opacity .01 under the canvas, and the drum is put up so as the writing starts, so the pictures are on the GPU before they take over (put up on first sight, they cost a frame). **The drum can be taken in the hand, as the About cards can** (owner's asking, 2026-09-29: "move them like how I move my cards"; a fine pointer only, once a ring has closed; `cursor: grab`). A mouse over it leans it toward the pointer, eased a tenth a frame as the cards' tilt is: the side under the pointer goes back (`rotateX` up to `LEAN_X` 5°, about the drum's own axis, `transform-origin` z −R) and the eye swings round with it (`perspective-origin` up to `LEAN_O` .12 of the block's width). Grabbed, the closed rings turn 1:1 with the hand, each on its own spring after it (`KS` .16/.12/.095/.075, top tightest, damping .8, after the cards' k .06 and .82), so they twist a little and settle, and their own turn holds while held; let go, the hand's speed carries on and runs down (`GLIDE` .94 a frame; a hand still for 90ms throws nothing), then each ring eases back up to its own pace. Measured: a 290px drag turns it .78 rad, the throw carries it about .7 rad more and settles within a second, 60fps throughout. `index.html?debug` exposes `window.__drum.pose(ring, f, S)` to hold a ring at a moment of its coil, and `release()`. Timing, in screens of scroll: the writing starts .35 before the pin (`LEAD`), as the screen comes up, and takes 1.2 (`PLAY`); the full drum turns for .75 (`SPIN`, .45 until the owner found the stripes came in too fast) before the stripes start (`HOLD` = PLAY − LEAD + SPIN), so the section is about 4 screens tall. Apart from the turn, nothing moves on its own. Each line is lifted .295em in its 1.18 row, because the face keeps .6em of empty ascent over this sentence's ink (measured at 100px: ink .84em over the baseline, .26em under). Without the script or the font, on a narrow screen or with reduced motion it is the finished sentence in gold, still, and nothing pins. Measured at 1440×900: a steady 60fps through the whole section at 400 and 1200px/s of scroll, and while the rings snap and turn. Tried before it on 2026-09-29 and taken off, don't bring back unasked: the same sentence as the two pictures in it (a spring line welling up through a rippling water line, then a mountain of its six words stacked 1-2-3 rising through a ground line; the owner: "nvm lets try step2"); a marquee of the sentence on a flat gold ribbon (#b08a45, white bichig; it replaced "Research ✣ Design ✣ Test" and a vertical-column setting); the sentence on a turning drum of its own (four rings of the clauses A, B, A, B with ✣ between copies, turned by CSS; the rings above are its heir, rolled up from the written lines); that drum shaped as a гал голомт, first as CSS-built 3D iron ("it looks so bad"), then a gold line drawing, then wrapped round the owner's AI render of an iron fire basket ("i dont like it"; the render and its cut-out are in `art/_source/misc/golomt*`; the drum's code is in git history only if committed, else gone). The screen sits just under the bar (`.tz-pin` padding-top `clamp(64px,8vh,80px)`; About's `.ab-wrap` bottom padding 40px). The gold clouds are decoded a screen and a half early, since decoding them on first sight cost one 316ms frame. Made smoother the same day (owner: "make it more smooth"): each stripe is a window with a door that slides up while the ground inside slides down by the same amount (`.tz-s` > `.tz-d` overflow hidden > `.tz-g`), all transforms, so nothing repaints (it was a clip-path that repainted five screens of clouds every frame); each stripe eases in and out of its run (sine; theirs are linear); and with Lenis the transition and the timeline draw in Lenis's own scroll callback, the same frame the page moves, not the next. Measured with trusted wheel events: stripe lag 0px, the ground inside the stripes moves 0px. Then the work in order (below). Removed on 2026-09-29 when the owner picked the timeline over it: a Selected work band after trionn.com (`.tr`: half-screen case panels slid sideways, 0.35px a pixel of scroll, cards rising into line, a Mongol-bichig digit rail, gold clouds held still behind; it took about 10 000px of scroll and showed the same cases, and Playground and the only landing link to work.html went with it). The last copy with it is in the session scratchpad only; git has none. The work in order comes straight after the transition, after designxhand.com/experience's agenda ("Pre-Event / After Hours"; `.tl`, 2026-09-29, the owner's pick of that section's two parts): measured off theirs in headless Chrome, one screen held while a row slides left (theirs 0.9px per pixel of scroll, ours `RATE` 0.5), a thin wavy line along the row (a sine, `AMP` 22px, `PERIOD` 1700px, drawn as an SVG path in the script), one case on it at a time, arriving as designxhand's events do (owner's asking, 2026-09-30: "mine is so dull"): the line is lit behind a reading point at .62 of the screen and dim ahead (`.tl-lit`, a copy of the path in a window whose right edge moves, window and line counter-translated so it is all transforms, a 220px soft edge), and when a case's place reaches that point it gets `.is-in` (off again past .7 on the way back): a gold diamond lights there with a halo (`.tl-node`, a diamond so it isn't Experience's round dot), a hairline drops from it beside the words (`.tl-item::before`, scaleY), and the plaque, name and line rise in 22px, staggered .1s, on CSS transitions; the pictures follow designxhand's stack and micro-motion, measured off theirs (owner's asking, 2026-09-30): two frames per case to the right of its place, the case's cover and its low-fidelity drawing (owner's asking, 2026-09-30: "show their first pic and their low fidelity"; NetPay's and Voice's are the `svg.lofi` drawings of their case pages, captured whole and flattened to `art/work/netpay/lofi.webp` 1600×823 and `art/work/voice/lofi.webp` 1600×1182, originals in `_source/<case>/lofi.png`; OhayoFX and HUB have no low-fi, so they keep two screens each; for a moment the user flows were shown instead, their captures are kept in `_source/<case>/flow-landing.png`), rounded 12px with a gold hairline and a deep shadow, the upper one lifted more (the owner's "give me radius"; designxhand's are square), the low-fi drawings framed at their own proportions and zoomed only 1.04 so the pan barely trims them; sized for a 900px-high screen ( scaled with the screen's height, `K` .78–1.2, from `data-dx/-y/-w/-h`), overlapping, the bigger on top (`data-z`) and crossing the line, the words under the line clear of them (checked along the whole row at four sizes); as a frame crosses the screen it drifts from p to −p (`data-p`, ±25 or ±70) and the picture in it, held at `data-s` 1.2 or 1.25, pans the other way across its room (all of it at 1.2, .6 of it at 1.25, theirs exactly), straight with the scroll; no zoom change, no hover; cases 1100px (or .76 of the screen) apart; 60fps measured at 500 and 1200px/s (no dates since 2026-09-30, at the owner's asking: with them it looked like a second Experience, and the dates are there; HUB's "First UI/UX project" sits under its line, `.tl-note`), a discipline plaque — `.tl-chip`, after designxhand's "Inner Circle" badge at the owner's asking ("use exactly this"); theirs is a PNG with its words baked in, ours is drawn in CSS: scooped corners (four masked circles), brushed gold with a fine brown tooth, engraved dark-bronze serif caps, a flourish drawn for it at each end — the name linking to its case page, a line of copy), two pictures per case (see below for their stack and motion). **It is "Recent work", about the projects, not the companies** (owner's asking, 2026-09-30: "keep Experience and My Work, change them to recent works and focus on project not company"; About's Experience tells where): the four case studies newest first, NetPay V2 (2025–present), Voice mini app (2025), OhayoFX (2024), HUB ("First UI/UX project", its page's own words), and each project's name is the largest thing on the line (`.tl-t`, `clamp(32px,2.8vw,42px)`; it was 30px). Until then it ran oldest first as "From the first project to now", with a big italic chapter heading top left naming where each was made (First project / CSKIT / NetCapital); that heading is gone, don't bring it back. The intro "Recent work" (sub: "Four case studies, the newest first.") sits near the screen's head (`.tl-intro` top `clamp(74px,9.5vh,96px)`), so it shows about 126px of scroll after the transition's stripes close (it was mid-screen, 310px of empty clouds first; owner: "reduce the empty space"); it fades out as it slides off, gone by .36 of a screen. The ground is the transition's gold clouds carried on (the stripes' tile sits on that screen's foot and this screen starts where it ends, so `--tl-cy` is 0 and the grain `--tl-gy` −one screen; no seam at full resolution) and held still. Pinned only on a wide screen with motion allowed (`.tl.is-on`); otherwise a stacked list with the pictures in a row. How I Work and Contact came off the landing on 2026-09-29; the bar (`.onav`) links their own pages. **The first screen** (owner's brief, 2026-09-30, phase 1 of a landing redesign on branch `landing-redesign`): the bar is up from scroll 0 (it used to come down with About) and is first in the document, so Tab reaches it first; under it the labels, centred (left below 640px; below 520px only "Open to work"), and the sound toggle on the right, each in its own row; the chest rests in the band between that row and "Scroll to open" (`measureBand()`/`restRect()`), so no text sits on the painted border; on a portrait screen it rests cropped to the lion medallion (`CROP` .52 of the frame's width) and the dive opens out from there; the footer has 16px sides and stacks on a phone, with "Skip intro" (jumps to #about and takes the focus) in the right corner. A real `<button id="latch" aria-label="Open the chest">` covers the painted hasp (`HASP`, placed from the rest rect by `layout()`, which also sizes the canvas); click, Enter or Space glides to p .56 (`OPEN_AT`, the held-open beat) in 1.8s with Lenis (jumps under reduced motion, goes to About without GSAP); it is disabled once the lid moves. A name tag hung from the latch (a little pass card with Мөрөнгуа and the role, on a gold cord) was tried the same day and came off at the owner's asking ("rmv this"); don't bring it back. Frames load in two goes: f000, then `FIRST` (1, 2, 3 and every seventh), the rest once the page is idle after load or at the first scroll, key, touch or click; `render()` draws the nearest frame below, else above. The separate pages all stay |
| `work.html` | gallery of tiles — each links to a case page |
| `work-netpay.html` | NetPay V2 — the deepest one, 8 sections |
| `work-voice.html` | Voice mini app |
| `work-ohayofx.html` | OhayoFX |
| `work-hub.html` | HUB — NetPay/Voice layout (`.step.wide` + `.annot` rows); four roles in chain order, and its own chain section (`.hb-chainsec`, s02) |
| `playground.html` | Playground — a 3D deck of eight studies, all from media already on the site; its own inline style and script |
| `how-i-work-3d.html` | DRAFT, unlinked — How I Work as an airag runway after scfo.de: one three.js scene (from jsdelivr, the only external script besides GSAP) fixed behind six steps, one viewport each; its own inline style and script. **Paging, at the owner's asking (2026-09-27), is the one exception to native scroll:** on a fine pointer (wider than 760px, no reduced motion) every vertical wheel event is cancelled and one gesture moves one scene on a retargetable minimum-jerk curve (`motion()`: position, speed and acceleration carry over a re-aim, so nothing jolts or creeps; 0.65s a viewport, scfo's is 0.5s easeInOutCubic). Never locked: a gesture mid-glide re-aims it. The wheel reader (`wheel()`) pages once per swipe: a 140ms gap (60ms after a spent tail), an 8px reversal (not within 80ms of a page), Chrome's `WheelEvent.momentum` once it has read true, else a dip-then-rise in px/ms for a new swipe inside the last one's momentum. Scene tops come from offsetTop, never getBoundingClientRect (the `.page` rise transforms the page and left rects 10px off). Tried and removed the same day, don't bring back: a pager that locked until the momentum tail went quiet (swallowed swipes), CSS `scroll-snap-type:y mandatory` (short gestures sprang back), a settle on `scrollend` (two movements per gesture), and a per-frame 10% lerp (double pages, a 5000px/s first-frame jump, a second of creep). The object answers the gesture, not the halfway point: one object on stage spins a full turn (1.6s, owner's pace) toward the next whole turn and is swapped at the half turn; a change mid-spin re-aims, never restarts. The spin starts briskly from rest (punch 8 on theta and x, about 45° in 0.3s), because a gentle start left the words changing before anything turned and read as "change, then spin"; for the same reason the round stand-ins (jar, churn) carry a handle and a stamp so their half of the turn is visible. Each object stands centred in the free half beside the copy (from the 440px copy track's edge + 40px to the screen edge − 24px, measured in remeasure(); the layout is symmetric) and is sized by its own turning radius (measured at mount; a card uses its width) to fit that space: placed at a fixed fraction of the screen, objects sat over the words in windows under ~1100px. It is as large as fits, eased between objects so the swap never jumps in size: one margin for all made the slim pail shrink to 73% in squarer windows. A turntable scene mounts no stand-in (the stand-in pail flashed on reload): step 1's sharp rest frame is preloaded in <head>, a card fades in when its sharp frames decode (only if it is on stage then: a card that faded in at its first swap left the stage empty for half a second), and the turning frames fill in behind it (a missing one borrows its nearest neighbour). At rest nothing moves and nothing is drawn: the idle sway came out at the owner's asking (2026-09-27, "only move when I scroll"); only the churn stand-in's paddle moves on its own, and it shows only if step 3's frames fail. Anything else that moves the page in paging mode (scrollbar, find-in-page, Tab focus, a restored position, a swipe the browser kept) settles onto the nearest scene 250ms after it stops, never while a button is held — as scfo does; gestures never go through it. Pinch-zoomed, the page leaves wheel and keys to the browser. On native scroll (phones, reduced motion) the current step is the copy nearest a reading line (two thirds down on a phone, where the object sits in the top third), and the footer state follows the last words reaching the header. Steps alternate sides (`.hw-step.r`), the object stands in the other half. Below 1600px the index is its dashes only (names on hover/focus): full labels ran into the left copy. `.hw-nav` sits outside `.page` for the same reason as the stage (the rise leaves `.page` transformed, which pins fixed children to it). `?debug` exposes `window.__hw`. A headless-Chrome wheel rig lives in `.claude/scroll-rig/` (see its README). Steps 2, 3 and 6 (хөхүүр, хөхүүр with its бүлүүр, the bowl of airag on its хадаг) are turntable cards, and so is step 1 (the pail full of milk): `frames` on a scene draws the frame for its angle, crossfading neighbours, into a 2D canvas on the page over the stage (`canvas.hw-card`), placed by projecting the pivot and sized at the full device pixel ratio; only its blob shadow is in WebGL (whose 1.5x cap made it read blurry through a texture). At rest it draws from `hi/` with high-quality smoothing; moving frames use low smoothing, because high quality made Chrome build a scaled copy of each frame on first draw (a 245ms stall). Every frame is drawn once after load, six per animation frame, because a first draw mid-spin cost up to 7ms on an M5. A card's world height is `frames.H` (default 2.05); step 3's is 2.604 because its frames are taller by the pole and cut at step 2's pixel scale. Any card is also held under the header (its top 20px below it): step 3 alone comes down, to about 81% of step 2's size, eased like any size change. Between two cards the swap is a 0.3s dissolve instead of a cut: both frames for the angle are drawn into one canvas, the old at 1−t and the new at t with `'lighter'`, so what they share stays solid and only the pole fades. It is two draws a frame; redrawing both cards and copying them cost 5–13ms. No dissolve under reduced motion or to a stand-in. Step 6 is flat and seen from above in its video, so the parts nearest you sit lower than the ground under the bowl: `frames.foot` (.3) is the share of the card below the ground point, which puts the хадаг's body on its shadow at rest (as the pail's base is) with the near tail hanging in front; `place()`, the header fit and the dissolve all align on that ground line. `frames.face` rests it straight on, without the viewing angle the other cards add, because a little way into its turn the video cut the fringe off at the frame edge (so it rests on frame 0 and has one sharp frame). `frames.size` (.85, the owner's call) draws it a little under what fits, since the хадаг filled its half. **Step 1 to 2 is a pour, not a spin** (owner's idea, 2026-09-28), and in paging mode it is **scrubbed by the wheel** (owner's asking, the same day: "pour milk by scrolling, like the chest"): a page down from step 1 starts `scrub` instead of paging, and from then every wheel event moves the pour by its size, over 3.5 viewports of wheel travel (`ZONE`), drawn 0.2s behind the wheel (`LAG`, as the chest's `scrub: 0.5` glides) so a mouse's notches glide; in a trackpad's continuous stream (events under 25ms apart) a pixel counts 1/(1 + speed/1.6px/ms) (`FLING`), so its momentum pours slower than the fingers (owner: "too quick with touchpad"; a swipe now pours about a sixth, a hard flick under a third; a mouse's notches count in full, about 30 for the whole pour); the page scrolls with it, so the words change half way, and it holds wherever the wheel stops. Back up, it pours back. At either end it lets go onto that step (a stray pixel short of an end counts), and the swipe that got there is spent, so its momentum never pages on. A scrub starts only from rest (the last turn done, the pail on stage), never mid-spin. Keys and the index run a scrub on to the end they ask for, drawn at its own lag, then page further if asked; someone else scrolling ends it where they left the page. Up from step 2 is the spin. On native scroll (phones), and from keys and the index, the pour plays by itself: a Kling video in which the pail lifts, the хөхүүр rises in, the pail pours into its neck and rises away, and the camera pushes in on the хөхүүр. `pour` on scene 0 names its frames, their crop of the video (`box`) and the two cards inside it (`from`/`to`: centre x, bottom, height), so its first frame lands on the pail at rest and its last on the хөхүүр at rest (both cards rest straight on, `face`); the framing's scale and anchor ease between the two as it plays (`drawPour`). `turnObj` records which step stands at each whole turn of theta as the spin is aimed; between two whole turns whose steps are a pour's ends, the pour plays instead of the spin, its frame following theta, so it answers the wheel like the spin. It plays going forward only: from step 2 back up to step 1 it is the spin as before (owner's asking, 2026-09-28; `pourSeg` marks the turns that began as a pour), and a change of mind mid-pour rewinds it, before or after the half turn: a turn keeps the mode it began with, so back through a pour it rewinds and back through a spin it spins (setStep's first branch leaves the turn theta is part way through alone). Asked for a further step mid-pour (1→3), the pour lands on step 2 and the spin carries on from there. A pour needs both its cards, or it is the spin at the spin's pace. Its side crosses with it, mid-pour where both objects are small (at the spin's pace the full-size pail sat on step 2's heading), and its size runs straight from the pail's to the хөхүүр's instead of easing to whichever is shown. Turned back against its own speed, it comes round within 1.4s instead of rewinding to its start first. A pour turn takes 2.4 turns' time (`POUR`, 3.8s) while the side still crosses at the spin's pace, and `pace()` plays it partly by the curve's inverse so the milk isn't rushed through the middle of the minimum-jerk turn. Its 193 frames (every frame of the video, for the scrub) load straight after step 1's sharp frame, ahead of every turntable's turning frames, which wait on it (`turningGate`, or 8s): scrolled into within the first seconds, it had still been queued behind ~300 turning frames and the reader saw the old spin. It plays once every frame has decoded and both cards are in; until then the step changes by the spin. The cards' blob shadows fade out while the pour is in the air. Known limit: two quick swipes from step 1 retarget the turn to step 3, which ends the pour where it is and finishes as a spin. Step 1's turntable starts on the pour's first frame, so the handoff is exact; it turns on the way back up and on index jumps. Turntable videos for the other steps: one full turn, 8s, front moving left, white background; the tools that cut them are in `.claude/scroll-rig/video/`. **Step 3 to 4 is the same kind of transition** (`pour` on scene 2, `art/how-i-work/pull/`): the хөхүүр turns and the бүлүүр comes out of its neck and is laid across its front; scrubbed by the wheel the same way. Its video's pole was cut off at the top, so its top is drawn back in above the frame (see art/); it rises far above the sack, so `pour.dip` (.72) shrinks the framing at the top of the pull, about the ground, and the raised pole stays under the header. Step 3 rests straight on (`face`), where the pull starts. Step 4 is a card with one still (the pull's last frame) until it has a turntable, so going up from it the first half of the spin is flat. Step 5 is still a stand-in primitive (`glb` slot per scene) |
| `how-i-work.html` | process page — five steps (design system, usability testing, handoff, mockup code, QA after release) on the scroll runway, one step a stage; its own inline `<style>` and script. In every footer; landing card 02 went to Playground on 2026-09-27 |
| `about.html` | about — pass title card with hanging gerege, Experience timeline, close |
| `contact.html` | contact rows and an Ulaanbaatar clock |

`leaf.css` is the shared base; `work.css` holds everything case-specific and
loads on `work.html` and the five case pages. `about.html` and `contact.html`
load `leaf.css` only and keep their own inline `<style>` — scoped on purpose,
don't move it into `work.css`. `index.html` is self-contained: inline style, no
`leaf.css` (its About copy carries what it needs from it).

**Scripts.** Scrolling is native on every page but the landing. A weighted wheel scroll used to
live in `scroll.js` and came out because it lagged a Mac trackpad's own
momentum; don't bring one back to the interior pages. **The landing is the
exception, at the owner's asking (2026-09-29: "when i scroll i feel dizzy and
things go bit blurry")**: `index.html` runs Lenis 1.3.23 from jsdelivr, the
version trionn.com runs, with its defaults (lerp .1), wheel only (touch, keys
and scrollbar native; ctrl+wheel left to the browser), driven by GSAP's ticker
so the chest's scrub steps with it; off under reduced motion and without the
CDN script. Every scroll the page makes itself goes through `goScroll()`
(Lenis's `scrollTo`). Measured in headless Chrome at 1x on a trackpad-like
flick of 507px: same distance, peak 1 018px/s against native's 3 614, and no
frame-to-frame spike (native jumped 3 614px/s in one frame). At the rig's
default 2x the synthetic wheel reports half its delta, so Lenis looked to move
half as far; that is the emulation, not Lenis. If the owner finds it laggy on
a trackpad, the first thing to try is a higher `lerp` (.15–.2).

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
- `about-motion.js` — `about.html` and About on `index.html` (it runs wherever there is a `.pass-stage`); carries its own scroll listeners. Under the chest the card is far below the fold, so its entrance waits until it is scrolled to, and the tilt waits on the entrance. The Experience years (bichig digits) brighten as their row nears mid-screen but never grow: the scale-up came off at the owner's asking (2026-09-29, "I don't like how it gets bigger").
- Inline: `index.html` (hero; the only page with GSAP 3.12.5 + ScrollTrigger,
  from cdnjs, and it has a no-GSAP path: the shut chest as a title screen over
  the page; plus the bar, the transition with its bichig sentence, and the timeline), `how-i-work.html` (runway),
  `contact.html` (clock), `work-ohayofx.html` (the access counter: visits
  from this browser, in `localStorage`; dashes without it), `playground.html`
  (the 3D deck and its opened view, a `<dialog>`; a plain list without it).

`how-i-work.html` drives its runway from native scroll and must not load
`scroll.js`. Each step is `--band` tall (72vh, in `leaf.css`); tune it by eye
between 65 and 80vh.

**Still owed by the owner** — placeholders, don't invent them: the email,
LinkedIn and Telegram rows on `contact.html` (`data-todo`); NetPay's "Апп үзэх"
`href="#"`; four placeholder `hero.svg` tiles on `work.html` (wanted: 4:5 WebP, about
1040×1300). There are no og tags yet; they wait on the production domain.

## Conventions worth knowing

**Gold is matte** (owner's asking, 2026-09-29: the gradient gold "is too AI-like",
"more matte"). `--ab-gold` is #c4a464, a matte yellow gold (the old #d8ad5c's hue, flatter;
#c9976b, the hero's tan `--gold`, was tried first and read as not yellow), and
`--ab-gold-hi` #d8c297, on `index.html`, `about.html` and `contact.html` alike,
with every gold hairline and the хана tile in the same rgb(196,164,100). No
gold gradients clipped to text (the band heading is flat gold, Contact's title
flat ivory, the timeline's years flat gold), no gold glows
(the timeline's line and lit dots, the rail's mark), and Contact's round button
is a flat disc. The pass card's foil spine keeps its leaf gradient: it is gold
leaf on paper, not type. The timeline's plaques (`.tl-chip`) are brushed gold too, at the owner's asking: metal objects, not gold type. At 10.5px, #c4a464 sits near 8.8:1 on black.

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

**Language.** `<html lang>` says which way a page runs. NetPay, Voice, HUB,
About and Contact are `lang="mn"`: body copy is Mongolian, and English section
headings and hero titles carry `lang="en"` so screen readers switch voices.
`index`, `work`, `how-i-work`, OhayoFX and Playground are `lang="en"`, and any
Mongolian inside them is marked `lang="mn"` (how-i-work's labels, OhayoFX's
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
NetPay's `#202b37`. About and Contact carry `case-dark` as well but don't load
`work.css`, so nothing keyed to it reaches them. Change these four and the whole page turns together; do
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

Noto Sans Mongolian loads only on `about.html`, `how-i-work.html` and `index.html`, as a
`text=` subset of the ten traditional digits U+1810–1819; on `index.html` the subset
also holds every character of the transition's bichig sentence (letters, the vowel
separator U+180E, ᠂ and ᠃). Google's text subset keeps the joining forms: the sentence
measured the same set in it as in the full font. A new traditional-script character
has to be added, URL-encoded, to `text=` on the page that uses it, or it falls
through to another font.

Body text on `use-gip` pages (NetPay, Voice, HUB) is GIP; About and Contact
name it directly on their reading text instead of using the class. GIP ships
five files: Light, Regular, Medium, SemiBold (300–600) and RegularItalic.
Nothing above 600 exists, so don't ask GIP for 700 — it comes out
synthesised. The other italic cuts are in `art/_source/fonts/gip/`.

**Images.** Every `<img>` carries intrinsic `width`/`height`. Without them the
page reflows for seconds after load and deep links land thousands of pixels
off. Keep doing this.

Any CSS rule that sizes an image by `width` + `aspect-ratio` also sets
`height:auto`; otherwise the height attribute beats the aspect ratio and the
image stretches (a 1600×2000 gallery tile would render 2000px tall).

Below the fold, `loading="lazy"`. Above-the-fold heroes are eager with
`fetchpriority="high"`: the NetPay and Voice covers, the OhayoFX landing, the
the how-i-work masthead and the Playground's first card. The top tile of each column on
`work.html` is eager too, and so are the four `.shot-img` on how-i-work,
because their off-screen track would defer them. HUB's four
phones under the title (`.hb-fan`) are eager without a priority.

Content rasters are WebP, most at their original pixel size (HUB's phone
captures are halved to 750px wide; `khadag`, `netcapital-building` and `gerege`
are cut down). Voice's ten phone captures ship twice, `-480` and `-900`, in a
`srcset`: a Voice screen never renders past ~226px, so 480 covers 2x (3x on a
phone) and the 900 is there for zoom; the 900s alone were decoding four times
the pixels shown. Encoding: `cwebp -m 4 -q 85 -sharp_yuv` for photos and screens,
`-near_lossless 60` or `-lossless` for design-system sheets. The original goes
to `art/_source/<case>/` (`netpay/`, `voice/`, `ohayo/`, `hub/`, `smileline/`;
`misc/` for `art/site/`, `about/` for `art/about/`). Left as-is on purpose:
`voice/system/{mark,nav-icons}.png`, `hub/sitemap.png`, `site/cloud-bg.jpg`,
`site/masthead.jpg` (fallback behind `masthead.avif`) and `netpay/cover.jpg`
(fallback in a `<picture>` of `cover-1100.webp` / `cover-2200.webp`).

The NetPay and Voice covers ride up over a pinned title —
`.hero-stack` plus `position:sticky` in `work.css`, no JS, static under
reduced motion. HUB shares NetPay's hero rules (eyebrow, title,
`.hero-desc`, spec row); its selectors sit in the same lists. Both are
16:10. NetPay's is a finished photo (4:3 file, cropped by CSS). Voice's is a
render of the phone on ribbed black (`voice/cover-{1100,2200}.webp`, exported
already 16:10 from `_source/voice/Purple Gradient Smartphone Mockup on Textured
Black.png`), with two still overlays on one ellipse fitted to the phone: a
spotlight on `.hero-plate::after` and a masked blurred copy (depth of field)
on `::before`, both eased with smootherstep over many stops — fewer stops
show a halo ring. A new cover means refitting that ellipse to where its phone
sits. Both plates must stay opaque in the middle, or the title shows through.
Earlier Voice covers are kept in `_source/voice/` (`cover-studio-*`,
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
  `masthead.avif` + `masthead.jpg` (how-i-work only), and `cloud-gold.webp`
  (the landing's transition stripes and timeline ground, 1600px lossless,
  149KB). **Served**, ~917KB
- `art/steps/` — the 4 SVG step pictures on `how-i-work.html` (the other 8 are in `art/_source/misc/steps-archive/`). **Served**,
  ~76KB
- `art/about/` — `gerege.webp`, `hee.svg`. **Served**, ~136KB
- `art/how-i-work/<object>/` — turntable frames for `how-i-work-3d.html`:
  one even 360° turn as transparent WebP, `f000.webp`…, built in a template
  literal (`F.dir + 'f' + pad + '.webp'`). `pail-milk/` is step 1 now: 144
  frames 478×600 + `hi/` f000 1010×1268 (~6.2MB), from
  `art/_source/how-i-work/step 1 milk.mp4`, whose first frame is the pour's.
  Cut by `extract1n.html`/`export1n.py` with the pour's key (plus small shine
  specks shut inside, the rivets, kept solid); timed by the staves' texture
  (`plan1n.py`); held on the body, since a round tub's outline is centred on
  its axis (it wandered ±20px and 24px up and down). The box runs from the
  rope standing up mid-turn to the base, so `H` is 2.19 and the pail keeps
  its size; the pour's `from` is that box in the video.
  `pour/` is the step 1→2 pour: 193 frames, 648×720 (~7.3MB, q .80), every
  frame of `art/_source/how-i-work/step 1-2 pour.mp4` cropped to x 80–1376,
  cut by `extractp.html`/`exportp.py`: keyed off the white, plus the milk by
  its warmth (ivory's blue dips below its red and green; paper's never does),
  the milk's white core by closing that mask, and near-white milk shut inside
  the pail by an edge flood that keeps enclosed patches only if they are warm
  (the paper under the rope's arc is not). The floor's shadow under the lifting pail is keyed out in its first 35 frames (grey below each column's lowest coloured pixel), since the card keeps its own blob. The frame's edges fade, 40px where
  the objects stand at rest and 240px while the camera moves and they cross
  them. `pull/` is the step 3→4 pull: 193
  frames, 563×966 (~7.5MB), every frame of `art/_source/how-i-work/step 3-4
  pull.mp4`, box x 60–1400, y −860–1440: the pole's top, cut off by the
  video's first frame, is drawn back in above it (`extractpull.html`, step 3's
  method with a length per frame from `planpull.json`: step 3's 328 rows while
  the sack turns, up to 839 as the head comes out of the neck, back to 0 by the
  time the pole's own top comes into the frame). `khokhuur-rest/` is step 4's
  still: the pull's last frame, 587×600 + `hi/` 1330×1360. The start and end
  frames made for regenerating it with room above are
  `art/_source/how-i-work/step 3-4 start.png` / `end.png`. The old pail (below) is archived, unserved, in
  `art/_source/how-i-work/archive/pail-v1-frames/`. It was step 1: 144 frames,
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
  still it was made from is `art/_source/how-i-work/step 6 still.png`. Originals in
  `art/_source/how-i-work/`. **Served**
- `art/work/<case>/` — one folder per case study: `netpay/`, `voice/`,
  `ohayofx/`, `hub/`, `smileline/`. Design-system sheets live in
  `netpay/system/` and `voice/system/`. Filenames carry no case prefix — the
  folder is the prefix (`art/work/netpay/hero.svg`). **Served**, ~16MB
- `art/_source/` — originals, exports, screen recordings, the rasters the WebPs
  replaced. **Never served**, ~427MB, gitignored. Contains a file over GitHub's
  100MB limit.

Sizes are `du -sh`. Before moving anything in `art/`, grep the HTML, CSS and JS
for the path. Every served file is referenced and every reference resolves:
199 distinct paths (194 under `art/`, 5 under `fonts/`) for 199 files (the two newest: the landing's low-fi pictures), plus the turntable and pour frames under `art/how-i-work/`, 992 now (145 for step 1, 193 for the pour, 157 each for steps 2 and 3, 193 for the pull, 2 for step 4, 145 for step 6), referenced only by the draft `how-i-work-3d.html`. SmileLine was taken off the site on 2026-09-27; its page and art are kept in `art/_source/smileline/archive/`. There
are no orphans, so a file that nothing references is a bug, not spare stock.

Count with a script, not a grep for `src=`/`url(`, which misses three things:
`index.html` builds its frame paths in a template literal
(`art/hero/${SET}/f${pad(i)}.avif`, both sets), `how-i-work-3d.html` does the
same for its turntable frames (`art/how-i-work/<object>/f000.webp`…), and
`how-i-work.html` points at the step icons with `data-img=`. Include `srcset` candidates, and skip
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
  `art/_source/`, `*.log` and `.DS_Store` out of the deploy. `outputDirectory`
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
