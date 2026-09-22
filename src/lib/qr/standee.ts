import { buildQRSvg, type QRStyle } from "./render";

export type StandeeTheme = "modern_blue" | "dark_gold" | "vibrant_purple" | "emerald_green" | "clean_minimal";

export interface StandeeThemeConfig {
  id: StandeeTheme;
  label: string;
  bgGradStart: string;
  bgGradEnd: string;
  cardBg: string;
  textColor: string;
  subtitleColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export const STANDEE_THEMES: StandeeThemeConfig[] = [
  {
    id: "modern_blue",
    label: "Modern Blue",
    bgGradStart: "#0a192f",
    bgGradEnd: "#1e293b",
    cardBg: "#ffffff",
    textColor: "#ffffff",
    subtitleColor: "#94a3b8",
    accentColor: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.15)",
    badgeText: "#38bdf8",
  },
  {
    id: "dark_gold",
    label: "Luxury Gold",
    bgGradStart: "#09090b",
    bgGradEnd: "#1c1917",
    cardBg: "#ffffff",
    textColor: "#fafaf9",
    subtitleColor: "#a8a29e",
    accentColor: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeText: "#fbbf24",
  },
  {
    id: "vibrant_purple",
    label: "Neon Purple",
    bgGradStart: "#2e1065",
    bgGradEnd: "#1e1b4b",
    cardBg: "#ffffff",
    textColor: "#faf5ff",
    subtitleColor: "#c084fc",
    accentColor: "#e879f9",
    badgeBg: "rgba(232, 121, 249, 0.15)",
    badgeText: "#f0abfc",
  },
  {
    id: "emerald_green",
    label: "Fresh Green",
    bgGradStart: "#064e3b",
    bgGradEnd: "#0f172a",
    cardBg: "#ffffff",
    textColor: "#f0fdf4",
    subtitleColor: "#86efac",
    accentColor: "#34d399",
    badgeBg: "rgba(52, 211, 153, 0.15)",
    badgeText: "#34d399",
  },
  {
    id: "clean_minimal",
    label: "Clean Studio",
    bgGradStart: "#f8fafc",
    bgGradEnd: "#e2e8f0",
    cardBg: "#ffffff",
    textColor: "#0f172a",
    subtitleColor: "#64748b",
    accentColor: "#2563eb",
    badgeBg: "rgba(37, 99, 235, 0.1)",
    badgeText: "#2563eb",
  },
];

export interface StandeeOptions {
  qrValue: string;
  qrStyle: QRStyle;
  characterSrc: string;
  panelRect?: { left: number; top: number; width: number } | undefined;
  title: string;
  subtitle?: string | undefined;
  theme?: StandeeTheme | undefined;
  badgeText?: string | undefined;
  isCustomCharacter?: boolean | undefined;
  watermark?: boolean | undefined;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Builds high-resolution Standee poster canvas (1200 x 1600)
 */
export async function renderStandeeCanvas(opts: StandeeOptions): Promise<HTMLCanvasElement> {
  const width = 1200;
  const height = 1600;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context is unavailable");

  const themeConfig = STANDEE_THEMES.find((t) => t.id === opts.theme) ?? STANDEE_THEMES[0]!;

  // 1. Draw Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, themeConfig.bgGradStart);
  grad.addColorStop(1, themeConfig.bgGradEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Background ambient circles/accents
  ctx.save();
  ctx.beginPath();
  ctx.arc(width * 0.85, 200, 350, 0, Math.PI * 2);
  ctx.fillStyle = themeConfig.badgeBg;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width * 0.15, height * 0.8, 300, 0, Math.PI * 2);
  ctx.fillStyle = themeConfig.badgeBg;
  ctx.fill();
  ctx.restore();

  // 2. Poster Outer Card / Border
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 4;
  roundRect(ctx, 30, 30, width - 60, height - 60, 40);
  ctx.stroke();
  ctx.restore();

  // 3. Header Badge Pill
  if (opts.badgeText) {
    ctx.save();
    ctx.font = "bold 24px 'Inter', sans-serif";
    const badgeMetrics = ctx.measureText(opts.badgeText.toUpperCase());
    const badgeW = badgeMetrics.width + 48;
    const badgeH = 50;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 90;

    ctx.fillStyle = themeConfig.badgeBg;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 25);
    ctx.fill();

    ctx.strokeStyle = themeConfig.accentColor;
    ctx.lineWidth = 2;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 25);
    ctx.stroke();

