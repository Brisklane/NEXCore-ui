import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { QuotationService } from '../../services/quotation.service';
import { SalesLookupService } from '../../services/sales-lookup.service';
import { PriceListService } from '../../services/price-list.service';
import { PriceListDto } from '../../models/price-list.model';
import { ItemService } from '@nexcore/inventory';
import { ItemDto } from '@nexcore/inventory';
import { InventoryBalanceService } from '@nexcore/inventory';
import { EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField, GeoService, CountryDto, CityDto } from '@nexcore/core';
import { ContactService, ContactDto, CreateContactDto } from '@nexcore/crm';
import { CurrencyService } from '../../services/currency.service';
import { GeoCurrencyDto } from '../../models/currency.model';
import { RowHighlighter } from '@nexcore/shared';
import {
  QuotationDto,
  QuotationLineDto,
  CreateQuotationDto,
  CreateQuotationLineDto,
  QuotationStatus,
} from '../../models/quotation.model';

@Component({
  selector: 'lib-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityPickerInputComponent],
  templateUrl: './quotations.html',
  styleUrl: './quotations.css',
})
export class QuotationsComponent implements OnInit {
  quotations: QuotationDto[] = [];
  loading = false;
  error = '';
  successMsg = '';

  showForm = false;
  selectedQuotation: QuotationDto | null = null;

  contacts: ContactDto[] = [];
  priceLists: PriceListDto[] = [];
  inventoryItems: ItemDto[] = [];
  currencies: GeoCurrencyDto[] = [];
  private static readonly DEFAULT_CURRENCY = 'USD';

  // Form fields
  form: CreateQuotationDto = this.blankForm();
  newLine: CreateQuotationLineDto = this.blankLine();
  saving = false;
  activeTab: 'info' | 'lines' = 'info';

  statusFilter = '';
  searchQuery = '';

  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  private readonly statusMap: Record<number, string> = {
    0: 'Draft', 1: 'Sent', 2: 'Accepted', 3: 'Rejected', 4: 'Expired', 5: 'Cancelled',
  };

  readonly statuses = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Cancelled'];

