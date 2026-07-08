import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobOfferService } from '../../services/job-offer.service';
import { JobOfferDto, CreateJobOfferDto, UpdateJobOfferDto } from '../../models/job-offer.model';

@Component({
  selector: 'lib-job-offer-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-offer-crud.html',
  styleUrl: './job-offer-crud.css',
})
export class JobOfferCrudComponent implements OnInit {
  offers: JobOfferDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingOffer: JobOfferDto | null = null;

  formApplicationId = '';
  formOfferDate = '';
  formExpiryDate = '';
  formSalary = 0;
  formCurrency = 'USD';
  formStatus = 'pending';
  formNotes = '';

  constructor(private service: JobOfferService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadOffers(); }

  loadOffers() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.offers = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load job offers'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingOffer = null; this.resetForm(); this.showForm = true; }

  openEditForm(o: JobOfferDto) {
    this.editingOffer = o;
    this.formApplicationId = o.applicationId;
    this.formOfferDate = o.offerDate;
    this.formExpiryDate = o.expiryDate;
    this.formSalary = o.salary;
    this.formCurrency = o.currency;
    this.formStatus = o.status;
    this.formNotes = o.notes ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formApplicationId = '';
    this.formOfferDate = '';
    this.formExpiryDate = '';
    this.formSalary = 0;
    this.formCurrency = 'USD';
    this.formStatus = 'pending';
    this.formNotes = '';
  }

  cancelForm() { this.showForm = false; this.editingOffer = null; this.resetForm(); }

  saveOffer() {
    if (this.editingOffer) {
      const dto: UpdateJobOfferDto = {
        expiryDate: this.formExpiryDate,
        salary: this.formSalary,
        currency: this.formCurrency,
        status: this.formStatus,
        notes: this.formNotes || undefined,
      };
      this.service.update(this.editingOffer.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadOffers(); },
        error: () => { this.error = 'Failed to update offer'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateJobOfferDto = {
        applicationId: this.formApplicationId,
        offerDate: this.formOfferDate,
        expiryDate: this.formExpiryDate,
        salary: this.formSalary,
        currency: this.formCurrency || undefined,
        notes: this.formNotes || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadOffers(); },
        error: () => { this.error = 'Failed to create offer'; this.cdr.detectChanges(); },
      });
    }
  }

  accept(o: JobOfferDto) {
    this.service.accept(o.id).subscribe({
      next: () => this.loadOffers(),
      error: () => { this.error = 'Failed to accept offer'; this.cdr.detectChanges(); },
    });
  }

  decline(o: JobOfferDto) {
    this.service.decline(o.id).subscribe({
      next: () => this.loadOffers(),
      error: () => { this.error = 'Failed to decline offer'; this.cdr.detectChanges(); },
    });
  }

  deleteOffer(o: JobOfferDto) {
    if (confirm('Delete this job offer?')) {
      this.service.delete(o.id).subscribe({
        next: () => this.loadOffers(),
        error: () => { this.error = 'Failed to delete offer'; this.cdr.detectChanges(); },
      });
    }
  }
}
