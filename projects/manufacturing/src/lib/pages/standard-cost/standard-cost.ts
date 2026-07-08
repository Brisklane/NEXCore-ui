import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { StandardCostService } from '../../services/standard-cost.service';
import { BomService } from '../../services/bom.service';
import { RoutingService } from '../../services/routing.service';
import { WorkCenterService } from '../../services/work-center.service';
import { OverheadRuleService } from '../../services/overhead-rule.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { StandardCostDto, CreateStandardCostDto, UpdateStandardCostDto } from '../../models/standard-cost.model';
import { BillOfMaterialDto, BOMItemDto } from '../../models/bill-of-material.model';
import { RoutingDto, RoutingOperationDto } from '../../models/routing.model';
import { WorkCenterDto } from '../../models/work-center.model';
import { OverheadRuleDto } from '../../models/overhead-rule.model';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemDto {
  id: string;
  code: string | null;
  name: string | null;
  itemType: string | null;
  baseUnitId: string | null;
  purchasePrice?: number | string | null;
  prices: Array<{ unitId: string | null; purchasePrice: number | string | null }> | null;
  suppliers?: Array<{ lastPurchasePrice: number | string | null; isPrimary: boolean }> | null;
}

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
  itemType: string | null;
}

interface InventoryBalanceDto {
  averageCost: number | string | null;
}

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

interface CostBreakdownEntry {
  label: string;
  amount: number;
  source: string;
  found: boolean;
}

@Component({
  selector: 'lib-standard-cost',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './standard-cost.html',
  styleUrl: './standard-cost.css',
})
export class StandardCost implements OnInit {
  items: StandardCostDto[] = [];
  filteredItems: StandardCostDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  productLabelsById: Record<string, string> = {};
  loading = false;
  error = '';
  showForm = false;
  editing: StandardCostDto | null = null;

  // Form fields
  formProductCode = '';
  formProductId = '';
  formProductName = '';
  formCurrencyCode = 'USD';
  formMaterialCost = 0;
  formLaborCost = 0;
  formMachineCost = 0;
  formOverheadCost = 0;
  formTotalCost = 0;
  formNotes = '';
  formIsActive = true;
  autoCostLoading = false;
  productSuggestions: InventoryItemLookupDto[] = [];
  showProductDropdown = false;
  productDropdownLoading = false;
  showProductPicker = false;
  productPickerSearch = '';
  productPickerPage = 1;
  readonly productPickerPageSize = 20;
  productPickerTotal = 0;
  productPickerStart = 0;
  productPickerEnd = 0;
  productPickerPageItems: InventoryItemLookupDto[] = [];
  productPickerHasNextPage = false;
  productPickerHasPreviousPage = false;
  productPickerLoading = false;
  private productDropdownTimer: number | null = null;
  private productPickerSearchTimer: number | null = null;
  calculationBreakdown: CostBreakdownEntry[] = [];

  // Filters
  filterSearch = '';
  filterCurrency = '';
  filterStatus = 'all'; // all, active, inactive

