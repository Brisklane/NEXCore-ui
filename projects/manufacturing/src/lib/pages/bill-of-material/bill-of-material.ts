import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { BomService } from '../../services/bom.service';
import { RoutingService } from '../../services/routing.service';
import { WorkCenterService } from '../../services/work-center.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import {
  BillOfMaterialDto, CreateBillOfMaterialDto, UpdateBillOfMaterialDto,
  BOMItemDto, CreateBOMItemDto,
} from '../../models/bill-of-material.model';
import {
  RoutingDto, RoutingOperationDto, CreateRoutingDto,
  CreateRoutingOperationDto, UpdateRoutingOperationDto,
} from '../../models/routing.model';
import { WorkCenterDto } from '../../models/work-center.model';
import { ApiResponse, PaginationParams } from '../../models/api-response.model';
import { RowHighlighter } from '@nexcore/shared';

interface PaginationMeta {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

interface InventoryItemDto {
  id: string;
  code: string | null;
  name: string | null;
  itemType: string | null;
  baseUnitId: string | null;
  isComponent: boolean;
  isActive: boolean;
  // Top-level convenience fields some API endpoints expose directly
  purchasePrice?: number | string | null;
  salePrice?: number | string | null;
  prices: Array<{
    unitId: string | null;
    purchasePrice: number | string | null;
    purchasePriceExcludingTax: number | string | null;
    purchasePriceIncludingTax: number | string | null;
    salePrice: number | string | null;
    currencyCode: string | null;
  }> | null;
  suppliers?: Array<{ lastPurchasePrice: number | string | null; isPrimary: boolean }> | null;
}

interface InventoryUnitDto {
  id: string;
  code: string | null;
  name: string | null;
  isActive: boolean;
}

interface InventoryCategoryDto {
  id: string;
  name: string | null;
  isActive: boolean;
}

interface InventoryBrandDto {
  id: string;
  name: string | null;
  isActive: boolean;
}

interface InventoryColorDto {
  id: string;
  name: string | null;
  hexCode: string | null;
  isActive: boolean;
}

interface LookupItemDto {
  value: string;
  label: string;
}

interface InventoryBalanceDto {
  averageCost: number | string | null;
  quantityAvailable: number | string | null;
}

interface ComponentLine {
  existingId?: string;
  searchText: string;
  selectedItemId: string;
  selectedItemName: string;
  selectedItemCode: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  lineTotal: number;
  notes: string;
  suggestions: InventoryItemDto[];
  showDropdown: boolean;
  stockAvailable: number | null;
  stockLoading: boolean;
}

interface OperationLine {
  localId: number;
  existingId?: string;
  operationName: string;
  workCenterId: string;
  standardHours: number;
  durationText: string;
  durationSuggestions: string[];
  showDurationDropdown: boolean;
  notes: string;
}

@Component({
  selector: 'lib-bill-of-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bill-of-material.html',
  styleUrl: './bill-of-material.css',
})
export class BillOfMaterial implements OnInit {
  items: BillOfMaterialDto[] = [];
  bomComponentCountById: Record<string, number> = {};
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: BillOfMaterialDto | null = null;

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  // Inventory items cache
  allItems: InventoryItemDto[] = [];
  itemsById: Record<string, InventoryItemDto> = {};
  itemDetailsById: Record<string, InventoryItemDto> = {};
  unitsById: Record<string, InventoryUnitDto> = {};
  itemBalanceCostById: Record<string, number> = {};
  itemBalanceCostLoading: Record<string, boolean> = {};
  itemStockById: Record<string, number> = {};
  itemsLoading = false;

  // Finished product search
  finishedProductSearch = '';
  finishedProductSuggestions: InventoryItemDto[] = [];
  showFinishedProductDropdown = false;
  finishedProductDropdownLoading = false;
  showFinishedProductPicker = false;
  finishedProductPickerSearch = '';
  finishedProductPickerTypeFilter = 'FinishedGood';
  finishedProductPickerPage = 1;
  readonly finishedProductPickerPageSize = 20;
  finishedProductPickerTotal = 0;
  finishedProductPickerStart = 0;
  finishedProductPickerEnd = 0;
  finishedProductPickerPageItems: InventoryItemDto[] = [];
  finishedProductPickerHasNextPage = false;
  finishedProductPickerHasPreviousPage = false;
  finishedProductPickerLoading = false;
  showQuickCreateItemForm = false;
  quickCreateItemSaving = false;
  quickCreateItemError = '';
  quickCreateItemTypes: LookupItemDto[] = [];
  quickCreateItemConditions: LookupItemDto[] = [];
  quickCreateCategories: InventoryCategoryDto[] = [];
  quickCreateBrands: InventoryBrandDto[] = [];
  quickCreateColors: InventoryColorDto[] = [];
  quickItemCode = '';
  quickItemName = '';
  quickItemType = 'FinishedGood';
  quickItemCondition = 'New';
  quickItemBaseUnitId = '';
  quickItemCategoryId = '';
  quickItemBrandId = '';
  quickItemDisplayColorId = '';
  quickItemPurchasePrice: number | null = null;
  quickItemSalePrice: number | null = null;
  quickItemBarcode = '';
  formFinishedProductId = '';
  formFinishedProductName = '';
  formBomId = '';

  // Component lines
  formComponents: ComponentLine[] = [];

  // Operations / Routing
  showOperationsSection = false;
  showOperationsPrompt = false;
  operationsLoading = false;
  operationsSaving = false;
  workCentersLoading = false;
  workCenters: WorkCenterDto[] = [];
  currentRouting: RoutingDto | null = null;
  formOperations: OperationLine[] = [];
  durationPresetOptions: string[] = [];
  private operationRowCounter = 1;
  private draggingOperationIndex: number | null = null;
  private finishedProductSearchTimer: number | null = null;
  private finishedProductPickerSearchTimer: number | null = null;
  private componentSearchTimer: number | null = null;

  // Material picker
  materialPickerOpen = false;
  materialPickerForComp: ComponentLine | null = null;
  materialPickerSearch = '';
  materialPickerPage = 1;
  readonly materialPickerPageSize = 20;
  materialPickerTotal = 0;
  materialPickerStart = 0;
  materialPickerEnd = 0;
  materialPickerPageItems: InventoryItemDto[] = [];
  materialPickerHasNextPage = false;
  materialPickerHasPreviousPage = false;
  materialPickerLoading = false;
  private materialPickerSearchTimer: number | null = null;

  // Other fields
  formNotes = '';
  formIsActive = true;

  constructor(
    private svc: BomService,
    private routingSvc: RoutingService,
    private workCenterSvc: WorkCenterService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.durationPresetOptions = this.buildDurationPresets();
    this.loadInventoryItems();
    this.loadInventoryUnits();
    this.load();
  }

