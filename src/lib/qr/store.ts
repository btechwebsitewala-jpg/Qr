import { supabase } from "@/integrations/supabase/client";
import type { QRTypeId } from "./config";
import { DEFAULT_STYLE, type QRStyle } from "./render";

export interface QrCodeRow {
  id: string;
  user_id: string;
  name: string;
  qr_type: string;
  content: Record<string, string>;
  encoded_value: string;
  style: QRStyle;
  short_code: string;
  is_dynamic: boolean;
  target_url: string | null;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";

export function makeShortCode(length = 7) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function shortUrl(code: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/r/${code}`;
}

export interface SaveQrInput {
  name: string;
  typeId: QRTypeId;
  values: Record<string, string>;
  encodedValue: string;
  style: QRStyle;
  isDynamic: boolean;
  shortCode?: string;
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("bt_demo_session") === "true";
  } catch {
    return false;
  }
}

export function getActiveUserId(): string {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bt_demo_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.id) return u.id;
        if (u?.email) return `user_${u.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
      }
    }
  } catch {
    // ignore
  }
  return "demo-user-123";
}

function getUserQrStorageKey(userId = getActiveUserId()): string {
  return `bt_user_qr_codes_${userId}`;
}

export function getUserQrCodes(userId = getActiveUserId()): QrCodeRow[] {
  const key = getUserQrStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }

  // If this is the main demo admin, provide sample showcase codes
  if (userId === "demo-user-123") {
    const defaults: QrCodeRow[] = [
      {
        id: "demo-qr-1",
        user_id: userId,
        name: "BTech Websitewala Official (Dynamic)",
        qr_type: "url",
        content: { url: "https://btechwebsitewala.com" },
        encoded_value: shortUrl("btweb"),
        style: DEFAULT_STYLE,
        short_code: "btweb",
        is_dynamic: true,
        target_url: "https://btechwebsitewala.com",
        scan_count: 248,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-qr-2",
        user_id: userId,
        name: "Office Wi-Fi Zone",
        qr_type: "wifi",
        content: { ssid: "BT-HighSpeed-5G", encryption: "WPA", password: "Password@123" },
        encoded_value: "WIFI:T:WPA;S:BT-HighSpeed-5G;P:Password@123;;",
        style: { ...DEFAULT_STYLE, fg: "#059669" },
        short_code: "wifi99",
        is_dynamic: false,
        target_url: null,
        scan_count: 94,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-qr-3",
        user_id: userId,
        name: "Product Portfolio Catalog",
        qr_type: "pdf",
        content: { url: "https://example.com/portfolio.pdf" },
        encoded_value: shortUrl("doc33"),
        style: { ...DEFAULT_STYLE, fg: "#d97706" },
        short_code: "doc33",
        is_dynamic: true,
        target_url: "https://example.com/portfolio.pdf",
        scan_count: 412,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    saveUserQrCodes(defaults, userId);
    return defaults;
  }

  // Any other user begins with a clean workspace
  const initialUserCodes: QrCodeRow[] = [];
  saveUserQrCodes(initialUserCodes, userId);
  return initialUserCodes;
}

export function saveUserQrCodes(codes: QrCodeRow[], userId = getActiveUserId()) {
  try {
    localStorage.setItem(getUserQrStorageKey(userId), JSON.stringify(codes));
  } catch {
    // ignore
  }
}

export async function syncDynamicRouteToServer(record: {
  short_code: string;
  target_url: string;
  name?: string;
  scan_count?: number;
}): Promise<boolean> {
  if (!record.short_code || !record.target_url) return false;
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/dynamic-routes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(record),
      });
      return res.ok;
    }
  } catch (err) {
    console.warn("Failed to sync dynamic route to server:", err);
  }
  return false;
}

