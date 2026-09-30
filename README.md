# Portfolio

The portfolio of a UI/UX and product designer in Ulaanbaatar: a scroll-driven
landing page where a painted chest opens onto four sections, five case studies,
a process page, About and Contact.

Static site. No build step, no dependencies, no framework — plain HTML, two
stylesheets and a few small scripts. It deploys to Vercel as-is: `vercel.json`
sets no framework plus the cache headers, and `.vercelignore` keeps this
README, `CLAUDE.md`, `serve.py`, every `_source/` and `art/_archive/` out of the deploy.

## Running it

```bash
python3 /Users/mundagroki/Downloads/Work/Portfolio/serve.py
```

Then open <http://localhost:4173> (a port as the first argument, or `PORT`,
overrides it). Use the absolute path: `os.getcwd()` is blocked in the sandbox,
which is why `serve.py` hardcodes `ROOT` and why `python3 serve.py` from a
relative path fails — and why `python -m http.server` dies on startup.

`serve.py` also maps `.m4a` to `audio/mp4` (Python's default,
`audio/mp4a-latm`, is refused by browsers), pins `image/avif`, and sends
`Cache-Control: no-cache`: a plain reload shows your edits, unchanged files
come back as 304s. It has no Range support, so Safari may refuse the videos
locally — judge video on a Vercel preview.

## Pages

| File | Page |
|---|---|
| `index.html` | landing — the chest hero below, then four category links |
| `work.html` | gallery of tiles — each links to a case page |
| `work-netpay.html` | NetPay V2 — the deepest case, 8 sections |
| `work-voice.html` | Voice mini app |
| `work-ohayofx.html` | OhayoFX |
| `work-hub.html` | HUB |
| `playground.html` | Playground |
| `how-i-work.html` | process — a scroll runway of 12 steps |
| `about.html` | pass title card with hanging gerege, Experience timeline, close |
| `contact.html` | contact rows — email, LinkedIn and Telegram are still placeholders |

`leaf.css` is the shared base and `work.css` holds the case pages; About and
Contact keep their own scoped `<style>`. `scroll.js` runs on NetPay and Voice
only, `chart-hover.js` on NetPay, `about-motion.js` on About. The hero, the
how-i-work runway and the Contact clock are inline scripts. Scrolling is native
everywhere.

Conventions — language, theming, fonts, images, the `art/` layout, caching and
`?v` bumps, where the outcome figures come from — are in [CLAUDE.md](CLAUDE.md).
Read it before editing.

## Ornament

**Deliberately not used: соёмбо and хас.** The soyombo is the state emblem —
decorative use on a personal site is closer to printing the flag on it than to
ornament. The хас reads as a swastika to Western viewers regardless of its
Buddhist meaning. Both are wrong for a portfolio aimed at international
clients; that's a judgement call, so overrule it if you disagree.

---

# Landing page: the chest hero

Scroll-driven hero: the painted chest opens, the camera pushes into the dark
interior, everything goes black, the categories appear. It all lives in
`index.html` — inline CSS and one inline script, with GSAP 3.12.5 and
ScrollTrigger from cdnjs.

## Reviewing it

Open `index.html?hud` for a dev HUD bottom-left: phase, scroll %, and five jump
buttons. Without the flag it stays hidden and no keys are bound; it also needs
GSAP to have loaded.

