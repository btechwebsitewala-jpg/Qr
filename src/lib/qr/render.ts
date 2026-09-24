import QRCode from "qrcode";

export type EccLevel = "L" | "M" | "Q" | "H";
export type DotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "classy"
  | "diamond"
  | "star"
  | "heart"
  | "fluid";

export type EyeStyle =
  | "square"
  | "rounded"
  | "circle"
  | "leaf"
  | "shield"
  | "diamond";

export type EyePupilStyle =
  | "square"
  | "rounded"
  | "circle"
  | "diamond"
  | "leaf"
  | "star";

export type FrameStyle =
  | "none"
  | "bottom"
  | "top"
  | "rounded"
  | "badge"
  | "phone"
  | "chat"
  | "ribbon"
  | "minimal";

export type GradientType = "none" | "linear" | "radial";
export type GradientDirection = "diagonal" | "horizontal" | "vertical";

export interface QRStyle {
  fg: string;
  bg: string;
  bgTransparent?: boolean;
  ecc: EccLevel;
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  eyePupilStyle?: EyePupilStyle;
  eyeFrameColor?: string;
  eyePupilColor?: string;
  gradientType?: GradientType;
  gradientColor?: string;
  gradientDirection?: GradientDirection;
  frame: FrameStyle;
  frameText: string;
  frameColor: string;
  frameTextColor?: string;
  frameIcon?: string;
  logo: string | null;
  logoSize: number; // percent of QR width
  logoShape?: "square" | "circle" | "none";
  margin: number; // modules
}

export const DEFAULT_STYLE: QRStyle = {
  fg: "#0C2340",
  bg: "#FFFFFF",
  bgTransparent: false,
  ecc: "M",
  dotStyle: "square",
  eyeStyle: "square",
  eyePupilStyle: "square",
  eyeFrameColor: "",
  eyePupilColor: "",
  gradientType: "none",
  gradientColor: "#2D8A9E",
  gradientDirection: "diagonal",
  frame: "none",
  frameText: "SCAN ME",
  frameColor: "#2D8A9E",
  frameTextColor: "#FFFFFF",
  frameIcon: "scan",
  logo: null,
  logoSize: 22,
  logoShape: "square",
  margin: 2,
};

export interface QRTemplate {
  id: string;
  name: string;
  category: "classic" | "gradient" | "creative" | "business";
  style: Partial<QRStyle>;
}

