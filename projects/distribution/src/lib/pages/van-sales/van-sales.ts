import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DistributionAdminService, VanService } from '../../services/distribution.services';
import {
  PaginationMetadata, ReasonCodeDto, VanCycleCountDto, VanCycleCountLineDto, VanLoadLineDto,
  VanLoadSheetDto, VanStockBalanceDto, VanStockMovementDto, VanStockSummaryDto, VanUnitDto,
} from '../../models/distribution.models';
import {
  COMPARTMENT_LABELS, COMPARTMENT_TONE, LOAD_STATUS_LABELS, LOAD_STATUS_TONE,
  MOVEMENT_LABELS, ReasonSurface, VanCompartment, VanLoadStatus,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

type Tab = 'stock' | 'loads' | 'movements' | 'counts';

/**
 * Vans as moving warehouses.
 *
 * The balance shown here is a projection of an append-only movement ledger, not a stored number,
 * which is why the movements tab exists: any figure a rep disputes at settlement can be walked
 * back to the transactions that produced it. A van stock system where the balance is authoritative
 * and the movements are a log invites exactly the argument it cannot settle.
 *
 * Compartments are part of the key. Chilled and ambient stock on the same van are separate
 * balances, because a cold-chain break affects one and not the other.
 */
@Component({
  standalone: true,
  selector: 'lib-van-sales',
  imports: [
    CommonModule, FormsModule, PageHelpComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './van-sales.html',
  styleUrls: ['../distribution-shared.css', './van-sales.css'],
})
export class VanSalesComponent implements OnInit {
  private vans = inject(VanService);
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'stock';

  vanList: VanUnitDto[] = [];
  selectedVanId = '';
  stock: VanStockSummaryDto | null = null;
  loads: VanLoadSheetDto[] = [];
  movements: VanStockMovementDto[] = [];
  counts: VanCycleCountDto[] = [];
  openLoad: VanLoadSheetDto | null = null;
  openCount: VanCycleCountDto | null = null;
  varianceReasons: ReasonCodeDto[] = [];

  meta: PaginationMetadata | null = null;
  loading = true;
  busy = false;
  error = '';
  notice = '';

  page = 1;
  pageSize = 50;
  compartmentFilter = '' as '' | number;

  // Confirming a load
  confirmQuantities = new Map<string, { loadedQuantity: number; varianceReason: string }>();

  // Counting
  showStartCount = false;
  startCount = { isFullCount: true, isBlind: true };
  countEntries = new Map<string, { countedQuantity: number; reasonCodeId: string; reasonNote: string }>();

  readonly compartmentLabels = COMPARTMENT_LABELS;
  readonly compartmentTone = COMPARTMENT_TONE;
  readonly loadStatusLabels = LOAD_STATUS_LABELS;
  readonly loadStatusTone = LOAD_STATUS_TONE;
  readonly movementLabels = MOVEMENT_LABELS;
  readonly VanLoadStatus = VanLoadStatus;
  readonly VanCompartment = VanCompartment;

  async ngOnInit(): Promise<void> {
    const [vansRes, reasonsRes] = await Promise.all([
      firstValueFrom(this.vans.list({ pageSize: 200 })).catch(() => null),
      firstValueFrom(this.admin.reasons({ surface: ReasonSurface.StockVariance })).catch(() => null),
    ]);

    this.vanList = vansRes?.data ?? [];
    this.varianceReasons = reasonsRes?.data ?? [];
    this.selectedVanId = this.vanList[0]?.id ?? '';

    await this.load();
  }

  get selectedVan(): VanUnitDto | undefined {
    return this.vanList.find(v => v.id === this.selectedVanId);
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    await this.load();
  }

  async onVanChange(): Promise<void> {
    this.openLoad = null;
    this.openCount = null;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.selectedVanId) { this.loading = false; return; }

    this.loading = true;
    this.cdr.detectChanges();

    if (this.tab === 'stock') {
      const res = await firstValueFrom(this.vans.stock(
        this.selectedVanId,
        this.compartmentFilter ? Number(this.compartmentFilter) : undefined,
      )).catch(() => null);
      this.stock = res?.data ?? null;
      this.meta = null;
      if (!res) this.error = 'Could not load the van stock.';
    } else if (this.tab === 'loads') {
      const res = await firstValueFrom(this.vans.loads({
        vanUnitId: this.selectedVanId, page: this.page, pageSize: 25,
      })).catch(() => null);
      this.loads = res?.data ?? [];
      this.meta = res?.pagination ?? null;
    } else if (this.tab === 'movements') {
      const res = await firstValueFrom(this.vans.movements(this.selectedVanId, {
        page: this.page, pageSize: this.pageSize,
      })).catch(() => null);
      this.movements = res?.data ?? [];
      this.meta = res?.pagination ?? null;
    } else {
      // Counts come back on the loads endpoint's sibling; fetched one at a time on open.
      this.meta = null;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Loads ──────────────────────────────────────────────────────────────────

  async openLoadSheet(load: VanLoadSheetDto): Promise<void> {
    const res = await firstValueFrom(this.vans.load(load.id)).catch(() => null);
    this.openLoad = res?.data ?? load;

    this.confirmQuantities.clear();
    for (const line of this.openLoad.lines) {
      this.confirmQuantities.set(line.id, {
        loadedQuantity: line.loadedQuantity || line.approvedQuantity || line.requestedQuantity,
        varianceReason: line.varianceReason ?? '',
      });
    }

    this.cdr.detectChanges();
  }

  confirmFor(line: VanLoadLineDto) {
    return this.confirmQuantities.get(line.id)
      ?? { loadedQuantity: line.approvedQuantity, varianceReason: '' };
  }

  setLoaded(line: VanLoadLineDto, value: number): void {
    const c = this.confirmFor(line);
    this.confirmQuantities.set(line.id, { ...c, loadedQuantity: Math.max(0, Number(value) || 0) });
  }

  setLoadVarianceReason(line: VanLoadLineDto, value: string): void {
    const c = this.confirmFor(line);
    this.confirmQuantities.set(line.id, { ...c, varianceReason: value });
  }

  loadHasVariance(line: VanLoadLineDto): boolean {
    return this.confirmFor(line).loadedQuantity !== line.approvedQuantity;
  }

  get loadVarianceCount(): number {
    return (this.openLoad?.lines ?? []).filter(l => this.loadHasVariance(l)).length;
  }

  get loadMissingReasons(): number {
    return (this.openLoad?.lines ?? [])
      .filter(l => this.loadHasVariance(l) && !this.confirmFor(l).varianceReason.trim())
      .length;
  }

  async approveLoad(isApproved: boolean): Promise<void> {
    if (!this.openLoad || this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.vans.approveLoad(
      this.openLoad.id, isApproved, isApproved ? undefined : 'Rejected from the van sales screen',
    )).catch(() => null);

    if (res?.data) { this.openLoad = res.data; await this.load(); }
    else this.error = 'That decision could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async confirmLoad(): Promise<void> {
    if (!this.openLoad || this.busy) return;
    if (this.loadMissingReasons > 0) {
      this.error = `${this.loadMissingReasons} lines differ from what was approved and need a reason.`;
      this.cdr.detectChanges();
      return;
    }

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.vans.confirmLoad({
      loadSheetId: this.openLoad.id,
      lines: this.openLoad.lines.map(l => {
        const c = this.confirmFor(l);
        return {
          lineId: l.id,
          loadedQuantity: c.loadedQuantity,
          varianceReason: c.varianceReason || undefined,
        };
      }),
    })).catch(() => null);

    if (res?.data) {
      this.openLoad = res.data;
      this.notice = 'Load confirmed. The stock is on the van and off the warehouse.';
      await this.load();
    } else {
      this.error = 'The load could not be confirmed.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Counts ─────────────────────────────────────────────────────────────────

  async beginCount(): Promise<void> {
    if (!this.selectedVanId || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.vans.startCount({
      vanUnitId: this.selectedVanId,
      isFullCount: this.startCount.isFullCount,
      isBlind: this.startCount.isBlind,
    })).catch(() => null);

    if (res?.data) {
      this.openCount = res.data;
      this.countEntries.clear();
      for (const line of res.data.lines) {
        this.countEntries.set(line.id, {
          countedQuantity: res.data.isBlind ? 0 : line.expectedQuantity,
          reasonCodeId: '',
          reasonNote: '',
        });
      }
      this.showStartCount = false;
      this.tab = 'counts';
    } else {
      this.error = 'The count could not be started.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  countFor(line: VanCycleCountLineDto) {
    return this.countEntries.get(line.id) ?? { countedQuantity: 0, reasonCodeId: '', reasonNote: '' };
  }

  setCounted(line: VanCycleCountLineDto, value: number): void {
    const c = this.countFor(line);
    this.countEntries.set(line.id, { ...c, countedQuantity: Math.max(0, Number(value) || 0) });
  }

  setCountReason(line: VanCycleCountLineDto, value: string): void {
    const c = this.countFor(line);
    this.countEntries.set(line.id, { ...c, reasonCodeId: value });
  }

  countVariance(line: VanCycleCountLineDto): number {
    return this.countFor(line).countedQuantity - line.expectedQuantity;
  }

  get countMissingReasons(): number {
    return (this.openCount?.lines ?? [])
      .filter(l => this.countVariance(l) !== 0 && !this.countFor(l).reasonCodeId)
      .length;
  }

  get countVarianceValue(): number {
    return (this.openCount?.lines ?? [])
      .reduce((sum, l) => sum + this.countVariance(l) * l.unitCost, 0);
  }

  async submitCount(): Promise<void> {
    if (!this.openCount || this.busy) return;
    if (this.countMissingReasons > 0) {
      this.error = `${this.countMissingReasons} lines differ from expected and need a reason before the count can be submitted.`;
      this.cdr.detectChanges();
      return;
    }

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.vans.submitCount({
      countId: this.openCount.id,
      lines: this.openCount.lines.map(l => {
        const c = this.countFor(l);
        return {
          lineId: l.id,
          countedQuantity: c.countedQuantity,
          reasonCodeId: c.reasonCodeId || undefined,
          reasonNote: c.reasonNote || undefined,
        };
      }),
    })).catch(() => null);

    if (res?.data) {
      this.openCount = res.data;
      this.notice = 'Count submitted. It needs approving before the adjustments post.';
      await this.load();
    } else {
      this.error = 'The count could not be submitted.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async approveCount(): Promise<void> {
    if (!this.openCount || this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.vans.approveCount(this.openCount.id)).catch(() => null);
    if (res?.data) {
      this.openCount = res.data;
      this.notice = 'Count approved. Adjustments have posted to the van ledger.';
      await this.load();
    } else {
      this.error = 'The count could not be approved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get balances(): VanStockBalanceDto[] {
    return this.stock?.balances ?? [];
  }

  expiryTone(b: VanStockBalanceDto): string {
    if (b.daysToExpiry == null) return '';
    if (b.daysToExpiry < 0) return 'is-expired';
    return b.daysToExpiry < 30 ? 'is-expiring' : '';
  }

  movementSign(m: VanStockMovementDto): string {
    return m.quantity > 0 ? 'is-in' : m.quantity < 0 ? 'is-out' : '';
  }

  trackBalance = (_: number, b: VanStockBalanceDto) => b.id;
  trackLoad = (_: number, l: VanLoadSheetDto) => l.id;
  trackLoadLine = (_: number, l: VanLoadLineDto) => l.id;
  trackMovement = (_: number, m: VanStockMovementDto) => m.id;
  trackCountLine = (_: number, l: VanCycleCountLineDto) => l.id;
}
