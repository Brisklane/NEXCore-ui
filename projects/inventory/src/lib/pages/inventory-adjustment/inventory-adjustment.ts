import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField } from '@nexcore/core';
import { RowHighlighter } from '@nexcore/shared';
import { InventoryDocumentService } from '../../services/inventory-document.service';
import { ItemService } from '../../services/item.service';
import { WarehouseService } from '../../services/warehouse.service';
import { UnitService } from '../../services/unit.service';
import { InventoryLookupService } from '../../services/inventory-lookup.service';
import { InventoryReportService } from '../../services/inventory-report.service';
import {
  InventoryDocumentDto,
  CreateInventoryDocumentDto,
  CreateInventoryDocumentLineDto,
} from '../../models/inventory-document.model';
import { ItemDto } from '../../models/item.model';
import { WarehouseDto } from '../../models/warehouse.model';
import { UnitDto } from '../../models/unit.model';
import { LookupItemDto } from '../../models/inventory-lookup.model';

@Component({
  selector: 'lib-inventory-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityPickerInputComponent],
  templateUrl: './inventory-adjustment.html',
  styleUrl: './inventory-adjustment.css',
})
export class InventoryAdjustment implements OnInit {
  documents: InventoryDocumentDto[] = [];
  items: ItemDto[] = [];
  warehouses: WarehouseDto[] = [];
  units: UnitDto[] = [];
  documentTypes: LookupItemDto[] = [];

  /** Flash the just-created document green on top of the list (shared pattern). */
  highlighter = new RowHighlighter();
  private justCreatedDoc: InventoryDocumentDto | null = null;

  /** Per-warehouse available qty (itemId → available), cached so the line entry can check availability. */
  private whStock: Record<string, Record<string, number>> = {};
  private whStockLoading: Record<string, boolean> = {};
  /** Instant message when the line quantity exceeds the From-warehouse availability. */
  lineQtyError = '';

  loading = false;
  error = '';
  success = '';
  showForm = false;
  posting = false;
  postingId = '';

  // Detail modal
  detailDoc: InventoryDocumentDto | null = null;
  detailLoading = false;