export const QR_TEMPLATES: QRTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    category: "classic",
    style: {
      fg: "#111111",
      bg: "#FFFFFF",
      gradientType: "none",
      dotStyle: "square",
      eyeStyle: "square",
      eyePupilStyle: "square",
      frame: "none",
    },
  },
  {
    id: "navy",
    name: "Executive Navy",
    category: "business",
    style: {
      fg: "#0C2340",
      bg: "#FFFFFF",
      gradientType: "none",
      dotStyle: "rounded",
      eyeStyle: "rounded",
      eyePupilStyle: "rounded",
      frame: "none",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon",
    category: "gradient",
    style: {
      fg: "#FF007A",
      gradientType: "linear",
      gradientColor: "#00F0FF",
      gradientDirection: "diagonal",
      bg: "#0B0E17",
      dotStyle: "dots",
      eyeStyle: "shield",
      eyePupilStyle: "diamond",
      eyeFrameColor: "#00F0FF",
      eyePupilColor: "#FF007A",
      frame: "none",
    },
  },
  {
    id: "sunset",
    name: "Sunset Flare",
    category: "gradient",
    style: {
      fg: "#F97316",
      gradientType: "linear",
      gradientColor: "#DB2777",
      gradientDirection: "diagonal",
      bg: "#FFF7ED",
      dotStyle: "rounded",
      eyeStyle: "rounded",
      eyePupilStyle: "circle",
      eyeFrameColor: "#DB2777",
      eyePupilColor: "#F97316",
      frame: "none",
    },
  },
  {
    id: "scanme",
    name: "Scan Me Pro",
    category: "classic",
    style: {
      fg: "#0C2340",
      bg: "#FFFFFF",
      dotStyle: "square",
      eyeStyle: "rounded",
      eyePupilStyle: "rounded",
      frame: "bottom",
      frameColor: "#2D8A9E",
      frameText: "SCAN ME",
    },
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    category: "business",
    style: {
      fg: "#059669",
      gradientType: "linear",
      gradientColor: "#10B981",
      gradientDirection: "vertical",
      bg: "#F0FDF4",
      dotStyle: "classy",
      eyeStyle: "leaf",
      eyePupilStyle: "leaf",
      eyeFrameColor: "#047857",
      eyePupilColor: "#10B981",
      frame: "none",
    },
  },
  {
    id: "royal",
    name: "Royal Purple",
    category: "gradient",
    style: {
      fg: "#7C3AED",
      gradientType: "linear",
      gradientColor: "#C026D3",
      gradientDirection: "diagonal",
      bg: "#FAF5FF",
      dotStyle: "star",
      eyeStyle: "circle",
      eyePupilStyle: "star",
      eyeFrameColor: "#7C3AED",
      eyePupilColor: "#C026D3",
      frame: "none",
    },
  },
  {
    id: "phone-style",
    name: "Phone Mockup",
    category: "creative",
    style: {
      fg: "#0F172A",
      bg: "#FFFFFF",
      dotStyle: "rounded",
      eyeStyle: "rounded",
      eyePupilStyle: "circle",
      frame: "phone",
      frameColor: "#1E293B",
      frameText: "POINT CAMERA",
    },
  },
  {
    id: "chat-bubble",
    name: "Chat Connect",
    category: "creative",
    style: {
      fg: "#15803D",
      bg: "#F0FDF4",
      dotStyle: "dots",
      eyeStyle: "circle",
      eyePupilStyle: "circle",
      frame: "chat",
      frameColor: "#16A34A",
      frameText: "SCAN TO CHAT",
    },
  },
  {
    id: "ribbon-badge",
    name: "Golden Ribbon",
    category: "creative",
    style: {
      fg: "#B45309",
      gradientType: "linear",
      gradientColor: "#F59E0B",
      bg: "#FEFCE8",
      dotStyle: "diamond",
      eyeStyle: "diamond",
      eyePupilStyle: "diamond",
      frame: "ribbon",
      frameColor: "#B45309",
      frameText: "SPECIAL OFFER",
    },
  },
  {
    id: "lagoon",
    name: "Lagoon Waves",
    category: "gradient",
    style: {
      fg: "#0284C7",
      gradientType: "linear",
      gradientColor: "#06B6D4",
      gradientDirection: "horizontal",
      bg: "#F0F9FF",
      dotStyle: "dots",
      eyeStyle: "circle",
      eyePupilStyle: "circle",
      eyeFrameColor: "#0284C7",
      eyePupilColor: "#06B6D4",
      frame: "none",
    },
  },
  {
    id: "minimal",
    name: "Minimalist Slate",
    category: "classic",
    style: {
      fg: "#334155",
      bg: "#F8FAFC",
      dotStyle: "classy",
      eyeStyle: "rounded",
      eyePupilStyle: "rounded",
      frame: "minimal",
      frameColor: "#64748B",
      frameText: "SCAN HERE",
    },
  },
  {
    id: "midnight",
    name: "Midnight Cyan",
    category: "business",
    style: {
      fg: "#38BDF8",
      bg: "#090D16",
      dotStyle: "rounded",
      eyeStyle: "rounded",
      eyePupilStyle: "rounded",
      frame: "none",
    },
  },
  {
    id: "ruby",
    name: "Ruby Valentine",
    category: "creative",
    style: {
      fg: "#E11D48",
      gradientType: "linear",
      gradientColor: "#FB7185",
      bg: "#FFF1F2",
      dotStyle: "heart",
      eyeStyle: "leaf",
      eyePupilStyle: "circle",
      eyeFrameColor: "#BE123C",
      eyePupilColor: "#FB7185",
      frame: "none",
    },
  },
  {
    id: "badge-teal",
    name: "Teal Badge",
    category: "classic",
    style: {
      fg: "#0D9488",
      bg: "#F0FDFA",
      dotStyle: "dots",
      eyeStyle: "circle",
      eyePupilStyle: "circle",
      frame: "badge",
      frameColor: "#0D9488",
      frameText: "SCAN ME",
    },
  },
  {
    id: "harbour",
    name: "Harbour Top",
    category: "business",
    style: {
      fg: "#1E3A8A",
      bg: "#FFFFFF",
      dotStyle: "square",
      eyeStyle: "circle",
      eyePupilStyle: "square",
      frame: "top",
      frameColor: "#1E3A8A",
      frameText: "VISIT WEBSITE",
    },
  },
];

