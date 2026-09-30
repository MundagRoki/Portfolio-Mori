/* What the case pages run on top of the stylesheet: the gallery dots, the
   ledger rules, the NetPay ground, the field that answers the pointer, the
   height of the Voice spark, the case-page reveals (NetPay and Voice), the
   device videos, the phone screens that scroll by drag and the skeletons in
   frames still waiting for their picture. Every
   one of them leaves the page readable if it never runs.

   Scrolling itself is native, on every page. An eased wheel used to sit here,
   the reference site's weighted feel in forty lines, and it came out: a Mac
   trackpad already carries its own momentum, so easing it a second time left
   the page trailing the fingers and coasting on after they lifted — and a
   wheel listener that can cancel the scroll makes every step wait on the main
   thread, behind whatever else the page is drawing. html{scroll-behavior:
   smooth} in leaf.css still smooths the anchor jumps and the dots' scrollTo. */


/* Gallery dots — the pan itself is CSS; this only keeps the rail in step.

   The section is N viewports tall and sticky inside, so slide K occupies the
   Kth viewport of scrolling. That makes the active dot a pure function of
   scroll position, and a click is just a scrollTo — no slide state to keep,
   nothing that can disagree with what is on screen.                          */

(function () {
  document.querySelectorAll('.gal').forEach(function (gal) {
    var dots = [].slice.call(gal.querySelectorAll('.gal-dots button'));
    var slides = gal.querySelectorAll('.gal-slide').length;
    if (!dots.length || slides < 2) return;

    /* the stacked fallback has no pan to track */
    var stacked = function () {
      return getComputedStyle(gal.querySelector('.gal-pin')).position !== 'sticky';
    };

    function progress() {
      var box = gal.getBoundingClientRect();
      var travel = gal.offsetHeight - window.innerHeight;
      if (travel <= 0) return 0;
      return Math.min(1, Math.max(0, -box.top / travel));
    }

    var queued = false;
    function sync() {
      queued = false;
      if (stacked()) return;
      var i = Math.round(progress() * (slides - 1));
      dots.forEach(function (d, n) {
        d.setAttribute('aria-selected', n === i ? 'true' : 'false');
      });
    }

    addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(sync);
    }, { passive: true });
    addEventListener('resize', sync, { passive: true });
    sync();

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        if (stacked()) return;
        var travel = gal.offsetHeight - window.innerHeight;
        var top = gal.getBoundingClientRect().top + window.scrollY
                + travel * (i / (slides - 1));
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  });
})();


/* The shift ledger rules itself as you reach it.

   The stylesheet draws the rules by default and this script takes them away
   before giving them back, rather than the other way round. That ordering is
   the whole reliability story: if the file fails to load, errors, or is blocked,
   the ledger is simply ruled, and the only thing lost is the moment it arrives.
   Arming it first and animating second cannot produce a ruleless table.

   Each row gets its index as --i and the block gets its length as --n, which
   the stylesheet turns into delays, so the rules land in reading order and the
   closing rule lands last. The observer is torn down after it fires: the ledger
   rules once, and re-ruling it on every pass would turn a moment into a tic. */

