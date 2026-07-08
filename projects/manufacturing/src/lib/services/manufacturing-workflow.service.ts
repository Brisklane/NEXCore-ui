import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, from, Observable } from 'rxjs';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { ApiResponse } from '../models/api-response.model';
import {
  ManufacturingScenarioInput,
  ManufacturingScenarioResult,
  StockDecisionResult,
} from '../models/manufacturing-workflow.model';
import { DemandService } from './demand.service';
import { MaterialPlanningService } from './material-planning.service';
import { PlannedOrderService } from './planned-order.service';
import { BomService } from './bom.service';
import { RoutingService } from './routing.service';
import { ProductionOrderService } from './production-order.service';
import { ProductionScheduleService } from './production-schedule.service';
import { CapacityLoadService } from './capacity-load.service';
import { MaterialIssueService } from './material-issue.service';
import { WorkInProgressService } from './work-in-progress.service';
import { InspectionService } from './inspection.service';
import { ReworkOrderService } from './rework-order.service';
import { FinishedGoodsReceiptService } from './finished-goods-receipt.service';
import { ProductionBatchService } from './production-batch.service';
import { CostEntryService } from './cost-entry.service';
import { StandardCostService } from './standard-cost.service';
import { ProductionVarianceService } from './production-variance.service';
import { SubContractOrderService } from './subcontract-order.service';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { BillOfMaterialDto } from '../models/bill-of-material.model';
import { RoutingDto } from '../models/routing.model';
import { MaterialPlanningDataDto } from '../models/material-planning.model';
import { StandardCostDto } from '../models/standard-cost.model';
import { CreateInventoryTransactionDto } from '../models/inventory-transaction.model';
import { InventoryTransactionService } from './inventory-transaction.service';

interface InventoryBalanceSnapshot {
  quantityAvailable: number;
}

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

interface InventoryDocumentLineInput {
  itemId: string;
  warehouseId: string;
  quantity: number;
  unitId: string;
  unitCost: number;
  lineNumber: number;
  description?: string | null;
}

interface InventoryDocumentInput {
  documentType: string;
  documentDate: string;
  referenceType: string;
  referenceId: string;
  description: string;
  lines: InventoryDocumentLineInput[];
}

interface InventoryDocumentDto {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class ManufacturingWorkflowService {
  private readonly inventoryBalanceByItemUrl = `${BASE_URL}/api/InventoryBalance/by-item`;
  private readonly inventoryDocumentUrl = `${BASE_URL}/api/InventoryDocument`;
  private readonly itemLookupUrl = `${BASE_URL}/api/Item/active`;

  constructor(
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private demandService: DemandService,
    private materialPlanningService: MaterialPlanningService,
    private plannedOrderService: PlannedOrderService,
    private bomService: BomService,
    private routingService: RoutingService,
    private productionOrderService: ProductionOrderService,
    private productionScheduleService: ProductionScheduleService,
    private capacityLoadService: CapacityLoadService,
    private materialIssueService: MaterialIssueService,
    private inventoryTransactionService: InventoryTransactionService,
    private workInProgressService: WorkInProgressService,
    private inspectionService: InspectionService,
    private reworkOrderService: ReworkOrderService,
    private finishedGoodsReceiptService: FinishedGoodsReceiptService,
    private productionBatchService: ProductionBatchService,
    private subcontractOrderService: SubContractOrderService,
    private costEntryService: CostEntryService,
    private standardCostService: StandardCostService,
    private productionVarianceService: ProductionVarianceService,
  ) {}

  runScenario(input: ManufacturingScenarioInput): Observable<ManufacturingScenarioResult> {
    return from(this.runScenarioInternal(input));
  }

