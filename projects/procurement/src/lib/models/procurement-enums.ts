// ── Requisition ───────────────────────────────────────────────────────────────

export enum RequisitionStatus {
  Draft = 0, Submitted = 1, UnderApproval = 2, Approved = 3,
  Rejected = 4, Cancelled = 5, PartiallyFulfilled = 6, Fulfilled = 7,
}

export enum RequisitionPriority {
  Low = 0, Normal = 1, High = 2, Urgent = 3,
}

export enum RequisitionLineStatus {
  Open = 0, PartiallyFulfilled = 1, Fulfilled = 2, Cancelled = 3,
}

// ── RFQ ──────────────────────────────────────────────────────────────────────

export enum RFQStatus {
  Draft = 0, Sent = 1, PartiallyReceived = 2, FullyReceived = 3,
  Awarded = 4, Cancelled = 5, Closed = 6,
}

export enum RFQVendorStatus {
  Invited = 0, Acknowledged = 1, Responded = 2, Declined = 3, NoResponse = 4,
}

export enum QuotationStatus {
  Draft = 0, Submitted = 1, UnderEvaluation = 2, Shortlisted = 3,
  Accepted = 4, Rejected = 5, Expired = 6,
}

// ── Goods Receipt ─────────────────────────────────────────────────────────────

export enum GoodsReceiptStatus {
  Draft = 0, Posted = 1, Cancelled = 2,
}

export enum ReceiptType {
  Standard = 0, Return = 1, Transfer = 2,
}

export enum QualityInspectionStatus {
  Pending = 0, Passed = 1, Failed = 2, PartiallyPassed = 3, Waived = 4,
}

// ── Invoice ───────────────────────────────────────────────────────────────────

export enum PurchaseInvoiceStatus {
  Draft = 0, UnderApproval = 1, Posted = 2, OnHold = 3,
  PartiallyPaid = 4, FullyPaid = 5, Cancelled = 6, Disputed = 7,
}

export enum InvoiceMatchingStatus {
  NotMatched = 0, PartiallyMatched = 1, FullyMatched = 2, MatchException = 3,
}

export enum InvoicePaymentStatus {
  NotPaid = 0, InPayment = 1, PartiallyPaid = 2, FullyPaid = 3, Reversed = 4,
}

// ── Payment ───────────────────────────────────────────────────────────────────

export enum VendorPaymentStatus {
  Draft = 0, Approved = 1, Processing = 2, Sent = 3,
  Cleared = 4, Cancelled = 5, Returned = 6,
}

export enum VendorPaymentMethod {
  Cash = 0, BankTransfer = 1, Check = 2, CreditCard = 3,
  DirectDebit = 4, OnlinePayment = 5, Letter_of_Credit = 6,
}

// ── Contract ─────────────────────────────────────────────────────────────────

export enum PurchaseContractStatus {
  Draft = 0, UnderReview = 1, Active = 2, Suspended = 3, Expired = 4, Terminated = 5,
}

export enum PurchaseContractType {
  FrameworkAgreement = 0, BlanketOrder = 1, ServiceAgreement = 2,
  SupplyAgreement = 3, MaintenanceContract = 4,
}

// ── Vendor Document ───────────────────────────────────────────────────────────

export enum VendorDocumentType {
  TradeLicense = 0, TaxRegistration = 1, VATCertificate = 2, ISO9001 = 3,
  ISO14001 = 4, ISO45001 = 5, QualityCertificate = 6, InsuranceCertificate = 7,
  BankGuarantee = 8, PerformanceBond = 9, CompanyRegistration = 10,
  AuditedAccounts = 11, Other = 12,
}

export enum VendorDocumentStatus {
  Active = 0, Expired = 1, PendingRenewal = 2, Revoked = 3,
}

// ── Approval ──────────────────────────────────────────────────────────────────

export enum ApprovalDocumentType {
  PurchaseRequisition = 0, PurchaseOrder = 1, VendorRegistration = 2,
  PurchaseInvoice = 3, PurchaseContract = 4, VendorPayment = 5,
}

// ── Sequence ──────────────────────────────────────────────────────────────────

export enum ProcurementDocumentType {
  PurchaseRequisition = 0, PurchaseOrder = 1, RequestForQuotation = 2,
  GoodsReceipt = 3, PurchaseInvoice = 4, PurchaseContract = 5,
  Vendor = 6, VendorPayment = 7, PurchaseReturn = 8, VendorDebitNote = 9,
}

export enum SequenceResetPeriod {
  Never = 0, Yearly = 1, Monthly = 2,
}

// ── Label Maps ────────────────────────────────────────────────────────────────

