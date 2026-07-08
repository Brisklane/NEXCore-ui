import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn, TableAction, RowActionEvent } from '../../models/ui.models';

/**
 * Generic data table with automatic pagination, badge rendering, and action buttons.
 *
 * Supports two pagination modes (auto-detected):
 *  - Client-side: pass all rows via [data]; the table paginates locally.
 *  - Server-side: pass the current page rows via [data] + [totalCount]; listen to
 *    (pageChange) and (pageSizeChange) to fetch the next page.
 *
 * @example — client-side
 * <app-data-table [columns]="cols" [data]="items" [actions]="actions"
 *   (rowAction)="onAction($event)">
 * </app-data-table>
 *
 * @example — server-side
 * <app-data-table [columns]="cols" [data]="items" [totalCount]="total"
 *   [page]="page" [pageSize]="pageSize"
 *   (pageChange)="loadPage($event)" (pageSizeChange)="onSizeChange($event)"
 *   [actions]="actions" (rowAction)="onAction($event)">
 * </app-data-table>
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-data-table.component.html'
})
export class AppDataTableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];

  /** Server-side total. When provided the table switches to server-side mode. */
  @Input() totalCount?: number;

  /** Current page (1-based). Synced internally; bind for server-side control. */
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [10, 20, 50];
  @Input() emptyMessage = 'No records found.';
  @Input() loading = false;

  /** Current sort column key (matches a column's sortKey or key). */
  @Input() sortBy = '';
  /** Current sort direction. */
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  /** When true, every column is clickable-sortable without setting `sortable` on each one. */
  @Input() sortableAll = false;

  /**
   * Id of a freshly created row. The matching row floats to the top of the
   * visible rows and gets a `row-new` class (green flash). Pair with {@link RowHighlighter}.
   */
  @Input() highlightRowId: string | number | null = null;
  /** Property used to match a row against {@link highlightRowId}. */
  @Input() rowKey = 'id';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() rowAction = new EventEmitter<RowActionEvent>();
  /** Emitted when a sortable column header is clicked. */
  @Output() sortChange = new EventEmitter<{ sortBy: string; sortDirection: 'asc' | 'desc' }>();

  _page = 1;
  _pageSize = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page'])     this._page     = this.page;
    if (changes['pageSize']) this._pageSize = this.pageSize;
  }

  /* ── Computed helpers ── */

  get isServerSide(): boolean { return this.totalCount !== undefined; }

  get _totalCount(): number {
    return this.isServerSide ? (this.totalCount ?? 0) : this.data.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this._totalCount / this._pageSize));
  }

  get visibleRows(): any[] {
    if (this.isServerSide) return this.floatHighlighted(this.data);   // server owns ordering (via sortChange refetch)
    const sorted = this.sortedData;
    const start = (this._page - 1) * this._pageSize;
    return this.floatHighlighted(sorted.slice(start, start + this._pageSize));
  }

  /** True when the row is the freshly-created one to flash green. */
  isHighlighted(row: any): boolean {
    return this.highlightRowId != null && row?.[this.rowKey] === this.highlightRowId;
  }

  /** Move the highlighted row to the top of the given (already-paginated) rows. */
  private floatHighlighted(rows: any[]): any[] {
    if (this.highlightRowId == null) return rows;
    const idx = rows.findIndex(r => r?.[this.rowKey] === this.highlightRowId);
    if (idx <= 0) return rows;
    const copy = [...rows];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  /** Stable row identity so the green flash animates only when a row first appears. */
  trackRow = (row: any, index: number): any => row?.[this.rowKey] ?? index;

  /** Client-side sorted copy of the data (no-op until a sortable header is clicked). */
  get sortedData(): any[] {
    if (!this.sortBy) return this.data;
    const col = this.columns.find(c => this.sortKeyOf(c) === this.sortBy);
    const key = col?.key ?? this.sortBy;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    const valueOf = (row: any) => key.split('.').reduce((o: any, k: string) => o?.[k], row);
    return [...this.data].sort((a, b) => dir * AppDataTableComponent.compare(valueOf(a), valueOf(b)));
  }

  private static compare(a: any, b: any): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (typeof a !== 'number') {
      const da = Date.parse(a), db = Date.parse(b);
      if (!isNaN(da) && !isNaN(db)) return da - db;
    }
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  }

  // Show the pagination bar whenever there are rows — server-side lists always need the
  // rows-per-page control and range, and client-side lists paginate locally past one page.
  get showPagination(): boolean { return this._totalCount > 0; }

  get rangeLabel(): string {
    const start = (this._page - 1) * this._pageSize + 1;
    const end = Math.min(this._page * this._pageSize, this._totalCount);
    return `${start}–${end} of ${this._totalCount}`;
  }

  get columnCount(): number {
    return this.columns.length + (this.actions.length ? 1 : 0);
  }

  /* ── Events ── */

  onPageChange(newPage: number): void {
    this._page = newPage;
    this.pageChange.emit(newPage);
  }

  onPageSizeChange(event: Event): void {
    const size = +(event.target as HTMLSelectElement).value;
    this._pageSize = size;
    this._page = 1;
    this.pageSizeChange.emit(size);
    this.pageChange.emit(1);
  }

  emit(eventName: string, row: any): void {
    this.rowAction.emit({ eventName, row });
  }

  /* ── Sorting ── */

  sortKeyOf(col: TableColumn): string {
    return col.sortKey ?? col.key;
  }

  /** A column is sortable if it opts in, or the table enables sorting for all columns. */
  isSortable(col: TableColumn): boolean {
    return col.sortable ?? this.sortableAll;
  }

  toggleSort(col: TableColumn): void {
    if (!this.isSortable(col)) return;
    const key = this.sortKeyOf(col);
    if (this.sortBy === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = key;
      this.sortDirection = 'asc';
    }
    this.sortChange.emit({ sortBy: this.sortBy, sortDirection: this.sortDirection });
  }

  /* ── Cell rendering ── */

  getCellValue(col: TableColumn, row: any): any {
    return col.key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  formatCell(col: TableColumn, row: any): string {
    const val = this.getCellValue(col, row);
    if (col.format) return col.format(val, row);
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (col.type === 'date' && val) return new Date(val).toLocaleDateString();
    if (col.type === 'currency') return (+val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return String(val);
  }

  private static readonly BADGE_MAP: Record<string, string> = {
    active: 'badge-active', inactive: 'badge-inactive',
    draft: 'badge-draft', submitted: 'badge-submitted',
    posted: 'badge-posted', reversed: 'badge-reversed',
    cancelled: 'badge-cancelled', yes: 'badge-yes', no: 'badge-no',
    true: 'badge-active', false: 'badge-inactive',
  };

  resolveBadgeClass(col: TableColumn, row: any): string {
    const val = this.getCellValue(col, row);
    if (typeof col.badgeClass === 'function') return col.badgeClass(val, row);
    if (typeof col.badgeClass === 'string'  ) return col.badgeClass;
    return AppDataTableComponent.BADGE_MAP[String(val).toLowerCase()] || '';
  }

  actionBtnClass(action: TableAction): string {
    if (action.variant === 'danger')  return 'btn-icon btn-icon-danger';
    if (action.variant === 'primary') return 'btn btn-secondary btn-sm';
    return 'btn-icon';
  }
}
