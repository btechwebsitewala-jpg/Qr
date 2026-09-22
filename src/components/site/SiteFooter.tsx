import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  CheckCircle2,
  Globe,
  Heart,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import logoAsset from "@/assets/bt-qr-logo.png";
import { Button } from "@/components/ui/button";

const QR_TYPE_LINKS: { to: "/types"; search: { type?: string }; label: string }[] = [
  { to: "/types", search: { type: "url" }, label: "Website URL" },
  { to: "/types", search: { type: "wifi" }, label: "WiFi Password" },
  { to: "/types", search: { type: "vcard" }, label: "vCard Digital Contact" },
  { to: "/types", search: { type: "whatsapp" }, label: "WhatsApp Direct Chat" },
  { to: "/types", search: { type: "pdf" }, label: "PDF & Documents" },
  { to: "/types", search: { type: "social" }, label: "Social Media Hub" },
  { to: "/types", search: {}, label: "Explore all 17+ Types →" },
];

const FEATURE_LINKS = [
  { to: "/", label: "QR Code Generator" },
  { to: "/scanner", label: "Web QR Scanner" },
  { to: "/convert", label: "File to Link (500 MB)" },
  { to: "/compare", label: "Static vs Dynamic Codes" },
  { to: "/pricing", label: "Vector Exports (SVG/PDF)" },
  { to: "/dashboard", label: "Live Scan Analytics" },
] as const;

const INDUSTRY_LINKS = [
  { to: "/types?type=url", label: "Restaurants & Menus" },
  { to: "/types?type=url", label: "Retail & E-Commerce" },
  { to: "/types?type=location", label: "Real Estate & Maps" },
  { to: "/types?type=event", label: "Events & Ticketing" },
  { to: "/types?type=pdf", label: "Education & Campus" },
  { to: "/types?type=vcard", label: "Healthcare & Clinics" },
] as const;

const COMPANY_LINKS = [
  { to: "/pricing", label: "Pricing in INR (₹)" },
  { to: "/compare", label: "Feature Comparison" },
  { to: "/support", label: "Support & FAQs" },
  { to: "/auth", label: "Login / Sign up" },
  { to: "/dashboard", label: "Workspace Dashboard" },
] as const;

export function SiteFooter() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-24 border-t-2 border-primary/20 bg-card/90 backdrop-blur-xl">
      {/* Top Value Strip */}
      <div className="border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-8 text-sm sm:text-base text-muted-foreground font-semibold">
            <span className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="size-5 text-primary" /> 100% Watermark-Free
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Zap className="size-5 text-primary" /> Instant Vector Downloads
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Sparkles className="size-5 text-primary" /> 3D Avatar Standee Mode
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Globe className="size-5 text-primary" /> UPI &amp; RuPay Supported
            </span>
          </div>

          <Button
            variant="ghost"
            size="lg"
            onClick={scrollToTop}
            className="gap-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-primary/10"
          >
            <span>Back to top</span>
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Footer Links Matrix */}
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-5 sm:grid-cols-2">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoAsset}
              alt="BT-QR logo"
              className="size-12 rounded-2xl bg-white object-contain p-1 shadow-lg ring-2 ring-primary/20"
            />
            <span className="font-display text-2xl font-black tracking-tight text-foreground">
              BT-QR
            </span>
          </Link>

          <p className="max-w-sm text-base text-muted-foreground leading-relaxed">
            The next-generation smart QR code platform. Generate, customize, and track commercial-grade QR codes with vector printing, full-body 3D character avatars, and live scan analytics.
          </p>

          <div className="pt-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Customer Support
            </h4>
            <a
              href="mailto:support.btqrcodegenerate@gmail.com"
              className="mt-3 inline-flex items-center gap-2 text-base font-bold text-primary hover:underline"
            >
              <Mail className="size-5" />
              <span>support.btqrcodegenerate@gmail.com</span>
            </a>
            <p className="mt-2 text-sm text-muted-foreground">
              Response within 24 hours · Monday to Saturday
            </p>
          </div>
        </div>

        {/* QR Types */}
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Popular QR Types</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {QR_TYPE_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  search={item.search}
                  className="font-medium transition-colors hover:text-primary hover:underline decoration-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Features & Tools */}
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Features &amp; Tools</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {FEATURE_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="font-medium transition-colors hover:text-primary hover:underline decoration-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Industries & Pricing */}
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Solutions &amp; Pricing</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {COMPANY_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="font-medium transition-colors hover:text-primary hover:underline decoration-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Trust Bar */}
      <div className="border-t-2 border-primary/10 py-8 bg-background/95">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} BT-QR Platform. Built with</span>
            <Heart className="size-4 text-rose-500 fill-rose-500" />
            <span>for creators &amp; businesses worldwide.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <Link to="/support" className="hover:text-foreground hover:underline decoration-2">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-foreground hover:underline decoration-2">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-foreground hover:underline decoration-2">
              Help Center
            </Link>
            <span>•</span>
            <Link to="/pricing" className="hover:text-foreground hover:underline decoration-2">
              GST Invoicing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
