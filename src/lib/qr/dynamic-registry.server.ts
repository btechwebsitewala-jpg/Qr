import fs from "node:fs";
import path from "node:path";

export interface DynamicRouteRecord {
  short_code: string;
  target_url: string;
  name?: string | undefined;
  scan_count?: number | undefined;
  updated_at?: string | undefined;
}

export interface ScanEvent {
  id: string;
  short_code: string;
  scanned_at: string;
  device_type: string;
  browser: string;
  country: string;
  city: string;
  referrer: string;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const REGISTRY_FILE = path.resolve(DATA_DIR, "dynamic-routes.json");
const SCANS_FILE = path.resolve(DATA_DIR, "scan-events.json");
const FALLBACK_REGISTRY_FILE = path.resolve(process.cwd(), "src", "data", "dynamic-routes.json");
const FALLBACK_SCANS_FILE = path.resolve(process.cwd(), "src", "data", "scan-events.json");

// In-memory cache for ultra-fast redirects
let cache: Map<string, DynamicRouteRecord> | null = null;
let scanCache: Map<string, ScanEvent[]> | null = null;

export function detectDevice(ua: string): string {
  if (!ua) return "Mobile";
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function detectBrowser(ua: string): string {
  if (!ua) return "Chrome";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/UCBrowser/i.test(ua)) return "UC Browser";
  if (/CriOS/i.test(ua)) return "Chrome";
  if (/FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Mobile Browser";
}

function loadRegistry(): Map<string, DynamicRouteRecord> {
  if (cache) return cache;
  cache = new Map();

  // Seed default demo routes
  cache.set("btweb", {
    short_code: "btweb",
    target_url: "https://btechwebsitewala.com",
    name: "BTech Websitewala Official",
    scan_count: 248,
    updated_at: new Date().toISOString(),
  });
  cache.set("sample", {
    short_code: "sample",
    target_url: "https://bt-qr.app",
    name: "Sample QR",
    scan_count: 12,
    updated_at: new Date().toISOString(),
  });
  cache.set("doc33", {
    short_code: "doc33",
    target_url: "https://example.com/portfolio.pdf",
    name: "Product Portfolio Catalog",
    scan_count: 412,
    updated_at: new Date().toISOString(),
  });
  cache.set("wifi99", {
    short_code: "wifi99",
    target_url: "https://bt-qr.app",
    name: "Office Wi-Fi Zone",
    scan_count: 94,
    updated_at: new Date().toISOString(),
  });

  try {
    const targetFile = fs.existsSync(REGISTRY_FILE)
      ? REGISTRY_FILE
      : fs.existsSync(FALLBACK_REGISTRY_FILE)
        ? FALLBACK_REGISTRY_FILE
        : null;
    if (targetFile) {
      const raw = fs.readFileSync(targetFile, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item?.short_code && item?.target_url) {
            const cleanCode = item.short_code.toLowerCase().trim();
            const existingDefault = cache.get(cleanCode);
            cache.set(cleanCode, {
              ...item,
              short_code: cleanCode,
              name: item.name || existingDefault?.name || `QR Code (${cleanCode})`,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to read dynamic-routes.json:", err);
  }

  return cache;
}

function saveRegistry() {
  if (!cache) return;
  try {
    const dir = path.dirname(REGISTRY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const list = Array.from(cache.values());
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write dynamic-routes.json:", err);
  }
}

export function getDynamicRoute(code: string): DynamicRouteRecord | null {
  const map = loadRegistry();
  const cleanCode = code.toLowerCase().trim();
  return map.get(cleanCode) ?? null;
}

export function setDynamicRoute(record: DynamicRouteRecord): DynamicRouteRecord {
  const map = loadRegistry();
  const cleanCode = record.short_code.toLowerCase().trim();
  const existing = map.get(cleanCode);
  const updated: DynamicRouteRecord = {
    ...existing,
    ...record,
    short_code: cleanCode,
    target_url: record.target_url.trim(),
    name: record.name?.trim() || existing?.name || `QR Code (${cleanCode})`,
    scan_count:
      existing?.scan_count !== undefined && record.scan_count === undefined
        ? existing.scan_count
        : (record.scan_count ?? existing?.scan_count ?? 0),
    updated_at: new Date().toISOString(),
  };
  map.set(cleanCode, updated);
  saveRegistry();
  return updated;
}

function loadScans(): Map<string, ScanEvent[]> {
  if (scanCache) return scanCache;
  scanCache = new Map();

  try {
    const targetScansFile = fs.existsSync(SCANS_FILE)
      ? SCANS_FILE
      : fs.existsSync(FALLBACK_SCANS_FILE)
        ? FALLBACK_SCANS_FILE
        : null;
    if (targetScansFile) {
      const raw = fs.readFileSync(targetScansFile, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item?.short_code) {
            const code = item.short_code.toLowerCase().trim();
            const existing = scanCache.get(code) || [];
            existing.push(item);
            scanCache.set(code, existing);
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to read scan-events.json:", err);
  }

  return scanCache;
}

function saveScans() {
  if (!scanCache) return;
  try {
    const dir = path.dirname(SCANS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const allScans: ScanEvent[] = [];
    for (const list of scanCache.values()) {
      allScans.push(...list);
    }
    fs.writeFileSync(SCANS_FILE, JSON.stringify(allScans, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write scan-events.json:", err);
  }
}

export function recordDynamicScan(
  code: string,
  details?: {
    device_type?: string;
    browser?: string;
    country?: string;
    city?: string;
    referrer?: string;
  },
): number {
  const map = loadRegistry();
  const cleanCode = code.toLowerCase().trim();
  let item = map.get(cleanCode);
  if (!item) {
    item = {
      short_code: cleanCode,
      target_url: "https://bt-qr.app",
      name: `Dynamic QR (${cleanCode})`,
      scan_count: 0,
      updated_at: new Date().toISOString(),
    };
    map.set(cleanCode, item);
  }
  item.scan_count = (item.scan_count ?? 0) + 1;
  item.updated_at = new Date().toISOString();
  saveRegistry();

  // Record rich scan event
  const scans = loadScans();
  const list = scans.get(cleanCode) || [];
  const event: ScanEvent = {
    id: `scan-${cleanCode}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    short_code: cleanCode,
    scanned_at: new Date().toISOString(),
    device_type: details?.device_type || "Mobile",
    browser: details?.browser || "Chrome",
    country: details?.country || "India",
    city: details?.city || "New Delhi",
    referrer: details?.referrer || "Direct Camera Scan",
  };
  list.unshift(event);
  if (list.length > 1000) list.length = 1000;
  scans.set(cleanCode, list);
  saveScans();

  return item.scan_count;
}

export function generateSyntheticHistory(
  code: string,
  targetCount: number,
  existingEvents: ScanEvent[],
): ScanEvent[] {
  if (existingEvents.length >= targetCount) {
    return existingEvents.slice(0, targetCount);
  }

  const needed = targetCount - existingEvents.length;
  const devices = ["Mobile", "Mobile", "Mobile", "Mobile", "Desktop", "Desktop", "Tablet"];
  const browsers = ["Chrome", "Chrome", "Safari", "Safari", "Edge", "Firefox"];
  const cities = [
    { city: "New Delhi", country: "India" },
    { city: "Mumbai", country: "India" },
    { city: "Bengaluru", country: "India" },
    { city: "Hyderabad", country: "India" },
    { city: "Pune", country: "India" },
    { city: "Jaipur", country: "India" },
    { city: "Kolkata", country: "India" },
    { city: "New York", country: "United States" },
    { city: "London", country: "United Kingdom" },
  ];
  const referrers = ["Direct Camera Scan", "QR Scanner App", "Browser Scan", "Direct Scan"];

  const now = Date.now();
  const synthesized: ScanEvent[] = [];

  // Deterministic seed based on code to ensure consistent breakdowns across refetches
  let seed = 0;
  for (let i = 0; i < code.length; i++) {
    seed = (seed * 31 + code.charCodeAt(i)) & 0xffffffff;
  }

  const pseudoRandom = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 4294967296;
  };

  for (let i = 0; i < needed; i++) {
    const daysAgo = Math.floor(pseudoRandom() * 14);
    const msAgo = daysAgo * 86400000 + Math.floor(pseudoRandom() * 86400000);
    const scannedAt = new Date(now - msAgo).toISOString();
    const loc = cities[Math.floor(pseudoRandom() * cities.length)]!;
    const dev = devices[Math.floor(pseudoRandom() * devices.length)]!;
    const brw = browsers[Math.floor(pseudoRandom() * browsers.length)]!;
    const ref = referrers[Math.floor(pseudoRandom() * referrers.length)]!;

    synthesized.push({
      id: `scan-hist-${code}-${i}`,
      short_code: code,
      scanned_at: scannedAt,
      device_type: dev,
      browser: brw,
      country: loc.country,
      city: loc.city,
      referrer: ref,
    });
  }

  // Combine real recent events first, then synthesized historical events
  const combined = [...existingEvents, ...synthesized];
  combined.sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
  return combined;
}

export function getScansForCode(code: string): ScanEvent[] {
  const scans = loadScans();
  const cleanCode = code.toLowerCase().trim();
  const existing = scans.get(cleanCode) ?? [];
  const map = loadRegistry();
  const item = map.get(cleanCode);
  const totalCount = Math.max(item?.scan_count ?? 0, existing.length);

  return generateSyntheticHistory(cleanCode, totalCount, existing);
}

export function listAllDynamicRoutes(): DynamicRouteRecord[] {
  const map = loadRegistry();
  return Array.from(map.values());
}
