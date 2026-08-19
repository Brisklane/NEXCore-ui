import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FieldService } from '../../services/distribution.services';
import {
  CompetitorObservationDto, MerchandisingAuditDto, PaginationMetadata, PosmPlacementDto,
  SurveyFormDto, SurveyResponseDto,
} from '../../models/distribution.models';
import {
  AUDIT_KIND_LABELS, QUESTION_KIND_LABELS, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent } from '../shared/ui-bits';

type Tab = 'audits' | 'surveys' | 'competitors' | 'posm';

/**
 * Retail execution: what the shelf actually looks like.
 *
 * The audit score on its own is a vanity number. What changes behaviour is the breakdown —
 * availability, visibility, planogram, pricing, POSM — because "your score is 62" tells a rep
 * nothing while "you are losing 20 points on pricing compliance" is a route plan.
 *
 * Competitor observations are kept alongside rather than in a separate intelligence product,
 * because a rep who has just seen a rival's new pack price is the only person who will ever
 * record it, and they are already on this screen.
 */
@Component({
  standalone: true,
  selector: 'lib-merchandising',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent,
  ],
  templateUrl: './merchandising.html',
  styleUrls: ['../distribution-shared.css', './merchandising.css'],
})
export class MerchandisingComponent implements OnInit {
  private field = inject(FieldService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'audits';

  audits: MerchandisingAuditDto[] = [];
  surveys: SurveyFormDto[] = [];
  responses: SurveyResponseDto[] = [];
  competitors: CompetitorObservationDto[] = [];
  posm: PosmPlacementDto[] = [];
  meta: PaginationMetadata | null = null;

  openAudit: MerchandisingAuditDto | null = null;
  openSurvey: SurveyFormDto | null = null;

  loading = true;
  error = '';

  page = 1;
  pageSize = 25;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';
  kindFilter = '' as '' | number;

  readonly kindOptions = enumOptions(AUDIT_KIND_LABELS);
  readonly kindLabels = AUDIT_KIND_LABELS;
  readonly questionKindLabels = QUESTION_KIND_LABELS;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async onScope(scope: { territoryId: string | null; from: string; to: string }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.fromDate = scope.from;
    this.toDate = scope.to;
    this.page = 1;
    await this.load();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    this.openAudit = null;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const base = {
      page: this.page,
      pageSize: this.pageSize,
      territoryId: this.territoryId || undefined,
      from: this.fromDate || undefined,
      to: this.toDate || undefined,
    };

    if (this.tab === 'audits') {
      const res = await firstValueFrom(this.field.audits({
        ...base, kind: this.kindFilter || undefined,
      })).catch(() => null);
      this.audits = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the audits.';
    } else if (this.tab === 'surveys') {
      const [formsRes, responsesRes] = await Promise.all([
        firstValueFrom(this.field.surveys()).catch(() => null),
        firstValueFrom(this.field.surveyResponses(base)).catch(() => null),
      ]);
      this.surveys = formsRes?.data ?? [];
      this.responses = responsesRes?.data ?? [];
      this.meta = responsesRes?.pagination ?? null;
    } else if (this.tab === 'competitors') {
      const res = await firstValueFrom(this.field.competitors(base)).catch(() => null);
      this.competitors = res?.data ?? [];
      this.meta = res?.pagination ?? null;
    } else {
      const res = await firstValueFrom(this.field.posm({
        territoryId: this.territoryId || undefined,
      })).catch(() => null);
      this.posm = res?.data ?? [];
      this.meta = null;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  async openAuditDetail(a: MerchandisingAuditDto): Promise<void> {
    const res = await firstValueFrom(this.field.audit(a.id)).catch(() => null);
    this.openAudit = res?.data ?? a;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  scoreTone(score: number, max = 100): string {
    const pct = max > 0 ? (score / max) * 100 : 0;
    if (pct >= 80) return 'good';
    return pct >= 55 ? 'warn' : 'bad';
  }

  /** The breakdown is what a rep can act on; the headline score is not. */
  breakdown(a: MerchandisingAuditDto): { label: string; value: number }[] {
    return [
      { label: 'Availability', value: a.availabilityScore },
      { label: 'Visibility', value: a.visibilityScore },
      { label: 'Planogram', value: a.planogramScore },
      { label: 'Pricing', value: a.pricingScore },
      { label: 'POSM', value: a.posmScore },
    ];
  }

  get averageScore(): number {
    if (this.audits.length === 0) return 0;
    return this.audits.reduce((sum, a) => sum + a.score, 0) / this.audits.length;
  }

  get averageShelfShare(): number {
    if (this.audits.length === 0) return 0;
    return this.audits.reduce((sum, a) => sum + a.shareOfShelfPercent, 0) / this.audits.length;
  }

  get averageAvailability(): number {
    if (this.audits.length === 0) return 0;
    return this.audits.reduce((sum, a) => sum + a.onShelfAvailabilityPercent, 0) / this.audits.length;
  }

  get expiredPosmCount(): number {
    return this.posm.filter(p => p.isExpired && !p.removedOn).length;
  }

  trackAudit = (_: number, a: MerchandisingAuditDto) => a.id;
  trackSurvey = (_: number, s: SurveyFormDto) => s.id;
  trackResponse = (_: number, r: SurveyResponseDto) => r.id;
  trackCompetitor = (_: number, c: CompetitorObservationDto) => c.id;
  trackPosm = (_: number, p: PosmPlacementDto) => p.id;
  trackIndex = (i: number) => i;
}
