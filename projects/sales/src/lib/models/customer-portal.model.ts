import { SalesOrderDto } from './sales-order.model';

// ─── Store & Menu ─────────────────────────────────────────────────────────────

export interface PortalStoreDto {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  isOnlineEnabled: boolean;
}

export interface StoreMenuCategoryDto {
  id: string;
  name: string | null;
  displayOrder: number;
  items: StoreMenuItemDto[];
}

export interface StoreMenuItemDto {
  id: string;
  productId: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  discountedPrice: number | null;
  isAvailable: boolean;
  variants: StoreMenuItemVariantDto[];
}

export interface StoreMenuItemVariantDto {
  id: string;
  name: string | null;
  price: number;
  isAvailable: boolean;
}

export interface StoreMenuDto {
  storeId: string;
  storeName: string | null;
  categories: StoreMenuCategoryDto[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CreateCartDto {
  storeId: string;
  fulfillmentType?: string | null;
}

export interface AddToCartDto {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice?: number | null;
  specialInstructions?: string | null;
}

export interface UpdateCartLineDto {
  quantity: number;
  specialInstructions?: string | null;
}

export interface ApplyCouponDto {
  couponCode: string;
}

export interface CheckoutDto {
  fulfillmentType?: string | null;
  shipToName?: string | null;
  shipToStreet?: string | null;
  shipToCity?: string | null;
  shipToState?: string | null;
  shipToPostalCode?: string | null;
  shipToCountry?: string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  deliveryInstructions?: string | null;
  notes?: string | null;
}

export interface PortalCartLineDto {
  id: string;
  productId: string;
  productName: string | null;
  imageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
  specialInstructions: string | null;
}

export interface PortalCartDto {
  orderId: string;
  storeId: string;
  storeName: string | null;
  lines: PortalCartLineDto[];
  couponCode: string | null;
  couponDiscountAmount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface PortalOrderSummaryDto {
  id: string;
  orderNumber: string | null;
  status: string | null;
  totalAmount: number;
  createdAt: string;
}

export interface CancelOrderDto {
  reason?: string | null;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface PortalInvoiceSummaryDto {
  id: string;
  invoiceNumber: string | null;
  status: string | null;
  totalAmount: number;
  amountDue: number;
  dueDate: string | null;
  createdAt: string;
}

// ─── Loyalty ─────────────────────────────────────────────────────────────────

export interface PortalLoyaltyDto {
  contactId: string;
  tier: string | null;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface PortalWishlistItemDto {
  id: string;
  productId: string;
  productName: string | null;
  imageUrl: string | null;
  price: number;
  addedAt: string;
}

export interface AddWishlistItemDto {
  productId: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface PortalReviewDto {
  id: string;
  productId: string;
  productName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CreateReviewDto {
  productId: string;
  orderId?: string | null;
  rating: number;
  comment?: string | null;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface PortalNotificationDto {
  id: string;
  title: string | null;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── Enum reference data ──────────────────────────────────────────────────────

export interface PortalEnumReferenceDataDto {
  orderStatuses: { value: string; name: string }[];
  fulfillmentTypes: { value: string; name: string }[];
  salesChannels: { value: string; name: string }[];
}
