import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, FileUp, Image as ImageIcon, Link2, Loader2, Lock, LogIn, Video } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { QRPreview } from "@/components/qr/QRPreview";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_STYLE } from "@/lib/qr/render";
import { MAX_UPLOAD_BYTES, uploadQrFile } from "@/lib/qr/upload";

const TITLE = "File to Link Converter — Images, Videos & Files up to 500 MB | BT-QR";
const DESCRIPTION =
  "Convert any image, video, PDF or file up to 500 MB into a shareable link and instant QR code. Free, private links hosted by BT-QR.";

export const Route = createFileRoute("/convert")({
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
  component: ConvertPage,
});

const KINDS = [
  { icon: ImageIcon, label: "Images", text: "JPG, PNG, WebP, HEIC" },
  { icon: Video, label: "Videos", text: "MP4, MOV, WebM up to 500 MB" },
  { icon: FileUp, label: "Any file", text: "PDF, ZIP, DOC, XLS, audio" },
];

function ConvertPage() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [link, setLink] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in or register to convert and host files.",
      });
      return;
    }
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("File is larger than 500 MB");
      return;
    }
    setBusy(true);
    setProgress(8);
    const timer = setInterval(() => setProgress((p) => (p < 90 ? p + 4 : p)), 400);
    try {
      const { url } = await uploadQrFile(file);
      setLink(url);
      setFileName(file.name);
      setProgress(100);
      toast.success("Link ready", { description: file.name });
    } catch (error) {
      setProgress(0);
      toast.error("Conversion failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            Convert files into a <span className="text-brand-gradient">shareable link</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Upload an image, video or any document up to 500 MB. You get a clean link plus a QR code
            that opens it on any phone.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            {!user ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 sm:p-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-lg mb-4">
                  <Lock className="size-8" />
                </div>
                <h2 className="text-xl font-bold sm:text-2xl text-foreground">
                  Login Required to Convert Files
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Cloud file hosting (up to 500 MB) and instant QR code generation is exclusively available for registered users. Log in or create a free account to get started.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Button asChild className="w-full sm:w-auto bg-brand-gradient text-primary-foreground font-bold shadow-md rounded-xl h-11 px-6">
                    <Link to="/auth" search={{ redirect: "/convert" }}>
                      <LogIn className="mr-2 size-4" /> Log In to Convert
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl h-11 px-6">
                    <Link to="/auth" search={{ redirect: "/convert" }}>
                      Create Free Account
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleFile(event.dataTransfer.files?.[0]);
                }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40 p-6 sm:p-10 text-center"
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
                  <FileUp className="size-6" />
                </span>
                <p className="mt-4 font-semibold">Drop your file here</p>
                <p className="mt-1 text-sm text-muted-foreground">Maximum size 500 MB per file</p>
                <Button
                  className="mt-5 bg-brand-gradient text-primary-foreground hover:opacity-90"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                >
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {busy ? "Converting…" : "Choose file"}
                </Button>
                {busy || progress === 100 ? (
                  <Progress value={progress} className="mt-5 w-full max-w-sm" />
                ) : null}
              </div>
            )}

            {link ? (
              <div className="mt-6 space-y-3 rounded-2xl bg-secondary/50 p-4">
                <p className="text-sm font-semibold">{fileName}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input readOnly value={link} className="min-w-48 flex-1" />
                  <Button variant="outline" onClick={() => void copy()}>
                    {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                    Copy
                  </Button>
                  <Button asChild variant="ghost">
                    <a href={link} target="_blank" rel="noreferrer">
                      <Link2 className="mr-2 size-4" /> Open
                    </a>
                  </Button>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/" search={{ type: "file" }}>
                    Style this as a full QR code
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {KINDS.map((kind) => (
                <div key={kind.label} className="rounded-2xl border border-border p-4">
                  <kind.icon className="size-5 text-primary" />
                  <p className="mt-2 text-sm font-bold">{kind.label}</p>
                  <p className="text-xs text-muted-foreground">{kind.text}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 text-center shadow-sm">
              <p className="text-sm font-semibold">QR for your link</p>
              <div className="mt-4 relative flex justify-center rounded-2xl bg-secondary/40 p-4 overflow-hidden">
                <div className={!user ? "filter blur-md opacity-30 select-none pointer-events-none" : ""}>
                  <QRPreview value={link || "https://bt-qr.app"} style={DEFAULT_STYLE} size={220} />
                </div>
                {!user && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs p-3 text-center z-10">
                    <Lock className="size-6 text-primary mb-1" />
                    <span className="text-xs font-bold text-foreground">QR Preview Locked</span>
                    <span className="text-[10px] text-muted-foreground">Sign in to convert files</span>
                  </div>
                )}
              </div>
              <p className="mt-3 break-all text-xs text-muted-foreground">
                {user ? (link ? link : "Upload a file to generate its QR code.") : "Login to convert files & generate QR."}
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