(function () {
  var ledgers = document.querySelectorAll('.shift');
  if (!ledgers.length) return;

  /* no observer, or the reader asked for less motion: leave it drawn */
  if (!('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  ledgers.forEach(function (dl) {
    var rows = dl.querySelectorAll('.shift > div:not(.shift-cols)');
    rows.forEach(function (row, i) { row.style.setProperty('--i', i); });
    dl.style.setProperty('--n', rows.length);   /* when the closing rule lands */

    dl.classList.add('armed');

    /* Fire on the block's edge crossing a line near the foot of the screen,
       not on a visible-area ratio. Stacked on a phone this block is taller than
       the viewport, and a ratio threshold there is a guess about how much of it
       fits — 0.15 of a 1300px ledger is a different moment than 0.15 of a 250px
       one. A bottom inset triggers at the same place on every screen: as the
       first rule comes into view. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.disconnect();
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

    io.observe(dl);
  });
})();


/* The NetPay ground, lit and drifting.

   The CSS ground in work.css is nine ellipses between 56vw and 170vw across —
   up to 1.7x the width of the screen. This canvas began as a drifting version
   of it, and the drift is why the shapes changed: a gradient that much larger
   than the viewport varies so slowly across it that sliding the whole thing
   20vw changes any given pixel by two or three levels out of 255. Big soft
   shapes hide their own movement.

   So the pools here are small — a quarter to two fifths of the short side —
   and there are fourteen of them, lit rather than cut: no black
   clouds, because nothing needs cutting back when the light starts from the
   page's own black.

   They also sit high rather than low. The CSS ground puts its light along the
   bottom, which is where the reading column and the glass cards are, and at
   82% opacity those panels show whatever is under them: a pool below a card
   reads as a stain on the card, not as ground behind the page. Putting the
   light above the content leaves the reading field one flat dark value and
   fills the band that was empty. Every colour is still off the CSS ramp.

   It drifts. Three things move, and none alone would be enough: each pool
   wanders on its own phase, every pool rides one shared tide (independent
   wobbles sum to almost nothing — they cancel), and each rises and falls in
   brightness out of step with its drift. The pace is the owner's, 0.0040 of
   the clock a frame — "a drift, not a sweep" — and it is counted in time
   rather than frames, so a 120Hz screen runs it at the speed it was chosen
   at on a 60Hz one instead of twice as fast.

   The drift was stopped for a while under a blanket "backgrounds never move"
   rule and brought back at the owner's asking; what that rule was about is
   animated grain, which stays still. The cost it was stopped for is smaller
   now: NetPay's panels carry no backdrop blur, so a frame redraws a quarter-
   scale canvas and re-blurs only the header over it. A resize repaints at
   once, because sizing a canvas wipes it.

   Cheap: a canvas at a quarter scale, stretched by CSS, so the upscale is the
   blur. No filter — Chrome rasterises large blurs coarsely and the edges step.

   Progressive enhancement, same as the ledger: the CSS ellipses stay the
   ground until the canvas is actually drawing, so no-script, an error, or
   reduced motion all land on the page as it looks without this file.        */

(function () {
  var ground = document.querySelector('.np-ground');
  if (!ground) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SCALE = 0.25;
  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  /* cx/cy are fractions of the viewport, r is a fraction of its short side,
     a is peak alpha, c is off the CSS ground's own ramp — lifted, because a
     pool a third of the screen has to carry on its own what nine overlapping
     screen-sized ellipses used to build up between them. */
  var pools = [
    /* Weighted to the top, because that band was empty and the reading column
       is not — but covering the whole screen, because light confined to a strip
       is not a ground, it is a stripe.

       The brightness is the CSS ground's own ramp, up to #1c3a52 at the hot
       pool. An earlier pass capped these far lower to keep --np-faint at
       4.5:1, which was the wrong bar: the static ground this replaces already
       ran 3.13:1 to 4.20:1 under that text on four of its five pools. Matching
       the page rather than a rule it never met is what makes the light
       visible. What keeps it off the cards is the panel fill, not dimming —
       see --glass in work.css. */
    { cx: .14, cy: .04, r: .38, a: .62, p: 0.0, c: '23,45,62'  },
    { cx: .46, cy:-.02, r: .34, a: .55, p: 1.3, c: '28,58,84'  },
    { cx: .78, cy: .06, r: .36, a: .68, p: 2.6, c: '30,64,95'  },
    { cx: .96, cy: .22, r: .32, a: .74, p: 3.9, c: '38,78,110' },
    { cx: -.04, cy: .34, r: .30, a: .48, p: 5.1, c: '20,45,68'  },
    { cx: .62, cy: .44, r: .30, a: .42, p: 6.0, c: '22,48,72'  },
    /* two low and dim, so the bottom is not a hard edge where light stops */
    { cx: .20, cy: .74, r: .32, a: .30, p: 2.2, c: '16,36,52'  },
    { cx: .88, cy: .82, r: .30, a: .34, p: 4.4, c: '20,44,66'  },
    /* Six more through the middle and the foot, each the same four offset
       layers with a wavering edge — shapes, not rounds — so the light carries
       down the whole screen instead of pooling along the top. Spaced so they
       overlap at their edges, not their cores: where two cores met the ground
       would climb past the brightest the page already had, which is what the
       text sitting on it was measured against. */
    { cx: .30, cy: .26, r: .34, a: .40, p: 0.9, c: '24,52,78'  },
    { cx: .10, cy: .54, r: .36, a: .44, p: 3.2, c: '22,48,72'  },
    { cx: .46, cy: .66, r: .40, a: .40, p: 4.9, c: '24,52,78'  },
    { cx: .84, cy: .56, r: .34, a: .46, p: 1.8, c: '26,56,82'  },
    { cx: .62, cy: .94, r: .38, a: .36, p: 5.6, c: '20,45,68'  },
    { cx: -.02, cy: .96, r: .34, a: .34, p: 2.9, c: '20,44,66'  }
  ];

  var w, h, unit;
  function resize() {
    w = canvas.width  = Math.max(1, Math.ceil(innerWidth  * SCALE));
    h = canvas.height = Math.max(1, Math.ceil(innerHeight * SCALE));
    unit = Math.min(w, h);
  }
  resize();
  /* assigning canvas.width clears the bitmap, so the frame goes back on now
     rather than waiting for the next tick */
  addEventListener('resize', function () { resize(); draw(); }, { passive: true });

  ground.appendChild(canvas);
  ground.classList.add('lit');

  var t = 0, last = 0;
  var PACE = 0.0040 / (1000 / 60);    /* the chosen 0.0040 a frame, per ms */

  function tick(now) {
    /* clamped, so a tab coming back from the background does not jump the
       light half a cycle in one frame */
    if (last) t += Math.min(50, now - last) * PACE;
    last = now;
    draw();
    requestAnimationFrame(tick);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* the tide every pool rides together — one offset they all share, which
       is what moves the light as a body rather than jiggling its parts */
    var tideX = (Math.sin(t * 0.21) * .085 + Math.sin(t * 0.10 + 1.3) * .055) * w;
    var tideY = (Math.cos(t * 0.17 + .7) * .030 + Math.cos(t * 0.08) * .022) * h;

    for (var i = 0; i < pools.length; i++) {
      var l = pools[i];
      var bx = l.cx * w + tideX
             + (Math.sin(t * 1.10 + l.p) * .055
              + Math.sin(t * 0.47 + l.p * 2.3) * .035) * w;
      var by = l.cy * h + tideY
             + (Math.cos(t * 0.90 + l.p * 1.2) * .045
              + Math.cos(t * 0.38 + l.p * 1.8) * .030) * h;

      var baseR = l.r * unit;
      var lift = 1 + Math.sin(t * 0.41 + l.p * 2.1) * 0.30;

      for (var j = 0; j < 4; j++) {
        var ox = bx + Math.sin(t * (0.40 + j * .10) + j * 1.7 + l.p) * baseR * .30;
        var oy = by + Math.cos(t * (0.35 + j * .08) + j * 2.3 + l.p * .8) * baseR * .26;
        var sr = baseR * (0.55 + j * .12);
        var sa = Math.min(1, l.a * (0.46 - j * .06) * lift);

        var g = ctx.createRadialGradient(ox, oy, 0, ox, oy, sr * 1.2);
        g.addColorStop(0,  'rgba(' + l.c + ',' + sa.toFixed(4) + ')');
        g.addColorStop(.5, 'rgba(' + l.c + ',' + (sa * .32).toFixed(4) + ')');
        g.addColorStop(1,  'rgba(' + l.c + ',0)');
        ctx.fillStyle = g;

        /* a wobbling radius, so the pool has no edge you can find */
        ctx.beginPath();
        var steps = 22, seed = l.p + j * 3.14;
        for (var s = 0; s <= steps; s++) {
          var ang = (s / steps) * Math.PI * 2;
          var d = 1 + .24 * Math.sin(ang * 2 + t * .6 + seed)
                    + .15 * Math.sin(ang * 3 + t * .4 + seed * 1.7)
                    + .09 * Math.sin(ang * 5 + t * .9 + seed * .5);
          var pr = sr * d;
          var px = ox + Math.cos(ang) * pr, py = oy + Math.sin(ang) * pr;
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  draw();
  requestAnimationFrame(tick);
})();


/* The field that answers the pointer.

   The ground above holds still. This is the other half: a lattice of points
   over the page that only exists where the reader's pointer is, and only
   while it is moving. Stop, and it fades out from under you within a second.

   Movement-gated on purpose. A field that sits there glittering competes with
   the case for attention, and this page is long and wants reading. Tying it to
   speed means it answers a gesture and then gets out of the way, which is the
   difference between a response and a decoration.

   The points have homes. They are pushed off them by the pointer, pulled back
   by a weak spring, and damped, so the lattice deforms like cloth rather than
   scattering — after a sweep it settles back into the grid it started from.
   Lines are drawn between neighbours that are close enough, which is what
   makes it read as a fabric being disturbed and not a cloud of dots.

   Pointer only, and never under reduced motion: on a touch screen there is no
   hover to answer, and the whole thing would be dead weight on a phone.     */

(function () {
  var body = document.body;
  var voice = body.classList.contains('case-voice');
  if (!voice && !body.classList.contains('case-netpay')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(pointer: fine)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;z-index:3;pointer-events:none;width:100%;height:100%';
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.appendChild(canvas);

  var SPACING  = 38;    /* px between homes */
  var WAKE_R   = 185;   /* how far from the pointer a point is visible at all */
  var PUSH_R   = 145;   /* and how far it is shoved */
  var PUSH     = 4.2;
  var LINK_R   = 56;    /* neighbours closer than this get a line */
  var SPRING   = .006;  /* pull home — weak, so the deformation lingers */
  var DAMP     = .87;
  var DOT      = 1.15;
  /* Voice draws quavers instead of points, because the app is a singing show
     and a lattice of dots says nothing about it; NetPay keeps points, because
     a payments case with music floating over it would be a costume. The notes
     are larger and sparser — a glyph needs room a dot does not — and they are
     not joined up: lines between noteheads read as beams that mean something
     in notation, and these would be lying. */
  var TINT     = voice ? '244,228,228' : '150,190,235';
  /* Sparser than the points on NetPay, and sparser again after a first pass
     that read as a swarm. A note is a drawn shape, not a dot: a dozen of them
     is a phrase and fifty is confetti, so the grid is opened right out and the
     reach pulled in, which drops what is on screen at once to about a third.
     The glyphs keep their size — it was the count that was loud. */
  if (voice) { SPACING = 92; WAKE_R = 168; LINK_R = 0; DOT = 5.2; }
  /* past this a point can be neither lit nor shoved, squared for the test */
  var REACH2 = Math.pow(Math.max(WAKE_R, PUSH_R), 2);

  var w, h, dpr, pts = [];

  function seed() {
    pts = [];
    var cols = Math.ceil(w / SPACING) + 1, rows = Math.ceil(h / SPACING) + 1;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        /* jitter the homes, or the lattice reads as a screen door */
        var hx = c * SPACING + (Math.random() - .5) * SPACING * .55;
        var hy = r * SPACING + (Math.random() - .5) * SPACING * .55;
        pts.push({ hx: hx, hy: hy, x: hx, y: hy, vx: 0, vy: 0, a: 0,
                   /* a quaver or a crotchet, and its own lean */
                   flag: Math.random() < .62,
                   tilt: (Math.random() - .5) * .5,
                   size: DOT * (.85 + Math.random() * .4) });
      }
    }
  }

  function resize() {
    /* The canvas covers the screen and is cleared every frame, so each step
       of density is paid for in full. NetPay's dots are 2.3px across (DOT is
       a radius) and nothing past 1.5x shows in them; Voice's quaver strokes
       do soften, so it keeps 2. */
    dpr = Math.min(voice ? 2 : 1.5, devicePixelRatio || 1);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  var mx = -9999, my = -9999, lx = -9999, ly = -9999, speed = 0, running = false;

  addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    lx = mx; ly = my; mx = e.clientX; my = e.clientY;
    if (lx > -9999) speed = Math.min(60, Math.hypot(mx - lx, my - ly));
    if (!running) { running = true; requestAnimationFrame(loop); }
  }, { passive: true });

  /* Leaving the window. On the root, because pointerleave does not bubble and
     a listener on window never hears it. mx/my go back to -9999, which the
     next pointermove copies into lx/ly, so coming back in somewhere else does
     not read as one enormous flick. */
  document.documentElement.addEventListener('pointerleave', function () {
    mx = my = lx = ly = -9999; speed = 0;
  });

  /* A note drawn rather than typed: a font would hand the page a glyph at the
     mercy of whatever is installed, and at this size the flag is the only part
     that reads. Head, stem, and — on a quaver — one flag off the top. */
  function quaver(x, y, s, tilt, alpha, flag) {
    var col = 'rgba(' + TINT + ',' + alpha + ')';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(.9, s * .17);
    ctx.lineCap = 'round';
    ctx.beginPath();                       /* head, leaning as a drawn one does */
    ctx.ellipse(0, 0, s * .62, s * .46, -.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();                       /* stem */
    ctx.moveTo(s * .57, -s * .20);
    ctx.lineTo(s * .57, -s * 2.05);
    ctx.stroke();
    if (flag) {
      ctx.beginPath();
      ctx.moveTo(s * .57, -s * 2.05);
      ctx.quadraticCurveTo(s * 1.62, -s * 1.62, s * .98, -s * .72);
      ctx.stroke();
    }
    ctx.restore();
  }

  var FRAME = 1000 / 60, last = 0;    /* ms in the frame the rates count in */

  function loop(now) {
    /* Every rate here is a per-frame rate, and the frame is taken to be a
       60Hz one: on a 120Hz screen each frame is half a step, so the field
       fades and springs home in the same second on either. Clamped, so a
       stalled frame does not land as one great lurch. */
    var step = last ? Math.min(48, now - last) / FRAME : 1;
    last = now;
    var fade = Math.pow(.90, step), damp = Math.pow(DAMP, step),
        rise = 1 - Math.pow(.78, step), fall = 1 - Math.pow(.94, step);

    ctx.clearRect(0, 0, w, h);
    speed *= fade;
    var awake = speed > 1.2;

    var live = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var dx = p.x - mx, dy = p.y - my;
      var dd = dx * dx + dy * dy;

      /* Dark, home, still and out of reach: this frame would change nothing
         about it. That is almost the whole lattice at any moment — on NetPay
         some seventy of a thousand points sit near the pointer — so it is
         passed over rather than stepped. */
      if (p.a < .01 && dd >= REACH2 &&
          Math.abs(p.vx) + Math.abs(p.vy) < .01 &&
          Math.abs(p.hx - p.x) + Math.abs(p.hy - p.y) < .1) continue;
      var d  = Math.sqrt(dd);

      /* visible only near the pointer, and only while it is moving */
      var want = (awake && d < WAKE_R) ? (1 - d / WAKE_R) * Math.min(1, speed / 14) : 0;
      p.a += (want - p.a) * (want > p.a ? rise : fall);   /* quick in, slow out */

      if (d < PUSH_R && d > .01) {
        var f = (1 - d / PUSH_R) * PUSH * step;
        p.vx += (dx / d) * f * .12;
        p.vy += (dy / d) * f * .12;
      }
      p.vx = (p.vx + (p.hx - p.x) * SPRING * step) * damp;
      p.vy = (p.vy + (p.hy - p.y) * SPRING * step) * damp;
      p.x += p.vx * step; p.y += p.vy * step;

      if (p.a > .01) live.push(p);
    }

    /* links first, so the dots sit on top of their own web */
    ctx.lineWidth = 1;
    for (var a = 0; a < live.length; a++) {
      for (var b = a + 1; b < live.length; b++) {
        var q = live[a], s = live[b];
        var lx2 = q.x - s.x, ly2 = q.y - s.y;
        var ld = Math.hypot(lx2, ly2);
        if (ld > LINK_R) continue;
        var la = (1 - ld / LINK_R) * Math.min(q.a, s.a) * .42;
        if (la < .012) continue;
        ctx.strokeStyle = 'rgba(' + TINT + ',' + la.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
    }
    for (var k = 0; k < live.length; k++) {
      var v = live[k];
      var al = (v.a * .78).toFixed(3);
      if (!voice) {
        ctx.fillStyle = 'rgba(' + TINT + ',' + al + ')';
        ctx.beginPath(); ctx.arc(v.x, v.y, DOT, 0, Math.PI * 2); ctx.fill();
        continue;
      }
      quaver(v.x, v.y, v.size, v.tilt, (v.a * .62).toFixed(3), v.flag);
    }

    /* stand down once it has faded and the lattice has settled */
    if (!awake && !live.length) { running = false; last = 0; return; }
    requestAnimationFrame(loop);
  }
})();


/* The spark layer has to be the size of the document, not the screen.

   body.case-voice sizes its diagonals with background-size:50% 100%, and for
   a background on body those percentages resolve against the document box —
   here about 1037 by 9615, not the viewport. The overlay paints the same
   gradients and can only land on the same lines if it resolves them against
   the same box, and a percentage height on an absolutely positioned element
   cannot reach the document. So the height is set here and kept in step.

   Absolute rather than fixed for the same reason: the background scrolls with
   the page, so the light over it has to as well.                            */

(function () {
  var spark = document.querySelector('.vo-spark');
  if (!spark) return;

  function fit() {
    var d = document.documentElement;
    /* let go first: left at its old height the layer is part of what it
       measures, so it could grow with the page but never shrink with it */
    spark.style.height = '0px';
    spark.style.height = Math.max(d.scrollHeight, document.body.scrollHeight) + 'px';
  }
  fit();

  /* The page keeps growing after load — every lazy image that lands adds to it.
     Firing on load and on fonts.ready is not enough: both can pass while
     images below the fold are still arriving, and a layer even a little short
     resolves its 100% against a different height than the background does,
     which slides the whole pattern out of register. Watching the element that
     actually changes is the only version of this that stays correct. */
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { fit(); });
    ro.observe(document.documentElement);
    ro.observe(document.body);
  } else {
    var t;
    addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(fit, 150);
    }, { passive: true });
    addEventListener('load', fit);
  }
})();


/* Reveals.

   Three behaviours, and a short list of what gets which. The list is
   deliberately short: NetPay is 22,000px tall and holds thirty figures, and
   animating all of them would be confetti rather than rhythm.
   Section heads, plates, the design-system board, the quotes and the tallies
   are the things a reader arrives at; the rest simply is there.
   Voice runs the same plan — it shares the step, flow, sheet, kit, annot and
   tally markup — so both case pages arrive the same way. A selector with no
   match on a page simply arms nothing there. Two rows differ on Voice, which
   arms the flow and annotation panels themselves rather than their wrappers.
   That dates from when those panels were frosted: an armed wrapper — opacity,
   clip-path, will-change — becomes the limit of what a backdrop-filter inside
   it can see, so the panel would arrive unblurred and snap to frost once the
   classes came off. Both pages have their veil off now, so nothing depends
   on it any more; it stays because it is how Voice arrives.

   Two rules keep it honest:

   Anything already on screen when the script runs is never armed. It is
   shown, immediately, exactly as the stylesheet draws it. That removes the
   flash that entrance animations usually pay for — the split second where
   the top of a page is blank while a script decides what to do with it —
   and a reveal the reader could not have watched arrive is worth nothing.

   Nothing nested inside something already armed is armed again, or the
   device inside a plate inside an annotation would fade three times over.  */

(function () {
  var body = document.body;
  var hub = body.classList.contains('case-hub');
  if (!body.classList.contains('case-netpay') && !body.classList.contains('case-voice') && !hub) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var voice = body.classList.contains('case-voice');

  /* selector, behaviour, and whether the group staggers along its row */
  var PLAN = [
    ['.step-side',      'rise', 0],
    ['.stat',           'lift', 0],
    ['.chartfig',       'wipe', 0],
    [voice ? '.flowwrap' : '.flowfig', 'wipe', 0],
    ['.lofiwrap',       'wipe', 0],
    ['.sheet-shot',     'wipe', 70],
    ['.kit figure',     'lift', 45],
    [voice ? '.annot-shot' : '.annot', 'lift', 0],
    ['.quote',          'rise', 80],
    ['.tally div',      'rise', 60],
    ['.deflist > div',  'rise', 70]
  ];
  if (voice) PLAN.push(['.annot-note', 'rise', 0]);
  /* HUB took NetPay's layout (step, annot, sheet-shot), so NetPay's plan
     fits it as it stands; its own chain section adds the four role cards,
     arriving one after another along the row */
  if (hub) PLAN.push(['.hb-chain li', 'rise', 70]);

  /* Every position is read before anything is armed. A rect asked for just
     after a class went onto something else makes the browser restyle the page
     before it can answer — once per element, against the whole stylesheet —
     where two passes pay for it once. Nothing is lost by reading early: the
     classes only move what they are put on, and anything inside an armed
     element is skipped below regardless of where it sits. */
  var unseen = PLAN.map(function (row) {
    return [].slice.call(document.querySelectorAll(row[0])).filter(function (el) {
      /* already visible: leave it alone, it has nothing to arrive from */
      var r = el.getBoundingClientRect();
      return !(r.top < innerHeight && r.bottom > 0);
    });
  });

  var armed = [];
  PLAN.forEach(function (row, n) {
    var i = 0;
    unseen[n].forEach(function (el) {
      /* already covered by an ancestor's reveal */
      for (var p = el.parentElement; p; p = p.parentElement) {
        if (p.classList && p.classList.contains('rv')) return;
      }
      el.classList.add('rv', 'rv-' + row[1]);
      if (row[2]) { el.style.setProperty('--rv-d', (i % 6) * row[2] + 'ms'); i++; }
      armed.push(el);
    });
  });
  if (!armed.length) return;

  /* The compositing layer arrives a screen early and not before. will-change
     hangs off .rv-near rather than .rv, because on .rv every armed element was
     its own layer from load until the reader reached it — sixty-odd on this
     page, most of them screens away, and some never reached at all. */
  var near = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      near.unobserve(e.target);
      e.target.classList.add('rv-near');
    });
  }, { rootMargin: '100% 0px' });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      near.unobserve(e.target);
      e.target.classList.add('rv-in');
      /* hand it back to the stylesheet once it has arrived, layer and all:
         a will-change left on everything the reader has passed would grow
         into the same pile .rv-near exists to avoid */
      setTimeout(function () {
        e.target.classList.remove('rv', 'rv-near', 'rv-in', 'rv-wipe', 'rv-rise', 'rv-lift');
        e.target.style.removeProperty('--rv-d');
      }, 1200);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

  armed.forEach(function (el) { near.observe(el); io.observe(el); });
})();


