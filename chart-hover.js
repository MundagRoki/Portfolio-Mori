/* Outcome charts: draw at the card's measured width, then wire the readout.
   The markup ships a static 480px SVG so the section still reads with no JS;
   this redraws it to fill the column. Drawing at the real pixel width is what
   keeps the type fixed — a percentage-width viewBox would scale the labels
   along with the geometry, which is the thing we are avoiding. */
(function () {
  "use strict";
  var el = document.getElementById("chart-data");
  if (!el) return;
  var DATA; try { DATA = JSON.parse(el.textContent); } catch (e) { return; }
  var NS = "http://www.w3.org/2000/svg";

  function n(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;   // labels go in as text, never markup
    return e;
  }
  var apos = function (v, sep) {
    return Math.round(v).toLocaleString("en-US").replace(/,/g, sep || "'");
  };

  /* NetPay's line is the default: nine months, split into the old build and
     v2 at the release, with a key for each. Voice passes its own — weeks for
     months, no split (one series, with the event marked but not dividing
     it), no key, and a per-point second line for the readout instead of a
     build name. Everything it leaves out falls back to NetPay's. */
  function line(spec, W, TH) {
    var H = Math.max(TH || 0, 250), L = 46, R = 16, T = 26, B = 62;
    /* A sheet pinned to Voice's thirteen-row table would pull the line into a
       tower on a phone. With spec.maxAspect the plot stops growing at that
       multiple of its width and sits centred in the height it was given —
       what the bars already do with slack. */
    var Hp = spec.maxAspect ? Math.min(H, Math.max(250, Math.round(W * spec.maxAspect))) : H;
    T += Math.round((H - Hp) / 2);
    var pw = W - L - R, ph = Hp - 26 - B, v = spec.values, last = v.length - 1;
    var one = spec.split == null, split = one ? 0 : spec.split;
    var labels = spec.labels || spec.months;
    var names = spec.names || ["хуучин 4.x", "шилжилт", "v2 5.x"];
    var sx = function (i) { return L + pw * i / last; };
    var sy = function (y) { return T + ph * (spec.hi - y) / (spec.hi - spec.lo); };
    var g = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img", class: "tchart" });
    g.appendChild(n("title", {}, spec.title));
    spec.ticks.forEach(function (t) {
      var y = sy(t);
      g.appendChild(n("line", { class: "grid", x1: L, y1: y.toFixed(1), x2: W - R, y2: y.toFixed(1) }));
      g.appendChild(n("text", { class: "ytick", x: L - 8, y: (y + 4).toFixed(1) },
        (t / spec.tickDiv).toFixed(spec.tickDec)));
    });
    (spec.xticks || [0, 2, 4, 6, 8]).forEach(function (i) {
      g.appendChild(n("text", { class: "xtick", x: sx(i).toFixed(1), y: T + ph + 40 }, labels[i]));
    });
    if (spec.mark) {
      var xs = sx(spec.markAt != null ? spec.markAt : split);
      g.appendChild(n("line", { class: "mark", x1: xs.toFixed(1), y1: T - 8, x2: xs.toFixed(1), y2: T + ph }));
      g.appendChild(n("text", { class: "mlab", x: xs.toFixed(1), y: T - 11, "text-anchor": "middle" }, spec.mark));
    }
    var pts = function (a, b) {
      var o = []; for (var i = a; i <= b; i++) o.push(sx(i).toFixed(1) + "," + sy(v[i]).toFixed(1));
      return o.join(" ");
    };
    if (!one) g.appendChild(n("polyline", { class: "ln old", points: pts(0, split) }));
    g.appendChild(n("polyline", { class: "ln new", points: pts(split, last) }));
    g.appendChild(n("circle", { class: "dot new", cx: sx(last).toFixed(1), cy: sy(v[last]).toFixed(1), r: 4.5 }));
    (spec.keys || (one ? [] : [[0.4, "old", names[0]], [5.4, "new", names[2]]])).forEach(function (k) {
      var y0 = T + ph + 18, kx = sx(k[0]);
      g.appendChild(n("line", { class: "key " + k[1], x1: kx.toFixed(1), y1: y0 - 4, x2: (kx + 14).toFixed(1), y2: y0 - 4 }));
      g.appendChild(n("text", { class: "slab", x: (kx + 20).toFixed(1), y: y0 }, k[2]));
    });
    g.appendChild(n("line", { class: "cross", x1: 0, y1: T - 8, x2: 0, y2: T + ph, "aria-hidden": "true" }));
    g.appendChild(n("circle", { class: "fdot", cx: 0, cy: 0, r: 5, "aria-hidden": "true" }));
    var hits = n("g", { class: "hits" });
    for (var i = 0; i <= last; i++) {
      var x = sx(i),
          lft = i === 0 ? 0 : (sx(i - 1) + x) / 2,
          rgt = i === last ? W : (x + sx(i + 1)) / 2,
          series = spec.series ? spec.series[i]
            : (i > split ? names[2] : (i === split ? names[1] : names[0])),
          val = (spec.dec ? v[i].toFixed(spec.dec) : apos(v[i], spec.sep)) + spec.unit;
      hits.appendChild(n("rect", {
        class: "hit", x: lft.toFixed(1), y: T - 8, width: (rgt - lft).toFixed(1), height: ph + 8,
        tabindex: "0", role: "img", "aria-label": spec.months[i] + ": " + val + ", " + series,
        "data-x": x.toFixed(1), "data-y": sy(v[i]).toFixed(1), "data-label": spec.months[i],
        "data-value": val, "data-series": series, "data-cls": one || i >= split ? "new" : "old"
      }));
    }
    g.appendChild(hits);
    return g;
  }

  /* Long Cyrillic row labels need a real gutter, not an overlay: at 480px the
     widest of them runs 177px, so a full-width plot put the -5% gridline
     through the middle of the words and let a negative bar run back under
     them. The only honest width is the one the browser reports, so the labels
     are measured in a throwaway SVG parented to the card — parented, because
     the font comes from a custom property further up the tree. */
  function textW(items, cls, host) {
    var s = n("svg", { class: "dchart",
      style: "position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:visible" });
    host.appendChild(s);
    var w = 0;
    items.forEach(function (t) {
      var e = n("text", { class: cls }, t);
      s.appendChild(e);
      w = Math.max(w, e.getBBox().width);
    });
    host.removeChild(s);
    return Math.ceil(w);
  }

  function bars(spec, W, host, TH) {
    var T = 30, B = 14, PAD = 14, MINPLOT = 170;
    var rows = spec.rows;
    /* NetPay's bars are changes, signed, around zero. Voice's are shares of
       one total (spec.share): unsigned, with nothing that can be "flat", and
       each row names its own colour as a fourth field. */
    var share = !!spec.share;
    var fmt = function (v) { return (!share && v > 0 ? "+" : "") + v.toFixed(1) + "%"; };
    var flat = function (v) { return !share && Math.abs(v) < 1; };
    /* "хэвээр" doubles the width of the value column for one row. Where the
       plot can spare it the word stays; where it cannot, the grey already
       says the same thing and the caption spells it out. */
    var vlab = rows.map(function (row) {
      return (flat(row[1]) ? "хэвээр · " : "") + fmt(row[1]);
    });
    var L = textW(rows.map(function (row) { return row[0]; }), "rlab", host) + PAD,
        R = textW(vlab, "vlab", host) + PAD;
    if (W - L - R < MINPLOT) {
      vlab = rows.map(function (row) { return fmt(row[1]); });
      R = textW(vlab, "vlab", host) + PAD;
    }
    /* Sheets in a workbook card share one height, so a three-row chart has to
       fill the height the table set. Rows take the slack up to a point, and
       the bar thickens with them; past that the block stops growing and sits
       centred instead, because a 100px gap between two bars stops reading as
       a chart. */
    var count = rows.length, H = Math.max(TH || 0, T + 38 * count + B),
        avail = H - T - B,
        ROW = Math.min(64, Math.max(38, avail / count)),
        BAR = Math.min(24, Math.max(14, Math.round(ROW * 0.36))),
        r = Math.min(4, BAR / 2),
        top0 = T + Math.max(0, (avail - ROW * count) / 2);
    var pw = W - L - R;
    var sx = function (v) { return L + pw * (v - spec.lo) / (spec.hi - spec.lo); }, z = sx(0);
    var g = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img", class: "dchart" });
    g.appendChild(n("title", {}, spec.title));
    var gTop = top0 - 10, gBot = top0 + ROW * count - 6;
    spec.ticks.forEach(function (t) {
      var x = sx(t);
      g.appendChild(n("line", { class: t === 0 ? "grid zero" : "grid",
        x1: x.toFixed(1), y1: gTop, x2: x.toFixed(1), y2: gBot }));
      g.appendChild(n("text", { class: "xtick", x: x.toFixed(1), y: gTop - 6 },
        t === 0 ? "0" : (!share && t > 0 ? "+" : "") + t + "%"));
    });
    rows.forEach(function (row, i) {
      var name = row[0], v = row[1], top = top0 + i * ROW, cy = top + ROW / 2,
          y = cy - BAR / 2, x = sx(v), ty = (cy + 4.8).toFixed(1), d;
      /* Anything inside +/-1% is a rounding-width sliver: drawn as a bar it
         reads as a rendering fault rather than a value. Below that threshold
         it becomes a neutral marker straddling zero — which is also the
         honest encoding, since the finding there is "did not move". */
      if (flat(v)) {
        g.appendChild(n("rect", { class: "bar flat", "data-row": i, rx: 2,
          x: (z - 3).toFixed(1), y: y, width: 6, height: BAR }));
      } else {
        if (v >= 0) d = "M" + z.toFixed(1) + " " + y + " H" + (x - r).toFixed(1) + " a" + r + " " + r + " 0 0 1 " + r + " " + r + " v" + (BAR - 2 * r) + " a" + r + " " + r + " 0 0 1 -" + r + " " + r + " H" + z.toFixed(1) + " Z";
        else      d = "M" + z.toFixed(1) + " " + y + " H" + (x + r).toFixed(1) + " a" + r + " " + r + " 0 0 0 -" + r + " " + r + " v" + (BAR - 2 * r) + " a" + r + " " + r + " 0 0 0 " + r + " " + r + " H" + z.toFixed(1) + " Z";
        g.appendChild(n("path", { class: "bar " + (row[3] || (v >= 0 ? "up" : "down")), "data-row": i, d: d }));
      }
      g.appendChild(n("text", { class: "rlab", x: L - PAD, y: ty }, name));
      g.appendChild(n("text", { class: "vlab" + (flat(v) ? " flat" : ""), x: W, y: ty }, vlab[i]));
    });
    var hits = n("g", { class: "hits" });
    rows.forEach(function (row, i) {
      var top = top0 + i * ROW;
      hits.appendChild(n("rect", {
        class: "hit", x: 0, y: top.toFixed(1), width: W, height: ROW.toFixed(1),
        tabindex: "0", role: "img",
        "aria-label": row[0] + ": " + fmt(row[1]) + ", " + row[2],
        "data-row": i, "data-x": sx(row[1]).toFixed(1), "data-y": (top + ROW / 2).toFixed(1),
        "data-label": row[0], "data-value": fmt(row[1]),
        "data-series": row[2], "data-cls": row[3] || (row[1] >= 0 ? "new" : "down")
      }));
    });
    g.appendChild(hits);
    return g;
  }

  /* A trend inside a stat tile. No axes — the tile's number and label already
     say what it is and by how much; this says how it got there. With a split
     the old and new halves wear their own colours and each carries a hairline
     at its window's mean, so the step between the two windows is the thing
     the eye lands on. The range is fixed by the data file, not fitted to the
     wiggle: every tile on a page gets the same ±share around its baseline, so
     a flat metric draws flat and a 10% one draws twice the step of a 5% one. */
  function spark(spec, W) {
    var H = spec.h || 56, L = 5, R = 8, T = 8, B = 8;
    var v = spec.values, last = v.length - 1;
    var one = spec.split == null, split = one ? 0 : spec.split;
    var names = spec.names || ["хуучин 4.x", "шилжилт", "v2 5.x"];
    var sx = function (i) { return L + (W - L - R) * i / last; };
    var sy = function (y) { return T + (H - T - B) * (spec.hi - y) / (spec.hi - spec.lo); };
    var g = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img", class: "tchart spark" });
    g.appendChild(n("title", {}, spec.title));
    if (!one && spec.means) {
      g.appendChild(n("line", { class: "mean old", x1: sx(0).toFixed(1), x2: sx(split).toFixed(1),
        y1: sy(spec.means[0]).toFixed(1), y2: sy(spec.means[0]).toFixed(1) }));
      g.appendChild(n("line", { class: "mean new", x1: sx(split).toFixed(1), x2: sx(last).toFixed(1),
        y1: sy(spec.means[1]).toFixed(1), y2: sy(spec.means[1]).toFixed(1) }));
      g.appendChild(n("line", { class: "mark", x1: sx(split).toFixed(1), x2: sx(split).toFixed(1), y1: 2, y2: H - 2 }));
    }
    var pts = function (a, b) {
      var o = []; for (var i = a; i <= b; i++) o.push(sx(i).toFixed(1) + "," + sy(v[i]).toFixed(1));
      return o.join(" ");
    };
    if (!one) g.appendChild(n("polyline", { class: "ln old", points: pts(0, split) }));
    g.appendChild(n("polyline", { class: "ln new", points: pts(split, last) }));
    g.appendChild(n("circle", { class: "dot new", cx: sx(last).toFixed(1), cy: sy(v[last]).toFixed(1), r: 4 }));
    g.appendChild(n("line", { class: "cross", x1: 0, y1: 2, x2: 0, y2: H - 2, "aria-hidden": "true" }));
    g.appendChild(n("circle", { class: "fdot", cx: 0, cy: 0, r: 5, "aria-hidden": "true" }));
    var hits = n("g", { class: "hits" });
    for (var i = 0; i <= last; i++) {
      var x = sx(i),
          lft = i === 0 ? 0 : (sx(i - 1) + x) / 2,
          rgt = i === last ? W : (x + sx(i + 1)) / 2,
          series = spec.series ? spec.series[i]
            : (i > split ? names[2] : (i === split ? names[1] : names[0])),
          val = (spec.dec ? v[i].toFixed(spec.dec) : apos(v[i], spec.sep)) + spec.unit;
      hits.appendChild(n("rect", {
        class: "hit", x: lft.toFixed(1), y: 0, width: (rgt - lft).toFixed(1), height: H,
        tabindex: "0", role: "img", "aria-label": spec.months[i] + ": " + val + ", " + series,
        "data-x": x.toFixed(1), "data-y": sy(v[i]).toFixed(1), "data-label": spec.months[i],
        "data-value": val, "data-series": series, "data-cls": one || i >= split ? "new" : "old"
      }));
    }
    g.appendChild(hits);
    return g;
  }

  /* Voice's weeks, set against the broadcast. One column a week on one
     baseline, and under it the rounds the show was airing — so a reader sees
     the season's shape and which round each week belonged to without a date
     axis to decode. What the log never saw is drawn as well rather than left
     out: a hatched stub for the weeks before it started, labelled, so the
     chart does not pass the middle of a season off as the whole of it. The
     voting rounds carry their own rule underneath, because that is where the
     numbers do something the text has to answer for. */
  function season(spec, W) {
    var H = spec.h || 250, T = 30, ROWS = 64;
    var STUB = spec.stub ? 78 : 0, SGAP = STUB ? 12 : 0;
    var v = spec.values, count = v.length;
    var x0 = STUB + SGAP, pw = W - x0, slot = pw / count;
    var bw = Math.max(8, Math.min(24, Math.round(slot * .56))), r = 4;
    var y0 = H - ROWS, ph = y0 - T;
    var sy = function (y) { return y0 - ph * y / spec.hi; };
    var cx = function (i) { return x0 + slot * (i + .5); };
    var g = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img", class: "dchart season" });
    g.appendChild(n("title", {}, spec.title));
    if (STUB) {
      var defs = n("defs", {}), pat = n("pattern", { id: "oc-hatch", width: 6, height: 6,
        patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
      pat.appendChild(n("line", { class: "hatch", x1: 0, y1: 0, x2: 0, y2: 6 }));
      defs.appendChild(pat); g.appendChild(defs);
      g.appendChild(n("rect", { class: "stub", x: 0, y: T, width: STUB, height: ph, rx: 4, fill: "url(#oc-hatch)" }));
      g.appendChild(n("text", { class: "stublab", x: (STUB / 2).toFixed(1), y: (T + ph / 2).toFixed(1),
        "text-anchor": "middle" }, spec.stub[0]));
      g.appendChild(n("text", { class: "stublab dim", x: (STUB / 2).toFixed(1), y: (T + ph / 2 + 16).toFixed(1),
        "text-anchor": "middle" }, spec.stub[1]));
    }
    g.appendChild(n("line", { class: "grid zero", x1: x0, y1: y0, x2: W, y2: y0 }));
    var peak = 0;
    v.forEach(function (val, i) { if (val > v[peak]) peak = i; });
    v.forEach(function (val, i) {
      var x = cx(i) - bw / 2, top = sy(val), rr = Math.min(r, (y0 - top) / 2, bw / 2);
      var d = "M" + x.toFixed(1) + " " + y0 + " V" + (top + rr).toFixed(1) +
        " a" + rr + " " + rr + " 0 0 1 " + rr + " " + (-rr) + " H" + (x + bw - rr).toFixed(1) +
        " a" + rr + " " + rr + " 0 0 1 " + rr + " " + rr + " V" + y0 + " Z";
      g.appendChild(n("path", { class: "bar new", "data-row": i, d: d }));
    });
    g.appendChild(n("text", { class: "vlab peak", x: cx(peak).toFixed(1), y: (sy(v[peak]) - 9).toFixed(1),
      "text-anchor": "middle" }, apos(v[peak], spec.sep)));
    /* the rounds: a hairline under the weeks each one spans, its name beneath */
    var bandY = y0 + 12;
    /* a round's short name stands in when its full one would not fit
       under the weeks it spans — about 6.5px a character at this size */
    (spec.bands || []).forEach(function (b) {
      var a = x0 + slot * b[0] + 3, z = x0 + slot * (b[1] + 1) - 3;
      var name = b[3] && b[2].length * 6.5 > z - a ? b[3] : b[2];
      g.appendChild(n("line", { class: "band", x1: a.toFixed(1), x2: z.toFixed(1), y1: bandY, y2: bandY }));
      g.appendChild(n("text", { class: "bandlab", x: ((a + z) / 2).toFixed(1), y: bandY + 17,
        "text-anchor": "middle" }, name));
    });
    if (STUB && spec.stubBand) {
      g.appendChild(n("line", { class: "band", x1: 3, x2: STUB - 3, y1: bandY, y2: bandY }));
      g.appendChild(n("text", { class: "bandlab", x: (STUB / 2).toFixed(1), y: bandY + 17,
        "text-anchor": "middle" }, spec.stubBand));
    }
    if (spec.vote) {
      var va = x0 + slot * spec.vote[0] + 3, vz = x0 + slot * (spec.vote[1] + 1) - 3, vy = y0 + 46;
      g.appendChild(n("line", { class: "vote", x1: va.toFixed(1), x2: vz.toFixed(1), y1: vy, y2: vy }));
      /* ends where the rule ends, so it can only run back over the rounds
         before it, never off the right edge */
      g.appendChild(n("text", { class: "votelab", x: vz.toFixed(1), y: vy + 15, "text-anchor": "end" }, spec.vote[2]));
    }
    var hits = n("g", { class: "hits" });
    v.forEach(function (val, i) {
      var value = apos(val, spec.sep) + spec.unit;
      hits.appendChild(n("rect", {
        class: "hit", x: (x0 + slot * i).toFixed(1), y: T - 8, width: slot.toFixed(1), height: (y0 - T + 8).toFixed(1),
        tabindex: "0", role: "img", "aria-label": spec.labels[i] + ": " + value + ", " + spec.series[i],
        "data-row": i, "data-x": cx(i).toFixed(1), "data-y": sy(val).toFixed(1), "data-label": spec.labels[i],
        "data-value": value, "data-series": spec.series[i], "data-cls": "new"
      }));
    });
    g.appendChild(hits);
    return g;
  }

  function readout(svg, fig, wrap) {
    var cross = svg.querySelector(".cross"), fdot = svg.querySelector(".fdot");
    var tip = fig.querySelector(".ctip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "ctip";
      tip.setAttribute("role", "status");
      tip.setAttribute("aria-live", "polite");
      var l = document.createElement("span"); l.className = "ctip-l";
      var b = document.createElement("b");
      var sWrap = document.createElement("span"); sWrap.className = "ctip-s";
      sWrap.appendChild(document.createElement("i"));
      sWrap.appendChild(document.createElement("span"));
      tip.appendChild(l); tip.appendChild(b); tip.appendChild(sWrap);
      fig.appendChild(tip);
    }
    var lEl = tip.querySelector(".ctip-l"), vEl = tip.querySelector("b"),
        key = tip.querySelector(".ctip-s i"), sTxt = tip.querySelector(".ctip-s span");

    var current = null;
    function show(hit) {
      /* pointermove fires at pointer rate, but the readout depends only on
         which point is under it — the same one again has nothing to redo */
      if (hit === current && tip.classList.contains("on")) return;
      current = hit;
      var x = parseFloat(hit.getAttribute("data-x")), y = parseFloat(hit.getAttribute("data-y"));
      lEl.textContent = hit.getAttribute("data-label");
      vEl.textContent = hit.getAttribute("data-value");
      sTxt.textContent = hit.getAttribute("data-series");
      key.className = "k-" + hit.getAttribute("data-cls");
      /* A readout coming back from hidden must appear where it is wanted, not
         glide in from the last point it sat on — so the first frame of a fresh
         show runs with the travel switched off. */
      var fresh = !tip.classList.contains("on");
      if (fresh) fig.classList.add("ctip-place");
      /* geometry attributes are not reliably transitionable, so the crosshair
         and the dot travel by transform in the plot's own user units */
      if (cross) { cross.style.transform = "translateX(" + x + "px)"; cross.classList.add("on"); }
      if (fdot) {
        fdot.style.transform = "translate(" + x + "px," + y + "px)";
        fdot.setAttribute("class", "fdot on " + hit.getAttribute("data-cls"));
      }
      svg.querySelectorAll(".bar").forEach(function (bar) {
        bar.classList.toggle("lit", bar.getAttribute("data-row") === hit.getAttribute("data-row"));
      });
      var box = svg.getBoundingClientRect(), fb = fig.getBoundingClientRect();
      var k = box.width / svg.viewBox.baseVal.width;
      var px = box.left - fb.left + x * k;
      tip.classList.add("on");
      var half = tip.offsetWidth / 2, h = tip.offsetHeight;
      var left = Math.max(half + 2, Math.min(fig.clientWidth - half - 2, px));

      /* The card holds one height for the whole sweep.

         It used to ride the data point, which meant it climbed and fell with
         every zigzag in the series: on this chart the points sit 47px apart
         across but up to 81px apart down, so a sideways sweep threw the
         readout further vertically than the pointer travelled horizontally.
         Reading it meant tracking a card that was bouncing. The crosshair and
         the dot still sit exactly on the point — that is their whole job —
         and the card, which is text, stays still and only slides across.

         The height is taken from the highest point in the series, so the card
         clears the line everywhere rather than at the point under the pointer.
         Where there is no room above, it sits under the lowest point instead,
         by the same rule. */
      var ys = [];
      svg.querySelectorAll(".hit").forEach(function (o) {
        var v = parseFloat(o.getAttribute("data-y"));
        if (!isNaN(v)) ys.push(v);
      });
      if (!ys.length) ys = [y];
      var top = box.top - fb.top + Math.min.apply(null, ys) * k - h - 14;
      var below = top <= 2;
      if (below) top = box.top - fb.top + Math.max.apply(null, ys) * k + 14;
      tip.classList.toggle("below", below);
      tip.style.transform = "translate(" + (left - half).toFixed(1) + "px,"
        + top.toFixed(1) + "px)";
      if (fresh) { void tip.offsetWidth; fig.classList.remove("ctip-place"); }
    }
    function hide() {
      current = null;
      tip.classList.remove("on");
      if (cross) cross.classList.remove("on");
      if (fdot) fdot.setAttribute("class", "fdot");
      svg.querySelectorAll(".bar.lit").forEach(function (b) { b.classList.remove("lit"); });
    }
    svg.querySelectorAll(".hit").forEach(function (hit) {
      hit.addEventListener("pointerenter", function () { show(hit); });
      hit.addEventListener("pointermove", function () { show(hit); });
      hit.addEventListener("focus", function () { show(hit); });
      hit.addEventListener("blur", hide);
    });
    svg.addEventListener("pointerleave", hide);
    /* The frame outlives every redraw, so it keeps one listener that hides
       whichever readout is current, rather than gaining another on every
       rebuild — each of which held on to the SVG it had replaced. */
    wrap._hide = hide;
    if (!wrap._hideWired) {
      wrap._hideWired = true;
      wrap.addEventListener("scroll", function () { wrap._hide(); }, { passive: true });
    }
  }

  var MINW = 440;   // below this the frame pans rather than cramping the axis
  function draw() {
    document.querySelectorAll(".chartwrap[data-chart], .ocw[data-chart]").forEach(function (wrap) {
      var spec = DATA[wrap.getAttribute("data-chart")];
      if (!spec) return;
      /* a hidden sheet has no width to draw at; select() draws it when shown */
      if (!wrap.clientWidth) return;
      var old = wrap.querySelector("svg");
      var cs = getComputedStyle(wrap);
      var inner = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      /* a tile's trend and the season strip are drawn to whatever width they
         get; only the axis charts refuse to go under MINW */
      var free = spec.type === "spark" || spec.type === "season";
      /* ...except the season strip, whose round names need about 440px to sit
         apart even shortened; under that it pans in its frame like the axis
         charts do */
      var W = Math.round(free ? (spec.type === "season" ? Math.max(440, inner) : inner)
        : Math.max(MINW, inner));
      var TH = +wrap.dataset.h || 0;
      if (old && +old.dataset.w === W && +old.dataset.th === TH) return;   // nothing to redo
      if (old && old.querySelector("title")) spec.title = old.querySelector("title").textContent;
      var svg = spec.type === "line" ? line(spec, W, TH)
        : spec.type === "spark" ? spark(spec, W)
        : spec.type === "season" ? season(spec, W)
        : bars(spec, W, wrap, TH);
      svg.dataset.w = W;
      svg.dataset.th = TH;
      /* pin the box to the drawn width so the viewBox renders 1:1; when the
         card is narrower than MINW the frame scrolls instead of squashing */
      svg.style.width = W + "px";
      if (old) old.replaceWith(svg); else wrap.appendChild(svg);
      readout(svg, wrap.closest(".chartfig"), wrap);
    });
  }
  draw();

  /* Sheet tabs. A hidden sheet has no width, so draw() passes its chart over
     and switching draws it; draw() also no-ops on any chart whose width has
     not changed. The panels are never removed from the DOM — find-in-page
     still reaches the table. */
  function sheets() {
    document.querySelectorAll(".cbook").forEach(function (book) {
      var tabs = [].slice.call(book.querySelectorAll('[role="tab"]'));
      if (tabs.length < 2) return;
      var panels = tabs.map(function (t) {
        return document.getElementById(t.getAttribute("aria-controls"));
      });
      if (panels.indexOf(null) > -1) return;
      var box = book.querySelector(".cbook-sheets");
      book.dataset.tabs = "on";
      function select(i, focus) {
        tabs.forEach(function (tab, j) {
          tab.setAttribute("aria-selected", j === i ? "true" : "false");
          tab.tabIndex = j === i ? 0 : -1;
          panels[j].hidden = j !== i;
        });
        if (focus) tabs[i].focus();
        draw();
      }
      /* The sheets are different heights — the table is the tallest — and
         letting the card resize under the tab strip throws the whole page
         down and up on every switch. So the card is pinned to the tallest
         sheet once and stops moving: show each in turn, keep the largest
         height, put the reader back where they were. Measured rather than
         guessed, because the tallest sheet changes with the column width,
         and re-measured on resize for the same reason. Showing each sheet
         also draws its chart at the real width, which a hidden one cannot
         report. */
      function equalise() {
        var cur = 0, max = 0, nat = [];
        panels.forEach(function (p, i) { if (!p.hidden) cur = i; });
        box.style.minHeight = "";
        /* pass one: every sheet at its natural size, to find the tallest */
        panels.forEach(function (p, i) {
          /* cleared before select() draws the sheet, or the chart is built
             once at the old height and straight away again at none */
          var w = p.querySelector(".chartwrap[data-chart]");
          if (w) delete w.dataset.h;
          select(i);
          nat[i] = box.offsetHeight;
          if (nat[i] > max) max = nat[i];
        });
        /* pass two: hand each chart the slack, so it grows instead of leaving
           a hole under itself. A sheet has to be visible to be measured or
           redrawn — a hidden one reports no width at all. */
        panels.forEach(function (p, i) {
          var w = p.querySelector(".chartwrap[data-chart]");
          if (!w || nat[i] >= max) return;
          select(i);
          w.dataset.h = Math.round(w.querySelector("svg").getBoundingClientRect().height
            + (max - nat[i]));
          draw();
        });
        select(cur);
        box.style.minHeight = max + "px";
      }
      levellers.push(equalise);
      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(i); });
        tab.addEventListener("keydown", function (e) {
          var last = tabs.length - 1, to = -1;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") to = i === last ? 0 : i + 1;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = i ? i - 1 : last;
          else if (e.key === "Home") to = 0;
          else if (e.key === "End") to = last;
          if (to > -1) { e.preventDefault(); select(to, true); }
        });
      });
      select(0);
      equalise();
    });
  }
  var levellers = [];
  sheets();

  /* Width, and on a phone width only. A phone fires resize whenever its
     toolbar slides in or out, which is every change of scroll direction near
     the top, and nothing in the card follows the toolbar: the charts and the
     tallest sheet follow the column's width, and vh on a phone is the large
     viewport, which the toolbar does not move. A desktop window dragged
     taller or shorter does move the card's vh padding and the gap above a
     later sheet, so a fine pointer re-levels on height as well. */
  var t, lastW = innerWidth, lastH = innerHeight, fine = matchMedia("(pointer: fine)");
  addEventListener("resize", function () {
    if (innerWidth === lastW && (innerHeight === lastH || !fine.matches)) return;
    lastW = innerWidth; lastH = innerHeight;
    clearTimeout(t);
    t = setTimeout(function () {
      draw();
      levellers.forEach(function (f) { f(); });
    }, 150);
  });
})();