  private async runScenarioInternal(input: ManufacturingScenarioInput): Promise<ManufacturingScenarioResult> {
    const warnings: string[] = [];
    const requiredApiGaps: string[] = [];
    const createdIds: ManufacturingScenarioResult['createdIds'] = {
      materialIssueIds: [],
      operationIds: [],
      componentIds: [],
      costEntryIds: [],
      varianceIds: [],
    };

    this.validateInput(input);

    const salesOrder = input.salesOrder;
    const productId = await this.resolveProductId(salesOrder.productId);
    const demandPolicy = input.demandPolicy ?? 'FullDemand';
    const runMrp = input.runMrp ?? true;
    const releaseOrder = input.releaseOrder ?? true;
    const closeOrder = input.closeOrder ?? true;
    const dueDate = this.asIsoDate(salesOrder.dueDate);
    const scheduleStart = this.asIsoDateTime(input.scheduleStart ?? this.dateMinusDays(dueDate, 3));

    const availableStock = await this.getAvailableStock(productId);
    const deliveredFromStock = Math.min(availableStock, salesOrder.quantity);
    const mrpShortage = Math.max(salesOrder.quantity - availableStock, 0);
    const demandSentToMrp = demandPolicy === 'ShortageOnly' ? mrpShortage : salesOrder.quantity;

    const stockDecision: StockDecisionResult = {
      availableStock,
      demandQuantity: salesOrder.quantity,
      deliveredFromStock,
      mrpShortage,
      demandSentToMrp,
      isFullyAvailable: availableStock >= salesOrder.quantity,
    };

    if (stockDecision.isFullyAvailable || !runMrp || demandSentToMrp <= 0) {
      return {
        completed: true,
        message: 'Demand fulfilled from stock. MRP and production were skipped.',
        stockDecision,
        plannedQuantity: 0,
        warnings,
        createdIds,
        requiredApiGaps,
      };
    }

    const demand = this.unwrapRequired(
      await firstValueFrom(
        this.demandService.create({
          productId,
          quantity: demandSentToMrp,
          dueDate: dueDate,
          sourceType: salesOrder.sourceType ?? 'SalesOrder',
          referenceId: this.isUuid(salesOrder.referenceId ?? '') ? salesOrder.referenceId : null,
        }),
      ),
      'Demand',
    );
    createdIds.demandId = demand.id;

    const planning = await this.tryGetMaterialPlanning(productId, warnings);
    const safetyStock = planning?.safetyStock ?? 0;
    const lotSize = planning?.lotSize && planning.lotSize > 0 ? planning.lotSize : 1;
    const requiredQty = Math.max(demandSentToMrp + safetyStock - availableStock, 0);
    const plannedQuantity = this.roundUpToLotSize(requiredQty, lotSize);

    if (plannedQuantity <= 0) {
      warnings.push('Planned quantity resolved to 0 after MRP calculation.');
      return {
        completed: true,
        message: 'No production order created because net requirement is zero.',
        stockDecision,
        plannedQuantity,
        warnings,
        createdIds,
        requiredApiGaps,
      };
    }

    const plannedOrder = this.unwrapRequired(
      await firstValueFrom(
        this.plannedOrderService.create({
          productId,
          plannedQty: plannedQuantity,
          requiredDate: dueDate,
          sourceType: salesOrder.sourceType ?? 'SalesOrder',
        }),
      ),
      'PlannedOrder',
    );
    createdIds.plannedOrderId = plannedOrder.id;

    const bom = await this.getPrimaryBom(productId, warnings);
    const routing = await this.getPrimaryRouting(productId, warnings);

    const productionOrder = this.unwrapRequired(
      await firstValueFrom(
        this.productionOrderService.create({
          orderNumber: `PO-${Date.now()}`,
          productId,
          billOfMaterialId: bom?.id ?? null,
          routingId: routing?.id ?? null,
          quantityPlanned: plannedQuantity,
          unitOfMeasure: salesOrder.unit ?? 'EA',
          startDate: this.asIsoDate(scheduleStart),
          endDate: dueDate,
          notes: `Auto-created from ${salesOrder.sourceType ?? 'SalesOrder'} ${salesOrder.referenceId ?? ''}`.trim(),
        }),
      ),
      'ProductionOrder',
    );
    createdIds.productionOrderId = productionOrder.id;

    if (bom) {
      for (const bomItem of bom.items) {
        const requiredComponentQty = plannedQuantity * bomItem.quantityRequired * (1 + bomItem.scrapPercentage / 100);
        const component = this.unwrapRequired(
          await firstValueFrom(
            this.productionOrderService.createComponent({
              productionOrderId: productionOrder.id,
              materialId: bomItem.materialId,
              plannedQty: this.roundQty(requiredComponentQty),
              unitOfMeasure: bomItem.unitOfMeasure ?? salesOrder.unit ?? 'EA',
            }),
          ),
          `ProductionOrderComponent(${bomItem.materialId})`,
        );

        createdIds.componentIds.push(component.id);

        const materialIssue = this.unwrapRequired(
          await firstValueFrom(
            this.materialIssueService.create({
              productionOrderId: productionOrder.id,
              materialId: bomItem.materialId,
              quantityIssued: component.plannedQty,
              unitOfMeasure: component.unitOfMeasure ?? salesOrder.unit ?? 'EA',
              issuedAt: this.nowIso(),
              notes: 'Auto issue from workflow run',
            }),
          ),
          `MaterialIssue(${bomItem.materialId})`,
        );

        createdIds.materialIssueIds.push(materialIssue.id);

        const txn: CreateInventoryTransactionDto = {
          productId: bomItem.materialId,
          quantity: -Math.abs(component.plannedQty),
          transactionType: 'Issue',
          referenceType: 'ProductionOrder',
          referenceId: productionOrder.id,
          transactionDate: this.nowIso(),
          notes: 'Material issue from manufacturing workflow',
        };
        await firstValueFrom(this.inventoryTransactionService.create(txn));
      }
    }

    if (routing) {
      for (const op of routing.operations) {
        const operation = this.unwrapRequired(
          await firstValueFrom(
            this.productionOrderService.createOperation({
              productionOrderId: productionOrder.id,
              sequenceNo: op.sequenceNo,
              operationName: op.operationName ?? `Operation ${op.sequenceNo}`,
              workCenterId: op.workCenterId,
              plannedStart: scheduleStart,
              plannedEnd: this.asIsoDateTime(dueDate),
            }),
          ),
          `ProductionOrderOperation(${op.sequenceNo})`,
        );

        createdIds.operationIds.push(operation.id);
      }
    }

    if (createdIds.operationIds.length > 0 && routing?.operations?.length) {
      const firstOperation = routing.operations[0];
      const requiredHours = this.roundQty(this.calculateRequiredHours(routing, plannedQuantity));

      const schedule = this.unwrapRequired(
        await firstValueFrom(
          this.productionScheduleService.create({
            productionOrderId: productionOrder.id,
            productionOrderOperationId: createdIds.operationIds[0],
            workCenterId: firstOperation.workCenterId,
            scheduledStartDate: scheduleStart,
            scheduledEndDate: this.asIsoDateTime(dueDate),
            notes: 'Auto schedule from workflow run',
          }),
        ),
        'ProductionSchedule',
      );
      createdIds.scheduleId = schedule.id;
      requiredApiGaps.push('Capacity load creation requires workCenterShiftId, not available in workflow input.');
    } else {
      warnings.push('No routing operations found, skipping schedule and capacity load creation.');
    }

    if (releaseOrder) {
      await firstValueFrom(
        this.productionOrderService.update(productionOrder.id, {
          status: 'Released',
          notes: 'Order released by workflow service',
        }),
      );
    }

    const rejectedQty = Math.max(0, input.qualityRejectedQty ?? 0);
    const completedQty = Math.max(plannedQuantity - rejectedQty, 0);

    const wip = this.unwrapRequired(
      await firstValueFrom(
        this.workInProgressService.create({
          productionOrderId: productionOrder.id,
          productId,
          quantityInProgress: completedQty,
          quantityCompleted: completedQty,
          quantityRejected: rejectedQty,
          unitOfMeasure: salesOrder.unit ?? 'EA',
        }),
      ),
      'WorkInProgress',
    );
    createdIds.wipId = wip.id;

    const inspection = this.unwrapRequired(
      await firstValueFrom(
        this.inspectionService.create({
          productionOrderId: productionOrder.id,
          productId,
          inspectedQty: plannedQuantity,
          passedQty: completedQty,
          inspectedAt: this.nowIso(),
          remarks: 'Inspection generated by workflow service',
        }),
      ),
      'Inspection',
    );

    createdIds.inspectionId = inspection.id;

    await firstValueFrom(
      this.inspectionService.update(inspection.id, {
        rejectedQty: rejectedQty,
        status: rejectedQty > 0 ? 'Rejected' : 'Passed',
      }),
    );

    if (rejectedQty > 0) {
      const shouldUseRework = input.useRework ?? true;
      if (shouldUseRework) {
        const reworkQty = Math.max(1, Math.min(input.reworkQty ?? rejectedQty, rejectedQty));
        const rework = this.unwrapRequired(
          await firstValueFrom(
            this.reworkOrderService.create({
              productionOrderId: productionOrder.id,
              quantity: reworkQty,
              unitOfMeasure: salesOrder.unit ?? 'EA',
              reason: 'Quality rejection',
            }),
          ),
          'ReworkOrder',
        );
        createdIds.reworkOrderId = rework.id;
      } else {
        await firstValueFrom(
          this.inventoryTransactionService.create({
            productId,
            quantity: -Math.abs(rejectedQty),
            transactionType: 'Scrap',
            referenceType: 'ProductionOrder',
            referenceId: productionOrder.id,
            transactionDate: this.nowIso(),
            notes: 'Scrap from quality rejection',
          }),
        );
      }
    }

    const finishedGoodsReceipt = this.unwrapRequired(
      await firstValueFrom(
        this.finishedGoodsReceiptService.create({
          productionOrderId: productionOrder.id,
          productId,
          quantityReceived: completedQty,
          unitOfMeasure: salesOrder.unit ?? 'EA',
          receivedAt: this.nowIso(),
          warehouseId: input.finishedGoodsWarehouseId ?? null,
          notes: 'Auto-receipt from workflow run',
        }),
      ),
      'FinishedGoodsReceipt',
    );
    createdIds.finishedGoodsReceiptId = finishedGoodsReceipt.id;

    const batch = this.unwrapRequired(
      await firstValueFrom(
        this.productionBatchService.create({
          batchNumber: `${productionOrder.orderNumber || 'PO'}-BATCH-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}`,
          productionOrderId: productionOrder.id,
          productId,
          quantity: completedQty,
          unitOfMeasure: salesOrder.unit ?? 'EA',
        }),
      ),
      'ProductionBatch',
    );
    createdIds.productionBatchId = batch.id;

    await firstValueFrom(
      this.inventoryTransactionService.create({
        productId,
        quantity: completedQty,
        transactionType: 'Receipt',
        referenceType: 'ProductionOrder',
        referenceId: productionOrder.id,
        transactionDate: this.nowIso(),
        notes: 'Finished goods receipt from manufacturing workflow',
      }),
    );

    if (input.runSubcontract && input.subcontractVendorId) {
      const subcontract = this.unwrapRequired(
        await firstValueFrom(
          this.subcontractOrderService.create({
            productionOrderId: productionOrder.id,
            vendorId: input.subcontractVendorId,
            quantitySent: input.subcontractQty ?? plannedQuantity,
            unitOfMeasure: salesOrder.unit ?? 'EA',
            unitCost: input.subcontractUnitCost ?? 0,
            expectedReturnDate: dueDate,
          }),
        ),
        'SubContractOrder',
      );
      createdIds.subcontractOrderId = subcontract.id;
    }

    const actualCost = input.actualCost ?? {
      materialCost: 0,
      laborCost: 0,
      machineCost: 0,
      overheadCost: 0,
    };
    const entry = this.unwrapRequired(
      await firstValueFrom(
        this.costEntryService.create({
          productionOrderId: productionOrder.id,
          materialCost: actualCost.materialCost,
          laborCost: actualCost.laborCost,
          machineCost: actualCost.machineCost,
          overheadCost: actualCost.overheadCost,
          scrapCost: rejectedQty,
          postedAt: this.nowIso(),
          notes: 'Cost entry from workflow run',
        }),
      ),
      'CostEntry',
    );
    createdIds.costEntryIds.push(entry.id);

    const standardCost = await this.tryGetActiveStandardCost(productId, warnings);
    if (standardCost) {
      const variance = this.unwrapRequired(
        await firstValueFrom(
          this.productionVarianceService.create({
            productionOrderId: productionOrder.id,
            costEntryId: entry.id,
            standardMaterialCost: standardCost.materialCost,
            actualMaterialCost: actualCost.materialCost,
            standardLaborCost: standardCost.laborCost,
            actualLaborCost: actualCost.laborCost,
            standardMachineCost: standardCost.machineCost,
            actualMachineCost: actualCost.machineCost,
            standardOverheadCost: standardCost.overheadCost,
            actualOverheadCost: actualCost.overheadCost,
            varianceCategory: 'Auto',
            notes: 'Auto variance from workflow run',
          }),
        ),
        'ProductionVariance',
      );
      createdIds.varianceIds.push(variance.id);
    }

    if (input.autoPostInventoryDocuments) {
      if (!input.inventoryDocumentUnitId) {
        requiredApiGaps.push('InventoryDocument requires inventoryDocumentUnitId to post issue/receipt lines.');
      }
      if (!input.finishedGoodsWarehouseId) {
        requiredApiGaps.push('InventoryDocument requires finishedGoodsWarehouseId for receipt posting.');
      }

      if (input.inventoryDocumentUnitId && input.finishedGoodsWarehouseId) {
        const issueLines: InventoryDocumentLineInput[] = [];
        if (bom) {
          bom.items.forEach((x, index) => {
            issueLines.push({
              itemId: x.materialId,
              warehouseId: input.rawMaterialWarehouseId ?? input.finishedGoodsWarehouseId!,
              quantity: this.roundQty(-(plannedQuantity * x.quantityRequired)),
              unitId: input.inventoryDocumentUnitId!,
              unitCost: 0,
              lineNumber: index + 1,
              description: 'Issue for production',
            });
          });
        }

        if (issueLines.length > 0) {
          const issueDoc = await this.createAndPostInventoryDocument({
            documentType: 'Issue',
            documentDate: this.nowIso(),
            referenceType: 'ProductionOrder',
            referenceId: productionOrder.id,
            description: 'Material issue from manufacturing workflow',
            lines: issueLines,
          });
          createdIds.inventoryIssueDocumentId = issueDoc.id;
        }

        const receiptDoc = await this.createAndPostInventoryDocument({
          documentType: 'Receipt',
          documentDate: this.nowIso(),
          referenceType: 'ProductionOrder',
          referenceId: productionOrder.id,
          description: 'Finished goods receipt from manufacturing workflow',
          lines: [
            {
              itemId: productId,
              warehouseId: input.finishedGoodsWarehouseId,
              quantity: completedQty,
              unitId: input.inventoryDocumentUnitId,
              unitCost: 0,
              lineNumber: 1,
              description: 'Finished goods receipt',
            },
          ],
        });
        createdIds.inventoryReceiptDocumentId = receiptDoc.id;

        if (rejectedQty > 0 && !(input.useRework ?? true)) {
          const scrapDoc = await this.createAndPostInventoryDocument({
            documentType: 'Scrap',
            documentDate: this.nowIso(),
            referenceType: 'ProductionOrder',
            referenceId: productionOrder.id,
            description: 'Scrap from quality rejection',
            lines: [
              {
                itemId: productId,
                warehouseId: input.finishedGoodsWarehouseId,
                quantity: -Math.abs(rejectedQty),
                unitId: input.inventoryDocumentUnitId,
                unitCost: 0,
                lineNumber: 1,
                description: 'Scrap quantity',
              },
            ],
          });
          createdIds.inventoryScrapDocumentId = scrapDoc.id;
        }
      }
    }

    if (closeOrder) {
      await firstValueFrom(
        this.productionOrderService.update(productionOrder.id, {
          status: 'Closed',
          notes: `Auto closed from workflow. Produced=${completedQty}, Rejected=${rejectedQty}`,
        }),
      );
    }

    return {
      completed: true,
      message: 'Manufacturing workflow executed successfully.',
      stockDecision,
      plannedQuantity,
      warnings,
      createdIds,
      requiredApiGaps,
    };
  }

