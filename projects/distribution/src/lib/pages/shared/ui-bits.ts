import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationMetadata } from '../../models/distribution.models';

/**
 * The server speaks a five-word tone vocabulary — neutral, info, good, warn, bad — and the
 * stylesheet speaks the platform's. One translation, in one place, rather than a ternary chain
 * repeated in thirty templates.
 */
export function toneClass(tone: string | undefined | null): string {
  switch (tone) {
    case 'good': return 'tone-success';
    case 'warn': return 'tone-warning';
    case 'bad': return 'tone-danger';
    case 'info': return 'tone-info';
    case 'brand': return 'tone-brand';
    case 'violet': return 'tone-violet';
    default: return 'tone-neutral';
  }
}

/**
 * A status badge.
 *
 * The label is always rendered as words. Colour is a second channel, never the only one — a
 * cancelled order and a delivered one must be distinguishable on a monochrome warehouse screen
 * and to anyone who cannot separate red from green.
 */
@Component({
  standalone: true,
  selector: 'dst-status',
  imports: [CommonModule],
  template: `
    <span class="dst-pill" [class]="'dst-pill ' + cls" [class.is-lg]="large">
      @if (icon) { <span class="material-symbols-outlined">{{ icon }}</span> }
      {{ label }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; min-width: 0; }
    .dst-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 999px;
      font-size: 11.5px; font-weight: 700; white-space: nowrap;
      border: 1px solid transparent;
    }
    .dst-pill.is-lg { padding: 5px 13px; font-size: 12.5px; }
    .dst-pill .material-symbols-outlined { font-size: 14px; }
    .tone-neutral { background: var(--neutral-soft, #f1f5f9); color: var(--neutral-text, #64748b); border-color: var(--neutral-border, #e2e8f0); }
    .tone-success { background: var(--success-soft, #dcfce7); color: var(--success-text, #15803d); border-color: var(--success-border, #bbf7d0); }
    .tone-warning { background: var(--warning-soft, #fef3c7); color: var(--warning-text, #92400e); border-color: var(--warning-border, #fde68a); }
    .tone-danger  { background: var(--danger-soft, #fef2f2);  color: var(--danger-text, #b91c1c);  border-color: var(--danger-border, #fecaca); }
    .tone-info    { background: var(--info-soft, #dbeafe);    color: var(--info-text, #1d4ed8);    border-color: var(--info-border, #bfdbfe); }
    .tone-violet  { background: var(--violet-soft, #ede9fe);  color: var(--violet-text, #6d28d9);  border-color: var(--violet-border, #ddd6fe); }
    .tone-brand   { background: var(--accent-soft, rgba(43,127,255,.1)); color: var(--accent, #2b7fff); border-color: var(--accent-border, rgba(43,127,255,.25)); }
  `],
})
export class StatusPillComponent {
  @Input() label = '';
  @Input() icon?: string;
  @Input() large = false;

  /** Server tone word, or a `tone-*` class directly. */
  @Input() set tone(value: string | undefined | null) {
    this.cls = value?.startsWith('tone-') ? value : toneClass(value);
  }

  cls = 'tone-neutral';
}

/**
 * Page controls for a server-paginated list.
 *
 * Shows the range and the total rather than only page numbers — "61–90 of 1,204" tells someone
 * how much is left, which is the question a page number does not answer.
 */