/* The outcome lines draw themselves on, once, when you reach them.

   Standard SVG: dash the stroke with a single gap the length of the whole
   path, push the dash off the end, then slide the offset back to zero. The
   line appears to be drawn from its start. Nothing here is measured until the
   chart is on screen, because draw() re-lays the charts at the card's width
   and the lengths change with it.

   The order carries the argument the section is making. The old line draws
   first and alone, then the new one over the top of it, then the marker on its
   last point — before, then after, then where it ended up. Running them
   together would say the two were measured at once, which is the one thing
   this chart is not claiming.

   Progressive enhancement, as elsewhere: a line with no inline dash is simply
   a drawn line, and that is the state the stylesheet leaves it in. This only
   dashes a path at the moment it is about to undash it, and clears the inline
   properties again when the run is over, so a resize, an interrupted
   transition or a thrown error all end with the chart drawn rather than
   blank.                                                                    */

(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  /* the figure only: its .chartwrap is inside it, and watching both ran every
     draw-on twice, the second restarting the first a few pixels later */
  var figs = document.querySelectorAll(".chartfig");
  if (!figs.length) return;

  var EASE = "cubic-bezier(.33,.9,.4,1)";

  function drawLine(el, ms, delay) {
    var len;
    try { len = el.getTotalLength(); } catch (e) { return; }
    if (!len || !isFinite(len)) return;

    el.style.transition = "none";
    el.style.strokeDasharray = len + " " + len;
    el.style.strokeDashoffset = len;
    void el.getBoundingClientRect();              /* commit the dashed state */
    el.style.transition = "stroke-dashoffset " + ms + "ms " + EASE + " " + delay + "ms";
    el.style.strokeDashoffset = "0";

    /* hand the line back to the stylesheet once it has arrived, so nothing
       downstream is looking at a dashed stroke */
    setTimeout(function () {
      el.style.transition = "";
      el.style.strokeDasharray = "";
      el.style.strokeDashoffset = "";
    }, ms + delay + 60);
  }

  function fadeIn(el, ms, delay) {
    el.style.transition = "none";
    el.style.opacity = "0";
    void el.getBoundingClientRect();
    el.style.transition = "opacity " + ms + "ms ease " + delay + "ms";
    el.style.opacity = "1";
    setTimeout(function () { el.style.transition = ""; el.style.opacity = ""; },
               ms + delay + 60);
  }

  function play(fig) {
    /* queried now, not at set-up: draw() replaces these on every resize */
    var old = fig.querySelector("polyline.ln.old");
    var neu = fig.querySelector("polyline.ln.new");
    var at = 0;

    if (old) { drawLine(old, 620, 0); at = 430; }       /* overlap slightly */
    if (neu) { drawLine(neu, 760, at); at += 560; }

    /* the marker lands on the last point rather than waiting for the easing
       to finish crawling into it */
    fig.querySelectorAll("circle.dot").forEach(function (d) { fadeIn(d, 260, at); });

    /* the delta chart is filled bars, not strokes — there is no path to draw,
       so they arrive on their own short stagger instead */
    fig.querySelectorAll("path.bar").forEach(function (b, i) {
      fadeIn(b, 420, i * 120);
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      play(e.target);
    });
  }, { threshold: 0, rootMargin: "0px 0px -15% 0px" });

  figs.forEach(function (f) { io.observe(f); });
})();


