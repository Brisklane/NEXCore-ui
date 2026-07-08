import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { startWith, Subscription } from 'rxjs';
import { AccountDto } from '../../models/account.model';
import { ContactDto, CreateContactDto, UpdateContactDto } from '../../models/contact.model';
import { AccountService } from '../../services/account.service';
import { ContactService } from '../../services/contact.service';
import { CrmLookupService } from '../../services/crm-lookup.service';
import { CrmLookupItemDto } from '../../models/crm-lookup.model';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';
import { GeoService, CountryDto } from '@nexcore/core';

type AccountLookupOption = {
  id: string;
  label: string;
};

type ContactLookupOption = {
  id: string;
  label: string;
};

const SALUTATION_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Mx.'];

const CITY_MAX = 100;
const ADDRESS_MAX = 250;
const PHONE_NUMBER_MAX = 15;
const CITY_PATTERN = /^[A-Za-z0-9À-É\s'\-.]*$/;

const MOCK_ACCOUNTS: AccountLookupOption[] = [
  { id: 'mock-account-1', label: 'Acme Ventures' },
  { id: 'mock-account-2', label: 'Northwind Traders' },
  { id: 'mock-account-3', label: 'Globex Corporation' },
  { id: 'mock-account-4', label: 'BluePeak Logistics' },
];

const MOCK_REPORT_TO_CONTACTS: ContactLookupOption[] = [
  { id: 'mock-contact-1', label: 'Naveed Ahmad' },
  { id: 'mock-contact-2', label: 'Sarah Khan' },
  { id: 'mock-contact-3', label: 'Daniel Roberts' },
  { id: 'mock-contact-4', label: 'Ayesha Malik' },
];

@Component({
  selector: 'lib-contacts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LookupDropdownComponent,
  ],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class ContactsComponent implements OnInit, OnDestroy {
  contacts: ContactDto[] = [];
  accounts: AccountDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingContact: ContactDto | null = null;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [10, 25, 50, 100];
  searchTerm      = '';

  private get _sortedContacts(): ContactDto[] {
    return [...this.contacts].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  private get _searchFiltered(): ContactDto[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this._sortedContacts;
    return this._sortedContacts.filter(c =>
      `${c.firstName ?? ''} ${c.lastName ?? ''} ${c.accountName ?? ''} ${c.email ?? ''} ${c.phone ?? ''}`.toLowerCase().includes(q)
    );
  }

  get totalCount(): number { return this._searchFiltered.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize))); }
  get firstEntry(): number { return this.totalCount === 0 ? 0 : (this.page - 1) * Number(this.pageSize) + 1; }
  get lastEntry():  number { return Math.min(this.page * Number(this.pageSize), this.totalCount); }

  get filteredContacts(): ContactDto[] {
    const start = (this.page - 1) * Number(this.pageSize);
    return this._searchFiltered.slice(start, start + Number(this.pageSize));
  }

  contactForm!: FormGroup;

  salutationOptions = SALUTATION_OPTIONS.map(s => ({ value: s, label: s }));
  countryOptions: Array<{ value: string; label: string }> = [];
  stateOptions: Array<{ value: string; label: string }> = [];
  phoneDialCode = '';
  readonly cityMax = CITY_MAX;
  readonly addressMax = ADDRESS_MAX;
  readonly phoneNumberMax = PHONE_NUMBER_MAX;

  private _countrySub?: Subscription;
  private _countriesData: CountryDto[] = [];

  get phoneDisplayValue(): string {
    const full = (this.contactForm.get('phone')?.value ?? '') as string;
    if (this.phoneDialCode && full.startsWith(this.phoneDialCode)) {
      return full.slice(this.phoneDialCode.length).replace(/^\s/, '');
    }
    return full;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^\d\s\-()+.]/g, '').slice(0, PHONE_NUMBER_MAX);
    if (filtered !== input.value) {
      input.value = filtered;
    }
    const full = this.phoneDialCode
      ? `${this.phoneDialCode}${filtered ? ' ' + filtered : ''}`
      : filtered;
    this.contactForm.get('phone')!.setValue(full, { emitEvent: false });
  }

  accountOptions: AccountLookupOption[] = [];
  filteredAccountOptions: AccountLookupOption[] = [];
  accountLookupOptions: Array<{ value: string; label: string }> = [];
  reportToOptions: ContactLookupOption[] = [];
  filteredReportToOptions: ContactLookupOption[] = [];

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private crmLookupService: CrmLookupService,
    private formBuilder: FormBuilder,
    private geoService: GeoService,
  ) {
    this.initializeForm();
    this.initializeAutocompleteFilters();
  }

  initializeForm() {
    this.contactForm = this.formBuilder.group({
      salutation: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      accountId: [null as string | null],
      title: [''],
      reportsToId: [null as string | null],
      reportsToSearch: [null as ContactLookupOption | string | null],
      description: [''],
      phone: [{ value: '', disabled: true }],
      email: ['', Validators.email],
      mailingCountry: [''],
      mailingStreet: ['', [Validators.maxLength(ADDRESS_MAX)]],
      mailingCity: ['', [Validators.maxLength(CITY_MAX), Validators.pattern(CITY_PATTERN)]],
      mailingPostalCode: [''],
      mailingState: [{ value: '', disabled: true }],
      emailOptOut: [false],
    });
  }

  initializeAutocompleteFilters() {
    this.contactForm
      .get('accountSearch')
      ?.valueChanges.pipe(startWith(''))
      .subscribe((value) => {
        const query = this.extractLookupQuery(value);
        this.filteredAccountOptions = this.filterLookupOptions(this.accountOptions, query);
        if (typeof value === 'string') {
          this.contactForm.patchValue({ accountId: null }, { emitEvent: false });
        }
      });

    this.contactForm
      .get('reportsToSearch')
      ?.valueChanges.pipe(startWith(''))
      .subscribe((value) => {
        const query = this.extractLookupQuery(value);
        this.filteredReportToOptions = this.filterLookupOptions(this.reportToOptions, query);
        if (typeof value === 'string') {
          this.contactForm.patchValue({ reportsToId: null }, { emitEvent: false });
        }
      });
  }

  ngOnInit() {
    this.loadGeoCountries();
    this.loadCrmLookups();
    this.loadAccounts();

    this._countrySub = this.contactForm.get('mailingCountry')!.valueChanges.subscribe(code => {
      this.stateOptions = [];
      const stateCtrl = this.contactForm.get('mailingState')!;
      const phoneCtrl = this.contactForm.get('phone')!;

      stateCtrl.setValue('', { emitEvent: false });

      if (code) {
        stateCtrl.enable({ emitEvent: false });

        const country = this._countriesData.find(c => c.code === code);
        const rawCode = (country?.phoneCode ?? '').replace(/^\+/, '');
        const newDialCode = rawCode ? `+${rawCode}` : '';

        const prevFull = (phoneCtrl.value ?? '').trim();
        let existingNumber = '';
        if (this.phoneDialCode && prevFull.startsWith(this.phoneDialCode)) {
          existingNumber = prevFull.slice(this.phoneDialCode.length).replace(/^\s/, '');
        }

        this.phoneDialCode = newDialCode;
        phoneCtrl.enable({ emitEvent: false });
        phoneCtrl.setValue(
          newDialCode + (existingNumber ? ` ${existingNumber}` : ''),
          { emitEvent: false },
        );

        this.geoService.getSubdivisions(code).subscribe(subs => {
          this.stateOptions = subs
            .filter(s => s.isActive)
            .map(s => ({ value: s.code!, label: s.name! }));
          this.cdr.detectChanges();
        });
      } else {
        stateCtrl.disable({ emitEvent: false });
        this.phoneDialCode = '';
        phoneCtrl.setValue('', { emitEvent: false });
        phoneCtrl.disable({ emitEvent: false });
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this._countrySub?.unsubscribe();
  }

  loadGeoCountries() {
    this.geoService.getCountries().subscribe(countries => {
      this._countriesData = countries.filter(c => c.isActive);
      this.countryOptions = this._countriesData.map(c => ({ value: c.code!, label: c.name! }));
      this.cdr.detectChanges();
    });
  }

  loadCrmLookups() {
    this.crmLookupService.getAll().subscribe({
      next: (res) => {
        const lookups = res.data;
        if (!lookups) return;
        const salutations = this.mapLookupItemsToStrings(lookups.salutations);
        if (salutations.length > 0) this.salutationOptions = salutations.map(s => ({ value: s, label: s }));
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  private mapLookupItemsToStrings(items: CrmLookupItemDto[] | null | undefined): string[] {
    return (items ?? [])
      .filter((item): item is CrmLookupItemDto => !!item)
      .map((item) => (item.label ?? item.value ?? '').trim())
      .filter((value) => value.length > 0);
  }

  loadContacts() {
    this.loading = true;
    this.error = '';
    this.contactService.getAll({ pageSize: 10000 }).subscribe({
      next: (res) => {
        this.contacts   = this.enrichContactsWithAccountNames(res.data ?? []);
        this.reportToOptions = this.buildReportToOptions(this.contacts);
        this.filteredReportToOptions = [...this.reportToOptions];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load contacts';
        this.reportToOptions = this.buildMockReportToOptions();
        this.filteredReportToOptions = [...this.reportToOptions];
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

  enrichContactsWithAccountNames(contacts: ContactDto[]): ContactDto[] {
    return contacts.map((contact) => {
      if (contact.accountId && !contact.accountName) {
        const account = this.accounts.find((a) => a.id === contact.accountId);
        if (account) {
          return {
            ...contact,
            accountName: account.accountName || null,
          };
        }
      }
      return contact;
    });
  }

  loadAccounts() {
    this.accountService.getAll({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.accounts = res.data ?? [];
        this.accountOptions = this.accounts
          .filter((account) => account.accountName)
          .map((account) => ({
            id: account.id,
            label: account.accountName?.trim() || 'Untitled Account',
          }));
        this.filteredAccountOptions = [...this.accountOptions];
        this.accountLookupOptions = this.accountOptions.map(a => ({ value: a.id, label: a.label }));
        // After accounts are loaded, load contacts so they can be enriched with account names
        this.loadContacts();
        this.cdr.detectChanges();
      },
      error: () => {
        this.accountOptions = [...MOCK_ACCOUNTS];
        this.filteredAccountOptions = [...this.accountOptions];
        this.accountLookupOptions = this.accountOptions.map(a => ({ value: a.id, label: a.label }));
        // Even if accounts fail to load, still load contacts with mock fallback
        this.loadContacts();
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingContact = null;
    this.resetForm();
    this.reportToOptions = this.buildReportToOptions(this.contacts);
    this.filteredReportToOptions = [...this.reportToOptions];
    this.showForm = true;
  }

  openEditForm(contact: ContactDto) {
    this.editingContact = contact;
    this.stateOptions = [];
    this.reportToOptions = this.buildReportToOptions(this.contacts, contact.id);
    this.filteredReportToOptions = [...this.reportToOptions];
    const reportToOption = this.findReportToOption(contact.reportsToId);

    this.contactForm.patchValue({
      salutation: contact.salutation ?? '',
      firstName: contact.firstName ?? '',
      lastName: contact.lastName ?? '',
      accountId: contact.accountId ?? null,
      title: contact.title ?? '',
      reportsToId: contact.reportsToId ?? null,
      reportsToSearch: reportToOption ?? this.resolveReportToLabel(contact.reportsToId),
      description: contact.description ?? '',
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      mailingCountry: contact.mailingCountry ?? '',
      mailingStreet: contact.mailingStreet ?? '',
      mailingCity: contact.mailingCity ?? '',
      mailingPostalCode: contact.mailingPostalCode ?? '',
      mailingState: contact.mailingState ?? '',
      emailOptOut: contact.emailOptOut,
    }, { emitEvent: false });

    if (contact.mailingCountry) {
      const country = this._countriesData.find(c => c.code === contact.mailingCountry);
      const rawCode = (country?.phoneCode ?? '').replace(/^\+/, '');
      this.phoneDialCode = rawCode ? `+${rawCode}` : '';
      this.contactForm.get('mailingState')!.enable({ emitEvent: false });
      this.contactForm.get('phone')!.enable({ emitEvent: false });
      this.geoService.getSubdivisions(contact.mailingCountry).subscribe(subs => {
        this.stateOptions = subs
          .filter(s => s.isActive)
          .map(s => ({ value: s.code!, label: s.name! }));
        this.cdr.detectChanges();
      });
    }
    this.showForm = true;
  }

  resetForm() {
    this.stateOptions = [];
    this.phoneDialCode = '';
    this.contactForm.get('phone')!.disable({ emitEvent: false });
    this.contactForm.get('mailingState')!.disable({ emitEvent: false });
    this.contactForm.reset({
      salutation: '',
      firstName: '',
      lastName: '',
      accountId: null,
      title: '',
      reportsToId: null,
      reportsToSearch: null,
      description: '',
      phone: '',
      email: '',
      mailingCountry: '',
      mailingStreet: '',
      mailingCity: '',
      mailingPostalCode: '',
      mailingState: '',
      emailOptOut: false,
    });
    this.filteredAccountOptions = [...this.accountOptions];
    this.filteredReportToOptions = [...this.reportToOptions];
  }

  cancelForm() {
    this.showForm = false;
    this.editingContact = null;
    this.resetForm();
  }

  saveContact() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.error = 'Please fix the validation errors in the contact form';
      this.cdr.detectChanges();
      return;
    }

    const formValue = this.contactForm.getRawValue();

    if (this.editingContact) {
      const dto: UpdateContactDto = {
        salutation: formValue.salutation,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        accountId: formValue.accountId || null,
        title: formValue.title,
        reportsToId: formValue.reportsToId || null,
        phone: formValue.phone,
        email: formValue.email,
        mailingStreet: formValue.mailingStreet,
        mailingCity: formValue.mailingCity,
        mailingState: formValue.mailingState,
        mailingPostalCode: formValue.mailingPostalCode,
        mailingCountry: formValue.mailingCountry,
        emailOptOut: formValue.emailOptOut,
        description: formValue.description,
      };
      this.contactService.update(this.editingContact.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadContacts(); },
        error: () => { this.error = 'Failed to update contact'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateContactDto = {
        salutation: formValue.salutation,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        accountId: formValue.accountId || null,
        title: formValue.title,
        reportsToId: formValue.reportsToId || null,
        phone: formValue.phone,
        email: formValue.email,
        mailingStreet: formValue.mailingStreet,
        mailingCity: formValue.mailingCity,
        mailingState: formValue.mailingState,
        mailingPostalCode: formValue.mailingPostalCode,
        mailingCountry: formValue.mailingCountry,
        emailOptOut: formValue.emailOptOut,
        description: formValue.description,
      };
      this.contactService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadContacts(); },
        error: () => { this.error = 'Failed to create contact'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteContact(id: string) {
    if (!confirm('Delete this contact?')) return;
    this.contactService.delete(id).subscribe({
      next: () => this.loadContacts(),
      error: () => { this.error = 'Failed to delete contact'; this.cdr.detectChanges(); },
    });
  }

  onAccountSelected(option: AccountLookupOption) {
    this.contactForm.patchValue(
      {
        accountId: option.id,
        accountSearch: option,
      },
      { emitEvent: false },
    );
  }

  onReportToSelected(option: ContactLookupOption) {
    this.contactForm.patchValue(
      {
        reportsToId: option.id,
        reportsToSearch: option,
      },
      { emitEvent: false },
    );
  }

  displayAccountOption = (option: AccountLookupOption | string | null): string => {
    if (!option) return '';
    return typeof option === 'string' ? option : option.label;
  };

  displayContactOption = (option: ContactLookupOption | string | null): string => {
    if (!option) return '';
    return typeof option === 'string' ? option : option.label;
  };

  getFieldError(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (!control || !control.errors || !(control.touched || control.dirty)) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (control.errors['maxlength']) {
      if (fieldName === 'mailingCity') return `City cannot exceed ${CITY_MAX} characters`;
      if (fieldName === 'mailingStreet') return `Address cannot exceed ${ADDRESS_MAX} characters`;
    }

    if (control.errors['pattern'] && fieldName === 'mailingCity') {
      return 'City may only contain letters, spaces, hyphens, and apostrophes';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      mailingCity: 'City',
      mailingStreet: 'Address',
    };

    return labels[fieldName] || fieldName;
  }

  private extractLookupQuery(value: AccountLookupOption | ContactLookupOption | string | null): string {
    if (!value) return '';
    return typeof value === 'string' ? value.trim().toLowerCase() : value.label.trim().toLowerCase();
  }

  private filterLookupOptions<T extends { label: string }>(options: T[], query: string): T[] {
    if (!query) return [...options];
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }

  private buildReportToOptions(contacts: ContactDto[], excludeId?: string): ContactLookupOption[] {
    const liveOptions = contacts
      .filter((contact) => contact.id !== excludeId)
      .map((contact) => ({
        id: contact.id,
        label: [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || contact.email || 'Unnamed Contact',
      }))
      .filter((option) => option.label !== 'Unnamed Contact' || option.id);

    return liveOptions.length > 0 ? liveOptions : this.buildMockReportToOptions(excludeId);
  }

  private buildMockReportToOptions(excludeId?: string): ContactLookupOption[] {
    return MOCK_REPORT_TO_CONTACTS.filter((contact) => contact.id !== excludeId);
  }

  private findAccountOption(accountId: string | null, accountName: string | null): AccountLookupOption | null {
    if (!accountId && !accountName) return null;
    return (
      this.accountOptions.find((option) => option.id === accountId)
      || this.accountOptions.find((option) => option.label === accountName)
      || (accountName ? { id: accountId || accountName, label: accountName } : null)
    );
  }

  private findReportToOption(reportsToId: string | null): ContactLookupOption | null {
    if (!reportsToId) return null;
    return this.reportToOptions.find((option) => option.id === reportsToId) || null;
  }

  private resolveReportToLabel(reportsToId: string | null): string {
    if (!reportsToId) return '';
    return this.findReportToOption(reportsToId)?.label || reportsToId;
  }
}
