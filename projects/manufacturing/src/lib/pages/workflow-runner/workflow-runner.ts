import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ManufacturingWorkflowService } from '../../services/manufacturing-workflow.service';
import { ManufacturingScenarioResult } from '../../models/manufacturing-workflow.model';

@Component({
  selector: 'lib-workflow-runner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-runner.html',
  styleUrl: './workflow-runner.css',
})
export class WorkflowRunner {
  loading = false;
  error = '';
  result: ManufacturingScenarioResult | null = null;

  productId = 'FG-TABLE';
  demandQty = 10;
  dueDate = this.defaultDueDate();
  unit = 'EA';
  sourceType = 'SalesOrder';
  referenceId = 'SO-DEMO-1001';

  demandPolicy: 'FullDemand' | 'ShortageOnly' = 'FullDemand';
  runMrp = true;
  releaseOrder = true;
  closeOrder = true;
  qualityRejectedQty = 2;
  useRework = true;
  autoPostInventoryDocuments = false;

  finishedGoodsWarehouseId = '';
  rawMaterialWarehouseId = '';
  inventoryDocumentUnitId = '';
  postedByUserId = '';

  actualMaterialCost = 1200;
  actualLaborCost = 300;
  actualMachineCost = 500;
  actualOverheadCost = 200;
  currency = 'USD';

  constructor(
    private workflowService: ManufacturingWorkflowService,
    private cdr: ChangeDetectorRef,
  ) {}

  run(): void {
    this.loading = true;
    this.error = '';
    this.result = null;

    this.workflowService
      .runScenario({
        salesOrder: {
          productId: this.productId,
          quantity: this.demandQty,
          dueDate: this.dueDate,
          unit: this.unit,
          sourceType: this.sourceType,
          referenceId: this.referenceId,
        },
        demandPolicy: this.demandPolicy,
        runMrp: this.runMrp,
        releaseOrder: this.releaseOrder,
        closeOrder: this.closeOrder,
        qualityRejectedQty: this.qualityRejectedQty,
        useRework: this.useRework,
        autoPostInventoryDocuments: this.autoPostInventoryDocuments,
        finishedGoodsWarehouseId: this.finishedGoodsWarehouseId || null,
        rawMaterialWarehouseId: this.rawMaterialWarehouseId || null,
        inventoryDocumentUnitId: this.inventoryDocumentUnitId || null,
        postedByUserId: this.postedByUserId || null,
        currency: this.currency,
        actualCost: {
          materialCost: this.actualMaterialCost,
          laborCost: this.actualLaborCost,
          machineCost: this.actualMachineCost,
          overheadCost: this.actualOverheadCost,
        },
      })
      .subscribe({
        next: (response) => {
          this.result = response;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          this.error = this.getErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const payload = err.error as { message?: string; errors?: Record<string, string[]> } | string | null;

      if (typeof payload === 'string' && payload.trim().length > 0) {
        return `Request failed (${err.status}): ${payload}`;
      }

      if (payload && typeof payload === 'object') {
        if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
          return payload.message;
        }

        if (payload.errors && typeof payload.errors === 'object') {
          const firstKey = Object.keys(payload.errors)[0];
          const firstError = firstKey ? payload.errors[firstKey]?.[0] : null;
          if (firstError) {
            return `${firstKey}: ${firstError}`;
          }
        }
      }

      return `Request failed (${err.status} ${err.statusText || 'Unknown error'}).`;
    }

    if (typeof err === 'string') {
      return err;
    }

    if (err && typeof err === 'object') {
      const maybeMessage = (err as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
        return maybeMessage;
      }
    }

    return 'Failed to run manufacturing workflow.';
  }

  private defaultDueDate(): string {
    const dt = new Date();
    dt.setDate(dt.getDate() + 5);
    return dt.toISOString().slice(0, 10);
  }
}