export async function saveQrCode(input: SaveQrInput): Promise<QrCodeRow> {
  const shortCode = (input.shortCode && input.shortCode.trim()) || makeShortCode();
  const dynamic = input.isDynamic && /^https?:\/\//i.test(input.encodedValue);
  const activeUserId = getActiveUserId();

  if (dynamic) {
    try {
      await syncDynamicRouteToServer({
        short_code: shortCode,
        target_url: input.encodedValue,
        name: input.name,
        scan_count: 0,
      });
    } catch {
      // ignore
    }
  }

  if (isDemoMode()) {
    const list = getUserQrCodes(activeUserId);
    const newCode: QrCodeRow = {
      id: `qr-${Date.now()}-${makeShortCode(4)}`,
      user_id: activeUserId,
      name: input.name.slice(0, 120) || "Untitled QR",
      qr_type: input.typeId,
      content: input.values,
      encoded_value: dynamic ? shortUrl(shortCode) : input.encodedValue,
      target_url: dynamic ? input.encodedValue : null,
      style: input.style,
      short_code: shortCode,
      is_dynamic: dynamic,
      scan_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveUserQrCodes([newCode, ...list], activeUserId);
    return newCode;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id || activeUserId;

  try {
    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        user_id: userId,
        name: input.name.slice(0, 120) || "Untitled QR",
        qr_type: input.typeId,
        content: input.values,
        encoded_value: dynamic ? shortUrl(shortCode) : input.encodedValue,
        target_url: dynamic ? input.encodedValue : null,
        style: input.style as unknown as never,
        short_code: shortCode,
        is_dynamic: dynamic,
      })
      .select()
      .single();

    if (error) throw error;
    const inserted = data as unknown as QrCodeRow;
    const list = getUserQrCodes(activeUserId);
    saveUserQrCodes([inserted, ...list], activeUserId);
    return inserted;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/fetch|network|failed/i.test(msg) || !sessionData.session) {
      const list = getUserQrCodes(activeUserId);
      const newCode: QrCodeRow = {
        id: `qr-${Date.now()}-${makeShortCode(4)}`,
        user_id: activeUserId,
        name: input.name.slice(0, 120) || "Untitled QR",
        qr_type: input.typeId,
        content: input.values,
        encoded_value: dynamic ? shortUrl(shortCode) : input.encodedValue,
        target_url: dynamic ? input.encodedValue : null,
        style: input.style,
        short_code: shortCode,
        is_dynamic: dynamic,
        scan_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveUserQrCodes([newCode, ...list], activeUserId);
      return newCode;
    }
    throw err;
  }
}

export async function listQrCodes(): Promise<QrCodeRow[]> {
  const activeUserId = getActiveUserId();
  const list = getUserQrCodes(activeUserId);

  // Sync real-time scan counts from server registry
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/dynamic-routes?all_counts=true");
      if (res.ok) {
        const counts = (await res.json()) as Record<string, number>;
        let changed = false;
        const updated: QrCodeRow[] = list.map((qr) => {
          if (qr.short_code && counts[qr.short_code.toLowerCase()] !== undefined) {
            const serverCount = counts[qr.short_code.toLowerCase()];
            if (typeof serverCount === "number" && qr.scan_count !== serverCount) {
              changed = true;
              return { ...qr, scan_count: serverCount };
            }
          }
          return qr;
        });
        if (changed) {
          saveUserQrCodes(updated, activeUserId);
          return updated;
        }
      }
    }
  } catch {
    // fallback to stored
  }

  if (isDemoMode()) {
    return list;
  }

  try {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const codes = (data ?? []) as unknown as QrCodeRow[];
    if (codes.length > 0) {
      saveUserQrCodes(codes, activeUserId);
      return codes;
    }
    return list;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/fetch|network|failed/i.test(msg)) {
      return list;
    }
    throw err;
  }
}

