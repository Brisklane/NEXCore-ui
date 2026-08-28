import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function ticketTone(s: E.TicketStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.TicketStatus.Resolved:
    case E.TicketStatus.Closed: return 'positive';
    case E.TicketStatus.Escalated:
    case E.TicketStatus.Reopened: return 'danger';
    case E.TicketStatus.Open:
    case E.TicketStatus.Acknowledged: return 'warning';
    default: return 'neutral';
  }
}

/**
 * Reads a label map with a value that arrived as JSON.
 *
 * The wire carries a plain number, so the lookup is unavoidably untyped at this one point. A
 * missing value renders as an em dash rather than as `undefined`, which is the difference between
 * a gap in the data and a bug on screen.
 */
function lbl<T extends number>(map: Record<T, string>, value: unknown): string {
  return map[value as T] ?? '\u2014';
}

/** Complaints — What residents have reported. */
@Component({
  standalone: true,
  selector: 'lib-re-complaints',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
      (create)="create()"
    />
  `,
})
export class ComplaintsComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);

  readonly config: ListConfig<any> = {
    title: 'Complaints',
    subtitle: 'What residents have reported.',
    helpKey: 'complaints',
    icon: 'report_problem',
    searchPlaceholder: 'Ticket, title or unit',
    createLabel: 'Log a complaint',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No complaints',
    emptyMessage: 'Residents have nothing to report.',
    columns: [
      { key: 'ticketNumber', label: 'Ticket', kind: 'strong', width: '130px' },
      { key: 'title', label: 'What', sub: r => r.unitNumber ?? null },
      { key: 'category', label: 'Category', kind: 'pill', value: r => lbl(E.COMPLAINT_CATEGORY_LABELS, r.category), hideBelow: 'md' },
      { key: 'priority', label: 'Priority', kind: 'pill', value: r => lbl(E.TICKET_PRIORITY_LABELS, r.priority), tone: r => r.priority === E.TicketPriority.Emergency ? 'danger' : 'neutral' },
      { key: 'raisedAt', label: 'Raised', kind: 'datetime' },
      { key: 'slaDueAt', label: 'Due', kind: 'datetime', sub: r => r.slaBreached ? 'breached' : null, tone: r => r.slaBreached ? 'danger' : 'neutral' },
      { key: 'assignedToName', label: 'With', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.TICKET_STATUS_LABELS, r.status), tone: r => ticketTone(r.status) },
    ],
    filters: [
      { key: 'category', label: 'Category', kind: 'select', options: enumOptions(E.COMPLAINT_CATEGORY_LABELS) },
      { key: 'priority', label: 'Priority', kind: 'select', options: enumOptions(E.TICKET_PRIORITY_LABELS) },
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.TICKET_STATUS_LABELS) },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: {  } },
      { key: 'emergency', label: 'Emergencies', apply: { priority: E.TicketPriority.Emergency }, tone: 'danger' },
      { key: 'breached', label: 'Past their time', apply: { breachedOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'assign', label: 'Assign', icon: 'person_add', tone: 'accent' },
    ],
  };

  /** Which society this screen is showing. Read from the route the sidebar linked to. */
  protected societyId = '';

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  fetch = (q: ListQueryState) =>
    this.societies.searchComplaints({ page: q.page, pageSize: q.pageSize, search: q.search, societyId: this.societyId, categories: q.filters['category'] ? [(q.filters['category'] as any)] : undefined, priority: (q.filters['priority'] as any), statuses: q.filters['status'] ? [(q.filters['status'] as any)] : undefined });

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
