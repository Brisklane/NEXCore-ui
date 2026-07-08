import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { CaseDto, CreateCaseDto, UpdateCaseDto } from '../../models/case.model';
import { AccountDto } from '../../models/account.model';
import { ContactDto } from '../../models/contact.model';
import { CrmLookupItemDto } from '../../models/crm-lookup.model';
import { AccountService } from '../../services/account.service';
import { ContactService } from '../../services/contact.service';
import { CrmLookupService } from '../../services/crm-lookup.service';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';

type SelectOption = {
  label: string;
  value: string;
};

type ContactOption = {
  id: string;
  label: string;
};

@Component({
  selector: 'lib-cases',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LookupDropdownComponent],
  templateUrl: './cases.html',
  styleUrl: './cases.css',
})
export class CasesComponent implements OnInit {
  cases: CaseDto[] = [];
  accounts: AccountDto[] = [];
  contacts: ContactDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingCase: CaseDto | null = null;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [10, 25, 50, 100];
  searchTerm      = '';

  private get _sortedCases(): CaseDto[] {
    return [...this.cases].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  private get _searchFiltered(): CaseDto[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this._sortedCases;
    return this._sortedCases.filter(c =>
      `${c.caseNumber ?? ''} ${c.subject ?? ''} ${c.accountName ?? ''} ${c.status ?? ''} ${c.priority ?? ''}`.toLowerCase().includes(q)
    );
  }

  get totalCount(): number { return this._searchFiltered.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize))); }
  get firstEntry(): number { return this.totalCount === 0 ? 0 : (this.page - 1) * Number(this.pageSize) + 1; }
  get lastEntry():  number { return Math.min(this.page * Number(this.pageSize), this.totalCount); }

  get filteredCases(): CaseDto[] {
    const start = (this.page - 1) * Number(this.pageSize);
    return this._searchFiltered.slice(start, start + Number(this.pageSize));
  }

  formSubject = '';
  formStatus = '';
  formPriority = '';
  formCaseOrigin = '';
  formAccountId = '';
  formContactId = '';
  formDescription = '';
  formSendNotificationEmail = false;

  statusOptions: SelectOption[] = [];
  caseOriginOptions: SelectOption[] = [];
  priorityOptions: SelectOption[] = [];
  contactOptions: ContactOption[] = [];
  accountLookupOptions: Array<{ value: string; label: string }> = [];
  contactLookupOptions: Array<{ value: string; label: string }> = [];

  constructor(
    private caseService: CaseService,
    private accountService: AccountService,
    private contactService: ContactService,
    private crmLookupService: CrmLookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadAccounts();
    this.loadContacts();
    this.loadCases();
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

  loadLookups() {
    this.crmLookupService.getCaseStatuses().subscribe({
      next: (res) => {
        const options = this.mapLookupItemsToOptions(res.data);
        if (options.length > 0) {
          this.statusOptions = options;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep dropdown empty when endpoint is unavailable.
      },
    });

    this.crmLookupService.getCaseOrigins().subscribe({
      next: (res) => {
        const options = this.mapLookupItemsToOptions(res.data);
        if (options.length > 0) {
          this.caseOriginOptions = options;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep dropdown empty when endpoint is unavailable.
      },
    });

    this.crmLookupService.getCasePriorities().subscribe({
      next: (res) => {
        const options = this.mapLookupItemsToOptions(res.data);
        if (options.length > 0) {
          this.priorityOptions = options;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep dropdown empty when endpoint is unavailable.
      },
    });
  }

  loadAccounts() {
    this.accountService.getAll({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.accounts = res.data ?? [];
        this.accountLookupOptions = this.accounts.map(a => ({
          value: a.id,
          label: a.accountName || 'Untitled Account',
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep dropdown empty when endpoint is unavailable.
      },
    });
  }

  loadContacts() {
    this.contactService.getAll({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.contacts = res.data ?? [];
        this.contactOptions = this.contacts.map((contact) => {
          const firstName = contact.firstName?.trim() ?? '';
          const lastName = contact.lastName?.trim() ?? '';
          const fullName = `${firstName} ${lastName}`.trim();
          return {
            id: contact.id,
            label: fullName || contact.email || 'Unnamed Contact',
          };
        });
        this.contactLookupOptions = this.contactOptions.map(o => ({ value: o.id, label: o.label }));
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep dropdown empty when endpoint is unavailable.
      },
    });
  }

  loadCases() {
    this.loading = true;
    this.error = '';
    this.caseService.getAll({ pageSize: 10000 }).subscribe({
      next: (res) => {
        this.cases   = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Failed to load cases';
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
    this.editingCase = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(c: CaseDto) {
    this.editingCase = c;
    this.formSubject = c.subject ?? '';
    this.formStatus = c.status ?? '';
    this.formPriority = c.priority ?? '';
    this.formCaseOrigin = c.caseOrigin ?? '';
    this.formAccountId = c.accountId ?? '';
    this.formContactId = c.contactId ?? '';
    this.formDescription = c.description ?? '';
    this.formSendNotificationEmail = c.sendNotificationEmail;
    this.showForm = true;
  }

  resetForm() {
    this.formSubject = '';
    this.formStatus = '';
    this.formPriority = '';
    this.formCaseOrigin = '';
    this.formAccountId = '';
    this.formContactId = '';
    this.formDescription = '';
    this.formSendNotificationEmail = false;
  }

  cancelForm() {
    this.showForm = false;
    this.editingCase = null;
    this.resetForm();
  }

  saveCase() {
    if (this.editingCase) {
      const dto: UpdateCaseDto = {
        subject: this.formSubject,
        status: this.formStatus,
        priority: this.formPriority,
        caseOrigin: this.formCaseOrigin,
        accountId: this.formAccountId || null,
        contactId: this.formContactId || null,
        description: this.formDescription,
        sendNotificationEmail: this.formSendNotificationEmail,
      };
      this.caseService.update(this.editingCase.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadCases(); },
        error: () => { this.error = 'Failed to update case'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateCaseDto = {
        status: this.formStatus,
        subject: this.formSubject,
        priority: this.formPriority,
        caseOrigin: this.formCaseOrigin,
        accountId: this.formAccountId || null,
        contactId: this.formContactId || null,
        description: this.formDescription,
        sendNotificationEmail: this.formSendNotificationEmail,
      };
      this.caseService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadCases(); },
        error: () => { this.error = 'Failed to create case'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteCase(id: string) {
    if (!confirm('Delete this case?')) return;
    this.caseService.delete(id).subscribe({
      next: () => this.loadCases(),
      error: () => { this.error = 'Failed to delete case'; this.cdr.detectChanges(); },
    });
  }
}