export const REQUISITION_STATUS_LABELS: Record<RequisitionStatus, string> = {
  [RequisitionStatus.Draft]: 'Draft',
  [RequisitionStatus.Submitted]: 'Submitted',
  [RequisitionStatus.UnderApproval]: 'Under Approval',
  [RequisitionStatus.Approved]: 'Approved',
  [RequisitionStatus.Rejected]: 'Rejected',
  [RequisitionStatus.Cancelled]: 'Cancelled',
  [RequisitionStatus.PartiallyFulfilled]: 'Partially Fulfilled',
  [RequisitionStatus.Fulfilled]: 'Fulfilled',
};

export const REQUISITION_PRIORITY_LABELS: Record<RequisitionPriority, string> = {
  [RequisitionPriority.Low]: 'Low',
  [RequisitionPriority.Normal]: 'Normal',
  [RequisitionPriority.High]: 'High',
  [RequisitionPriority.Urgent]: 'Urgent',
};

export const RFQ_STATUS_LABELS: Record<RFQStatus, string> = {
  [RFQStatus.Draft]: 'Draft',
  [RFQStatus.Sent]: 'Sent',
  [RFQStatus.PartiallyReceived]: 'Partially Received',
  [RFQStatus.FullyReceived]: 'Fully Received',
  [RFQStatus.Awarded]: 'Awarded',
  [RFQStatus.Cancelled]: 'Cancelled',
  [RFQStatus.Closed]: 'Closed',
};

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  [QuotationStatus.Draft]: 'Draft',
  [QuotationStatus.Submitted]: 'Submitted',
  [QuotationStatus.UnderEvaluation]: 'Under Evaluation',
  [QuotationStatus.Shortlisted]: 'Shortlisted',
  [QuotationStatus.Accepted]: 'Accepted',
  [QuotationStatus.Rejected]: 'Rejected',
  [QuotationStatus.Expired]: 'Expired',
};

export const GRN_STATUS_LABELS: Record<GoodsReceiptStatus, string> = {
  [GoodsReceiptStatus.Draft]: 'Draft',
  [GoodsReceiptStatus.Posted]: 'Posted',
  [GoodsReceiptStatus.Cancelled]: 'Cancelled',
};

export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
  [ReceiptType.Standard]: 'Standard',
  [ReceiptType.Return]: 'Return',
  [ReceiptType.Transfer]: 'Transfer',
};

export const QUALITY_STATUS_LABELS: Record<QualityInspectionStatus, string> = {
  [QualityInspectionStatus.Pending]: 'Pending',
  [QualityInspectionStatus.Passed]: 'Passed',
  [QualityInspectionStatus.Failed]: 'Failed',
  [QualityInspectionStatus.PartiallyPassed]: 'Partial Pass',
  [QualityInspectionStatus.Waived]: 'Waived',
};

export const INVOICE_STATUS_LABELS: Record<PurchaseInvoiceStatus, string> = {
  [PurchaseInvoiceStatus.Draft]: 'Draft',
  [PurchaseInvoiceStatus.UnderApproval]: 'Under Approval',
  [PurchaseInvoiceStatus.Posted]: 'Posted',
  [PurchaseInvoiceStatus.OnHold]: 'On Hold',
  [PurchaseInvoiceStatus.PartiallyPaid]: 'Partially Paid',
  [PurchaseInvoiceStatus.FullyPaid]: 'Fully Paid',
  [PurchaseInvoiceStatus.Cancelled]: 'Cancelled',
  [PurchaseInvoiceStatus.Disputed]: 'Disputed',
};

export const MATCHING_STATUS_LABELS: Record<InvoiceMatchingStatus, string> = {
  [InvoiceMatchingStatus.NotMatched]: 'Not Matched',
  [InvoiceMatchingStatus.PartiallyMatched]: 'Partially Matched',
  [InvoiceMatchingStatus.FullyMatched]: 'Fully Matched',
  [InvoiceMatchingStatus.MatchException]: 'Exception',
};

export const PAYMENT_STATUS_LABELS: Record<VendorPaymentStatus, string> = {
  [VendorPaymentStatus.Draft]: 'Draft',
  [VendorPaymentStatus.Approved]: 'Approved',
  [VendorPaymentStatus.Processing]: 'Processing',
  [VendorPaymentStatus.Sent]: 'Sent',
  [VendorPaymentStatus.Cleared]: 'Cleared',
  [VendorPaymentStatus.Cancelled]: 'Cancelled',
  [VendorPaymentStatus.Returned]: 'Returned',
};

