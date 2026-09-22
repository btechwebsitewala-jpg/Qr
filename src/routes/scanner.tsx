import { createFileRoute } from "@tanstack/react-router";
import jsQR from "jsqr";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Check,
  Copy,
  ExternalLink,
  Flashlight,
  FlashlightOff,
  FlipHorizontal,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ScanLine,
  Sparkles,
  Upload,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TITLE = "Free Online QR Code & Barcode Scanner — BT-QR";
const DESCRIPTION =
  "Scan QR codes instantly using your mobile or laptop camera, or upload any image screenshot. 100% private in-browser decoding with zero server uploads.";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Scanner,
});

/** Plays a soft pleasant beep on successful QR scan */
function playScanBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // audio blocked or unsupported
  }
}

/** Trigger haptic vibration if supported on mobile device */
function triggerHaptic() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([40, 30, 40]);
    }
  } catch {
    // ignore
  }
}

interface ParsedQRData {
  type: "url" | "upi" | "wifi" | "tel" | "email" | "sms" | "vcard" | "text";
  label: string;
  icon: typeof Globe;
  details?: Record<string, string>;
  primaryActionUrl?: string;
  primaryActionLabel?: string;
}

function parseQRContent(content: string): ParsedQRData {
  const trimmed = content.trim();

  // 1. URL
  if (/^https?:\/\//i.test(trimmed)) {
    let domain = trimmed;
    try {
      domain = new URL(trimmed).hostname;
    } catch {
      // ignore
    }
    return {
      type: "url",
      label: `Website Link (${domain})`,
      icon: Globe,
      primaryActionUrl: trimmed,
      primaryActionLabel: "Open Link",
    };
  }

  // 2. UPI Payment
  if (/^upi:\/\/pay\?/i.test(trimmed)) {
    const details: Record<string, string> = {};
    try {
      const url = new URL(trimmed);
      const pa = url.searchParams.get("pa"); // payee vpa
      const pn = url.searchParams.get("pn"); // payee name
      const am = url.searchParams.get("am"); // amount
      const cu = url.searchParams.get("cu") || "INR"; // currency
      if (pn) details["Payee Name"] = decodeURIComponent(pn);
      if (pa) details["UPI ID"] = pa;
      if (am) details["Amount"] = `₹${am} ${cu}`;
    } catch {
      // ignore
    }
    return {
      type: "upi",
      label: "UPI Payment QR",
      icon: Zap,
      details,
      primaryActionUrl: trimmed,
      primaryActionLabel: "Pay in UPI App",
    };
  }

  // 3. Wi-Fi
  if (/^WIFI:/i.test(trimmed)) {
    const details: Record<string, string> = {};
    const ssidMatch = trimmed.match(/S:([^;]+)/);
    const passMatch = trimmed.match(/P:([^;]+)/);
    const typeMatch = trimmed.match(/T:([^;]+)/);
    if (ssidMatch?.[1]) details["Network (SSID)"] = ssidMatch[1];
    if (passMatch?.[1]) details["Password"] = passMatch[1];
    if (typeMatch?.[1]) details["Security"] = typeMatch[1];
    return {
      type: "wifi",
      label: "Wi-Fi Network Credentials",
      icon: Wifi,
      details,
      primaryActionLabel: passMatch?.[1] ? "Copy Password" : "Copy Wi-Fi Info",
    };
  }

  // 4. Phone
  if (/^tel:/i.test(trimmed)) {
    const phone = trimmed.replace(/^tel:/i, "");
    return {
      type: "tel",
      label: "Phone Number",
      icon: Phone,
      primaryActionUrl: trimmed,
      primaryActionLabel: `Call ${phone}`,
    };
  }

  // 5. Email
  if (/^mailto:/i.test(trimmed)) {
    const email = trimmed.replace(/^mailto:/i, "").split("?")[0];
    return {
      type: "email",
      label: "Email Address",
      icon: Mail,
      primaryActionUrl: trimmed,
      primaryActionLabel: `Email ${email}`,
    };
  }

  // 6. vCard
  if (/BEGIN:VCARD/i.test(trimmed)) {
    const nameMatch = trimmed.match(/FN:([^\r\n]+)/);
    const telMatch = trimmed.match(/TEL[^\:]*:([^\r\n]+)/);
    const emailMatch = trimmed.match(/EMAIL[^\:]*:([^\r\n]+)/);
    const details: Record<string, string> = {};
    if (nameMatch?.[1]) details["Name"] = nameMatch[1];
    if (telMatch?.[1]) details["Phone"] = telMatch[1];
    if (emailMatch?.[1]) details["Email"] = emailMatch[1];
    return {
      type: "vcard",
      label: "Digital Contact Card",
      icon: Globe,
      details,
    };
  }

  // Default: Plain Text
  return {
    type: "text",
    label: "Plain Text / Data",
    icon: ScanLine,
  };
}

