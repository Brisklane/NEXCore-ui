export interface CouponDto {
  id: string;
  code: string | null;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxUsageCount: number | null;
  usageCount: number;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
}

export type DiscountType = 'Percentage' | 'FixedAmount';
