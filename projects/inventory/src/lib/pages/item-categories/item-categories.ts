import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField } from '@nexcore/core';
import { LedgerService, LedgerAccountService } from '@nexcore/accounting';
import { RowHighlighter } from '@nexcore/shared';
import { ItemCategoryService } from '../../services/item-category.service';
import { ItemCategoryDto, CreateItemCategoryDto, UpdateItemCategoryDto } from '../../models/item-category.model';

@Component({
  selector: 'lib-item-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityPickerInputComponent],
  templateUrl: './item-categories.html',
  styleUrl: './item-categories.css',
})
export class ItemCategoriesPage implements OnInit {
  items: ItemCategoryDto[] = [];
  loading = false; error = ''; showForm = false;
  formTab: 'basic' | 'accounts' = 'basic';
  editingItem: ItemCategoryDto | null = null;

  /** Flashes the newly-created row green and floats it to the top. */
  highlighter = new RowHighlighter();
  private justCreated: ItemCategoryDto | null = null;

  filterSearch = '';
  filterStatus = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  formCode = ''; formName = ''; formDescription = '';
  formParentCategoryId = ''; formIsActive = true;

  // Create-only GL account fields (account numbers for auto-assign)
  formParentInventoryAccountNo = ''; formParentCogsAccountNo = '';
  formParentPurchaseAccountNo = ''; formParentSalesAccountNo = '';

  // Edit-only GL account ID fields
  formInventoryAccountId = ''; formCogsAccountId = '';
  formPurchaseAccountId = ''; formSalesAccountId = '';
  formClearGlAccounts = false;
  formAutoGenerateSubAccounts = true;
  saveAttempted = false;
  generatingGlAccounts = false;
  generateGlSuccess = '';
  showGenerateConfirm = false;

  get editingHasGlAccounts(): boolean {
    return !!(this.editingItem?.inventoryAccountId || this.editingItem?.cogsAccountId ||
              this.editingItem?.purchaseAccountId  || this.editingItem?.salesAccountId);
  }

  private lookupByNo(no: string): { exists: boolean; id: string; name: string } {
    if (!no) return { exists: false, id: '', name: '' };
    const a = this.glAccounts.find(x => x['accountNumber'] === no);
    return { exists: !!a, id: a ? (a['id'] as string) : '', name: a ? (a['accountName'] as string) : '' };
  }

  get parentValidation() {
    return {
      inventory: { label: 'Inventory', no: this.formParentInventoryAccountNo, ...this.lookupByNo(this.formParentInventoryAccountNo) },
      cogs:      { label: 'COGS',      no: this.formParentCogsAccountNo,      ...this.lookupByNo(this.formParentCogsAccountNo) },
      purchase:  { label: 'Purchase',  no: this.formParentPurchaseAccountNo,  ...this.lookupByNo(this.formParentPurchaseAccountNo) },
      sales:     { label: 'Sales',     no: this.formParentSalesAccountNo,     ...this.lookupByNo(this.formParentSalesAccountNo) },
    };
  }

  get missingParents(): { label: string; no: string }[] {
    const v = this.parentValidation;
    return [v.inventory, v.cogs, v.purchase, v.sales].filter(x => x.no && !x.exists);
  }

  get foundParents(): { label: string; no: string; name: string; subNo: string; subName: string }[] {
    const v = this.parentValidation;
    const catName = this.editingItem?.name ?? this.formName ?? '';
    return [v.inventory, v.cogs, v.purchase, v.sales]
      .filter(x => x.no && x.exists)
      .map(x => ({
        ...x,
        subNo: this.generateChildCode(x.no, this.childAccountsForParent(x.no)),
        subName: catName ? `${catName} - ${x.label}` : x.label,
      }));
  }

  get missingParentsSummary(): string {
    return this.missingParents.map(p => `${p.label} (${p.no})`).join(', ');
  }

  // GL Account picker data
  glAccounts: EntityPickerItem[] = [];
  private ledgerId = '';
  readonly accountDisplayFields: EntityPickerDisplayField[] = [
    { key: 'accountNumber', style: 'code' },
    { key: 'accountName', style: 'name' },
  ];
  readonly accountColumns: EntityPickerColumn[] = [
    { key: 'accountNumber', header: 'Account #' },
    { key: 'accountName', header: 'Name' },
    { key: 'currencyCode', header: 'Currency' },
  ];

  page = 1; pageSize = 10; totalCount = 0; totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  constructor(
    private service: ItemCategoryService,
    private ledgerService: LedgerService,
    private ledgerAccountService: LedgerAccountService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadAllGlAccounts();
  }

