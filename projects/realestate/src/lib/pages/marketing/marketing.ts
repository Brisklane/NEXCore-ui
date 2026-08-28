import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Marketing — Campaigns and what they produced. */
@Component({
  standalone: true,
  selector: 'lib-re-marketing',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class MarketingComponent implements OnInit {
  private listings = inject(ListingService);

  readonly config: ListConfig<any> = {
    title: 'Marketing',
    subtitle: 'Campaigns and what they produced.',
    icon: 'campaign',
    searchPlaceholder: 'Campaign name',
    createLabel: 'New campaign',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No campaigns',
    emptyMessage: 'Record one so the leads it produces can be attributed to it.',
    columns: [
      { key: 'name', label: 'Campaign', kind: 'strong', sub: r => r.channel ?? null },
      { key: 'startsOn', label: 'Ran', kind: 'date', sub: r => r.endsOn ? 'to ' + r.endsOn : 'ongoing' },
      { key: 'budget', label: 'Budget', kind: 'money', align: 'right' },
      { key: 'spend', label: 'Spent', kind: 'money', align: 'right' },
      { key: 'enquiryCount', label: 'Enquiries', kind: 'number', align: 'right' },
      { key: 'bookingCount', label: 'Bookings', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'costPerEnquiry', label: 'Cost per enquiry', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'isActive', label: 'Live', kind: 'bool', align: 'center' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.listings.getCampaigns(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
