export interface LookupItemDto {
  value: string | null;
  label: string | null;
}

export interface InventoryLookupsDto {
  itemTypes: LookupItemDto[] | null;
  itemConditions: LookupItemDto[] | null;
  costingMethods: LookupItemDto[] | null;
  warehouseTypes: LookupItemDto[] | null;
  barcodeTypes: LookupItemDto[] | null;
  priceLists: LookupItemDto[] | null;
  commentTypes: LookupItemDto[] | null;
  salesChannels: LookupItemDto[] | null;
  listingStatuses: LookupItemDto[] | null;
  discountTypes: LookupItemDto[] | null;
  warrantyTypes: LookupItemDto[] | null;
  attributeDataTypes: LookupItemDto[] | null;
  taxTypes: LookupItemDto[] | null;
  sizeCharts: LookupItemDto[] | null;
  imageResolutions: LookupItemDto[] | null;
  documentTypes: LookupItemDto[] | null;
  documentStatuses: LookupItemDto[] | null;
  transactionTypes: LookupItemDto[] | null;
}
