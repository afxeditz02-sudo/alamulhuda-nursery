import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validate that a URL uses a safe scheme (http/https only).
 * Blocks javascript:, data:, vbscript:, file: and other dangerous schemes
 * that could be used for XSS if rendered as an href.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return true; // empty/null is allowed (caller decides if required)
  const trimmed = url.trim();
  if (!trimmed) return true;
  return /^https?:\/\//i.test(trimmed);
}

