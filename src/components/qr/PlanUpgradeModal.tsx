import { Link } from "@tanstack/react-router";
import { Check, Crown, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserPlan } from "@/hooks/useUserPlan";

interface PlanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTryWatermarkedDemo?: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export function PlanUpgradeModal({
  open,
  onOpenChange,
  onTryWatermarkedDemo,
  featureTitle = "3D Character Standee & Mascot Mode",
  featureDescription = "Display your QR code held by studio-rendered 3D characters or upload your own store mascot for printed table tents and storefront signs.",
}: PlanUpgradeModalProps) {
  const { setSimulatedPlan } = useUserPlan();

  const handleEnableDemoPlan = () => {
    setSimulatedPlan("premium");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[calc(100%-1.5rem)] sm:w-full rounded-2xl sm:rounded-3xl border-2 border-primary/20 bg-card p-4 sm:p-7 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge className="border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 text-xs">
              <Crown className="mr-1.5 size-3.5" /> PAID PLAN FEATURE
            </Badge>
          </div>
          <DialogTitle className="mt-2.5 font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight">
            {featureTitle}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
            {featureDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Plan Cards Comparison */}
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {/* Lite Plan */}
          <div className="relative rounded-2xl border-2 border-border/80 bg-secondary/30 p-3.5 sm:p-4 transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm sm:text-base text-foreground">Lite Plan</span>
              <span className="font-display text-base sm:text-lg font-black text-primary">₹199<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">For small shops &amp; freelancers</p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5 text-foreground">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span><strong>10 Standee Posters</strong> / month</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>50 Dynamic editable QR codes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>Vector PDF &amp; SVG download</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>Zero Watermarks</span>
              </li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="relative rounded-2xl border-2 border-primary/50 bg-primary/5 p-3.5 sm:p-4 shadow-sm">
            <div className="absolute -top-2.5 right-3 rounded-full bg-brand-gradient px-2 py-0.5 text-[9px] font-bold text-primary-foreground shadow-sm">
              POPULAR
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm sm:text-base text-foreground">Premium Plan</span>
              <span className="font-display text-base sm:text-lg font-black text-primary">₹499<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">For businesses &amp; agencies</p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5 text-foreground font-medium">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span><strong>Unlimited Standee Posters</strong></span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground font-medium">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span><strong>Custom Mascot / Photo Upload</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>Unlimited Dynamic QRs</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>4K Ultra-HD &amp; Print-Ready PDF</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons - Fully responsive & non-overflowing */}
        <div className="mt-4 flex flex-col gap-2.5">
          <Button
            asChild
            size="lg"
            className="w-full h-11 sm:h-12 rounded-xl bg-brand-gradient text-sm sm:text-base font-bold text-primary-foreground shadow-brand cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            <Link to="/pricing" onClick={() => onOpenChange(false)}>
              <Crown className="mr-2 size-4" />
              View Pricing &amp; Upgrade
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-0.5">
            {onTryWatermarkedDemo ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-9 rounded-xl text-xs font-semibold cursor-pointer border-border/80 hover:bg-secondary"
                onClick={() => {
                  onTryWatermarkedDemo();
                  onOpenChange(false);
                }}
              >
                <Sparkles className="mr-1.5 size-3.5 text-primary" />
                Try Free Watermarked Demo
              </Button>
            ) : null}

            {/* Test simulator button for reviewers / instant preview */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto h-9 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
              onClick={handleEnableDemoPlan}
            >
              <Zap className="mr-1.5 size-3.5 text-amber-500" />
              Unlock Premium Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
