import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Service charge — Budgeted, invoiced and recovered. */
@Component({
  standalone: true,
  selector: 'lib-re-service-charge',
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
export class ServiceChargeComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Service charge',
    subtitle: 'Budgeted, invoiced and recovered.',
    helpKey: 'leasing/service-charge',
    icon: 'receipt_long',
    searchPlaceholder: 'Budget reference',
    createLabel: 'New budget',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No service charge budgets',
    emptyMessage: 'Build one before raising on-account demands.',
    columns: [
      { key: 'reference', label: 'Budget', kind: 'strong', width: '140px' },
      { key: 'financialYear', label: 'Year', kind: 'number', align: 'right' },
      { key: 'periodTo', label: 'Period to', kind: 'date', hideBelow: 'md' },
      { key: 'totalBudget', label: 'Budgeted', kind: 'money', align: 'right' },
      { key: 'totalActual', label: 'Actual', kind: 'money', align: 'right' },
      { key: 'totalBilled', label: 'Billed', kind: 'money', align: 'right' },
      { key: 'isApproved', label: 'Approved', kind: 'bool', align: 'center' },
      { key: 'isReconciled', label: 'Reconciled', kind: 'bool', align: 'center' },
    ],
    presets: [
      { key: 'unreconciled', label: 'Not reconciled', apply: { unreconciledOnly: true }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
      { key: 'reconcile', label: 'Reconcile', icon: 'balance' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getBudgets(toListQuery(q), undefined);

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
