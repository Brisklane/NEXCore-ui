import { ChangeDetectorRef } from '@angular/core';

/**
 * Tracks the id of a freshly created row so {@link AppDataTableComponent} can float
 * it to the top of the table and flash it green. The highlight auto-clears after a
 * short delay.
 *
 * @example
 *   highlighter = new RowHighlighter();
 *   // in a create-success handler, after reloading the list:
 *   this.highlighter.flash(res.data?.id, this.cdr);
 *   // template: <app-data-table [highlightRowId]="highlighter.id" ...>
 */
export class RowHighlighter {
  /** Id of the row to highlight, or null when nothing is highlighted. */
  id: string | number | null = null;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(private durationMs = 4000) {}

  /** Highlight the given row id (no-op when id is null/undefined). */
  flash(id: string | number | null | undefined, cdr?: ChangeDetectorRef): void {
    if (id == null) return;
    this.id = id;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.id = null;
      cdr?.detectChanges();
    }, this.durationMs);
  }

  /** Cancel any pending highlight immediately. */
  clear(): void {
    clearTimeout(this.timer);
    this.id = null;
  }
}
