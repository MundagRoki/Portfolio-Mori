/* Outcome charts: draw at the card's measured width, then wire the readout.
   The markup ships a static 480px SVG so the section still reads with no JS;
   this redraws it to fill the column. Drawing at the real pixel width is what
   keeps the type fixed — a percentage-width viewBox would scale the labels
   along with the geometry, which is the thing we are avoiding. */
(function () {
  "use strict";
  /* The flow demos autoplay, which is the right default for a silent
     screen-recording — except for the reader who asked the OS for less
     motion. For them the videos hold their first frame and play on tap. */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video[autoplay]").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
      v.controls = true;
    });
  }
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
  var apos = function (v) { return Math.round(v).toLocaleString("en-US").replace(/,/g, "'"); };

  function line(spec, W, TH) {
    var H = Math.max(TH || 0, 250), L = 46, R = 16, T = 26, B = 62;
    var pw = W - L - R, ph = H - T - B, v = spec.values, last = v.length - 1;
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
    [0, 2, 4, 6, 8].forEach(function (i) {
      g.appendChild(n("text", { class: "xtick", x: sx(i).toFixed(1), y: T + ph + 40 }, spec.months[i]));
    });
    var xs = sx(spec.split);
    g.appendChild(n("line", { class: "mark", x1: xs.toFixed(1), y1: T - 8, x2: xs.toFixed(1), y2: T + ph }));
    g.appendChild(n("text", { class: "mlab", x: xs.toFixed(1), y: T - 11, "text-anchor": "middle" }, spec.mark));
    var pts = function (a, b) {
      var o = []; for (var i = a; i <= b; i++) o.push(sx(i).toFixed(1) + "," + sy(v[i]).toFixed(1));
      return o.join(" ");
    };
    g.appendChild(n("polyline", { class: "ln old", points: pts(0, spec.split) }));
    g.appendChild(n("polyline", { class: "ln new", points: pts(spec.split, last) }));
    g.appendChild(n("circle", { class: "dot new", cx: sx(last).toFixed(1), cy: sy(v[last]).toFixed(1), r: 4.5 }));
    [[sx(0.4), "old", "хуучин 4.x"], [sx(5.4), "new", "v2 5.x"]].forEach(function (k) {
      var y0 = T + ph + 18;
      g.appendChild(n("line", { class: "key " + k[1], x1: k[0].toFixed(1), y1: y0 - 4, x2: (k[0] + 14).toFixed(1), y2: y0 - 4 }));
      g.appendChild(n("text", { class: "slab", x: (k[0] + 20).toFixed(1), y: y0 }, k[2]));
    });
    g.appendChild(n("line", { class: "cross", x1: 0, y1: T - 8, x2: 0, y2: T + ph, "aria-hidden": "true" }));
    g.appendChild(n("circle", { class: "fdot", cx: 0, cy: 0, r: 5, "aria-hidden": "true" }));
    var hits = n("g", { class: "hits" });
    for (var i = 0; i <= last; i++) {
      var x = sx(i),
          lft = i === 0 ? 0 : (sx(i - 1) + x) / 2,
          rgt = i === last ? W : (x + sx(i + 1)) / 2,
          series = i > spec.split ? "v2 5.x" : (i === spec.split ? "шилжилт" : "хуучин 4.x"),
          val = (spec.dec ? v[i].toFixed(spec.dec) : apos(v[i])) + spec.unit;
      hits.appendChild(n("rect", {
        class: "hit", x: lft.toFixed(1), y: T - 8, width: (rgt - lft).toFixed(1), height: ph + 8,
        tabindex: "0", role: "img", "aria-label": spec.months[i] + ": " + val + ", " + series,
        "data-x": x.toFixed(1), "data-y": sy(v[i]).toFixed(1), "data-label": spec.months[i],
        "data-value": val, "data-series": series, "data-cls": i >= spec.split ? "new" : "old"
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
    var fmt = function (v) { return (v > 0 ? "+" : "") + v.toFixed(1) + "%"; };
    /* "хэвээр" doubles the width of the value column for one row. Where the
       plot can spare it the word stays; where it cannot, the grey already
       says the same thing and the caption spells it out. */
    var vlab = rows.map(function (row) {
      return (Math.abs(row[1]) < 1 ? "хэвээр · " : "") + fmt(row[1]);
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
        t === 0 ? "0" : (t > 0 ? "+" : "") + t + "%"));
    });
    rows.forEach(function (row, i) {
      var name = row[0], v = row[1], top = top0 + i * ROW, cy = top + ROW / 2,
          y = cy - BAR / 2, x = sx(v), ty = (cy + 4.8).toFixed(1), d;
      /* Anything inside +/-1% is a rounding-width sliver: drawn as a bar it
         reads as a rendering fault rather than a value. Below that threshold
         it becomes a neutral marker straddling zero — which is also the
         honest encoding, since the finding there is "did not move". */
      if (Math.abs(v) < 1) {
        g.appendChild(n("rect", { class: "bar flat", "data-row": i, rx: 2,
          x: (z - 3).toFixed(1), y: y, width: 6, height: BAR }));
      } else {
        if (v >= 0) d = "M" + z.toFixed(1) + " " + y + " H" + (x - r).toFixed(1) + " a" + r + " " + r + " 0 0 1 " + r + " " + r + " v" + (BAR - 2 * r) + " a" + r + " " + r + " 0 0 1 -" + r + " " + r + " H" + z.toFixed(1) + " Z";
        else      d = "M" + z.toFixed(1) + " " + y + " H" + (x + r).toFixed(1) + " a" + r + " " + r + " 0 0 0 -" + r + " " + r + " v" + (BAR - 2 * r) + " a" + r + " " + r + " 0 0 0 " + r + " " + r + " H" + z.toFixed(1) + " Z";
        g.appendChild(n("path", { class: "bar " + (v >= 0 ? "up" : "down"), "data-row": i, d: d }));
      }
      g.appendChild(n("text", { class: "rlab", x: L - PAD, y: ty }, name));
      g.appendChild(n("text", { class: "vlab" + (Math.abs(v) < 1 ? " flat" : ""), x: W, y: ty }, vlab[i]));
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
        "data-series": row[2], "data-cls": row[1] >= 0 ? "new" : "down"
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

    function show(hit) {
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
      var px = box.left - fb.left + x * k, py = box.top - fb.top + y * k;
      tip.classList.add("on");
      var half = tip.offsetWidth / 2, h = tip.offsetHeight;
      var left = Math.max(half + 2, Math.min(fig.clientWidth - half - 2, px));
      var below = py - h - 14 <= 0;
      tip.classList.toggle("below", below);
      tip.style.transform = "translate(" + (left - half).toFixed(1) + "px,"
        + (below ? py + 14 : py - h - 14).toFixed(1) + "px)";
      if (fresh) { void tip.offsetWidth; fig.classList.remove("ctip-place"); }
    }
    function hide() {
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
    wrap.addEventListener("scroll", hide);
  }

  var MINW = 440;   // below this the frame pans rather than cramping the axis
  function draw() {
    document.querySelectorAll(".chartwrap[data-chart]").forEach(function (wrap) {
      var spec = DATA[wrap.getAttribute("data-chart")];
      if (!spec) return;
      var old = wrap.querySelector("svg");
      var cs = getComputedStyle(wrap);
      var W = Math.round(Math.max(MINW,
        wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)));
      var TH = +wrap.dataset.h || 0;
      if (old && +old.dataset.w === W && +old.dataset.th === TH) return;   // nothing to redo
      if (old && old.querySelector("title")) spec.title = old.querySelector("title").textContent;
      var svg = spec.type === "line" ? line(spec, W, TH) : bars(spec, W, wrap, TH);
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

  /* Sheet tabs. A hidden sheet has no width, so its chart would be drawn at
     the MINW floor and stay there; switching therefore redraws, and draw()
     already no-ops on any chart whose width has not changed. The panels are
     never removed from the DOM — find-in-page still reaches the table. */
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
          select(i);
          var w = p.querySelector(".chartwrap[data-chart]");
          if (w) { delete w.dataset.h; draw(); }
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

  var t;
  addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      draw();
      levellers.forEach(function (f) { f(); });
    }, 150);
  });
})();
