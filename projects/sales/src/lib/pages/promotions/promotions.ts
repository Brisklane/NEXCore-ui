import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService } from '../../services/promotion.service';
import { PromotionDto, PromotionStatus, PromotionTargetType } from '../../models/promotion.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotions.html',
  styleUrl: './promotions.css',
})
export class PromotionsComponent implements OnInit {
  promotions: PromotionDto[] = [];
  loading = false;
  error = '';
  successMsg = '';
  searchQuery = '';
  highlighter = new RowHighlighter();

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  showForm = false;
  editingPromotion: PromotionDto | null = null;
  formName = '';
  formDescription = '';
  formPromotionCode = '';
  formIsAutoApplied = false;
  formPriority = 0;
  formStartDate = '';
  formEndDate = '';
  formMinOrderAmount: number | null = null;
  formTargetType = 0; // AllCustomers
  formIsStackable = false;
  formNotes = '';
  formMaxUsageCount: number | null = null;
  formMaxUsagePerCustomer: number | null = null;
  formAutoCode = true;

  // value = backend PromotionTargetType int
  readonly targetTypeOptions = [
    { value: 0, label: 'All Customers' },
    { value: 1, label: 'Loyalty Tier' },
    { value: 2, label: 'Price List' },
    { value: 3, label: 'Specific Contact' },
  ];
  private readonly statusNames: Record<number, PromotionStatus> = {
    0: 'Draft', 1: 'Active', 2: 'Paused', 3: 'Expired', 4: 'Cancelled',
  };
  private readonly targetTypeNames: Record<number, string> = {
    0: 'All Customers', 1: 'Loyalty Tier', 2: 'Price List', 3: 'Specific Contact',
  };

  /** Backend serialises enums as ints; map to a readable name. */
  normStatus(v: PromotionStatus | number | string | null): string {
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : (/^\d+$/.test(String(v)) ? +v : NaN);
    return !isNaN(n) ? (this.statusNames[n] ?? String(v)) : String(v);
  }
  targetTypeLabel(v: PromotionTargetType | number | null): string {
    if (v === null || v === undefined) return '—';
    const n = typeof v === 'number' ? v : NaN;
    return !isNaN(n) ? (this.targetTypeNames[n] ?? String(v)) : String(v);
  }

  // ── Promotion code (auto / manual + availability) ─────────────────────────
  private nextPromotionCode(): string {
    let max = 0;
    for (const p of this.promotions) {
      const c = (p.promotionCode ?? '').toUpperCase();
      const m = /^PROMO-(\d+)$/.exec(c);
      if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
    }
    return `PROMO-${String(max + 1).padStart(4, '0')}`;
  }
  /** True when a manually-typed code clashes with an existing promotion. */
  get codeTaken(): boolean {
    if (this.formAutoCode) return false;
    const code = this.formPromotionCode.trim().toUpperCase();
    if (!code) return false;
    return this.promotions.some(p =>
      p.id !== this.editingPromotion?.id &&
      (p.promotionCode ?? '').toUpperCase() === code);
  }
  onAutoCodeToggle() {
    this.formPromotionCode = this.formAutoCode ? this.nextPromotionCode() : '';
  }

