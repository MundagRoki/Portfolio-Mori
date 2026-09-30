/* the scrubbed pour (step 1 -> 2 in paging mode): the wheel moves the pour
   frame by frame; it lets go at either end. __scrub.all() runs the cases */
window.__scrub = (() => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const st = () => ({ scrub: __hw.scrub, y: Math.round(scrollY), on: __hw.on, shown: __hw.shown, frame: __hw.frame, sharp: __hw.sharp });
  const settle = async () => { for (let k = 0; k < 40; k++) { const s = __hw.scrub; if (!s || s.p === s.d) break; await wait(100); } await wait(600); return st(); };
  async function notches(n, dir, gap = 60) { for (let k = 0; k < n; k++) { window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 * dir, deltaMode: 0, bubbles: true, cancelable: true })); await wait(gap); } }
  return {
    async throughAndBack(sc = 1) { await __sim.goScene(sc); await wait(1200);
      for (let k = 0; k < 10 && (__hw.on === Math.max(0, sc - 1) || __hw.scrub); k++) { await __sim.run('s' + k, __sim.S.swipe(), 1); await wait(300); }
      const end = await settle(); const r = await __sim.run('up', __sim.S.swipeUp(), -1); await wait(2200); return { end, back: st(), upPages: r.pages }; },
    async reverseMidAt(sc) { await __sim.goScene(sc); await wait(1200); await __sim.run('d', __sim.S.swipe(), 1); await __sim.run('d2', __sim.S.swipe(), 1); const mid = await settle(); await __sim.run('u', __sim.S.swipeUp(), -1); await __sim.run('u2', __sim.S.swipeUp(), -1); await __sim.run('u3', __sim.S.swipeUp(), -1); const end = await settle(); return { mid, end }; },
    async reverseMid() { await __sim.goScene(1); await wait(1200); await __sim.run('d', __sim.S.swipe(), 1); const mid = await settle();
      await __sim.run('u', __sim.S.swipeUp(), -1); const end = await settle(); return { mid, end }; },
    async mouse() { await __sim.goScene(1); await wait(1200); await notches(8, 1, 120); const mid = await settle(); await notches(30, 1, 90); const end = await settle(); return { mid, end }; },
    async keyMid() { await __sim.goScene(1); await wait(1200); await notches(12, 1, 90); const mid = await settle();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })); await wait(2200); return { mid, after: st() }; },
    async keyPour() { await __sim.goScene(1); await wait(1200); const log = [];
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      for (let k = 0; k < 20; k++) { await wait(250); log.push(__hw.pour); } return { pours: log.filter(x => x != null).length, end: st() }; },
  };
})();
'scrub ready';
/* the reviewers' turn cases (keys drive the timed pour) */
window.__turns = (() => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const key = (k, shift) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: !!shift, bubbles: true, cancelable: true }));
  const watch = async ms => { const log = []; const t0 = performance.now(); let prevPour = null, jumps = 0;
    while (performance.now() - t0 < ms) { await new Promise(r => requestAnimationFrame(r)); const p = __hw.pour;
      if (prevPour != null && p == null && Math.abs((__hw.theta / (2 * Math.PI)) % 1) > .02 && Math.abs((__hw.theta / (2 * Math.PI)) % 1) < .98) jumps++;
      if (prevPour != null && p != null && Math.abs(p - prevPour) > .08) jumps++;
      prevPour = p; log.push(p); }
    return { jumps, end: { on: __hw.on, shown: __hw.shown, frame: __hw.frame, sharp: __hw.sharp, pour: __hw.pour } }; };
  return {
    async lateUp() { await __sim.goScene(1); await wait(1500); key('ArrowDown'); await wait(2400); const at = __hw.pour; key('ArrowUp'); const r = await watch(4500); return { at, ...r }; },
    async upThenDown() { await __sim.goScene(2); await wait(2500); key('ArrowUp'); await wait(1000); const th = +__hw.theta.toFixed(2); key('ArrowDown'); const r = await watch(3500); return { th, ...r }; },
    async twoDown() { await __sim.goScene(1); await wait(1500); key('ArrowDown'); await wait(1100); const at = __hw.pour; key('ArrowDown'); const r = await watch(5000); return { at, ...r }; },
    async swipeDuringSpin() { await __sim.goScene(2); await wait(2500); __sim.run('u', __sim.S.swipeUp(), -1); await wait(750); __sim.run('d', __sim.S.swipe(), 1); const r = await watch(3500); return { scrubAfter: __hw.scrub, ...r }; },
  };
})();
'turns ready';
