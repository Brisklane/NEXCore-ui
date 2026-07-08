import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { MaterialIssueService } from '../../services/material-issue.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { MaterialIssueDto, CreateMaterialIssueDto, UpdateMaterialIssueDto } from '../../models/material-issue.model';
import { ProductPickerInputComponent, ProductPickerItem } from '../../components/product-picker-input/product-picker-input';
import { OptionPickerInputComponent, OptionPickerItem, OptionPickerColumn } from '../../components/option-picker-input/option-picker-input';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-material-issue',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductPickerInputComponent, OptionPickerInputComponent],
  templateUrl: './material-issue.html',
  styleUrl: './material-issue.css',
})
export class MaterialIssue implements OnInit {
  items: MaterialIssueDto[] = [];
  filteredItems: MaterialIssueDto[] = [];
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  loading = false;
  error = '';
  success = '';
  showForm = false;
  editing: MaterialIssueDto | null = null;

  formProductionOrderId = '';
  formComponentId = '';
  formComponentDisplayText = '';
  formWarehouseId = '';
  formIssuedQuantity = 0;
  formUnit = '';
  formIssueDate = '';
  formNotes = '';

  filterSearch = '';

  availableQty: number | null = null;
  availableQtyLoading = false;

  totalCount = 0;
  totalIssuedQty = 0;
  totalReturnedQty = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  orderNumberById: Record<string, string> = {};
  productionOrderStatusById: Record<string, string> = {};
  selectedOrderStatus = '';
  materialDisplayById: Record<string, string> = {};
  private labelsLoaded = false;
  private storedOrders: any[] = [];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  poPickerOptions: OptionPickerItem[] = [];
  formPoPickerText = '';
  readonly poColumns: OptionPickerColumn[] = [
    { key: 'order', header: 'Order #' },
    { key: 'product', header: 'Product' },
    { key: 'poStatus', header: 'Status' },
    { key: 'qty', header: 'Planned Qty' },
    { key: 'start', header: 'Start' },
  ];
  warehouseOptions: Array<{ id: string; label: string }> = [];

  constructor(
    private svc: MaterialIssueService,
    private productionOrderSvc: ProductionOrderService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadLabels(); this.load(); }

