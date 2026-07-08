import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { InventoryTransactionService } from '../../services/inventory-transaction.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { ProductionOrderDto } from '../../models/production-order.model';
import {
  InventoryTransactionDto,
  CreateInventoryTransactionDto,
  UpdateInventoryTransactionDto,
} from '../../models/inventory-transaction.model';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-inventory-transaction',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-transaction.html',
  styleUrl: './inventory-transaction.css',
})
export class InventoryTransaction implements OnInit {
  items: InventoryTransactionDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: InventoryTransactionDto | null = null;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  formProductId = '';
  formTransactionType = 'Issue';
  formQuantity = 0;
  formUnit = '';
  formTransactionDate = '';
  formReferenceId = '';
  formReferenceType = '';
  formNotes = '';

  txnTypes = ['Issue', 'Receipt', 'Adjustment', 'Transfer', 'Scrap'];
  referenceTypeOptions = ['ProductionOrder', 'ProductionBatch', 'FinishedGoodsReceipt', 'ManualAdjustment', 'Other'];
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  productionOrderRefOptions: Array<{ id: string; label: string }> = [];
  productDisplayById: Record<string, string> = {};
  productOptions: Array<{ id: string; label: string }> = [];
  productLabelsLoaded = false;
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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

  constructor(
    private svc: InventoryTransactionService,
    private productionOrderSvc: ProductionOrderService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProductLabels();
    this.loadProductionOrders();
    this.load();
  }