  load() {
    this.loading = true; this.error = '';
    const pagination: PaginationParams = { pageNumber: this.page, pageSize: this.pageSize };
    this.svc.getAll(pagination).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.assignBomSortFields();
        this.resolveFinishedProductNames();
        this.loadBomComponentCounts();
        this.loading = false;
        this.applyJustCreated();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load BOMs'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get displayRows(): any[] {
    let rows: any[] = [...this.items];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const id = this.highlighter.id;
    if (id != null) {
      const idx = rows.findIndex(r => r?.id === id);
      if (idx > 0) { const [row] = rows.splice(idx, 1); rows.unshift(row); }
    }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  private applyJustCreated(): void {
    const c = this.justCreated;
    if (!c) return;
    this.justCreated = null;
    if (!this.items.some((i: any) => i?.id === c.id)) this.items = [c, ...this.items];
    this.highlighter.flash(c.id, this.cdr);
  }

  goToPage(page: number) {
    this.page = page;
    this.load();
  }

  onPageSizeChange() {
    this.page = 1;
    this.load();
  }

  openCreate() {
    this.editing = null;
    this.reset();
    this.generateNextBomId();
    this.showForm = true;
    this.loadInventoryItems();
    this.loadWorkCenters();
  }

  generateNextBomId() {
    const nextNumber = this.totalCount + 1;
    this.formBomId = 'BOM-' + String(nextNumber).padStart(3, '0');
  }

  openEdit(item: BillOfMaterialDto) {
    this.reset();
    this.editing = item;
    this.formFinishedProductId = item.finishedProductId ?? '';
    this.formFinishedProductName = item.finishedProductName ?? '';
    this.finishedProductSearch = this.getFinishedProductDisplay(item);
    this.formNotes = item.notes ?? '';
    this.formIsActive = item.isActive ?? true;
    this.formComponents = [];
    this.showOperationsSection = false;
    this.currentRouting = null;
    this.formOperations = [];
    this.showForm = true;

    this.svc.getById(item.id).subscribe({
      next: (r) => {
        const detail = r.data;
        if (!detail) {
          this.error = 'Failed to load BOM detail for editing.';
          this.cdr.detectChanges();
          return;
        }

        this.editing = detail;
        this.formFinishedProductId = detail.finishedProductId ?? '';
        this.formFinishedProductName = detail.finishedProductName ?? '';
        this.finishedProductSearch = this.getFinishedProductDisplay(detail);
        this.formNotes = detail.notes ?? '';
        this.formIsActive = detail.isActive ?? true;
        this.formComponents = (detail.items ?? []).map((bi: BOMItemDto) => ({
          existingId: bi.id,
          searchText: bi.materialName ? `${bi.materialName}` : '',
          selectedItemId: bi.materialId,
          selectedItemName: bi.materialName ?? '',
          selectedItemCode: '',
          quantity: this.normalizeQuantity(bi.quantityRequired),
          unitOfMeasure: bi.unitOfMeasure ?? 'EA',
          unitCost: 0,
          lineTotal: 0,
          notes: bi.notes ?? '',
          suggestions: [],
          showDropdown: false,
          stockAvailable: null,
          stockLoading: true,
        }));

        this.refreshEditingFinishedProductSearch();
        this.refreshComponentCosts();

        // If the API returned null for finishedProductName, fetch the item individually
        // to resolve the display name.
        const fpId = detail.finishedProductId ?? '';
        if (fpId && !this.itemDetailsById[fpId] && !this.itemsById[fpId]) {
          this.fetchItemDetails(fpId);
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load BOM detail for editing.';
        this.cdr.detectChanges();
      },
    });

    this.loadInventoryItems();
    this.loadInventoryUnits();
    this.loadWorkCenters();
  }

  toggleOperationsSection() {
    if (!this.formFinishedProductId) {
      this.showOperationsPrompt = true;
      this.showOperationsSection = false;
      this.cdr.detectChanges();
      return;
    }

    this.showOperationsPrompt = false;
    this.showOperationsSection = !this.showOperationsSection;
    if (!this.showOperationsSection) {
      this.cdr.detectChanges();
      return;
    }

    this.error = '';
    this.loadWorkCenters();

    // For new BOM creation, keep operations empty and let user add rows manually.
    if (!this.editing) {
      this.currentRouting = null;
      this.formOperations = [];
      this.cdr.detectChanges();
      return;
    }

    // In edit mode, load existing routing operations so user can modify them.
    this.loadRoutingForCurrentProduct();
    this.cdr.detectChanges();
  }

  private loadWorkCenters() {
    if (this.workCentersLoading || this.workCenters.length > 0) return;

    this.workCentersLoading = true;
    this.workCenterSvc.getAll().subscribe({
      next: (r) => {
        this.workCenters = (r.data ?? []).filter(wc => wc.isActive);
        this.workCentersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.workCentersLoading = false;
        this.error = 'Failed to load work centers.';
        this.cdr.detectChanges();
      },
    });
  }

  private loadRoutingForCurrentProduct() {
    if (!this.formFinishedProductId) return;

    this.operationsLoading = true;
    this.routingSvc.getByProduct(this.formFinishedProductId).subscribe({
      next: (r) => {
        const list = r.data ?? [];
        if (list.length === 0) {
          this.currentRouting = null;
          this.formOperations = [];
          this.operationsLoading = false;
          this.cdr.detectChanges();
          return;
        }

        const selected = list[0];
        this.routingSvc.getById(selected.id).subscribe({
          next: (detailResp) => {
            this.currentRouting = detailResp.data ?? selected;
            this.formOperations = (this.currentRouting.operations ?? [])
              .slice()
              .sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0))
              .map(op => this.mapRoutingOperationToForm(op));
            this.operationsLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.currentRouting = selected;
            this.formOperations = (selected.operations ?? [])
              .slice()
              .sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0))
              .map(op => this.mapRoutingOperationToForm(op));
            this.operationsLoading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.operationsLoading = false;
        this.error = 'Failed to load routing for selected product.';
        this.cdr.detectChanges();
      },
    });
  }

  private mapRoutingOperationToForm(op: RoutingOperationDto): OperationLine {
    const standardHours = this.normalizeDuration(op.standardHours);
    return {
      localId: this.operationRowCounter++,
      existingId: op.id,
      operationName: op.operationName ?? '',
      workCenterId: op.workCenterId ?? '',
      standardHours,
      durationText: this.formatDurationText(standardHours),
      durationSuggestions: [],
      showDurationDropdown: false,
      notes: op.notes ?? '',
    };
  }

  private normalizeDuration(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.round(value * 100) / 100);
  }

  addOperation() {
    this.formOperations.push({
      localId: this.operationRowCounter++,
      operationName: '',
      workCenterId: '',
      standardHours: 0,
      durationText: '',
      durationSuggestions: this.durationPresetOptions.slice(0, 8),
      showDurationDropdown: false,
      notes: '',
    });
    this.cdr.detectChanges();
  }

  removeOperation(index: number) {
    this.formOperations.splice(index, 1);
    this.cdr.detectChanges();
  }

  onOperationDurationInput(op: OperationLine) {
    const parsed = this.parseDurationText(op.durationText);
    if (parsed !== null) {
      op.standardHours = this.normalizeDuration(parsed);
    }

    op.durationSuggestions = this.getDurationSuggestions(op.durationText);
    op.showDurationDropdown = op.durationSuggestions.length > 0;
    this.cdr.detectChanges();
  }

  onOperationDurationBlur(op: OperationLine) {
    let input = (op.durationText ?? '').trim();

    // Auto-append 'm' if input ends with naked number (e.g., "1 hr 50" -> "1 hr 50m")
    if (input && /\d$/.test(input) && !/[hm]$/.test(input)) {
      input = input + 'm';
      op.durationText = input;
    }

    const parsed = this.parseDurationText(input);
    if (parsed === null || parsed <= 0) {
      op.standardHours = 0;
      op.durationText = op.durationText.trim();
      this.cdr.detectChanges();
      return;
    }

    op.standardHours = this.normalizeDuration(parsed);
    op.durationText = this.formatDurationText(op.standardHours);
    setTimeout(() => {
      op.showDurationDropdown = false;
      this.cdr.detectChanges();
    }, 120);
  }

  selectOperationDuration(op: OperationLine, value: string) {
    op.durationText = value;
    const parsed = this.parseDurationText(value);
    op.standardHours = parsed !== null ? this.normalizeDuration(parsed) : 0;
    op.durationSuggestions = [];
    op.showDurationDropdown = false;
    this.cdr.detectChanges();
  }

  private getDurationSuggestions(query: string): string[] {
    const q = (query ?? '').trim().toLowerCase();
    const bucket = new Set<string>();

    if (!q) {
      return this.durationPresetOptions.slice(0, 10);
    }

    // If user types a whole number (e.g. 1), prioritize that hour with common minute slices.
    if (/^\d+$/.test(q)) {
      const h = Number(q);
      [0, 15, 30, 45].forEach(mins => {
        const hours = h + (mins / 60);
        bucket.add(this.formatDurationText(hours));
      });
      bucket.add(this.formatDurationText(h + 1));
    }

    const parsed = this.parseDurationText(q);
    if (parsed !== null && parsed > 0) {
      bucket.add(this.formatDurationText(parsed));
      bucket.add(this.formatDurationText(parsed + 0.25));
      bucket.add(this.formatDurationText(parsed + 0.5));
    }

    this.durationPresetOptions
      .filter(x => x.toLowerCase().includes(q))
      .slice(0, 12)
      .forEach(x => bucket.add(x));

    return Array.from(bucket).slice(0, 12);
  }

