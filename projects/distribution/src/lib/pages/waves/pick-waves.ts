import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DistributionAdminService, FulfilmentService } from '../../services/distribution.services';
import {
  PaginationMetadata, PickTaskDto, PickTaskLineDto, PickWaveDto, ReasonCodeDto,
} from '../../models/distribution.models';
import {
  PICK_STATUS_LABELS, PICK_STATUS_TONE, PICK_STRATEGY_LABELS, PickTaskStatus, ReasonSurface,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

/**
 * Pick waves and their tasks.
 *
 * Confirming a pick is the one interaction on this screen that matters, so it is a large target
 * with the quantity pre-filled and the nominated batch shown next to it. Picking a different
 * batch is allowed — the physical shelf beats the system — but it is recorded as a FEFO override
 * with a reason, because that is how stock quietly ages at the back of a rack.
 *
 * A short pick is not an error state to be cleared. It is a fact about the warehouse that needs a
 * reason attached, and it flows straight into the exception queue and the fill-rate number.
 */
@Component({
  standalone: true,
  selector: 'lib-pick-waves',
  imports: [
    CommonModule, FormsModule, PageHelpComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './pick-waves.html',
  styleUrls: ['../distribution-shared.css', './pick-waves.css'],
})
export class PickWavesComponent implements OnInit, OnDestroy {
  private fulfilment = inject(FulfilmentService);
  private admin = inject(DistributionAdminService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  waves: PickWaveDto[] = [];
  meta: PaginationMetadata | null = null;
  selected: PickWaveDto | null = null;
  openTask: PickTaskDto | null = null;
  shortReasons: ReasonCodeDto[] = [];

  loading = true;
  loadingDetail = false;
  busy = false;
  error = '';
  notice = '';

  openOnly = true;
  page = 1;
  pageSize = 25;

  // Pick confirmation
  confirming: PickTaskLineDto | null = null;
  pickQuantity = 0;
  pickBatchId = '';
  overrideReason = '';
  shortReasonId = '';

  readonly statusLabels = PICK_STATUS_LABELS;
  readonly statusTone = PICK_STATUS_TONE;
  readonly strategyLabels = PICK_STRATEGY_LABELS;
  readonly PickTaskStatus = PickTaskStatus;

  private timer?: ReturnType<typeof setInterval>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(
      this.admin.reasons({ surface: ReasonSurface.ShortPick }),
    ).catch(() => null);
    this.shortReasons = res?.data ?? [];

    await this.load();

    // Deep link from the dispatch desk.
    const waveId = this.route.snapshot.queryParamMap.get('waveId');
    if (waveId) await this.select(waveId);

    this.timer = setInterval(() => void this.refreshDetail(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.fulfilment.waves({
      page: this.page,
      pageSize: this.pageSize,
      openOnly: this.openOnly || undefined,
    })).catch(() => null);

    if (res) {
      this.waves = res.data ?? [];
      this.meta = res.pagination ?? null;
      if (!this.selected && this.waves.length) await this.select(this.waves[0].id);
    } else {
      this.error = 'Could not load the waves.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  async select(id: string): Promise<void> {
    this.loadingDetail = true;
    this.openTask = null;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.fulfilment.wave(id)).catch(() => null);
    this.selected = res?.data ?? null;

    this.loadingDetail = false;
    this.cdr.detectChanges();
  }

  /** Silent re-fetch of just the open wave — the list moves far more slowly than the floor. */
  private async refreshDetail(): Promise<void> {
    if (!this.selected || this.confirming) return;

    const res = await firstValueFrom(this.fulfilment.wave(this.selected.id)).catch(() => null);
    if (res?.data) {
      this.selected = res.data;
      if (this.openTask) {
        this.openTask = res.data.tasks.find(t => t.id === this.openTask!.id) ?? null;
      }
    }

    this.cdr.detectChanges();
  }

  // ── Tasks ──────────────────────────────────────────────────────────────────

  async openTaskDetail(task: PickTaskDto): Promise<void> {
    const res = await firstValueFrom(this.fulfilment.task(task.id)).catch(() => null);
    this.openTask = res?.data ?? task;
    this.cdr.detectChanges();
  }

  async startTask(task: PickTaskDto): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.fulfilment.startTask(task.id)).catch(() => null);
    if (res?.data) { this.openTask = res.data; await this.refreshDetail(); }
    else this.error = 'The task could not be started.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async completeTask(task: PickTaskDto): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.fulfilment.completeTask(task.id)).catch(() => null);
    if (res?.data) {
      this.notice = `Task ${task.taskNumber} complete.`;
      this.openTask = null;
      await this.refreshDetail();
    } else {
      this.error = 'The task could not be completed. Every line needs a picked quantity or a short reason.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Picking ────────────────────────────────────────────────────────────────

  startPick(line: PickTaskLineDto): void {
    this.confirming = line;
    this.pickQuantity = line.pickedQuantity || line.requiredQuantity;
    this.pickBatchId = line.pickedBatchId ?? line.nominatedBatchId ?? '';
    this.overrideReason = '';
    this.shortReasonId = '';
  }

  get isShortPick(): boolean {
    return !!this.confirming && this.pickQuantity < this.confirming.requiredQuantity;
  }

  get isBatchOverride(): boolean {
    return !!this.confirming
      && !!this.confirming.nominatedBatchId
      && !!this.pickBatchId
      && this.pickBatchId !== this.confirming.nominatedBatchId;
  }

  async confirmPick(): Promise<void> {
    if (!this.confirming || this.busy) return;
    if (this.isShortPick && !this.shortReasonId) return;
    if (this.isBatchOverride && !this.overrideReason.trim()) return;

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.fulfilment.confirmPick({
      taskLineId: this.confirming.id,
      pickedQuantity: this.pickQuantity,
      pickedBatchId: this.pickBatchId || undefined,
      overrideReason: this.overrideReason || undefined,
      shortReasonCodeId: this.shortReasonId || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.openTask = res.data;
      this.confirming = null;
      await this.refreshDetail();
    } else {
      this.error = 'The pick could not be confirmed.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  waveTone(w: PickWaveDto): string {
    if (w.shortLines > 0) return 'tone-warning';
    return w.progressPercent >= 100 ? 'tone-success' : 'tone-brand';
  }

  lineState(line: PickTaskLineDto): { label: string; tone: string } {
    if (line.isShort) return { label: 'Short', tone: 'bad' };
    if (line.pickedQuantity >= line.requiredQuantity) return { label: 'Picked', tone: 'good' };
    if (line.pickedQuantity > 0) return { label: 'Part picked', tone: 'warn' };
    return { label: 'To pick', tone: 'neutral' };
  }

  /** Days until this batch expires, so a picker can see why FEFO nominated it. */
  daysToExpiry(line: PickTaskLineDto): number | null {
    if (!line.expiryDate) return null;
    const ms = new Date(line.expiryDate).getTime() - Date.now();
    return Math.round(ms / 86_400_000);
  }

  trackWave = (_: number, w: PickWaveDto) => w.id;
  trackTask = (_: number, t: PickTaskDto) => t.id;
  trackLine = (_: number, l: PickTaskLineDto) => l.id;
}