const safeColor = (c: string | undefined, fallback: string) =>
  c && /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(c.trim()) ? c.trim() : fallback;

const escapeXml = (s: string) =>
  (s ?? "").replace(/[<>&"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

interface Matrix {
  size: number;
  get: (x: number, y: number) => boolean;
}

function buildMatrix(value: string, ecc: EccLevel): Matrix {
  const qr = QRCode.create(value, { errorCorrectionLevel: ecc });
  const size = qr.modules.size;
  const data = qr.modules.data;
  return { size, get: (x, y) => Boolean(data[y * size + x]) };
}

const isEyeModule = (x: number, y: number, size: number) => {
  const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
  return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
};

function renderEyeFrame(
  x: number,
  y: number,
  u: number,
  style: EyeStyle,
  color: string,
  bgColor: string,
): string {
  const w = u * 7;
  const h = u * 7;
  const innerX = x + u;
  const innerY = y + u;
  const innerW = u * 5;
  const innerH = u * 5;

  let outerTag = "";
  let innerTag = "";

  switch (style) {
    case "circle": {
      const rOuter = u * 3.5;
      const rInner = u * 2.5;
      outerTag = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rOuter}" ry="${rOuter}" fill="${color}"/>`;
      innerTag = `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${rInner}" ry="${rInner}" fill="${bgColor}"/>`;
      break;
    }
    case "rounded": {
      const rOuter = u * 2;
      const rInner = u;
      outerTag = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rOuter}" ry="${rOuter}" fill="${color}"/>`;
      innerTag = `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${rInner}" ry="${rInner}" fill="${bgColor}"/>`;
      break;
    }
    case "leaf": {
      const r = u * 3;
      const ir = u * 2;
      const outerPath = `M ${x + r} ${y} H ${x + w} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
      const innerPath = `M ${innerX + ir} ${innerY} H ${innerX + innerW} V ${innerY + innerH - ir} A ${ir} ${ir} 0 0 1 ${innerX + innerW - ir} ${innerY + innerH} H ${innerX} V ${innerY + ir} A ${ir} ${ir} 0 0 1 ${innerX + ir} ${innerY} Z`;
      outerTag = `<path d="${outerPath}" fill="${color}"/>`;
      innerTag = `<path d="${innerPath}" fill="${bgColor}"/>`;
      break;
    }
    case "shield": {
      const r = u * 3;
      const ir = u * 2;
      const outerPath = `M ${x} ${y} H ${x + w} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} Z`;
      const innerPath = `M ${innerX} ${innerY} H ${innerX + innerW} V ${innerY + innerH - ir} A ${ir} ${ir} 0 0 1 ${innerX + innerW - ir} ${innerY + innerH} H ${innerX + ir} A ${ir} ${ir} 0 0 1 ${innerX} ${innerY + innerH - ir} Z`;
      outerTag = `<path d="${outerPath}" fill="${color}"/>`;
      innerTag = `<path d="${innerPath}" fill="${bgColor}"/>`;
      break;
    }
    case "diamond": {
      const cx = x + w / 2;
      const cy = y + h / 2;
      outerTag = `<polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" fill="${color}"/>`;
      innerTag = `<polygon points="${cx},${innerY} ${innerX + innerW},${cy} ${cx},${innerY + innerH} ${innerX},${cy}" fill="${bgColor}"/>`;
      break;
    }
    case "square":
    default: {
      outerTag = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
      innerTag = `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="${bgColor}"/>`;
      break;
    }
  }

  return outerTag + innerTag;
}

