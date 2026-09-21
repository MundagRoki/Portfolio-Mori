# Portfolio — chest opening hero

Scroll-driven hero: the painted chest opens, the camera pushes into the dark
interior, everything goes black, the categories appear.

## Running it

Needs a real HTTP server — `file://` won't work, because the browser refuses
to decode the AVIF frames without proper MIME types.

```bash
python3 serve.py
```

Then open <http://localhost:4173>. Any static server works; `serve.py` just
sets `image/avif` correctly, which `python -m http.server` does not.

## Reviewing it

A dev HUD sits bottom-left: phase, scroll %, and five jump buttons.

- `P` — play the whole thing on a 6.5s timer, no scrolling. Best way to judge pacing.
- `D` — hide the HUD
- `R` — back to the top
- `__tl.progress(0.6)` in the console scrubs to any point

## How it works

Not a video. Scroll-scrubbed `<video>` seeks badly on mobile Safari, so the
opening is a **36-frame AVIF sequence drawn to a canvas**, and the push-in is a
**true crop of one 4K still** rather than a CSS upscale.

| Scroll | Phase |
|---|---|
| 0–8%    | Closed. Hero copy over the painted panel. |
| 8–52%   | The 36 frames play — the front board drops forward, dark interior opens. |
| 52–58%  | Held open. A beat of stillness before the push. |
| 58–88%  | Camera pushes into the opening, sampling the 4K still at full resolution. |
| 70–86%  | Blackout fades in over the tail of the push. |
| 86–100% | Categories stagger in on black. |

The swap from sequence to 4K still happens at 58%. Both are the same moment in
the source video, so it's invisible — but it means the zoom stays sharp instead
of upscaling a smaller frame.

## Tuning knobs

Top of the `<script>`:

```js
const N       = 36;        // frames in frames/
const FRAME_W = 2304;      // native width of those frames
const FIT     = 'contain'; // 'contain' = whole chest centred; 'cover' = full-bleed
const F0=0.08, F1=0.52;    // scroll window that plays the opening
const Z0=0.58, Z1=0.88;    // scroll window that pushes in
const ZOOM    = 2.4;       // how far the push travels
const TX=0.503, TY=0.306;  // centre of the dark opening, as a fraction of the frame
```

`TX/TY` was measured, not guessed — it's the darkest window in the open frame
(~7% luminance), so the push lands in shadow rather than on lit wood.

Also worth touching:

- `.track { height: 460vh }` — total scroll distance. Lower = faster.
- `scrub: 0.5` — how far the animation lags the scroll. `true` = locked 1:1.
- The blackout at timeline position `70` — start it earlier for a harder cut.

## Regenerating the frames

Source: `AI Videos from Text & Image (1).mp4` (3832×2164, 24fps, 6.04s).
The first second is a static hold, so extraction starts at 1.00s.

Frames were cut with a small Swift/AVFoundation tool (no ffmpeg on this machine).
To make them lighter, drop the quality or the count — currently 44 frames at
1600px wide, AVIF q0.50, ~145KB each:

- 32 frames @ 2048px q0.45 → about 5MB
- 36 frames @ 2304px q0.48 → 7.9MB (current)
- 36 frames @ 2560px q0.50 → about 9MB, if you want more still

Resolution is limited by the source: the video is 3832×2164, so 2304 uses 60%
of it. Going higher is possible but costs download *and* memory — 36 decoded
frames at 2304 already hold roughly 430MB of bitmap.

AVIF matters a lot here: the same frames as JPEG were **68MB**, because the
crazed-paint texture is JPEG's worst case. AVIF q0.50 is ~5× smaller with no
visible loss at this scale.

## Assets

| File | Size | Role |
|---|---|---|
| `frames/f000–f035.avif` | 7.9MB | the opening sequence, 2304×1300 |
| `open-hires.avif` | 383KB | 4K final frame, sampled during the push-in |
| `poster.jpg` | 419KB | fallback if AVIF can't decode |
| `chest.m4a` | 81KB | the opening sound, lifted from the source video |

