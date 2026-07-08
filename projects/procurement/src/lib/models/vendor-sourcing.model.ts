// ── Approved Vendor List (AVL) ──────────────────────────────────────────────────

export interface ApprovedVendorListDto {
  id: string;
  itemId?: string;
  itemCode?: string;
  itemDescription?: string;
  procurementCategoryId?: string;
  procurementCategoryName?: string;
  vendorId: string;
  vendorName: string;
  vendorNumber: string;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  isPreferred: boolean;
  isExclusive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  defaultUnitPrice?: number;
  currencyCode?: string;
  leadTimeDays: number;
  minimumOrderQuantity?: number;
  unitOfMeasureId?: string;
  requiresQualityInspection: boolean;
  approvedByUserId?: string;
  approvedAt?: string;
  notes?: string;
}

export interface CreateApprovedVendorListDto {
  itemId?: string;
  itemCode?: string;
  itemDescription?: string;
  procurementCategoryId?: string;
  vendorId: string;
  validFrom: string;
  validTo?: string;
  isPreferred?: boolean;
  isExclusive?: boolean;
  defaultUnitPrice?: number;
  currencyCode?: string;
  leadTimeDays?: number;
  minimumOrderQuantity?: number;
  unitOfMeasureId?: string;
  requiresQualityInspection?: boolean;
  notes?: string;
}

export interface UpdateApprovedVendorListDto {
  itemCode?: string;
  itemDescription?: string;
  procurementCategoryId?: string;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
  isPreferred?: boolean;
  isExclusive?: boolean;
  defaultUnitPrice?: number;
  currencyCode?: string;
  leadTimeDays?: number;
  minimumOrderQuantity?: number;
  requiresQualityInspection?: boolean;
  notes?: string;
}

export interface BlockApprovedVendorDto {
  blockReason: string;
}

// ── Vendor Performance ──────────────────────────────────────────────────────────

export interface VendorPerformanceDto {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorNumber: string;
  periodFrom: string;
  periodTo: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  priceComplianceRate: number;
  responsivenessScore: number;
  documentAccuracyScore: number;
  overallRating: number;
  totalOrders: number;
  lateDeliveries: number;
  qualityRejections: number;
  invoiceDiscrepancies: number;
  totalPurchaseValue: number;
  evaluatedByUserId?: string;
  evaluatedAt?: string;
  comments?: string;
}

export interface CreateVendorPerformanceDto {
  vendorId: string;
  periodFrom: string;
  periodTo: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  priceComplianceRate: number;
  responsivenessScore: number;
  documentAccuracyScore: number;
  totalOrders: number;
  lateDeliveries: number;
  qualityRejections: number;
  invoiceDiscrepancies: number;
  totalPurchaseValue: number;
  comments?: string;
}

export interface UpdateVendorPerformanceDto {
  periodFrom?: string;
  periodTo?: string;
  onTimeDeliveryRate?: number;
  qualityScore?: number;
  priceComplianceRate?: number;
  responsivenessScore?: number;
  documentAccuracyScore?: number;
  totalOrders?: number;
  lateDeliveries?: number;
  qualityRejections?: number;
  invoiceDiscrepancies?: number;
  totalPurchaseValue?: number;
  comments?: string;
}