    ctx.fillStyle = themeConfig.badgeText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(opts.badgeText.toUpperCase(), width / 2, badgeY + badgeH / 2);
    ctx.restore();
  }

  // 4. Poster Main Headline Title
  ctx.save();
  ctx.font = "900 56px 'Cabinet Grotesk', 'Inter', sans-serif";
  ctx.fillStyle = themeConfig.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  const titleY = opts.badgeText ? 165 : 110;
  ctx.fillText(opts.title || "SCAN WITH ANY APP", width / 2, titleY);
  ctx.restore();

  // 5. Subtitle
  if (opts.subtitle) {
    ctx.save();
    ctx.font = "500 26px 'Inter', sans-serif";
    ctx.fillStyle = themeConfig.subtitleColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(opts.subtitle, width / 2, titleY + 70);
    ctx.restore();
  }

  // 6. Draw 3D Character or Custom Mascot
  const charImg = await loadImage(opts.characterSrc);

  if (opts.isCustomCharacter) {
    // Custom mascot layout:
    // Place custom character in top/center, and QR in lower center
    const maxCharW = 480;
    const maxCharH = 520;
    const scale = Math.min(maxCharW / charImg.width, maxCharH / charImg.height, 1);
    const charW = charImg.width * scale;
    const charH = charImg.height * scale;
    const charX = (width - charW) / 2;
    const charY = titleY + 120;

    // Character shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.drawImage(charImg, charX, charY, charW, charH);
    ctx.restore();

    // QR Card container
    const qrCardSize = 520;
    const qrCardX = (width - qrCardSize) / 2;
    const qrCardY = charY + charH + 30;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    roundRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 32);
    ctx.fill();

    // Render QR Code inside Card
    const svgStr = buildQRSvg({ value: opts.qrValue || "https://bt-qr.app", style: opts.qrStyle });
    const qrImg = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`);
    const pad = 36;
    ctx.drawImage(qrImg, qrCardX + pad, qrCardY + pad, qrCardSize - pad * 2, qrCardSize - pad * 2);
    ctx.restore();
  } else {
    // Standard 3D Character (Aarav, Mira, Bit) holding the panel
    const charW = 860;
    const charH = (charImg.height / charImg.width) * charW;
    const charX = (width - charW) / 2;
    const charY = titleY + 70;

    // Character Shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 25;
    ctx.drawImage(charImg, charX, charY, charW, charH);
    ctx.restore();

    // The QR Panel
    const panel = opts.panelRect ?? { left: 42.2, top: 19, width: 38 };
    const pX = charX + (panel.left / 100) * charW;
    const pY = charY + (panel.top / 100) * charH;
    const pW = (panel.width / 100) * charW;
    const pH = pW;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(12, 35, 64, 0.35)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, pX, pY, pW, pH, 24);
    ctx.fill();

    // Render QR Code inside Character's panel
    const svgStr = buildQRSvg({ value: opts.qrValue || "https://bt-qr.app", style: opts.qrStyle });
    const qrImg = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`);
    const pad = pW * 0.08;
    ctx.drawImage(qrImg, pX + pad, pY + pad, pW - pad * 2, pH - pad * 2);
    ctx.restore();
  }

  // 7. Footer Branding
  ctx.save();
  ctx.font = "bold 20px 'Inter', sans-serif";
  ctx.fillStyle = themeConfig.subtitleColor;
  ctx.textAlign = "center";
  ctx.fillText("POWERED BY BT-QR CODE STUDIO • INSTANT SCANNING", width / 2, height - 70);
  ctx.restore();

  // 8. Watermark if free plan preview
  if (opts.watermark) {
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.fillRect(0, height - 52, width, 52);
    ctx.font = "bold 20px 'Inter', sans-serif";
    ctx.fillStyle = "#f8fafc";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BT-QR FREE PREVIEW • UPGRADE TO LITE / PREMIUM FOR WATERMARK-FREE PRINT", width / 2, height - 26);
    ctx.restore();
  }

  return canvas;
}

/**
 * Downloads standee poster in PNG or PDF format
 */
export async function downloadStandee({
  format = "png",
  filename = "bt-qr-standee-poster",
  ...opts
}: StandeeOptions & { format?: "png" | "jpg" | "pdf"; filename?: string }) {
  const canvas = await renderStandeeCanvas(opts);

  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
    doc.save(`${filename}.pdf`);
    return;
  }

  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Poster generation failed"))),
      mime,
      format === "jpg" ? 0.95 : undefined,
    );
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