  private parseDurationText(input: string): number | null {
    const raw = (input ?? '').trim().toLowerCase();
    if (!raw) return null;

    const normalized = raw.replace(/,/g, '.');
    // Normalize text variants: "hr", "hrs", "hour", "hours" -> "h"; "min", "mins", "minute", "minutes" -> "m"
    const cleaned = normalized
      .replace(/\bhrs?\b/g, 'h')
      .replace(/\bhours?\b/g, 'h')
      .replace(/\bmins?\b/g, 'm')
      .replace(/\bminutes?\b/g, 'm');

    // Supports HH:MM format like 1:30.
    const hhmmMatch = cleaned.match(/^(\d{1,3})\s*:\s*(\d{1,2})$/);
    if (hhmmMatch) {
      const hoursPart = Number(hhmmMatch[1]);
      const minutesPart = Number(hhmmMatch[2]);
      if (!Number.isFinite(hoursPart) || !Number.isFinite(minutesPart) || minutesPart >= 60) return null;
      return hoursPart + (minutesPart / 60);
    }

    // Supports plain numeric hours like 1 or 1.5.
    if (/^\d+(\.\d+)?$/.test(cleaned)) {
      const value = Number(cleaned);
      return Number.isFinite(value) ? value : null;
    }

    // Supports mixed units like 1h 30m, 90m, 2h, 45m (after normalization).
    const unitRegex = /(\d+(?:\.\d+)?)\s*([hm])\b/g;
    let totalMinutes = 0;
    let matchedAny = false;
    let match: RegExpExecArray | null = null;

    while ((match = unitRegex.exec(cleaned)) !== null) {
      matchedAny = true;
      const value = Number(match[1]);
      const unit = match[2];
      if (!Number.isFinite(value)) continue;
      if (unit === 'h') {
        totalMinutes += value * 60;
      } else if (unit === 'm') {
        totalMinutes += value;
      }
    }

    if (!matchedAny) return null;
    return totalMinutes / 60;
  }

  private formatDurationText(hours: number): string {
    const safeHours = this.normalizeDuration(hours);
    const totalMinutes = Math.round(safeHours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  }

  private buildDurationPresets(): string[] {
    const presets: string[] = [];
    for (let quarter = 1; quarter <= 48; quarter++) {
      const hours = quarter * 0.25;
      presets.push(this.formatDurationText(hours));
    }
    return presets;
  }

  getWorkCenterDisplay(workCenterId: string): string {
    const wc = this.workCenters.find(x => x.id === workCenterId);
    if (!wc) return 'Select Work Center';
    const code = wc.code?.trim() ?? '';
    const name = wc.name?.trim() ?? '';
    if (code && name) return `${code} - ${name}`;
    if (code) return code;
    if (name) return name;
    return 'Work Center';
  }

  onOperationDragStart(index: number, event: DragEvent) {
    this.draggingOperationIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  onOperationDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onOperationDrop(targetIndex: number, event: DragEvent) {
    event.preventDefault();
    if (this.draggingOperationIndex === null || this.draggingOperationIndex === targetIndex) {
      this.draggingOperationIndex = null;
      return;
    }

    const sourceIndex = this.draggingOperationIndex;
    const [moved] = this.formOperations.splice(sourceIndex, 1);
    if (!moved) {
      this.draggingOperationIndex = null;
      return;
    }

    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    this.formOperations.splice(insertIndex, 0, moved);
    this.draggingOperationIndex = null;
    this.cdr.detectChanges();
  }

  onOperationDragEnd() {
    this.draggingOperationIndex = null;
  }

  loadInventoryItems() {
    if (this.allItems.length > 0) {
      this.refreshComponentCosts();
      return;
    }
    this.itemsLoading = true;
    this.http.get<ApiResponse<InventoryItemDto[]>>(`${BASE_URL}/api/Item/active`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        this.allItems = r.data ?? [];
        this.itemsById = this.allItems.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as Record<string, InventoryItemDto>);
        this.itemsLoading = false;
        this.refreshEditingFinishedProductSearch();
        this.loadFinishedProductPickerPage();
        this.refreshComponentCosts();
        this.cdr.detectChanges();
      },
      error: () => { this.itemsLoading = false; this.cdr.detectChanges(); },
    });
  }