  /**
   * Load the FULL chart of accounts across all pages.
   * The API caps PageSize (≈100) regardless of what we request, so a single call
   * silently drops higher-numbered accounts (e.g. 5xxx COGS accounts) — which then
   * render as raw GUIDs in the pickers. We page through until every account is loaded.
   */
  private loadAllGlAccounts(): void {
    this.ledgerService.getAll({ pageSize: 100 }).subscribe({
      next: (res) => {
        const first = (res.data ?? [])[0];
        if (!first?.id) return;
        this.ledgerId = first.id as string;
        this.ledgerAccountService.getChartOfAccounts(this.ledgerId, { pageNumber: 1, pageSize: 200 }).subscribe({
          next: (r) => {
            let all = [...(r.data ?? [])];
            const ps = r.pagination?.pageSize ?? (all.length || 100);
            const totalPages = r.pagination?.totalPages
              ?? (r.pagination ? Math.ceil(r.pagination.totalCount / ps) : 1);
            if (!totalPages || totalPages <= 1) {
              this.glAccounts = this.toPickerItems(all);
              this.autoSelectDefaultChildren();
              this.cdr.detectChanges();
              return;
            }
            const pageNos: number[] = [];
            for (let pg = 2; pg <= totalPages; pg++) pageNos.push(pg);
            forkJoin(pageNos.map(pg =>
              this.ledgerAccountService.getChartOfAccounts(this.ledgerId, { pageNumber: pg, pageSize: ps })
            )).subscribe({
              next: (pages) => {
                for (const pr of pages) all = all.concat(pr.data ?? []);
                this.glAccounts = this.toPickerItems(all);
                this.autoSelectDefaultChildren();
                this.cdr.detectChanges();
              },
              error: () => {
                this.glAccounts = this.toPickerItems(all);
                this.autoSelectDefaultChildren();
                this.cdr.detectChanges();
              },
            });
          },
        });
      },
    });
  }

  private toPickerItems(all: object[]): EntityPickerItem[] {
    return (all as EntityPickerItem[]).map(item => ({
      ...item,
      accountName: this.cleanName(item['accountName'] as string),
    }));
  }

  private cleanName(raw: string | null | undefined): string {
    if (!raw) return '';
    return (raw as string)
      .replace(/\s*[—–�]\s*/g, ' - ')
      .replace(/\s+\?\s+/g, ' - ');
  }

  accountLabel(id: string): string {
    if (!id) return '';
    const a = this.glAccounts.find(x => x['id'] === id);
    if (!a) return id;
    const num = (a['accountNumber'] ?? '') as string;
    const name = this.cleanName(a['accountName'] as string);
    if (!name) return num || id;
    // If the account number has a non-numeric suffix (e.g. "1140-TABLETS" from the old
    // generated format), show only the numeric prefix to avoid redundancy with the name.
    const displayNum = /[A-Za-z]/.test(num) ? num.split('-')[0] : num;
    return displayNum ? `${displayNum} - ${name}` : name;
  }

  accountLabelByNumber(accountNo: string): string {
    if (!accountNo) return '';
    const a = this.glAccounts.find(x => x['accountNumber'] === accountNo);
    if (!a) return accountNo;
    const name = this.cleanName(a['accountName'] as string);
    return name ? `${accountNo} - ${name}` : accountNo;
  }