/* The tab strip's selected surface slides instead of jumping.

   The stylesheet still draws the selection on the button, which is what a
   reader gets if this never runs. Only when the indicator is actually in the
   strip does .slid tell the buttons to stop, so there is no arrangement here
   that ends with nothing highlighted.

   The one subtlety is that select() is not only a user action. equalise()
   calls it in a loop over every sheet to measure their heights, and a strip
   that animated through that would flick across all four tabs on load and on
   every resize. So the move is only eased when it follows a real click or
   key press; every other reason to reposition — measurement, resize, a reflow
   after the fonts land — snaps straight there with the transition off.      */

(function () {
  var bars = document.querySelectorAll(".cbook-tabs");
  if (!bars.length) return;

  var still = matchMedia("(prefers-reduced-motion: reduce)");

  bars.forEach(function (bar) {
    var tabs = [].slice.call(bar.querySelectorAll('[role="tab"]'));
    if (tabs.length < 2) return;

    var ind = document.createElement("span");
    ind.className = "cbook-ind";
    ind.setAttribute("aria-hidden", "true");
    bar.insertBefore(ind, bar.firstChild);
    bar.classList.add("slid");

    var gesture = false;          /* was the last change asked for by a reader? */

    function place(ease) {
      var sel = bar.querySelector('[role="tab"][aria-selected="true"]');
      if (!sel) return;
      if (!ease) ind.style.transition = "none";
      var b = bar.getBoundingClientRect(), s = sel.getBoundingClientRect();
      /* content coordinates, so it stays put when the strip scrolls sideways */
      ind.style.transform = "translateX(" + (s.left - b.left + bar.scrollLeft).toFixed(1) + "px)";
      ind.style.width = s.width.toFixed(1) + "px";
      if (!ease) { void ind.offsetWidth; ind.style.transition = ""; }
    }

    tabs.forEach(function (tab) {
      var arm = function () { gesture = !still.matches; };
      tab.addEventListener("pointerdown", arm);
      tab.addEventListener("keydown", arm);
    });

    /* aria-selected is the single source of truth here: whoever moved the
       selection — click, arrow key, Home/End, or equalise mid-measurement —
       the strip follows the attribute rather than needing to be told. */
    var mo = new MutationObserver(function () {
      place(gesture);
      gesture = false;
    });
    tabs.forEach(function (tab) {
      mo.observe(tab, { attributes: true, attributeFilter: ["aria-selected"] });
    });

    place(false);
    /* the strip is laid out with --f-label; until that lands the tabs are the
       wrong width and so is anything measured off them */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { place(false); });
    }
    var r;
    addEventListener("resize", function () {
      clearTimeout(r);
      r = setTimeout(function () { place(false); }, 220);   /* after equalise */
    }, { passive: true });
  });
})();


