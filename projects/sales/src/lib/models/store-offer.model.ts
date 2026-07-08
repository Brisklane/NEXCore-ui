export type StoreOfferType = 'Banner' | 'Promotion' | 'FeaturedItem' | 'Category' | 'Custom';

export interface StoreOfferDto {
  id: string;
  storeId: string;
  offerType: StoreOfferType;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  callToAction: string | null;
  deepLinkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  promotionId: string | null;
  itemId: string | null;
  itemCategoryId: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateStoreOfferDto {
  storeId: string;
  offerType: StoreOfferType;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  badgeText?: string | null;
  badgeColor?: string | null;
  callToAction?: string | null;
  deepLinkUrl?: string | null;
  displayOrder?: number;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  promotionId?: string | null;
  itemId?: string | null;
  itemCategoryId?: string | null;
}

export interface UpdateStoreOfferDto {
  offerType?: StoreOfferType | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  badgeText?: string | null;
  badgeColor?: string | null;
  callToAction?: string | null;
  deepLinkUrl?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  promotionId?: string | null;
  itemId?: string | null;
  itemCategoryId?: string | null;
}