@Component({
  standalone: true,
  selector: 'dst-pager',
  imports: [CommonModule, FormsModule],
  template: `
    @if (meta && meta.totalCount > 0) {
      <div class="dst-pager">
        <span class="dst-pager-info">
          {{ firstRow | number }}–{{ lastRow | number }} of {{ meta.totalCount | number }} {{ noun }}
        </span>

        <div class="dst-pager-controls">
          <label class="size">
            <span class="dst-sr-only">Rows per page</span>
            <select [ngModel]="meta.pageSize" (ngModelChange)="sizeChange.emit(+$event)">
              @for (n of sizes; track n) { <option [value]="n">{{ n }} / page</option> }
            </select>
          </label>

          <button type="button" (click)="pageChange.emit(1)" [disabled]="meta.pageNumber <= 1" aria-label="First page">
            <span class="material-symbols-outlined">first_page</span>
          </button>
          <button type="button" (click)="pageChange.emit(meta.pageNumber - 1)" [disabled]="!meta.hasPrevious" aria-label="Previous page">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span class="page-of">{{ meta.pageNumber }} / {{ meta.totalPages }}</span>
          <button type="button" (click)="pageChange.emit(meta.pageNumber + 1)" [disabled]="!meta.hasNext" aria-label="Next page">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
          <button type="button" (click)="pageChange.emit(meta.totalPages)" [disabled]="meta.pageNumber >= meta.totalPages" aria-label="Last page">
            <span class="material-symbols-outlined">last_page</span>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .dst-pager {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; padding: 12px 4px 0; flex-wrap: wrap;
    }
    .dst-pager-info { font-size: 12.5px; color: var(--text-muted, #94a3b8); font-variant-numeric: tabular-nums; }
    .dst-pager-controls { display: flex; align-items: center; gap: 6px; }
    .dst-pager-controls button {
      min-width: 34px; height: 34px; padding: 0 8px; border-radius: 9px;
      border: 1px solid var(--border-default, #e6eaf0);
      background: var(--bg-surface, #fff); color: var(--text-secondary, #64748b);
      cursor: pointer; display: inline-grid; place-items: center; font-family: inherit;
    }
    .dst-pager-controls button:hover:not(:disabled) { border-color: var(--accent, #2b7fff); color: var(--accent, #2b7fff); }
    .dst-pager-controls button:disabled { opacity: .4; cursor: not-allowed; }
    .dst-pager-controls button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
    .material-symbols-outlined { font-size: 18px; }
    .page-of {
      font-size: 12.5px; font-weight: 700; color: var(--text-secondary, #64748b);
      padding: 0 6px; font-variant-numeric: tabular-nums; white-space: nowrap;
    }
    .size select {
      height: 34px; padding: 0 8px; border-radius: 9px;
      border: 1px solid var(--border-default, #e6eaf0);
      background: var(--bg-surface, #fff); color: var(--text-secondary, #64748b);
      font-size: 12.5px; font-weight: 650; font-family: inherit; margin-right: 4px;
    }
    .dst-sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }
  `],
})
export class PagerComponent {
  @Input() meta: PaginationMetadata | null = null;
  @Input() noun = 'rows';
  @Input() sizes = [25, 50, 100, 200];

  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  get firstRow(): number {
    if (!this.meta) return 0;
    return (this.meta.pageNumber - 1) * this.meta.pageSize + 1;
  }

  get lastRow(): number {
    if (!this.meta) return 0;
    return Math.min(this.meta.pageNumber * this.meta.pageSize, this.meta.totalCount);
  }
}

/**
 * The nothing-here state.
 *
 * Always says what would put something here, because "No results" on its own leaves someone
 * wondering whether the screen is broken or the day is quiet.
 */