  constructor(
    private quotationService: QuotationService,
    private lookupService: SalesLookupService,
    private contactService: ContactService,
    private priceListService: PriceListService,
    private itemService: ItemService,
    private currencyService: CurrencyService,
    private balanceService: InventoryBalanceService,
    private geo: GeoService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ─── Item picker (5 suggestions + paginated modal) ───────────────────────
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' },
    { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
  ];
  get itemPickerOptions(): EntityPickerItem[] {
    return this.inventoryItems.map(i => ({ id: i.id, name: i.name ?? '', code: i.code ?? '' }));
  }

  // ─── Live stock availability ──────────────────────────────────────────────
  stockByItemId: Record<string, number> = {};
  stockLoadingByItemId: Record<string, boolean> = {};

  private fetchStock(itemId: string) {
    if (!itemId) return;
    if (this.stockByItemId[itemId] !== undefined || this.stockLoadingByItemId[itemId]) return;
    this.stockLoadingByItemId[itemId] = true;
    this.balanceService.getByItem(itemId).subscribe({
      next: (res) => {
        const total = (res.data ?? []).reduce((s, b) => s + Math.max(0, Number(b.quantityAvailable) || 0), 0);
        this.stockByItemId[itemId] = total;
        this.stockLoadingByItemId[itemId] = false;
        this.cdr.detectChanges();
      },
      error: () => { this.stockByItemId[itemId] = 0; this.stockLoadingByItemId[itemId] = false; this.cdr.detectChanges(); },
    });
  }

  availableFor(itemId: string): number | null { return this.stockByItemId[itemId] ?? null; }
  isStockLoading(itemId: string): boolean { return !!this.stockLoadingByItemId[itemId]; }
  isOverStock(itemId: string, qty: number): boolean {
    const avail = this.availableFor(itemId);
    return avail !== null && qty > avail;
  }
  get hasStockIssue(): boolean {
    return this.form.lines.some(l => this.isOverStock(l.productId, l.quantity));
  }

  ngOnInit() {
    this.load();
    this.loadContacts();
    this.priceListService.getActive().subscribe({ next: (res) => { this.priceLists = res.data ?? []; }, error: () => {} });
    this.loadInventoryItems();
    this.currencyService.getGeoCurrencies().subscribe({ next: (res) => { this.currencies = res.data ?? []; this.cdr.detectChanges(); }, error: () => {} });
    this.geo.getCountries().subscribe({ next: (c) => { this.allCountries = c; this.cdr.detectChanges(); }, error: () => {} });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.quotationService.getAll().subscribe({
      next: (res) => {
        this.quotations = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load quotations.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** Load all active items by paging through (server caps pageSize at 100). */
  private loadInventoryItems() {
    this.itemService.getActivePaged({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        let all = [...(res.data ?? [])];
        const totalPages = res.pagination?.totalPages ?? 1;
        if (totalPages <= 1) { this.inventoryItems = all; this.cdr.detectChanges(); return; }
        const pages: number[] = [];
        for (let p = 2; p <= totalPages; p++) pages.push(p);
        forkJoin(pages.map(p => this.itemService.getActivePaged({ pageNumber: p, pageSize: 100 }))).subscribe({
          next: (results) => {
            for (const r of results) all = all.concat(r.data ?? []);
            this.inventoryItems = all;
            this.cdr.detectChanges();
          },
          error: () => { this.inventoryItems = all; this.cdr.detectChanges(); },
        });
      },
      error: () => {},
    });
  }

  normStatus(v: QuotationStatus | number | string | null): string {
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : (/^\d+$/.test(String(v)) ? +v : NaN);
    return !isNaN(n) ? (this.statusMap[n] ?? String(v)) : String(v);
  }

  get filtered(): QuotationDto[] {
    let result = this.quotations;
    if (this.statusFilter) result = result.filter(q => this.normStatus(q.status) === this.statusFilter);
    const q = this.searchQuery.toLowerCase().trim();
    if (q) result = result.filter(qt =>
      (qt.quotationNumber ?? '').toLowerCase().includes(q) ||
      (qt.contactName ?? '').toLowerCase().includes(q) ||
      (qt.quotationName ?? '').toLowerCase().includes(q)
    );
    const rows = [...result];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const hid = this.highlighter.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  openCreateForm() {
    this.form = this.blankForm();
    this.newLine = this.blankLine();
    this.showForm = true;
    this.selectedQuotation = null;
    this.activeTab = 'info';
    this.error = '';
    this.successMsg = '';
  }

  cancelForm() {
    this.showForm = false;
  }

  private blankForm(): CreateQuotationDto {
    return {
      quotationName: '',
      contactId: '',
      contactName: '',
      validUntil: '',
      priceListId: '',
      // CurrencyCode is required (non-nullable) on the backend.
      currencyCode: QuotationsComponent.DEFAULT_CURRENCY,
      // PaymentTerms is a non-nullable backend enum (int). Default to Net30 (= 2).
      paymentTerms: 2,
      notes: '',
      lines: [],
    };
  }

  /** Client-side guard before submitting. Returns an error message, or null when valid. */
  private validateForm(): string | null {
    if (!this.form.contactId || !this.contacts.some(c => c.id === this.form.contactId))
      return 'Select a customer.';
    if (!this.form.currencyCode) return 'Select a currency.';
    if (this.form.paymentTerms === null || this.form.paymentTerms === undefined || this.form.paymentTerms === '')
      return 'Select payment terms.';
    if (this.form.lines.length === 0) return 'Add at least one line item.';
    for (const l of this.form.lines) {
      if (!l.productId) return 'Every line must have an item selected.';
      if (!(l.quantity > 0)) return 'Line quantities must be greater than zero.';
      if (l.unitPrice < 0) return 'Line unit price cannot be negative.';
    }
    if (this.hasStockIssue) return 'One or more lines exceed available stock.';
    return null;
  }

  /** Display name persisted on the quotation and shown in the Customer column. */
  // ─── Customer picker (5 suggestions + paginated modal + quick add) ────────
  loadContacts() {
    this.contactService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        const all = [...(res.data ?? [])];
        const totalPages = res.pagination?.totalPages ?? 1;
        if (totalPages <= 1) { this.contacts = all; this.cdr.detectChanges(); return; }
        const pages: number[] = [];
        for (let p = 2; p <= totalPages; p++) pages.push(p);
        forkJoin(pages.map(p => this.contactService.getAll({ page: p, pageSize: 100 }))).subscribe({
          next: (rest) => { rest.forEach(r => all.push(...(r.data ?? []))); this.contacts = all; this.cdr.detectChanges(); },
          error: () => { this.contacts = all; this.cdr.detectChanges(); },
        });
      },
      error: () => {},
    });
  }

  readonly contactDisplayFields: EntityPickerDisplayField[] = [
    { key: 'name', style: 'name' },
    { key: 'account', style: 'badge' },
  ];
  readonly contactColumns: EntityPickerColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'account', header: 'Account' },
    { key: 'phone', header: 'Phone' },
  ];
  get contactPickerOptions(): EntityPickerItem[] {
    return this.contacts.map(c => ({
      id: c.id,
      name: this.contactDisplayName(c) || c.email || 'Customer',
      account: c.accountName ?? '',
      phone: c.phone ?? '',
    }));
  }

