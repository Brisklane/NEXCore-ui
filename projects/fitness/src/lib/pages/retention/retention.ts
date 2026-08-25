import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RetentionService } from '../../services/fitness.services';
import { ChurnScoreDto, RetentionBoardDto, RetentionTaskDto } from '../../models/fitness.models';
import { ChurnRiskBand, CHURN_RISK_BAND_LABELS } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Who is drifting away, and what to do about it.
 *
 * The score is never shown on its own. Every member on this board arrives with the weighted
 * reasons behind their score, written as sentences, because the number is not what anybody acts
 * on — "hasn't been in for three weeks, and their usual is four times a week" is. A screen that
 * says "72" and nothing else gets ignored within a fortnight.
 *
 * Completing a task asks what actually happened, and that answer goes on the member's timeline.
 * Retention work that leaves no trace gets repeated by the next person.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-retention',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './retention.html',
  styleUrls: ['../fitness-shared.css', './retention.css'],
})
export class RetentionComponent {
  private retention = inject(RetentionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  board: RetentionBoardDto | null = null;
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  band: ChurnRiskBand | null = null;
  tab: 'members' | 'tasks' = 'members';

  /** The member whose reasons are expanded. */
  expandedId: string | null = null;

  /** Task-completion dialog. */
  completing: RetentionTaskDto | null = null;
  outcome = '';
  logOnTimeline = true;
  saving = false;

  /** Rescoring. */
  rescoring = false;

  readonly riskLabels = CHURN_RISK_BAND_LABELS;
  readonly ChurnRiskBand = ChurnRiskBand;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(
      this.retention.getBoard(this.clubId ?? undefined, this.band ?? undefined),
    ).catch(() => null);

    if (!res?.data) this.error = 'Could not load the retention board.';
    else this.board = res.data;

    this.loading = false;
    this.cdr.detectChanges();
  }

  filterBand(band: ChurnRiskBand | null): void {
    this.band = band;
    void this.load();
  }

  toggle(m: ChurnScoreDto): void {
    this.expandedId = this.expandedId === m.id ? null : m.id;
  }

  // ── Tasks ──────────────────────────────────────────────────────────────

  startComplete(task: RetentionTaskDto): void {
    this.completing = task;
    this.outcome = '';
    this.logOnTimeline = true;
  }

  async completeTask(dismiss = false): Promise<void> {
    if (!this.completing) return;

    this.saving = true;
    const res = await firstValueFrom(this.retention.completeTask({
      taskId: this.completing.id,
      outcome: this.outcome.trim() || null,
      logOnMemberTimeline: this.logOnTimeline,
      dismiss,
      dismissReason: dismiss ? this.outcome.trim() || null : null,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.completing = null;
      this.notice = dismiss ? 'Task dismissed.' : 'Task completed.';
      await this.load();
    } else {
      this.error = 'Could not save that.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  bandClass(band: ChurnRiskBand): string {
    switch (band) {
      case ChurnRiskBand.Critical: return 'is-critical';
      case ChurnRiskBand.AtRisk: return 'is-atrisk';
      case ChurnRiskBand.Watch: return 'is-watch';
      default: return 'is-healthy';
    }
  }

  /** The factors that carry the most weight, first. */
  topFactors(m: ChurnScoreDto) {
    return [...m.factors].sort((a, b) => b.weight - a.weight);
  }

  lastVisit(days: number): string {
    if (days === 0) return 'in today';
    if (days === 1) return 'in yesterday';
    return `${days} days since their last visit`;
  }

  /** How their current rate compares with their own normal, not with anyone else's. */
  frequencyNote(m: ChurnScoreDto): string {
    if (m.visitsPerWeekBaseline <= 0) return '';
    const now = m.visitsPerWeekNow.toFixed(1);
    const was = m.visitsPerWeekBaseline.toFixed(1);
    if (m.visitsPerWeekNow >= m.visitsPerWeekBaseline) return `${now} a week, about their usual`;
    return `${now} a week, down from ${was}`;
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