function renderEyePupil(
  x: number,
  y: number,
  u: number,
  style: EyePupilStyle,
  color: string,
): string {
  const px = x + u * 2;
  const py = y + u * 2;
  const size = u * 3;
  const cx = px + size / 2;
  const cy = py + size / 2;

  switch (style) {
    case "circle": {
      const r = size / 2;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
    }
    case "rounded": {
      const r = u;
      return `<rect x="${px}" y="${py}" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${color}"/>`;
    }
    case "diamond": {
      return `<polygon points="${cx},${py} ${px + size},${cy} ${cx},${py + size} ${px},${cy}" fill="${color}"/>`;
    }
    case "leaf": {
      const r = u * 1.5;
      const path = `M ${px + r} ${py} H ${px + size} V ${py + size - r} A ${r} ${r} 0 0 1 ${px + size - r} ${py + size} H ${px} V ${py + r} A ${r} ${r} 0 0 1 ${px + r} ${py} Z`;
      return `<path d="${path}" fill="${color}"/>`;
    }
    case "star": {
      const p = [
        `${cx},${py}`,
        `${cx + u * 0.5},${cy - u * 0.5}`,
        `${px + size},${cy}`,
        `${cx + u * 0.5},${cy + u * 0.5}`,
        `${cx},${py + size}`,
        `${cx - u * 0.5},${cy + u * 0.5}`,
        `${px},${cy}`,
        `${cx - u * 0.5},${cy - u * 0.5}`,
      ].join(" ");
      return `<polygon points="${p}" fill="${color}"/>`;
    }
    case "square":
    default:
      return `<rect x="${px}" y="${py}" width="${size}" height="${size}" fill="${color}"/>`;
  }
}

