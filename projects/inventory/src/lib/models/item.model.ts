import { ColorDto } from './color.model';

export interface ItemBarcodeDto {
  id: string;
  itemId: string;
  unitId: string | null;
  barcode: string | null;
  barcodeType: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface ItemPriceDto {
  id: string;
  itemId: string;
  unitId: string;
  priceList: string | null;
  salePrice: number;
  minSalePrice: number | null;
  purchasePrice: number;
  isTaxInclusive: boolean;
  effectiveTaxRate: number;
  salePriceExcludingTax: number;
  saleTaxAmount: number;
  salePriceIncludingTax: number;
  purchasePriceExcludingTax: number;
  purchaseTaxAmount: number;
  purchasePriceIncludingTax: number;
  currencyCode: string | null;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
}

export interface ItemAttributeDto {
  id: string;
  itemId: string;
  attributeDefinitionId: string;
  attributeName: string | null;
  dataType: string | null;
  value: string | null;
}

export interface ItemTaxDto {
  id: string;
  itemId: string;
  taxDefinitionId: string;
  taxCode: string | null;
  taxName: string | null;
  taxType: string | null;
  overrideRate: number | null;
  effectiveRate: number;
  isActive: boolean;
}

export interface ItemImageDto {
  id: string;
  itemId: string;
  url: string | null;
  resolution: string | null;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
  contentType: string | null;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ItemSizeDto {
  id: string;
  itemId: string;
  sizeId: string;
  sizeCode: string | null;
  sizeName: string | null;
  itemBarcodeId: string | null;
  isDefault: boolean;
  isAvailable: boolean;
}

export interface ItemVariantDto {
  id: string;
  itemId: string;
  variantCode: string | null;
  variantName: string | null;
  colorId: string | null;
  colorName: string | null;
  colorHex: string | null;
  sizeId: string | null;
  sizeName: string | null;
  extraDimension: string | null;
  barcode: string | null;
  imageUrl: string | null;
  salePriceOverride: number | null;
  purchasePriceOverride: number | null;
  weightKg: number | null;
  isActive: boolean;
  displayOrder: number;
}

export interface ItemShippingDto {
  id: string;
  itemId: string;
  weightKg: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  volumetricWeightKg: number | null;
  countryOfOrigin: string | null;
  hsCode: string | null;
  unitsPerCarton: number | null;
  cartonsPerPallet: number | null;
  cartonWeightKg: number | null;
  cartonLengthCm: number | null;
  cartonWidthCm: number | null;
  cartonHeightCm: number | null;
  requiresSpecialHandling: boolean;
  handlingNotes: string | null;
  isHazmat: boolean;
  isShippableInternational: boolean;
}

export interface ItemSeoDto {
  id: string;
  itemId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  slug: string | null;
  canonicalUrl: string | null;
}

export interface ItemChannelListingDto {
  id: string;
  itemId: string;
  channel: string | null;
  listingStatus: string | null;
  channelTitle: string | null;
  channelDescription: string | null;
  channelPrice: number | null;
  channelDiscount: number | null;
  discountType: string | null;
  externalProductId: string | null;
  externalSku: string | null;
  listingUrl: string | null;
  listedAt: string | null;
  lastSyncedAt: string | null;
  autoSyncStock: boolean;
  autoSyncPrice: boolean;
}

export interface ItemSupplierDto {
  id: string;
  itemId: string;
  supplierId: string;
  supplierItemCode: string | null;
  supplierItemName: string | null;
  lastPurchasePrice: number | null;
  currencyCode: string | null;
  minOrderQuantity: number | null;
  leadTimeDays: number | null;
  isPrimary: boolean;
  isActive: boolean;
  lastPurchaseDate: string | null;
}

export interface ItemBundleDto {
  id: string;
  bundleItemId: string;
  componentItemId: string;
  componentItemCode: string | null;
  componentItemName: string | null;
  quantity: number;
  unitId: string;
  unitCode: string | null;
  isIncludedInCost: boolean;
  displayOrder: number;
}

export interface ItemSubstitutionDto {
  id: string;
  itemId: string;
  substituteItemId: string;
  substituteItemCode: string | null;
  substituteItemName: string | null;
  priority: number;
  note: string | null;
  isBidirectional: boolean;
  isActive: boolean;
}

export interface ItemWarrantyDto {
  id: string;
  itemId: string;
  warrantyType: string | null;
  durationMonths: number;
  policyDescription: string | null;
  providerName: string | null;
  providerContact: string | null;
  isActive: boolean;
}

export interface ItemDiscountDto {
  id: string;
  itemId: string;
  name: string | null;
  discountType: string | null;
  discountValue: number;
  buyQuantity: number | null;
  getQuantity: number | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  applicableChannels: string | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  priority: number;
}

export interface ItemCommentDto {
  id: string;
  itemId: string;
  commentType: string | null;
  comment: string | null;
  authorUserId: string;
  isPinned: boolean;
  createdAt: string;
}

export interface ItemDto {
  id: string;
  code: string | null;
  name: string | null;
  itemType: string | null;
  categoryId: string | null;
  brandId: string | null;
  displayColorId: string | null;
  displayColorName: string | null;
  displayColorHex: string | null;
  baseUnitId: string;
  inventoryAccountId: string | null;
  cogsAccountId: string | null;
  purchaseAccountId: string | null;
  salesAccountId: string | null;
  costingMethod: string | null;
  trackingType: string | null;
  isBatchTracked: boolean;
  isSerialTracked: boolean;
  isActive: boolean;
  description: string | null;
  reorderLevel: number | null;
  maxStockLevel: number | null;
  economicOrderQuantity: number | null;
  alertOnLowStock: boolean;
  alertOnExcessStock: boolean;
  images: ItemImageDto[] | null;
  barcodes: ItemBarcodeDto[] | null;
  prices: ItemPriceDto[] | null;
  attributes: ItemAttributeDto[] | null;
  taxes: ItemTaxDto[] | null;
  comments: ItemCommentDto[] | null;
  colors: ColorDto[] | null;
  condition: string | null;
  ageRestriction: number;
  shortDescription: string | null;
  hasVariants: boolean;
  isComponent: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sizes: ItemSizeDto[] | null;
  variants: ItemVariantDto[] | null;
  shipping: ItemShippingDto | null;
  seo: ItemSeoDto | null;
  channelListings: ItemChannelListingDto[] | null;
  suppliers: ItemSupplierDto[] | null;
  bundleComponents: ItemBundleDto[] | null;
  substitutions: ItemSubstitutionDto[] | null;
  warranty: ItemWarrantyDto | null;
  discounts: ItemDiscountDto[] | null;
}

// Create DTOs
export interface CreateItemBarcodeDto {
  unitId?: string | null;
  barcode?: string | null;
  barcodeType?: string | null;
  isPrimary: boolean;
}

export interface CreateItemPriceDto {
  unitId: string;
  priceList?: string | null;
  salePrice: number;
  minSalePrice?: number | null;
  purchasePrice: number;
  isTaxInclusive: boolean;
  currencyCode?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface AssignItemTaxDto {
  taxDefinitionId: string;
  overrideRate?: number | null;
}

export interface UpsertItemAttributeDto {
  attributeDefinitionId: string;
  value?: string | null;
}

export interface AssignItemSizeDto {
  sizeId: string;
  itemBarcodeId?: string | null;
  isDefault: boolean;
}

export interface CreateItemVariantDto {
  variantCode?: string | null;
  variantName?: string | null;
  colorId?: string | null;
  sizeId?: string | null;
  extraDimension?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  salePriceOverride?: number | null;
  purchasePriceOverride?: number | null;
  weightKg?: number | null;
  displayOrder: number;
}

export interface UpsertItemShippingDto {
  weightKg?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  countryOfOrigin?: string | null;
  hsCode?: string | null;
  unitsPerCarton?: number | null;
  cartonsPerPallet?: number | null;
  cartonWeightKg?: number | null;
  cartonLengthCm?: number | null;
  cartonWidthCm?: number | null;
  cartonHeightCm?: number | null;
  requiresSpecialHandling: boolean;
  handlingNotes?: string | null;
  isHazmat: boolean;
  isShippableInternational: boolean;
}

export interface UpsertItemSeoDto {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  slug?: string | null;
  canonicalUrl?: string | null;
}

export interface UpsertItemChannelListingDto {
  channel?: string | null;
  listingStatus?: string | null;
  channelTitle?: string | null;
  channelDescription?: string | null;
  channelPrice?: number | null;
  channelDiscount?: number | null;
  discountType?: string | null;
  externalProductId?: string | null;
  externalSku?: string | null;
  autoSyncStock: boolean;
  autoSyncPrice: boolean;
}

export interface AssignItemSupplierDto {
  supplierId: string;
  supplierItemCode?: string | null;
  supplierItemName?: string | null;
  lastPurchasePrice?: number | null;
  currencyCode?: string | null;
  minOrderQuantity?: number | null;
  leadTimeDays?: number | null;
  isPrimary: boolean;
}

export interface AddBundleComponentDto {
  componentItemId: string;
  quantity: number;
  unitId: string;
  isIncludedInCost: boolean;
  displayOrder: number;
}

export interface AddItemSubstitutionDto {
  substituteItemId: string;
  priority: number;
  note?: string | null;
  isBidirectional: boolean;
}

export interface UpsertItemWarrantyDto {
  warrantyType?: string | null;
  durationMonths: number;
  policyDescription?: string | null;
  providerName?: string | null;
  providerContact?: string | null;
}

export interface CreateItemDiscountDto {
  name?: string | null;
  discountType?: string | null;
  discountValue: number;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  applicableChannels?: string | null;
  validFrom: string;
  validTo: string;
  priority: number;
}

export interface CreateItemCommentDto {
  commentType?: string | null;
  comment?: string | null;
  isPinned: boolean;
}

export interface CreateItemImageDto {
  url?: string | null;
  resolution?: string | null;
  width?: number | null;
  height?: number | null;
  fileSizeBytes?: number | null;
  contentType?: string | null;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface UpdateItemDto {
  code?: string | null;
  name?: string | null;
  itemType?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  displayColorId?: string | null;
  baseUnitId?: string | null;
  condition?: string | null;
  ageRestriction?: number | null;
  inventoryAccountId?: string | null;
  cogsAccountId?: string | null;
  purchaseAccountId?: string | null;
  salesAccountId?: string | null;
  costingMethod?: string | null;
  trackingType?: string | null;
  isBatchTracked?: boolean | null;
  isSerialTracked?: boolean | null;
  hasVariants?: boolean | null;
  isComponent?: boolean | null;
  reorderLevel?: number | null;
  maxStockLevel?: number | null;
  economicOrderQuantity?: number | null;
  alertOnLowStock?: boolean | null;
  alertOnExcessStock?: boolean | null;
  isActive?: boolean | null;
  isPublished?: boolean | null;
  isFeatured?: boolean | null;
  salePrice?: number | null;
  purchasePrice?: number | null;
  colorIds?: string[] | null;
  taxes?: AssignItemTaxDto[] | null;
  attributes?: UpsertItemAttributeDto[] | null;
  sizes?: AssignItemSizeDto[] | null;
  shipping?: UpsertItemShippingDto | null;
  seo?: UpsertItemSeoDto | null;
  warranty?: UpsertItemWarrantyDto | null;
  barcodes?: CreateItemBarcodeDto[] | null;
}

export interface CreateItemDto {
  code?: string | null;
  name?: string | null;
  itemType?: string | null;
  barcode?: string | null;
  salePrice?: number | null;
  purchasePrice?: number | null;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  displayColorId?: string | null;
  baseUnitId: string;
  condition?: string | null;
  ageRestriction: number;
  inventoryAccountId?: string | null;
  cogsAccountId?: string | null;
  purchaseAccountId?: string | null;
  salesAccountId?: string | null;
  costingMethod?: string | null;
  trackingType?: string | null;
  isBatchTracked: boolean;
  isSerialTracked: boolean;
  hasVariants: boolean;
  isComponent: boolean;
  reorderLevel?: number | null;
  maxStockLevel?: number | null;
  economicOrderQuantity?: number | null;
  alertOnLowStock: boolean;
  alertOnExcessStock: boolean;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  images?: CreateItemImageDto[] | null;
  barcodes?: CreateItemBarcodeDto[] | null;
  prices?: CreateItemPriceDto[] | null;
  taxes?: AssignItemTaxDto[] | null;
  attributes?: UpsertItemAttributeDto[] | null;
  colorIds?: string[] | null;
  sizes?: AssignItemSizeDto[] | null;
  variants?: CreateItemVariantDto[] | null;
  shipping?: UpsertItemShippingDto | null;
  seo?: UpsertItemSeoDto | null;
  channelListings?: UpsertItemChannelListingDto[] | null;
  suppliers?: AssignItemSupplierDto[] | null;
  bundleComponents?: AddBundleComponentDto[] | null;
  substitutions?: AddItemSubstitutionDto[] | null;
  warranty?: UpsertItemWarrantyDto | null;
  discounts?: CreateItemDiscountDto[] | null;
  comments?: CreateItemCommentDto[] | null;
}
