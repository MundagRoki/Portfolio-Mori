/* about.html, and its copy under the chest on index.html: the cards' tilt and
   sheen, the gerege on the title card, the scroll reveals, and the fill on
   the experience spine.

   Scrolling is the browser's own. The page does not load scroll.js: nothing
   in it applies here, and this file keeps its own scroll listeners.

   Nothing in this file is required to read the page. Every element it touches
   is already visible and laid out before it runs; it adds the arriving-from
   state itself, so a reader with no JS, or one who asked for reduced motion,
   simply gets the page already arrived. */

(function () {
  "use strict";

  if (!document.querySelector(".pass-stage")) return;

  var slow = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* The title card — the pass, since the ID card above it was taken out. The
     card and the hanging tag tilt as one, so the transform goes on the wrapper
     that holds both rather than on the card itself. */
  var tilt = document.querySelector(".pass-stage > .tilt");
  var card = tilt && tilt.querySelector(".pass");

  /* ---------------------------------------------------------------- reveals
     Same plan-table shape scroll.js uses for NetPay: selector, behaviour, and
     the per-item stagger in ms along a row. */
  (function () {
    if (slow || !("IntersectionObserver" in window)) return;

    var PLAN = [
      [".xp-head", "rise", 0],
      [".xp-item", "rise", 0],
      [".ab-close > *", "rise", 90]
    ];

    var armed = [];
    PLAN.forEach(function (row) {
      var i = 0;
      [].slice.call(document.querySelectorAll(row[0])).forEach(function (el) {
        /* already on screen at load: it has nothing to arrive from, and a
           reveal the reader could not have watched arrive is worth nothing */
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) return;
        el.classList.add("rv", "rv-" + row[1]);
        if (row[2]) { el.style.setProperty("--rv-d", (i % 6) * row[2] + "ms"); i++; }
        armed.push(el);
      });
    });
    if (!armed.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add("rv-in");
        /* hand it back to the stylesheet once it has arrived, so will-change
           is not left standing on every row for the life of the page */
        setTimeout(function () {
          e.target.classList.remove("rv", "rv-in", "rv-rise");
          e.target.style.removeProperty("--rv-d");
        }, 1400);
      });
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });

    armed.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------- card arrival
     On about.html the card is above the fold, so it animates on load. Under
     the chest on index.html it is several screens down at load, so there it
     waits until it is scrolled to.

     Once it has arrived both classes come off together, as the reveals hand
     their rows back above. Left on, the entrance's 1.05s transform transition
     would ease every tilt written inline afterwards, and the card would trail
     the pointer by a second. Dropping is-in alone would snap it back to the
     from-state; dropping both leaves it where it already is. The tilt waits
     on `arrived` for the same reason. */
  var arrived = function (fn) { fn(); };
  (function () {
    if (slow || !tilt) return;
    var waiting = [];
    arrived = function (fn) { if (waiting) waiting.push(fn); else fn(); };
    tilt.classList.add("idc-enter");
    function done(e) {
      /* transitionend bubbles, and the sheen inside the card fades on its own */
      if (e && (e.target !== tilt || e.propertyName !== "transform")) return;
      if (!waiting) return;
      tilt.removeEventListener("transitionend", done);
      tilt.classList.remove("idc-enter", "is-in");
      var q = waiting; waiting = null;
      q.forEach(function (fn) { fn(); });
    }
    function go() {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          tilt.classList.add("is-in");
          tilt.addEventListener("transitionend", done);
          /* in case the transition never ends cleanly */
          setTimeout(done, 1300);
        });
      });
    }
    var r = tilt.getBoundingClientRect();
    if ((r.top < innerHeight && r.bottom > 0) || !("IntersectionObserver" in window)) { go(); return; }
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      go();
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(tilt);
  })();

  /* ------------------------------------------------------- the timeline
     After mescubook.com's Experience, whose script this follows closely in
     shape: the line fills with the scroll, each dot lights as the fill
     reaches it, and each year brightens and swells with how near its row is
     to mid-screen — prox = 1 - distance/viewport * 1.8, clamped. Their year
     runs .06 + .4*prox opacity at scale 1 + .08*prox; gold carries more than
     their grey at the low end, so this starts a little higher. It brightens
     only: the swell came off at the owner's asking (2026-09-29, "I don't
     like how it gets bigger"). All of it is driven by scroll position, never by a clock:
     stop scrolling and nothing on the page moves. */
  (function () {
    var xp = document.querySelector(".xp");
    if (slow || !xp) return;
    /* the fill is measured against the line itself, which starts just under
       the heading rather than at the top of the rows */
    var lineEl = xp.querySelector(".xp-line");
    var fill = lineEl && lineEl.querySelector("i");
    /* lit, op and sc are what was last written, so a frame that changes
       nothing writes nothing */
    var rows = [].map.call(xp.querySelectorAll(".xp-item"), function (it) {
      return { year: it.querySelector(".xp-year"), dot: it.querySelector(".xp-dot"),
               lit: null, op: "" };
    });
    var lastH = "";

    var pending = false;
    function draw() {
      pending = false;
      /* Every rect is read before anything is written: a read that follows a
         write forces a layout, and interleaved row by row that was one per
         read. Only vertical centres are wanted, and nothing written here
         moves them, so reading before this frame's writes gives the same
         numbers. */
      var r = (lineEl || xp).getBoundingClientRect(), vh = innerHeight;
      var mid = rows.map(function (o) {
        var d = o.dot.getBoundingClientRect(), y = o.year.getBoundingClientRect();
        return { dot: d.top + d.height / 2, year: y.top + y.height / 2 };
      });
      /* nought when the line's top reaches the middle of the screen, one
         when its bottom does */
      var p = Math.max(0, Math.min(1, (vh * 0.5 - r.top) / (r.height || 1)));
      var h = p * 100 + "%";
      if (fill && h !== lastH) { fill.style.height = h; lastH = h; }
      var edge = r.top + p * r.height;
      rows.forEach(function (o, i) {
        var lit = mid[i].dot <= edge + 1;
        if (lit !== o.lit) { o.dot.classList.toggle("is-lit", lit); o.lit = lit; }
        var prox = Math.max(0, 1 - Math.abs(mid[i].year - vh * 0.5) / vh * 1.8);
        var op = (0.14 + 0.5 * prox).toFixed(3);
        if (op !== o.op) { o.year.style.opacity = op; o.op = op; }
      });
    }
    function onScroll() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(draw);
    }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    draw();

    /* --- the cards: tilt, and an elastic drag against the line ------------
       Also theirs: a card can be pulled away from the centre line but not
       across it; let go and it springs back (k .06, damping .82 — their
       constants), and if it comes home fast enough it strikes the line, which
       bows away from the impact and rings down in about 0.8s. A mouse only;
       a card under a fingertip is a scroll gesture, not a handle. And only
       with a line to pull against: both the drag and the strike measure it. */
    if (!lineEl || !matchMedia("(pointer: fine)").matches) return;
    var NS = "http://www.w3.org/2000/svg";

    function bump(card, dot, dir, strength) {
      var xr = xp.getBoundingClientRect(), cr = card.getBoundingClientRect();
      var lr = lineEl.getBoundingClientRect();
      var H = 160, OFF = 18, W = OFF * 2 + 6, cx = W / 2;
      var at = cr.top + cr.height / 2 - xr.top;
      /* the bowed stretch takes the colour the line has at that height */
      var lit = fill && cr.top + cr.height / 2 <= fill.getBoundingClientRect().bottom;

      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);
      svg.setAttribute("aria-hidden", "true");
      svg.style.cssText = "position:absolute;z-index:0;pointer-events:none;overflow:visible;" +
        "left:" + (lr.left - xr.left + 0.5) + "px;top:" + (at - H / 2) + "px;transform:translateX(-50%)";
      var cover = document.createElementNS(NS, "rect");
      cover.setAttribute("x", cx - 2); cover.setAttribute("width", 4);
      cover.setAttribute("height", H); cover.setAttribute("fill", "#000");
      var glow = document.createElementNS(NS, "path");
      glow.setAttribute("fill", "none"); glow.setAttribute("stroke-width", "3");
      glow.setAttribute("stroke", lit ? "rgba(216,173,92,.45)" : "rgba(216,173,92,.12)");
      glow.style.filter = "blur(3px)";
      var path = document.createElementNS(NS, "path");
      path.setAttribute("fill", "none"); path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke", lit ? "rgba(216,173,92,.9)" : "rgba(216,173,92,.2)");
      svg.appendChild(cover); svg.appendChild(glow); svg.appendChild(path);
      xp.appendChild(svg);

      function shape(o) {
        return "M " + cx + " 0 C " + cx + " " + H * 0.2 + ", " + (cx + o) + " " + H * 0.35 + ", " +
          (cx + o) + " " + H * 0.5 + " C " + (cx + o) + " " + H * 0.65 + ", " + cx + " " +
          H * 0.8 + ", " + cx + " " + H;
      }
      var t0 = performance.now();
      (function ring(now) {
        var t = Math.min(1, (now - t0) / 800);
        var o = OFF * strength * dir * Math.exp(-t * 5) * Math.cos(t * Math.PI * 4);
        var d = shape(o);
        path.setAttribute("d", d); glow.setAttribute("d", d);
        /* the dot rides the bowed line rather than floating off it */
        dot.style.transform = "translateX(" + o.toFixed(2) + "px)";
        if (t < 1) requestAnimationFrame(ring);
        else { svg.remove(); dot.style.transform = ""; }
      })(t0);
    }

    [].forEach.call(xp.querySelectorAll(".xp-item"), function (item) {
      var card = item.querySelector(".xp-card"), dot = item.querySelector(".xp-dot");
      var sheen = document.createElement("div");
      sheen.className = "idc-sheen";
      sheen.setAttribute("aria-hidden", "true");
      card.appendChild(sheen);
      card.classList.add("is-draggable");

      var K = 0.06, DAMP = 0.82, REACH = 260;
      var rx = 0, ry = 0, tx = 0, ty = 0, x = 0, vx = 0;
      var wall = 1, drag = null, running = false;

      function frame() {
        rx += (tx - rx) * 0.1;
        ry += (ty - ry) * 0.1;
        if (!drag) {
          vx = (vx - K * x) * DAMP;
          var nx = x + vx;
          if (nx * wall < 0) {                 /* came home past the line */
            var hit = Math.abs(vx);
            nx = 0;
            vx = -vx * 0.3;
            if (hit > 1.2) bump(card, dot, -wall, Math.min(1, hit / 28));
          }
          x = nx;
        }
        card.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0) rotateX(" +
          rx.toFixed(3) + "deg) rotateY(" + ry.toFixed(3) + "deg)";
        sheen.style.setProperty("--rake", (ry * 2.4).toFixed(2) + "%");
        if (!drag && Math.abs(x) < 0.05 && Math.abs(vx) < 0.05 &&
            Math.abs(tx - rx) < 0.01 && Math.abs(ty - ry) < 0.01) {
          running = false;
          x = 0; vx = 0;
          if (!tx && !ty) card.style.transform = "";
          return;
        }
        requestAnimationFrame(frame);
      }
      function wake() {
        if (running) return;
        running = true;
        requestAnimationFrame(frame);
      }

      card.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        if (drag) {
          /* pulled toward the line it stops at the line; pulled away it
             stretches, harder the further it goes */
          var raw = e.clientX - drag.mx;
          if (raw * wall < 0) raw = 0;
          var nx = wall * REACH * (1 - Math.exp(-Math.abs(raw) / REACH));
          vx = nx - x;
          x = nx;
          wake();
          return;
        }
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ty = (px - 0.5) * 2 * 8;
        tx = (0.5 - py) * 2 * 5;
        sheen.style.setProperty("--sx", (px * 100).toFixed(1) + "%");
        sheen.style.setProperty("--sy", (py * 100).toFixed(1) + "%");
        card.classList.add("is-lit");
        wake();
      });
      card.addEventListener("pointerleave", function () {
        if (drag) return;
        tx = 0; ty = 0;
        card.classList.remove("is-lit");
        wake();
      });
      card.addEventListener("pointerdown", function (e) {
        if (e.button || e.pointerType !== "mouse" || e.target.closest("a")) return;
        e.preventDefault();
        /* which side of the line the card sits on decides which way it may
           be pulled — read live, since the narrow layout puts every card on
           the right */
        var cr = card.getBoundingClientRect(), lr = lineEl.getBoundingClientRect();
        wall = cr.left + cr.width / 2 >= lr.left ? 1 : -1;
        drag = { mx: e.clientX };
        tx = 0; ty = 0;
        card.classList.add("is-dragging");
        card.setPointerCapture(e.pointerId);
        wake();
      });
      function release() {
        if (!drag) return;
        drag = null;
        card.classList.remove("is-dragging", "is-lit");
        vx = Math.max(-40, Math.min(40, vx));
        wake();
      }
      card.addEventListener("pointerup", release);
      card.addEventListener("pointercancel", release);
      card.addEventListener("lostpointercapture", release);
    });
  })();

  /* ------------------------------------------------------------ the gerege
     A pendulum, not a tilt. The tag hangs off a cord, so the one thing it must
     do is rotate about the point it hangs from — .hang is pinned at the centre
     of the card's eyelet with its transform-origin at 0 0, so rotating it
     swings cord, ring and tag together as one object.

     Three things push it: a standing breeze so it is never quite still, the
     scroll (the card moves, the thing hanging off it lags), and the pointer,
     either passing nearby or grabbing it outright. Everything else is a spring
     back to vertical with enough damping that it settles rather than wobbles.

     No physics library. This is one angle, one angular velocity, and Hooke's
     law — a pendulum is genuinely this small, and the reference site's version
     is hand-rolled too.

     One rig per .hang, each on its own state; the pass carries the only one
     today. Off screen a rig keeps its loop but skips the writes, so a tag you
     scroll back to is still mid-swing rather than frozen, and one you cannot
     see costs nothing but the arithmetic. "Off screen" is the tag's own box:
     it hangs lowest, so it is the last of the rig to leave the viewport, and
     below 861px, where the rig is display:none, the observer reports it
     unseen from its first callback on and the writes stop. */
  function swing(hang, i) {
    /* the breeze is a function of time, so two rigs started on the same frame
       would swing in lockstep; a per-rig offset puts them out of step */
    var phase = i * 9173;
    var seen = true;
    var tag = hang.querySelector(".gerege-hang");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { seen = en[0].isIntersecting; })
        .observe(tag);
    }

    var K = 0.0055;     /* spring toward vertical — lower is a longer, lazier period */
    var DAMP = 0.982;   /* per-frame velocity retained; the difference between a
                           tag settling and a metronome that will not stop */
    var MAX = 15;       /* degrees. Past this it stops reading as hanging and
                           starts reading as a windscreen wiper. */

    /* Second pendulum. The rope swings from the eyelet; the tag swings from the
       knot, on the rope. Coupling it to the parent's angular ACCELERATION
       rather than its angle is what makes it read as a hanging object: the tag
       lags when the rope starts moving and overshoots when it stops, which is
       exactly what mass on a string does. Softer spring and heavier damping
       than the parent, so it trails rather than flaps. */
    var K2 = 0.009, DAMP2 = 0.977, COUPLE = 0.95, MAX2 = 13;
    var a2 = 0, v2 = 0, vPrev = 0;

    var a = 0, v = 0, t0 = 0;
    var drag = null, lastY = scrollY;

    function frame(t) {
      if (!t0) t0 = t;
      var e = t - t0 + phase;

      if (drag) {
        /* while held, the angle is the pointer: atan2 of the offset from the
           pivot, which is what makes it follow the cursor like a real object
           rather than easing toward it */
        var dx = drag.x - drag.px, dy = Math.max(24, drag.y - drag.py);
        var target = Math.atan2(dx, dy) * 180 / Math.PI;
        target = Math.max(-42, Math.min(42, target));
        v = target - a;
        a = target;
      } else {
        /* two slow sines at unrelated periods: one alone reads as a loop */
        var breeze = Math.sin(e * 0.00068) * 0.0062 + Math.sin(e * 0.00029) * 0.0042;
        v += -K * a + breeze;
        v *= DAMP;
        a += v;
        if (a > MAX) { a = MAX; v *= -0.4; }
        if (a < -MAX) { a = -MAX; v *= -0.4; }
      }

      if (seen) hang.style.transform = "rotate(" + a.toFixed(3) + "deg)";

      /* the parent's change in angular velocity this frame is the impulse the
         tag feels through the knot */
      var accel = v - vPrev;
      vPrev = v;
      /* The coupling alone leaves the tag dead still whenever the rope is only
         drifting on the breeze — angular acceleration that gentle is nearly
         zero, so nothing reaches it and it hangs rigid. Its own faint breeze,
         on periods that share no factor with the rope's, keeps the two out of
         step, which is the whole point of hanging it on a second pivot. */
      var breeze2 = Math.sin(e * 0.00047) * 0.0021 + Math.sin(e * 0.00113) * 0.0013;
      v2 += -K2 * a2 - accel * COUPLE + breeze2;
      v2 *= DAMP2;
      a2 += v2;
      if (a2 > MAX2) { a2 = MAX2; v2 *= -0.35; }
      if (a2 < -MAX2) { a2 = -MAX2; v2 *= -0.35; }
      if (seen) tag.style.transform = "rotate(" + a2.toFixed(3) + "deg)";

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* the card scrolls away under it and the tag lags behind */
    addEventListener("scroll", function () {
      var d = scrollY - lastY;
      lastY = scrollY;
      /* With K this soft, a swing of A degrees needs only v = A * sqrt(K) —
         about 0.074 per degree. The first pass used 0.06 per pixel clamped at
         3, which is forty degrees of impulse from one flick of the wheel; it
         pinned the tag against its own limit every time. */
      if (!drag) v -= Math.max(-0.25, Math.min(0.25, d * 0.004));
    }, { passive: true });

    /* a pointer passing close disturbs it, falling off with distance */
    addEventListener("pointermove", function (ev) {
      /* off screen there is nothing to nudge, and the rect read below would
         force a layout on every mouse move anywhere on the page */
      if (!seen || drag || ev.pointerType !== "mouse") return;
      var r = hang.getBoundingClientRect();
      var dx = ev.clientX - r.left, dy = ev.clientY - r.top;
      var d = Math.sqrt(dx * dx + dy * dy);
      /* pointermove fires dozens of times a second, so this accumulates —
         it has to be small enough that a slow pass nudges rather than shoves */
      if (d < 260) v += (dx > 0 ? -1 : 1) * (1 - d / 260) * 0.022;
    }, { passive: true });

    var svg = tag;
    svg.addEventListener("pointerdown", function (ev) {
      if (ev.button) return;
      ev.preventDefault();
      var r = hang.getBoundingClientRect();
      drag = { px: r.left, py: r.top, x: ev.clientX, y: ev.clientY };
      hang.classList.add("is-grabbed");
      svg.setPointerCapture(ev.pointerId);
    });
    svg.addEventListener("pointermove", function (ev) {
      if (drag) { drag.x = ev.clientX; drag.y = ev.clientY; }
    });
    function release() {
      if (!drag) return;
      drag = null;
      hang.classList.remove("is-grabbed");
      /* v already holds the last frame's angular delta, so letting go simply
         stops overwriting it and the spring takes over mid-swing */
      v = Math.max(-4, Math.min(4, v));
    }
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    /* a context menu or a window blur takes the capture without a pointerup,
       and would leave the tag pinned at its last angle */
    svg.addEventListener("lostpointercapture", release);
  }
  if (!slow) [].forEach.call(document.querySelectorAll(".hang"), swing);

  /* ------------------------------------------------------- tilt and sheen
     A fine pointer only. Tilting a card toward a fingertip that is already
     resting on it shows the reader nothing, and the sheen needs a hover state
     that touch does not have. */
  function lean(tilt, card, settle) {

    var sheen = document.createElement("div");
    sheen.className = "idc-sheen";
    sheen.setAttribute("aria-hidden", "true");
    card.appendChild(sheen);

    /* the reference goes to 18deg and 12deg. This card is wider and flatter,
       and at 18 the far edge detaches from the page — 11 and 7 keep the whole
       thing reading as one object that happens to be catching light. */
    var MAX_Y = 11, MAX_X = 7;
    var rx = 0, ry = 0, tx = 0, ty = 0;
    var running = false;

    function frame() {
      /* a plain lerp: a twelfth of the remaining angle each frame reads as
         weight without ever visibly overshooting */
      rx += (tx - rx) * 0.085;
      ry += (ty - ry) * 0.085;
      tilt.style.transform =
        "rotateX(" + rx.toFixed(3) + "deg) rotateY(" + ry.toFixed(3) + "deg)";
      sheen.style.setProperty("--rake", (ry * 2.4).toFixed(2) + "%");

      if (Math.abs(tx - rx) < 0.01 && Math.abs(ty - ry) < 0.01) {
        running = false;
        if (tx === 0 && ty === 0) tilt.style.transform = "";
        return;
      }
      requestAnimationFrame(frame);
    }
    /* The entrance animates .tilt's transform through a class. This writes an
       inline transform to the same element, which would win and snap the card
       into place mid-arrival — so it stays asleep until the entrance is done. */
    var armed = false;
    settle(function () { armed = true; });

    function wake() {
      if (running || !armed) return;
      running = true;
      requestAnimationFrame(frame);
    }

    tilt.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      card.classList.add("is-lit");
    });
    tilt.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      ty = (px - 0.5) * 2 * MAX_Y;
      tx = (0.5 - py) * 2 * MAX_X;
      sheen.style.setProperty("--sx", (px * 100).toFixed(1) + "%");
      sheen.style.setProperty("--sy", (py * 100).toFixed(1) + "%");
      wake();
    });
    tilt.addEventListener("pointerleave", function () {
      card.classList.remove("is-lit");
      tx = 0; ty = 0;
      wake();
    });
  }
  /* waits out the entrance, which animates the same .tilt transform */
  if (!slow && card && matchMedia("(pointer: fine)").matches) lean(tilt, card, arrived);
})();
