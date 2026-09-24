/**
 * Strict Email & Domain Validator
 * Blocks malformed emails, invalid TLDs, and disposable/temporary bot domains.
 */

// Common disposable, temporary and fake email domains used by bots and spam
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "burnermail.io",
  "crazymailing.com",
  "disposablemail.com",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "generator.email",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "inboxkitten.com",
  "maildrop.cc",
  "mailinator.com",
  "mohmal.com",
  "mytempemail.com",
  "nada.ltd",
  "sharklasers.com",
  "spambox.us",
  "temp-mail.org",
  "tempail.com",
  "tempinbox.com",
  "tempmail.com",
  "tempmail.net",
  "tempmail.ninja",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "test.com",
  "example.com",
  "fake.com",
  "asdf.com",
]);

// Standard email format with valid TLD requirement (minimum 2 chars, e.g. .com, .in, .org)
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  cleanEmail: string;
}

export function validateEmail(rawEmail: string): EmailValidationResult {
  if (!rawEmail || typeof rawEmail !== "string") {
    return { isValid: false, error: "Please enter an email address.", cleanEmail: "" };
  }

  const clean = rawEmail.trim().toLowerCase();

  if (clean.length < 5) {
    return { isValid: false, error: "Email address is too short.", cleanEmail: clean };
  }

  if (clean.length > 254) {
    return { isValid: false, error: "Email address cannot exceed 254 characters.", cleanEmail: clean };
  }

  if (clean.includes("..")) {
    return { isValid: false, error: "Email cannot contain consecutive dots (..).", cleanEmail: clean };
  }

  if (!clean.includes("@")) {
    return { isValid: false, error: "Email is missing the '@' symbol.", cleanEmail: clean };
  }

  const parts = clean.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Email format is invalid (multiple '@' found).", cleanEmail: clean };
  }

  const [localPart, domain] = parts;

  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: "Username part of email is missing.", cleanEmail: clean };
  }

  if (!domain || !domain.includes(".")) {
    return { isValid: false, error: "Email domain must include an extension (e.g. .com, .in).", cleanEmail: clean };
  }

  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Email domain extension is invalid.", cleanEmail: clean };
  }

  if (!EMAIL_REGEX.test(clean)) {
    return { isValid: false, error: "Please enter a valid email address.", cleanEmail: clean };
  }

  // Check against disposable / temporary domain blocklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Temporary/disposable emails are not permitted. Please use a genuine email (e.g. Gmail, Outlook, Yahoo).",
      cleanEmail: clean,
    };
  }

  return { isValid: true, cleanEmail: clean };
}
