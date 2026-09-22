import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  HelpCircle,
  Minus,
  ShieldCheck,
  Sparkles,
  Zap,
  Layers,
  FileText,
  BarChart3,
  Download,
  CreditCard,
} from "lucide-react";
import { Fragment, useState } from "react";

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

const TITLE = "BT-QR Pricing — Free, Lite & Premium Plans (INR ₹)";
const DESCRIPTION =
  "Simple, transparent pricing in Indian Rupees (₹). Start free forever or upgrade to Lite & Premium for unlimited dynamic QR codes, vector exports, 3D avatars, and deep analytics.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Pricing,
});

interface PlanFeature {
  name: string;
  free: boolean | string;
  lite: boolean | string;
  premium: boolean | string;
}

const COMPARISON_CATEGORIES: {
  category: string;
  features: PlanFeature[];
}[] = [
  {
    category: "QR Generation & Types",
    features: [
      { name: "Static QR Codes (Never expire)", free: "Unlimited", lite: "Unlimited", premium: "Unlimited" },
      { name: "Dynamic QR Codes (Editable links)", free: "5 Codes", lite: "50 Codes", premium: "Unlimited" },
      { name: "17+ QR Content Formats", free: true, lite: true, premium: true },
      { name: "Center Logo Embedding", free: true, lite: true, premium: true },
      { name: "Custom Brand Colors & Shapes", free: true, lite: true, premium: true },
      { name: "3D Character Avatar Signage", free: false, lite: "10 Posters/mo", premium: "Unlimited" },
      { name: "Bulk QR Generation (CSV)", free: false, lite: false, premium: "Up to 10,000/batch" },
    ],
  },
  {
    category: "Export & File Hosting",
    features: [
      { name: "High-Res PNG & JPG Export", free: true, lite: true, premium: true },
      { name: "Print Vector Export (SVG, EPS, PDF)", free: false, lite: true, premium: true },
      { name: "4K Ultra-HD Resolution", free: false, lite: true, premium: true },
      { name: "File to Link Hosting", free: "Up to 10 MB", lite: "Up to 100 MB", premium: "Up to 500 MB" },
      { name: "Ad-Free & No Watermarks", free: true, lite: true, premium: true },
    ],
  },
  {
    category: "Analytics & Tracking",
    features: [
      { name: "Total Scan Counter", free: true, lite: true, premium: true },
      { name: "Device & Browser Insights", free: false, lite: true, premium: true },
      { name: "City-Level Geolocation Tracking", free: false, lite: false, premium: true },
      { name: "Scan Time & Peak Hours Chart", free: false, lite: true, premium: true },
      { name: "Export Analytics to CSV/Excel", free: false, lite: false, premium: true },
    ],
  },
  {
    category: "Support & Security",
    features: [
      { name: "Password Protected QR Codes", free: false, lite: false, premium: true },
      { name: "Custom Expiry Dates for Codes", free: false, lite: true, premium: true },
      { name: "GST Compliant Invoices", free: false, lite: true, premium: true },
      { name: "Customer Support", free: "Community", lite: "Email (24h)", premium: "VIP WhatsApp & Priority" },
    ],
  },
];

const FAQS = [
  {
    question: "Which payment methods are supported in India?",
    answer:
      "We support all major Indian payment options including UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard, NetBanking (50+ banks), and Corporate Credit Cards with instant GST invoicing.",
  },
  {
    question: "Can I change my destination URL after printing?",
    answer:
      "Yes! With our Lite and Premium plans, Dynamic QR codes allow you to edit your target URL, menu, or file anytime without needing to change or reprint the physical QR code.",
  },
  {
    question: "What happens if I cancel or downgrade my subscription?",
    answer:
      "All your static QR codes will continue working forever. Any dynamic QR codes created within your active subscription will remain safe and redirect according to your plan tier.",
  },
  {
    question: "Do you provide GST invoices for Indian businesses?",
    answer:
      "Yes! During checkout, simply enter your company name and GSTIN to receive automated GST tax invoices for business expense claims.",
  },
  {
    question: "Can I upgrade from Lite to Premium anytime?",
    answer:
      "Yes, you can upgrade at any time with prorated billing. Your existing QR codes and scan analytics will transfer seamlessly.",
  },
];

