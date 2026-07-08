import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { DemandService } from '../../services/demand.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { DemandDto, CreateDemandDto, UpdateDemandDto } from '../../models/demand.model';
import { ProductPickerInputComponent, ProductPickerItem } from '../../components/product-picker-input/product-picker-input';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-demand',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductPickerInputComponent],
  templateUrl: './demand.html',
  styleUrl: './demand.css',
})
export class Demand implements OnInit {
  items: DemandDto[] = [];
  filteredItems: DemandDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: DemandDto | null = null;

  formProductId = '';
  productDisplayText = '';
  formQuantity = 0;
  formUnit = '';
  formRequiredDate = '';
  formSource = '';
  formStatus = 'Open';
  formNotes = '';
  statusOptions = ['Open', 'InProgress', 'Fulfilled', 'Cancelled'];
  sourceOptions = ['SalesOrder', 'Forecast', 'Manual', 'MRP'];

  filterSearch = '';
  filterStatus = 'all';

  totalCount = 0;
  openCount = 0;
  inProgressCount = 0;
  fulfilledCount = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  productDisplayById: Record<string, string> = {};
  productLabelsLoaded = false;

  constructor(
    private svc: DemandService,
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
        // Don't block retries — per-item fallback via resolveUnlabeledProducts will handle it
      },
    });
  }

  private async resolveUnlabeledProducts(items: DemandDto[]) {
    const uniqueIds = [...new Set(
      items.map(i => i.productId).filter(id => id && !this.productDisplayById[id])
    )] as string[];

    if (uniqueIds.length === 0) return;

    await Promise.all(uniqueIds.map(async (id) => {
      try {
        const r = await firstValueFrom(
          this.http.get<ApiResponse<any>>(`${BASE_URL}/api/Item/${id}`, {
            headers: this.auth.getAuthHeaders(),
          })
        );
        const item = r.data;
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
      error: () => { this.error = 'Failed to load demands'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.openCount = this.items.filter(i => i.status === 'Open').length;
    this.inProgressCount = this.items.filter(i => i.status === 'InProgress').length;
    this.fulfilledCount = this.items.filter(i => i.status === 'Fulfilled').length;
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

  isOverdue(item: DemandDto): boolean {
    if (!item.dueDate || item.status === 'Fulfilled' || item.status === 'Cancelled') return false;
    return new Date(item.dueDate) < new Date();
  }

  getFulfillmentPct(item: DemandDto): number {
    if (!item.quantity) return 0;
    return Math.min(Math.round(((item.fulfilledQty ?? 0) / item.quantity) * 100), 100);
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

  openEdit(item: DemandDto) {
    this.editing = item;
    this.formProductId = item.productId ?? '';
    this.productDisplayText = this.getProductDisplayLabel(item.productId, item.productName);
    this.formQuantity = item.quantity ?? 0;
    this.formUnit = '';
    this.formRequiredDate = item.dueDate ? item.dueDate.substring(0, 10) : '';
    this.formSource = item.sourceType ?? '';
    this.formStatus = item.status ?? 'Open';
    this.formNotes = item.notes ?? '';
    this.showForm = true;
  }

  reset() {
    this.formProductId = ''; this.productDisplayText = ''; this.formQuantity = 0; this.formUnit = '';
    this.formRequiredDate = ''; this.formSource = ''; this.formStatus = 'Open'; this.formNotes = '';
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductId.trim()) { this.error = 'Product ID is required.'; this.cdr.detectChanges(); return; }
    if (this.formQuantity <= 0) { this.error = 'Quantity must be greater than 0.'; this.cdr.detectChanges(); return; }

    if (this.editing) {
      const dto: UpdateDemandDto = { quantity: this.formQuantity, dueDate: this.formRequiredDate || null, status: this.formStatus, notes: this.formNotes || null };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateDemandDto = { productId: this.formProductId, quantity: this.formQuantity, dueDate: this.formRequiredDate || null, sourceType: this.formSource || null, notes: this.formNotes || null };
      this.svc.create(dto).subscribe({
        next: (res) => { this.justCreated = res.data ?? null; this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  quickUpdateStatus(item: DemandDto, status: string) {
    this.svc.update(item.id, { status }).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Failed to update status'; this.cdr.detectChanges(); },
    });
  }

  delete(item: DemandDto) {
    if (confirm(`Delete demand for "${item.productName ?? item.productId}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }

  getStatusClass(status: string | null): string {
    const map: Record<string, string> = { Open: 'badge-open', InProgress: 'badge-inprogress', Fulfilled: 'badge-fulfilled', Cancelled: 'badge-cancelled' };
    return map[status ?? ''] ?? '';
  }
}