- `P` — play the whole thing on a 6.5s timer, no scrolling. Best way to judge pacing.
- `D` — hide the HUD
- `R` — back to the top
- `__tl.progress(0.6)` in the console scrubs to any point (`__tl` exists only
  at `?hud`; the canvas follows too, because the frames are driven from the
  timeline's `onUpdate`)

Keys are ignored while Cmd/Ctrl/Alt is held, so browser shortcuts still work.

## How it works

Not a video. Scroll-scrubbed `<video>` seeks badly on mobile Safari, so the
opening is a **36-frame AVIF sequence drawn to a canvas**, and the push-in is a
**true crop of one 4K still** rather than a CSS upscale.

A GSAP timeline scrubs over `.track` with `scrub: 0.5`, and the canvas redraws
from the timeline's own `onUpdate`, so the frames glide with the DOM tweens
instead of stepping with each wheel notch.

| Scroll | Phase |
|---|---|
| 0–8%    | Closed. The hero copy fades out by ~11%. |
| 8–52%   | The 36 frames play — the front board drops forward, dark interior opens. |
| 52–58%  | Held open. A beat of stillness before the push. |
| 58–88%  | Camera pushes into the opening, sampling the 4K still at full resolution. |
| 66–81%  | Blackout fades in over the tail of the push. |
| 81–96%  | Categories fade in on black, the four links staggered; clickable from 90%. |
| 96–100% | Hold. |

`F0…Z1` are fractions of the scroll, but the DOM tweens sit at timeline
positions — blackout at `70`, categories at `86`/`88` — on a timeline 106.6
units long (the last link lands at 102.6, then a 4-unit hold). So position 70
is 66% of the way down, not 70%. Adding a category or changing the stagger
lengthens the timeline and moves the blackout and categories earlier against
the frames.

The swap from sequence to 4K still happens at 58%. Both are the same moment in
the source video, so it's invisible — but it means the zoom stays sharp instead
of upscaling a smaller frame.

**Loading.** The loader lifts as soon as `f000` decodes. Then `FIRST` decodes
(f001–f003 and every seventh frame, about 2MB on desktop), and the rest wait
until the page is idle after load, or the first scroll, key, touch or click;
four decode at a time. Until they are in, `render()` draws
the nearest decoded frame below the one the scroll wants (or above, if nothing
below is in yet), so the chest can lag while loading but never blanks. Once every worker is done, a
frame that failed borrows its nearest neighbour, and `open-hires.avif` starts
loading — it is only needed from 58%, and until it arrives the push crops the
current frame. If `f000` won't decode, `poster.jpg` stands in for it.

**Phones.** `innerWidth <= 600` at load picks `art/hero/frames-1152/` instead
of `frames/`, and `FRAME_W` follows the set. It is decided once; a resize
across 600 keeps the first choice. A 390px phone at DPR 2 draws a canvas only
780px wide, so the 1152 cut still covers it, at 2.3MB instead of 7.9MB.

**Reduced motion.** Only `f000` and `f035` are fetched, the scrub locks 1:1,
the chest hard-cuts from shut to open at 30% (`(F0+F1)/2`), there is no push-in
and `open-hires.avif` is never loaded. The blackout and categories still fade
in with the scroll, and the sound fires at the cut.

**No GSAP.** If cdnjs fails, the page becomes the one screen the scroll would
have ended on: the categories on black, only `f000` fetched, the scroll hint
and sound toggle hidden.

## Tuning knobs

Top of the `<script>`:

```js
const N       = 36;          // frames in each set
const SMALL   = innerWidth <= 600;
const SET     = SMALL ? 'frames-1152' : 'frames';   // folder under art/hero/
const FRAME_W = SMALL ? 1152 : 2304;                // native width of that set
const ASSET_V = '4';         // bump when you re-cut the frames (see Caching)
const FIT     = 'contain';   // 'contain' = whole chest, centred; 'cover' = full-bleed
const F0=0.08, F1=0.52;      // scroll window that plays the opening
const Z0=0.58, Z1=0.88;      // scroll window that pushes in
const ZOOM    = 2.4;         // how far the push travels
const TX=0.503, TY=0.306;    // centre of the dark opening, as a fraction of the frame
```

`TX/TY` was measured, not guessed — it sits in the darkest part of the opening
(about 7% luma in `f035`), so the push lands in shadow rather than on lit wood.

Also worth touching:

- `.track { height: 460vh }` — total scroll distance. Lower = faster.
- `scrub: 0.5` — how far the animation lags the scroll. `true` = locked 1:1
  (what reduced motion uses).
- The blackout at timeline position `70` — start it earlier for a harder cut.

Frame paths are built in a template literal,
`` `art/hero/${SET}/f${pad(i)}.avif?v=${ASSET_V}` ``, so a grep for a frame
filename finds only the two `f000` preloads.

## Caching

`vercel.json` serves `art/hero/*` as `immutable` for a year. That is safe only
because every hero URL carries a `?v`: the frames, `poster.jpg` and
`open-hires.avif` take `ASSET_V`, and `chest.m4a` has its own `?v` on the
`<audio>` tag. When you re-cut, bump `ASSET_V` **together with the `?v` on both
`f000` `<link rel=preload>` lines** in `<head>` — one per set, split by the same
600px media query. A mismatch downloads `f000` twice. Replace the sound and
bump its `?v`.

## Regenerating the frames

Source: `~/Downloads/AI Videos from Text & Image (1).mp4` (3832×2164, 6.04s),
outside the repo. The first second is a static hold, so extraction starts at
1.00s.

The 2304 set was cut with a small Swift/AVFoundation tool (no ffmpeg on this
machine); the tool is not in the repo. To make the frames lighter, drop the
quality or the count.

Resolution is limited by the source: 2304 uses 60% of its width. Going higher
is possible but costs download *and* memory — 36 decoded frames at 2304×1300
already hold roughly 430MB of bitmap (the 1152 set, about 110MB).

AVIF matters a lot here: the crazed-paint texture is JPEG's worst case, and the
same frame as a q80 JPEG is 3.5–5× the size.

The 1152 set is derived from the 2304 set, so re-cut that first. With libavif
1.4.2 and `sips` on this machine, this reproduces the current `frames-1152/`
byte for byte in about 25s:

```bash
cd /Users/mundagroki/Downloads/Work/Portfolio/art/hero
t=$(mktemp -d)
for f in frames/f*.avif; do
  n=$(basename "$f" .avif)
  avifdec "$f" "$t/$n.png"
  sips --resampleWidth 1152 "$t/$n.png" --out "$t/$n.png"
  avifenc -s 8 -q 50 -y 420 -r full --cicp 2/2/6 --ignore-icc "$t/$n.png" "frames-1152/$n.avif"
done
```

`-r full --cicp 2/2/6` matches the colour signalling of the 2304 set. Then
bump `ASSET_V` and both preload `?v`s.

## Assets

| File | Size | Role |
|---|---|---|
| `art/hero/frames/f000–f035.avif` | 7.9MB | the opening sequence, 2304×1300 |
| `art/hero/frames-1152/f000–f035.avif` | 2.3MB | the same at 1152×650, for viewports ≤ 600px |
| `art/hero/open-hires.avif` | 383KB | 3832×2164 final frame, sampled during the push-in |
| `art/hero/poster.jpg` | 419KB | 1600×904, stands in for `f000` if AVIF can't decode |
| `art/hero/chest.m4a` | 81KB | the opening sound, lifted from the source video |

## Fit

`FIT = 'contain'` shows the whole chest, centred, with black above and below.
`'cover'` fills the viewport and crops the sides. Contain also magnifies less,
so it looks slightly sharper for free.

During the push-in the destination rect grows from the letterboxed frame to
full bleed, so the black bars open out as you dive in rather than staying put.

## Sound

`art/hero/chest.m4a` is the audio track lifted from the source video
(1.00–6.04s, to match the frame range).

It sits behind a toggle in the top-right, and that isn't a style choice —
**browsers block audio until a real user gesture, and scrolling doesn't count.**
Autoplaying it is not possible; the button is the gesture. The `<audio>` is
`preload="none"`, so the clip is not fetched until that click's `play()`.

Once armed, the clip plays **once at its natural rate** when the opening
starts, and resets if you scroll back above it. It is deliberately *not*
scrubbed to scroll position — audio dragged back and forth by a scroll wheel
sounds awful.

## Two traps worth knowing about

Both of these cost real debugging time. If you re-cut the frames, don't undo them.

**1. AVIF frames must have EVEN dimensions.**
AVIF uses 4:2:0 chroma subsampling, which requires even width and height. An
odd dimension produces a file that looks completely fine — it loads, reports
correct dimensions, `decode()` resolves — but `ctx.drawImage()` silently draws
**nothing**, leaving the previous frame on the canvas. No error, no warning.

The first cut at 2048px computed a height of 1157 (odd) and the whole canvas
went black. 2048×1156 works. Both current sets are even — 1152×650 is exactly
half of 2304×1300 — but `sips --resampleWidth` picks the height for you, so
check it at any other width (1200 would give 677).

**2. `onload` does not mean decoded.**
An `<img>` fires `onload` once the file has downloaded and its headers parse. The pixels may still be
compressed, and `drawImage` on a not-yet-decoded image draws nothing. The
preloader uses `await img.decode()`, which resolves only when the image is
genuinely drawable.

Don't "optimise" this to `createImageBitmap` — it has no AVIF decoder in every
engine and fails outright on these frames.

## Resolution notes

The canvas backing store is **capped to `FRAME_W`** (and DPR to 2). This
matters: a 2304px frame drawn into a 2880px canvas is just an upscale. Capping
the canvas keeps every frame 1:1 and leaves the final upscale to the
compositor, which is smoother and cheaper.

If you raise `FRAME_W`, re-cut the frames at that width too — otherwise you get
softness back, not sharpness.

`ZOOM` is capped at 2.4 for the same reason. The source is 3832px wide, so on a
16:9 screen a 2.4× push samples a ~1600px crop — at most a 1.4× stretch on a
2304px canvas, and the blackout is already opaque by the time the push is 94%
done. The first version pushed 3.6×, sampling only 1064px, and visibly
softened. Push harder than 2.4 only if you also start the blackout earlier to
hide it.

## Known gaps

- **Phones get lighter frames, not their own choreography.** With `contain`, a
  tall narrow screen shows the chest as a band between black bars until the
  push-in opens it out, and the distances are the desktop ones. Needs its own pass.
- **A background tab waits.** `img.decode()` doesn't resolve while the tab is
  hidden, so a page opened in a background tab keeps its loader up until it is
  shown.
- **No AVIF, no opening.** A browser that can't decode AVIF gets `poster.jpg`
  in place of every frame, so the chest never opens — the push-in and the
  categories still work.
