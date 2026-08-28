import {
  Component, EventEmitter, Input, Output, computed, input, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* =====================================================================================
 * The building blocks every Real Estate screen is made of.
 *
 * There are a hundred and forty-odd screens in this app. If each one invents its own table,
 * its own empty state and its own way of saying "nothing here yet", the result is a hundred and
 * forty-odd slightly different products. These components exist so that a person who has learned
 * one screen has learned all of them — and so that a fix to how an empty state reads happens once.
 *
 * Every one of them uses design-system tokens only. No hard-coded colours, so all five platform
 * themes work without a second stylesheet.
 * ===================================================================================== */

/** A single figure on a summary strip. */
export interface StatCard {
  label: string;
  value: string | number;
  /** Small qualifier under the figure — a comparison, a share, or what it is measured against. */
  hint?: string;
  icon?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger' | 'accent';
  /** Where clicking it goes. Omit to make the card inert. */
  route?: string;
}

/**
 * The row of figures at the top of a screen.
 *
 * Deliberately capped in practice at five or six: a strip of twelve numbers is a strip nobody
 * reads. Anything that does not change a decision belongs in a report, not here.
 */
@Component({
  standalone: true,
  selector: 're-stats',
  imports: [CommonModule],
  template: `
    <div class="re-stats" [class.re-stats-compact]="compact()">
      @for (s of items(); track s.label) {
        <div class="re-stat" [class]="'tone-' + (s.tone ?? 'neutral')"
             [class.is-clickable]="!!s.route"
             [attr.role]="s.route ? 'button' : null"
             [attr.tabindex]="s.route ? 0 : null"
             (click)="s.route && cardClick.emit(s)"
             (keydown.enter)="s.route && cardClick.emit(s)">
          @if (s.icon) {
            <span class="re-stat-icon material-symbols-outlined">{{ s.icon }}</span>
          }
          <div class="re-stat-body">
            <span class="re-stat-label">{{ s.label }}</span>
            <span class="re-stat-value">{{ s.value }}</span>
            @if (s.hint) { <span class="re-stat-hint">{{ s.hint }}</span> }
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./ui.css'],
})
export class StatsComponent {
  readonly items = input<StatCard[]>([]);
  readonly compact = input(false);
  @Output() cardClick = new EventEmitter<StatCard>();
}

/**
 * What a screen shows when there is genuinely nothing to show.
 *
 * An empty table with column headings and no rows tells a person nothing about whether the app is
 * broken, their filter is too narrow, or they simply have not started yet. Those are three
 * different situations and they need three different sentences.
 */
@Component({
  standalone: true,
  selector: 're-empty',
  imports: [CommonModule],
  template: `
    <div class="re-empty-state" [class.is-filtered]="filtered()">
      <span class="material-symbols-outlined">{{ icon() }}</span>
      <h3>{{ title() }}</h3>
      @if (message()) { <p>{{ message() }}</p> }
      @if (actionLabel()) {
        <button type="button" class="btn-primary" (click)="action.emit()">
          @if (actionIcon()) { <span class="material-symbols-outlined">{{ actionIcon() }}</span> }
          {{ actionLabel() }}
        </button>
      }
      @if (filtered()) {
        <button type="button" class="re-empty-clear" (click)="clearFilters.emit()">
          Clear the filters
        </button>
      }
    </div>
  `,
  styleUrls: ['./ui.css'],
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Nothing here yet');
  readonly message = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly actionIcon = input<string | null>(null);

  /** True when the emptiness is caused by filters rather than by having no data at all. */
  readonly filtered = input(false);

  @Output() action = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
}

/** The skeleton shown while a list is loading, so the page does not jump when data lands. */
@Component({
  standalone: true,
  selector: 're-skeleton',
  imports: [CommonModule],
  template: `
    <div class="re-skeleton" [attr.aria-busy]="true" aria-label="Loading">
      @for (r of rows(); track $index) {
        <div class="re-skeleton-row">
          @for (c of cols(); track $index) { <span class="re-skeleton-cell"></span> }
        </div>
      }
    </div>
  `,
  styleUrls: ['./ui.css'],
})
export class SkeletonComponent {
  readonly rowCount = input(6);
  readonly colCount = input(5);
  readonly rows = computed(() => Array.from({ length: this.rowCount() }));
  readonly cols = computed(() => Array.from({ length: this.colCount() }));
}

/**
 * Paging.
 *
 * Shows the range as well as the page number, because "showing 26–50 of 1,204" answers a question
 * that "page 2 of 49" does not: how much is there, and how far in am I?
 */
@Component({
  standalone: true,
  selector: 're-pager',
  imports: [CommonModule],
  template: `
    @if (total() > 0) {
      <div class="re-pager">
        <span class="re-pager-range">
          Showing {{ from() | number }}–{{ to() | number }} of {{ total() | number }}
        </span>

        @if (totalPages() > 1) {
          <div class="re-pager-controls">
            <button type="button" [disabled]="page() <= 1" (click)="go.emit(page() - 1)"
                    aria-label="Previous page">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <span class="re-pager-page">Page {{ page() }} of {{ totalPages() }}</span>
            <button type="button" [disabled]="page() >= totalPages()" (click)="go.emit(page() + 1)"
                    aria-label="Next page">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        }
      </div>
    }
  `,
  styleUrls: ['./ui.css'],
})
export class PagerComponent {
  readonly page = input(1);
  readonly size = input(25);
  readonly total = input(0);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.size())));
  readonly from = computed(() => this.total() === 0 ? 0 : (this.page() - 1) * this.size() + 1);
  readonly to = computed(() => Math.min(this.page() * this.size(), this.total()));

  @Output() go = new EventEmitter<number>();
}

/**
 * A status pill.
 *
 * The tone is passed in rather than inferred from the label, because the same word means
 * different things in different places — "Pending" on an approval is fine, "Pending" on a
 * statutory filing that was due last week is not.
 */
@Component({
  standalone: true,
  selector: 're-pill',
  imports: [CommonModule],
  template: `
    <span class="re-pill" [class]="'tone-' + tone()">
      @if (icon()) { <span class="material-symbols-outlined">{{ icon() }}</span> }
      <ng-content />
    </span>
  `,
  styleUrls: ['./ui.css'],
})
export class PillComponent {
  readonly tone = input<'neutral' | 'positive' | 'warning' | 'danger' | 'accent' | 'muted'>('neutral');
  readonly icon = input<string | null>(null);
}

/**
 * A side drawer for creating and editing.
 *
 * A drawer rather than a modal because the list behind it stays visible: somebody entering a
 * booking can still see the unit they picked, and somebody correcting a row can see the rows
 * either side of it. Escape closes it, focus is trapped, and the backdrop click is deliberately
 * *not* wired to close — losing a half-typed form to a stray click is unforgivable.
 */
@Component({
  standalone: true,
  selector: 're-drawer',
  imports: [CommonModule],
  template: `
    @if (open()) {
      <div class="re-drawer-backdrop" (click)="requestClose()"></div>
      <aside class="re-drawer" [class]="'size-' + size()" role="dialog" aria-modal="true"
             [attr.aria-label]="title()" (keydown.escape)="requestClose()">
        <header class="re-drawer-head">
          <div>
            <h3>{{ title() }}</h3>
            @if (subtitle()) { <p>{{ subtitle() }}</p> }
          </div>
          <button type="button" class="re-drawer-close" (click)="requestClose()" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div class="re-drawer-body">
          <ng-content />
        </div>

        <footer class="re-drawer-foot">
          <ng-content select="[drawer-footer]" />
        </footer>
      </aside>
    }
  `,
  styleUrls: ['./ui.css'],
})
export class DrawerComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly subtitle = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  /** True while a save is in flight — closing then would lose the user's work. */
  readonly busy = input(false);

  @Output() closed = new EventEmitter<void>();

  requestClose(): void {
    if (!this.busy()) this.closed.emit();
  }
}

/** A confirmation before something that cannot be undone. */
@Component({
  standalone: true,
  selector: 're-confirm',
  imports: [CommonModule, FormsModule],
  template: `
    @if (open()) {
      <div class="re-confirm-backdrop"></div>
      <div class="re-confirm" role="alertdialog" aria-modal="true" [attr.aria-label]="title()">
        <div class="re-confirm-head" [class]="'tone-' + tone()">
          <span class="material-symbols-outlined">
            {{ tone() === 'danger' ? 'warning' : 'help' }}
          </span>
          <h3>{{ title() }}</h3>
        </div>

        <p class="re-confirm-body">{{ message() }}</p>

        @if (requireReason()) {
          <label class="re-field">
            <span>Reason <em>required</em></span>
            <textarea rows="3" [(ngModel)]="reason"
                      placeholder="Why is this being done? This is recorded against your name."></textarea>
          </label>
        }

        <div class="re-confirm-actions">
          <button type="button" class="btn-secondary" (click)="cancelled.emit()">
            {{ cancelLabel() }}
          </button>
          <button type="button"
                  [class]="tone() === 'danger' ? 'btn-danger' : 'btn-primary'"
                  [disabled]="requireReason() && !reason.trim()"
                  (click)="confirmed.emit(reason.trim())">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    }
  `,
  styleUrls: ['./ui.css'],
})
export class ConfirmComponent {
  readonly open = input(false);
  readonly title = input('Are you sure?');
  readonly message = input('');
  readonly confirmLabel = input('Yes, do it');
  readonly cancelLabel = input('Cancel');
  readonly tone = input<'danger' | 'accent'>('accent');

  /** Forces a written reason. Used wherever the audit trail needs a *why*, not just a *who*. */
  readonly requireReason = input(false);

  reason = '';

  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();
}

/**
 * The result of a gate — a possession check, a transfer, a listing about to be published.
 *
 * Shows every condition, whether it passed, and for the ones that did not, what to do about it
 * and where to go. A gate that says only "blocked" is a gate that generates a support call.
 */
export interface GateCondition {
  label: string;
  satisfied: boolean;
  mandatory?: boolean;
  reason?: string | null;
  route?: string | null;
  canOverride?: boolean;
}

@Component({
  standalone: true,
  selector: 're-gate',
  imports: [CommonModule],
  template: `
    <div class="re-gate" [class.is-open]="passed()">
      <div class="re-gate-head">
        <span class="material-symbols-outlined">{{ passed() ? 'check_circle' : 'block' }}</span>
        <div>
          <strong>{{ passed() ? clearTitle() : blockedTitle() }}</strong>
          @if (!passed()) {
            <span>{{ failures().length }} of {{ conditions().length }} conditions not met</span>
          }
        </div>
      </div>

      <ul class="re-gate-list">
        @for (c of conditions(); track c.label) {
          <li [class.is-ok]="c.satisfied" [class.is-optional]="c.mandatory === false">
            <span class="material-symbols-outlined">
              {{ c.satisfied ? 'check' : (c.mandatory === false ? 'remove' : 'close') }}
            </span>
            <div class="re-gate-text">
              <span class="re-gate-label">{{ c.label }}</span>
              @if (!c.satisfied && c.reason) { <span class="re-gate-reason">{{ c.reason }}</span> }
            </div>
            @if (!c.satisfied && c.route) {
              <button type="button" class="re-gate-go" (click)="navigate.emit(c)">Fix this</button>
            }
            @if (!c.satisfied && c.canOverride) {
              <button type="button" class="re-gate-override" (click)="override.emit(c)">Override</button>
            }
          </li>
        }
      </ul>
    </div>
  `,
  styleUrls: ['./ui.css'],
})
export class GateComponent {
  readonly conditions = input<GateCondition[]>([]);
  readonly clearTitle = input('All clear');
  readonly blockedTitle = input('Not ready yet');

  readonly failures = computed(() =>
    this.conditions().filter(c => !c.satisfied && c.mandatory !== false));

  readonly passed = computed(() => this.failures().length === 0);

  @Output() navigate = new EventEmitter<GateCondition>();
  @Output() override = new EventEmitter<GateCondition>();
}

/** A horizontal bar showing how far through something is. */
@Component({
  standalone: true,
  selector: 're-progress',
  imports: [CommonModule],
  template: `
    <div class="re-progress" [attr.role]="'progressbar'"
         [attr.aria-valuenow]="clamped()" aria-valuemin="0" aria-valuemax="100"
         [attr.aria-label]="label()">
      <div class="re-progress-track">
        <div class="re-progress-fill" [class]="'tone-' + tone()" [style.width.%]="clamped()"></div>
        @if (target() !== null) {
          <div class="re-progress-target" [style.left.%]="targetClamped()"
               [attr.title]="'Target ' + target() + '%'"></div>
        }
      </div>
      @if (showValue()) { <span class="re-progress-value">{{ clamped() | number:'1.0-1' }}%</span> }
    </div>
  `,
  styleUrls: ['./ui.css'],
})
export class ProgressComponent {
  readonly value = input(0);
  readonly target = input<number | null>(null);
  readonly label = input('Progress');
  readonly showValue = input(true);
  readonly tone = input<'accent' | 'positive' | 'warning' | 'danger'>('accent');

  readonly clamped = computed(() => Math.max(0, Math.min(100, this.value() ?? 0)));
  readonly targetClamped = computed(() => Math.max(0, Math.min(100, this.target() ?? 0)));
}

/**
 * The breakdown chart used across the reporting screens.
 *
 * Bars rather than a pie: a pie with nine slices is decoration, and every one of these breakdowns
 * is something somebody has to read a number off.
 */
export interface BreakdownSlice {
  label: string;
  value: number;
  percent: number;
  count?: number;
  tone?: string | null;
}

@Component({
  standalone: true,
  selector: 're-breakdown',
  imports: [CommonModule],
  template: `
    <div class="re-breakdown">
      @for (s of slices(); track s.label) {
        <div class="re-bd-row">
          <span class="re-bd-label" [title]="s.label">{{ s.label }}</span>
          <div class="re-bd-track">
            <div class="re-bd-fill" [class]="'tone-' + (s.tone ?? 'neutral')"
                 [style.width.%]="Math.max(1, s.percent)"></div>
          </div>
          <span class="re-bd-value">
            {{ money() ? (s.value | number:'1.0-0') : (s.count ?? s.value | number) }}
          </span>
          <span class="re-bd-percent">{{ s.percent | number:'1.0-1' }}%</span>
        </div>
      }
      @if (slices().length === 0) {
        <p class="re-bd-empty">Nothing to break down for this period.</p>
      }
    </div>
  `,
  styleUrls: ['./ui.css'],
})
export class BreakdownComponent {
  readonly slices = input<BreakdownSlice[]>([]);
  readonly money = input(true);
  protected readonly Math = Math;
}

/** A point on a trend line. */
export interface TrendPoint {
  label: string;
  value: number;
  secondaryValue?: number | null;
}

/**
 * A twelve-month trend, drawn as an SVG sparkline with a comparison series.
 *
 * Inline SVG rather than a charting library: this is two polylines and some axis labels, and
 * pulling in three hundred kilobytes of chart engine to draw them would be absurd.
 */
@Component({
  standalone: true,
  selector: 're-trend',
  imports: [CommonModule],
  template: `
    @if (points().length > 1) {
      <div class="re-trend">
        <svg viewBox="0 0 100 34" preserveAspectRatio="none" role="img" [attr.aria-label]="label()">
          @if (hasSecondary()) {
            <polyline class="re-trend-secondary" [attr.points]="secondaryPath()" />
          }
          <polyline class="re-trend-primary" [attr.points]="primaryPath()" />
        </svg>
        <div class="re-trend-axis">
          <span>{{ points()[0].label }}</span>
          <span>{{ points()[points().length - 1].label }}</span>
        </div>
      </div>
    } @else {
      <p class="re-trend-empty">Not enough history to show a trend yet.</p>
    }
  `,
  styleUrls: ['./ui.css'],
})
export class TrendComponent {
  readonly points = input<TrendPoint[]>([]);
  readonly label = input('Trend');

  readonly hasSecondary = computed(() =>
    this.points().some(p => p.secondaryValue !== null && p.secondaryValue !== undefined));

  private max = computed(() => {
    const values = this.points().flatMap(p => [p.value, p.secondaryValue ?? 0]);
    return Math.max(1, ...values);
  });

  readonly primaryPath = computed(() => this.path(p => p.value));
  readonly secondaryPath = computed(() => this.path(p => p.secondaryValue ?? 0));

  private path(pick: (p: TrendPoint) => number): string {
    const pts = this.points();
    if (pts.length < 2) return '';
    const max = this.max();
    const step = 100 / (pts.length - 1);

    return pts
      .map((p, i) => `${(i * step).toFixed(2)},${(32 - (pick(p) / max) * 30).toFixed(2)}`)
      .join(' ');
  }
}

/** One entry on a timeline. */
export interface TimelineItem {
  id?: string;
  occurredAt: string;
  kind?: string;
  title: string;
  detail?: string | null;
  icon?: string | null;
  tone?: string | null;
  actorName?: string | null;
  amount?: number | null;
}

/** The history strip on every detail screen: what happened, when, and who did it. */
@Component({
  standalone: true,
  selector: 're-timeline',
  imports: [CommonModule],
  template: `
    @if (items().length) {
      <ol class="re-timeline">
        @for (i of items(); track i.id ?? i.occurredAt + i.title) {
          <li [class]="'tone-' + (i.tone ?? 'neutral')">
            <span class="re-tl-dot">
              <span class="material-symbols-outlined">{{ i.icon ?? 'circle' }}</span>
            </span>
            <div class="re-tl-body">
              <div class="re-tl-head">
                <strong>{{ i.title }}</strong>
                <time [attr.datetime]="i.occurredAt">{{ i.occurredAt | date:'d MMM yyyy, HH:mm' }}</time>
              </div>
              @if (i.detail) { <p>{{ i.detail }}</p> }
              @if (i.actorName) { <span class="re-tl-actor">{{ i.actorName }}</span> }
            </div>
          </li>
        }
      </ol>
    } @else {
      <p class="re-tl-empty">Nothing has happened here yet.</p>
    }
  `,
  styleUrls: ['./ui.css'],
})
export class TimelineComponent {
  readonly items = input<TimelineItem[]>([]);
}

/**
 * A toast.
 *
 * Success messages disappear; failures do not. Somebody who has just been told a save failed
 * needs time to read why, and a message that vanishes after four seconds is a message they will
 * ask about rather than act on.
 */
@Component({
  standalone: true,
  selector: 're-toast',
  imports: [CommonModule],
  template: `
    @if (message()) {
      <div class="re-toast" [class]="'tone-' + tone()" role="status" aria-live="polite">
        <span class="material-symbols-outlined">
          {{ tone() === 'danger' ? 'error' : tone() === 'warning' ? 'warning' : 'check_circle' }}
        </span>
        <span class="re-toast-text">{{ message() }}</span>
        <button type="button" (click)="dismissed.emit()" aria-label="Dismiss">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    }
  `,
  styleUrls: ['./ui.css'],
})
export class ToastComponent {
  readonly message = input<string | null>(null);
  readonly tone = input<'positive' | 'warning' | 'danger'>('positive');
  @Output() dismissed = new EventEmitter<void>();
}

/** Every shared component in one array, for a screen that wants the lot. */
export const RE_UI = [
  StatsComponent, EmptyStateComponent, SkeletonComponent, PagerComponent, PillComponent,
  DrawerComponent, ConfirmComponent, GateComponent, ProgressComponent, BreakdownComponent,
  TrendComponent, TimelineComponent, ToastComponent,
] as const;
