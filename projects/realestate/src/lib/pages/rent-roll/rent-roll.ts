import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Rent roll — What is being collected, from whom. */
@Component({
  standalone: true,
  selector: 'lib-re-rent-roll',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class RentRollComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Rent roll',
    subtitle: 'What is being collected, from whom.',
    helpKey: 'leasing/rent-roll',
    icon: 'table_chart',
    searchPlaceholder: 'Property or tenant',
    scope: 'office',
    clickable: false,
    emptyTitle: 'Nothing let',
    emptyMessage: 'The rent roll fills as tenancies start.',
    columns: [
      { key: 'addressOneLine', label: 'Property', kind: 'strong', sub: r => r.tenantName ?? null },
      { key: 'rent', label: 'Rent', kind: 'money', sub: r => r.frequencyLabel ?? null, align: 'right' },
      { key: 'annualRent', label: 'Annualised', kind: 'money', align: 'right' },
      { key: 'startDate', label: 'From', kind: 'date', hideBelow: 'md' },
      { key: 'endDate', label: 'To', kind: 'date' },
      { key: 'depositAmount', label: 'Deposit', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'arrearsAmount', label: 'Arrears', kind: 'money', tone: r => r.arrearsAmount ? 'danger' : 'neutral', align: 'right' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.searchTenancies({ page: q.page, pageSize: q.pageSize, search: q.search, statuses: [3] });

}
