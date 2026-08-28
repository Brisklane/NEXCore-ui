import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function workOrderTone(s: E.WorkOrderStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.WorkOrderStatus.Completed:
    case E.WorkOrderStatus.SignedOff: return 'positive';
    case E.WorkOrderStatus.AwaitingAuthorisation:
    case E.WorkOrderStatus.AwaitingParts: return 'warning';
    case E.WorkOrderStatus.Rejected:
    case E.WorkOrderStatus.Cancelled: return 'danger';
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

/** Work orders — Repairs raised, assigned and done. */
@Component({
  standalone: true,
  selector: 'lib-re-work-orders',
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
export class WorkOrdersComponent implements OnInit {
  private facility = inject(FacilityService);

  readonly config: ListConfig<any> = {
    title: 'Work orders',
    subtitle: 'Repairs raised, assigned and done.',
    helpKey: 'facility/work-orders',
    icon: 'construction',
    searchPlaceholder: 'Order number, title or property',
    createLabel: 'Raise a work order',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No work orders',
    emptyMessage: 'Raise one from a complaint or an inspection finding.',
    columns: [
      { key: 'orderNumber', label: 'Order', kind: 'strong', width: '140px' },
      { key: 'title', label: 'What', sub: r => r.addressOneLine ?? null },
      { key: 'trade', label: 'Trade', kind: 'pill', hideBelow: 'md' },
      { key: 'priority', label: 'Priority', kind: 'pill', value: r => lbl(E.TICKET_PRIORITY_LABELS, r.priority), tone: r => r.priority === E.TicketPriority.Emergency ? 'danger' : 'neutral' },
      { key: 'assignedToName', label: 'With', sub: r => r.contractorName ?? null, hideBelow: 'md' },
      { key: 'completionDueAt', label: 'Due', kind: 'datetime', sub: r => r.slaBreached ? 'past its time' : null, tone: r => r.slaBreached ? 'danger' : 'neutral' },
      { key: 'totalCost', label: 'Cost', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.WORK_ORDER_STATUS_LABELS, r.status), tone: r => workOrderTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.WORK_ORDER_STATUS_LABELS) },
      { key: 'priority', label: 'Priority', kind: 'select', options: enumOptions(E.TICKET_PRIORITY_LABELS) },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: {  } },
      { key: 'breached', label: 'Past their time', apply: { breachedOnly: true }, tone: 'danger' },
      { key: 'authorise', label: 'Awaiting authorisation', apply: { status: E.WorkOrderStatus.AwaitingAuthorisation }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'assign', label: 'Assign', icon: 'person_add' },
      { key: 'complete', label: 'Complete', icon: 'check', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.facility.searchWorkOrders({ page: q.page, pageSize: q.pageSize, search: q.search, statuses: q.filters['status'] ? [(q.filters['status'] as any)] : undefined, priority: (q.filters['priority'] as any) });

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
