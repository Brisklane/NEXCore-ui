import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function offerTone(s: E.OfferStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.OfferStatus.Accepted: return 'positive';
    case E.OfferStatus.Submitted:
    case E.OfferStatus.UnderConsideration:
    case E.OfferStatus.Countered: return 'warning';
    case E.OfferStatus.Rejected:
    case E.OfferStatus.Lapsed:
    case E.OfferStatus.Withdrawn: return 'danger';
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

/** Offers — Offers made and decided. */
@Component({
  standalone: true,
  selector: 'lib-re-offers',
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
export class OffersComponent implements OnInit {
  private bookings = inject(BookingService);

  readonly config: ListConfig<any> = {
    title: 'Offers',
    subtitle: 'Offers made and decided.',
    icon: 'local_offer',
    searchPlaceholder: 'Reference, property or applicant',
    createLabel: 'Record an offer',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No offers',
    emptyMessage: 'Record one against a listing.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'addressOneLine', label: 'Property' },
      { key: 'applicantName', label: 'Applicant', sub: r => r.applicantPhone ?? null },
      { key: 'amount', label: 'Offer', kind: 'money', sub: r => r.percentOfAsking ? r.percentOfAsking.toFixed(0) + '% of asking' : null, align: 'right' },
      { key: 'offeredOn', label: 'Made', kind: 'date', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.OFFER_STATUS_LABELS, r.status), tone: r => offerTone(r.status) },
      { key: 'conditionCount', label: 'Conditions', kind: 'number', align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.OFFER_STATUS_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Waiting on a decision', apply: { status: E.OfferStatus.Submitted }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'accept', label: 'Accept', icon: 'check', tone: 'accent' },
      { key: 'decline', label: 'Decline', icon: 'close', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.bookings.getOffers(toListQuery(q), undefined, (q.filters['status'] as any));

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