@Component({
  standalone: true,
  selector: 'dst-empty',
  imports: [CommonModule],
  template: `
    <div class="dst-empty">
      <div class="dst-empty-icon"><span class="material-symbols-outlined">{{ icon }}</span></div>
      <div class="dst-empty-title">{{ title }}</div>
      @if (text) { <p class="dst-empty-text">{{ text }}</p> }
      @if (actionLabel) {
        <button type="button" class="dst-btn is-primary" (click)="action.emit()">
          @if (actionIcon) { <span class="material-symbols-outlined">{{ actionIcon }}</span> }
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .dst-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; padding: 52px 24px; text-align: center;
    }
    .dst-empty-icon {
      width: 62px; height: 62px; border-radius: 18px; display: grid; place-items: center;
      background: var(--accent-soft, rgba(43,127,255,.1)); color: var(--accent, #2b7fff);
    }
    .dst-empty-icon .material-symbols-outlined { font-size: 30px; }
    .dst-empty-title { font-size: 15.5px; font-weight: 750; color: var(--text-heading, #0f172a); }
    .dst-empty-text { font-size: 13px; color: var(--text-muted, #94a3b8); max-width: 400px; line-height: 1.55; margin: 0; }
    .dst-btn {
      min-height: 40px; padding: 9px 16px; border-radius: 10px; border: 1px solid transparent;
      background: var(--accent, #2b7fff); color: var(--accent-contrast, #fff);
      font-size: 13.5px; font-weight: 650; font-family: inherit; cursor: pointer;
      display: inline-flex; align-items: center; gap: 7px; margin-top: 4px;
    }
    .dst-btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }
    .dst-btn .material-symbols-outlined { font-size: 18px; }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() text = '';
  @Input() actionLabel = '';
  @Input() actionIcon = '';
  @Output() action = new EventEmitter<void>();
}

/**
 * Confirmation for something that cannot simply be undone.
 *
 * Destructive confirmations ask for a reason rather than a yes, because a cancelled order or a
 * reversed settlement is a question somebody will ask about later, and "are you sure" records
 * nothing worth having.
 */
@Component({
  standalone: true,
  selector: 'dst-confirm',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dst-modal-backdrop" (click)="cancel.emit()">
      <div class="dst-modal is-narrow" role="dialog" aria-modal="true" [attr.aria-label]="title" (click)="$event.stopPropagation()">
        <div class="dst-modal-head">
          <div>
            <div class="dst-modal-title">{{ title }}</div>
            @if (message) { <div class="dst-modal-sub">{{ message }}</div> }
          </div>
          <button type="button" class="dst-close" (click)="cancel.emit()" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        @if (needsReason) {
          <div class="dst-modal-body">
            <div class="dst-field">
              <label for="dst-confirm-reason">{{ reasonLabel }} <span class="req">*</span></label>
              <textarea
                id="dst-confirm-reason"
                [(ngModel)]="reason"
                [class.is-invalid]="touched && !reason.trim()"
                [placeholder]="reasonPlaceholder"
              ></textarea>
              @if (touched && !reason.trim()) {
                <span class="err" role="alert">
                  <span class="material-symbols-outlined">error</span>This needs a reason before it can go ahead.
                </span>
              }
            </div>
          </div>
        }

        <div class="dst-modal-foot">
          <button type="button" class="dst-btn" (click)="cancel.emit()">{{ cancelLabel }}</button>
          <button type="button" class="dst-btn" [class.is-danger]="destructive" [class.is-primary]="!destructive" (click)="go()">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dst-modal-backdrop {
      position: fixed; inset: 0; z-index: 1300;
      background: var(--bg-overlay, rgba(15,23,42,.45));
      display: grid; place-items: center; padding: 20px; backdrop-filter: blur(2px);
    }
    .dst-modal {
      width: min(460px, 100%); display: flex; flex-direction: column;
      background: var(--bg-elevated, #fff); border: 1px solid var(--border-default, #e6eaf0);
      border-radius: 18px; box-shadow: var(--shadow-lg, 0 24px 60px rgba(15,23,42,.22)); overflow: hidden;
    }
    .dst-modal-head {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
      padding: 16px 20px; border-bottom: 1px solid var(--border-light, #eef1f5);
    }
    .dst-modal-title { font-size: 16px; font-weight: 780; color: var(--text-heading, #0f172a); }
    .dst-modal-sub { font-size: 12.5px; color: var(--text-muted, #94a3b8); margin-top: 4px; line-height: 1.55; }
    .dst-modal-body { padding: 18px 20px; }
    .dst-modal-foot {
      display: flex; align-items: center; justify-content: flex-end; gap: 10px;
      padding: 14px 20px; border-top: 1px solid var(--border-light, #eef1f5);
      background: var(--bg-subtle, #f8fafc);
    }
    .dst-close {
      width: 36px; height: 36px; border-radius: 10px; border: none; background: transparent;
      color: var(--text-muted, #94a3b8); cursor: pointer; display: grid; place-items: center; flex-shrink: 0;
    }
    .dst-close:hover { background: var(--bg-muted, #f1f5f9); }
    .dst-field { display: flex; flex-direction: column; gap: 6px; }
    .dst-field label { font-size: 12px; font-weight: 650; color: var(--input-label, #334155); }
    .dst-field .req { color: var(--danger, #ef4444); }
    .dst-field textarea {
      min-height: 88px; padding: 9px 12px; border-radius: 10px; resize: vertical;
      border: 1px solid var(--input-border, #cbd5e1); background: var(--input-bg, #fff);
      color: var(--input-text, #1e293b); font-size: 13.5px; font-family: inherit; width: 100%;
    }
    .dst-field textarea.is-invalid { border-color: var(--danger, #ef4444); background: var(--input-error-bg, #fff6f6); }
    .dst-field textarea:focus { outline: none; border-color: var(--accent, #2b7fff); box-shadow: 0 0 0 3px var(--input-ring, rgba(43,127,255,.15)); }
    .err {
      display: flex; align-items: flex-start; gap: 5px; font-size: 11.5px;
      font-weight: 600; color: var(--danger-text, #b91c1c);
    }
    .err .material-symbols-outlined { font-size: 14px; }
    .dst-btn {
      min-height: 40px; padding: 9px 16px; border-radius: 10px;
      border: 1px solid var(--border-strong, #cbd5e1); background: var(--bg-surface, #fff);
      color: var(--text-heading, #0f172a); font-size: 13.5px; font-weight: 650;
      font-family: inherit; cursor: pointer;
    }
    .dst-btn.is-primary { background: var(--accent, #2b7fff); border-color: transparent; color: var(--accent-contrast, #fff); }
    .dst-btn.is-danger { background: var(--danger, #ef4444); border-color: transparent; color: #fff; }
    .dst-btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }
  `],
})
export class ConfirmDialogComponent {
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() destructive = false;
  @Input() needsReason = false;
  @Input() reasonLabel = 'Reason';
  @Input() reasonPlaceholder = 'What happened, in a sentence?';

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  reason = '';
  touched = false;