## Fit

`FIT = 'contain'` shows the whole chest, centred, with black above and below.
`'cover'` fills the viewport and crops the sides. Contain also magnifies less,
so it looks slightly sharper for free.

During the push-in the destination rect grows from the letterboxed frame to
full bleed, so the black bars open out as you dive in rather than staying put.

## Sound

`chest.m4a` is the audio track lifted from the source video (1.00–6.04s, to
match the frame range).

It sits behind a toggle in the top-right, and that isn't a style choice —
**browsers block audio until a real user gesture, and scrolling doesn't count.**
Autoplaying it is not possible; the button is the gesture.

Once armed, the clip plays **once at its natural rate** when the opening
starts, and resets if you scroll back above it. It is deliberately *not*
scrubbed to scroll position — audio dragged back and forth by a scroll wheel
sounds awful.

`serve.py` also has to map `.m4a` to `audio/mp4`; Python's default is
`audio/mp4a-latm`, which browsers refuse to play.

## Two traps worth knowing about

Both of these cost real debugging time. If you re-cut the frames, don't undo them.

**1. AVIF frames must have EVEN dimensions.**
AVIF uses 4:2:0 chroma subsampling, which requires even width and height. An
odd dimension produces a file that looks completely fine — it loads, reports
correct dimensions, `decode()` resolves — but `ctx.drawImage()` silently draws
**nothing**, leaving the previous frame on the canvas. No error, no warning.

The first cut at 2048px computed a height of 1157 (odd) and the whole canvas
went black. 2048×1156 works. The frame extractor now snaps both dimensions to
even; keep that if you change the width.

**2. `onload` does not mean decoded.**
An `<img>` fires `onload` once the headers parse. The pixels may still be
compressed, and `drawImage` on a not-yet-decoded image draws nothing. The
preloader uses `await img.decode()`, which resolves only when the image is
genuinely drawable.

Don't "optimise" this to `createImageBitmap` — it has no AVIF decoder in every
engine and fails outright on these frames.

## Resolution notes

Frames are 2048px wide and the canvas backing store is **capped to match**
(`FRAME_W`). This matters: a 2048px frame drawn into a 2880px canvas is just an
upscale. Capping the canvas keeps every frame 1:1 and leaves the final upscale
to the compositor, which is smoother and cheaper.

If you raise `FRAME_W`, re-cut the frames at that width too — otherwise you get
softness back, not sharpness. Bump `ASSET_V` whenever you re-cut, or browsers
will keep serving the old frames from memory cache.

`ZOOM` is capped at 2.4 for the same reason. The source is 3832px, so a 2.4×
push samples a 1597px crop — near 1:1 against the 2048px canvas. Pushing to
3.6× samples only 1064px and visibly softens, which is what the first version
did. Push harder than 2.4 only if you also start the blackout earlier to hide it.

## Known gaps

- **Not tuned for mobile.** It runs, but `cover` crops the panel hard on a tall
  narrow screen and the choreography wants different distances. Needs its own pass.
- **`prefers-reduced-motion` only locks the scrub to 1:1.** It should skip
  straight to the open chest and the categories rather than animating at all.
- **7MB of frames** is heavy. There's a loader, and AVIF already cut it 5×, but
  a slow connection will wait. Dropping to 36 frames is the easy win.
- **AVIF needs Safari 16.4+** (March 2023). Older browsers get `poster.jpg` and
  no animation — the categories still work.

---

# Interior pages

`site.css` holds everything shared. The hero keeps its own inline CSS because
none of it is reusable. New category pages: copy `how-i-work.html`, swap the
header label and the content.


## Palette & type (interior pages)

Warm off-white ground, deep coffee-brown text, one warm-sand accent.
Restraint rather than saturation — the brief was "calm, respectful, secret
power", which reads as space and understatement, not ceremonial red.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f5f2ea` | ground |
| `--ink` | `#33241a` | body — coffee brown, never pure black |
| `--accent` | `#c9976b` | **decorative fills only** |
| `--accent-text` | `#9a6b35` | accent-coloured *text* |

