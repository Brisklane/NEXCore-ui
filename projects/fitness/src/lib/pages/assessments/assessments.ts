import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AssessmentService, MemberService } from '../../services/fitness.services';
import {
  AssessmentDto, AssessmentTemplateDto, MemberSummaryDto,
  ProgressSeriesDto, RecordMeasureValueDto,
} from '../../models/fitness.models';
import { MeasureDirection } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Body composition, measurements and progress over time.
 *
 * Everything on this screen is special-category health data. Opening it is recorded against the
 * person who opened it, it never leaves in an ordinary export, and a progress photo cannot be
 * stored or shown without the member's recorded consent. The notice at the top is not decoration:
 * staff should know what they are looking at before they look at it.
 *
 * A trainer enters only what they measured. BMI, fat mass, lean mass and waist–hip ratio are
 * worked out from those, and every value comes back with the change since last time and whether
 * that change went the right way — which is what the conversation is actually about.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-assessments',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './assessments.html',
  styleUrls: ['../fitness-shared.css', './assessments.css'],
})
export class AssessmentsComponent {
  private assessments = inject(AssessmentService);
  private members = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: AssessmentDto[] = [];
  templates: AssessmentTemplateDto[] = [];
  progress: ProgressSeriesDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'recent' | 'progress' = 'recent';

  /** Whose progress is on show. */
  member: MemberSummaryDto | null = null;
  memberSearch = '';
  memberResults: MemberSummaryDto[] = [];

  /** Recording. */
  recording = false;
  templateId: string | null = null;
  values: Record<string, number | null> = {};
  assessmentNote = '';
  saving = false;

  /** Reading one. */
  open: AssessmentDto | null = null;

  readonly MeasureDirection = MeasureDirection;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;

    const memberId = this.route.snapshot.queryParamMap.get('memberId');
    if (memberId) {
      const res = await firstValueFrom(this.members.getById(memberId)).catch(() => null);
      if (res?.data) {
        this.member = {
          id: res.data.id,
          fullName: res.data.fullName,
          preferredName: res.data.preferredName,
          memberNumber: res.data.memberNumber,
        } as MemberSummaryDto;
      }
    }

    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [rows, templates] = await Promise.all([
      firstValueFrom(this.assessments.list({
        clubId: this.clubId ?? undefined,
        memberId: this.member?.id ?? undefined,
        size: 40,
      })).catch(() => null),
      firstValueFrom(this.assessments.getTemplates(this.clubId ?? undefined)).catch(() => null),
    ]);

    this.rows = rows?.data ?? [];
    this.templates = templates?.data ?? [];
    if (!this.templateId) this.templateId = this.templates[0]?.id ?? null;

    if (this.member) {
      const p = await firstValueFrom(this.assessments.getProgress(this.member.id)).catch(() => null);
      this.progress = p?.data ?? [];
    } else {
      this.progress = [];
    }

    if (!rows) this.error = 'Could not load assessments.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Member ─────────────────────────────────────────────────────────────

  onMemberSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.memberSearch.trim().length < 2) { this.memberResults = []; return; }

    this.searchTimer = setTimeout(async () => {
      const res = await firstValueFrom(this.members.search({
        query: this.memberSearch.trim(),
        clubId: this.clubId,
        includeInactive: false,
        limit: 6,
      })).catch(() => null);

      this.memberResults = res?.data ?? [];
      this.cdr.detectChanges();
    }, 240);
  }

  async chooseMember(m: MemberSummaryDto): Promise<void> {
    this.member = m;
    this.memberSearch = '';
    this.memberResults = [];
    await this.load();
  }

  async clearMember(): Promise<void> {
    this.member = null;
    this.tab = 'recent';
    await this.load();
  }

  // ── Recording ──────────────────────────────────────────────────────────

  startRecord(): void {
    this.recording = true;
    this.values = {};
    this.assessmentNote = '';
  }

  get chosenTemplate(): AssessmentTemplateDto | null {
    return this.templates.find(t => t.id === this.templateId) ?? null;
  }

  /** Only the measures a person actually takes — the calculated ones are worked out server-side. */
  get enterableMeasures() {
    return (this.chosenTemplate?.measures ?? []).filter(m => !m.isCalculated);
  }

  async saveAssessment(): Promise<void> {
    if (!this.member || !this.templateId || !this.clubId) return;

    const byId = new Map(this.enterableMeasures.map(m => [m.id, m]));

    const measures: RecordMeasureValueDto[] = Object.entries(this.values)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([measureId, v]) => ({
        assessmentMeasureId: measureId,
        measureName: byId.get(measureId)?.name ?? '',
        numericValue: v as number,
        unit: byId.get(measureId)?.unit ?? null,
      } as RecordMeasureValueDto));

    if (measures.length === 0) {
      this.error = 'Enter at least one measurement.';
      return;
    }

    this.saving = true;
    const res = await firstValueFrom(this.assessments.record({
      memberId: this.member.id,
      clubId: this.clubId,
      assessmentTemplateId: this.templateId,
      performedOn: new Date().toISOString(),
      values: measures,
      recommendations: this.assessmentNote.trim() || null,
      sharedWithMember: true,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = 'Assessment recorded.';
      this.recording = false;
      await this.load();
    } else {
      this.error = 'Could not save that assessment.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  /**
   * Whether a change went the right way.
   *
   * Direction is per measure, not global: weight going down is progress for one member and a
   * problem for another, which is why the server records what each measure is aiming at.
   */
  changeClass(direction: MeasureDirection, change: number | null | undefined): string {
    if (change == null || change === 0) return '';

    switch (direction) {
      case MeasureDirection.HigherIsBetter: return change > 0 ? 'is-better' : 'is-worse';
      case MeasureDirection.LowerIsBetter: return change < 0 ? 'is-better' : 'is-worse';
      default: return '';
    }
  }

  changeText(change: number | null | undefined, unit: string | null | undefined): string {
    if (change == null || change === 0) return 'no change';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}${unit ? ' ' + unit : ''}`;
  }

  /** Point height for the little progress spark, as a percentage of the series range. */
  pointHeight(series: ProgressSeriesDto, value: number): number {
    const values = series.points.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return 50;
    return Math.round(((value - min) / (max - min)) * 100);
  }
}
