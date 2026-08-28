import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Customer mortgages — Bank funding behind a booking. */
@Component({
  standalone: true,
  selector: 'lib-re-mortgages',
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
export class MortgagesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Customer mortgages',
    subtitle: 'Bank funding behind a booking.',
    icon: 'home_work',
    searchPlaceholder: 'Reference, customer or lender',
    createLabel: 'Record a mortgage',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No mortgages',
    emptyMessage: 'Record one so collections knows the bank is paying.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'partyName', label: 'Customer', sub: r => r.bookingReference ?? null },
      { key: 'lenderName', label: 'Lender', hideBelow: 'md' },
      { key: 'sanctionedAmount', label: 'Sanctioned', kind: 'money', align: 'right' },
      { key: 'disbursedAmount', label: 'Disbursed', kind: 'money', align: 'right' },
      { key: 'pendingDisbursement', label: 'Pending', kind: 'money', align: 'right' },
      { key: 'tripartiteAgreementSigned', label: 'Tripartite', kind: 'bool', tone: r => r.tripartiteAgreementSigned ? 'positive' : 'danger', align: 'center' },
      { key: 'status', label: 'Status', kind: 'pill', tone: r => r.sanctionExpiringSoon ? 'warning' : 'neutral' },
    ],
    presets: [
      { key: 'pending', label: 'Awaiting disbursement', apply: { pendingOnly: true }, tone: 'warning' },
      { key: 'expiring', label: 'Sanction expiring', apply: { expiringOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'disburse', label: 'Record a disbursement', icon: 'payments', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getMortgages(toListQuery(q), (q.filters['status'] as any));

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
