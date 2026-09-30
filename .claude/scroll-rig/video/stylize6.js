// stylize.js: step 6 (ayaga + khadag) restyle, "surface first".
//
// window.stylize(imageData, scale) edits imageData.data in place and returns it.
// scale = frame height / 954 (1 for hi/f000, 540/954 for the turning frames); every
// radius is multiplied by it. Only RGB changes, only where alpha > 0; alpha is never
// written. Frames are un-premultiplied, so every spatial filter is alpha-weighted
// (sum(w*x)/sum(w)): transparent pixels never bleed into edge colours. Fixed
// parameters, no statistics of the frame, nothing random: the same pixel neighbourhood
// always gives the same output, frame after frame.
//
// Pipeline, in OKLab:
//  1. chroma a,b: alpha-weighted self-guided filter per channel (r 8, eps 6e-4): drops
//     the blotchy blue tint of the tarnish and the colour noise of the weave, keeps the
//     khadag / silver / wood colour edges (big steps in a or b).
//  2. L fine base B1: self-guided filter (r 2, eps 8e-4); L - B1 is grain.
//  3. L structure base S: domain-transform recursive filter on B1 (Gastal & Oliveira
//     2011; sigma_s 18px, sigma_r 0.35, 3 iterations, guide = B1 + 1.5 x smoothed
//     chroma + alpha). Its distance grows with the per-pixel step, so hard edges (rim,
//     band lines, engraving, folds' creases, fringe) stop it and the soft-edged
//     tarnish clouds and jacquard motifs are flattened into satin.
//  4. L = S + kM (B1 - S) + kF (L - B1) + kK (S - blur(S, 36px)), with the band gains
//     per material (soft colour masks from the smoothed chroma) and pushed back to 1
//     where the fine base is dense with hard steps (mean |grad B1| over 6px), so the
//     engraving, the rim and the fringe fibres stay crisp while flat areas go smooth.
//  5. grade: khadag chroma x0.6, hue +4 deg (away from cyan), L -0.07 and contrast
//     x0.85, softer glints; silver/airag: blue tint folded to a slight warm
//     (b >= 0.010), +0.005 b; exposure x0.97, highlight roll-off above L 0.84.
(() => {
  const P = Object.freeze({
    rF: 2, epsF: 0.0008,                        // fine base (guided filter)
    kF: 0.45, kFb: 0.35,                        // fine-band gain: default, khadag
    dtS: 18, dtR: 0.35, dtIt: 3, dtC: 1.5,      // domain transform: sigma_s px, sigma_r, iterations, chroma weight in guide
    kM: 0.45, kMs: 0.2, kMb: 0.2,               // mid-band gain: default (wood), silver/airag, khadag
    rE: 6, kE: 0.85,                            // edge density window px; how far dense hard detail restores the gains
    e0: 0.035, e1: 0.07, e0b: 0.04, e1b: 0.058, // edge-density ramp: default, khadag
    rC: 8, epsC: 0.0006,                        // chroma smoothing (guided filter)
    rK: 36, kK: 0.3, kKb: 0.4,                  // clarity: blur radius px, gain default, gain khadag
    expo: 0.97,
    knee: 0.80, roll: 0.20, kneeB: 0.55, rollB: 0.12, // highlight roll-off: default, khadag
    warmA: 0, warmB: 0.005,                     // warm white balance (off on the khadag)
    silverB: 0.010, silverFold: 0.8,            // silver: fold blue tint up to this b
    blueC: 0.62, blueHue: 6, blueL: -0.10, blueLc: 0.85, blueRef: 0.57, // khadag grade
    cB0: 0.04, cB1: 0.075, cN0: 0.03, cN1: 0.05, // mask ramps (OKLab chroma): khadag vs blue-tinted silver; neutral vs wood
  });
  const S2L = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const c = i / 255; S2L[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  const LN = 16384, L2S = new Uint8ClampedArray(LN + 1);
  for (let i = 0; i <= LN; i++) { const c = i / LN; L2S[i] = Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)); }

  function boxH(src, dst, W, H, r) {
    for (let y = 0; y < H; y++) {
      const o = y * W; let s = 0; const e = Math.min(r, W - 1);
      for (let x = 0; x <= e; x++) s += src[o + x];
      for (let x = 0; x < W; x++) {
        dst[o + x] = s;
        const xa = x + r + 1, xs = x - r;
        if (xa < W) s += src[o + xa];
        if (xs >= 0) s -= src[o + xs];
      }
    }
  }
  function boxV(src, dst, W, H, r, col) {
    col.fill(0);
    const e = Math.min(r, H - 1);
    for (let y = 0; y <= e; y++) { const o = y * W; for (let x = 0; x < W; x++) col[x] += src[o + x]; }
    for (let y = 0; y < H; y++) {
      const o = y * W;
      for (let x = 0; x < W; x++) dst[o + x] = col[x];
      const ya = y + r + 1, ys = y - r;
      if (ya < H) { const oa = ya * W; for (let x = 0; x < W; x++) col[x] += src[oa + x]; }
      if (ys >= 0) { const os = ys * W; for (let x = 0; x < W; x++) col[x] -= src[os + x]; }
    }
  }

  window.stylize = (id, scale) => {
    const W = id.width, H = id.height, N = W * H, D = id.data;
    const F = () => new Float32Array(N);
    const tmp = F(), col = new Float64Array(W);
    const box = (src, dst, r) => { boxH(src, tmp, W, H, r); boxV(tmp, dst, W, H, r, col); return dst; };
    const R = (r) => Math.max(1, Math.round(r * scale));

    // 1. OKLab + alpha weights
    const L = F(), A = F(), B = F(), w = F();
    for (let i = 0, p = 0; i < N; i++, p += 4) {
      const al = D[p + 3]; w[i] = al / 255;
      if (al === 0) continue;
      const r = S2L[D[p]], g = S2L[D[p + 1]], b = S2L[D[p + 2]];
      const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      L[i] = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
      A[i] = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
      B[i] = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    }
    const WB = {};
    const wb = (r) => WB[r] || (WB[r] = box(w, F(), r));
    const t1 = F(), t2 = F(), t3 = F(), t4 = F();
    const wmean = (src, r, dst) => {
      for (let i = 0; i < N; i++) t1[i] = w[i] * src[i];
      box(t1, dst, r); const Wb = wb(r);
      for (let i = 0; i < N; i++) dst[i] = Wb[i] > 1e-5 ? dst[i] / Wb[i] : src[i];
      return dst;
    };
    // alpha-weighted self-guided filter (He et al.)
    const gf = (I, r, eps, out) => {
      const Wb = wb(r);
      for (let i = 0; i < N; i++) { const v = w[i] * I[i]; t1[i] = v; t2[i] = v * I[i]; }
      box(t1, t3, r); box(t2, t4, r);
      for (let i = 0; i < N; i++) {
        const q = Wb[i];
        if (q > 1e-5) { const m = t3[i] / q, v = Math.max(0, t4[i] / q - m * m), a = v / (v + eps); t3[i] = a; t4[i] = m - a * m; }
        else { t3[i] = 1; t4[i] = 0; }
      }
      for (let i = 0; i < N; i++) { t1[i] = w[i] * t3[i]; t2[i] = w[i] * t4[i]; }
      box(t1, t3, r); box(t2, t4, r);
      for (let i = 0; i < N; i++) { const q = Wb[i]; out[i] = q > 1e-5 ? (t3[i] / q) * I[i] + t4[i] / q : I[i]; }
      return out;
    };

    // 2. chroma: self-guided per channel
    const As = gf(A, R(P.rC), P.epsC, F()), Bs = gf(B, R(P.rC), P.epsC, F());
    // 3. fine base
    const B1 = gf(L, R(P.rF), P.epsF, F());
    // 4. structure base: domain-transform recursive filter (Gastal & Oliveira 2011) on B1,
    //    alpha weighted; the domain distance grows with the guide's per-pixel step, so hard edges
    //    (rim, band lines, engraving, creases) stop it and soft blotches and weave do not.
    const dx = F(), dy = F();
    const k = P.dtS * scale / P.dtR, gc = P.dtC;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (x > 0) { const j = i - 1; dx[i] = 1 + k * (Math.abs(B1[i] - B1[j]) + gc * (Math.abs(As[i] - As[j]) + Math.abs(Bs[i] - Bs[j])) + 2 * Math.abs(w[i] - w[j])); }
      if (y > 0) { const j = i - W; dy[i] = 1 + k * (Math.abs(B1[i] - B1[j]) + gc * (Math.abs(As[i] - As[j]) + Math.abs(Bs[i] - Bs[j])) + 2 * Math.abs(w[i] - w[j])); }
    }
    const S = F(), Sw = F();
    for (let i = 0; i < N; i++) { S[i] = w[i] * B1[i]; Sw[i] = w[i]; }
    const sS = P.dtS * scale, n = P.dtIt;
    { const la = -Math.SQRT2 / (sS * Math.sqrt(3) * Math.pow(2, n - 1) / Math.sqrt(Math.pow(4, n) - 1));
      for (let i = 0; i < N; i++) { dx[i] = Math.exp(la * dx[i]); dy[i] = Math.exp(la * dy[i]); } }
    for (let it = 0; it < n; it++) {
      // sigma_H halves each iteration, so its coefficients a^d square
      if (it > 0) for (let i = 0; i < N; i++) { dx[i] *= dx[i]; dy[i] *= dy[i]; }
      const cf = dx;
      for (let y = 0; y < H; y++) {
        const o = y * W;
        for (let x = 1; x < W; x++) { const i = o + x, c = cf[i]; S[i] += c * (S[i - 1] - S[i]); Sw[i] += c * (Sw[i - 1] - Sw[i]); }
        for (let x = W - 2; x >= 0; x--) { const i = o + x, c = cf[i + 1]; S[i] += c * (S[i + 1] - S[i]); Sw[i] += c * (Sw[i + 1] - Sw[i]); }
      }
      // vertical
      const cv = dy;
      for (let y = 1; y < H; y++) { const o = y * W; for (let x = 0; x < W; x++) { const i = o + x, c = cv[i]; S[i] += c * (S[i - W] - S[i]); Sw[i] += c * (Sw[i - W] - Sw[i]); } }
      for (let y = H - 2; y >= 0; y--) { const o = y * W; for (let x = 0; x < W; x++) { const i = o + x, c = cv[i + W]; S[i] += c * (S[i + W] - S[i]); Sw[i] += c * (Sw[i + W] - Sw[i]); } }
    }
    for (let i = 0; i < N; i++) S[i] = Sw[i] > 1e-4 ? S[i] / Sw[i] : B1[i];
    // 5. clarity: local contrast of the structure base against a wide weighted blur
    const Sm = wmean(wmean(S, R(P.rK), F()), R(P.rK), F());
    // 5b. edge density of the fine base: mean |grad B1| over a small window, per original pixel
    const G = F();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; G[i] = 0.5 * (Math.abs(B1[i + 1] - B1[i - 1]) + Math.abs(B1[i + W] - B1[i - W])) * scale; }
    const E = wmean(G, R(P.rE), F());

    // 6. recombine + grade
    const knee = P.knee, roll = P.roll;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let i = 0, p = 0; i < N; i++, p += 4) {
      if (D[p + 3] === 0) continue;
      const C = Math.hypot(As[i], Bs[i]);
      const h = Math.atan2(Bs[i], As[i]) * 180 / Math.PI; // blue ~ -106
      const hueW = sm(-150, -130, h) * (1 - sm(-80, -60, h));
      const cB = sm(P.cB0, P.cB1, C);                       // khadag vs blue-tinted silver
      const blue = hueW * cB;
      const neut = hueW * (1 - cB) + (1 - hueW) * (1 - sm(P.cN0, P.cN1, C));
      const ge = P.kE * sm(P.e0 + (P.e0b - P.e0) * blue, P.e1 + (P.e1b - P.e1) * blue, E[i]);
      let kM = P.kM + (P.kMs - P.kM) * neut + (P.kMb - P.kM) * blue; kM += (1 - kM) * ge;
      const kF0 = P.kF + (P.kFb - P.kF) * blue, kF = kF0 + (1 - kF0) * ge;
      const kK = P.kK + (P.kKb - P.kK) * blue;
      let l = S[i] + kM * (B1[i] - S[i]) + kF * (L[i] - B1[i]) + kK * (S[i] - Sm[i]);
      l *= P.expo;
      let a = As[i], b = Bs[i];
      if (hueW > 0) {                                       // every blue-hue pixel: calmer, a little less cyan
        const kc = 1 + (P.blueC - 1) * hueW, th = P.blueHue * hueW * Math.PI / 180;
        const c = Math.cos(th), s = Math.sin(th);
        const na = (a * c - b * s) * kc, nb = (a * s + b * c) * kc; a = na; b = nb;
        l += blue * (P.blueL + (P.blueLc - 1) * (l - P.blueRef));
      }
      a += P.warmA * (1 - blue); b += P.warmB * (1 - blue);
      if (neut > 0) { const bf = Math.max(b, P.silverB); b += (bf - b) * P.silverFold * neut; }
      { const kn = knee + (P.kneeB - knee) * blue, ro = roll + (P.rollB - roll) * blue;   // softer glints on the silk
        if (l > kn) { const x = l - kn; l = kn + x / (1 + x / ro); } }
      const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
      const l3 = l_ * l_ * l_, m3 = m_ * m_ * m_, s3 = s_ * s_ * s_;
      const R_ = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const G_ = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const B_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
      D[p] = L2S[Math.round(Math.min(1, Math.max(0, R_)) * LN)];
      D[p + 1] = L2S[Math.round(Math.min(1, Math.max(0, G_)) * LN)];
      D[p + 2] = L2S[Math.round(Math.min(1, Math.max(0, B_)) * LN)];
    }
    return id;
  };
})();
