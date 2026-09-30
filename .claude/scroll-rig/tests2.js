window.__t2 = (() => {
  const raf = () => new Promise(r => requestAnimationFrame(r));
  const wait = async ms => { const t = performance.now(); while (performance.now() - t < ms) await raf(); };
  const key = (k, o = {}) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o }));
  const at = () => __sim.sceneAt(scrollY);
  const state = () => ({ scene: at(), on: __hw.on, shown: __hw.shown, aim: __hw.aim });
  return {
    async keys() {
      const out = {};
      await __sim.goScene(0);
      key('ArrowDown'); await wait(1300); out.down1 = at();
      key('ArrowDown'); await wait(1300); out.down2 = at();
      key('ArrowDown'); key('ArrowDown'); await wait(1800); out.downTwiceFast = at();
      key('End'); await wait(1600); out.end = at();
      key('ArrowDown'); await wait(600); out.pastEnd = at();
      key('Home'); await wait(1800); out.home = at();
      key('PageUp'); await wait(600); out.pastTop = at();
      key(' '); await wait(1300); out.space = at();
      key(' ', { shiftKey: true }); await wait(1300); out.shiftSpace = at();
      return out;
    },
    async held() {
      await __sim.goScene(0);
      const t0 = performance.now(); key('ArrowDown');
      await wait(500);
      while (performance.now() - t0 < 1500) { key('ArrowDown', { repeat: true }); await wait(33); }
      await wait(1500);
      return { afterHold1500ms: at() };
    },
    async nav() {
      await __sim.goScene(0);
      const a = document.querySelector('.hw-nav a[href="#s4"]');
      const vis = getComputedStyle(document.querySelector('.hw-nav')).display;
      a.click(); await wait(1700);
      return { navDisplay: vis, afterClickS4: at(), hash: location.hash, state: state() };
    },
    async resizeRest() { return null; },
    async endTwice() {
      await __sim.goScene(6);
      let maxY = 0; const t0 = performance.now(); let alive = true;
      (async () => { while (alive) { maxY = Math.max(maxY, scrollY); await raf(); } })();
      key('ArrowDown'); await wait(250); key('ArrowDown'); await wait(1300); alive = false;
      const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      return { scene: at(), maxY: Math.round(maxY), max, aim: __hw.aim };
    },
    async grabMid() {
      await __sim.goScene(1);
      const p = __sim.run('swipe', __sim.S.swipe(), 1, 400);
      await wait(250);
      const y = scrollY + 37; window.scrollTo(0, y);        /* a scrollbar grab mid-glide */
      await p; await wait(1200);
      const heldAt = at();
      const r = await __sim.run('swipeAfterGrab', __sim.S.swipe(), 1);
      return { heldAt, then: at(), pages: r.pages };
    },
    async between() {
      await __sim.goScene(2);
      const a = __sim.anchors();
      window.scrollTo(0, a[2] + (a[3] - a[2]) * .7); await wait(400);    /* 70% of the way to scene 3 */
      const r1 = await __sim.run('downFromBetween', __sim.S.swipe(), 1);
      window.scrollTo(0, a[2] + (a[3] - a[2]) * .7); await wait(400);
      const r2 = await __sim.run('upFromBetween', __sim.S.swipeUp(), -1);
      return { down: at(), downPages: r1.pages, upPages: r2.pages };
    },
    async defaultPrevented() {
      const e = new WheelEvent('wheel', { deltaY: 30, bubbles: true, cancelable: true });
      window.dispatchEvent(e);
      await wait(1500);
      return { prevented: e.defaultPrevented, w: innerWidth };
    },
    state,
  };
})();
'tests2 ready';
