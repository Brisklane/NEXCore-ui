import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ComplianceService } from '../../services/compliance.service';
import {
  ANSWER_TYPE_LABELS, CHECKLIST_FREQUENCY_LABELS, CHECKPOINT_KIND_LABELS, ChecklistAnswerDto,
  ChecklistAnswerType, ChecklistDto, ComplianceBoardDto, PrepBatchDto, TemperatureCheckpointDto,
  TemperatureLogDto,
} from '../../models/compliance.models';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

type Tab = 'board' | 'temperature' | 'checklists' | 'batches';

/**
 * Food safety records — temperature logs, checklists and prep batches.
 *
 * The rule the whole screen is built around: **a reading outside the safe range cannot be filed
 * without a corrective action, and a failed critical check cannot be signed off.** The server
 * enforces it; this screen makes that obvious rather than surprising, by asking for the action
 * in the same dialog as the reading.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-compliance',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './compliance.html',
  styleUrls: ['../restaurant-shared.css', './compliance.css'],
})
export class ComplianceComponent {
  private api = inject(ComplianceService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'board';
  outletId: string | null = null;

  board: ComplianceBoardDto | null = null;
  logs: TemperatureLogDto[] = [];
  batches: PrepBatchDto[] = [];

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  // Reading dialog
  reading: { checkpoint: TemperatureCheckpointDto; value: number | null; action: string; note: string } | null = null;

  // Checklist run
  running: ChecklistDto | null = null;
  answers: Partial<ChecklistAnswerDto>[] = [];
  runNote = '';
  runAction = '';

  // Breach resolution
  resolving: TemperatureLogDto | null = null;
  resolveAction = '';

  // New batch
  batch: { itemName: string; quantity: number; uom: string; shelfLifeHours: number; storageLocation: string } | null = null;

  readonly kindLabels = CHECKPOINT_KIND_LABELS;
  readonly frequencyLabels = CHECKLIST_FREQUENCY_LABELS;
  readonly answerTypeLabels = ANSWER_TYPE_LABELS;
  readonly AnswerType = ChecklistAnswerType;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    this.loading = true;

    const res = await firstValueFrom(this.api.board(this.outletId)).catch(() => null);
    this.board = res?.data ?? null;

    if (this.tab === 'temperature') await this.loadLogs();
    if (this.tab === 'batches') await this.loadBatches();

    this.loading = false;
    this.cdr.detectChanges();
  }

  async loadLogs(): Promise<void> {
    if (!this.outletId) return;
    const res = await firstValueFrom(this.api.getLogs(this.outletId)).catch(() => null);
    this.logs = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async loadBatches(): Promise<void> {
    if (!this.outletId) return;
    const res = await firstValueFrom(this.api.getBatches(this.outletId, true)).catch(() => null);
    this.batches = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async switchTab(tab: Tab): Promise<void> {
    this.tab = tab;
    if (tab === 'temperature') await this.loadLogs();
    if (tab === 'batches') await this.loadBatches();
  }

  // ── Temperature ────────────────────────────────────────────────────

  startReading(c: TemperatureCheckpointDto): void {
    this.fieldErrors = {};
    this.reading = { checkpoint: c, value: null, action: '', note: '' };
    this.error = '';
  }

  /** True once the typed value falls outside the safe band — the action field appears. */
  get readingOutOfRange(): boolean {
    const r = this.reading;
    if (!r || r.value === null) return false;
    return r.value < r.checkpoint.minSafeCelsius || r.value > r.checkpoint.maxSafeCelsius;
  }

  async saveReading(): Promise<void> {
    const r = this.reading;
    if (!r) return;

    this.fieldErrors = validate(r as unknown as Record<string, unknown>, {
      value: [required('A reading')],
      note: [maxLength(500, 'The note')],
      action: [maxLength(500, 'The action')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.api.recordTemperature({
      checkpointId: r.checkpoint.id,
      readingCelsius: r.value as number, // validate() above rejects a null reading
      correctiveAction: r.action || null,
      note: r.note || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not record the reading.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = this.readingOutOfRange ? 'Reading and corrective action recorded.' : 'Reading recorded.';
      this.reading = null;
      await this.load();
      if (this.tab === 'temperature') await this.loadLogs();
    }

    this.cdr.detectChanges();
  }

  startResolve(log: TemperatureLogDto): void {
    this.fieldErrors = {};
    this.resolving = log;
    this.resolveAction = '';
    this.error = '';
  }

  async saveResolve(): Promise<void> {
    if (!this.resolving) return;
    this.fieldErrors = validate({ resolveAction: this.resolveAction }, {
      resolveAction: [
        required('A description of what was done'),
        minLength(5, 'The description'),
        maxLength(500, 'The description'),
      ],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.api.resolveBreach({
      logId: this.resolving.id,
      correctiveAction: this.resolveAction,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not close the breach.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Breach closed.'; this.resolving = null; await this.load(); }
    this.cdr.detectChanges();
  }

  // ── Checklists ─────────────────────────────────────────────────────

  startRun(c: ChecklistDto): void {
    this.fieldErrors = {};
    this.running = c;
    this.runNote = '';
    this.runAction = '';
    this.answers = c.items.map(i => ({
      checklistItemId: i.id,
      itemText: i.text,
      answerType: i.answerType,
      isCritical: i.isCritical,
      displayOrder: i.displayOrder,
      yesNoValue: null,
      numericValue: null,
      textValue: null,
      correctiveAction: null,
    }));
    this.error = '';
  }

  setAnswer(index: number, value: boolean): void {
    this.answers[index].yesNoValue = value;
  }

  itemFor(answer: Partial<ChecklistAnswerDto>) {
    return this.running?.items.find(i => i.id === answer.checklistItemId);
  }

  /** A failed critical answer with nothing written against it — blocks sign-off. */
  isBlocked(answer: Partial<ChecklistAnswerDto>): boolean {
    const item = this.itemFor(answer);
    if (!item?.isCritical) return false;

    const failed = item.answerType === ChecklistAnswerType.YesNo
      ? answer.yesNoValue === false
      : item.answerType === ChecklistAnswerType.Numeric
        ? answer.numericValue != null
          && ((item.minValue != null && answer.numericValue < item.minValue)
            || (item.maxValue != null && answer.numericValue > item.maxValue))
        : false;

    return failed && !answer.correctiveAction?.trim() && !this.runAction.trim();
  }

  get blockedCount(): number {
    return this.answers.filter(a => this.isBlocked(a)).length;
  }

  get answeredCount(): number {
    return this.answers.filter(a =>
      a.yesNoValue != null || a.numericValue != null || !!a.textValue).length;
  }

  async submitRun(): Promise<void> {
    if (!this.running || !this.outletId) return;

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.api.submitRun({
      checklistId: this.running.id,
      runId: this.running.todayRunId,
      outletId: this.outletId,
      note: this.runNote || null,
      correctiveAction: this.runAction || null,
      answers: this.answers,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not sign this off.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = res.data.hasCriticalFailure
        ? 'Signed off — a critical check failed and is on the record.'
        : 'Checklist signed off.';
      this.running = null;
      await this.load();
    }

    this.cdr.detectChanges();
  }

  // ── Batches ────────────────────────────────────────────────────────

  newBatch(): void {
    this.fieldErrors = {};
    this.batch = { itemName: '', quantity: 1, uom: 'portion', shelfLifeHours: 72, storageLocation: '' };
    this.error = '';
  }

  async saveBatch(): Promise<void> {
    const b = this.batch;
    if (!b || !this.outletId) return;
    this.fieldErrors = validate(b as unknown as Record<string, unknown>, {
      itemName: [required('What was prepped'), maxLength(200, 'The item name')],
      quantity: [required('A quantity'), positive('The quantity')],
      shelfLifeHours: [required('A shelf life'), positive('The shelf life')],
      storageLocation: [maxLength(120, 'The storage location')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.api.createBatch({
      outletId: this.outletId,
      itemName: b.itemName,
      quantity: b.quantity,
      uom: b.uom,
      shelfLifeHours: b.shelfLifeHours,
      storageLocation: b.storageLocation || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not label the batch.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = `Batch ${res.data.batchCode} labelled — use by ${new Date(res.data.useByAt).toLocaleString()}.`;
      this.batch = null;
      await this.loadBatches();
      await this.load();
    }

    this.cdr.detectChanges();
  }

  async discard(b: PrepBatchDto): Promise<void> {
    this.busy = true;
    await firstValueFrom(this.api.discardBatch(b.id, b.isExpired ? 'Past use-by' : 'Discarded'))
      .catch(() => null);

    this.busy = false;
    this.notice = 'Batch discarded and recorded as waste.';
    await this.loadBatches();
    await this.load();
  }

  batchTone(b: PrepBatchDto): string {
    if (b.isExpired) return 'tone-danger';
    if (b.hoursRemaining <= 12) return 'tone-warning';
    return 'tone-success';
  }

  trackCheckpoint = (_: number, c: TemperatureCheckpointDto) => c.id;
  trackChecklist = (_: number, c: ChecklistDto) => c.id;
  trackLog = (_: number, l: TemperatureLogDto) => l.id;
  trackBatch = (_: number, b: PrepBatchDto) => b.id;
}
