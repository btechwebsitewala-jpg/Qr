import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Check,
  Crown,
  Download,
  FileText,
  ImagePlus,
  Loader2,
  Lock,
  LogIn,
  Palette,
  Sparkles,
  Type,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import avatarFemale from "@/assets/avatar-female.png";
import avatarMale from "@/assets/avatar-male.png";
import avatarOther from "@/assets/avatar-other.png";
import { PlanUpgradeModal } from "@/components/qr/PlanUpgradeModal";
import { QRPreview } from "@/components/qr/QRPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useUserPlan } from "@/hooks/useUserPlan";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import {
  downloadStandee,
  STANDEE_THEMES,
  type StandeeTheme,
} from "@/lib/qr/standee";
import { cn } from "@/lib/utils";

export type AvatarId = "male" | "female" | "other" | "custom";

interface AvatarItem {
  id: AvatarId;
  label: string;
  src: string;
  blurb: string;
  panel: { left: number; top: number; width: number };
}

const AVATARS: AvatarItem[] = [
  {
    id: "male",
    label: "Aarav",
    src: avatarMale,
    blurb: "Male 3D business character",
    panel: { left: 42.2, top: 19, width: 38 },
  },
  {
    id: "female",
    label: "Mira",
    src: avatarFemale,
    blurb: "Female 3D presenter character",
    panel: { left: 45.2, top: 17.5, width: 34.5 },
  },
  {
    id: "other",
    label: "Bit Bot",
    src: avatarOther,
    blurb: "Futuristic robot mascot",
    panel: { left: 49, top: 24.8, width: 36.5 },
  },
];

interface AvatarStageProps {
  value: string;
  style?: QRStyle;
  className?: string;
  initialTitle?: string;
  initialSubtitle?: string;
}

/**
 * 3D Character & Custom Mascot Stage:
 * Generate, customize, and download high-resolution printable standees and posters
 * with 3D characters or custom store mascots, integrated with paid plan entitlement.
 */
