import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SchemeService } from '../../services/distribution.services';
import {
  PaginationMetadata, SaveTradeSchemeDto, SchemePerformanceDto, SchemeSimulationDto,
  TradeSchemeDto, TradeSchemeSlabDto,
} from '../../models/distribution.models';
import {
  SCHEME_KIND_LABELS, SCHEME_STATUS_LABELS, SCHEME_STATUS_TONE, STACKING_LABELS,
  SETTLEMENT_MODE_LABELS, SchemeSettlementMode, SchemeStacking, SchemeStatus,
  TradeSchemeKind, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, afterDateField, notNegative, required, validate } from '../shared/validation';

type Tab = 'setup' | 'slabs' | 'budget';

/**
 * Trade schemes: the money you spend to move the trade.
 *
 * Simulation is not a nicety here. A scheme is a budget commitment made before anybody knows what
 * it will cost, and the difference between a 2% and a 6% spend is usually one slab boundary.
 * Replaying the last period's real orders through the draft rules is the only way to find that
 * out before the money is gone.
 *
 * Stacking is stated explicitly rather than inferred, because "which discount wins" is exactly
 * the question that turns into a claim dispute six weeks later.
 */
@Component({
  standalone: true,
  selector: 'lib-trade-schemes',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, FieldErrorComponent,
  ],
  templateUrl: './schemes.html',
  styleUrls: ['../distribution-shared.css', './schemes.css'],
})
export class TradeSchemesComponent implements OnInit {
  private schemes = inject(SchemeService);
  private cdr = inject(ChangeDetectorRef);

  rows: TradeSchemeDto[] = [];
  meta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  statusFilter = '' as '' | number;
  kindFilter = '' as '' | number;
  search = '';
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;

  showEditor = false;
  editorTab: Tab = 'setup';
  editing: SaveTradeSchemeDto & { id?: string } = this.blank();
  editorErrors: FieldErrors = {};

  simulation: SchemeSimulationDto | null = null;
  simulating = false;

  performance: SchemePerformanceDto | null = null;
  performanceFor: TradeSchemeDto | null = null;

  budgetTarget: TradeSchemeDto | null = null;
  budgetAmount: number | null = null;
  budgetReason = '';

