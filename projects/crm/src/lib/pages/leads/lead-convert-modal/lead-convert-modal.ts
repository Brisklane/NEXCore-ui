import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, forkJoin } from 'rxjs';
import { LeadDto } from '../../../models/lead.model';
import { AccountService } from '../../../services/account.service';
import { ContactService } from '../../../services/contact.service';
import { DealService } from '../../../services/deal.service';
import { LeadService } from '../../../services/lead.service';

const DEAL_STAGE_OPTIONS = [
  'Qualify', 'Meet and Present', 'Propose', 'Negotiate', 'Closed Won',
];

const STAGE_PROBABILITY: Record<string, number> = {
  'Qualify': 20, 'Meet and Present': 40, 'Propose': 60,
  'Negotiate': 80, 'Closed Won': 100,
};

@Component({
  selector: 'lib-lead-convert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-convert-modal.html',
  styleUrl: './lead-convert-modal.css',
})
export class LeadConvertModalComponent implements OnInit, OnDestroy {
  /** Lead with any unsaved form changes already merged in by the caller */
  @Input() lead!: LeadDto;
  @Output() converted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  converting     = false;
  convertSuccess = false;
  error = '';
  dealStageOptions = DEAL_STAGE_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private contactService: ContactService,
    private dealService: DealService,
    private leadService: LeadService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Prevent background page from scrolling while modal is open
    document.body.style.overflow = 'hidden';

    const l = this.lead;

    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + 90);
    const closeDateStr = closeDate.toISOString().slice(0, 10);

    const oppName = l.company ? `${l.company} - Opportunity` : 'New Opportunity';

    this.form = this.fb.group({
      // ── Account ──────────────────────────────────────
      accountName:    [l.company    || '', Validators.required],
      accountPhone:   [l.phone      || ''],
      accountWebsite: [l.website    || ''],
      // Industry, country, state come from the lead — read-only, not in form
      accountStreet:  [l.street     || ''],
      accountCity:     [l.city       || ''],
      accountPostal:   [l.postalCode || ''],
      // Country and state come directly from the lead — read-only, not in form

      // ── Contact ──────────────────────────────────────
      contactSalutation:  [l.salutation || ''],
      contactFirstName:   [l.firstName  || '', Validators.required],
      contactLastName:    [l.lastName   || '', Validators.required],
      contactTitle:       [l.title      || ''],
      contactEmail:       [l.email      || '', Validators.email],
      contactPhone:       [l.phone      || ''],
      contactEmailOptOut: [l.emailOptOut ?? false],

      // ── Deal ─────────────────────────────────────────
      dealName:      [oppName,      Validators.required],
      dealAmount:    [0,            [Validators.required, Validators.min(0)]],
      dealCloseDate: [closeDateStr, Validators.required],
      dealStage:     ['Qualify',    Validators.required],
    });
  }

  ngOnDestroy(): void {
    // Restore scroll when modal closes
    document.body.style.overflow = '';
  }

  confirm(): void {
    if (this.form.invalid || this.converting) return;
    this.converting = true;
    this.error = '';
    this.cdr.detectChanges();

    const v = this.form.getRawValue();
    const l = this.lead;

    // Country and state are taken directly from the lead (read-only in modal)
    const accountDto = {
      accountName:       v.accountName,
      phone:             v.accountPhone   || null,
      website:           v.accountWebsite || null,
      industry:          l.industry       || null,   // from lead, read-only
      billingStreet:     v.accountStreet  || null,
      billingCity:       v.accountCity     || null,
      billingState:      l.state           || null,
      billingPostalCode: v.accountPostal   || null,
      billingCountry:    l.country         || null,
    };

    this.accountService.create(accountDto).pipe(
      switchMap(accountRes => {
        const accountId = accountRes.data!.id;

        const contactDto = {
          salutation:        v.contactSalutation || null,
          firstName:         v.contactFirstName,
          lastName:          v.contactLastName,
          title:             v.contactTitle   || null,
          email:             v.contactEmail   || null,
          phone:             v.contactPhone   || null,
          emailOptOut:       v.contactEmailOptOut,
          accountId,
          mailingStreet:     v.accountStreet || null,
          mailingCity:       v.accountCity   || null,
          mailingState:      l.state         || null,
          mailingPostalCode: v.accountPostal || null,
          mailingCountry:    l.country       || null,
        };

        const dealDto = {
          opportunityName:  v.dealName,
          accountId,
          closeDate:        v.dealCloseDate,
          amount:           Number(v.dealAmount) || 0,
          stage:       v.dealStage,
          probability: STAGE_PROBABILITY[v.dealStage] ?? 20,
        };

        return forkJoin({
          contact: this.contactService.create(contactDto),
          deal:    this.dealService.create(dealDto),
        }).pipe(
          switchMap(() => this.leadService.update(l.id, {
            salutation:        l.salutation,
            firstName:         l.firstName,
            lastName:          l.lastName,
            company:           l.company,
            title:             l.title,
            website:           l.website,
            phone:             l.phone,
            email:             l.email,
            street:            l.street,
            city:              l.city,
            state:             l.state,
            postalCode:        l.postalCode,
            country:           l.country,
            numberOfEmployees: l.numberOfEmployees,
            annualRevenue:     l.annualRevenue,
            leadSource:        l.leadSource,
            industry:          l.industry,
            status:            'Qualified',
            description:       l.description,
            emailOptOut:       l.emailOptOut,
          })),
          switchMap(() => this.leadService.convert(l.id, {
            createAccount: false,
            createContact: false,
            createDeal:    false,
          }))
        );
      })
    ).subscribe({
      next: () => {
        this.converting     = false;
        this.convertSuccess = true;   // show success screen; emit only after OK
        this.cdr.detectChanges();
      },
      error: () => {
        this.converting = false;
        this.error = 'Conversion failed. Some records may have been partially created. Please check Accounts, Contacts, and Deals.';
        this.cdr.detectChanges();
      },
    });
  }

  /** Called when user presses OK on the success screen */
  onSuccessOk(): void { this.converted.emit(); }

  cancel(): void { this.cancelled.emit(); }

  getLeadName(): string {
    const l = this.lead;
    return [l.salutation, l.firstName, l.lastName].filter(Boolean).join(' ') || l.email || 'this lead';
  }
}