  loadInventoryUnits() {
    if (Object.keys(this.unitsById).length > 0) return;

    this.http.get<ApiResponse<InventoryUnitDto[]>>(`${BASE_URL}/api/Unit/active`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const units = r.data ?? [];
        this.unitsById = units.reduce((acc, unit) => {
          acc[unit.id] = unit;
          return acc;
        }, {} as Record<string, InventoryUnitDto>);
        this.refreshComponentCosts();
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  private isItemType(item: InventoryItemDto, expected: string): boolean {
    return (item.itemType ?? '').trim().toLowerCase() === expected.toLowerCase();
  }

  private resolveUnitDisplay(item: InventoryItemDto): string {
    const baseUnitId = item.baseUnitId ?? '';
    if (!baseUnitId) return 'N/A';
    const unit = this.unitsById[baseUnitId];
    if (!unit) return 'N/A';
    return unit.code?.trim() || unit.name?.trim() || 'N/A';
  }

  private parseNumeric(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private resolveUnitCost(item: InventoryItemDto): number {
    // Priority 1: top-level purchasePrice returned directly by some API endpoints
    const topLevel = this.parseNumeric(item.purchasePrice) ?? 0;
    if (topLevel > 0) return topLevel;

    const prices = item.prices ?? [];
    const baseUnitId = item.baseUnitId ?? '';

    const pickBestPurchasePrice = (p: typeof prices[0]): number => {
      for (const field of [p.purchasePrice, p.purchasePriceExcludingTax, p.purchasePriceIncludingTax]) {
        const v = this.parseNumeric(field) ?? 0;
        if (v > 0) return v;
      }
      return 0;
    };

    // Priority 2: purchasePrice in the prices array matching the item's base unit
    const matching = prices.find(p => p.unitId === baseUnitId);
    if (matching) {
      const v = pickBestPurchasePrice(matching);
      if (v > 0) return v;
    }

    // Priority 3: purchasePrice from any price entry
    for (const p of prices) {
      const v = pickBestPurchasePrice(p);
      if (v > 0) return v;
    }

    // Priority 4: supplier last purchase price (primary supplier first)
    const suppliers = item.suppliers ?? [];
    const primarySupplier = suppliers.find(s => s.isPrimary);
    if (primarySupplier) {
      const v = this.parseNumeric(primarySupplier.lastPurchasePrice) ?? 0;
      if (v > 0) return v;
    }
    for (const s of suppliers) {
      const v = this.parseNumeric(s.lastPurchasePrice) ?? 0;
      if (v > 0) return v;
    }

    // Priority 5: average inventory cost as last resort
    const balanceCost = this.itemBalanceCostById[item.id];
    if (Number.isFinite(balanceCost) && balanceCost > 0) return balanceCost;

    return 0;
  }

  private normalizeQuantity(value: number): number {
    if (!Number.isFinite(value)) return 1;
    return Math.max(0, Math.round(value));
  }

  refreshComponentCosts() {
    this.formComponents.forEach(comp => {
      if (!comp.selectedItemId) return;
      const inv = this.itemDetailsById[comp.selectedItemId] ?? this.itemsById[comp.selectedItemId];
      if (inv) {
        comp.selectedItemCode = inv.code ?? '';
        if (!comp.searchText) {
          comp.searchText = `${inv.code ?? ''} - ${inv.name ?? ''}`.trim().replace(/^- /, '');
        }
        comp.unitOfMeasure = this.resolveUnitDisplay(inv);
        // Never overwrite a resolved positive cost with 0 from a weaker cache source.
        const refreshedCost = this.resolveUnitCost(inv);
        if (refreshedCost > 0 || comp.unitCost === 0) {
          comp.unitCost = refreshedCost;
          comp.lineTotal = comp.quantity * comp.unitCost;
        }
      }

      this.fetchItemDetails(comp.selectedItemId, comp);
      if (comp.stockAvailable === null) comp.stockLoading = true;
      this.fetchInventoryBalanceCost(comp.selectedItemId, comp);
    });
    this.cdr.detectChanges();
  }

  private fetchItemDetails(itemId: string, targetComp?: ComponentLine) {
    if (!itemId) return;

    // itemDetailsById holds individually fetched full records.
    // itemsById holds records from the bulk /api/Item/active load — also includes prices.
    // Prefer itemDetailsById (more recent individual fetch) over itemsById.
    const cached = this.itemDetailsById[itemId] ?? this.itemsById[itemId];
    if (cached) {
      if (targetComp) {
        targetComp.unitOfMeasure = this.resolveUnitDisplay(cached);
        // Never downgrade an already-resolved positive cost to 0 from a weaker cache entry.
        const cachedCost = this.resolveUnitCost(cached);
        if (cachedCost > 0 || targetComp.unitCost === 0) {
          targetComp.unitCost = cachedCost;
          this.updateLineTotal(targetComp);
        }
      }
      // Only skip the HTTP call if we have a detailed record (itemDetailsById).
      if (this.itemDetailsById[itemId]) return;
    }

    this.http.get<ApiResponse<InventoryItemDto>>(`${BASE_URL}/api/Item/${itemId}`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const detail = r.data;
        if (!detail) return;
        this.itemDetailsById[itemId] = detail;
        this.itemsById[itemId] = detail;

        const applyTo = targetComp
          ? [targetComp]
          : this.formComponents.filter(c => c.selectedItemId === itemId);

        applyTo.forEach(comp => {
          comp.unitOfMeasure = this.resolveUnitDisplay(detail);
          const detailCost = this.resolveUnitCost(detail);
          if (detailCost > 0 || comp.unitCost === 0) {
            comp.unitCost = detailCost;
            this.updateLineTotal(comp);
          }
          // Populate display fields that were missing when the BOM was loaded
          // (the BOM API returns null for materialName/materialCode).
          if (!comp.selectedItemCode) comp.selectedItemCode = detail.code ?? '';
          if (!comp.selectedItemName) comp.selectedItemName = detail.name ?? '';
          if (!comp.searchText) {
            comp.searchText = [detail.code, detail.name].filter(Boolean).join(' - ');
          }
        });

        // If the fetched item is the current BOM's finished product, resolve its display.
        if (this.formFinishedProductId === itemId && this.finishedProductSearch === 'Loading product...') {
          this.finishedProductSearch = [detail.code, detail.name].filter(Boolean).join(' - ');
          this.formFinishedProductName = detail.name ?? '';
        }

        // /api/Item/{id} does not carry top-level purchasePrice (unlike /api/Item/basic).
        // If cost is still 0 after applying the full detail, fetch from /api/Item/basic
        // using the item's code to get the purchasePrice that was entered at item creation.
        const stillNeedsCost = applyTo.some(c => c.unitCost === 0);
        if (stillNeedsCost && detail.code) {
          this.fetchPriceFromBasic(itemId, detail.code, applyTo);
        }

        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  private fetchPriceFromBasic(itemId: string, code: string, applyTo: ComponentLine[]) {
    this.http.get<PaginatedApiResponse<InventoryItemDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params: { pageNumber: '1', pageSize: '10', search: code },
    }).subscribe({
      next: (r) => {
        const basicItem = (r.data ?? []).find(i => i.id === itemId);
        if (!basicItem) { this.cdr.detectChanges(); return; }

        const price = this.resolveUnitCost(basicItem);
        if (price > 0) {
          // Merge purchasePrice into the cached detail so future lookups also benefit.
          const cached = this.itemDetailsById[itemId];
          if (cached) cached.purchasePrice = basicItem.purchasePrice;

          applyTo.forEach(comp => {
            if (comp.unitCost === 0) {
              comp.unitCost = price;
              this.updateLineTotal(comp);
            }
          });
        }
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  private fetchInventoryBalanceCost(itemId: string, targetComp?: ComponentLine) {
    if (!itemId) return;

    // If already cached, apply to comp immediately without an HTTP call.
    const cachedCost = this.itemBalanceCostById[itemId];
    const cachedStock = this.itemStockById[itemId];
    const costCached = Number.isFinite(cachedCost);
    const stockCached = Number.isFinite(cachedStock);

    if (costCached && stockCached) {
      if (targetComp) {
        targetComp.stockAvailable = cachedStock;
        targetComp.stockLoading = false;
        // Only use balance cost as fallback when purchasePrice resolved to 0.
        if (cachedCost > 0 && targetComp.unitCost <= 0) {
          targetComp.unitCost = cachedCost;
          this.updateLineTotal(targetComp);
        }
      }
      return;
    }

    if (this.itemBalanceCostLoading[itemId]) return;
    this.itemBalanceCostLoading[itemId] = true;

    this.http.get<ApiResponse<InventoryBalanceDto[]>>(`${BASE_URL}/api/InventoryBalance/by-item/${itemId}`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        this.itemBalanceCostLoading[itemId] = false;

        const rawData = r.data;
        const balances: InventoryBalanceDto[] = Array.isArray(rawData) ? rawData : [];

        // Sum quantityAvailable across all warehouses for total available stock.
        const totalStock = balances.reduce((sum, b) => {
          return sum + Math.max(0, this.parseNumeric(b.quantityAvailable) ?? 0);
        }, 0);
        this.itemStockById[itemId] = totalStock;

        // Average cost: use the first warehouse with a positive average cost.
        const costs = balances
          .map(b => this.parseNumeric(b.averageCost))
          .filter((v): v is number => v !== null && v > 0);
        const resolvedCost = costs.length > 0 ? costs[0] : 0;
        this.itemBalanceCostById[itemId] = resolvedCost;

        const applyTo = targetComp
          ? [targetComp]
          : this.formComponents.filter(c => c.selectedItemId === itemId);

        applyTo.forEach(comp => {
          comp.stockAvailable = totalStock;
          comp.stockLoading = false;
          // Only apply balance cost as fallback when no purchasePrice was resolved.
          if (resolvedCost > 0 && comp.unitCost <= 0) {
            comp.unitCost = resolvedCost;
            this.updateLineTotal(comp);
          }
        });

        this.cdr.detectChanges();
      },
      error: () => {
        this.itemBalanceCostLoading[itemId] = false;
        if (targetComp) {
          targetComp.stockAvailable = 0;
          targetComp.stockLoading = false;
        }
        this.cdr.detectChanges();
      },
    });
  }

  // Finished product typeahead
  onFinishedProductFocus() {
    if (this.itemsLoading) return;
    this.loadFinishedProductDropdownPage('', 1, 5);
  }

  onFinishedProductInput() {
    if (this.finishedProductSearchTimer !== null) {
      window.clearTimeout(this.finishedProductSearchTimer);
    }

    this.finishedProductSearchTimer = window.setTimeout(() => {
      this.loadFinishedProductDropdownPage(this.finishedProductSearch, 1, 5);
    }, 160);
  }

  private loadFinishedProductDropdownPage(searchText: string, pageNumber: number, pageSize: number) {
    if (this.itemsLoading) {
      this.finishedProductSuggestions = [];
      this.showFinishedProductDropdown = false;
      return;
    }

    this.finishedProductDropdownLoading = true;
    this.http.get<PaginatedApiResponse<InventoryItemDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params: {
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
        search: searchText.trim(),
        itemType: 'FinishedGood',
      },
    }).subscribe({
      next: (r) => {
        this.finishedProductSuggestions = (r.data ?? []);
        this.showFinishedProductDropdown = true;
        this.finishedProductDropdownLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.finishedProductSuggestions = [];
        this.showFinishedProductDropdown = true;
        this.finishedProductDropdownLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openFinishedProductPicker() {
    if (this.itemsLoading) return;
    this.showFinishedProductDropdown = false;
    this.finishedProductPickerSearch = this.finishedProductSearch.trim();
    this.finishedProductPickerPage = 1;
    this.showFinishedProductPicker = true;
    this.loadFinishedProductPickerPage();
    this.ensureQuickCreateLookupsLoaded();
  }

  closeFinishedProductPicker() {
    this.showFinishedProductPicker = false;
    this.showQuickCreateItemForm = false;
    this.quickCreateItemError = '';
    this.cdr.detectChanges();
  }

  onFinishedProductPickerSearchChange() {
    if (this.finishedProductPickerSearchTimer !== null) {
      window.clearTimeout(this.finishedProductPickerSearchTimer);
    }

    this.finishedProductPickerPage = 1;
    this.finishedProductPickerSearchTimer = window.setTimeout(() => {
      this.loadFinishedProductPickerPage();
    }, 180);
  }

  onFinishedProductPickerFilterChange() {
    this.finishedProductPickerPage = 1;
    this.loadFinishedProductPickerPage();
  }

  goToFinishedProductPickerPage(page: number) {
    if (page < 1) return;
    if (this.finishedProductPickerLoading) return;
    this.finishedProductPickerPage = page;
    this.loadFinishedProductPickerPage();
  }

  finishedProductPickerTotalPages(): number {
    return Math.max(1, Math.ceil(this.finishedProductPickerTotal / this.finishedProductPickerPageSize));
  }

  selectFinishedProductFromPicker(item: InventoryItemDto) {
    this.selectFinishedProduct(item);
    this.closeFinishedProductPicker();
  }

  toggleQuickCreateItemForm() {
    this.showQuickCreateItemForm = !this.showQuickCreateItemForm;
    if (!this.showQuickCreateItemForm) {
      this.quickCreateItemError = '';
      this.cdr.detectChanges();
      return;
    }

    this.quickCreateItemError = '';
    this.quickItemType = 'FinishedGood';
    if (!this.quickItemCondition) this.quickItemCondition = 'New';
    this.ensureQuickCreateLookupsLoaded();
    this.cdr.detectChanges();
  }

  closeQuickCreateItemForm() {
    this.showQuickCreateItemForm = false;
    this.quickCreateItemError = '';
    this.cdr.detectChanges();
  }

  get quickCreateMissingFields(): string[] {
    const missing: string[] = [];
    if (!this.quickItemCode.trim()) missing.push('Code');
    if (!this.quickItemName.trim()) missing.push('Name');
    if (!this.quickItemType) missing.push('Item Type');
    if (!this.quickItemCondition) missing.push('Condition');
    if (!this.quickItemBaseUnitId) missing.push('Unit');
    if (!this.quickItemCategoryId) missing.push('Category');
    if (this.quickItemPurchasePrice == null || Number.isNaN(this.quickItemPurchasePrice)) missing.push('Purchase Price');
    if (this.quickItemSalePrice == null || Number.isNaN(this.quickItemSalePrice)) missing.push('Sale Price');
    if (!this.quickItemBarcode.trim()) missing.push('Barcode');
    return missing;
  }

  get canCreateQuickItem(): boolean {
    return this.quickCreateMissingFields.length === 0 && !this.quickCreateItemSaving;
  }

  createQuickItem() {
    if (!this.canCreateQuickItem) {
      this.quickCreateItemError = `Missing: ${this.quickCreateMissingFields.join(', ')}`;
      this.cdr.detectChanges();
      return;
    }

    this.quickCreateItemSaving = true;
    this.quickCreateItemError = '';

    const dto: Record<string, unknown> = {
      code: this.quickItemCode.trim(),
      name: this.quickItemName.trim(),
      itemType: this.quickItemType,
      condition: this.quickItemCondition,
      baseUnitId: this.quickItemBaseUnitId,
      categoryId: this.quickItemCategoryId,
      barcode: this.quickItemBarcode.trim(),
      purchasePrice: this.quickItemPurchasePrice,
      salePrice: this.quickItemSalePrice,
      ageRestriction: 0,
      isBatchTracked: false,
      isSerialTracked: false,
      hasVariants: false,
      isComponent: false,
      alertOnLowStock: false,
      alertOnExcessStock: false,
      isActive: true,
      isPublished: false,
      isFeatured: false,
      images: [],
      barcodes: [],
      prices: [],
      taxes: [],
      attributes: [],
      colorIds: [],
      sizes: [],
      variants: [],
      channelListings: [],
      suppliers: [],
      bundleComponents: [],
      substitutions: [],
      discounts: [],
      comments: [],
    };

    if (this.quickItemBrandId) dto['brandId'] = this.quickItemBrandId;
    if (this.quickItemDisplayColorId) dto['displayColorId'] = this.quickItemDisplayColorId;

    this.http.post<ApiResponse<InventoryItemDto>>(`${BASE_URL}/api/Item`, dto, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        this.quickCreateItemSaving = false;
        const created = r.data;
        if (created) {
          this.allItems = [created, ...this.allItems];
          this.itemsById[created.id] = created;
          this.selectFinishedProduct(created);
          this.loadFinishedProductPickerPage();
        }
        this.resetQuickCreateItemForm();
        this.showQuickCreateItemForm = false;
        this.showFinishedProductPicker = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.quickCreateItemSaving = false;
        this.quickCreateItemError = this.getErrorMessage(e, 'Failed to create item');
        this.cdr.detectChanges();
      },
    });
  }

  private resetQuickCreateItemForm() {
    this.quickItemCode = '';
    this.quickItemName = '';
    this.quickItemType = 'FinishedGood';
    this.quickItemCondition = 'New';
    this.quickItemBaseUnitId = '';
    this.quickItemCategoryId = '';
    this.quickItemBrandId = '';
    this.quickItemDisplayColorId = '';
    this.quickItemPurchasePrice = null;
    this.quickItemSalePrice = null;
    this.quickItemBarcode = '';
    this.quickCreateItemError = '';
  }

  private ensureQuickCreateLookupsLoaded() {
    if (this.quickCreateItemTypes.length === 0) {
      this.http.get<ApiResponse<LookupItemDto[]>>(`${BASE_URL}/api/inventory-lookup/item-types`, {
        headers: this.auth.getAuthHeaders(),
      }).subscribe({
        next: (r) => {
          this.quickCreateItemTypes = r.data ?? [];
          if (!this.quickItemType) {
            const finished = this.quickCreateItemTypes.find(x => (x.value ?? '').toLowerCase() === 'finishedgood');
            this.quickItemType = finished?.value || 'FinishedGood';
          }
          this.cdr.detectChanges();
        },
      });
    }

    if (this.quickCreateItemConditions.length === 0) {
      this.http.get<ApiResponse<LookupItemDto[]>>(`${BASE_URL}/api/inventory-lookup/item-conditions`, {
        headers: this.auth.getAuthHeaders(),
      }).subscribe({
        next: (r) => {
          this.quickCreateItemConditions = r.data ?? [];
          if (!this.quickItemCondition) {
            this.quickItemCondition = this.quickCreateItemConditions[0]?.value || 'New';
          }
          this.cdr.detectChanges();
        },
      });
    }

    if (Object.keys(this.unitsById).length === 0) {
      this.loadInventoryUnits();
    }

    if (this.quickCreateCategories.length === 0) {
      this.http.get<ApiResponse<InventoryCategoryDto[]>>(`${BASE_URL}/api/ItemCategory/active`, {
        headers: this.auth.getAuthHeaders(),
      }).subscribe({
        next: (r) => { this.quickCreateCategories = r.data ?? []; this.cdr.detectChanges(); },
      });
    }

    if (this.quickCreateBrands.length === 0) {
      this.http.get<ApiResponse<InventoryBrandDto[]>>(`${BASE_URL}/api/Brand/active`, {
        headers: this.auth.getAuthHeaders(),
      }).subscribe({
        next: (r) => { this.quickCreateBrands = r.data ?? []; this.cdr.detectChanges(); },
      });
    }

    if (this.quickCreateColors.length === 0) {
      this.http.get<ApiResponse<InventoryColorDto[]>>(`${BASE_URL}/api/Color/active`, {
        headers: this.auth.getAuthHeaders(),
      }).subscribe({
        next: (r) => { this.quickCreateColors = r.data ?? []; this.cdr.detectChanges(); },
      });
    }
  }

  private getErrorMessage(err: unknown, fallback: string): string {
    const payload = (err as { error?: unknown })?.error as {
      message?: string;
      title?: string;
      errors?: Record<string, string[] | string>;
    } | undefined;

    if (payload?.errors && typeof payload.errors === 'object') {
      const parts = Object.entries(payload.errors).flatMap(([k, v]) =>
        Array.isArray(v) ? v.map(m => `${k}: ${m}`) : [`${k}: ${v}`]
      );
      if (parts.length) return `${fallback}. ${parts.join(' | ')}`;
    }

    if (payload?.message) return `${fallback}. ${payload.message}`;
    if (payload?.title) return `${fallback}. ${payload.title}`;
    return fallback;
  }

  get finishedProductPickerTypeOptions(): string[] {
    const options = new Set<string>(['FinishedGood']);
    this.allItems
      .filter(i => i.isActive)
      .forEach(i => {
        const t = (i.itemType ?? '').trim();
        if (t) options.add(t);
      });
    return ['All', ...Array.from(options)];
  }

  formatItemTypeLabel(itemType: string | null): string {
    const raw = (itemType ?? '').trim();
    if (!raw) return 'Unknown';
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private loadFinishedProductPickerPage() {
    if (this.finishedProductPickerLoading) return;

    this.finishedProductPickerLoading = true;
    const typeFilter = (this.finishedProductPickerTypeFilter ?? 'FinishedGood').trim();
    const itemTypeParam = typeFilter === 'All' ? '' : typeFilter;

    const params: Record<string, string> = {
      pageNumber: String(this.finishedProductPickerPage),
      pageSize: String(this.finishedProductPickerPageSize),
      search: this.finishedProductPickerSearch.trim(),
    };

    if (itemTypeParam) {
      params['itemType'] = itemTypeParam;
    }

    this.http.get<PaginatedApiResponse<InventoryItemDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params,
    }).subscribe({
      next: (r) => {
        const items = (r.data ?? []);

        this.finishedProductPickerPageItems = items;
        this.finishedProductPickerTotal = r.pagination?.totalCount ?? items.length;
        this.finishedProductPickerStart = r.pagination?.startIndex ?? ((this.finishedProductPickerPage - 1) * this.finishedProductPickerPageSize + 1);
        this.finishedProductPickerEnd = r.pagination?.endIndex ?? (this.finishedProductPickerStart + items.length - 1);
        this.finishedProductPickerHasNextPage = r.pagination?.hasNextPage ?? false;
        this.finishedProductPickerHasPreviousPage = r.pagination?.hasPreviousPage ?? this.finishedProductPickerPage > 1;

        if (this.finishedProductPickerPageItems.length === 0) {
          this.finishedProductPickerStart = 0;
          this.finishedProductPickerEnd = 0;
        }

        this.finishedProductPickerLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.finishedProductPickerLoading = false;
        this.finishedProductPickerPageItems = [];
        this.finishedProductPickerTotal = 0;
        this.finishedProductPickerStart = 0;
        this.finishedProductPickerEnd = 0;
        this.cdr.detectChanges();
      },
    });
  }

  selectFinishedProduct(item: InventoryItemDto) {
    this.formFinishedProductId = item.id;
    this.formFinishedProductName = item.name ?? '';
    this.finishedProductSearch = [item.code, item.name].filter(Boolean).join(' - ');
    this.showFinishedProductDropdown = false;
    this.showOperationsPrompt = false;

    // In create mode, selecting a product should not auto-fill operations from any existing routing.
    if (!this.editing && this.showOperationsSection) {
      this.currentRouting = null;
      this.formOperations = [];
    }

    this.cdr.detectChanges();
  }

  closeFinishedDropdown() {
    setTimeout(() => { this.showFinishedProductDropdown = false; this.cdr.detectChanges(); }, 150);
  }

  // Component management
  addComponent() {
    this.formComponents.push({
      searchText: '', selectedItemId: '', selectedItemName: '', selectedItemCode: '',
      quantity: 1, unitOfMeasure: 'N/A',
      unitCost: 0, lineTotal: 0, notes: '',
      suggestions: [], showDropdown: false,
      stockAvailable: null, stockLoading: false,
    });
  }

  removeComponent(idx: number) {
    this.formComponents.splice(idx, 1);
  }

  onComponentFocus(comp: ComponentLine) {
    this.loadComponentDropdownPage(comp, comp.searchText, 1, 5);
  }

  onComponentSearch(comp: ComponentLine) {
    if (this.componentSearchTimer !== null) {
      window.clearTimeout(this.componentSearchTimer);
    }
    this.componentSearchTimer = window.setTimeout(() => {
      this.loadComponentDropdownPage(comp, comp.searchText, 1, 5);
    }, 160);
  }

  private loadComponentDropdownPage(comp: ComponentLine, searchText: string, pageNumber: number, pageSize: number) {
    this.http.get<PaginatedApiResponse<InventoryItemDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params: {
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
        search: searchText.trim(),
        itemType: 'RawMaterial',
      },
    }).subscribe({
      next: (r) => {
        const selectedIds = new Set(
          this.formComponents.filter(c => c !== comp && !!c.selectedItemId).map(c => c.selectedItemId),
        );
        comp.suggestions = (r.data ?? []).filter(i => i.id !== this.formFinishedProductId && !selectedIds.has(i.id));
        comp.showDropdown = true;
        this.cdr.detectChanges();
      },
      error: () => {
        comp.suggestions = [];
        comp.showDropdown = true;
        this.cdr.detectChanges();
      },
    });
  }

  openMaterialPicker(comp: ComponentLine) {
    comp.showDropdown = false;
    this.materialPickerForComp = comp;
    this.materialPickerSearch = comp.searchText.trim();
    this.materialPickerPage = 1;
    this.materialPickerOpen = true;
    this.loadMaterialPickerPage();
  }

  closeMaterialPicker() {
    this.materialPickerOpen = false;
    this.materialPickerForComp = null;
    this.cdr.detectChanges();
  }

  onMaterialPickerSearchChange() {
    if (this.materialPickerSearchTimer !== null) {
      window.clearTimeout(this.materialPickerSearchTimer);
    }
    this.materialPickerPage = 1;
    this.materialPickerSearchTimer = window.setTimeout(() => {
      this.loadMaterialPickerPage();
    }, 180);
  }

  goToMaterialPickerPage(page: number) {
    if (page < 1 || this.materialPickerLoading) return;
    this.materialPickerPage = page;
    this.loadMaterialPickerPage();
  }

  selectMaterialFromPicker(item: InventoryItemDto) {
    if (this.materialPickerForComp) {
      this.selectComponent(this.materialPickerForComp, item);
    }
    this.closeMaterialPicker();
  }

  private loadMaterialPickerPage() {
    if (this.materialPickerLoading) return;
    this.materialPickerLoading = true;

    this.http.get<PaginatedApiResponse<InventoryItemDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params: {
        pageNumber: String(this.materialPickerPage),
        pageSize: String(this.materialPickerPageSize),
        search: this.materialPickerSearch.trim(),
        itemType: 'RawMaterial',
      },
    }).subscribe({
      next: (r) => {
        this.materialPickerPageItems = r.data ?? [];
        this.materialPickerTotal = r.pagination?.totalCount ?? this.materialPickerPageItems.length;
        this.materialPickerStart = r.pagination?.startIndex ?? ((this.materialPickerPage - 1) * this.materialPickerPageSize + 1);
        this.materialPickerEnd = r.pagination?.endIndex ?? (this.materialPickerStart + this.materialPickerPageItems.length - 1);
        this.materialPickerHasNextPage = r.pagination?.hasNextPage ?? false;
        this.materialPickerHasPreviousPage = r.pagination?.hasPreviousPage ?? this.materialPickerPage > 1;
        if (this.materialPickerPageItems.length === 0) {
          this.materialPickerStart = 0;
          this.materialPickerEnd = 0;
        }
        this.materialPickerLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.materialPickerLoading = false;
        this.materialPickerPageItems = [];
        this.materialPickerTotal = 0;
        this.materialPickerStart = 0;
        this.materialPickerEnd = 0;
        this.cdr.detectChanges();
      },
    });
  }

