import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  ChevronDown,
  Columns3,
  CreditCard,
  Headphones,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Plus,
  PlusCircle,
  QrCode,
  ScanLine,
  ShieldCheck,
  X,
  User,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import logoAsset from "@/assets/bt-qr-logo.png";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useUserPlan } from "@/hooks/useUserPlan";

const ABOUT_ITEMS = [
  { to: "/types", label: "QR Code Types", hint: "17+ formats ready to generate" },
  { to: "/convert", label: "File to Link", hint: "Upload PDF, audio & video up to 500 MB" },
  { to: "/compare", label: "Compare Features", hint: "See how BT-QR beats competitors" },
] as const;

const INDUSTRY_ITEMS = [
  { to: "/types" as const, search: { type: "url" }, label: "Restaurants & Menus", badge: "Popular" },
  { to: "/types" as const, search: { type: "url" }, label: "Retail & E-Commerce", badge: "Sales" },
  { to: "/types" as const, search: { type: "location" }, label: "Real Estate & Housing", badge: "Geo" },
  { to: "/types" as const, search: { type: "event" }, label: "Events & Ticketing", badge: "Passes" },
  { to: "/types" as const, search: { type: "pdf" }, label: "Education & Campus", badge: "Docs" },
  { to: "/types" as const, search: { type: "vcard" }, label: "Healthcare & Clinics", badge: "Contact" },
] as const;

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { plan } = useUserPlan();
  const [open, setOpen] = useState(false);

  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const userName =
    (typeof metadata?.["full_name"] === "string" && metadata["full_name"]) ||
    (typeof metadata?.["name"] === "string" && metadata["name"]) ||
    user?.email?.split("@")[0] ||
    "User";
  const userAvatar = typeof metadata?.["avatar_url"] === "string" ? metadata["avatar_url"] : "";
  const userInitials = (userName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Mobile accordion state
  const [aboutOpen, setAboutOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg">
      <div className="flex h-20 w-full items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        {/* Left Area: 3-line Menu Button + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Menu on the LEFT (Opens Slide-out Drawer) - Mobile Only */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-9 rounded-xl border border-border/60 bg-card/60 transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="flex w-80 max-w-[85vw] flex-col p-0 bg-card border-r border-border shadow-2xl">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border/70 p-4">
                <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <img
                    src={logoAsset}
                    alt="BT-QR logo"
                    className="size-8 rounded-xl bg-white object-contain p-0.5 shadow-sm ring-1 ring-border"
                  />
                  <span className="font-display font-bold text-lg text-foreground">BT-QR</span>
                </Link>
              </div>

              {/* Drawer Menu List Matching User Reference Image */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
                {/* 1. Create QR Code */}
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <PlusCircle className="size-5 text-primary" />
                  <span>Create QR Code</span>
                </Link>

                {/* 2. About BT-QR (Collapsible) */}
                <Collapsible open={aboutOpen} onOpenChange={setAboutOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                    <span className="flex items-center gap-3.5">
                      <QrCode className="size-5 text-muted-foreground" />
                      <span>About BT-QR</span>
                    </span>
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-11 pr-2 py-1 space-y-1">
                    {ABOUT_ITEMS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* 3. QR Scanner */}
                <Link
                  to="/scanner"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <ScanLine className="size-5 text-muted-foreground" />
                  <span>QR Scanner</span>
                </Link>

                {/* 4. Pricing */}
                <Link
                  to="/pricing"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <CreditCard className="size-5 text-muted-foreground" />
                  <span>Pricing</span>
                </Link>

                {/* 5. Compare */}
                <Link
                  to="/compare"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Columns3 className="size-5 text-muted-foreground" />
                  <span>Compare</span>
                </Link>

                {/* 6. Industries (Collapsible) */}
                <Collapsible open={industriesOpen} onOpenChange={setIndustriesOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                    <span className="flex items-center gap-3.5">
                      <Briefcase className="size-5 text-muted-foreground" />
                      <span>Industries</span>
                    </span>
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${industriesOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-11 pr-2 py-1 space-y-1">
                    {INDUSTRY_ITEMS.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        search={item.search}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <span>{item.label}</span>
                        <span className="rounded bg-primary/10 px-1 text-[9px] font-semibold text-primary">
                          {item.badge}
                        </span>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* 7. Support */}
                <Link
                  to="/support"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Headphones className="size-5 text-muted-foreground" />
                  <span>Support</span>
                </Link>

                {/* 8. Profile */}
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <User className="size-5 text-muted-foreground" />
                  <span>Profile</span>
                </Link>

                {/* Login / Profile / Dashboard */}
                {user ? (
                  <div className="space-y-2 pt-2 border-t border-border/70">
                    {/* User Profile Card */}
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-2.5 border border-border/60 hover:bg-secondary transition-colors"
                    >
                      <Avatar className="size-10 border border-border">
                        {userAvatar ? (
                          <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-foreground truncate">{userName}</span>
                          <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 h-4 font-semibold">
                            {plan}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate block">{user.email}</span>
                      </div>
                    </Link>

                    {/* Profile Link */}
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <User className="size-5 text-primary" />
                      <span>My Profile & Account</span>
                    </Link>

                    {/* Dashboard Link */}
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <LayoutDashboard className="size-5 text-primary" />
                      <span>Dashboard (My QRs)</span>
                    </Link>

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        <ShieldCheck className="size-5 text-primary" />
                        <span>Admin Panel</span>
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        void signOut();
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="size-5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    <LogIn className="size-5" />
                    <span>Log in</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 transition-transform hover:opacity-90">
            <img
              src={logoAsset}
              alt="BT-QR logo"
              className="size-8 sm:size-9 rounded-xl bg-white object-contain p-0.5 shadow-sm ring-1 ring-border"
            />
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
              BT-QR
            </span>
          </Link>
        </div>

        {/* Center Desktop Quick Links (For widescreen desktop viewports) */}
        <nav className="hidden items-center gap-1 lg:flex xl:flex">
          {/* About BT-QR Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none data-[state=open]:bg-secondary data-[state=open]:text-foreground">
              <QrCode className="size-4" />
              <span>About BT-QR</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-2xl border-border bg-card/95 p-2 backdrop-blur-md shadow-brand">
              {ABOUT_ITEMS.map((item) => (
                <DropdownMenuItem key={item.to} asChild className="rounded-xl p-2.5 cursor-pointer">
                  <Link to={item.to} className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/scanner"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-foreground bg-secondary font-semibold" }}
          >
            <ScanLine className="size-4" />
            <span>Scanner</span>
          </Link>

          <Link
            to="/pricing"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-foreground bg-secondary font-semibold" }}
          >
            <CreditCard className="size-4" />
            <span>Pricing</span>
          </Link>

          <Link
            to="/compare"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-foreground bg-secondary font-semibold" }}
          >
            <Columns3 className="size-4" />
            <span>Compare</span>
          </Link>

          {/* Industries Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none data-[state=open]:bg-secondary data-[state=open]:text-foreground">
              <Briefcase className="size-4" />
              <span>Industries</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl border-border bg-card/95 p-2 backdrop-blur-md shadow-brand">
              {INDUSTRY_ITEMS.map((item) => (
                <DropdownMenuItem key={item.label} asChild className="rounded-xl px-3 py-2 cursor-pointer">
                  <Link to={item.to} search={item.search} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/support"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-foreground bg-secondary font-semibold" }}
          >
            <Headphones className="size-4" />
            <span>Support</span>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-foreground bg-secondary font-semibold" }}
          >
            <User className="size-4" />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Right Action Area (Responsive on all devices) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User / Login */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isAdmin ? (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex h-9 rounded-xl">
                  <Link to="/admin">
                    <ShieldCheck className="mr-1.5 size-4 text-primary" /> Admin
                  </Link>
                </Button>
              ) : null}

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 h-9 rounded-xl border border-border/70 bg-card/70 px-2 hover:bg-secondary transition-colors"
                  >
                    <Avatar className="size-6 border border-border/80">
                      {userAvatar ? (
                        <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block max-w-[85px] truncate text-xs font-semibold text-foreground">
                      {userName}
                    </span>
                    <ChevronDown className="size-3 text-muted-foreground opacity-60" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border bg-card/95 p-1.5 backdrop-blur-md shadow-brand">
                  <DropdownMenuLabel className="font-normal px-2.5 py-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate">{userName}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold px-1.5 py-0 h-4">
                          {plan}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 border-border/60" />
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 cursor-pointer">
                    <Link to="/profile" className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <User className="size-4 text-primary" />
                      <span>My Profile & Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 cursor-pointer">
                    <Link to="/dashboard" className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <LayoutDashboard className="size-4 text-primary" />
                      <span>Dashboard (My QRs)</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <ShieldCheck className="size-4 text-primary" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 cursor-pointer">
                    <Link to="/pricing" className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Sparkles className="size-4 text-amber-500" />
                      <span>Subscription Plan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-border/60" />
                  <DropdownMenuItem
                    onClick={() => void signOut()}
                    className="rounded-xl px-2.5 py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 text-xs font-medium"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl px-3 text-xs sm:text-sm">
                <Link to="/auth">
                  <LogIn className="size-3.5 sm:size-4 text-primary" />
                  <span>Log in</span>
                </Link>
              </Button>

              {/* Create QR Code Primary Button */}
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex h-9 rounded-xl bg-brand-gradient px-3.5 sm:px-4 font-semibold text-primary-foreground shadow-brand hover:opacity-95"
              >
                <Link to="/">
                  <Plus className="mr-1 size-4" /> Create QR
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
