import saveAs from 'file-saver';
import html2canvas from 'html2canvas-pro';

export type ExportType = 'png' | 'jpg';

function autoFileName(type: ExportType) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const ts =
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    '-' +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());

  return `img-${ts}.${type}`;
}

export async function exportImg(
  ref: React.RefObject<HTMLElement | null>,
  type: ExportType,
  filename?: string,
) {
  if (!ref.current) return;
  const node = ref.current;
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scrollX: 0,
    scrollY: 0,
    scale: 1,
    useCORS: true,
  });

  const finalName = filename || autoFileName(type);

  canvas.toBlob(
    (blob) => {
      if (blob) saveAs(blob, finalName);
    },
    type === 'png' ? 'image/png' : 'image/jpeg',
    0.92,
  );
}

export async function exportSvg(
  ref: React.RefObject<HTMLElement | null>,
  type: ExportType,
  filename?: string,
  exportSize: number = 388,
) {
  if (!ref.current) return;

  const svg = ref.current.querySelector('svg');
  if (!svg) {
    console.error('未找到 SVG');
    return;
  }

  const serializer = new XMLSerializer();
  let svgText = serializer.serializeToString(svg);
  if (!svgText.includes('xmlns')) {
    svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = exportSize;
  canvas.height = exportSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, exportSize, exportSize);

  ctx.drawImage(img, 0, 0, exportSize, exportSize);

  URL.revokeObjectURL(url);

  const finalName = filename || autoFileName(type);
  canvas.toBlob(
    (blob) => {
      if (blob) {
        saveAs(blob, finalName);
      }
    },
    type === 'png' ? 'image/png' : 'image/jpeg',
    0.92,
  );
}
