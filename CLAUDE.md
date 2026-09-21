# Portfolio site

Static site. No build step, no dependencies, no framework — plain HTML, two
stylesheets and one script. Edit a file and reload.

## Running it

```bash
python3 "/Users/mundagroki/Downloads/Work/Portfolio Website/serve.py"
```

Serves on `http://localhost:4173`. Use the absolute path: `os.getcwd()` is
blocked in the sandbox, which is why `serve.py` hardcodes `ROOT` and why
`python3 serve.py` from a relative path fails.

`.claude/launch.json` only *attaches* to that URL; it does not start the
server. A managed server does not work here — the preview sandbox cannot read
files under `~/Downloads` (macOS TCC), so the server has to be started by hand.
If every path suddenly 404s, the server has gone stale: kill it and restart.

## Pages

| File | Case study |
|---|---|
| `index.html` | landing |
| `work.html` | gallery of tiles — each links to a case page |
| `work-netpay.html` | NetPay V2 — the deepest one, 12 sections |
| `work-voice.html` | Voice mini app |
| `work-ohayofx.html` | OhayoFX |
| `work-hub.html` | HUB |
| `work-brandbook.html` | SmileLine |
| `work-baaska.html` | stub, **unlinked** from the gallery on purpose |
| `how-i-work.html` | process page |

`leaf.css` is the shared base; `work.css` holds everything case-specific.
`chart-hover.js` runs only on NetPay.

## Conventions worth knowing

**Language.** Body copy is Mongolian; section headings and the hero title stay
English and carry `lang="en"` so screen readers switch voices. OhayoFX is the
exception and runs the other way round — the page is English with one Mongolian
block marked `lang="mn"` — because most of its text is English and Japanese.

**Case-page theming** is driven by four custom properties, declared per page
family and read by every panel on it:

```
--glass       panel fill
--glass-veil  backdrop-filter (or `none`)
--glass-hi    inset top hairline
--glass-lift  drop shadow
```

NetPay's live in `body.case-dark:not(.case-voice)`. The `:not()` matters —
Voice is also `case-dark` but keeps the original glass recipe. Change these
four and the whole page turns together; do not restyle panels individually.

Voice has no `.dark` wrapper, so it redeclares the `--np-*` and `--c-axis`
tokens on `body.case-voice`. If a component looks unstyled there, it is
probably reading a token only declared on `.dark`.

**Fonts.** `--f-label` is Golos Text, loaded per page — check the `<link>`
before using a weight, or you get synthesised bold. Body text on pages with
`use-gip` is GIP, which is cut at 300/400/500/600 only; 700 is synthetic.

**Images.** Every `<img>` carries intrinsic `width`/`height` plus
`loading="lazy"`. Without them the page reflows for seconds after load and deep
links land thousands of pixels off. Keep doing this.

Phone screenshots go in `.device` frames, which expect roughly a 1500×3248
ratio. Long scrolling captures use `.device.tall` — a correct-ratio frame whose
contents scroll — because a 1:5 image stretches the frame until it stops
reading as a phone.

## art/

- `art/work/` and four files at `art/` root — **served**, ~25MB
- `art/_source/` — originals, exports, screen recordings. **Never served**,
  389MB, gitignored. Contains files over GitHub's 100MB limit.

Before moving anything in `art/`, grep the HTML and CSS for the path. Exactly
86 files are referenced.

## Data

Outcome figures on NetPay and Voice come from
`~/Downloads/NetPay v1 vs v2 Voice Engagement Sept 18 (1).xlsx`. Two traps:

- The Voice funnel in the workbook mixes sources. `voice_activity_log` starts
  2025-12-02; the quiz table covers 2025-10-27 → 2025-12-21. Counts from the
  two cannot be chained into one funnel, and the page says so.
- NetPay's four-month windows are 2025-05…08 against 2025-10…2026-01. Derived
  rates are recomputed from the raw columns (MAU, total minutes, active
  user-days), never from the workbook's own ratio columns.

Recompute from raw columns and re-verify contrast after changing a panel fill —
the faintest ink sits near the 4.5:1 line at 10.5px.