  go(): void {
    this.touched = true;
    if (this.needsReason && !this.reason.trim()) return;
    this.confirm.emit(this.reason.trim());
  }
}

/** Placeholder rows while a table loads, so the layout does not jump when data arrives. */
@Component({
  standalone: true,
  selector: 'dst-skeleton-rows',
  imports: [CommonModule],
  template: `
    <div class="sk" aria-hidden="true">
      @for (i of rowArray; track i) { <div class="sk-row" [style.height.px]="height"></div> }
    </div>
  `,
  styles: [`
    .sk { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
    .sk-row {
      border-radius: 10px;
      background: linear-gradient(90deg,
        var(--bg-muted, #f1f5f9) 25%, var(--bg-inset, #e9eef5) 37%, var(--bg-muted, #f1f5f9) 63%);
      background-size: 400% 100%;
      animation: dst-sk 1.3s ease-in-out infinite;
    }
    @keyframes dst-sk { from { background-position: 100% 50%; } to { background-position: 0 50%; } }
    @media (prefers-reduced-motion: reduce) { .sk-row { animation: none; } }
  `],
})
export class SkeletonRowsComponent {
  @Input() set rows(n: number) { this.rowArray = Array.from({ length: n }, (_, i) => i); }
  @Input() height = 44;
  rowArray = [0, 1, 2, 3, 4, 5];
}
