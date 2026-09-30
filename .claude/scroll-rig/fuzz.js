window.__fuzz = (() => {
  const mb = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = (r, lo, hi) => lo + (hi - lo) * r();
  function swipeSpec(r, hz) {
    return { peak: pick(r, 8, 110), ramp: pick(r, 40, 240), hold: r() < .6 ? pick(r, 0, 120) : pick(r, 120, 600),
      decay: hz === 120 ? pick(r, .965, .985) : pick(r, .93, .97), dt: hz === 120 ? 8.3 : 16.7, mdt: hz === 120 ? 8.3 : 16.7,
      jit: r() < .5 ? 0 : pick(r, 0, .06), wob: r() < .7 ? 0 : pick(r, 0, .25), int: r() < .4 };
  }
  async function run(seed, n, startScene = 2) {
    const r = mb(seed), out = { cases: 0, fails: [] };
    for (let i = 0; i < n; i++) {
      const kind = r() < .4 ? 'single' : r() < .7 ? 'pair' : 'reverse';
      const hz = r() < .5 ? 60 : 120;                        /* one device: one cadence */
      const a = swipeSpec(r, hz), b = swipeSpec(r, hz);
      const gap = a.ramp + a.hold + pick(r, 40, 1100);        /* fingers lift before they swipe again */
      const gs = kind === 'single' ? [[0, __sim.trackpad(1, a)]]
        : kind === 'pair' ? [[0, __sim.trackpad(1, a)], [gap, __sim.trackpad(1, b)]]
        : [[0, __sim.trackpad(1, a)], [gap, __sim.trackpad(-1, b)]];
      const expect = kind === 'single' ? 1 : kind === 'pair' ? 2 : 0;
      await __sim.goScene(startScene);
      const res = await __sim.run(kind + i, gs, expect, 900);
      out.cases++;
      if (!res.ok) out.fails.push({ i, kind, gap: Math.round(gap), moved: res.moved, pages: res.pages,
        a: Object.fromEntries(Object.entries(a).map(([k, v]) => [k, typeof v === 'number' ? +v.toFixed(3) : v])),
        b: kind === 'single' ? null : Object.fromEntries(Object.entries(b).map(([k, v]) => [k, typeof v === 'number' ? +v.toFixed(3) : v])) });
    }
    return out;
  }
  return { run };
})();
'fuzz ready';
