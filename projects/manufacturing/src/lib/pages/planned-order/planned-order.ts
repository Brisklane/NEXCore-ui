import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { PlannedOrderService } from '../../services/planned-order.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { BomService } from '../../services/bom.service';
import { RoutingService } from '../../services/routing.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { PlannedOrderDto, CreatePlannedOrderDto, UpdatePlannedOrderDto } from '../../models/planned-order.model';
import { CreateProductionOrderDto } from '../../models/production-order.model';
import { BillOfMaterialDto } from '../../models/bill-of-material.model';
import { RoutingDto } from '../../models/routing.model';
import { ProductPickerInputComponent, ProductPickerItem } from '../../components/product-picker-input/product-picker-input';
import { OptionPickerInputComponent, OptionPickerItem, OptionPickerColumn } from '../../components/option-picker-input/option-picker-input';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-planned-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductPickerInputComponent, OptionPickerInputComponent],
  templateUrl: './planned-order.html',
  styleUrl: './planned-order.css',
})
export class PlannedOrder implements OnInit {
  items: PlannedOrderDto[] = [];
  filteredItems: PlannedOrderDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: PlannedOrderDto | null = null;

  formProductId = '';
  productDisplayText = '';
  formQuantity = 0;
  formPlannedEnd = '';
  formStatus = 'Planned';
  formSource = '';
  formNotes = '';
  statusOptions = ['Planned', 'Firmed', 'Released', 'Cancelled'];
  sourceOptions = ['MRP', 'Manual', 'SalesOrder'];

  filterSearch = '';
  filterStatus = 'all';

  totalCount = 0;
  plannedCount = 0;
  firmedCount = 0;
  releasedCount = 0;
  totalPlannedQty = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  productDisplayById: Record<string, string> = {};
  productLabelsLoaded = false;

  // Convert to Production Order modal state
  showConvertModal = false;
  convertingOrder: PlannedOrderDto | null = null;
  convertQty = 0;
  convertBomId = '';
  convertBomLabel = '';
  convertRoutingId = '';
  convertRoutingLabel = '';
  convertStartDate = '';
  convertEndDate = '';
  convertNotes = '';
  convertLoading = false;
  convertError = '';
  convertSuccess = '';
  convertBomOptions: OptionPickerItem[] = [];
  convertRoutingOptions: OptionPickerItem[] = [];

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

  constructor(
    private svc: PlannedOrderService,
    private productionOrderSvc: ProductionOrderService,
    private bomSvc: BomService,
    private routingSvc: RoutingService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadProductLabels(); this.load(); }

