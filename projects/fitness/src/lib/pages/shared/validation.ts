import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Field name → the message to show under that field. */
export type FieldErrors = Record<string, string>;

/**
 * One validation rule. Returns a message when the value is wrong, or null when it is fine.
 *
 * Messages are written as instructions ("Give the plan a name"), not accusations ("Name is
 * required"), and they name the actual thing on screen. A person who has just been stopped from
 * saving wants to know what to do next, not which field failed a schema.
 */
export type Rule<T> = (value: T, all: Record<string, unknown>) => string | null;

export const required = (label: string): Rule<unknown> =>
  v => (v === null || v === undefined || String(v).trim() === '') ? `${label} is needed.` : null;

export const minLength = (n: number, label: string): Rule<string> =>
  v => (v ?? '').trim().length > 0 && (v ?? '').trim().length < n
    ? `${label} needs at least ${n} characters.` : null;

export const maxLength = (n: number, label: string): Rule<string> =>
  v => (v ?? '').length > n ? `${label} is too long — keep it under ${n} characters.` : null;

export const positive = (label: string): Rule<number | null> =>
  v => v !== null && v !== undefined && Number(v) <= 0
    ? `${label} must be more than zero.` : null;

export const notNegative = (label: string): Rule<number | null> =>
  v => v !== null && v !== undefined && Number(v) < 0
    ? `${label} cannot be negative.` : null;

export const between = (min: number, max: number, label: string): Rule<number | null> =>
  v => v !== null && v !== undefined && (Number(v) < min || Number(v) > max)
    ? `${label} must be between ${min} and ${max}.` : null;

export const digits = (min: number, max: number, label: string): Rule<string> =>
  v => {
    const s = (v ?? '').trim();
    if (!s) return null;
    if (!/^\d+$/.test(s)) return `${label} must be digits only.`;
    if (s.length < min || s.length > max) return `${label} must be ${min} to ${max} digits.`;
    return null;
  };

export const email = (label = 'Email'): Rule<string> =>
  v => (v ?? '').trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v ?? '').trim())
    ? `${label} does not look like an email address.` : null;

/** Cross-field: this value must be greater than another named field. */
export const greaterThanField = (other: string, label: string, otherLabel: string): Rule<number | null> =>
  (v, all) => {
    const a = Number(v);
    const b = Number(all[other]);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    return a <= b ? `${label} must be above ${otherLabel.toLowerCase()}.` : null;
  };

/** A date/time that has to be in the future. */
export const inFuture = (label: string): Rule<string> =>
  v => {
    if (!v) return null;
    return new Date(v).getTime() < Date.now() - 60_000
      ? `${label} is in the past.` : null;
  };

/**
 * Runs a rule set over an object and returns only the fields that failed.
 *
 * Everything is validated in one pass rather than stopping at the first failure, so a person
 * fixes one form once instead of discovering problems one at a time.
 */
export function validate<T extends Record<string, unknown>>(
  model: T,
  rules: Partial<Record<keyof T & string, Rule<never>[]>>,
): FieldErrors {
  const errors: FieldErrors = {};

  for (const [field, fieldRules] of Object.entries(rules) as [string, Rule<never>[]][]) {
    for (const rule of fieldRules ?? []) {
      const message = (rule as Rule<unknown>)(model[field], model);
      if (message) { errors[field] = message; break; }
    }
  }

  return errors;
}

/** Plain-language summary for the top of a dialog: "3 things need fixing". */
export function summarise(errors: FieldErrors): string {
  const count = Object.keys(errors).length;
  if (count === 0) return '';
  return count === 1
    ? 'One thing needs fixing before this can be saved.'
    : `${count} things need fixing before this can be saved.`;
}

/**
 * The message under a single field.
 *
 * Rendered with `role="alert"` so a screen reader announces it the moment it appears, and tied to
 * the input by id so the association is not purely visual.
 */
@Component({
  standalone: true,
  selector: 'fit-field-error',
  imports: [CommonModule],
  template: `
    @if (message) {
      <span class="fe" role="alert" [id]="for ? for + '-error' : null">
        <span class="material-symbols-outlined">error</span>{{ message }}
      </span>
    }
  `,
  styles: [`
    .fe {
      display: flex; align-items: flex-start; gap: 5px;
      margin-top: 3px; font-size: 11.5px; line-height: 1.45; font-weight: 600;
      color: var(--danger-text, #b91c1c);
    }
    .fe .material-symbols-outlined { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
  `],
})
export class FieldErrorComponent {
  @Input() message?: string | null;

  /** Id of the input this belongs to, so it can be referenced by `aria-describedby`. */
  @Input() for?: string;
}
