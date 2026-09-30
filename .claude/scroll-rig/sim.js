/* Wheel-gesture simulator for how-i-work-3d.html.
   Fires realistic macOS-trackpad / mouse wheel event streams at window,
   scheduled on requestAnimationFrame (timers are throttled in a hidden pane),
   records scrollY and the page's debug state every frame, and scores the run. */
window.__sim = (() => {
  const raf = () => new Promise(r => requestAnimationFrame(r));
  const wait = async ms => { const t = performance.now(); while (performance.now() - t < ms) await raf(); };
  const steps = () => [...document.querySelectorAll('.hw-step')];
  const anchors = () => [0, ...steps().map(s => s.getBoundingClientRect().top + scrollY),
    document.documentElement.scrollHeight - innerHeight];
  const sceneAt = y => { const a = anchors(); let b = 0, bd = 1e9;
    a.forEach((t, i) => { const d = Math.abs(t - y); if (d < bd) { bd = d; b = i; } }); return [b, +(y - a[b]).toFixed(1)]; };

  /* a trackpad swipe: finger ramp, a hold (optionally wobbling), then an exponential momentum tail */
  const trackpad = (dir, o = {}) => {
    const { peak = 30, ramp = 90, hold = 40, decay = .955, dt = 11, mdt = 16, wob = 0, jit = 0, int = false } = o;
    const ev = []; let t = 0;
    const n = Math.max(1, Math.round(ramp / dt));
    for (let i = 1; i <= n; i++) { ev.push([t, peak * Math.sin(i / n * Math.PI / 2)]); t += dt; }
    const h = Math.round(hold / dt);
    for (let i = 0; i < h; i++) { ev.push([t, peak * (1 + wob * Math.sin(i * 1.7))]); t += dt; }
    const fingers = ev.length;
    let d = peak, k = 0; while (d > .4) { d *= decay; ev.push([t, d * (1 + jit * Math.sin(++k * 2.3))]); t += mdt; }
    return ev.map(([t, d], i) => [t, dir * (int ? Math.max(1, Math.round(d)) : +d.toFixed(3)), 0, i >= fingers]);
  };
  const mouse = (dir, notches = 1, gap = 45, size = 100) =>
    Array.from({ length: notches }, (_, i) => [i * gap, dir * size]);

  /* gestures: [[startMs, events]]; a later gesture cuts the earlier one's tail (fingers stop momentum) */
  function compose(gs) {
    const out = [];
    gs.forEach(([t0, evs], k) => {
      /* fingers landing stop the momentum at least one event interval before the new swipe's first event */
      const nx = gs[k + 1], cad = nx && nx[1].length > 1 ? nx[1][1][0] - nx[1][0][0] : 8;
      const next = nx ? nx[0] - cad : Infinity;
      evs.forEach(([t, d, dx, m, mode]) => { if (t0 + t < next) out.push([t0 + t, d, dx, m, mode]); });
    });
    return out.sort((a, b) => a[0] - b[0]);
  }

  async function run(name, gs, expect, settle = 1700) {
    const evs = compose(gs);
    const s0 = sceneAt(scrollY)[0];
    const log0 = window.__hw ? __hw.log.length : 0;
    const rec = [];
    const T0 = performance.now();
    let k = 0;
    const end = evs.length ? evs[evs.length - 1][0] + settle : settle;
    while (performance.now() - T0 < end) {
      const now = performance.now() - T0;
      while (k < evs.length && evs[k][0] <= now) {
        const ev = new WheelEvent('wheel', { deltaY: evs[k][1], deltaX: evs[k][2] || 0, deltaMode: evs[k][4] || 0, bubbles: true,
          cancelable: true, clientX: innerWidth / 2, clientY: innerHeight / 2 });
        if (window.__simMomentum) Object.defineProperty(ev, 'momentum', { value: !!evs[k][3] });
        /* the event's own time, as the OS stamps it, even when a frame delivers several at once */
        if (!window.__simRawTime) Object.defineProperty(ev, 'timeStamp', { value: T0 + evs[k][0] });
        window.dispatchEvent(ev);
        k++;
      }
      await raf();
      const h = window.__hw;
      rec.push([performance.now() - T0, scrollY, h ? h.theta : null, h ? h.shown : null, h ? h.x : null]);
    }
    const r = score(name, rec, s0, expect);
    if (window.__hw) r.pages = __hw.log.slice(log0).map(l => l.aim);
    return r;
  }

  function score(name, rec, s0, expect) {
    const [s1, off] = sceneAt(scrollY);
    const v = [];
    for (let i = 1; i < rec.length; i++) {
      const dt = (rec[i][0] - rec[i - 1][0]) / 1000;
      if (dt > 0) v.push([rec[i][0], (rec[i][1] - rec[i - 1][1]) / dt, dt * 1000]);
    }
    let rev = 0, sg0 = 0;
    for (const [, vv] of v) { if (Math.abs(vv) < 8) continue; const sg = Math.sign(vv); if (sg0 && sg !== sg0) rev++; sg0 = sg; }
    const vmax = Math.max(0, ...v.map(x => Math.abs(x[1])));
    let jolt = 0; for (let i = 1; i < v.length; i++) jolt = Math.max(jolt, Math.abs(v[i][1] - v[i - 1][1]));
    const mv = rec.filter((r, i) => i && Math.abs(r[1] - rec[i - 1][1]) > .01);
    const first = mv.length ? Math.round(mv[0][0]) : null;
    const last = mv.length ? Math.round(mv[mv.length - 1][0]) : null;
    /* creep: time spent crawling (<40px/s) while still moving */
    let creep = 0; for (const [, vv, dt] of v) if (Math.abs(vv) > 0 && Math.abs(vv) < 40) creep += dt;
    const dts = v.map(x => x[2]).sort((a, b) => a - b);
    const med = dts.length ? dts[dts.length >> 1] : 0;
    const long = v.filter(x => x[2] > med * 1.8).length;
    const r = { name, moved: s1 - s0, expect, ok: s1 - s0 === expect && Math.abs(off) < 1.5, off, reversals: rev,
      vmax: Math.round(vmax), jolt: Math.round(jolt), firstMoveMs: first, settleMs: last,
      creepMs: Math.round(creep), frameMs: +med.toFixed(1), longFrames: long };
    if (rec[0] && rec[0][2] !== null) {
      let dth = 0, swaps = [];
      for (let i = 2; i < rec.length; i++) {
        const w1 = (rec[i][2] - rec[i - 1][2]) / Math.max(1, rec[i][0] - rec[i - 1][0]);
        const w0 = (rec[i - 1][2] - rec[i - 2][2]) / Math.max(1, rec[i - 1][0] - rec[i - 2][0]);
        dth = Math.max(dth, Math.abs(w1 - w0) * 1000);   /* change of spin speed between frames, rad/s */
        if (rec[i][3] !== rec[i - 1][3]) swaps.push(+(((rec[i][2] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / Math.PI).toFixed(2));
      }
      let dx = 0; for (let i = 1; i < rec.length; i++) dx = Math.max(dx, Math.abs(rec[i][4] - rec[i - 1][4]));
      Object.assign(r, { maxDTheta: +dth.toFixed(3), swapAtPi: swaps, maxDx: +dx.toFixed(3) });
    }
    return r;
  }

  async function goScene(i) {
    const a = anchors(); i = Math.max(0, Math.min(a.length - 1, i));
    const html = document.documentElement, sb = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto'; window.scrollTo(0, a[i]); html.style.scrollBehavior = sb;
    await wait(1900);
    return sceneAt(scrollY);
  }

  const S = {
    swipe:      () => [[0, trackpad(1)]],
    flick:      () => [[0, trackpad(1, { peak: 90, ramp: 60 })]],
    slowDrag:   () => [[0, trackpad(1, { peak: 12, ramp: 200, hold: 520, wob: .55 })]],
    tiny:       () => [[0, [[0, .6], [16, .8], [32, .5]]]],
    twoSwipes:  () => [[0, trackpad(1)], [650, trackpad(1)]],
    quickTwo:   () => [[0, trackpad(1)], [300, trackpad(1)]],
    reverse:    () => [[0, trackpad(1)], [450, trackpad(-1)]],
    swipeUp:    () => [[0, trackpad(-1)]],
    notch:      () => [[0, mouse(1)]],
    spin5:      () => [[0, mouse(1, 5, 40)]],
    notchTwice: () => [[0, mouse(1)], [450, mouse(1)]],
    endBlip:    () => { const e = trackpad(1); e.splice(12, 0, [e[11][0] + 5, -1]); return [[0, e]]; },
    startBlip:  () => [[0, [[0, -1]]], [14, trackpad(1)]],
    rapid3:     () => [[0, trackpad(1)], [260, trackpad(1)], [520, trackpad(1)]],
    lateRev:    () => [[0, trackpad(1)], [1000, trackpad(-1)]],
    revMidSpin: () => [[0, trackpad(1)], [700, trackpad(-1)]],
    noisyTail:  () => [[0, trackpad(1, { jit: .06 })]],
    safari:     () => [[0, trackpad(1, { int: true })]],
    safariTwo:  () => [[0, trackpad(1, { int: true })], [700, trackpad(1, { int: true })]],
    gentle2nd:  () => [[0, trackpad(1)], [600, trackpad(1, { peak: 12, ramp: 250 })]],
    steadyDrag: () => [[0, trackpad(1, { peak: 8, ramp: 120, hold: 900 })]],
    zeroMid:    () => { const e = trackpad(1); e.splice(20, 0, [e[19][0] + 3, 0]); return [[0, e]]; },
    sideMid:    () => { const e = trackpad(1); for (let i = 14; i < 26; i++) e[i] = [e[i][0], e[i][1] * .3, e[i][1], e[i][3]]; return [[0, e]]; },
    merged:     () => { const e = trackpad(1), m = []; for (let i = 0; i < e.length; i++) {
                    if (i > 14 && i % 3 === 0 && e[i + 1]) { m.push([e[i + 1][0], e[i][1] + e[i + 1][1], 0, e[i + 1][3]]); i++; } else m.push(e[i]); } return [[0, m]]; },
    liftRoll:   () => { const e = trackpad(1); const t = e[12][0]; e.splice(12, 0, [t + 2, -1], [t + 5, -2.5], [t + 8, -1.5]); return [[0, e]]; },
    early2nd:   () => [[0, trackpad(1)], [230, trackpad(1)]],
    ffDetent:   () => [[0, [[0, 3, 0, false, 1], [30, -1, 0, false, 1]]]],
    ffTwo:      () => [[0, [[0, 3, 0, false, 1]]], [400, [[0, 3, 0, false, 1]]]],
    stallMerge: () => { const e = trackpad(1), i = 20, j = e.findIndex(x => x[0] > e[i][0] + 200);
                    const sum = e.slice(i, j).reduce((a, x) => a + x[1], 0); return [[0, [...e.slice(0, i), [e[j - 1][0], sum, 0, true], ...e.slice(j)]]]; },
    sideFirst:  () => { const e = trackpad(1); e.unshift([-8, 0, -3, false]); return [[8, e]]; },
  };
  async function suite(names, startScene = 1) {
    const out = [];
    for (const n of names) {
      const start = typeof startScene === 'function' ? startScene(n) : startScene;
      await goScene(start);
      const expect = { swipe: 1, flick: 1, slowDrag: 1, tiny: 0, twoSwipes: 2, quickTwo: 2, reverse: 0,
        swipeUp: -1, notch: 1, spin5: 1, notchTwice: 2, endBlip: 1, startBlip: 1, rapid3: 3, lateRev: 0,
        revMidSpin: 0, noisyTail: 1, safari: 1, safariTwo: 2, gentle2nd: 2, steadyDrag: 1,
        zeroMid: 1, sideMid: 1, merged: 1, liftRoll: 1, early2nd: 2, ffDetent: 1, ffTwo: 2, stallMerge: 1, sideFirst: 0 }[n];
      out.push(await run(n, S[n](), expect));
    }
    return out;
  }
  return { trackpad, mouse, run, suite, goScene, sceneAt, anchors, S };
})();
'sim ready';
