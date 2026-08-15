export interface PriceListDto {
  id: string;
  code: string | null;
  name: string | null;
  currencyCode: string | null;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  /** Populated only by endpoints that expand lines; the list endpoint sends a count. */
  items?: PriceListItemDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreatePriceListDto {
  code: string;
  name: string;
  currencyCode?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  items?: CreatePriceListItemDto[];
}

export interface UpdatePriceListDto {
  name?: string | null;
  currencyCode?: string | null;
  isActive?: boolean | null;
  validFrom?: string | null;
  validTo?: string | null;
}

/**
 * One priced line. Quantity breaks are separate rows for the same product with
 * different bands; the API rejects bands that overlap, since the pricing engine
 * would otherwise have to choose between them arbitrarily.
 */
export interface PriceListItemDto {
  id: string;
  priceListId: string;
  productId: string;
  productCode?: string | null;
  productName?: string | null;
  unitOfMeasure?: string | null;
  unitPrice: number;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  validFrom: string;
  validTo?: string | null;
  isActive: boolean;
}

export interface CreatePriceListItemDto {
  productId: string;
  unitOfMeasure?: string | null;
  unitPrice: number;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface UpdatePriceListItemDto {
  unitPrice?: number | null;
  unitOfMeasure?: string | null;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  isActive?: boolean | null;
}
