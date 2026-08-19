import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrderService, PricingService } from '../../services/distribution.services';
import {
  DistributionOrderDto, DistributionOrderLineDto, PriceResolutionDto, StockAllocationDto,
} from '../../models/distribution.models';
import {
  ALLOCATION_LABELS, AllocationStrategy, DistributionOrderStatus, ORDER_KIND_LABELS,
  ORDER_SOURCE_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PRICE_SCOPE_LABELS,
  SCHEME_KIND_LABELS, SETTLEMENT_MODE_LABELS,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { StatusPillComponent } from '../shared/ui-bits';

/**
 * One order, with the workings shown.
 *
 * The reason this screen is long is that "why did this line cost that" is asked constantly — by
 * the distributor querying an invoice, by finance reconciling a claim, by a rep who promised a
 * price and got another. Every number here can be walked back to the rule that produced it: the
 * price scope that won, the scheme that fired, the slab it landed in, the credit decision, the
 * batch that was allocated.
 */
@Component({
  standalone: true,
  selector: 'lib-order-detail',
  imports: [CommonModule, FormsModule, RouterLink, PageHelpComponent, StatusPillComponent],
  templateUrl: './order-detail.html',
  styleUrls: ['../distribution-shared.css', './order-detail.css'],
})
export class OrderDetailComponent implements OnInit {
  private orders = inject(OrderService);
  private pricing = inject(PricingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  order: DistributionOrderDto | null = null;
  allocations: StockAllocationDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  // "Why this price" panel
  priceLine: DistributionOrderLineDto | null = null;
  priceResolution: PriceResolutionDto | null = null;
  loadingPrice = false;

  showAllocate = false;
  allocateStrategy: AllocationStrategy = AllocationStrategy.Fefo;
  allocateHard = true;

  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusTone = ORDER_STATUS_TONE;
  readonly kindLabels = ORDER_KIND_LABELS;
  readonly sourceLabels = ORDER_SOURCE_LABELS;
  readonly scopeLabels = PRICE_SCOPE_LABELS;
  readonly schemeKindLabels = SCHEME_KIND_LABELS;
  readonly settlementLabels = SETTLEMENT_MODE_LABELS;
  readonly allocationLabels = ALLOCATION_LABELS;
  readonly DistributionOrderStatus = DistributionOrderStatus;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'No order was asked for.'; this.loading = false; return; }
    await this.load(id);
  }

  async load(id?: string): Promise<void> {
    const orderId = id ?? this.order?.id;
    if (!orderId) return;

    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.orders.get(orderId)).catch(() => null);

    if (res?.data) this.order = res.data;
    else this.error = 'Could not load this order.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  back(): void { void this.router.navigate(['/distribution/orders']); }

  // ── Why this price ─────────────────────────────────────────────────────────

  async explainPrice(line: DistributionOrderLineDto): Promise<void> {
    if (!this.order) return;

    this.priceLine = line;
    this.priceResolution = null;
    this.loadingPrice = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.pricing.resolve({
      itemId: line.itemId,
      uom: line.uom,
      quantity: line.quantity,
      outletId: this.order.outletId,
      partnerId: this.order.partnerId,
      onDate: this.order.orderDate,
    })).catch(() => null);

    this.priceResolution = res?.data ?? null;
    this.loadingPrice = false;
    this.cdr.detectChanges();
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async submit(): Promise<void> {
    if (!this.order || this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.orders.submit(this.order.id)).catch(() => null);
    if (res?.data) { this.order = res.data; this.notice = 'Submitted.'; }
    else this.error = 'The order could not be submitted.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async decide(isApproved: boolean): Promise<void> {
    if (!this.order || this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.orders.decide({
      orderId: this.order.id,
      isApproved,
    })).catch(() => null);

    if (res?.data) { this.order = res.data; this.notice = isApproved ? 'Approved.' : 'Rejected.'; }
    else this.error = 'That decision could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async allocate(): Promise<void> {
    if (!this.order || this.busy) return;
    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.orders.allocate({
      orderId: this.order.id,
      strategy: this.allocateStrategy,
      hardAllocate: this.allocateHard,
    })).catch(() => null);

    if (res?.data) {
      this.allocations = res.data;
      this.showAllocate = false;
      this.notice = `${res.data.length} lines allocated.`;
      await this.load();
    } else {
      this.error = 'Allocation failed. Nothing has been reserved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  get sellingLines(): DistributionOrderLineDto[] {
    return (this.order?.lines ?? []).filter(l => !l.isFreeGoods);
  }

  get freeLines(): DistributionOrderLineDto[] {
    return (this.order?.lines ?? []).filter(l => l.isFreeGoods);
  }

  get canApprove(): boolean {
    return !!this.order?.requiresApproval
      && this.order.status === DistributionOrderStatus.PendingApproval;
  }

  get canAllocate(): boolean {
    return this.order?.status === DistributionOrderStatus.Approved;
  }

  get canSubmit(): boolean {
    return this.order?.status === DistributionOrderStatus.Draft;
  }

  fillTone(line: DistributionOrderLineDto): string {
    if (line.deliveredQuantity >= line.quantity) return 'tone-success';
    if (line.isShortPicked || line.backorderedQuantity > 0) return 'tone-warning';
    return 'tone-neutral';
  }

  statusEventIcon(to: DistributionOrderStatus): string {
    switch (to) {
      case DistributionOrderStatus.Approved: return 'check';
      case DistributionOrderStatus.Rejected: return 'close';
      case DistributionOrderStatus.Cancelled: return 'block';
      case DistributionOrderStatus.Dispatched: return 'local_shipping';
      case DistributionOrderStatus.Delivered: return 'inventory';
      case DistributionOrderStatus.Invoiced: return 'receipt';
      case DistributionOrderStatus.OnHold: return 'pause';
      default: return 'arrow_forward';
    }
  }

  statusEventTone(to: DistributionOrderStatus): string {
    switch (to) {
      case DistributionOrderStatus.Rejected:
      case DistributionOrderStatus.Cancelled: return 'tone-danger';
      case DistributionOrderStatus.OnHold: return 'tone-warning';
      case DistributionOrderStatus.Delivered:
      case DistributionOrderStatus.Invoiced:
      case DistributionOrderStatus.Approved: return 'tone-success';
      default: return 'tone-brand';
    }
  }

  trackLine = (_: number, l: DistributionOrderLineDto) => l.id;
  trackIndex = (i: number) => i;
}