  loadLabels() {
    if (this.labelsLoaded) return;
    this.labelsLoaded = true;

    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        const orders = r.data ?? [];
        this.storedOrders = orders;
        orders.forEach(o => {
          this.orderNumberById[o.id] = o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
          this.productionOrderStatusById[o.id] = o.status ?? '';
        });
        this.productionOrderOptions = orders.map(o => ({
          id: o.id,
          label: o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`,
        })).sort((a, b) => a.label.localeCompare(b.label));
        this.buildPoPickerOptions();
        if (this.formProductionOrderId) {
          this.selectedOrderStatus = this.productionOrderStatusById[this.formProductionOrderId] ?? '';
        }
        this.cdr.detectChanges();
      },
    });

    this.http.get<ApiResponse<any[]>>(`${BASE_URL}/api/Warehouse/active`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const warehouses = Array.isArray(r.data) ? r.data : [];
        this.warehouseOptions = warehouses.map(w => ({
          id: w.id,
          label: [w.code?.trim(), w.name?.trim()].filter(Boolean).join(' - ') || w.id,
        })).sort((a, b) => a.label.localeCompare(b.label));
        this.cdr.detectChanges();
      },
    });

    // Load display labels for table rows (also used as product names for PO picker)
    this.http.get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        (r.data ?? []).forEach(item => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          if (code && name) this.materialDisplayById[item.id] = `${code} - ${name}`;
          else if (name) this.materialDisplayById[item.id] = name;
          else if (code) this.materialDisplayById[item.id] = code;
        });
        // Rebuild picker with product names now that item labels are loaded
        this.buildPoPickerOptions();
        this.cdr.detectChanges();
      },
    });
  }

  private buildPoPickerOptions() {
    this.poPickerOptions = this.storedOrders.map((o: any) => {
      const orderNum = this.orderNumberById[o.id] || o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
      const productName = this.materialDisplayById[o.productId] || o.productName?.trim() || '';
      const label = productName ? `${orderNum} · ${productName}` : orderNum;
      return {
        id: o.id,
        label,
        meta: {
          order: orderNum,
          product: productName || '—',
          poStatus: o.status || '—',
          qty: o.quantityPlanned != null ? String(o.quantityPlanned) + (o.unitOfMeasure ? ' ' + o.unitOfMeasure : '') : '—',
          start: o.startDate ? new Date(o.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        },
      };
    }).sort((a: OptionPickerItem, b: OptionPickerItem) => a.label.localeCompare(b.label));
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  onPoSelected(item: OptionPickerItem) {
    this.formProductionOrderId = item.id;
    this.formPoPickerText = item.label;
    this.onOrderChange();
  }

  getMaterialLabel(id: string | null | undefined, name: string | null | undefined): string {
    if (id && this.materialDisplayById[id]) return this.materialDisplayById[id];
    if (name?.trim()) return name;
    if (id) return `MAT-${id.substring(0, 6)}`;
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
        this.calcMetrics();
        this.applyFilters();
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load material issues'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.totalIssuedQty = this.items.reduce((s, i) => s + (i.quantityIssued ?? 0), 0);
    this.totalReturnedQty = this.items.reduce((s, i) => s + (i.quantityReturned ?? 0), 0);
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      return !this.filterSearch ||
        item.materialName?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
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

  onOrderChange() {
    this.selectedOrderStatus = this.productionOrderStatusById[this.formProductionOrderId] ?? '';
    this.cdr.detectChanges();
  }

  onMaterialSelected(item: ProductPickerItem) {
    this.formComponentId = item.id;
    const code = item.code?.trim() ?? '';
    const name = item.name?.trim() ?? '';
    this.formComponentDisplayText = code && name ? `${code} - ${name}` : name || code;
    this.materialDisplayById[item.id] = this.formComponentDisplayText;
    this.availableQty = null;
    this.loadAvailability();
  }

  onWarehouseChange() { this.availableQty = null; this.loadAvailability(); }

  loadAvailability() {
    if (!this.formComponentId || !this.formWarehouseId) return;
    this.availableQtyLoading = true;
    this.http.get<ApiResponse<any>>(
      `${BASE_URL}/api/InventoryBalance/by-item-warehouse?itemId=${this.formComponentId}&warehouseId=${this.formWarehouseId}`,
      { headers: this.auth.getAuthHeaders() },
    ).subscribe({
      next: (r) => { this.availableQty = r.data?.quantityAvailable ?? 0; this.availableQtyLoading = false; this.cdr.detectChanges(); },
      error: () => { this.availableQty = null; this.availableQtyLoading = false; this.cdr.detectChanges(); },
    });
  }

  getRemainingQty(): number | null {
    if (this.availableQty === null) return null;
    return this.availableQty - (this.formIssuedQuantity || 0);
  }

  openCreate() { this.editing = null; this.reset(); this.showForm = true; }

  openEdit(item: MaterialIssueDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formPoPickerText = item.productionOrderId
      ? (this.poPickerOptions.find(o => o.id === item.productionOrderId)?.label ?? this.orderNumberById[item.productionOrderId] ?? '')
      : '';
    this.formComponentId = item.materialId ?? '';
    this.formComponentDisplayText = this.getMaterialLabel(item.materialId, item.materialName);
    this.formIssuedQuantity = item.quantityIssued ?? 0;
    this.formUnit = item.unitOfMeasure ?? '';
    this.formIssueDate = item.issuedAt ? item.issuedAt.substring(0, 10) : '';
    this.formNotes = item.notes ?? '';
    this.showForm = true;
  }

  reset() {
    this.formProductionOrderId = ''; this.formPoPickerText = '';
    this.formComponentId = ''; this.formComponentDisplayText = '';
    this.formWarehouseId = ''; this.formIssuedQuantity = 0; this.formUnit = '';
    this.formIssueDate = ''; this.formNotes = '';
    this.availableQty = null;
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductionOrderId.trim()) { this.error = 'Production Order is required.'; this.cdr.detectChanges(); return; }
    if (!this.editing && this.selectedOrderStatus && this.selectedOrderStatus !== 'Released') {
      this.error = `Materials can only be issued to a Released production order. This order is currently "${this.selectedOrderStatus}".`;
      this.cdr.detectChanges(); return;
    }
    if (!this.formComponentId.trim()) { this.error = 'Material is required.'; this.cdr.detectChanges(); return; }
    if (!this.formWarehouseId.trim() && !this.editing) { this.error = 'Warehouse is required.'; this.cdr.detectChanges(); return; }
    if (this.formIssuedQuantity <= 0) { this.error = 'Issued quantity must be greater than 0.'; this.cdr.detectChanges(); return; }
    if (!this.editing && this.availableQty !== null && this.formIssuedQuantity > this.availableQty) {
      this.error = `Insufficient stock. Available in selected warehouse: ${this.availableQty}, requested: ${this.formIssuedQuantity}.`;
      this.cdr.detectChanges(); return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateMaterialIssueDto = { quantityIssued: this.formIssuedQuantity, unitOfMeasure: this.formUnit, issuedAt: this.formIssueDate || undefined, notes: this.formNotes || undefined };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
      return;
    }

    const issueDto: CreateMaterialIssueDto = {
      productionOrderId: this.formProductionOrderId,
      materialId: this.formComponentId,
      quantityIssued: this.formIssuedQuantity,
      unitOfMeasure: this.formUnit || undefined,
      issuedAt: this.formIssueDate || undefined,
      notes: this.formNotes || undefined,
    };

    this.svc.create(issueDto).subscribe({
      next: (res) => {
        const created = res.data;
        this.justCreated = created ?? null;
        const issueId = created?.id ?? '';
        const issueDate = this.formIssueDate || new Date().toISOString().substring(0, 10);
        const warehouseId = this.formWarehouseId;
        const materialId = this.formComponentId;
        const qty = this.formIssuedQuantity;
        const orderLabel = this.getOrderLabel(this.formProductionOrderId);

        this.http.get<ApiResponse<any>>(`${BASE_URL}/api/Item/${materialId}`, {
          headers: this.auth.getAuthHeaders(),
        }).subscribe({
          next: (itemRes) => {
            const baseUnitId: string = itemRes.data?.baseUnitId ?? '';
            this.http.get<ApiResponse<any>>(`${BASE_URL}/api/InventoryBalance/by-item-warehouse?itemId=${materialId}&warehouseId=${warehouseId}`, {
              headers: this.auth.getAuthHeaders(),
            }).subscribe({
              next: (balRes) => {
                const unitCost: number = balRes.data?.averageCost ?? 0;
                this.postInventoryDocument(issueId, materialId, warehouseId, qty, baseUnitId, unitCost, issueDate, orderLabel);
              },
              error: () => {
                this.postInventoryDocument(issueId, materialId, warehouseId, qty, baseUnitId, 0, issueDate, orderLabel);
              },
            });
          },
          error: () => {
            this.showForm = false;
            this.error = 'Material issue saved but inventory deduction failed: could not resolve item unit. Please check inventory manually.';
            this.load();
            this.cdr.detectChanges();
          },
        });
      },
      error: () => { this.error = 'Failed to create material issue.'; this.cdr.detectChanges(); },
    });
  }

  private postInventoryDocument(
    issueId: string, materialId: string, warehouseId: string,
    qty: number, unitId: string, unitCost: number, docDate: string, orderLabel: string,
  ) {
    if (!unitId) {
      this.showForm = false;
      this.error = 'Material issue saved but inventory deduction failed: item has no base unit configured.';
      this.load();
      this.cdr.detectChanges();
      return;
    }

    const docPayload = {
      documentType: 'Issue',
      documentDate: docDate,
      referenceId: issueId,
      referenceType: 'MaterialIssue',
      fromWarehouseId: warehouseId,
      toWarehouseId: null,
      description: `Material issued to ${orderLabel}`,
      lines: [{
        itemId: materialId,
        warehouseId,
        quantity: qty,
        unitId,
        unitCost,
        lineNumber: 1,
        description: `Material issued to ${orderLabel}`,
      }],
    };

    this.http.post<ApiResponse<any>>(`${BASE_URL}/api/InventoryDocument`, docPayload, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (docRes) => {
        const docId: string = docRes.data?.id ?? '';
        if (!docId) {
          this.showForm = false;
          this.error = 'Material issue saved but inventory document creation failed.';
          this.load();
          this.cdr.detectChanges();
          return;
        }
        this.http.post<ApiResponse<any>>(`${BASE_URL}/api/InventoryDocument/${docId}/post`, {
          documentId: docId,
          postingDate: docDate,
        }, { headers: this.auth.getAuthHeaders() }).subscribe({
          next: () => {
            this.showForm = false;
            this.success = 'Material issued and inventory balance updated.';
            this.load();
            setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 4000);
            this.cdr.detectChanges();
          },
          error: () => {
            this.showForm = false;
            this.error = 'Material issue saved and document created, but posting failed. Go to Inventory Documents to post manually.';
            this.load();
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.showForm = false;
        this.error = 'Material issue saved but inventory document creation failed. Check inventory manually.';
        this.load();
        this.cdr.detectChanges();
      },
    });
  }

  delete(item: MaterialIssueDto) {
    if (confirm('Delete this material issue?')) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}