function renderDot(x: number, y: number, u: number, style: DotStyle, fill: string): string {
  const cx = x + u / 2;
  const cy = y + u / 2;

  switch (style) {
    case "dots":
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(u * 0.44).toFixed(2)}" fill="${fill}"/>`;

    case "rounded":
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${u.toFixed(2)}" height="${u.toFixed(2)}" rx="${(u * 0.32).toFixed(2)}" ry="${(u * 0.32).toFixed(2)}" fill="${fill}"/>`;

    case "classy":
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${u.toFixed(2)}" height="${u.toFixed(2)}" rx="${(u * 0.5).toFixed(2)}" ry="${(u * 0.5).toFixed(2)}" fill="${fill}"/>`;

    case "diamond": {
      const p = `${cx.toFixed(2)},${(y + u * 0.08).toFixed(2)} ${(x + u * 0.92).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(y + u * 0.92).toFixed(2)} ${(x + u * 0.08).toFixed(2)},${cy.toFixed(2)}`;
      return `<polygon points="${p}" fill="${fill}"/>`;
    }

    case "star": {
      const p = [
        `${cx.toFixed(2)},${(y + u * 0.05).toFixed(2)}`,
        `${(cx + u * 0.2).toFixed(2)},${(cy - u * 0.2).toFixed(2)}`,
        `${(x + u * 0.95).toFixed(2)},${cy.toFixed(2)}`,
        `${(cx + u * 0.2).toFixed(2)},${(cy + u * 0.2).toFixed(2)}`,
        `${cx.toFixed(2)},${(y + u * 0.95).toFixed(2)}`,
        `${(cx - u * 0.2).toFixed(2)},${(cy + u * 0.2).toFixed(2)}`,
        `${(x + u * 0.05).toFixed(2)},${cy.toFixed(2)}`,
        `${(cx - u * 0.2).toFixed(2)},${(cy - u * 0.2).toFixed(2)}`,
      ].join(" ");
      return `<polygon points="${p}" fill="${fill}"/>`;
    }

    case "heart": {
      const topY = (y + u * 0.2).toFixed(2);
      const botY = (y + u * 0.85).toFixed(2);
      const midY = (y + u * 0.45).toFixed(2);
      const d = `M ${cx.toFixed(2)} ${botY} C ${x.toFixed(2)} ${midY} ${x.toFixed(2)} ${topY} ${(cx - u * 0.25).toFixed(2)} ${topY} C ${(cx - u * 0.05).toFixed(2)} ${topY} ${cx.toFixed(2)} ${(y + u * 0.32).toFixed(2)} ${cx.toFixed(2)} ${(y + u * 0.38).toFixed(2)} C ${cx.toFixed(2)} ${(y + u * 0.32).toFixed(2)} ${(cx + u * 0.05).toFixed(2)} ${topY} ${(cx + u * 0.25).toFixed(2)} ${topY} C ${(x + u).toFixed(2)} ${topY} ${(x + u).toFixed(2)} ${midY} ${cx.toFixed(2)} ${botY} Z`;
      return `<path d="${d}" fill="${fill}"/>`;
    }

    case "fluid": {
      const pad = u * 0.06;
      return `<rect x="${(x + pad).toFixed(2)}" y="${(y + pad).toFixed(2)}" width="${(u - pad * 2).toFixed(2)}" height="${(u - pad * 2).toFixed(2)}" rx="${(u * 0.44).toFixed(2)}" fill="${fill}"/>`;
    }

    case "square":
    default:
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${u.toFixed(2)}" height="${u.toFixed(2)}" fill="${fill}"/>`;
  }
}

export interface BuildSvgOptions {
  value: string;
  style: QRStyle;
  size?: number;
}

