/* at rest on each scene: the object's box against the copy, and its top against the header */
window.__ov = async () => {
  const out = [];
  const hdr = document.querySelector('.top'), hb = hdr ? hdr.getBoundingClientRect().bottom : 0;
  for (let i = 0; i <= 6; i++) {
    await __sim.goScene(i); await new Promise(r => setTimeout(r, 2200));
    const step = document.querySelectorAll('.hw-step')[Math.max(0, i - 1)], box = (i === 0 ? document.querySelector('.hw-lead') : step);
    const kids = [...box.children].filter(k => k.getBoundingClientRect().height > 0);
    const cl = Math.min(...kids.map(k => k.getBoundingClientRect().left)), cr = Math.max(...kids.map(k => { const r = k.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(k); const rr = range.getBoundingClientRect(); return Math.min(r.right, rr.right || r.right); }));
    const [ol, orr] = __hw.box();
    const vis = [...document.querySelectorAll('canvas.hw-card')].filter(c => c.style.visibility === 'visible');
    const r = vis[0] ? vis[0].getBoundingClientRect() : null;
    out.push({ scene: i, shown: __hw.shown, overlapPx: Math.round(Math.max(0, Math.min(cr, orr) - Math.max(cl, ol))), cards: vis.length,
      top: r ? Math.round(r.top) : null, bottom: r ? Math.round(r.bottom) : null, hdr: Math.round(hb), vh: innerHeight, frame: __hw.frame, sharp: __hw.sharp });
  }
  return out;
};
'ov ready';
