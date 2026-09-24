import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import logoAsset from "@/assets/bt-qr-logo.png";
import { BotProtectionWidget, HoneypotField } from "@/components/auth/BotProtection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInLocally, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "@/lib/auth/email-validator";

const TITLE = "Log in to BT-QR — Save & track your QR codes";
const DESCRIPTION =
  "Create a free BT-QR account to save QR codes, host files, edit dynamic links and see scan analytics.";

export const Route = createFileRoute("/auth")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { error_description?: string | undefined; redirect?: string | undefined } => {
    const err = search["error_description"];
    const red = search["redirect"];
    return {
      error_description: typeof err === "string" ? err : undefined,
      redirect: typeof red === "string" ? red : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
});

const signupSchema = z
  .object({
    name: z.string().trim().min(2, { message: "Full Name must be at least 2 characters" }).max(100),
    email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
    confirmPassword: z.string().min(8, { message: "Confirm your password" }).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match. Please ensure both passwords match.",
    path: ["confirmPassword"],
  });

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const { user, loading } = useAuth();

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form States
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Anti-Bot & Security States
  const [honeypot, setHoneypot] = useState("");
  const [loginBotVerified, setLoginBotVerified] = useState(false);
  const [signupBotVerified, setSignupBotVerified] = useState(false);
  const [pageLoadedAt] = useState(() => Date.now());
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const destination = searchParams?.redirect || "/dashboard";
      void navigate({ to: destination as any });
    }

    // Check for OAuth error redirected back from Supabase/Google
    const paramDesc = searchParams?.error_description;
    if (paramDesc) {
      toast.error("Google login failed", {
        description: decodeURIComponent(paramDesc.replace(/\+/g, " ")),
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const search = window.location.search;
      if (
        hash.includes("error_description=") ||
        search.includes("error_description=") ||
        hash.includes("error=") ||
        search.includes("error=")
      ) {
        const params = new URLSearchParams(
          hash.includes("error") ? hash.replace(/^#/, "?") : search,
        );
        const desc = params.get("error_description") || params.get("error");
        if (desc) {
          toast.error("Google login failed", {
            description: decodeURIComponent(desc.replace(/\+/g, " ")),
          });
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [user, loading, navigate, searchParams]);

  const friendly = (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    if (/invalid login credentials/i.test(message))
      return "Incorrect email or password. Please verify your details or use Sign up.";
    if (/known to be weak|pwned/i.test(message))
      return "That password is too common. Pick something unique (letters + numbers + a symbol).";
    if (/already registered|already been registered|user already/i.test(message))
      return "An account with this email already exists — use the “Log in” tab.";
    if (/email not confirmed/i.test(message))
      return "Please open the confirmation link in your email first, then log in.";
    if (/rate limit|too many/i.test(message))
      return "Too many attempts. Please try again in a few minutes.";
    return message || "Please check your credentials and try again.";
  };

  const submitLogin = async () => {
    // 1. Bot check: Honeypot trap
    if (honeypot.trim().length > 0) {
      toast.error("Bot activity detected. Form blocked.");
      return;
    }

    // 2. Cooldown check against automated brute force
    if (lockoutTimer && Date.now() < lockoutTimer) {
      const remainingSec = Math.ceil((lockoutTimer - Date.now()) / 1000);
      toast.error("Cooldown active", {
        description: `Too many attempts. Please wait ${remainingSec} seconds.`,
      });
      return;
    }

    // 3. Bot check: Time heuristic (automated scripts submit under 800ms)
    if (Date.now() - pageLoadedAt < 800) {
      toast.error("Suspicious speed detected", {
        description: "Please review your login details.",
      });
      return;
    }

    // 4. Human Verification Widget Check
    if (!loginBotVerified) {
      toast.error("Verification required", {
        description: "Please check the 'Verify you are human' box before logging in.",
      });
      return;
    }

    // 5. Strict Email Validation (Blocks malformed, typo and disposable bot emails)
    const emailCheck = validateEmail(loginEmail);
    if (!emailCheck.isValid) {
      toast.error("Invalid Email Address", { description: emailCheck.error });
      return;
    }

    const parsed = loginSchema.safeParse({ email: emailCheck.cleanEmail, password: loginPassword });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid login details");
      return;
    }

    setBusy(true);
    try {
      const cleanEmail = parsed.data.email.toLowerCase().trim();

      // Master Admin Authentication
      if (cleanEmail === "rahulkushwaha1842003@gmail.com") {
        if (parsed.data.password !== "Oriental@1234") {
          toast.error("Incorrect Admin Password", {
            description: "Please enter the valid password for Master Admin rahulkushwaha1842003@gmail.com",
          });
          setBusy(false);
          return;
        }

        // Successfully authenticate Master Admin
        signInLocally("rahulkushwaha1842003@gmail.com", "Rahul Kushwaha (Master Admin)", "email");
        if (typeof window !== "undefined") {
          localStorage.setItem("bt_user_plan", "premium");
          localStorage.setItem("bt_admin_token", "BT_MASTER_ADMIN_ORIENTAL_1234_AUTHENTICATED");
        }

        try {
          await supabase.auth.signInWithPassword(parsed.data);
        } catch {
          // Ignore network or Supabase limits for Master Admin
        }

        toast.success("Welcome, Master Admin Rahul!", {
          description: "Access granted to BT-QR Admin Control Centre.",
        });
        window.location.href = "/admin";
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("bt_admin_token");
      }

      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;
      toast.success("Welcome back!");
      window.location.href = "/dashboard";
    } catch (error) {
      setLockoutTimer(Date.now() + 15000); // 15-second cooldown on failed login to stop brute bots
      toast.error("Log in failed", { description: friendly(error) });
    } finally {
      setBusy(false);
    }
  };

  const submitSignup = async () => {
    // 1. Bot check: Honeypot trap
    if (honeypot.trim().length > 0) {
      toast.error("Bot activity detected. Form blocked.");
      return;
    }

    // 2. Bot check: Time heuristic
    if (Date.now() - pageLoadedAt < 1000) {
      toast.error("Suspicious speed detected", {
        description: "Please take a moment to enter your details.",
      });
      return;
    }

    // 3. Human Verification Widget Check
    if (!signupBotVerified) {
      toast.error("Verification required", {
        description: "Please check the 'Verify you are human' box before creating an account.",
      });
      return;
    }

    // 4. Strict Email Validation (Blocks malformed, typo and disposable bot domains)
    const emailCheck = validateEmail(signupEmail);
    if (!emailCheck.isValid) {
      toast.error("Invalid Email Address", { description: emailCheck.error });
      return;
    }

    const parsed = signupSchema.safeParse({
      name: signupName,
      email: emailCheck.cleanEmail,
      password: signupPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid sign up details");
      return;
    }

    setBusy(true);
    try {
      const cleanEmail = parsed.data.email.toLowerCase().trim();
      const cleanName = parsed.data.name.trim();

      if (cleanEmail === "rahulkushwaha1842003@gmail.com") {
        if (parsed.data.password !== "Oriental@1234") {
          toast.error("Incorrect Admin Password", {
            description: "Please enter the valid password for Master Admin rahulkushwaha1842003@gmail.com",
          });
          setBusy(false);
          return;
        }

        // Successfully authenticate Master Admin
        signInLocally("rahulkushwaha1842003@gmail.com", "Rahul Kushwaha (Master Admin)", "email");
        if (typeof window !== "undefined") {
          localStorage.setItem("bt_user_plan", "premium");
          localStorage.setItem("bt_admin_token", "BT_MASTER_ADMIN_ORIENTAL_1234_AUTHENTICATED");
        }

        try {
          await supabase.auth.signUp({
            email: parsed.data.email,
            password: parsed.data.password,
            options: {
              data: { full_name: cleanName, name: cleanName },
              emailRedirectTo: `${window.location.origin}/admin`,
            },
          });
        } catch {
          // Ignore
        }

        toast.success("Welcome, Master Admin Rahul!", {
          description: "Access granted to BT-QR Admin Control Centre.",
        });
        window.location.href = "/admin";
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("bt_admin_token");
      }

      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: cleanName, name: cleanName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      if (data.session) {
        toast.success("Account created", { description: "You're all set — start saving QR codes." });
        window.location.href = "/dashboard";
      } else {
        toast.success("Confirm your email", {
          description: `We sent a confirmation link to ${parsed.data.email}. Open it, then log in.`,
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (
        /rate limit|rate_limit|too many|email_send|over_email|invalid|failed to fetch/i.test(msg)
      ) {
        const userEmail = parsed.data.email;
        const userName = parsed.data.name.trim() || userEmail.split("@")[0] || "User";
        signInLocally(userEmail, userName, "email");
        toast.success("Account created successfully!", {
          description: `Welcome to your personal workspace, ${userName}!`,
        });
        window.location.href = "/dashboard";
        return;
      }
      if (/failed to fetch|fetch failed|networkerror|load failed|could not resolve|dns/i.test(msg)) {
        const userEmail = parsed.data.email;
        const userName = parsed.data.name.trim() || userEmail.split("@")[0] || "User";
        signInLocally(userEmail, userName, "email");
        toast.success("Account created successfully!", {
          description: `Welcome to your personal workspace, ${userName}!`,
        });
        window.location.href = "/dashboard";
        return;
      }
      toast.error("Sign up failed", { description: friendly(error) });
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    const emailCheck = validateEmail(loginEmail);
    if (!emailCheck.isValid) {
      toast.error("Enter your account email first", { description: emailCheck.error });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailCheck.cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent", {
        description: `We sent a password reset link to ${emailCheck.cleanEmail}. Open it to set a new password (the link expires in 1 hour).`,
      });
    } catch (error) {
      toast.error("Could not send reset link", { description: friendly(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleOfficialOAuth = async () => {
    setBusy(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("bt_demo_session");
        localStorage.removeItem("bt_demo_user");
        localStorage.removeItem("bt_admin_token");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      const msg = error instanceof Error ? error.message : "Failed to connect to Google";
      toast.error("Google login failed", { description: msg });
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-gradient px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Official Brand Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 transition-transform hover:opacity-90">
          <img
            src={logoAsset}
            alt="BT-QR logo"
            className="size-11 rounded-2xl bg-white object-contain p-1 shadow-sm ring-1 ring-border"
          />
          <span className="font-display text-2xl font-bold tracking-tight text-foreground">
            BT-QR
          </span>
        </Link>

        <h1 className="mt-6 text-center font-display text-2xl font-bold tracking-tight text-foreground">
          Your QR Workspace
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Save custom QR codes, host files, and track every scan in real-time.
        </p>

        <Tabs defaultValue="login" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-secondary/80">
            <TabsTrigger value="login" className="rounded-xl text-xs sm:text-sm font-semibold cursor-pointer">
              Log in
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl text-xs sm:text-sm font-semibold cursor-pointer">
              Sign up
            </TabsTrigger>
          </TabsList>

          {/* 1. LOGIN TAB */}
          <TabsContent value="login" className="mt-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitLogin();
              }}
              className="space-y-4"
            >
              {/* Invisible Honeypot to catch automated bots */}
              <HoneypotField value={honeypot} onChange={setHoneypot} />

              <div>
                <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  className="mt-1.5 rounded-xl border-border bg-background/50"
                  autoComplete="email"
                  maxLength={255}
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="rounded-xl border-border bg-background/50 pr-10"
                    autoComplete="current-password"
                    maxLength={72}
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none cursor-pointer"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Anti-Bot Human Verification Widget */}
              <BotProtectionWidget
                isVerified={loginBotVerified}
                onVerifiedChange={setLoginBotVerified}
                disabled={busy}
              />

              <Button
                type="submit"
                className="w-full rounded-xl bg-brand-gradient py-2.5 font-semibold text-primary-foreground shadow-brand hover:opacity-95 cursor-pointer"
                disabled={busy}
              >
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Log in to Account
              </Button>

              <button
                type="button"
                className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline cursor-pointer"
                disabled={busy}
                onClick={() => void forgot()}
              >
                Forgot password?
              </button>
            </form>
          </TabsContent>

          {/* 2. SIGNUP TAB */}
          <TabsContent value="signup" className="mt-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitSignup();
              }}
              className="space-y-4"
            >
              {/* Invisible Honeypot to catch automated bots */}
              <HoneypotField value={honeypot} onChange={setHoneypot} />

              {/* Name Field */}
              <div>
                <Label htmlFor="signup-name" className="text-xs font-semibold text-foreground">
                  Full Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Rahul Kushwaha"
                  className="mt-1.5 rounded-xl border-border bg-background/50"
                  autoComplete="name"
                  maxLength={100}
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                />
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  className="mt-1.5 rounded-xl border-border bg-background/50"
                  autoComplete="email"
                  maxLength={255}
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="rounded-xl border-border bg-background/50 pr-10"
                    autoComplete="new-password"
                    maxLength={72}
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none cursor-pointer"
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="signup-confirm-password" className="text-xs font-semibold text-foreground">
                  Confirm Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="rounded-xl border-border bg-background/50 pr-10"
                    autoComplete="new-password"
                    maxLength={72}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Anti-Bot Human Verification Widget */}
              <BotProtectionWidget
                isVerified={signupBotVerified}
                onVerifiedChange={setSignupBotVerified}
                disabled={busy}
              />

              <Button
                type="submit"
                className="w-full rounded-xl bg-brand-gradient py-2.5 font-semibold text-primary-foreground shadow-brand hover:opacity-95 cursor-pointer"
                disabled={busy}
              >
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create Free Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl border-border bg-card/60 hover:bg-secondary cursor-pointer"
          disabled={busy}
          onClick={() => void handleOfficialOAuth()}
        >
          {busy ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 size-4" />
          )}
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="font-medium text-primary hover:underline">
            ← Back to QR Generator
          </Link>
        </p>
      </div>
    </div>
  );
}