  // Summary metrics
  totalItemsCount = 0;
  activeItemsCount = 0;
  totalCostValue = 0;
  averageCost = 0;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  constructor(
    private svc: StandardCostService,
    private bomSvc: BomService,
    private routingSvc: RoutingService,
    private workCenterSvc: WorkCenterService,
    private overheadRuleSvc: OverheadRuleService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.error = '';

    try {
      const r = await firstValueFrom(this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }));
      this.items = r.data ?? [];
      this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
      this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
      this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
      await this.preloadProductLabels(this.items.map((item) => item.productId));
      this.calculateMetrics();
      this.applyFilters();
      this.applyJustCreated();
    } catch {
      this.error = 'Failed to load standard costs';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number) { this.page = page; void this.load(); }
  onPageSizeChange() { this.page = 1; void this.load(); }

  private normalizeItemLabel(code: string | null | undefined, name: string | null | undefined, fallback: string): string {
    const normalizedCode = code?.trim() ?? '';
    const normalizedName = name?.trim() ?? '';

    if (normalizedCode && normalizedName) {
      return `${normalizedCode} - ${normalizedName}`;
    }

    if (normalizedCode) {
      return normalizedCode;
    }

    if (normalizedName) {
      return normalizedName;
    }

    return fallback;
  }

  private async preloadProductLabels(productIds: string[]) {
    const uniqueIds = [...new Set(productIds.filter(Boolean))].filter((id) => !this.productLabelsById[id]);
    if (uniqueIds.length === 0) return;

    await Promise.all(
      uniqueIds.map(async (productId) => {
        try {
          const response = await firstValueFrom(
            this.http.get<ApiResponse<InventoryItemDto>>(`${BASE_URL}/api/Item/${productId}`, {
              headers: this.auth.getAuthHeaders(),
            }),
          );

          const item = response.data;
          this.productLabelsById[productId] = item
            ? this.normalizeItemLabel(item.code, item.name, productId)
            : productId;
        } catch {
          this.productLabelsById[productId] = productId;
        }
      }),
    );
  }

  getProductDisplay(item: StandardCostDto): string {
    return this.productLabelsById[item.productId] ?? this.normalizeItemLabel(null, item.productName, item.productId);
  }

  calculateMetrics() {
    this.totalItemsCount = this.items.length;
    this.activeItemsCount = this.items.filter((i) => i.isActive).length;
    this.totalCostValue = this.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    this.averageCost = this.totalItemsCount > 0 ? this.totalCostValue / this.totalItemsCount : 0;
  }

  applyFilters() {
    this.filteredItems = this.items.filter((item) => {
      const matchSearch =
        !this.filterSearch ||
        this.getProductDisplay(item).toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productId?.toLowerCase().includes(this.filterSearch.toLowerCase());

      const matchCurrency = !this.filterCurrency || item.currencyCode === this.filterCurrency;

      const matchStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && item.isActive) ||
        (this.filterStatus === 'inactive' && !item.isActive);

      return matchSearch && matchCurrency && matchStatus;
    });
    this.cdr.detectChanges();
  }

  onFilterChange() {
    this.applyFilters();
  }

  get displayRows(): any[] {
    let rows: any[] = [...this.filteredItems];
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
    if (!this.filteredItems.some((i: any) => i?.id === c.id)) this.filteredItems = [c, ...this.filteredItems];
    this.highlighter.flash(c.id, this.cdr);
  }

  getCostComposition(item: StandardCostDto): { material: number; labor: number; machine: number; overhead: number } {
    return {
      material: ((item.materialCost || 0) / (item.totalCost || 1)) * 100,
      labor: ((item.laborCost || 0) / (item.totalCost || 1)) * 100,
      machine: ((item.machineCost || 0) / (item.totalCost || 1)) * 100,
      overhead: ((item.overheadCost || 0) / (item.totalCost || 1)) * 100,
    };
  }

  calcTotal() {
    this.formTotalCost = (this.formMaterialCost || 0) + (this.formLaborCost || 0) + (this.formMachineCost || 0) + (this.formOverheadCost || 0);
  }

  onProductFocus() {
    if (this.editing) return;
    this.loadProductDropdownItems('', 5);
  }

  onProductInput() {
    if (this.editing) return;
    if (this.productDropdownTimer !== null) {
      window.clearTimeout(this.productDropdownTimer);
    }
    this.productDropdownTimer = window.setTimeout(() => {
      this.loadProductDropdownItems(this.formProductCode, 5);
    }, 160);
  }

  private loadProductDropdownItems(searchText: string, pageSize: number) {
    this.productDropdownLoading = true;
    this.http.get<PaginatedApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params: {
        pageNumber: '1',
        pageSize: String(pageSize),
        search: searchText.trim(),
        itemType: 'FinishedGood',
      },
    }).subscribe({
      next: (r) => {
        this.productSuggestions = r.data ?? [];
        this.showProductDropdown = true;
        this.productDropdownLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.productSuggestions = [];
        this.showProductDropdown = true;
        this.productDropdownLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectProductSuggestion(item: InventoryItemLookupDto) {
    if (this.editing) return;

    this.formProductCode = [item.code, item.name].filter(Boolean).join(' - ');
    this.formProductId = item.id;
    this.formProductName = item.name ?? '';
    this.showProductDropdown = false;
    this.error = '';
    void this.autoCalculateCosts();
    this.cdr.detectChanges();
  }

  closeProductDropdown() {
    setTimeout(() => {
      this.showProductDropdown = false;
      this.cdr.detectChanges();
    }, 120);
  }

  openProductPicker() {
    this.showProductDropdown = false;
    this.productPickerSearch = this.formProductCode.trim();
    this.productPickerPage = 1;
    this.showProductPicker = true;
    this.loadProductPickerPage();
  }

  closeProductPicker() {
    this.showProductPicker = false;
    this.cdr.detectChanges();
  }

  onProductPickerSearchChange() {
    if (this.productPickerSearchTimer !== null) {
      window.clearTimeout(this.productPickerSearchTimer);
    }
    this.productPickerPage = 1;
    this.productPickerSearchTimer = window.setTimeout(() => {
      this.loadProductPickerPage();
    }, 180);
  }

  goToProductPickerPage(page: number) {
    if (page < 1 || this.productPickerLoading) return;
    this.productPickerPage = page;
    this.loadProductPickerPage();
  }

  selectProductFromPicker(item: InventoryItemLookupDto) {
    this.selectProductSuggestion(item);
    this.closeProductPicker();
  }

  private loadProductPickerPage() {
    if (this.productPickerLoading) return;
    this.productPickerLoading = true;

    this.http.get<PaginatedApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params: {
        pageNumber: String(this.productPickerPage),
        pageSize: String(this.productPickerPageSize),
        search: this.productPickerSearch.trim(),
        itemType: 'FinishedGood',
      },
    }).subscribe({
      next: (r) => {
        const items = r.data ?? [];
        this.productPickerPageItems = items;
        this.productPickerTotal = r.pagination?.totalCount ?? items.length;
        this.productPickerStart = r.pagination?.startIndex ?? ((this.productPickerPage - 1) * this.productPickerPageSize + 1);
        this.productPickerEnd = r.pagination?.endIndex ?? (this.productPickerStart + items.length - 1);
        this.productPickerHasNextPage = r.pagination?.hasNextPage ?? false;
        this.productPickerHasPreviousPage = r.pagination?.hasPreviousPage ?? this.productPickerPage > 1;
        if (items.length === 0) {
          this.productPickerStart = 0;
          this.productPickerEnd = 0;
        }
        this.productPickerLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.productPickerPageItems = [];
        this.productPickerTotal = 0;
        this.productPickerStart = 0;
        this.productPickerEnd = 0;
        this.productPickerLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private isRuleActiveNow(rule: OverheadRuleDto): boolean {
    if (!rule.isActive) return false;
    const now = new Date();
    const from = rule.effectiveFrom ? new Date(rule.effectiveFrom) : null;
    const to = rule.effectiveTo ? new Date(rule.effectiveTo) : null;
    if (from && now < from) return false;
    if (to && now > to) return false;
    return true;
  }

  private matchesAppliesTo(rule: OverheadRuleDto, keywords: string[]): boolean {
    const appliesTo = (rule.appliesTo ?? '').toLowerCase();
    if (!appliesTo) return false;
    return keywords.some((k) => appliesTo.includes(k));
  }

  private parseLaborScope(appliesTo: string | null | undefined): string {
    const value = (appliesTo ?? '').trim();
    if (!value) return 'all';
    const parts = value.split(':');
    if (parts.length < 2) return 'all';
    return parts.slice(1).join(':').trim().toLowerCase() || 'all';
  }

  private applyRuleAmount(rule: OverheadRuleDto, baseAmount: number, totalHours: number, units = 1): number {
    const ruleType = (rule.rateType ?? '').toLowerCase();
    const value = this.toNumber(rule.value);

    if (ruleType === 'percentage') return (baseAmount * value) / 100;
    if (ruleType === 'perhour') return totalHours * value;
    if (ruleType === 'perunit') return units * value;
    return value;
  }

  private pickPreferredBom(list: BillOfMaterialDto[]): BillOfMaterialDto | null {
    if (!list.length) return null;
    const active = list.filter((b) => b.isActive);
    const source = active.length ? active : list;
    return source.slice().sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0] ?? null;
  }

  private pickPreferredRouting(list: RoutingDto[]): RoutingDto | null {
    if (!list.length) return null;
    const active = list.filter((r) => r.isActive);
    const source = active.length ? active : list;
    return source.slice().sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0] ?? null;
  }

  private resolvePriceFromItem(item: InventoryItemDto): number {
    // /api/Item/basic populates a top-level purchasePrice — check it first.
    const topLevel = this.toNumber(item.purchasePrice);
    if (topLevel > 0) return topLevel;

    const prices = item.prices ?? [];
    const baseUnitId = item.baseUnitId ?? '';
    const byBase = prices.find((p) => p.unitId === baseUnitId);
    const anyPrice = byBase ?? prices.find((p) => this.toNumber(p.purchasePrice) > 0);
    if (anyPrice) {
      const numeric = this.toNumber(anyPrice.purchasePrice);
      if (numeric > 0) return numeric;
    }

    const primarySupplier = (item.suppliers ?? []).find((s) => s.isPrimary && this.toNumber(s.lastPurchasePrice) > 0);
    if (primarySupplier) return this.toNumber(primarySupplier.lastPurchasePrice);

    const anySupplier = (item.suppliers ?? []).find((s) => this.toNumber(s.lastPurchasePrice) > 0);
    if (anySupplier) return this.toNumber(anySupplier.lastPurchasePrice);

    return 0;
  }

  private async resolveMaterialUnitCost(itemId: string): Promise<number> {
    // 1. Inventory balance average cost (most accurate — reflects actual stock valuation).
    try {
      const balanceResp = await firstValueFrom(
        this.http.get<ApiResponse<InventoryBalanceDto[]>>(`${BASE_URL}/api/InventoryBalance/by-item/${itemId}`, {
          headers: this.auth.getAuthHeaders(),
        }),
      );
      const avg = this.toNumber(balanceResp.data?.[0]?.averageCost);
      if (avg > 0) return avg;
    } catch {
      // Fall through.
    }

    // 2. Item master full record — prices array + suppliers.
    let itemCode: string | null = null;
    try {
      const itemResp = await firstValueFrom(
        this.http.get<ApiResponse<InventoryItemDto>>(`${BASE_URL}/api/Item/${itemId}`, {
          headers: this.auth.getAuthHeaders(),
        }),
      );
      const item = itemResp.data;
      if (item) {
        itemCode = item.code;
        const price = this.resolvePriceFromItem(item);
        if (price > 0) return price;
      }
    } catch {
      // Fall through.
    }

    // 3. /api/Item/basic carries a top-level purchasePrice not returned by /api/Item/{id}.
    if (itemCode) {
      try {
        const basicResp = await firstValueFrom(
          this.http.get<PaginatedApiResponse<InventoryItemDto[]>>(`${BASE_URL}/api/Item/basic`, {
            headers: this.auth.getAuthHeaders(),
            params: { pageNumber: '1', pageSize: '5', search: itemCode },
          }),
        );
        const basicItem = (basicResp.data ?? []).find((i) => i.id === itemId);
        if (basicItem) {
          const price = this.resolvePriceFromItem(basicItem);
          if (price > 0) return price;
        }
      } catch {
        // Fall through.
      }
    }

    return 0;
  }

  async autoCalculateCosts() {
    if (!this.formProductId.trim()) {
      this.error = 'Select a product first to auto-calculate costs.';
      this.cdr.detectChanges();
      return;
    }

    this.autoCostLoading = true;
    this.error = '';
    this.calculationBreakdown = [];

    try {
      // 1) Material cost from BOM consumption × current material unit cost.
      let materialCost = 0;
      let bomItemCount = 0;
      const bomListResp = await firstValueFrom(this.bomSvc.getByProduct(this.formProductId));
      const selectedBom = this.pickPreferredBom(bomListResp.data ?? []);

      if (selectedBom) {
        const bomDetailResp = await firstValueFrom(this.bomSvc.getById(selectedBom.id));
        const bomItems = bomDetailResp.data?.items ?? [];
        for (const comp of bomItems) {
          const unitCost = await this.resolveMaterialUnitCost(comp.materialId);
          const effectiveQty = this.toNumber(comp.quantityRequired) * (1 + (this.toNumber(comp.scrapPercentage) / 100));
          materialCost += effectiveQty * unitCost;
        }
        bomItemCount = bomItems.length;
      }

      // 2) Machine/Labor from routing operation hours.
      let machineCost = 0;
      let laborHours = 0;
      let machineHours = 0;

      const routingResp = await firstValueFrom(this.routingSvc.getByProduct(this.formProductId));
      const selectedRouting = this.pickPreferredRouting(routingResp.data ?? []);

      let operations: RoutingOperationDto[] = [];
      if (selectedRouting) {
        const routingDetailResp = await firstValueFrom(this.routingSvc.getById(selectedRouting.id));
        operations = routingDetailResp.data?.operations ?? [];
      }

      const workCenterResp = await firstValueFrom(this.workCenterSvc.getAll());
      const workCenters = (workCenterResp.data ?? []).reduce((acc, wc) => {
        acc[wc.id] = wc;
        return acc;
      }, {} as Record<string, WorkCenterDto>);

      operations.forEach((op) => {
        const opLaborHours = this.toNumber(op.laborHours) > 0 ? this.toNumber(op.laborHours) : this.toNumber(op.standardHours);
        const opMachineHours = this.toNumber(op.machineHours) > 0 ? this.toNumber(op.machineHours) : this.toNumber(op.standardHours);
        laborHours += opLaborHours;
        machineHours += opMachineHours;

        const wc = workCenters[op.workCenterId];
        if (wc) {
          machineCost += opMachineHours * this.toNumber(wc.hourlyMachineCost);
        }
      });

      // 3) Labor and overhead from active overhead rules.
      const overheadResp = await firstValueFrom(this.overheadRuleSvc.getAll());
      const activeRules = (overheadResp.data ?? []).filter((r) => this.isRuleActiveNow(r));

      const laborRules = activeRules.filter((r) => {
        const code = (r.code ?? '').toLowerCase();
        const appliesTo = (r.appliesTo ?? '').toLowerCase();
        return code.startsWith('lr-') || appliesTo.startsWith('labor:') || appliesTo.startsWith('labour:');
      });
      const overheadRules = activeRules.filter((r) => !laborRules.includes(r));

      let laborCost = 0;
      laborRules.forEach((rule) => {
        const laborScope = this.parseLaborScope(rule.appliesTo);
        if (laborScope === 'all') {
          laborCost += this.applyRuleAmount(rule, materialCost + machineCost, laborHours, 1);
          return;
        }

        const scopedOps = operations.filter((op) => {
          const wc = workCenters[op.workCenterId];
          const wcCode = (wc?.code ?? '').trim().toLowerCase();
          const wcName = (wc?.name ?? '').trim().toLowerCase();
          return laborScope === wcCode || laborScope === wcName;
        });
        const scopedLaborHours = scopedOps.reduce((sum, op) => {
          const value = this.toNumber(op.laborHours) > 0 ? this.toNumber(op.laborHours) : this.toNumber(op.standardHours);
          return sum + value;
        }, 0);

        if (scopedLaborHours > 0) {
          laborCost += this.applyRuleAmount(rule, materialCost + machineCost, scopedLaborHours, 1);
        }
      });

      let overheadCost = 0;
      overheadRules.forEach((rule) => {
        overheadCost += this.applyRuleAmount(rule, materialCost + laborCost + machineCost, laborHours + machineHours, 1);
      });

      this.formMaterialCost = this.roundCurrency(materialCost);
      this.formMachineCost = this.roundCurrency(machineCost);
      this.formLaborCost = this.roundCurrency(laborCost);
      this.formOverheadCost = this.roundCurrency(overheadCost);
      this.calcTotal();

      this.calculationBreakdown = [
        {
          label: 'Material',
          amount: this.formMaterialCost,
          source: selectedBom
            ? `BOM v${selectedBom.version ?? 1} · ${bomItemCount} component${bomItemCount !== 1 ? 's' : ''}`
            : 'No BOM found — add one on the Bill of Materials page',
          found: !!selectedBom && bomItemCount > 0,
        },
        {
          label: 'Machine',
          amount: this.formMachineCost,
          source: operations.length === 0
            ? 'No routing found — add one on the Routing page'
            : machineHours === 0
              ? `${operations.length} routing op${operations.length !== 1 ? 's' : ''} · no machine hours defined`
              : `${operations.length} routing op${operations.length !== 1 ? 's' : ''} · ${this.roundCurrency(machineHours)}h machine time`,
          found: operations.length > 0 && machineHours > 0,
        },
        {
          label: 'Labor',
          amount: this.formLaborCost,
          source: laborRules.length === 0
            ? 'No active labor rules — configure on Labor Rates page'
            : laborHours === 0
              ? `${laborRules.length} rule${laborRules.length !== 1 ? 's' : ''} active · no routing hours — add routing operations`
              : `${laborRules.length} active rule${laborRules.length !== 1 ? 's' : ''} · ${this.roundCurrency(laborHours)}h labor time`,
          found: laborRules.length > 0 && laborHours > 0,
        },
        {
          label: 'Overhead',
          amount: this.formOverheadCost,
          source: overheadRules.length > 0
            ? `${overheadRules.length} active rule${overheadRules.length !== 1 ? 's' : ''} applied`
            : 'No active overhead rules — configure on Overhead Rules page',
          found: overheadRules.length > 0,
        },
      ];
      this.cdr.detectChanges();
    } catch {
      this.error = 'Unable to auto-calculate costs for this product. Check BOM, routing, and setup master data.';
      this.cdr.detectChanges();
    } finally {
      this.autoCostLoading = false;
      this.cdr.detectChanges();
    }
  }

  openCreate() {
    this.editing = null;
    this.reset();
    this.showForm = true;
  }

  openEdit(item: StandardCostDto) {
    this.editing = item;
    this.formProductCode = this.getProductDisplay(item);
    this.formProductId = item.productId ?? '';
    this.formProductName = this.getProductDisplay(item);
    this.formCurrencyCode = item.currencyCode ?? 'USD';
    this.formMaterialCost = item.materialCost ?? 0;
    this.formLaborCost = item.laborCost ?? 0;
    this.formMachineCost = item.machineCost ?? 0;
    this.formOverheadCost = item.overheadCost ?? 0;
    this.formTotalCost = item.totalCost ?? 0;
    this.formNotes = item.notes ?? '';
    this.formIsActive = item.isActive ?? true;
    this.calculationBreakdown = [];
    this.showForm = true;
  }

  reset() {
    this.formProductCode = '';
    this.formProductId = '';
    this.formProductName = '';
    this.formCurrencyCode = 'USD';
    this.formMaterialCost = 0;
    this.formLaborCost = 0;
    this.formMachineCost = 0;
    this.formOverheadCost = 0;
    this.formTotalCost = 0;
    this.formNotes = '';
    this.formIsActive = true;
    this.autoCostLoading = false;
    this.calculationBreakdown = [];
    this.productSuggestions = [];
    this.showProductDropdown = false;
    this.showProductPicker = false;
    this.productPickerSearch = '';
    this.productPickerPage = 1;
    this.productPickerPageItems = [];
    this.productPickerTotal = 0;
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.reset();
  }

  save() {
    this.calcTotal();
    if (!this.formProductId.trim()) {
      this.error = 'Please lookup and select a valid product code.';
      this.cdr.detectChanges();
      return;
    }

    if (this.formTotalCost < 0) {
      this.error = 'Total cost cannot be negative.';
      this.cdr.detectChanges();
      return;
    }

    if (this.editing) {
      const dto: UpdateStandardCostDto = {
        currencyCode: this.formCurrencyCode || null,
        materialCost: this.formMaterialCost,
        laborCost: this.formLaborCost,
        machineCost: this.formMachineCost,
        overheadCost: this.formOverheadCost,
        notes: this.formNotes || null,
        isActive: this.formIsActive,
      };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.load();
        },
        error: () => {
          this.error = 'Failed to update';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreateStandardCostDto = {
        productId: this.formProductId,
        version: 1,
        currencyCode: this.formCurrencyCode || null,
        materialCost: this.formMaterialCost,
        laborCost: this.formLaborCost,
        machineCost: this.formMachineCost,
        overheadCost: this.formOverheadCost,
        notes: this.formNotes || null,
      };
      this.svc.create(dto).subscribe({
        next: (res: any) => {
          this.justCreated = res?.data ?? null;
          this.showForm = false;
          this.load();
        },
        error: () => {
          this.error = 'Failed to create';
          this.cdr.detectChanges();
        },
      });
    }
  }

  delete(item: StandardCostDto) {
    if (confirm(`Delete standard cost for "${item.productName}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => {
          this.error = 'Failed to delete';
          this.cdr.detectChanges();
        },
      });
    }
  }
}

