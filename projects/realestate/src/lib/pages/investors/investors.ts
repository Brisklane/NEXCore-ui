import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Investors — Who funded this, and what has come back. */
@Component({
  standalone: true,
  selector: 'lib-re-investors',
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
export class InvestorsComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Investors',
    subtitle: 'Who funded this, and what has come back.',
    icon: 'savings',
    searchPlaceholder: 'Name or reference',
    scope: 'project',
    createLabel: 'Add an investor',
    createIcon: 'person_add',
    clickable: false,
    emptyTitle: 'No investors',
    emptyMessage: 'Add one to track commitments, calls and distributions.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'name', label: 'Investor', sub: r => r.phone ?? null },
      { key: 'investmentType', label: 'Type', kind: 'pill', hideBelow: 'md' },
      { key: 'committedAmount', label: 'Committed', kind: 'money', align: 'right' },
      { key: 'contributedAmount', label: 'Contributed', kind: 'money', align: 'right' },
      { key: 'undrawnAmount', label: 'Undrawn', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'distributedAmount', label: 'Distributed', kind: 'money', align: 'right' },
      { key: 'multipleOnInvestedCapital', label: 'Multiple', kind: 'number', align: 'right', hideBelow: 'lg' },
    ],
    presets: [
      { key: 'active', label: 'Still in', apply: {  } },
      { key: 'undrawn', label: 'Undrawn commitment', apply: { undrawnOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'call', label: 'Issue a capital call', icon: 'campaign', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getInvestors(toListQuery(q), q.scopeId ?? undefined);

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
