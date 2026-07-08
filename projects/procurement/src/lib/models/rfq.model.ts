import { RFQStatus, RFQVendorStatus, QuotationStatus } from './procurement-enums';
import { PaymentTerms } from './vendor.model';
import { Incoterm } from './purchase-order.model';

export interface RFQLineDto {
  id: string;
  lineNumber: number;
  requisitionLineId?: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  estimatedUnitPrice?: number;
  procurementCategoryId?: string;
  procurementCategoryName?: string;
  requiredDeliveryDate?: string;
  specifications?: string;
  notes?: string;
}

export interface RFQVendorDto {
  id: string;
  vendorId: string;
  vendorName: string;
  status: RFQVendorStatus;
  invitedAt?: string;
  respondedAt?: string;
  notes?: string;
}

export interface VendorQuotationLineDto {
  id: string;
  lineNumber: number;
  rfqLineId: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  subTotal: number;
  totalPrice: number;
  promisedDeliveryDate?: string;
  leadTimeDays?: number;
  isAlternative: boolean;
  notes?: string;
}

export interface VendorQuotationDto {
  id: string;
  quotationNumber: string;
  vendorQuotationReference?: string;
  rfqId: string;
  vendorId: string;
  vendorName?: string;
  submissionDate: string;
  validUntil: string;
  status: QuotationStatus;
  currencyCode: string;
  exchangeRate: number;
  subTotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms: PaymentTerms;
  incoterm?: Incoterm;
  incotermLocation?: string;
  deliveryLeadTimeDays: number;
  technicalScore?: number;
  commercialScore?: number;
  overallScore?: number;
  isRecommended: boolean;
  rejectionReason?: string;
  notes?: string;
  lines: VendorQuotationLineDto[];
}

export interface RequestForQuotationDto {
  id: string;
  rfqNumber: string;
  title: string;
  description?: string;
  requisitionId?: string;
  requisitionNumber?: string;
  issueDate: string;
  submissionDeadline: string;
  quotationValidityDate?: string;
  awardedAt?: string;
  status: RFQStatus;
  currencyCode: string;
  deliveryAddressId?: string;
  requiredDeliveryDate?: string;
  termsAndConditions?: string;
  evaluationCriteria?: string;
  notes?: string;
  lines: RFQLineDto[];
  invitedVendors: RFQVendorDto[];
  vendorQuotations: VendorQuotationDto[];
}

export interface CreateRFQLineDto {
  requisitionLineId?: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  estimatedUnitPrice?: number;
  procurementCategoryId?: string;
  requiredDeliveryDate?: string;
  specifications?: string;
  notes?: string;
}

export interface CreateRFQDto {
  title: string;
  description?: string;
  requisitionId?: string;
  submissionDeadline: string;
  quotationValidityDate?: string;
  currencyCode?: string;
  deliveryAddressId?: string;
  requiredDeliveryDate?: string;
  termsAndConditions?: string;
  evaluationCriteria?: string;
  notes?: string;
  lines: CreateRFQLineDto[];
  vendorIds: string[];
}

export interface UpdateRFQDto {
  title?: string;
  description?: string;
  submissionDeadline?: string;
  quotationValidityDate?: string;
  requiredDeliveryDate?: string;
  termsAndConditions?: string;
  evaluationCriteria?: string;
  notes?: string;
}

export interface SubmitVendorQuotationLineDto {
  rfqLineId: string;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  promisedDeliveryDate?: string;
  leadTimeDays?: number;
  isAlternative: boolean;
  notes?: string;
}

export interface SubmitVendorQuotationDto {
  vendorId: string;
  vendorQuotationReference?: string;
  validUntil: string;
  currencyCode?: string;
  exchangeRate?: number;
  paymentTerms?: PaymentTerms;
  incoterm?: Incoterm;
  incotermLocation?: string;
  deliveryLeadTimeDays: number;
  notes?: string;
  lines: SubmitVendorQuotationLineDto[];
}

export interface EvaluateQuotationDto {
  quotationId: string;
  technicalScore?: number;
  commercialScore?: number;
  isRecommended: boolean;
}
