import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Land acquisitions — Land being bought, and what it has cost. */
@Component({
  standalone: true,
  selector: 'lib-re-acquisitions',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class AcquisitionsComponent implements OnInit {
  private properties = inject(PropertyService);

  readonly config: ListConfig<any> = {
    title: 'Land acquisitions',
    subtitle: 'Land being bought, and what it has cost.',
    helpKey: 'acquisitions',
    icon: 'handshake',
    searchPlaceholder: 'Reference or seller',
    createLabel: 'Start an acquisition',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'Nothing being acquired',
    emptyMessage: 'Record an acquisition to track its stages, approvals and costs.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'sellerName', label: 'Seller', sub: r => r.parcelReference ?? null },
      { key: 'stage', label: 'Stage', kind: 'pill' },
      { key: 'agreedPrice', label: 'Agreed', kind: 'money', align: 'right' },
      { key: 'paidAmount', label: 'Paid', kind: 'money', align: 'right' },
      { key: 'totalCost', label: 'Total cost', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'targetCompletionDate', label: 'Target', kind: 'date', hideBelow: 'lg' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.properties.getAcquisitions(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
