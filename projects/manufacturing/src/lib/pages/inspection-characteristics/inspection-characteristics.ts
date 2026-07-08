import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { InspectionService } from '../../services/inspection.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import {
  InspectionDto,
  InspectionCharacteristicDto,
  CreateInspectionCharacteristicDto,
  UpdateInspectionCharacteristicDto,
} from '../../models/inspection.model';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-inspection-characteristics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspection-characteristics.html',
  styleUrl: './inspection-characteristics.css',
})
export class InspectionCharacteristics implements OnInit {
  inspections: InspectionDto[] = [];
  selectedInspectionId = '';
  selectedInspection: InspectionDto | null = null;
  characteristics: InspectionCharacteristicDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: InspectionCharacteristicDto | null = null;

  formName = '';
  formNominalValue: number | null = null;
  formActualValue: number | null = null;
  formUnit = '';
  formIsPassed = false;
  formIsCritical = false;
  formInspectionType = 'Dimensional';
  productDisplayById: Record<string, string> = {};
  productLabelsLoaded = false;
  orderNumberById: Record<string, string> = {};
  orderProductNameById: Record<string, string> = {};
  productionOrdersById: Record<string, { productId: string; productName: string | null; orderNumber: string | null }> = {};

  charPage = 1;
  charPageSize = 10;
  charTotalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  get displayRows(): any[] {
    let rows: any[] = [...this.characteristics];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const id = this.highlighter.id;
    if (id != null) {
      const idx = rows.findIndex(r => r?.id === id);
      if (idx > 0) { const [row] = rows.splice(idx, 1); rows.unshift(row); }
    }
    return rows;
  }

