import { QR_TYPES, type QRTypeId } from "@/lib/qr/config";
import { cn } from "@/lib/utils";

interface TypeSelectorProps {
  value: QRTypeId;
  onChange: (id: QRTypeId) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {QR_TYPES.map((type) => {
        const Icon = type.icon;
        const active = type.id === value;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            aria-pressed={active}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl sm:rounded-3xl border p-4 sm:p-5 text-center transition-all duration-200 cursor-pointer min-h-[96px] sm:min-h-[106px]",
              active
                ? "border-2 border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                : "border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/40 hover:shadow-sm",
            )}
          >
            <span
              className={cn(
                "flex size-11 sm:size-12 items-center justify-center rounded-full transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-secondary/80 text-primary group-hover:bg-primary/15 group-hover:scale-105",
              )}
            >
              <Icon className="size-5 sm:size-6" />
            </span>
            <span
              className={cn(
                "text-xs sm:text-sm font-semibold leading-tight transition-colors",
                active ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {type.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
