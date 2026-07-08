import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { MaterialPlanningService } from '../../services/material-planning.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ManufacturingWorkflowService } from '../../services/manufacturing-workflow.service';
import { DemandService } from '../../services/demand.service';
import { PlannedOrderService } from '../../services/planned-order.service';
import { ApiResponse } from '../../models/api-response.model';
import { MaterialPlanningDataDto, CreateMaterialPlanningDataDto, UpdateMaterialPlanningDataDto } from '../../models/material-planning.model';
import { ProductPickerInputComponent, ProductPickerItem } from '../../components/product-picker-input/product-picker-input';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemDto {
  id: string;
  code: string | null;
  name: string | null;
}

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

interface DemandDto {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  unit?: string;
  dueDate: string | null;     // actual API field name
  sourceType?: string | null; // actual API field name
}

interface InventoryBalanceSnapshot {
  quantityAvailable: number;
}

interface MrpPlanningRow {
  rowId: string;           // unique per row = demand.id
  productId: string;
  productName: string;
  demandQty: number;
  availableStock: number;
  safetyStock: number;
  lotSize: number;
  netRequirement: number;
  plannedQty: number;
  status: 'ReadyForPO' | 'PartialStock' | 'Shortage' | 'Excess';
  planningData?: MaterialPlanningDataDto;
  demand?: DemandDto;
}

interface PlannedOrderCreatePayload {
  productId: string;
  plannedQty: number;
  requiredDate?: string | null;
  sourceType?: string | null;
  notes?: string | null;
  status?: string | null;
}

interface PlannedOrderCreateAttempt {
  payload: PlannedOrderCreatePayload;
}

@Component({
  selector: 'lib-material-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductPickerInputComponent],
  templateUrl: './material-planning.html',
  styleUrl: './material-planning.css',
})
export class MaterialPlanning implements OnInit {
  // Tab control
  activeTab: 'parameters' | 'mrp-planning' | 'demands' = 'mrp-planning';

  // Parameters tab
  items: MaterialPlanningDataDto[] = [];
  editing: MaterialPlanningDataDto | null = null;
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  productDisplayText = '';
  formProductId = '';
  formProductName = '';
  formSafetyStock = 0;
  formReorderPoint = 0;
  formMaxStockLevel = 0;
  formLotSize = 0;
  formLeadTimeDays = 0;
  formPlanningHorizonDays = 0;
  formScrapPercentage = 0;
  formProcurementType = 'Make';
  formMrpType = 'MRP';
  formNotes = '';
  formIsActive = true;
  procurementTypes = ['Make', 'Buy', 'Subcontract'];
  mrpTypes = ['MRP', 'ROP', 'Forecast'];

  // MRP Planning tab
  mrpRows: MrpPlanningRow[] = [];
  mrpSortBy = '';
  mrpSortDirection: 'asc' | 'desc' = 'asc';
  demands: DemandDto[] = [];
  runningMrp = false;
  runningPlannedOrder = false;
  selectedMrpRow: MrpPlanningRow | null = null;
  productLabelsById: Record<string, string> = {};

  // Alerts
  alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = [];
  alertsExpanded = false;

  // General
  loading = false;
  error = '';
  showForm = false;

  // Pagination
  pageSizeOptions = [10, 25, 50, 100];
  paramPage = 1; paramPageSize = 10; paramTotalPages = 0;
  mrpPage = 1; mrpPageSize = 10; mrpTotalPages = 0;
  demandPage = 1; demandPageSize = 10; demandTotalPages = 0;

