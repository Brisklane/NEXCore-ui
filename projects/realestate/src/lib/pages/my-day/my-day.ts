import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CrmService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  ACTIVITY_KIND_LABELS, ActivityKind, TICKET_PRIORITY_LABELS, TicketPriority,
} from '../../models/realestate.enums';
import {
  DrawerComponent, EmptyStateComponent, PillComponent, SkeletonComponent, StatsComponent,
  ToastComponent, type StatCard,
} from '../shared/ui';
import { PageHelpComponent } from '../shared/page-help';
import { SectionComponent } from '../shared/detail-bits';

/* =====================================================================================
 * My day.
 *
 * The screen an agent opens first and closes last. Everything on it is something they personally
 * have to do today, in the order it should be done: what is late, what is due, who they have
 * promised to see, and who is waiting for a reply.
 *
 * The rule the screen enforces quietly: completing a follow-up asks what happened and what
 * happens next. A lead with no next action is a lead that has been dropped, and the commonest way
 * a pipeline dies is one abandoned task at a time.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-my-day',
  imports: [
    CommonModule, FormsModule, StatsComponent, SkeletonComponent, EmptyStateComponent,
    PillComponent, DrawerComponent, ToastComponent, PageHelpComponent, SectionComponent,
  ],
  templateUrl: './my-day.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css', './my-day.css',
  ],
})
export class MyDayComponent implements OnInit {
  private crm = inject(CrmService);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly day = signal<M.MyDayDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  readonly date = signal(new Date().toISOString().slice(0, 10));

  /** The completion drawer. Nothing is completed without saying what happened. */
  readonly completing = signal<M.FollowUpTaskDto | null>(null);
  readonly outcome = signal('');
  readonly note = signal('');
  readonly nextDate = signal('');
  readonly nextTitle = signal('');
  readonly saving = signal(false);

  readonly outcomes = [
    'Spoke — going ahead',
    'Spoke — thinking about it',
    'Spoke — not interested',
    'No answer',
    'Left a message',
    'Wrong number',
    'Asked to be called later',
  ];

  readonly stats = computed<StatCard[]>(() => {
    const d = this.day();
    if (!d) return [];

    return [
      {
        label: 'Overdue', value: d.overdue.length, icon: 'error',
        tone: d.overdue.length ? 'danger' : 'positive',
        hint: d.overdue.length ? 'these should have happened already' : 'nothing left behind',
      },
      { label: 'Due today', value: d.dueToday.length, icon: 'task_alt' },
      {
        label: 'Appointments', value: d.viewings.length + d.siteVisits.length, icon: 'event',
        hint: d.siteVisits.length ? d.siteVisits.length + ' on site' : 'viewings',
      },
      {
        label: 'Waiting on a reply', value: d.unansweredLeads.length, icon: 'forum',
        tone: d.unansweredLeads.length ? 'warning' : 'neutral',
      },
      {
        label: 'Done today', value: d.completedToday, icon: 'done_all', tone: 'positive',
        hint: d.callsMadeToday + (d.callsMadeToday === 1 ? ' call' : ' calls'),
      },
    ];
  });

  readonly hasAnything = computed(() => {
    const d = this.day();
    if (!d) return false;
    return d.overdue.length + d.dueToday.length + d.upcoming.length + d.viewings.length
      + d.siteVisits.length + d.unansweredLeads.length + d.awaitingMyApproval.length > 0;
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.crm.getMyDay(this.date())).catch(() => null);

    if (res?.data) this.day.set(res.data);
    else this.error.set('We could not load your day.');

    this.loading.set(false);
  }

  shift(days: number): void {
    const d = new Date(this.date());
    d.setDate(d.getDate() + days);
    this.date.set(d.toISOString().slice(0, 10));
    void this.load();
  }

  goToday(): void {
    this.date.set(new Date().toISOString().slice(0, 10));
    void this.load();
  }

  isToday(): boolean {
    return this.date() === new Date().toISOString().slice(0, 10);
  }

  open(task: M.FollowUpTaskDto): void {
    if (task.route) void this.router.navigateByUrl(task.route);
  }

  call(task: M.FollowUpTaskDto): void {
    if (task.partyPhone) window.location.href = 'tel:' + task.partyPhone;
  }

  startComplete(task: M.FollowUpTaskDto): void {
    this.completing.set(task);
    this.outcome.set('');
    this.note.set('');
    this.nextTitle.set('Follow up with ' + (task.partyName ?? 'them'));

    const next = new Date();
    next.setDate(next.getDate() + 2);
    this.nextDate.set(next.toISOString().slice(0, 10));
  }

  async complete(): Promise<void> {
    const task = this.completing();
    if (!task || !this.outcome()) return;

    this.saving.set(true);

    const payload: M.TaskCompletionDto = {
      taskId: task.id,
      outcome: this.outcome(),
      completionNote: this.note() || undefined,
      nextTask: this.nextDate() && this.nextTitle()
        ? {
            title: this.nextTitle(),
            dueAt: new Date(this.nextDate() + 'T09:00:00').toISOString(),
            suggestedAction: task.suggestedAction,
            priority: task.priority,
            partyId: task.partyId,
            enquiryId: task.enquiryId,
            bookingId: task.bookingId,
          } as M.FollowUpTaskCreateDto
        : undefined,
    };

    const res = await firstValueFrom(this.crm.completeTask(payload)).catch(() => null);

    this.saving.set(false);

    if (res?.success) {
      this.completing.set(null);
      this.toast.set(this.nextDate()
        ? 'Done, and the next follow-up is booked.'
        : 'Done. Nothing further is scheduled for this one.');
      await this.load();
    } else {
      this.toast.set('That did not save. The task is unchanged.');
    }
  }

  async snooze(task: M.FollowUpTaskDto, days: number): Promise<void> {
    const until = new Date();
    until.setDate(until.getDate() + days);

    const res = await firstValueFrom(this.crm.snoozeTask(task.id, until.toISOString()))
      .catch(() => null);

    if (res?.success) {
      this.toast.set('Moved to ' + until.toLocaleDateString() + '.');
      await this.load();
    } else {
      this.toast.set('We could not move that one.');
    }
  }

  actionLabel(k: ActivityKind): string {
    return ACTIVITY_KIND_LABELS[k] ?? 'Follow up';
  }

  actionIcon(k: ActivityKind): string {
    switch (k) {
      case ActivityKind.Call: return 'call';
      case ActivityKind.Email: return 'mail';
      case ActivityKind.Sms:
      case ActivityKind.WhatsApp: return 'chat';
      case ActivityKind.Meeting: return 'groups';
      case ActivityKind.Viewing: return 'visibility';
      case ActivityKind.SiteVisit: return 'map';
      default: return 'task_alt';
    }
  }

  priorityTone(p: TicketPriority): 'danger' | 'warning' | 'neutral' {
    if (p === TicketPriority.Emergency) return 'danger';
    return p === TicketPriority.High ? 'warning' : 'neutral';
  }

  priorityLabel(p: TicketPriority): string {
    return TICKET_PRIORITY_LABELS[p] ?? '—';
  }

  /** "Two days late" beats a date, because nobody counts backwards accurately in a hurry. */
  lateness(task: M.FollowUpTaskDto): string {
    const due = new Date(task.dueAt).getTime();
    const mins = Math.round((Date.now() - due) / 60000);

    if (mins < -1440) return 'in ' + Math.round(-mins / 1440) + ' days';
    if (mins < -60) return 'in ' + Math.round(-mins / 60) + ' hours';
    if (mins < 0) return 'in ' + -mins + ' minutes';
    if (mins < 60) return mins + ' minutes late';
    if (mins < 1440) return Math.round(mins / 60) + ' hours late';
    return Math.round(mins / 1440) + ' days late';
  }

  goEnquiry(e: M.EnquiryListItemDto): void {
    void this.router.navigate(['/realestate/enquiries', e.id]);
  }

  goApproval(): void {
    void this.router.navigateByUrl('/realestate/setup/approval-inbox');
  }

  money(v: number | undefined): string {
    if (v === undefined || v === null) return '—';
    return this.ctx.currency() + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
