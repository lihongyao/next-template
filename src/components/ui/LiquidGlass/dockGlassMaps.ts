/**
 * Displacement / specular map generation for the Drag Dock–style SVG glass filter
 * (see LiquidGlass/test.html — initDockDemo).
 */

const SurfaceEquations = {
  convex_squircle: (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4),
};

function calculateDisplacementMap1D(
  gt: number,
  bw: number,
  sf: (x: number) => number,
  ri: number,
  s = 128,
) {
  const e = 1 / ri;
  const r: number[] = [];
  for (let i = 0; i < s; i++) {
    const x = i / s;
    const y = sf(x);
    const dx = x < 1 ? 0.0001 : -0.0001;
    const d = (sf(Math.max(0, Math.min(1, x + dx))) - y) / dx;
    const m = Math.sqrt(d * d + 1);
    const n = [-d / m, -1 / m];
    const dt = n[1];
    const k = 1 - e * e * (1 - dt * dt);

    if (k < 0) {
      r.push(0);
    } else {
      const rf = [-(e * dt + Math.sqrt(k)) * n[0], e - (e * dt + Math.sqrt(k)) * n[1]];
      r.push(rf[0] * ((y * bw + gt) / rf[1]));
    }
  }
  return r;
}

function calculateDisplacementMap2D(
  cw: number,
  ch: number,
  ow: number,
  oh: number,
  rad: number,
  bw: number,
  md: number,
  pMap: number[],
) {
  const img = new ImageData(cw, ch);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 128;
    img.data[i + 1] = 128;
    img.data[i + 3] = 255;
  }
  const rSq = rad * rad;
  const rp1Sq = (rad + 1) ** 2;
  const rmBwSq = Math.max(0, rad - bw) ** 2;
  const wB = ow - rad * 2;
  const hB = oh - rad * 2;
  const oX = (cw - ow) / 2;
  const oY = (ch - oh) / 2;

  for (let y1 = 0; y1 < oh; y1++) {
    for (let x1 = 0; x1 < ow; x1++) {
      const idx = ((oY + y1) * cw + oX + x1) * 4;
      const x = x1 < rad ? x1 - rad : x1 >= ow - rad ? x1 - rad - wB : 0;
      const y = y1 < rad ? y1 - rad : y1 >= oh - rad ? y1 - rad - hB : 0;
      const dSq = x * x + y * y;

      if (dSq <= rp1Sq && dSq >= rmBwSq) {
        const dist = Math.sqrt(dSq);
        const op = dSq < rSq ? 1 : 1 - (dist - rad) / (Math.sqrt(rp1Sq) - rad);
        const bIdx = Math.floor(Math.max(0, Math.min(1, (rad - dist) / bw)) * pMap.length);
        const dVal = pMap[Math.max(0, Math.min(bIdx, pMap.length - 1))] || 0;
        const dX = md > 0 ? (-(dist > 0 ? x / dist : 0) * dVal) / md : 0;
        const dY = md > 0 ? (-(dist > 0 ? y / dist : 0) * dVal) / md : 0;

        img.data[idx] = Math.max(0, Math.min(255, 128 + dX * 127 * op));
        img.data[idx + 1] = Math.max(0, Math.min(255, 128 + dY * 127 * op));
      }
    }
  }
  return img;
}

function calculateSpecularHighlight(ow: number, oh: number, rad: number, bw: number) {
  const img = new ImageData(ow, oh);
  const sVec = [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)];
  const rSq = rad * rad;
  const rp1Sq = (rad + 1) ** 2;
  const rmSSq = Math.max(0, (rad - 1.5) ** 2);

  for (let y1 = 0; y1 < oh; y1++) {
    for (let x1 = 0; x1 < ow; x1++) {
      const x = x1 < rad ? x1 - rad : x1 >= ow - rad ? x1 - rad - (ow - rad * 2) : 0;
      const y = y1 < rad ? y1 - rad : y1 >= oh - rad ? y1 - rad - (oh - rad * 2) : 0;
      const dSq = x * x + y * y;

      if (dSq <= rp1Sq && dSq >= rmSSq) {
        const dist = Math.sqrt(dSq);
        const op = dSq < rSq ? 1 : 1 - (dist - rad) / (Math.sqrt(rp1Sq) - rad);
        const dp = Math.abs(
          (dist > 0 ? x / dist : 0) * sVec[0] + (dist > 0 ? -y / dist : 0) * sVec[1],
        );
        const cf = dp * Math.sqrt(1 - (1 - Math.max(0, Math.min(1, (rad - dist) / 1.5))) ** 2);
        const c = Math.min(255, 255 * cf);
        const idx = (y1 * ow + x1) * 4;

        img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = c;
        img.data[idx + 3] = Math.min(255, c * cf * op);
      }
    }
  }
  return img;
}

function imageDataToDataURL(img: ImageData) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

export interface DockGlassMapsResult {
  displacementDataUrl: string;
  specularDataUrl: string;
  /** Pass to feDisplacementMap `scale` (see test.html dock). */
  displacementScale: number;
  width: number;
  height: number;
}

/** rounded-t-3xl ≈ 1.5rem */
const DEFAULT_CORNER_RADIUS = 24;

/**
 * Builds data URLs for feImage nodes in the dock-style glass filter.
 * Call only in the browser (uses canvas + document).
 */
export function buildDockGlassFilterMaps(
  ow: number,
  oh: number,
  cornerRadius: number = DEFAULT_CORNER_RADIUS,
): DockGlassMapsResult {
  const w = Math.max(64, Math.round(ow));
  const h = Math.max(48, Math.round(oh));
  const gt = 120;
  const bw = 26;
  const ri = 2.0;
  const pc = calculateDisplacementMap1D(gt, bw, SurfaceEquations.convex_squircle, ri);
  const md = Math.max(...pc.map(Math.abs));
  const rad = Math.min(cornerRadius, Math.floor(Math.min(w, h) / 2));

  const disp = calculateDisplacementMap2D(w, h, w, h, rad, bw, md, pc);
  const spec = calculateSpecularHighlight(w, h, rad, bw);

  return {
    displacementDataUrl: imageDataToDataURL(disp),
    specularDataUrl: imageDataToDataURL(spec),
    displacementScale: Math.min(40, md * 1.5),
    width: w,
    height: h,
  };
}
