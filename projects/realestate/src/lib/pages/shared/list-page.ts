import {
  ChangeDetectorRef, Component, EventEmitter, Input, Output, computed, inject, signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import type * as M from '../../models/realestate.models';
import { RealEstateContextService } from '../../services/realestate-context.service';
import { PageHelpComponent } from './page-help';
import { ProjectPickerComponent, OfficePickerComponent } from './project-picker';
import {
  EmptyStateComponent, PagerComponent, PillComponent, SkeletonComponent, StatsComponent,
  ToastComponent, type StatCard,
} from './ui';

/* =====================================================================================
 * The list screen.
 *
 * Most of this application is lists — of bookings, of demands, of work orders, of certificates —
 * and the difference between a good property system and a bad one is almost entirely in how those
 * lists behave. So there is exactly one of them, configured per screen, and every screen therefore
 * gets debounced search, filters that survive a reload, honest empty states, a loading skeleton
 * that does not shift the layout, keyboard row activation, and paging that says how much there is.
 *
 * A screen that needs something this cannot do overrides the row template or writes its own page.
 * ===================================================================================== */

/** How a cell is rendered. */
export type ColumnKind =
  | 'text' | 'strong' | 'money' | 'number' | 'percent' | 'date' | 'datetime'
  | 'pill' | 'bool' | 'area' | 'days' | 'progress' | 'sub';

/** One column on a list. */
export interface ListColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  kind?: ColumnKind;

  /** Pulls the value out of the row. Defaults to `row[key]`. */
  value?: (row: T) => unknown;

  /** A second line under the main value — a reference under a name, an address under a unit. */
  sub?: (row: T) => string | null | undefined;

  /** Colour for a pill column. */
  tone?: (row: T) => 'neutral' | 'positive' | 'warning' | 'danger' | 'accent' | 'muted';

  align?: 'left' | 'right' | 'center';
  width?: string;

  /** Hidden below this viewport width, so a phone shows the four columns that matter. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

/** A dropdown or toggle above the list. */
export interface ListFilter {
  key: string;
  label: string;
  kind: 'select' | 'toggle' | 'date' | 'text';
  options?: Array<{ value: unknown; label: string }>;
  value?: unknown;

  /** Shown to the right of the label — used to explain a filter that is not self-evident. */
  hint?: string;
}

/** A one-tap filter named after the question somebody is asking. */
export interface ListPreset {
  key: string;
  label: string;
  /** The filter values this preset applies. Everything else is cleared. */
  apply: Record<string, unknown>;
  tone?: 'neutral' | 'warning' | 'danger';
}

/** A button in the row's action column. */
export interface RowAction<T = Record<string, unknown>> {
  key: string;
  label: string;
  icon?: string;
  tone?: 'neutral' | 'danger' | 'accent';
  /** Hidden when this returns false for the row. */
  when?: (row: T) => boolean;
}

/** Everything a list screen needs to describe itself. */
export interface ListConfig<T = Record<string, unknown>> {
  title: string;
  subtitle?: string;
  helpKey?: string;
  icon?: string;

  /** Placeholder in the search box. Names the fields it actually searches. */
  searchPlaceholder?: string;

  columns: ListColumn<T>[];
  filters?: ListFilter[];
  presets?: ListPreset[];
  rowActions?: RowAction<T>[];

  /** The label on the primary button. Omit for a read-only screen. */
  createLabel?: string;
  createIcon?: string;

  /** Which context picker to show in the header. */
  scope?: 'project' | 'office' | 'none';

  /** What the empty state says when there is genuinely no data at all. */
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: string;

  /** Rows are clickable and emit `rowClick`. */
  clickable?: boolean;

  pageSize?: number;
}

@Component({
  standalone: true,
  selector: 're-list-page',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ProjectPickerComponent, OfficePickerComponent,
    StatsComponent, EmptyStateComponent, SkeletonComponent, PagerComponent, PillComponent,
    ToastComponent,
  ],
  templateUrl: './list-page.html',
  styleUrls: ['../realestate-shared.css', './ui.css', './list-page.css'],
  providers: [DecimalPipe],
})
export class ListPageComponent<T extends Record<string, unknown> = Record<string, unknown>> {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  protected ctx = inject(RealEstateContextService);

  @Input({ required: true }) config!: ListConfig<T>;

  /** Figures shown above the list. Optional — many screens do not need them. */
  @Input() stats: StatCard[] = [];

