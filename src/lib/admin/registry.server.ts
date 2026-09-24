import fs from "node:fs/promises";
import path from "node:path";

export interface RegistryUser {
  id: string;
  email?: string | null | undefined;
  displayName?: string | null | undefined;
  plan: string;
  isBlocked: boolean;
  notes?: string | null | undefined;
  isAdmin: boolean;
  qrCount: number;
  totalScans: number;
  createdAt?: string | null | undefined;
  lastSignInAt?: string | null | undefined;
  emailConfirmed: boolean;
}

export interface RegistryQrCode {
  id: string;
  userId: string;
  name: string;
  qrType: string;
  shortCode: string;
  scanCount: number;
  isDynamic: boolean;
  targetUrl: string;
  createdAt: string;
  ownerEmail: string | null;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  announcementBanner: string;
  announcementActive: boolean;
  maintenanceMode: boolean;
  defaultPlan: string;
  freeTierLimit: number;
  liteTierLimit: number;
  premiumTierLimit: number;
  allowRegistrations: boolean;
  enableDynamicRedirect: boolean;
}

export interface RegistryDatabase {
  users: RegistryUser[];
  qrCodes: RegistryQrCode[];
  settings: SystemSettings;
}

const REGISTRY_FILE = path.resolve(process.cwd(), "src", "data", "admin-registry.json");

const DEFAULT_REGISTRY: RegistryDatabase = {
  users: [
    {
      id: "admin_rahul_master",
      email: "rahulkushwaha1842003@gmail.com",
      displayName: "Rahul Kushwaha (Master Admin)",
      plan: "premium",
      isBlocked: false,
      notes: "Primary System Administrator with full control & permissions.",
      isAdmin: true,
      qrCount: 5,
      totalScans: 842,
      createdAt: "2026-08-23T12:00:00.000Z",
      lastSignInAt: new Date().toISOString(),
      emailConfirmed: true,
    },
  ],
  qrCodes: [],
  settings: {
    siteName: "BT-QR Code Generator",
    siteDescription: "Save custom QR codes, host files, and track every scan in real-time.",
    supportEmail: "rahulkushwaha1842003@gmail.com",
    announcementBanner: "Welcome to BT-QR! Generate high-resolution, custom QR codes for free.",
    announcementActive: true,
    maintenanceMode: false,
    defaultPlan: "free",
    freeTierLimit: 10,
    liteTierLimit: 50,
    premiumTierLimit: 500,
    allowRegistrations: true,
    enableDynamicRedirect: true,
  },
};

export async function readRegistry(): Promise<RegistryDatabase> {
  try {
    const raw = await fs.readFile(REGISTRY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RegistryDatabase;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : DEFAULT_REGISTRY.users,
      qrCodes: Array.isArray(parsed.qrCodes) ? parsed.qrCodes : DEFAULT_REGISTRY.qrCodes,
      settings: { ...DEFAULT_REGISTRY.settings, ...(parsed.settings ?? {}) },
    };
  } catch (err) {
    console.error("Failed to read admin registry file, using defaults:", err);
    return DEFAULT_REGISTRY;
  }
}

