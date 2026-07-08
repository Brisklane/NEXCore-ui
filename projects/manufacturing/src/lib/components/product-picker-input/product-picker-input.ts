import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';

export interface ProductPickerItem {
  id: string;
  code: string | null;
  name: string | null;
  itemType?: string | null;
}

interface PaginatedApiResponse<T> {
  data?: T;
  pagination?: {
    totalCount: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Component({
  selector: 'lib-product-picker-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-picker-input.html',
  styleUrl: './product-picker-input.css',
})
export class ProductPickerInputComponent implements OnChanges {
  @Input() value = '';
  @Input() disabled = false;
  @Input() placeholder = 'Type product code or name...';
  @Input() typeFilter = '';
  @Input() entityLabel = 'Product';
  @Output() productSelected = new EventEmitter<ProductPickerItem>();

  searchText = '';
  suggestions: ProductPickerItem[] = [];
  showDropdown = false;
  dropdownLoading = false;

  showPicker = false;
  pickerSearch = '';
  pickerPage = 1;
  readonly pickerPageSize = 20;
  pickerTotal = 0;
  pickerStart = 0;
  pickerEnd = 0;
  pickerPageItems: ProductPickerItem[] = [];
  pickerHasNextPage = false;
  pickerHasPreviousPage = false;
  pickerLoading = false;

  private dropdownTimer: number | null = null;
  private pickerSearchTimer: number | null = null;

  constructor(
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.searchText = this.value;
    }
  }

  onFocus() {
    if (this.disabled) return;
    this.loadDropdown(this.searchText, 5);
  }

  onInput() {
    if (this.disabled) return;
    if (this.dropdownTimer !== null) window.clearTimeout(this.dropdownTimer);
    this.dropdownTimer = window.setTimeout(() => this.loadDropdown(this.searchText, 5), 160);
  }

  onBlur() {
    setTimeout(() => { this.showDropdown = false; this.cdr.detectChanges(); }, 150);
  }

  private loadDropdown(search: string, pageSize: number) {
    this.dropdownLoading = true;
    const params: Record<string, string> = {
      pageNumber: '1',
      pageSize: String(pageSize),
      search: search.trim(),
    };
    if (this.typeFilter) params['itemType'] = this.typeFilter;
    this.http.get<PaginatedApiResponse<ProductPickerItem[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params,
    }).subscribe({
      next: (r) => {
        this.suggestions = r.data ?? [];
        this.showDropdown = true;
        this.dropdownLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.suggestions = [];
        this.showDropdown = true;
        this.dropdownLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectSuggestion(item: ProductPickerItem) {
    this.searchText = [item.code, item.name].filter(Boolean).join(' - ');
    this.showDropdown = false;
    this.productSelected.emit(item);
  }

  openPicker() {
    this.showDropdown = false;
    this.pickerSearch = this.searchText.trim();
    this.pickerPage = 1;
    this.showPicker = true;
    this.loadPickerPage();
  }

  closePicker() {
    this.showPicker = false;
  }

  onPickerSearchChange() {
    if (this.pickerSearchTimer !== null) window.clearTimeout(this.pickerSearchTimer);
    this.pickerPage = 1;
    this.pickerSearchTimer = window.setTimeout(() => this.loadPickerPage(), 180);
  }

  goToPickerPage(page: number) {
    if (page < 1 || this.pickerLoading) return;
    this.pickerPage = page;
    this.loadPickerPage();
  }

  selectFromPicker(item: ProductPickerItem) {
    this.selectSuggestion(item);
    this.closePicker();
  }

  private loadPickerPage() {
    if (this.pickerLoading) return;
    this.pickerLoading = true;
    const params: Record<string, string> = {
      pageNumber: String(this.pickerPage),
      pageSize: String(this.pickerPageSize),
      search: this.pickerSearch.trim(),
    };
    if (this.typeFilter) params['itemType'] = this.typeFilter;
    this.http.get<PaginatedApiResponse<ProductPickerItem[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
      params,
    }).subscribe({
      next: (r) => {
        this.pickerPageItems = r.data ?? [];
        this.pickerTotal = r.pagination?.totalCount ?? this.pickerPageItems.length;
        this.pickerStart = r.pagination?.startIndex ?? ((this.pickerPage - 1) * this.pickerPageSize + 1);
        this.pickerEnd = r.pagination?.endIndex ?? (this.pickerStart + this.pickerPageItems.length - 1);
        this.pickerHasNextPage = r.pagination?.hasNextPage ?? false;
        this.pickerHasPreviousPage = r.pagination?.hasPreviousPage ?? this.pickerPage > 1;
        if (this.pickerPageItems.length === 0) { this.pickerStart = 0; this.pickerEnd = 0; }
        this.pickerLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pickerLoading = false;
        this.pickerPageItems = [];
        this.pickerTotal = 0;
        this.pickerStart = 0;
        this.pickerEnd = 0;
        this.cdr.detectChanges();
      },
    });
  }
}
