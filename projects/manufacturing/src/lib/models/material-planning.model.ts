export interface MaterialPlanningDataDto {
  id: string;
  productId: string;
  productName: string | null;
  safetyStock: number;
  reorderPoint: number;
  maximumStockLevel: number;
  lotSize: number;
  leadTimeDays: number;
  planningHorizonDays: number;
  scrapPercentage: number;
  procurementType: string | null;
  mrpType: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateMaterialPlanningDataDto {
  productId: string;
  safetyStock: number;
  reorderPoint: number;
  maximumStockLevel?: number;
  lotSize: number;
  leadTimeDays: number;
  planningHorizonDays?: number;
  scrapPercentage?: number;
  procurementType?: string | null;
  mrpType?: string | null;
  notes?: string | null;
}

export interface UpdateMaterialPlanningDataDto {
  safetyStock?: number | null;
  reorderPoint?: number | null;
  maximumStockLevel?: number | null;
  lotSize?: number | null;
  leadTimeDays?: number | null;
  planningHorizonDays?: number | null;
  scrapPercentage?: number | null;
  procurementType?: string | null;
  mrpType?: string | null;
  isActive?: boolean | null;
  notes?: string | null;
}
