import { buildQRSvg, qrModules, svgAspect, type QRStyle } from "./render";

export type ExportFormat = "png" | "jpg" | "svg" | "pdf" | "eps";

export const EXPORT_FORMATS: { label: string; value: ExportFormat }[] = [
  { label: "PNG", value: "png" },
  { label: "JPG", value: "jpg" },
  { label: "SVG", value: "svg" },
  { label: "PDF", value: "pdf" },
  { label: "EPS", value: "eps" },
];

export const EXPORT_SIZES = [300, 500, 1000, 2000, 3000];

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function svgToCanvas(
  svg: string,
  width: number,
  height: number,
  bg: string,
  isTransparent = false,
) {
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not rasterise the QR code"));
      img.src = blobUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    if (!isTransparent) {
      ctx.fillStyle = bg || "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function buildEps(value: string, style: QRStyle, size: number) {
  const rows = qrModules(value, style.logo ? "H" : style.ecc);
  const modules = rows.length;
  const margin = Math.max(0, Math.min(8, style.margin));
  const total = modules + margin * 2;
  const unit = size / total;
  const hex = (c: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(c.trim());
    const v = (m ? m[1] : "000000") ?? "000000";
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  };
  const [fr, fg, fb] = hex(style.fg);
  const [br, bg, bb] = hex(style.bg);
  const lines: string[] = [
    "%!PS-Adobe-3.0 EPSF-3.0",
    `%%BoundingBox: 0 0 ${Math.ceil(size)} ${Math.ceil(size)}`,
    "%%Creator: BT-QR",
    "%%EndComments",
    `${br} ${bg} ${bb} setrgbcolor 0 0 ${size} ${size} rectfill`,
    `${fr} ${fg} ${fb} setrgbcolor`,
  ];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (!rows[y]?.[x]) continue;
      const px = (x + margin) * unit;
      const py = size - (y + margin + 1) * unit;
      lines.push(`${px.toFixed(2)} ${py.toFixed(2)} ${unit.toFixed(2)} ${unit.toFixed(2)} rectfill`);
    }
  }
  lines.push("showpage", "%%EOF");
  return lines.join("\n");
}

export interface DownloadOptions {
  value: string;
  style: QRStyle;
  format: ExportFormat;
  size: number;
  filename?: string;
}

export async function downloadQR({
  value,
  style,
  format,
  size,
  filename = "qr-code",
}: DownloadOptions) {
  const aspect = svgAspect(style);
  const width = size;
  const height = Math.round(size / aspect);
  const svg = buildQRSvg({ value, style, size: width });

  if (format === "svg") {
    triggerDownload(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${filename}.svg`);
    return;
  }
  if (format === "eps") {
    triggerDownload(new Blob([buildEps(value, style, size)], { type: "application/postscript" }), `${filename}.eps`);
    return;
  }

  const isTransparent = Boolean(style.bgTransparent && format === "png");
  const canvas = await svgToCanvas(svg, width, height, style.bg, isTransparent);

  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: width >= height ? "landscape" : "portrait",
      unit: "px",
      format: [width, height],
    });
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
    doc.save(`${filename}.pdf`);
    return;
  }

  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      mime,
      format === "jpg" ? 0.92 : undefined,
    ),
  );
  triggerDownload(blob, `${filename}.${format}`);
}

interface SnapshotOptions {
  value: string;
  style: QRStyle;
  title: string;
  caption?: string;
  filename?: string;
  copy?: boolean;
}

/**
 * Renders the QR preview into a shareable "snapshot" card image
 * (branded background + white card + title/caption) and downloads or
 * copies it as a PNG.
 */
export async function snapshotQRCard({
  value,
  style,
  title,
  caption,
  filename = "qr-snapshot",
  copy = false,
}: SnapshotOptions) {
  const W = 1080;
  const H = 1350;
  const qrSize = 720;
  const aspect = svgAspect(style);
  const qrHeight = Math.round(qrSize / aspect);
  const qrCanvas = await svgToCanvas(
    buildQRSvg({ value, style, size: qrSize }),
    qrSize,
    qrHeight,
    style.bg,
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0c2340");
  bg.addColorStop(0.55, "#1a4a6e");
  bg.addColorStop(1, "#2d8a9e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cardX = 90;
  const cardY = 210;
  const cardW = W - cardX * 2;
  const cardH = qrHeight + 260;
  ctx.save();
  ctx.shadowColor = "rgba(4, 20, 38, 0.45)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 48);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(qrCanvas, Math.round((W - qrSize) / 2), cardY + 90, qrSize, qrHeight);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 34px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("SCAN ME", W / 2, 130);

  ctx.fillStyle = "#0c2340";
  ctx.font = "700 44px Sora, 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(title.slice(0, 34), W / 2, cardY + cardH - 100);

  if (caption) {
    ctx.fillStyle = "#5b6b80";
    ctx.font = "400 28px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(caption.length > 46 ? `${caption.slice(0, 46)}…` : caption, W / 2, cardY + cardH - 48);
  }

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 28px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Made with BT-QR", W / 2, H - 90);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Snapshot failed"))), "image/png"),
  );

  if (copy && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "copied" as const;
  }
  triggerDownload(blob, `${filename}.png`);
  return "downloaded" as const;
}