  /**
   * Direct children of a parent account, Odoo-style.
   *
   * A child's code is the parent's code with extra digits appended, e.g.
   *   1      → 111, 112        (Assets → Non Current / Current)
   *   111    → 1111, 1112      (→ Property Plant & Equipment / Intangible Assets)
   *   1111   → 1111001, 1111002 (→ Building / Furniture and Fixture)
   *   1140   → 1140001, 1140002 (the leaf inventory/COGS/etc. accounts we generate)
   *
   * Only the IMMEDIATE next level is returned: for parent 1111 we return the
   * 7-digit 1111xxx leaves, not the deeper grandchildren. The next-level width is
   * inferred from the shortest descendant code so the scheme adapts to charts that
   * use different digit-widths per branch (the 1xxx and 2xxx trees differ in Odoo).
   */
  childAccountsForParent(parentNo: string): EntityPickerItem[] {
    if (!parentNo) return [];
    const parent = this.glAccounts.find(a => a['accountNumber'] === parentNo);
    const parentId = parent ? (parent['id'] as string) : '';
    const parentIsNumeric = /^\d+$/.test(parentNo);

    // Discover the immediate child level = shortest descendant code that extends the parent.
    const descendantLens = this.glAccounts
      .map(a => String(a['accountNumber'] ?? ''))
      .filter(c => parentIsNumeric && /^\d+$/.test(c) && c.length > parentNo.length && c.startsWith(parentNo))
      .map(c => c.length);
    const childLen = descendantLens.length ? Math.min(...descendantLens) : 0;

    const seen = new Set<string>();
    const result: EntityPickerItem[] = [];
    for (const a of this.glAccounts) {
      const id = a['id'] as string;
      if (id === parentId || seen.has(id)) continue;
      const code = String(a['accountNumber'] ?? '');

      // 1. Explicit DB parentAccountId link (most reliable)
      if (parentId && a['parentAccountId'] === parentId) {
        result.push(a); seen.add(id); continue;
      }
      // 2. Hierarchical prefix at the immediate child level only
      if (parentIsNumeric && childLen > 0 && code.length === childLen && /^\d+$/.test(code) && code.startsWith(parentNo)) {
        result.push(a); seen.add(id); continue;
      }
      // 3. Legacy prefix format: "1140-TABLETS", "5100-TELEVI", etc.
      if (code.toUpperCase().startsWith(`${parentNo}-`)) {
        result.push(a); seen.add(id);
      }
    }
    return result.sort((a, b) =>
      String(a['accountNumber'] ?? '').localeCompare(String(b['accountNumber'] ?? ''), undefined, { numeric: true }));
  }

  /**
   * Next available child code for a parent: the parent code with the next
   * sequence number appended (no zero-padding — increment by one).
   *   1140 (no children)     → 11401
   *   1140 (has 11401/11402) → 11403
   *   5100                   → 51001
   *   4100                   → 41001
   */
  generateChildCode(parentNo: string, siblings: EntityPickerItem[]): string {
    if (!/^\d+$/.test(parentNo)) return `${parentNo}-1`;

    // Existing direct numeric children (codes that extend the parent's prefix).
    const childCodes = siblings
      .map(s => String(s['accountNumber'] ?? ''))
      .filter(c => /^\d+$/.test(c) && c.length > parentNo.length && c.startsWith(parentNo));

    // Highest sequence already used among the direct children (0 if none yet).
    const maxSuffix = childCodes.reduce((max, c) => {
      const suffix = parseInt(c.slice(parentNo.length), 10);
      return isNaN(suffix) ? max : Math.max(max, suffix);
    }, 0);

    // Skip any code already present anywhere in the ledger (avoids collisions).
    const takenCodes = new Set(
      this.glAccounts.map(a => String(a['accountNumber'] ?? '')).filter(c => /^\d+$/.test(c))
    );

    let seq = maxSuffix + 1;
    let candidate = `${parentNo}${seq}`;
    while (takenCodes.has(candidate)) {
      seq++;
      candidate = `${parentNo}${seq}`;
    }
    return candidate;
  }

  get inventoryCreatePreviewCode(): string { return this.formParentInventoryAccountNo ? this.generateChildCode(this.formParentInventoryAccountNo, this.childAccountsForParent(this.formParentInventoryAccountNo)) : ''; }
  get cogsCreatePreviewCode(): string { return this.formParentCogsAccountNo ? this.generateChildCode(this.formParentCogsAccountNo, this.childAccountsForParent(this.formParentCogsAccountNo)) : ''; }
  get purchaseCreatePreviewCode(): string { return this.formParentPurchaseAccountNo ? this.generateChildCode(this.formParentPurchaseAccountNo, this.childAccountsForParent(this.formParentPurchaseAccountNo)) : ''; }
  get salesCreatePreviewCode(): string { return this.formParentSalesAccountNo ? this.generateChildCode(this.formParentSalesAccountNo, this.childAccountsForParent(this.formParentSalesAccountNo)) : ''; }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private autoSelectDefaultChildren(): void {}

  onParentInventorySelected(item: EntityPickerItem): void {
    this.formParentInventoryAccountNo = item['accountNumber'] as string;
    this.formInventoryAccountId = '';
  }

  onParentCogsSelected(item: EntityPickerItem): void {
    this.formParentCogsAccountNo = item['accountNumber'] as string;
    this.formCogsAccountId = '';
  }

  onParentPurchaseSelected(item: EntityPickerItem): void {
    this.formParentPurchaseAccountNo = item['accountNumber'] as string;
    this.formPurchaseAccountId = '';
  }

