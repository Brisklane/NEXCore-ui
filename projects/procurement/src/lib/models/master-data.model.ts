import { VendorDocumentType, VendorDocumentStatus, ApprovalDocumentType, ProcurementDocumentType, SequenceResetPeriod } from './procurement-enums';
import { PaymentTerms } from './vendor.model';

// ── Vendor Category ───────────────────────────────────────────────────────────

export interface VendorCategoryDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateVendorCategoryDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateVendorCategoryDto {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// ── Procurement Category ──────────────────────────────────────────────────────

export interface ProcurementCategoryDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  isActive: boolean;
  children: ProcurementCategoryDto[];
}

export interface CreateProcurementCategoryDto {
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export interface UpdateProcurementCategoryDto {
  code?: string;
  name?: string;
  description?: string;
  parentCategoryId?: string;
  isActive?: boolean;
}

// ── Vendor Document ───────────────────────────────────────────────────────────

export interface VendorDocumentDto {
  id: string;
  vendorId: string;
  documentType: VendorDocumentType;
  documentName: string;
  documentNumber?: string;
  issuedBy?: string;
  issuedAt?: string;
  expiryDate?: string;
  neverExpires: boolean;
  status: VendorDocumentStatus;
  reminderDays: number;
  filePath?: string;
  fileName?: string;
  isVerified: boolean;
  verifiedAt?: string;
  notes?: string;
  isExpired: boolean;
  daysUntilExpiry?: number;
}

export interface CreateVendorDocumentDto {
  documentType: VendorDocumentType;
  documentName: string;
  documentNumber?: string;
  issuedBy?: string;
  issuedAt?: string;
  expiryDate?: string;
  neverExpires?: boolean;
  reminderDays?: number;
  filePath?: string;
  fileName?: string;
  notes?: string;
}

export interface UpdateVendorDocumentDto {
  documentName?: string;
  documentNumber?: string;
  issuedBy?: string;
  issuedAt?: string;
  expiryDate?: string;
  neverExpires?: boolean;
  status?: VendorDocumentStatus;
  reminderDays?: number;
  filePath?: string;
  fileName?: string;
  notes?: string;
}

// ── Vendor Pricelist ──────────────────────────────────────────────────────────

export interface VendorPricelistItemDto {
  id: string;
  itemId?: string;
  itemCode?: string;
  itemDescription?: string;
  unitPrice: number;
  minimumQuantity?: number;
  unitOfMeasureId?: string;
  validFrom?: string;
  validTo?: string;
}

export interface VendorPricelistDto {
  id: string;
  vendorId: string;
  name: string;
  currencyCode: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  items: VendorPricelistItemDto[];
}

export interface CreateVendorPricelistItemDto {
  itemId?: string;
  itemCode?: string;
  itemDescription?: string;
  unitPrice: number;
  minimumQuantity?: number;
  unitOfMeasureId?: string;
  validFrom?: string;
  validTo?: string;
}

export interface CreateVendorPricelistDto {
  name: string;
  currencyCode?: string;
  validFrom?: string;
  validTo?: string;
  items: CreateVendorPricelistItemDto[];
}

// ── Approval Workflow ─────────────────────────────────────────────────────────

export interface ApprovalWorkflowStepDto {
  id: string;
  stepNumber: number;
  stepName: string;
  approverUserId?: string;
  approverRole?: string;
  amountThreshold?: number;
  isParallelStep: boolean;
  requiredApprovals: number;
  escalationAfterDays: number;
  escalationUserId?: string;
  isOptional: boolean;
  instructions?: string;
}

export interface ApprovalWorkflowDto {
  id: string;
  name: string;
  description?: string;
  documentType: ApprovalDocumentType;
  minimumAmount?: number;
  maximumAmount?: number;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  steps: ApprovalWorkflowStepDto[];
}

export interface CreateApprovalWorkflowDto {
  name: string;
  description?: string;
  documentType: ApprovalDocumentType;
  minimumAmount?: number;
  maximumAmount?: number;
  isDefault?: boolean;
  priority?: number;
  steps: ApprovalWorkflowStepDto[];
}

// ── Document Sequence ─────────────────────────────────────────────────────────

export interface DocumentSequenceDto {
  id: string;
  documentType: ProcurementDocumentType;
  prefix: string;
  suffix?: string;
  separator: string;
  includeYear: boolean;
  includeMonth: boolean;
  sequencePadding: number;
  resetOn: SequenceResetPeriod;
  nextSequenceNumber: number;
  isActive: boolean;
  description?: string;
}

export interface UpdateDocumentSequenceDto {
  prefix?: string;
  suffix?: string;
  separator?: string;
  includeYear?: boolean;
  includeMonth?: boolean;
  sequencePadding?: number;
  resetOn?: SequenceResetPeriod;
  isActive?: boolean;
}

// ── Procurement Settings ──────────────────────────────────────────────────────

export interface ProcurementSettingsDto {
  id: string;
  requireRequisitionForPO: boolean;
  rfqMandatoryAboveAmount?: number;
  enable3WayMatching: boolean;
  enforceInvoicePOTolerance: boolean;
  invoicePOTolerancePercent: number;
  defaultPaymentTerms: PaymentTerms;
  defaultCurrencyCode: string;
  defaultLeadTimeDays: number;
  poApprovalWorkflowId?: string;
  requisitionApprovalWorkflowId?: string;
  invoiceApprovalWorkflowId?: string;
  requireVendorApproval: boolean;
  requireVendorBankVerification: boolean;
  sendPOToVendorByEmail: boolean;
  sendRFQToVendorByEmail: boolean;
  poApprovalReminderDays: number;
}

export interface UpdateProcurementSettingsDto {
  requireRequisitionForPO?: boolean;
  rfqMandatoryAboveAmount?: number;
  enable3WayMatching?: boolean;
  enforceInvoicePOTolerance?: boolean;
  invoicePOTolerancePercent?: number;
  defaultPaymentTerms?: PaymentTerms;
  defaultCurrencyCode?: string;
  defaultLeadTimeDays?: number;
  poApprovalWorkflowId?: string;
  requisitionApprovalWorkflowId?: string;
  invoiceApprovalWorkflowId?: string;
  requireVendorApproval?: boolean;
  requireVendorBankVerification?: boolean;
  sendPOToVendorByEmail?: boolean;
  sendRFQToVendorByEmail?: boolean;
  poApprovalReminderDays?: number;
}

// ── Lookup ────────────────────────────────────────────────────────────────────

export interface LookupDto {
  id: string;
  name: string;
  code?: string;
}

export interface ProcurementLookupItem {
  value: number;
  label: string;
}
