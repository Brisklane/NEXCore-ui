import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { ProductionOrderService } from '../../services/production-order.service';
import { BomService } from '../../services/bom.service';
import { RoutingService } from '../../services/routing.service';
import { FinishedGoodsReceiptService } from '../../services/finished-goods-receipt.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { MANUFACTURING_API } from '../../services/manufacturing-api-config';
import { ApiResponse } from '../../models/api-response.model';
import {
  ProductionOrderDto,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
} from '../../models/production-order.model';
import { BillOfMaterialDto } from '../../models/bill-of-material.model';
import { RoutingDto } from '../../models/routing.model';
import { ProductPickerInputComponent, ProductPickerItem } from '../../components/product-picker-input/product-picker-input';
import { OptionPickerInputComponent, OptionPickerItem, OptionPickerColumn } from '../../components/option-picker-input/option-picker-input';
import { StandardCostService } from '../../services/standard-cost.service';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
  itemType: string | null;
}

@Component({
  selector: 'lib-production-order',
  imports: [CommonModule, FormsModule, ProductPickerInputComponent, OptionPickerInputComponent],
  templateUrl: './production-order.html',
  styleUrl: './production-order.css',
})
export class ProductionOrder implements OnInit {
  items: ProductionOrderDto[] = [];
  filteredItems: ProductionOrderDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: ProductionOrderDto | null = null;

  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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

  formProductId = '';
  productDisplayText = '';
  formQuantity = 0;
  formUnit = '';
  formBomId = '';
  formBomLabel = '';
  formRoutingId = '';
  formRoutingLabel = '';
  formStartDate = '';
  formEndDate = '';
  formNotes = '';
  formStatus = 'Draft';

  statusOptions = ['Draft', 'Released', 'InProgress', 'QAPending', 'Completed', 'Cancelled'];
  filterSearch = '';
  filterStatus = 'all';

  totalCount = 0;
  draftCount = 0;
  releasedCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  productDisplayById: Record<string, string> = {};
  productLabelsLoaded = false;
  bomOptions: OptionPickerItem[] = [];
  routingOptions: OptionPickerItem[] = [];
  private rawBoms: BillOfMaterialDto[] = [];
  private rawRoutings: RoutingDto[] = [];

  readonly bomColumns: OptionPickerColumn[] = [
    { key: 'product', header: 'Product' },
    { key: 'version', header: 'Version' },
    { key: 'status', header: 'Status' },
    { key: 'components', header: 'Components' },
    { key: 'effectiveFrom', header: 'Effective From' },
  ];

