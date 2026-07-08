import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { concat, Observable } from 'rxjs';
import { toArray } from 'rxjs/operators';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { VendorService } from '../../services/vendor.service';
import { VendorCategoryService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import {
  VendorDto, CreateVendorDto, UpdateVendorDto, BlockVendorDto,
  VendorContactDto, VendorAddressDto, VendorBankAccountDto,
  VendorStatus, VendorType, VendorAddressType, VendorOnboardingStatus, PaymentTerms,
  VENDOR_STATUS_LABELS, VENDOR_TYPE_LABELS, PAYMENT_TERMS_LABELS,
  VENDOR_ADDRESS_TYPE_LABELS, VENDOR_ONBOARDING_LABELS,
} from '../../models/vendor.model';
import {
  CURRENCY_OPTIONS, enumOptions,
  requiredText, emailFormat, urlFormat, nonNegativeNumber,
} from '../../models/procurement-constants';

type FormTab = 'basic' | 'contacts' | 'addresses' | 'bankAccounts';

@Component({
  selector: 'lib-supplier-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.css',
})
export class SupplierList implements OnInit {
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  // Filters
  search = '';
  statusFilter: number | '' = '';

  // Pagination / sorting
  page = 1;
  pageSize = 10;
  totalCount = 0;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchDebounce?: ReturnType<typeof setTimeout>;

  // Form state
  showForm = false;
  editingVendor: VendorDto | null = null;
  formTab: FormTab = 'basic';
  submitted = false;
  saving = false;

  // Block / delete modals
  showBlockModal = false;
  blockTargetId = '';
  blockReason = '';
  blockSubmitted = false;

  showDeleteConfirm = false;
  deleteTarget: VendorDto | null = null;

  highlighter = new RowHighlighter();

  // Basic fields
  form = {
    name: '', shortName: '', type: VendorType.Company as number,
    taxRegNumber: '', companyRegNumber: '', vatNumber: '', website: '',
    vendorCategoryId: '', email: '', phone: '', mobile: '',
    currencyCode: 'PKR', paymentTerms: PaymentTerms.Net30 as number,
    leadTimeDays: 7 as number | null, creditLimit: 0 as number | null,
    isPreferred: false, notes: '', internalNotes: '',
  };

  // Nested collections
  formContacts: VendorContactDto[] = [];
  newContact: Partial<VendorContactDto> = { isPrimary: false };
  formAddresses: VendorAddressDto[] = [];
  newAddress: Partial<VendorAddressDto> = { addressType: VendorAddressType.Billing, isDefault: false };
  formBankAccounts: VendorBankAccountDto[] = [];
  newBankAccount: Partial<VendorBankAccountDto> = { currencyCode: 'PKR', isDefault: false, isActive: true };

  // Dropdown option sets
  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  readonly vendorTypeOptions = enumOptions(VENDOR_TYPE_LABELS);
  readonly paymentTermOptions = enumOptions(PAYMENT_TERMS_LABELS);
  readonly addressTypeOptions = enumOptions(VENDOR_ADDRESS_TYPE_LABELS);
  readonly statusFilterOptions: SelectOption[] = enumOptions(VENDOR_STATUS_LABELS);
  categoryOptions: SelectOption[] = [];

  // Table config
  readonly columns: TableColumn[] = [
    { key: 'vendorNumber', label: 'Vendor #', width: '110px' },
    { key: 'name', label: 'Name' },
    { key: 'vendorCategoryName', label: 'Category', format: (v, row) => v ?? this.categoryNameById(row.vendorCategoryId) },
    { key: 'type', label: 'Type', format: (v) => VENDOR_TYPE_LABELS[v as VendorType] ?? String(v) },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadgeClass(v), format: (v) => VENDOR_STATUS_LABELS[v as VendorStatus] ?? String(v) },
    { key: 'onboardingStatus', label: 'Onboarding', align: 'center',
      format: (v) => VENDOR_ONBOARDING_LABELS[v as VendorOnboardingStatus] ?? String(v) },
    { key: 'primaryEmail', label: 'Email', format: (v) => v ?? '—' },
    { key: 'paymentTerms', label: 'Payment Terms', format: (v) => PAYMENT_TERMS_LABELS[v as PaymentTerms] ?? String(v) },
    { key: 'isPreferredVendor', label: 'Preferred', type: 'badge', align: 'center',
      badgeClass: (v) => (v ? 'badge-yes' : 'badge-no'), format: (v) => (v ? 'Yes' : 'No') },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️' },
    { eventName: 'approve', label: 'Approve', icon: '✓', variant: 'primary',
      visible: (r: VendorDto) => r.status === VendorStatus.PendingApproval },
    { eventName: 'block', label: 'Block', icon: '⛔',
      visible: (r: VendorDto) => !r.isBlocked && r.status === VendorStatus.Active },
    { eventName: 'unblock', label: 'Unblock', icon: '↻',
      visible: (r: VendorDto) => r.isBlocked },
    { eventName: 'deactivate', label: 'Deactivate', icon: '⏸️',
      visible: (r: VendorDto) => r.status === VendorStatus.Active && !r.isBlocked },
    { eventName: 'reactivate', label: 'Reactivate', icon: '▶️',
      visible: (r: VendorDto) => r.status === VendorStatus.Inactive },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger',
      visible: (r: VendorDto) => r.status === VendorStatus.PendingApproval || r.status === VendorStatus.Inactive },
  ];

  constructor(
    private service: VendorService,
    private categoryService: VendorCategoryService,
    private currencyService: CurrencyLookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadCategories();
    this.currencyService.getOptions().subscribe(opts => { this.currencyOptions = opts; this.cdr.detectChanges(); });
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page,
      pageSize: this.pageSize,
      searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter),
      sortBy: this.sortBy || undefined,
      sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => {
        this.vendors = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? this.vendors.length;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load vendors'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load(); }

  loadCategories(): void {
    this.categoryService.getActive().subscribe({
      next: (res) => {
        this.categoryOptions = (res.data ?? []).map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }));
        this.cdr.detectChanges();
      },
      error: () => { /* category dropdown stays empty; not fatal */ },
    });
  }

  statusBadgeClass(s: VendorStatus): string {
    switch (s) {
      case VendorStatus.Active: return 'badge-active';
      case VendorStatus.Blocked: return 'badge-blocked';
      case VendorStatus.PendingApproval: return 'badge-pending';
      case VendorStatus.Inactive: return 'badge-inactive';
      default: return 'badge-no';
    }
  }

  // ── Form open / close ─────────────────────────────────────────────────────────
  openCreateForm(): void {
    this.editingVendor = null;
    this.resetForm();
    this.formTab = 'basic';
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEditForm(vendor: VendorDto): void {
    this.editingVendor = vendor;
    this.populateForm(vendor);
    this.newContact = { isPrimary: false };
    this.newAddress = { addressType: VendorAddressType.Billing, isDefault: false };
    this.newBankAccount = { currencyCode: 'PKR', isDefault: false, isActive: true };
    this.formTab = 'basic';
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';

    // The list endpoint returns vendors without their nested collections, so fetch
    // the full record to populate the Contacts / Addresses / Bank Accounts tabs.
    this.service.getById(vendor.id).subscribe({
      next: (res) => {
        if (res.data) { this.editingVendor = res.data; this.populateForm(res.data); this.cdr.detectChanges(); }
      },
    });
  }

  private populateForm(vendor: VendorDto): void {
    this.form = {
      name: vendor.name,
      shortName: vendor.shortName ?? '',
      type: vendor.type,
      taxRegNumber: vendor.taxRegistrationNumber ?? '',
      companyRegNumber: vendor.companyRegistrationNumber ?? '',
      vatNumber: vendor.vatNumber ?? '',
      website: vendor.website ?? '',
      vendorCategoryId: vendor.vendorCategoryId ?? '',
      email: vendor.primaryEmail ?? '',
      phone: vendor.primaryPhone ?? '',
      mobile: vendor.primaryMobile ?? '',
      currencyCode: vendor.currencyCode,
      paymentTerms: vendor.paymentTerms,
      leadTimeDays: vendor.leadTimeDays,
      creditLimit: vendor.creditLimit,
      isPreferred: vendor.isPreferredVendor,
      notes: vendor.notes ?? '',
      internalNotes: vendor.internalNotes ?? '',
    };
    this.formContacts = [...(vendor.contacts ?? [])];
    this.formAddresses = [...(vendor.addresses ?? [])];
    this.formBankAccounts = [...(vendor.bankAccounts ?? [])];
  }

  cancelForm(): void { this.showForm = false; this.editingVendor = null; this.resetForm(); }

  resetForm(): void {
    this.form = {
      name: '', shortName: '', type: VendorType.Company,
      taxRegNumber: '', companyRegNumber: '', vatNumber: '', website: '',
      vendorCategoryId: '', email: '', phone: '', mobile: '',
      currencyCode: 'PKR', paymentTerms: PaymentTerms.Net30,
      leadTimeDays: 7, creditLimit: 0, isPreferred: false, notes: '', internalNotes: '',
    };
    this.formContacts = []; this.formAddresses = []; this.formBankAccounts = [];
    this.newContact = { isPrimary: false };
    this.newAddress = { addressType: VendorAddressType.Billing, isDefault: false };
    this.newBankAccount = { currencyCode: 'PKR', isDefault: false, isActive: true };
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  get errors() {
    return {
      name: requiredText(this.form.name, 'Vendor name'),
      email: emailFormat(this.form.email),
      website: urlFormat(this.form.website),
      leadTimeDays: nonNegativeNumber(this.form.leadTimeDays, 'Lead time'),
      creditLimit: nonNegativeNumber(this.form.creditLimit, 'Credit limit'),
    };
  }

  get isValid(): boolean {
    const e = this.errors;
    return !e.name && !e.email && !e.website && !e.leadTimeDays && !e.creditLimit;
  }

  saveVendor(): void {
    this.submitted = true;
    if (!this.isValid) {
      this.error = 'Please correct the highlighted fields.';
      this.formTab = 'basic';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    this.saving = true;

    const dto: CreateVendorDto & UpdateVendorDto = {
      name: this.form.name.trim(),
      shortName: this.form.shortName.trim() || undefined,
      type: Number(this.form.type) as VendorType,
      taxRegistrationNumber: this.form.taxRegNumber.trim() || undefined,
      companyRegistrationNumber: this.form.companyRegNumber.trim() || undefined,
      vatNumber: this.form.vatNumber.trim() || undefined,
      website: this.form.website.trim() || undefined,
      vendorCategoryId: this.form.vendorCategoryId || undefined,
      primaryEmail: this.form.email.trim() || undefined,
      primaryPhone: this.form.phone.trim() || undefined,
      primaryMobile: this.form.mobile.trim() || undefined,
      currencyCode: this.form.currencyCode || 'PKR',
      paymentTerms: Number(this.form.paymentTerms) as PaymentTerms,
      leadTimeDays: Number(this.form.leadTimeDays ?? 0),
      creditLimit: Number(this.form.creditLimit ?? 0),
      isPreferredVendor: this.form.isPreferred,
      notes: this.form.notes.trim() || undefined,
      internalNotes: this.form.internalNotes.trim() || undefined,
    };

    if (this.editingVendor) {
      this.service.update(this.editingVendor.id, dto).subscribe({
        next: () => { this.saving = false; this.success = 'Vendor updated'; this.showForm = false; this.load(); },
        error: (err) => { this.saving = false; this.error = err?.error?.message ?? 'Failed to update vendor'; this.cdr.detectChanges(); },
      });
    } else {
      this.service.create(dto as CreateVendorDto).subscribe({
        next: (res) => {
          this.saving = false;
          this.success = 'Vendor created';
          this.showForm = false;
          this.page = 1;
          if (res.data) this.saveStagedChildren(res.data.id);
          else this.load();
          this.highlighter.flash(res.data?.id, this.cdr);
        },
        error: (err) => { this.saving = false; this.error = err?.error?.message ?? 'Failed to create vendor'; this.cdr.detectChanges(); },
      });
    }
  }

  private saveStagedChildren(vendorId: string): void {
    // Save sequentially (concat) — each call reloads & saves the vendor aggregate, so
    // running them in parallel causes RowVersion concurrency conflicts that drop rows.
    const ops: Observable<unknown>[] = [
      ...this.formContacts.map(c => this.service.addContact(vendorId, c)),
      ...this.formAddresses.map(a => this.service.addAddress(vendorId, a)),
      ...this.formBankAccounts.map(b => this.service.addBankAccount(vendorId, b)),
    ];
    if (!ops.length) { this.load(); return; }
    concat(...ops).pipe(toArray()).subscribe({
      next: () => { this.load(); },
      error: () => {
        this.error = 'Vendor created, but some contacts/addresses/bank accounts failed to save. Edit the vendor to re-add them.';
        this.load();
        this.cdr.detectChanges();
      },
    });
  }

  /** Resolves a category display label from the loaded categories (the list endpoint omits the name). */
  categoryNameById(id?: string): string {
    if (!id) return '—';
    return this.categoryOptions.find(o => o.value === id)?.label ?? '—';
  }

  /** Joins the populated parts of an address into a single summary line. */
  addressSummary(a: VendorAddressDto): string {
    return [a.street, a.city, a.state, a.postalCode, a.country].filter(p => !!p).join(', ');
  }

  // ── Contacts ──────────────────────────────────────────────────────────────────
  addContact(): void {
    if (!this.newContact.firstName?.trim()) { this.error = 'Contact first name is required.'; return; }
    if (this.newContact.email && emailFormat(this.newContact.email)) { this.error = 'Contact email is invalid.'; return; }
    this.error = '';
    const c = { ...this.newContact, isPrimary: !!this.newContact.isPrimary } as VendorContactDto;
    if (this.editingVendor) {
      this.service.addContact(this.editingVendor.id, c).subscribe({
        next: (res) => {
          if (res.data) {
            if (res.data.isPrimary) this.formContacts.forEach(x => x.isPrimary = false);
            this.formContacts.push(res.data);
          }
          this.newContact = { isPrimary: false };
          this.cdr.detectChanges();
        },
        error: () => { this.error = 'Failed to add contact'; this.cdr.detectChanges(); },
      });
    } else {
      // First contact is primary by default; only one may be primary.
      const makePrimary = c.isPrimary || this.formContacts.length === 0;
      if (makePrimary) this.formContacts.forEach(x => x.isPrimary = false);
      c.isPrimary = makePrimary;
      this.formContacts.push(c);
      this.newContact = { isPrimary: false };
    }
  }

  removeContact(i: number): void {
    const c = this.formContacts[i];
    if (this.editingVendor && c.id) {
      this.service.deleteContact(this.editingVendor.id, c.id).subscribe({
        next: () => { this.formContacts.splice(i, 1); this.cdr.detectChanges(); },
        error: () => { this.error = 'Failed to remove contact'; this.cdr.detectChanges(); },
      });
    } else { this.formContacts.splice(i, 1); }
  }

  // ── Addresses ───────────────────────────────────────────────────────────────
  addAddress(): void {
    if (!this.newAddress.street?.trim() && !this.newAddress.city?.trim()) { this.error = 'Provide at least a street or city.'; return; }
    this.error = '';
    const a = {
      ...this.newAddress,
      addressType: Number(this.newAddress.addressType ?? VendorAddressType.Billing),
      isDefault: !!this.newAddress.isDefault,
    } as VendorAddressDto;
    if (this.editingVendor) {
      this.service.addAddress(this.editingVendor.id, a).subscribe({
        next: (res) => {
          if (res.data) {
            if (res.data.isDefault) this.formAddresses.forEach(x => { if (x.addressType === res.data!.addressType) x.isDefault = false; });
            this.formAddresses.push(res.data);
          }
          this.newAddress = { addressType: VendorAddressType.Billing, isDefault: false };
          this.cdr.detectChanges();
        },
        error: () => { this.error = 'Failed to add address'; this.cdr.detectChanges(); },
      });
    } else {
      // First address of a type is the default; only one default per type.
      const makeDefault = a.isDefault || !this.formAddresses.some(x => x.addressType === a.addressType);
      if (makeDefault) this.formAddresses.forEach(x => { if (x.addressType === a.addressType) x.isDefault = false; });
      a.isDefault = makeDefault;
      this.formAddresses.push(a);
      this.newAddress = { addressType: VendorAddressType.Billing, isDefault: false };
    }
  }

  removeAddress(i: number): void {
    const a = this.formAddresses[i];
    if (this.editingVendor && a.id) {
      this.service.deleteAddress(this.editingVendor.id, a.id).subscribe({
        next: () => { this.formAddresses.splice(i, 1); this.cdr.detectChanges(); },
        error: () => { this.error = 'Failed to remove address'; this.cdr.detectChanges(); },
      });
    } else { this.formAddresses.splice(i, 1); }
  }

  // ── Bank Accounts ─────────────────────────────────────────────────────────────
  addBankAccount(): void {
    if (!this.newBankAccount.accountName?.trim() || !this.newBankAccount.accountNumber?.trim()) {
      this.error = 'Bank account name and number are required.'; return;
    }
    this.error = '';
    const b = {
      ...this.newBankAccount,
      isDefault: !!this.newBankAccount.isDefault,
      isActive: this.newBankAccount.isActive ?? true,
      currencyCode: this.newBankAccount.currencyCode || 'PKR',
    } as VendorBankAccountDto;
    if (this.editingVendor) {
      this.service.addBankAccount(this.editingVendor.id, b).subscribe({
        next: (res) => {
          if (res.data) {
            if (res.data.isDefault) this.formBankAccounts.forEach(x => x.isDefault = false);
            this.formBankAccounts.push(res.data);
          }
          this.newBankAccount = { currencyCode: 'PKR', isDefault: false, isActive: true };
          this.cdr.detectChanges();
        },
        error: () => { this.error = 'Failed to add bank account'; this.cdr.detectChanges(); },
      });
    } else {
      // First bank account is the default; only one default at a time.
      const makeDefault = b.isDefault || this.formBankAccounts.length === 0;
      if (makeDefault) this.formBankAccounts.forEach(x => x.isDefault = false);
      b.isDefault = makeDefault;
      this.formBankAccounts.push(b);
      this.newBankAccount = { currencyCode: 'PKR', isDefault: false, isActive: true };
    }
  }

  removeBankAccount(i: number): void {
    const b = this.formBankAccounts[i];
    if (this.editingVendor && b.id) {
      this.service.deleteBankAccount(this.editingVendor.id, b.id).subscribe({
        next: () => { this.formBankAccounts.splice(i, 1); this.cdr.detectChanges(); },
        error: () => { this.error = 'Failed to remove bank account'; this.cdr.detectChanges(); },
      });
    } else { this.formBankAccounts.splice(i, 1); }
  }

  // ── Row actions / lifecycle ───────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<VendorDto>): void {
    switch (e.eventName) {
      case 'edit': this.openEditForm(e.row); break;
      case 'approve': this.approve(e.row); break;
      case 'deactivate': this.deactivate(e.row); break;
      case 'reactivate': this.reactivate(e.row); break;
      case 'block': this.openBlockModal(e.row); break;
      case 'unblock': this.unblock(e.row); break;
      case 'delete': this.openDeleteConfirm(e.row); break;
    }
  }

  approve(vendor: VendorDto): void {
    this.service.approve(vendor.id).subscribe({
      next: () => { this.success = 'Vendor approved'; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to approve vendor'; this.cdr.detectChanges(); },
    });
  }

  deactivate(vendor: VendorDto): void {
    this.service.deactivate(vendor.id).subscribe({
      next: () => { this.success = 'Vendor deactivated'; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to deactivate vendor'; this.cdr.detectChanges(); },
    });
  }

  reactivate(vendor: VendorDto): void {
    this.service.reactivate(vendor.id).subscribe({
      next: () => { this.success = 'Vendor reactivated'; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to reactivate vendor'; this.cdr.detectChanges(); },
    });
  }

  openBlockModal(vendor: VendorDto): void {
    this.blockTargetId = vendor.id;
    this.blockReason = '';
    this.blockSubmitted = false;
    this.showBlockModal = true;
  }

  confirmBlock(): void {
    this.blockSubmitted = true;
    if (!this.blockReason.trim()) { this.cdr.detectChanges(); return; }
    const dto: BlockVendorDto = { blockReason: this.blockReason.trim() };
    this.service.block(this.blockTargetId, dto).subscribe({
      next: () => { this.success = 'Vendor blocked'; this.showBlockModal = false; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to block vendor'; this.showBlockModal = false; this.cdr.detectChanges(); },
    });
  }

  unblock(vendor: VendorDto): void {
    this.service.unblock(vendor.id).subscribe({
      next: () => { this.success = 'Vendor unblocked'; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to unblock vendor'; this.cdr.detectChanges(); },
    });
  }

  openDeleteConfirm(vendor: VendorDto): void { this.deleteTarget = vendor; this.showDeleteConfirm = true; }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Vendor deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to delete vendor'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }

  addressTypeLabel(t: VendorAddressType): string { return VENDOR_ADDRESS_TYPE_LABELS[t] ?? String(t); }
}