  filterSearch = '';
  filterStatus = '';
  filterDocumentType = '';

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50];

  // Item picker config
  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' }, { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' }, { key: 'name', header: 'Name' }, { key: 'shortDescription', header: 'Description' },
  ];

  // Form fields
  formDocumentType = 'ADJUSTMENT';
  formDocumentDate = new Date().toISOString().split('T')[0];
  formDescription = '';
  formFromWarehouseId = '';
  formToWarehouseId = '';
  formLines: CreateInventoryDocumentLineDto[] = [];

  newLine: CreateInventoryDocumentLineDto = {
    itemId: '',
    warehouseId: '',
    quantity: null as unknown as number,
    unitId: '',
    unitCost: null as unknown as number,
    lineNumber: 1,
  };

  constructor(
    private documentService: InventoryDocumentService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private unitService: UnitService,
    private lookupService: InventoryLookupService,
    private reportService: InventoryReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
    // Use getAll with large page size so all records appear in dropdowns
    this.itemService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.items = res.data ?? []; this.cdr.detectChanges(); },
    });
    // Warm the item-picker endpoint's query plans up front (empty + search shapes) so the cashier's
    // first search in the Item field isn't hit with the one-time EF/SQL compile cost. Fire-and-forget.
    this.itemService.getBasic('', 5).subscribe({ next: () => {}, error: () => {} });
    this.itemService.getBasic('a', 5).subscribe({ next: () => {}, error: () => {} });
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.warehouses = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.unitService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.units = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.lookupService.getDocumentTypes().subscribe({
      next: (res) => { this.documentTypes = res.data ?? []; this.cdr.detectChanges(); },
    });
  }

  viewDocument(doc: InventoryDocumentDto): void {
    this.detailDoc = doc;
    this.detailLoading = true;
    this.error = '';
    this.documentService.getById(doc.id).subscribe({
      next: (res) => { this.detailDoc = res.data ?? doc; this.detailLoading = false; this.cdr.detectChanges(); },
      error: () => { this.detailLoading = false; this.cdr.detectChanges(); },
    });
  }

  closeDetail(): void { this.detailDoc = null; this.cdr.detectChanges(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.documentService.getAll(
      { pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.filterSearch || undefined, sortBy: this.sortBy, sortDirection: this.sortDirection },
      this.filterDocumentType || undefined,
      this.filterStatus || undefined,
    ).subscribe({
      next: (res) => {
        this.documents = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        if (this.totalPages < 1) this.totalPages = 1;
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load adjustment documents';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** Documents ordered so the freshly-created one sits on top while it's highlighted. */
  get displayDocuments(): InventoryDocumentDto[] {
    const id = this.highlighter.id;
    if (id == null) return this.documents;
    const idx = this.documents.findIndex(d => d.id === id);
    if (idx <= 0) return this.documents;
    const copy = [...this.documents];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  private applyJustCreated(): void {
    const created = this.justCreatedDoc;
    if (!created) return;
    this.justCreatedDoc = null;
    if (!this.documents.some(d => d.id === created.id)) this.documents = [created, ...this.documents];
    this.highlighter.flash(created.id, this.cdr);
  }

  // ── Line-item availability (From / To warehouse) ────────────────────────────────
  /** Available qty of the currently-selected line item in a warehouse (null = unknown/not loaded). */
  private availIn(warehouseId: string): number | null {
    if (!warehouseId || !this.newLine.itemId) return null;
    const map = this.whStock[warehouseId];
    if (!map) return null;
    return map[this.newLine.itemId] ?? 0;
  }
  get fromAvail(): number | null { return this.availIn(this.formFromWarehouseId); }
  get toAvail(): number | null { return this.availIn(this.formToWarehouseId); }

  /** True when a positive line quantity exceeds what the From warehouse holds for the item. */
  get qtyExceedsFrom(): boolean {
    const a = this.fromAvail;
    return a != null && this.newLine.quantity != null && this.newLine.quantity > a;
  }

  /** Fetch (and cache) per-item availability for a warehouse so the line entry can validate against it. */
  private loadWarehouseStock(warehouseId: string): void {
    if (!warehouseId || this.whStock[warehouseId] || this.whStockLoading[warehouseId]) return;
    this.whStockLoading[warehouseId] = true;
    this.reportService.getStockByItem(warehouseId).subscribe({
      next: (res) => {
        const map: Record<string, number> = {};
        for (const t of res.data ?? []) map[t.itemId] = t.quantityAvailable ?? 0;
        this.whStock[warehouseId] = map;
        this.whStockLoading[warehouseId] = false;
        this.validateLineQty();
        this.cdr.detectChanges();
      },
      error: () => { this.whStockLoading[warehouseId] = false; this.cdr.detectChanges(); },
    });
  }

  onFromWarehouseChange(): void { this.loadWarehouseStock(this.formFromWarehouseId); this.validateLineQty(); }
  onToWarehouseChange(): void { this.loadWarehouseStock(this.formToWarehouseId); }

  /** Recompute the instant "quantity exceeds available" message for the current line. */
  validateLineQty(): void {
    this.lineQtyError = this.qtyExceedsFrom
      ? `Quantity exceeds available (${this.fromAvail}) in From warehouse${this.formFromWarehouseId ? ' "' + this.warehouseName(this.formFromWarehouseId) + '"' : ''}.`
      : '';
  }

  goToPage(p: number): void { this.page = p; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }
  private searchDebounce: any;
  applyFilters(): void { this.page = 1; this.load(); }
  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }
  clearFilters(): void { this.filterSearch = ''; this.filterStatus = ''; this.filterDocumentType = ''; this.page = 1; this.load(); }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.load();
  }

  openCreateForm(): void {
    this.formDocumentType = 'ADJUSTMENT';
    this.formDocumentDate = new Date().toISOString().split('T')[0];
    this.formDescription = '';
    this.formFromWarehouseId = '';
    this.formToWarehouseId = '';
    this.formLines = [];
    this.resetNewLine();
    this.whStock = {};        // refetch fresh availability each time the form opens
    this.lineQtyError = '';
    this.error = '';
    this.success = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.error = '';
  }

  resetNewLine(): void {
    this.newLine = {
      itemId: '',
      warehouseId: '',
      quantity: null as unknown as number,
      unitId: '',
      unitCost: null as unknown as number,
      lineNumber: this.formLines.length + 1,
    };
  }

  addLine(): void {
    if (!this.newLine.itemId || !this.newLine.warehouseId || !this.newLine.unitId || this.newLine.quantity === 0) {
      this.error = 'Each line requires Item, Warehouse, Unit, and a non-zero Quantity.';
      this.cdr.detectChanges();
      return;
    }
    if (this.qtyExceedsFrom) {
      this.error = this.lineQtyError || 'Quantity exceeds available stock in the From warehouse.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    this.formLines.push({ ...this.newLine, lineNumber: this.formLines.length + 1 });
    this.resetNewLine();
    this.lineQtyError = '';
    this.cdr.detectChanges();
  }

  removeLine(i: number): void {
    this.formLines.splice(i, 1);
    this.formLines.forEach((l, idx) => (l.lineNumber = idx + 1));
  }

  // Labels/names captured from the picker on selection — the picker is API-driven,
  // so the chosen item often isn't in the first-page `items` cache. Keying off these
  // maps keeps the input and the saved-lines table from showing the raw GUID.
  itemLabelById: Record<string, string> = {};
  itemNameById: Record<string, string> = {};

  onLineItemSelect(item: EntityPickerItem): void {
    const id = item['id'];
    this.newLine.itemId = id;
    const code = (item['code'] ?? '').toString().trim();
    const name = (item['name'] ?? '').toString().trim();
    if (id) {
      this.itemLabelById[id] = [code, name].filter(Boolean).join(' — ') || name || code || id;
      this.itemNameById[id] = name || code || id;
    }
    this.cdr.detectChanges();
  }

  get selectedItemLabel(): string {
    const id = this.newLine.itemId;
    if (!id) return '';
    if (this.itemLabelById[id]) return this.itemLabelById[id];
    const item = this.items.find(i => i.id === id);
    return item ? `${item.code} — ${item.name}` : '';
  }

  itemName(id: string): string {
    return this.itemNameById[id] ?? this.items.find(i => i.id === id)?.name ?? id;
  }
  warehouseName(id: string): string { return this.warehouses.find(w => w.id === id)?.name ?? id; }
  unitName(id: string): string { return this.units.find(u => u.id === id)?.name ?? id; }

  save(): void {
    if (this.formLines.length === 0) {
      this.error = 'At least one line item is required.';
      this.cdr.detectChanges();
      return;
    }
    const dto: CreateInventoryDocumentDto = {
      documentType: this.formDocumentType || null,
      documentDate: this.formDocumentDate,
      description: this.formDescription || null,
      fromWarehouseId: this.formFromWarehouseId || null,
      toWarehouseId: this.formToWarehouseId || null,
      lines: this.formLines,
    };
    this.documentService.create(dto).subscribe({
      next: (res) => {
        if (!res.success) { this.error = res.message || 'Failed to create document'; this.cdr.detectChanges(); return; }
        this.justCreatedDoc = res.data ?? null;   // floated to top + flashed green after reload
        this.showForm = false;
        this.success = 'Adjustment document created successfully.';
        this.error = '';
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to create adjustment document.';
        this.cdr.detectChanges();
      },
    });
  }

  postDocument(doc: InventoryDocumentDto): void {
    if (!confirm(`Post document ${doc.documentNumber}? This will update inventory balances.`)) return;
    this.postingId = doc.id;
    this.posting = true;
    this.documentService.post(doc.id, {
      documentId: doc.id,
      postingDate: new Date().toISOString().split('T')[0],
    }).subscribe({
      next: (res) => {
        this.posting = false;
        this.postingId = '';
        if (!res.success) { this.error = res.message || 'Failed to post document'; this.cdr.detectChanges(); return; }
        this.success = `Document ${doc.documentNumber} posted successfully.`;
        this.error = '';
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.posting = false;
        this.postingId = '';
        this.error = err.error?.message || 'Failed to post document.';
        this.cdr.detectChanges();
      },
    });
  }
}
