/**
 * Only allow same-origin, relative paths after authentication.
 * Blocks protocol-relative URLs (`//evil.com`), backslashes and control
 * characters that browsers or frameworks could interpret differently.
 */
export function safeNextPath(value: unknown): string {
  const next = typeof value === "string" ? value : "";
  if (
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !next.includes("\n") &&
    !next.includes("\r")
  ) {
    return next;
  }
  return "/dashboard";
}
