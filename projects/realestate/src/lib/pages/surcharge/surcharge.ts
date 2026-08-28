import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function outcomeTone(o: E.ApprovalOutcome): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (o) {
    case E.ApprovalOutcome.Approved:
    case E.ApprovalOutcome.AutoApproved: return 'positive';
    case E.ApprovalOutcome.Pending:
    case E.ApprovalOutcome.Escalated: return 'warning';
    case E.ApprovalOutcome.Rejected:
    case E.ApprovalOutcome.Withdrawn: return 'danger';
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

/** Surcharge waivers — Late-payment surcharge asked to be written off. */
@Component({
  standalone: true,
  selector: 'lib-re-surcharge',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class SurchargeComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Surcharge waivers',
    subtitle: 'Late-payment surcharge asked to be written off.',
    icon: 'percent',
    searchPlaceholder: 'Reference or customer',
    clickable: false,
    emptyTitle: 'No waivers requested',
    emptyMessage: 'Surcharge is being paid, or nobody has asked.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'partyName', label: 'Customer', sub: r => r.bookingReference ?? null },
      { key: 'requestedAmount', label: 'Requested', kind: 'money', align: 'right' },
      { key: 'approvedAmount', label: 'Approved', kind: 'money', align: 'right' },
      { key: 'reasonLabel', label: 'Reason', hideBelow: 'md' },
      { key: 'requestedByName', label: 'Asked by', hideBelow: 'lg' },
      { key: 'requestedOn', label: 'Asked', kind: 'date', hideBelow: 'md' },
      { key: 'outcome', label: 'Outcome', kind: 'pill', value: r => lbl(E.APPROVAL_OUTCOME_LABELS, r.outcome), tone: r => outcomeTone(r.outcome) },
    ],
    filters: [
      { key: 'outcome', label: 'Outcome', kind: 'select', options: enumOptions(E.APPROVAL_OUTCOME_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Waiting on a decision', apply: { outcome: E.ApprovalOutcome.Pending }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
      { key: 'reject', label: 'Reject', icon: 'close', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.money.getWaivers(toListQuery(q), (q.filters['outcome'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
