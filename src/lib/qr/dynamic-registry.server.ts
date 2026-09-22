import fs from "node:fs";
import path from "node:path";

export interface DynamicRouteRecord {
  short_code: string;
  target_url: string;
  name?: string | undefined;
  scan_count?: number | undefined;
  updated_at?: string | undefined;
}

const REGISTRY_FILE = path.resolve(process.cwd(), "src", "data", "dynamic-routes.json");

// In-memory cache for ultra-fast redirects
let cache: Map<string, DynamicRouteRecord> | null = null;

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
    if (fs.existsSync(REGISTRY_FILE)) {
      const raw = fs.readFileSync(REGISTRY_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item?.short_code && item?.target_url) {
            cache.set(item.short_code.toLowerCase().trim(), item);
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
    scan_count: existing?.scan_count ?? record.scan_count ?? 0,
    updated_at: new Date().toISOString(),
  };
  map.set(cleanCode, updated);
  saveRegistry();
  return updated;
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
  const item = map.get(cleanCode);
  if (!item) return 0;
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
    referrer: details?.referrer || "Direct Scan",
  };
  list.unshift(event);
  if (list.length > 500) list.length = 500;
  scans.set(cleanCode, list);
  saveScans();

  return item.scan_count;
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

const SCANS_FILE = path.resolve(process.cwd(), "src", "data", "scan-events.json");

let scanCache: Map<string, ScanEvent[]> | null = null;

function loadScans(): Map<string, ScanEvent[]> {
  if (scanCache) return scanCache;
  scanCache = new Map();

  try {
    if (fs.existsSync(SCANS_FILE)) {
      const raw = fs.readFileSync(SCANS_FILE, "utf-8");
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

export function getScansForCode(code: string): ScanEvent[] {
  const scans = loadScans();
  const cleanCode = code.toLowerCase().trim();
  return scans.get(cleanCode) ?? [];
}

export function listAllDynamicRoutes(): DynamicRouteRecord[] {
  const map = loadRegistry();
  return Array.from(map.values());
}
