import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingService } from '../../services/fitness.services';
import { BillingRunDto, BillingRunLineDto } from '../../models/fitness.models';
import { BillingRunStatus, BILLING_RUN_STATUS_LABELS } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Billing runs — collecting the month's dues.
 *
 * Preview is the default and the real run is the deliberate second step, because a billing run is
 * the single most consequential button in this product: get it wrong and two thousand people are
 * charged the wrong amount on the same morning. The preview shows exactly what would happen, to
 * whom, and what it totals.
 *
 * A run that dies halfway can be started again without double-billing anybody — the server marks
 * a schedule row billed in the same write as the invoice that billed it.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-billing',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './billing.html',
  styleUrls: ['../fitness-shared.css', './billing.css'],
})
export class BillingComponent {
  private billing = inject(BillingService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  runs: BillingRunDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  /** The run being started or inspected. */
  billingDate = new Date().toISOString().slice(0, 10);
  collectPayments = true;
  running = false;

  preview: BillingRunDto | null = null;
  openRun: BillingRunDto | null = null;
  lines: BillingRunLineDto[] = [];
  outcomeFilter: string | null = null;
  linesLoading = false;

  readonly statusLabels = BILLING_RUN_STATUS_LABELS;
  readonly BillingRunStatus = BillingRunStatus;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    const res = await firstValueFrom(
      this.billing.listRuns({ clubId: this.clubId ?? undefined, size: 20 }),
    ).catch(() => null);

    this.runs = res?.data ?? [];
    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Running ────────────────────────────────────────────────────────────

  async runPreview(): Promise<void> {
    this.running = true;
    this.error = '';

    const res = await firstValueFrom(this.billing.startRun({
      billingDate: new Date(this.billingDate).toISOString(),
      clubId: this.clubId,
      planId: null,
      previewOnly: true,
      collectPayments: false,
    })).catch(() => null);

    this.running = false;

    if (res?.data) this.preview = res.data;
    else this.error = 'Could not run the preview.';

    this.cdr.detectChanges();
  }

  async runForReal(): Promise<void> {
    this.running = true;
    this.error = '';

    const res = await firstValueFrom(this.billing.startRun({
      billingDate: new Date(this.billingDate).toISOString(),
      clubId: this.clubId,
      planId: null,
      previewOnly: false,
      collectPayments: this.collectPayments,
    })).catch(() => null);

    this.running = false;

    if (res?.data) {
      this.preview = null;
      this.notice = `Run ${res.data.runNumber} finished — `
        + `${res.data.invoicesCreated} invoices, `
        + `${res.data.totalCollected.toFixed(2)} collected.`;
      await this.load();
      await this.inspect(res.data);
    } else {
      this.error = 'The billing run did not complete.';
    }

    this.cdr.detectChanges();
  }

  // ── Inspecting ─────────────────────────────────────────────────────────

  async inspect(run: BillingRunDto): Promise<void> {
    this.openRun = run;
    this.outcomeFilter = null;
    await this.loadLines();
  }

  async loadLines(): Promise<void> {
    if (!this.openRun) return;

    this.linesLoading = true;
    const res = await firstValueFrom(this.billing.getRunLines(this.openRun.id, {
      outcome: this.outcomeFilter ?? undefined,
      size: 100,
    })).catch(() => null);

    this.lines = res?.data ?? [];
    this.linesLoading = false;
    this.cdr.detectChanges();
  }

  close(): void {
    this.openRun = null;
    this.lines = [];
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  statusClass(status: BillingRunStatus): string {
    switch (status) {
      case BillingRunStatus.Completed: return 'is-good';
      case BillingRunStatus.CompletedWithErrors: return 'is-warn';
      case BillingRunStatus.Failed: return 'is-alert';
      default: return '';
    }
  }

  collectionClass(percent: number): string {
    if (percent >= 97) return 'is-good';
    if (percent >= 90) return 'is-warn';
    return 'is-bad';
  }

  duration(seconds: number | null | undefined): string {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
}
