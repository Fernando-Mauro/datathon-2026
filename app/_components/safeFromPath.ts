/**
 * Validate a `?from=` query value before passing to `router.replace`.
 *
 * Allowlist:
 *   - Must be a string
 *   - Length ≤ 512 chars
 *   - Must start with "/"
 *   - Must NOT start with "//" (protocol-relative URL → external host)
 *   - Must NOT start with "/login" (loop)
 *   - Must NOT contain backslash or null byte
 *
 * Returns the path unchanged if safe, else `null`.
 *
 * Why not URL.parse: `router.replace` treats any string-prefix `/` (and not `//`)
 * as same-origin path nav. URL.parse adds work without changing the conclusion.
 */
export function safeFromPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length === 0 || raw.length > 512) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.startsWith("/\\")) return null;
  if (raw.startsWith("/login")) return null;
  if (raw.includes("\\") || raw.includes("\0")) return null;
  return raw;
}