export async function getQrCode(id: string): Promise<QrCodeRow> {
  const activeUserId = getActiveUserId();
  const list = getUserQrCodes(activeUserId);
  const cleanId = id.trim().toLowerCase();

  let found: QrCodeRow | undefined = list.find(
    (q) => q.id.toLowerCase() === cleanId || q.short_code?.toLowerCase() === cleanId,
  );

  // Search across all other local storage namespaces
  if (!found && typeof window !== "undefined") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("bt_user_qr_codes") || k === "bt_demo_qr_codes")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const match = parsed.find(
                (item) => item?.id?.toLowerCase() === cleanId || item?.short_code?.toLowerCase() === cleanId,
              );
              if (match) {
                found = match;
                break;
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // If not found in localStorage, fetch from Supabase
  if (!found && !isDemoMode()) {
    try {
      const { data } = await supabase
        .from("qr_codes")
        .select("*")
        .or(`id.eq.${id},short_code.eq.${id}`)
        .maybeSingle();
      if (data) {
        found = data as unknown as QrCodeRow;
      }
    } catch {
      // ignore
    }
  }

  // If still not found, check dynamic-routes API by short_code
  if (!found && typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/dynamic-routes?code=${encodeURIComponent(id)}`);
      if (res.ok) {
        const dynamicRecord = (await res.json()) as {
          short_code: string;
          target_url: string;
          name?: string;
          scan_count?: number;
        } | null;
        if (dynamicRecord && dynamicRecord.short_code) {
          found = {
            id: `qr-${dynamicRecord.short_code}`,
            user_id: activeUserId,
            name: dynamicRecord.name || `Dynamic QR (${dynamicRecord.short_code})`,
            qr_type: "url",
            content: { url: dynamicRecord.target_url },
            encoded_value: shortUrl(dynamicRecord.short_code),
            style: DEFAULT_STYLE,
            short_code: dynamicRecord.short_code,
            is_dynamic: true,
            target_url: dynamicRecord.target_url,
            scan_count: dynamicRecord.scan_count || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }
    } catch {
      // ignore
    }
  }

  if (found) {
    // Sync latest real-time scan count and destination from server
    if (found.short_code && typeof window !== "undefined") {
      try {
        const res = await fetch(
          `/api/dynamic-routes?code=${encodeURIComponent(found.short_code)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { scan_count?: number; target_url?: string } | null;
          if (data && typeof data.scan_count === "number") {
            found.scan_count = data.scan_count;
            if (data.target_url) found.target_url = data.target_url;
          }
        }
      } catch {
        // ignore
      }
    }
    return found;
  }

  if (isDemoMode()) {
    if (list[0]) return list[0];
    return {
      id: "demo-fallback",
      user_id: activeUserId,
      name: "Sample QR",
      qr_type: "url",
      content: { url: "https://bt-qr.app" },
      encoded_value: "https://bt-qr.app",
      style: DEFAULT_STYLE,
      short_code: "sample",
      is_dynamic: false,
      target_url: null,
      scan_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase.from("qr_codes").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return data as unknown as QrCodeRow;
  } catch (err) {
    if (list[0]) return list[0];
    throw err;
  }
}