  onContactPicked(item: EntityPickerItem) {
    this.form.contactId = item['id'];
    const c = this.contacts.find(x => x.id === item['id']);
    this.form.contactName = c ? this.contactDisplayName(c) : (item['name'] ?? '');
    this.cdr.detectChanges();
  }

  // ─── Quick-create customer (contact) ─────────────────────────────────────
  showQuickContact = false;
  qcSaving = false;
  qcError = '';
  qcFirst = '';
  qcLast = '';
  qcPhone = '';
  qcEmail = '';
  qcCountry = '';
  qcCity = '';
  qcStreet = '';
  allCountries: CountryDto[] = [];
  qcCities: CityDto[] = [];
  qcLoadingCities = false;

  get qcCountryList(): CountryDto[] {
    return this.allCountries.filter(c => c.isActive && c.code);
  }

  onQcCountryChange(code: string) {
    this.qcCountry = code;
    this.qcCity = '';
    this.qcCities = [];
    if (!code) { this.cdr.detectChanges(); return; }
    this.qcLoadingCities = true;
    this.geo.getCities(code).subscribe({
      next: (cities) => { this.qcCities = cities; this.qcLoadingCities = false; this.cdr.detectChanges(); },
      error: () => { this.qcCities = []; this.qcLoadingCities = false; this.cdr.detectChanges(); },
    });
  }

  openQuickCreateContact(typed: string) {
    this.qcError = '';
    const parts = (typed ?? '').trim().split(/\s+/).filter(Boolean);
    this.qcFirst = parts.shift() ?? '';
    this.qcLast = parts.join(' ');
    this.qcPhone = '';
    this.qcEmail = '';
    this.qcCountry = '';
    this.qcCity = '';
    this.qcStreet = '';
    this.qcCities = [];
    this.showQuickContact = true;
    this.cdr.detectChanges();
  }

  cancelQuickContact() {
    this.showQuickContact = false;
    this.qcError = '';
    this.cdr.detectChanges();
  }

  saveQuickContact() {
    if (!this.qcFirst.trim() && !this.qcLast.trim()) {
      this.qcError = 'Enter a first or last name.';
      this.cdr.detectChanges();
      return;
    }
    this.qcSaving = true;
    this.qcError = '';
    const dto: CreateContactDto = {
      firstName: this.qcFirst.trim() || null,
      lastName: this.qcLast.trim() || null,
      phone: this.qcPhone.trim() || null,
      email: this.qcEmail.trim() || null,
      mailingCountry: this.qcCountry.trim() || null,
      mailingCity: this.qcCity.trim() || null,
      mailingStreet: this.qcStreet.trim() || null,
      emailOptOut: false,
    };
    this.contactService.create(dto).subscribe({
      next: (res) => {
        this.qcSaving = false;
        const created = res.data;
        if (created) {
          this.contacts = [created, ...this.contacts];
          this.form.contactId = created.id;
          this.form.contactName = this.contactDisplayName(created);
        }
        this.showQuickContact = false;
        this.cdr.detectChanges();
      },
      error: () => { this.qcSaving = false; this.qcError = 'Failed to create customer.'; this.cdr.detectChanges(); },
    });
  }

  private contactDisplayName(c: ContactDto): string {
    const person = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
    return person || (c.accountName ?? '');
  }

  private readonly paymentTermsLabels: Record<number, string> = {
    0: 'Immediate', 1: 'Net 15', 2: 'Net 30', 3: 'Net 45', 4: 'Net 60',
    5: 'Net 90', 6: '2/10 Net 30', 7: 'End of Month', 8: 'Cash on Delivery', 9: 'Advance Payment',
  };

