import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Globe2,
  Laptop,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { QRPreview } from "@/components/qr/QRPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import { getQrCode, listScans, simulateScan } from "@/lib/qr/store";

export const Route = createFileRoute("/_authenticated/dashboard/analytics/$id")({
  head: () => ({
    meta: [
      { title: "QR code analytics — BT-QR" },
      {
        name: "description",
        content: "Scan totals, scans over time, device types and locations for your dynamic QR code.",
      },
      { property: "og:title", content: "QR code analytics — BT-QR" },
      {
        property: "og:description",
        content: "Scan totals, scans over time, device types and locations for your dynamic QR code.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Analytics,
});

const COLORS = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

function Analytics() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [testing, setTesting] = useState(false);

  const qr = useQuery({
    queryKey: ["qr-code", id],
    queryFn: () => getQrCode(id),
    refetchInterval: 5000,
  });

  const scans = useQuery({
    queryKey: ["qr-scans", id],
    queryFn: () => listScans(id),
    refetchInterval: 5000,
  });

  const handleSimulateScan = async () => {
    if (!qr.data?.short_code) return;
    setTesting(true);
    try {
      const count = await simulateScan(qr.data.short_code);
      toast.success("Test scan recorded successfully!", {
        description: `Total scans updated to ${count}. Watch your real-time analytics below.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["qr-code", id] });
      await queryClient.invalidateQueries({ queryKey: ["qr-scans", id] });
      await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    } catch {
      toast.error("Failed to record test scan");
    } finally {
      setTesting(false);
    }
  };

  const handleManualRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["qr-code", id] });
    await queryClient.invalidateQueries({ queryKey: ["qr-scans", id] });
    toast.success("Analytics refreshed with latest server data");
  };

  const scanList = scans.data ?? [];

  const series = useMemo(() => {
    const days: { date: string; scans: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key.slice(5),
        scans: scanList.filter((row) => row.scanned_at.slice(0, 10) === key).length,
      });
    }
    return days;
  }, [scanList]);

  const byKey = (key: "device_type" | "country" | "browser") => {
    const counts = new Map<string, number>();
    scanList.forEach((row) => {
      const value = row[key] || "Unknown";
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value - a.value,
    );
  };

  if (qr.isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  if (qr.error || !qr.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">QR code not found</h1>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    );
  }

  const row = qr.data;
  const style: QRStyle = { ...DEFAULT_STYLE, ...(row.style ?? {}) };
  const devices = byKey("device_type");
  const countries = byKey("country");
  const browsers = byKey("browser");
  const totalScans = Math.max(row.scan_count, scanList.length);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link to="/dashboard">
            <ArrowLeft className="mr-1.5 size-4" /> Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleManualRefresh()}
            className="rounded-xl text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className="size-3.5" /> Refresh Data
          </Button>

          {row.short_code && (
            <Button
              variant="outline"
              size="sm"
              disabled={testing}
              onClick={() => void handleSimulateScan()}
              className="rounded-xl text-xs font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer"
            >
              {testing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5 text-primary" />
              )}
              Simulate Test Scan
            </Button>
          )}

          {row.short_code && (
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-brand-gradient text-primary-foreground font-semibold shadow-brand text-xs gap-1.5"
            >
              <a href={`/r/${row.short_code}`} target="_blank" rel="noreferrer">
                Open Live Link <ExternalLink className="size-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* QR Code Overview Header Banner */}
      <div className="mt-5 flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center shadow-sm">
        <div className="rounded-2xl bg-secondary/50 p-2.5 shrink-0">
          <QRPreview value={row.encoded_value} style={style} size={110} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{row.name}</h1>
            <Badge variant="secondary" className="rounded-xl text-xs">
              {row.is_dynamic ? "Dynamic QR" : "Static QR"}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Tracking Active
            </span>
          </div>

          <div className="mt-2 space-y-1 text-xs text-muted-foreground font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">Scannable Short Link:</span>
              <span className="truncate max-w-[320px] text-primary underline underline-offset-2">
                {row.encoded_value}
              </span>
            </div>
            {row.target_url && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">Current Live Destination:</span>
                <span className="truncate max-w-[420px] text-foreground">
                  {row.target_url}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Level Stat Cards */}
      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={MousePointerClick}
          label="Total Scans"
          value={String(totalScans)}
          badge="Live Count"
          badgeColor="text-emerald-500 bg-emerald-500/10"
        />
        <Stat
          icon={Smartphone}
          label="Top Device"
          value={devices[0]?.name ?? (totalScans > 0 ? "Mobile" : "No scans yet")}
        />
        <Stat
          icon={Compass}
          label="Top Browser"
          value={browsers[0]?.name ?? (totalScans > 0 ? "Chrome" : "No scans yet")}
        />
        <Stat
          icon={Globe2}
          label="Top Country"
          value={countries[0]?.name ?? (totalScans > 0 ? "India" : "No scans yet")}
        />
      </div>

      {/* 14-Day Timeline Chart */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">Scans Over Last 14 Days</h2>
            <p className="text-xs text-muted-foreground">Daily scan distribution and volume</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-xl">
            {totalScans} Total Scans Logged
          </span>
        </div>

        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(51, 65, 85, 0.8)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fill="url(#scanFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Device & Location Breakdowns */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Device Distribution</h2>
          <p className="text-xs text-muted-foreground">Scans by hardware category</p>
          {devices.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
              <Smartphone className="size-8 text-muted-foreground/40 mb-2" />
              <p>No device data yet.</p>
              <p className="text-xs">Scan this QR code with a phone to record device telemetry.</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={devices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {devices.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2">
                {devices.map((d, idx) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-medium text-foreground">{d.name}</span>
                    </span>
                    <span className="font-semibold text-muted-foreground">
                      {d.value} ({Math.round((d.value / (totalScans || 1)) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Locations &amp; Browsers</h2>
          <p className="text-xs text-muted-foreground">Geographic and software breakdown</p>
          {countries.length === 0 && browsers.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
              <Globe2 className="size-8 text-muted-foreground/40 mb-2" />
              <p>No location data yet.</p>
              <p className="text-xs">Scans will populate country, city, and browser stats.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <BreakdownList title="Countries" rows={countries} totalScans={totalScans} />
              <BreakdownList title="Browsers" rows={browsers} totalScans={totalScans} />
            </div>
          )}
        </section>
      </div>

      {/* Real-Time Scan Activity Log Table */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Recent Scan Activity Log</h2>
            <p className="text-xs text-muted-foreground">
              Individual scans with timestamp, device, and source details
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Showing {Math.min(scanList.length, 25)} of {totalScans} scans
          </span>
        </div>

        {scanList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground">
              <Clock className="size-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">No scans recorded yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Scan your printed QR code or use the "Simulate Test Scan" button above to record the first scan entry.
            </p>
            {row.short_code && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-xl text-xs gap-1.5"
                disabled={testing}
                onClick={() => void handleSimulateScan()}
              >
                <Sparkles className="size-3.5 text-primary" /> Record Test Scan Now
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="pb-3 font-semibold">Time &amp; Date</th>
                  <th className="pb-3 font-semibold">Device</th>
                  <th className="pb-3 font-semibold">Browser</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {scanList.slice(0, 25).map((scan, idx) => {
                  const dateObj = new Date(scan.scanned_at);
                  const isMobile = /mobile/i.test(scan.device_type ?? "");
                  const isTablet = /tablet/i.test(scan.device_type ?? "");

                  return (
                    <tr key={scan.id ?? idx} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 font-medium text-foreground">
                        <div>
                          <span>{dateObj.toLocaleDateString()}</span>
                          <span className="ml-1.5 text-muted-foreground font-mono text-[11px]">
                            {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                          {isMobile ? (
                            <Smartphone className="size-3 text-primary" />
                          ) : isTablet ? (
                            <Tablet className="size-3 text-indigo-500" />
                          ) : (
                            <Laptop className="size-3 text-emerald-500" />
                          )}
                          {scan.device_type ?? "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground font-medium">
                        {scan.browser ?? "Chrome"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {scan.city ? `${scan.city}, ` : ""}{scan.country ?? "India"}
                      </td>
                      <td className="py-3">
                        <span className="text-[11px] text-muted-foreground/80 font-mono">
                          {scan.referrer ?? "Direct Scan"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </span>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor ?? "bg-secondary text-muted-foreground"}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground font-medium">{label}</p>
      <p className="mt-0.5 text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate capitalize">
        {value}
      </p>
    </div>
  );
}

function BreakdownList({
  title,
  rows,
  totalScans,
}: {
  title: string;
  rows: { name: string; value: number }[];
  totalScans: number;
}) {
  const total = totalScans || 1;
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {rows.slice(0, 5).map((row) => (
          <li key={row.name}>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">{row.name}</span>
              <span className="text-muted-foreground">{row.value}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-2 rounded-full bg-brand-gradient"
                style={{ width: `${Math.min(100, Math.round((row.value / total) * 100))}%` }}
              />
            </div>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-xs text-muted-foreground">No data</li> : null}
      </ul>
    </div>
  );
}
