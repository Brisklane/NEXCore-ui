import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Utility bills — What each unit consumed and owes. */
@Component({
  standalone: true,
  selector: 'lib-re-utilities',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class UtilitiesComponent implements OnInit {
  private facility = inject(FacilityService);

  readonly config: ListConfig<any> = {
    title: 'Utility bills',
    subtitle: 'What each unit consumed and owes.',
    icon: 'bolt',
    searchPlaceholder: 'Bill number or unit',
    createLabel: 'Generate bills',
    createIcon: 'playlist_add',
    clickable: false,
    emptyTitle: 'No utility bills',
    emptyMessage: 'Generate them once the meters have been read.',
    columns: [
      { key: 'billNumber', label: 'Bill', kind: 'strong', width: '140px' },
      { key: 'unitNumber', label: 'Unit', sub: r => r.partyName ?? null },
      { key: 'periodFrom', label: 'Period', kind: 'date', sub: r => 'to ' + (r.periodTo ?? '') },
      { key: 'consumption', label: 'Consumption', kind: 'number', align: 'right' },
      { key: 'commonAreaShare', label: 'Common share', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'totalAmount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'paidAmount', label: 'Paid', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'isEstimated', label: 'Estimated', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    presets: [
      { key: 'unpaid', label: 'Unpaid', apply: { unpaidOnly: true }, tone: 'warning' },
      { key: 'estimated', label: 'Estimated', apply: { estimatedOnly: true } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.facility.getUtilityBills(toListQuery(q), undefined);

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
