import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DistributionAdminService, SettlementService } from '../../services/distribution.services';
import {
  CashDepositDto, FieldDayDto, ReasonCodeDto, SettlementBoardDto, SettlementDto,
  SettlementVarianceDto,
} from '../../models/distribution.models';
import {
  ReasonSurface, SETTLEMENT_STATUS_LABELS, SETTLEMENT_STATUS_TONE, SettlementStatus,
  VARIANCE_LABELS, VarianceKind,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, StatusPillComponent } from '../shared/ui-bits';

type Tab = 'board' | 'detail' | 'deposits';

/**
 * Route settlement: the end of a rep's or a driver's day, reconciled.
 *
 * Both sides are recomputed from the source documents each time rather than stored, so a
 * settlement that looked right on Tuesday and wrong on Friday is telling you something real
 * happened in between — a reversed receipt, a late return — rather than that somebody edited a
 * total.
 *
 * Every variance needs a reason before the day can close. That rule is the whole point: the
 * variance number itself is worthless, and the reasons behind it are what tell you whether you
 * have a counting problem, a pricing problem or a theft problem.
 */
@Component({
  standalone: true,
  selector: 'lib-route-settlement',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './settlement.html',
  styleUrls: ['../distribution-shared.css', './settlement.css'],
})
export class RouteSettlementComponent implements OnInit {
  private settlements = inject(SettlementService);
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'board';

  board: SettlementBoardDto | null = null;
  detail: SettlementDto | null = null;
  deposits: CashDepositDto[] = [];
  cashReasons: ReasonCodeDto[] = [];
  stockReasons: ReasonCodeDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  territoryId: string | null = null;
  settlementDate = new Date().toISOString().slice(0, 10);

  // Submitting
  showSubmit = false;
  submit = { declaredCash: null as number | null, note: '' };

  // Explaining a variance
  explaining: SettlementVarianceDto | null = null;
  explain = { reasonCodeId: '', note: '', isRecoverable: false, recoveredAmount: 0 };

  // Reversal
  showReverse = false;
  reverseReason = '';

  // Deposit
  showDeposit = false;
  deposit = {
    depositedOn: new Date().toISOString().slice(0, 10),
    bankName: '',
    bankAccount: '',
    slipReference: '',
    amount: null as number | null,
    note: '',
  };

  readonly statusLabels = SETTLEMENT_STATUS_LABELS;
  readonly statusTone = SETTLEMENT_STATUS_TONE;
  readonly varianceLabels = VARIANCE_LABELS;
  readonly SettlementStatus = SettlementStatus;
  readonly VarianceKind = VarianceKind;

  async ngOnInit(): Promise<void> {
    const reasonsRes = await firstValueFrom(this.admin.reasons({})).catch(() => null);
    const reasons = reasonsRes?.data ?? [];
    this.cashReasons = reasons.filter(r => r.surface === ReasonSurface.CashVariance && r.isActive);
    this.stockReasons = reasons.filter(r => r.surface === ReasonSurface.StockVariance && r.isActive);

    await this.load();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    await this.load();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    if (tab === 'deposits') await this.loadDeposits();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.settlements.board({
      settlementDate: this.settlementDate,
      territoryId: this.territoryId || undefined,
    })).catch(() => null);