/**
 * Universal Multi-Pass QR Decoder for uploaded image files.
 * Uses native BarcodeDetector if available, otherwise runs multi-resolution jsQR.
 */
async function decodeImageFile(file: File): Promise<string | null> {
  // Pass 1: Try native BarcodeDetector if available (hardware accelerated)
  if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    try {
      const ctor = (window as unknown as { BarcodeDetector: new (opts: unknown) => { detect: (s: unknown) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      const detector = new ctor({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const detected = await detector.detect(bitmap);
      if (detected?.[0]?.rawValue) {
        return detected[0].rawValue;
      }
    } catch {
      // fallback to jsQR canvas processing
    }
  }

  // Pass 2: Load into HTMLImageElement
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is unavailable");

  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;

  // Pass 3: Scaled pass (max dimension 1200px - ideal for smartphone photos)
  const maxDim = 1200;
  let targetW = naturalW;
  let targetH = naturalH;
  if (naturalW > maxDim || naturalH > maxDim) {
    if (naturalW >= naturalH) {
      targetW = maxDim;
      targetH = Math.round((naturalH * maxDim) / naturalW);
    } else {
      targetH = maxDim;
      targetW = Math.round((naturalW * maxDim) / naturalH);
    }
  }

  canvas.width = targetW;
  canvas.height = targetH;
  ctx.drawImage(img, 0, 0, targetW, targetH);
  let imageData = ctx.getImageData(0, 0, targetW, targetH);
  let res = jsQR(imageData.data, targetW, targetH, { inversionAttempts: "attemptBoth" });
  if (res?.data) return res.data;

  // Pass 4: Original dimensions (if scaled down didn't find it)
  if (targetW !== naturalW || targetH !== naturalH) {
    canvas.width = naturalW;
    canvas.height = naturalH;
    ctx.drawImage(img, 0, 0, naturalW, naturalH);
    imageData = ctx.getImageData(0, 0, naturalW, naturalH);
    res = jsQR(imageData.data, naturalW, naturalH, { inversionAttempts: "attemptBoth" });
    if (res?.data) return res.data;
  }

  // Pass 5: Contrast enhancement (for faint or printed receipts)
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const avg = ((d[i] ?? 0) + (d[i + 1] ?? 0) + (d[i + 2] ?? 0)) / 3;
    const v = avg > 128 ? 255 : 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
  res = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: "attemptBoth" });
  if (res?.data) return res.data;

  return null;
}

function Scanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [result, setResult] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setStartingCamera(false);
    setTorchOn(false);
  }, []);

  const handleSuccess = useCallback(
    (codeData: string) => {
      triggerHaptic();
      playScanBeep();
      setResult(codeData);
      toast.success("QR code scanned successfully!");
      stop();
    },
    [stop],
  );

  const scanCameraLoop = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      // Process video at balanced resolution for 60fps responsiveness
      const w = Math.min(video.videoWidth, 720);
      const h = Math.round((video.videoHeight / video.videoWidth) * w);

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const qr = jsQR(imageData.data, w, h, { inversionAttempts: "dontInvert" });
        if (qr?.data) {
          handleSuccess(qr.data);
          return;
        }
      }
    }

    rafRef.current = requestAnimationFrame(scanCameraLoop);
  }, [handleSuccess]);

  const startCamera = useCallback(
    async (facing: "environment" | "user" = facingMode) => {
      stop();
      setErrorMessage(null);
      setStartingCamera(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStartingCamera(false);
        setErrorMessage(
          "Camera API is not supported on this browser or requires a secure HTTPS connection. Please use the Upload Image option.",
        );
        toast.error("Camera is not available. Please use image upload.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("autoplay", "true");
          videoRef.current.setAttribute("muted", "true");
          await videoRef.current.play();
        }

        setScanning(true);
        setStartingCamera(false);
        setFacingMode(facing);

        // Check if device hardware supports flashlight / torch
        const track = stream.getVideoTracks()[0];
        if (track && "getCapabilities" in track) {
          const capabilities = (track.getCapabilities() as { torch?: boolean }) || {};
          setHasTorch(Boolean(capabilities.torch));
        }

        // Start requestAnimationFrame loop
        rafRef.current = requestAnimationFrame(scanCameraLoop);
      } catch (err) {
        setStartingCamera(false);
        setScanning(false);
        const errStr = err instanceof Error ? err.message : String(err);

        if (errStr.includes("Permission") || errStr.includes("NotAllowedError") || errStr.includes("denied")) {
          setErrorMessage(
            "Camera permission was blocked. Please tap the camera/lock icon in your browser address bar and choose 'Allow'.",
          );
          toast.error("Camera permission denied. Allow camera in your browser settings.");
        } else if (errStr.includes("NotFound") || errStr.includes("DevicesNotFoundError")) {
          setErrorMessage("No camera hardware found on this device. You can upload any QR screenshot instead.");
          toast.error("No camera found on this device.");
        } else {
          setErrorMessage(`Camera error: ${errStr}. Please try Upload Image instead.`);
          toast.error("Could not access camera.");
        }
      }
    },
    [facingMode, scanCameraLoop, stop],
  );

  const flipCamera = useCallback(() => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    void startCamera(nextFacing);
  }, [facingMode, startCamera]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !torchOn;
      // @ts-ignore
      await track.applyConstraints({ advanced: [{ torch: nextState }] });
      setTorchOn(nextState);
      toast.success(nextState ? "Flashlight turned on" : "Flashlight turned off");
    } catch {
      toast.error("Torch is not supported on this camera");
    }
  }, [torchOn]);

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WebP, SVG, Screenshot)");
        return;
      }

      setAnalyzingImage(true);
      setErrorMessage(null);
      stop();

      const previewUrl = URL.createObjectURL(file);
      setUploadedPreview(previewUrl);

      try {
        const decoded = await decodeImageFile(file);
        if (decoded) {
          handleSuccess(decoded);
        } else {
          toast.error("No QR code detected in this image", {
            description: "Ensure the QR code is clearly visible, well-lit, and not cropped.",
          });
        }
      } catch (err) {
        toast.error("Could not read image file", {
          description: err instanceof Error ? err.message : "Please try another image",
        });
      } finally {
        setAnalyzingImage(false);
      }
    },
    [handleSuccess, stop],
  );

  // Global Clipboard Paste Listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            toast.info("Image pasted from clipboard! Scanning...");
            void handleImageFile(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
      stop();
      if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
    };
  }, [handleImageFile, stop, uploadedPreview]);

  const parsed = result ? parseQRContent(result) : null;

  return (
    <div className="min-h-screen bg-surface-gradient selection:bg-primary/20">
      <SiteHeader />

      <main className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Background glow accents */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-80 w-full max-w-3xl -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* Page Title */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary backdrop-blur-md">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>Universal QR &amp; Barcode Scanner</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-black tracking-tight sm:text-5xl text-foreground">
            Scan QR Code
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-2xl">
            Point your mobile camera at a QR code, or upload any screenshot.
            Decoding runs 100% inside your browser — your images and camera stream are never uploaded.
          </p>
        </div>

        {/* Main Scanner Container Card */}
        <div className="mt-8 overflow-hidden rounded-3xl border-2 border-border/80 bg-card p-4 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Viewport Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleImageFile(file);
            }}
            className={cn(
              "relative flex aspect-[4/3] sm:aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-300",
              scanning
                ? "border-primary bg-black shadow-brand"
                : isDragOver
                  ? "border-primary bg-primary/10 ring-4 ring-primary/20"
                  : "border-border/80 bg-secondary/30",
            )}
          >
            {/* Live Camera Video */}
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className={cn("size-full object-cover", scanning ? "block" : "hidden")}
            />

            {/* Live Camera Reticle & Animated Laser Line */}
            {scanning ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {/* Dark vignette outer frame */}
                <div className="relative size-60 sm:size-72 rounded-2xl border-2 border-primary/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* Four Corner Target Brackets */}
                  <span className="absolute -left-1 -top-1 size-6 border-l-4 border-t-4 border-primary rounded-tl" />
                  <span className="absolute -right-1 -top-1 size-6 border-r-4 border-t-4 border-primary rounded-tr" />
                  <span className="absolute -bottom-1 -left-1 size-6 border-b-4 border-l-4 border-primary rounded-bl" />
                  <span className="absolute -bottom-1 -right-1 size-6 border-b-4 border-r-4 border-primary rounded-br" />

                  {/* Scanning Laser Beam */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  Align QR code inside square
                </div>
              </div>
            ) : null}

            {/* Floating Top Camera Controls (When Camera is Active) */}
            {scanning ? (
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {hasTorch ? (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className="flex size-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                    title={torchOn ? "Turn Flash Off" : "Turn Flash On"}
                  >
                    {torchOn ? <FlashlightOff className="size-4" /> : <Flashlight className="size-4" />}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={flipCamera}
                  className="flex size-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                  title="Switch Camera (Front / Back)"
                >
                  <FlipHorizontal className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={stop}
                  className="flex size-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                  title="Stop Camera"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}

            {/* Analyzing Image Overlay */}
            {analyzingImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-4 text-center z-10">
                <Loader2 className="size-10 text-primary animate-spin" />
                <p className="mt-3 font-display font-bold text-foreground">Analyzing QR code...</p>
                <p className="text-xs text-muted-foreground mt-1">Multi-scale image scan in progress</p>
              </div>
            ) : null}

            {/* Idle State View */}
            {!scanning && !analyzingImage ? (
              <div className="p-6 text-center max-w-sm">
                {uploadedPreview ? (
                  <div className="mx-auto mb-3 size-24 overflow-hidden rounded-xl border border-border shadow-md">
                    <img src={uploadedPreview} alt="Uploaded QR preview" className="size-full object-contain" />
                  </div>
                ) : (
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                    <ScanLine className="size-8" />
                  </div>
                )}

                <p className="mt-3 font-display text-base font-bold text-foreground">
                  Ready to Scan
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Start mobile camera, upload an image file, or drag and drop a screenshot here.
                </p>
              </div>
            ) : null}
          </div>

          {/* Error Banner if Permission Blocked */}
          {errorMessage ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="mt-1 text-[11px] opacity-90">
                  Tip: You can use the <strong>Upload Image</strong> button below to scan any QR screenshot directly.
                </p>
              </div>
            </div>
          ) : null}

          {/* Action Buttons Toolbar */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {scanning ? (
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl text-sm font-bold border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={stop}
              >
                <X className="mr-2 size-4" /> Stop Camera
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={startingCamera || analyzingImage}
                className="h-12 rounded-xl bg-brand-gradient text-sm font-bold text-primary-foreground shadow-brand cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                onClick={() => void startCamera(facingMode)}
              >
                {startingCamera ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 size-4" />
                )}
                Start Camera
              </Button>
            )}

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageFile(file);
                e.target.value = "";
              }}
            />

            {/* Upload Image Button */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={startingCamera || analyzingImage}
              className="h-12 rounded-xl text-sm font-bold border-border/80 hover:bg-secondary cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 size-4 text-primary" />
              Upload Image / Screenshot
            </Button>

            {/* Camera Switch on Mobile (when scanning) */}
            {scanning ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 rounded-xl text-xs font-semibold cursor-pointer border-border/80"
                onClick={flipCamera}
              >
                <FlipHorizontal className="mr-1.5 size-3.5" />
                Switch to {facingMode === "environment" ? "Front" : "Back"} Camera
              </Button>
            ) : null}
          </div>

          <p className="mt-3 text-center sm:text-left text-[11px] text-muted-foreground">
            Supports PNG, JPG, WebP, SVG screenshots, receipts &amp; counter standees. Clipboard paste (Ctrl+V) enabled.
          </p>
        </div>

        {/* Decoded Result Card */}
        {result && parsed ? (
          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-card p-5 sm:p-7 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <Badge className="border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 text-xs">
                  <Check className="mr-1.5 size-3.5" /> QR Code Detected
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold">
                  {parsed.label}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => {
                  setResult("");
                  setUploadedPreview(null);
                  void startCamera(facingMode);
                }}
              >
                <RefreshCw className="mr-1.5 size-3 text-primary" />
                Scan Another Code
              </Button>
            </div>

            {/* Result Value Box */}
            <div className="mt-4 rounded-2xl border border-border/80 bg-secondary/40 p-4">
              <p className="font-mono text-xs sm:text-sm text-foreground break-all leading-relaxed select-all">
                {result}
              </p>
            </div>

            {/* Parsed Details Table (if any e.g. Wi-Fi / UPI) */}
            {parsed.details && Object.keys(parsed.details).length > 0 ? (
              <div className="mt-4 rounded-xl border border-border/60 bg-primary/5 p-3.5 space-y-1.5">
                {Object.entries(parsed.details).map(([k, v]) => (
                  <div key={k} className="flex flex-wrap items-center justify-between text-xs gap-1">
                    <span className="font-semibold text-muted-foreground">{k}:</span>
                    <span className="font-mono font-bold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Primary Action Button (Open Link, UPI Pay, Call, etc.) */}
              {parsed.primaryActionUrl ? (
                <Button
                  asChild
                  size="lg"
                  className="h-11 sm:h-12 rounded-xl bg-brand-gradient text-xs sm:text-sm font-bold text-primary-foreground shadow-brand cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <a href={parsed.primaryActionUrl} target="_blank" rel="noreferrer noopener">
                    <ExternalLink className="mr-2 size-4" />
                    {parsed.primaryActionLabel || "Open Destination"}
                  </a>
                </Button>
              ) : null}

              {/* Copy Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-semibold border-border/80 hover:bg-secondary cursor-pointer"
                onClick={() => {
                  void navigator.clipboard.writeText(result);
                  toast.success("Content copied to clipboard!");
                }}
              >
                <Copy className="mr-2 size-4 text-primary" />
                Copy Content
              </Button>

              {/* Special Wi-Fi Copy Password */}
              {parsed.type === "wifi" && parsed.details?.["Password"] ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={() => {
                    const pass = parsed.details?.["Password"];
                    if (pass) {
                      void navigator.clipboard.writeText(pass);
                      toast.success("Wi-Fi password copied to clipboard!");
                    }
                  }}
                >
                  <Wifi className="mr-2 size-4" />
                  Copy Wi-Fi Password
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
