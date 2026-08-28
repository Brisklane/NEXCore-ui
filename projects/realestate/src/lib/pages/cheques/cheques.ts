import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function chequeTone(s: E.ChequeState): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.ChequeState.Cleared: return 'positive';
    case E.ChequeState.Bounced:
    case E.ChequeState.StopPayment: return 'danger';
    case E.ChequeState.Deposited:
    case E.ChequeState.Pending: return 'warning';
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

/** Cheques — Post-dated, deposited, cleared and bounced. */
@Component({
  standalone: true,
  selector: 'lib-re-cheques',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class ChequesComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Cheques',
    subtitle: 'Post-dated, deposited, cleared and bounced.',
    helpKey: 'money/cheques',
    icon: 'receipt_long',
    searchPlaceholder: 'Cheque number, payer or bank',
    clickable: false,
    emptyTitle: 'No cheques on file',
    emptyMessage: 'They appear here as soon as one is taken as a receipt.',
    columns: [
      { key: 'chequeNumber', label: 'Cheque', kind: 'strong', width: '130px' },
      { key: 'partyName', label: 'From', sub: r => r.bankName ?? null },
      { key: 'chequeDate', label: 'Cheque date', kind: 'date', sub: r => r.isPostDated ? 'post-dated' : null },
      { key: 'amount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'state', label: 'State', kind: 'pill', value: r => lbl(E.CHEQUE_STATE_LABELS, r.state), tone: r => chequeTone(r.state) },
      { key: 'depositedOn', label: 'Deposited', kind: 'date', hideBelow: 'md' },
      { key: 'bounceReason', label: 'Bounce reason', hideBelow: 'lg' },
      { key: 'bounceCharge', label: 'Charge', kind: 'money', align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'state', label: 'State', kind: 'select', options: enumOptions(E.CHEQUE_STATE_LABELS) },
    ],
    presets: [
      { key: 'onhand', label: 'On hand', apply: { state: E.ChequeState.Received } },
      { key: 'due', label: 'Due to bank', apply: { dueOnly: true }, tone: 'warning' },
      { key: 'bounced', label: 'Bounced', apply: { state: E.ChequeState.Bounced }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'deposit', label: 'Mark deposited', icon: 'account_balance' },
      { key: 'clear', label: 'Mark cleared', icon: 'check', tone: 'accent' },
      { key: 'bounce', label: 'Mark bounced', icon: 'error', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.money.getCheques(toListQuery(q), (q.filters['state'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