function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-surface-gradient selection:bg-primary/20">
      <SiteHeader />

      <main className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
            <Sparkles className="size-3.5" />
            <span>Transparent INR (₹) Pricing</span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Choose the Perfect Plan for <br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">Your QR Codes</span>
          </h1>

          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            Create high-resolution static QR codes 100% free forever, or unlock dynamic tracking, vector printing, 3D character avatars, and bulk generation.
          </p>

          {/* Billing Switch (Monthly / Yearly) */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border/80 bg-card/80 p-1.5 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                !isAnnual
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                isAnnual
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid (Free, Lite, Premium) */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {/* 1. FREE PLAN */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card/70 p-7 shadow-sm backdrop-blur-md transition-all hover:border-border hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-foreground">Free Plan</h3>
                <Badge variant="secondary" className="border-border/60 bg-secondary">
                  Free Forever
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For individuals, students, and basic one-off static QR needs.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-foreground">₹0</span>
                <span className="text-sm font-medium text-muted-foreground">/ month</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">No credit card or payment needed</p>

              <Button asChild variant="outline" className="mt-6 w-full rounded-xl border-border hover:bg-secondary">
                <Link to="/">Create Free QR Code</Link>
              </Button>

              <hr className="my-6 border-border/60" />

              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Included Features:
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Unlimited Static QR codes (Never expire)",
                  "5 Dynamic QR codes with editable links",
                  "All 17 QR content types",
                  "Custom colors, patterns & logo upload",
                  "High-resolution PNG & JPG downloads",
                  "Basic scan counter",
                  "100% Watermark-free downloads",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. LITE PLAN */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-primary/40 bg-card/80 p-7 shadow-brand backdrop-blur-md transition-all hover:border-primary">
            <Badge className="absolute -top-3 right-7 border-0 bg-primary/20 text-primary">
              Popular for Creators
            </Badge>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Zap className="size-5 text-primary" /> Lite Plan
                </h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For creators, freelancers, and growing small businesses.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-foreground">
                  ₹{isAnnual ? "199" : "249"}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  / month
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {isAnnual ? "Billed annually (₹2,388/yr) — Save ₹600" : "Billed monthly"}
              </p>

              <Button asChild className="mt-6 w-full rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-95">
                <Link to="/auth">Upgrade to Lite</Link>
              </Button>

              <hr className="my-6 border-border/60" />

              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Everything in Free, plus:
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "50 Dynamic QR codes (Editable anytime)",
                  "Print Vector Formats (SVG, EPS, Print PDF)",
                  "10 3D Character Avatar signage posters/mo",
                  "File to Link Hosting up to 100 MB",
                  "Device, browser & peak hours scan analytics",
                  "Custom expiry dates for promotional QRs",
                  "Fast Email Support (within 24 hours)",
                  "GST Tax Invoice supported",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. PREMIUM PLAN */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-primary bg-card p-7 shadow-glow backdrop-blur-md transition-all">
            <Badge className="absolute -top-3 right-7 border-0 bg-brand-gradient text-primary-foreground shadow-md">
              Enterprise &amp; Best Value
            </Badge>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" /> Premium Plan
                </h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For agencies, marketing teams, restaurants, and retail chains.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-foreground">
                  ₹{isAnnual ? "499" : "699"}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  / month
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {isAnnual ? "Billed annually (₹5,988/yr) — Save ₹2,400" : "Billed monthly"}
              </p>

              <Button asChild className="mt-6 w-full rounded-xl bg-brand-gradient text-primary-foreground shadow-brand hover:opacity-95">
                <Link to="/auth">Get Premium All-Access</Link>
              </Button>

              <hr className="my-6 border-border/60" />

              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Everything in Lite, plus:
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Unlimited Dynamic QR Codes",
                  "Unlimited 3D Character Avatar Signage",
                  "Deep Geolocation Tracking (City & Region)",
                  "Bulk QR Code Generation (CSV up to 10,000)",
                  "Large File Hosting up to 500 MB (Videos/Menus)",
                  "Analytics Data Export (CSV & Excel)",
                  "Password-Protected Secure QR Codes",
                  "Dedicated VIP Support (Priority WhatsApp)",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Feature Comparison Table */}
        <section className="mt-20">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              Full Comparison
            </Badge>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Compare Plan Features Side by Side
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              See exact differences across generation limits, vector exports, analytics, and support.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-border/70 bg-secondary/50 text-sm">
                    <th className="p-4 sm:p-5 font-semibold text-foreground">Features</th>
                    <th className="p-4 sm:p-5 font-semibold text-center text-foreground">Free (₹0)</th>
                    <th className="p-4 sm:p-5 font-semibold text-center text-foreground">
                      Lite (₹{isAnnual ? "199" : "249"}/mo)
                    </th>
                    <th className="p-4 sm:p-5 font-semibold text-center text-primary">
                      Premium (₹{isAnnual ? "499" : "699"}/mo)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {COMPARISON_CATEGORIES.map((cat) => (
                    <Fragment key={cat.category}>
                      <tr className="bg-secondary/30">
                        <td colSpan={4} className="p-3 px-5 font-display text-xs font-bold uppercase tracking-wider text-primary">
                          {cat.category}
                        </td>
                      </tr>
                      {cat.features.map((row) => (
                        <tr key={row.name} className="transition-colors hover:bg-secondary/20">
                          <td className="p-4 sm:p-5 font-medium text-foreground">{row.name}</td>
                          <td className="p-4 sm:p-5 text-center text-muted-foreground">
                            {typeof row.free === "boolean" ? (
                              row.free ? (
                                <Check className="mx-auto size-5 text-primary" />
                              ) : (
                                <Minus className="mx-auto size-4 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="font-medium text-foreground">{row.free}</span>
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-center">
                            {typeof row.lite === "boolean" ? (
                              row.lite ? (
                                <Check className="mx-auto size-5 text-primary" />
                              ) : (
                                <Minus className="mx-auto size-4 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="font-semibold text-foreground">{row.lite}</span>
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-center bg-primary/5">
                            {typeof row.premium === "boolean" ? (
                              row.premium ? (
                                <Check className="mx-auto size-5 text-primary" />
                              ) : (
                                <Minus className="mx-auto size-4 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="font-bold text-primary">{row.premium}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section for Pricing & Payments */}
        <section className="mx-auto mt-20 max-w-4xl">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              Pricing FAQs
            </Badge>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Billing Questions
            </h2>
          </div>

          <div className="mt-8 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-md">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-border/60">
                  <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="mt-20 overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-primary-foreground shadow-brand sm:p-12">
          <ShieldCheck className="mx-auto size-12 opacity-95" />
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            100% Risk-Free Guarantee
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90 sm:text-base">
            Start completely free without entering a credit card. Upgrade whenever you need dynamic QR codes or vector printing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-xl px-8 font-semibold shadow-md">
              <Link to="/">Start for Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link to="/support">Contact Sales / Help</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
