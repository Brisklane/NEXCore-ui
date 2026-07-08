export interface MaterialIssueDto {
  id: string;
  productionOrderId: string;
  orderNumber: string | null;
  materialId: string;
  materialName: string | null;
  quantityIssued: number;
  quantityReturned: number;
  unitOfMeasure: string | null;
  issuedAt: string | null;
  issuedById: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateMaterialIssueDto {
  productionOrderId: string;
  materialId: string;
  quantityIssued: number;
  unitOfMeasure?: string | null;
  issuedAt?: string | null;
  notes?: string | null;
}

export interface UpdateMaterialIssueDto {
  quantityIssued?: number | null;
  quantityReturned?: number | null;
  unitOfMeasure?: string | null;
  issuedAt?: string | null;
  notes?: string | null;
}
