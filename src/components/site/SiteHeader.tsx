import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  ChevronDown,
  Columns3,
  CreditCard,
  Globe,
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
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";

import logoAsset from "@/assets/bt-qr-logo.png";
import { ThemeToggle } from "@/components/site/ThemeToggle";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

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

const LANGUAGES = [
  { code: "en", name: "English", label: "English" },
  { code: "hi", name: "हिन्दी", label: "Hindi" },
] as const;

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);

  // Mobile accordion state
  const [aboutOpen, setAboutOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Language state
  const [selectedLang, setSelectedLang] = useState<string>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bt_language");
      if (stored) setSelectedLang(stored);
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleSelectLang = (code: string) => {
    setSelectedLang(code);
    try {
      localStorage.setItem("bt_language", code);
    } catch {
      // Storage unavailable
    }
  };

  const currentLangLabel = LANGUAGES.find((l) => l.code === selectedLang)?.name ?? "English";

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg">
      <div className="flex h-20 w-full items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        {/* Left Area: 3-line Menu Button + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 pl-4 sm:pl-6">
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

                <hr className="my-3 border-border/70" />

                {/* 8. Language Selector */}
                <Collapsible open={langOpen} onOpenChange={setLangOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                    <span className="flex items-center gap-3.5">
                      <Globe className="size-5 text-muted-foreground" />
                      <span>Language</span>
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{currentLangLabel}</span>
                      <ChevronDown className={`size-3.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-11 pr-2 py-1 space-y-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelectLang(lang.code)}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <span>{lang.name} ({lang.label})</span>
                        {selectedLang === lang.code && <Check className="size-3 text-primary" />}
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* 9. Login / Dashboard */}
                {user ? (
                  <div className="space-y-1.5 pt-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      <LayoutDashboard className="size-5 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
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
                      className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
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

              {/* Drawer Bottom Action Button */}
              <div className="p-4 border-t border-border/60">
                <Button
                  asChild
                  className="w-full bg-brand-gradient text-primary-foreground shadow-brand rounded-2xl"
                  onClick={() => setOpen(false)}
                >
                  <Link to="/">
                    <Plus className="mr-1.5 size-4" /> Create QR Code
                  </Link>
                </Button>
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
        </nav>

        {/* Right Action Area (Responsive on all devices) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector (desktop & tablet) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex h-9 gap-1.5 rounded-xl border border-border/60 bg-card/60 px-2.5 text-xs font-medium"
              >
                <Globe className="size-3.5 text-muted-foreground" />
                <span>{currentLangLabel}</span>
                <ChevronDown className="size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-2xl border-border bg-card/95 p-1.5 backdrop-blur-md shadow-brand">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code)}
                  className="flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium"
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.name}</span>
                    <span className="text-[10px] text-muted-foreground">({lang.label})</span>
                  </span>
                  {selectedLang === lang.code && <Check className="size-3 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User / Login */}
          {user ? (
            <>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex h-9 rounded-xl">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1.5 size-4" /> Dashboard
                </Link>
              </Button>
              {isAdmin ? (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex h-9 rounded-xl">
                  <Link to="/admin">
                    <ShieldCheck className="mr-1.5 size-4" /> Admin
                  </Link>
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl"
                aria-label="Sign out"
                onClick={() => void signOut()}
              >
                <LogOut className="size-4" />
              </Button>
            </>
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