/* The outcome's segmented control: Тойм, and the tables beside it.

   Two motions, both taken off Motion's smooth-tabs example by measuring it
   frame by frame. The pill springs to the chosen segment (the spring lives in
   work.css as a linear() curve, so this only sets where it goes). The views
   hand over in two beats: the outgoing one fades, blurs to 4px and slides
   50px the way the pill travelled, in 160ms; then the incoming one arrives
   from the other side, un-blurring, in 300ms. Travel direction is the whole
   point of the slide — going left, content leaves to the right — so the
   hand-over reads as moving along the control, not as a flicker.

   A click in the middle of a hand-over finishes the old one on the spot, so
   the state underneath is always one view shown and the rest hidden. Reduced
   motion switches at once, with no slide and no spring. Without this, every
   view is simply in the flow and there is no control — the tables are then
   just below Тойм, which is where the folded list used to be anyway.      */

(function () {
  var still = matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll(".oc").forEach(function (oc) {
    var seg = oc.querySelector(".oc-seg");
    if (!seg) return;
    var tabs = [].slice.call(seg.querySelectorAll('[role="tab"]'));
    if (tabs.length < 2) return;
    var views = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    if (views.indexOf(null) > -1) return;

    var pill = document.createElement("span");
    pill.className = "oc-pill";
    pill.setAttribute("aria-hidden", "true");
    seg.insertBefore(pill, seg.firstChild);

    var cur = 0, running = [];
    function settle() {
      running.forEach(function (a) { a.cancel(); });
      running = [];
      views.forEach(function (v, j) {
        var on = j === cur;
        v.classList.toggle("off", !on);
        v.inert = !on;
      });
    }
    function place(ease) {
      var b = tabs[cur];
      if (!ease) pill.style.transition = "none";
      pill.style.transform = "translateX(" + b.offsetLeft + "px)";
      pill.style.width = b.offsetWidth + "px";
      if (!ease) { void pill.offsetWidth; pill.style.transition = ""; }
    }

    function show(i, focus) {
      if (focus) tabs[i].focus();
      if (i === cur) return;
      settle();                                  /* finish whatever was mid-flight */
      var from = views[cur], to = views[i], dir = i < cur ? 1 : -1;
      cur = i;
      tabs.forEach(function (t, j) {
        t.setAttribute("aria-selected", j === i ? "true" : "false");
        t.tabIndex = j === i ? 0 : -1;
      });
      place(true);
      if (still.matches || !from.animate) { settle(); return; }
      var out = from.animate([
        { opacity: 1, filter: "blur(0px)", transform: "translateX(0)" },
        { opacity: 0, filter: "blur(4px)", transform: "translateX(" + dir * 50 + "px)" }
      ], { duration: 160, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
      running.push(out);
      out.finished.then(function () {
        if (running.indexOf(out) < 0) return;    /* superseded by a later click */
        settle();
        var into = to.animate([
          { opacity: 0, filter: "blur(4px)", transform: "translateX(" + -dir * 50 + "px)" },
          { opacity: 1, filter: "blur(0px)", transform: "translateX(0)" }
        ], { duration: 300, easing: "cubic-bezier(.22,.9,.3,1)" });
        running.push(into);
        into.finished.then(function () { running = []; }, function () {});
      }, function () {});
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { show(i); });
      tab.addEventListener("keydown", function (e) {
        var last = tabs.length - 1, to = -1;
        if (e.key === "ArrowRight") to = i === last ? 0 : i + 1;
        else if (e.key === "ArrowLeft") to = i ? i - 1 : last;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = last;
        if (to > -1) { e.preventDefault(); show(to, true); }
      });
      tab.tabIndex = i === 0 ? 0 : -1;
    });

    oc.dataset.seg = "on";
    settle();
    place(false);
    /* the segments are set in --f-label; until it lands they are the wrong
       width, and so is the pill measured off them */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(false); });
    var r;
    addEventListener("resize", function () {
      clearTimeout(r);
      r = setTimeout(function () { place(false); }, 150);
    }, { passive: true });
  });
})();
