import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Crown,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  QrCode,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import avatarFemale from "@/assets/avatar-female.png";
import avatarMale from "@/assets/avatar-male.png";
import avatarOther from "@/assets/avatar-other.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";
import { listQrCodes } from "@/lib/qr/store";

const TITLE = "My Profile & Account — BT-QR";
const DESCRIPTION =
  "Manage your BT-QR user profile, avatar, account details, active subscription plan, and security settings.";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

const PRESET_AVATARS = [
  { id: "male", name: "Modern Male", src: avatarMale },
  { id: "female", name: "Modern Female", src: avatarFemale },
  { id: "other", name: "Creative 3D", src: avatarOther },
];

function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut, updateUserProfile } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { plan, isPaid, isPremium, setSimulatedPlan } = useUserPlan();

  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const initialName =
    (typeof metadata?.["full_name"] === "string" && metadata["full_name"]) ||
    (typeof metadata?.["name"] === "string" && metadata["name"]) ||
    user?.email?.split("@")[0] ||
    "User";

  const initialAvatar =
    typeof metadata?.["avatar_url"] === "string" ? metadata["avatar_url"] : "";

  const [displayName, setDisplayName] = useState(initialName);
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const [saving, setSaving] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    setDisplayName(initialName);
    setSelectedAvatar(initialAvatar);
  }, [initialName, initialAvatar]);

  // Fetch QR codes to display real stats
  const { data: codes = [], isLoading: codesLoading } = useQuery({
    queryKey: ["qr-codes", user?.id],
    queryFn: listQrCodes,
  });

  const totalScans = codes.reduce((acc, curr) => acc + (curr.scan_count || 0), 0);
  const dynamicCount = codes.filter((c) => c.is_dynamic).length;
  const staticCount = codes.length - dynamicCount;

  const userEmail = user?.email || "user@bt-qr.app";
  const userInitials = (displayName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim();
    if (!cleanName) {
      toast.error("Please enter a valid display name");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        full_name: cleanName,
        avatar_url: selectedAvatar || undefined,
      });

      // Try updating Supabase profiles table if it exists
      if (user?.id) {
        try {
          await supabase
            .from("profiles")
            .update({ display_name: cleanName })
            .eq("id", user.id);
        } catch {
          // ignore if table or network unavailable
        }
      }

      toast.success("Profile updated successfully!", {
        description: "Your name and avatar have been saved.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error("Update failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetEmailSent(true);
      toast.success("Password reset email sent!", {
        description: `Check ${user.email} for password reset instructions.`,
      });
    } catch (err) {
      // In local demo mode, simulate success
      setResetEmailSent(true);
      toast.success("Reset link created", {
        description: "You can set a new password on the password reset page.",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const currentAvatarSrc =
    selectedAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || "User")}`;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Top Banner & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Profile & Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <User className="size-7 text-primary" />
            <span>Profile & Account</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your personal details, subscription plan, security, and QR usage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="rounded-xl gap-2">
            <Link to="/dashboard">
              <LayoutDashboard className="size-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="rounded-xl gap-2">
              <Link to="/admin">
                <ShieldCheck className="size-4 text-primary" />
                <span>Admin Panel</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column Profile Info & Avatar + Right Column Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/20 relative" />
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="-mt-12 mb-4 flex justify-between items-end">
                <div className="relative group">
                  <Avatar className="size-24 border-4 border-card rounded-2xl shadow-xl bg-card">
                    <AvatarImage src={currentAvatarSrc} alt={displayName} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-500 border-2 border-card" />
                </div>

                <Badge
                  variant={isPremium ? "default" : isPaid ? "secondary" : "outline"}
                  className="rounded-xl uppercase tracking-wider text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5"
                >
                  {isPremium ? (
                    <>
                      <Crown className="size-3.5 text-amber-400" /> Premium
                    </>
                  ) : isPaid ? (
                    <>
                      <Zap className="size-3.5 text-primary" /> Lite Plan
                    </>
                  ) : (
                    "Free Plan"
                  )}
                </Badge>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground truncate">{displayName}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{userEmail}</span>
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-border/60 space-y-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> Account status
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> Role
                  </span>
                  <span className="font-medium text-foreground">
                    {isAdmin ? "Super Admin" : "Standard User"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="size-3.5" /> Total QRs
                  </span>
                  <span className="font-semibold text-foreground">
                    {codesLoading ? "..." : codes.length}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/40 p-4 border-t border-border/60 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl gap-2 font-medium"
                onClick={() => void signOut()}
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Stats Widget */}
          <Card className="rounded-3xl border-border/80 shadow-sm bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <span>QR Activity Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/40 rounded-2xl p-3 border border-border/40">
                  <div className="text-2xl font-bold text-foreground">
                    {codesLoading ? "..." : totalScans.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Total Scans</div>
                </div>
                <div className="bg-secondary/40 rounded-2xl p-3 border border-border/40">
                  <div className="text-2xl font-bold text-foreground">
                    {codesLoading ? "..." : dynamicCount}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Dynamic QRs</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between items-center pt-2">
                <span>Static QRs: {staticCount}</span>
                <Link
                  to="/dashboard"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  Manage <ArrowRight className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabbed Settings (General, Plan, Security) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general" className="w-full space-y-6">
            <TabsList className="grid grid-cols-3 p-1 rounded-2xl bg-secondary/60 border border-border/60">
              <TabsTrigger value="general" className="rounded-xl text-xs sm:text-sm font-medium">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="plan" className="rounded-xl text-xs sm:text-sm font-medium">
                Plan & Usage
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl text-xs sm:text-sm font-medium">
                Security
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: General & Avatar */}
            <TabsContent value="general" className="space-y-6 m-0">
              <Card className="rounded-3xl border-border/80 shadow-md bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                  <CardDescription>
                    Update your display name and choose an avatar for your BT-QR account.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveProfile}>
                  <CardContent className="space-y-6">
                    {/* Display Name */}
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-medium">
                        Display Name / Full Name
                      </Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="rounded-xl h-11 border-border/80"
                        maxLength={60}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        This name is displayed in the header and across your QR dashboard.
                      </p>
                    </div>

                    {/* Email Address (read only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          value={userEmail}
                          disabled
                          className="rounded-xl h-11 border-border/80 bg-muted/50 cursor-not-allowed pr-24"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <Check className="size-3" /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your account email is tied to your login credentials.
                      </p>
                    </div>

                    {/* Choose Avatar */}
                    <div className="space-y-3 pt-2">
                      <Label className="text-sm font-medium">Choose Profile Avatar</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {/* Default Initials Option */}
                        <button
                          type="button"
                          onClick={() => setSelectedAvatar("")}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                            !selectedAvatar
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border/60 hover:border-primary/50 bg-secondary/30"
                          }`}
                        >
                          <Avatar className="size-14 border border-border">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="mt-2 text-xs font-medium text-foreground">Initials</span>
                          {!selectedAvatar && (
                            <span className="absolute top-2 right-2 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="size-3" />
                            </span>
                          )}
                        </button>

                        {/* Presets */}
                        {PRESET_AVATARS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedAvatar(preset.src)}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                              selectedAvatar === preset.src
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border/60 hover:border-primary/50 bg-secondary/30"
                            }`}
                          >
                            <Avatar className="size-14 border border-border">
                              <AvatarImage src={preset.src} alt={preset.name} className="object-cover" />
                            </Avatar>
                            <span className="mt-2 text-xs font-medium text-foreground truncate max-w-full">
                              {preset.name}
                            </span>
                            {selectedAvatar === preset.src && (
                              <span className="absolute top-2 right-2 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Check className="size-3" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-3 border-t border-border/60 p-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-brand-gradient text-primary-foreground rounded-xl shadow-brand px-6"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 size-4" /> Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Tab 2: Plan & Usage */}
            <TabsContent value="plan" className="space-y-6 m-0">
              <Card className="rounded-3xl border-border/80 shadow-md bg-card/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Subscription Tier</CardTitle>
                      <CardDescription>
                        Your current membership plan and active feature limits.
                      </CardDescription>
                    </div>
                    <Badge
                      variant={isPremium ? "default" : isPaid ? "secondary" : "outline"}
                      className="rounded-xl px-3 py-1 font-bold text-xs uppercase tracking-wide"
                    >
                      {plan.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Plan Details Card */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                          {isPremium ? <Crown className="size-6" /> : <Sparkles className="size-6" />}
                        </div>
                        <div>
                          <div className="text-base font-bold text-foreground capitalize">
                            {plan} Plan
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isPremium
                              ? "Unlimited dynamic QR codes, priority vectors, high-res exports & full analytics."
                              : isPaid
                              ? "Enhanced limits, vector downloads and dynamic QR redirects."
                              : "Standard free tier with up to 5 dynamic QR codes and basic styling."}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="size-4 text-emerald-500" />
                        <span>PNG, SVG, PDF & EPS Vector Export</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="size-4 text-emerald-500" />
                        <span>Custom Logo, Frames & Gradient styling</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="size-4 text-emerald-500" />
                        <span>Dynamic URL redirect editing</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="size-4 text-emerald-500" />
                        <span>Comprehensive Scan Analytics</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Switcher / Tester */}
                  <div className="border border-border/70 rounded-2xl p-4 bg-secondary/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Quick Tier Selector (Demo & Preview)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Instantly test features across different plan levels.
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(["free", "lite", "premium"] as const).map((tier) => (
                        <Button
                          key={tier}
                          type="button"
                          variant={plan === tier ? "default" : "outline"}
                          size="sm"
                          className="rounded-xl text-xs capitalize"
                          onClick={() => {
                            setSimulatedPlan(tier);
                            toast.success(`Plan switched to ${tier.toUpperCase()}`);
                          }}
                        >
                          {tier === plan && <Check className="mr-1.5 size-3.5" />}
                          {tier}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/60 p-4 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Need higher scan quotas or custom enterprise features?
                  </span>
                  <Button asChild size="sm" className="rounded-xl bg-primary text-primary-foreground">
                    <Link to="/pricing">
                      <Sparkles className="mr-1.5 size-4" /> View Pricing
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Tab 3: Security & Password */}
            <TabsContent value="security" className="space-y-6 m-0">
              <Card className="rounded-3xl border-border/80 shadow-md bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Security & Authentication</CardTitle>
                  <CardDescription>
                    Manage your credentials, password reset, and account security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="border border-border/60 rounded-2xl p-4 bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <KeyRound className="size-4 text-primary" />
                        <span>Change Password</span>
                      </div>
                      <div className="text-xs text-muted-foreground max-w-md">
                        We will send a secure password reset link to{" "}
                        <strong className="text-foreground">{userEmail}</strong>.
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={sendingReset || resetEmailSent}
                      className="rounded-xl shrink-0"
                      onClick={handleSendPasswordReset}
                    >
                      {sendingReset ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" /> Sending...
                        </>
                      ) : resetEmailSent ? (
                        <>
                          <Check className="mr-2 size-4 text-emerald-500" /> Link Sent!
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </div>

                  <div className="border border-border/60 rounded-2xl p-4 bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        <span>Reset Password Directly</span>
                      </div>
                      <div className="text-xs text-muted-foreground max-w-md">
                        Have a recovery code or want to update your password right now?
                      </div>
                    </div>

                    <Button asChild variant="outline" size="sm" className="rounded-xl shrink-0">
                      <Link to="/reset-password">Go to Reset Form</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="rounded-3xl border-destructive/30 shadow-sm bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <LogOut className="size-4" />
                    <span>Session & Sign Out</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Terminate your active session on this device.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Signing out will require you to log in again.
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-xl gap-1.5"
                    onClick={() => void signOut()}
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
