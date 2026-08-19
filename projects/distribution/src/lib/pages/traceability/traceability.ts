import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TraceabilityService } from '../../services/distribution.services';
import {
  BatchTraceDto, ColdChainCheckpointDto, ColdChainLogDto, InitiateRecallDto, NearExpiryDto,
  PaginationMetadata, RecallDto, RecallNoticeDto,
} from '../../models/distribution.models';
import {
  COLD_POINT_LABELS, RECALL_STATUS_LABELS, RECALL_STATUS_TONE, RecallSeverity, RecallStatus,
  SEVERITY_LABELS, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

type Tab = 'expiry' | 'trace' | 'recalls' | 'coldchain';

/**
 * Batch, expiry, cold chain and recall.
 *
 * The trace is the reason this screen exists: given a batch, exactly which shops received it and
 * how much each still holds. Everything else — near-expiry lists, temperature logs — is the
 * routine work that means the trace has real data in it when somebody finally needs it at four
 * o'clock on a Friday.
 *
 * Cold-chain excursions record the affected stock value, not just the temperature, because the
 * question after a freezer failure is what it cost, and a chart of degrees does not answer it.
 */
@Component({
  standalone: true,
  selector: 'lib-traceability',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './traceability.html',
  styleUrls: ['../distribution-shared.css', './traceability.css'],
})
export class TraceabilityComponent implements OnInit {
  private trace = inject(TraceabilityService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'expiry';

  nearExpiry: NearExpiryDto[] = [];
  recalls: RecallDto[] = [];
  checkpoints: ColdChainCheckpointDto[] = [];
  readings: ColdChainLogDto[] = [];
  openRecall: RecallDto | null = null;
  traceResult: BatchTraceDto | null = null;
  meta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  tracing = false;
  error = '';
  notice = '';

  page = 1;
  pageSize = 50;
  territoryId: string | null = null;
  withinDays = 90;

  traceQuery = { itemId: '', batchNumber: '' };

  showRecall = false;
  recall: InitiateRecallDto = this.blankRecall();

  excursionTarget: ColdChainLogDto | null = null;
  excursion = { correctiveAction: '', affectedValue: 0 };

  showReading = false;
  readingFor: ColdChainCheckpointDto | null = null;
  reading = { readingCelsius: 0, note: '', correctiveAction: '' };

  closingRecall = false;
  closureReport = '';

  readonly severityOptions = enumOptions(SEVERITY_LABELS);
  readonly severityLabels = SEVERITY_LABELS;
  readonly recallStatusLabels = RECALL_STATUS_LABELS;
  readonly recallStatusTone = RECALL_STATUS_TONE;
  readonly pointLabels = COLD_POINT_LABELS;
  readonly RecallStatus = RecallStatus;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.page = 1;
    await this.load();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    if (this.tab === 'expiry') {
      const res = await firstValueFrom(this.trace.nearExpiry({
        page: this.page,
        pageSize: this.pageSize,
        withinDays: this.withinDays,
        territoryId: this.territoryId || undefined,
      })).catch(() => null);
      this.nearExpiry = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the near-expiry stock.';
    } else if (this.tab === 'recalls') {
      const res = await firstValueFrom(this.trace.recalls({ page: this.page, pageSize: 25 })).catch(() => null);
      this.recalls = res?.data ?? [];
      this.meta = res?.pagination ?? null;
    } else if (this.tab === 'coldchain') {
      const [pointsRes, logsRes] = await Promise.all([
        firstValueFrom(this.trace.checkpoints({})).catch(() => null),
        firstValueFrom(this.trace.readings({ page: 1, pageSize: 50, outOfRangeOnly: true })).catch(() => null),
      ]);
      this.checkpoints = pointsRes?.data ?? [];
      this.readings = logsRes?.data ?? [];
      this.meta = null;
    } else {
      this.meta = null;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Trace ──────────────────────────────────────────────────────────────────

  async runTrace(): Promise<void> {
    if (!this.traceQuery.batchNumber.trim() || this.tracing) return;

    this.tracing = true;
    this.traceResult = null;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.trace.trace({
      itemId: this.traceQuery.itemId || undefined,
      batchNumber: this.traceQuery.batchNumber.trim(),
    })).catch(() => null);

    this.traceResult = res?.data ?? null;
    if (!res?.data) this.error = 'No movements found for that batch.';

    this.tracing = false;
    this.cdr.detectChanges();
  }

  /** Straight from a trace into a recall — the whole point of having the trace. */
  recallFromTrace(): void {
    if (!this.traceResult) return;
    this.recall = {
      ...this.blankRecall(),
      title: `Recall — ${this.traceResult.itemName} batch ${this.traceResult.batchNumber}`,
      itemId: this.traceResult.itemId ?? '',
      batchNumber: this.traceResult.batchNumber,
    };
    this.showRecall = true;
  }

  // ── Recalls ────────────────────────────────────────────────────────────────

  private blankRecall(): InitiateRecallDto {
    const target = new Date();
    target.setDate(target.getDate() + 7);

    return {
      title: '',
      severity: RecallSeverity.ClassII,
      itemId: '',
      batchNumber: '',
      targetCompletionOn: target.toISOString().slice(0, 10),
      reason: '',
    };
  }

  openRecallDialog(): void {
    this.recall = this.blankRecall();
    this.showRecall = true;
  }

  async initiateRecall(): Promise<void> {
    if (!this.recall.title.trim() || !this.recall.itemId.trim() || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.trace.initiateRecall(this.recall)).catch(() => null);

    if (res?.data) {
      this.showRecall = false;
      this.openRecall = res.data;
      this.tab = 'recalls';
      this.notice = `${res.data.recallNumber} raised as a draft. Announcing it notifies ${res.data.affectedOutletCount} outlets.`;
      await this.load();
    } else {
      this.error = 'The recall could not be raised.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async viewRecall(r: RecallDto): Promise<void> {
    const res = await firstValueFrom(this.trace.recall(r.id)).catch(() => null);
    this.openRecall = res?.data ?? r;
    this.cdr.detectChanges();
  }

  async announce(): Promise<void> {
    if (!this.openRecall || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.trace.announceRecall(this.openRecall.id)).catch(() => null);

    if (res?.data) {
      this.openRecall = res.data;
      this.notice = `Announced. ${res.data.notifiedOutletCount} outlets notified.`;
      await this.load();
    } else {
      this.error = 'The recall could not be announced.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async completeRecall(): Promise<void> {
    if (!this.openRecall || !this.closureReport.trim() || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(
      this.trace.completeRecall(this.openRecall.id, this.closureReport.trim()),
    ).catch(() => null);

    if (res?.data) {
      this.openRecall = res.data;
      this.closingRecall = false;
      this.notice = 'Recall closed with a report on file.';
      await this.load();
    } else {
      this.error = 'The recall could not be closed.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Cold chain ─────────────────────────────────────────────────────────────

  startReading(c: ColdChainCheckpointDto): void {
    this.readingFor = c;
    this.reading = {
      readingCelsius: c.lastReadingCelsius ?? (c.minSafeCelsius + c.maxSafeCelsius) / 2,
      note: '',
      correctiveAction: '',
    };
    this.showReading = true;
  }

  get readingOutOfRange(): boolean {
    if (!this.readingFor) return false;
    return this.reading.readingCelsius < this.readingFor.minSafeCelsius
      || this.reading.readingCelsius > this.readingFor.maxSafeCelsius;
  }

  async saveReading(): Promise<void> {
    if (!this.readingFor || this.busy) return;
    if (this.readingOutOfRange && !this.reading.correctiveAction.trim()) return;

    this.busy = true;
    const res = await firstValueFrom(this.trace.recordReading({
      checkpointId: this.readingFor.id,
      readingCelsius: Number(this.reading.readingCelsius),
      note: this.reading.note || undefined,
      correctiveAction: this.reading.correctiveAction || undefined,
    })).catch(() => null);

    if (res?.data) { this.showReading = false; await this.load(); }
    else this.error = 'The reading could not be recorded.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  startExcursion(l: ColdChainLogDto): void {
    this.excursionTarget = l;
    this.excursion = { correctiveAction: '', affectedValue: l.affectedStockValue };
  }

  async resolveExcursion(): Promise<void> {
    if (!this.excursionTarget || !this.excursion.correctiveAction.trim() || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.trace.resolveExcursion(
      this.excursionTarget.id,
      this.excursion.correctiveAction.trim(),
      this.excursion.affectedValue,
    )).catch(() => null);

    if (res?.data) { this.excursionTarget = null; await this.load(); }
    else this.error = 'The excursion could not be resolved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get nearExpiryValue(): number {
    return this.nearExpiry.reduce((sum, n) => sum + n.value, 0);
  }

  get expiredValue(): number {
    return this.nearExpiry.filter(n => n.daysToExpiry <= 0).reduce((sum, n) => sum + n.value, 0);
  }

  get breachedCheckpoints(): number {
    return this.checkpoints.filter(c => c.isInBreach).length;
  }

  get overdueChecks(): number {
    return this.checkpoints.filter(c => c.isCheckOverdue).length;
  }

  expiryTone(n: NearExpiryDto): string {
    if (n.daysToExpiry <= 0) return 'bad';
    if (n.daysToExpiry <= 30) return 'warn';
    return 'neutral';
  }

  expiryLabel(n: NearExpiryDto): string {
    if (n.daysToExpiry <= 0) return 'Expired';
    return `${n.daysToExpiry} days left`;
  }

  trackExpiry = (_: number, n: NearExpiryDto) => `${n.itemId}:${n.batchId ?? n.batchNumber}:${n.location}`;
  trackRecall = (_: number, r: RecallDto) => r.id;
  trackNotice = (_: number, n: RecallNoticeDto) => n.id;
  trackCheckpoint = (_: number, c: ColdChainCheckpointDto) => c.id;
  trackReading = (_: number, l: ColdChainLogDto) => l.id;
  trackIndex = (i: number) => i;
}
