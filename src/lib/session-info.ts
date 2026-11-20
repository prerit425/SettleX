/** Turn a raw User-Agent header into a short, human-readable device label. */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";

  const os = /Windows NT/.test(userAgent)
    ? "Windows"
    : /Android/.test(userAgent)
      ? "Android"
      : /iPhone|iPad|iPod/.test(userAgent)
        ? "iOS"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown OS";

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\/|Opera/.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Version\/.+Safari/.test(userAgent)
            ? "Safari"
            : "Browser";

  return `${browser} on ${os}`;
}

export function relativeExpiry(expiresAt: Date): string {
  const days = Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Expired";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
}