  /** The fetch. Given the current query, returns a page of rows. */
  @Input({ required: true }) fetch!: (q: ListQueryState) => Observable<M.PaginatedResponse<T>>;

  @Output() rowClick = new EventEmitter<T>();
  @Output() rowAction = new EventEmitter<{ action: string; row: T }>();
  @Output() create = new EventEmitter<void>();
  @Output() scopeChange = new EventEmitter<string | null>();
  @Output() loaded = new EventEmitter<T[]>();

  readonly rows = signal<T[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  search = '';
  filterValues: Record<string, unknown> = {};
  activePreset: string | null = null;

  private searchTimer?: ReturnType<typeof setTimeout>;
  private scopeId: string | null = null;

  get size(): number { return this.config?.pageSize ?? 25; }

  readonly hasFilters = computed(() => {
    if (this.search.trim()) return true;
    return Object.values(this.filterValues).some(v => v !== null && v !== undefined && v !== '');
  });

  /** Called by the scope picker on first resolve and on every change. */
  async onScope(id: string | null): Promise<void> {
    this.scopeId = id;
    this.scopeChange.emit(id);
    this.page.set(1);
    await this.load();
  }

  /** Screens with no scope picker call this from ngOnInit. */
  async start(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  onSearchChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    // 260ms: long enough that a fast typist sends one request, short enough to feel immediate.
    this.searchTimer = setTimeout(() => { this.page.set(1); void this.load(); }, 260);
  }

  onFilterChange(): void {
    this.activePreset = null;
    this.page.set(1);
    void this.load();
  }

  applyPreset(preset: ListPreset): void {
    this.filterValues = {};
    this.search = '';
    for (const [k, v] of Object.entries(preset.apply)) this.filterValues[k] = v;
    this.activePreset = preset.key;
    this.page.set(1);
    void this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.filterValues = {};
    this.activePreset = null;
    this.page.set(1);
    void this.load();
  }

  goPage(n: number): void {
    if (n < 1 || n > Math.ceil(this.total() / this.size)) return;
    this.page.set(n);
    void this.load();
  }

  /** The query the screen's own fetch is given. */
  get query(): ListQueryState {
    return {
      page: this.page(),
      pageSize: this.size,
      search: this.search.trim() || undefined,
      scopeId: this.scopeId,
      filters: { ...this.filterValues },
    };
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.fetch(this.query)).catch(() => null);

    if (!res) {
      // Named for the screen, so somebody reporting it can say which one failed.
      this.error.set(`Could not load ${this.config.title.toLowerCase()}. Try again in a moment.`);
      this.rows.set([]);
      this.total.set(0);
    } else {
      const data = res.data ?? [];
      this.rows.set(data);
      this.total.set(res.pagination?.totalCount ?? data.length);
      this.loaded.emit(data);
    }

    this.loading.set(false);
    this.cdr.detectChanges();
  }

  /** Re-reads the current page. Called after a save so the list reflects it immediately. */
  refresh(): void { void this.load(); }

  say(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 4200);
  }

  go(url: string): void { void this.router.navigateByUrl(url); }

  // ── Cell rendering ───────────────────────────────────────────────────────

  cell(row: T, col: ListColumn<T>): unknown {
    return col.value ? col.value(row) : row[col.key];
  }

  sub(row: T, col: ListColumn<T>): string | null {
    return col.sub ? (col.sub(row) ?? null) : null;
  }

  tone(row: T, col: ListColumn<T>): string {
    return col.tone ? col.tone(row) : 'neutral';
  }

  visibleActions(row: T): RowAction<T>[] {
    return (this.config.rowActions ?? []).filter(a => !a.when || a.when(row));
  }

  trackRow = (_: number, row: T): unknown => (row['id'] as unknown) ?? row;
}

/** What a screen's fetch is handed. */
export interface ListQueryState {
  page: number;
  pageSize: number;
  search?: string;
  /** The project or office from the header picker, whichever this screen is scoped to. */
  scopeId: string | null;
  filters: Record<string, unknown>;
}

/** Builds the shape the API's ListQueryDto expects from the list state. */
export function toListQuery(q: ListQueryState, extra: Record<string, unknown> = {}): M.ListQueryDto {
  return {
    page: q.page,
    pageSize: q.pageSize,
    search: q.search,
    ...extra,
  } as M.ListQueryDto;
}
