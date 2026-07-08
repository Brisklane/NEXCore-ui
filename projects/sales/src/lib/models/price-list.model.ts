export interface PriceListItemDto {
  id: string;
  inventoryItemId: string;
  itemName: string | null;
  price: number;
  minQuantity: number;
}

export interface PriceListDto {
  id: string;
  code: string | null;
  name: string | null;
  currencyCode: string | null;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  items: PriceListItemDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreatePriceListItemDto {
  inventoryItemId: string;
  price: number;
  minQuantity?: number;
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
