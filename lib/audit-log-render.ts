/**
 * Reads the `details` column written by `auditDetails()` (see
 * lib/audit-log.ts) and turns it into display text in the viewer's
 * language. Falls back to showing older, pre-i18n rows (plain English
 * sentences, not JSON) exactly as they were saved.
 *
 * `t` should be a next-intl translator scoped to the "auditLog" namespace,
 * e.g. `useTranslations("auditLog")` or `await getTranslations("auditLog")`.
 */
export function resolveAuditDetails(
    details: string | null | undefined,
    t: (key: string, params?: Record<string, string | number>) => string,
    fallback: string
): string {
    if (!details) return fallback;
    try {
        const parsed = JSON.parse(details);
        if (parsed && typeof parsed === "object" && typeof parsed.key === "string") {
            return t(parsed.key, parsed.params || {});
        }
    } catch {
        // Not JSON — a legacy plain-text entry, display as-is.
    }
    return details;
}