/** Builds a standalone, self-contained SVG string for the QR code. */
export function buildQRSvg({ value, style, size = 480 }: BuildSvgOptions): string {
  const fg = safeColor(style.fg, DEFAULT_STYLE.fg);
  const bg = style.bgTransparent ? "transparent" : safeColor(style.bg, DEFAULT_STYLE.bg);
  const frameColor = safeColor(style.frameColor, DEFAULT_STYLE.frameColor);
  const frameTextColor = safeColor(style.frameTextColor, "#FFFFFF");
  const gradientColor = safeColor(style.gradientColor, DEFAULT_STYLE.gradientColor || "#2D8A9E");
  const eyeFrameColor = style.eyeFrameColor?.trim()
    ? safeColor(style.eyeFrameColor, fg)
    : undefined;
  const eyePupilColor = style.eyePupilColor?.trim()
    ? safeColor(style.eyePupilColor, eyeFrameColor || fg)
    : undefined;

  const ecc: EccLevel = style.logo ? "H" : style.ecc || "M";
  const matrix = buildMatrix(value || " ", ecc);
  const margin = Math.max(0, Math.min(8, style.margin ?? 2));
  const total = matrix.size + margin * 2;
  const unit = 1000 / total;

  const frameType = style.frame || "none";
  const hasBottomBanner =
    frameType === "bottom" || frameType === "badge" || frameType === "ribbon" || frameType === "chat";
  const hasTopBanner = frameType === "top";
  const isPhone = frameType === "phone";
  const isMinimal = frameType === "minimal";

  let outerPad = 0;
  let topSpace = 0;
  let bottomSpace = 0;

  if (frameType === "none") {
    outerPad = 0;
  } else if (isPhone) {
    outerPad = 50;
    topSpace = 120; // speaker + camera notch
    bottomSpace = 100; // home bar / pill
  } else if (hasBottomBanner) {
    outerPad = 40;
    bottomSpace = 180;
  } else if (hasTopBanner) {
    outerPad = 40;
    topSpace = 180;
  } else if (isMinimal) {
    outerPad = 40;
    bottomSpace = 90;
  } else {
    // rounded border only
    outerPad = 40;
  }

  const vbW = 1000 + outerPad * 2;
  const vbH = 1000 + outerPad * 2 + topSpace + bottomSpace;
  const qrX = outerPad;
  const qrY = outerPad + topSpace;

  // Gradients definition
  const gradId = `qr-grad-${Math.abs(hashString(fg + gradientColor + (style.gradientDirection || ""))).toString(36)}`;
  let defs = "";
  let moduleFill = fg;

  if (style.gradientType === "linear") {
    let x1 = "0%";
    let y1 = "0%";
    let x2 = "100%";
    let y2 = "100%";
    if (style.gradientDirection === "horizontal") {
      x2 = "100%";
      y2 = "0%";
    } else if (style.gradientDirection === "vertical") {
      x2 = "0%";
      y2 = "100%";
    }
    defs = `<defs><linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0%" stop-color="${fg}"/><stop offset="100%" stop-color="${gradientColor}"/></linearGradient></defs>`;
    moduleFill = `url(#${gradId})`;
  } else if (style.gradientType === "radial") {
    defs = `<defs><radialGradient id="${gradId}" cx="50%" cy="50%" r="65%"><stop offset="0%" stop-color="${fg}"/><stop offset="100%" stop-color="${gradientColor}"/></radialGradient></defs>`;
    moduleFill = `url(#${gradId})`;
  }

  // Render QR data modules
  const cells: string[] = [];
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (!matrix.get(x, y)) continue;
      if (isEyeModule(x, y, matrix.size)) continue;
      const px = (x + margin) * unit;
      const py = (y + margin) * unit;
      cells.push(renderDot(px, py, unit, style.dotStyle || "square", moduleFill));
    }
  }

  // Render Corner Eyes
  const eyeCoords = [
    [0, 0],
    [matrix.size - 7, 0],
    [0, matrix.size - 7],
  ];
  const eyeFrameFill = eyeFrameColor || moduleFill;
  const eyePupilFill = eyePupilColor || eyeFrameColor || moduleFill;
  const eyeFrameShape = style.eyeStyle || "square";
  const eyePupilShape = style.eyePupilStyle || (style.eyeStyle as unknown as EyePupilStyle) || "square";

  const eyeElements: string[] = [];
  const eyeBg = style.bgTransparent ? "#FFFFFF" : bg;

  for (const [cx = 0, cy = 0] of eyeCoords) {
    const ex = (cx + margin) * unit;
    const ey = (cy + margin) * unit;
    const frameMarkup = renderEyeFrame(ex, ey, unit, eyeFrameShape, eyeFrameFill, eyeBg);
    const pupilMarkup = renderEyePupil(ex, ey, unit, eyePupilShape, eyePupilFill);
    eyeElements.push(frameMarkup + pupilMarkup);
  }

  // Logo rendering
  let logoMarkup = "";
  if (style.logo) {
    const lw = (Math.max(12, Math.min(32, style.logoSize || 22)) / 100) * 1000;
    const lx = (1000 - lw) / 2;
    const pad = lw * 0.12;
    const bgX = lx - pad;
    const bgY = lx - pad;
    const bgSize = lw + pad * 2;
    const shape = style.logoShape || "square";
    const logoBgFill = style.bgTransparent ? "#FFFFFF" : bg;

    let logoBackdrop = "";
    if (shape === "circle") {
      const rad = bgSize / 2;
      logoBackdrop = `<circle cx="${(lx + lw / 2).toFixed(2)}" cy="${(lx + lw / 2).toFixed(2)}" r="${rad.toFixed(2)}" fill="${logoBgFill}"/>`;
    } else if (shape === "none") {
      logoBackdrop = "";
    } else {
      // rounded square
      logoBackdrop = `<rect x="${bgX.toFixed(2)}" y="${bgY.toFixed(2)}" width="${bgSize.toFixed(2)}" height="${bgSize.toFixed(2)}" rx="${(lw * 0.2).toFixed(2)}" fill="${logoBgFill}"/>`;
    }

    logoMarkup = `${logoBackdrop}<image href="${escapeXml(
      style.logo,
    )}" x="${lx.toFixed(2)}" y="${lx.toFixed(2)}" width="${lw.toFixed(2)}" height="${lw.toFixed(
      2,
    )}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  // Frame and Container Markup
  let frameBackground = "";
  let frameExtra = "";
  const bannerText = escapeXml((style.frameText || "SCAN ME").slice(0, 24));

  const backdropFill = style.bgTransparent ? "none" : bg;
  const qrBackdrop =
    style.bgTransparent && frameType === "none"
      ? ""
      : `<rect x="${qrX}" y="${qrY}" width="1000" height="1000" rx="${frameType === "none" ? 0 : 28}" fill="${backdropFill}"/>`;

  if (frameType === "bottom" || frameType === "badge") {
    frameBackground = `<rect x="6" y="6" width="${vbW - 12}" height="${vbH - 12}" rx="${frameType === "badge" ? 90 : 48}" fill="${frameColor}"/>`;
    const textY = qrY + 1000 + 115;
    frameExtra = `<text x="${vbW / 2}" y="${textY}" text-anchor="middle" font-family="Inter, Manrope, Arial, sans-serif" font-size="96" font-weight="800" letter-spacing="1.5" fill="${frameTextColor}">${bannerText}</text>`;
  } else if (frameType === "top") {
    frameBackground = `<rect x="6" y="6" width="${vbW - 12}" height="${vbH - 12}" rx="48" fill="${frameColor}"/>`;
    const textY = outerPad + 115;
    frameExtra = `<text x="${vbW / 2}" y="${textY}" text-anchor="middle" font-family="Inter, Manrope, Arial, sans-serif" font-size="96" font-weight="800" letter-spacing="1.5" fill="${frameTextColor}">${bannerText}</text>`;
  } else if (frameType === "rounded") {
    frameBackground = `<rect x="8" y="8" width="${vbW - 16}" height="${vbH - 16}" rx="52" fill="none" stroke="${frameColor}" stroke-width="18"/>`;
  } else if (frameType === "phone") {
    // Smartphone mockup silhouette
    frameBackground = `
      <rect x="8" y="8" width="${vbW - 16}" height="${vbH - 16}" rx="80" fill="${frameColor}"/>
      <!-- Speaker Notch -->
      <rect x="${(vbW - 200) / 2}" y="36" width="200" height="24" rx="12" fill="${frameTextColor}" opacity="0.4"/>
      <!-- Home Indicator -->
      <rect x="${(vbW - 240) / 2}" y="${vbH - 42}" width="240" height="16" rx="8" fill="${frameTextColor}" opacity="0.4"/>
    `;
    const textY = qrY - 26;
    frameExtra = `<text x="${vbW / 2}" y="${textY}" text-anchor="middle" font-family="Inter, Manrope, Arial, sans-serif" font-size="56" font-weight="700" fill="${frameTextColor}">${bannerText}</text>`;
  } else if (frameType === "chat") {
    // Chat bubble with bottom tail
    const bubbleH = vbH - 40;
    frameBackground = `
      <rect x="6" y="6" width="${vbW - 12}" height="${bubbleH}" rx="56" fill="${frameColor}"/>
      <!-- Bubble Pointer Tail -->
      <polygon points="${(vbW / 2 - 40).toFixed(0)},${bubbleH} ${(vbW / 2).toFixed(0)},${vbH - 4} ${(vbW / 2 + 40).toFixed(0)},${bubbleH}" fill="${frameColor}"/>
    `;
    const textY = qrY + 1000 + 110;
    frameExtra = `<text x="${vbW / 2}" y="${textY}" text-anchor="middle" font-family="Inter, Manrope, Arial, sans-serif" font-size="90" font-weight="800" fill="${frameTextColor}">${bannerText}</text>`;
  } else if (frameType === "ribbon") {
    // Modern pill ribbon banner at bottom
    frameBackground = `<rect x="8" y="8" width="${vbW - 16}" height="${vbH - 16}" rx="36" fill="${backdropFill}" stroke="${frameColor}" stroke-width="14"/>`;
    const ribbonY = qrY + 1000 + 35;
    const ribbonW = vbW - 140;
    const ribbonX = 70;
    frameExtra = `
      <rect x="${ribbonX}" y="${ribbonY}" width="${ribbonW}" height="100" rx="50" fill="${frameColor}"/>
      <text x="${vbW / 2}" y="${ribbonY + 68}" text-anchor="middle" font-family="Inter, Manrope, Arial, sans-serif" font-size="64" font-weight="800" fill="${frameTextColor}">${bannerText}</text>
    `;
  } else if (frameType === "minimal") {
    // Sleek minimalist border
    frameBackground = `
      <rect x="12" y="12" width="${vbW - 24}" height="${vbH - 24}" rx="28" fill="none" stroke="${frameColor}" stroke-width="8"/>
      <line x1="80" y1="${qrY + 1000 + 20}" x2="${vbW - 80}" y2="${qrY + 1000 + 20}" stroke="${frameColor}" stroke-width="4" opacity="0.3"/>
    `;
    const textY = qrY + 1000 + 64;
    frameExtra = `<text x="${vbW / 2}" y="${textY}" text-anchor="middle" font-family="Inter, Manrope, Arial, sans-serif" font-size="52" font-weight="700" letter-spacing="3" fill="${frameColor}">${bannerText}</text>`;
  }

  const height = Math.round((size * vbH) / vbW);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${height}" viewBox="0 0 ${vbW} ${vbH}" shape-rendering="geometricPrecision">${defs}${frameBackground}${qrBackdrop}<g transform="translate(${qrX}, ${qrY})">${cells.join(
    "",
  )}${eyeElements.join("")}${logoMarkup}</g>${frameExtra}</svg>`;
}

export function svgAspect(style: QRStyle): number {
  const frameType = style.frame || "none";
  let outerPad = 0;
  let topSpace = 0;
  let bottomSpace = 0;

  if (frameType === "none") {
    outerPad = 0;
  } else if (frameType === "phone") {
    outerPad = 50;
    topSpace = 120;
    bottomSpace = 100;
  } else if (frameType === "bottom" || frameType === "badge" || frameType === "ribbon" || frameType === "chat") {
    outerPad = 40;
    bottomSpace = 180;
  } else if (frameType === "top") {
    outerPad = 40;
    topSpace = 180;
  } else if (frameType === "minimal") {
    outerPad = 40;
    bottomSpace = 90;
  } else {
    outerPad = 40;
  }

  const w = 1000 + outerPad * 2;
  const h = 1000 + outerPad * 2 + topSpace + bottomSpace;
  return w / h;
}

/** Raw module matrix, used by the EPS exporter. */
export function qrModules(value: string, ecc: EccLevel) {
  const m = buildMatrix(value || " ", ecc);
  const rows: boolean[][] = [];
  for (let y = 0; y < m.size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < m.size; x++) row.push(m.get(x, y));
    rows.push(row);
  }
  return rows;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
