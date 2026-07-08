export interface ReportBucket { label: string; count: number; value: number; }
export interface VendorSpend { vendorId: string; vendorName: string; orderCount: number; value: number; }

export interface PurchaseAnalysisDto {
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  openOrders: number;
  invoicedValue: number;
  outstandingValue: number;
  currencyCode: string;
  byStatus: ReportBucket[];
  monthlyTrend: ReportBucket[];
  topVendors: VendorSpend[];
}

export interface VendorAnalysisRowDto {
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  orderCount: number;
  totalPurchaseValue: number;
  invoicedValue: number;
  paidValue: number;
  outstanding: number;
  overallRating?: number;
  onTimeDeliveryRate?: number;
  isPreferred: boolean;
}
export interface VendorAnalysisDto {
  activeVendors: number;
  totalSpend: number;
  currencyCode: string;
  vendors: VendorAnalysisRowDto[];
}

export interface ApAgingRowDto {
  vendorId: string;
  vendorName: string;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  total: number;
}
export interface ApAgingDto {
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  total: number;
  currencyCode: string;
  rows: ApAgingRowDto[];
}

export interface ThreeWayMatchRowDto {
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  purchaseOrderNumber?: string;
  orderedAmount: number;
  receivedAmount: number;
  invoicedAmount: number;
  matchingStatus: string;
  isException: boolean;
}
export interface ThreeWayMatchDto {
  totalInvoices: number;
  fullyMatched: number;
  partiallyMatched: number;
  notMatched: number;
  exceptions: number;
  currencyCode: string;
  byStatus: ReportBucket[];
  rows: ThreeWayMatchRowDto[];
}

export interface CategorySpendDto {
  categoryId?: string;
  categoryName: string;
  lineCount: number;
  value: number;
  percent: number;
}
export interface SpendByCategoryDto {
  totalSpend: number;
  currencyCode: string;
  categories: CategorySpendDto[];
}