/* The screen recordings play while they can be seen, and only then.

   They used to autoplay, and autoplay overrides preload: every clip on the
   page began downloading in full while the page was still parsing, ahead of
   the hero and the fonts, and then kept a decoder running for the whole visit
   while it sat screens away from the reader. The markup now leaves each one
   paused on its first frame (the #t=0.001 on its src is what gets iOS to paint
   that frame at all), which is also the whole of it with no script; this
   starts a clip half a screen before it comes into view and stops it once it
   has gone.

   No observer, or the reader asked for less motion: never started. The clip
   holds its first frame and gets its controls, so it plays on tap and not
   before.                                                                   */

(function () {
  var vids = document.querySelectorAll('.device video');
  if (!vids.length) return;

  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    vids.forEach(function (v) { v.controls = true; });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (!e.isIntersecting) { v.pause(); return; }
      v.muted = true;             /* a clip that might make a sound is refused */
      var go = v.play();
      if (go && go.catch) go.catch(function () {});   /* refused: first frame */
    });
  }, { rootMargin: '50% 0px' });

  vids.forEach(function (v) { io.observe(v); });
})();


/* The phone screens give the wheel back to the page.

   The long captures on Voice sit in phone frames that scroll them, and as
   plain scroll boxes they took the wheel from the page: with the pointer over
   one — and two sit side by side across the middle of the column — the page
   stood still while the phone ran through its capture. On a trackpad the whole
   flick is spent on the phone, so the reader came out of it on a page that
   would not move.

   So on a mouse or trackpad the wheel always scrolls the page, and a screen is
   scrolled the way a phone is: by dragging it. Tab still reaches it and the
   arrow keys still scroll it (the stylesheet hands a focused screen its scroll
   box back). Touch is left alone — a finger laid on a phone means the phone.
   Without this file the screens are the scroll boxes they always were.      */

