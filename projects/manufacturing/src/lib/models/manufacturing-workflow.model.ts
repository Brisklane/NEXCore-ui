export type DemandPolicy = 'FullDemand' | 'ShortageOnly';

export interface SalesOrderTriggerInput {
  productId: string;
  quantity: number;
  dueDate: string;
  sourceType?: string;
  referenceId?: string;
  unit?: string | null;
}

export interface ManufacturingCostInput {
  materialCost: number;
  laborCost: number;
  machineCost: number;
  overheadCost: number;
}

export interface ManufacturingScenarioInput {
  salesOrder: SalesOrderTriggerInput;
  finishedGoodsWarehouseId?: string | null;
  rawMaterialWarehouseId?: string | null;
  demandPolicy?: DemandPolicy;
  runMrp?: boolean;
  releaseOrder?: boolean;
  closeOrder?: boolean;
  scheduleStart?: string | null;
  qualityRejectedQty?: number;
  qualityInspectionType?: string | null;
  useRework?: boolean;
  reworkQty?: number;
  runSubcontract?: boolean;
  subcontractVendorId?: string | null;
  subcontractQty?: number;
  subcontractUnitCost?: number;
  actualCost?: ManufacturingCostInput;
  currency?: string | null;
  autoPostInventoryDocuments?: boolean;
  inventoryDocumentUnitId?: string | null;
  postedByUserId?: string | null;
}

export interface StockDecisionResult {
  availableStock: number;
  demandQuantity: number;
  deliveredFromStock: number;
  mrpShortage: number;
  demandSentToMrp: number;
  isFullyAvailable: boolean;
}

export interface ManufacturingScenarioResult {
  completed: boolean;
  message: string;
  stockDecision: StockDecisionResult;
  plannedQuantity: number;
  warnings: string[];
  createdIds: {
    demandId?: string;
    plannedOrderId?: string;
    productionOrderId?: string;
    scheduleId?: string;
    capacityLoadId?: string;
    materialIssueIds: string[];
    operationIds: string[];
    componentIds: string[];
    inspectionId?: string;
    reworkOrderId?: string;
    finishedGoodsReceiptId?: string;
    productionBatchId?: string;
    wipId?: string;
    subcontractOrderId?: string;
    costEntryIds: string[];
    varianceIds: string[];
    inventoryIssueDocumentId?: string;
    inventoryReceiptDocumentId?: string;
    inventoryScrapDocumentId?: string;
  };
  requiredApiGaps: string[];
}
