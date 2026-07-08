import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { FinishedGoodsReceiptService } from '../../services/finished-goods-receipt.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { ProductionOrderDto } from '../../models/production-order.model';
import { FinishedGoodsReceiptDto, CreateFinishedGoodsReceiptDto, UpdateFinishedGoodsReceiptDto } from '../../models/finished-goods-receipt.model';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-finished-goods-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finished-goods-receipt.html',
  styleUrl: './finished-goods-receipt.css',
})
export class FinishedGoodsReceipt implements OnInit {
  items: FinishedGoodsReceiptDto[] = [];
  filteredItems: FinishedGoodsReceiptDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  success = '';
  showForm = false;
  editing: FinishedGoodsReceiptDto | null = null;

  formProductionOrderId = '';
  formProductId = '';
  formReceivedQuantity = 0;
  formUnit = '';
  formBatchNo = '';
  formReceiptDate = '';
  formWarehouseId = '';
  formNotes = '';

  filterSearch = '';

  totalCount = 0;
  totalReceivedQty = 0;
  uniqueProducts = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  productDisplayById: Record<string, string> = {};
  productLabelsLoaded = false;
  orderNumberById: Record<string, string> = {};
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  productOptions: Array<{ id: string; label: string }> = [];
  warehouseOptions: Array<{ id: string; label: string }> = [];
  warehouseDisplayById: Record<string, string> = {};
  warehousesLoaded = false;
  totalReceivedByPoId: Record<string, number> = {};

  constructor(
    private svc: FinishedGoodsReceiptService,
    private productionOrderSvc: ProductionOrderService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadProductLabels(); this.loadOrderLabels(); this.loadWarehouses(); this.load(); }