(function () {
  var screens = document.querySelectorAll('.screen, .device.tall .screen-scroll');
  if (!screens.length) return;
  if (!matchMedia('(pointer: fine)').matches) return;

  screens.forEach(function (el) {
    var y0 = 0, top0 = 0, held = false;
    el.classList.add('held');
    el.tabIndex = 0;

    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      e.preventDefault();                 /* no text selection, no focus ring */
      y0 = e.clientY; top0 = el.scrollTop; held = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
    });
    el.addEventListener('pointermove', function (e) {
      if (held) el.scrollTop = top0 - (e.clientY - y0);
    });
    function drop() { held = false; el.classList.remove('dragging'); }
    el.addEventListener('pointerup', drop);
    el.addEventListener('pointercancel', drop);
    /* the capture is an <img>, which the browser would otherwise pick up */
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
})();


/* Skeletons: a frame that is still waiting for its picture says so.

   Only what has not arrived is marked — a cached image is complete before
   this runs and never shows one. The mark comes off when the picture can be
   painted, not when its bytes are in: load fires first and the decode
   follows, and taking the panel away in between leaves the frame empty for
   the frames the decode takes. A clip counts as arrived once its first frame
   is (loadeddata). An error takes the mark off too, so a broken file does not
   shimmer for ever. Without this file nothing is marked and the frames fill
   as they always did.                                                       */

(function () {
  document.querySelectorAll('main img, main video').forEach(function (el) {
    var clip = el.tagName === 'VIDEO';
    if (clip ? el.readyState >= 2 : el.complete) return;
    el.classList.add('skel');

    function done() { el.classList.remove('skel'); }
    el.addEventListener('error', done, { once: true });
    if (clip) { el.addEventListener('loadeddata', done, { once: true }); return; }
    el.addEventListener('load', function () {
      if (el.decode) el.decode().then(done, done); else done();
    }, { once: true });
  });
})();
