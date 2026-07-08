import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobOfferService } from '../../../../services/job-offer.service';
import { ApplicationService } from '../../../../services/application.service';
import { CurrencyService } from '../../../../services/currency.service';
import { LookupService } from '../../../../services/lookup.service';
import { JobOfferDto, CreateJobOfferDto, UpdateJobOfferDto } from '../../../../models/job-offer.model';
import { ApplicationDto } from '../../../../models/application.model';
import { CurrencyDto } from '../../../../models/currency.model';
import { LookupValueDto } from '../../../../models/lookup.model';
import { LookupTypeCode } from '../../../../models/hr-enums';
import { ApiResponse } from '../../../../models/api-response.model';

@Component({
  selector: 'lib-job-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-offer.html',
  styleUrl: './job-offer.css',
})
export class JobOffer implements OnInit {
  offers: JobOfferDto[] = [];
  applications: ApplicationDto[] = [];
  currencies: CurrencyDto[] = [];
  offerStatusValues: LookupValueDto[] = [];

  loading = false;
  error = '';
  showForm = false;
  editingOffer: JobOfferDto | null = null;

  formApplicationId = '';
  formOfferDate = '';
  formExpiryDate = '';
  formSalary = 0;
  formCurrencyCode = '';
  formStatus = '';
  formNotes = '';

  constructor(
    private service: JobOfferService,
    private applicationService: ApplicationService,
    private currencyService: CurrencyService,
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadOffers();
    this.applicationService.getAll().subscribe({
      next: (res: ApiResponse<ApplicationDto[]>) => { this.applications = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.currencyService.getAll().subscribe({
      next: (res: ApiResponse<CurrencyDto[]>) => { this.currencies = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.lookupService.getValuesByTypeCode(LookupTypeCode.OfferStatus).subscribe({
      next: (values) => { this.offerStatusValues = values; this.cdr.detectChanges(); },
    });
  }

  getApplicationLabel(id?: string): string {
    if (!id) return '—';
    const app = this.applications.find(a => a.id === id);
    return app ? (app.applicationCode ?? id) : id;
  }

  getCurrencyLabel(code?: string): string {
    if (!code) return '—';
    const c = this.currencies.find(c => c.currencyCode === code);
    return c ? `${c.currencyCode}${c.currencyName ? ' - ' + c.currencyName : ''}` : code;
  }

  getStatusLabel(id?: string): string {
    if (!id) return '—';
    const v = this.offerStatusValues.find(v => v.id === id);
    return v ? (v.name ?? v.code ?? id) : id;
  }

  loadOffers() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.offers = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load offers'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingOffer = null; this.resetForm(); this.showForm = true; }

  openEditForm(o: JobOfferDto) {
    this.editingOffer = o;
    this.formApplicationId = o.applicationId;
    this.formOfferDate = o.offerDate ?? '';
    this.formExpiryDate = o.expiryDate ?? '';
    this.formSalary = o.salary ?? 0;
    this.formCurrencyCode = o.currency ?? '';
    this.formStatus = o.status ?? '';
    this.formNotes = o.notes ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formApplicationId = '';
    this.formOfferDate = '';
    this.formExpiryDate = '';
    this.formSalary = 0;
    this.formCurrencyCode = '';
    this.formStatus = '';
    this.formNotes = '';
  }

  cancelForm() { this.showForm = false; this.editingOffer = null; this.resetForm(); }

  saveOffer() {
    if (this.editingOffer) {
      const dto: UpdateJobOfferDto = {
        expiryDate: this.formExpiryDate || undefined,
        salary: this.formSalary || undefined,
        currency: this.formCurrencyCode || undefined,
        status: this.formStatus || undefined,
        notes: this.formNotes || undefined,
      };
      this.service.update(this.editingOffer.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadOffers(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to update offer'; this.cdr.detectChanges(); },
      });
    } else {
      if (!this.formApplicationId) {
        this.error = 'Please select an application.';
        this.cdr.detectChanges();
        return;
      }
      const dto: CreateJobOfferDto = {
        applicationId: this.formApplicationId,
        offerDate: this.formOfferDate,
        expiryDate: this.formExpiryDate,
        salary: this.formSalary,
        currency: this.formCurrencyCode || undefined,
        notes: this.formNotes || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadOffers(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to create offer'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteOffer(o: JobOfferDto) {
    if (!confirm(`Delete this job offer?`)) return;
    this.service.delete(o.id).subscribe({
      next: () => this.loadOffers(),
      error: () => { this.error = 'Failed to delete offer'; this.cdr.detectChanges(); },
    });
  }
}