  readonly kindOptions = enumOptions(SCHEME_KIND_LABELS);
  readonly statusOptions = enumOptions(SCHEME_STATUS_LABELS);
  readonly stackingOptions = enumOptions(STACKING_LABELS);
  readonly settlementOptions = enumOptions(SETTLEMENT_MODE_LABELS);
  readonly kindLabels = SCHEME_KIND_LABELS;
  readonly statusLabels = SCHEME_STATUS_LABELS;
  readonly statusTone = SCHEME_STATUS_TONE;
  readonly stackingLabels = STACKING_LABELS;
  readonly settlementLabels = SETTLEMENT_MODE_LABELS;
  readonly SchemeStatus = SchemeStatus;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.page = 1;
    await this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 320);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.schemes.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      status: this.statusFilter || undefined,
      kind: this.kindFilter || undefined,
      territoryId: this.territoryId || undefined,
    })).catch(() => null);

    if (res) {
      this.rows = res.data ?? [];
      this.meta = res.pagination ?? null;
    } else {
      this.error = 'Could not load the scheme list.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Editor ─────────────────────────────────────────────────────────────────

  private blank(): SaveTradeSchemeDto {
    const today = new Date();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      name: '',
      kind: TradeSchemeKind.QuantitySlab,
      settlementMode: SchemeSettlementMode.OnInvoice,
      stacking: SchemeStacking.Combinable,
      priority: 100,
      validFrom: today.toISOString().slice(0, 10),
      validTo: monthEnd.toISOString().slice(0, 10),
      minQuantity: 0,
      minValue: 0,
      freeQuantity: 0,
      discountPercent: 0,
      discountAmount: 0,
      maxBenefitPerOrder: 0,
      maxBenefitPerOutlet: 0,
      budgetAmount: 0,
      stopWhenBudgetExhausted: true,
      isRecurringPerBlock: false,
      isPeriodScheme: false,
      requiresPhotoEvidence: false,
      slabs: [],
      products: [],
      scopes: [],
    };
  }

  create(): void {
    this.editing = this.blank();
    this.editorErrors = {};
    this.editorTab = 'setup';
    this.simulation = null;
    this.showEditor = true;
  }

  async edit(row: TradeSchemeDto): Promise<void> {
    const res = await firstValueFrom(this.schemes.get(row.id)).catch(() => null);
    const scheme = res?.data ?? row;

    this.editing = { ...scheme };
    this.editorErrors = {};
    this.editorTab = 'setup';
    this.simulation = null;
    this.showEditor = true;
    this.cdr.detectChanges();
  }

  // ── Slabs ──────────────────────────────────────────────────────────────────

  addSlab(): void {
    const last = this.editing.slabs[this.editing.slabs.length - 1];
    const from = last?.toQuantity ? last.toQuantity + 1 : (last?.fromQuantity ?? 0) + 1;

    this.editing.slabs = [...this.editing.slabs, {
      id: crypto.randomUUID(),
      slabNumber: this.editing.slabs.length + 1,
      fromQuantity: from,
      fromValue: 0,
      freeQuantity: 0,
      discountPercent: 0,
      discountAmount: 0,
      payoutAmount: 0,
      pointsAwarded: 0,
    } as TradeSchemeSlabDto];
  }

  removeSlab(slab: TradeSchemeSlabDto): void {
    this.editing.slabs = this.editing.slabs
      .filter(s => s !== slab)
      .map((s, i) => ({ ...s, slabNumber: i + 1 }));
  }

  /**
   * A gap or an overlap between slabs is the single commonest scheme bug: an order for exactly
   * 50 units falls through both "up to 49" and "from 51" and quietly earns nothing.
   */
  get slabProblems(): string[] {
    const problems: string[] = [];
    const slabs = [...this.editing.slabs].sort((a, b) => a.fromQuantity - b.fromQuantity);

    for (let i = 0; i < slabs.length - 1; i++) {
      const current = slabs[i];
      const next = slabs[i + 1];
      if (current.toQuantity == null) {
        problems.push(`Slab ${current.slabNumber} has no upper bound but is not the last one — everything after it is unreachable.`);
        continue;
      }
      if (next.fromQuantity > current.toQuantity + 1) {
        problems.push(`Nothing covers ${current.toQuantity + 1} to ${next.fromQuantity - 1} units.`);
      }
      if (next.fromQuantity <= current.toQuantity) {
        problems.push(`Slabs ${current.slabNumber} and ${next.slabNumber} overlap between ${next.fromQuantity} and ${current.toQuantity}.`);
      }
    }

    return problems;
  }

  // ── Simulation ─────────────────────────────────────────────────────────────

  async simulate(): Promise<void> {
    if (this.simulating) return;

    this.simulating = true;
    this.simulation = null;
    this.cdr.detectChanges();

    // Replays the equivalent past period, so the cost estimate is built from orders that really
    // happened rather than from an assumed uptake curve.
    const to = new Date(this.editing.validFrom);
    const from = new Date(to);
    from.setMonth(from.getMonth() - 1);

    const res = await firstValueFrom(this.schemes.simulate({
      schemeId: this.editing.id,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    }, this.editing.id ? null : this.editing)).catch(() => null);

    this.simulation = res?.data ?? null;
    if (!res?.data) this.error = 'The simulation could not be run.';

    this.simulating = false;
    this.cdr.detectChanges();
  }

  applySuggestedBudget(): void {
    if (this.simulation) this.editing.budgetAmount = this.simulation.suggestedBudget;
  }

  // ── Saving and lifecycle ───────────────────────────────────────────────────

  async save(): Promise<void> {
    this.editorErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A scheme name')],
      validFrom: [required('A start date')],
      validTo: [required('An end date'), afterDateField('validFrom', 'The end date', 'the start date')],
      budgetAmount: [notNegative('The budget')],
    });

    if (Object.keys(this.editorErrors).length > 0) { this.editorTab = 'setup'; this.cdr.detectChanges(); return; }

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(
      this.schemes.save(this.editing.id ?? null, this.editing),
    ).catch(() => null);

    if (res?.data) {
      this.showEditor = false;
      this.notice = `Scheme ${res.data.schemeNumber} saved as a draft. It has to be approved before it prices anything.`;
      await this.load();
    } else {
      this.error = 'The scheme could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async decide(row: TradeSchemeDto, isApproved: boolean): Promise<void> {
    const res = await firstValueFrom(this.schemes.decide(row.id, { isApproved })).catch(() => null);
    if (res?.data) { this.notice = `${row.name} ${isApproved ? 'approved' : 'rejected'}.`; await this.load(); }
    else this.error = 'That decision could not be saved.';
    this.cdr.detectChanges();
  }

  async changeStatus(row: TradeSchemeDto, status: SchemeStatus): Promise<void> {
    const res = await firstValueFrom(this.schemes.changeStatus(row.id, status)).catch(() => null);
    if (res?.data) await this.load();
    else this.error = 'The status change did not go through.';
    this.cdr.detectChanges();
  }

  // ── Performance ────────────────────────────────────────────────────────────

  async openPerformance(row: TradeSchemeDto): Promise<void> {
    this.performanceFor = row;
    this.performance = null;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.schemes.performance(row.id)).catch(() => null);
    this.performance = res?.data ?? null;
    this.cdr.detectChanges();
  }

  // ── Budget ─────────────────────────────────────────────────────────────────

  startBudget(row: TradeSchemeDto): void {
    this.budgetTarget = row;
    this.budgetAmount = null;
    this.budgetReason = '';
  }

  async confirmBudget(): Promise<void> {
    if (!this.budgetTarget || this.budgetAmount == null || !this.budgetReason.trim()) return;

    const res = await firstValueFrom(this.schemes.adjustBudget(
      this.budgetTarget.id, Number(this.budgetAmount), this.budgetReason.trim(),
    )).catch(() => null);

    if (res?.data) { this.budgetTarget = null; await this.load(); }
    else this.error = 'The budget change did not go through.';

    this.cdr.detectChanges();
  }

  budgetTone(row: TradeSchemeDto): string {
    if (row.budgetAmount <= 0) return 'tone-neutral';
    if (row.budgetUsedPercent >= 100) return 'tone-danger';
    return row.budgetUsedPercent >= 80 ? 'tone-warning' : 'tone-success';
  }

  trackRow = (_: number, row: TradeSchemeDto) => row.id;
  trackSlab = (_: number, s: TradeSchemeSlabDto) => s.id;
}
