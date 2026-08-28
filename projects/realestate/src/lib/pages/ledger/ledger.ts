import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Customer ledger — Every movement on an account. */
@Component({
  standalone: true,
  selector: 'lib-re-ledger',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class LedgerComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Customer ledger',
    subtitle: 'Every movement on an account.',
    icon: 'menu_book',
    searchPlaceholder: 'Reference or description',
    clickable: false,
    emptyTitle: 'Nothing on the ledger',
    emptyMessage: 'Movements appear here as demands and receipts are posted.',
    columns: [
      { key: 'entryDate', label: 'Date', kind: 'date' },
      { key: 'entryType', label: 'Type', kind: 'pill' },
      { key: 'description', label: 'Description', sub: r => r.reference ?? null },
      { key: 'debitAmount', label: 'Debit', kind: 'money', align: 'right' },
      { key: 'creditAmount', label: 'Credit', kind: 'money', align: 'right' },
      { key: 'runningBalance', label: 'Balance', kind: 'money', align: 'right' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.money.getLedger(undefined, undefined, toListQuery(q));

}
