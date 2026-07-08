import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DealService } from '../../services/deal.service';
import { DealDto, CreateDealDto, UpdateDealDto } from '../../models/deal.model';
import { AccountDto } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';

type SelectOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'lib-deals',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LookupDropdownComponent],
  templateUrl: './deals.html',
  styleUrl: './deals.css',
})
export class DealsComponent implements OnInit {
  deals: DealDto[] = [];
  accounts: AccountDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingDeal: DealDto | null = null;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [10, 25, 50, 100];
  searchTerm      = '';

  private get _sortedDeals(): DealDto[] {
    return [...this.deals].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  private get _searchFiltered(): DealDto[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this._sortedDeals;
    return this._sortedDeals.filter(d =>
      `${d.opportunityName ?? ''} ${d.accountName ?? ''} ${d.stage ?? ''}`.toLowerCase().includes(q)
    );
  }

  get totalCount(): number { return this._searchFiltered.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize))); }
  get firstEntry(): number { return this.totalCount === 0 ? 0 : (this.page - 1) * Number(this.pageSize) + 1; }
  get lastEntry():  number { return Math.min(this.page * Number(this.pageSize), this.totalCount); }

  get filteredDeals(): DealDto[] {
    const start = (this.page - 1) * Number(this.pageSize);
    return this._searchFiltered.slice(start, start + Number(this.pageSize));
  }

  formOpportunityName = '';
  formAccountId = '';
  formAmount: number | null = null;
  formStage = '';
  formProbability: number | null = null;
  formCloseDate = '';
  formNextStep = '';
  formDescription = '';

  readonly stageOptions: SelectOption[] = [
    { value: 'Qualify',          label: 'Qualify'          },
    { value: 'Meet and Present', label: 'Meet and Present' },
    { value: 'Propose',          label: 'Propose'          },
    { value: 'Negotiate',        label: 'Negotiate'        },
    { value: 'Closed Won',       label: 'Closed Won'       },
    { value: 'Closed Lost',      label: 'Closed Lost'      },
  ];
  accountOptions: SelectOption[] = [];

  get isFormValid(): boolean {
    return !!this.formOpportunityName.trim()
      && !!this.formAccountId
      && !!this.formCloseDate
      && this.formAmount !== null
      && this.formAmount > 0;
  }

  getAccountName(accountId: string): string {
    return this.accounts.find(a => a.id === accountId)?.accountName || '—';
  }

  constructor(
    private dealService: DealService,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadAccounts();
    this.loadDeals();
  }

  loadAccounts() {
    this.accountService.getAll({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.accounts = res.data ?? [];
        this.accountOptions = this.accounts.map(a => ({ value: a.id, label: a.accountName || 'Untitled Account' }));
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep account dropdown empty when endpoint is unavailable.
      },
    });
  }

  loadDeals() {
    this.loading = true;
    this.error = '';
    this.dealService.getAll({ pageSize: 10000 }).subscribe({
      next: (res) => {
        this.deals   = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Failed to load deals';
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
    this.editingDeal = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(deal: DealDto) {
    this.editingDeal = deal;
    this.formOpportunityName = deal.opportunityName ?? '';
    this.formAccountId = deal.accountId;
    this.formAmount = deal.amount ?? null;
    this.formStage = deal.stage ?? '';
    this.formProbability = deal.probability ?? null;
    this.formCloseDate = deal.closeDate;
    this.formNextStep = deal.nextStep ?? '';
    this.formDescription = deal.description ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formOpportunityName = '';
    this.formAccountId = '';
    this.formAmount = null;
    this.formStage = '';
    this.formProbability = null;
    this.formCloseDate = '';
    this.formNextStep = '';
    this.formDescription = '';
  }

  cancelForm() {
    this.showForm = false;
    this.editingDeal = null;
    this.resetForm();
  }

  saveDeal() {
    if (this.editingDeal) {
      const dto: UpdateDealDto = {
        opportunityName: this.formOpportunityName,
        accountId: this.formAccountId,
        amount: this.formAmount,
        stage: this.formStage,
        probability: this.formProbability,
        closeDate: this.formCloseDate,
        nextStep: this.formNextStep,
        description: this.formDescription,
      };
      this.dealService.update(this.editingDeal.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadDeals(); },
        error: () => { this.error = 'Failed to update deal'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateDealDto = {
        opportunityName: this.formOpportunityName,
        accountId: this.formAccountId,
        amount: this.formAmount,
        stage: this.formStage,
        probability: this.formProbability,
        closeDate: this.formCloseDate,
        nextStep: this.formNextStep,
        description: this.formDescription,
      };
      this.dealService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadDeals(); },
        error: () => { this.error = 'Failed to create deal'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteDeal(id: string) {
    if (!confirm('Delete this deal?')) return;
    this.dealService.delete(id).subscribe({
      next: () => this.loadDeals(),
      error: () => { this.error = 'Failed to delete deal'; this.cdr.detectChanges(); },
    });
  }
}
