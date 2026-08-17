import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CheckService, RestaurantOrderService } from '../../services/restaurant.services';
import {
  OrderSummaryDto, RestaurantCheckDto, RestaurantOrderDto,
} from '../../models/restaurant.models';
import {
  CHECK_STATUS_LABELS, ORDER_CHANNEL_LABELS, ORDER_STATUS_LABELS, ORDER_TYPE_ICONS,
  ORDER_TYPE_LABELS, RestaurantOrderStatus, TENDER_LABELS,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Orders and the bills raised against them.
 *
 * A manager's screen, not a waiter's: it answers "what happened", where the order terminal
 * answers "what is happening". Opening a row shows the order and its checks side by side,
 * because the question being asked is nearly always about the money rather than the food.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-orders',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent],
  templateUrl: './orders.html',
  styleUrls: ['../restaurant-shared.css', './orders.css'],
})
export class OrdersComponent {
  private orders = inject(RestaurantOrderService);
  private checksApi = inject(CheckService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  outletId: string | null = null;
  rows: OrderSummaryDto[] = [];

  detail: RestaurantOrderDto | null = null;
  detailChecks: RestaurantCheckDto[] = [];

  statusFilter: RestaurantOrderStatus | '' = '';
  search = '';
  from = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
  to = new Date().toISOString().slice(0, 10);

  page = 1;
  pageSize = 25;
  total = 0;

  loading = true;
  busy = false;
  error = '';

  readonly typeLabels = ORDER_TYPE_LABELS;
  readonly typeIcons = ORDER_TYPE_ICONS;
  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly channelLabels = ORDER_CHANNEL_LABELS;
  readonly checkStatusLabels = CHECK_STATUS_LABELS;
  readonly tenderLabels = TENDER_LABELS;
  readonly statusOptions = Object.entries(ORDER_STATUS_LABELS)
    .map(([k, v]) => ({ value: Number(k) as RestaurantOrderStatus, label: v }));

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;

    const res = await firstValueFrom(this.orders.list({
      outletId: this.outletId ?? undefined,
      status: this.statusFilter === '' ? undefined : this.statusFilter,
      from: this.from ? new Date(this.from).toISOString() : undefined,
      to: this.to ? new Date(this.to + 'T23:59:59').toISOString() : undefined,
      search: this.search || undefined,
      page: this.page,
      size: this.pageSize,
    })).catch(() => null);

    this.rows = res?.data ?? [];
    this.total = res?.pagination?.totalCount ?? this.rows.length;
    this.loading = false;
    this.cdr.detectChanges();
  }

  async open(row: OrderSummaryDto): Promise<void> {
    this.busy = true;

    const [order, checks] = await Promise.all([
      firstValueFrom(this.orders.getById(row.id)).catch(() => null),
      firstValueFrom(this.checksApi.forOrder(row.id)).catch(() => null),
    ]);

    this.detail = order?.data ?? null;
    this.detailChecks = checks?.data ?? [];
    this.busy = false;
    this.cdr.detectChanges();
  }

  resume(row: OrderSummaryDto): void {
    this.router.navigate(['/restaurant/order'], { queryParams: { orderId: row.id } });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  async goPage(delta: number): Promise<void> {
    const next = this.page + delta;
    if (next < 1 || next > this.totalPages) return;
    this.page = next;
    await this.load();
  }

  isOpen(row: OrderSummaryDto): boolean {
    return row.status !== RestaurantOrderStatus.Closed && row.status !== RestaurantOrderStatus.Cancelled;
  }

  statusTone(status: RestaurantOrderStatus): string {
    switch (status) {
      case RestaurantOrderStatus.Closed: return 'tone-success';
      case RestaurantOrderStatus.Cancelled: return 'tone-danger';
      case RestaurantOrderStatus.Billed:
      case RestaurantOrderStatus.Paid: return 'tone-violet';
      case RestaurantOrderStatus.Fired:
      case RestaurantOrderStatus.PartiallyServed: return 'tone-warning';
      default: return 'tone-info';
    }
  }

  trackRow = (_: number, r: OrderSummaryDto) => r.id;
}
