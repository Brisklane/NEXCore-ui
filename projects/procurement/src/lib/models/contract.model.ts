import { PurchaseContractStatus, PurchaseContractType } from './procurement-enums';
import { PaymentTerms } from './vendor.model';
import { Incoterm } from './purchase-order.model';

export interface PurchaseContractLineDto {
  id: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  procurementCategoryId?: string;
  procurementCategoryName?: string;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  committedQuantity?: number;
  orderedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  discountPercent?: number;
  validFrom?: string;
  validTo?: string;
  notes?: string;
}

export interface PurchaseContractDto {
  id: string;
  contractNumber: string;
  title: string;
  description?: string;
  vendorId: string;
  vendorName?: string;
  contractType: PurchaseContractType;
  status: PurchaseContractStatus;
  startDate: string;
  endDate: string;
  signedAt?: string;
  terminatedAt?: string;
  autoRenew: boolean;
  renewalNoticeDays: number;
  renewalDurationMonths?: number;
  currencyCode: string;
  maximumContractValue?: number;
  committedValue: number;
  usedValue: number;
  remainingValue: number;
  paymentTerms: PaymentTerms;
  incoterm?: Incoterm;
  approvedByUserId?: string;
  approvedAt?: string;
  termsAndConditions?: string;
  terminationReason?: string;
  notes?: string;
  lines: PurchaseContractLineDto[];
}

export interface CreatePurchaseContractLineDto {
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  procurementCategoryId?: string;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  committedQuantity?: number;
  unitPrice: number;
  discountPercent?: number;
  validFrom?: string;
  validTo?: string;
  notes?: string;
}

export interface CreatePurchaseContractDto {
  title: string;
  description?: string;
  vendorId: string;
  contractType?: PurchaseContractType;
  startDate: string;
  endDate: string;
  autoRenew?: boolean;
  renewalNoticeDays?: number;
  renewalDurationMonths?: number;
  currencyCode?: string;
  maximumContractValue?: number;
  paymentTerms?: PaymentTerms;
  incoterm?: Incoterm;
  termsAndConditions?: string;
  notes?: string;
  lines: CreatePurchaseContractLineDto[];
}

export interface UpdatePurchaseContractDto {
  title?: string;
  description?: string;
  endDate?: string;
  maximumContractValue?: number;
  autoRenew?: boolean;
  renewalNoticeDays?: number;
  renewalDurationMonths?: number;
  termsAndConditions?: string;
  notes?: string;
  lines?: CreatePurchaseContractLineDto[];
}

export interface TerminateContractDto {
  terminationReason: string;
}
