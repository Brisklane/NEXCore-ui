import { Routes } from '@angular/router';

export const manufacturingRoutes: Routes = [
  { path: '', redirectTo: 'work-centers', pathMatch: 'full' },
  {
    path: 'work-centers',
    loadComponent: () => import('./pages/work-center/work-center').then((m) => m.WorkCenter),
  },
  {
    path: 'work-center-shifts',
    loadComponent: () =>
      import('./pages/work-center-shifts/work-center-shifts').then((m) => m.WorkCenterShifts),
  },
  {
    path: 'labor-rates',
    loadComponent: () => import('./pages/labor-rate/labor-rate').then((m) => m.LaborRate),
  },
  {
    path: 'bill-of-materials',
    loadComponent: () =>
      import('./pages/bill-of-material/bill-of-material').then((m) => m.BillOfMaterial),
  },
  {
    path: 'production-orders',
    loadComponent: () =>
      import('./pages/production-order/production-order').then((m) => m.ProductionOrder),
  },
  { path: 'demand', loadComponent: () => import('./pages/demand/demand').then((m) => m.Demand) },
  {
    path: 'planned-orders',
    loadComponent: () => import('./pages/planned-order/planned-order').then((m) => m.PlannedOrder),
  },
  {
    path: 'material-planning',
    loadComponent: () =>
      import('./pages/material-planning/material-planning').then((m) => m.MaterialPlanning),
  },
  {
    path: 'standard-costs',
    loadComponent: () => import('./pages/standard-cost/standard-cost').then((m) => m.StandardCost),
  },
  {
    path: 'production-schedules',
    loadComponent: () =>
      import('./pages/production-schedule/production-schedule').then((m) => m.ProductionSchedule),
  },
  {
    path: 'production-batches',
    loadComponent: () =>
      import('./pages/production-batch/production-batch').then((m) => m.ProductionBatch),
  },
  {
    path: 'rework-orders',
    loadComponent: () => import('./pages/rework-order/rework-order').then((m) => m.ReworkOrder),
  },
  {
    path: 'inspections',
    loadComponent: () => import('./pages/inspection/inspection').then((m) => m.Inspection),
  },
  {
    path: 'inspection-characteristics',
    loadComponent: () =>
      import('./pages/inspection-characteristics/inspection-characteristics').then(
        (m) => m.InspectionCharacteristics,
      ),
  },
  {
    path: 'capacity-load',
    loadComponent: () => import('./pages/capacity-load/capacity-load').then((m) => m.CapacityLoad),
  },
  {
    path: 'overhead-rules',
    loadComponent: () => import('./pages/overhead-rule/overhead-rule').then((m) => m.OverheadRule),
  },
  {
    path: 'subcontract-orders',
    loadComponent: () =>
      import('./pages/subcontract-order/subcontract-order').then((m) => m.SubcontractOrder),
  },
  {
    path: 'cost-entries',
    loadComponent: () => import('./pages/cost-entry/cost-entry').then((m) => m.CostEntry),
  },
  {
    path: 'material-issues',
    loadComponent: () =>
      import('./pages/material-issue/material-issue').then((m) => m.MaterialIssue),
  },
  {
    path: 'finished-goods-receipts',
    loadComponent: () =>
      import('./pages/finished-goods-receipt/finished-goods-receipt').then(
        (m) => m.FinishedGoodsReceipt,
      ),
  },
  {
    path: 'inventory-transactions',
    loadComponent: () =>
      import('./pages/inventory-transaction/inventory-transaction').then(
        (m) => m.InventoryTransaction,
      ),
  },
  {
    path: 'production-variances',
    loadComponent: () =>
      import('./pages/production-variance/production-variance').then((m) => m.ProductionVariance),
  },
  {
    path: 'machine-downtime',
    loadComponent: () =>
      import('./pages/machine-downtime/machine-downtime').then((m) => m.MachineDowntime),
  },
  {
    path: 'work-in-progress',
    loadComponent: () =>
      import('./pages/work-in-progress/work-in-progress').then((m) => m.WorkInProgress),
  },
  {
    path: 'workflow-runner',
    loadComponent: () =>
      import('./pages/workflow-runner/workflow-runner').then((m) => m.WorkflowRunner),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/manufacturing-dashboard/manufacturing-dashboard').then(
        (m) => m.ManufacturingDashboard,
      ),
  },
];