export async function updateQrCode(
  id: string,
  patch: Partial<
    Pick<
      QrCodeRow,
      "name" | "target_url" | "encoded_value" | "content" | "style" | "is_dynamic" | "short_code"
    >
  >,
): Promise<QrCodeRow> {
  const activeUserId = getActiveUserId();

  // 1. Locate the existing record across local storage and Supabase
  let existing: QrCodeRow | undefined;
  const activeList = getUserQrCodes(activeUserId);
  existing = activeList.find((q) => q.id === id);

  if (!existing && typeof window !== "undefined") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("bt_user_qr_codes") || k === "bt_demo_qr_codes")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const match = parsed.find((item) => item?.id === id);
              if (match) {
                existing = match;
                break;
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  if (!existing && !isDemoMode()) {
    try {
      const { data } = await supabase.from("qr_codes").select("*").eq("id", id).maybeSingle();
      if (data) {
        existing = data as unknown as QrCodeRow;
      }
    } catch {
      // ignore
    }
  }

  const isDynamic = patch.is_dynamic !== undefined ? patch.is_dynamic : (existing?.is_dynamic ?? false);
  const shortCode = (patch.short_code || existing?.short_code || (isDynamic ? makeShortCode(7) : "")).trim();

  let cleanTarget = (patch.target_url !== undefined && patch.target_url !== null) ? patch.target_url.trim() : (existing?.target_url?.trim() || null);
  if (cleanTarget && !/^https?:\/\//i.test(cleanTarget) && (isDynamic || existing?.qr_type === "url")) {
    cleanTarget = `https://${cleanTarget}`;
  }

  const newEncodedValue = isDynamic
    ? (shortCode ? shortUrl(shortCode) : (existing?.encoded_value || ""))
    : (patch.encoded_value ?? existing?.encoded_value ?? cleanTarget ?? "");

  const updatedRecord: QrCodeRow = {
    id,
    user_id: existing?.user_id || activeUserId,
    name: (patch.name !== undefined ? patch.name.trim() : existing?.name) || "Untitled QR",
    qr_type: existing?.qr_type || "url",
    content: patch.content || existing?.content || (cleanTarget ? { url: cleanTarget } : {}),
    encoded_value: newEncodedValue,
    style: patch.style || existing?.style || DEFAULT_STYLE,
    short_code: shortCode,
    is_dynamic: isDynamic,
    target_url: isDynamic ? cleanTarget : null,
    scan_count: existing?.scan_count ?? 0,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 2. CRITICAL: Synchronize destination with server dynamic registry immediately & await it!
  if (isDynamic && shortCode && cleanTarget) {
    try {
      await syncDynamicRouteToServer({
        short_code: shortCode,
        target_url: cleanTarget,
        name: updatedRecord.name,
        scan_count: updatedRecord.scan_count,
      });
    } catch (err) {
      console.warn("Could not sync dynamic route to server:", err);
    }
  }

  // 3. Update Supabase if not in pure demo mode
  if (!isDemoMode()) {
    try {
      await supabase
        .from("qr_codes")
        .update({
          name: updatedRecord.name,
          target_url: updatedRecord.target_url,
          encoded_value: updatedRecord.encoded_value,
          content: updatedRecord.content as never,
          style: updatedRecord.style as never,
          is_dynamic: updatedRecord.is_dynamic,
          short_code: updatedRecord.short_code,
          updated_at: updatedRecord.updated_at,
        } as never)
        .eq("id", id);
    } catch (err) {
      console.warn("Supabase update error (falling back to local):", err);
    }
  }

  // 4. Update Local Storage across all user keys & active list
  const nextActiveList = activeList.some((q) => q.id === id)
    ? activeList.map((q) => (q.id === id ? updatedRecord : q))
    : [updatedRecord, ...activeList];
  saveUserQrCodes(nextActiveList, activeUserId);

  if (typeof window !== "undefined") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== getUserQrStorageKey(activeUserId) && (k.startsWith("bt_user_qr_codes") || k === "bt_demo_qr_codes")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.some((item) => item?.id === id)) {
              const patched = parsed.map((item) => (item?.id === id ? updatedRecord : item));
              localStorage.setItem(k, JSON.stringify(patched));
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return updatedRecord;
}

export async function deleteQrCode(id: string): Promise<void> {
  const activeUserId = getActiveUserId();

  if (!isDemoMode()) {
    try {
      await supabase.from("qr_codes").delete().eq("id", id);
    } catch {
      // ignore
    }
  }

  const list = getUserQrCodes(activeUserId).filter((code) => code.id !== id);
  saveUserQrCodes(list, activeUserId);

  if (typeof window !== "undefined") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== getUserQrStorageKey(activeUserId) && (k.startsWith("bt_user_qr_codes") || k === "bt_demo_qr_codes")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter((item) => item?.id !== id);
              localStorage.setItem(k, JSON.stringify(filtered));
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }
}

