// Utility function to sanitize text inputs (prevent XSS)
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/\0/g, "") // remove null bytes
    .replace(/<script.*?>.*?<\/script>/gi, "") // remove script tags
    .replace(/<.*?>/g, "") // remove all HTML tags
    .replace(/javascript:/gi, "") // remove js protocol
    .replace(/on\w+=/gi, "") // remove inline event handlers
    .replace(/data:text\/html/gi, "") // block data URI html
    .replace(/&/g, "&amp;") // Escape ampersand
    .replace(/"/g, "&quot;") // Escape double quotes
    .replace(/'/g, "&#x27;") // Escape single quotes
    .replace(/\//g, "&#x2F;"); // Escape forward slash
};

// Utility function to sanitize URLs (keep slashes, but remove dangerous patterns)
export const sanitizeUrl = (input) => {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/\0/g, "") // remove null bytes
    .replace(/<script.*?>.*?<\/script>/gi, "") // remove script tags
    .replace(/<.*?>/g, "") // remove all HTML tags
    .replace(/javascript:/gi, "") // remove js protocol
    .replace(/on\w+=/gi, "") // remove inline event handlers
    .replace(/data:text\/html/gi, ""); // block data URI HTML
};

// Utility function to sanitize phone numbers (allow only digits, +, -, spaces, parentheses)
export const sanitizePhone = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/[^\d+\-\s()]/g, "").trim();
};

// Utility function to sanitize GST number (alphanumeric, uppercase)
export const sanitizeGst = (input) => {
  if (typeof input !== "string") return input;
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
};

// Utility function to sanitize PAN number (alphanumeric, uppercase)
export const sanitizePan = (input) => {
  if (typeof input !== "string") return input;
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
};

// Utility function to sanitize pincode (digits only)
export const sanitizePincode = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/\D/g, "").trim();
};

// Utility function to validate avatar URL (reject SVG images)
export const validateAvatarUrl = (url) => {
  if (typeof url !== "string" || !url) return true; // Allow empty
  const lowerUrl = url.toLowerCase();
  // Reject SVG files and SVG data URIs
  if (lowerUrl.endsWith(".svg") || lowerUrl.includes("image/svg+xml")) {
    return false;
  }
  return true;
};
