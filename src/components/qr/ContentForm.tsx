import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getQRType, type QRTypeId } from "@/lib/qr/config";
import { uploadQrFile } from "@/lib/qr/upload";

interface ContentFormProps {
  typeId: QRTypeId;
  values: Record<string, string>;
  onChange: (patch: Record<string, string>) => void;
}

export function ContentForm({ typeId, values, onChange }: ContentFormProps) {
  const def = getQRType(typeId);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadQrFile(file);
      onChange({ fileUrl: url, fileName: file.name });
      toast.success("File uploaded", { description: file.name });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Please try again";
      toast.error("Upload failed", {
        description: msg.includes("log in")
          ? "Please log in to host files online, or paste a link directly above."
          : msg,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {def.fields.map((field) => {
        const id = `${typeId}-${field.name}`;
        const wide = field.kind === "textarea" || field.kind === "file";

        if (field.kind === "file") {
          return (
            <div key={field.name} className="sm:col-span-2">
              <Label htmlFor={id}>{field.label}</Label>
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 p-4">
                <input
                  id={id}
                  ref={fileRef}
                  type="file"
                  accept={field.accept}
                  className="hidden"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 size-4" />
                  )}
                  {uploading ? "Uploading…" : "Choose file"}
                </Button>
                {values['fileUrl'] ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                      <CheckCircle2 className="size-4 text-primary" />
                      {values['fileName'] ?? "File uploaded"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChange({ fileUrl: "", fileName: "" })}
                      className="text-xs text-muted-foreground hover:text-destructive hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">{field.help}</span>
                )}
              </div>
            </div>
          );
        }

        if (field.kind === "select") {
          const current = values[field.name] ?? field.options?.[0]?.value ?? "";
          return (
            <div key={field.name}>
              <Label htmlFor={id}>{field.label}</Label>
              <Select value={current} onValueChange={(v) => onChange({ [field.name]: v })}>
                <SelectTrigger id={id} className="mt-2">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.kind === "textarea") {
          return (
            <div key={field.name} className="sm:col-span-2">
              <Label htmlFor={id}>{field.label}</Label>
              <Textarea
                id={id}
                className="mt-2 min-h-28"
                maxLength={1500}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) => onChange({ [field.name]: event.target.value })}
              />
            </div>
          );
        }

        return (
          <div key={field.name} className={wide ? "sm:col-span-2" : undefined}>
            <Label htmlFor={id}>
              {field.label}
              {field.required ? <span className="text-primary"> *</span> : null}
            </Label>
            <Input
              id={id}
              className="mt-2"
              type={
                field.kind === "date"
                  ? "date"
                  : field.kind === "time"
                    ? "time"
                    : field.kind === "email"
                      ? "email"
                      : field.kind === "tel"
                        ? "tel"
                        : "text"
              }
              inputMode={field.kind === "tel" ? "tel" : undefined}
              maxLength={300}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(event) => onChange({ [field.name]: event.target.value })}
            />
            {field.help ? (
              <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