  selectComponent(comp: ComponentLine, item: InventoryItemDto) {
    const duplicate = this.formComponents.find(c => c !== comp && c.selectedItemId === item.id);
    if (duplicate) {
      const incomingQty = this.normalizeQuantity(comp.quantity || 1);
      duplicate.quantity = this.normalizeQuantity(duplicate.quantity + incomingQty);
      this.updateLineTotal(duplicate);

      const removeIdx = this.formComponents.indexOf(comp);
      if (removeIdx >= 0) {
        this.formComponents.splice(removeIdx, 1);
      }

      this.error = 'This material already exists. Quantity was increased on the existing row.';
      this.cdr.detectChanges();
      return;
    }

    this.error = '';
    comp.selectedItemId = item.id;
    comp.selectedItemName = item.name ?? '';
    comp.selectedItemCode = item.code ?? '';
    comp.searchText = [item.code, item.name].filter(Boolean).join(' - ');
    comp.showDropdown = false;
    comp.stockAvailable = null;
    comp.stockLoading = true;

    // /api/Item/basic (dropdown source) carries a top-level purchasePrice.
    // /api/Item/active (bulk cache, itemsById) does NOT carry purchasePrice — using it
    // here would immediately overwrite the resolved cost with 0.
    // Priority: individually-fetched full record > basic item from dropdown > bulk cache.
    const cachedItem = this.itemDetailsById[item.id] ?? item;
    comp.unitOfMeasure = this.resolveUnitDisplay(cachedItem);
    comp.unitCost = this.resolveUnitCost(cachedItem);
    comp.quantity = this.normalizeQuantity(comp.quantity);
    comp.lineTotal = comp.quantity * comp.unitCost;

    // Fetch full item details (purchasePrice, suppliers) then inventory balance (stock + cost fallback).
    this.fetchItemDetails(item.id, comp);
    this.fetchInventoryBalanceCost(item.id, comp);
    this.cdr.detectChanges();
  }