  loadProductLabels() {
    if (this.productLabelsLoaded) return;

    this.http.get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/active`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const items = Array.isArray(r.data) ? r.data : [];
        items.forEach((item) => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          if (code && name) this.productDisplayById[item.id] = `${code} - ${name}`;
          else if (name) this.productDisplayById[item.id] = name;
          else if (code) this.productDisplayById[item.id] = code;
        });
        this.productLabelsLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        // Don't block retries on failure — labels will be resolved per-item via resolveUnlabeledProducts
      },
    });
  }

  private async resolveUnlabeledProducts(items: PlannedOrderDto[]) {
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
        this.loading = false;
        this.applyJustCreated();
        this.cdr.detectChanges();
        this.resolveUnlabeledProducts(this.items);
      },
      error: () => { this.error = 'Failed to load planned orders'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.plannedCount = this.items.filter(i => i.status === 'Planned').length;
    this.firmedCount = this.items.filter(i => i.status === 'Firmed').length;
    this.releasedCount = this.items.filter(i => i.status === 'Released').length;
    this.totalPlannedQty = this.items.reduce((s, i) => s + (i.plannedQty ?? 0), 0);
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchSearch = !this.filterSearch ||
        item.productName?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productId?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.sourceType?.toLowerCase().includes(this.filterSearch.toLowerCase());
      const matchStatus = this.filterStatus === 'all' || item.status === this.filterStatus;
      return matchSearch && matchStatus;
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

  isOverdue(item: PlannedOrderDto): boolean {
    if (!item.requiredDate || item.status === 'Cancelled' || item.status === 'Released') return false;
    return new Date(item.requiredDate) < new Date();
  }

  openCreate() { this.editing = null; this.reset(); this.showForm = true; }

  onProductSelected(item: ProductPickerItem) {
    this.formProductId = item.id;
    const label = [item.code, item.name].filter(Boolean).join(' - ');
    this.productDisplayText = label;
    this.productDisplayById[item.id] = label;
    this.error = '';
    this.cdr.detectChanges();
  }

  openEdit(item: PlannedOrderDto) {
    this.editing = item;
    this.formProductId = item.productId ?? '';
    this.productDisplayText = this.getProductDisplayLabel(item.productId, item.productName);
    this.formQuantity = item.plannedQty ?? 0;
    this.formPlannedEnd = item.requiredDate ? item.requiredDate.substring(0, 10) : '';
    this.formStatus = item.status ?? 'Planned';
    this.formSource = item.sourceType ?? '';
    this.formNotes = item.notes ?? '';
    this.showForm = true;
  }

  reset() {
    this.formProductId = ''; this.productDisplayText = ''; this.formQuantity = 0; this.formPlannedEnd = '';
    this.formStatus = 'Planned'; this.formSource = ''; this.formNotes = '';
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductId.trim()) { this.error = 'Please select a product.'; this.cdr.detectChanges(); return; }
    if (this.formQuantity <= 0) { this.error = 'Planned quantity must be greater than 0.'; this.cdr.detectChanges(); return; }

    if (this.editing) {
      const dto: UpdatePlannedOrderDto = { plannedQty: this.formQuantity, requiredDate: this.formPlannedEnd || null, status: this.formStatus, notes: this.formNotes || null };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePlannedOrderDto = { productId: this.formProductId, plannedQty: this.formQuantity, requiredDate: this.formPlannedEnd || null, sourceType: this.formSource || null, notes: this.formNotes || null };
      this.svc.create(dto).subscribe({
        next: (res) => { this.justCreated = res.data ?? null; this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  quickUpdateStatus(item: PlannedOrderDto, status: string) {
    this.svc.update(item.id, { status }).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Failed to update status'; this.cdr.detectChanges(); },
    });
  }

  delete(item: PlannedOrderDto) {
    if (confirm(`Delete planned order for "${item.productName ?? item.productId}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }

  openConvertModal(item: PlannedOrderDto) {
    this.convertingOrder = item;
    this.convertQty = item.plannedQty ?? 0;
    this.convertBomId = '';
    this.convertBomLabel = '';
    this.convertRoutingId = '';
    this.convertRoutingLabel = '';
    this.convertStartDate = '';
    this.convertEndDate = item.requiredDate ? item.requiredDate.substring(0, 10) : '';
    this.convertNotes = item.notes ?? '';
    this.convertError = '';
    this.convertBomOptions = [];
    this.convertRoutingOptions = [];

    this.bomSvc.getByProduct(item.productId).subscribe({
      next: (r) => {
        const boms: BillOfMaterialDto[] = (r as any).data ?? [];
        this.convertBomOptions = boms.map(b => {
          const productLabel = this.getProductDisplayLabel(b.finishedProductId, b.finishedProductName);
          const effectiveFrom = b.effectiveFrom
            ? new Date(b.effectiveFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';
          return {
            id: b.id,
            label: `${productLabel} — BOM v${b.version}`,
            meta: {
              product: productLabel,
              version: `v${b.version}`,
              status: b.isActive ? 'Active' : 'Inactive',
              components: `${b.items?.length ?? 0} component${b.items?.length === 1 ? '' : 's'}`,
              effectiveFrom,
            },
          };
        });
        if (this.convertBomOptions.length === 1) {
          this.convertBomId = this.convertBomOptions[0].id;
          this.convertBomLabel = this.convertBomOptions[0].label;
        }
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });

    const buildRoutingOptions = (routings: RoutingDto[]): OptionPickerItem[] =>
      routings.map(rt => {
        const name = rt.name?.trim() || 'Routing';
        const productLabel = this.getProductDisplayLabel(rt.productId, rt.productName);
        return {
          id: rt.id,
          label: `${name} v${rt.version}`,
          meta: {
            name,
            product: productLabel !== 'Unmapped Product' ? productLabel : '—',
            version: `v${rt.version}`,
            status: rt.isActive ? 'Active' : 'Inactive',
            operations: `${rt.operations?.length ?? 0} operation${rt.operations?.length === 1 ? '' : 's'}`,
          },
        };
      });

    this.routingSvc.getByProduct(item.productId).subscribe({
      next: (r) => {
        const routings: RoutingDto[] = (r as any).data ?? [];
        if (routings.length > 0) {
          this.convertRoutingOptions = buildRoutingOptions(routings);
          if (this.convertRoutingOptions.length === 1) {
            this.convertRoutingId = this.convertRoutingOptions[0].id;
            this.convertRoutingLabel = this.convertRoutingOptions[0].label;
          }
        } else {
          this.routingSvc.getAll().subscribe({
            next: (all) => {
              this.convertRoutingOptions = buildRoutingOptions(all.data ?? []);
              this.cdr.detectChanges();
            },
          });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.routingSvc.getAll().subscribe({
          next: (all) => {
            this.convertRoutingOptions = buildRoutingOptions(all.data ?? []);
            this.cdr.detectChanges();
          },
        });
      },
    });

    this.showConvertModal = true;
    this.cdr.detectChanges();
  }

  onConvertBomSelected(item: OptionPickerItem) {
    this.convertBomId = item.id;
    this.convertBomLabel = item.label;
    this.convertError = '';
    this.cdr.detectChanges();
  }

  onConvertRoutingSelected(item: OptionPickerItem) {
    this.convertRoutingId = item.id;
    this.convertRoutingLabel = item.label;
    this.convertError = '';
    this.cdr.detectChanges();
  }

  cancelConvert() {
    this.showConvertModal = false;
    this.convertingOrder = null;
    this.convertError = '';
  }

  confirmConvert() {
    if (!this.convertingOrder) return;
    if (this.convertQty <= 0) {
      this.convertError = 'Quantity must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.convertBomId) {
      this.convertError = 'Please select a Bill of Material.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.convertRoutingId) {
      this.convertError = 'Please select a Routing.';
      this.cdr.detectChanges();
      return;
    }

    this.convertLoading = true;
    this.convertError = '';
    this.cdr.detectChanges();

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);

    const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
    const dto: CreateProductionOrderDto = {
      orderNumber: `PO-${datePart}-${randPart}`,
      productId: this.convertingOrder.productId,
      plannedOrderId: this.convertingOrder.id,
      billOfMaterialId: this.convertBomId || EMPTY_GUID,
      routingId: this.convertRoutingId || EMPTY_GUID,
      quantityPlanned: this.convertQty,
      status: 'Draft',
      startDate: this.convertStartDate || null,
      endDate: this.convertEndDate || null,
      notes: this.convertNotes || null,
    };

    this.productionOrderSvc.create(dto).subscribe({
      next: () => {
        this.svc.update(this.convertingOrder!.id, { status: 'Converted' }).subscribe({
          next: () => {
            this.convertLoading = false;
            this.showConvertModal = false;
            this.convertingOrder = null;
            this.convertSuccess = 'Production Order created and Planned Order marked as Released.';
            this.load();
            setTimeout(() => { this.convertSuccess = ''; this.cdr.detectChanges(); }, 4000);
            this.cdr.detectChanges();
          },
          error: () => {
            this.convertLoading = false;
            this.convertError = 'Production Order created but could not update Planned Order status.';
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.convertLoading = false;
        this.convertError = 'Failed to create Production Order. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  getStatusClass(status: string | null): string {
    const map: Record<string, string> = {
      Draft: 'badge-draft',
      Planned: 'badge-planned',
      Firmed: 'badge-firmed',
      Released: 'badge-released',
      Converted: 'badge-converted',
      Cancelled: 'badge-cancelled',
    };
    return map[status ?? ''] ?? '';
  }
}
