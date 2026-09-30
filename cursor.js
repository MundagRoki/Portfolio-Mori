/* The cursor, after milancompain.com's (owner's asking, 2026-09-30: "copy
   this cursor"; it replaced the хэт цахиур drawn the same day). Measured off
   theirs in headless Chrome: a 5px dot that all but sits on the pointer (.9
   of the way each frame, there in ~50ms) and a 28px ring, 1px, that glides
   after it (.14 a frame, settled in ~.7s), both in difference so they show
   dark on anything light; over a link the ring eases up to 1.57 and the link
   leans a few px toward it; pressed, the ring draws in to .92 of that and its
   rim takes the accent (theirs green, ours the matte gold) while the dot
   swells to 1.39; moving, it sheds a little dust (theirs green, ours gold).
   Their "visit" bubble over a project is ours as a larger ring reading
   "View" over any link to a case page. What can be dragged (the drum, the
   gerege, the Experience cards, a case page's long phone screens) takes the
   link state, since the grab hand is hidden with the rest of the native
   cursor. A fine pointer with motion allowed only: on touch, or under
   reduced motion, the system cursor stays. It runs only while something is
   still moving, so at rest nothing is drawn. */
(function(){
  const OK = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  if (!OK.matches || !document.body.animate) return;

  const VIEW = 'a[href^="work-"]';
  const HOT = 'a[href],button:not(:disabled),[role=button],label[for],summary,' +
    '.gerege-hang,.xp-card.is-draggable,.wr-t.is-grab,.held';
  const MAGNET = '.onav a';
  const GOLD = '#c4a464', IVORY = 'rgba(239,231,218,.9)';

  const style = document.createElement('style');
  style.textContent = `
html.cur-on,html.cur-on *{cursor:none !important}
.cur-ring,.cur-dot,.cur-view,.cur-dust{position:fixed;left:0;top:0;z-index:10000;pointer-events:none;border-radius:50%}
.cur-ring,.cur-dot{mix-blend-mode:difference;opacity:0;transition:opacity .3s cubic-bezier(.22,1,.36,1)}
.cur-ring{width:28px;height:28px;margin:-14px 0 0 -14px;border:1px solid ${IVORY};transition:opacity .3s cubic-bezier(.22,1,.36,1),border-color .25s cubic-bezier(.22,1,.36,1)}
.cur-ring.is-down{border-color:${GOLD}}
.cur-dot{width:5px;height:5px;margin:-2.5px 0 0 -2.5px;background:#efe7da}
.cur-on.cur-shown .cur-ring,.cur-on.cur-shown .cur-dot{opacity:1}
.cur-view{width:76px;height:76px;margin:-38px 0 0 -38px;display:grid;place-items:center;opacity:0;
  border:1px solid rgba(196,164,100,.75);background:rgba(8,6,4,.55);
  -webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);
  font:500 9.5px/1 'Golos Text',system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#efe7da}
.cur-view span{display:flex;align-items:center;gap:6px;padding-left:.22em}
.cur-view i{width:5px;height:5px;background:${GOLD};transform:rotate(45deg)}
.cur-dust{width:3px;height:3px;margin:-1.5px 0 0 -1.5px;background:${GOLD}}
.cur-on ${MAGNET}{transition:color .3s,transform .4s cubic-bezier(.22,1,.36,1)}`;
  document.head.appendChild(style);

  const mk = (cls, html) => { const e = document.createElement('div'); e.className = cls; e.setAttribute('aria-hidden', 'true'); if (html) e.innerHTML = html; document.body.appendChild(e); return e; };
  const ring = mk('cur-ring'), dot = mk('cur-dot'), view = mk('cur-view', '<span><i></i>View</span>');
  const root = document.documentElement;
  root.classList.add('cur-on');

  /* where the pointer is, where the dot and ring are, and their scales */
  let mx = -100, my = -100, dx = mx, dy = my, rx = mx, ry = my;
  let rs = 1, ds = 1, vs = .4, vo = 0, kind = '', down = false, shown = false;
  let raf = 0, last = 0, lastDust = null, dust = 0, magnet = null;

  function set(e){
    mx = e.clientX; my = e.clientY;
    const t = e.target instanceof Element ? e.target : null;
    kind = t && t.closest(VIEW) ? 'view' : t && t.closest(HOT) ? 'hot' : '';
    /* a link in the bar leans toward the pointer, a few px at most */
    const m = t && t.closest(MAGNET);
    if (m !== magnet){ if (magnet) magnet.style.transform = ''; magnet = m; }
    if (m){
      const b = m.getBoundingClientRect();
      const ox = Math.max(-4, Math.min(4, (mx - b.left - b.width / 2) * .18));
      const oy = Math.max(-3, Math.min(3, (my - b.top - b.height / 2) * .25));
      m.style.transform = `translate(${ox.toFixed(1)}px,${oy.toFixed(1)}px)`;
    }
  }
  function show(v){ if (v !== shown){ shown = v; root.classList.toggle('cur-shown', v); } }
  /* dust is shed where the pointer is, one grain every 26px of its path */
  function shed(){
    if (lastDust && Math.hypot(mx - lastDust[0], my - lastDust[1]) < 26) return;
    lastDust = [mx, my];
    if (dust >= 16) return;
    const p = document.createElement('div');
    p.className = 'cur-dust'; p.setAttribute('aria-hidden', 'true');
    p.style.transform = `translate3d(${mx.toFixed(1)}px,${my.toFixed(1)}px,0)`;
    document.body.appendChild(p); dust++;
    const ex = mx + (Math.random() - .5) * 12, ey = my + 4 + Math.random() * 10;
    p.animate([
      {transform: `translate3d(${mx.toFixed(1)}px,${my.toFixed(1)}px,0) scale(1)`, opacity: .85},
      {transform: `translate3d(${ex.toFixed(1)}px,${ey.toFixed(1)}px,0) scale(.35)`, opacity: 0}
    ], {duration: 600 + Math.random() * 250, easing: 'cubic-bezier(.22,1,.36,1)'}).onfinish = () => { p.remove(); dust--; };
  }
  function frame(t){
    const f = last ? Math.min(4, (t - last) / 16.667) : 1; last = t;
    const k = (a) => 1 - Math.pow(1 - a, f);
    dx += (mx - dx) * k(.9); dy += (my - dy) * k(.9);
    rx += (mx - rx) * k(.14); ry += (my - ry) * k(.14);
    const tr = kind === 'view' ? .6 : (kind === 'hot' ? 1.57 : 1) * (down ? .92 : 1);
    const td = kind === 'view' ? 0 : down ? 1.39 : 1;
    rs += (tr - rs) * k(.2); ds += (td - ds) * k(.25);
    vs += ((kind === 'view' ? 1 : .4) - vs) * k(.18); vo += ((kind === 'view' ? 1 : 0) - vo) * k(.2);
    ring.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0) scale(${rs.toFixed(3)})`;
    ring.style.opacity = shown ? (1 - vo).toFixed(3) : '';
    dot.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${ds.toFixed(3)})`;
    view.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0) scale(${vs.toFixed(3)})`;
    view.style.opacity = (shown ? vo : 0).toFixed(3);
    const still = Math.abs(mx - rx) < .1 && Math.abs(my - ry) < .1 && Math.abs(mx - dx) < .1 && Math.abs(my - dy) < .1 &&
      Math.abs(tr - rs) < .002 && Math.abs(td - ds) < .002 && Math.abs((kind === 'view' ? 1 : 0) - vo) < .002;
    if (still){ raf = 0; last = 0; } else raf = requestAnimationFrame(frame);
  }
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    if (!shown){ dx = rx = e.clientX; dy = ry = e.clientY; }
    set(e); show(true); shed(); go();
  }, {passive: true});
  addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; ring.classList.add('is-down'); go(); }, {passive: true});
  addEventListener('pointerup', () => { down = false; ring.classList.remove('is-down'); go(); }, {passive: true});
  /* off the window, or the page hidden: out of sight until it comes back */
  document.addEventListener('mouseout', e => { if (!e.relatedTarget){ show(false); if (magnet){ magnet.style.transform = ''; magnet = null; } go(); } });
  addEventListener('blur', () => { show(false); go(); });
  /* a wheel or a scroll changes what is under a pointer that hasn't moved */
  addEventListener('scroll', () => {
    if (!shown) return;
    const t = document.elementFromPoint(mx, my);
    if (t) set({clientX: mx, clientY: my, target: t});
    go();
  }, {passive: true});

  /* Шагай (owner's asking, 2026-09-30: "I want шагай to appear when I click
     my mouse"): each click tosses four, as the game does, from the pointer.
     They fly up and out spinning, land a little below on one of their four
     sides (морь, тэмээ, хонь, ямаа: the four pictures, cut out of the
     owner's sheet, art/site/_source/shagai/), bounce once, rest, and fade.
     Dragged (the button held while it moves; the owner's asking the same
     day: "when I drag I want them to appear constantly"), one hops off the
     path every 30px of it, a smaller throw, so a drag leaves a trail of
     them; the drum, the gerege and the cards too. 22px tall (30 at first:
     "a little bit smaller"). At most 40 in the air. */
  const FACES = [1, 2, 3, 4].map(n => `art/site/shagai/shagai-${n}.webp`);
  FACES.forEach(u => { const i = new Image(); i.src = u; });
  const toss = document.createElement('style');
  toss.textContent = `.cur-shagai{position:fixed;left:0;top:0;z-index:9999;height:22px;width:auto;margin:-11px 0 0 -15px;
  pointer-events:none;filter:drop-shadow(0 1.5px 1.5px rgba(0,0,0,.45));will-change:transform,opacity}`;
  document.head.appendChild(toss);
  let flying = 0, trail = null;
  const r = (a, b) => a + Math.random() * (b - a);
  const at = (x, y, a, sc) => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${a.toFixed(1)}deg) scale(${sc})`;
  /* one шагай from (x, y): out by dx, up to peak, down to land; it comes to
     rest on a side, near level, bounces once and fades */
  function throwOne(x, y, dx, peak, land, spinMax, dur, delay){
    if (flying >= 40) return;
    const s = document.createElement('img');
    s.className = 'cur-shagai'; s.alt = ''; s.setAttribute('aria-hidden', 'true');
    s.src = FACES[Math.floor(Math.random() * 4)];
    s.style.left = x + 'px'; s.style.top = y + 'px';
    document.body.appendChild(s); flying++;
    const r0 = r(-40, 40), spin = (Math.random() < .5 ? -1 : 1) * r(spinMax * .5, spinMax);
    const rest = Math.round((r0 + spin) / 360) * 360 + r(-12, 12), dir = Math.sign(spin);
    s.animate([
      {transform: at(0, 0, r0, .45), opacity: 0, easing: 'cubic-bezier(.2,.7,.4,1)'},
      {transform: at(dx * .15, peak * .45, r0 + spin * .2, .9), opacity: 1, offset: .08, easing: 'cubic-bezier(.3,.6,.5,1)'},
      {transform: at(dx * .55, peak, r0 + spin * .6, 1), opacity: 1, offset: .34, easing: 'cubic-bezier(.5,0,.8,.4)'},
      {transform: at(dx, land, rest, 1), opacity: 1, offset: .58, easing: 'cubic-bezier(.2,.6,.4,1)'},
      {transform: at(dx + dir * 2, land - 4, rest + dir * 8, 1), opacity: 1, offset: .66, easing: 'cubic-bezier(.5,0,.7,.5)'},
      {transform: at(dx + dir * 3, land, rest, 1), opacity: 1, offset: .74},
      {transform: at(dx + dir * 3, land, rest, 1), opacity: 1, offset: .86},
      {transform: at(dx + dir * 3, land + 2, rest, .96), opacity: 0}
    ], {duration: dur, delay, fill: 'backwards'}).onfinish = () => { s.remove(); flying--; };
  }
  addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button) return;
    for (let n = 0; n < 4; n++)
      throwOne(e.clientX, e.clientY, (n - 1.5) * 30 + r(-8, 8), -r(32, 56), r(12, 26), 540, r(1500, 1800), n * 28);
    trail = [e.clientX, e.clientY];
  }, {passive: true});
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !(e.buttons & 1) || !trail) return;
    if (Math.hypot(e.clientX - trail[0], e.clientY - trail[1]) < 30) return;
    trail = [e.clientX, e.clientY];
    throwOne(e.clientX, e.clientY, r(-14, 14), -r(12, 26), r(8, 18), 380, r(1100, 1350), 0);
  }, {passive: true});
  addEventListener('pointerup', () => { trail = null; }, {passive: true});
})();