  closeComponentDropdown(comp: ComponentLine) {
    setTimeout(() => { comp.showDropdown = false; this.cdr.detectChanges(); }, 150);
  }

  updateLineTotal(comp: ComponentLine) {
    comp.quantity = this.normalizeQuantity(comp.quantity);
    comp.lineTotal = comp.quantity * (comp.unitCost ?? 0);
    this.cdr.detectChanges();
  }

  getTotalCost(): number {
    return this.formComponents.reduce((sum, c) => sum + (c.lineTotal ?? 0), 0);
  }

  getComponentCount(item: BillOfMaterialDto): number {
    const count = this.bomComponentCountById[item.id];
    if (Number.isFinite(count)) return count;
    return item.items?.length ?? 0;
  }

  getFinishedProductDisplay(item: BillOfMaterialDto): string {
    const inv = this.itemDetailsById[item.finishedProductId] ?? this.itemsById[item.finishedProductId];
    const code = inv?.code?.trim() ?? '';
    const name = inv?.name?.trim() ?? '';
    if (code && name) return `${code} - ${name}`;
    if (code) return code;
    if (name) return name;
    if (item.finishedProductName?.trim()) return item.finishedProductName;
    return 'Loading product...';
  }

  getBomDisplayId(row: any): string {
    const n = row?.bomNumber;
    const value = Number.isFinite(n) && n > 0 ? n : 0;
    return 'BOM-' + String(value).padStart(3, '0');
  }