  get pagedCharacteristics(): InspectionCharacteristicDto[] {
    const start = (this.charPage - 1) * this.charPageSize;
    return this.displayRows.slice(start, start + this.charPageSize);
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  private applyJustCreated(): void {
    const c = this.justCreated;
    if (!c) return;
    this.justCreated = null;
    if (!this.characteristics.some((i: any) => i?.id === c.id)) this.characteristics = [c, ...this.characteristics];
    this.highlighter.flash(c.id, this.cdr);
  }

  goToCharPage(page: number) { this.charPage = page; }
  onCharPageSizeChange() { this.charPage = 1; this.charTotalPages = Math.max(1, Math.ceil(this.characteristics.length / this.charPageSize)); }

  constructor(
    private svc: InspectionService,
    private productionOrderSvc: ProductionOrderService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProductLabels();
    this.loadOrderLabels();
    this.loadInspections();
  }

  loadOrderLabels() {
    this.productionOrderSvc.getAll({ pageSize: 1000 }).subscribe({
      next: (r) => {
        (r.data ?? []).forEach(o => {
          this.orderNumberById[o.id] = o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
          if (o.productName?.trim()) this.orderProductNameById[o.id] = o.productName.trim();
          this.productionOrdersById[o.id] = {
            productId: o.productId?.trim() || '',
            productName: o.productName,
            orderNumber: o.orderNumber,
          };
        });
        this.cdr.detectChanges();
      },
    });
  }

  loadProductLabels() {
    if (this.productLabelsLoaded) return;

    this.http.get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/active`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const items = r.data ?? [];
        this.productDisplayById = items.reduce((acc, item) => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          if (code && name) acc[item.id] = `${code} - ${name}`;
          else if (name) acc[item.id] = name;
          else if (code) acc[item.id] = code;
          return acc;
        }, {} as Record<string, string>);
        this.productLabelsLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.productLabelsLoaded = true;
      },
    });
  }

  getProductDisplayLabel(
    productId: string | null | undefined,
    productName: string | null | undefined,
    productionOrderId?: string | null,
  ): string {
    if (productionOrderId && this.productionOrdersById[productionOrderId]) {
      const order = this.productionOrdersById[productionOrderId];
      if (order.productName?.trim()) return order.productName.trim();
      if (order.productId && this.productDisplayById[order.productId]) return this.productDisplayById[order.productId];
    }
    if (productionOrderId && this.orderProductNameById[productionOrderId]?.trim()) {
      return this.orderProductNameById[productionOrderId].trim();
    }
    if (productId && this.productDisplayById[productId]) return this.productDisplayById[productId];
    if (productName?.trim()) return productName.trim();
    return 'Unmapped Product';
  }

  private getActiveInspectionFallback(): InspectionDto | null {
    if (!this.selectedInspectionId) return null;
    return this.inspections.find(i => i.id === this.selectedInspectionId) ?? null;
  }

  private extractApiError(error: HttpErrorResponse, fallback: string): string {
    const payload = error.error as {
      message?: string;
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    } | string | null;

    if (typeof payload === 'string' && payload.trim()) return payload.trim();
    if (payload && typeof payload === 'object') {
      if (payload.message?.trim()) return payload.message.trim();
      if (payload.detail?.trim()) return payload.detail.trim();
      if (payload.title?.trim()) {
        const firstValidation = payload.errors
          ? Object.values(payload.errors).find(v => v?.length)?.[0]
          : null;
        return firstValidation ? `${payload.title.trim()}: ${firstValidation}` : payload.title.trim();
      }
      if (payload.errors) {
        const firstValidation = Object.values(payload.errors).find(v => v?.length)?.[0];
        if (firstValidation) return firstValidation;
      }
    }

    if (error.status) return `${fallback} (HTTP ${error.status})`;
    return fallback;
  }

  private buildCharacteristicPayload(): CreateInspectionCharacteristicDto {
    const dto: CreateInspectionCharacteristicDto = {
      characteristicName: this.formName.trim(),
      inspectionType: this.formInspectionType.trim() || 'Dimensional',
      isCritical: this.formIsCritical,
    };

    if (this.formNominalValue !== null) dto.targetValue = this.formNominalValue;
    if (this.formActualValue !== null) dto.actualValue = this.formActualValue;
    if (this.formUnit.trim()) dto.unitOfMeasure = this.formUnit.trim();
    dto.result = this.formIsPassed ? 'Pass' : 'Fail';

    return dto;
  }

  loadInspections() {
    this.loading = true;
    this.error = '';

    this.svc.getAll({ pageSize: 1000 }).subscribe({
      next: (response) => {
        this.inspections = response.data ?? [];
        this.selectedInspectionId = this.inspections[0]?.id ?? '';

        if (this.selectedInspectionId) {
          this.loadInspection(this.selectedInspectionId);
        } else {
          this.selectedInspection = null;
          this.characteristics = [];
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.error = 'Failed to load inspections';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadInspection(id: string) {
    if (!id) {
      this.selectedInspection = null;
      this.characteristics = [];
      return;
    }

    this.loading = true;
    this.error = '';

    this.svc.getById(id).subscribe({
      next: (response) => {
        this.selectedInspection = response.data ?? null;
        this.characteristics = this.selectedInspection?.characteristics ?? [];
        this.applyJustCreated();
        this.charPage = 1;
        this.charTotalPages = Math.max(1, Math.ceil(this.characteristics.length / this.charPageSize));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load selected inspection';
        this.selectedInspection = null;
        this.characteristics = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onInspectionChange(inspectionId: string) {
    this.selectedInspectionId = inspectionId;
    this.cancel();
    this.loadInspection(inspectionId);
  }

  openCreate() {
    this.resetForm();
    this.editing = null;
    this.showForm = true;
  }

  openEdit(item: InspectionCharacteristicDto) {
    this.editing = item;
    this.formName = item.characteristicName ?? '';
    this.formInspectionType = item.inspectionType?.trim() || 'Dimensional';
    this.formNominalValue = item.targetValue ?? item.nominalValue ?? null;
    this.formActualValue = item.actualValue ?? null;
    this.formUnit = item.unitOfMeasure ?? item.unit ?? '';
    const normalizedResult = (item.result ?? item.qualitativeResult ?? '').trim().toLowerCase();
    this.formIsPassed = normalizedResult === 'pass' || normalizedResult === 'passed' || item.isPassed === true;
    this.formIsCritical = item.isCritical ?? false;
    this.showForm = true;
  }

  cancel() {
    this.resetForm();
    this.editing = null;
    this.showForm = false;
  }

  save() {
    if (!this.selectedInspectionId || !this.formName.trim()) {
      this.error = 'Characteristic name is required.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formNominalValue !== null && this.formNominalValue < 0) {
      this.error = 'Nominal value cannot be negative.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formActualValue !== null && this.formActualValue < 0) {
      this.error = 'Actual value cannot be negative.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const updateDto: UpdateInspectionCharacteristicDto = {
        characteristicName: this.formName.trim(),
        inspectionType: this.formInspectionType.trim() || 'Dimensional',
        targetValue: this.formNominalValue,
        actualValue: this.formActualValue,
        unitOfMeasure: this.formUnit.trim() || undefined,
        result: this.formIsPassed ? 'Pass' : 'Fail',
        isCritical: this.formIsCritical,
      };

      this.svc
        .updateCharacteristic(this.selectedInspectionId, this.editing.id, updateDto)
        .subscribe({
          next: () => {
            this.showForm = false;
            this.loadInspection(this.selectedInspectionId);
          },
          error: (e: HttpErrorResponse) => {
            this.error = this.extractApiError(e, 'Failed to update characteristic');
            this.cdr.detectChanges();
          },
        });
    } else {
      const createDto = this.buildCharacteristicPayload();

      this.svc.createCharacteristic(this.selectedInspectionId, createDto).subscribe({
        next: (res: any) => {
          this.justCreated = res?.data ?? null;
          this.showForm = false;
          this.loadInspection(this.selectedInspectionId);
        },
        error: (e: HttpErrorResponse) => {
          this.error = this.extractApiError(e, 'Failed to create characteristic');
          this.cdr.detectChanges();
        },
      });
    }
  }

  delete(item: InspectionCharacteristicDto) {
    if (!this.selectedInspectionId) {
      return;
    }

    if (confirm(`Delete characteristic "${item.characteristicName ?? 'unnamed'}"?`)) {
      this.svc.deleteCharacteristic(this.selectedInspectionId, item.id).subscribe({
        next: () => this.loadInspection(this.selectedInspectionId),
        error: () => {
          this.error = 'Failed to delete characteristic';
          this.cdr.detectChanges();
        },
      });
    }
  }

  resetForm() {
    this.formName = '';
    this.formInspectionType = 'Dimensional';
    this.formNominalValue = null;
    this.formActualValue = null;
    this.formUnit = '';
    this.formIsPassed = false;
    this.formIsCritical = false;
  }

  getNominalDisplay(item: InspectionCharacteristicDto): number | null {
    return item.targetValue ?? item.nominalValue ?? null;
  }

  getUnitDisplay(item: InspectionCharacteristicDto): string {
    return item.unitOfMeasure ?? item.unit ?? '—';
  }

  getPassedDisplay(item: InspectionCharacteristicDto): string {
    const normalizedResult = (item.result ?? item.qualitativeResult ?? '').trim().toLowerCase();
    if (normalizedResult === 'pass' || normalizedResult === 'passed') return 'Yes';
    if (normalizedResult === 'fail' || normalizedResult === 'failed') return 'No';
    if (typeof item.isPassed === 'boolean') return item.isPassed ? 'Yes' : 'No';
    return '—';
  }

  getInspectionLabel(inspection: InspectionDto) {
    const orderLabel = inspection.productionOrderId
      ? (this.productionOrdersById[inspection.productionOrderId]?.orderNumber?.trim()
        || this.orderNumberById[inspection.productionOrderId]
        || `PO-${inspection.productionOrderId.substring(0, 6)}`)
      : null;
    const productLabel = this.getProductDisplayLabel(inspection.productId, inspection.productName, inspection.productionOrderId);
    const dateLabel = inspection.inspectedAt ? new Date(inspection.inspectedAt).toLocaleDateString() : '';
    return orderLabel ? `${orderLabel} — ${productLabel}${dateLabel ? ' (' + dateLabel + ')' : ''}` : `${productLabel}${dateLabel ? ' (' + dateLabel + ')' : ''}`;
  }

  getSelectedInspectionOrderLabel(): string {
    const inspection = this.selectedInspection ?? this.getActiveInspectionFallback();
    if (!inspection?.productionOrderId) return 'N/A';
    return this.productionOrdersById[inspection.productionOrderId]?.orderNumber?.trim()
      || this.orderNumberById[inspection.productionOrderId]
      || inspection.orderNumber?.trim()
      || `PO-${inspection.productionOrderId.substring(0, 6)}`;
  }

  getSelectedInspectionProductLabel(): string {
    const inspection = this.selectedInspection ?? this.getActiveInspectionFallback();
    if (!inspection) return 'Unmapped Product';
    return this.getProductDisplayLabel(
      inspection.productId,
      inspection.productName,
      inspection.productionOrderId,
    );
  }

  getSelectedInspectionDateLabel(): string {
    const inspection = this.selectedInspection ?? this.getActiveInspectionFallback();
    return inspection?.inspectedAt ? new Date(inspection.inspectedAt).toLocaleDateString() : 'N/A';
  }

  getSelectedInspectionResultLabel(): string {
    const inspection = this.selectedInspection ?? this.getActiveInspectionFallback();
    return inspection?.status || 'Pending';
  }
}
