import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { RoutingService } from '../../services/routing.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { RoutingDto, CreateRoutingDto, UpdateRoutingDto } from '../../models/routing.model';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-routing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routing.html',
  styleUrls: ['./routing.css'],
})
export class Routing implements OnInit {
  items: RoutingDto[] = [];
  loading = false; lookupLoading = false; error = ''; showForm = false; editing: RoutingDto | null = null;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  formProductCode = ''; formProductId = ''; formProductName = '';
  formName = ''; formDescription = ''; formIsActive = true;

  constructor(
    private svc: RoutingService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load routings'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  openCreate() { this.editing = null; this.reset(); this.showForm = true; }
  openEdit(item: RoutingDto) { this.editing = item; this.formProductCode = ''; this.formProductId = item.productId ?? ''; this.formProductName = item.productName ?? ''; this.formName = item.name ?? ''; this.formDescription = item.description ?? ''; this.formIsActive = item.isActive ?? true; this.showForm = true; }
  reset() { this.formProductCode = ''; this.formProductId = ''; this.formProductName = ''; this.formName = ''; this.formDescription = ''; this.formIsActive = true; }
  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  lookupProductByCode() {
    const code = this.formProductCode.trim();
    if (!code) {
      this.error = 'Product code is required.';
      this.cdr.detectChanges();
      return;
    }

    this.lookupLoading = true;
    this.error = '';

    this.http.get<ApiResponse<InventoryItemLookupDto>>(`${BASE_URL}/api/Item/by-code/${encodeURIComponent(code)}`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        this.lookupLoading = false;
        const item = r.data;
        if (!item) {
          this.error = 'Product code not found';
          this.cdr.detectChanges();
          return;
        }

        this.formProductId = item.id;
        this.formProductName = item.name ?? '';
        this.error = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.lookupLoading = false;
        this.error = 'Failed to lookup product code';
        this.cdr.detectChanges();
      },
    });
  }

  save() {
    if (!this.formProductId.trim() || !this.formName.trim()) {
      this.error = 'Please provide routing name and a valid product code.';
      this.cdr.detectChanges();
      return;
    }

    if (this.editing) {
      const dto: UpdateRoutingDto = { name: this.formName, isActive: this.formIsActive, description: this.formDescription };
      this.svc.update(this.editing.id, dto).subscribe({ next: () => { this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); } });
    } else {
      const dto: CreateRoutingDto = { productId: this.formProductId, name: this.formName, version: 1, description: this.formDescription || null };
      this.svc.create(dto).subscribe({ next: () => { this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); } });
    }
  }

  delete(item: RoutingDto) {
    if (confirm(`Delete routing "${item.name}"?`)) {
      this.svc.delete(item.id).subscribe({ next: () => this.load(), error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); } });
    }
  }
}

