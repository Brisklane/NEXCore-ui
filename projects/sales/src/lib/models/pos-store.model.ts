export type PosStoreType = 'Retail' | 'Restaurant' | 'Cafe' | 'Pharmacy' | 'Grocery' | 'Other';
export type PosStoreFormat = 'Standalone' | 'Mall' | 'Kiosk' | 'DriveThrough' | 'Ghost' | 'Other';
export type StoreOnlineStatus = 'Online' | 'Offline' | 'Busy' | 'Closed';
export type VendorOnboardingStatus = 'NotStarted' | 'InProgress' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended';

export interface PosStoreDto {
  id: string;
  storeCode: string | null;
  tradingName: string | null;
  nativeLanguageName: string | null;
  storeType: PosStoreType | null;
  storeFormat: PosStoreFormat | null;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  defaultWarehouseId: string | null;
  defaultPriceListId: string | null;
  acceptsOnlinePickup: boolean;
  hasDelivery: boolean;
  isOnlineOrderingEnabled: boolean;
  estimatedPrepTimeMinutes: number | null;
  minOnlineOrderAmount: number | null;
  maxDeliveryRadiusKm: number | null;
  onlineLogoUrl: string | null;
  onlineBannerUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  onlineStatus: StoreOnlineStatus | null;
  onlineStatusNote: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

export interface NearbyStoreDto extends PosStoreDto {
  distanceKm: number;
}

export interface CreatePosStoreDto {
  storeCode: string;
  tradingName: string;
  nativeLanguageName?: string | null;
  storeType?: PosStoreType | number;
  storeFormat?: PosStoreFormat | number;
  phone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  defaultWarehouseId?: string | null;
  defaultPriceListId?: string | null;
  acceptsOnlinePickup?: boolean;
  hasDelivery?: boolean;
  isOnlineOrderingEnabled?: boolean;
  estimatedPrepTimeMinutes?: number | null;
  minOnlineOrderAmount?: number | null;
  maxDeliveryRadiusKm?: number | null;
  onlineLogoUrl?: string | null;
  onlineBannerUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdatePosStoreDto {
  tradingName?: string | null;
  nativeLanguageName?: string | null;
  storeType?: PosStoreType | number | null;
  storeFormat?: PosStoreFormat | number | null;
  defaultWarehouseId?: string | null;
  defaultPriceListId?: string | null;
  phone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  onlineStatus?: StoreOnlineStatus | number | null;
  onlineStatusNote?: string | null;
  isOnlineOrderingEnabled?: boolean | null;
  estimatedPrepTimeMinutes?: number | null;
  minOnlineOrderAmount?: number | null;
  maxDeliveryRadiusKm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean | null;
}

export interface SetStoreOnlineStatusDto {
  onlineStatus: StoreOnlineStatus;
  note?: string | null;
}

export interface VendorProfileDto {
  id: string;
  storeId: string;
  onboardingStatus: VendorOnboardingStatus | null;
  ownerName: string | null;
  ownerCnic: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
  cnicFrontDocUrl: string | null;
  cnicBackDocUrl: string | null;
  businessName: string | null;
  businessRegistrationNumber: string | null;
  foodLicenseNumber: string | null;
  foodLicenseExpiry: string | null;
  foodLicenseDocUrl: string | null;
  businessDescription: string | null;
  bankName: string | null;
  bankBranch: string | null;
  accountTitle: string | null;
  accountNumber: string | null;
  ibanNumber: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  whatsappNumber: string | null;
  storeFrontPhotoUrl: string | null;
  kitchenPhotos: string[] | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewNotes: string | null;
}

export interface UpsertVendorProfileDto {
  ownerName?: string | null;
  ownerCnic?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  cnicFrontDocUrl?: string | null;
  cnicBackDocUrl?: string | null;
  businessName?: string | null;
  businessRegistrationNumber?: string | null;
  foodLicenseNumber?: string | null;
  foodLicenseExpiry?: string | null;
  foodLicenseDocUrl?: string | null;
  businessDescription?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  accountTitle?: string | null;
  accountNumber?: string | null;
  ibanNumber?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  whatsappNumber?: string | null;
  storeFrontPhotoUrl?: string | null;
  kitchenPhotos?: string[] | null;
}

export interface ReviewVendorApplicationDto {
  decision: VendorOnboardingStatus;
  rejectionReason?: string | null;
  reviewNotes?: string | null;
}