  /** Maps the backend numeric PaymentTerms enum to a readable label for display. */
  paymentTermsLabel(v: string | number | null | undefined): string {
    if (v === null || v === undefined || v === '') return '—';
    const n = typeof v === 'number' ? v : Number(v);
    return this.paymentTermsLabels[n] ?? String(v);
  }

  private blankLine(): CreateQuotationLineDto {
    return { productId: '', productName: null, productCode: null, quantity: 1, unitPrice: 0, discountPercentage: 0 };
  }

  onItemSelect(itemId: string) {
    const item = this.inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    this.newLine.productId = itemId;
    this.newLine.productName = item.name ?? null;
    this.newLine.productCode = item.code ?? null;
    const price = item.prices?.find((p: any) => p.isActive);
    if (price) this.newLine.unitPrice = price.salePrice;
    this.fetchStock(itemId);
  }

  addLine() {
    if (!this.newLine.productId) { this.error = 'Select an item.'; return; }
    if (this.newLine.quantity <= 0) { this.error = 'Quantity must be > 0.'; return; }
    if (this.isOverStock(this.newLine.productId, this.newLine.quantity)) {
      this.error = `Only ${this.availableFor(this.newLine.productId)} unit(s) available for this item.`;
      return;
    }
    this.error = '';
    this.form.lines.push({ ...this.newLine });
    this.newLine = this.blankLine();
  }

  removeLine(i: number) {
    this.form.lines.splice(i, 1);
  }

  lineTotal(line: CreateQuotationLineDto): number {
    const base = line.quantity * line.unitPrice;
    return base - (base * (line.discountPercentage ?? 0) / 100);
  }

  get formTotal(): number {
    return this.form.lines.reduce((s, l) => s + this.lineTotal(l), 0);
  }

  itemName(id: string): string {
    return this.inventoryItems.find(i => i.id === id)?.name ?? id;
  }

  saveQuotation() {
    const validationError = this.validateForm();
    if (validationError) { this.error = validationError; return; }
    const contact = this.contacts.find(c => c.id === this.form.contactId)!;
    this.saving = true;
    this.error = '';
    const dto: CreateQuotationDto = {
      ...this.form,
      contactId: this.form.contactId || null,
      contactName: this.contactDisplayName(contact),
      quotationName: this.form.quotationName || null,
      validUntil: this.form.validUntil || null,
      priceListId: this.form.priceListId || null,
      // CurrencyCode is required on the backend — always send a valid code.
      currencyCode: this.form.currencyCode || QuotationsComponent.DEFAULT_CURRENCY,
      // Non-nullable backend enum — send the selected int, defaulting to Net30 (= 2).
      paymentTerms: this.form.paymentTerms ?? 2,
      notes: this.form.notes || null,
    };
    this.quotationService.create(dto).subscribe({
      next: (res) => {
        this.successMsg = 'Quotation created.';
        this.showForm = false;
        this.saving = false;
        this.load();
        this.highlighter.flash(res.data?.id, this.cdr);
      },
      error: () => {
        this.error = 'Failed to create quotation.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  viewQuotation(q: QuotationDto) {
    this.selectedQuotation = q;
    this.showForm = false;
  }

  closeDetail() {
    this.selectedQuotation = null;
  }

  sendQuotation(id: string) {
    this.error = '';
    this.quotationService.send(id).subscribe({
      next: () => { this.successMsg = 'Quotation sent.'; this.load(); },
      error: () => { this.error = 'Failed to send quotation.'; this.cdr.detectChanges(); },
    });
  }

  acceptQuotation(id: string) {
    this.error = '';
    this.quotationService.accept(id).subscribe({
      next: () => { this.successMsg = 'Quotation accepted.'; this.closeDetail(); this.load(); },
      error: () => { this.error = 'Failed to accept quotation.'; this.cdr.detectChanges(); },
    });
  }

  deleteQuotation(id: string) {
    if (!confirm('Delete this quotation?')) return;
    this.quotationService.delete(id).subscribe({
      next: () => { this.successMsg = 'Quotation deleted.'; this.closeDetail(); this.load(); },
      error: () => { this.error = 'Failed to delete quotation.'; this.cdr.detectChanges(); },
    });
  }

  badgeClass(status: QuotationStatus | number | string): string {
    return `badge badge-${this.normStatus(status).toLowerCase()}`;
  }
}