  private refreshEditingFinishedProductSearch() {
    if (!this.editing) return;
    this.finishedProductSearch = this.getFinishedProductDisplay(this.editing);
  }

  private loadBomComponentCounts() {
    if (!this.items.length) return;

    this.items.forEach(item => {
      this.svc.getById(item.id).subscribe({
        next: (r) => {
          const count = r.data?.items?.length ?? 0;
          this.bomComponentCountById[item.id] = count;
          (item as any).componentCount = count;
          (item as any).byProductCount = r.data?.byProducts?.length ?? (item as any).byProductCount ?? 0;
          this.cdr.detectChanges();
        },
        error: () => {
          const count = item.items?.length ?? 0;
          this.bomComponentCountById[item.id] = count;
          (item as any).componentCount = count;
          this.cdr.detectChanges();
        },
      });
    });
  }

  // Assigns stable, creation-order BOM numbers (newest = highest) plus sortable
  // count fields so the BOM ID / Components / By-Products columns can be sorted.
  private assignBomSortFields(): void {
    const offset = (this.page - 1) * this.pageSize;
    this.items.forEach((item: any, i) => {
      item.bomNumber = this.totalCount - (offset + i);
      item.componentCount = this.bomComponentCountById[item.id] ?? item.items?.length ?? 0;
      item.byProductCount = item.byProducts?.length ?? 0;
    });
  }

  // Resolve finished-product display names up front and in parallel so the list
  // does not show a staggered mix of resolved names and "Loading product...".
  private resolveFinishedProductNames(): void {
    const ids = new Set<string>();
    this.items.forEach(item => {
      const fpId = item.finishedProductId;
      if (fpId && !this.itemDetailsById[fpId] && !this.itemsById[fpId]) ids.add(fpId);
    });
    ids.forEach(id => this.fetchItemDetails(id));
  }

