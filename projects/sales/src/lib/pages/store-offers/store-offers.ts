import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreOfferService } from '../../services/store-offer.service';
import { PosStoreService } from '../../services/pos-store.service';
import { PromotionService } from '../../services/promotion.service';
import { ItemService } from '@nexcore/inventory';
import { StoreOfferDto, StoreOfferType } from '../../models/store-offer.model';
import { PosStoreDto } from '../../models/pos-store.model';
import { PromotionDto } from '../../models/promotion.model';
import { ItemDto } from '@nexcore/inventory';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-store-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store-offers.html',
  styleUrl: './store-offers.css',
})
export class StoreOffersComponent implements OnInit {
  offers: StoreOfferDto[] = [];
  loading = false;
  error = '';
  successMsg = '';
  highlighter = new RowHighlighter();

  stores: PosStoreDto[] = [];
  promotions: PromotionDto[] = [];
  items: ItemDto[] = [];
  filterStoreId = '';
  showAll = false;
  searchQuery = '';

  showForm = false;
  editingOffer: StoreOfferDto | null = null;
  formStoreId = '';
  formOfferType: StoreOfferType = 'Banner';
  formTitle = '';
  formSubtitle = '';
  formDescription = '';
  formImageUrl = '';
  formBannerUrl = '';
  formBadgeText = '';
  formBadgeColor = '';
  formCallToAction = '';
  formDeepLinkUrl = '';
  formDisplayOrder = 0;
  formStartDate = '';
  formEndDate = '';
  formPromotionId = '';
  formItemId = '';
  formItemCategoryId = '';

  readonly offerTypes: StoreOfferType[] = ['Banner', 'Promotion', 'FeaturedItem', 'Category', 'Custom'];

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  get filteredOffers(): StoreOfferDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    const filteredRows = !q ? this.offers : this.offers.filter(o =>
      o.title.toLowerCase().includes(q) ||
      (o.subtitle ?? '').toLowerCase().includes(q) ||
      o.offerType.toLowerCase().includes(q),
    );
    const rows = [...filteredRows];
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
    const hid = this.highlighter?.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  constructor(
    private offerService: StoreOfferService,
    private storeService: PosStoreService,
    private promotionService: PromotionService,
    private itemService: ItemService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.storeService.getAll().subscribe({
      next: (res) => { this.stores = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
    this.promotionService.getAll().subscribe({
      next: (res) => { this.promotions = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
    this.itemService.getActive().subscribe({
      next: (res) => { this.items = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  onFilterStoreChange() {
    this.offers = [];
    if (!this.filterStoreId) return;
    this.loadOffers();
  }

  loadOffers() {
    if (!this.filterStoreId) { this.error = 'Select a store.'; return; }
    this.loading = true;
    this.error = '';
    const obs = this.showAll
      ? this.offerService.getAllByStore(this.filterStoreId)
      : this.offerService.getByStore(this.filterStoreId);
    obs.subscribe({
      next: (res) => {
        this.offers = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load store offers.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingOffer = null;
    this.formStoreId = this.filterStoreId;
    this.formOfferType = 'Banner';
    this.formTitle = '';
    this.formSubtitle = '';
    this.formDescription = '';
    this.formImageUrl = '';
    this.formBannerUrl = '';
    this.formBadgeText = '';
    this.formBadgeColor = '';
    this.formCallToAction = '';
    this.formDeepLinkUrl = '';
    this.formDisplayOrder = 0;
    this.formStartDate = '';
    this.formEndDate = '';
    this.formPromotionId = '';
    this.formItemId = '';
    this.formItemCategoryId = '';
    this.showForm = true;
  }

  openEditForm(o: StoreOfferDto) {
    this.editingOffer = o;
    this.formStoreId = o.storeId;
    this.formOfferType = o.offerType;
    this.formTitle = o.title;
    this.formSubtitle = o.subtitle ?? '';
    this.formDescription = o.description ?? '';
    this.formImageUrl = o.imageUrl ?? '';
    this.formBannerUrl = o.bannerUrl ?? '';
    this.formBadgeText = o.badgeText ?? '';
    this.formBadgeColor = o.badgeColor ?? '';
    this.formCallToAction = o.callToAction ?? '';
    this.formDeepLinkUrl = o.deepLinkUrl ?? '';
    this.formDisplayOrder = o.displayOrder;
    this.formStartDate = o.startDate ? o.startDate.substring(0, 10) : '';
    this.formEndDate = o.endDate ? o.endDate.substring(0, 10) : '';
    this.formPromotionId = o.promotionId ?? '';
    this.formItemId = o.itemId ?? '';
    this.formItemCategoryId = o.itemCategoryId ?? '';
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingOffer = null;
  }

  save() {
    if (!this.formTitle) { this.error = 'Title is required.'; return; }
    if (this.editingOffer) {
      this.offerService.update(this.editingOffer.id, {
        offerType: this.formOfferType,
        title: this.formTitle,
        subtitle: this.formSubtitle || null,
        description: this.formDescription || null,
        imageUrl: this.formImageUrl || null,
        bannerUrl: this.formBannerUrl || null,
        badgeText: this.formBadgeText || null,
        badgeColor: this.formBadgeColor || null,
        callToAction: this.formCallToAction || null,
        deepLinkUrl: this.formDeepLinkUrl || null,
        displayOrder: this.formDisplayOrder,
        startDate: this.formStartDate || null,
        endDate: this.formEndDate || null,
        promotionId: this.formPromotionId || null,
        itemId: this.formItemId || null,
        itemCategoryId: this.formItemCategoryId || null,
      }).subscribe({
        next: () => { this.successMsg = 'Offer updated.'; this.cancelForm(); this.loadOffers(); },
        error: () => { this.error = 'Failed to update.'; this.cdr.detectChanges(); },
      });
    } else {
      if (!this.formStoreId) { this.error = 'Store ID is required.'; return; }
      this.offerService.create({
        storeId: this.formStoreId,
        offerType: this.formOfferType,
        title: this.formTitle,
        subtitle: this.formSubtitle || null,
        description: this.formDescription || null,
        imageUrl: this.formImageUrl || null,
        bannerUrl: this.formBannerUrl || null,
        badgeText: this.formBadgeText || null,
        badgeColor: this.formBadgeColor || null,
        callToAction: this.formCallToAction || null,
        deepLinkUrl: this.formDeepLinkUrl || null,
        displayOrder: this.formDisplayOrder,
        startDate: this.formStartDate || null,
        endDate: this.formEndDate || null,
        promotionId: this.formPromotionId || null,
        itemId: this.formItemId || null,
        itemCategoryId: this.formItemCategoryId || null,
      }).subscribe({
        next: (res) => { this.successMsg = 'Offer created.'; this.cancelForm(); this.loadOffers(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: () => { this.error = 'Failed to create.'; this.cdr.detectChanges(); },
      });
    }
  }

  toggle(id: string) {
    this.offerService.toggle(id).subscribe({
      next: () => { this.successMsg = 'Offer toggled.'; this.loadOffers(); },
      error: () => { this.error = 'Failed to toggle.'; this.cdr.detectChanges(); },
    });
  }

  delete(id: string) {
    if (!confirm('Delete this offer?')) return;
    this.offerService.delete(id).subscribe({
      next: () => { this.successMsg = 'Offer deleted.'; this.loadOffers(); },
      error: () => { this.error = 'Failed to delete.'; this.cdr.detectChanges(); },
    });
  }
}
