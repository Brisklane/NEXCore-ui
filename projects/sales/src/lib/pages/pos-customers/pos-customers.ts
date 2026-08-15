import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ContactService, ContactDto } from '@nexcore/crm';
import { SalesInvoiceService } from '../../services/sales-invoice.service';
import { SalesInvoiceDto } from '../../models/sales-invoice.model';

/** The editable shape of a customer, kept separate from the DTO so cancel is free. */
interface CustomerDraft {
  id: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  accountId: string | null;
  mailingStreet: string;
  mailingCity: string;
  mailingCountry: string;
  description: string;
  emailOptOut: boolean;
  /**
   * Fields this screen does not show. The API's update replaces every column from the
   * DTO, so anything omitted comes back null — carrying them through stops a till-side
   * edit from wiping what someone entered in CRM.
   */
  passthrough: {
    salutation: string | null;
    title: string | null;
    reportsToId: string | null;
    ownerId: string | null;
    mailingState: string | null;
    mailingPostalCode: string | null;
  };
}

const EMPTY_PASSTHROUGH = {
  salutation: null, title: null, reportsToId: null,
  ownerId: null, mailingState: null, mailingPostalCode: null,
};

/**
 * Customers, from inside the POS app.
 *
 * A shop's customer record is a CRM contact — the same record the till attaches to a
 * sale — so this screen edits contacts rather than inventing a parallel "POS customer".
 * Search runs on the server: the API caps a page at 100 rows, so a list that tried to
 * hold every customer in memory would quietly hide most of them once a shop grew.
 */
@Component({
  standalone: true,
  selector: 'lib-pos-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-customers.html',
  styleUrls: ['./pos-customers.css'],
})
export class PosCustomersComponent implements OnInit {
  private contacts = inject(ContactService);
  private invoices = inject(SalesInvoiceService);
  private cdr = inject(ChangeDetectorRef);

  rows: ContactDto[] = [];
  total = 0;
  page = 1;
  readonly pageSize = 25;
  search = '';
  loading = false;
  error = '';
  notice = '';

  draft: CustomerDraft | null = null;
  saving = false;
  formError = '';

  /** Purchase history for the customer being edited. */
  history: SalesInvoiceDto[] = [];
  historyLoading = false;

  private searchTimer: any = null;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  onSearchInput(term: string): void {
    this.search = term;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.load(); }, 300);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.contacts.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search.trim() || undefined,
    })).catch(() => null);

    if (!res) this.error = 'Could not load customers.';
    this.rows = res?.data ?? [];
    this.total = res?.pagination?.totalCount ?? this.rows.length;

    this.loading = false;
    this.cdr.detectChanges();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  async goToPage(p: number): Promise<void> {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    await this.load();
  }

  name(c: ContactDto): string {
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.accountName || c.email || 'Unnamed';
  }

  // ── Editing ───────────────────────────────────────────────────────────────

  startNew(): void {
    this.draft = {
      id: null, firstName: '', lastName: '', phone: '', email: '',
      accountId: null, mailingStreet: '', mailingCity: '', mailingCountry: '',
      description: '', emailOptOut: false, passthrough: { ...EMPTY_PASSTHROUGH },
    };
    this.history = [];
    this.formError = '';
    this.notice = '';
  }

  edit(c: ContactDto): void {
    this.draft = {
      id: c.id,
      firstName: c.firstName ?? '',
      lastName: c.lastName ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      accountId: c.accountId,
      mailingStreet: c.mailingStreet ?? '',
      mailingCity: c.mailingCity ?? '',
      mailingCountry: c.mailingCountry ?? '',
      description: c.description ?? '',
      emailOptOut: c.emailOptOut,
      passthrough: {
        salutation: c.salutation,
        title: c.title,
        reportsToId: c.reportsToId,
        ownerId: c.ownerId,
        mailingState: c.mailingState,
        mailingPostalCode: c.mailingPostalCode,
      },
    };
    this.formError = '';
    this.notice = '';
    this.loadHistory(c.id);
  }

  close(): void {
    this.draft = null;
    this.history = [];
  }

  private async loadHistory(contactId: string): Promise<void> {
    this.historyLoading = true;
    this.history = [];
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.invoices.byCustomer(contactId)).catch(() => null);
    this.history = (res?.data ?? [])
      .sort((a, b) => (b.invoiceDate ?? '').localeCompare(a.invoiceDate ?? ''))
      .slice(0, 10);

    this.historyLoading = false;
    this.cdr.detectChanges();
  }

  get historyTotal(): number {
    return this.history.reduce((sum, i) => sum + (i.totalAmount ?? 0), 0);
  }

  private validate(d: CustomerDraft): string | null {
    if (!`${d.firstName} ${d.lastName}`.trim()) return 'Enter a name.';
    // Without one of these the record cannot be found again at a till, which is the
    // only reason a shop keeps it.
    if (!d.phone.trim() && !d.email.trim()) return 'Enter a phone number or an email.';
    if (d.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) return 'That email does not look right.';
    return null;
  }

  async save(): Promise<void> {
    const d = this.draft;
    if (!d) return;

    const problem = this.validate(d);
    if (problem) { this.formError = problem; this.cdr.detectChanges(); return; }

    this.saving = true;
    this.formError = '';

    // The API requires a last name. For a single name, put it there and leave the first
    // blank — duplicating it would read back as "Ayesha Ayesha" wherever the name shows.
    const single = !d.lastName.trim();
    const payload = {
      firstName: single ? null : d.firstName.trim() || null,
      lastName: single ? d.firstName.trim() : d.lastName.trim(),
      phone: d.phone.trim() || null,
      email: d.email.trim() || null,
      accountId: d.accountId,
      mailingStreet: d.mailingStreet.trim() || null,
      mailingCity: d.mailingCity.trim() || null,
      mailingCountry: d.mailingCountry.trim() || null,
      description: d.description.trim() || null,
      emailOptOut: d.emailOptOut,
      ...d.passthrough,
    };

    const res = await firstValueFrom(
      d.id ? this.contacts.update(d.id, payload) : this.contacts.create(payload),
    ).catch((err: any) => {
      this.formError = err?.error?.message ?? 'Could not save the customer.';
      return null;
    });

    this.saving = false;

    if (res) {
      this.notice = d.id ? 'Customer updated.' : 'Customer added.';
      this.draft = null;
      this.history = [];
      await this.load();
    }
    this.cdr.detectChanges();
  }

  trackById = (_: number, c: ContactDto) => c.id;
}
