import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerPortalService } from '../../services/customer-portal.service';
import { PosStoreService } from '../../services/pos-store.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { PortalStoreDto, PortalOrderSummaryDto, PortalReviewDto, PortalNotificationDto } from '../../models/customer-portal.model';
import { PosStoreDto, NearbyStoreDto } from '../../models/pos-store.model';
import { SalesOrderDto } from '../../models/sales-order.model';

export type PortalTab = 'stores' | 'nearby' | 'orders' | 'reviews' | 'notifications';

@Component({
  selector: 'lib-customer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-portal.html',
  styleUrls: ['../shared-styles.css', './customer-portal.css'],
})
export class CustomerPortalComponent implements OnInit {
  activeTab: PortalTab = 'stores';
  error = '';
  successMsg = '';

  // ── Stores ─────────────────────────────────────────────────────────────────
  onlineStores: PosStoreDto[] = [];

  // ── Nearby Stores ──────────────────────────────────────────────────────────
  nearbyStores: NearbyStoreDto[] = [];
  nearbyLoading = false;
  nearbyError = '';
  nearbyRadiusKm = 5;
  nearbySearched = false;
  storesLoading = false;
  storeSearch = '';

  get filteredStores(): PosStoreDto[] {
    const q = this.storeSearch.toLowerCase().trim();
    if (!q) return this.onlineStores;
    return this.onlineStores.filter(s =>
      (s.tradingName ?? '').toLowerCase().includes(q) ||
      (s.storeCode ?? '').toLowerCase().includes(q)
    );
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  portalOrders: SalesOrderDto[] = [];
  ordersLoading = false;
  orderSearch = '';

  get filteredOrders(): SalesOrderDto[] {
    const q = this.orderSearch.toLowerCase().trim();
    if (!q) return this.portalOrders;
    return this.portalOrders.filter(o =>
      (o.orderNumber ?? '').toLowerCase().includes(q) ||
      (o.contactName ?? '').toLowerCase().includes(q)
    );
  }

  // ── Reviews ────────────────────────────────────────────────────────────────
  reviews: PortalReviewDto[] = [];
  reviewsLoading = false;
  reviewSearch = '';

  get filteredReviews(): PortalReviewDto[] {
    const q = this.reviewSearch.toLowerCase().trim();
    if (!q) return this.reviews;
    return this.reviews.filter(r =>
      (r.productName ?? '').toLowerCase().includes(q) ||
      (r.comment ?? '').toLowerCase().includes(q)
    );
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: PortalNotificationDto[] = [];
  notificationsLoading = false;
  unreadOnly = false;

  get visibleNotifications(): PortalNotificationDto[] {
    return this.unreadOnly ? this.notifications.filter(n => !n.isRead) : this.notifications;
  }

  constructor(
    private portalService: CustomerPortalService,
    private posStoreService: PosStoreService,
    private orderService: SalesOrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadTab(this.activeTab);
  }

  setTab(tab: PortalTab) {
    this.activeTab = tab;
    this.error = '';
    this.loadTab(tab);
  }

  loadTab(tab: PortalTab) {
    switch (tab) {
      case 'stores':        this.loadStores(); break;
      case 'nearby':        break; // triggered on button click
      case 'orders':        this.loadOrders(); break;
      case 'reviews':       this.loadReviews(); break;
      case 'notifications': this.loadNotifications(); break;
    }
  }

  // ── Stores ─────────────────────────────────────────────────────────────────
  loadStores() {
    this.storesLoading = true;
    this.posStoreService.getOnlineEnabled().subscribe({
      next: (res) => {
        this.onlineStores = res.data ?? [];
        this.storesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load portal stores.';
        this.storesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  loadOrders() {
    this.ordersLoading = true;
    this.orderService.byChannel('Portal').subscribe({
      next: (res) => {
        this.portalOrders = res.data ?? [];
        this.ordersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load portal orders.';
        this.ordersLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Reviews ────────────────────────────────────────────────────────────────
  loadReviews() {
    this.reviewsLoading = true;
    this.portalService.getReviews().subscribe({
      next: (res) => {
        this.reviews = res.data ?? [];
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load reviews.';
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  loadNotifications() {
    this.notificationsLoading = true;
    this.portalService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res.data ?? [];
        this.notificationsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load notifications.';
        this.notificationsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Nearby ─────────────────────────────────────────────────────────────────
  findNearbyStores() {
    if (!navigator.geolocation) {
      this.nearbyError = 'Geolocation is not supported by your browser.';
      return;
    }
    this.nearbyLoading = true;
    this.nearbyError = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.posStoreService.getNearby(lat, lng, this.nearbyRadiusKm).subscribe({
          next: (res) => {
            this.nearbyStores = res.data ?? [];
            this.nearbySearched = true;
            this.nearbyLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.nearbyError = 'Failed to fetch nearby stores.';
            this.nearbyLoading = false;
            this.cdr.detectChanges();
          },
        });
      },
      () => {
        this.nearbyError = 'Unable to get your location. Please allow location access.';
        this.nearbyLoading = false;
        this.cdr.detectChanges();
      },
    );
  }

  getMapUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  formatPrepTime(store: NearbyStoreDto): string {
    if (!store.estimatedPrepTimeMinutes) return '';
    return `~${store.estimatedPrepTimeMinutes} min prep`;
  }

  markAllRead() {
    this.portalService.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => (n.isRead = true));
        this.successMsg = 'All notifications marked as read.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to mark notifications as read.';
        this.cdr.detectChanges();
      },
    });
  }

  markOneRead(n: PortalNotificationDto) {
    if (n.isRead) return;
    this.portalService.markNotificationRead(n.id).subscribe({
      next: () => {
        n.isRead = true;
        this.cdr.detectChanges();
      },
    });
  }

  starsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  orderStatusClass(status: string | null): string {
    return 'badge badge-' + String(status ?? '').toLowerCase().replace(/\s/g, '');
  }
}
