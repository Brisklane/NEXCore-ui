import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ClaimService, DistributionAdminService } from '../../services/distribution.services';
import {
  ClaimDto, ClaimLineDto, ClaimSummaryDto, PaginationMetadata, ReasonCodeDto,
} from '../../models/distribution.models';
import {
  CLAIM_KIND_LABELS, CLAIM_SETTLEMENT_LABELS, CLAIM_STATUS_LABELS, CLAIM_STATUS_TONE,
  ClaimSettlementMode, ClaimStatus, ReasonSurface, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

/**
 * Partner claims: money owed back to the trade.
 *
 * Ordered by SLA age rather than by submission date, because the number a distributor actually
 * judges you on is how long their money sits with you. A claim that has waited eleven days on a
 * seven-day promise belongs at the top even if it arrived after one submitted this morning.
 *
 * Adjudication is per line and always shows the computed amount beside the claimed one. Approving
 * a lump sum without seeing where the two disagree is how the same argument recurs every month.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-claims',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './claims.html',
  styleUrls: ['../distribution-shared.css', './claims.css'],
})
export class ClaimsComponent implements OnInit {
  private claims = inject(ClaimService);
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  rows: ClaimSummaryDto[] = [];
  meta: PaginationMetadata | null = null;
  detail: ClaimDto | null = null;
  rejectReasons: ReasonCodeDto[] = [];

  loading = true;
  loadingDetail = false;
  busy = false;
  error = '';
  notice = '';

  queue = 'open';
  search = '';
  kindFilter = '' as '' | number;
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';

  /** Working copy of the per-line decision, so nothing changes until Approve is pressed. */
  decisions = new Map<string, { approvedAmount: number; rejectionReasonCodeId: string; rejectionNote: string }>();
  decisionNote = '';

  showQuery = false;
  queryNote = '';

  showSettle = false;
  settle = {
    settlementMode: ClaimSettlementMode.CreditNote,
    settledAmount: 0,
    settlementReference: '',
    note: '',
  };

  readonly queues = [
    { key: 'open', label: 'Open', icon: 'inbox', statuses: [ClaimStatus.Submitted, ClaimStatus.UnderReview, ClaimStatus.Resubmitted] },
    { key: 'sla', label: 'Past SLA', icon: 'schedule', breaching: true },
    { key: 'queried', label: 'Queried', icon: 'help', statuses: [ClaimStatus.QueryRaised] },
    { key: 'approved', label: 'To settle', icon: 'payments', statuses: [ClaimStatus.Approved, ClaimStatus.PartiallyApproved] },
    { key: 'settled', label: 'Settled', icon: 'task_alt', statuses: [ClaimStatus.Settled] },
    { key: 'all', label: 'Everything', icon: 'list' },
  ];

  readonly kindOptions = enumOptions(CLAIM_KIND_LABELS);
  readonly settlementOptions = enumOptions(CLAIM_SETTLEMENT_LABELS);
  readonly kindLabels = CLAIM_KIND_LABELS;
  readonly statusLabels = CLAIM_STATUS_LABELS;
  readonly statusTone = CLAIM_STATUS_TONE;
  readonly settlementLabels = CLAIM_SETTLEMENT_LABELS;
  readonly ClaimStatus = ClaimStatus;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(
      this.admin.reasons({ surface: ReasonSurface.ClaimRejection }),
    ).catch(() => null);
    this.rejectReasons = res?.data ?? [];
  }

  async onScope(scope: { territoryId: string | null; from: string; to: string }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.fromDate = scope.from;
    this.toDate = scope.to;
    this.page = 1;
    await this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 320);
  }

  async setQueue(key: string): Promise<void> {
    this.queue = key;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const q = this.queues.find(x => x.key === this.queue);

    const res = await firstValueFrom(this.claims.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      kind: this.kindFilter || undefined,
      territoryId: this.territoryId || undefined,
      statuses: q?.statuses?.join(',') || undefined,
      breachingSla: q?.breaching || undefined,
      from: this.queue === 'all' ? this.fromDate || undefined : undefined,
      to: this.queue === 'all' ? this.toDate || undefined : undefined,
    })).catch(() => null);

    if (res) {
      this.rows = res.data ?? [];
      this.meta = res.pagination ?? null;

      // Keep the open claim in view across a refresh; otherwise open the first thing needing work.
      const keepId = this.detail?.id;
      const keep = keepId && this.rows.some(r => r.id === keepId) ? keepId : this.rows[0]?.id;
      if (keep) await this.open(keep);
      else this.detail = null;
    } else {
      this.error = 'Could not load the claim queue.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Detail ─────────────────────────────────────────────────────────────────

  async open(id: string): Promise<void> {
    this.loadingDetail = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.claims.get(id)).catch(() => null);
    this.detail = res?.data ?? null;
    this.resetDecisions();

    this.loadingDetail = false;
    this.cdr.detectChanges();
  }

  /** Pre-fills each line with what the system computed — the defensible starting position. */
  private resetDecisions(): void {
    this.decisions.clear();
    this.decisionNote = '';

    for (const line of this.detail?.lines ?? []) {
      this.decisions.set(line.id, {
        approvedAmount: line.approvedAmount || line.computedAmount,
        rejectionReasonCodeId: line.rejectionReasonCodeId ?? '',
        rejectionNote: line.rejectionNote ?? '',
      });
    }
  }

  decisionFor(line: ClaimLineDto) {
    return this.decisions.get(line.id)
      ?? { approvedAmount: line.computedAmount, rejectionReasonCodeId: '', rejectionNote: '' };
  }

  setApproved(line: ClaimLineDto, value: number): void {
    const d = this.decisionFor(line);
    this.decisions.set(line.id, { ...d, approvedAmount: Math.max(0, Number(value) || 0) });
  }

  setRejectReason(line: ClaimLineDto, value: string): void {
    const d = this.decisionFor(line);
    this.decisions.set(line.id, { ...d, rejectionReasonCodeId: value });
  }

  acceptComputed(): void {
    for (const line of this.detail?.lines ?? []) {
      this.decisions.set(line.id, { approvedAmount: line.computedAmount, rejectionReasonCodeId: '', rejectionNote: '' });
    }
    this.cdr.detectChanges();
  }

  acceptClaimed(): void {
    for (const line of this.detail?.lines ?? []) {
      this.decisions.set(line.id, { approvedAmount: line.claimedAmount, rejectionReasonCodeId: '', rejectionNote: '' });
    }
    this.cdr.detectChanges();
  }

  get decidedTotal(): number {
    let total = 0;
    for (const line of this.detail?.lines ?? []) total += this.decisionFor(line).approvedAmount;
    return total;
  }

  /** A line short of what was claimed needs a reason; a blank rejection is not an answer. */
  get missingReasons(): number {
    let count = 0;
    for (const line of this.detail?.lines ?? []) {
      const d = this.decisionFor(line);
      if (d.approvedAmount < line.claimedAmount && !d.rejectionReasonCodeId) count++;
    }
    return count;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async startReview(): Promise<void> {
    if (!this.detail || this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.claims.startReview(this.detail.id)).catch(() => null);
    if (res?.data) this.detail = res.data;
    else this.error = 'Could not start the review.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async decide(isApproved: boolean): Promise<void> {
    if (!this.detail || this.busy) return;
    if (isApproved && this.missingReasons > 0) {
      this.error = `${this.missingReasons} lines are approved for less than claimed without a reason. The partner will ask.`;
      this.cdr.detectChanges();
      return;
    }

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.claims.decide(this.detail.id, {
      isApproved,
      note: this.decisionNote || undefined,
      lines: (this.detail.lines).map(line => {
        const d = this.decisionFor(line);
        return {
          lineId: line.id,
          approvedAmount: isApproved ? d.approvedAmount : 0,
          rejectionReasonCodeId: d.rejectionReasonCodeId || undefined,
          rejectionNote: d.rejectionNote || undefined,
        };
      }),
    })).catch(() => null);

    if (res?.data) {
      this.notice = isApproved
        ? `Approved ${res.data.approvedAmount.toFixed(2)} of ${res.data.claimedAmount.toFixed(2)}.`
        : 'Claim rejected.';
      await this.load();
    } else {
      this.error = 'That decision could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async raiseQuery(): Promise<void> {
    if (!this.detail || !this.queryNote.trim()) return;

    this.busy = true;
    const res = await firstValueFrom(
      this.claims.query(this.detail.id, { queryNote: this.queryNote.trim() }),
    ).catch(() => null);

    if (res?.data) {
      this.showQuery = false;
      this.queryNote = '';
      this.notice = 'Query sent back to the partner. The SLA clock pauses until they respond.';
      await this.load();
    } else {
      this.error = 'The query could not be raised.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  openSettle(): void {
    if (!this.detail) return;
    this.settle = {
      settlementMode: ClaimSettlementMode.CreditNote,
      settledAmount: this.detail.approvedAmount,
      settlementReference: '',
      note: '',
    };
    this.showSettle = true;
  }

  async confirmSettle(): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.claims.settle(this.detail.id, this.settle)).catch(() => null);

    if (res?.data) {
      this.showSettle = false;
      this.notice = 'Settled. The partner sees it on their statement.';
      await this.load();
    } else {
      this.error = 'The settlement could not be recorded.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get canReview(): boolean {
    return this.detail?.status === ClaimStatus.Submitted || this.detail?.status === ClaimStatus.Resubmitted;
  }

  get canDecide(): boolean {
    return this.detail?.status === ClaimStatus.UnderReview
      || this.detail?.status === ClaimStatus.Submitted
      || this.detail?.status === ClaimStatus.Resubmitted;
  }

  get canSettle(): boolean {
    return this.detail?.status === ClaimStatus.Approved
      || this.detail?.status === ClaimStatus.PartiallyApproved;
  }

  /** Flags a line where the partner's number and ours differ by more than rounding. */
  lineDisagrees(line: ClaimLineDto): boolean {
    return Math.abs(line.claimedAmount - line.computedAmount) > 0.01;
  }

  varianceTone(row: { varianceAmount: number }): string {
    if (Math.abs(row.varianceAmount) < 0.01) return 'tone-success';
    return row.varianceAmount > 0 ? 'tone-warning' : 'tone-info';
  }

  trackRow = (_: number, row: ClaimSummaryDto) => row.id;
  trackLine = (_: number, l: ClaimLineDto) => l.id;
  trackIndex = (i: number) => i;
}