  readonly routingColumns: OptionPickerColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'product', header: 'Product' },
    { key: 'version', header: 'Version' },
    { key: 'status', header: 'Status' },
    { key: 'operations', header: 'Operations' },
  ];


  // WIP modal state (Task 4 guard 2)
  showWipModal = false;
  wipOrder: ProductionOrderDto | null = null;
  wipQtyInProgress = 0;
  wipQtyCompleted = 0;
  wipQtyRejected = 0;
  wipNotes = '';
  wipLoading = false;
  wipError = '';
  existingWipId = '';

  // Auto-schedule / auto-variance info banners
  scheduleInfo = '';
  varianceInfo = '';

  // Inspection modal state (Task 5)
  showInspectModal = false;
  inspectOrder: ProductionOrderDto | null = null;
  inspectQty = 0;
  inspectPassedQty = 0;
  inspectRejectedQty = 0;
  inspectRemarks = '';
  inspectLoading = false;
  inspectError = '';
  inspectSuccess = '';

  constructor(
    private svc: ProductionOrderService,
    private bomSvc: BomService,
    private routingSvc: RoutingService,
    private fgrSvc: FinishedGoodsReceiptService,
    private standardCostSvc: StandardCostService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProductLabels();
    this.loadBOMs();
    this.loadRoutings();
    this.load();
  }

  loadProductLabels() {
    if (this.productLabelsLoaded) return;

    this.http
      .get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/basic`, {
        headers: this.auth.getAuthHeaders(),
      })
      .subscribe({
        next: (r) => {
          const items = r.data ?? [];
          this.productDisplayById = items.reduce(
            (acc, item) => {
              const code = item.code?.trim() ?? '';
              const name = item.name?.trim() ?? '';
              if (code && name) acc[item.id] = `${code} - ${name}`;
              else if (name) acc[item.id] = name;
              else if (code) acc[item.id] = code;
              return acc;
            },
            {} as Record<string, string>,
          );
          this.productLabelsLoaded = true;
          // Rebuild BOM and Routing labels now that product names are available
          if (this.rawBoms.length) {
            this.buildBomOptions();
          }
          if (this.rawRoutings.length) {
            this.buildRoutingOptions();
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.productLabelsLoaded = true;
        },
      });
  }

  private buildBomOptions() {
    this.bomOptions = this.rawBoms
      .map((bom) => {
        const productLabel =
          this.productDisplayById[bom.finishedProductId] ||
          bom.finishedProductName?.trim() ||
          null;
        const label = productLabel
          ? `${productLabel} — BOM v${bom.version}`
          : `BOM v${bom.version} (${bom.finishedProductId.substring(0, 8)})`;
        const effectiveFrom = bom.effectiveFrom
          ? new Date(bom.effectiveFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—';
        return {
          id: bom.id,
          label,
          meta: {
            product: productLabel || bom.finishedProductId.substring(0, 8),
            version: `v${bom.version}`,
            status: bom.isActive ? 'Active' : 'Inactive',
            components: `${bom.items?.length ?? 0} component${bom.items?.length === 1 ? '' : 's'}`,
            effectiveFrom,
          },
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  loadBOMs() {
    this.bomSvc.getAll().subscribe({
      next: (r: ApiResponse<BillOfMaterialDto[]>) => {
        this.rawBoms = r.data ?? [];
        this.buildBomOptions();
        this.cdr.detectChanges();
      },
    });
  }

  private buildRoutingOptions() {
    this.routingOptions = this.rawRoutings
      .map((route) => {
        const name = route.name?.trim() || 'Routing';
        const productLabel = this.productDisplayById[route.productId] || route.productName?.trim() || '—';
        return {
          id: route.id,
          label: `${name} v${route.version}`,
          meta: {
            name,
            product: productLabel,
            version: `v${route.version}`,
            status: route.isActive ? 'Active' : 'Inactive',
            operations: `${route.operations?.length ?? 0} operation${route.operations?.length === 1 ? '' : 's'}`,
          },
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  loadRoutings() {
    this.routingSvc.getAll().subscribe({
      next: (r: ApiResponse<RoutingDto[]>) => {
        this.rawRoutings = r.data ?? [];
        this.buildRoutingOptions();
        this.cdr.detectChanges();
      },
    });
  }

  private async resolveUnlabeledProducts(items: ProductionOrderDto[]) {
    const uniqueIds = [...new Set(
      items.map(i => i.productId).filter(id => id && !this.productDisplayById[id])
    )] as string[];
    if (uniqueIds.length === 0) return;
    await Promise.all(uniqueIds.map(async (id) => {
      try {
        const r = await firstValueFrom(
          this.http.get<ApiResponse<InventoryItemLookupDto>>(`${BASE_URL}/api/Item/${id}`, {
            headers: this.auth.getAuthHeaders(),
          })
        );
        const item = r.data as any;
        if (item) {
          const code = item.code?.trim() ?? item.itemCode?.trim() ?? '';
          const name = item.name?.trim() ?? item.itemName?.trim() ?? '';
          this.productDisplayById[id] = [code, name].filter(Boolean).join(' - ') || id;
        }
      } catch { /* leave unmapped */ }
    }));
    this.cdr.detectChanges();
  }

  getProductDisplayLabel(productId: string | null | undefined, productName: string | null | undefined): string {
    if (productId && this.productDisplayById[productId]) return this.productDisplayById[productId];
    if (productName?.trim()) return productName;
    return 'Unmapped Product';
  }

  hasProductCatalogLabel(productId: string | null | undefined): boolean {
    return !!(productId && this.productDisplayById[productId]);
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.calcMetrics();
        this.applyFilters();
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
        this.resolveUnlabeledProducts(this.items);
      },
      error: () => {
        this.error = 'Failed to load production orders';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.draftCount = this.items.filter((i) => i.status === 'Draft').length;
    this.releasedCount = this.items.filter((i) => i.status === 'Released').length;
    this.inProgressCount = this.items.filter((i) => i.status === 'InProgress').length;
    this.completedCount = this.items.filter((i) => i.status === 'Completed').length;
  }

  applyFilters() {
    this.filteredItems = this.items.filter((item) => {
      const matchSearch =
        !this.filterSearch ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productName?.toLowerCase().includes(this.filterSearch.toLowerCase());
      const matchStatus = this.filterStatus === 'all' || item.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
    this.cdr.detectChanges();
  }

  onFilterChange() {
    this.applyFilters();
  }

  getStatusClass(status: string | null): string {
    const map: Record<string, string> = {
      Draft: 'badge-draft',
      Released: 'badge-released',
      InProgress: 'badge-inprogress',
      QAPending: 'badge-qapending',
      Completed: 'badge-completed',
      Cancelled: 'badge-cancelled',
    };
    return map[status ?? ''] ?? '';
  }

  getProgressPct(item: ProductionOrderDto): number {
    const planned = item.quantityPlanned ?? 0;
    const produced = item.quantityProduced ?? 0;
    if (planned <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((produced / planned) * 100)));
  }

  quickUpdateStatus(item: ProductionOrderDto, status: string) {
    this.svc.update(item.id, { status }).subscribe({
      next: () => {
        if (status === 'Released') {
          this.autoScheduleOnRelease(item);
        }
        this.load();
      },
      error: () => {
        this.error = 'Failed to update status';
        this.cdr.detectChanges();
      },
    });
  }

  // Task 6: Auto-create ProductionSchedule entries for each routing operation on Release
  private autoScheduleOnRelease(item: ProductionOrderDto) {
    if (!item.routingId) return;

    this.http.get<ApiResponse<RoutingDto>>(MANUFACTURING_API.routing.getById(item.routingId), {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const ops = [...(r.data?.operations ?? [])].sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0));
        if (ops.length === 0) return;

        const baseDate = item.startDate ? new Date(item.startDate) : new Date();
        let currentStart = new Date(baseDate);
        let created = 0;

        const createNext = (index: number) => {
          if (index >= ops.length) {
            if (created > 0) {
              this.scheduleInfo = `Auto-scheduled ${created} operation${created === 1 ? '' : 's'} for ${item.orderNumber || 'this order'}.`;
              this.cdr.detectChanges();
              setTimeout(() => { this.scheduleInfo = ''; this.cdr.detectChanges(); }, 6000);
            }
            return;
          }
          const op = ops[index];
          const totalHours = (op.standardHours ?? 0) + (op.setupHours ?? 0) || 1;
          const daysNeeded = Math.max(1, Math.ceil(totalHours / 8));
          const endDate = new Date(currentStart);
          endDate.setDate(endDate.getDate() + daysNeeded);

          this.http.post<ApiResponse<any>>(MANUFACTURING_API.productionSchedule.create, {
            productionOrderId: item.id,
            workCenterId: op.workCenterId,
            scheduleType: 'Forward',
            scheduledStartDate: currentStart.toISOString(),
            scheduledEndDate: endDate.toISOString(),
            capacityRequiredHours: totalHours,
            notes: `Auto: ${op.operationName || 'Operation'} (OP-${(op.sequenceNo ?? 0).toString().padStart(3, '0')})`,
          }, { headers: this.auth.getAuthHeaders() }).subscribe({
            next: () => { created++; currentStart = new Date(endDate); createNext(index + 1); },
            error: () => createNext(index + 1),
          });
        };

        createNext(0);
      },
    });
  }

  // Task 4 guard: Cannot complete unless FGR exists
  checkAndComplete(item: ProductionOrderDto) {
    this.fgrSvc.getByOrder(item.id).subscribe({
      next: (r) => {
        const fgrs: any[] = Array.isArray(r.data) ? r.data : [];
        if (fgrs.length === 0) {
          this.error = `Cannot complete "${item.orderNumber || item.id}": no Finished Goods Receipt has been recorded. Record a receipt on the Finished Goods Receipt page first.`;
          this.cdr.detectChanges();
          return;
        }
        this.svc.update(item.id, { status: 'Completed' }).subscribe({
          next: () => { this.autoCreateVariance(item); this.load(); },
          error: () => { this.error = 'Failed to complete order'; this.cdr.detectChanges(); },
        });
      },
      error: () => {
        this.error = 'Could not verify Finished Goods Receipt status. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  // Task 8: Auto-create ProductionVariance record on Completion
  private autoCreateVariance(item: ProductionOrderDto) {
    // getByOrder returns ApiResponse<CostEntryDto> (single object), not an array
    this.http.get<ApiResponse<any>>(MANUFACTURING_API.costEntry.getByOrder(item.id), {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (costRes) => {
        const entry: any = costRes.data;
        if (!entry) {
          this.showNoEntryBanner(item);
          return;
        }
        this.postVariance(item, entry);
      },
      error: (err) => {
        // 404 = no cost entry exists for this order
        if (err.status === 404) {
          this.showNoEntryBanner(item);
        } else {
          this.varianceInfo = `Order ${item.orderNumber} completed. Could not check Cost Entries — record variance manually in Production Variance.`;
          this.cdr.detectChanges();
          setTimeout(() => { this.varianceInfo = ''; this.cdr.detectChanges(); }, 8000);
        }
      },
    });
  }

  private showNoEntryBanner(item: ProductionOrderDto) {
    this.varianceInfo = `Order ${item.orderNumber} completed. No Cost Entry found — go to Cost Entry page, create one linked to this order, then record variance manually in Production Variance.`;
    this.cdr.detectChanges();
    setTimeout(() => { this.varianceInfo = ''; this.cdr.detectChanges(); }, 10000);
  }

  private postVariance(item: ProductionOrderDto, entry: any) {
    if (!item.productId) { return; }

    this.standardCostSvc.getActiveByProduct(item.productId).subscribe({
      next: (scRes) => {
        const sc = scRes.data;
        const qty = item.quantityProduced ?? item.quantityPlanned ?? 1;
        const dto = {
          productionOrderId: item.id,
          costEntryId: entry.id,
          standardMaterialCost: (sc?.materialCost ?? 0) * qty,
          actualMaterialCost: entry.materialCost ?? 0,
          standardLaborCost: (sc?.laborCost ?? 0) * qty,
          actualLaborCost: entry.laborCost ?? 0,
          standardMachineCost: (sc?.machineCost ?? 0) * qty,
          actualMachineCost: entry.machineCost ?? 0,
          standardOverheadCost: (sc?.overheadCost ?? 0) * qty,
          actualOverheadCost: entry.overheadCost ?? 0,
          varianceCategory: 'QuantityVariance',
          notes: `Auto-calculated on completion. Produced: ${qty}.`,
        };
        this.submitVarianceDto(item, dto);
      },
      error: () => {
        // No standard cost — post variance with 0 standard so actual costs are still recorded
        const dto = {
          productionOrderId: item.id,
          costEntryId: entry.id,
          standardMaterialCost: 0,
          actualMaterialCost: entry.materialCost ?? 0,
          standardLaborCost: 0,
          actualLaborCost: entry.laborCost ?? 0,
          standardMachineCost: 0,
          actualMachineCost: entry.machineCost ?? 0,
          standardOverheadCost: 0,
          actualOverheadCost: entry.overheadCost ?? 0,
          varianceCategory: 'QuantityVariance',
          notes: `Auto-calculated on completion (no standard cost found).`,
        };
        this.submitVarianceDto(item, dto);
      },
    });
  }

  private submitVarianceDto(item: ProductionOrderDto, dto: any) {
    this.http.post<ApiResponse<any>>(MANUFACTURING_API.productionVariance.create, dto, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: () => {
        const totalVariance =
          (dto.actualMaterialCost - dto.standardMaterialCost) +
          (dto.actualLaborCost - dto.standardLaborCost) +
          (dto.actualMachineCost - dto.standardMachineCost) +
          (dto.actualOverheadCost - dto.standardOverheadCost);
        const sign = totalVariance >= 0 ? '+' : '';
        this.varianceInfo = `Variance auto-calculated for ${item.orderNumber}: ${sign}${totalVariance.toFixed(2)} total. Review in Production Variance page.`;
        this.cdr.detectChanges();
        setTimeout(() => { this.varianceInfo = ''; this.cdr.detectChanges(); }, 8000);
      },
      error: () => {
        this.varianceInfo = `Order ${item.orderNumber} completed. Could not auto-create variance — record it manually in Production Variance.`;
        this.cdr.detectChanges();
        setTimeout(() => { this.varianceInfo = ''; this.cdr.detectChanges(); }, 6000);
      },
    });
  }

  // Task 4 guard 2: WIP modal (only for InProgress orders)
  openWipModal(item: ProductionOrderDto) {
    this.wipOrder = item;
    this.wipQtyInProgress = item.quantityPlanned ?? 0;
    this.wipQtyCompleted = item.quantityProduced ?? 0;
    this.wipQtyRejected = 0;
    this.wipNotes = '';
    this.wipError = '';
    this.existingWipId = '';

    this.http.get<ApiResponse<any>>(MANUFACTURING_API.wip.getByOrder(item.id), {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        if (r.data) {
          this.existingWipId = r.data.id ?? '';
          this.wipQtyInProgress = r.data.quantityInProgress ?? item.quantityPlanned ?? 0;
          this.wipQtyCompleted = r.data.quantityCompleted ?? item.quantityProduced ?? 0;
          this.wipQtyRejected = r.data.quantityRejected ?? 0;
          this.wipNotes = r.data.notes ?? '';
        }
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });

    this.showWipModal = true;
    this.cdr.detectChanges();
  }

  closeWipModal() {
    this.showWipModal = false;
    this.wipOrder = null;
    this.wipError = '';
  }

  submitWip() {
    if (!this.wipOrder) return;
    if (this.wipQtyInProgress < 0) {
      this.wipError = 'In-progress quantity cannot be negative.';
      this.cdr.detectChanges();
      return;
    }
    this.wipLoading = true;
    this.wipError = '';
    this.cdr.detectChanges();

    const wipPayload = {
      quantityInProgress: Math.round(this.wipQtyInProgress),
      quantityCompleted: Math.round(this.wipQtyCompleted),
      quantityRejected: Math.round(this.wipQtyRejected),
      notes: this.wipNotes || null,
    };

    const closeModal = () => { this.wipLoading = false; this.showWipModal = false; this.wipOrder = null; this.load(); };
    const showErr = (msg: string) => { this.wipLoading = false; this.wipError = msg; this.cdr.detectChanges(); };
    const orderId = this.wipOrder.id;

    // After saving WIP, sync completed/rejected back to the production order so the table reflects current quantities
    const syncAndClose = () => {
      this.svc.update(orderId, {
        quantityProduced: wipPayload.quantityCompleted,
        quantityRejected: wipPayload.quantityRejected,
      }).subscribe({ next: () => closeModal(), error: () => closeModal() });
    };

    if (this.existingWipId) {
      this.http.put<ApiResponse<any>>(MANUFACTURING_API.wip.update(this.existingWipId), wipPayload, {
        headers: this.auth.getAuthHeaders(),
      }).subscribe({
        next: () => syncAndClose(),
        error: () => showErr('Failed to update WIP record.'),
      });
    } else {
      // POST to create, then immediately PUT to set completed/rejected (backend create only accepts quantityInProgress)
      this.http.post<ApiResponse<any>>(MANUFACTURING_API.wip.create, {
        productionOrderId: this.wipOrder.id,
        quantityInProgress: wipPayload.quantityInProgress,
        notes: wipPayload.notes,
      }, { headers: this.auth.getAuthHeaders() }).subscribe({
        next: (res) => {
          const newId: string = res.data?.id ?? '';
          if (newId && (wipPayload.quantityCompleted > 0 || wipPayload.quantityRejected > 0)) {
            this.http.put<ApiResponse<any>>(MANUFACTURING_API.wip.update(newId), wipPayload, {
              headers: this.auth.getAuthHeaders(),
            }).subscribe({ next: () => syncAndClose(), error: () => syncAndClose() });
          } else {
            syncAndClose();
          }
        },
        error: (err) => showErr(err.status === 409
          ? 'A WIP record already exists. Refresh the page to load it.'
          : 'Failed to create WIP record.'),
      });
    }
  }

  openInspectModal(item: ProductionOrderDto) {
    this.inspectOrder = item;
    this.inspectQty = item.quantityProduced ?? item.quantityPlanned ?? 0;
    this.inspectPassedQty = 0;
    this.inspectRejectedQty = 0;
    this.inspectRemarks = '';
    this.inspectError = '';
    this.inspectSuccess = '';
    this.showInspectModal = true;
    this.cdr.detectChanges();
  }

  closeInspectModal() {
    this.showInspectModal = false;
    this.inspectOrder = null;
    this.inspectError = '';
    this.inspectSuccess = '';
  }

  submitInspection() {
    if (!this.inspectOrder) return;
    if (this.inspectQty <= 0) {
      this.inspectError = 'Inspected quantity must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }
    if ((this.inspectPassedQty + this.inspectRejectedQty) > this.inspectQty) {
      this.inspectError = 'Passed + Rejected cannot exceed the inspected quantity.';
      this.cdr.detectChanges();
      return;
    }
    this.inspectLoading = true;
    this.inspectError = '';
    this.cdr.detectChanges();

    const dto = {
      productionOrderId: this.inspectOrder.id,
      inspectedQty: this.inspectQty,
      passedQty: this.inspectPassedQty,
      rejectedQty: this.inspectRejectedQty,
      inspectedAt: new Date().toISOString(),
      remarks: this.inspectRemarks || null,
      characteristics: [],
    };

    this.http.post<ApiResponse<any>>(MANUFACTURING_API.inspection.create, dto, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: () => this.finishInspection(this.inspectOrder!),
      error: () => {
        this.inspectLoading = false;
        this.inspectError = 'Failed to record inspection. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  private finishInspection(order: ProductionOrderDto) {
    this.svc.update(order.id, { status: 'QAPending' }).subscribe({
      next: () => {
        this.inspectLoading = false;
        this.inspectSuccess = this.inspectRejectedQty > 0
          ? `Inspection recorded. ${this.inspectRejectedQty} unit(s) flagged as rejected. Order moved to QA Pending.`
          : 'Inspection recorded. Order moved to QA Pending.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showInspectModal = false;
          this.inspectOrder = null;
          this.inspectSuccess = '';
          this.load();
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.inspectLoading = false;
        this.inspectError = 'Inspection saved but failed to update order status.';
        this.cdr.detectChanges();
      },
    });
  }

  onProductSelected(item: ProductPickerItem) {
    this.formProductId = item.id;
    this.productDisplayText = [item.code, item.name].filter(Boolean).join(' - ');
    this.error = '';
    this.cdr.detectChanges();
  }

  onBomSelected(item: OptionPickerItem) {
    this.formBomId = item.id;
    this.formBomLabel = item.label;
    this.error = '';
    this.cdr.detectChanges();
  }

  onRoutingSelected(item: OptionPickerItem) {
    this.formRoutingId = item.id;
    this.formRoutingLabel = item.label;
    this.error = '';
    this.cdr.detectChanges();
  }

  openCreate() {
    this.editing = null;
    this.reset();
    this.showForm = true;
  }

  openEdit(item: ProductionOrderDto) {
    this.editing = item;
    this.formProductId = item.productId ?? '';
    this.productDisplayText = this.getProductDisplayLabel(item.productId, item.productName);
    this.formQuantity = item.quantityPlanned ?? 0;
    this.formUnit = item.unitOfMeasure ?? '';
    this.formBomId = item.billOfMaterialId ?? '';
    this.formBomLabel = this.bomOptions.find(o => o.id === item.billOfMaterialId)?.label ?? item.billOfMaterialId ?? '';
    this.formRoutingId = item.routingId ?? '';
    this.formRoutingLabel = this.routingOptions.find(o => o.id === item.routingId)?.label ?? item.routingId ?? '';
    this.formStartDate = item.startDate ? item.startDate.substring(0, 10) : '';
    this.formEndDate = item.endDate ? item.endDate.substring(0, 10) : '';
    this.formNotes = item.notes ?? '';
    this.formStatus = item.status ?? 'Draft';
    this.showForm = true;

    if (item.productId && !this.productDisplayById[item.productId]) {
      this.resolveUnlabeledProducts([item]).then(() => {
        this.productDisplayText = this.getProductDisplayLabel(item.productId, item.productName);
        this.cdr.detectChanges();
      });
    }
  }

  reset() {
    this.formProductId = '';
    this.productDisplayText = '';
    this.formQuantity = 0;
    this.formUnit = '';
    this.formBomId = '';
    this.formBomLabel = '';
    this.formRoutingId = '';
    this.formRoutingLabel = '';
    this.formStartDate = '';
    this.formEndDate = '';
    this.formNotes = '';
    this.formStatus = 'Draft';
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.reset();
  }

  save() {
    if (!this.formProductId.trim()) {
      this.error = 'Product ID is required.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formQuantity <= 0) {
      this.error = 'Planned quantity must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formStartDate && this.formEndDate && this.formEndDate < this.formStartDate) {
      this.error = 'End date cannot be before start date.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editing) {
      if (!this.formBomId) {
        this.error = 'Please select a Bill of Material.';
        this.cdr.detectChanges();
        return;
      }
      if (!this.formRoutingId) {
        this.error = 'Please select a Routing.';
        this.cdr.detectChanges();
        return;
      }
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateProductionOrderDto = {
        quantityPlanned: this.formQuantity,
        unitOfMeasure: this.formUnit || null,
        status: this.formStatus,
        startDate: this.formStartDate || null,
        endDate: this.formEndDate || null,
        notes: this.formNotes || null,
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
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
      const dto: CreateProductionOrderDto = {
        orderNumber: `PO-${datePart}-${randPart}`,
        productId: this.formProductId,
        quantityPlanned: this.formQuantity,
        unitOfMeasure: this.formUnit || null,
        status: this.formStatus,
        billOfMaterialId: this.formBomId || EMPTY_GUID,
        routingId: this.formRoutingId || EMPTY_GUID,
        startDate: this.formStartDate || null,
        endDate: this.formEndDate || null,
        notes: this.formNotes || null,
      };
      this.svc.create(dto).subscribe({
        next: (res) => {
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

  delete(item: ProductionOrderDto) {
    if (confirm(`Delete production order "${item.orderNumber ?? item.id}"?`)) {
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
