import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LogisticsService, ReturnService } from '../../services/distribution.services';
import { PaginationMetadata, PodDto, PodLineDto } from '../../models/distribution.models';
import {
  GEO_LABELS, GeoValidation, POD_OUTCOME_LABELS, POD_OUTCOME_TONE, PodLineOutcome,
  ReturnKind, ReturnValuationBasis,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

/**
 * Proof of delivery, and specifically the ones that went wrong.
 *
 * A clean POD needs nobody. This screen is the queue of deliveries where what arrived and what
 * was dispatched disagree, ordered oldest first, because an unresolved short delivery becomes an
 * unwinnable argument about three weeks later when nobody remembers the load.
 *
 * Resolution is one of three real outcomes: raise a return so the stock comes back, raise a credit
 * so the money does, or accept the difference with a reason. "Mark as resolved" on its own would
 * make the queue empty and the problem invisible.
 */
@Component({
  standalone: true,
  selector: 'lib-pod-queue',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './pod-queue.html',
  styleUrls: ['../distribution-shared.css', './pod-queue.css'],
})
export class PodQueueComponent implements OnInit {
  private logistics = inject(LogisticsService);
  private returns = inject(ReturnService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  rows: PodDto[] = [];
  meta: PaginationMetadata | null = null;
  detail: PodDto | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  queue: 'exceptions' | 'clean' | 'all' = 'exceptions';
  search = '';
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';

  showResolve = false;
  resolution: 'return' | 'credit' | 'accept' = 'return';
  resolveNote = '';

  readonly outcomeLabels = POD_OUTCOME_LABELS;
  readonly outcomeTone = POD_OUTCOME_TONE;
  readonly geoLabels = GEO_LABELS;
  readonly GeoValidation = GeoValidation;
  readonly PodLineOutcome = PodLineOutcome;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    await this.load();

    const podId = this.route.snapshot.queryParamMap.get('podId');
    if (podId) await this.open(podId);
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

  async setQueue(queue: 'exceptions' | 'clean' | 'all'): Promise<void> {
    this.queue = queue;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.logistics.pods({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      territoryId: this.territoryId || undefined,
      from: this.fromDate || undefined,
      to: this.toDate || undefined,
      exceptionsOnly: this.queue === 'exceptions' || undefined,
      cleanOnly: this.queue === 'clean' || undefined,
    })).catch(() => null);

    if (res) {
      this.rows = res.data ?? [];
      this.meta = res.pagination ?? null;

      const keep = this.detail && this.rows.some(p => p.id === this.detail!.id)
        ? this.detail.id
        : this.rows[0]?.id;
      if (keep) await this.open(keep);
      else this.detail = null;
    } else {
      this.error = 'Could not load the delivery proofs.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  async open(id: string): Promise<void> {
    const res = await firstValueFrom(this.logistics.pod(id)).catch(() => null);
    this.detail = res?.data ?? null;
    this.cdr.detectChanges();
  }

  // ── Resolution ─────────────────────────────────────────────────────────────

  openResolve(): void {
    this.resolution = 'return';
    this.resolveNote = '';
    this.showResolve = true;
  }

  async resolve(): Promise<void> {
    if (!this.detail || this.busy) return;
    if (!this.resolveNote.trim()) return;

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    // A return brings the stock back; a credit only moves the money. Both leave the POD itself
    // intact — it is the record of what happened at the door and is never edited.
    if (this.resolution === 'return') {
      const lines = this.detail.lines
        .filter(l => l.shortQuantity > 0 || l.damagedQuantity > 0 || l.rejectedQuantity > 0)
        .map(l => ({
          itemId: l.itemId,
          batchId: l.batchId,
          uom: l.uom,
          requestedQuantity: l.damagedQuantity + l.rejectedQuantity,
          unitPrice: l.unitPrice,
        }));

      await firstValueFrom(this.returns.request({
        kind: ReturnKind.Damaged,
        outletId: this.detail.outletId,
        partnerId: this.detail.partnerId,
        originalOrderId: this.detail.orderId,
        valuationBasis: ReturnValuationBasis.OriginalInvoicePrice,
        note: this.resolveNote,
        lines,
      })).catch(() => null);
    }

    const res = await firstValueFrom(
      this.logistics.resolvePod(this.detail.id, this.resolveNote.trim()),
    ).catch(() => null);

    if (res?.data) {
      this.showResolve = false;
      this.notice = 'Exception resolved.';
      await this.load();
    } else {
      this.error = 'The exception could not be resolved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get exceptionValue(): number {
    const p = this.detail;
    if (!p) return 0;
    return p.shortValue + p.damagedValue + p.rejectedValue;
  }

  lineHasIssue(l: PodLineDto): boolean {
    return l.shortQuantity > 0 || l.damagedQuantity > 0 || l.rejectedQuantity > 0;
  }

  ageDays(p: PodDto): number {
    return Math.max(0, Math.round((Date.now() - new Date(p.deliveredAt).getTime()) / 86_400_000));
  }

  geoTone(p: PodDto): string {
    return p.geoValidation === GeoValidation.InsideFence ? 'good' : 'warn';
  }

  trackPod = (_: number, p: PodDto) => p.id;
  trackLine = (_: number, l: PodLineDto) => l.id;
}