  private async getAvailableStock(productId: string): Promise<number> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<InventoryBalanceSnapshot[]>>(
        `${this.inventoryBalanceByItemUrl}/${productId}`,
        { headers: this.auth.getAuthHeaders() },
      ),
    );

    if (!res.success || !res.data) {
      return 0;
    }

    return res.data.reduce((sum, x) => sum + (x.quantityAvailable ?? 0), 0);
  }

  private async resolveProductId(productInput: string): Promise<string> {
    const normalizedInput = (productInput ?? '').trim();
    if (!normalizedInput) {
      throw new Error('salesOrder.productId is required.');
    }

    if (this.isUuid(normalizedInput)) {
      return normalizedInput;
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<InventoryItemLookupDto[]>>(this.itemLookupUrl, {
        headers: this.auth.getAuthHeaders(),
      }),
    );

    const items = response.data ?? [];
    const match = items.find((item) => {
      const code = item.code?.trim().toLowerCase() ?? '';
      const name = item.name?.trim().toLowerCase() ?? '';
      const inputText = normalizedInput.toLowerCase();
      return code === inputText || name === inputText || `${code} - ${name}` === inputText;
    });

    if (!match?.id) {
      throw new Error(
        `Unknown product "${normalizedInput}". Use a valid product code/name (for example FG-TABLE) or the product ID.`,
      );
    }

    return match.id;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private async createAndPostInventoryDocument(
    payload: InventoryDocumentInput,
  ): Promise<InventoryDocumentDto> {
    const createdResponse = await firstValueFrom(
      this.http.post<ApiResponse<InventoryDocumentDto>>(this.inventoryDocumentUrl, payload, {
        headers: this.auth.getAuthHeaders(),
      }),
    );

    const created = this.unwrapRequired(createdResponse, 'InventoryDocument');

    await firstValueFrom(
      this.http.post<ApiResponse<InventoryDocumentDto>>(
        `${this.inventoryDocumentUrl}/${created.id}/post`,
        {
          documentId: created.id,
          postingDate: this.nowIso(),
        },
        { headers: this.auth.getAuthHeaders() },
      ),
    );

    return created;
  }

  private async tryGetMaterialPlanning(
    productId: string,
    warnings: string[],
  ): Promise<MaterialPlanningDataDto | null> {
    try {
      const response = await firstValueFrom(this.materialPlanningService.getByProduct(productId));
      return response.data ?? null;
    } catch {
      warnings.push('Material planning data not found. Using safety stock=0 and lot size=1.');
      return null;
    }
  }

  private async getPrimaryBom(productId: string, warnings: string[]): Promise<BillOfMaterialDto | null> {
    try {
      const response = await firstValueFrom(this.bomService.getByProduct(productId));
      const list = response.data ?? [];
      if (!list.length) {
        warnings.push('No BOM found for product. Components will not be generated.');
        return null;
      }

      return list.find((x) => x.isActive) ?? list[0];
    } catch {
      warnings.push('Unable to load BOM. Components will not be generated.');
      return null;
    }
  }

  private async getPrimaryRouting(productId: string, warnings: string[]): Promise<RoutingDto | null> {
    try {
      const response = await firstValueFrom(this.routingService.getByProduct(productId));
      const list = response.data ?? [];
      if (!list.length) {
        warnings.push('No routing found for product. Operations will not be generated.');
        return null;
      }

      return list.find((x) => x.isActive) ?? list[0];
    } catch {
      warnings.push('Unable to load routing. Operations will not be generated.');
      return null;
    }
  }

  private async tryGetActiveStandardCost(
    productId: string,
    warnings: string[],
  ): Promise<StandardCostDto | null> {
    try {
      const response = await firstValueFrom(this.standardCostService.getActiveByProduct(productId));
      return response.data ?? null;
    } catch {
      warnings.push('Active standard cost not found. Variance records were skipped.');
      return null;
    }
  }

  private calculateRequiredHours(routing: RoutingDto, plannedQuantity: number): number {
    const opHours = routing.operations.reduce((sum, op) => {
      return sum + (op.setupHours ?? 0) + (op.standardHours ?? 0);
    }, 0);

    if (plannedQuantity <= 0) {
      return Math.max(opHours, 0);
    }

    return Math.max(opHours, 1);
  }

  private unwrapRequired<T>(response: ApiResponse<T>, entityName: string): T {
    if (!response.success || response.data == null) {
      throw new Error(`Failed to process ${entityName}: ${response.message ?? 'No response data.'}`);
    }

    return response.data;
  }

  private roundUpToLotSize(value: number, lotSize: number): number {
    if (value <= 0) {
      return 0;
    }

    const size = lotSize > 0 ? lotSize : 1;
    return Math.ceil(value / size) * size;
  }

  private roundQty(value: number): number {
    return Math.round(value * 1000) / 1000;
  }

  private asIsoDate(value: string): string {
    if (!value) {
      return value;
    }

    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  private asIsoDateTime(value: string): string {
    return new Date(value).toISOString();
  }

  private dateMinusDays(value: string, days: number): string {
    const dt = new Date(value);
    dt.setDate(dt.getDate() - days);
    return dt.toISOString();
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private validateInput(input: ManufacturingScenarioInput): void {
    if (!input.salesOrder.productId) {
      throw new Error('salesOrder.productId is required.');
    }

    if (!Number.isFinite(input.salesOrder.quantity) || input.salesOrder.quantity <= 0) {
      throw new Error('salesOrder.quantity must be greater than 0.');
    }

    if (!input.salesOrder.dueDate) {
      throw new Error('salesOrder.dueDate is required.');
    }
  }
}
