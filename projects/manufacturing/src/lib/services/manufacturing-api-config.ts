import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;

export const MANUFACTURING_API = {
  // WorkCenter
  workCenter: {
    getAll: `${BASE_URL}/api/v1/manufacturing/work-centers`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${id}`,
    create: `${BASE_URL}/api/v1/manufacturing/work-centers`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${id}`,
    getShifts: (workCenterId: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${workCenterId}/shifts`,
    getShift: (workCenterId: string, shiftId: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${workCenterId}/shifts/${shiftId}`,
    createShift: (workCenterId: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${workCenterId}/shifts`,
    updateShift: (workCenterId: string, shiftId: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${workCenterId}/shifts/${shiftId}`,
    deleteShift: (workCenterId: string, shiftId: string) => `${BASE_URL}/api/v1/manufacturing/work-centers/${workCenterId}/shifts/${shiftId}`,
  },
  // BillOfMaterial
  bom: {
    getAll: `${BASE_URL}/api/v1/manufacturing/bom`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/bom/${id}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/bom/product/${productId}`,
    create: `${BASE_URL}/api/v1/manufacturing/bom`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/bom/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/bom/${id}`,
    createItem: (bomId: string) => `${BASE_URL}/api/v1/manufacturing/bom/${bomId}/items`,
    updateItem: (bomId: string, itemId: string) => `${BASE_URL}/api/v1/manufacturing/bom/${bomId}/items/${itemId}`,
    deleteItem: (bomId: string, itemId: string) => `${BASE_URL}/api/v1/manufacturing/bom/${bomId}/items/${itemId}`,
    createByProduct: (bomId: string) => `${BASE_URL}/api/v1/manufacturing/bom/${bomId}/by-products`,
    updateByProduct: (bomId: string, byProductId: string) => `${BASE_URL}/api/v1/manufacturing/bom/${bomId}/by-products/${byProductId}`,
    deleteByProduct: (bomId: string, byProductId: string) => `${BASE_URL}/api/v1/manufacturing/bom/${bomId}/by-products/${byProductId}`,
  },
  // Routing
  routing: {
    getAll: `${BASE_URL}/api/v1/manufacturing/routings`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/routings/${id}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/routings/product/${productId}`,
    create: `${BASE_URL}/api/v1/manufacturing/routings`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/routings/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/routings/${id}`,
    createOperation: (routingId: string) => `${BASE_URL}/api/v1/manufacturing/routings/${routingId}/operations`,
    updateOperation: (routingId: string, operationId: string) => `${BASE_URL}/api/v1/manufacturing/routings/${routingId}/operations/${operationId}`,
    deleteOperation: (routingId: string, operationId: string) => `${BASE_URL}/api/v1/manufacturing/routings/${routingId}/operations/${operationId}`,
  },
  // ProductionOrder
  productionOrder: {
    getAll: `${BASE_URL}/api/v1/manufacturing/production-orders`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/${id}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/product/${productId}`,
    getByStatus: (status: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/status/${status}`,
    create: `${BASE_URL}/api/v1/manufacturing/production-orders`,
    produceExpress: `${BASE_URL}/api/v1/manufacturing/production-orders/produce-express`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/${id}`,
    getOperations: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/${id}/operations`,
    createOperation: `${BASE_URL}/api/v1/manufacturing/production-orders/operations`,
    updateOperation: (operationId: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/operations/${operationId}`,
    getComponents: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/${id}/components`,
    createComponent: `${BASE_URL}/api/v1/manufacturing/production-orders/components`,
    updateComponent: (componentId: string) => `${BASE_URL}/api/v1/manufacturing/production-orders/components/${componentId}`,
  },
  // Demand
  demand: {
    getAll: `${BASE_URL}/api/v1/manufacturing/demands`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/demands/${id}`,
    getOpen: `${BASE_URL}/api/v1/manufacturing/demands/open`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/demands/product/${productId}`,
    create: `${BASE_URL}/api/v1/manufacturing/demands`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/demands/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/demands/${id}`,
  },
  // PlannedOrder
  plannedOrder: {
    getAll: `${BASE_URL}/api/v1/manufacturing/planned-orders`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/planned-orders/${id}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/planned-orders/product/${productId}`,
    create: `${BASE_URL}/api/v1/manufacturing/planned-orders`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/planned-orders/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/planned-orders/${id}`,
  },
  // MaterialPlanningData
  materialPlanning: {
    getAll: `${BASE_URL}/api/v1/manufacturing/material-planning`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/material-planning/${id}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/material-planning/product/${productId}`,
    create: `${BASE_URL}/api/v1/manufacturing/material-planning`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/material-planning/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/material-planning/${id}`,
  },
  // StandardCost
  standardCost: {
    getAll: `${BASE_URL}/api/v1/manufacturing/standard-costs`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/standard-costs/${id}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/standard-costs/product/${productId}`,
    getActiveByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/standard-costs/product/${productId}/active`,
    create: `${BASE_URL}/api/v1/manufacturing/standard-costs`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/standard-costs/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/standard-costs/${id}`,
  },
  // ProductionSchedule
  productionSchedule: {
    getAll: `${BASE_URL}/api/v1/manufacturing/production-schedules`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-schedules/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/production-schedules/order/${productionOrderId}`,
    getByWorkCenter: (workCenterId: string) => `${BASE_URL}/api/v1/manufacturing/production-schedules/work-center/${workCenterId}`,
    create: `${BASE_URL}/api/v1/manufacturing/production-schedules`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-schedules/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-schedules/${id}`,
  },
  // ProductionBatch
  productionBatch: {
    getAll: `${BASE_URL}/api/v1/manufacturing/production-batches`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-batches/${id}`,
    getByNumber: (batchNumber: string) => `${BASE_URL}/api/v1/manufacturing/production-batches/number/${batchNumber}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/production-batches/order/${productionOrderId}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/production-batches/product/${productId}`,
    create: `${BASE_URL}/api/v1/manufacturing/production-batches`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-batches/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-batches/${id}`,
  },
  // ReworkOrder
  reworkOrder: {
    getAll: `${BASE_URL}/api/v1/manufacturing/rework-orders`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/rework-orders/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/rework-orders/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/rework-orders`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/rework-orders/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/rework-orders/${id}`,
  },
  // Inspection
  inspection: {
    getAll: `${BASE_URL}/api/v1/manufacturing/inspections`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/inspections/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/inspections/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/inspections`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/inspections/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/inspections/${id}`,
    createCharacteristic: (inspectionId: string) => `${BASE_URL}/api/v1/manufacturing/inspections/${inspectionId}/characteristics`,
    updateCharacteristic: (inspectionId: string, characteristicId: string) => `${BASE_URL}/api/v1/manufacturing/inspections/${inspectionId}/characteristics/${characteristicId}`,
    deleteCharacteristic: (inspectionId: string, characteristicId: string) => `${BASE_URL}/api/v1/manufacturing/inspections/${inspectionId}/characteristics/${characteristicId}`,
  },
  // CapacityLoad
  capacityLoad: {
    getAll: `${BASE_URL}/api/v1/manufacturing/capacity-loads`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/capacity-loads/${id}`,
    getByWorkCenter: (workCenterId: string) => `${BASE_URL}/api/v1/manufacturing/capacity-loads/work-center/${workCenterId}`,
    getByWorkCenterDateRange: (workCenterId: string) => `${BASE_URL}/api/v1/manufacturing/capacity-loads/work-center/${workCenterId}/date-range`,
    create: `${BASE_URL}/api/v1/manufacturing/capacity-loads`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/capacity-loads/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/capacity-loads/${id}`,
  },
  // OverheadRule
  overheadRule: {
    getAll: `${BASE_URL}/api/v1/manufacturing/overhead-rules`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/overhead-rules/${id}`,
    getByWorkCenter: (workCenterId: string) => `${BASE_URL}/api/v1/manufacturing/overhead-rules/work-center/${workCenterId}`,
    create: `${BASE_URL}/api/v1/manufacturing/overhead-rules`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/overhead-rules/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/overhead-rules/${id}`,
  },
  // SubContractOrder
  subContractOrder: {
    getAll: `${BASE_URL}/api/v1/manufacturing/subcontract-orders`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/subcontract-orders/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/subcontract-orders/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/subcontract-orders`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/subcontract-orders/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/subcontract-orders/${id}`,
  },
  // CostEntry
  costEntry: {
    getAll: `${BASE_URL}/api/v1/manufacturing/cost-entries`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/cost-entries/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/cost-entries/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/cost-entries`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/cost-entries/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/cost-entries/${id}`,
  },
  // MaterialIssue
  materialIssue: {
    getAll: `${BASE_URL}/api/v1/manufacturing/material-issues`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/material-issues/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/material-issues/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/material-issues`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/material-issues/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/material-issues/${id}`,
  },
  // FinishedGoodsReceipt
  finishedGoodsReceipt: {
    getAll: `${BASE_URL}/api/v1/manufacturing/finished-goods-receipts`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/finished-goods-receipts/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/finished-goods-receipts/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/finished-goods-receipts`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/finished-goods-receipts/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/finished-goods-receipts/${id}`,
  },
  // InventoryTransaction
  inventoryTransaction: {
    getAll: `${BASE_URL}/api/v1/manufacturing/inventory-transactions`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/inventory-transactions/${id}`,
    getByProduct: (productId: string) => `${BASE_URL}/api/v1/manufacturing/inventory-transactions/product/${productId}`,
    getByReference: (referenceId: string) => `${BASE_URL}/api/v1/manufacturing/inventory-transactions/reference/${referenceId}`,
    create: `${BASE_URL}/api/v1/manufacturing/inventory-transactions`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/inventory-transactions/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/inventory-transactions/${id}`,
  },
  // ProductionVariance
  productionVariance: {
    getAll: `${BASE_URL}/api/v1/manufacturing/production-variances`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-variances/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/production-variances/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/production-variances`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-variances/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/production-variances/${id}`,
  },
  // MachineDowntime
  machineDowntime: {
    getAll: `${BASE_URL}/api/v1/manufacturing/machine-downtimes`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/machine-downtimes/${id}`,
    getByWorkCenter: (workCenterId: string) => `${BASE_URL}/api/v1/manufacturing/machine-downtimes/work-center/${workCenterId}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/machine-downtimes/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/machine-downtimes`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/machine-downtimes/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/machine-downtimes/${id}`,
  },
  // WorkInProgress
  wip: {
    getAll: `${BASE_URL}/api/v1/manufacturing/wip`,
    getById: (id: string) => `${BASE_URL}/api/v1/manufacturing/wip/${id}`,
    getByOrder: (productionOrderId: string) => `${BASE_URL}/api/v1/manufacturing/wip/order/${productionOrderId}`,
    create: `${BASE_URL}/api/v1/manufacturing/wip`,
    update: (id: string) => `${BASE_URL}/api/v1/manufacturing/wip/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/manufacturing/wip/${id}`,
  },
};