    if (res?.data) this.board = res.data;
    else this.error = 'Could not load the settlement board.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  private async loadDeposits(): Promise<void> {
    const res = await firstValueFrom(this.settlements.deposits({ pageSize: 100 })).catch(() => null);
    this.deposits = res?.data ?? [];
    this.cdr.detectChanges();
  }

  // ── Opening and viewing ────────────────────────────────────────────────────

  async openDay(day: FieldDayDto): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.settlements.open({
      fieldDayId: day.id,
      fieldRepId: day.fieldRepId,
      routeId: day.routeId,
      vanUnitId: day.vanUnitId,
      settlementDate: day.workDate,
    })).catch(() => null);

    if (res?.data) {
      this.detail = res.data;
      this.tab = 'detail';
      await this.load();
    } else {
      this.error = 'The settlement could not be opened.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async view(s: SettlementDto): Promise<void> {
    const res = await firstValueFrom(this.settlements.get(s.id)).catch(() => null);
    this.detail = res?.data ?? s;
    this.tab = 'detail';
    this.cdr.detectChanges();
  }

  async recompute(): Promise<void> {
    if (!this.detail || this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.settlements.recompute(this.detail.id)).catch(() => null);
    if (res?.data) {
      this.detail = res.data;
      this.notice = 'Recomputed from the source documents.';
    } else {
      this.error = 'The recompute failed.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Submitting ─────────────────────────────────────────────────────────────

  openSubmit(): void {
    if (!this.detail) return;
    this.submit = { declaredCash: this.detail.declaredCash || null, note: '' };
    this.showSubmit = true;
  }

  async confirmSubmit(): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.settlements.submit({
      settlementId: this.detail.id,
      declaredCash: Number(this.submit.declaredCash ?? 0),
      closingCountId: this.detail.closingCountId,
      note: this.submit.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.detail = res.data;
      this.showSubmit = false;
      this.notice = res.data.unexplainedVarianceCount > 0
        ? `Submitted. ${res.data.unexplainedVarianceCount} variances still need a reason before it can close.`
        : 'Submitted and balanced.';
      await this.load();
    } else {
      this.error = 'The settlement could not be submitted.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Variances ──────────────────────────────────────────────────────────────

  startExplain(v: SettlementVarianceDto): void {
    this.explaining = v;
    this.explain = {
      reasonCodeId: v.reasonCodeId ?? '',
      note: v.reasonNote ?? '',
      isRecoverable: v.isRecoverable,
      recoveredAmount: v.recoveredAmount || Math.abs(v.varianceAmount),
    };
  }

  reasonsFor(v: SettlementVarianceDto): ReasonCodeDto[] {
    const isCash = v.kind === VarianceKind.CashShort || v.kind === VarianceKind.CashOver;
    return isCash ? this.cashReasons : this.stockReasons;
  }

  async confirmExplain(): Promise<void> {
    if (!this.explaining || !this.explain.reasonCodeId || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.settlements.explainVariance({
      varianceId: this.explaining.id,
      reasonCodeId: this.explain.reasonCodeId,
      note: this.explain.note || undefined,
      isRecoverable: this.explain.isRecoverable,
      recoveredAmount: this.explain.isRecoverable ? this.explain.recoveredAmount : undefined,
    })).catch(() => null);

    if (res?.data) { this.detail = res.data; this.explaining = null; }
    else this.error = 'The explanation could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Approving and closing ──────────────────────────────────────────────────

  async approve(isApproved: boolean): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.settlements.approve({
      settlementId: this.detail.id,
      isApproved,
    })).catch(() => null);

    if (res?.data) { this.detail = res.data; await this.load(); }
    else this.error = 'That decision could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async close(): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.settlements.close(this.detail.id)).catch(() => null);

    if (res?.data) {
      this.detail = res.data;
      this.notice = 'Closed and posted to accounting. A mistake now needs a reversal, not an edit.';
      await this.load();
    } else {
      this.error = 'The settlement could not be closed. Every variance needs a reason first.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async reverse(): Promise<void> {
    if (!this.detail || !this.reverseReason.trim() || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(
      this.settlements.reverse(this.detail.id, { reason: this.reverseReason.trim() }),
    ).catch(() => null);

    if (res?.data) {
      this.detail = res.data;
      this.showReverse = false;
      this.notice = 'Reversed with a counter-entry. The original posting stays on the record.';
      await this.load();
    } else {
      this.error = 'The reversal did not go through.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Deposits ───────────────────────────────────────────────────────────────

  openDeposit(): void {
    this.deposit = {
      depositedOn: new Date().toISOString().slice(0, 10),
      bankName: '',
      bankAccount: '',
      slipReference: '',
      amount: this.detail?.cashToDeposit ?? null,
      note: '',
    };
    this.showDeposit = true;
  }

  async recordDeposit(): Promise<void> {
    if (this.deposit.amount == null || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.settlements.recordDeposit({
      settlementId: this.detail?.id,
      fieldRepId: this.detail?.fieldRepId,
      depositedOn: this.deposit.depositedOn,
      bankName: this.deposit.bankName || undefined,
      bankAccount: this.deposit.bankAccount || undefined,
      slipReference: this.deposit.slipReference || undefined,
      amount: Number(this.deposit.amount),
      note: this.deposit.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.showDeposit = false;
      this.notice = 'Deposit recorded. It stays unreconciled until it is matched to a bank line.';
      await this.loadDeposits();
      await this.load();
    } else {
      this.error = 'The deposit could not be recorded.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async reconcileDeposit(d: CashDepositDto): Promise<void> {
    const res = await firstValueFrom(this.settlements.reconcileDeposit(d.id)).catch(() => null);
    if (res?.data) await this.loadDeposits();
    else this.error = 'The deposit could not be reconciled.';
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get canSubmit(): boolean { return this.detail?.status === SettlementStatus.Open; }
  get canApprove(): boolean { return this.detail?.status === SettlementStatus.Submitted; }
  get canClose(): boolean {
    return !!this.detail?.canClose && this.detail.status === SettlementStatus.Approved;
  }
  get canReverse(): boolean {
    return this.detail?.status === SettlementStatus.Closed && !this.detail.isReversed;
  }

  varianceTone(v: SettlementVarianceDto): string {
    if (v.reasonCodeId) return 'tone-success';
    return Math.abs(v.varianceAmount) > 0 ? 'tone-danger' : 'tone-neutral';
  }

  trackSettlement = (_: number, s: SettlementDto) => s.id;
  trackDay = (_: number, d: FieldDayDto) => d.id;
  trackVariance = (_: number, v: SettlementVarianceDto) => v.id;
  trackDeposit = (_: number, d: CashDepositDto) => d.id;
  trackId = (_: number, row: { id: string }) => row.id;
}
