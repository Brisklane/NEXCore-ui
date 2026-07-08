// Names mirror the backend enums. Values travel over the wire as ints.
export type PromotionStatus = 'Draft' | 'Active' | 'Paused' | 'Expired' | 'Cancelled';
export type PromotionDiscountType = 'PercentageOff' | 'FixedAmountOff' | 'NewPrice' | 'BuyXGetYFree' | 'FreeItem';
export type PromotionConditionType = 'None' | 'MinQuantity' | 'MinOrderAmount' | 'ExactQuantity';
export type PromotionTargetType = 'AllCustomers' | 'LoyaltyTier' | 'PriceList' | 'SpecificContact';
export type PriceTarget = 'UnitPrice' | 'LineTotal' | 'OrderTotal';

export interface PromotionItemDto {
  id: string;
  promotionId: string;
  itemId: string | null;
  itemCategoryId: string | null;
  discountType: PromotionDiscountType;
  priceTarget: PriceTarget;
  value: number;
  isConditional: boolean;
  conditionType: PromotionConditionType | null;
  conditionQuantity: number | null;
  conditionAmount: number | null;
  maxDiscountedQuantity: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  freeItemId: string | null;
}

export interface PromotionDto {
  id: string;
  name: string;
  description: string | null;
  promotionCode: string | null;
  status: PromotionStatus | number;
  isAutoApplied: boolean;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  scheduledDays: number | null;
  maxUsageCount: number | null;
  maxUsagePerCustomer: number | null;
  minOrderAmount: number | null;
  targetType: PromotionTargetType | number;
  requiredLoyaltyTier: string | null;
  requiredPriceListId: string | null;
  targetContactId: string | null;
  isStackable: boolean;
  notes: string | null;
  items: PromotionItemDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreatePromotionItemDto {
  itemId?: string | null;
  itemCategoryId?: string | null;
  discountType: PromotionDiscountType;
  priceTarget: PriceTarget;
  value: number;
  isConditional?: boolean;
  conditionType?: PromotionConditionType | null;
  conditionQuantity?: number | null;
  conditionAmount?: number | null;
  maxDiscountedQuantity?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  freeItemId?: string | null;
}

export interface CreatePromotionDto {
  name: string;
  description?: string | null;
  promotionCode?: string | null;
  isAutoApplied?: boolean;
  priority?: number;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  scheduledDays?: number | null;
  maxUsageCount?: number | null;
  maxUsagePerCustomer?: number | null;
  minOrderAmount?: number | null;
  targetType?: PromotionTargetType | number;
  requiredLoyaltyTier?: string | null;
  requiredPriceListId?: string | null;
  targetContactId?: string | null;
  isStackable?: boolean;
  notes?: string | null;
  items?: CreatePromotionItemDto[];
}

export interface UpdatePromotionDto {
  name?: string | null;
  description?: string | null;
  isAutoApplied?: boolean | null;
  priority?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  scheduledDays?: number | null;
  maxUsageCount?: number | null;
  maxUsagePerCustomer?: number | null;
  minOrderAmount?: number | null;
  targetType?: PromotionTargetType | number | null;
  requiredLoyaltyTier?: string | null;
  requiredPriceListId?: string | null;
  targetContactId?: string | null;
  isStackable?: boolean | null;
  notes?: string | null;
}
