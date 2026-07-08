// ─── Receipt Templates ────────────────────────────────────────────────────────
// Drives the thermal receipt, the full HTML receipt, and the invoice document.

export type PaperSize = 'Thermal58mm' | 'Thermal80mm' | 'A4';

export interface PosReceiptTemplateDto {
  id: string;
  templateName: string | null;
  // Header
  headerBusinessName: string | null;
  headerAddressLine1: string | null;
  headerAddressLine2: string | null;
  headerPhone: string | null;
  headerEmail: string | null;
  headerWebsite: string | null;
  taxRegistrationNumber: string | null;
  logoUrl: string | null;
  headerMessage: string | null;
  // Footer
  footerMessage: string | null;
  returnPolicy: string | null;
  // Show / hide toggles
  showBarcode: boolean;
  showQrCode: boolean;
  showCashierName: boolean;
  showCustomerName: boolean;
  showDiscountLine: boolean;
  showTaxBreakdown: boolean;
  showLoyaltyPoints: boolean;
  showSavingsAmount: boolean;
  // Layout
  paperSize: PaperSize | string | null;
  isDefault: boolean;
}

export interface CreatePosReceiptTemplateDto {
  templateName?: string | null;
  headerBusinessName?: string | null;
  headerAddressLine1?: string | null;
  headerAddressLine2?: string | null;
  headerPhone?: string | null;
  headerEmail?: string | null;
  headerWebsite?: string | null;
  taxRegistrationNumber?: string | null;
  logoUrl?: string | null;
  headerMessage?: string | null;
  footerMessage?: string | null;
  returnPolicy?: string | null;
  showBarcode?: boolean;
  showQrCode?: boolean;
  showCashierName?: boolean;
  showCustomerName?: boolean;
  showDiscountLine?: boolean;
  showTaxBreakdown?: boolean;
  showLoyaltyPoints?: boolean;
  showSavingsAmount?: boolean;
  paperSize?: PaperSize | string | null;
  isDefault?: boolean;
}

export interface UpdatePosReceiptTemplateDto {
  templateName?: string | null;
  headerBusinessName?: string | null;
  headerAddressLine1?: string | null;
  headerAddressLine2?: string | null;
  headerPhone?: string | null;
  headerEmail?: string | null;
  headerWebsite?: string | null;
  taxRegistrationNumber?: string | null;
  logoUrl?: string | null;
  headerMessage?: string | null;
  footerMessage?: string | null;
  returnPolicy?: string | null;
  showBarcode?: boolean | null;
  showQrCode?: boolean | null;
  showCashierName?: boolean | null;
  showCustomerName?: boolean | null;
  showDiscountLine?: boolean | null;
  showTaxBreakdown?: boolean | null;
  showLoyaltyPoints?: boolean | null;
  showSavingsAmount?: boolean | null;
  paperSize?: PaperSize | string | null;
  isDefault?: boolean | null;
}

// ─── Thermal receipt (rendered, ready to print) ───────────────────────────────

export interface ThermalReceiptDto {
  paperSize: string | null;
  charactersPerLine: number;
  receiptNumber: string | null;
  content: string | null;
}

// ─── Cash Drawers ─────────────────────────────────────────────────────────────

export interface PosCashDrawerDto {
  id: string;
  name: string | null;
  storeId: string;
  storeName: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreatePosCashDrawerDto {
  name: string;
  storeId: string;
}

export interface UpdatePosCashDrawerDto {
  name?: string | null;
  isActive?: boolean | null;
}

// ─── POS Settings (tenant-wide POS configuration) ─────────────────────────────
// A single configuration record returned by GET /api/sales/PosSettings, updated
// via PUT, and restored to factory defaults via POST .../reset. The new POS
// Settings hub binds its config tabs to this object.

export interface PosSettingsDto {
  id: string;

  // General
  requireCashierPin: boolean;
  autoLockMinutes: number;
  allowPriceOverride: boolean;
  allowDiscount: boolean;
  maxDiscountPercent: number;
  requireCustomer: boolean;
  defaultCustomerId: string | null;
  allowNegativeStock: boolean;
  taxInclusivePricing: boolean;
  autoApplyTax: boolean;
  defaultCurrencyCode: string | null;
  roundingValue: number;
  roundingMode: string | null;

  // Payments
  acceptCash: boolean;
  acceptCard: boolean;
  acceptMobilePayment: boolean;
  acceptCreditOnAccount: boolean;
  allowSplitPayment: boolean;
  allowPartialPayment: boolean;
  defaultPaymentMethod: string | null;
  autoOpenCashDrawer: boolean;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  /** GL account number for cash receipts (e.g. "1111"). Null = use PostingProfile default. */
  cashGlAccountNumber: string | null;
  /** GL account number for card/bank/mobile receipts (e.g. "1112"). Null = use PostingProfile default. */
  bankGlAccountNumber: string | null;

  // Display
  showProductImages: boolean;
  showProductDescription: boolean;
  allowItemNotes: boolean;
  allowDecimalQuantity: boolean;
  barcodeScanSound: boolean;
  showStockLevel: boolean;
  lowStockThreshold: number;
  itemsPerPage: number;
  showCategoryFilter: boolean;
  touchMode: boolean;

