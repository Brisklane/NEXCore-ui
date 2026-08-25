import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MemberService } from '../../services/fitness.services';
import { CatalogueService } from '../../services/fitness.services';
import { MemberSummaryDto, MembershipPlanDto } from '../../models/fitness.models';
import {
  ChurnRiskBand, CHURN_RISK_BAND_LABELS, MemberStatus, MEMBER_STATUS_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Everybody on the books.
 *
 * The filters are the point of this screen rather than the list itself. A manager does not browse
 * members; they work a list — everyone at risk, everyone in arrears, everyone on the plan being
 * retired — and then act on it. So the filters are laid out as one row of chips and every one of
 * them is a question somebody actually asks.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-members',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './members.html',
  styleUrls: ['../fitness-shared.css', './members.css'],
})
export class MembersComponent implements OnInit {
  private members = inject(MemberService);
  private catalogue = inject(CatalogueService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: MemberSummaryDto[] = [];
  plans: MembershipPlanDto[] = [];
  total = 0;
  page = 1;
  readonly size = 25;

  loading = true;
  error = '';
  clubId: string | null = null;

  search = '';
  status: MemberStatus | null = null;
  riskBand: ChurnRiskBand | null = null;
  planId: string | null = null;
  hasBalance: boolean | null = null;

  readonly statusLabels = MEMBER_STATUS_LABELS;
  readonly riskLabels = CHURN_RISK_BAND_LABELS;
  readonly statusOptions = enumOptions(MEMBER_STATUS_LABELS);
  readonly riskOptions = enumOptions(CHURN_RISK_BAND_LABELS);
  readonly MemberStatus = MemberStatus;

  private searchTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void { /* club picker fires the first load */ }

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await Promise.all([this.loadPlans(), this.load()]);
  }

  private async loadPlans(): Promise<void> {
    const res = await firstValueFrom(this.catalogue.getPlans(this.clubId ?? undefined)).catch(() => null);
    this.plans = res?.data ?? [];
  }

  onSearchChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 260);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.members.list({
      clubId: this.clubId ?? undefined,
      status: this.status ?? undefined,
      riskBand: this.riskBand ?? undefined,
      search: this.search.trim() || undefined,
      planId: this.planId ?? undefined,
      hasBalance: this.hasBalance ?? undefined,
      page: this.page,
      size: this.size,
    })).catch(() => null);

    if (!res) {
      this.error = 'Could not load the member list.';
    } else {
      this.rows = res.data ?? [];
      this.total = res.pagination?.totalCount ?? this.rows.length;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  /** One-tap filters for the lists people actually work. */
  applyPreset(preset: 'all' | 'arrears' | 'risk' | 'lapsing' | 'frozen' | 'new'): void {
    this.status = null;
    this.riskBand = null;
    this.hasBalance = null;
    this.planId = null;

    switch (preset) {
      case 'arrears': this.hasBalance = true; this.status = MemberStatus.PastDue; break;
      case 'risk': this.riskBand = ChurnRiskBand.Critical; break;
      case 'lapsing': this.riskBand = ChurnRiskBand.AtRisk; break;
      case 'frozen': this.status = MemberStatus.Frozen; break;
      case 'new': this.status = MemberStatus.Active; break;
    }

    this.page = 1;
    void this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.status = null;
    this.riskBand = null;
    this.planId = null;
    this.hasBalance = null;
    this.page = 1;
    void this.load();
  }

  get hasFilters(): boolean {
    return !!(this.search || this.status || this.riskBand || this.planId || this.hasBalance !== null);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.size)); }

  goPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.page = n;
    void this.load();
  }

  open(m: MemberSummaryDto): void {
    void this.router.navigateByUrl(`/fitness/members/${m.id}`);
  }

  newMember(): void {
    void this.router.navigateByUrl('/fitness/join');
  }

  // ── Presentation ───────────────────────────────────────────────────────

  statusClass(status: MemberStatus): string {
    switch (status) {
      case MemberStatus.Active:
      case MemberStatus.WonBack: return 'is-active';
      case MemberStatus.Trial: return 'is-trial';
      case MemberStatus.Frozen: return 'is-frozen';
      case MemberStatus.PastDue: return 'is-arrears';
      case MemberStatus.Suspended:
      case MemberStatus.Cancelled:
      case MemberStatus.Expired: return 'is-blocked';
      default: return '';
    }
  }

  riskClass(band: ChurnRiskBand): string {
    switch (band) {
      case ChurnRiskBand.Critical: return 'is-critical';
      case ChurnRiskBand.AtRisk: return 'is-atrisk';
      case ChurnRiskBand.Watch: return 'is-watch';
      default: return 'is-healthy';
    }
  }

  /** "Never" reads better than "0 days ago" for somebody who has never been in. */
  lastVisit(m: MemberSummaryDto): string {
    if (!m.lastVisitOn) return 'Never';
    if (m.daysSinceLastVisit === 0) return 'Today';
    if (m.daysSinceLastVisit === 1) return 'Yesterday';
    return `${m.daysSinceLastVisit} days ago`;
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
