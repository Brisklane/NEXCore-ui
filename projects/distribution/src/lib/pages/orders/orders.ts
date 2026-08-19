import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DistributionAdminService, OrderService } from '../../services/distribution.services';
import {
  DistributionOrderDto, OrderSummaryDto, PaginationMetadata, ReasonCodeDto,
} from '../../models/distribution.models';
import {
  DistributionOrderStatus, ORDER_KIND_LABELS, ORDER_SOURCE_LABELS, ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE, ReasonSurface, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { OrderSheetComponent } from '../shared/order-sheet';

/** A queue tab: a named filter over status, phrased as what has to happen next. */
interface Queue {
  key: string;
  label: string;
  icon: string;
  statuses?: DistributionOrderStatus[];
  flag?: 'approval' | 'held' | 'late';
}

/**
 * Every order in the pipe.
 *
 * The tabs are phrased as what has to happen next rather than as statuses, because a person
 * opening this screen is looking for work, not for a taxonomy. "Needs approval" and "Ready to
 * pick" are jobs; "Submitted" and "Allocated" are database values that happen to correlate.
 *
 * Bulk approval is deliberately gated behind an applied filter. Approving 400 orders because the
 * page happened to load them is not a decision, and the audit trail records it as one.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-orders',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, OrderSheetComponent,
  ],
  templateUrl: './orders.html',
  styleUrls: ['../distribution-shared.css', './orders.css'],
})
export class DistributionOrdersComponent implements OnInit {
  private orders = inject(OrderService);
  private admin = inject(DistributionAdminService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: OrderSummaryDto[] = [];
  meta: PaginationMetadata | null = null;
  cancelReasons: ReasonCodeDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  queue = 'all';
  search = '';
  sourceFilter = '' as '' | number;
  fromDate = '';
  toDate = '';
  territoryId: string | null = null;

  page = 1;
  pageSize = 25;

  selection = new Set<string>();
  showOrderSheet = false;

  cancelTarget: OrderSummaryDto | null = null;
  cancelReasonId = '';
  cancelNote = '';

  holdTarget: OrderSummaryDto | null = null;
  holdReason = '';

  readonly queues: Queue[] = [
    { key: 'all', label: 'Everything', icon: 'inbox' },
    { key: 'approval', label: 'Needs approval', icon: 'approval', flag: 'approval' },
    {
      key: 'allocate', label: 'Ready to allocate', icon: 'inventory',
      statuses: [DistributionOrderStatus.Approved],
    },
    {
      key: 'pick', label: 'Ready to pick', icon: 'shelves',
      statuses: [DistributionOrderStatus.Allocated],
    },
    {
      key: 'transit', label: 'On the road', icon: 'local_shipping',
      statuses: [DistributionOrderStatus.Dispatched, DistributionOrderStatus.PartiallyDelivered],
    },
    { key: 'held', label: 'Held', icon: 'pause_circle', flag: 'held' },
    { key: 'late', label: 'Late', icon: 'schedule', flag: 'late' },
  ];

  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusTone = ORDER_STATUS_TONE;
  readonly kindLabels = ORDER_KIND_LABELS;
  readonly sourceLabels = ORDER_SOURCE_LABELS;
  readonly sourceOptions = enumOptions(ORDER_SOURCE_LABELS);

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.admin.reasons({ surface: ReasonSurface.OrderCancellation })).catch(() => null);
    this.cancelReasons = res?.data ?? [];
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
    this.selection.clear();
    await this.load();
  }

  private get activeQueue(): Queue {
    return this.queues.find(q => q.key === this.queue) ?? this.queues[0];
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    const q = this.activeQueue;

    const res = await firstValueFrom(this.orders.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      territoryId: this.territoryId || undefined,
      source: this.sourceFilter || undefined,
      from: this.fromDate || undefined,
      to: this.toDate || undefined,
      statuses: q.statuses?.join(',') || undefined,
      requiresApproval: q.flag === 'approval' || undefined,
      onHold: q.flag === 'held' || undefined,
      overdueForDelivery: q.flag === 'late' || undefined,
    })).catch(() => null);

    if (res) {
      this.rows = res.data ?? [];
      this.meta = res.pagination ?? null;
    } else {
      this.error = 'Could not load the order list.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; this.selection.clear(); await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  open(row: OrderSummaryDto): void {
    void this.router.navigate(['/distribution/orders', row.id]);
  }

  // ── Selection ──────────────────────────────────────────────────────────────

  toggle(id: string): void {
    if (this.selection.has(id)) this.selection.delete(id);
    else this.selection.add(id);
  }

  get allSelected(): boolean {
    return this.rows.length > 0 && this.rows.every(r => this.selection.has(r.id));
  }

  toggleAll(): void {
    if (this.allSelected) this.selection.clear();
    else this.rows.forEach(r => this.selection.add(r.id));
  }

  /** Bulk approval only exists once somebody has narrowed the list to a deliberate set. */
  get canBulkApprove(): boolean {
    return this.queue === 'approval' && this.selection.size > 0 && !this.busy;
  }

  // ── Decisions ──────────────────────────────────────────────────────────────

  async decide(row: OrderSummaryDto, isApproved: boolean): Promise<void> {
    if (this.busy) return;

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.orders.decide({
      orderId: row.id,
      isApproved,
      comment: isApproved ? undefined : 'Rejected from the order queue',
    })).catch(() => null);

    if (res?.data) {
      this.notice = `${row.orderNumber} ${isApproved ? 'approved' : 'rejected'}.`;
      await this.load();
    } else {
      this.error = 'That decision could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async bulkApprove(): Promise<void> {
    if (!this.canBulkApprove) return;

    this.busy = true;
    this.cdr.detectChanges();

    // Sequential rather than parallel: each approval re-checks credit against a balance the
    // previous one may have moved, and firing them together would race that check.
    let done = 0;
    for (const id of this.selection) {
      const res = await firstValueFrom(this.orders.decide({ orderId: id, isApproved: true })).catch(() => null);
      if (res?.data) done++;
    }

    this.notice = `${done} of ${this.selection.size} orders approved.`;
    this.selection.clear();
    this.busy = false;
    await this.load();
  }

  startHold(row: OrderSummaryDto): void {
    this.holdTarget = row;
    this.holdReason = '';
  }

  async confirmHold(): Promise<void> {
    if (!this.holdTarget || !this.holdReason.trim()) return;

    const res = await firstValueFrom(
      this.orders.hold(this.holdTarget.id, this.holdReason.trim()),
    ).catch(() => null);

    if (res?.data) { this.holdTarget = null; await this.load(); }
    else this.error = 'The hold did not go through.';

    this.cdr.detectChanges();
  }

  async release(row: OrderSummaryDto): Promise<void> {
    const res = await firstValueFrom(this.orders.release(row.id)).catch(() => null);
    if (res?.data) await this.load();
    else this.error = 'The order could not be released.';
    this.cdr.detectChanges();
  }

  startCancel(row: OrderSummaryDto): void {
    this.cancelTarget = row;
    this.cancelReasonId = '';
    this.cancelNote = '';
  }

  async confirmCancel(): Promise<void> {
    if (!this.cancelTarget || !this.cancelReasonId) return;

    const res = await firstValueFrom(this.orders.cancel(this.cancelTarget.id, {
      reasonCodeId: this.cancelReasonId,
      note: this.cancelNote || undefined,
    })).catch(() => null);

    if (res?.data) { this.cancelTarget = null; await this.load(); }
    else this.error = 'The order could not be cancelled.';

    this.cdr.detectChanges();
  }

  onOrderPlaced(order: DistributionOrderDto): void {
    this.showOrderSheet = false;
    this.notice = `Order ${order.orderNumber} created.`;
    void this.load();
  }

  get pageValue(): number {
    return this.rows.reduce((sum, r) => sum + r.totalAmount, 0);
  }

  trackRow = (_: number, row: OrderSummaryDto) => row.id;
}
