import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AgreementService, AssessmentService, BillingService, MemberService,
  RetentionService, ScheduleService,
} from '../../services/fitness.services';
import {
  MemberDetailDto, MemberLedgerEntryDto, MemberNoteDto, VisitHistoryDto,
} from '../../models/fitness.models';
import {
  AlertSeverity, ChurnRiskBand, CHURN_RISK_BAND_LABELS, ClearanceStatus,
  InteractionKind, MemberStatus, MEMBER_STATUS_LABELS,
} from '../../models/fitness.enums';

type Tab = 'overview' | 'visits' | 'bookings' | 'money' | 'agreements' | 'health' | 'notes';

/**
 * One member, everything about them.
 *
 * The header is doing the real work: it carries the four facts that change how a member of staff
 * speaks to somebody — status, balance, risk, and whether anything would stop them at the door —
 * so a receptionist can answer the question in front of them without opening a tab.
 *
 * Health information sits behind its own tab with an explicit notice, because opening it is
 * recorded against the person who opened it. That is a deliberate speed bump: staff should know
 * they are reading someone's medical history, not stumble into it.
 */
@Component({
  standalone: true,
  selector: 'lib-member-360',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-360.html',
  styleUrls: ['../fitness-shared.css', './member-360.css'],
})
export class Member360Component implements OnInit {
  private members = inject(MemberService);
  private billing = inject(BillingService);
  private agreements = inject(AgreementService);
  private retention = inject(RetentionService);
  private schedule = inject(ScheduleService);
  private assessments = inject(AssessmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  member: MemberDetailDto | null = null;
  loading = true;
  error = '';
  notice = '';

  tab: Tab = 'overview';

  timeline: MemberNoteDto[] = [];
  visits: VisitHistoryDto[] = [];
  ledger: MemberLedgerEntryDto[] = [];

  /** Loaded lazily, and only once the tab is actually opened. */
  private loadedTabs = new Set<Tab>();

  noteText = '';
  savingNote = false;

  readonly statusLabels = MEMBER_STATUS_LABELS;
  readonly riskLabels = CHURN_RISK_BAND_LABELS;
  readonly MemberStatus = MemberStatus;
  readonly ClearanceStatus = ClearanceStatus;
  readonly AlertSeverity = AlertSeverity;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'No member was chosen.'; this.loading = false; return; }
    await this.load(id);
  }

  async load(id?: string): Promise<void> {
    const memberId = id ?? this.member?.id;
    if (!memberId) return;

    this.loading = true;
    const res = await firstValueFrom(this.members.getById(memberId)).catch(() => null);

    if (!res?.data) this.error = 'Could not load that member.';
    else this.member = res.data;

    this.loading = false;
    this.cdr.detectChanges();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    if (this.loadedTabs.has(tab) || !this.member) return;
    this.loadedTabs.add(tab);

    switch (tab) {
      case 'notes': {
        const res = await firstValueFrom(this.members.getTimeline(this.member.id)).catch(() => null);
        this.timeline = res?.data ?? [];
        break;
      }
      case 'visits': {
        const res = await firstValueFrom(this.members.getVisits(this.member.id)).catch(() => null);
        this.visits = res?.data ?? [];
        break;
      }
      case 'money': {
        const res = await firstValueFrom(this.members.getLedger(this.member.id)).catch(() => null);
        this.ledger = res?.data ?? [];
        break;
      }
    }

    this.cdr.detectChanges();
  }

  async addNote(): Promise<void> {
    const body = this.noteText.trim();
    if (!body || !this.member) return;

    this.savingNote = true;
    const res = await firstValueFrom(this.members.addNote({
      id: '',
      memberId: this.member.id,
      kind: InteractionKind.Note,
      body,
      isPinned: false,
      isPrivate: false,
      occurredAt: new Date().toISOString(),
    } as MemberNoteDto)).catch(() => null);

    if (res?.data) {
      this.timeline = [res.data, ...this.timeline];
      this.noteText = '';
    } else {
      this.error = 'Could not save that note.';
    }

    this.savingNote = false;
    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get blockingAlerts() {
    return (this.member?.alerts ?? []).filter(a => a.blocksAccess);
  }

  get otherAlerts() {
    return (this.member?.alerts ?? []).filter(a => !a.blocksAccess);
  }

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

  /** Tenure as a person would say it, not as a day count. */
  tenure(days: number): string {
    if (days < 31) return `${days} days`;
    const months = Math.floor(days / 30.44);
    if (months < 24) return `${months} month${months === 1 ? '' : 's'}`;
    return `${Math.floor(months / 12)} years`;
  }

  lastVisit(): string {
    if (!this.member?.lastVisitOn) return 'Never';
    const d = this.member.daysSinceLastVisit;
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    return `${d} days ago`;
  }

  initials(name: string | null | undefined): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
