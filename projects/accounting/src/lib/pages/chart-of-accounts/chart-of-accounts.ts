import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { LedgerService } from '../../services/ledger.service';
import { LedgerAccountService } from '../../services/ledger-account.service';
import { AccountCategoryService } from '../../services/account-category.service';
import { GeoService, CurrencyDto } from '../../services/geo.service';
import { LedgerDto } from '../../models/ledger.model';
import { CreateLedgerAccountDto, LedgerAccountDto, UpdateLedgerAccountDto } from '../../models/ledger-account.model';
import { AccountCategoryDto } from '../../models/account-category.model';
import { PaginationParams } from '../../models';
import { EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField } from '@nexcore/core';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityPickerInputComponent],
  templateUrl: './chart-of-accounts.html',
  styleUrl: './chart-of-accounts.css',
})
export class ChartOfAccounts implements OnInit {
  ledgers: LedgerDto[] = [];
  selectedLedgerId = '';
  accounts: LedgerAccountDto[] = [];
  categories: AccountCategoryDto[] = [];
  loading = false;
  error = '';
  successMsg = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  filterSearch = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchDebounce: any;

  highlighter = new RowHighlighter();

  selectedAccount: LedgerAccountDto | null = null;
  subledgerAccounts: LedgerAccountDto[] = [];
  loadingSubledger = false;

  allAccounts: EntityPickerItem[] = [];
  readonly accountDisplayFields: EntityPickerDisplayField[] = [
    { key: 'accountNumber', style: 'code' },
    { key: 'accountName', style: 'name' },
  ];
  readonly accountColumns: EntityPickerColumn[] = [
    { key: 'accountNumber', header: 'Account #' },
    { key: 'accountName', header: 'Name' },
    { key: 'currencyCode', header: 'Currency' },
  ];

  currencies: CurrencyDto[] = [];

  categoryOptions: AccountCategoryDto[] = [];

  showForm = false;
  editingAccount: LedgerAccountDto | null = null;
  formAccountNumber = '';
  formAccountName = '';
  formCategoryId = '';
  formParentAccountId = '';
  formCurrencyCode = '';
  formIsPostingAllowed = true;
  formIsControlAccount = false;
  formAllowManualEntry = true;
  formIsSubledgerAccount = false;
  formSubledgerMasterAccountId = '';
  formIsActive = true;
  formDescription = '';
  formManualCode = false;

