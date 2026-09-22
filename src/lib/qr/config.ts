import type { LucideIcon } from "lucide-react";
import {
  Link as LinkIcon,
  Type,
  Image as ImageIcon,
  FileText,
  Video,
  Contact,
  Phone,
  MessageCircle,
  Mail,
  MessageSquare,
  MapPin,
  Wifi,
  Instagram,
  ClipboardList,
  Smartphone,
  Upload,
  CalendarDays,
} from "lucide-react";

export type QRTypeId =
  | "url"
  | "text"
  | "image"
  | "pdf"
  | "video"
  | "vcard"
  | "phone"
  | "whatsapp"
  | "email"
  | "sms"
  | "location"
  | "wifi"
  | "social"
  | "gform"
  | "app"
  | "file"
  | "event";

export type FieldKind =
  | "text"
  | "textarea"
  | "tel"
  | "email"
  | "url"
  | "select"
  | "file"
  | "date"
  | "time"
  | "number";

export interface QRField {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  accept?: string;
  help?: string;
}

export interface QRFieldValues {
  address?: string;
  body?: string;
  company?: string;
  date?: string;
  email?: string;
  encryption?: string;
  end?: string;
  endDate?: string;
  fileUrl?: string;
  handle?: string;
  hidden?: string;
  lat?: string;
  lng?: string;
  location?: string;
  message?: string;
  name?: string;
  network?: string;
  notes?: string;
  password?: string;
  phone?: string;
  ssid?: string;
  start?: string;
  subject?: string;
  text?: string;
  title?: string;
  to?: string;
  url?: string;
  website?: string;
}

export type QRValues = QRFieldValues & Record<string, string | undefined>;

export interface QRTypeDef {
  id: QRTypeId;
  label: string;
  icon: LucideIcon;
  description: string;
  fields: QRField[];
  isUpload?: boolean;
  encode: (v: QRValues) => string;
}

