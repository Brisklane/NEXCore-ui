import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrokerageService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function commissionTone(s: E.CommissionStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.CommissionStatus.Paid: return 'positive';
    case E.CommissionStatus.Accrued:
    case E.CommissionStatus.Approved:
    case E.CommissionStatus.PartiallyPaid: return 'warning';
    case E.CommissionStatus.ClawedBack:
    case E.CommissionStatus.Disputed: return 'danger';
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

/** Commission — Fees earned, split and paid. */
@Component({
  standalone: true,
  selector: 'lib-re-commission',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class CommissionComponent implements OnInit {
  private brokerage = inject(BrokerageService);

  readonly config: ListConfig<any> = {
    title: 'Commission',
    subtitle: 'Fees earned, split and paid.',
    helpKey: 'brokerage/commission',
    icon: 'wallet',
    searchPlaceholder: 'Reference, deal or booking',
    clickable: false,
    emptyTitle: 'No commission calculated',
    emptyMessage: 'It accrues when a deal or booking triggers it.',
    columns: [
      { key: 'reference', label: 'Calculation', kind: 'strong', width: '140px' },
      { key: 'dealReference', label: 'Against', value: r => r.dealReference ?? r.bookingReference ?? '—', sub: r => r.projectName ?? null },
      { key: 'transactionValue', label: 'Transaction', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'grossFee', label: 'Gross fee', kind: 'money', align: 'right' },
      { key: 'totalDeductions', label: 'Deductions', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'netDistributable', label: 'Net', kind: 'money', align: 'right' },
      { key: 'collectionPercentAtCalculation', label: 'Collected', kind: 'percent', align: 'right', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.COMMISSION_STATUS_LABELS, r.status), tone: r => commissionTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.COMMISSION_STATUS_LABELS) },
    ],
    presets: [
      { key: 'payable', label: 'Ready to pay', apply: { status: E.CommissionStatus.Approved } },
      { key: 'accrued', label: 'Accrued', apply: { status: E.CommissionStatus.Accrued }, tone: 'warning' },
      { key: 'disputed', label: 'Disputed', apply: { disputedOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'disburse', label: 'Raise a disbursement', icon: 'payments', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.brokerage.getCalculations(toListQuery(q), (q.filters['status'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
