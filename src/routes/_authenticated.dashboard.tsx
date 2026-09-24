import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Info,
  Loader2,
  MousePointerClick,
  Palette,
  Pencil,
  QrCode,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { QRPreview } from "@/components/qr/QRPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getQRType, type QRTypeId } from "@/lib/qr/config";
import { downloadQR } from "@/lib/qr/download";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import {
  deleteQrCode,
  listQrCodes,
  makeShortCode,
  shortUrl,
  updateQrCode,
  type QrCodeRow,
} from "@/lib/qr/store";

const TITLE = "Your QR codes — BT-QR Dashboard";
const DESCRIPTION =
  "Manage saved QR codes: edit destinations, download again, review scan counts and open analytics.";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const styleOf = (row: QrCodeRow): QRStyle => ({ ...DEFAULT_STYLE, ...(row.style ?? {}) });

function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<QrCodeRow | null>(null);
  const [staticInfoModal, setStaticInfoModal] = useState<QrCodeRow | null>(null);
  const [showAllScansModal, setShowAllScansModal] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const userName =
    (typeof metadata?.["full_name"] === "string" && metadata["full_name"]) ||
    (typeof metadata?.["name"] === "string" && metadata["name"]) ||
    user?.email?.split("@")[0] ||
    "User";
  const userEmail = user?.email;
  const appMeta = user?.app_metadata as Record<string, unknown> | undefined;
  const isGoogle = appMeta?.["provider"] === "google";

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["qr-codes", user?.id],
    queryFn: listQrCodes,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const remove = useMutation({
    mutationFn: deleteQrCode,
    onSuccess: async () => {
      toast.success("QR code deleted");
      await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const convertToDynamic = useMutation({
    mutationFn: async (row: QrCodeRow) => {
      const code = row.short_code || makeShortCode(7);
      const targetUrl = row.target_url || row.encoded_value;
      await updateQrCode(row.id, {
        is_dynamic: true,
        short_code: code,
        target_url: targetUrl,
        encoded_value: shortUrl(code),
      });
      return { id: row.id, shortCode: code };
    },
    onSuccess: async () => {
      toast.success("Upgraded to Dynamic QR Code!", {
        description: "Real-time scan tracking and live destination editing are now active.",
      });
      setStaticInfoModal(null);
      await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const isDynamic = editing.is_dynamic;
      let targetUrl = target.trim();
      if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }
      await updateQrCode(editing.id, {
        name: name.slice(0, 120),
        is_dynamic: isDynamic,
        short_code: editing.short_code,
        target_url: targetUrl || editing.target_url || editing.encoded_value,
        encoded_value: isDynamic && editing.short_code ? shortUrl(editing.short_code) : editing.encoded_value,
      });
    },
    onSuccess: async () => {
      toast.success("Live changes saved successfully!", {
        description: editing?.is_dynamic
          ? "Live destination updated! All existing and printed QR codes will now open this new URL immediately."
          : "Saved changes to dashboard.",
      });
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const totalScans = codes.reduce((sum, row) => sum + (row.scan_count ?? 0), 0);
  const dynamicCodes = codes.filter((row) => row.is_dynamic);
  const staticCodes = codes.filter((row) => !row.is_dynamic);
  const sortedByScans = [...codes].sort((a, b) => (b.scan_count ?? 0) - (a.scan_count ?? 0));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight">Your QR Workspace</h1>
            {isGoogle ? (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
              >
                <svg className="size-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google Account
              </Badge>
            ) : (
              <Badge variant="secondary" className="rounded-xl px-2.5 py-0.5 text-xs">
                Personal Panel
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Account: <span className="font-semibold text-foreground">{userEmail || userName}</span> · {codes.length} saved · {totalScans} total scans
          </p>
        </div>
        <Button asChild className="rounded-2xl bg-brand-gradient text-primary-foreground shadow-brand hover:opacity-95">
          <Link to="/">
            <QrCode className="mr-2 size-4" /> Create new QR
          </Link>
        </Button>
      </div>

      {/* High-Level Stat Cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div
          onClick={() => setShowAllScansModal(true)}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-4.5" />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Live Scans
            </span>
          </div>
          <p className="mt-2.5 text-xs font-medium text-muted-foreground">Total Scans</p>
          <div className="mt-0.5 flex items-baseline justify-between">
            <p className="text-2xl font-bold tracking-tight text-foreground">{totalScans}</p>
            <span className="text-[11px] font-medium text-primary underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity">
              View all
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-foreground">
              <QrCode className="size-4.5" />
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Total
            </span>
          </div>
          <p className="mt-2.5 text-xs font-medium text-muted-foreground">Total QR Codes</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{codes.length}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-4.5" />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Tracked
            </span>
          </div>
          <p className="mt-2.5 text-xs font-medium text-muted-foreground">Dynamic Tracked</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{dynamicCodes.length}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <QrCode className="size-4.5" />
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Static
            </span>
          </div>
          <p className="mt-2.5 text-xs font-medium text-muted-foreground">Static Standard</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{staticCodes.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : codes.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <QrCode className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">No saved QR codes yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a QR code and hit “Save to dashboard” to track its scans.
          </p>
          <Button asChild className="mt-6 bg-brand-gradient text-primary-foreground">
            <Link to="/">Create your first QR code</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {codes.map((row) => {
            const def = getQRType(row.qr_type as QRTypeId);
            return (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="shrink-0 rounded-2xl bg-secondary/50 p-2">
                  <QRPreview value={row.encoded_value} style={styleOf(row)} size={96} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold">{row.name}</h2>
                    <Badge variant="secondary">{def.label}</Badge>
                    <Badge
                      className={
                        row.is_dynamic
                          ? "border-0 bg-brand-gradient text-primary-foreground"
                          : "border-0 bg-secondary text-secondary-foreground"
                      }
                    >
                      {row.is_dynamic ? "Dynamic" : "Static"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {row.target_url ?? row.encoded_value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.scan_count} scans · created{" "}
                    {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.is_dynamic ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="font-semibold gap-1.5 border-primary/30 text-foreground hover:bg-primary/5 hover:border-primary/60 cursor-pointer"
                    >
                      <Link to="/dashboard/analytics/$id" params={{ id: row.id }}>
                        <BarChart3 className="size-3.5 text-primary" /> Analytics
                        <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                          {row.scan_count ?? 0}
                        </span>
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-medium gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => setStaticInfoModal(row)}
                    >
                      <BarChart3 className="size-3.5 text-muted-foreground" /> Analytics
                      <span className="ml-0.5 rounded-full bg-secondary px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                        Static
                      </span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(row);
                      setName(row.name);
                      setTarget(row.target_url ?? "");
                    }}
                  >
                    <Pencil className="mr-1 size-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void downloadQR({
                        value: row.encoded_value,
                        style: styleOf(row),
                        format: "png",
                        size: 1000,
                        filename: row.name.replace(/\s+/g, "-").toLowerCase(),
                      })
                    }
                  >
                    <Download className="mr-1 size-4" /> PNG
                  </Button>
                  {row.is_dynamic ? (
                    <Button asChild variant="ghost" size="icon" aria-label="Open link">
                      <a href={row.encoded_value} target="_blank" rel="noreferrer noopener">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete QR code"
                    onClick={() => remove.mutate(row.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg rounded-3xl border-border bg-card p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Pencil className="size-5 text-primary" /> Edit QR Code &amp; Live Destination
            </DialogTitle>
          </DialogHeader>

          {editing ? (
            <div className="mt-2 space-y-4">
              {/* Live QR Preview & Metadata Card */}
              <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-secondary/30 p-3.5 shadow-inner">
                <div className="shrink-0 rounded-xl bg-card p-2 shadow-sm border border-border/80">
                  <QRPreview
                    value={
                      editing.is_dynamic && editing.short_code
                        ? shortUrl(editing.short_code)
                        : (target.trim() || editing.encoded_value)
                    }
                    style={styleOf(editing)}
                    size={92}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {getQRType(editing.qr_type as QRTypeId).label}
                    </Badge>
                    <Badge
                      className={
                        editing.is_dynamic
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "border-0 bg-secondary text-secondary-foreground"
                      }
                    >
                      {editing.is_dynamic ? "Live Dynamic" : "Static Code"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground truncate">
                    {editing.is_dynamic && editing.short_code
                      ? `Short link: /r/${editing.short_code}`
                      : editing.encoded_value}
                  </p>
                  <div className="mt-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Link to="/" search={{ edit: editing.id, type: editing.qr_type }}>
                        <Palette className="size-3" /> Full Studio Designer &amp; Colors
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="qr-name" className="text-xs font-semibold text-foreground">
                  QR Code Name
                </Label>
                <Input
                  id="qr-name"
                  className="mt-1.5 rounded-xl border-border bg-background/50"
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              {editing.is_dynamic ? (
                <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="qr-target" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-emerald-500" />
                        Live Destination URL (Change Anytime)
                      </Label>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        LIVE DYNAMIC
                      </span>
                    </div>
                    <Input
                      id="qr-target"
                      className="mt-1.5 rounded-xl border-emerald-500/40 bg-background font-mono text-sm"
                      maxLength={2000}
                      placeholder="https://your-new-website.com"
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                    />
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    <p>
                      <strong>Live instant change:</strong> The printed barcode does NOT change. Anyone scanning this QR code will immediately open this new destination URL.
                    </p>
                  </div>

                  {editing.short_code && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-emerald-500/20 pt-2.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground font-mono truncate max-w-[190px]">
                          /r/{editing.short_code}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            void navigator.clipboard.writeText(shortUrl(editing.short_code));
                            toast.success("Short redirect URL copied to clipboard!");
                          }}
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                        onClick={async () => {
                          try {
                            let clean = target.trim();
                            if (clean && !/^https?:\/\//i.test(clean)) clean = `https://${clean}`;
                            await updateQrCode(editing.id, {
                              name: name.slice(0, 120),
                              is_dynamic: true,
                              short_code: editing.short_code,
                              target_url: clean || editing.target_url || editing.encoded_value,
                              encoded_value: shortUrl(editing.short_code),
                            });
                            await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
                            toast.success("Destination updated live! Opening redirect test...");
                            window.open(`/r/${editing.short_code}`, "_blank");
                          } catch (err) {
                            toast.error("Could not test redirect: " + String(err));
                          }
                        }}
                      >
                        <ExternalLink className="mr-1.5 size-3.5" /> Save &amp; Test Live Redirect
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Convert to Dynamic Live QR
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-xl text-xs font-semibold text-primary border-primary/40 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      onClick={() => {
                        if (editing) {
                          setEditing({
                            ...editing,
                            is_dynamic: true,
                            target_url: target || editing.encoded_value,
                          });
                          if (!target) setTarget(editing.encoded_value);
                        }
                      }}
                    >
                      <Sparkles className="mr-1.5 size-3.5" /> Enable Live URL Change
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This code currently encodes static content directly. Enable dynamic mode so you can update its destination URL live anytime from this dashboard!
                  </p>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-brand-gradient text-primary-foreground font-semibold shadow-brand hover:opacity-95 cursor-pointer"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Static QR Analytics / Upgrade Information Dialog */}
      <Dialog open={Boolean(staticInfoModal)} onOpenChange={(open) => !open && setStaticInfoModal(null)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <BarChart3 className="size-5 text-primary" /> Static QR Analytics
            </DialogTitle>
          </DialogHeader>

          {staticInfoModal && (
            <div className="mt-3 space-y-4">
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-secondary/30 p-3">
                <div className="shrink-0 rounded-xl bg-card p-1.5 border border-border/80">
                  <QRPreview value={staticInfoModal.encoded_value} style={styleOf(staticInfoModal)} size={72} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm truncate">{staticInfoModal.name}</h4>
                  <Badge variant="secondary" className="mt-1 text-[11px]">Static Standard</Badge>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">
                    {staticInfoModal.target_url || staticInfoModal.encoded_value}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <Info className="size-4 shrink-0" /> Why are scans 0 for Static QRs?
                </div>
                <p>
                  Static QR codes encode information directly into the visual pixel pattern. When someone scans it, their camera opens the link directly without routing through a redirect analytics server.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-4 shrink-0 text-emerald-500" /> Unlock Real-Time Analytics with Dynamic QR
                </div>
                <ul className="space-y-1 pl-4 list-disc text-foreground/80">
                  <li>Track total scans with live instant counts</li>
                  <li>View device types (Mobile, Tablet, Desktop) and browsers</li>
                  <li>View geographic scan distribution (Country &amp; City)</li>
                  <li>Update destination URL anytime without re-printing</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => setStaticInfoModal(null)}
            >
              Close
            </Button>
            {staticInfoModal && (
              <Button
                className="rounded-xl bg-brand-gradient text-primary-foreground font-semibold shadow-brand hover:opacity-95 cursor-pointer gap-1.5"
                disabled={convertToDynamic.isPending}
                onClick={() => convertToDynamic.mutate(staticInfoModal)}
              >
                {convertToDynamic.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Upgrade to Dynamic &amp; Start Tracking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Scans Breakdown Modal */}
      <Dialog open={showAllScansModal} onOpenChange={setShowAllScansModal}>
        <DialogContent className="max-w-2xl rounded-3xl border-border bg-card p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-xl font-bold">
              <span className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" /> Total Scans Breakdown
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {totalScans} Total Scans
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {sortedByScans.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No QR codes created yet.</p>
            ) : (
              sortedByScans.map((row) => {
                const count = row.scan_count ?? 0;
                const percentage = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;
                return (
                  <div
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-secondary/20 p-3.5 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0 rounded-xl bg-card p-1.5 border border-border/70">
                        <QRPreview value={row.encoded_value} style={styleOf(row)} size={48} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">{row.name}</h4>
                          <Badge
                            className={
                              row.is_dynamic
                                ? "border-0 bg-brand-gradient text-[10px] text-primary-foreground py-0"
                                : "border-0 bg-secondary text-[10px] text-secondary-foreground py-0"
                            }
                          >
                            {row.is_dynamic ? "Dynamic" : "Static"}
                          </Badge>
                        </div>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground truncate">
                          {row.is_dynamic && row.short_code ? `/r/${row.short_code}` : (row.target_url || row.encoded_value)}
                        </p>
                        {totalScans > 0 && row.is_dynamic && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden max-w-[140px]">
                              <div
                                className="h-1.5 rounded-full bg-brand-gradient"
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{percentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <div className="text-right">
                        <span className="text-base font-bold text-foreground">{count}</span>
                        <span className="text-xs text-muted-foreground ml-1">scans</span>
                      </div>
                      {row.is_dynamic ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-xl text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                          onClick={() => setShowAllScansModal(false)}
                        >
                          <Link to="/dashboard/analytics/$id" params={{ id: row.id }}>
                            <BarChart3 className="size-3" /> Full Analytics
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => {
                            setShowAllScansModal(false);
                            setStaticInfoModal(row);
                          }}
                        >
                          <Sparkles className="size-3 text-amber-500" /> Enable Tracking
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="rounded-xl w-full sm:w-auto cursor-pointer"
              onClick={() => setShowAllScansModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
