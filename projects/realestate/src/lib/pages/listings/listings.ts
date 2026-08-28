import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function listingTone(s: E.ListingStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.ListingStatus.Live: return 'positive';
    case E.ListingStatus.UnderOffer:
    case E.ListingStatus.SubjectToContract: return 'warning';
    case E.ListingStatus.Withdrawn:
    case E.ListingStatus.Rejected:
    case E.ListingStatus.Expired: return 'danger';
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

/** Listings — What is on the market. */
@Component({
  standalone: true,
  selector: 'lib-re-listings',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowClick)="open($any($event))"
      (create)="create()"
    />
  `,
})
export class ListingsComponent implements OnInit {
  private listings = inject(ListingService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Listings',
    subtitle: 'What is on the market.',
    helpKey: 'listings',
    icon: 'sell',
    searchPlaceholder: 'Reference, address or headline',
    scope: 'office',
    createLabel: 'New listing',
    createIcon: 'add',
    emptyTitle: 'Nothing listed',
    emptyMessage: 'Create a listing to advertise a property.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'addressOneLine', label: 'Property', sub: r => r.headline ?? null },
      { key: 'kind', label: 'For', kind: 'pill', value: r => lbl(E.LISTING_KIND_LABELS, r.kind) },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.LISTING_STATUS_LABELS, r.status), tone: r => listingTone(r.status) },
      { key: 'askingPrice', label: 'Asking', kind: 'money', align: 'right' },
      { key: 'daysOnMarket', label: 'Days', kind: 'days', align: 'right', hideBelow: 'md' },
      { key: 'viewingCount', label: 'Viewings', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'enquiryCount', label: 'Enquiries', kind: 'number', align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'kind', label: 'For', kind: 'select', options: enumOptions(E.LISTING_KIND_LABELS) },
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.LISTING_STATUS_LABELS) },
    ],
    presets: [
      { key: 'live', label: 'Live', apply: { status: E.ListingStatus.Live } },
      { key: 'under-offer', label: 'Under offer', apply: { status: E.ListingStatus.UnderOffer } },
      { key: 'draft', label: 'Not published', apply: { status: E.ListingStatus.Draft } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.listings.search({ page: q.page, pageSize: q.pageSize, search: q.search, kinds: q.filters['kind'] ? [(q.filters['kind'] as any)] : undefined, statuses: q.filters['status'] ? [(q.filters['status'] as any)] : undefined, officeId: q.scopeId ?? undefined });

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/listings/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
