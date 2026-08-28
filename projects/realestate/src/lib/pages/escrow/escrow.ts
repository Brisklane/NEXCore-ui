import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Escrow — Buyers money, and what may be withdrawn. */
@Component({
  standalone: true,
  selector: 'lib-re-escrow',
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
export class EscrowComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Escrow',
    subtitle: 'Buyers money, and what may be withdrawn.',
    helpKey: 'finance/escrow',
    icon: 'account_balance',
    searchPlaceholder: 'Reference',
    scope: 'project',
    createLabel: 'Request a withdrawal',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No withdrawals',
    emptyMessage: 'What may be taken out is a function of certified progress, not of the balance.',
    columns: [
      { key: 'reference', label: 'Request', kind: 'strong', width: '140px' },
      { key: 'projectName', label: 'Project' },
      { key: 'requestedOn', label: 'Requested', kind: 'date' },
      { key: 'progressPercentAtRequest', label: 'Certified progress', kind: 'percent', align: 'right' },
      { key: 'entitlementAtRequest', label: 'Entitlement', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'requestedAmount', label: 'Requested', kind: 'money', align: 'right' },
      { key: 'approvedAmount', label: 'Released', kind: 'money', align: 'right' },
      { key: 'exceededEntitlement', label: 'Over entitlement', kind: 'bool', tone: r => r.exceededEntitlement ? 'danger' : 'neutral', align: 'center' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
    presets: [
      { key: 'pending', label: 'Awaiting approval', apply: { pendingOnly: true }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'approve', label: 'Release', icon: 'payments', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getWithdrawals(toListQuery(q), q.scopeId ?? undefined);

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
