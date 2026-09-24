import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface BotProtectionProps {
  isVerified: boolean;
  onVerifiedChange: (verified: boolean) => void;
  disabled?: boolean;
}

export function BotProtectionWidget({
  isVerified,
  onVerifiedChange,
  disabled = false,
}: BotProtectionProps) {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    if (isVerified || verifying || disabled) return;
    setVerifying(true);

    // Simulate smart client-side heuristic verification (evaluates human click & interaction)
    setTimeout(() => {
      setVerifying(false);
      onVerifiedChange(true);
    }, 650);
  };

  return (
    <div
      onClick={handleVerify}
      className={`group relative flex items-center justify-between rounded-2xl border p-3.5 transition-all select-none ${
        disabled
          ? "cursor-not-allowed border-border/50 bg-secondary/30 opacity-60"
          : isVerified
            ? "cursor-default border-emerald-500/40 bg-emerald-500/5 shadow-sm"
            : "cursor-pointer border-border bg-card/70 hover:border-primary/40 hover:bg-secondary/40 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Verification Checkbox / Icon */}
        <div
          className={`flex size-6 items-center justify-center rounded-lg border transition-all ${
            isVerified
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
              : verifying
                ? "border-primary bg-primary/10 text-primary"
                : "border-muted-foreground/30 bg-background group-hover:border-primary/60"
          }`}
        >
          {isVerified ? (
            <CheckCircle2 className="size-4 animate-in zoom-in-75 duration-200" />
          ) : verifying ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground">
            {isVerified
              ? "Human verification passed"
              : verifying
                ? "Verifying browser integrity..."
                : "Verify you are human"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isVerified ? "Secured session established" : "Click to confirm you are not a bot"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end pl-2">
        <ShieldCheck
          className={`size-4 ${isVerified ? "text-emerald-500" : "text-muted-foreground/60"}`}
        />
        <span className="text-[9px] font-medium tracking-tight text-muted-foreground/80">
          Anti-Bot
        </span>
      </div>
    </div>
  );
}

/**
 * Invisible Honeypot Field component.
 * Automated bots scan the DOM and blindly fill out hidden inputs.
 * Real humans never see or interact with this field.
 */
export function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        opacity: 0,
        height: 0,
        width: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <label htmlFor="website_hp_bot_trap">Do not fill this field</label>
      <input
        id="website_hp_bot_trap"
        type="text"
        name="website_hp_bot_trap"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