  reset() {
    this.formFinishedProductId = ''; this.formFinishedProductName = '';
    this.finishedProductSearch = ''; this.showFinishedProductDropdown = false;
    this.finishedProductSuggestions = [];
    this.finishedProductDropdownLoading = false;
    this.showFinishedProductPicker = false;
    this.finishedProductPickerSearch = '';
    this.finishedProductPickerTypeFilter = 'FinishedGood';
    this.finishedProductPickerPage = 1;
    this.finishedProductPickerTotal = 0;
    this.finishedProductPickerStart = 0;
    this.finishedProductPickerEnd = 0;
    this.finishedProductPickerPageItems = [];
    this.finishedProductPickerHasNextPage = false;
    this.finishedProductPickerHasPreviousPage = false;
    this.finishedProductPickerLoading = false;
    this.showQuickCreateItemForm = false;
    this.quickCreateItemSaving = false;
    this.resetQuickCreateItemForm();
    this.formComponents = []; this.formNotes = ''; this.formIsActive = true; this.formBomId = '';
    this.itemStockById = {};
    this.itemBalanceCostById = {};
    this.itemBalanceCostLoading = {};
    this.materialPickerOpen = false;
    this.materialPickerForComp = null;
    this.materialPickerSearch = '';
    this.materialPickerPage = 1;
    this.materialPickerTotal = 0;
    this.materialPickerStart = 0;
    this.materialPickerEnd = 0;
    this.materialPickerPageItems = [];
    this.materialPickerHasNextPage = false;
    this.materialPickerHasPreviousPage = false;
    this.materialPickerLoading = false;
    this.showOperationsSection = false;
    this.showOperationsPrompt = false;
    this.operationsLoading = false;
    this.operationsSaving = false;
    this.currentRouting = null;
    this.formOperations = [];
    this.draggingOperationIndex = null;
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    this.error = '';
    if (!this.formFinishedProductId) {
      this.error = 'Please select a finished product.';
      this.cdr.detectChanges();
      return;
    }

    const hasUnselectedRows = this.formComponents.some(c => !!c.searchText.trim() && !c.selectedItemId);
    if (hasUnselectedRows) {
      this.error = 'Please select a valid material from dropdown for each typed row.';
      this.cdr.detectChanges();
      return;
    }

    const selectedMaterials = this.formComponents.filter(c => !!c.selectedItemId);
    if (selectedMaterials.length === 0) {
      this.error = 'Please add at least one raw material before saving BOM.';
      this.cdr.detectChanges();
      return;
    }

    const hasInvalidQty = selectedMaterials.some(c => this.normalizeQuantity(c.quantity) <= 0);
    if (hasInvalidQty) {
      this.error = 'Material quantity must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }

    const insufficientStock = selectedMaterials.find(
      c => c.stockAvailable !== null && this.normalizeQuantity(c.quantity) > c.stockAvailable,
    );
    if (insufficientStock) {
      this.error = `Insufficient stock for "${insufficientStock.selectedItemName || insufficientStock.searchText}". Available: ${insufficientStock.stockAvailable}, requested: ${this.normalizeQuantity(insufficientStock.quantity)}.`;
      this.cdr.detectChanges();
      return;
    }

    if (this.showOperationsSection) {
      if (this.formOperations.length === 0) {
        this.error = 'Please add at least one operation in the Operations section.';
        this.cdr.detectChanges();
        return;
      }

      const invalidOperation = this.formOperations.find(op => {
        const parsed = this.parseDurationText(op.durationText);
        if (parsed === null) return true;
        op.standardHours = this.normalizeDuration(parsed);
        return !op.operationName.trim() || !op.workCenterId || op.standardHours <= 0;
      });
      if (invalidOperation) {
        this.error = 'Each operation needs operation name, work center, and valid duration (e.g. 1h 30m).';
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.editing) {
      const dto: UpdateBillOfMaterialDto = { notes: this.formNotes || null, isActive: this.formIsActive };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => this.syncComponents(this.editing!.id, this.editing!.items ?? [], () => this.syncRoutingIfNeeded()),
        error: () => { this.error = 'Failed to update BOM'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateBillOfMaterialDto = {
        id: this.formBomId,
        finishedProductId: this.formFinishedProductId,
        version: 1,
        effectiveFrom: new Date().toISOString().slice(0, 10),
        notes: this.formNotes || null,
      };
      this.svc.create(dto).subscribe({
        next: (r) => {
          this.justCreated = r.data ?? null;
          const bomId = r.data?.id;
          if (bomId) {
            this.createAllComponents(bomId, () => this.syncRoutingIfNeeded());
          } else {
            this.showForm = false;
            this.load();
          }
        },
        error: () => { this.error = 'Failed to create BOM'; this.cdr.detectChanges(); },
      });
    }
  }

  private createAllComponents(bomId: string, onComplete?: () => void) {
    const toCreate = this.formComponents.filter(c => c.selectedItemId);
    if (toCreate.length === 0) {
      if (onComplete) {
        onComplete();
      } else {
        this.showForm = false;
        this.load();
      }
      return;
    }

    let remaining = toCreate.length;
    const done = () => {
      if (--remaining <= 0) {
        if (onComplete) {
          onComplete();
        } else {
          this.showForm = false;
          this.load();
        }
      }
    };

    toCreate.forEach(comp => {
      const dto: CreateBOMItemDto = {
        materialId: comp.selectedItemId,
        quantityRequired: comp.quantity,
        scrapPercentage: 0,
        unitOfMeasure: comp.unitOfMeasure || null,
        notes: comp.notes || null,
      };
      this.svc.createItem(bomId, dto).subscribe({ next: done, error: () => { this.error = 'BOM saved but some components failed.'; done(); } });
    });
  }

  private syncComponents(bomId: string, existingItems: BOMItemDto[], onComplete?: () => void) {
    const existingIds = existingItems.map(i => i.id);
    const keptIds = this.formComponents.filter(c => c.existingId).map(c => c.existingId!);
    const toDelete = existingIds.filter(id => !keptIds.includes(id));
    const toCreate = this.formComponents.filter(c => !c.existingId && c.selectedItemId);
    const toUpdate = this.formComponents.filter(c => c.existingId && c.selectedItemId);

    let ops = toDelete.length + toCreate.length + toUpdate.length;
    if (ops === 0) {
      if (onComplete) {
        onComplete();
      } else {
        this.showForm = false;
        this.load();
      }
      return;
    }

    const done = () => {
      if (--ops <= 0) {
        if (onComplete) {
          onComplete();
        } else {
          this.showForm = false;
          this.load();
        }
      }
    };

    toDelete.forEach(id => this.svc.deleteItem(bomId, id).subscribe({ next: done, error: done }));
    toCreate.forEach(comp => {
      const dto: CreateBOMItemDto = { materialId: comp.selectedItemId, quantityRequired: comp.quantity, scrapPercentage: 0, unitOfMeasure: comp.unitOfMeasure || null, notes: comp.notes || null };
      this.svc.createItem(bomId, dto).subscribe({ next: done, error: done });
    });
    toUpdate.forEach(comp => {
      const dto = { quantityRequired: comp.quantity, scrapPercentage: 0, unitOfMeasure: comp.unitOfMeasure || null, notes: comp.notes || null };
      this.svc.updateItem(bomId, comp.existingId!, dto).subscribe({ next: done, error: done });
    });
  }

  private syncRoutingIfNeeded() {
    if (!this.showOperationsSection) {
      this.showForm = false;
      this.load();
      return;
    }

    const normalizedOps = this.formOperations.map((op, index) => ({
      ...op,
      sequenceNo: index + 1,
      operationName: op.operationName.trim(),
      standardHours: this.normalizeDuration(op.standardHours),
    }));

    this.operationsSaving = true;
    if (this.currentRouting?.id) {
      this.syncOperationsOnRouting(this.currentRouting.id, normalizedOps);
      return;
    }

    const routeName = `${this.formFinishedProductName || 'Product'} Routing`;
    const createDto: CreateRoutingDto = {
      productId: this.formFinishedProductId,
      name: routeName,
      version: 1,
      description: this.formNotes || null,
    };

    this.routingSvc.create(createDto).subscribe({
      next: (resp) => {
        const routing = resp.data;
        if (!routing?.id) {
          this.operationsSaving = false;
          this.showForm = false;
          this.load();
          return;
        }

        this.currentRouting = { ...routing, operations: [] };
        this.syncOperationsOnRouting(routing.id, normalizedOps);
      },
      error: () => {
        this.operationsSaving = false;
        this.error = 'BOM saved, but failed to create routing.';
        this.showForm = false;
        this.load();
      },
    });
  }

  private syncOperationsOnRouting(
    routingId: string,
    normalizedOps: Array<OperationLine & { sequenceNo: number }>,
  ) {
    const existingOps = this.currentRouting?.operations ?? [];
    const existingIds = existingOps.map(op => op.id);
    const keptIds = normalizedOps.filter(op => !!op.existingId).map(op => op.existingId!);

    const toDelete = existingIds.filter(id => !keptIds.includes(id));
    const toCreate = normalizedOps.filter(op => !op.existingId);
    const toUpdate = normalizedOps.filter(op => !!op.existingId);

    let pending = toDelete.length + toCreate.length + toUpdate.length;
    if (pending === 0) {
      this.operationsSaving = false;
      this.showForm = false;
      this.load();
      return;
    }

    const done = () => {
      if (--pending <= 0) {
        this.operationsSaving = false;
        this.showForm = false;
        this.load();
      }
    };

    toDelete.forEach(id => {
      this.routingSvc.deleteOperation(routingId, id).subscribe({ next: done, error: done });
    });

    toCreate.forEach(op => {
      const dto: CreateRoutingOperationDto = {
        sequenceNo: op.sequenceNo,
        operationName: op.operationName,
        workCenterId: op.workCenterId,
        standardHours: op.standardHours,
        setupHours: 0,
        laborHours: 0,
        machineHours: 0,
        notes: op.notes || null,
      };
      this.routingSvc.createOperation(routingId, dto).subscribe({ next: done, error: done });
    });

    toUpdate.forEach(op => {
      const dto: UpdateRoutingOperationDto = {
        sequenceNo: op.sequenceNo,
        operationName: op.operationName,
        workCenterId: op.workCenterId,
        standardHours: op.standardHours,
        setupHours: 0,
        laborHours: 0,
        machineHours: 0,
        notes: op.notes || null,
      };
      this.routingSvc.updateOperation(routingId, op.existingId!, dto).subscribe({ next: done, error: done });
    });
  }

  delete(item: BillOfMaterialDto) {
    if (confirm(`Delete BOM for "${item.finishedProductName ?? item.finishedProductId}"?`)) {
      this.svc.delete(item.id).subscribe({ next: () => this.load(), error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); } });
    }
  }
}

