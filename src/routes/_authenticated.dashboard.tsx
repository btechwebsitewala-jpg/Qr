import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Pencil,
  QrCode,
  Sparkles,
  Trash2,
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

  const save = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const isDynamic = editing.is_dynamic;
      const targetUrl = target.trim();
      await updateQrCode(editing.id, {
        name: name.slice(0, 120),
        is_dynamic: isDynamic,
        ...(isDynamic ? { target_url: targetUrl } : {}),
      });
    },
    onSuccess: async () => {
      toast.success("QR code updated successfully!", {
        description: editing?.is_dynamic
          ? "Live destination updated! All existing and printed QR codes will now open this new URL."
          : "Saved changes to dashboard.",
      });
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const totalScans = codes.reduce((sum, row) => sum + (row.scan_count ?? 0), 0);

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
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard/analytics/$id" params={{ id: row.id }}>
                        <BarChart3 className="mr-1 size-4" /> Analytics
                      </Link>
                    </Button>
                  ) : null}
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

          <div className="mt-2 space-y-4">
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

            {editing?.is_dynamic ? (
              <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="qr-target" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-emerald-500" />
                      Live Destination URL (Change Anytime)
                    </Label>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
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
                    <strong>Live instant change:</strong> The printed barcode does NOT change. Anyone scanning your QR code will be redirected to this new URL immediately.
                  </p>
                </div>

                {editing.short_code && (
                  <div className="flex items-center justify-between border-t border-emerald-500/20 pt-2.5 text-xs">
                    <span className="text-muted-foreground font-mono truncate max-w-[240px]">
                      Short link: /r/{editing.short_code}
                    </span>
                    <a
                      href={`/r/${editing.short_code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Test Live Redirect <ExternalLink className="size-3" />
                    </a>
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
    </main>
  );
}
