/**
 * 基于 [liquid-glass.js](https://github.com/shuding/liquid-glass/blob/main/liquid-glass.js) 的圆角矩形 SDF 位移贴图（非 liquid-diamond）。
 * Tab 栏胶囊现改用 `liquidDiamondDisplacement.ts`（棱锥折射）。
 */

function smoothStep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function roundedRectSDF(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

/** 与 liquid-glass.js createLiquidGlass 中 fragment 一致（归一化 UV） */
function liquidGlassFragment(uv: { x: number; y: number }): { x: number; y: number } {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
  const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
  const scaled = smoothStep(0, 1, displacement);
  return {
    x: ix * scaled + 0.5,
    y: iy * scaled + 0.5,
  };
}

function imageDataToDataURL(img: ImageData): string {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

export interface LiquidGlassDisplacementResult {
  displacementDataUrl: string;
  /** feDisplacementMap 的 scale，与 liquid-glass.js updateShader 一致 */
  displacementScale: number;
  width: number;
  height: number;
}

/**
 * 生成位移图（仅 R/G 通道），浏览器内调用。
 */
export function buildLiquidGlassDisplacementMap(
  w: number,
  h: number,
): LiquidGlassDisplacementResult {
  const cw = Math.max(1, Math.round(w));
  const ch = Math.max(1, Math.round(h));
  const data = new Uint8ClampedArray(cw * ch * 4);
  let maxScale = 0;
  const rawValues: number[] = [];

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const uv = { x: x / cw, y: y / ch };
      const pos = liquidGlassFragment(uv);
      const dx = pos.x * cw - x;
      const dy = pos.y * ch - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }
  }

  maxScale *= 0.5;
  const safeScale = Math.max(maxScale, 1e-6);

  let index = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = rawValues[index++]! / safeScale + 0.5;
    const g = rawValues[index++]! / safeScale + 0.5;
    data[i] = Math.max(0, Math.min(255, r * 255));
    data[i + 1] = Math.max(0, Math.min(255, g * 255));
    data[i + 2] = 0;
    data[i + 3] = 255;
  }

  const img = new ImageData(data, cw, ch);
  return {
    displacementDataUrl: imageDataToDataURL(img),
    displacementScale: safeScale,
    width: cw,
    height: ch,
  };
}
