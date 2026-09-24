import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Download,
  ExternalLink,
  Info,
  Link2,
  Loader2,
  Lock,
  LogIn,
  Save,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AvatarStage } from "@/components/qr/AvatarStage";
import { ContentForm } from "@/components/qr/ContentForm";
import { CustomizePanel } from "@/components/qr/CustomizePanel";
import { QRPreview } from "@/components/qr/QRPreview";
import { TypeSelector } from "@/components/qr/TypeSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { encodeQRValue, getQRType, validateQRValues, QR_TYPES, type QRTypeId } from "@/lib/qr/config";
import {
  downloadQR,
  EXPORT_FORMATS,
  EXPORT_SIZES,
  snapshotQRCard,
  type ExportFormat,
} from "@/lib/qr/download";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import {
  getQrCode,
  makeShortCode,
  saveQrCode,
  shortUrl,
  syncDynamicRouteToServer,
  updateQrCode,
} from "@/lib/qr/store";
import { cn } from "@/lib/utils";

function StepHeader({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-primary-foreground">
        {step}
      </span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export function QRWizard({
  initialType = "url",
  initialEditId,
}: {
  initialType?: QRTypeId;
  initialEditId?: string | undefined;
}) {
  const { user } = useAuth();
  const [typeId, setTypeId] = useState<QRTypeId>(initialType);
  const [editingId, setEditingId] = useState<string | null>(initialEditId || null);
  const [editingName, setEditingName] = useState<string>("");
  const [allValues, setAllValues] = useState<Record<string, Record<string, string>>>({});
  const [style, setStyle] = useState<QRStyle>(DEFAULT_STYLE);
  const [mode, setMode] = useState<"classic" | "logo">("classic");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [size, setSize] = useState(1000);
  const [dynamic, setDynamic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [sessionDynamicCode, setSessionDynamicCode] = useState(() => makeShortCode());
  const [snapping, setSnapping] = useState(false);
  const [openStandeeModal, setOpenStandeeModal] = useState(false);

  // Load existing QR data when opened in edit mode
  useEffect(() => {
    if (!initialEditId) return;
    void getQrCode(initialEditId)
      .then((code) => {
        if (!code) return;
        setEditingId(code.id);
        setEditingName(code.name);
        if (code.qr_type && QR_TYPES.some((t) => t.id === code.qr_type)) {
          setTypeId(code.qr_type as QRTypeId);
        }
        if (code.style) {
          setStyle(code.style);
          if (code.style.logo) setMode("logo");
        }
        if (code.content) {
          setAllValues((prev) => ({ ...prev, [code.qr_type]: code.content }));
        }
        setDynamic(code.is_dynamic);
        if (code.short_code) {
          setSavedCode(code.short_code);
          setSessionDynamicCode(code.short_code);
        }
        toast.info(`Editing saved QR code: ${code.name}`, {
          description: "Full Studio Designer active! All customizations update live.",
        });
      })
      .catch(() => {});
  }, [initialEditId]);

  const values = allValues[typeId] ?? {};
  const def = getQRType(typeId);

  const directValue = useMemo(() => encodeQRValue(typeId, values), [typeId, values]);
  const error = useMemo(() => validateQRValues(typeId, values), [typeId, values]);

  const isUrlType = /^https?:\/\//i.test(directValue);
  const isDynamicActive = dynamic && isUrlType;
  const activeShortCode = savedCode || sessionDynamicCode;
  const encodedValue = isDynamicActive ? shortUrl(activeShortCode) : directValue;

  // Real-time synchronization of dynamic destination with server registry
  useEffect(() => {
    if (isDynamicActive && directValue && !error) {
      void syncDynamicRouteToServer({
        short_code: activeShortCode,
        target_url: directValue,
        name: editingName || `${def.label} QR`,
      });
    }
  }, [isDynamicActive, directValue, activeShortCode, def.label, error, editingName]);

  const patchValues = useCallback(
    (patch: Record<string, string>) => {
      setAllValues((prev) => ({ ...prev, [typeId]: { ...(prev[typeId] ?? {}), ...patch } }));
    },
    [typeId],
  );

  const handleModeChange = (next: "classic" | "logo") => {
    setMode(next);
    if (next === "classic") setStyle((prev) => ({ ...prev, logo: null }));
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in or create an account to generate and download QR codes.",
      });
      return;
    }
    if (error) return;
    setDownloading(true);
    try {
      if (isDynamicActive && directValue) {
        void syncDynamicRouteToServer({
          short_code: activeShortCode,
          target_url: directValue,
          name: editingName || `${def.label} QR`,
        });

        if (editingId) {
          void updateQrCode(editingId, {
            name: editingName || `${def.label} QR`,
            content: values,
            style,
            is_dynamic: true,
            target_url: directValue,
            encoded_value: encodedValue,
            short_code: activeShortCode,
          });
        } else {
          void saveQrCode({
            name: editingName || `${def.label} QR`,
            typeId,
            values,
            encodedValue: directValue,
            style,
            isDynamic: true,
            shortCode: activeShortCode,
          }).then((row) => {
            if (row.short_code) setSavedCode(row.short_code);
          });
        }
      }

      await downloadQR({
        value: encodedValue,
        style,
        format,
        size,
        filename: `bt-qr-${typeId}`,
      });
      toast.success(
        isDynamicActive
          ? `Dynamic QR code downloaded! Destination can be changed live anytime from your dashboard.`
          : `QR code downloaded as ${format.toUpperCase()}`,
      );
    } catch (err) {
      toast.error("Download failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleSnapshot = async (copy: boolean) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in or create an account to create QR snapshots.",
      });
      return;
    }
    if (error) return;
    setSnapping(true);
    try {
      if (isDynamicActive && directValue) {
        void syncDynamicRouteToServer({
          short_code: activeShortCode,
          target_url: directValue,
          name: `${def.label} QR`,
        });
      }

      const result = await snapshotQRCard({
        value: encodedValue,
        style,
        title: `${def.label} QR code`,
        caption: encodedValue,
        filename: `bt-qr-${typeId}-snapshot`,
        copy,
      });
      toast.success(
        result === "copied" ? "Snapshot copied to clipboard" : "Snapshot image saved",
      );
    } catch (err) {
      toast.error("Could not create the snapshot", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSnapping(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in or create an account to save QR codes.",
      });
      return;
    }
    if (error) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateQrCode(editingId, {
          name: editingName || `${def.label} QR`,
          content: values,
          style,
          is_dynamic: isDynamicActive,
          target_url: isDynamicActive ? directValue : null,
          encoded_value: encodedValue,
          short_code: activeShortCode,
        });
        toast.success("QR code updated live!", {
          description: "All changes saved! Any scans on this QR code will now reflect your updates immediately.",
        });
      } else {
        const row = await saveQrCode({
          name: `${def.label} QR`,
          typeId,
          values,
          encodedValue: directValue,
          style,
          isDynamic: dynamic,
          shortCode: activeShortCode,
        });
        if (row.is_dynamic) {
          setSavedCode(row.short_code);
          toast.success("Saved as a dynamic QR code", {
            description: "Live destination is active! You can edit where this QR points anytime from your dashboard.",
          });
        } else {
          toast.success("Saved to your dashboard");
        }
      }
    } catch (err) {
      toast.error("Could not save", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {editingId ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Studio Editing: <span className="text-emerald-600 dark:text-emerald-400">{editingName || `${def.label} QR`}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Updating design, logo, shapes or URL. Changes apply live to all scans!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
              Save Live Updates
            </Button>
            <Button asChild size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      ) : null}
      {!user ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Lock className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Sign in required to generate &amp; download QR codes
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a free account or log in to unlock QR generation, live previews, custom styles, logo embedding, and high-resolution downloads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" className="bg-brand-gradient text-primary-foreground font-bold h-9 rounded-xl px-4 shadow-sm hover:opacity-95">
              <Link to="/auth">
                <LogIn className="mr-1.5 size-4" /> Log In / Sign Up
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <StepHeader step={1} title="Add content" hint={def.description} />
            <div className="mt-5">
              <TypeSelector
                value={typeId}
                onChange={(id) => {
                  setTypeId(id);
                  setSavedCode(null);
                }}
              />
            </div>
            <div className="mt-6">
              <ContentForm typeId={typeId} values={values} onChange={patchValues} />
            </div>
            {def.isUpload && !user ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 text-primary" />
                <span>
                  File hosting needs an account —{" "}
                  <Link to="/auth" className="font-semibold text-primary hover:underline">
                    log in for free
                  </Link>{" "}
                  to upload and host files.
                </span>
              </p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <StepHeader step={2} title="Customise" hint="Pick a template, colours, frame and logo." />
            <div className="mt-5">
              <CustomizePanel
                style={style}
                mode={mode}
                onModeChange={handleModeChange}
                onChange={(patch) => setStyle((prev) => ({ ...prev, ...patch }))}
                onReset={() => {
                  setStyle(DEFAULT_STYLE);
                  setMode("classic");
                }}
                previewValue={directValue || "https://bt-qr.app"}
              />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-lg backdrop-blur-sm sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <StepHeader step={3} title="Generate &amp; download" />
              {!user ? (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Lock className="size-3" /> Login Required
                </span>
              ) : !error ? (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isDynamicActive ? "Live Dynamic Ready" : "Static Ready"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500" /> Incomplete
                </span>
              )}
            </div>

            {/* QR Code Showcase Stage */}
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-secondary/50 via-secondary/20 to-secondary/40 p-4 sm:p-5 shadow-inner">
              <div className="flex items-center justify-between mb-3 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" /> {style.frame !== "none" ? `${style.frame} frame` : "Standard frame"}
                </span>
                <span className="rounded bg-background/80 px-2 py-0.5 border border-border/60 font-semibold uppercase text-foreground">
                  {format} • {size}px
                </span>
              </div>

              <div
                className={cn(
                  "relative flex justify-center items-center rounded-2xl p-4 transition-all duration-300 overflow-hidden",
                  style.bgTransparent
                    ? "bg-[linear-gradient(45deg,#0000000a_25%,transparent_25%),linear-gradient(-45deg,#0000000a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0000000a_75%),linear-gradient(-45deg,transparent_75%,#0000000a_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] border border-dashed border-border/60"
                    : "bg-card shadow-md border border-border/40",
                )}
              >
                <div className={cn("transition-all duration-300", !user && "filter blur-md opacity-30 select-none pointer-events-none")}>
                  <QRPreview value={encodedValue || "https://bt-qr.app"} style={style} size={230} />
                </div>

                {!user && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs p-4 text-center z-10">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-md mb-2.5">
                      <Lock className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground">QR Generation Locked</p>
                    <p className="text-[11px] text-muted-foreground max-w-[210px] mt-1 mb-3">
                      Sign in to generate, customize and download your QR code
                    </p>
                    <Button asChild size="sm" className="bg-brand-gradient text-primary-foreground text-xs font-bold rounded-xl h-8 px-3.5 shadow-xs">
                      <Link to="/auth">
                        <LogIn className="mr-1.5 size-3.5" /> Log in to Unlock
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Content / Error Status Pill */}
              {!user ? (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Lock className="size-3.5 text-primary" /> Login to activate QR destination
                  </span>
                  <Link to="/auth" className="text-[11px] font-bold text-primary hover:underline">
                    Sign in &rarr;
                  </Link>
                </div>
              ) : error ? (
                <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : isDynamicActive ? (
                <div className="mt-3 space-y-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Dynamic Live Link (Editable Anytime)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(encodedValue);
                        toast.success("Live short link copied to clipboard");
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="size-3" /> Copy
                    </button>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground pt-0.5">
                    <span className="truncate max-w-[170px]" title={encodedValue}>
                      {encodedValue}
                    </span>
                    <span className="text-[10px] text-muted-foreground/80 truncate max-w-[130px]" title={directValue}>
                      → {directValue}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-border/70 bg-card/80 px-3 py-1.5 text-xs shadow-xs">
                  <span className="truncate text-muted-foreground font-mono max-w-[210px]" title={encodedValue}>
                    {encodedValue}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(encodedValue);
                      toast.success("Destination copied to clipboard");
                    }}
                    className="ml-2 text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Copy className="size-3" /> Copy
                  </button>
                </div>
              )}
            </div>

            {/* Format & Size Selection */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Export Format
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "PNG", val: "png", hint: "Raster" },
                    { label: "SVG", val: "svg", hint: "Vector" },
                    { label: "JPG", val: "jpg", hint: "Photo" },
                    { label: "PDF", val: "pdf", hint: "Print" },
                  ].map((fmt) => (
                    <button
                      key={fmt.val}
                      type="button"
                      onClick={() => setFormat(fmt.val as ExportFormat)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-center transition-all cursor-pointer",
                        format === fmt.val
                          ? "border-primary bg-primary/10 font-bold text-foreground ring-1 ring-primary/30 shadow-xs"
                          : "border-border bg-card/60 hover:bg-secondary/40 text-muted-foreground",
                      )}
                    >
                      <span className="text-xs font-semibold">{fmt.label}</span>
                      <span className="text-[9px] opacity-70">{fmt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resolution Size
                  </Label>
                  <span className="text-[11px] text-muted-foreground">{size} x {size} px</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { px: 500, label: "500px", hint: "Web" },
                    { px: 1000, label: "1000px", hint: "HD" },
                    { px: 2000, label: "2000px", hint: "Print" },
                    { px: 3000, label: "3000px", hint: "4K" },
                  ].map((s) => (
                    <button
                      key={s.px}
                      type="button"
                      onClick={() => setSize(s.px)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border py-1.5 px-1 text-center transition-all cursor-pointer",
                        size === s.px
                          ? "border-primary bg-primary/10 font-bold text-foreground ring-1 ring-primary/30 shadow-xs"
                          : "border-border bg-card/60 hover:bg-secondary/40 text-muted-foreground",
                      )}
                    >
                      <span className="text-xs font-medium">{s.label}</span>
                      <span className="text-[9px] opacity-70">{s.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2 pt-1">
              {!user ? (
                <Button
                  asChild
                  className="w-full bg-brand-gradient text-primary-foreground font-bold shadow-md hover:opacity-95 hover:shadow-lg transition-all h-12 rounded-xl text-sm"
                  size="lg"
                >
                  <Link to="/auth">
                    <Lock className="mr-2 size-4.5" /> Log in to Generate &amp; Download
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full bg-brand-gradient text-primary-foreground font-bold shadow-md hover:opacity-95 hover:shadow-lg transition-all h-12 rounded-xl text-sm"
                  size="lg"
                  disabled={Boolean(error) || downloading}
                  onClick={() => void handleDownload()}
                >
                  {downloading ? (
                    <Loader2 className="mr-2 size-4.5 animate-spin" />
                  ) : (
                    <Download className="mr-2 size-4.5" />
                  )}
                  Download {format.toUpperCase()} ({size}px)
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {!user ? (
                  <>
                    <Button asChild variant="outline" className="h-10 text-xs rounded-xl">
                      <Link to="/auth">
                        <Lock className="mr-1.5 size-3.5 text-primary" /> Snapshot Card
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-10 text-xs rounded-xl">
                      <Link to="/auth">
                        <Lock className="mr-1.5 size-3.5 text-primary" /> Copy Image
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 text-xs rounded-xl"
                      disabled={Boolean(error) || snapping}
                      onClick={() => void handleSnapshot(false)}
                    >
                      {snapping ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      ) : (
                        <Camera className="mr-1.5 size-3.5 text-primary" />
                      )}
                      Snapshot Card
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 text-xs rounded-xl"
                      disabled={Boolean(error) || snapping}
                      onClick={() => void handleSnapshot(true)}
                    >
                      <Copy className="mr-1.5 size-3.5 text-primary" /> Copy Image
                    </Button>
                  </>
                )}
              </div>
              <p className="text-center text-[11px] text-muted-foreground pt-1">
                {!user
                  ? "Sign in to download watermark-free commercial QR codes and printable assets."
                  : "Watermark-free commercial export. All generated codes are scannable worldwide."}
              </p>
            </div>

            {/* 3D Character Standee Poster Card */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm transition-all hover:border-primary/50">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xs font-bold text-foreground">3D Character Standee</span>
                    <Badge className="border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] py-0 px-1.5 font-bold">
                      <Crown className="mr-1 size-2.5" /> PAID PLAN
                    </Badge>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Put this QR in the hands of 3D Aarav, Mira, or your custom store mascot for printable store signs &amp; table tents.
                </p>
              </div>
              {!user ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full h-10 rounded-xl border-primary/40 bg-card font-bold text-xs text-primary shadow-sm hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                >
                  <Link to="/auth">
                    <Lock className="mr-1.5 size-3.5" /> Log in for 3D Character Standee
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full h-10 rounded-xl border-primary/40 bg-card font-bold text-xs text-primary shadow-sm hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                  disabled={Boolean(error)}
                  onClick={() => setOpenStandeeModal(true)}
                >
                  <Sparkles className="mr-1.5 size-3.5" />
                  Generate 3D Character Standee
                </Button>
              )}
            </div>

          {/* Dynamic Tracking & Dashboard Card */}
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-foreground">Dynamic Short Link</p>
                  <Badge className="border-0 bg-primary/15 text-primary text-[10px] py-0 px-1.5">
                    {dynamic ? "TRACKABLE" : "DIRECT"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {dynamic
                    ? "Edit destination anytime after printing & track scan counts."
                    : "Encodes direct URL permanently into the barcode."}
                </p>
              </div>
              <Switch checked={dynamic} onCheckedChange={setDynamic} />
            </div>

            {user ? (
              <Button
                variant="outline"
                className="w-full text-xs h-9 rounded-xl border-primary/30 hover:bg-primary/5"
                disabled={Boolean(error) || saving}
                onClick={() => void handleSave()}
              >
                {saving ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 size-3.5 text-primary" />
                )}
                Save to Dashboard
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full text-xs h-9 rounded-xl border-primary/30 hover:bg-primary/5">
                <Link to="/auth">
                  <Sparkles className="mr-1.5 size-3.5 text-primary" /> Log in to Save &amp; Track Scans
                </Link>
              </Button>
            )}

            {savedCode ? (
              <div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <Check className="size-3" /> Saved Online
                  </span>
                  <a
                    href={`/s/${savedCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    View Page <ExternalLink className="size-2.5" />
                  </a>
                </div>
                <p className="flex items-center gap-1.5 break-all font-mono text-[11px] text-foreground">
                  <Link2 className="size-3 shrink-0 text-primary" /> {shortUrl(savedCode)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>

      {/* 3D Character Standee Full Studio Modal */}
      <Dialog open={openStandeeModal} onOpenChange={setOpenStandeeModal}>
        <DialogContent className="max-w-4xl w-[calc(100%-1rem)] sm:w-full max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 border-primary/30 bg-card/95 p-3 sm:p-6 shadow-2xl backdrop-blur-2xl">
          <DialogHeader className="mb-1 sm:mb-2 text-left">
            <DialogTitle className="font-display text-lg sm:text-xl font-bold flex items-center gap-2">
              <Sparkles className="size-4 sm:size-5 text-primary shrink-0" />
              3D Character &amp; Mascot Standee Studio
            </DialogTitle>
          </DialogHeader>
          <AvatarStage
            className="border-0 shadow-none p-0 sm:p-1 bg-transparent"
            value={encodedValue}
            style={style}
            initialTitle={def.label ? `SCAN FOR ${def.label.toUpperCase()}` : "SCAN TO PAY"}
            initialSubtitle="Hold camera over code to scan instantly"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