  loadProductionOrders() {
    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        this.allProductionOrders = r.data ?? [];
        this.productionOrdersById = {};
        this.allProductionOrders.forEach((o) => {
          this.productionOrdersById[o.id] = o;
        });
        this.rebuildProductionOrderRefOptions();
        this.cdr.detectChanges();
      },
    });
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status ?? '').trim().toLowerCase();
  }

  private isEligibleOrderForTxn(order: ProductionOrderDto): boolean {
    const status = this.normalizeStatus(order.status);
    if (this.formTransactionType === 'Receipt') {
      return status === 'completed' || status === 'closed';
    }
    if (this.formTransactionType === 'Issue') {
      return status === 'released' || status === 'inprogress';
    }
    if (this.formTransactionType === 'Scrap') {
      return status === 'inprogress' || status === 'completed' || status === 'closed';
    }
    return true;
  }

  private rebuildProductionOrderRefOptions() {
    const seen = new Set<string>();
    const uniqueOrders = this.allProductionOrders
      .filter((o) => this.isEligibleOrderForTxn(o))
      .filter((o) => {
        const key = (o.orderNumber?.trim() || o.id).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    this.productionOrderRefOptions = uniqueOrders
      .map((o) => ({
        id: o.id,
        label: o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    const order = this.productionOrdersById[id];
    if (order?.orderNumber?.trim()) return order.orderNumber.trim();
    return `PO-${id.substring(0, 6)}`;
  }

  getReferenceDisplay(referenceType: string | null | undefined, referenceId: string | null | undefined): string {
    if (!referenceId?.trim()) return '—';
    if (referenceType === 'ProductionOrder') return this.getOrderLabel(referenceId);
    return `${referenceType || 'Reference'} (${referenceId.substring(0, 8)}...)`;
  }

  loadProductLabels() {
    if (this.productLabelsLoaded) return;

    this.http
      .get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/active`, {
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
          this.productOptions = items
            .map((item) => {
              const code = item.code?.trim() ?? '';
              const name = item.name?.trim() ?? '';
              let label = '';
              if (code && name) label = `${code} - ${name}`;
              else if (name) label = name;
              else if (code) label = code;
              return { id: item.id, label };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
          this.productLabelsLoaded = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.productLabelsLoaded = true;
        },
      });
  }

  onTransactionTypeChange() {
    if (this.formReferenceType.trim()) return;
    if (this.formTransactionType === 'Issue') this.formReferenceType = 'ProductionOrder';
    else if (this.formTransactionType === 'Receipt') this.formReferenceType = 'FinishedGoodsReceipt';
    else if (this.formTransactionType === 'Transfer') this.formReferenceType = 'ManualAdjustment';
    this.rebuildProductionOrderRefOptions();
  }

  onReferenceTypeChange() {
    if (this.formReferenceType !== 'ProductionOrder') {
      this.formReferenceId = '';
      this.formUnit = '';
    }
  }

  onReferenceIdChange() {
    if (this.formReferenceType !== 'ProductionOrder') return;
    const order = this.productionOrdersById[this.formReferenceId];
    if (order?.unitOfMeasure?.trim()) {
      this.formUnit = order.unitOfMeasure.trim();
    }
  }

  getProductDisplayLabel(productId: string | null | undefined, productName: string | null | undefined): string {
    if (productId && this.productDisplayById[productId]) return this.productDisplayById[productId];
    if (productName?.trim()) return productName;
    return 'Unmapped Product';
  }

  getStatusOptionLabel(status: string): string {
    if (status === 'InProgress') return 'In Progress';
    if (status === 'OnHold') return 'On Hold';
    return status;
  }

  getTransactionUomDisplay(item: InventoryTransactionDto): string {
    if (item.unit?.trim()) return item.unit.trim();
    if (item.referenceType === 'ProductionOrder' && item.referenceId) {
      const order = this.productionOrdersById[item.referenceId];
      if (order?.unitOfMeasure?.trim()) return order.unitOfMeasure.trim();
    }
    return '—';
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
        this.loading = false;
        this.applyJustCreated();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load transactions';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  openCreate() {
    this.editing = null;
    this.reset();
    this.rebuildProductionOrderRefOptions();
    this.showForm = true;
  }

  openEdit(item: InventoryTransactionDto) {
    this.editing = item;
    this.formProductId = item.productId ?? '';
    this.formTransactionType = item.transactionType ?? 'Issue';
    this.formQuantity = item.quantity ?? 0;
    this.formUnit = item.unit ?? '';
    this.formTransactionDate = item.transactionDate ? item.transactionDate.substring(0, 10) : '';
    this.formReferenceId = item.referenceId ?? '';
    this.formReferenceType = item.referenceType ?? '';
    this.formNotes = item.notes ?? '';
    if (!this.formUnit.trim() && this.formReferenceType === 'ProductionOrder' && this.formReferenceId) {
      const order = this.productionOrdersById[this.formReferenceId];
      if (order?.unitOfMeasure?.trim()) {
        this.formUnit = order.unitOfMeasure.trim();
      }
    }
    this.rebuildProductionOrderRefOptions();
    this.showForm = true;
  }

  reset() {
    this.formProductId = '';
    this.formTransactionType = 'Issue';
    this.formQuantity = 0;
    this.formUnit = '';
    this.formTransactionDate = new Date().toISOString().substring(0, 10);
    this.formReferenceId = '';
    this.formReferenceType = 'ProductionOrder';
    this.formNotes = '';
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
    if (!this.txnTypes.includes(this.formTransactionType)) {
      this.error = 'Transaction type is invalid.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formReferenceType === 'ProductionOrder') {
      if (!this.formReferenceId.trim()) {
        this.error = 'Production order reference is required.';
        this.cdr.detectChanges();
        return;
      }
      const refOrder = this.productionOrdersById[this.formReferenceId];
      if (!refOrder || !this.isEligibleOrderForTxn(refOrder)) {
        this.error = `Selected production order is not valid for ${this.formTransactionType} transaction.`;
        this.cdr.detectChanges();
        return;
      }
    }
    if (this.formQuantity <= 0) {
      this.error = 'Quantity must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateInventoryTransactionDto = {
        transactionType: this.formTransactionType,
        quantity: this.formQuantity,
        unit: this.formUnit || null,
        transactionDate: this.formTransactionDate || null,
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
      const dto: CreateInventoryTransactionDto = {
        productId: this.formProductId,
        transactionType: this.formTransactionType,
        quantity: this.formQuantity,
        unit: this.formUnit || null,
        referenceId: this.formReferenceId || null,
        referenceType: this.formReferenceType || null,
        transactionDate: this.formTransactionDate || null,
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

  delete(item: InventoryTransactionDto) {
    const productLabel = this.getProductDisplayLabel(item.productId, item.productName);
    if (confirm(`Delete ${item.transactionType || 'inventory'} transaction for "${productLabel}"?`)) {
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