const esc = (s: string) => (s ?? "").replace(/\\/g, "\\\\").replace(/([;,:"])/g, "\\$1");

const digits = (s: string) => (s ?? "").replace(/[^\d+]/g, "");

export const QR_TYPES: QRTypeDef[] = [
  {
    id: "url",
    label: "URL / Link",
    icon: LinkIcon,
    description: "Open any website when scanned",
    fields: [
      {
        name: "url",
        label: "Website URL",
        kind: "url",
        placeholder: "https://example.com",
        required: true,
      },
    ],
    encode: (v) => normalizeUrl(v.url ?? ""),
  },
  {
    id: "text",
    label: "Text",
    icon: Type,
    description: "Show plain text on scan",
    fields: [
      {
        name: "text",
        label: "Your text",
        kind: "textarea",
        placeholder: "Type anything…",
        required: true,
      },
    ],
    encode: (v) => (v.text ?? "").trim(),
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
    description: "Upload an image or paste an image link",
    isUpload: true,
    fields: [
      {
        name: "url",
        label: "Image URL or link",
        kind: "url",
        placeholder: "https://example.com/photo.jpg (or upload below)",
      },
      {
        name: "file",
        label: "…or upload an image file",
        kind: "file",
        accept: "image/*",
        help: "PNG, JPG, WEBP or GIF up to 10 MB",
      },
    ],
    encode: (v) => (v.url?.trim() ? normalizeUrl(v.url ?? "") : (v.fileUrl ?? "").trim()),
  },
  {
    id: "pdf",
    label: "PDF",
    icon: FileText,
    description: "Share a PDF document or document link",
    isUpload: true,
    fields: [
      {
        name: "url",
        label: "PDF URL / Drive link",
        kind: "url",
        placeholder: "https://example.com/menu.pdf (or upload below)",
      },
      {
        name: "file",
        label: "…or upload a PDF file",
        kind: "file",
        accept: "application/pdf",
        help: "PDF up to 10 MB",
      },
    ],
    encode: (v) => (v.url?.trim() ? normalizeUrl(v.url ?? "") : (v.fileUrl ?? "").trim()),
  },
  {
    id: "video",
    label: "Video",
    icon: Video,
    description: "Upload a video or paste a video link",
    isUpload: true,
    fields: [
      {
        name: "url",
        label: "Video link (YouTube, Vimeo, Drive…)",
        kind: "url",
        placeholder: "https://youtube.com/watch?v=… (or upload below)",
      },
      {
        name: "file",
        label: "…or upload a video file",
        kind: "file",
        accept: "video/*",
        help: "MP4 or WEBM up to 10 MB",
      },
    ],
    encode: (v) => (v.url?.trim() ? normalizeUrl(v.url ?? "") : (v.fileUrl ?? "").trim()),
  },
  {
    id: "vcard",
    label: "Contact",
    icon: Contact,
    description: "Save a contact card instantly",
    fields: [
      { name: "name", label: "Full name", kind: "text", placeholder: "Jane Doe", required: true },
      { name: "phone", label: "Phone", kind: "tel", placeholder: "+91 98765 43210" },
      { name: "email", label: "Email", kind: "email", placeholder: "jane@company.com" },
      { name: "company", label: "Company", kind: "text", placeholder: "Acme Inc." },
      { name: "title", label: "Job title", kind: "text", placeholder: "Product Designer" },
      { name: "website", label: "Website", kind: "url", placeholder: "https://acme.com" },
      { name: "address", label: "Address", kind: "textarea", placeholder: "Street, City, Country" },
    ],
    encode: (v) => {
      const parts = (v.name ?? "").trim().split(/\s+/);
      const last = parts.length > 1 ? parts.pop()! : "";
      const first = parts.join(" ");
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${esc(last)};${esc(first)};;;`,
        `FN:${esc((v.name ?? "").trim())}`,
        v.company ? `ORG:${esc(v.company)}` : "",
        v.title ? `TITLE:${esc(v.title)}` : "",
        v.phone ? `TEL;TYPE=CELL:${digits(v.phone ?? "")}` : "",
        v.email ? `EMAIL:${esc(v.email)}` : "",
        v.website ? `URL:${normalizeUrl(v.website)}` : "",
        v.address ? `ADR;TYPE=WORK:;;${esc(v.address.replace(/\n+/g, ", "))};;;;` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\r\n");
    },
  },
  {
    id: "phone",
    label: "Phone",
    icon: Phone,
    description: "Start a call on scan",
    fields: [
      {
        name: "phone",
        label: "Phone number",
        kind: "tel",
        placeholder: "+91 98765 43210",
        required: true,
      },
    ],
    encode: (v) => `tel:${digits(v.phone ?? "")}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    description: "Open a WhatsApp chat",
    fields: [
      {
        name: "phone",
        label: "WhatsApp number (with country code)",
        kind: "tel",
        placeholder: "+919876543210",
        required: true,
      },
      {
        name: "message",
        label: "Pre-filled message (optional)",
        kind: "textarea",
        placeholder: "Hi! I'd like to know more…",
      },
    ],
    encode: (v) => {
      const num = digits(v.phone ?? "").replace(/\+/g, "");
      const msg = (v.message ?? "").trim();
      return `https://wa.me/${num}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
    },
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    description: "Compose an email on scan",
    fields: [
      {
        name: "to",
        label: "Email address",
        kind: "email",
        placeholder: "hello@company.com",
        required: true,
      },
      { name: "subject", label: "Subject", kind: "text", placeholder: "Quick question" },
      { name: "body", label: "Message", kind: "textarea", placeholder: "Write your message…" },
    ],
    encode: (v) => {
      const qs = [
        v.subject ? `subject=${encodeURIComponent(v.subject)}` : "",
        v.body ? `body=${encodeURIComponent(v.body)}` : "",
      ]
        .filter(Boolean)
        .join("&");
      return `mailto:${(v.to ?? "").trim()}${qs ? `?${qs}` : ""}`;
    },
  },
  {
    id: "sms",
    label: "SMS",
    icon: MessageSquare,
    description: "Send a pre-written text message",
    fields: [
      {
        name: "phone",
        label: "Phone number",
        kind: "tel",
        placeholder: "+919876543210",
        required: true,
      },
      { name: "message", label: "Message (optional)", kind: "textarea", placeholder: "Your message…" },
    ],
    encode: (v) => {
      const p = digits(v.phone ?? "");
      const msg = (v.message ?? "").trim();
      return msg ? `SMSTO:${p}:${msg}` : `SMSTO:${p}`;
    },
  },
  {
    id: "location",
    label: "Location",
    icon: MapPin,
    description: "Open a place on Google Maps",
    fields: [
      {
        name: "address",
        label: "Address, Place or Google Maps Link",
        kind: "text",
        placeholder: "Gateway of India, Mumbai or https://maps.app.goo.gl/…",
      },
      { name: "lat", label: "Latitude (optional)", kind: "text", placeholder: "18.9220" },
      { name: "lng", label: "Longitude (optional)", kind: "text", placeholder: "72.8347" },
    ],
    encode: (v) => {
      if (v.lat?.trim() && v.lng?.trim()) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${v.lat.trim()},${v.lng.trim()}`,
        )}`;
      }
      const q = (v.address ?? "").trim();
      if (!q) return "";
      if (/^https?:\/\//i.test(q) || q.includes("maps.app.goo.gl") || q.includes("goo.gl/maps")) {
        return normalizeUrl(q);
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    },
  },
  {
    id: "wifi",
    label: "WiFi",
    icon: Wifi,
    description: "Join a network without typing a password",
    fields: [
      {
        name: "ssid",
        label: "Network name (SSID)",
        kind: "text",
        placeholder: "MyHomeWiFi",
        required: true,
      },
      { name: "password", label: "Password", kind: "text", placeholder: "••••••••" },
      {
        name: "encryption",
        label: "Encryption",
        kind: "select",
        options: [
          { label: "WPA / WPA2 / WPA3", value: "WPA" },
          { label: "WEP", value: "WEP" },
          { label: "None (Open)", value: "nopass" },
        ],
      },
      {
        name: "hidden",
        label: "Hidden network",
        kind: "select",
        options: [
          { label: "No", value: "false" },
          { label: "Yes", value: "true" },
        ],
      },
    ],
    encode: (v) => {
      const enc = v.encryption || "WPA";
      return `WIFI:T:${enc};S:${esc(v.ssid ?? "")};${
        enc !== "nopass" && v.password ? `P:${esc(v.password)};` : ""
      }${v.hidden === "true" ? "H:true;" : ""};`;
    },
  },
  {
    id: "social",
    label: "Social media",
    icon: Instagram,
    description: "Send scans to your profile",
    fields: [
      {
        name: "network",
        label: "Network",
        kind: "select",
        options: [
          { label: "Instagram", value: "instagram" },
          { label: "Facebook", value: "facebook" },
          { label: "YouTube", value: "youtube" },
          { label: "LinkedIn", value: "linkedin" },
          { label: "X (Twitter)", value: "x" },
          { label: "Telegram", value: "telegram" },
          { label: "TikTok", value: "tiktok" },
          { label: "GitHub", value: "github" },
          { label: "Threads", value: "threads" },
          { label: "Snapchat", value: "snapchat" },
          { label: "Pinterest", value: "pinterest" },
        ],
      },
      {
        name: "handle",
        label: "Profile URL or username",
        kind: "text",
        placeholder: "@yourbrand or profile link",
        required: true,
      },
    ],
    encode: (v) => {
      const raw = (v.handle ?? "").trim();
      if (!raw) return "";
      if (/^https?:\/\//i.test(raw) || raw.includes(".")) return normalizeUrl(raw);
      const handle = raw.replace(/^@/, "");
      const base: Record<string, string> = {
        instagram: "https://instagram.com/",
        facebook: "https://facebook.com/",
        youtube: "https://youtube.com/@",
        linkedin: "https://linkedin.com/in/",
        x: "https://x.com/",
        telegram: "https://t.me/",
        tiktok: "https://tiktok.com/@",
        github: "https://github.com/",
        threads: "https://threads.net/@",
        snapchat: "https://snapchat.com/add/",
        pinterest: "https://pinterest.com/",
      };
      return `${base[v.network || "instagram"] ?? "https://instagram.com/"}${handle}`;
    },
  },
  {
    id: "gform",
    label: "Google Form",
    icon: ClipboardList,
    description: "Collect responses fast",
    fields: [
      {
        name: "url",
        label: "Google Form link",
        kind: "url",
        placeholder: "https://forms.gle/…",
        required: true,
      },
    ],
    encode: (v) => normalizeUrl(v.url ?? ""),
  },
  {
    id: "app",
    label: "App store",
    icon: Smartphone,
    description: "Link to App Store or Play Store",
    fields: [
      {
        name: "url",
        label: "App link (Play Store / App Store)",
        kind: "url",
        placeholder: "https://play.google.com/store/apps/…",
        required: true,
      },
    ],
    encode: (v) => normalizeUrl(v.url ?? ""),
  },
  {
    id: "file",
    label: "File",
    icon: Upload,
    description: "Share any downloadable file or document",
    isUpload: true,
    fields: [
      {
        name: "url",
        label: "File URL / Cloud link",
        kind: "url",
        placeholder: "https://example.com/archive.zip (or upload below)",
      },
      {
        name: "file",
        label: "…or upload a file",
        kind: "file",
        help: "Any file type up to 10 MB",
      },
    ],
    encode: (v) => (v.url?.trim() ? normalizeUrl(v.url ?? "") : (v.fileUrl ?? "").trim()),
  },
  {
    id: "event",
    label: "Event",
    icon: CalendarDays,
    description: "Add an event to the calendar",
    fields: [
      {
        name: "title",
        label: "Event name",
        kind: "text",
        placeholder: "Product launch",
        required: true,
      },
      { name: "date", label: "Start date", kind: "date", required: true },
      { name: "start", label: "Start time", kind: "time" },
      { name: "endDate", label: "End date", kind: "date" },
      { name: "end", label: "End time", kind: "time" },
      { name: "location", label: "Location", kind: "text", placeholder: "Bengaluru, India" },
      { name: "notes", label: "Description", kind: "textarea", placeholder: "Details…" },
    ],
    encode: (v) => {
      const stamp = (date?: string, time?: string) => {
        if (!date) return "";
        const d = date.replace(/-/g, "");
        const parts = (time || "09:00").split(":");
        const hh = (parts[0] || "09").padStart(2, "0");
        const mm = (parts[1] || "00").padStart(2, "0");
        const ss = (parts[2] || "00").padStart(2, "0");
        return `${d}T${hh}${mm}${ss}`;
      };
      const dtStart = stamp(v.date, v.start);
      let dtEnd = "";
      if (v.endDate || v.end) {
        dtEnd = stamp(v.endDate || v.date, v.end || v.start);
      }
      if (!dtStart) return "";
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${esc(v.title ?? "")}`,
        v.location ? `LOCATION:${esc(v.location)}` : "",
        v.notes ? `DESCRIPTION:${esc(v.notes.replace(/\n+/g, " "))}` : "",
        `DTSTART:${dtStart}`,
        dtEnd ? `DTEND:${dtEnd}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
      ]
        .filter(Boolean)
        .join("\r\n");
    },
  },
];

export function normalizeUrl(value?: string) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function getQRType(id: QRTypeId): QRTypeDef {
  return QR_TYPES.find((t) => t.id === id) ?? (QR_TYPES[0] as QRTypeDef);
}

export function encodeQRValue(id: QRTypeId, values: QRValues) {
  try {
    return getQRType(id).encode(values).trim();
  } catch {
    return "";
  }
}

/** Type-aware validation. Returns null when the payload is good to encode. */
export function validateQRValues(
  id: QRTypeId,
  values: QRValues,
): string | null {
  const def = getQRType(id);
  if (def.isUpload && !values.fileUrl && !values.url?.trim()) {
    return "Enter a link or upload a file to continue";
  }
  if (id === "location") {
    if (!values.address?.trim() && (!values.lat?.trim() || !values.lng?.trim())) {
      return "Enter an address, Maps link, or latitude & longitude";
    }
    if ((values.lat?.trim() && !values.lng?.trim()) || (!values.lat?.trim() && values.lng?.trim())) {
      return "Both latitude and longitude are required";
    }
  }
  for (const field of def.fields) {
    if (!field.required) continue;
    if (field.kind === "file") continue;
    if (!(values[field.name] ?? "").trim()) return `${field.label} is required`;
  }
  const encoded = encodeQRValue(id, values);
  if (!encoded) return "Add content to generate your QR code";
  if (encoded.length > 2200) return "Content is too long for a single QR code";
  if (id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((values.to ?? "").trim())) {
    return "Enter a valid email address";
  }
  if ((id === "phone" || id === "whatsapp" || id === "sms") && digits(values.phone ?? "").length < 7) {
    return "Enter a valid phone number (at least 7 digits)";
  }
  if (id === "wifi" && (values.encryption || "WPA") !== "nopass" && !values.password?.trim()) {
    return "Password is required for WPA/WEP WiFi networks";
  }
  return null;
}
