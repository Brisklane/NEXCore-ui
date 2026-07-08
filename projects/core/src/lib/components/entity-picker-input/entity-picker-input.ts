import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { AuthService } from '../../auth/auth.service';
import { PaginatedResponse } from '../../models/api-response.model';

export interface EntityPickerItem {
  id: string;
  [key: string]: any;
}

/** Defines one column in the picker modal table */
export interface EntityPickerColumn {
  key: string;
  header: string;
  /** Render the cell value as a pill/badge */
  badge?: boolean;
}

/** Defines how one field appears in the quick-dropdown suggestion row */
export interface EntityPickerDisplayField {
  key: string;
  /** 'code' = bold blue monospace, 'name' = flexible truncating label, 'badge' = pill chip */
  style?: 'code' | 'name' | 'badge';
}

@Component({
  selector: 'lib-entity-picker-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entity-picker-input.html',
  styleUrl: './entity-picker-input.css',
})
export class EntityPickerInputComponent implements OnChanges {
  // ── Static (in-memory) mode ───────────────────────────────────────────────
  /** Pre-loaded list of items. When set, no HTTP request is made. */
  @Input() options: EntityPickerItem[] = [];

  // ── API mode ──────────────────────────────────────────────────────────────
  /**
   * Path appended to BASE_URL, e.g. "/api/Item/basic".
   * When set, the component fetches from the API and shows pagination.
   */
  @Input() apiUrl = '';
  /** Extra query params sent on every request, e.g. { itemType: 'FinishedProduct' } */
  @Input() apiExtraParams: Record<string, string> = {};

  // ── Display configuration ─────────────────────────────────────────────────
  /** Label shown in the picker modal header and empty-state messages */
  @Input() entityLabel = 'Item';
  @Input() placeholder = 'Search...';
  /** Columns rendered in the picker modal table */
  @Input() columns: EntityPickerColumn[] = [];
  /**
   * Fields shown inside each suggestion row in the quick dropdown.
   * Order matters — fields are rendered left-to-right.
   * Default: [{ key: 'name', style: 'name' }]
   */
  @Input() displayFields: EntityPickerDisplayField[] = [{ key: 'name', style: 'name' }];
  /**
   * Optional override for the text placed into the search input after selection.
   * Receives the selected item and returns a string.
   * Default: joins all displayField values with ' - '.
   */
  @Input() labelBuilder?: (item: EntityPickerItem) => string;

  // ── Value / state ─────────────────────────────────────────────────────────
  @Input() value = '';
  @Input() disabled = false;
  /** When true, shows a "Create [text]" option in the dropdown when text is typed */
  @Input() allowCreate = false;
  /** Account code that will be auto-generated on create (shown as a preview inside the create option) */
  @Input() createCodePreview = '';
  /** Suffix appended to the typed name to show the full account name preview (e.g. " - Inventory") */
  @Input() createNameSuffix = '';
  /** Full default name shown when the user types a numeric code rather than a name (e.g. "Tablets - Inventory") */
  @Input() createDefaultName = '';
  /** Broader account list used to check if a user-typed code already exists anywhere in the ledger */
  @Input() allOptions: EntityPickerItem[] = [];
  @Output() itemSelected = new EventEmitter<EntityPickerItem>();
  /** Emits the typed text when the user clicks "Create [text]" */
  @Output() createRequested = new EventEmitter<string>();

  // ── Internal state ────────────────────────────────────────────────────────
  searchText = '';
  suggestions: EntityPickerItem[] = [];
  showDropdown = false;
  dropdownLoading = false;

  @Input() pickerPageSize = 20;

  showPicker = false;
  pickerSearch = '';
  pickerPage = 1;
  pickerTotal = 0;
  pickerStart = 0;
  pickerEnd = 0;
  pickerPageItems: EntityPickerItem[] = [];
  pickerHasNextPage = false;
  pickerHasPreviousPage = false;
  pickerLoading = false;

  private dropdownTimer: number | null = null;
  private pickerSearchTimer: number | null = null;
  private savedSearchText = '';
  private selectionMade = false;

  /** True when the user has typed a pure integer (they want to specify a code directly) */
  get isTypedNumeric(): boolean {
    return /^\d+$/.test(this.searchText.trim());
  }

  /** The code that will actually be used: user-typed number if numeric, else the auto-generated preview */
  get effectiveCreateCode(): string {
    return this.isTypedNumeric ? this.searchText.trim() : this.createCodePreview;
  }

