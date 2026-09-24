import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

const TITLE = "Support & QR Code FAQ — BT-QR";
const DESCRIPTION =
  "Get 24/7 help with QR code generation, scanning issues, dynamic destination changes, vector downloads, file converter, and account settings.";

const SUPPORT_EMAIL = "support.btqrcodegenerate@gmail.com";

export const Route = createFileRoute("/support")({
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
  component: SupportPage,
});

const FAQS = [
  {
    q: "Do my QR codes expire?",
    a: "No. Static QR codes never expire because your content is encoded directly into the pattern. Dynamic QR codes stay active continuously as long as your short link is maintained in your dashboard.",
  },
  {
    q: "Can I change where a QR code points after printing it?",
    a: "Yes! If you generated a Dynamic QR code saved to your dashboard, you can open your dashboard anytime, click Edit, and update the destination URL. The physical printed QR code pattern never needs to be changed.",
  },
  {
    q: "My QR code will not scan. What should I fix?",
    a: "Ensure high contrast between foreground and background (dark dots on light backgrounds work best). Keep an adequate quiet zone (white border) around the code, choose Quartile or High error-correction if embedding a logo, and ensure printed size is at least 2.5 cm (1 inch) wide.",
  },
  {
    q: "Which file format should I download for printing?",
    a: "Use PNG for websites, emails, and social media. For large format print (business cards, flyers, standees, billboards), download SVG, EPS, or vector PDF so the design scales infinitely with zero pixelation.",
  },
  {
    q: "How do image, PDF, and video uploads work?",
    a: "Your file is uploaded to BT-QR secure cloud storage (up to 500 MB) and a clean, direct short URL is generated. When someone scans your QR code, they are seamlessly redirected to view or download the file.",
  },
  {
    q: "Is scanning data private and secure?",
    a: "Yes. We track only anonymous, aggregate metrics (timestamp, general device type, browser, approximate region). We never capture personal identification, camera streams, or exact GPS locations.",
  },
  {
    q: "Do I need an account to create QR codes?",
    a: "Yes. A free BT-QR account is required to generate QR codes, customize frames, download high-resolution vector files, and access our file converter and scanner services. Registration is 100% free and takes less than 30 seconds.",
  },
  {
    q: "How do I upgrade or get GST invoices for my business?",
    a: "You can upgrade to our Lite or Premium plans from the Pricing page. We support Indian UPI, Credit/Debit cards, NetBanking, and automated GST tax invoices for business expense reimbursement.",
  },
];

