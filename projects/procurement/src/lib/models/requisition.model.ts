import { RequisitionStatus, RequisitionPriority, RequisitionLineStatus } from './procurement-enums';

export interface PurchaseRequisitionLineDto {
  id: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  estimatedUnitPrice?: number;
  estimatedTotalPrice?: number;
  procurementCategoryId?: string;
  procurementCategoryName?: string;
  requiredByDate?: string;
  deliveryLocationId?: string;
  lineStatus: RequisitionLineStatus;
  quantityOrdered: number;
  quantityRemaining: number;
  suggestedVendorId?: string;
  suggestedVendorName?: string;
  notes?: string;
}

export interface PurchaseRequisitionDto {
  id: string;
  requisitionNumber: string;
  title: string;
  description?: string;
  requestedByUserId: string;
  requestedByName?: string;
  departmentId?: string;
  departmentName?: string;
  costCenterId?: string;
  requestDate: string;
  requiredByDate?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  status: RequisitionStatus;
  priority: RequisitionPriority;
  suggestedVendorId?: string;
  suggestedVendorName?: string;
  currencyCode: string;
  estimatedTotalAmount: number;
  budgetId?: string;
  isBudgetChecked: boolean;
  isBudgetAvailable: boolean;
  rejectionReason?: string;
  notes?: string;
  internalNotes?: string;
  /** True when a PO has already been created from this requisition (hides "Convert to PO"). */
  hasPurchaseOrder?: boolean;
  lines: PurchaseRequisitionLineDto[];
}

export interface CreatePurchaseRequisitionLineDto {
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  estimatedUnitPrice?: number;
  procurementCategoryId?: string;
  requiredByDate?: string;
  deliveryLocationId?: string;
  suggestedVendorId?: string;
  notes?: string;
}

export interface CreatePurchaseRequisitionDto {
  title: string;
  description?: string;
  requestedByUserId: string;
  requestedByName?: string;
  departmentId?: string;
  departmentName?: string;
  costCenterId?: string;
  requiredByDate?: string;
  priority?: RequisitionPriority;
  suggestedVendorId?: string;
  currencyCode?: string;
  budgetId?: string;
  notes?: string;
  internalNotes?: string;
  lines: CreatePurchaseRequisitionLineDto[];
}

export interface UpdatePurchaseRequisitionDto {
  title?: string;
  description?: string;
  requiredByDate?: string;
  priority?: RequisitionPriority;
  suggestedVendorId?: string;
  notes?: string;
  internalNotes?: string;
  lines?: CreatePurchaseRequisitionLineDto[];
}

export interface RejectRequisitionDto {
  rejectionReason: string;
}
