export interface BuiltinLogo {
  id: string;
  name: string;
  category: "social" | "contact" | "utility";
  color: string;
  dataUri: string;
}

function makeSvgUri(svgXml: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgXml)}`;
}

export const BUILTIN_LOGOS: BuiltinLogo[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "social",
    color: "#25D366",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#25D366"/><path fill="#FFF" d="M34.5 13.5C31.7 10.7 28 9.2 24 9.2c-8.2 0-14.8 6.6-14.8 14.8 0 2.6.7 5.2 2 7.5L9 39l7.7-2c2.2 1.2 4.7 1.8 7.3 1.8h.1c8.2 0 14.8-6.6 14.8-14.8 0-4-1.6-7.7-4.4-10.5zm-10.5 22.8c-2.2 0-4.4-.6-6.3-1.7l-.5-.3-4.7 1.2 1.3-4.5-.3-.5c-1.2-1.9-1.9-4.2-1.9-6.5 0-6.8 5.5-12.3 12.3-12.3 3.3 0 6.4 1.3 8.7 3.6 2.3 2.3 3.6 5.4 3.6 8.7 0 6.8-5.5 12.3-12.2 12.3zm6.7-9.2c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.8.2s-.9 1.2-1.1 1.4c-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.7.2-.2.3-.4.4-.6.1-.2 0-.4 0-.6-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1.1.5-.4.4-1.5 1.5-1.5 3.6s1.5 4.2 1.7 4.5c.2.3 3 4.6 7.4 6.4 1 .4 1.9.7 2.5.9 1.1.3 2 .3 2.8.2.9-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z"/></svg>`,
    ),
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    color: "#E4405F",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><radialGradient id="ig-grad" cx="20%" cy="100%" r="130%"><stop offset="0%" stop-color="#FFDD55"/><stop offset="30%" stop-color="#FF543E"/><stop offset="60%" stop-color="#C837AB"/><stop offset="100%" stop-color="#4E54C8"/></radialGradient></defs><rect width="48" height="48" rx="13" fill="url(#ig-grad)"/><rect x="9" y="9" width="30" height="30" rx="9" fill="none" stroke="#FFF" stroke-width="3"/><circle cx="24" cy="24" r="7.5" fill="none" stroke="#FFF" stroke-width="3"/><circle cx="33" cy="15" r="2.2" fill="#FFF"/></svg>`,
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "social",
    color: "#FF0000",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#FF0000"/><polygon points="20,15 33,24 20,33" fill="#FFFFFF"/></svg>`,
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "social",
    color: "#1877F2",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#1877F2"/><path fill="#FFF" d="M26.5 39V24.5h4.8l.7-5.6h-5.5v-3.6c0-1.6.4-2.7 2.8-2.7h3V7.6c-.5-.1-2.3-.2-4.4-.2-4.4 0-7.3 2.7-7.3 7.6v3.9h-4.8v5.6h4.8V39h5.9z"/></svg>`,
    ),
  },
  {
    id: "x-twitter",
    name: "X (Twitter)",
    category: "social",
    color: "#000000",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#000000"/><path fill="#FFFFFF" d="M28.3 11h3.7l-8 9.2L33.5 37h-7.5l-5.8-7.7-6.7 7.7H9.7l8.6-9.8L9 11h7.7l5.3 7 6.3-7zm-1.3 23.8h2l-13-21.6h-2.2l13.2 21.6z"/></svg>`,
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "social",
    color: "#0A66C2",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="#0A66C2"/><path fill="#FFF" d="M12.5 19.5h5.4V36h-5.4zM15.2 11.8c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-1.7 1.4-3.1 3.1-3.1zm8.3 7.7h5.2v2.3h.1c.7-1.4 2.5-2.8 5.2-2.8 5.5 0 6.6 3.6 6.6 8.4V36h-5.4v-7.6c0-1.8 0-4.1-2.5-4.1-2.5 0-2.9 2-2.9 4V36h-5.4V19.5z"/></svg>`,
    ),
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "social",
    color: "#229ED9",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#229ED9"/><path fill="#FFF" d="M10 23.3l25-9.7c1.2-.4 2.2.3 1.8 2.1l-4.3 20.1c-.3 1.4-1.1 1.7-2.3 1.1l-6.4-4.7-3.1 3c-.3.3-.6.6-1.3.6l.5-6.5 11.9-10.7c.5-.5-.1-.7-.8-.3l-14.7 9.3-6.4-2c-1.4-.4-1.4-1.4.1-2.3z"/></svg>`,
    ),
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "social",
    color: "#1DB954",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#1DB954"/><path fill="#FFF" d="M33.6 30.7c-.4.6-1.1.8-1.7.4-4.8-2.9-10.8-3.6-17.9-2- .7.1-1.3-.3-1.5-.9-.1-.7.3-1.3.9-1.5 7.7-1.8 14.3-1 19.8 2.3.6.4.8 1.1.4 1.7zm2.4-5.4c-.5.8-1.4 1-2.2.5-5.9-3.6-15-4.7-22-2.6-.9.3-1.8-.2-2.1-1.1-.3-.9.2-1.8 1.1-2.1 8-2.4 18-1.2 24.7 2.9.8.6 1.1 1.5.5 2.4zm.2-5.7C29.1 15.4 17.5 15 10.8 17.1c-1.1.3-2.2-.3-2.6-1.4-.3-1.1.3-2.2 1.4-2.6 7.8-2.4 20.6-1.9 28.5 2.8 1 .6 1.3 1.9.7 2.9-.6 1-1.8 1.4-2.6.8z"/></svg>`,
    ),
  },
  {
    id: "github",
    name: "GitHub",
    category: "social",
    color: "#181717",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#181717"/><path fill="#FFF" d="M24 10C16.3 10 10 16.3 10 24c0 6.2 4 11.4 9.6 13.3 1.2.2 1.6-.5 1.6-1.1v-4.2c-3.9.8-4.7-1.7-4.7-1.7-.6-1.6-1.5-2.1-1.5-2.1-1.3-.9.1-.9.1-.9 1.4.1 2.2 1.5 2.2 1.5 1.3 2.2 3.3 1.5 4.1 1.2.1-.9.5-1.5.9-1.9-3.1-.4-6.4-1.6-6.4-7 0-1.5.5-2.8 1.4-3.8-.1-.4-.6-1.8.1-3.7 0 0 1.2-.4 3.9 1.5 1.1-.3 2.4-.5 3.6-.5s2.5.2 3.6.5c2.7-1.9 3.9-1.5 3.9-1.5.8 1.9.3 3.3.1 3.7.9 1 1.4 2.3 1.4 3.8 0 5.4-3.3 6.6-6.4 7 .5.4 1 1.3 1 2.6v3.9c0 .6.4 1.3 1.6 1.1C34 35.4 38 30.2 38 24c0-7.7-6.3-14-14-14z"/></svg>`,
    ),
  },
  {
    id: "wifi",
    name: "Wi-Fi",
    category: "utility",
    color: "#0284C7",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0284C7"/><path fill="#FFF" d="M24 35a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm-7.1-7.1a10 10 0 0 1 14.2 0l-2.1 2.1a7 7 0 0 0-10 0l-2.1-2.1zm-4.2-4.2a16 16 0 0 1 22.6 0l-2.1 2.1a13 13 0 0 0-18.4 0l-2.1-2.1zm-4.2-4.2a22 22 0 0 1 31 0l-2.1 2.1a19 19 0 0 0-26.8 0l-2.1-2.1z"/></svg>`,
    ),
  },
  {
    id: "location",
    name: "Location Pin",
    category: "utility",
    color: "#EF4444",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#EF4444"/><path fill="#FFF" d="M24 10c-6.1 0-11 4.9-11 11 0 7.8 9.5 16.2 10.3 16.9.4.3 1 .3 1.4 0 .8-.7 10.3-9.1 10.3-16.9 0-6.1-4.9-11-11-11zm0 15c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/></svg>`,
    ),
  },
  {
    id: "website",
    name: "Website / Web",
    category: "utility",
    color: "#4F46E5",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#4F46E5"/><circle cx="24" cy="24" r="14" fill="none" stroke="#FFF" stroke-width="2.5"/><ellipse cx="24" cy="24" rx="6" ry="14" fill="none" stroke="#FFF" stroke-width="2.5"/><line x1="10" y1="24" x2="38" y2="24" stroke="#FFF" stroke-width="2.5"/><line x1="13" y1="17" x2="35" y2="17" stroke="#FFF" stroke-width="2"/><line x1="13" y1="31" x2="35" y2="31" stroke="#FFF" stroke-width="2"/></svg>`,
    ),
  },
  {
    id: "phone",
    name: "Phone Call",
    category: "contact",
    color: "#10B981",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#10B981"/><path fill="#FFF" d="M33.7 29.8l-4.1-1.7c-.8-.3-1.7-.1-2.2.5l-1.8 2.2c-3.1-1.6-5.6-4.1-7.2-7.2l2.2-1.8c.6-.5.8-1.4.5-2.2l-1.7-4.1c-.4-.9-1.4-1.5-2.4-1.5H13c-1.2 0-2.2 1-2 2.2 1.3 9.4 8.7 16.9 18.2 18.2 1.2.2 2.2-.8 2.2-2v-3.9c0-1-.6-2-1.7-2.7z"/></svg>`,
    ),
  },
  {
    id: "email",
    name: "Email / Mail",
    category: "contact",
    color: "#F59E0B",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#F59E0B"/><path fill="#FFF" d="M12 16h24c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V18c0-1.1.9-2 2-2zm0 3.2l12 7.8 12-7.8V18l-12 7.8L12 18v1.2z"/></svg>`,
    ),
  },
  {
    id: "cart",
    name: "Shopping Store",
    category: "utility",
    color: "#8B5CF6",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#8B5CF6"/><path fill="#FFF" d="M14 14h3.3l4 15.2c.2.8.9 1.4 1.7 1.4h12.5c.8 0 1.5-.5 1.8-1.3L40 19H19"/><circle cx="23" cy="35" r="2.5" fill="#FFF"/><circle cx="34" cy="35" r="2.5" fill="#FFF"/></svg>`,
    ),
  },
  {
    id: "upi-pay",
    name: "Pay / UPI",
    category: "utility",
    color: "#059669",
    dataUri: makeSvgUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#059669"/><text x="24" y="32" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" fill="#FFF" text-anchor="middle">₹</text></svg>`,
    ),
  },
];