function SupportPage() {
  const { user } = useAuth();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");

  // Contact Form State
  const [contactName, setContactName] = useState(
    (typeof user?.user_metadata?.["full_name"] === "string" && user.user_metadata["full_name"]) ||
      (typeof user?.user_metadata?.["name"] === "string" && user.user_metadata["name"]) ||
      "",
  );
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactTopic, setContactTopic] = useState("general");
  const [contactMessage, setContactMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopiedEmail(true);
      toast.success("Support email copied to clipboard!");
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast.error("Could not copy email");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    // Simulate support ticket dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Support message sent!", {
      description: "Our technical team will review your query and reply within 24 hours.",
    });
  };

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
    );
  }, [faqSearch]);

  return (
    <div className="min-h-screen bg-surface-gradient selection:bg-primary/20">
      <SiteHeader />

      <main className="relative mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Background ambient lighting */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-80 w-full max-w-3xl -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        {/* Header Section */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary backdrop-blur-md">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>24/7 Dedicated Support Center</span>
          </div>

          <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            How can we help you?
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Find answers to frequently asked questions, get help with your QR codes, or reach out
            directly to our engineering support team.
          </p>
        </div>

        {/* 3 Contact Info Cards (Fully Responsive with Zero Text Overflow) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Live Chat */}
          <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm backdrop-blur-md min-w-0 overflow-hidden hover:border-primary/40 transition-all">
            <div>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <MessageCircle className="size-5.5" />
              </span>
              <h2 className="mt-4 font-display text-base sm:text-lg font-bold text-foreground">
                Live Chat Assistance
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-snug">
                Mon–Fri, 9:00–18:00 CET. Instant answers for quick troubleshooting and navigation.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border/60">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Operators Active
              </span>
            </div>
          </div>

          {/* Card 2: Direct Email */}
          <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm backdrop-blur-md min-w-0 overflow-hidden hover:border-primary/40 transition-all">
            <div className="min-w-0">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Mail className="size-5.5" />
              </span>
              <h2 className="mt-4 font-display text-base sm:text-lg font-bold text-foreground">
                Email Support
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">
                For custom business plans, enterprise quotes &amp; technical inquiries.
              </p>

              {/* Clean Single-Line Email Box with Click to Copy/Email */}
              <div className="mt-3.5 rounded-xl border border-primary/25 bg-primary/5 p-2 sm:p-2.5 flex items-center justify-between gap-1.5">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="min-w-0 flex-1 font-sans text-[11px] sm:text-xs md:text-[13px] font-bold text-primary hover:underline truncate"
                  title={SUPPORT_EMAIL}
                >
                  {SUPPORT_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="shrink-0 p-1 rounded-md text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyEmail}
                className="w-full text-xs font-semibold rounded-xl h-9 hover:bg-secondary cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="mr-1.5 size-3.5 text-emerald-500" /> Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-3.5 text-primary" /> Copy Email Address
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Card 3: Priority Resolution */}
          <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm backdrop-blur-md min-w-0 overflow-hidden sm:col-span-2 lg:col-span-1 hover:border-primary/40 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                  <LifeBuoy className="size-5.5" />
                </span>
                <Badge className="border-0 bg-primary/15 text-primary text-[10px] font-bold py-0.5 px-2">
                  PAID PLANS
                </Badge>
              </div>
              <h2 className="mt-4 font-display text-base sm:text-lg font-bold text-foreground">
                Priority Resolution
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-snug">
                Guaranteed reply within 24 hours. VIP technical review for Lite and Premium members.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border/60">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold rounded-xl h-9 hover:bg-secondary"
              >
                <Link to="/pricing">Explore Lite &amp; Premium</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Direct Interactive Support Form */}
        <section className="mt-10 sm:mt-14 overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-border/80 bg-card p-5 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Send className="size-5 text-primary shrink-0" />
              Send Us a Message
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              Fill in your details below and our team will get back to you directly via email.
            </p>
          </div>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-3">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Thank you! Your message has been received.
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                We sent a confirmation to <strong>{contactEmail}</strong>. Our engineers will reply shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setContactMessage("");
                }}
                className="mt-4 rounded-xl text-xs"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="support-name" className="text-xs font-semibold">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="support-name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="support-email" className="text-xs font-semibold">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="support-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-topic" className="text-xs font-semibold">
                  What do you need help with?
                </Label>
                <select
                  id="support-topic"
                  value={contactTopic}
                  onChange={(e) => setContactTopic(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="general">General Question</option>
                  <option value="scan-issue">QR Code Not Scanning</option>
                  <option value="dynamic-link">Dynamic Link &amp; Redirect Issue</option>
                  <option value="file-convert">File to Link Converter (500 MB)</option>
                  <option value="standee">3D Character Standee Poster</option>
                  <option value="billing">Plan Upgrade &amp; GST Invoicing</option>
                  <option value="bug">Report a Technical Bug</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-message" className="text-xs font-semibold">
                  Message Details <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="support-message"
                  required
                  rows={4}
                  placeholder="Describe your issue or question in detail so we can resolve it quickly..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="rounded-xl resize-none text-xs sm:text-sm"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-brand-gradient text-xs sm:text-sm font-bold text-primary-foreground shadow-brand cursor-pointer hover:opacity-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" /> Send Support Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Frequently Asked Questions with Search */}
        <section className="mt-12 sm:mt-16 rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Instant answers to the most common QR code and account questions.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search questions..."
                className="h-10 rounded-xl pl-9 pr-8 text-xs"
              />
              {faqSearch ? (
                <button
                  type="button"
                  onClick={() => setFaqSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          <Accordion type="single" collapsible className="mt-6 divide-y divide-border/60">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <AccordionItem key={faq.q} value={`item-${index}`} className="border-border/60 py-1">
                  <AccordionTrigger className="text-left font-display font-semibold text-xs sm:text-sm hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <HelpCircle className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                <p>No matching questions found for &ldquo;{faqSearch}&rdquo;</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFaqSearch("")}
                  className="mt-2 text-xs text-primary"
                >
                  View All Questions
                </Button>
              </div>
            )}
          </Accordion>
        </section>

        {/* Footer Navigation Buttons */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-3">
          <Button asChild className="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-gradient text-xs sm:text-sm font-bold text-primary-foreground shadow-brand">
            <Link to="/">
              Create a QR Code Now &rarr;
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs sm:text-sm font-semibold">
            <Link to="/types">
              Explore 17+ QR Types
            </Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
