import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { LeadService } from '../../services/lead.service';
import { CrmLookupService } from '../../services/crm-lookup.service';
import { CampaignService } from '../../services/campaign.service';
import { LeadDto, CreateLeadDto, UpdateLeadDto } from '../../models/lead.model';
import { CampaignDto } from '../../models/campaign.model';
import { CrmLookupItemDto } from '../../models/crm-lookup.model';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';
import { LeadConvertModalComponent } from './lead-convert-modal/lead-convert-modal';
import { GeoService, CountryDto } from '@nexcore/core';
import { EmployeeService } from '@nexcore/hr';

// Dropdown Options Constants
export const LEAD_STATUS_OPTIONS = [
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Nurturing', value: 'Nurturing' },
  { label: 'Qualified', value: 'Qualified' },
  { label: 'Unqualified', value: 'Unqualified' },
];

export const SALUTATION_OPTIONS = [
  { label: 'Mr.', value: 'Mr.' },
  { label: 'Mrs.', value: 'Mrs.' },
  { label: 'Ms.', value: 'Ms.' },
  { label: 'Dr.', value: 'Dr.' },
  { label: 'Prof.', value: 'Prof.' },
  { label: 'Mx.', value: 'Mx.' },
];

export const COUNTRY_OPTIONS: Array<{ label: string; value: string }> = [];
export const STATE_PROVINCE_OPTIONS: Array<{ label: string; value: string }> = [];
export const DESCRIPTION_MAX = 1000;
export const CITY_MAX = 100;
export const ADDRESS_MAX = 250;
export const PHONE_NUMBER_MAX = 15;
export const MAX_EMPLOYEES = 2_000_000;
export const MAX_ANNUAL_REVENUE = 1_000_000_000_000;

const CITY_PATTERN = /^[A-Za-z0-9À-É\s'\-.]*$/;

function websiteUrlValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').trim();
  if (!raw) return null;
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(href);
    // Must have a real hostname with at least one dot
    if (!u.hostname.includes('.')) return { url: true };
    return null;
  } catch {
    return { url: true };
  }
}

export const LEAD_SOURCE_OPTIONS = [
  { label: 'Advertisement', value: 'Advertisement' },
  { label: 'Website', value: 'Website' },
  { label: 'Word of Mouth', value: 'Word of Mouth' },
  { label: 'Friend Referral', value: 'Friend Referral' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Email Campaign', value: 'Email Campaign' },
  { label: 'Cold Call', value: 'Cold Call' },
  { label: 'Trade Show', value: 'Trade Show' },
  { label: 'Partner Referral', value: 'Partner Referral' },
  { label: 'Other', value: 'Other' },
];

export const INDUSTRY_OPTIONS = [
  { label: 'Information Technology', value: 'Information Technology' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Education', value: 'Education' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Telecommunications', value: 'Telecommunications' },
  { label: 'Logistics', value: 'Logistics' },
  { label: 'Construction', value: 'Construction' },
  { label: 'Hospitality', value: 'Hospitality' },
  { label: 'Media & Entertainment', value: 'Media & Entertainment' },
];

@Component({
  selector: 'lib-leads',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, LookupDropdownComponent, LeadConvertModalComponent],
  templateUrl: './leads.html',
  styleUrl: './leads.css',
})
export class LeadsComponent implements OnInit, OnDestroy {
  leads: LeadDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingLead: LeadDto | null = null;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [10, 25, 50, 100];
  searchTerm      = '';

  private get _sortedLeads(): LeadDto[] {
    return [...this.leads]
      .filter(l => !l.isConverted)           // converted leads are hidden from the list
      .sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
  }

  private get _searchFiltered(): LeadDto[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this._sortedLeads;
    return this._sortedLeads.filter(l =>
      `${l.firstName ?? ''} ${l.lastName ?? ''} ${l.company ?? ''} ${l.email ?? ''} ${l.phone ?? ''}`.toLowerCase().includes(q)
    );
  }

