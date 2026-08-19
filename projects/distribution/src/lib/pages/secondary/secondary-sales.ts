import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  DistributionAdminService, PartnerService, SecondarySalesService,
} from '../../services/distribution.services';
import {
  ChannelInventoryDto, MappingExceptionDto, MappingSuggestionDto, PaginationMetadata,
  PartnerDataQualityDto, PartnerDto, ReasonCodeDto, ReconciliationDto,
  SecondaryUploadDto, StockDeclarationDto,
} from '../../models/distribution.models';
import {
  CAPTURE_MODE_LABELS, RECONCILIATION_LABELS, RECONCILIATION_TONE, ReasonSurface,
  UPLOAD_STATUS_LABELS, UPLOAD_STATUS_TONE, UploadBatchStatus,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

type Tab = 'uploads' | 'exceptions' | 'stock' | 'reconciliation' | 'quality';

/**
 * Secondary sales: what distributors actually sold onward.
 *
 * The exception list is the heart of this screen. A file that matched 94% of its rows looks fine
 * on a dashboard and is quietly useless: the 6% is never random, it is the new SKU and the shop
 * everybody spells differently, so the numbers understate exactly the things you most want to
 * measure. Nothing posts until the batch is clean.
 *
 * Resolving an exception teaches the partner's mapping profile, so the same row matches by itself
 * next month. That is the difference between this being a monthly chore and a one-off.
 */
@Component({
  standalone: true,
  selector: 'lib-secondary-sales',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './secondary-sales.html',
  styleUrls: ['../distribution-shared.css', './secondary-sales.css'],
})
export class SecondarySalesComponent implements OnInit {
  private secondary = inject(SecondarySalesService);
  private partners = inject(PartnerService);
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'uploads';

  uploads: SecondaryUploadDto[] = [];
  exceptions: MappingExceptionDto[] = [];
  declarations: StockDeclarationDto[] = [];
  reconciliations: ReconciliationDto[] = [];
  quality: PartnerDataQualityDto[] = [];
  channelStock: ChannelInventoryDto | null = null;

  partnerList: PartnerDto[] = [];
  varianceReasons: ReasonCodeDto[] = [];
  meta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  partnerFilter = '';
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';

  // Upload
  showUpload = false;
  uploadPartnerId = '';
  uploadPeriodStart = '';
  uploadPeriodEnd = '';
  uploadFile: File | null = null;
  uploading = false;

  // Exception resolution — one row at a time, because each is a judgement call.
  resolving: MappingExceptionDto | null = null;
  resolveItemId = '';
  resolveOutletId = '';
  rememberMapping = true;

  // Variance explanation
  explaining: ReconciliationDto | null = null;
  explainReasonId = '';
  explainNote = '';

  readonly uploadStatusLabels = UPLOAD_STATUS_LABELS;
  readonly uploadStatusTone = UPLOAD_STATUS_TONE;
  readonly reconciliationLabels = RECONCILIATION_LABELS;
  readonly reconciliationTone = RECONCILIATION_TONE;
  readonly captureLabels = CAPTURE_MODE_LABELS;
  readonly UploadBatchStatus = UploadBatchStatus;

  async ngOnInit(): Promise<void> {
    const now = new Date();
    this.uploadPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    this.uploadPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

    const [partnersRes, reasonsRes] = await Promise.all([
      firstValueFrom(this.partners.list({ pageSize: 300 })).catch(() => null),
      firstValueFrom(this.admin.reasons({ surface: ReasonSurface.StockVariance })).catch(() => null),
    ]);

    this.partnerList = partnersRes?.data ?? [];
    this.varianceReasons = reasonsRes?.data ?? [];
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
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const base = {
      page: this.page,
      pageSize: this.pageSize,
      partnerId: this.partnerFilter || undefined,
      territoryId: this.territoryId || undefined,
    };

    if (this.tab === 'uploads') {
      const res = await firstValueFrom(this.secondary.uploads(base)).catch(() => null);
      this.uploads = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the upload batches.';
    } else if (this.tab === 'exceptions') {
      const res = await firstValueFrom(
        this.secondary.exceptions({ partnerId: this.partnerFilter || undefined }),
      ).catch(() => null);
      this.exceptions = res?.data ?? [];
      this.meta = null;
      if (!res) this.error = 'Could not load the unmatched rows.';
    } else if (this.tab === 'stock') {
      const [decRes, stockRes] = await Promise.all([
        firstValueFrom(this.secondary.stockList(base)).catch(() => null),
        firstValueFrom(this.secondary.channelInventory({
          partnerId: this.partnerFilter || undefined,
          from: this.fromDate || undefined,
          to: this.toDate || undefined,
        })).catch(() => null),
      ]);
      this.declarations = decRes?.data ?? [];
      this.meta = decRes?.pagination ?? null;
      this.channelStock = stockRes?.data ?? null;
    } else if (this.tab === 'reconciliation') {
      const res = await firstValueFrom(this.secondary.reconciliations(base)).catch(() => null);
      this.reconciliations = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the reconciliations.';
    } else {
      const res = await firstValueFrom(
        this.secondary.dataQuality(this.fromDate, this.toDate),
      ).catch(() => null);
      this.quality = res?.data ?? [];
      this.meta = null;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Upload ─────────────────────────────────────────────────────────────────

  pickFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFile = input.files?.[0] ?? null;
  }

  async submitUpload(): Promise<void> {
    if (!this.uploadPartnerId || !this.uploadFile || this.uploading) return;

    this.uploading = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.secondary.upload({
      partnerId: this.uploadPartnerId,
      periodStart: this.uploadPeriodStart,
      periodEnd: this.uploadPeriodEnd,
    }, this.uploadFile)).catch(() => null);

    if (res?.data) {
      this.showUpload = false;
      this.uploadFile = null;
      const batch = res.data;
      this.notice = batch.unmappedRows > 0
        ? `${batch.batchNumber} staged. ${batch.unmappedRows} of ${batch.totalRows} rows need matching before it can post.`
        : `${batch.batchNumber} staged and fully matched. It is ready to post.`;
      await this.load();
    } else {
      this.error = 'The file could not be read. Check that it matches the partner\'s mapping profile.';
    }

    this.uploading = false;
    this.cdr.detectChanges();
  }

  async post(batch: SecondaryUploadDto): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.secondary.postUpload(batch.id)).catch(() => null);
    if (res?.data) { this.notice = `${batch.batchNumber} posted.`; await this.load(); }
    else this.error = 'The batch could not be posted. Unmatched rows must be resolved first.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async reject(batch: SecondaryUploadDto): Promise<void> {
    const res = await firstValueFrom(
      this.secondary.rejectUpload(batch.id, 'Rejected from the secondary sales screen'),
    ).catch(() => null);

    if (res?.data) await this.load();
    else this.error = 'The batch could not be rejected.';

    this.cdr.detectChanges();
  }

  // ── Exceptions ─────────────────────────────────────────────────────────────

  startResolve(row: MappingExceptionDto): void {
    this.resolving = row;
    // Pre-selecting the strongest suggestion is right most of the time and always visible,
    // so a wrong guess is corrected rather than silently accepted.
    const best = row.suggestions[0];
    this.resolveItemId = best?.itemId ?? '';
    this.resolveOutletId = best?.outletId ?? '';
    this.rememberMapping = true;
  }

  pickSuggestion(s: MappingSuggestionDto): void {
    if (s.itemId) this.resolveItemId = s.itemId;
    if (s.outletId) this.resolveOutletId = s.outletId;
  }

  async confirmResolve(rejectRow = false): Promise<void> {
    if (!this.resolving || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.secondary.resolveMapping({
      lineId: this.resolving.lineId,
      itemId: this.resolveItemId || undefined,
      outletId: this.resolveOutletId || undefined,
      rememberForFuture: this.rememberMapping,
      reject: rejectRow,
    })).catch(() => null);

    if (res) {
      this.resolving = null;
      await this.load();
    } else {
      this.error = 'That row could not be resolved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Reconciliation ─────────────────────────────────────────────────────────

  async runReconciliation(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.secondary.reconcile({
      partnerId: this.partnerFilter || undefined,
      periodStart: this.fromDate,
      periodEnd: this.toDate,
    })).catch(() => null);

    if (res?.data) { this.notice = `${res.data.length} lines reconciled.`; await this.load(); }
    else this.error = 'The reconciliation could not be run.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  startExplain(row: ReconciliationDto): void {
    this.explaining = row;
    this.explainReasonId = row.reasonCodeId ?? '';
    this.explainNote = row.explanationNote ?? '';
  }

  async confirmExplain(): Promise<void> {
    if (!this.explaining || !this.explainReasonId) return;

    const res = await firstValueFrom(this.secondary.explain({
      reconciliationId: this.explaining.id,
      reasonCodeId: this.explainReasonId,
      note: this.explainNote || undefined,
    })).catch(() => null);

    if (res?.data) { this.explaining = null; await this.load(); }
    else this.error = 'The explanation could not be saved.';

    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get unmappedTotal(): number {
    return this.uploads.reduce((sum, u) => sum + u.unmappedRows, 0);
  }

  qualityTone(q: PartnerDataQualityDto): string {
    if (q.qualityScore >= 80) return 'good';
    return q.qualityScore >= 60 ? 'warn' : 'bad';
  }

  accuracyTone(u: SecondaryUploadDto): string {
    if (u.mappingAccuracyPercent >= 99) return 'tone-success';
    return u.mappingAccuracyPercent >= 90 ? 'tone-warning' : 'tone-danger';
  }

  trackUpload = (_: number, u: SecondaryUploadDto) => u.id;
  trackException = (_: number, e: MappingExceptionDto) => e.lineId;
  trackDeclaration = (_: number, d: StockDeclarationDto) => d.id;
  trackReconciliation = (_: number, r: ReconciliationDto) => r.id;
  trackQuality = (_: number, q: PartnerDataQualityDto) => q.partnerId;
}