**Two accent tokens on purpose.** Sand is 2.3:1 against the ground — fine for
a dot or a rule, unreadable as type. Anything written in the accent uses
`--accent-text` at 4.2:1. Don't merge them.

Type is **Source Serif 4** (display + body) and **Golos Text** (micro-labels
only). Both carry Cyrillic, so a Mongolian-language version needs no font
change. One type scale lives in `:root` — `--t-hero` down to `--t-micro` —
rather than ad-hoc `clamp()` at every call site.

## Ornament (монгол хээ)

Five motifs in `motifs.svg`, each with a job rather than sprinkled for
decoration:

| Motif | | Used for |
|---|---|---|
| **алхан хээ** | hammer meander | the section rules |
| **уулын хээ** | mountain | phase markers |
| **өлзий** | endless knot | the closing seal |
| **үүлэн хээ** | cloud scroll | empty artifact slots |
| **эвэр угалз** | ram's horn | spare, unused so far |

Two rules worth keeping:

**The meander tiles, it never stretches.** It's a CSS `background-repeat:
repeat-x` at a fixed `40px 16px`. The earlier version used an inline SVG with
`preserveAspectRatio="none"`, which squashed the motif to fit the viewport —
distorting a traditional pattern is the fastest way to look cheap.

**The өлзий actually weaves.** The wide loop is drawn whole; the tall loop is
drawn as two arcs with gaps at the top-left and bottom-right crossings, so the
wide one shows through and the two interlace. Drawn as two plain overlapping
rectangles it just reads as a cross. No knockout colour is used, so it works
on any ground.

**Deliberately not used: соёмбо and хас.** The soyombo is the state emblem —
decorative use on a personal site is closer to printing the flag on it than to
ornament. The хас reads as a swastika to Western viewers regardless of its
Buddhist meaning. Both are wrong for a portfolio aimed at international
clients; that's a judgement call, so overrule it if you disagree.

## how-i-work.html

A masthead cut from the chest artwork itself, then the process below on paper.

**The masthead matters more than it looks.** Before it, the page was type on
cream with a large empty placeholder box — nothing reads as designed when most
of it is an empty rectangle. `art/masthead.avif` is a native-4K crop of the
painted panel (two snow lions among cloud scrolls, no lettering), which anchors
the page with a dark mass and ties it to the hero. Served via `<picture>` with
a JPEG fallback.

**The sixteen steps are grouped into four movements.** The review gates already
divide the process naturally, so the page follows that rhythm rather than
listing sixteen flat items. Each movement ends at a gate, rendered as a rule
with the ram's-horn motif — the gates are the argument of the whole page, so
they punctuate it.

The movement names — Understand, Shape, Resolve, Systematise — are mine, not
yours. Rename them; they're a reading of your process, not a fact about it.

### Adding screenshots

The sticky artifact panel is gone, along with the `ART` map — it was a layout
built around images that didn't exist yet, and eight empty boxes looked worse
than none. Put files in `work/` and they can be placed inside the movements,
where each one sits next to the step it belongs to.

Most valuable, in order: wireframe → mid-fi → hi-fi **of the same screen**,
then the haptics spreadsheet.

---|---|---|
| `research` | 02 | Your master prompt, or what it returns |
| `wireframe` | 04 | A userflow plus its first wireframes |
| `midfi` | 07 | The same screen at mid-fidelity |
| `hifi` | 09 | The same screen, finished |
| `system` | 11 | Components, tokens, variants |
| `edge` | 12 | Empty / loading / error / overflow states |
| `spec` | 13 | The haptics + animation handoff sheet |
| `qa` | QA | Figma beside the shipped build |

The three fidelity slots (`wireframe` → `midfi` → `hifi`) are the most
valuable: **use the same screen for all three** so the progression is legible.
That single sequence proves more than the other five combined.
