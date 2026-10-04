const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp", "image/gif"];

export function imageFileError(file: File, maxBytes = 5 * 1024 * 1024): string {
  const type = (file.type || "").toLowerCase();
  const name = file.name || "this file";
  const allowedType = ALLOWED_TYPES.includes(type);
  const allowedName = /\.(jpe?g|png|webp|gif)$/i.test(name);

  if (!allowedType && !allowedName) {
    if (type === "image/heic" || type === "image/heif" || /\.hei[cf]$/i.test(name)) {
      return `${name} is an iPhone HEIC photo. Save it as a JPEG, then upload that file.`;
    }
    return `${name}${type ? ` (${type})` : ""} cannot be uploaded. Use a JPEG, PNG, WebP, or GIF.`;
  }

  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return `${name} is ${sizeMb} MB. The limit is ${limitMb} MB.`;
  }

  return "";
}

export function uploadPath(value?: string | null): string {
  if (!value) return "";
  const match = String(value).match(/\/uploads\/[^?#]+/);
  return match ? match[0] : "";
}

export function displayUpload(value?: string | null): string {
  if (!value) return "";
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  const path = uploadPath(value);
  if (!path) return value.startsWith("http") ? value : "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${path}`;
}
