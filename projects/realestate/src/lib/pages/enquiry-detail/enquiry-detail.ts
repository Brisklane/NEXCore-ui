import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CrmService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  ACTIVITY_DIRECTION_LABELS, ACTIVITY_KIND_LABELS, ActivityDirection, ActivityKind,
  BUYING_PURPOSE_LABELS, ENQUIRY_CHANNEL_LABELS, ENQUIRY_STAGE_LABELS, EnquiryStage,
  FUNDING_KIND_LABELS, LISTING_KIND_LABELS, NotificationChannel, VIEWING_STATUS_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  DrawerComponent, PillComponent, ProgressComponent, ToastComponent,
} from '../shared/ui';

/* =====================================================================================
 * An enquiry.
 *
 * A lead, from the moment it lands to the moment it becomes a booking or is honestly written off.
 *
 * The number that governs this screen is speed to first contact. It is stated in the header in
 * minutes, and while the enquiry is unanswered the whole screen leads with how long somebody has
 * been waiting — because in every study of this market, the firm that replies first wins a
 * disproportionate share, and no other single number moves conversion as much.
 *
 * Logging an activity always offers to book the next one. A lead with no next action is a lead
 * that has been quietly dropped.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-enquiry-detail',
  imports: [
    CommonModule, FormsModule, DetailPageComponent, SectionComponent, FactsComponent,
    MiniListComponent, ProgressComponent, PillComponent, DrawerComponent, ToastComponent,
  ],
  templateUrl: './enquiry-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './enquiry-detail.css',
  ],
})
export class EnquiryDetailComponent implements OnInit {
  private crm = inject(CrmService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.EnquiryDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  // Logging an activity.
  readonly logging = signal(false);
  readonly saving = signal(false);
  readonly logKind = signal<ActivityKind>(ActivityKind.Call);
  readonly logSubject = signal('');
  readonly logBody = signal('');
  readonly logOutcome = signal('');
  readonly nextDate = signal('');
  readonly nextTitle = signal('');

  readonly kinds = [
    ActivityKind.Call, ActivityKind.WhatsApp, ActivityKind.Email, ActivityKind.Sms,
    ActivityKind.Meeting, ActivityKind.Note,
  ].map(k => ({ value: k, label: ACTIVITY_KIND_LABELS[k] }));

  readonly unanswered = computed(() => {
    const d = this.data();
    return !!d && !d.firstContactedAt;
  });

  readonly openTasks = computed(() =>
    (this.data()?.tasks ?? []).filter(t => !t.isOverdue));

  readonly overdueTasks = computed(() =>
    (this.data()?.tasks ?? []).filter(t => t.isOverdue));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'activity', label: 'Contact log', icon: 'forum', count: d.activities.length },
      { key: 'tasks', label: 'Follow-ups', icon: 'task_alt',
        count: this.overdueTasks().length,
        tone: this.overdueTasks().length ? 'danger' : 'neutral' },
      { key: 'appointments', label: 'Appointments', icon: 'event',
        count: d.viewings.length + d.siteVisits.length },
      { key: 'matches', label: 'Matches', icon: 'join_inner', count: d.matches.length },
      { key: 'history', label: 'Stage history', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: ENQUIRY_STAGE_LABELS[d.stage], tone: this.stageTone(d.stage) },
      { label: ENQUIRY_CHANNEL_LABELS[d.channel], icon: 'input' },
      { label: LISTING_KIND_LABELS[d.interest] },
    ];

    if (d.slaBreached) {
      pills.push({ label: 'Past the promise', tone: 'danger', icon: 'timer_off' });
    }
    if (d.isQualified) pills.push({ label: 'Qualified', tone: 'positive', icon: 'verified' });
    if (d.followUpOverdue) {
      pills.push({ label: 'Follow-up overdue', tone: 'warning', icon: 'schedule' });
    }
    if (d.convertedBookingId) {
      pills.push({ label: 'Converted', tone: 'positive', icon: 'check_circle' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Score', value: String(d.score),
        hint: d.isQualified ? 'qualified' : 'not yet qualified',
      },
      {
        label: 'Answered in',
        value: d.speedToLeadMinutes !== undefined
          ? this.duration(d.speedToLeadMinutes)
          : 'not yet',
        hint: d.slaBreached ? 'past the promised time' : 'within the promise',
      },
      { label: 'In stage', value: d.daysInStage + ' days' },
      {
        label: 'Budget',
        value: d.budgetMax
          ? this.money(d.budgetMin ?? 0) + ' – ' + this.money(d.budgetMax)
          : (d.budgetMin ? 'from ' + this.money(d.budgetMin) : '—'),
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [
      { key: 'log', label: 'Log contact', icon: 'add_comment', tone: 'primary' },
    ];

    if (d.contactPhone) actions.push({ key: 'call', label: 'Call', icon: 'call' });

    if (!d.convertedBookingId) {
      actions.push({ key: 'book', label: 'Start a booking', icon: 'sell', tone: 'success' });
    } else {
      actions.push({ key: 'booking', label: 'Open the booking', icon: 'open_in_new' });
    }

    return actions;
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Contact', value: d.contactName },
      { label: 'Phone', value: d.contactPhone },
      { label: 'Email', value: d.contactEmail },
      { label: 'Wants', value: LISTING_KIND_LABELS[d.interest] },
      { label: 'Project', value: d.projectName },
      { label: 'Property', value: d.propertyReference },
      {
        label: 'Purpose',
        value: d.purpose !== undefined ? BUYING_PURPOSE_LABELS[d.purpose] : null,
      },
      {
        label: 'Funding',
        value: d.funding !== undefined ? FUNDING_KIND_LABELS[d.funding] : null,
      },
      { label: 'Timeline', value: d.timeline },
      { label: 'Came from', value: d.sourceLabel ?? ENQUIRY_CHANNEL_LABELS[d.channel] },
      { label: 'Sub-source', value: d.subSource },
      { label: 'Campaign', value: d.campaignName },
      { label: 'Partner', value: d.partnerName },
      { label: 'Referred by', value: d.referredByName },
      { label: 'With', value: d.assignedAgentName },
      { label: 'Arrived', value: new Date(d.receivedAt).toLocaleString() },
      {
        label: 'First answered',
        value: d.firstContactedAt ? new Date(d.firstContactedAt).toLocaleString() : 'Not yet',
        tone: d.firstContactedAt ? 'positive' : 'danger',
      },
      { label: 'Message', value: d.message, wide: true },
    ];
  });

  readonly outcome = computed<Fact[]>(() => {
    const d = this.data();
    if (!d || !d.closedAt) return [];

    return [
      { label: 'Closed', value: new Date(d.closedAt).toLocaleDateString() },
      { label: 'Reason', value: d.lossReason },
      { label: 'Lost to', value: d.lostToCompetitor },
      { label: 'Note', value: d.lossNote, wide: true },
    ];
  });

  readonly activities = computed<MiniRow[]>(() =>
    (this.data()?.activities ?? []).map(a => ({
      id: a.id,
      title: a.subject ?? ACTIVITY_KIND_LABELS[a.kind],
      sub: a.body ?? null,
      meta: new Date(a.occurredAt).toLocaleString()
        + ' · ' + ACTIVITY_DIRECTION_LABELS[a.direction]
        + (a.userName ? ' · ' + a.userName : '')
        + (a.durationSeconds ? ' · ' + Math.round(a.durationSeconds / 60) + ' min' : ''),
      valueSub: a.outcome ?? null,
      tone: a.deliveryFailed ? 'alert' : 'neutral',
      icon: this.activityIcon(a.kind),
    })));

  readonly tasks = computed<MiniRow[]>(() =>
    (this.data()?.tasks ?? []).map(t => ({
      id: t.id,
      title: t.title,
      sub: t.note ?? null,
      meta: 'due ' + new Date(t.dueAt).toLocaleString()
        + (t.assignedToName ? ' · ' + t.assignedToName : ''),
      tone: t.isOverdue ? 'alert' : 'neutral',
      icon: 'task_alt',
    })));

  readonly viewings = computed<MiniRow[]>(() =>
    (this.data()?.viewings ?? []).map(v => ({
      id: v.id,
      title: v.propertySummary,
      sub: v.firstAddress ?? null,
      meta: new Date(v.scheduledAt).toLocaleString()
        + ' · ' + VIEWING_STATUS_LABELS[v.status]
        + (v.feedbackReceived ? ' · feedback in' : ''),
      icon: 'visibility',
    })));

  readonly siteVisits = computed<MiniRow[]>(() =>
    (this.data()?.siteVisits ?? []).map(s => ({
      id: s.id,
      title: s.projectName,
      sub: s.isRevisit ? 'Visit number ' + s.visitNumber : 'First visit',
      meta: new Date(s.scheduledAt).toLocaleString() + ' · ' + VIEWING_STATUS_LABELS[s.status],
      valueSub: s.costSheetIssued ? 'cost sheet issued' : null,
      icon: 'map',
    })));

  readonly matches = computed(() => this.data()?.matches ?? []);

  readonly stageHistory = computed<MiniRow[]>(() =>
    (this.data()?.stageHistory ?? []).map((h, i) => ({
      id: String(i),
      title: ENQUIRY_STAGE_LABELS[h.fromStage] + ' → ' + ENQUIRY_STAGE_LABELS[h.toStage],
      sub: h.note ?? null,
      meta: new Date(h.changedAt).toLocaleString()
        + (h.changedByName ? ' · ' + h.changedByName : ''),
      value: h.daysInPreviousStage + ' days',
      valueSub: 'in the previous stage',
      icon: 'swap_horiz',
    })));

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.crm.getEnquiry(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    switch (key) {
      case 'log':
        this.startLog();
        break;
      case 'call':
        if (d.contactPhone) window.location.href = 'tel:' + d.contactPhone;
        break;
      case 'book':
        void this.router.navigate(['/realestate/bookings/new'],
          { queryParams: { enquiryId: d.id, partyId: d.partyId } });
        break;
      case 'booking':
        if (d.convertedBookingId) {
          void this.router.navigate(['/realestate/bookings', d.convertedBookingId]);
        }
        break;
    }
  }

  private startLog(): void {
    const d = this.data();
    this.logging.set(true);
    this.logKind.set(ActivityKind.Call);
    this.logSubject.set('');
    this.logBody.set('');
    this.logOutcome.set('');
    this.nextTitle.set('Follow up with ' + (d?.contactName ?? 'them'));

    const next = new Date();
    next.setDate(next.getDate() + 2);
    this.nextDate.set(next.toISOString().slice(0, 10));
  }

  async saveLog(): Promise<void> {
    const d = this.data();
    if (!d) return;

    this.saving.set(true);

    const payload: M.ActivityCreateDto = {
      kind: this.logKind(),
      direction: ActivityDirection.Outbound,
      enquiryId: d.id,
      partyId: d.partyId,
      occurredAt: new Date().toISOString(),
      subject: this.logSubject() || undefined,
      body: this.logBody() || undefined,
      outcome: this.logOutcome() || undefined,
      nextFollowUp: this.nextDate() && this.nextTitle()
        ? {
            title: this.nextTitle(),
            dueAt: new Date(this.nextDate() + 'T09:00:00').toISOString(),
            suggestedAction: this.logKind(),
            priority: 2,
            enquiryId: d.id,
            partyId: d.partyId,
          } as M.FollowUpTaskCreateDto
        : undefined,
    };

    const res = await firstValueFrom(this.crm.logActivity(payload)).catch(() => null);

    this.saving.set(false);

    if (res?.success) {
      this.logging.set(false);
      this.toast.set(this.nextDate()
        ? 'Logged, and the next follow-up is booked.'
        : 'Logged. Nothing further is scheduled for this lead.');
      await this.load();
    } else {
      this.toast.set('That did not save.');
    }
  }

  async sendMatch(m: M.MatchResultDto): Promise<void> {
    const d = this.data();
    const profile = d?.requirement;

    // Matches are sent against the requirement profile they were produced from — without one
    // there is nothing to record the send against, so the button says so rather than failing.
    if (!d || !profile) {
      this.toast.set('Record what this person is looking for first, then matches can be sent.');
      return;
    }

    const res = await firstValueFrom(this.crm.sendMatches({
      requirementProfileId: profile.id,
      matchResultIds: [m.id],
      channel: NotificationChannel.Email,
    })).catch(() => null);

    if (res?.success) {
      this.toast.set('Sent to ' + d.contactName + '.');
      await this.load();
    } else {
      this.toast.set('That could not be sent.');
    }
  }

  activityIcon(k: ActivityKind): string {
    switch (k) {
      case ActivityKind.Call: return 'call';
      case ActivityKind.Email: return 'mail';
      case ActivityKind.Sms:
      case ActivityKind.WhatsApp: return 'chat';
      case ActivityKind.Meeting: return 'groups';
      case ActivityKind.Viewing: return 'visibility';
      case ActivityKind.SiteVisit: return 'map';
      default: return 'sticky_note_2';
    }
  }

  listingKind(k: M.RequirementProfileDto['interest']): string {
    return LISTING_KIND_LABELS[k] ?? '—';
  }

  areaNames(r: M.RequirementProfileDto): string {
    return r.preferredAreas.map(a => a.label).join(', ');
  }

  duration(minutes: number): string {
    if (minutes < 60) return minutes + ' min';
    if (minutes < 1440) return Math.round(minutes / 60) + ' hours';
    return Math.round(minutes / 1440) + ' days';
  }

  private stageTone(s: EnquiryStage): DetailPill['tone'] {
    if (s === EnquiryStage.Lost) return 'danger';
    if (s === EnquiryStage.Completed || s === EnquiryStage.Booked) return 'positive';
    if (s === EnquiryStage.New) return 'warning';
    return 'neutral';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return c + ' ' + (v / 1_000_000).toFixed(2) + 'm';
    if (abs >= 1_000) return c + ' ' + (v / 1_000).toFixed(0) + 'k';
    return c + ' ' + v.toFixed(0);
  }
}
