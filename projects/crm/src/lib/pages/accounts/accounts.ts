import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { AccountDto, CreateAccountDto, UpdateAccountDto } from '../../models/account.model';
import { CrmLookupService } from '../../services/crm-lookup.service';
import { CrmLookupItemDto } from '../../models/crm-lookup.model';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';
import { GeoService, CountryDto } from '@nexcore/core';

type SelectOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'lib-accounts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LookupDropdownComponent],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class AccountsComponent implements OnInit {
  accounts: AccountDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingAccount: AccountDto | null = null;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [10, 25, 50, 100];
  searchTerm      = '';

  private get _sortedAccounts(): AccountDto[] {
    return [...this.accounts].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  private get _searchFiltered(): AccountDto[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this._sortedAccounts;
    return this._sortedAccounts.filter(a =>
      `${a.accountName ?? ''} ${a.type ?? ''} ${a.industry ?? ''} ${a.phone ?? ''} ${a.billingCity ?? ''} ${a.billingCountry ?? ''}`.toLowerCase().includes(q)
    );
  }

  get totalCount(): number { return this._searchFiltered.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize))); }
  get firstEntry(): number { return this.totalCount === 0 ? 0 : (this.page - 1) * Number(this.pageSize) + 1; }
  get lastEntry():  number { return Math.min(this.page * Number(this.pageSize), this.totalCount); }

  get filteredAccounts(): AccountDto[] {
    const start = (this.page - 1) * Number(this.pageSize);
    return this._searchFiltered.slice(start, start + Number(this.pageSize));
  }

  formAccountName = '';
  formType = '';
  formIndustry = '';
  formPhone = '';
  formWebsite = '';
  formParentAccountId = '';
  formBillingCity = '';
  formBillingCountry = '';
  formBillingStreet = '';
  formBillingPostalCode = '';
  formBillingState = '';
  formShippingCountry = '';
  formShippingStreet = '';
  formShippingCity = '';
  formShippingPostalCode = '';
  formShippingState = '';
  formDescription = '';

  accountTypeOptions: SelectOption[] = [];
  countryOptions: SelectOption[] = [];
  billingStateOptions: SelectOption[] = [];
  shippingStateOptions: SelectOption[] = [];
  allAccounts: AccountDto[] = [];
  phoneDialCode = '';
  private _countriesData: CountryDto[] = [];

  constructor(
    private accountService: AccountService,
    private crmLookupService: CrmLookupService,
    private cdr: ChangeDetectorRef,
    private geoService: GeoService,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadAccounts();
    this.loadAllAccountsForPicker();
  }

  loadLookups() {
    this.crmLookupService.getAccountTypes().subscribe({
      next: (res) => {
        const options = this.mapLookupItemsToOptions(res.data);
        if (options.length > 0) this.accountTypeOptions = options;
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.geoService.getCountries().subscribe(countries => {
      this._countriesData = countries.filter(c => c.isActive);
      this.countryOptions = this._countriesData.map(c => ({ value: c.code!, label: c.name! }));
      this.cdr.detectChanges();
    });
  }

  get phoneDisplayValue(): string {
    if (this.phoneDialCode && this.formPhone.startsWith(this.phoneDialCode)) {
      return this.formPhone.slice(this.phoneDialCode.length).replace(/^\s/, '');
    }
    return this.formPhone;
  }

  readonly phoneNumberMax = 15;
  readonly cityMax = 100;
  readonly addressMax = 250;

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^\d\s\-()+.]/g, '').slice(0, 15);
    if (filtered !== input.value) {
      input.value = filtered;
    }
    this.formPhone = this.phoneDialCode
      ? `${this.phoneDialCode}${filtered ? ' ' + filtered : ''}`
      : filtered;
  }

  onBillingCountryChange(code: string) {
    this.billingStateOptions = [];
    this.formBillingState = '';

    if (code) {
      const country = this._countriesData.find(c => c.code === code);
      const rawCode = (country?.phoneCode ?? '').replace(/^\+/, '');
      const newDialCode = rawCode ? `+${rawCode}` : '';

      const prevFull = this.formPhone.trim();
      let existingNumber = '';
      if (this.phoneDialCode && prevFull.startsWith(this.phoneDialCode)) {
        existingNumber = prevFull.slice(this.phoneDialCode.length).replace(/^\s/, '');
      }

      this.phoneDialCode = newDialCode;
      this.formPhone = newDialCode + (existingNumber ? ` ${existingNumber}` : '');

      this.geoService.getSubdivisions(code).subscribe(subs => {
        this.billingStateOptions = subs
          .filter(s => s.isActive)
          .map(s => ({ value: s.code!, label: s.name! }));
        this.cdr.detectChanges();
      });
    } else {
      this.phoneDialCode = '';
      this.formPhone = '';
    }
  }

  onShippingCountryChange(code: string) {
    this.shippingStateOptions = [];
    this.formShippingState = '';
    if (code) {
      this.geoService.getSubdivisions(code).subscribe(subs => {
        this.shippingStateOptions = subs
          .filter(s => s.isActive)
          .map(s => ({ value: s.code!, label: s.name! }));
        this.cdr.detectChanges();
      });
    }
  }

  private mapLookupItemsToOptions(items: CrmLookupItemDto[] | null | undefined): SelectOption[] {
    return (items ?? [])
      .filter((item): item is CrmLookupItemDto => !!item)
      .map((item) => ({
        value: (item.value ?? item.label ?? '').trim(),
        label: (item.label ?? item.value ?? '').trim(),
      }))
      .filter((item) => item.value.length > 0 && item.label.length > 0);
  }

  loadAllAccountsForPicker() {
    this.accountService.getAll({ page: 1, pageSize: 1000 }).subscribe({
      next: (res) => {
        this.allAccounts = res.data ?? [];
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  get parentAccountSelectOptions(): SelectOption[] {
    return this.allAccounts
      .filter((a) => a.id !== this.editingAccount?.id)
      .map((a) => ({ value: a.id, label: a.accountName || 'Untitled Account' }));
  }

  loadAccounts() {
    this.loading = true;
    this.error = '';
    this.accountService.getAll({ pageSize: 10000 }).subscribe({
      next: (res) => {
        this.accounts = res.data ?? [];
        this.loading  = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Failed to load accounts';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.cdr.detectChanges();
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.page = 1;
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.page = 1;
    this.cdr.detectChanges();
  }

  openCreateForm() {
    this.editingAccount = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(account: AccountDto) {
    this.editingAccount = account;
    this.billingStateOptions = [];
    this.shippingStateOptions = [];
    this.formAccountName = account.accountName ?? '';
    this.formType = account.type ?? '';
    this.formIndustry = account.industry ?? '';
    this.formPhone = account.phone ?? '';
    this.formWebsite = account.website ?? '';
    this.formParentAccountId = account.parentAccountId ?? '';
    this.formBillingCity = account.billingCity ?? '';
    this.formBillingCountry = account.billingCountry ?? '';
    this.formBillingStreet = account.billingStreet ?? '';
    this.formBillingPostalCode = account.billingPostalCode ?? '';
    this.formShippingCountry = account.shippingCountry ?? '';
    this.formShippingStreet = account.shippingStreet ?? '';
    this.formShippingCity = account.shippingCity ?? '';
    this.formShippingPostalCode = account.shippingPostalCode ?? '';
    this.formDescription = account.description ?? '';

    if (account.billingCountry) {
      const country = this._countriesData.find(c => c.code === account.billingCountry);
      const rawCode = (country?.phoneCode ?? '').replace(/^\+/, '');
      this.phoneDialCode = rawCode ? `+${rawCode}` : '';
      this.geoService.getSubdivisions(account.billingCountry).subscribe(subs => {
        this.billingStateOptions = subs
          .filter(s => s.isActive)
          .map(s => ({ value: s.code!, label: s.name! }));
        this.formBillingState = account.billingState ?? '';
        this.cdr.detectChanges();
      });
    } else {
      this.formBillingState = account.billingState ?? '';
    }

    if (account.shippingCountry) {
      this.geoService.getSubdivisions(account.shippingCountry).subscribe(subs => {
        this.shippingStateOptions = subs
          .filter(s => s.isActive)
          .map(s => ({ value: s.code!, label: s.name! }));
        this.formShippingState = account.shippingState ?? '';
        this.cdr.detectChanges();
      });
    } else {
      this.formShippingState = account.shippingState ?? '';
    }

    this.showForm = true;
  }

  resetForm() {
    this.billingStateOptions = [];
    this.shippingStateOptions = [];
    this.phoneDialCode = '';
    this.formAccountName = '';
    this.formType = '';
    this.formIndustry = '';
    this.formPhone = '';
    this.formWebsite = '';
    this.formParentAccountId = '';
    this.formBillingCity = '';
    this.formBillingCountry = '';
    this.formBillingStreet = '';
    this.formBillingPostalCode = '';
    this.formBillingState = '';
    this.formShippingCountry = '';
    this.formShippingStreet = '';
    this.formShippingCity = '';
    this.formShippingPostalCode = '';
    this.formShippingState = '';
    this.formDescription = '';
  }

  cancelForm() {
    this.showForm = false;
    this.editingAccount = null;
    this.resetForm();
  }

  saveAccount() {
    if (this.editingAccount) {
      const dto: UpdateAccountDto = {
        accountName: this.formAccountName,
        type: this.formType,
        industry: this.formIndustry,
        phone: this.formPhone,
        website: this.formWebsite,
        parentAccountId: this.formParentAccountId || null,
        billingStreet: this.formBillingStreet,
        billingCity: this.formBillingCity,
        billingState: this.formBillingState,
        billingPostalCode: this.formBillingPostalCode,
        billingCountry: this.formBillingCountry,
        shippingCountry: this.formShippingCountry,
        shippingStreet: this.formShippingStreet,
        shippingCity: this.formShippingCity,
        shippingPostalCode: this.formShippingPostalCode,
        shippingState: this.formShippingState,
        description: this.formDescription,
      };
      this.accountService.update(this.editingAccount.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadAccounts(); },
        error: () => { this.error = 'Failed to update account'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateAccountDto = {
        accountName: this.formAccountName,
        type: this.formType,
        industry: this.formIndustry,
        phone: this.formPhone,
        website: this.formWebsite,
        parentAccountId: this.formParentAccountId || null,
        billingStreet: this.formBillingStreet,
        billingCity: this.formBillingCity,
        billingState: this.formBillingState,
        billingPostalCode: this.formBillingPostalCode,
        billingCountry: this.formBillingCountry,
        shippingCountry: this.formShippingCountry,
        shippingStreet: this.formShippingStreet,
        shippingCity: this.formShippingCity,
        shippingPostalCode: this.formShippingPostalCode,
        shippingState: this.formShippingState,
        description: this.formDescription,
      };
      this.accountService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadAccounts(); },
        error: () => { this.error = 'Failed to create account'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteAccount(id: string) {
    if (!confirm('Delete this account?')) return;
    this.accountService.delete(id).subscribe({
      next: () => this.loadAccounts(),
      error: () => { this.error = 'Failed to delete account'; this.cdr.detectChanges(); },
    });
  }
}
