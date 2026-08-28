import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** A countdown: red once it has passed, amber inside a month. */
function daysTone(days: number | undefined | null): 'positive' | 'warning' | 'danger' {
  if (days === undefined || days === null) return 'positive';
  if (days < 0) return 'danger';
  if (days <= 30) return 'warning';
  return 'positive';
}

/** Renewals — Tenancies coming to an end. */
@Component({
  standalone: true,
  selector: 'lib-re-renewals',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class RenewalsComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Renewals',
    subtitle: 'Tenancies coming to an end.',
    icon: 'autorenew',
    searchPlaceholder: 'Tenancy, tenant or property',
    clickable: false,
    emptyTitle: 'Nothing ending soon',
    emptyMessage: 'Renewals appear here 120 days out.',
    columns: [
      { key: 'tenancyReference', label: 'Tenancy', kind: 'strong', sub: r => r.tenantName ?? null },
      { key: 'addressOneLine', label: 'Property', hideBelow: 'md' },
      { key: 'currentRent', label: 'Current rent', kind: 'money', align: 'right' },
      { key: 'proposedRent', label: 'Proposed', kind: 'money', sub: r => r.upliftPercent ? '+' + r.upliftPercent.toFixed(1) + '%' : null, align: 'right' },
      { key: 'expiresOn', label: 'Ends', kind: 'date' },
      { key: 'daysToExpiry', label: 'Days', kind: 'days', tone: r => daysTone(r.daysToExpiry), align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
    presets: [
      { key: 'soon', label: 'Next 90 days', apply: {  } },
      { key: 'no-offer', label: 'No offer made yet', apply: { noOfferOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'offer', label: 'Offer a renewal', icon: 'send', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getRenewalPipeline(toListQuery(q), 120);

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
