import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  Download,
  FileText,
  Globe,
  Layers,
  Lock,
  Mail,
  Palette,
  QrCode,
  RefreshCw,
  ScanLine,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import heroIllustration from "@/assets/qr-hero-illustration.jpg";
import { AvatarStage } from "@/components/qr/AvatarStage";
import { QRWizard } from "@/components/qr/QRWizard";
import { QR_TYPES, type QRTypeId } from "@/lib/qr/config";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TITLE = "BT-QR — Create & Customize QR Codes for FREE";
const DESCRIPTION =
  "Free QR code generator for links, WhatsApp, vCard, WiFi, PDF, video, location and 11 more types. Custom colours, logo, frames and PNG, SVG, PDF or EPS download.";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { type?: string | undefined; edit?: string | undefined } => ({
    type: typeof search["type"] === "string" ? search["type"] : undefined,
    edit: typeof search["edit"] === "string" ? search["edit"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STATS = [
  { label: "QRs Generated", value: "500K+", icon: QrCode },
  { label: "Content Types", value: "17+", icon: Layers },
  { label: "Vector Quality", value: "100%", icon: Download },
  { label: "Scan Reliability", value: "99.9%", icon: Zap },
];

const STEPS = [
  {
    step: "01",
    title: "Select Content Type",
    description: "Choose from 17 supported formats including URLs, vCards, WiFi, PDFs, WhatsApp, and social profiles.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Customize & Brand",
    description: "Select dot styles, corner markers, brand colors, custom frames, and upload your central logo icon.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Download & Track",
    description: "Export ultra high-res PNG, JPG, SVG, or print-ready PDF/EPS, and monitor real-time scan analytics.",
    icon: BarChart3,
  },
];

const FEATURES = [
  {
    icon: RefreshCw,
    title: "Dynamic & Editable Codes",
    text: "Update destination URLs and content anytime without needing to reprint physical posters or merchandise.",
  },
  {
    icon: Download,
    title: "Crisp Vector Exports",
    text: "Download print-ready SVG, EPS, and PDF files that scale infinitely without pixelation or quality loss.",
  },
  {
    icon: Palette,
    title: "Custom Brand Framing",
    text: "Add eye-catching call-to-action frames like 'Scan Me', embed your logo, and apply gradient styling.",
  },
  {
    icon: BarChart3,
    title: "Live Scan Analytics",
    text: "Gain insights into scan counts, top locations, operating systems, and peak scan hours.",
  },
  {
    icon: FileText,
    title: "File Hosting up to 500 MB",
    text: "Upload PDFs, menus, and videos directly to turn them into lightning-fast QR code landing links.",
  },
  {
    icon: Lock,
    title: "Privacy & Zero Watermark",
    text: "All standard QR codes are generated directly in your browser with no forced watermarks and full privacy.",
  },
];

const FAQS = [
  {
    question: "Is BT-QR really 100% free to use?",
    answer:
      "Yes! You can generate unlimited static QR codes with custom colors, templates, and high-resolution downloads completely free without any watermark or expiration.",
  },
  {
    question: "What is the difference between Static and Dynamic QR codes?",
    answer:
      "Static QR codes directly encode data (like a URL or WiFi password) and never change. Dynamic QR codes route through a short link, allowing you to update the target link anytime and track scan metrics even after printing.",
  },
  {
    question: "Can I add my business logo to the center of the QR code?",
    answer:
      "Yes! Our customizer includes an upload tool where you can insert your logo. We automatically adjust the QR code's error correction level (up to 30%) so the code scans seamlessly without camera interference.",
  },
  {
    question: "Which file formats are supported for download?",
    answer:
      "We support high-resolution PNG, JPG, SVG (Scalable Vector Graphics), PDF, and EPS formats, making it easy to use for websites, flyers, packaging, and commercial billboard printing.",
  },
  {
    question: "Do I need an account to create QR codes?",
    answer:
      "Yes. A free BT-QR account is required to generate QR codes, customize frames, download high-resolution vector files, and access our file converter and scanner tools. Registration is 100% free and takes less than 30 seconds.",
  },
];

function Index() {
  const { type, edit } = Route.useSearch();
  const initialType = QR_TYPES.some((t) => t.id === type) ? (type as QRTypeId) : "url";

  const scrollToGenerator = () => {
    const el = document.getElementById("generator-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-surface-gradient selection:bg-primary/20">
      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* Decorative background glow accents */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[45rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10" />
        <div className="pointer-events-none absolute top-96 -left-32 -z-10 h-72 w-72 rounded-full bg-chart-2/15 blur-3xl dark:bg-chart-2/10" />

        {/* Hero Section */}
        <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-8 sm:pt-20 lg:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Content Column */}
            <div className="text-center lg:col-span-7 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-primary backdrop-blur-xl shadow-sm transition-all hover:border-primary/50 hover:bg-primary/15">
                <Sparkles className="size-4 animate-pulse text-primary shrink-0" />
                <span>Free Forever • Zero Watermark • 17+ Types</span>
              </div>

              <h1 className="mt-6 font-display text-4xl font-black tracking-tight sm:text-5xl md:text-6xl xl:text-7xl leading-[1.08] text-foreground">
                Create Smart &amp; Beautiful{" "}
                <span className="bg-brand-gradient bg-clip-text text-transparent">
                  QR Codes
                </span>{" "}
                in Real Time
              </h1>

              <p className="mt-5 text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Generate high-resolution custom QR codes for websites, WhatsApp, WiFi, vCards, PDFs, and menus.
                Style with brand colors, unique frames, add your company logo, and download print-ready vector files (SVG, PDF, PNG) for free.
              </p>

              {/* Feature Highlights Pills */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold">
                {[
                  "Zero Watermark",
                  "Unlimited Scans",
                  "Vector SVG & PDF",
                  "Custom Logo & Colors",
                  "Live Analytics",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-foreground backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-primary/10"
                  >
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  className="h-14 rounded-2xl bg-brand-gradient px-8 text-base sm:text-lg font-bold text-primary-foreground shadow-brand transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  onClick={scrollToGenerator}
                >
                  <QrCode className="mr-2 size-5" />
                  Create Free QR Code
                  <ArrowRight className="ml-2 size-5" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-2xl border-2 border-primary/30 bg-card/80 px-6 text-base font-bold backdrop-blur-xl transition-all hover:bg-primary/10 hover:border-primary/50"
                >
                  <Link to="/scanner">
                    <ScanLine className="mr-2 size-5 text-primary" />
                    Scan QR Online
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-14 rounded-2xl px-5 text-base font-semibold text-muted-foreground hover:text-foreground"
                >
                  <Link to="/convert">Upload File &rarr;</Link>
                </Button>
              </div>

              {/* Social Proof Trust Bar */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="font-medium">
                  Trusted by <strong className="text-foreground">50,000+</strong> creators &amp; businesses • No credit card required
                </span>
              </div>
            </div>

            {/* Right Side Visual Showcase Column */}
            <div className="relative mx-auto w-full max-w-lg lg:col-span-5 lg:max-w-none">
              {/* Ambient Glows */}
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/30 to-chart-2/30 blur-3xl opacity-70" />

              {/* Main Illustration Card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border-2 border-primary/30 bg-card/85 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-brand">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary/10 via-background to-card">
                  <img
                    src={heroIllustration}
                    alt="Futuristic QR Code Scanner and Generator Preview"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />

                  {/* Floating Badge 1 - Top Left */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-2xl border border-white/20 bg-background/85 px-3.5 py-2 text-xs font-bold text-foreground shadow-xl backdrop-blur-md">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <Zap className="size-4" />
                    </span>
                    <div>
                      <p className="leading-tight font-display font-bold">Instant Scan</p>
                      <p className="text-[10px] font-medium text-muted-foreground">99.9% Read Accuracy</p>
                    </div>
                  </div>

                  {/* Floating Badge 2 - Bottom Right */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-background/90 px-3.5 py-2 text-xs font-bold text-foreground shadow-xl backdrop-blur-md">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-chart-2/20 text-chart-2">
                      <Download className="size-4" />
                    </span>
                    <div>
                      <p className="leading-tight font-display font-bold">Vector Quality</p>
                      <p className="text-[10px] font-medium text-muted-foreground">SVG • EPS • PDF • PNG</p>
                    </div>
                  </div>

                  {/* Floating Badge 3 - Bottom Left */}
                  <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2 rounded-2xl border border-white/20 bg-background/85 px-3 py-2 text-xs font-bold text-foreground shadow-xl backdrop-blur-md">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                    <span className="text-[11px] font-semibold">100% Free Forever</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 rounded-3xl border-2 border-primary/20 bg-card/80 p-6 sm:p-8 sm:grid-cols-4 shadow-2xl backdrop-blur-xl">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center p-3 text-center transition-transform hover:-translate-y-1">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg">
                  <stat.icon className="size-7" />
                </div>
                <div className="mt-3 font-display text-3xl font-black tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Generator Section */}
        <section id="generator-section" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                QR Code Generator Studio
              </h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                Select your content type, customize shapes and colors, and preview live.
              </p>
            </div>
            <Badge variant="secondary" className="border-2 border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              Live Preview
            </Badge>
          </div>

          <div className="rounded-2xl sm:rounded-[2rem] border-2 border-primary/20 bg-card/90 p-3.5 sm:p-6 md:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
            <QRWizard initialType={initialType} initialEditId={edit} />
          </div>
        </section>

        {/* 3D Avatar Stage Spotlight */}
        <section id="character-standee-section" className="mx-auto w-full max-w-7xl px-3 sm:px-8 py-12 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-6xl text-center mb-7 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-primary">
              <Sparkles className="size-3.5 sm:size-4 animate-pulse shrink-0" />
              <span>Signage &amp; Poster Mode</span>
              <Badge className="border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs px-2 py-0.5 font-bold ml-1">
                <Crown className="mr-1 size-3 shrink-0" /> PAID PLAN
              </Badge>
            </div>
            <h2 className="mt-4 font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              Your QR, Held by a 3D Character or Your Mascot
            </h2>
            <p className="mt-3.5 max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              Grab immediate attention at store checkouts, restaurant tables, event entrances, and social posts.
              Pick 3D characters Aarav, Mira, Bit Bot, or upload your own store mascot holding your live QR code card.
            </p>

            {/* Feature Highlights Pills */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-semibold">
              {[
                "1200x1600 High-Res Print Ready",
                "A4 & A3 Counter Standees",
                "Custom Mascot & Photo Upload",
                "5 Backdrop Themes & Custom Headings",
                "Vector PDF & PNG Export",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-foreground backdrop-blur-md"
                >
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-6xl">
            <AvatarStage value="https://bt-qr.app" />
          </div>
        </section>

        {/* 3-Step Process (How It Works) */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              Simple &amp; Fast
            </Badge>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
              How BT-QR Works in 3 Easy Steps
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Generate commercial-grade QR codes ready for online sharing or large-scale print production in seconds.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="group relative rounded-3xl border-2 border-primary/20 bg-card/90 p-8 shadow-xl transition-all hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-transform group-hover:scale-110 shadow-lg">
                    <step.icon className="size-7" />
                  </span>
                  <span className="font-display text-4xl font-black text-muted-foreground/20">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              Enterprise Grade
            </Badge>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
              Why Creators &amp; Businesses Choose BT-QR
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Engineered with modern vector standards, error tolerance algorithms, and privacy protection.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border-2 border-primary/20 bg-card/90 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg">
                  <feature.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              Help &amp; Questions
            </Badge>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Everything you need to know about generating, styling, and tracking your QR codes.
            </p>
          </div>

          <div className="mt-10 rounded-[2rem] border-2 border-primary/20 bg-card/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-primary/20">
                  <AccordionTrigger className="font-display text-lg font-bold text-foreground hover:no-underline hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="mx-auto my-16 w-full max-w-7xl px-4 sm:px-8 sm:my-20 lg:px-12">
          <div className="mx-auto max-w-5xl rounded-[2rem] border-2 border-primary/20 bg-card/90 p-10 text-center shadow-2xl backdrop-blur-xl sm:p-16">
            <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
              Need Help? We're Here for You
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Have questions or need assistance with your QR codes? Reach out to our support team.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <a 
                href="mailto:support.btqrcodegenerate@gmail.com" 
                className="inline-flex items-center gap-3 rounded-2xl bg-primary/10 px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary/20 hover:scale-105"
              >
                <Mail className="size-5" />
                support.btqrcodegenerate@gmail.com
              </a>
              <Button asChild variant="outline" size="lg">
                <Link to="/support">Visit Support Page</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bottom Call to Action Banner */}
        <section className="mx-auto my-16 w-full max-w-7xl px-4 sm:px-8 sm:my-20 lg:px-12">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-8 py-16 text-center text-primary-foreground shadow-2xl sm:px-16 sm:py-20">
            <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <ShieldCheck className="mx-auto size-16 opacity-95" />
              <h2 className="mt-6 font-display text-4xl font-black sm:text-5xl">
                Ready to Upgrade Your QR Experience?
              </h2>
              <p className="mt-5 text-base opacity-90 sm:text-lg">
                Join thousands of creators and businesses generating custom branded QR codes with dynamic links and deep analytics.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-10 py-6 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
                  onClick={scrollToGenerator}
                >
                  Generate Free QR Now
                </Button>
                <Button asChild size="lg" variant="outline" className="px-10 py-6 text-lg font-bold border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-transform">
                  <Link to="/pricing">Explore Pro Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
