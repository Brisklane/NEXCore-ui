import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CollectionsService } from '../../services/fitness.services';
import { ArrearsReportDto, DunningCaseDto } from '../../models/fitness.models';
import {
  DunningCaseStatus, DUNNING_CASE_STATUS_LABELS,
  PAYMENT_FAILURE_REASON_LABELS,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Arrears, and the ladder chasing them.
 *
 * The failure-reason breakdown is the most useful thing on this page and the reason it is shown
 * before the case list: most failures are an expired card rather than a refusal to pay, and the
 * response to those two is completely different. A club that treats every failure as a debt
 * problem burns goodwill it did not need to spend.
 *
 * A promise to pay pauses the ladder until the promised date. Chasing somebody who has already
 * told you when they will pay is how a recoverable account becomes a cancellation.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-collections',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './collections.html',
  styleUrls: ['../fitness-shared.css', './collections.css'],
})
export class CollectionsComponent {
  private collections = inject(CollectionsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  arrears: ArrearsReportDto | null = null;
  cases: DunningCaseDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'arrears' | 'cases' = 'arrears';
  status: DunningCaseStatus | null = null;

  /** Case action dialog. */
  acting: DunningCaseDto | null = null;
  action = 'retry';
  actionNote = '';
  promiseDate = '';
  saving = false;

  readonly statusLabels = DUNNING_CASE_STATUS_LABELS;
  readonly failureLabels = PAYMENT_FAILURE_REASON_LABELS;
  readonly DunningCaseStatus = DunningCaseStatus;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [arrears, cases] = await Promise.all([
      firstValueFrom(this.collections.getArrears(this.clubId ?? undefined)).catch(() => null),
      firstValueFrom(this.collections.listCases({
        clubId: this.clubId ?? undefined,
        status: this.status ?? undefined,
        size: 50,
      })).catch(() => null),
    ]);

    this.arrears = arrears?.data ?? null;
    this.cases = cases?.data ?? [];

    if (!arrears?.data) this.error = 'Could not load arrears.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Actions ────────────────────────────────────────────────────────────

  startAction(c: DunningCaseDto, action: string): void {
    this.acting = c;
    this.action = action;
    this.actionNote = '';
    this.promiseDate = '';
  }

  async confirmAction(): Promise<void> {
    if (!this.acting) return;

    this.saving = true;
    const res = await firstValueFrom(this.collections.action({
      dunningCaseId: this.acting.id,
      action: this.action,
      note: this.actionNote.trim() || null,
      promiseToPayOn: this.action === 'promise' && this.promiseDate
        ? new Date(this.promiseDate).toISOString()
        : null,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = this.actionMessage();
      this.acting = null;
      await this.load();
    } else {
      this.error = 'Could not do that.';
    }

    this.cdr.detectChanges();
  }

  private actionMessage(): string {
    switch (this.action) {
      case 'retry': return 'Retried. The result will show on the case within a few minutes.';
      case 'pause': return 'Chasing paused.';
      case 'resume': return 'Chasing resumed.';
      case 'promise': return 'Promise to pay recorded — chasing is paused until then.';
      case 'writeoff': return 'Written off.';
      default: return 'Done.';
    }
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  /** Ageing bands, in the order an accountant reads them. */
  get bands() {
    const a = this.arrears;
    if (!a) return [];
    return [
      { label: 'Not yet due', amount: a.current, tone: '' },
      { label: '1–30 days', amount: a.days1To30, tone: 'is-warn' },
      { label: '31–60 days', amount: a.days31To60, tone: 'is-warn' },
      { label: '61–90 days', amount: a.days61To90, tone: 'is-bad' },
      { label: 'Over 90 days', amount: a.over90Days, tone: 'is-bad' },
    ];
  }

  bandPercent(amount: number): number {
    const total = this.arrears?.totalOutstanding ?? 0;
    return total === 0 ? 0 : Math.round((amount / total) * 100);
  }

  caseClass(c: DunningCaseDto): string {
    if (c.accessSuspended) return 'is-alert';
    if (c.isPaused) return '';
    if (c.daysOpen > 30) return 'is-warn';
    return '';
  }

  actionTitle(): string {
    switch (this.action) {
      case 'retry': return 'Try the payment again';
      case 'pause': return 'Pause chasing';
      case 'resume': return 'Resume chasing';
      case 'promise': return 'Record a promise to pay';
      case 'writeoff': return 'Write this off';
      default: return 'Action';
    }
  }
}
