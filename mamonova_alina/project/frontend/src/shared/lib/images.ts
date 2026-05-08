export function resolveImageSrc(
  src: string | null | undefined,
  prefix = "/goods/",
) {
  const s = (src ?? "").trim();
  if (!s) return "";
  if (s.startsWith("/")) return s;
  return `${prefix}${s}`;
}
