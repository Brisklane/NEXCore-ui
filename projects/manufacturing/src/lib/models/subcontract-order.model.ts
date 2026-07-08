export interface SubContractOrderDto {
  id: string;
  productionOrderId: string | null;
  orderNumber: string | null;
  productionOrderOperationId: string | null;
  purchaseOrderId: string | null;
  vendorId: string;
  vendorName: string | null;
  quantitySent: number;
  quantityReceived: number;
  quantityRejected: number;
  unitOfMeasure: string | null;
  unitCost: number;
  totalCost: number;
  sentAt: string | null;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  status: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateSubContractOrderDto {
  productionOrderId?: string | null;
  productionOrderOperationId?: string | null;
  purchaseOrderId?: string | null;
  vendorId: string;
  quantitySent: number;
  unitOfMeasure?: string | null;
  unitCost: number;
  status?: string | null;
  sentAt?: string | null;
  expectedReturnDate?: string | null;
}

export interface UpdateSubContractOrderDto {
  vendorId?: string | null;
  quantitySent?: number | null;
  quantityReceived?: number | null;
  quantityRejected?: number | null;
  unitOfMeasure?: string | null;
  unitCost?: number | null;
  sentAt?: string | null;
  expectedReturnDate?: string | null;
  actualReturnDate?: string | null;
  status?: string | null;
}
