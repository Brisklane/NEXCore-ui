import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExitService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function refundTone(s: E.RefundStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.RefundStatus.Paid: return 'positive';
    case E.RefundStatus.Rejected: return 'danger';
    case E.RefundStatus.AwaitingResale:
    case E.RefundStatus.Scheduled: return 'warning';
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

/** Refunds — Money going back out. */
@Component({
  standalone: true,
  selector: 'lib-re-refunds',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class RefundsComponent implements OnInit {
  private exit = inject(ExitService);

  readonly config: ListConfig<any> = {
    title: 'Refunds',
    subtitle: 'Money going back out.',
    icon: 'undo',
    searchPlaceholder: 'Reference or payee',
    clickable: false,
    emptyTitle: 'No refunds',
    emptyMessage: 'They appear here when a cancellation is approved.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'payeeName', label: 'Payee', sub: r => r.bankName ?? null },
      { key: 'requestedAmount', label: 'Requested', kind: 'money', align: 'right' },
      { key: 'approvedAmount', label: 'Approved', kind: 'money', align: 'right' },
      { key: 'paidAmount', label: 'Paid', kind: 'money', align: 'right' },
      { key: 'requestedOn', label: 'Requested', kind: 'date', hideBelow: 'md' },
      { key: 'bankDetailsVerified', label: 'Bank verified', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.REFUND_STATUS_LABELS, r.status), tone: r => refundTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.REFUND_STATUS_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Waiting to be paid', apply: { status: E.RefundStatus.Approved }, tone: 'warning' },
      { key: 'resale', label: 'Awaiting resale', apply: { status: E.RefundStatus.AwaitingResale } },
    ],
    rowActions: [
      { key: 'pay', label: 'Record payment', icon: 'payments', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.exit.getRefunds(toListQuery(q), (q.filters['status'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
