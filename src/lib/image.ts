/**
 * Rewrite Supabase Storage URLs to the on-the-fly image transform endpoint
 * so we serve resized + compressed images instead of the original (often
 * multi-megabyte) uploads.
 *
 * Example:
 *   /storage/v1/object/public/site-images/foo.jpg
 *     -> /storage/v1/render/image/public/site-images/foo.jpg?width=800&quality=70
 *
 * Non-Supabase URLs (YouTube thumbs, external links) are returned untouched.
 */
export function imgUrl(url: string | null | undefined, width = 800, quality = 70): string {
  if (!url) return "";
  if (!url.includes("/storage/v1/object/public/")) return url;
  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const sep = transformed.includes("?") ? "&" : "?";
  return `${transformed}${sep}width=${width}&quality=${quality}&resize=contain`;
}
