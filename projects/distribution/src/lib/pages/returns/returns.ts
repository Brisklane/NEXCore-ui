import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DistributionAdminService, ReturnService } from '../../services/distribution.services';
import {
  PaginationMetadata, ReasonCodeDto, ReturnDto, ReturnLineDto, ReturnReceiptDto,
  ReturnReceiptLineDto, ReturnSummaryDto,
} from '../../models/distribution.models';
import {
  DISPOSITION_LABELS, ReasonSurface, RETURN_KIND_LABELS, RETURN_STATUS_LABELS,
  RETURN_STATUS_TONE, ReturnDispositionKind, ReturnStatus, VALUATION_LABELS, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

/**
 * Returns from the trade, request through to credit.
 *
 * The sequence matters and the screen enforces it: request → approve → receive → disposition →
 * credit. Skipping the disposition step is how damaged stock finds its way back onto a saleable
 * shelf, which is a food-safety problem long before it is an accounting one.
 *
 * Destruction is deliberately the most demanding path — it needs a witness and a certificate
 * reference — because it is the disposition that makes stock disappear with no counterparty.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-returns',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './returns.html',
  styleUrls: ['../distribution-shared.css', './returns.css'],
})
export class ReturnsComponent implements OnInit {
  private returns = inject(ReturnService);
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  rows: ReturnSummaryDto[] = [];
  meta: PaginationMetadata | null = null;
  detail: ReturnDto | null = null;
  reasons: ReasonCodeDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  queue = 'open';
  search = '';
  kindFilter = '' as '' | number;
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;

  /** Working approval quantities, so nothing changes until a decision is submitted. */
  approvals = new Map<string, number>();
  decisionNote = '';

  showReceive = false;
  receiveQuantities = new Map<string, number>();

  dispositionTarget: ReturnReceiptLineDto | null = null;
  disposition = {
    kind: ReturnDispositionKind.Restock,
    quantity: 0,
    note: '',
    witnessName: '',
    certificateReference: '',
  };

  readonly queues = [
    { key: 'open', label: 'To decide', icon: 'inbox', statuses: [ReturnStatus.Requested] },
    { key: 'expected', label: 'Expected back', icon: 'local_shipping', statuses: [ReturnStatus.Approved, ReturnStatus.Collected] },
    { key: 'inspect', label: 'To disposition', icon: 'fact_check', statuses: [ReturnStatus.Received, ReturnStatus.Inspected] },
    { key: 'credit', label: 'To credit', icon: 'receipt_long', statuses: [ReturnStatus.Inspected] },
    { key: 'all', label: 'Everything', icon: 'list' },
  ];

  readonly kindOptions = enumOptions(RETURN_KIND_LABELS);
  readonly dispositionOptions = enumOptions(DISPOSITION_LABELS);
  readonly kindLabels = RETURN_KIND_LABELS;
  readonly statusLabels = RETURN_STATUS_LABELS;
  readonly statusTone = RETURN_STATUS_TONE;
  readonly dispositionLabels = DISPOSITION_LABELS;
  readonly valuationLabels = VALUATION_LABELS;
  readonly ReturnStatus = ReturnStatus;
  readonly ReturnDispositionKind = ReturnDispositionKind;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.admin.reasons({ surface: ReasonSurface.Return })).catch(() => null);
    this.reasons = res?.data ?? [];
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

  async setQueue(key: string): Promise<void> {
    this.queue = key;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const q = this.queues.find(x => x.key === this.queue);

    const res = await firstValueFrom(this.returns.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      kind: this.kindFilter || undefined,
      territoryId: this.territoryId || undefined,
      statuses: q?.statuses?.join(',') || undefined,
    })).catch(() => null);

    if (res) {
      this.rows = res.data ?? [];
      this.meta = res.pagination ?? null;

      const keep = this.detail && this.rows.some(r => r.id === this.detail!.id)
        ? this.detail.id
        : this.rows[0]?.id;
      if (keep) await this.open(keep);
      else this.detail = null;
    } else {
      this.error = 'Could not load the returns.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  async open(id: string): Promise<void> {
    const res = await firstValueFrom(this.returns.get(id)).catch(() => null);
    this.detail = res?.data ?? null;

    this.approvals.clear();
    for (const line of this.detail?.lines ?? []) {
      this.approvals.set(line.id, line.approvedQuantity || line.requestedQuantity);
    }

    this.cdr.detectChanges();
  }

  // ── Approving ──────────────────────────────────────────────────────────────

  approvedFor(line: ReturnLineDto): number {
    return this.approvals.get(line.id) ?? line.requestedQuantity;
  }

  setApproved(line: ReturnLineDto, value: number): void {
    this.approvals.set(line.id, Math.max(0, Math.min(Number(value) || 0, line.requestedQuantity)));
  }

  get approvedValue(): number {
    return (this.detail?.lines ?? [])
      .reduce((sum, l) => sum + this.approvedFor(l) * l.unitPrice, 0);
  }

  async decide(isApproved: boolean): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.returns.decide(this.detail.id, {
      isApproved,
      rejectionReason: isApproved ? undefined : (this.decisionNote || 'Rejected'),
      lines: (this.detail.lines).map(l => ({
        lineId: l.id,
        approvedQuantity: isApproved ? this.approvedFor(l) : 0,
      })),
    })).catch(() => null);

    if (res?.data) {
      this.notice = isApproved
        ? `Approved. The goods are expected back at the warehouse.`
        : 'Return rejected.';
      await this.load();
    } else {
      this.error = 'That decision could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Receiving ──────────────────────────────────────────────────────────────

  openReceive(): void {
    if (!this.detail) return;
    this.receiveQuantities.clear();
    for (const line of this.detail.lines) {
      this.receiveQuantities.set(line.id, line.approvedQuantity);
    }
    this.showReceive = true;
  }

  receivedFor(line: ReturnLineDto): number {
    return this.receiveQuantities.get(line.id) ?? line.approvedQuantity;
  }

  setReceived(line: ReturnLineDto, value: number): void {
    this.receiveQuantities.set(line.id, Math.max(0, Number(value) || 0));
  }

  async confirmReceive(): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.returns.receive({
      returnId: this.detail.id,
      lines: this.detail.lines.map(l => ({
        returnLineId: l.id,
        itemId: l.itemId,
        itemName: l.itemName,
        batchId: l.batchId,
        uom: l.uom,
        receivedQuantity: this.receivedFor(l),
      })),
    })).catch(() => null);

    if (res?.data) {
      this.showReceive = false;
      this.notice = 'Received into quarantine. Each line now needs a disposition.';
      await this.load();
    } else {
      this.error = 'The receipt could not be recorded.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Disposition ────────────────────────────────────────────────────────────

  startDisposition(line: ReturnReceiptLineDto): void {
    this.dispositionTarget = line;
    this.disposition = {
      kind: ReturnDispositionKind.Restock,
      quantity: line.receivedQuantity,
      note: '',
      witnessName: '',
      certificateReference: '',
    };
  }

  get isDestruction(): boolean {
    return Number(this.disposition.kind) === ReturnDispositionKind.Scrap;
  }

  async confirmDisposition(): Promise<void> {
    if (!this.dispositionTarget || this.busy) return;
    if (this.isDestruction && (!this.disposition.witnessName.trim() || !this.disposition.certificateReference.trim())) return;

    this.busy = true;
    const res = await firstValueFrom(this.returns.disposition({
      receiptLineId: this.dispositionTarget.id,
      kind: Number(this.disposition.kind),
      quantity: this.disposition.quantity,
      note: this.disposition.note || undefined,
    })).catch(() => null);

    if (res?.data && this.isDestruction && this.detail) {
      // Destruction is only real once the certificate exists; recorded as a second step so a
      // half-completed destruction never looks finished.
      await firstValueFrom(this.returns.recordDestruction(this.detail.id, {
        witnessName: this.disposition.witnessName,
        certificateReference: this.disposition.certificateReference,
      })).catch(() => null);
    }

    if (res?.data) {
      this.dispositionTarget = null;
      await this.load();
    } else {
      this.error = 'The disposition could not be recorded.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async credit(raiseClaim: boolean): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.returns.credit(this.detail.id, raiseClaim)).catch(() => null);

    if (res?.data) {
      this.notice = raiseClaim
        ? 'Credited and a claim raised against the partner\'s account.'
        : 'Credited.';
      await this.load();
    } else {
      this.error = 'The credit could not be raised.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get canDecide(): boolean { return this.detail?.status === ReturnStatus.Requested; }
  get canReceive(): boolean {
    return this.detail?.status === ReturnStatus.Approved || this.detail?.status === ReturnStatus.Collected;
  }
  get canCredit(): boolean { return this.detail?.status === ReturnStatus.Inspected; }

  get undispositioned(): number {
    return (this.detail?.receipts ?? [])
      .flatMap(r => r.lines)
      .filter(l => !l.disposition)
      .length;
  }

  trackRow = (_: number, r: ReturnSummaryDto) => r.id;
  trackLine = (_: number, l: ReturnLineDto) => l.id;
  trackReceipt = (_: number, r: ReturnReceiptDto) => r.id;
  trackReceiptLine = (_: number, l: ReturnReceiptLineDto) => l.id;
}
