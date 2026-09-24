import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle2,
  Crown,
  Globe,
  KeyRound,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  createAdminUser,
  deleteAdminQrCode,
  deleteAdminUser,
  getAdminSettings,
  listAdminQrCodes,
  listAdminUsers,
  sendUserPasswordReset,
  setAdminRole,
  updateAdminSettings,
  updateAdminUser,
  type AdminUserRow,
  type SystemSettingsData,
} from "@/lib/admin/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const user = (context as { user?: { email?: string } })?.user;
    if (user?.email && user.email.toLowerCase().trim() !== "rahulkushwaha1842003@gmail.com") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin panel — BT-QR control centre" },
      {
        name: "description",
        content: "Manage BT-QR users, plans, admin access, password resets, system customization and QR codes.",
      },
      { property: "og:title", content: "Admin panel — BT-QR control centre" },
      { property: "og:description", content: "Manage BT-QR users, plans and system customizations." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();

  const fetchUsers = useServerFn(listAdminUsers);
  const fetchCodes = useServerFn(listAdminQrCodes);
  const fetchSettings = useServerFn(getAdminSettings);

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [showAddUser, setShowAddUser] = useState(false);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("free");
  const [newNotes, setNewNotes] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);

  const isMasterAdmin =
    user?.email?.toLowerCase().trim() === "rahulkushwaha1842003@gmail.com";

  const getAuth = () => ({
    adminToken: typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "",
    adminEmail: user?.email || "",
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchUsers({ data: getAuth() }),
    enabled: isMasterAdmin && !adminLoading,
  });
  const codesQuery = useQuery({
    queryKey: ["admin", "codes"],
    queryFn: () => fetchCodes({ data: getAuth() }),
    enabled: isMasterAdmin && !adminLoading,
  });
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => fetchSettings({ data: getAuth() }),
    enabled: isMasterAdmin && !adminLoading,
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin"] });

  const users = usersQuery.data?.users ?? [];
  const stats = usersQuery.data?.stats;

  const filteredUsers = useMemo(() => {
    let result = users;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (u) =>
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.displayName ?? "").toLowerCase().includes(q) ||
          (u.notes ?? "").toLowerCase().includes(q),
      );
    }
    if (planFilter !== "all") {
      result = result.filter((u) => u.plan.toLowerCase() === planFilter);
    }
    return result;
  }, [users, search, planFilter]);

  const addUserMutation = useMutation({
    mutationFn: (data: { email: string; displayName: string; plan: string; notes?: string; isAdmin?: boolean }) =>
      useServerFn(createAdminUser)({ data: { ...getAuth(), ...data } }),
    onSuccess: () => {
      toast.success("User added successfully!");
      setNewEmail("");
      setNewName("");
      setNewNotes("");
      setShowAddUser(false);
      refresh();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add user");
    },
  });

  if (!adminLoading && !isMasterAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShieldAlert className="mx-auto size-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Access Denied — Master Admin Only</h1>
        <p className="mt-2 text-muted-foreground">
          You are currently signed in as <strong>{user?.email || "guest"}</strong>, which does not have Master Admin permissions.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <a href="/auth">Sign in with Master Admin Credentials</a>
          </Button>
          <Button asChild>
            <a href="/dashboard">Return to Dashboard</a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              Master Admin Control Centre
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              rahulkushwaha1842003@gmail.com
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Admin Panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete platform management: users, subscriptions, system customization and QR codes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="gap-1.5 rounded-xl border-border bg-card hover:bg-secondary cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${usersQuery.isFetching ? "animate-spin text-primary" : ""}`} />
            Refresh data
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Users" value={stats?.userCount ?? 0} />
        <StatCard icon={Crown} label="Premium Users" value={stats?.premiumCount ?? 0} color="text-amber-500" />
        <StatCard icon={Sliders} label="Lite Users" value={stats?.liteCount ?? 0} color="text-blue-500" />
        <StatCard icon={QrCode} label="Saved QR Codes" value={stats?.qrCount ?? 0} color="text-emerald-500" />
        <StatCard icon={BarChart3} label="Total Scans" value={stats?.totalScans ?? 0} color="text-indigo-500" />
      </section>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="mt-10">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-2xl bg-secondary/80 p-1">
          <TabsTrigger value="users" className="rounded-xl text-xs sm:text-sm font-semibold cursor-pointer">
            <Users className="mr-1.5 size-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="codes" className="rounded-xl text-xs sm:text-sm font-semibold cursor-pointer">
            <QrCode className="mr-1.5 size-4" /> QR Codes
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl text-xs sm:text-sm font-semibold cursor-pointer">
            <Settings className="mr-1.5 size-4" /> Customization
          </TabsTrigger>
        </TabsList>

        {/* 1. USERS TAB */}
        <TabsContent value="users" className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 rounded-xl border-border bg-card"
                  placeholder="Search by name, email or notes..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {/* Plan Filter */}
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 text-xs">
                {(["all", "free", "lite", "premium"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlanFilter(p)}
                    className={`rounded-lg px-2.5 py-1 font-medium capitalize transition-colors cursor-pointer ${
                      planFilter === p
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddUser(!showAddUser)}
              className="gap-1.5 rounded-xl bg-brand-gradient text-primary-foreground font-semibold shadow-brand cursor-pointer"
            >
              <UserPlus className="size-4" />
              {showAddUser ? "Close Form" : "Add New User"}
            </Button>
          </div>

          {/* Add User Collapsible Form */}
          {showAddUser ? (
            <div className="rounded-2xl border-2 border-primary/20 bg-card p-5 shadow-lg animate-in fade-in slide-in-from-top-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="size-4 text-primary" />
                Add User Account Manually
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provision a user account with custom plan, admin role and internal notes.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="new-email" className="text-xs">Email Address *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="new-name" className="text-xs">Full / Display Name</Label>
                  <Input
                    id="new-name"
                    placeholder="Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="new-plan" className="text-xs">Subscription Plan</Label>
                  <select
                    id="new-plan"
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="mt-1.5 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="free">Free Plan</option>
                    <option value="lite">Lite Plan</option>
                    <option value="premium">Premium Plan</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <Label htmlFor="new-notes" className="text-xs">Internal Notes</Label>
                <Input
                  id="new-notes"
                  placeholder="Notes about this user, business agreement or purpose..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <Switch
                    checked={newIsAdmin}
                    onCheckedChange={setNewIsAdmin}
                  />
                  Grant Admin Privileges
                </label>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!newEmail.trim() || addUserMutation.isPending}
                    onClick={() => {
                      addUserMutation.mutate({
                        email: newEmail,
                        displayName: newName,
                        plan: newPlan,
                        notes: newNotes,
                        isAdmin: newIsAdmin,
                      });
                    }}
                    className="bg-brand-gradient text-primary-foreground font-semibold"
                  >
                    {addUserMutation.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Plus className="mr-1.5 size-4" />}
                    Create User Account
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* User List */}
          {usersQuery.isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading unified user directory…
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No users found matching your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((userRow) => (
                <UserCard key={userRow.id} user={userRow} onDone={refresh} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 2. QR CODES TAB */}
        <TabsContent value="codes" className="mt-6">
          {codesQuery.isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading saved QR codes…
            </div>
          ) : (codesQuery.data ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No saved QR codes found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left">
                  <tr>
                    <th className="p-3.5 font-semibold text-foreground">Name</th>
                    <th className="p-3.5 font-semibold text-foreground">Type</th>
                    <th className="p-3.5 font-semibold text-foreground">Owner</th>
                    <th className="p-3.5 font-semibold text-foreground">Short link / Target</th>
                    <th className="p-3.5 font-semibold text-foreground">Scans</th>
                    <th className="p-3.5 text-right font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {(codesQuery.data ?? []).map((code) => (
                    <CodeRow key={code.id} code={code} onDone={refresh} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* 3. SYSTEM CUSTOMIZATION & SETTINGS TAB */}
        <TabsContent value="settings" className="mt-6">
          <SettingsSection settingsData={settingsQuery.data} onDone={refresh} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-primary",
}: {
  icon: typeof Users;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`size-4 ${color}`} />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function UserCard({ user, onDone }: { user: AdminUserRow; onDone: () => void }) {
  const { user: currentAuthUser } = useAuth();
  const getAuth = () => ({
    adminToken: typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "",
    adminEmail: currentAuthUser?.email || "",
  });

  const update = useServerFn(updateAdminUser);
  const role = useServerFn(setAdminRole);
  const reset = useServerFn(sendUserPasswordReset);
  const remove = useServerFn(deleteAdminUser);

  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [plan, setPlan] = useState(user.plan ?? "free");
  const [notes, setNotes] = useState(user.notes ?? "");
  const [isBlocked, setIsBlocked] = useState(user.isBlocked);
  const [isAdminRole, setIsAdminRole] = useState(user.isAdmin);

  const isMasterAccount = user.email?.toLowerCase().trim() === "rahulkushwaha1842003@gmail.com";

  const saveMutation = useMutation({
    mutationFn: () =>
      update({
        data: {
          ...getAuth(),
          userId: user.id,
          displayName,
          plan,
          isBlocked,
          notes,
        },
      }),
    onSuccess: () => {
      toast.success("User information updated!");
      onDone();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update user"),
  });

  const handleRoleToggle = async (makeAdmin: boolean) => {
    try {
      setIsAdminRole(makeAdmin);
      await role({ data: { ...getAuth(), userId: user.id, makeAdmin } });
      toast.success(makeAdmin ? "Admin access granted" : "Admin access revoked");
      onDone();
    } catch (err) {
      setIsAdminRole(!makeAdmin);
      toast.error(err instanceof Error ? err.message : "Role update failed");
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) return;
    try {
      await reset({
        data: {
          ...getAuth(),
          email: user.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });
      toast.success("Password reset instructions dispatched!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password reset failed");
    }
  };

  const handleDeleteUser = async () => {
    if (isMasterAccount) {
      toast.error("You cannot delete the Master Administrator account!");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.email}" and all their data?`)) {
      return;
    }
    try {
      await remove({ data: { ...getAuth(), userId: user.id } });
      toast.success("User deleted successfully!");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm transition-all ${
      isMasterAccount ? "border-primary/40 bg-primary/[0.02]" : "border-border"
    }`}>
      {/* User Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground text-base">
              {displayName || "Unnamed User"}
            </p>
            {isMasterAccount ? (
              <Badge className="bg-brand-gradient text-primary-foreground text-[10px] uppercase font-bold tracking-wider">
                Primary Master Admin
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.email ?? "No email address"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} · Last active:{" "}
            {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "Recently"} ·{" "}
            <strong>{user.qrCount}</strong> QR Codes · <strong>{user.totalScans}</strong> Total Scans
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {isAdminRole ? <Badge className="border-0 bg-primary/20 text-primary font-semibold">Admin</Badge> : null}
          <Badge
            variant={plan === "premium" ? "default" : plan === "lite" ? "secondary" : "outline"}
            className="uppercase font-semibold text-[10px]"
          >
            {plan}
          </Badge>
          {isBlocked ? <Badge variant="destructive">Blocked</Badge> : null}
          {user.emailConfirmed ? (
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 gap-1 text-[10px]">
              <CheckCircle2 className="size-2.5" /> Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 gap-1 text-[10px]">
              <AlertCircle className="size-2.5" /> Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Editable Fields */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor={`name-${user.id}`} className="text-xs font-semibold">Display name</Label>
          <Input
            id={`name-${user.id}`}
            className="mt-1.5 rounded-xl border-border bg-background/50"
            maxLength={120}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor={`plan-${user.id}`} className="text-xs font-semibold">Subscription Plan</Label>
          <select
            id={`plan-${user.id}`}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="free">Free Plan (10 QRs)</option>
            <option value="lite">Lite Plan (50 QRs)</option>
            <option value="premium">Premium Plan (Unlimited / 500 QRs)</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor={`notes-${user.id}`} className="text-xs font-semibold">Internal notes</Label>
          <Input
            id={`notes-${user.id}`}
            className="mt-1.5 rounded-xl border-border bg-background/50"
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add internal notes..."
          />
        </div>
      </div>

      {/* Permission & Status Switches */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-border/50 pt-3">
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <Switch
            checked={isAdminRole}
            disabled={isMasterAccount}
            onCheckedChange={handleRoleToggle}
          />
          Admin Privileges
        </label>

        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <Switch
            checked={isBlocked}
            disabled={isMasterAccount}
            onCheckedChange={(checked) => setIsBlocked(checked)}
          />
          Account Blocked
        </label>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded-xl bg-brand-gradient text-primary-foreground font-semibold shadow-sm cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
            Save user updates
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={!user.email}
            onClick={handleResetPassword}
            className="rounded-xl border-border cursor-pointer text-xs"
          >
            <KeyRound className="mr-1.5 size-3.5" /> Send password reset
          </Button>
        </div>

        {!isMasterAccount ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs cursor-pointer"
            onClick={handleDeleteUser}
          >
            <Trash2 className="mr-1.5 size-3.5" /> Delete account
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function CodeRow({
  code,
  onDone,
}: {
  code: {
    id: string;
    name: string;
    qrType: string;
    shortCode: string;
    scanCount: number;
    ownerEmail: string | null;
    targetUrl: string;
  };
  onDone: () => void;
}) {
  const { user: currentAuthUser } = useAuth();
  const getAuth = () => ({
    adminToken: typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "",
    adminEmail: currentAuthUser?.email || "",
  });
  const remove = useServerFn(deleteAdminQrCode);

  return (
    <tr className="border-t border-border hover:bg-secondary/40 transition-colors">
      <td className="p-3.5 font-medium text-foreground">{code.name}</td>
      <td className="p-3.5">
        <Badge variant="outline" className="uppercase text-[10px] font-semibold">
          {code.qrType}
        </Badge>
      </td>
      <td className="p-3.5 text-xs text-muted-foreground">{code.ownerEmail ?? "Local User"}</td>
      <td className="p-3.5 text-xs">
        <a
          className="text-primary hover:underline font-mono"
          href={`/r/${code.shortCode}`}
          target="_blank"
          rel="noreferrer"
        >
          /r/{code.shortCode}
        </a>
      </td>
      <td className="p-3.5 font-semibold text-foreground">{code.scanCount}</td>
      <td className="p-3.5 text-right">
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8 p-0 cursor-pointer"
          onClick={async () => {
            if (!window.confirm(`Delete QR code "${code.name}"?`)) return;
            try {
              await remove({ data: { ...getAuth(), id: code.id } });
              toast.success("QR code deleted");
              onDone();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Delete failed");
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  );
}

function SettingsSection({
  settingsData,
  onDone,
}: {
  settingsData: SystemSettingsData | undefined;
  onDone: () => void;
}) {
  const { user: currentAuthUser } = useAuth();
  const getAuth = () => ({
    adminToken: typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "",
    adminEmail: currentAuthUser?.email || "",
  });
  const saveSettings = useServerFn(updateAdminSettings);

  const [siteName, setSiteName] = useState(settingsData?.siteName ?? "BT-QR Code Generator");
  const [siteDescription, setSiteDescription] = useState(
    settingsData?.siteDescription ?? "Save custom QR codes, host files, and track every scan in real-time.",
  );
  const [supportEmail, setSupportEmail] = useState(
    settingsData?.supportEmail ?? "rahulkushwaha1842003@gmail.com",
  );
  const [announcementBanner, setAnnouncementBanner] = useState(
    settingsData?.announcementBanner ?? "Welcome to BT-QR! Generate high-resolution, custom QR codes for free.",
  );
  const [announcementActive, setAnnouncementActive] = useState(
    settingsData?.announcementActive ?? true,
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    settingsData?.maintenanceMode ?? false,
  );
  const [defaultPlan, setDefaultPlan] = useState(settingsData?.defaultPlan ?? "free");
  const [freeTierLimit, setFreeTierLimit] = useState(settingsData?.freeTierLimit ?? 10);
  const [liteTierLimit, setLiteTierLimit] = useState(settingsData?.liteTierLimit ?? 50);
  const [premiumTierLimit, setPremiumTierLimit] = useState(settingsData?.premiumTierLimit ?? 500);
  const [allowRegistrations, setAllowRegistrations] = useState(
    settingsData?.allowRegistrations ?? true,
  );
  const [enableDynamicRedirect, setEnableDynamicRedirect] = useState(
    settingsData?.enableDynamicRedirect ?? true,
  );

  const mutation = useMutation({
    mutationFn: () =>
      saveSettings({
        data: {
          ...getAuth(),
          settings: {
            siteName,
            siteDescription,
            supportEmail,
            announcementBanner,
            announcementActive,
            maintenanceMode,
            defaultPlan,
            freeTierLimit: Number(freeTierLimit),
            liteTierLimit: Number(liteTierLimit),
            premiumTierLimit: Number(premiumTierLimit),
            allowRegistrations,
            enableDynamicRedirect,
          },
        },
      }),
    onSuccess: () => {
      toast.success("System & platform settings updated successfully!");
      onDone();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    },
  });

  return (
    <div className="space-y-6">
      {/* 1. Brand & Contact Information */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Globe className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Brand & Platform Identity</h3>
            <p className="text-xs text-muted-foreground">Configure the website name, description and support contacts.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="set-site-name" className="text-xs font-semibold">Site Title / Brand Name</Label>
            <Input
              id="set-site-name"
              className="mt-1.5 rounded-xl border-border bg-background/50"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="set-support-email" className="text-xs font-semibold">Support & Contact Email</Label>
            <Input
              id="set-support-email"
              type="email"
              className="mt-1.5 rounded-xl border-border bg-background/50"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="set-site-desc" className="text-xs font-semibold">Site Description / Tagline</Label>
            <Textarea
              id="set-site-desc"
              rows={2}
              className="mt-1.5 rounded-xl border-border bg-background/50"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Announcement Banner Customization */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-foreground">Live Announcement Bar</h3>
              <p className="text-xs text-muted-foreground">Broadcast updates, discounts, or announcements to all visitors.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{announcementActive ? "Active" : "Disabled"}</span>
            <Switch
              checked={announcementActive}
              onCheckedChange={setAnnouncementActive}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="set-announcement" className="text-xs font-semibold">Announcement Text</Label>
          <Input
            id="set-announcement"
            className="mt-1.5 rounded-xl border-border bg-background/50"
            value={announcementBanner}
            onChange={(e) => setAnnouncementBanner(e.target.value)}
            placeholder="e.g. Special Offer: 50% discount on Premium Plan this week!"
          />
        </div>
      </div>

      {/* 3. Subscription Tiers & Limits */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Crown className="size-5 text-indigo-500" />
          <div>
            <h3 className="font-semibold text-foreground">Subscription Tiers & QR Limits</h3>
            <p className="text-xs text-muted-foreground">Control limits and default tiers for users.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="set-default-plan" className="text-xs font-semibold">Default Plan on Signup</Label>
            <select
              id="set-default-plan"
              value={defaultPlan}
              onChange={(e) => setDefaultPlan(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="free">Free Tier</option>
              <option value="lite">Lite Tier</option>
              <option value="premium">Premium Tier</option>
            </select>
          </div>
          <div>
            <Label htmlFor="set-free-limit" className="text-xs font-semibold">Free Tier QR Limit</Label>
            <Input
              id="set-free-limit"
              type="number"
              className="mt-1.5 rounded-xl border-border bg-background/50"
              value={freeTierLimit}
              onChange={(e) => setFreeTierLimit(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="set-lite-limit" className="text-xs font-semibold">Lite Tier QR Limit</Label>
            <Input
              id="set-lite-limit"
              type="number"
              className="mt-1.5 rounded-xl border-border bg-background/50"
              value={liteTierLimit}
              onChange={(e) => setLiteTierLimit(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="set-premium-limit" className="text-xs font-semibold">Premium QR Limit</Label>
            <Input
              id="set-premium-limit"
              type="number"
              className="mt-1.5 rounded-xl border-border bg-background/50"
              value={premiumTierLimit}
              onChange={(e) => setPremiumTierLimit(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 4. Security & Operation Controls */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <ShieldAlert className="size-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-foreground">Platform Security & Switches</h3>
            <p className="text-xs text-muted-foreground">Emergency toggles and operational platform state.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-background/40">
            <div>
              <p className="text-xs font-semibold text-foreground">Maintenance Mode</p>
              <p className="text-[11px] text-muted-foreground">Temporarily lock site for maintenance</p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-background/40">
            <div>
              <p className="text-xs font-semibold text-foreground">Allow Registrations</p>
              <p className="text-[11px] text-muted-foreground">Allow new visitors to sign up</p>
            </div>
            <Switch
              checked={allowRegistrations}
              onCheckedChange={setAllowRegistrations}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-background/40">
            <div>
              <p className="text-xs font-semibold text-foreground">Dynamic Redirections</p>
              <p className="text-[11px] text-muted-foreground">Keep /r/ shortlinks resolving</p>
            </div>
            <Switch
              checked={enableDynamicRedirect}
              onCheckedChange={setEnableDynamicRedirect}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="rounded-2xl bg-brand-gradient px-8 font-semibold text-primary-foreground shadow-brand cursor-pointer"
        >
          {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Save All System Customizations
        </Button>
      </div>
    </div>
  );
}