  get displayRows(): any[] {
    let rows: any[] = [...this.items];
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

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  get pagedItems(): MaterialPlanningDataDto[] {
    const start = (this.paramPage - 1) * this.paramPageSize;
    return this.displayRows.slice(start, start + this.paramPageSize);
  }

  get displayMrpRows(): MrpPlanningRow[] {
    const rows = [...this.mrpRows];
    if (this.mrpSortBy) {
      const dir = this.mrpSortDirection === 'asc' ? 1 : -1;
      const key = this.mrpSortBy;
      rows.sort((a: any, b: any) => {
        const av = key === 'productName' ? this.getProductDisplayLabel(a.productId, a.productName) : a?.[key];
        const bv = key === 'productName' ? this.getProductDisplayLabel(b.productId, b.productName) : b?.[key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    return rows;
  }

  sortMrp(column: string): void {
    if (this.mrpSortBy === column) this.mrpSortDirection = this.mrpSortDirection === 'asc' ? 'desc' : 'asc';
    else { this.mrpSortBy = column; this.mrpSortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  get pagedMrpRows(): MrpPlanningRow[] {
    const start = (this.mrpPage - 1) * this.mrpPageSize;
    return this.displayMrpRows.slice(start, start + this.mrpPageSize);
  }

  get pagedDemands(): DemandDto[] {
    const start = (this.demandPage - 1) * this.demandPageSize;
    return this.demands.slice(start, start + this.demandPageSize);
  }

  goToParamPage(page: number) { this.paramPage = page; }
  onParamPageSizeChange() { this.paramPage = 1; this.paramTotalPages = Math.max(1, Math.ceil(this.items.length / this.paramPageSize)); }
  goToMrpPage(page: number) { this.mrpPage = page; }
  onMrpPageSizeChange() { this.mrpPage = 1; this.mrpTotalPages = Math.max(1, Math.ceil(this.mrpRows.length / this.mrpPageSize)); }
  goToDemandPage(page: number) { this.demandPage = page; }
  onDemandPageSizeChange() { this.demandPage = 1; this.demandTotalPages = Math.max(1, Math.ceil(this.demands.length / this.demandPageSize)); }
  
  private readonly inventoryBalanceByItemUrl = `${BASE_URL}/api/InventoryBalance/by-item`;
  private readonly demandsUrl = `${BASE_URL}/api/v1/manufacturing/demands`;

  constructor(
    private svc: MaterialPlanningService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
    private demandService: DemandService,
    private workflowService: ManufacturingWorkflowService,
    private plannedOrderService: PlannedOrderService,
  ) {}

  ngOnInit() {
    this.loadParameters();
    this.loadMrpData();
  }

  // ===== Parameters Tab Methods =====
  loadParameters() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageSize: 1000 }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.paramPage = 1;
        this.paramTotalPages = Math.max(1, Math.ceil(this.items.length / this.paramPageSize));
        this.loading = false;
        this.applyJustCreated();
        this.cdr.detectChanges();
        this.preloadProductLabels(this.items.map((i) => i.productId)).then(() => this.cdr.detectChanges());
      },
      error: () => {
        this.error = 'Failed to load material planning data';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private applyJustCreated(): void {
    const c = this.justCreated;
    if (!c) return;
    this.justCreated = null;
    if (!this.items.some((i: any) => i?.id === c.id)) this.items = [c, ...this.items];
    this.highlighter.flash(c.id, this.cdr);
  }

  // ===== MRP Planning Tab Methods =====
  async loadMrpData() {
    this.loading = true;
    this.alerts = [];
    this.alertsExpanded = false;
    this.error = '';

    try {
      // Load demands
      const demandsRes = await firstValueFrom(
        this.http.get<ApiResponse<DemandDto[]>>(this.demandsUrl, {
          headers: this.auth.getAuthHeaders(),
        }),
      );
      this.demands = demandsRes.data ?? [];
      this.demandPage = 1;
      this.demandTotalPages = Math.max(1, Math.ceil(this.demands.length / this.demandPageSize));

      // Load planning parameters
      const parametersRes = await firstValueFrom(this.svc.getAll({ pageSize: 1000 }));
      this.items = parametersRes.data ?? [];
      this.paramPage = 1;
      this.paramTotalPages = Math.max(1, Math.ceil(this.items.length / this.paramPageSize));

      await this.preloadProductLabels([
        ...new Set([
          ...this.demands.map((demand) => demand.productId),
          ...this.items.map((item) => item.productId),
        ]),
      ]);

      // Calculate MRP rows
      await this.calculateMrpRows();
      this.mrpPage = 1;
      this.mrpTotalPages = Math.max(1, Math.ceil(this.mrpRows.length / this.mrpPageSize));

      // Check for alerts
      this.checkAlerts();
    } catch (err) {
      this.error = 'Failed to load MRP data';
      this.alerts.push({ type: 'error', message: 'Failed to load MRP planning data' });
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async calculateMrpRows() {
    this.mrpRows = [];

    // 1. Demand-driven rows
    for (const demand of this.demands) {
      const planningData = this.items.find((x) => x.productId === demand.productId);
      const availableStock = await this.getAvailableStock(demand.productId);
      const safetyStock = planningData?.safetyStock ?? 0;
      const lotSize = Math.max(1, planningData?.lotSize ?? 1);
      const productLabel = this.getProductDisplayLabel(demand.productId, demand.productName);

      const netRequirement = Math.max(demand.quantity + safetyStock - availableStock, 0);
      const plannedQty = this.roundUpToLotSize(netRequirement, lotSize);

      let status: MrpPlanningRow['status'];
      if (availableStock >= demand.quantity) {
        status = 'ReadyForPO';
      } else if (availableStock > 0) {
        status = 'PartialStock';
      } else if (plannedQty > 0) {
        status = 'Shortage';
      } else {
        status = 'Excess';
      }

      this.mrpRows.push({
        rowId: demand.id,
        productId: demand.productId,
        productName: productLabel,
        demandQty: demand.quantity,
        availableStock,
        safetyStock,
        lotSize,
        netRequirement,
        plannedQty,
        status,
        planningData,
        demand,
      });
    }

    // 2. Reorder-point-triggered rows — items below their reorder point with no open demand
    const demandProductIds = new Set(this.demands.map((d) => d.productId));
    for (const planningData of this.items) {
      if (!planningData.isActive) continue;
      const reorderPoint = planningData.reorderPoint ?? 0;
      if (reorderPoint <= 0) continue;
      if (demandProductIds.has(planningData.productId)) continue;

      const availableStock = await this.getAvailableStock(planningData.productId);
      if (availableStock >= reorderPoint) continue;

      const safetyStock = planningData.safetyStock ?? 0;
      const lotSize = Math.max(1, planningData.lotSize ?? 1);
      const productLabel = this.getProductDisplayLabel(planningData.productId, planningData.productName);
      const netRequirement = Math.max(reorderPoint + safetyStock - availableStock, 0);
      const plannedQty = this.roundUpToLotSize(netRequirement, lotSize);

      this.mrpRows.push({
        rowId: `rop-${planningData.id}`,
        productId: planningData.productId,
        productName: productLabel,
        demandQty: reorderPoint,
        availableStock,
        safetyStock,
        lotSize,
        netRequirement,
        plannedQty,
        status: availableStock === 0 ? 'Shortage' : 'PartialStock',
        planningData,
        demand: undefined,
      });
    }
  }

  private async getAvailableStock(productId: string): Promise<number> {
    try {
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
    } catch {
      return 0;
    }
  }

  private normalizeItemLabel(code: string | null | undefined, name: string | null | undefined, fallback: string): string {
    const normalizedCode = code?.trim() ?? '';
    const normalizedName = name?.trim() ?? '';

    if (normalizedCode && normalizedName) {
      return `${normalizedCode} - ${normalizedName}`;
    }

    if (normalizedCode) {
      return normalizedCode;
    }

    if (normalizedName) {
      return normalizedName;
    }

    return fallback;
  }

  private async preloadProductLabels(productIds: string[]) {
    const uniqueIds = [...new Set(productIds.filter(Boolean))].filter((id) => !this.productLabelsById[id]);
    if (uniqueIds.length === 0) return;

    await Promise.all(
      uniqueIds.map(async (productId) => {
        try {
          const response = await firstValueFrom(
            this.http.get<ApiResponse<InventoryItemDto>>(`${BASE_URL}/api/Item/${productId}`, {
              headers: this.auth.getAuthHeaders(),
            }),
          );

          const item = response.data;
          this.productLabelsById[productId] = item
            ? this.normalizeItemLabel(item.code, item.name, productId)
            : productId;
        } catch {
          this.productLabelsById[productId] = productId;
        }
      }),
    );
  }

  private async resolveProductId(productInput: string): Promise<string> {
    const normalizedInput = (productInput ?? '').trim();
    if (!normalizedInput) {
      throw new Error('Product ID is required.');
    }

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedInput)) {
      return normalizedInput;
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/active`, {
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
      throw new Error(`Unknown product "${normalizedInput}".`);
    }

    return match.id;
  }

  getProductDisplayLabel(productId: string, fallbackName?: string | null): string {
    return this.productLabelsById[productId] ?? this.normalizeItemLabel(null, fallbackName ?? null, productId);
  }

  private checkAlerts() {
    for (const row of this.mrpRows) {
      const label = this.getProductDisplayLabel(row.productId, row.productName);
      if (row.status === 'Shortage') {
        this.alerts.push({
          type: 'warning',
          message: `${label}: Shortage of ${row.netRequirement} units. Planned order: ${row.plannedQty}`,
        });
      }
      if (row.availableStock === 0 && row.demandQty > 0) {
        this.alerts.push({
          type: 'error',
          message: `${label}: No stock available for ${row.demandQty} units of demand`,
        });
      }
    }
  }

  selectMrpRow(row: MrpPlanningRow) {
    this.selectedMrpRow = this.selectedMrpRow?.rowId === row.rowId ? null : row;
    this.cdr.detectChanges();
  }

  async runMrpBatch() {
    const shortageRows = this.mrpRows.filter((x) => x.netRequirement > 0);

    if (shortageRows.length === 0) {
      this.alerts.push({
        type: 'info',
        message: 'No shortages to process. All demands are fulfilled from stock.',
      });
      this.cdr.detectChanges();
      return;
    }

    this.runningMrp = true;
    const successCount = { count: 0 };

    for (const row of shortageRows) {
      if (row.plannedQty <= 0) continue;

      try {
        await firstValueFrom(
          this.workflowService.runScenario({
            salesOrder: {
              productId: row.productId,
              quantity: row.plannedQty,
              dueDate: row.demand?.dueDate ?? '',
              sourceType: row.demand?.sourceType ?? 'MRP',
              referenceId: row.demand?.id,
              unit: row.demand?.unit ?? 'EA',
            },
            demandPolicy: 'ShortageOnly',
            runMrp: true,
            releaseOrder: false,
            closeOrder: false,
          }),
        );
        successCount.count++;
      } catch (err) {
        this.alerts.push({
          type: 'error',
          message: `Failed to create planned order for ${row.productName}`,
        });
      }
    }

    this.runningMrp = false;
    this.alerts.push({
      type: 'info',
      message: `MRP batch completed: ${successCount.count} of ${shortageRows.length} planned orders created`,
    });
    await this.loadMrpData();
  }

  async createPlannedOrder(row: MrpPlanningRow) {
    if (row.plannedQty <= 0) {
      this.error = 'Planned quantity is zero — nothing to order';
      this.cdr.detectChanges();
      return;
    }

    this.runningPlannedOrder = true;
    try {
      const productId = await this.resolveProductId(row.productId || row.demand?.productId || row.productName);

      let requiredDate: string;
      if (row.demand?.dueDate) {
        requiredDate = row.demand.dueDate.substring(0, 10);
      } else {
        const leadDays = Math.max(1, row.planningData?.leadTimeDays ?? 7);
        const d = new Date();
        d.setDate(d.getDate() + leadDays);
        requiredDate = d.toISOString().substring(0, 10);
      }

      const attempts: PlannedOrderCreateAttempt[] = [
        {
          payload: {
            productId,
            plannedQty: row.plannedQty,
            requiredDate,
            sourceType: 'MRP',
            notes: `Auto-created from MRP demand ${row.demand?.id ?? ''}`.trim(),
          },
        },
        {
          payload: {
            productId,
            plannedQty: row.plannedQty,
            requiredDate,
            sourceType: 'SalesOrder',
            notes: null,
          },
        },
        {
          payload: {
            productId,
            plannedQty: row.plannedQty,
            requiredDate,
            sourceType: null,
            notes: null,
          },
        },
        {
          payload: {
            productId,
            plannedQty: row.plannedQty,
            requiredDate,
            sourceType: 'MRP',
            notes: null,
            status: 'Planned',
          },
        },
      ];

      let created = false;
      for (const attempt of attempts) {
        try {
          const res = await firstValueFrom(this.plannedOrderService.create(attempt.payload as any));
          if (res.success) {
            created = true;
            break;
          }
        } catch {
          // Try next payload variant.
        }
      }

      if (!created) {
        throw new Error('Unable to create planned order with supported payload variants.');
      }

      // Remove row from local array
      this.mrpRows = this.mrpRows.filter(r => r.rowId !== row.rowId);
      this.mrpTotalPages = Math.max(1, Math.ceil(this.mrpRows.length / this.mrpPageSize));
      if (this.mrpPage > this.mrpTotalPages) this.mrpPage = this.mrpTotalPages;

      // Clear selection if this was the selected row
      if (this.selectedMrpRow?.rowId === row.rowId) {
        this.selectedMrpRow = null;
      }

      // Show success message with guidance
      this.alerts.push({
        type: 'info',
        message: `✓ Planned order created successfully for ${row.productName}: ${row.plannedQty} units. View it in the Planned Orders page.`,
      });

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        this.alerts = this.alerts.filter(a => a !== this.alerts[this.alerts.length - 1]);
        this.cdr.detectChanges();
      }, 5000);
    } catch {
      this.error = `Failed to create planned order for ${row.productName}. Please try again or create it from the Planned Orders page.`;
      this.alerts.push({ type: 'error', message: this.error });
    } finally {
      this.runningPlannedOrder = false;
      this.cdr.detectChanges();
    }
  }

  private roundUpToLotSize(value: number, lotSize: number): number {
    if (value <= 0) return 0;
    const size = lotSize > 0 ? lotSize : 1;
    return Math.ceil(value / size) * size;
  }

  // ===== Demands Tab Methods =====
  switchTab(tab: 'parameters' | 'mrp-planning' | 'demands') {
    this.activeTab = tab;
    if (tab === 'mrp-planning') {
      this.loadMrpData();
    } else if (tab === 'demands') {
      this.loadDemandsTab();
    } else {
      this.loadParameters();
    }
    this.cdr.detectChanges();
  }

  async loadDemandsTab() {
    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<DemandDto[]>>(this.demandsUrl, {
          headers: this.auth.getAuthHeaders(),
        }),
      );
      this.demands = res.data ?? [];
      this.demandPage = 1;
      this.demandTotalPages = Math.max(1, Math.ceil(this.demands.length / this.demandPageSize));
    } catch (err) {
      this.error = 'Failed to load demands';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ===== Parameters Tab CRUD Methods =====
  openCreate() {
    this.editing = null;
    this.reset();
    this.showForm = true;
  }

  openEdit(item: MaterialPlanningDataDto) {
    this.editing = item;
    this.productDisplayText = item.productName ?? '';
    this.formProductId = item.productId ?? '';
    this.formProductName = item.productName ?? '';
    this.formSafetyStock = item.safetyStock ?? 0;
    this.formReorderPoint = item.reorderPoint ?? 0;
    this.formMaxStockLevel = item.maximumStockLevel ?? 0;
    this.formLotSize = item.lotSize ?? 0;
    this.formLeadTimeDays = item.leadTimeDays ?? 0;
    this.formPlanningHorizonDays = item.planningHorizonDays ?? 0;
    this.formScrapPercentage = item.scrapPercentage ?? 0;
    this.formProcurementType = item.procurementType ?? '';
    this.formMrpType = item.mrpType ?? '';
    this.formNotes = item.notes ?? '';
    this.formIsActive = item.isActive ?? true;
    this.showForm = true;
  }

  reset() {
    this.productDisplayText = '';
    this.formProductId = '';
    this.formProductName = '';
    this.formSafetyStock = 0;
    this.formReorderPoint = 0;
    this.formMaxStockLevel = 0;
    this.formLotSize = 0;
    this.formLeadTimeDays = 0;
    this.formPlanningHorizonDays = 0;
    this.formScrapPercentage = 0;
    this.formProcurementType = 'Make';
    this.formMrpType = 'MRP';
    this.formNotes = '';
    this.formIsActive = true;
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.reset();
  }

  onProductSelected(item: ProductPickerItem) {
    this.formProductId = item.id;
    this.formProductName = item.name ?? '';
    this.productDisplayText = [item.code, item.name].filter(Boolean).join(' - ');
    this.error = '';
    this.cdr.detectChanges();
  }

  save() {
    if (!this.formProductId.trim()) {
      this.error = 'Please select a product.';
      this.cdr.detectChanges();
      return;
    }

    if (this.editing) {
      const dto: UpdateMaterialPlanningDataDto = {
        safetyStock: this.formSafetyStock,
        reorderPoint: this.formReorderPoint,
        maximumStockLevel: this.formMaxStockLevel,
        lotSize: this.formLotSize,
        leadTimeDays: this.formLeadTimeDays,
        planningHorizonDays: this.formPlanningHorizonDays,
        scrapPercentage: this.formScrapPercentage,
        procurementType: this.formProcurementType || null,
        mrpType: this.formMrpType || null,
        notes: this.formNotes || null,
        isActive: this.formIsActive,
      };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.loadParameters();
        },
        error: () => {
          this.error = 'Failed to update';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreateMaterialPlanningDataDto = {
        productId: this.formProductId,
        safetyStock: this.formSafetyStock,
        reorderPoint: this.formReorderPoint,
        maximumStockLevel: this.formMaxStockLevel,
        lotSize: this.formLotSize,
        leadTimeDays: this.formLeadTimeDays,
        planningHorizonDays: this.formPlanningHorizonDays,
        scrapPercentage: this.formScrapPercentage,
        procurementType: this.formProcurementType || null,
        mrpType: this.formMrpType || null,
        notes: this.formNotes || null,
      };
      this.svc.create(dto).subscribe({
        next: (res) => {
          this.justCreated = res.data ?? null;
          this.showForm = false;
          this.loadParameters();
        },
        error: () => {
          this.error = 'Failed to create';
          this.cdr.detectChanges();
        },
      });
    }
  }

  delete(item: MaterialPlanningDataDto) {
    if (confirm(`Delete material planning for "${item.productName}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.loadParameters(),
        error: () => {
          this.error = 'Failed to delete';
          this.cdr.detectChanges();
        },
      });
    }
  }
}