  get filteredPromotions(): PromotionDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    const filteredRows = !q ? this.promotions : this.promotions.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.promotionCode ?? '').toLowerCase().includes(q) ||
      this.normStatus(p.status).toLowerCase().includes(q),
    );
    const rows = [...filteredRows];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const hid = this.highlighter?.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  constructor(
    private promotionService: PromotionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.promotionService.getAll().subscribe({
      next: (res) => {
        this.promotions = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load promotions.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingPromotion = null;
    this.formName = '';
    this.formDescription = '';
    this.formPromotionCode = '';
    this.formIsAutoApplied = false;
    this.formPriority = 0;
    this.formStartDate = '';
    this.formEndDate = '';
    this.formMinOrderAmount = null;
    this.formTargetType = 0;
    this.formIsStackable = false;
    this.formNotes = '';
    this.formMaxUsageCount = null;
    this.formMaxUsagePerCustomer = null;
    this.formAutoCode = true;
    this.formPromotionCode = this.nextPromotionCode();
    this.showForm = true;
  }

  openEditForm(p: PromotionDto) {
    this.editingPromotion = p;
    this.formName = p.name;
    this.formDescription = p.description ?? '';
    this.formPromotionCode = p.promotionCode ?? '';
    this.formIsAutoApplied = p.isAutoApplied;
    this.formPriority = p.priority;
    this.formStartDate = p.startDate ? p.startDate.substring(0, 10) : '';
    this.formEndDate = p.endDate ? p.endDate.substring(0, 10) : '';
    this.formMinOrderAmount = p.minOrderAmount;
    this.formTargetType = typeof p.targetType === 'number' ? p.targetType : 0;
    this.formAutoCode = false;
    this.formIsStackable = p.isStackable;
    this.formNotes = p.notes ?? '';
    this.formMaxUsageCount = p.maxUsageCount;
    this.formMaxUsagePerCustomer = p.maxUsagePerCustomer;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingPromotion = null;
  }

  save() {
    if (!this.formName) { this.error = 'Name is required.'; return; }
    if (!this.formStartDate || !this.formEndDate) { this.error = 'Start and End dates are required.'; return; }
    if (this.formStartDate > this.formEndDate) { this.error = 'Start date must be on or before end date.'; return; }
    if (!this.editingPromotion && !this.formAutoCode && this.codeTaken) {
      this.error = `Code "${this.formPromotionCode}" is already in use.`;
      return;
    }
    if (this.editingPromotion) {
      this.promotionService.update(this.editingPromotion.id, {
        name: this.formName,
        description: this.formDescription || null,
        isAutoApplied: this.formIsAutoApplied,
        priority: this.formPriority,
        startDate: this.formStartDate || null,
        endDate: this.formEndDate || null,
        minOrderAmount: this.formMinOrderAmount,
        targetType: this.formTargetType,
        isStackable: this.formIsStackable,
        notes: this.formNotes || null,
        maxUsageCount: this.formMaxUsageCount,
        maxUsagePerCustomer: this.formMaxUsagePerCustomer,
      }).subscribe({
        next: () => { this.successMsg = 'Promotion updated.'; this.cancelForm(); this.load(); },
        error: (err) => { this.error = this.extractError(err, 'Failed to update.'); this.cdr.detectChanges(); },
      });
    } else {
      this.promotionService.create({
        name: this.formName,
        description: this.formDescription || null,
        // Auto mode: let the backend assign a guaranteed-unique code. Manual: send the typed code.
        promotionCode: this.formAutoCode ? null : (this.formPromotionCode.trim() || null),
        isAutoApplied: this.formIsAutoApplied,
        priority: this.formPriority,
        startDate: this.formStartDate || null,
        endDate: this.formEndDate || null,
        minOrderAmount: this.formMinOrderAmount,
        targetType: this.formTargetType,
        isStackable: this.formIsStackable,
        notes: this.formNotes || null,
        maxUsageCount: this.formMaxUsageCount,
        maxUsagePerCustomer: this.formMaxUsagePerCustomer,
      }).subscribe({
        next: (res) => { this.successMsg = 'Promotion created.'; this.cancelForm(); this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (err) => { this.error = this.extractError(err, 'Failed to create.'); this.cdr.detectChanges(); },
      });
    }
  }

  activate(id: string) {
    this.promotionService.activate(id).subscribe({
      next: () => { this.successMsg = 'Promotion activated.'; this.load(); },
      error: () => { this.error = 'Failed to activate.'; this.cdr.detectChanges(); },
    });
  }

  pause(id: string) {
    this.promotionService.pause(id).subscribe({
      next: () => { this.successMsg = 'Promotion paused.'; this.load(); },
      error: () => { this.error = 'Failed to pause.'; this.cdr.detectChanges(); },
    });
  }

  cancel(id: string) {
    if (!confirm('Cancel this promotion?')) return;
    this.promotionService.cancel(id).subscribe({
      next: () => { this.successMsg = 'Promotion cancelled.'; this.load(); },
      error: () => { this.error = 'Failed to cancel.'; this.cdr.detectChanges(); },
    });
  }

  delete(id: string) {
    if (!confirm('Delete this promotion?')) return;
    this.promotionService.delete(id).subscribe({
      next: () => { this.successMsg = 'Promotion deleted.'; this.load(); },
      error: () => { this.error = 'Failed to delete.'; this.cdr.detectChanges(); },
    });
  }

  statusClass(status: PromotionStatus | number): string {
    const map: Record<string, string> = {
      Draft: 'badge badge-pending',
      Active: 'badge badge-accepted',
      Paused: 'badge badge-warning',
      Cancelled: 'badge badge-cancelled',
      Expired: 'badge badge-cancelled',
    };
    return map[this.normStatus(status)] ?? 'badge';
  }

  private extractError(err: unknown, fallback: string): string {
    const body = (err as { error?: { message?: string; errors?: string[] } })?.error;
    if (body?.message) return body.message;
    if (Array.isArray(body?.errors) && body.errors.length) return body.errors.join(' | ');
    return fallback;
  }
}
