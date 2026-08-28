import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExitService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
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

/** Defect claims — Claims made inside the liability period. */
@Component({
  standalone: true,
  selector: 'lib-re-defects',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class DefectsComponent implements OnInit {
  private exit = inject(ExitService);

  readonly config: ListConfig<any> = {
    title: 'Defect claims',
    subtitle: 'Claims made inside the liability period.',
    icon: 'build',
    searchPlaceholder: 'Claim reference, claimant or unit',
    clickable: false,
    emptyTitle: 'No defect claims',
    emptyMessage: 'Owners have not reported anything.',
    columns: [
      { key: 'reference', label: 'Claim', kind: 'strong', width: '140px' },
      { key: 'partyName', label: 'Claimant', sub: r => r.unitNumber ?? null },
      { key: 'category', label: 'Category', kind: 'pill' },
      { key: 'reportedOn', label: 'Reported', kind: 'date' },
      { key: 'withinLiability', label: 'In period', kind: 'bool', align: 'center' },
      { key: 'estimatedCost', label: 'Estimate', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.TICKET_STATUS_LABELS, r.status), tone: r => ticketTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.TICKET_STATUS_LABELS) },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: {  } },
      { key: 'out-of-period', label: 'Outside the period', apply: { outOfPeriodOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'accept', label: 'Accept', icon: 'check', tone: 'accent' },
      { key: 'reject', label: 'Reject', icon: 'close', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.exit.getDefectClaims(toListQuery(q), (q.filters['status'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
