import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExitService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
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

/** Cancellations — Bookings being unwound. */
@Component({
  standalone: true,
  selector: 'lib-re-cancellations',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class CancellationsComponent implements OnInit {
  private exit = inject(ExitService);

  readonly config: ListConfig<any> = {
    title: 'Cancellations',
    subtitle: 'Bookings being unwound.',
    helpKey: 'exit/cancellations',
    icon: 'cancel',
    searchPlaceholder: 'Reference, customer or booking',
    createLabel: 'Start a cancellation',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'Nothing being cancelled',
    emptyMessage: 'Long may it last.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'partyName', label: 'Customer', sub: r => r.bookingReference ?? null },
      { key: 'trigger', label: 'Trigger', kind: 'pill', value: r => lbl(E.CANCELLATION_TRIGGER_LABELS, r.trigger) },
      { key: 'reasonLabel', label: 'Reason', hideBelow: 'lg' },
      { key: 'totalPaid', label: 'Paid', kind: 'money', align: 'right' },
      { key: 'deductionAmount', label: 'Deducted', kind: 'money', align: 'right' },
      { key: 'refundableAmount', label: 'Refundable', kind: 'money', align: 'right' },
      { key: 'outcome', label: 'Outcome', kind: 'pill', value: r => lbl(E.APPROVAL_OUTCOME_LABELS, r.outcome), tone: r => outcomeTone(r.outcome) },
    ],
    presets: [
      { key: 'pending', label: 'Waiting on a decision', apply: { outcome: E.ApprovalOutcome.Pending }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.exit.getCancellations(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