  onParentSalesSelected(item: EntityPickerItem): void {
    this.formParentSalesAccountNo = item['accountNumber'] as string;
    this.formSalesAccountId = '';
  }

  private createAndSelectChildAccount(
    parentNo: string,
    nameOrCode: string,
    typeLabel: string,
    onSuccess: (id: string) => void,
    onError?: () => void,
  ): void {
    const parent = this.glAccounts.find(a => a['accountNumber'] === parentNo);
    if (!parent || !this.ledgerId) {
      this.error = 'Parent account or ledger not loaded. Try again in a moment.';
      this.cdr.detectChanges();
      return;
    }
    const siblings = this.childAccountsForParent(parentNo);
    // If user typed a pure integer treat it as the desired account code;
    // otherwise auto-generate the next sequential code and use the text as the name.
    const isCode = /^\d+$/.test(nameOrCode.trim());
    const code = isCode ? nameOrCode.trim() : this.generateChildCode(parentNo, siblings);
    const catName = this.editingItem?.name ?? this.formName ?? '';
    const accountName = isCode
      ? (catName ? `${catName} - ${typeLabel}` : typeLabel)
      : nameOrCode;
    this.ledgerAccountService.create({
      ledgerId: this.ledgerId,
      accountNumber: code,
      accountName: accountName,
      categoryId: parent['categoryId'] as string,
      parentAccountId: parent['id'] as string,
      isPostingAllowed: true,
      isControlAccount: false,
      allowManualEntry: true,
      isSubledgerAccount: false,
    }).subscribe({
      next: (res) => {
        if (res.data) {
          const newItem = res.data as unknown as EntityPickerItem;
          this.glAccounts = this.toPickerItems([...this.glAccounts, newItem]);
          onSuccess(res.data.id);
        } else {
          this.error = res.message || 'Failed to create account';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create account';
        if (onError) onError();
        this.cdr.detectChanges();
      },
    });
  }

  createInventoryChildAccount(name: string): void {
    this.createAndSelectChildAccount(this.formParentInventoryAccountNo, name, 'Inventory',
      (id) => { this.formInventoryAccountId = id; });
  }

  createCogsChildAccount(name: string): void {
    this.createAndSelectChildAccount(this.formParentCogsAccountNo, name, 'COGS',
      (id) => { this.formCogsAccountId = id; });
  }

  createPurchaseChildAccount(name: string): void {
    this.createAndSelectChildAccount(this.formParentPurchaseAccountNo, name, 'Purchase',
      (id) => { this.formPurchaseAccountId = id; });
  }

  createSalesChildAccount(name: string): void {
    this.createAndSelectChildAccount(this.formParentSalesAccountNo, name, 'Sales',
      (id) => { this.formSalesAccountId = id; });
  }

  get inventoryCreateDefaultName(): string { const n = this.editingItem?.name ?? this.formName ?? ''; return n ? `${n} - Inventory` : 'Inventory'; }
  get cogsCreateDefaultName(): string { const n = this.editingItem?.name ?? this.formName ?? ''; return n ? `${n} - COGS` : 'COGS'; }
  get purchaseCreateDefaultName(): string { const n = this.editingItem?.name ?? this.formName ?? ''; return n ? `${n} - Purchase` : 'Purchase'; }
  get salesCreateDefaultName(): string { const n = this.editingItem?.name ?? this.formName ?? ''; return n ? `${n} - Sales` : 'Sales'; }

  private searchDebounce: any;
  applyFilters(): void { this.page = 1; this.load(); }
  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }
  clearFilters(): void { this.filterSearch = ''; this.filterStatus = ''; this.page = 1; this.load(); }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy, sortDirection: this.sortDirection,
      isActive: this.filterStatus === '' ? undefined : this.filterStatus === 'active',
    }).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.applyJustCreated();
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load item categories'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  /** List ordered so the freshly-created row sits on top while it's highlighted. */
  get displayItems(): ItemCategoryDto[] {
    const id = this.highlighter.id;
    if (id == null) return this.items;
    const idx = this.items.findIndex(i => i.id === id);
    if (idx <= 0) return this.items;
    const copy = [...this.items];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  /** After a reload following a create, prepend the new row if it fell off the page/sort, then flash it. */
  private applyJustCreated(): void {
    const created = this.justCreated;
    if (!created) return;
    this.justCreated = null;
    if (!this.items.some(i => i.id === created.id)) this.items = [created, ...this.items];
    this.highlighter.flash(created.id, this.cdr);
  }

  goToPage(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }

  openCreateForm(): void {
    this.editingItem = null;
    this.resetForm();
    this.formCode = `CAT-${(this.totalCount + 1).toString().padStart(6, '0')}`;
    this.formTab = 'basic';
    this.showForm = true;
  }

  openEditForm(item: ItemCategoryDto): void {
    this.editingItem = item;
    this.formCode = item.code ?? ''; this.formName = item.name ?? '';
    this.formDescription = item.description ?? ''; this.formParentCategoryId = item.parentCategoryId ?? '';
    this.formIsActive = item.isActive;
    this.formInventoryAccountId = item.inventoryAccountId ?? '';
    this.formCogsAccountId = item.cogsAccountId ?? '';
    this.formPurchaseAccountId = item.purchaseAccountId ?? '';
    this.formSalesAccountId = item.salesAccountId ?? '';
    this.formClearGlAccounts = false;
    this.formParentInventoryAccountNo = '1140'; this.formParentCogsAccountNo = '5100';
    this.formParentPurchaseAccountNo = '2111'; this.formParentSalesAccountNo = '4100';
    this.generatingGlAccounts = false; this.generateGlSuccess = ''; this.showGenerateConfirm = false;
    this.error = '';
    this.formTab = 'basic'; this.showForm = true;
  }

  useParentAccountsDirectly(): void {
    const findId = (accountNo: string): string => {
      if (!accountNo) return '';
      const match = this.glAccounts.find(a => a['accountNumber'] === accountNo);
      return match ? (match['id'] as string ?? '') : '';
    };

    const invId = findId(this.formParentInventoryAccountNo);
    const cogsId = findId(this.formParentCogsAccountNo);
    const purId = findId(this.formParentPurchaseAccountNo);
    const salId = findId(this.formParentSalesAccountNo);

    if (!invId && !cogsId && !purId && !salId) {
      this.error = 'None of the selected parent accounts were found in the chart. Make sure the account numbers above match existing accounts.';
      this.cdr.detectChanges();
      return;
    }

    this.formInventoryAccountId = invId;
    this.formCogsAccountId = cogsId;
    this.formPurchaseAccountId = purId;
    this.formSalesAccountId = salId;
    this.generateGlSuccess = 'Accounts pre-filled from the chart. Click Save to confirm.';
    this.error = '';
    this.cdr.detectChanges();
  }

  requestGenerateConfirm(): void {
    this.showGenerateConfirm = true;
    this.error = '';
    this.cdr.detectChanges();
  }

  cancelGenerateConfirm(): void {
    this.showGenerateConfirm = false;
    this.cdr.detectChanges();
  }

  generateGlAccounts(onComplete?: () => void): void {
    this.showGenerateConfirm = false;
    if (!this.editingItem) return;
    this.generatingGlAccounts = true;
    this.generateGlSuccess = '';
    this.error = '';
    const catName = this.editingItem.name ?? this.formName ?? '';
    const done = () => {
      this.generatingGlAccounts = false;
      if (onComplete) { onComplete(); return; }
      this.generateGlSuccess = 'GL accounts created. Click Save to confirm.';
      this.cdr.detectChanges();
    };
    const fail = () => { this.generatingGlAccounts = false; this.cdr.detectChanges(); };

    // Create all 4 accounts sequentially so each generateChildCode call sees the previous sibling
    this.createAndSelectChildAccount(
      this.formParentInventoryAccountNo,
      catName ? `${catName} - Inventory` : 'Inventory',
      'Inventory',
      (invId) => {
        this.formInventoryAccountId = invId;
        this.createAndSelectChildAccount(
          this.formParentCogsAccountNo,
          catName ? `${catName} - COGS` : 'COGS',
          'COGS',
          (cogsId) => {
            this.formCogsAccountId = cogsId;
            this.createAndSelectChildAccount(
              this.formParentPurchaseAccountNo,
              catName ? `${catName} - Purchase` : 'Purchase',
              'Purchase',
              (purId) => {
                this.formPurchaseAccountId = purId;
                this.createAndSelectChildAccount(
                  this.formParentSalesAccountNo,
                  catName ? `${catName} - Sales` : 'Sales',
                  'Sales',
                  (salId) => { this.formSalesAccountId = salId; done(); },
                  fail,
                );
              },
              fail,
            );
          },
          fail,
        );
      },
      fail,
    );
  }

  resetForm(): void {
    this.formCode = ''; this.formName = ''; this.formDescription = '';
    this.formParentCategoryId = ''; this.formIsActive = true;
    this.formParentInventoryAccountNo = '1140';
    this.formParentCogsAccountNo = '5100';
    this.formParentPurchaseAccountNo = '2111';
    this.formParentSalesAccountNo = '4100';
    this.formInventoryAccountId = ''; this.formCogsAccountId = '';
    this.formPurchaseAccountId = ''; this.formSalesAccountId = '';
    this.formClearGlAccounts = false;
    this.formAutoGenerateSubAccounts = true;
    this.saveAttempted = false;
    this.generatingGlAccounts = false; this.generateGlSuccess = ''; this.showGenerateConfirm = false;
  }

  cancelForm(): void { this.showForm = false; this.editingItem = null; this.resetForm(); }

  save(): void {
    this.saveAttempted = true;
    this.error = '';

    if (!this.formName?.trim()) {
      this.error = 'Category name is required.';
      this.formTab = 'basic';
      this.cdr.detectChanges();
      return;
    }

    if (!this.editingItem && !this.formAutoGenerateSubAccounts) {
      const missing: string[] = [];
      if (!this.formInventoryAccountId) missing.push('Inventory');
      if (!this.formCogsAccountId) missing.push('COGS');
      if (!this.formPurchaseAccountId) missing.push('Purchase');
      if (!this.formSalesAccountId) missing.push('Sales');
      if (missing.length > 0) {
        this.error = `Please select a sub-account for: ${missing.join(', ')}. Or enable "Auto Generate Sub-Accounts".`;
        this.formTab = 'accounts';
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.editingItem) {
      const dto: UpdateItemCategoryDto = {
        code: this.formCode || null, name: this.formName || null,
        description: this.formDescription || null,
        parentCategoryId: this.formParentCategoryId || null,
        isActive: this.formIsActive,
        inventoryAccountId: this.formInventoryAccountId || null,
        cogsAccountId: this.formCogsAccountId || null,
        purchaseAccountId: this.formPurchaseAccountId || null,
        salesAccountId: this.formSalesAccountId || null,
        clearGlAccounts: this.formClearGlAccounts,
      };
      this.service.update(this.editingItem.id, dto).subscribe({
        next: (res) => {
          if (!res.success) { this.error = res.message || 'Failed to save'; this.cdr.detectChanges(); return; }
          this.showForm = false; this.load();
        },
        error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to save'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateItemCategoryDto = {
        code: this.formCode || null, name: this.formName || null,
        description: this.formDescription || null,
        parentCategoryId: this.formParentCategoryId || null,
        // Never send parent account numbers — we handle generation client-side
        parentInventoryAccountNo: null,
        parentCogsAccountNo: null,
        parentPurchaseAccountNo: null,
        parentSalesAccountNo: null,
        inventoryAccountId: this.formAutoGenerateSubAccounts ? null : (this.formInventoryAccountId || null),
        cogsAccountId: this.formAutoGenerateSubAccounts ? null : (this.formCogsAccountId || null),
        purchaseAccountId: this.formAutoGenerateSubAccounts ? null : (this.formPurchaseAccountId || null),
        salesAccountId: this.formAutoGenerateSubAccounts ? null : (this.formSalesAccountId || null),
      };
      this.service.create(dto).subscribe({
        next: (res) => {
          if (!res.success) { this.error = res.message || 'Failed to create'; this.cdr.detectChanges(); return; }
          this.justCreated = res.data ?? null;
          if (this.formAutoGenerateSubAccounts && res.data) {
            this.editingItem = res.data;
            this.generatingGlAccounts = true;
            this.generateGlAccounts(() => {
              const updateDto: UpdateItemCategoryDto = {
                code: null, name: null, description: null, parentCategoryId: null,
                isActive: true, clearGlAccounts: false,
                inventoryAccountId: this.formInventoryAccountId || null,
                cogsAccountId: this.formCogsAccountId || null,
                purchaseAccountId: this.formPurchaseAccountId || null,
                salesAccountId: this.formSalesAccountId || null,
              };
              this.service.update(this.editingItem!.id, updateDto).subscribe({
                next: () => { this.showForm = false; this.editingItem = null; this.load(); },
                error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to link GL accounts'; this.cdr.detectChanges(); },
              });
            });
          } else {
            this.showForm = false; this.load();
          }
        },
        error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to save'; this.cdr.detectChanges(); },
      });
    }
  }

  delete(item: ItemCategoryDto): void {
    if (!confirm('Delete this category?')) return;
    this.service.delete(item.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to delete'; this.cdr.detectChanges(); },
    });
  }
}