  loadOrderLabels() {
    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        this.allProductionOrders = r.data ?? [];
        this.productionOrdersById = {};
        this.allProductionOrders.forEach(o => {
          this.orderNumberById[o.id] = o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
          this.productionOrdersById[o.id] = o;
        });
        this.rebuildProductionOrderOptions();
        this.cdr.detectChanges();
      },
    });
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status ?? '').trim().toLowerCase();
  }

  private isEligibleReceiptOrder(status: string | null | undefined): boolean {
    return this.normalizeStatus(status) === 'inprogress';
  }

  isFullyReceived(poId: string): boolean {
    const order = this.productionOrdersById[poId];
    if (!order) return false;
    const planned = order.quantityPlanned ?? 0;
    if (planned <= 0) return false;
    const alreadyReceived = this.totalReceivedByPoId[poId] ?? 0;
    return alreadyReceived >= planned;
  }

  private rebuildProductionOrderOptions() {
    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter(
          (o) => this.isEligibleReceiptOrder(o.status) && !this.isFullyReceived(o.id)
        );

    this.productionOrderOptions = optionsSource.map(o => ({
          id: o.id,
          label: o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`,
        })).sort((a, b) => a.label.localeCompare(b.label));
  }

  onProductionOrderChange() {
    const order = this.productionOrdersById[this.formProductionOrderId];
    if (!order) {
      this.formProductId = '';
      return;
    }
    this.formProductId = order.productId || '';
    if (!this.formUnit.trim() && order.unitOfMeasure?.trim()) {
      this.formUnit = order.unitOfMeasure.trim();
    }
    if (!this.formBatchNo.trim()) {
      const orderNo = order.orderNumber?.trim() || `PO-${order.id.substring(0, 6)}`;
      const today = new Date().toISOString().substring(0, 10).replace(/-/g, '');
      this.formBatchNo = `${orderNo}-${today}`;
    }
    this.cdr.detectChanges();
  }

  getSelectedOrderPlannedQty(): number | null {
    const order = this.productionOrdersById[this.formProductionOrderId];
    return order ? (order.quantityPlanned ?? null) : null;
  }

  getSelectedOrderProducedQty(): number | null {
    const order = this.productionOrdersById[this.formProductionOrderId];
    return order ? (order.quantityProduced ?? null) : null;
  }

  /** Returns 'over' | 'exact' | 'under' | 'empty' | 'no-order' */
  getQtyHintState(): 'over' | 'exact' | 'under' | 'empty' | 'no-order' {
    const planned = this.getSelectedOrderPlannedQty();
    if (planned === null) return 'no-order';
    if (!this.formReceivedQuantity || this.formReceivedQuantity <= 0) return 'empty';
    if (this.formReceivedQuantity > planned) return 'over';
    if (this.formReceivedQuantity === planned) return 'exact';
    return 'under';
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  loadProductLabels() {
    if (this.productLabelsLoaded) return;

    this.http.get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const items = r.data ?? [];
        this.productDisplayById = items.reduce((acc, item) => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          if (code && name) acc[item.id] = `${code} - ${name}`;
          else if (name) acc[item.id] = name;
          else if (code) acc[item.id] = code;
          return acc;
        }, {} as Record<string, string>);
        this.productOptions = items.map(item => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          let label = '';
          if (code && name) label = `${code} - ${name}`;
          else if (name) label = name;
          else if (code) label = code;
          return { id: item.id, label };
        }).sort((a, b) => a.label.localeCompare(b.label));
        this.productLabelsLoaded = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.productLabelsLoaded = true;
      },
    });
  }

  loadWarehouses() {
    if (this.warehousesLoaded) return;
    this.warehousesLoaded = true;
    this.http.get<ApiResponse<Array<{ id: string; name: string }>>>(`${BASE_URL}/api/Warehouse/active`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        (r.data ?? []).forEach(w => {
          this.warehouseDisplayById[w.id] = w.name?.trim() || `WH-${w.id.substring(0, 6)}`;
        });
        this.warehouseOptions = (r.data ?? []).map(w => ({
          id: w.id,
          label: w.name?.trim() || `WH-${w.id.substring(0, 6)}`,
        })).sort((a, b) => a.label.localeCompare(b.label));
        this.cdr.detectChanges();
      },
      error: () => {
        this.warehousesLoaded = true;
      },
    });
  }

  getProductDisplayLabel(productId: string | null | undefined, productName: string | null | undefined, productionOrderId?: string | null): string {
    if (productionOrderId) {
      const orderProductName = this.productionOrdersById[productionOrderId]?.productName;
      if (orderProductName?.trim()) return orderProductName;
    }
    if (productId && this.productDisplayById[productId]) return this.productDisplayById[productId];
    if (productName?.trim()) return productName;
    return 'Unmapped Product';
  }

  getWarehouseLabel(warehouseId: string | null | undefined): string {
    if (!warehouseId) return '—';
    return this.warehouseDisplayById[warehouseId] || `${warehouseId.substring(0, 8)}...`;
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
        this.rebuildProductionOrderOptions();
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load receipts'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.totalReceivedQty = this.items.reduce((s, i) => s + (i.quantityReceived ?? 0), 0);
    this.uniqueProducts = new Set(this.items.map(i => i.productId).filter(Boolean)).size;
    this.totalReceivedByPoId = {};
    this.items.forEach(i => {
      if (i.productionOrderId) {
        this.totalReceivedByPoId[i.productionOrderId] = (this.totalReceivedByPoId[i.productionOrderId] ?? 0) + (i.quantityReceived ?? 0);
      }
    });
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      return !this.filterSearch ||
        item.productName?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.batchNo?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productionOrderId?.toLowerCase().includes(this.filterSearch.toLowerCase());
    });
    this.cdr.detectChanges();
  }

  onFilterChange() { this.applyFilters(); }

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

  openCreate() { this.editing = null; this.reset(); this.rebuildProductionOrderOptions(); this.showForm = true; }

  openEdit(item: FinishedGoodsReceiptDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formProductId = item.productId ?? '';
    this.formReceivedQuantity = item.quantityReceived ?? 0;
    this.formUnit = item.unitOfMeasure ?? '';
    this.formBatchNo = item.batchNo ?? '';
    this.formReceiptDate = item.receivedAt ? item.receivedAt.substring(0, 10) : '';
    this.formWarehouseId = item.warehouseId ?? '';
    this.formNotes = item.notes ?? '';
    this.rebuildProductionOrderOptions();
    this.showForm = true;
  }

  reset() {
    this.formProductionOrderId = ''; this.formProductId = ''; this.formReceivedQuantity = 0;
    this.formUnit = ''; this.formBatchNo = ''; this.formReceiptDate = new Date().toISOString().substring(0, 10);
    this.formWarehouseId = ''; this.formNotes = '';
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductionOrderId.trim()) { this.error = 'Production Order ID is required.'; this.cdr.detectChanges(); return; }
    if (!this.formProductId.trim()) { this.error = 'Product ID is required.'; this.cdr.detectChanges(); return; }
    if (this.formReceivedQuantity <= 0) { this.error = 'Received quantity must be greater than 0.'; this.cdr.detectChanges(); return; }
    if (!this.editing) {
      const poId = this.formProductionOrderId;
      const alreadyReceived = this.totalReceivedByPoId[poId] ?? 0;
      const planned = this.productionOrdersById[poId]?.quantityPlanned ?? 0;
      if (planned > 0 && alreadyReceived >= planned) {
        this.error = `This production order has already been fully received (${alreadyReceived} of ${planned} planned). Delete the existing receipt first if you need to correct it.`;
        this.cdr.detectChanges();
        return;
      }
      if (planned > 0 && (alreadyReceived + this.formReceivedQuantity) > planned) {
        const remaining = planned - alreadyReceived;
        const confirmed = confirm(
          `Total received (${alreadyReceived} already + ${this.formReceivedQuantity} new = ${alreadyReceived + this.formReceivedQuantity}) would exceed the planned quantity (${planned}).\n\nRemaining to receive: ${remaining}.\n\nProceed only if you have explicit approval for overproduction.\n\nContinue?`
        );
        if (!confirmed) { this.cdr.detectChanges(); return; }
      }
    }
    if (!this.editing && !this.formWarehouseId.trim()) {
      this.error = 'Warehouse is required to update inventory balance.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editing && !this.isEligibleReceiptOrder(this.productionOrdersById[this.formProductionOrderId]?.status)) {
      const currentStatus = this.productionOrdersById[this.formProductionOrderId]?.status ?? 'Unknown';
      this.error = `Finished goods can only be received for an InProgress production order. This order is currently "${currentStatus}". Start the order first.`;
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateFinishedGoodsReceiptDto = { quantityReceived: this.formReceivedQuantity, unitOfMeasure: this.formUnit, batchNo: this.formBatchNo || null, receivedAt: this.formReceiptDate || undefined, warehouseId: this.formWarehouseId || null, notes: this.formNotes || null };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const receiptDateForDto = this.formReceiptDate || new Date().toISOString().substring(0, 10);
      const dto: CreateFinishedGoodsReceiptDto = { productionOrderId: this.formProductionOrderId, productId: this.formProductId, quantityReceived: this.formReceivedQuantity, batchNo: this.formBatchNo || null, receivedAt: receiptDateForDto, warehouseId: this.formWarehouseId, notes: this.formNotes || null };
      this.svc.create(dto).subscribe({
        next: (res) => {
          const created = res.data;
          this.justCreated = created ?? null;
          if (!created) { this.showForm = false; this.load(); return; }
          const receiptId = created.id ?? '';
          const receiptDate = this.formReceiptDate || new Date().toISOString().substring(0, 10);
          this.http.get<ApiResponse<any>>(`${BASE_URL}/api/Item/${this.formProductId}`, {
            headers: this.auth.getAuthHeaders(),
          }).subscribe({
            next: (itemRes) => {
              const baseUnitId: string = itemRes.data?.baseUnitId ?? '';
              this.postGrnDocument(receiptId, this.formProductId, this.formWarehouseId, this.formReceivedQuantity, baseUnitId, 0, receiptDate);
            },
            error: () => {
              this.showForm = false;
              this.error = 'Receipt saved but inventory update failed: could not resolve item unit. Check inventory manually.';
              this.load(); this.cdr.detectChanges();
            },
          });
        },
        error: () => { this.error = 'Failed to create receipt.'; this.cdr.detectChanges(); },
      });
    }
  }

  private postGrnDocument(
    receiptId: string, productId: string, warehouseId: string,
    qty: number, unitId: string, unitCost: number, docDate: string,
  ) {
    if (!unitId) {
      this.showForm = false;
      this.error = 'Receipt saved but inventory update failed: item has no base unit configured.';
      this.load(); this.cdr.detectChanges();
      return;
    }

    const docPayload = {
      documentType: 'GRN',
      documentDate: docDate,
      referenceId: receiptId,
      referenceType: 'FinishedGoodsReceipt',
      fromWarehouseId: null,
      toWarehouseId: warehouseId,
      description: 'Finished goods receipt into inventory',
      lines: [{
        itemId: productId,
        warehouseId,
        quantity: qty,
        unitId,
        unitCost,
        lineNumber: 1,
        description: 'Finished goods receipt',
      }],
    };

    this.http.post<ApiResponse<any>>(`${BASE_URL}/api/InventoryDocument`, docPayload, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (docRes) => {
        const docId: string = docRes.data?.id ?? '';
        if (!docId) {
          this.showForm = false;
          this.error = 'Receipt saved but inventory document creation failed.';
          this.load(); this.cdr.detectChanges();
          return;
        }
        this.http.post<ApiResponse<any>>(`${BASE_URL}/api/InventoryDocument/${docId}/post`, {
          documentId: docId,
          postingDate: docDate,
        }, { headers: this.auth.getAuthHeaders() }).subscribe({
          next: () => {
            this.showForm = false;
            this.success = 'Finished goods received and inventory balance updated.';
            this.load();
            setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 4000);
            this.cdr.detectChanges();
          },
          error: () => {
            this.showForm = false;
            this.error = 'Receipt saved and document created, but posting failed. Go to Inventory Documents to post manually.';
            this.load(); this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.showForm = false;
        this.error = 'Receipt saved but inventory document creation failed. Check inventory manually.';
        this.load(); this.cdr.detectChanges();
      },
    });
  }

  delete(item: FinishedGoodsReceiptDto) {
    const orderLabel = this.getOrderLabel(item.productionOrderId);
    const productLabel = this.getProductDisplayLabel(item.productId, item.productName, item.productionOrderId);
    if (confirm(`Delete receipt for ${productLabel} (${orderLabel})?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}
