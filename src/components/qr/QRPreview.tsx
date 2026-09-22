import { useMemo } from "react";

import { buildQRSvg, type QRStyle } from "@/lib/qr/render";
import { cn } from "@/lib/utils";

interface QRPreviewProps {
  value: string;
  style: QRStyle;
  size?: number;
  className?: string;
}

export function QRPreview({ value, style, size = 320, className }: QRPreviewProps) {
  const svg = useMemo(() => {
    try {
      return buildQRSvg({ value: value || "https://bt-qr.app", style, size });
    } catch {
      return "";
    }
  }, [value, style, size]);

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      // SVG markup is generated locally from validated colors/values, never remote HTML.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
