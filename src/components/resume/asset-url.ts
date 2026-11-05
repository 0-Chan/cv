/** Content paths are relative to the site's root, not the hosting domain. */
export function assetUrl(src: string): string {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}${src}`;
}
