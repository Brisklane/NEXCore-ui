export interface InspectionDto {
  id: string;
  productionOrderId: string;
  orderNumber: string | null;
  productId: string;
  productName: string | null;
  inspectedQty: number;
  passedQty: number;
  rejectedQty: number;
  status: string | null;
  inspectedById: string | null;
  inspectedAt: string | null;
  remarks: string | null;
  characteristics: InspectionCharacteristicDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateInspectionDto {
  productionOrderId: string;
  productId: string;
  inspectedQty: number;
  passedQty?: number;
  inspectedAt?: string | null;
  remarks?: string | null;
}

export interface UpdateInspectionDto {
  inspectedQty?: number | null;
  passedQty?: number | null;
  rejectedQty?: number | null;
  status?: string | null;
  inspectedAt?: string | null;
  remarks?: string | null;
}

export interface InspectionCharacteristicDto {
  id: string;
  inspectionId: string;
  characteristicName: string | null;
  inspectionType: string | null;
  unitOfMeasure: string | null;
  targetValue: number | null;
  upperTolerance: number | null;
  lowerTolerance: number | null;
  actualValue: number | null;
  qualitativeResult: string | null;
  result: string | null;
  isCritical: boolean;
  sampleSize: number | null;
  remarks: string | null;
  // Legacy compatibility fields from older API payloads
  nominalValue?: number | null;
  unit?: string | null;
  isPassed?: boolean;
}

export interface CreateInspectionCharacteristicDto {
  characteristicName: string;
  inspectionType?: string | null;
  unitOfMeasure?: string | null;
  targetValue?: number | null;
  upperTolerance?: number | null;
  lowerTolerance?: number | null;
  actualValue?: number | null;
  qualitativeResult?: string | null;
  result?: string | null;
  isCritical: boolean;
  sampleSize?: number | null;
  remarks?: string | null;
}

export interface UpdateInspectionCharacteristicDto {
  characteristicName?: string | null;
  inspectionType?: string | null;
  unitOfMeasure?: string | null;
  targetValue?: number | null;
  upperTolerance?: number | null;
  lowerTolerance?: number | null;
  actualValue?: number | null;
  qualitativeResult?: string | null;
  result?: string | null;
  isCritical?: boolean | null;
  sampleSize?: number | null;
  remarks?: string | null;
}