  // Connectivity / Operating Mode
  /** Online | OfflineFallback | LocalFirst */
  operatingMode: string;

  // Session
  requireOpeningFloat: boolean;
  requireCashCountOnClose: boolean;
  autoCloseSession: boolean;
  autoCloseTime: string | null;

  // Promotions & Loyalty
  enableLoyaltyPoints: boolean;
  enablePromotions: boolean;
  enableCoupons: boolean;
  autoApplyPromotions: boolean;

  // Receipt
  defaultPaperSize: PaperSize | string | null;
  receiptCopies: number;
  autoPrintReceipt: boolean;
  askToPrintReceipt: boolean;
  skipReceiptScreen: boolean;
  receiptShowLogo: boolean;
  receiptShowBusinessName: boolean;
  receiptShowAddress: boolean;
  receiptShowContact: boolean;
  receiptShowCashierName: boolean;
  receiptShowCustomerName: boolean;
  receiptShowOrderNumber: boolean;
  receiptShowDateTime: boolean;
  receiptShowItemCodes: boolean;
  receiptShowUnitPrice: boolean;
  receiptShowLineDiscount: boolean;
  receiptShowTaxBreakdown: boolean;
  receiptShowDiscountLine: boolean;
  receiptShowBarcode: boolean;
  receiptShowQrCode: boolean;
  receiptBarcodeSymbology: string | null;
  receiptAutoCutPaper: boolean;
  receiptHeaderNote: string | null;
  receiptFooterMessage: string | null;
  receiptReturnPolicy: string | null;

  // Appearance
  theme: string | null;
  primaryColor: string | null;
  defaultProductView: string | null;
  showNumpad: boolean;
  showFavouritesBar: boolean;
}

/** PUT payload — every field optional/nullable; omitted fields are left unchanged. */
export interface UpdatePosSettingsDto {
  // General
  requireCashierPin?: boolean | null;
  autoLockMinutes?: number | null;
  allowPriceOverride?: boolean | null;
  allowDiscount?: boolean | null;
  maxDiscountPercent?: number | null;
  requireCustomer?: boolean | null;
  defaultCustomerId?: string | null;
  allowNegativeStock?: boolean | null;
  taxInclusivePricing?: boolean | null;
  autoApplyTax?: boolean | null;
  defaultCurrencyCode?: string | null;
  roundingValue?: number | null;
  roundingMode?: string | null;

  // Payments
  acceptCash?: boolean | null;
  acceptCard?: boolean | null;
  acceptMobilePayment?: boolean | null;
  acceptCreditOnAccount?: boolean | null;
  allowSplitPayment?: boolean | null;
  allowPartialPayment?: boolean | null;
  defaultPaymentMethod?: string | null;
  autoOpenCashDrawer?: boolean | null;
  minOrderAmount?: number | null;
  maxOrderAmount?: number | null;
  cashGlAccountNumber?: string | null;
  bankGlAccountNumber?: string | null;

  // Display
  showProductImages?: boolean | null;
  showProductDescription?: boolean | null;
  allowItemNotes?: boolean | null;
  allowDecimalQuantity?: boolean | null;
  barcodeScanSound?: boolean | null;
  showStockLevel?: boolean | null;
  lowStockThreshold?: number | null;
  itemsPerPage?: number | null;
  showCategoryFilter?: boolean | null;
  touchMode?: boolean | null;

  // Connectivity / Operating Mode
  operatingMode?: string | null;

  // Session
  requireOpeningFloat?: boolean | null;
  requireCashCountOnClose?: boolean | null;
  autoCloseSession?: boolean | null;
  autoCloseTime?: string | null;

  // Promotions & Loyalty
  enableLoyaltyPoints?: boolean | null;
  enablePromotions?: boolean | null;
  enableCoupons?: boolean | null;
  autoApplyPromotions?: boolean | null;

  // Receipt
  defaultPaperSize?: PaperSize | string | null;
  receiptCopies?: number | null;
  autoPrintReceipt?: boolean | null;
  askToPrintReceipt?: boolean | null;
  skipReceiptScreen?: boolean | null;
  receiptShowLogo?: boolean | null;
  receiptShowBusinessName?: boolean | null;
  receiptShowAddress?: boolean | null;
  receiptShowContact?: boolean | null;
  receiptShowCashierName?: boolean | null;
  receiptShowCustomerName?: boolean | null;
  receiptShowOrderNumber?: boolean | null;
  receiptShowDateTime?: boolean | null;
  receiptShowItemCodes?: boolean | null;
  receiptShowUnitPrice?: boolean | null;
  receiptShowLineDiscount?: boolean | null;
  receiptShowTaxBreakdown?: boolean | null;
  receiptShowDiscountLine?: boolean | null;
  receiptShowBarcode?: boolean | null;
  receiptShowQrCode?: boolean | null;
  receiptBarcodeSymbology?: string | null;
  receiptAutoCutPaper?: boolean | null;
  receiptHeaderNote?: string | null;
  receiptFooterMessage?: string | null;
  receiptReturnPolicy?: string | null;

  // Appearance
  theme?: string | null;
  primaryColor?: string | null;
  defaultProductView?: string | null;
  showNumpad?: boolean | null;
  showFavouritesBar?: boolean | null;
}