export async function writeRegistry(data: RegistryDatabase): Promise<void> {
  try {
    await fs.mkdir(path.dirname(REGISTRY_FILE), { recursive: true });
    await fs.writeFile(REGISTRY_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write admin registry file:", err);
  }
}

/**
 * Returns all users combined from Registry + Supabase
 */
export async function getUnifiedUsers(): Promise<{
  users: RegistryUser[];
  stats: {
    userCount: number;
    qrCount: number;
    totalScans: number;
    premiumCount: number;
    liteCount: number;
    freeCount: number;
    blockedCount: number;
  };
}> {
  const db = await readRegistry();
  const userMap = new Map<string, RegistryUser>();

  // Populate from local registry
  for (const u of db.users) {
    userMap.set(u.id, { ...u });
    if (u.email) {
      userMap.set(u.email.toLowerCase(), { ...u });
    }
  }

  // Attempt to merge from Supabase if available
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }, { data: codes }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, email, display_name, plan, is_blocked, notes, created_at"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("qr_codes").select("user_id, scan_count"),
    ]);

    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));

    if (Array.isArray(profiles)) {
      for (const p of profiles) {
        const mine = (codes ?? []).filter((c) => c.user_id === p.id);
        const scans = mine.reduce((sum, c) => sum + (c.scan_count ?? 0), 0);
        const emailLower = p.email?.toLowerCase();
        const existing = (emailLower ? userMap.get(emailLower) : null) || userMap.get(p.id);

        const merged: RegistryUser = {
          id: p.id,
          email: p.email ?? existing?.email ?? null,
          displayName: p.display_name ?? existing?.displayName ?? "User",
          plan: p.plan || existing?.plan || "free",
          isBlocked: Boolean(p.is_blocked || existing?.isBlocked),
          notes: p.notes ?? existing?.notes ?? null,
          isAdmin: adminIds.has(p.id) || existing?.isAdmin || emailLower === "rahulkushwaha1842003@gmail.com",
          qrCount: Math.max(mine.length, existing?.qrCount ?? 0),
          totalScans: Math.max(scans, existing?.totalScans ?? 0),
          createdAt: p.created_at ?? existing?.createdAt ?? new Date().toISOString(),
          lastSignInAt: existing?.lastSignInAt ?? null,
          emailConfirmed: true,
        };

        userMap.set(p.id, merged);
        if (emailLower) userMap.set(emailLower, merged);
      }
    }
  } catch (err) {
    // Supabase query failed or offline - registry data is intact
    console.warn("Supabase query in getUnifiedUsers skipped:", err);
  }

  // De-duplicate users (dedup by email or id)
  const dedupedUsers: RegistryUser[] = [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();

  for (const u of userMap.values()) {
    if (seenIds.has(u.id)) continue;
    if (u.email && seenEmails.has(u.email.toLowerCase())) continue;
    seenIds.add(u.id);
    if (u.email) seenEmails.add(u.email.toLowerCase());
    dedupedUsers.push(u);
  }

  // Ensure Master Admin Rahul Kushwaha is always present and marked as Admin
  const masterIndex = dedupedUsers.findIndex((u) => u.email?.toLowerCase() === "rahulkushwaha1842003@gmail.com");
  const masterUser = masterIndex >= 0 ? dedupedUsers[masterIndex] : undefined;
  if (masterUser) {
    masterUser.isAdmin = true;
    masterUser.plan = "premium";
  } else {
    dedupedUsers.unshift({
      id: "admin_rahul_master",
      email: "rahulkushwaha1842003@gmail.com",
      displayName: "Rahul Kushwaha (Master Admin)",
      plan: "premium",
      isBlocked: false,
      notes: "Primary System Administrator with full control & permissions.",
      isAdmin: true,
      qrCount: 5,
      totalScans: 842,
      createdAt: "2026-08-23T12:00:00.000Z",
      lastSignInAt: new Date().toISOString(),
      emailConfirmed: true,
    });
  }

  // Sort: Admins first, then by createdAt desc
  dedupedUsers.sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  const allCodes = await getUnifiedQrCodes();
  const totalScans = allCodes.reduce((sum, c) => sum + (c.scanCount ?? 0), 0);

  return {
    users: dedupedUsers,
    stats: {
      userCount: dedupedUsers.length,
      qrCount: allCodes.length,
      totalScans,
      premiumCount: dedupedUsers.filter((u) => u.plan === "premium").length,
      liteCount: dedupedUsers.filter((u) => u.plan === "lite").length,
      freeCount: dedupedUsers.filter((u) => u.plan === "free").length,
      blockedCount: dedupedUsers.filter((u) => u.isBlocked).length,
    },
  };
}

/**
 * Update user details in registry and Supabase
 */
export async function updateRegistryUser(
  userId: string,
  patch: Partial<RegistryUser>,
): Promise<RegistryUser> {
  const db = await readRegistry();
  const idx = db.users.findIndex((u) => u.id === userId || u.email?.toLowerCase() === userId.toLowerCase());

  let target: RegistryUser;
  const existing = idx >= 0 ? db.users[idx] : undefined;
  if (existing) {
    target = {
      ...existing,
      ...patch,
      id: existing.id,
      plan: patch.plan ?? existing.plan,
      isBlocked: patch.isBlocked !== undefined ? patch.isBlocked : existing.isBlocked,
      isAdmin: patch.isAdmin !== undefined ? patch.isAdmin : existing.isAdmin,
      qrCount: existing.qrCount,
      totalScans: existing.totalScans,
      emailConfirmed: existing.emailConfirmed,
    };
    db.users[idx] = target;
  } else {
    target = {
      id: userId,
      email: patch.email ?? null,
      displayName: patch.displayName ?? "User",
      plan: patch.plan ?? "free",
      isBlocked: Boolean(patch.isBlocked),
      notes: patch.notes ?? null,
      isAdmin: Boolean(patch.isAdmin),
      qrCount: 0,
      totalScans: 0,
      createdAt: new Date().toISOString(),
      lastSignInAt: null,
      emailConfirmed: true,
      ...patch,
    };
    db.users.push(target);
  }

  await writeRegistry(db);

  // Attempt to update Supabase profile
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const supaPatch: Record<string, unknown> = {};
    if (patch.displayName !== undefined) supaPatch["display_name"] = patch.displayName;
    if (patch.plan !== undefined) supaPatch["plan"] = patch.plan;
    if (patch.isBlocked !== undefined) supaPatch["is_blocked"] = patch.isBlocked;
    if (patch.notes !== undefined) supaPatch["notes"] = patch.notes;

    if (Object.keys(supaPatch).length > 0) {
      await (supabaseAdmin.from("profiles") as any).update(supaPatch).eq("id", userId);
    }
  } catch {
    // Ignore Supabase update error
  }

  return target;
}