  get totalCount(): number { return this._searchFiltered.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize))); }
  get firstEntry(): number { return this.totalCount === 0 ? 0 : (this.page - 1) * Number(this.pageSize) + 1; }
  get lastEntry():  number { return Math.min(this.page * Number(this.pageSize), this.totalCount); }

  get filteredLeads(): LeadDto[] {
    const start = (this.page - 1) * Number(this.pageSize);
    return this._searchFiltered.slice(start, start + Number(this.pageSize));
  }

  displayedColumns = ['name', 'company', 'stateProvince', 'phone', 'email', 'leadStatus', 'createdAt'];

  // Lead selection
  selectedLeadIds = new Set<string>();

  // Convert lead modal
  showConvertModal = false;
  leadToConvert: LeadDto | null = null;

  // Campaign assignment modal
  showCampaignModal = false;
  campaigns: CampaignDto[] = [];
  campaignSearch = '';
  campaignLoading = false;
  addingToCampaign = false;
  campaignSuccessMessage = '';
  pendingCampaign: CampaignDto | null = null;


  leadForm!: FormGroup;

  readonly descriptionMax = DESCRIPTION_MAX;
  readonly cityMax = CITY_MAX;
  readonly addressMax = ADDRESS_MAX;
  readonly phoneNumberMax = PHONE_NUMBER_MAX;
  readonly maxEmployees = MAX_EMPLOYEES;
  readonly maxAnnualRevenue = MAX_ANNUAL_REVENUE;
  phoneDialCode = '';

  get descriptionLength(): number {
    return (this.leadForm.get('description')?.value ?? '').length;
  }

  get phoneDisplayValue(): string {
    const full = (this.leadForm.get('phone')?.value ?? '') as string;
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
    this.leadForm.get('phone')!.setValue(full, { emitEvent: false });
  }

  // Dropdown Options
  leadStatusOptions = LEAD_STATUS_OPTIONS;
  salutationOptions = SALUTATION_OPTIONS;
  countryOptions: Array<{ label: string; value: string }> = [];
  stateProvinceOptions: Array<{ label: string; value: string }> = [];
  leadSourceOptions = LEAD_SOURCE_OPTIONS;
  industryOptions = INDUSTRY_OPTIONS;
  employeeOptions: Array<{ label: string; value: string }> = [];

  private _countrySub?: Subscription;
  private _countriesData: CountryDto[] = [];

  constructor(
    private leadService: LeadService,
    private crmLookupService: CrmLookupService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private geoService: GeoService,
    private employeeService: EmployeeService,
  ) {
    this.initializeForm();
  }

  initializeForm() {
    this.leadForm = this.formBuilder.group({
      // About Section
      status: ['New', Validators.required],
      salutation: ['', []],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      company: ['', []],
      title: ['', []],
      website: ['', [websiteUrlValidator]],
      description: ['', [Validators.maxLength(DESCRIPTION_MAX)]],

      // Get in Touch Section
      phone: [{ value: '', disabled: true }, []],
      email: ['', [Validators.email]],
      country: ['', []],
      street: ['', [Validators.maxLength(ADDRESS_MAX)]],
      city: ['', [Validators.maxLength(CITY_MAX), Validators.pattern(CITY_PATTERN)]],
      state: [{ value: '', disabled: true }, []],
      postalCode: ['', []],
      emailOptOut: [false, []],

      // Segment Section
      numberOfEmployees: [null, [Validators.min(1), Validators.max(MAX_EMPLOYEES)]],
      annualRevenue: [null, [Validators.min(0), Validators.max(MAX_ANNUAL_REVENUE)]],
      leadSource: ['', []],
      industry: ['', []],

      // Assigned employee — display only; no corresponding LeadDto field yet
      assignedEmployeeId: ['', []],
    });
  }

  ngOnInit() {
    this.loadGeoCountries();
    this.loadCrmLookups();
    this.loadLeads();
    this.loadEmployees();

    this._countrySub = this.leadForm.get('country')!.valueChanges.subscribe(code => {
      this.stateProvinceOptions = [];
      const stateCtrl = this.leadForm.get('state')!;
      const phoneCtrl = this.leadForm.get('phone')!;

      stateCtrl.setValue('', { emitEvent: false });

      if (code) {
        stateCtrl.enable({ emitEvent: false });

        const country = this._countriesData.find(c => c.code === code);
        const rawCode = (country?.phoneCode ?? '').replace(/^\+/, '');
        const newDialCode = rawCode ? `+${rawCode}` : '';

        // Preserve any number the user already typed under the previous dial code
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
          this.stateProvinceOptions = subs
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

        const leadStatuses = this.mapLookupItemsToOptions(lookups.leadStatuses);
        const salutations = this.mapLookupItemsToOptions(lookups.salutations);
        const leadSources = this.mapLookupItemsToOptions(lookups.leadSources);
        const industries = this.mapLookupItemsToOptions(lookups.industries);

        if (leadStatuses.length > 0) this.leadStatusOptions = leadStatuses;
        if (salutations.length > 0) this.salutationOptions = salutations;
        if (leadSources.length > 0) this.leadSourceOptions = leadSources;
        if (industries.length > 0) this.industryOptions = industries;

        this.cdr.detectChanges();
      },
      error: () => {
        // Keep existing fallback constants when lookup endpoint is unavailable.
      },
    });
  }

  private mapLookupItemsToOptions(items: CrmLookupItemDto[] | null | undefined): Array<{ label: string; value: string }> {
    return (items ?? [])
      .filter((item): item is CrmLookupItemDto => !!item)
      .map((item) => ({
        value: (item.value ?? item.label ?? '').trim(),
        label: (item.label ?? item.value ?? '').trim(),
      }))
      .filter((item) => item.value.length > 0 && item.label.length > 0);
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        const employees = Array.isArray(res) ? res : (res?.data ?? []);
        this.employeeOptions = employees
          .filter(e => e.isActive)
          .map(e => ({
            value: e.id,
            label: [e.firstName, e.lastName].filter(Boolean).join(' ') || e.employeeCode || e.id,
          }));
        this.cdr.detectChanges();
      },
      error: () => {
        // Non-critical — leave employeeOptions empty if HR endpoint is unavailable
      },
    });
  }

  loadLeads() {
    this.loading = true;
    this.error = '';
    this.leadService.getAll({ pageSize: 10000 }).subscribe({
      next: (res) => {
        this.leads = res.data ?? [];
        this.selectedLeadIds.clear();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Failed to load leads';
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
    this.editingLead = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(lead: LeadDto) {
    this.editingLead = lead;
    this.stateProvinceOptions = [];
    this.leadForm.patchValue({
      status: lead.status ?? 'New',
      salutation: lead.salutation ?? '',
      firstName: lead.firstName ?? '',
      lastName: lead.lastName ?? '',
      company: lead.company ?? '',
      title: lead.title ?? '',
      website: lead.website ?? '',
      description: lead.description ?? '',
      phone: lead.phone ?? '',
      email: lead.email ?? '',
      country: lead.country ?? '',
      street: lead.street ?? '',
      city: lead.city ?? '',
      state: lead.state ?? '',
      postalCode: lead.postalCode ?? '',
      emailOptOut: lead.emailOptOut ?? false,
      numberOfEmployees: lead.numberOfEmployees ?? null,
      annualRevenue: lead.annualRevenue ?? null,
      leadSource: lead.leadSource ?? '',
      industry: lead.industry ?? '',
      assignedEmployeeId: lead.assignedEmployeeId ?? '',
    }, { emitEvent: false });
    if (lead.country) {
      const country = this._countriesData.find(c => c.code === lead.country);
      const rawCode = (country?.phoneCode ?? '').replace(/^\+/, '');
      this.phoneDialCode = rawCode ? `+${rawCode}` : '';
      this.leadForm.get('state')!.enable({ emitEvent: false });
      this.leadForm.get('phone')!.enable({ emitEvent: false });
      this.geoService.getSubdivisions(lead.country).subscribe(subs => {
        this.stateProvinceOptions = subs
          .filter(s => s.isActive)
          .map(s => ({ value: s.code!, label: s.name! }));
        this.cdr.detectChanges();
      });
    }
    this.showForm = true;
  }

  resetForm() {
    this.stateProvinceOptions = [];
    this.phoneDialCode = '';
    this.leadForm.get('phone')!.disable({ emitEvent: false });
    this.leadForm.get('state')!.disable({ emitEvent: false });
    this.leadForm.reset({
      status: 'New',
      salutation: '',
      firstName: '',
      lastName: '',
      company: '',
      title: '',
      website: '',
      description: '',
      phone: '',
      email: '',
      country: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      emailOptOut: false,
      numberOfEmployees: null,
      annualRevenue: null,
      leadSource: '',
      industry: '',
    });
  }

  cancelForm() {
    this.showForm = false;
    this.editingLead = null;
    this.resetForm();
  }

  saveLead() {
    if (!this.leadForm.valid) {
      this.error = 'Please fix the errors in the form';
      this.cdr.detectChanges();
      return;
    }

    const formValue = this.leadForm.getRawValue();

    // When an existing lead is being marked Qualified (Converted), show the
    // convert modal instead of saving immediately.
    if (
      this.editingLead &&
      !this.editingLead.isConverted &&
      formValue.status === 'Qualified'
    ) {
      // Merge the unsaved form changes into the lead object so the modal
      // pre-fills with the latest values.
      this.leadToConvert = {
        ...this.editingLead,
        ...formValue,
        id:          this.editingLead.id,
        createdAt:   this.editingLead.createdAt,
        isConverted: this.editingLead.isConverted,
        convertedAt: this.editingLead.convertedAt,
      } as LeadDto;
      this.showConvertModal = true;
      this.cdr.detectChanges();
      return;
    }

    if (this.editingLead) {
      const dto: UpdateLeadDto = {
        salutation: formValue.salutation,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        company: formValue.company,
        title: formValue.title,
        website: formValue.website,
        phone: formValue.phone,
        email: formValue.email,
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        country: formValue.country,
        numberOfEmployees: formValue.numberOfEmployees ?? null,
        annualRevenue: formValue.annualRevenue ?? null,
        leadSource: formValue.leadSource,
        industry: formValue.industry,
        status: formValue.status,
        assignedEmployeeId: formValue.assignedEmployeeId || null,
        description: formValue.description,
        emailOptOut: formValue.emailOptOut,
      };
      this.leadService.update(this.editingLead.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.loadLeads();
        },
        error: () => {
          this.error = 'Failed to update lead';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreateLeadDto = {
        salutation: formValue.salutation,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        company: formValue.company,
        title: formValue.title,
        website: formValue.website,
        phone: formValue.phone,
        email: formValue.email,
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        country: formValue.country,
        numberOfEmployees: formValue.numberOfEmployees ?? null,
        annualRevenue: formValue.annualRevenue ?? null,
        leadSource: formValue.leadSource,
        industry: formValue.industry,
        status: formValue.status,
        assignedEmployeeId: formValue.assignedEmployeeId || null,
        description: formValue.description,
        emailOptOut: formValue.emailOptOut,
      };
      this.leadService.create(dto).subscribe({
        next: () => {
          this.showForm = false;
          this.loadLeads();
        },
        error: () => {
          this.error = 'Failed to create lead';
          this.cdr.detectChanges();
        },
      });
    }
  }

  deleteLead(id: string) {
    if (!confirm('Delete this lead?')) return;
    this.leadService.delete(id).subscribe({
      next: () => this.loadLeads(),
      error: () => {
        this.error = 'Failed to delete lead';
        this.cdr.detectChanges();
      },
    });
  }

  onLeadConverted(): void {
    this.showConvertModal = false;
    this.leadToConvert    = null;
    this.showForm         = false;
    this.editingLead      = null;
    this.loadLeads();
  }

  onConvertCancelled(): void {
    this.showConvertModal = false;
    this.leadToConvert    = null;
    // Reset the status dropdown back to its pre-Qualified value so the form
    // doesn't reopen the modal on the next save attempt.
    const prevStatus = this.editingLead?.status ?? 'New';
    this.leadForm.get('status')?.setValue(prevStatus, { emitEvent: false });
    this.cdr.detectChanges();
  }

  getLeadName(lead: LeadDto): string {
    const parts = [lead.salutation, lead.firstName, lead.lastName].filter(Boolean).map((part) => String(part).trim());
    return parts.length > 0 ? parts.join(' ') : '-';
  }

  getFormattedCompany(company: string | null): string {
    return company?.trim() || '-';
  }

  getStateProvince(lead: LeadDto): string {
    return lead.state?.trim() || '-';
  }

  formatPhone(phone: string | null): string {
    if (!phone) return '-';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone.trim();
  }

  getEmailHref(email: string | null): string {
    return email ? `mailto:${email}` : '#';
  }

  getEmailDisplay(email: string | null): string {
    return email?.trim() || '-';
  }

  getEmployeeName(id: string | null): string {
    if (!id) return '—';
    return this.employeeOptions.find(e => e.value === id)?.label ?? '—';
  }

  getLeadStatusClass(status: string | null): string {
    const normalizedStatus = (status || 'New').toLowerCase().replace(/\s+/g, '-');
    return `badge-${normalizedStatus}`;
  }

  getLeadStatusLabel(status: string | null): string {
    return status?.trim() || 'New';
  }

  getFieldError(fieldName: string): string {
    const field = this.leadForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return `${this.fieldLabel(fieldName)} is required`;
    if (field.errors['email']) return 'Please enter a valid email';
    if (field.errors['url']) return 'Please enter a valid URL';
    if (field.errors['maxlength']) {
      if (fieldName === 'description') return `Description cannot exceed ${DESCRIPTION_MAX} characters`;
      if (fieldName === 'city') return `City cannot exceed ${CITY_MAX} characters`;
      if (fieldName === 'street') return `Address cannot exceed ${ADDRESS_MAX} characters`;
    }
    if (field.errors['min']) {
      if (fieldName === 'numberOfEmployees') return 'Number of Employees must be at least 1';
      if (fieldName === 'annualRevenue') return 'Annual Revenue cannot be negative';
    }
    if (field.errors['max']) {
      if (fieldName === 'numberOfEmployees') return `Number of Employees cannot exceed ${MAX_EMPLOYEES.toLocaleString()}`;
      if (fieldName === 'annualRevenue') return `Annual Revenue cannot exceed ${MAX_ANNUAL_REVENUE.toLocaleString()}`;
    }
    if (field.errors['pattern'] && fieldName === 'city') {
      return 'City may only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  }

  fieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      title: 'Title',
      website: 'Website',
      status: 'Status',
      leadSource: 'Lead Source',
      industry: 'Industry',
      country: 'Country',
      state: 'State/Province',
      city: 'City',
      street: 'Address',
      numberOfEmployees: 'Number of Employees',
      annualRevenue: 'Annual Revenue',
    };
    return labels[fieldName] || fieldName;
  }

  // ── Lead selection ────────────────────────────────────────────────

  get selectedCount(): number { return this.selectedLeadIds.size; }

  isSelected(id: string): boolean { return this.selectedLeadIds.has(id); }

  toggleSelect(id: string): void {
    if (this.selectedLeadIds.has(id)) {
      this.selectedLeadIds.delete(id);
    } else {
      this.selectedLeadIds.add(id);
    }
  }

  allSelected(): boolean {
    return this.filteredLeads.length > 0 && this.filteredLeads.every(l => this.selectedLeadIds.has(l.id));
  }

  someSelected(): boolean {
    return this.selectedLeadIds.size > 0 && !this.allSelected();
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.filteredLeads.forEach(l => this.selectedLeadIds.add(l.id));
    } else {
      this.filteredLeads.forEach(l => this.selectedLeadIds.delete(l.id));
    }
  }

  // ── Campaign assignment modal ─────────────────────────────────────

  openCampaignModal(): void {
    this.showCampaignModal = true;
    this.campaignSearch = '';
    this.campaignSuccessMessage = '';
    this.campaignLoading = true;
    this.campaignService.getAll({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.campaigns = res.data ?? [];
        this.campaignLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.campaignLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeCampaignModal(): void {
    this.showCampaignModal = false;
    this.campaignSuccessMessage = '';
    this.pendingCampaign = null;
  }

  get filteredCampaigns(): CampaignDto[] {
    if (!this.campaignSearch.trim()) return this.campaigns;
    const q = this.campaignSearch.toLowerCase();
    return this.campaigns.filter(c => (c.campaignName ?? '').toLowerCase().includes(q));
  }

  selectCampaignForConfirm(campaign: CampaignDto): void {
    this.pendingCampaign = campaign;
  }

  cancelConfirm(): void {
    this.pendingCampaign = null;
  }

  confirmAssign(): void {
    const campaign = this.pendingCampaign;
    if (!campaign || this.addingToCampaign || this.selectedLeadIds.size === 0) return;
    this.addingToCampaign = true;
    const calls = Array.from(this.selectedLeadIds).map(leadId =>
      this.campaignService.addMember(campaign.id, { leadId, status: 'Sent' })
    );
    forkJoin(calls).subscribe({
      next: () => {
        const count = this.selectedLeadIds.size;
        this.addingToCampaign = false;
        this.pendingCampaign = null;
        this.campaignSuccessMessage = `${count} lead${count !== 1 ? 's' : ''} successfully added to "${campaign.campaignName ?? 'campaign'}"`;
        this.selectedLeadIds = new Set();
        this.cdr.detectChanges();
        setTimeout(() => { this.closeCampaignModal(); this.cdr.detectChanges(); }, 2000);
      },
      error: () => {
        this.addingToCampaign = false;
        this.error = 'Failed to add leads to campaign';
        this.cdr.detectChanges();
      },
    });
  }

  getCampaignStatusClass(status: string | null): string {
    const map: Record<string, string> = {
      'Planned': 'cs-planned',
      'In Progress': 'cs-in-progress',
      'Completed': 'cs-completed',
      'Aborted': 'cs-aborted',
    };
    return map[status ?? ''] ?? 'cs-planned';
  }

}
