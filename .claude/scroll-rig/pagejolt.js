window.__pj = trace => {
  /* page-side: frame intervals, scroll speed jumps and spin-speed jumps, from the page's own frames */
  const iv = [], dv = [], dw = [];
  for (let i = 2; i < trace.length; i++) {
    const [t0, y0, a0] = trace[i - 2], [t1, y1, a1] = trace[i - 1], [t2, y2, a2] = trace[i];
    const d1 = (t1 - t0) / 1000, d2 = (t2 - t1) / 1000; if (!(d1 > 0 && d2 > 0)) continue;
    iv.push(t2 - t1);
    dv.push(Math.abs((y2 - y1) / d2 - (y1 - y0) / d1));
    dw.push(Math.abs((a2 - a1) / d2 - (a1 - a0) / d1));
  }
  const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(s.length * p))].toFixed(1); };
  return { frames: iv.length, intervalMedian: q(iv, .5), intervalMax: q(iv, 1), scrollJoltMax: q(dv, 1), spinJumpMax: q(dw, 1) };
};
'pj ready';
