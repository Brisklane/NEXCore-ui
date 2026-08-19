import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PartnerService, PlanningService } from '../../services/distribution.services';
import {
  ForecastDto, ForecastLineDto, GenerateForecastDto, PaginationMetadata, PartnerDto,
  ReplenishmentSuggestionDto, TransferRequestDto,
} from '../../models/distribution.models';
import {
  FORECAST_BASIS_LABELS, ForecastBasis, REPLENISH_TARGET_LABELS, ReplenishmentTargetKind,
  TRANSFER_STATUS_LABELS, TransferRequestStatus, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

type Tab = 'suggestions' | 'forecasts' | 'transfers';

/**
 * Demand planning and replenishment.
 *
 * Forecasts default to secondary sales history rather than primary, because primary is what you
 * shipped and secondary is what the market actually consumed. Forecasting on primary means
 * forecasting your own past shipping decisions, which reproduces last quarter's mistakes with
 * extra confidence.
 *
 * Overrides are kept beside the computed number rather than replacing it, so forecast accuracy
 * can be judged on both — and so the habit of always overriding upward becomes visible.
 */
@Component({
  standalone: true,
  selector: 'lib-demand-planning',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './planning.html',
  styleUrls: ['../distribution-shared.css', './planning.css'],
})
export class DemandPlanningComponent implements OnInit {
  private planning = inject(PlanningService);
  private partners = inject(PartnerService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'suggestions';

  suggestions: ReplenishmentSuggestionDto[] = [];
  forecasts: ForecastDto[] = [];
  transfers: TransferRequestDto[] = [];
  openForecast: ForecastDto | null = null;
  partnerList: PartnerDto[] = [];
  meta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  page = 1;
  pageSize = 50;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';
  targetKind: ReplenishmentTargetKind = ReplenishmentTargetKind.Distributor;

  selection = new Set<string>();

  showGenerate = false;
  generate: GenerateForecastDto = this.blankForecast();

  overriding: ForecastLineDto | null = null;
  override = { quantity: 0, reason: '' };

  dismissTarget: ReplenishmentSuggestionDto | null = null;
  dismissReason = '';

  readonly basisOptions = enumOptions(FORECAST_BASIS_LABELS);
  readonly targetOptions = enumOptions(REPLENISH_TARGET_LABELS);
  readonly basisLabels = FORECAST_BASIS_LABELS;
  readonly targetLabels = REPLENISH_TARGET_LABELS;
  readonly transferLabels = TRANSFER_STATUS_LABELS;
  readonly TransferRequestStatus = TransferRequestStatus;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.partners.list({ pageSize: 300 })).catch(() => null);
    this.partnerList = res?.data ?? [];
    await this.load();
  }

  async onScope(scope: { territoryId: string | null; from: string; to: string }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.fromDate = scope.from;
    this.toDate = scope.to;
    this.page = 1;
    await this.load();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    this.selection.clear();
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    if (this.tab === 'suggestions') {
      const res = await firstValueFrom(this.planning.suggestions({
        page: this.page,
        pageSize: this.pageSize,
        targetKind: this.targetKind,
        territoryId: this.territoryId || undefined,
      })).catch(() => null);
      this.suggestions = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the replenishment suggestions.';
    } else if (this.tab === 'forecasts') {
      const res = await firstValueFrom(this.planning.forecasts({
        page: this.page, pageSize: 25, territoryId: this.territoryId || undefined,
      })).catch(() => null);
      this.forecasts = res?.data ?? [];
      this.meta = res?.pagination ?? null;
    } else {
      const res = await firstValueFrom(this.planning.transfers({
        page: this.page, pageSize: 25,
      })).catch(() => null);
      this.transfers = res?.data ?? [];
      this.meta = res?.pagination ?? null;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Suggestions ────────────────────────────────────────────────────────────

  async regenerate(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(
      this.planning.generateSuggestions(this.targetKind),
    ).catch(() => null);

    if (res?.data != null) { this.notice = `${res.data} suggestions generated.`; await this.load(); }
    else this.error = 'The suggestions could not be generated.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  toggle(id: string): void {
    if (this.selection.has(id)) this.selection.delete(id);
    else this.selection.add(id);
  }

  get allSelected(): boolean {
    return this.suggestions.length > 0 && this.suggestions.every(s => this.selection.has(s.id));
  }

  toggleAll(): void {
    if (this.allSelected) this.selection.clear();
    else this.suggestions.forEach(s => this.selection.add(s.id));
  }

  get selectedValue(): number {
    return this.suggestions
      .filter(s => this.selection.has(s.id))
      .reduce((sum, s) => sum + s.estimatedValue, 0);
  }

  async createTransfer(): Promise<void> {
    if (this.selection.size === 0 || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.planning.createTransfer([...this.selection])).catch(() => null);

    if (res?.data) {
      this.notice = `Transfer ${res.data.transferNumber} raised. Approving it hands it to Inventory to execute.`;
      this.selection.clear();
      this.tab = 'transfers';
      await this.load();
    } else {
      this.error = 'The transfer request could not be created.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  startDismiss(s: ReplenishmentSuggestionDto): void {
    this.dismissTarget = s;
    this.dismissReason = '';
  }

  async confirmDismiss(): Promise<void> {
    if (!this.dismissTarget || !this.dismissReason.trim()) return;

    const res = await firstValueFrom(
      this.planning.dismissSuggestion(this.dismissTarget.id, this.dismissReason.trim()),
    ).catch(() => null);

    if (res?.data) { this.dismissTarget = null; await this.load(); }
    else this.error = 'The suggestion could not be dismissed.';

    this.cdr.detectChanges();
  }

  // ── Forecasts ──────────────────────────────────────────────────────────────

  private blankForecast(): GenerateForecastDto {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    return {
      name: `Forecast — ${start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`,
      basis: ForecastBasis.SecondarySalesHistory,
      periodStart: start.toISOString().slice(0, 10),
      periodEnd: end.toISOString().slice(0, 10),
      historyMonths: 6,
      seasonalityFactor: 1,
      trendFactor: 1,
    };
  }

  openGenerate(): void {
    this.generate = this.blankForecast();
    this.showGenerate = true;
  }

  async runGenerate(): Promise<void> {
    if (this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.planning.generateForecast({
      ...this.generate,
      territoryId: this.territoryId || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.openForecast = res.data;
      this.showGenerate = false;
      this.tab = 'forecasts';
      await this.load();
    } else {
      this.error = 'The forecast could not be generated.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async viewForecast(f: ForecastDto): Promise<void> {
    const res = await firstValueFrom(this.planning.forecast(f.id)).catch(() => null);
    this.openForecast = res?.data ?? f;
    this.cdr.detectChanges();
  }

  startOverride(l: ForecastLineDto): void {
    this.overriding = l;
    this.override = {
      quantity: l.overrideQuantity ?? l.computedQuantity,
      reason: l.overrideReason ?? '',
    };
  }

  async confirmOverride(): Promise<void> {
    if (!this.overriding || !this.override.reason.trim() || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.planning.overrideForecast({
      lineId: this.overriding.id,
      overrideQuantity: this.override.quantity,
      overrideReason: this.override.reason.trim(),
    })).catch(() => null);

    if (res?.data) { this.openForecast = res.data; this.overriding = null; }
    else this.error = 'The override could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async approveForecast(): Promise<void> {
    if (!this.openForecast || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.planning.approveForecast(this.openForecast.id)).catch(() => null);

    if (res?.data) { this.openForecast = res.data; this.notice = 'Forecast approved.'; await this.load(); }
    else this.error = 'The forecast could not be approved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Transfers ──────────────────────────────────────────────────────────────

  async decideTransfer(t: TransferRequestDto, isApproved: boolean): Promise<void> {
    const res = await firstValueFrom(this.planning.decideTransfer(
      t.id, isApproved, isApproved ? undefined : 'Rejected from demand planning',
    )).catch(() => null);

    if (res?.data) await this.load();
    else this.error = 'That decision could not be saved.';

    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  urgencyTone(s: ReplenishmentSuggestionDto): string {
    if (s.daysOfCover <= s.leadTimeDays) return 'bad';
    return s.daysOfCover <= s.leadTimeDays * 2 ? 'warn' : 'good';
  }

  urgencyLabel(s: ReplenishmentSuggestionDto): string {
    if (s.daysOfCover <= 0) return 'Out of stock';
    if (s.daysOfCover <= s.leadTimeDays) return 'Will run out before it arrives';
    return `${Math.round(s.daysOfCover)} days of cover`;
  }

  targetNameFor(s: ReplenishmentSuggestionDto): string {
    return s.partnerName || s.vanUnitName || 'Warehouse';
  }

  overrideDelta(l: ForecastLineDto): number {
    if (l.overrideQuantity == null || l.computedQuantity === 0) return 0;
    return Math.round(((l.overrideQuantity - l.computedQuantity) / l.computedQuantity) * 100);
  }

  trackSuggestion = (_: number, s: ReplenishmentSuggestionDto) => s.id;
  trackForecast = (_: number, f: ForecastDto) => f.id;
  trackForecastLine = (_: number, l: ForecastLineDto) => l.id;
  trackTransfer = (_: number, t: TransferRequestDto) => t.id;
}