export const PAYMENT_METHOD_LABELS: Record<VendorPaymentMethod, string> = {
  [VendorPaymentMethod.Cash]: 'Cash',
  [VendorPaymentMethod.BankTransfer]: 'Bank Transfer',
  [VendorPaymentMethod.Check]: 'Check',
  [VendorPaymentMethod.CreditCard]: 'Credit Card',
  [VendorPaymentMethod.DirectDebit]: 'Direct Debit',
  [VendorPaymentMethod.OnlinePayment]: 'Online Payment',
  [VendorPaymentMethod.Letter_of_Credit]: 'Letter of Credit',
};

export const CONTRACT_STATUS_LABELS: Record<PurchaseContractStatus, string> = {
  [PurchaseContractStatus.Draft]: 'Draft',
  [PurchaseContractStatus.UnderReview]: 'Under Review',
  [PurchaseContractStatus.Active]: 'Active',
  [PurchaseContractStatus.Suspended]: 'Suspended',
  [PurchaseContractStatus.Expired]: 'Expired',
  [PurchaseContractStatus.Terminated]: 'Terminated',
};

export const CONTRACT_TYPE_LABELS: Record<PurchaseContractType, string> = {
  [PurchaseContractType.FrameworkAgreement]: 'Framework Agreement',
  [PurchaseContractType.BlanketOrder]: 'Blanket Order',
  [PurchaseContractType.ServiceAgreement]: 'Service Agreement',
  [PurchaseContractType.SupplyAgreement]: 'Supply Agreement',
  [PurchaseContractType.MaintenanceContract]: 'Maintenance Contract',
};

export const VENDOR_DOC_TYPE_LABELS: Record<VendorDocumentType, string> = {
  [VendorDocumentType.TradeLicense]: 'Trade License',
  [VendorDocumentType.TaxRegistration]: 'Tax Registration',
  [VendorDocumentType.VATCertificate]: 'VAT Certificate',
  [VendorDocumentType.ISO9001]: 'ISO 9001',
  [VendorDocumentType.ISO14001]: 'ISO 14001',
  [VendorDocumentType.ISO45001]: 'ISO 45001',
  [VendorDocumentType.QualityCertificate]: 'Quality Certificate',
  [VendorDocumentType.InsuranceCertificate]: 'Insurance Certificate',
  [VendorDocumentType.BankGuarantee]: 'Bank Guarantee',
  [VendorDocumentType.PerformanceBond]: 'Performance Bond',
  [VendorDocumentType.CompanyRegistration]: 'Company Registration',
  [VendorDocumentType.AuditedAccounts]: 'Audited Accounts',
  [VendorDocumentType.Other]: 'Other',
};

export const VENDOR_DOC_STATUS_LABELS: Record<VendorDocumentStatus, string> = {
  [VendorDocumentStatus.Active]: 'Active',
  [VendorDocumentStatus.Expired]: 'Expired',
  [VendorDocumentStatus.PendingRenewal]: 'Pending Renewal',
  [VendorDocumentStatus.Revoked]: 'Revoked',
};

export const APPROVAL_DOC_TYPE_LABELS: Record<ApprovalDocumentType, string> = {
  [ApprovalDocumentType.PurchaseRequisition]: 'Purchase Requisition',
  [ApprovalDocumentType.PurchaseOrder]: 'Purchase Order',
  [ApprovalDocumentType.VendorRegistration]: 'Vendor Registration',
  [ApprovalDocumentType.PurchaseInvoice]: 'Purchase Invoice',
  [ApprovalDocumentType.PurchaseContract]: 'Purchase Contract',
  [ApprovalDocumentType.VendorPayment]: 'Vendor Payment',
};

export const PROCUREMENT_DOC_TYPE_LABELS: Record<ProcurementDocumentType, string> = {
  [ProcurementDocumentType.PurchaseRequisition]: 'Purchase Requisition',
  [ProcurementDocumentType.PurchaseOrder]: 'Purchase Order',
  [ProcurementDocumentType.RequestForQuotation]: 'Request for Quotation',
  [ProcurementDocumentType.GoodsReceipt]: 'Goods Receipt',
  [ProcurementDocumentType.PurchaseInvoice]: 'Purchase Invoice',
  [ProcurementDocumentType.PurchaseContract]: 'Purchase Contract',
  [ProcurementDocumentType.Vendor]: 'Vendor',
  [ProcurementDocumentType.VendorPayment]: 'Vendor Payment',
  [ProcurementDocumentType.PurchaseReturn]: 'Purchase Return',
  [ProcurementDocumentType.VendorDebitNote]: 'Vendor Debit Note',
};

export const SEQUENCE_RESET_LABELS: Record<SequenceResetPeriod, string> = {
  [SequenceResetPeriod.Never]: 'Never',
  [SequenceResetPeriod.Yearly]: 'Yearly',
  [SequenceResetPeriod.Monthly]: 'Monthly',
};