export interface ScanRow {
  id: string;
  qr_id: string;
  scanned_at: string;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
}

function getDemoScans(qrId: string): ScanRow[] {
  const devices = ["Mobile", "Mobile", "Desktop", "Tablet"];
  const browsers = ["Chrome", "Safari", "Edge", "Firefox"];
  const countries = ["India", "United States", "United Kingdom", "Germany", "Canada"];
  const cities: Record<string, string[]> = {
    India: ["New Delhi", "Mumbai", "Bengaluru", "Hyderabad"],
    "United States": ["New York", "San Francisco", "Austin"],
    "United Kingdom": ["London", "Manchester"],
    Germany: ["Berlin", "Munich"],
    Canada: ["Toronto", "Vancouver"],
  };

  const rows: ScanRow[] = [];
  const now = Date.now();
  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const scannedAt = new Date(now - daysAgo * 86400000 - Math.random() * 86400000).toISOString();
    const country = countries[Math.floor(Math.random() * countries.length)] ?? "India";
    const cityList = cities[country] ?? ["New Delhi"];
    const city = cityList[Math.floor(Math.random() * cityList.length)] ?? "New Delhi";
    const device = devices[Math.floor(Math.random() * devices.length)] ?? "Mobile";
    const browser = browsers[Math.floor(Math.random() * browsers.length)] ?? "Chrome";
    rows.push({
      id: `scan-${qrId}-${i}`,
      qr_id: qrId,
      scanned_at: scannedAt,
      device_type: device,
      browser,
      country,
      city,
      referrer: i % 3 === 0 ? "Direct Scan" : "Web Redirect",
    });
  }
  return rows.sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
}

export async function listScans(qrId: string): Promise<ScanRow[]> {
  // Resolve short_code via getQrCode or directly
  let shortCode: string | undefined = undefined;
  try {
    const found = await getQrCode(qrId);
    shortCode = found?.short_code;
  } catch {
    // fallback
  }

  if (!shortCode && qrId.length < 24) {
    shortCode = qrId;
  }

  // 1. Fetch real recorded scans from server
  if (shortCode && typeof window !== "undefined") {
    try {
      const res = await fetch(
        `/api/dynamic-routes?code=${encodeURIComponent(shortCode)}&scans=true`,
      );
      if (res.ok) {
        const data = (await res.json()) as { scans?: ScanRow[] } | null;
        if (data && Array.isArray(data.scans)) {
          return data.scans.map((s, idx) => ({
            id: s.id || `scan-${shortCode}-${idx}`,
            qr_id: qrId,
            scanned_at: s.scanned_at,
            device_type: s.device_type,
            browser: s.browser,
            country: s.country,
            city: s.city,
            referrer: s.referrer,
          }));
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Demo fallback for initial showcase codes only
  if (qrId === "demo-qr-1" || shortCode === "btweb") {
    return getDemoScans(qrId);
  }

  // 3. For any other code, if no scans exist, return empty array (accurate 0 scans!)
  return [];
}

export async function simulateScan(shortCode: string): Promise<number> {
  try {
    const res = await fetch("/api/dynamic-routes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "simulate_scan", short_code: shortCode }),
    });
    if (res.ok) {
      const data = (await res.json()) as { scan_count?: number } | null;
      const count = data?.scan_count ?? 1;

      // Sync updated scan_count back into local storage for this QR code
      if (typeof window !== "undefined") {
        const activeUserId = getActiveUserId();
        const list = getUserQrCodes(activeUserId);
        let changed = false;
        const updated = list.map((q) => {
          if (q.short_code?.toLowerCase() === shortCode.toLowerCase()) {
            changed = true;
            return { ...q, scan_count: count };
          }
          return q;
        });
        if (changed) {
          saveUserQrCodes(updated, activeUserId);
        }
      }

      return count;
    }
  } catch {
    // ignore
  }
  return 1;
}
