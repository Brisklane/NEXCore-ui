// ─── Pricing (live quote) models ──────────────────────────────────────────────
// Server-authoritative pricing preview. The UI must display what the quote
// returns (prices, promotions, coupon, tax, totals) and never compute discounts
// client-side. No persistence — this is a preview only.

export interface PriceOrderLineRequestDto {
  productId: string;
  productCode?: string | null;
  productName?: string | null;
  variantId?: string | null;
  quantity: number;
  unitOfMeasure?: string | null;
  /** TaxCategory: 0=Standard, 1=Reduced, 2=ZeroRated, 3=Exempt, 4=ReverseCharge */
  taxCategory?: number | null;
}

export interface PriceOrderRequestDto {
  contactId?: string | null;
  priceListId?: string | null;
  /** Used to resolve the store's default price list when priceListId is omitted. */
  posStoreId?: string | null;
  couponCode?: string | null;
  /** For code-gated (non-auto) promotions. */
  promotionCode?: string | null;
  /** SalesChannel enum integer (8 = PosWalkIn). */
  salesChannel?: number | null;
  /** Drives tax rule (e.g. "PK"). */
  customerCountryCode?: string | null;
  /** Tax rule match ("B2B"/"B2C"/"WalkIn"); null = any. */
  customerType?: string | null;
  lines: PriceOrderLineRequestDto[];
}

export interface AppliedPromotionDto {
  promotionId: string;
  promotionName: string | null;
  discountAmount: number;
}

export interface PricedLineDto {
  productId: string;
  productCode: string | null;
  productName: string | null;
  variantId: string | null;
  categoryId: string | null;
  quantity: number;
  unitOfMeasure: string | null;
  /** Server-resolved list price — show this, not the client price. */
  listUnitPrice: number;
  discountPerUnit: number;
  /** Total promo discount on the line. */
  discountAmount: number;
  netUnitPrice: number;
  /** Net after line discounts. */
  lineAmount: number;
  taxCategory: number | string | null;
  taxRate: number;
  taxAmount: number;
  appliedPromotions: AppliedPromotionDto[] | null;
}

export interface PricedOrderDto {
  lines: PricedLineDto[] | null;
  /** Before any discount. */
  grossAmount: number;
  lineDiscountAmount: number;
  couponDiscountAmount: number;
  /** line + coupon. */
  discountAmount: number;
  /** Net of all discounts, before tax. */
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  /** Echoed only if the coupon was valid & applied. */
  couponCode: string | null;
  /** Surface these to the cashier (invalid coupon, missing price, etc.). */
  warnings: string[] | null;
}
