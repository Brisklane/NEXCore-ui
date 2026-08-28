import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PillComponent, SkeletonComponent } from './ui';

/* =====================================================================================
 * The record screen.
 *
 * Eighteen things in this application have a page of their own — a property, a booking, a
 * tenancy, a construction contract — and they all have to answer the same three questions in
 * the same three places: what is this, where does it stand, and what may I do about it.
 *
 * So the header is identical everywhere. Identity on the left, the figures that matter on the
 * right, the actions above the fold, and a tab strip beneath. What changes between screens is
 * only the tabs and their contents, which the page itself supplies.
 * ===================================================================================== */

/** A status badge in the header. */
export interface DetailPill {
  label: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger' | 'accent' | 'muted';
  icon?: string;
}

/** A headline figure. Kept to four at most — a header of nine numbers is a header nobody reads. */
export interface DetailFigure {
  label: string;
  value: string;
  hint?: string | null;
}

/** One tab. `count` shows a badge; `tone` colours it when something needs attention. */
export interface DetailTab {
  key: string;
  label: string;
  icon?: string;
  count?: number | null;
  tone?: 'neutral' | 'warning' | 'danger';
}

/** A button in the header. Disabled buttons carry a `reason` so nobody has to guess. */
export interface DetailAction {
  key: string;
  label: string;
  icon?: string;
  tone?: 'default' | 'primary' | 'danger' | 'success';
  disabled?: boolean;
  reason?: string | null;
}

@Component({
  standalone: true,
  selector: 're-detail-page',
  imports: [CommonModule, RouterLink, PillComponent, SkeletonComponent],
  templateUrl: './detail-page.html',
  styleUrls: ['./detail-page.css'],
})
export class DetailPageComponent {
  @Input() backRoute: string | null = null;
  @Input() backLabel = 'Back';

  @Input() title = '';
  @Input() subtitle: string | null = null;
  @Input() reference: string | null = null;
  @Input() photoUrl: string | null = null;
  @Input() icon = 'description';

  @Input() pills: DetailPill[] = [];
  @Input() figures: DetailFigure[] = [];
  @Input() actions: DetailAction[] = [];

  @Input() tabs: DetailTab[] = [];
  @Input() activeTab = '';

  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() notFound = false;
  @Input() notFoundMessage = 'It may have been deleted, or the link may be wrong.';

  @Output() tabChange = new EventEmitter<string>();
  @Output() action = new EventEmitter<string>();
  @Output() retry = new EventEmitter<void>();

  select(key: string): void {
    if (key !== this.activeTab) this.tabChange.emit(key);
  }

  /**
   * Arrow keys move between tabs, as a tab strip is expected to. Without this the only way
   * through eight tabs is eight presses of Tab, which is why people stop using the keyboard.
   */
  onTabKey(event: KeyboardEvent, index: number): void {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;

    event.preventDefault();
    const next = this.tabs[(index + delta + this.tabs.length) % this.tabs.length];
    if (next) {
      this.select(next.key);
      const el = (event.target as HTMLElement).parentElement
        ?.querySelectorAll<HTMLElement>('.re-tab');
      el?.[(index + delta + this.tabs.length) % this.tabs.length]?.focus();
    }
  }

  buttonClass(a: DetailAction): string {
    switch (a.tone) {
      case 'primary': return 're-touch-btn is-primary';
      case 'danger': return 're-touch-btn is-danger';
      case 'success': return 're-touch-btn is-success';
      default: return 're-touch-btn';
    }
  }
}