  /** Checks effectiveCreateCode against allOptions (full ledger) or options (children) */
  get codeAlreadyExists(): boolean {
    const code = this.effectiveCreateCode;
    if (!code) return false;
    const list = this.allOptions.length ? this.allOptions : this.options;
    return list.some(o => String(o['accountNumber'] ?? '').toLowerCase() === code.toLowerCase());
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.searchText = this.value;
    }
  }

  get isApiMode(): boolean {
    return !!this.apiUrl;
  }

  // ── Input event handlers ──────────────────────────────────────────────────

  onFocus() {
    if (this.disabled) return;
    this.savedSearchText = this.searchText;
    this.selectionMade = false;
    this.searchText = '';
    if (this.isApiMode) {
      this.loadApiDropdown('');
    } else {
      this.refreshStaticDropdown();
    }
  }

  onInput() {
    if (this.disabled) return;
    if (this.isApiMode) {
      if (this.dropdownTimer !== null) window.clearTimeout(this.dropdownTimer);
      this.dropdownTimer = window.setTimeout(() => this.loadApiDropdown(this.searchText), 160);
    } else {
      this.refreshStaticDropdown();
    }
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
      if (!this.selectionMade) {
        this.searchText = this.savedSearchText;
      }
      this.cdr.detectChanges();
    }, 150);
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  selectSuggestion(item: EntityPickerItem) {
    this.selectionMade = true;
    this.savedSearchText = this.buildLabel(item);
    this.searchText = this.savedSearchText;
    this.showDropdown = false;
    this.itemSelected.emit(item);
  }

  selectFromPicker(item: EntityPickerItem) {
    this.selectionMade = true;
    this.selectSuggestion(item);
    this.closePicker();
  }

  // ── Picker (modal) ────────────────────────────────────────────────────────

  openPicker() {
    this.showDropdown = false;
    this.pickerSearch = this.searchText.trim();
    this.pickerPage = 1;
    this.showPicker = true;
    if (this.isApiMode) {
      this.loadApiPickerPage();
    } else {
      this.refreshStaticPickerItems();
    }
  }

  closePicker() {
    this.showPicker = false;
  }

  onCreateRequested() {
    const text = this.searchText.trim() || this.savedSearchText.trim();
    if (!text) return;
    this.selectionMade = true;
    this.savedSearchText = text;
    this.searchText = text;
    this.showDropdown = false;
    this.createRequested.emit(text);
  }

  /** "Add" button inside the picker modal — closes the modal and requests creation. */
  onCreateFromPicker() {
    const text = this.pickerSearch.trim();
    this.closePicker();
    this.createRequested.emit(text);
  }

  onPickerSearchChange() {
    this.pickerPage = 1;
    if (this.isApiMode) {
      if (this.pickerSearchTimer !== null) window.clearTimeout(this.pickerSearchTimer);
      this.pickerSearchTimer = window.setTimeout(() => this.loadApiPickerPage(), 180);
    } else {
      this.refreshStaticPickerItems();
    }
  }

  goToPickerPage(page: number) {
    if (page < 1 || this.pickerLoading) return;
    this.pickerPage = page;
    if (this.isApiMode) {
      this.loadApiPickerPage();
    } else {
      this.refreshStaticPickerItems();
    }
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  fieldValue(item: EntityPickerItem, key: string): string {
    const v = item[key];
    return v != null ? String(v) : '';
  }

  // ── Rich-row layout helpers (picker modal renders records as cards) ────────
  /** The column that reads as the record's name/title. */
  get nameColumn(): EntityPickerColumn | undefined {
    return (
      this.columns.find(c => !c.badge && /name|title|label|description/i.test(c.key)) ??
      this.columns.find(c => !c.badge && c !== this.columns[0]) ??
      this.columns[0]
    );
  }
  /** Non-badge columns other than the name column — shown as the muted meta line. */
  get metaColumns(): EntityPickerColumn[] {
    return this.columns.filter(c => c !== this.nameColumn && !c.badge);
  }
  /** Columns flagged as badge — shown as pills on the right of the row. */
  get badgeColumns(): EntityPickerColumn[] {
    return this.columns.filter(c => c.badge);
  }

  /** Up-to-two-letter initials for an avatar chip. */
  initialsOf(text: string): string {
    const t = (text || '').trim();
    if (!t) return '#';
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return t.slice(0, 2).toUpperCase();
  }

  /** Avatar initials for a quick-dropdown suggestion row. */
  dropdownAvatar(item: EntityPickerItem): string {
    const field = this.displayFields.find(f => f.style === 'name') ?? this.displayFields[0];
    return this.initialsOf(field ? this.fieldValue(item, field.key) : '');
  }
  /** Avatar initials for a picker record row. */
  rowAvatar(item: EntityPickerItem): string {
    const col = this.nameColumn;
    return this.initialsOf(col ? this.fieldValue(item, col.key) : '');
  }

  // ── Private: label building ───────────────────────────────────────────────

  private buildLabel(item: EntityPickerItem): string {
    if (this.labelBuilder) return this.labelBuilder(item);
    return this.displayFields
      .map(f => item[f.key])
      .filter(v => v != null && v !== '')
      .join(' - ');
  }

  // ── Private: static (in-memory) logic ────────────────────────────────────

  private matchesSearch(item: EntityPickerItem, q: string): boolean {
    return this.displayFields.some(f =>
      String(item[f.key] ?? '').toLowerCase().includes(q)
    );
  }

  private refreshStaticDropdown() {
    const q = this.searchText.toLowerCase().trim();
    const filtered = q ? this.options.filter(o => this.matchesSearch(o, q)) : this.options;
    this.suggestions = filtered.slice(0, 5);
    this.showDropdown = true;
    this.cdr.detectChanges();
  }

  private refreshStaticPickerItems() {
    const q = this.pickerSearch.toLowerCase().trim();
    const filtered = q ? this.options.filter(o => this.matchesSearch(o, q)) : [...this.options];
    this.pickerTotal = filtered.length;
    const startIdx = (this.pickerPage - 1) * this.pickerPageSize;
    const endIdx = startIdx + this.pickerPageSize;
    this.pickerPageItems = filtered.slice(startIdx, endIdx);
    this.pickerStart = filtered.length ? startIdx + 1 : 0;
    this.pickerEnd = Math.min(endIdx, filtered.length);
    this.pickerHasNextPage = endIdx < filtered.length;
    this.pickerHasPreviousPage = this.pickerPage > 1;
    this.cdr.detectChanges();
  }

  // ── Private: API mode logic ───────────────────────────────────────────────

  private authHeaders(): { Authorization: string } | Record<string, never> {
    const token = this.auth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private loadApiDropdown(search: string) {
    this.dropdownLoading = true;
    const params: Record<string, string> = {
      pageNumber: '1',
      pageSize: '5',
      search: search.trim(),
      ...this.apiExtraParams,
    };
    this.http
      .get<PaginatedResponse<EntityPickerItem>>(`${environment.apiBaseUrl}${this.apiUrl}`, {
        headers: this.authHeaders(),
        params,
      })
      .subscribe({
        next: (r) => {
          this.suggestions = r.data ?? [];
          this.showDropdown = true;
          this.dropdownLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.suggestions = [];
          this.showDropdown = true;
          this.dropdownLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private loadApiPickerPage() {
    if (this.pickerLoading) return;
    this.pickerLoading = true;
    const params: Record<string, string> = {
      pageNumber: String(this.pickerPage),
      pageSize: String(this.pickerPageSize),
      search: this.pickerSearch.trim(),
      ...this.apiExtraParams,
    };
    this.http
      .get<PaginatedResponse<EntityPickerItem>>(`${environment.apiBaseUrl}${this.apiUrl}`, {
        headers: this.authHeaders(),
        params,
      })
      .subscribe({
        next: (r) => {
          this.pickerPageItems = r.data ?? [];
          const meta = r.pagination;
          this.pickerTotal =
            meta?.totalCount ?? r.totalCount ?? this.pickerPageItems.length;
          this.pickerStart =
            meta?.startIndex ??
            (this.pickerPageItems.length ? (this.pickerPage - 1) * this.pickerPageSize + 1 : 0);
          this.pickerEnd =
            meta?.endIndex ?? (this.pickerStart + this.pickerPageItems.length - 1);
          this.pickerHasNextPage = meta?.hasNextPage ?? false;
          this.pickerHasPreviousPage = meta?.hasPreviousPage ?? this.pickerPage > 1;
          if (this.pickerPageItems.length === 0) {
            this.pickerStart = 0;
            this.pickerEnd = 0;
          }
          this.pickerLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.pickerLoading = false;
          this.pickerPageItems = [];
          this.pickerTotal = 0;
          this.pickerStart = 0;
          this.pickerEnd = 0;
          this.cdr.detectChanges();
        },
      });
  }
}
