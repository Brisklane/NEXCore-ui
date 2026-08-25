import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AccessService, MemberService } from '../../services/fitness.services';
import {
  AccessDecisionDto, CheckInDto, FrontDeskDto, MemberSummaryDto,
} from '../../models/fitness.models';
import {
  AccessDecision, CredentialType, MemberStatus, MEMBER_STATUS_LABELS, ReaderDirection,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The front desk.
 *
 * The most-used screen in the product, and the one with the hardest constraints: it is operated
 * standing up, between conversations, often with a queue forming. So the whole screen arrives in
 * a single request, the search box holds focus by default, and the decision panel is the largest
 * thing on the page — readable from a metre away, at an angle, by somebody who is also talking.
 *
 * The decision panel never shows a code. Every refusal is a sentence that can be read out to the
 * member as-is, which is the difference between "computer says no" and a receptionist who can
 * actually help.
 */
@Component({
  standalone: true,
  selector: 'lib-front-desk',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './front-desk.html',
  styleUrls: ['../fitness-shared.css', './front-desk.css'],
})
export class FrontDeskComponent implements OnInit, OnDestroy {
  private access = inject(AccessService);
  private members = inject(MemberService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  data: FrontDeskDto | null = null;
  loading = true;
  error = '';
  clubId: string | null = null;

  /** What was typed or scanned into the search box. */
  term = '';
  searching = false;
  results: MemberSummaryDto[] = [];

  /** The last door decision, shown large until the next one replaces it. */
  decision: AccessDecisionDto | null = null;
  decisionMember: MemberSummaryDto | null = null;

  /** Manager override dialog. */
  overrideFor: AccessDecisionDto | null = null;
  overrideReason = '';
  overrideBusy = false;

  readonly statusLabels = MEMBER_STATUS_LABELS;
  readonly MemberStatus = MemberStatus;
  readonly AccessDecision = AccessDecision;

  private timer?: ReturnType<typeof setInterval>;
  private searchTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // The desk has to stay honest about who is in the building without anybody refreshing it.
    this.timer = setInterval(() => this.load(true), 30_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(silent = false): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }
    if (!silent) this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.access.getFrontDesk(this.clubId)).catch(() => null);

    if (!res?.data) {
      if (!silent) this.error = 'Could not load the front desk.';
    } else {
      this.data = res.data;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Search ─────────────────────────────────────────────────────────────

  /**
   * Debounced so a fob scan — which arrives as a burst of keystrokes and a return — does not fire
   * a request per character.
   */
  onTermChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.term.trim().length < 2) { this.results = []; return; }
    this.searchTimer = setTimeout(() => void this.search(), 220);
  }

  async search(): Promise<void> {
    const term = this.term.trim();
    if (!term || !this.clubId) return;

    this.searching = true;
    const res = await firstValueFrom(this.members.search({
      query: term,
      clubId: this.clubId,
      includeInactive: true,
      limit: 8,
    })).catch(() => null);

    this.results = res?.data ?? [];
    this.searching = false;
    this.cdr.detectChanges();
  }

  /**
   * A scan: the whole string is a credential, so ask the door engine directly rather than
   * searching for it. A fob that is not recognised comes back as a refusal with a reason, which
   * is more useful than an empty result list.
   */
  async onScan(): Promise<void> {
    const identifier = this.term.trim();
    if (!identifier || !this.clubId) return;

    this.searching = true;
    const res = await firstValueFrom(this.access.decide({
      clubId: this.clubId,
      credentialIdentifier: identifier,
      method: CredentialType.RfidFob,
      direction: ReaderDirection.In,
      wasOfflineDecision: false,
    })).catch(() => null);

    this.searching = false;

    if (res?.data) {
      this.decision = res.data;
      this.term = '';
      this.results = [];
      await this.load(true);
    } else {
      await this.search();
    }

    this.cdr.detectChanges();
  }

  /** Checking somebody in from the search results, by hand. */
  async checkIn(member: MemberSummaryDto, override = false): Promise<void> {
    if (!this.clubId) return;

    const res = await firstValueFrom(this.access.manualCheckIn({
      clubId: this.clubId,
      memberId: member.id,
      overrideDenial: override,
      overrideReason: override ? this.overrideReason.trim() : null,
    })).catch(() => null);

    if (res?.data) {
      this.decision = res.data;
      this.decisionMember = member;
      this.term = '';
      this.results = [];
      this.overrideFor = null;
      this.overrideReason = '';
      await this.load(true);
    } else {
      this.error = 'Could not check that member in.';
    }

    this.overrideBusy = false;
    this.cdr.detectChanges();
  }

  /** Opens the override dialog for a refusal a member of staff wants to wave through. */
  askOverride(): void {
    this.overrideFor = this.decision;
    this.overrideReason = '';
  }

  async confirmOverride(): Promise<void> {
    if (!this.overrideFor?.memberId || this.overrideReason.trim().length < 3) return;

    this.overrideBusy = true;
    await this.checkIn(
      { id: this.overrideFor.memberId } as MemberSummaryDto,
      true,
    );
  }

  async checkOut(entry: CheckInDto): Promise<void> {
    await firstValueFrom(this.access.checkOut(entry.id)).catch(() => null);
    await this.load(true);
  }

  dismissDecision(): void {
    this.decision = null;
    this.decisionMember = null;
  }

  go(route: string): void {
    void this.router.navigateByUrl(route);
  }

  // ── Presentation ───────────────────────────────────────────────────────

  decisionClass(d: AccessDecisionDto): string {
    if (d.decision === AccessDecision.Denied) return 'is-denied';
    if (d.decision === AccessDecision.GrantedWithWarning || d.decision === AccessDecision.ManualOverride) {
      return 'is-warned';
    }
    return 'is-allowed';
  }

  decisionIcon(d: AccessDecisionDto): string {
    if (d.decision === AccessDecision.Denied) return 'block';
    if (d.decision === AccessDecision.GrantedWithWarning) return 'warning';
    if (d.decision === AccessDecision.ManualOverride) return 'key';
    return 'check_circle';
  }

  decisionHeadline(d: AccessDecisionDto): string {
    const name = d.preferredName || d.memberName || 'Member';
    if (d.decision === AccessDecision.Denied) return `${name} — not this time`;
    if (d.isBirthday) return `Happy birthday, ${name}!`;
    if (d.isMilestoneVisit) return `${name} — visit number ${d.visitNumber}`;
    return `Welcome, ${name}`;
  }

  statusClass(status: MemberStatus | null | undefined): string {
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

  occupancyClass(percent: number): string {
    if (percent >= 90) return 'is-full';
    if (percent >= 75) return 'is-busy';
    return '';
  }

  /** "1h 12m" reads better on a busy screen than "72 minutes". */
  duration(minutes: number | null | undefined): string {
    if (minutes == null) return 'still in';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  initials(name: string | null | undefined): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
