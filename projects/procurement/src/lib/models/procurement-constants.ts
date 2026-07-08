import { SelectOption } from '@nexcore/shared';

/**
 * Common ISO-4217 currencies offered in procurement dropdowns.
 * Stored as the 3-letter code (matches the backend CurrencyCode string fields).
 */
export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'CNY', label: 'CNY — Chinese Yuan' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
];

/** Build SelectOption[] from a numeric-enum label map (e.g. VENDOR_TYPE_LABELS). */
export function enumOptions(labels: Record<number, string>): SelectOption[] {
  return Object.entries(labels).map(([value, label]) => ({ value: Number(value), label }));
}

/**
 * Suggests a human-readable code from a name (Odoo-style), e.g. "Raw Materials" → "RAW-MATERIALS".
 * Ensures uniqueness against `existing` codes by appending -2, -3, … on collision.
 * Used by the "auto-generated code + manual override" form pattern.
 */
export function suggestCode(name: string | null | undefined, existing: (string | null | undefined)[] = []): string {
  const base = (name ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 16);
  if (!base) return '';
  const taken = new Set(existing.filter(Boolean).map(c => String(c).toUpperCase()));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ── Field validators — return an error string, or '' when valid ────────────────

export function requiredText(value: string | null | undefined, field = 'This field'): string {
  return value && value.trim().length > 0 ? '' : `${field} is required.`;
}

export function emailFormat(value: string | null | undefined): string {
  if (!value || !value.trim()) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address.';
}

export function urlFormat(value: string | null | undefined): string {
  if (!value || !value.trim()) return '';
  return /^https?:\/\/[^\s.]+\.\S+$/.test(value.trim()) ? '' : 'Enter a valid URL (https://…).';
}

export function nonNegativeNumber(value: number | null | undefined, field = 'Value'): string {
  if (value === null || value === undefined) return '';
  return value >= 0 ? '' : `${field} cannot be negative.`;
}
