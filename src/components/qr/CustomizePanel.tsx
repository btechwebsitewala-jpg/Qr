import {
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Frame,
  ImagePlus,
  Layers,
  Palette,
  RotateCcw,
  Shapes,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { QRPreview } from "@/components/qr/QRPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUILTIN_LOGOS } from "@/lib/qr/builtin-logos";
import {
  DEFAULT_STYLE,
  QR_TEMPLATES,
  type DotStyle,
  type EccLevel,
  type EyePupilStyle,
  type EyeStyle,
  type FrameStyle,
  type GradientDirection,
  type GradientType,
  type QRStyle,
} from "@/lib/qr/render";
import { cn } from "@/lib/utils";

interface CustomizePanelProps {
  style: QRStyle;
  onChange: (patch: Partial<QRStyle>) => void;
  onReset: () => void;
  mode: "classic" | "logo";
  onModeChange: (mode: "classic" | "logo") => void;
  previewValue: string;
}

const DOTS: { label: string; value: DotStyle; desc: string }[] = [
  { label: "Square", value: "square", desc: "Classic pixelated" },
  { label: "Rounded", value: "rounded", desc: "Smooth square" },
  { label: "Dots", value: "dots", desc: "Circular bubbles" },
  { label: "Classy", value: "classy", desc: "Modern pill" },
  { label: "Diamond", value: "diamond", desc: "Rhombus cut" },
  { label: "Star", value: "star", desc: "Sparkle 4-point" },
  { label: "Heart", value: "heart", desc: "Romantic heart" },
  { label: "Fluid", value: "fluid", desc: "Soft mosaic" },
];

const EYE_FRAMES: { label: string; value: EyeStyle }[] = [
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Circle", value: "circle" },
  { label: "Leaf", value: "leaf" },
  { label: "Shield", value: "shield" },
  { label: "Diamond", value: "diamond" },
];

const EYE_PUPILS: { label: string; value: EyePupilStyle }[] = [
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Circle", value: "circle" },
  { label: "Diamond", value: "diamond" },
  { label: "Leaf", value: "leaf" },
  { label: "Star", value: "star" },
];

const FRAMES: { label: string; value: FrameStyle; desc: string }[] = [
  { label: "None", value: "none", desc: "Clean barcode" },
  { label: "Bottom CTA", value: "bottom", desc: "Banner below" },
  { label: "Top CTA", value: "top", desc: "Banner above" },
  { label: "Rounded Border", value: "rounded", desc: "Card outline" },
  { label: "Pill Badge", value: "badge", desc: "Compact pill" },
  { label: "Phone Mockup", value: "phone", desc: "Smartphone bezel" },
  { label: "Chat Bubble", value: "chat", desc: "Speech balloon" },
  { label: "Ribbon", value: "ribbon", desc: "Modern tag" },
  { label: "Minimalist", value: "minimal", desc: "Fine wireline" },
];

const QUICK_TEXTS = [
  "SCAN ME",
  "VISIT WEBSITE",
  "CONNECT WITH US",
  "VIEW MENU",
  "PAY NOW",
  "SPECIAL OFFER",
];

const POPULAR_COLORS = [
  "#000000",
  "#0C2340",
  "#2563EB",
  "#0D9488",
  "#16A34A",
  "#D97706",
  "#DC2626",
  "#9333EA",
];

const LEVELS: { label: string; value: EccLevel; hint: string }[] = [
  { label: "Low (7%)", value: "L", hint: "Smallest size, clean look" },
  { label: "Medium (15%)", value: "M", hint: "Recommended balance" },
  { label: "Quartile (25%)", value: "Q", hint: "Better for logos or outdoor" },
  { label: "High (30%)", value: "H", hint: "Best redundancy and logo safe" },
];

export function CustomizePanel({
  style,
  onChange,
  onReset,
  mode,
  onModeChange,
  previewValue,
}: CustomizePanelProps) {
  const logoRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<string>("templates");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [customEyeColors, setCustomEyeColors] = useState<boolean>(
    Boolean(style.eyeFrameColor || style.eyePupilColor),
  );

  const selectMode = (next: "classic" | "logo") => {
    onModeChange(next);
    if (next === "logo") setTab("logo");
  };

  const pickLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Logo must be an image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logo: String(reader.result) });
      onModeChange("logo");
      toast.success("Logo applied successfully");
    };
    reader.readAsDataURL(file);
  };

  const filteredTemplates = QR_TEMPLATES.filter((tpl) => {
    if (templateFilter === "all") return true;
    return tpl.category === templateFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Mode Selector */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => selectMode("classic")}
          className={cn(
            "group relative rounded-2xl border p-4 text-left transition-all",
            mode === "classic"
              ? "border-primary bg-primary/5 shadow-brand ring-1 ring-primary/20"
              : "border-border hover:border-border/80 hover:bg-secondary/40",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Classic QR</p>
            {mode === "classic" ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Fast, ultra-reliable scanning with full styling and custom gradients.
          </p>
        </button>

        <button
          type="button"
          onClick={() => selectMode("logo")}
          className={cn(
            "group relative rounded-2xl border p-4 text-left transition-all",
            mode === "logo"
              ? "border-primary bg-primary/5 shadow-brand ring-1 ring-primary/20"
              : "border-border hover:border-border/80 hover:bg-secondary/40",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">Logo / Brand QR</p>
              <Badge className="border-0 bg-brand-gradient text-[10px] font-bold text-primary-foreground">
                POPULAR
              </Badge>
            </div>
            {mode === "logo" ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Embed WhatsApp, Instagram or your brand logo right in the centre.
          </p>
        </button>
      </div>

      {/* Main Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-secondary/60 rounded-2xl">
          <TabsTrigger value="templates" className="flex items-center gap-1.5 py-2 text-xs">
            <Sparkles className="size-3.5" /> Templates
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-1.5 py-2 text-xs">
            <Palette className="size-3.5" /> Colors
          </TabsTrigger>
          <TabsTrigger value="shapes" className="flex items-center gap-1.5 py-2 text-xs">
            <Shapes className="size-3.5" /> Shapes
          </TabsTrigger>
          <TabsTrigger value="frames" className="flex items-center gap-1.5 py-2 text-xs">
            <Frame className="size-3.5" /> Frames
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-1.5 py-2 text-xs">
            <ImagePlus className="size-3.5" /> Logo
          </TabsTrigger>
          <TabsTrigger value="level" className="flex items-center gap-1.5 py-2 text-xs">
            <Sliders className="size-3.5" /> Options
          </TabsTrigger>
        </TabsList>

        {/* 1. TEMPLATES TAB */}
        <TabsContent value="templates" className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: "All Styles" },
              { id: "gradient", label: "✨ Gradients" },
              { id: "business", label: "💼 Business" },
              { id: "creative", label: "🎨 Creative" },
              { id: "classic", label: "⚡ Classic" },
            ].map((cat) => (
              <Button
                key={cat.id}
                type="button"
                variant={templateFilter === cat.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs rounded-lg"
                onClick={() => setTemplateFilter(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-h-[380px] overflow-y-auto pr-1">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  onChange(template.style);
                  toast.success(`Applied ${template.name} preset`);
                }}
                className="group relative flex flex-col items-center rounded-2xl border border-border bg-card p-2.5 transition-all hover:border-primary hover:shadow-brand hover:-translate-y-0.5 cursor-pointer text-center"
              >
                <div className="flex items-center justify-center rounded-xl bg-secondary/30 p-2 w-full aspect-square">
                  <QRPreview
                    value={previewValue || "https://bt-qr.app"}
                    style={{ ...DEFAULT_STYLE, ...template.style, logo: null }}
                    size={100}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground line-clamp-1">
                  {template.name}
                </p>
                <span className="text-[10px] capitalize text-muted-foreground">
                  {template.category}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* 2. COLORS & GRADIENTS TAB */}
        <TabsContent value="colors" className="mt-5 space-y-5">
          {/* Gradient vs Solid Toggle */}
          <div className="rounded-2xl border border-border bg-secondary/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Color Fill Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Choose between high-contrast solid or modern multi-color gradient.
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={style.gradientType === "none" || !style.gradientType ? "default" : "ghost"}
                  className="h-7 px-3 text-xs"
                  onClick={() => onChange({ gradientType: "none" })}
                >
                  Solid
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={style.gradientType && style.gradientType !== "none" ? "default" : "ghost"}
                  className="h-7 px-3 text-xs"
                  onClick={() =>
                    onChange({
                      gradientType: "linear",
                      gradientColor: style.gradientColor || "#00F0FF",
                      gradientDirection: style.gradientDirection || "diagonal",
                    })
                  }
                >
                  Gradient ✨
                </Button>
              </div>
            </div>

            {/* If Gradient is Active */}
            {style.gradientType && style.gradientType !== "none" ? (
              <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-border/60">
                <ColorField
                  label="Start Color"
                  value={style.fg}
                  onChange={(fg) => onChange({ fg })}
                />
                <ColorField
                  label="End Color"
                  value={style.gradientColor || "#2D8A9E"}
                  onChange={(gradientColor) => onChange({ gradientColor })}
                />
                <div>
                  <Label className="text-xs">Gradient Flow</Label>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {[
                      { label: "↘ 45°", val: "diagonal", type: "linear" },
                      { label: "→ 90°", val: "horizontal", type: "linear" },
                      { label: "◎ Radial", val: "diagonal", type: "radial" },
                    ].map((g) => (
                      <Button
                        key={g.label}
                        type="button"
                        variant={
                          style.gradientType === g.type && style.gradientDirection === g.val
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="h-8 text-[11px] px-1"
                        onClick={() =>
                          onChange({
                            gradientType: g.type as GradientType,
                            gradientDirection: g.val as GradientDirection,
                          })
                        }
                      >
                        {g.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <ColorField
                  label="QR Code Color"
                  value={style.fg}
                  onChange={(fg) => onChange({ fg })}
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
                  {POPULAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChange({ fg: c })}
                      className="size-5 rounded-full border border-border shadow-xs hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Background Customization */}
          <div className="rounded-2xl border border-border bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Transparent Background</Label>
                <p className="text-xs text-muted-foreground">
                  Perfect for placing QR on custom posters, flyers or business cards.
                </p>
              </div>
              <Switch
                checked={Boolean(style.bgTransparent)}
                onCheckedChange={(checked) => onChange({ bgTransparent: checked })}
              />
            </div>

            {!style.bgTransparent ? (
              <div className="pt-2 border-t border-border/60">
                <ColorField
                  label="Background Color"
                  value={style.bg}
                  onChange={(bg) => onChange({ bg })}
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
                  {["#FFFFFF", "#F8FAFC", "#F0FDF4", "#EFF6FF", "#FFF7ED", "#0B0E17", "#0C2340"].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onChange({ bg: c })}
                        className="size-5 rounded-full border border-border shadow-xs hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ),
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-primary font-medium flex items-center gap-1 pt-1">
                <Check className="size-3.5" /> Export as PNG will download with genuine transparent alpha channel.
              </p>
            )}
          </div>

          {/* Corner Eyes Custom Color Option */}
          <div className="rounded-2xl border border-border bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Custom Corner Eyes Color</Label>
                <p className="text-xs text-muted-foreground">
                  Make the 3 corner markers stand out with distinct accent colors.
                </p>
              </div>
              <Switch
                checked={customEyeColors}
                onCheckedChange={(checked) => {
                  setCustomEyeColors(checked);
                  if (!checked) onChange({ eyeFrameColor: "", eyePupilColor: "" });
                  else
                    onChange({
                      eyeFrameColor: style.eyeFrameColor || style.fg,
                      eyePupilColor: style.eyePupilColor || style.fg,
                    });
                }}
              />
            </div>

            {customEyeColors ? (
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/60">
                <ColorField
                  label="Outer Eye Ring Color"
                  value={style.eyeFrameColor || style.fg}
                  onChange={(eyeFrameColor) => onChange({ eyeFrameColor })}
                />
                <ColorField
                  label="Inner Eye Pupil Color"
                  value={style.eyePupilColor || style.eyeFrameColor || style.fg}
                  onChange={(eyePupilColor) => onChange({ eyePupilColor })}
                />
              </div>
            ) : null}
          </div>
        </TabsContent>

        {/* 3. SHAPES & PATTERNS TAB */}
        <TabsContent value="shapes" className="mt-5 space-y-6">
          {/* Dot Patterns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold text-sm">Data Dot Pattern</Label>
              <span className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground capitalize">{style.dotStyle}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DOTS.map((dot) => (
                <button
                  key={dot.value}
                  type="button"
                  onClick={() => onChange({ dotStyle: dot.value })}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all cursor-pointer",
                    style.dotStyle === dot.value
                      ? "border-primary bg-primary/10 shadow-brand text-foreground font-semibold ring-1 ring-primary/30"
                      : "border-border hover:bg-secondary/40 text-muted-foreground",
                  )}
                >
                  <span className="text-sm font-medium">{dot.label}</span>
                  <span className="text-[10px] opacity-75">{dot.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Eye Frame (Outer Ring) */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold text-sm">Corner Eye Frame (Outer)</Label>
              <span className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground capitalize">{style.eyeStyle}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {EYE_FRAMES.map((eye) => (
                <Button
                  key={eye.value}
                  type="button"
                  size="sm"
                  variant={style.eyeStyle === eye.value ? "default" : "outline"}
                  className="h-9 text-xs capitalize"
                  onClick={() => onChange({ eyeStyle: eye.value })}
                >
                  {eye.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Eye Pupil (Inner Ball) */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold text-sm">Corner Eye Pupil (Center)</Label>
              <span className="text-xs text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground capitalize">
                  {style.eyePupilStyle || style.eyeStyle}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {EYE_PUPILS.map((pupil) => (
                <Button
                  key={pupil.value}
                  type="button"
                  size="sm"
                  variant={style.eyePupilStyle === pupil.value ? "default" : "outline"}
                  className="h-9 text-xs capitalize"
                  onClick={() => onChange({ eyePupilStyle: pupil.value })}
                >
                  {pupil.label}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 4. FRAMES & CTA TAB */}
        <TabsContent value="frames" className="mt-5 space-y-5">
          <div>
            <Label className="font-semibold text-sm">Choose Frame Style</Label>
            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {FRAMES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => onChange({ frame: f.value })}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer",
                    style.frame === f.value
                      ? "border-primary bg-primary/10 shadow-brand ring-1 ring-primary/30"
                      : "border-border hover:bg-secondary/40",
                  )}
                >
                  <p className="text-xs font-semibold text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {style.frame !== "none" ? (
            <div className="rounded-2xl border border-border bg-secondary/20 p-4 space-y-4">
              <div>
                <Label htmlFor="frame-text" className="text-xs font-medium">
                  Call to Action (CTA Text)
                </Label>
                <Input
                  id="frame-text"
                  className="mt-1.5"
                  maxLength={24}
                  value={style.frameText}
                  onChange={(event) => onChange({ frameText: event.target.value })}
                  disabled={style.frame === "rounded"}
                  placeholder="e.g. SCAN ME"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_TEXTS.map((txt) => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => onChange({ frameText: txt })}
                      className="rounded-lg border border-border/80 bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:border-primary hover:text-foreground cursor-pointer"
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/60">
                <ColorField
                  label="Frame Accent Color"
                  value={style.frameColor}
                  onChange={(frameColor) => onChange({ frameColor })}
                />
                <ColorField
                  label="Frame Text Color"
                  value={style.frameTextColor || "#FFFFFF"}
                  onChange={(frameTextColor) => onChange({ frameTextColor })}
                />
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* 5. LOGO & ICONS TAB */}
        <TabsContent value="logo" className="mt-5 space-y-5">
          {/* Built-in Brand Icons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold text-sm">Popular 1-Click Brand Logos</Label>
              <span className="text-xs text-muted-foreground">Click to embed</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {BUILTIN_LOGOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange({ logo: item.dataUri });
                    onModeChange("logo");
                    toast.success(`Embedded ${item.name} logo`);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-2 transition-all hover:scale-105 cursor-pointer aspect-square text-center",
                    style.logo === item.dataUri
                      ? "border-primary bg-primary/10 shadow-brand ring-2 ring-primary"
                      : "border-border bg-card hover:bg-secondary/40",
                  )}
                  title={item.name}
                >
                  <img src={item.dataUri} alt={item.name} className="size-6 object-contain" />
                  <span className="mt-1 text-[9px] font-medium text-muted-foreground truncate w-full">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Upload */}
          <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-4 space-y-3">
            <Label className="text-sm font-semibold">…Or Upload Your Custom Brand Logo</Label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => pickLogo(event.target.files?.[0])}
              />
              <Button type="button" variant="outline" onClick={() => logoRef.current?.click()}>
                <ImagePlus className="mr-2 size-4 text-primary" /> Choose Image File
              </Button>
              {style.logo ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onChange({ logo: null })}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 size-4" /> Remove Logo
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">PNG, SVG or JPG under 2 MB</span>
              )}
            </div>
          </div>

          {/* Logo Size and Background Badge */}
          {style.logo ? (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Logo Size ({style.logoSize}%)</Label>
                  <span className="text-[11px] text-muted-foreground">Recommended: 20-24%</span>
                </div>
                <Slider
                  className="mt-2"
                  min={14}
                  max={30}
                  step={1}
                  value={[style.logoSize || 22]}
                  onValueChange={([logoSize]) => onChange({ logoSize: logoSize ?? 22 })}
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Logo Background Shape</Label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Rounded Box", val: "square" },
                    { label: "Circle Badge", val: "circle" },
                    { label: "No Background", val: "none" },
                  ].map((s) => (
                    <Button
                      key={s.label}
                      type="button"
                      size="sm"
                      variant={(style.logoShape || "square") === s.val ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => onChange({ logoShape: s.val as "square" | "circle" | "none" })}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Sparkles className="size-3.5 text-primary shrink-0" />
                Error correction automatically switches to <strong>High (30%)</strong> to protect
                scannability while a logo is embedded.
              </p>
            </div>
          ) : null}
        </TabsContent>

        {/* 6. OPTIONS & LEVEL TAB */}
        <TabsContent value="level" className="mt-5 space-y-5">
          <div>
            <Label className="font-semibold text-sm">Error Correction Redundancy</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Higher error correction allows the QR code to be scanned even if printed on textured paper,
              partially scratched or covered.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  disabled={Boolean(style.logo)}
                  onClick={() => onChange({ ecc: lvl.value })}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer",
                    style.ecc === lvl.value
                      ? "border-primary bg-primary/10 shadow-brand ring-1 ring-primary/30"
                      : "border-border hover:bg-secondary/40",
                    style.logo ? "opacity-60 cursor-not-allowed" : "",
                  )}
                >
                  <p className="text-xs font-semibold text-foreground">{lvl.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{lvl.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Quiet Zone Margin ({style.margin ?? 2} modules)</Label>
              <span className="text-[11px] text-muted-foreground">White border around code</span>
            </div>
            <Slider
              className="mt-2"
              min={0}
              max={6}
              step={1}
              value={[style.margin ?? 2]}
              onValueChange={([margin]) => onChange({ margin: margin ?? 2 })}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Button */}
      <div className="flex justify-between items-center pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <RotateCcw className="mr-1.5 size-3.5" /> Reset all customize settings
        </Button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value.startsWith("#") ? value.slice(0, 7) : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="size-8 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
        />
        <Input
          value={value}
          maxLength={9}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 text-xs font-mono"
        />
      </div>
    </div>
  );
}