  constructor(
    private ledgerService: LedgerService,
    private ledgerAccountService: LedgerAccountService,
    private categoryService: AccountCategoryService,
    private geoService: GeoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.ledgerService.getAll({ pageSize: 1000 }).subscribe({
      next: (res) => {
        this.ledgers = res.data ?? [];
        if (this.ledgers.length > 0) {
          this.selectedLedgerId = this.ledgers[0].id;
          this.loadAccounts();
          this.loadAllAccountsForPicker();
        }
        this.cdr.detectChanges();
      },
    });
    this.categoryService.getAll({ pageSize: 1000 }).subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.buildCategoryOptions();
        this.cdr.detectChanges();
      },
    });
    this.geoService.getCurrencies().subscribe({
      next: (data) => { this.currencies = data; this.cdr.detectChanges(); },
    });
  }

  loadAccounts() {
    if (!this.selectedLedgerId) return;
    this.loading = true;
    this.error = '';
    this.selectedAccount = null;
    const pagination: PaginationParams = {
      pageNumber: this.page,
      pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };
    this.ledgerAccountService.getByLedger(this.selectedLedgerId, pagination).subscribe({
      next: (res) => {
        this.accounts = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load chart of accounts';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onLedgerChange() {
    this.page = 1;
    this.allAccounts = [];
    this.loadAccounts();
    this.loadAllAccountsForPicker();
  }

  applyFilters(): void {
    this.page = 1;
    this.loadAccounts();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.loadAccounts();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }

  goToPage(page: number) {
    this.page = page;
    this.loadAccounts();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadAccounts();
  }

  private loadAllAccountsForPicker(): void {
    if (!this.selectedLedgerId) return;
    this.ledgerAccountService.getChartOfAccounts(this.selectedLedgerId, { pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        let all = [...(r.data ?? [])];
        const ps = r.pagination?.pageSize ?? (all.length || 100);
        const totalPages = r.pagination?.totalPages
          ?? (r.pagination ? Math.ceil(r.pagination.totalCount / ps) : 1);
        if (!totalPages || totalPages <= 1) {
          this.allAccounts = all as unknown as EntityPickerItem[];
          this.cdr.detectChanges();
          return;
        }
        const pageNos: number[] = [];
        for (let pg = 2; pg <= totalPages; pg++) pageNos.push(pg);
        forkJoin(pageNos.map(pg =>
          this.ledgerAccountService.getChartOfAccounts(this.selectedLedgerId, { pageNumber: pg, pageSize: ps })
        )).subscribe({
          next: (pages) => {
            for (const pr of pages) all = all.concat(pr.data ?? []);
            this.allAccounts = all as unknown as EntityPickerItem[];
            this.cdr.detectChanges();
          },
          error: () => { this.allAccounts = all as unknown as EntityPickerItem[]; this.cdr.detectChanges(); },
        });
      },
    });
  }

  parentAccountLabel(id: string): string {
    if (!id) return '';
    const a = this.allAccounts.find(x => x['id'] === id);
    if (!a) return id;
    const num = a['accountNumber'] ?? '';
    const name = a['accountName'] ?? '';
    return num && name ? `${num} - ${name}` : (name || num || id);
  }

  private buildCategoryOptions(): void {
    this.categoryOptions = [...this.categories];
  }

  /** Account number of the currently selected parent (empty if none). */
  get selectedParentNo(): string {
    if (!this.formParentAccountId) return '';
    const a = this.allAccounts.find(x => x['id'] === this.formParentAccountId);
    return a ? String(a['accountNumber'] ?? '') : '';
  }

  /**
   * Next available child code for a parent: the parent code with the next
   * sequence number appended (no zero-padding), e.g.
   *   1140 (no children)     → 11401
   *   1140 (has 11401/11402) → 11403
   *   11402                  → 114021
   * Any code already present in the ledger is skipped to avoid duplicates.
   */
  generateChildCode(parentNo: string): string {
    if (!/^\d+$/.test(parentNo)) return '';

    // Direct children = numeric codes that extend the parent at the shortest level.
    const descendantLens = this.allAccounts
      .map(a => String(a['accountNumber'] ?? ''))
      .filter(c => /^\d+$/.test(c) && c.length > parentNo.length && c.startsWith(parentNo))
      .map(c => c.length);
    const childLen = descendantLens.length ? Math.min(...descendantLens) : 0;
    const childCodes = childLen
      ? this.allAccounts
          .map(a => String(a['accountNumber'] ?? ''))
          .filter(c => /^\d+$/.test(c) && c.length === childLen && c.startsWith(parentNo))
      : [];

    const maxSuffix = childCodes.reduce((max, c) => {
      const suffix = parseInt(c.slice(parentNo.length), 10);
      return isNaN(suffix) ? max : Math.max(max, suffix);
    }, 0);

    const takenCodes = new Set(
      this.allAccounts.map(a => String(a['accountNumber'] ?? '')).filter(c => /^\d+$/.test(c))
    );

    let seq = maxSuffix + 1;
    let candidate = `${parentNo}${seq}`;
    while (takenCodes.has(candidate)) {
      seq++;
      candidate = `${parentNo}${seq}`;
    }
    return candidate;
  }

  /** Fill the account number from the selected parent (auto mode only). */
  applyAutoCode(): void {
    if (this.editingAccount || this.formManualCode) return;
    const parentNo = this.selectedParentNo;
    this.formAccountNumber = parentNo ? this.generateChildCode(parentNo) : '';
  }

  onParentSelected(item: EntityPickerItem): void {
    this.formParentAccountId = item['id'] as string;
    this.applyAutoCode();
  }

  onManualCodeToggle(): void {
    // Switching back to auto re-generates from the selected parent.
    if (!this.formManualCode) this.applyAutoCode();
  }

  /** Live availability of the typed account number (create mode). */
  get codeStatus(): { state: 'empty' | 'duplicate' | 'available'; message: string } {
    const code = (this.formAccountNumber ?? '').trim();
    if (!code) return { state: 'empty', message: '' };
    const dup = this.allAccounts.find(a =>
      String(a['accountNumber'] ?? '') === code &&
      (!this.editingAccount || a['id'] !== this.editingAccount.id));
    return dup
      ? { state: 'duplicate', message: `Code ${code} is already used by "${dup['accountName']}".` }
      : { state: 'available', message: `Code ${code} is available.` };
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find((c) => c.id === categoryId)?.name ?? '—';
  }

  viewAccount(account: LedgerAccountDto) {
    this.selectedAccount = account;
    this.subledgerAccounts = [];
    this.showForm = false;
    if (account.isControlAccount) {
      this.loadingSubledger = true;
      this.ledgerAccountService.getSubledger(this.selectedLedgerId, account.id, { pageSize: 1000 }).subscribe({
        next: (res) => {
          this.subledgerAccounts = res.data ?? [];
          this.loadingSubledger = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loadingSubledger = false; this.cdr.detectChanges(); },
      });
    }
  }

  closeDetail() {
    this.selectedAccount = null;
  }

  openCreateForm() {
    this.editingAccount = null;
    this.resetForm();
    this.showForm = true;
    this.selectedAccount = null;
  }

  openEditForm(account: LedgerAccountDto) {
    this.editingAccount = account;
    this.formAccountNumber = account.accountNumber ?? '';
    this.formAccountName = account.accountName ?? '';
    this.formCategoryId = account.categoryId ?? '';
    this.formParentAccountId = account.parentAccountId ?? '';
    this.formCurrencyCode = account.currencyCode ?? '';
    this.formIsPostingAllowed = account.isPostingAllowed;
    this.formIsControlAccount = account.isControlAccount;
    this.formAllowManualEntry = account.allowManualEntry;
    this.formIsSubledgerAccount = false;
    this.formSubledgerMasterAccountId = '';
    this.formIsActive = account.isActive;
    this.formDescription = account.description ?? '';
    this.showForm = true;
    this.selectedAccount = null;
  }

  resetForm() {
    this.formAccountNumber = '';
    this.formAccountName = '';
    this.formCategoryId = '';
    this.formParentAccountId = '';
    this.formCurrencyCode = 'PKR';
    this.formIsPostingAllowed = true;
    this.formIsControlAccount = false;
    this.formAllowManualEntry = true;
    this.formIsSubledgerAccount = false;
    this.formSubledgerMasterAccountId = '';
    this.formIsActive = true;
    this.formDescription = '';
    this.formManualCode = false;
  }

  cancelForm() {
    this.showForm = false;
    this.editingAccount = null;
    this.resetForm();
  }

  saveAccount() {
    if (this.editingAccount) {
      const dto: UpdateLedgerAccountDto = {
        accountName: this.formAccountName,
        categoryId: this.formCategoryId || null,
        parentAccountId: this.formParentAccountId || null,
        isPostingAllowed: this.formIsPostingAllowed,
        isControlAccount: this.formIsControlAccount,
        currencyCode: this.formCurrencyCode || null,
        allowManualEntry: this.formAllowManualEntry,
        isActive: this.formIsActive,
        description: this.formDescription || null,
      };
      this.ledgerAccountService.update(this.editingAccount.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.successMsg = 'Account updated successfully';
          this.cdr.detectChanges();
          this.loadAccounts();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to update account'; this.cdr.detectChanges(); },
      });
    } else {
      if (!this.formAccountNumber.trim()) {
        this.error = 'Account number is required';
        this.cdr.detectChanges();
        return;
      }
      if (this.codeStatus.state === 'duplicate') {
        this.error = this.codeStatus.message;
        this.cdr.detectChanges();
        return;
      }
      const dto: CreateLedgerAccountDto = {
        ledgerId: this.selectedLedgerId,
        accountNumber: this.formAccountNumber,
        accountName: this.formAccountName,
        categoryId: this.formCategoryId,
        parentAccountId: this.formParentAccountId || null,
        isPostingAllowed: this.formIsPostingAllowed,
        isControlAccount: this.formIsControlAccount,
        currencyCode: this.formCurrencyCode || null,
        allowManualEntry: this.formAllowManualEntry,
        isSubledgerAccount: this.formIsSubledgerAccount,
        subledgerMasterAccountId: this.formSubledgerMasterAccountId || null,
        description: this.formDescription || null,
      };
      this.ledgerAccountService.create(dto).subscribe({
        next: (res) => {
          this.showForm = false;
          this.successMsg = 'Account created successfully';
          this.cdr.detectChanges();
          this.loadAccounts();
          this.highlighter.flash(res.data?.id, this.cdr);
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to create account'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteAccount(account: LedgerAccountDto) {
    if (confirm(`Delete account "${account.accountNumber} - ${account.accountName}"?`)) {
      this.ledgerAccountService.delete(account.id).subscribe({
        next: () => {
          this.successMsg = 'Account deleted';
          this.cdr.detectChanges();
          this.loadAccounts();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to delete account'; this.cdr.detectChanges(); },
      });
    }
  }
}