export function AvatarStage({
  value,
  style = DEFAULT_STYLE,
  className,
  initialTitle = "SCAN TO PAY",
  initialSubtitle = "Instant UPI • Google Pay • PhonePe",
}: AvatarStageProps) {
  const { user } = useAuth();
  const { plan, isPaid, isPremium, setSimulatedPlan } = useUserPlan();

  const [active, setActive] = useState<AvatarId>("male");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [badgeText, setBadgeText] = useState("OFFICIAL PARTNER");
  const [theme, setTheme] = useState<StandeeTheme>("modern_blue");
  const [downloading, setDownloading] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "pdf">("png");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = STANDEE_THEMES.find((t) => t.id === theme) ?? STANDEE_THEMES[0]!;
  const defaultAvatar = AVATARS.find((a) => a.id === active) ?? AVATARS[0]!;

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in to upload custom characters or mascots.",
      });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, SVG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file should be smaller than 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomImage(dataUrl);
      setActive("custom");
      toast.success("Custom character / mascot loaded!");
    };
    reader.readAsDataURL(file);
  };

  const executeDownload = async (isWatermarked = false) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in to download standees.",
      });
      return;
    }
    setDownloading(true);
    try {
      const characterSrc =
        active === "custom" && customImage ? customImage : defaultAvatar.src;

      await downloadStandee({
        qrValue: value || "https://bt-qr.app",
        qrStyle: style,
        characterSrc,
        panelRect: active === "custom" ? undefined : defaultAvatar.panel,
        title,
        subtitle,
        theme,
        badgeText,
        isCustomCharacter: active === "custom",
        format: exportFormat,
        filename: `bt-qr-standee-${active}`,
        watermark: isWatermarked,
      });

      toast.success(`Standee poster downloaded as ${exportFormat.toUpperCase()}!`, {
        description: isWatermarked
          ? "Free preview watermark applied. Upgrade to remove watermark."
          : "Commercial print-ready vector file ready.",
      });
    } catch (err) {
      toast.error("Download failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadClick = () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in to generate and download standees.",
      });
      return;
    }
    // If user is on a paid plan (Lite or Premium) or demo, allow direct download
    if (isPaid) {
      void executeDownload(false);
    } else {
      // Free tier: trigger plan upgrade modal
      setShowUpgradeModal(true);
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col gap-5 sm:gap-6 rounded-2xl sm:rounded-3xl border-2 border-border bg-card p-3.5 sm:p-6 md:p-7 shadow-xl backdrop-blur-xl",
        className,
      )}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-chart-2/10 blur-3xl"
      />

      {!user ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 sm:p-4 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-foreground font-semibold">
            <Lock className="size-4.5 text-primary shrink-0" />
            <span>Login required to generate and download printable 3D standees &amp; posters.</span>
          </div>
          <Button asChild size="sm" className="h-8 rounded-xl bg-brand-gradient text-xs font-bold text-primary-foreground shadow-xs shrink-0">
            <Link to="/auth">
              <LogIn className="mr-1.5 size-3.5" /> Log In
            </Link>
          </Button>
        </div>
      ) : null}

      {/* Header bar with Plan status and simulator switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3.5 sm:pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-primary/15 text-primary font-bold px-2.5 sm:px-3 py-1 text-xs">
            <Sparkles className="mr-1.5 size-3.5 animate-pulse shrink-0" />
            3D Character Signage Studio
          </Badge>
          {isPaid ? (
            <Badge className="border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 text-[11px] sm:text-xs">
              <Crown className="mr-1 size-3 text-amber-500 shrink-0" />
              {isPremium ? "Premium (Unlimited)" : "Lite Plan (Active)"}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-medium text-[11px] sm:text-xs">
              Free Plan
            </Badge>
          )}
        </div>

        {/* Plan simulation quick switch for testing / previewing */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground self-start sm:self-auto">
          <span className="hidden sm:inline">Plan Mode:</span>
          <button
            type="button"
            onClick={() => setSimulatedPlan(isPaid ? "free" : "premium")}
            className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
            title="Click to toggle between Free and Paid mode for testing"
          >
            {isPaid ? (
              <>
                <Crown className="size-3 text-amber-500" />
                <span>Simulate: Paid Plan</span>
              </>
            ) : (
              <>
                <Zap className="size-3 text-primary" />
                <span>Simulate: Free (Click to Test)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Stage Visual & Right Customizer */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left Visual Poster Stage Column (5 Cols) */}
        <div className="flex flex-col items-center w-full lg:col-span-5">
          <div
            className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] mx-auto overflow-hidden rounded-[1.8rem] sm:rounded-[2.2rem] border-2 border-white/20 p-3 sm:p-4 shadow-2xl transition-all duration-300"
            style={{
              background: `linear-gradient(145deg, ${currentTheme.bgGradStart}, ${currentTheme.bgGradEnd})`,
            }}
          >
            {/* Header Badge */}
            {badgeText ? (
              <div className="mx-auto mb-2 w-max">
                <span
                  className="inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-extrabold tracking-wide uppercase shadow-sm"
                  style={{
                    backgroundColor: currentTheme.badgeBg,
                    color: currentTheme.badgeText,
                    border: `1px solid ${currentTheme.accentColor}`,
                  }}
                >
                  {badgeText}
                </span>
              </div>
            ) : null}

            {/* Poster Headline */}
            <h4
              className="text-center font-display text-lg font-black tracking-tight drop-shadow-sm"
              style={{ color: currentTheme.textColor }}
            >
              {title || "SCAN TO PAY"}
            </h4>

            {subtitle ? (
              <p
                className="text-center text-[11px] font-medium leading-tight opacity-90"
                style={{ color: currentTheme.subtitleColor }}
              >
                {subtitle}
              </p>
            ) : null}

            {/* Visual Character Display Area */}
            <div className="relative mt-3 flex min-h-[300px] flex-col items-center justify-center">
              {active === "custom" && customImage ? (
                <div className="flex w-full flex-col items-center gap-3 py-2">
                  <div className="relative size-32 overflow-hidden rounded-2xl border-2 border-white/40 shadow-xl bg-white/10 backdrop-blur-md">
                    <img
                      src={customImage}
                      alt="Custom Mascot / Character"
                      className="size-full object-contain p-1"
                    />
                  </div>
                  {/* QR Card placed neatly below custom mascot */}
                  <div className="aspect-square w-[60%] rounded-2xl bg-white p-3 shadow-2xl">
                    <QRPreview
                      value={value || "https://bt-qr.app"}
                      style={style}
                      size={200}
                      className="size-full [&_svg]:h-full [&_svg]:w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-[260px]">
                  <img
                    src={defaultAvatar.src}
                    alt={`3D ${defaultAvatar.label} character holding QR`}
                    width={768}
                    height={1024}
                    loading="lazy"
                    className="mx-auto w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]"
                  />
                  {/* Live QR sits exactly on the panel the character holds */}
                  <div
                    className="absolute aspect-square rounded-[8px] bg-white p-[6%] shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
                    style={{
                      left: `${defaultAvatar.panel.left}%`,
                      top: `${defaultAvatar.panel.top}%`,
                      width: `${defaultAvatar.panel.width}%`,
                    }}
                  >
                    <QRPreview
                      value={value || "https://bt-qr.app"}
                      style={style}
                      size={200}
                      className="size-full [&_svg]:h-full [&_svg]:w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Standee Footer Branding */}
            <div className="mt-3 border-t border-white/10 pt-2 text-center">
              <span
                className="text-[10px] font-bold tracking-widest uppercase opacity-75"
                style={{ color: currentTheme.subtitleColor }}
              >
                BT-QR STUDIO • HIGH-SPEED SCAN
              </span>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {active === "custom"
              ? "Custom mascot / photo standee card layout"
              : defaultAvatar.blurb}
          </p>
        </div>

        {/* Right Configuration & Action Column (7 Cols) */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Character Selector Pills */}
          <div>
            <Label className="text-xs font-bold text-foreground">Select Character or Upload Own Mascot</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVATARS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                    active === item.id
                      ? "border-primary bg-primary text-primary-foreground shadow-brand"
                      : "border-border/80 bg-secondary/40 text-foreground hover:bg-secondary",
                  )}
                >
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Custom Mascot Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCustomUpload}
              />
              <button
                type="button"
                onClick={() => {
                  if (customImage) {
                    setActive("custom");
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                  active === "custom"
                    ? "border-primary bg-primary text-primary-foreground shadow-brand"
                    : "border-dashed border-primary/50 bg-primary/5 text-primary hover:bg-primary/10",
                )}
              >
                <ImagePlus className="size-3.5" />
                <span>{customImage ? "Custom Mascot (Active)" : "+ Upload Own Character"}</span>
              </button>

              {customImage ? (
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="rounded-xl border border-border/80 bg-secondary/50 px-2 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Change custom character image"
                >
                  Change
                </button>
              ) : null}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Palette className="size-3.5 text-primary" />
              Poster Backdrop Theme
            </Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STANDEE_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-bold transition-all cursor-pointer",
                    theme === t.id
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                      : "border-border/70 hover:bg-secondary/40",
                  )}
                >
                  <span
                    className="size-4 shrink-0 rounded-full border border-white/20 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${t.bgGradStart}, ${t.bgGradEnd})`,
                    }}
                  />
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Customizer Toggle & Inputs */}
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Type className="size-3.5 text-primary" /> Customize Poster Text
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                {showConfig ? "Hide" : "Edit Text"}
              </button>
            </div>

            {showConfig ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="poster-title" className="text-[11px] text-muted-foreground font-semibold">
                    Main Headline
                  </Label>
                  <Input
                    id="poster-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. SCAN TO PAY"
                    className="mt-1 h-9 rounded-xl text-xs"
                    maxLength={32}
                  />
                </div>

                <div>
                  <Label htmlFor="poster-badge" className="text-[11px] text-muted-foreground font-semibold">
                    Top Badge Pill
                  </Label>
                  <Input
                    id="poster-badge"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. OFFICIAL PARTNER"
                    className="mt-1 h-9 rounded-xl text-xs"
                    maxLength={24}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="poster-sub" className="text-[11px] text-muted-foreground font-semibold">
                    Subtitle / Supporting Info
                  </Label>
                  <Input
                    id="poster-sub"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Instant UPI • Google Pay • PhonePe"
                    className="mt-1 h-9 rounded-xl text-xs"
                    maxLength={48}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Download & Export Section */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <p className="text-xs font-bold text-foreground">Print-Ready Standee Poster</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  High-resolution 1200x1600 printable format for store counters &amp; tables.
                </p>
              </div>

              {/* Format Switcher: PNG / PDF */}
              <div className="inline-flex self-start sm:self-auto rounded-xl border border-border/80 bg-background/80 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setExportFormat("png")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                    exportFormat === "png"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat("pdf")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                    exportFormat === "pdf"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  PDF
                </button>
              </div>
            </div>

            {!user ? (
              <div className="pt-1">
                <Button
                  asChild
                  size="lg"
                  className="w-full h-11 sm:h-12 rounded-xl bg-brand-gradient text-xs sm:text-sm font-bold text-primary-foreground shadow-brand cursor-pointer"
                >
                  <Link to="/auth">
                    <Lock className="mr-2 size-4 shrink-0" /> Log in to Generate &amp; Download Standee
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
                <Button
                  size="lg"
                  className="w-full sm:flex-1 h-11 sm:h-12 rounded-xl bg-brand-gradient text-xs sm:text-sm font-bold text-primary-foreground shadow-brand cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  disabled={downloading}
                  onClick={handleDownloadClick}
                >
                  {downloading ? (
                    <Loader2 className="mr-2 size-4 animate-spin shrink-0" />
                  ) : (
                    <Download className="mr-2 size-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {isPaid
                      ? `Download Standee (${exportFormat.toUpperCase()})`
                      : `Download Standee (${exportFormat.toUpperCase()}) - Paid`}
                  </span>
                </Button>

                {!isPaid ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-11 sm:h-12 rounded-xl border-border/80 text-xs font-semibold cursor-pointer hover:bg-secondary shrink-0"
                    disabled={downloading}
                    onClick={() => void executeDownload(true)}
                    title="Download a free preview poster with a small watermark"
                  >
                    <Sparkles className="mr-1.5 size-3.5 text-primary shrink-0" />
                    Free Demo Download
                  </Button>
                ) : null}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground text-center">
              {!user
                ? "Sign in or create a free account to customize and export standees."
                : isPaid
                  ? "✓ Watermark-free commercial high-res export included in your paid plan."
                  : "Included in Lite & Premium plans. Click above to export or test free demo."}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onTryWatermarkedDemo={() => void executeDownload(true)}
        featureTitle="3D Character Standee & Mascot Generator"
        featureDescription="Print commercial store signs and restaurant table tents with 3D characters or your own store mascot holding your live QR code. Unlocked on Lite (10/mo) and Premium (Unlimited) plans."
      />
    </div>
  );
}