/**
 * Set admin role in registry and Supabase
 */
export async function setRegistryAdminRole(userId: string, makeAdmin: boolean): Promise<void> {
  const db = await readRegistry();
  const idx = db.users.findIndex((u) => u.id === userId || u.email?.toLowerCase() === userId.toLowerCase());
  const user = idx >= 0 ? db.users[idx] : undefined;
  if (user) {
    user.isAdmin = makeAdmin;
    await writeRegistry(db);
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (makeAdmin) {
      await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    }
  } catch {
    // Ignore
  }
}

/**
 * Delete user from registry and Supabase
 */
export async function deleteRegistryUser(userId: string): Promise<void> {
  const db = await readRegistry();
  db.users = db.users.filter((u) => u.id !== userId && u.email?.toLowerCase() !== userId.toLowerCase());
  db.qrCodes = db.qrCodes.filter((c) => c.userId !== userId);
  await writeRegistry(db);

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch {
    // Ignore
  }
}

/**
 * Add a new user manually from Admin Panel
 */
export async function createRegistryUser(data: {
  email: string;
  displayName: string;
  plan: string;
  notes?: string;
  isAdmin?: boolean;
}): Promise<RegistryUser> {
  const db = await readRegistry();
  const cleanEmail = data.email.trim().toLowerCase();
  const userId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const newUser: RegistryUser = {
    id: userId,
    email: cleanEmail,
    displayName: data.displayName.trim() || cleanEmail.split("@")[0] || "New User",
    plan: data.plan || "free",
    isBlocked: false,
    notes: data.notes || "Added manually by Master Admin.",
    isAdmin: Boolean(data.isAdmin),
    qrCount: 0,
    totalScans: 0,
    createdAt: new Date().toISOString(),
    lastSignInAt: null,
    emailConfirmed: true,
  };

  db.users.push(newUser);
  await writeRegistry(db);
  return newUser;
}

/**
 * Returns QR codes combined from Registry + Supabase
 */
export async function getUnifiedQrCodes(): Promise<RegistryQrCode[]> {
  const db = await readRegistry();
  const codeMap = new Map<string, RegistryQrCode>();

  for (const c of db.qrCodes) {
    codeMap.set(c.id, { ...c });
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: codes }, { data: profiles }] = await Promise.all([
      supabaseAdmin
        .from("qr_codes")
        .select("id, user_id, name, qr_type, short_code, scan_count, is_dynamic, target_url, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin.from("profiles").select("id, email"),
    ]);

    const emails = new Map((profiles ?? []).map((p) => [p.id, p.email]));

    if (Array.isArray(codes)) {
      for (const c of codes) {
        codeMap.set(c.id, {
          id: c.id,
          userId: c.user_id,
          name: c.name,
          qrType: c.qr_type,
          shortCode: c.short_code,
          scanCount: c.scan_count ?? 0,
          isDynamic: Boolean(c.is_dynamic),
          targetUrl: c.target_url ?? "",
          createdAt: c.created_at,
          ownerEmail: emails.get(c.user_id) ?? null,
        });
      }
    }
  } catch {
    // Ignore Supabase errors
  }

  const list = Array.from(codeMap.values());
  list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return list;
}

/**
 * Delete a QR code from registry and Supabase
 */
export async function deleteRegistryQrCode(id: string): Promise<void> {
  const db = await readRegistry();
  db.qrCodes = db.qrCodes.filter((c) => c.id !== id);
  await writeRegistry(db);

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("qr_codes").delete().eq("id", id);
  } catch {
    // Ignore
  }
}

/**
 * System Settings
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  const db = await readRegistry();
  return db.settings;
}

export async function updateSystemSettings(patch: Partial<SystemSettings>): Promise<SystemSettings> {
  const db = await readRegistry();
  db.settings = { ...db.settings, ...patch };
  await writeRegistry(db);
  return db.settings;
}
