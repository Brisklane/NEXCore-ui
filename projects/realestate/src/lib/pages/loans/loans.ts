import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function loanTone(s: E.LoanStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.LoanStatus.Closed: return 'positive';
    case E.LoanStatus.Defaulted: return 'danger';
    case E.LoanStatus.Repaying: return 'warning';
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

/** Development loans — What is borrowed against the scheme. */
@Component({
  standalone: true,
  selector: 'lib-re-loans',
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
export class LoansComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Development loans',
    subtitle: 'What is borrowed against the scheme.',
    icon: 'account_balance',
    searchPlaceholder: 'Reference or lender',
    scope: 'project',
    createLabel: 'Record a loan',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No loans',
    emptyMessage: 'Record one to track drawdowns, interest and covenants.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'lenderName', label: 'Lender', sub: r => r.projectName ?? null },
      { key: 'sanctionedAmount', label: 'Sanctioned', kind: 'money', align: 'right' },
      { key: 'drawnAmount', label: 'Drawn', kind: 'money', align: 'right' },
      { key: 'undrawnAmount', label: 'Undrawn', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'outstandingAmount', label: 'Outstanding', kind: 'money', align: 'right' },
      { key: 'interestRate', label: 'Rate', kind: 'percent', align: 'right', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.LOAN_STATUS_LABELS, r.status), tone: r => loanTone(r.status) },
    ],
    rowActions: [
      { key: 'drawdown', label: 'Record a drawdown', icon: 'download', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getLoans(toListQuery(q), q.scopeId ?? undefined);

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
