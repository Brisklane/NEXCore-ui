import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CreditService } from '../../services/distribution.services';
import {
  ChequeDto, CollectionSummaryDto, CreditOverrideDto, CreditProfileDto, PaginationMetadata,
} from '../../models/distribution.models';
import {
  CHEQUE_STATUS_LABELS, CHEQUE_STATUS_TONE, ChequeStatus, CreditEnforcement,
  ENFORCEMENT_LABELS, TENDER_ICONS, TENDER_LABELS, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { CollectionSheetComponent } from '../shared/collection-sheet';

type Tab = 'exposure' | 'collections' | 'cheques' | 'overrides';
type Bucket = '' | 'b0' | 'b30' | 'b60' | 'b90';

/**
 * Credit control and collections.
 *
 * The ageing buckets across the top are the filter, not a decoration — clicking "90+" is the
 * actual job, and making somebody translate that into a dropdown selection adds a step to the
 * thing they do fifty times a week.
 *
 * Money is recorded here and never processed. Cash, a cheque number, a bank reference, a wallet
 * id. No card number is accepted anywhere in this app; the last four digits exist only so a
 * reconciler can match a statement line.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-credit',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, CollectionSheetComponent,
  ],
  templateUrl: './credit.html',
  styleUrls: ['../distribution-shared.css', './credit.css'],
})
export class CreditComponent implements OnInit {
  private credit = inject(CreditService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'exposure';

  profiles: CreditProfileDto[] = [];
  collections: CollectionSummaryDto[] = [];
  cheques: ChequeDto[] = [];
  overrides: CreditOverrideDto[] = [];
  meta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  search = '';
  bucket: Bucket = '';
  blockedOnly = false;
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';

  // Collection sheet
  collectFor: CreditProfileDto | null = null;

  // Limit editor
  limitTarget: CreditProfileDto | null = null;
  limit = { creditLimit: 0, creditDays: 30, enforcement: CreditEnforcement.Warn, reason: '' };

  // Cheque status
  chequeTarget: ChequeDto | null = null;
  chequeUpdate = { status: ChequeStatus.Deposited, bounceReason: '', bounceCharges: 0, depositBankAccount: '', note: '' };

  // Override decision
  overrideTarget: CreditOverrideDto | null = null;
  overrideDecision = { isApproved: true, approvedAmount: 0, expiresOn: '', decisionNote: '' };

  readonly enforcementOptions = enumOptions(ENFORCEMENT_LABELS);
  readonly enforcementLabels = ENFORCEMENT_LABELS;
  readonly tenderLabels = TENDER_LABELS;
  readonly tenderIcons = TENDER_ICONS;
  readonly chequeLabels = CHEQUE_STATUS_LABELS;
  readonly chequeTone = CHEQUE_STATUS_TONE;
  readonly ChequeStatus = ChequeStatus;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    await this.load();
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

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    await this.load();
  }

  async setBucket(bucket: Bucket): Promise<void> {
    this.bucket = this.bucket === bucket ? '' : bucket;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const base = {
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      territoryId: this.territoryId || undefined,
    };

    if (this.tab === 'exposure') {
      const res = await firstValueFrom(this.credit.profiles({
        ...base,
        bucket: this.bucket || undefined,
        blockedOnly: this.blockedOnly || undefined,
      })).catch(() => null);
      this.profiles = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the credit positions.';
    } else if (this.tab === 'collections') {
      const res = await firstValueFrom(this.credit.collections({
        ...base, from: this.fromDate || undefined, to: this.toDate || undefined,
      })).catch(() => null);
      this.collections = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the receipts.';
    } else if (this.tab === 'cheques') {
      const res = await firstValueFrom(this.credit.cheques(base)).catch(() => null);
      this.cheques = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the cheques.';
    } else {
      const res = await firstValueFrom(this.credit.overrides({ pending: true })).catch(() => null);
      this.overrides = res?.data ?? [];
      this.meta = null;
      if (!res) this.error = 'Could not load the override requests.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Totals across the page ─────────────────────────────────────────────────

  get totals() {
    const sum = (pick: (p: CreditProfileDto) => number) =>
      this.profiles.reduce((total, p) => total + pick(p), 0);

    return {
      outstanding: sum(p => p.outstandingAmount),
      overdue: sum(p => p.overdueAmount),
      b0: sum(p => p.bucket0To30),
      b30: sum(p => p.bucket31To60),
      b60: sum(p => p.bucket61To90),
      b90: sum(p => p.bucket90Plus),
      blocked: this.profiles.filter(p => p.isBlocked).length,
    };
  }

  usedPercent(p: CreditProfileDto): number {
    if (p.effectiveLimit <= 0) return 0;
    return Math.min(100, Math.round((p.outstandingAmount / p.effectiveLimit) * 100));
  }

  usedTone(p: CreditProfileDto): string {
    if (p.isBlocked || p.overdueAmount > 0) return 'tone-danger';
    return this.usedPercent(p) > 85 ? 'tone-warning' : 'tone-success';
  }

  // ── Limits ─────────────────────────────────────────────────────────────────

  startLimit(p: CreditProfileDto): void {
    this.limitTarget = p;
    this.limit = {
      creditLimit: p.creditLimit,
      creditDays: p.creditDays,
      enforcement: p.enforcement,
      reason: '',
    };
  }

  async saveLimit(): Promise<void> {
    if (!this.limitTarget || !this.limit.reason.trim()) return;

    const res = await firstValueFrom(this.credit.setLimit({
      outletId: this.limitTarget.outletId,
      partnerId: this.limitTarget.partnerId,
      ...this.limit,
    })).catch(() => null);

    if (res?.data) { this.limitTarget = null; await this.load(); }
    else this.error = 'The limit change did not go through.';

    this.cdr.detectChanges();
  }

  async block(p: CreditProfileDto, isBlocked: boolean): Promise<void> {
    const res = await firstValueFrom(this.credit.block({
      outletId: p.outletId,
      partnerId: p.partnerId,
      isBlocked,
      reason: isBlocked ? 'Blocked from credit control' : undefined,
    })).catch(() => null);

    if (res?.data) await this.load();
    else this.error = 'That change did not go through.';

    this.cdr.detectChanges();
  }

  async recalculate(p: CreditProfileDto): Promise<void> {
    const res = await firstValueFrom(this.credit.recalculate({
      outletId: p.outletId, partnerId: p.partnerId,
    })).catch(() => null);

    if (res?.data) { this.notice = 'Recalculated from the source invoices.'; await this.load(); }
    else this.error = 'The recalculation failed.';

    this.cdr.detectChanges();
  }

  // ── Cheques ────────────────────────────────────────────────────────────────

  startCheque(c: ChequeDto): void {
    this.chequeTarget = c;
    this.chequeUpdate = {
      status: c.status === ChequeStatus.Received || c.status === ChequeStatus.Held
        ? ChequeStatus.Deposited
        : ChequeStatus.Cleared,
      bounceReason: '',
      bounceCharges: 0,
      depositBankAccount: '',
      note: '',
    };
  }

  get chequeNeedsBounceReason(): boolean {
    return Number(this.chequeUpdate.status) === ChequeStatus.Bounced;
  }

  async saveCheque(): Promise<void> {
    if (!this.chequeTarget) return;
    if (this.chequeNeedsBounceReason && !this.chequeUpdate.bounceReason.trim()) return;

    const res = await firstValueFrom(this.credit.updateCheque(this.chequeTarget.id, {
      status: Number(this.chequeUpdate.status),
      bounceReason: this.chequeUpdate.bounceReason || undefined,
      bounceCharges: this.chequeUpdate.bounceCharges || undefined,
      depositBankAccount: this.chequeUpdate.depositBankAccount || undefined,
      note: this.chequeUpdate.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.chequeTarget = null;
      // A bounce may have blocked the account, so the exposure tab is now stale as well.
      await this.load();
    } else {
      this.error = 'The cheque could not be updated.';
    }

    this.cdr.detectChanges();
  }

  // ── Overrides ──────────────────────────────────────────────────────────────

  startOverride(o: CreditOverrideDto): void {
    this.overrideTarget = o;
    this.overrideDecision = {
      isApproved: true,
      approvedAmount: o.requestedAmount,
      expiresOn: '',
      decisionNote: '',
    };
  }

  async decideOverride(): Promise<void> {
    if (!this.overrideTarget) return;

    const res = await firstValueFrom(
      this.credit.decideOverride(this.overrideTarget.id, {
        ...this.overrideDecision,
        expiresOn: this.overrideDecision.expiresOn || undefined,
      }),
    ).catch(() => null);

    if (res?.data) { this.overrideTarget = null; await this.load(); }
    else this.error = 'That decision could not be saved.';

    this.cdr.detectChanges();
  }

  // ── Receipts ───────────────────────────────────────────────────────────────

  async reverseCollection(c: CollectionSummaryDto): Promise<void> {
    const res = await firstValueFrom(
      this.credit.reverseCollection(c.id, 'Reversed from credit control'),
    ).catch(() => null);

    if (res?.data) { this.notice = `${c.receiptNumber} reversed with a counter-entry.`; await this.load(); }
    else this.error = 'The receipt could not be reversed.';

    this.cdr.detectChanges();
  }

  onCollectionRecorded(): void {
    this.collectFor = null;
    this.notice = 'Receipt recorded.';
    void this.load();
  }

  partyName(p: CreditProfileDto): string {
    return p.outletName || p.partnerName || 'This account';
  }

  trackProfile = (_: number, p: CreditProfileDto) => p.id;
  trackCollection = (_: number, c: CollectionSummaryDto) => c.id;
  trackCheque = (_: number, c: ChequeDto) => c.id;
  trackOverride = (_: number, o: CreditOverrideDto) => o.id;
}
