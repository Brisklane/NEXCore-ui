import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import { DeliveryDto, DeliveryStatus, ShipDeliveryDto } from '../../models/delivery.model';

@Component({
  selector: 'lib-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css',
})
export class DeliveriesComponent implements OnInit {
  deliveries: DeliveryDto[] = [];
  loading = false;
  error = '';
  successMsg = '';

  statusFilter = '';
  searchQuery = '';
  selectedDelivery: DeliveryDto | null = null;

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  showShipForm = false;
  formTrackingNumber = '';
  formCarrier = '';

  private readonly statusMap: Record<number, string> = {
    0: 'Pending', 1: 'ReadyToShip', 2: 'PartiallyShipped', 3: 'Shipped',
    4: 'InTransit', 5: 'OutForDelivery', 6: 'Delivered', 7: 'Failed', 8: 'Cancelled',
  };

  readonly statuses: DeliveryStatus[] = [
    'Pending', 'ReadyToShip', 'PartiallyShipped', 'Shipped',
    'InTransit', 'OutForDelivery', 'Delivered', 'Failed', 'Cancelled',
  ];

  constructor(
    private deliveryService: DeliveryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.deliveryService.getAll().subscribe({
      next: (res) => {
        this.deliveries = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load deliveries.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  normStatus(v: DeliveryStatus | number | string | null): string {
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : (/^\d+$/.test(String(v)) ? +v : NaN);
    return !isNaN(n) ? (this.statusMap[n] ?? String(v)) : String(v);
  }

  get filtered(): DeliveryDto[] {
    let result = this.deliveries;
    if (this.statusFilter) result = result.filter(d => this.normStatus(d.status) === this.statusFilter);
    const q = this.searchQuery.toLowerCase().trim();
    if (q) result = result.filter(d =>
      (d.deliveryNumber ?? '').toLowerCase().includes(q) ||
      (d.salesOrderNumber ?? '').toLowerCase().includes(q) ||
      (d.carrier ?? '').toLowerCase().includes(q) ||
      (d.trackingNumber ?? '').toLowerCase().includes(q) ||
      (d.contactName ?? '').toLowerCase().includes(q)
    );
    const rows = [...result];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  viewDelivery(d: DeliveryDto) {
    this.selectedDelivery = d;
    this.showShipForm = false;
  }

  closeDetail() {
    this.selectedDelivery = null;
    this.showShipForm = false;
  }

  openShipForm() {
    this.formTrackingNumber = this.selectedDelivery?.trackingNumber ?? '';
    this.formCarrier = this.selectedDelivery?.carrier ?? '';
    this.showShipForm = true;
  }

  shipDelivery() {
    if (!this.selectedDelivery) return;
    const dto: ShipDeliveryDto = {
      trackingNumber: this.formTrackingNumber || null,
      carrier: this.formCarrier || null,
    };
    this.deliveryService.ship(this.selectedDelivery.id, dto).subscribe({
      next: () => {
        this.successMsg = 'Delivery shipped — stock deducted from inventory and COGS posted.';
        this.showShipForm = false;
        this.closeDetail();
        this.load();
      },
      error: () => {
        this.error = 'Failed to ship delivery.';
        this.cdr.detectChanges();
      },
    });
  }

  markDelivered(id: string) {
    this.deliveryService.deliver(id).subscribe({
      next: () => {
        this.successMsg = 'Delivery marked as delivered.';
        this.closeDetail();
        this.load();
      },
      error: () => {
        this.error = 'Failed to update delivery.';
        this.cdr.detectChanges();
      },
    });
  }

  deleteDelivery(id: string) {
    if (!confirm('Delete this delivery?')) return;
    this.deliveryService.delete(id).subscribe({
      next: () => {
        this.successMsg = 'Delivery deleted.';
        this.selectedDelivery = null;
        this.load();
      },
      error: () => {
        this.error = 'Failed to delete delivery.';
        this.cdr.detectChanges();
      },
    });
  }

  badgeClass(status: DeliveryStatus | number | string): string {
    return `badge badge-${this.normStatus(status).toLowerCase().replace(/\s/g, '')}`;
  }
}
