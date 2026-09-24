import { createServerFn } from "@tanstack/react-start";

export interface AdminUserRow {
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

export interface AdminQrCodeRow {
  id: string;
  name: string;
  qrType: string;
  shortCode: string;
  scanCount: number;
  isDynamic: boolean;
  targetUrl: string;
  createdAt: string;
  ownerEmail?: string | null | undefined;
}

export interface SystemSettingsData {
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

const MASTER_ADMIN_SECRET = "BT_MASTER_ADMIN_ORIENTAL_1234_AUTHENTICATED";
const MASTER_ADMIN_EMAIL = "rahulkushwaha1842003@gmail.com";

/**
 * Validates that the caller holds the Master Admin token or Master Admin email.
 * If unauthorized, immediately throws a 403 Forbidden error.
 */
export function assertMasterAdmin(adminToken?: string, adminEmail?: string) {
  if (
    adminToken === MASTER_ADMIN_SECRET ||
    adminEmail?.toLowerCase().trim() === MASTER_ADMIN_EMAIL
  ) {
    return;
  }
  throw new Error("Forbidden: Master Admin access required.");
}

/**
 * List all users and stats for Admin Panel
 */
export const listAdminUsers = createServerFn({ method: "POST" })
  .inputValidator((data?: { adminToken?: string; adminEmail?: string }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data?.adminToken, data?.adminEmail);
    const { getUnifiedUsers } = await import("./registry.server");
    return await getUnifiedUsers();
  });

/**
 * Update an existing user's details, plan, block status or notes
 */
export const updateAdminUser = createServerFn({ method: "POST" })
  .inputValidator((data: {
    adminToken?: string;
    adminEmail?: string;
    userId: string;
    displayName?: string;
    plan?: string;
    isBlocked?: boolean;
    notes?: string;
  }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data.adminToken, data.adminEmail);
    const { updateRegistryUser } = await import("./registry.server");
    const patch: {
      displayName?: string;
      plan?: string;
      isBlocked?: boolean;
      notes?: string;
    } = {};
    if (data.displayName !== undefined) patch.displayName = data.displayName;
    if (data.plan !== undefined) patch.plan = data.plan;
    if (data.isBlocked !== undefined) patch.isBlocked = data.isBlocked;
    if (data.notes !== undefined) patch.notes = data.notes;

    const updated = await updateRegistryUser(data.userId, patch);
    return { ok: true, user: updated };
  });

/**
 * Grant or revoke Admin role
 */
export const setAdminRole = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string; adminEmail?: string; userId: string; makeAdmin: boolean }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data.adminToken, data.adminEmail);
    const { setRegistryAdminRole } = await import("./registry.server");
    await setRegistryAdminRole(data.userId, data.makeAdmin);
    return { ok: true };
  });

/**
 * Delete a user and their associated data
 */
export const deleteAdminUser = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string; adminEmail?: string; userId: string }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data.adminToken, data.adminEmail);
    const { deleteRegistryUser } = await import("./registry.server");
    await deleteRegistryUser(data.userId);
    return { ok: true };
  });

/**
 * Manually create a new user from the Admin Panel
 */
export const createAdminUser = createServerFn({ method: "POST" })
  .inputValidator((data: {
    adminToken?: string;
    adminEmail?: string;
    email: string;
    displayName: string;
    plan: string;
    notes?: string;
    isAdmin?: boolean;
  }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data.adminToken, data.adminEmail);
    const { createRegistryUser } = await import("./registry.server");
    const newUser = await createRegistryUser(data);
    return { ok: true, user: newUser };
  });

/**
 * Send password reset email
 */
export const sendUserPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string; adminEmail?: string; email: string; redirectTo: string }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data.adminToken, data.adminEmail);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
        redirectTo: data.redirectTo,
      });
    } catch (err) {
      console.warn("Supabase resetPasswordForEmail skipped or rate-limited:", err);
    }
    return { ok: true };
  });

/**
 * List all saved QR codes
 */
export const listAdminQrCodes = createServerFn({ method: "POST" })
  .inputValidator((data?: { adminToken?: string; adminEmail?: string }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data?.adminToken, data?.adminEmail);
    const { getUnifiedQrCodes } = await import("./registry.server");
    return await getUnifiedQrCodes();
  });

/**
 * Delete a QR code
 */
export const deleteAdminQrCode = createServerFn({ method: "POST" })
  .inputValidator((data: { adminToken?: string; adminEmail?: string; id: string }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data.adminToken, data.adminEmail);
    const { deleteRegistryQrCode } = await import("./registry.server");
    await deleteRegistryQrCode(data.id);
    return { ok: true };
  });

/**
 * Get current system settings and customization
 */
export const getAdminSettings = createServerFn({ method: "POST" })
  .inputValidator((data?: { adminToken?: string; adminEmail?: string }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data?.adminToken, data?.adminEmail);
    const { getSystemSettings } = await import("./registry.server");
    return await getSystemSettings();
  });

/**
 * Update system settings and customization
 */
export const updateAdminSettings = createServerFn({ method: "POST" })
  .inputValidator((data: {
    adminToken?: string;
    adminEmail?: string;
    settings: Partial<SystemSettingsData>;
  }) => data)
  .handler(async ({ data }) => {
    assertMasterAdmin(data.adminToken, data.adminEmail);
    const { updateSystemSettings } = await import("./registry.server");
    const updated = await updateSystemSettings(data.settings);
    return { ok: true, settings: updated };
  });
