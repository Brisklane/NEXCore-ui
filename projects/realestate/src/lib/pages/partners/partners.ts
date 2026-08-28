import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BrokerageService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function partnerTone(s: E.PartnerStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.PartnerStatus.Active: return 'positive';
    case E.PartnerStatus.Applied:
    case E.PartnerStatus.UnderReview: return 'warning';
    case E.PartnerStatus.Suspended:
    case E.PartnerStatus.Blacklisted: return 'danger';
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

/** Channel partners — Who sells for you. */
@Component({
  standalone: true,
  selector: 'lib-re-partners',
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
export class PartnersComponent implements OnInit {
  private brokerage = inject(BrokerageService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Channel partners',
    subtitle: 'Who sells for you.',
    helpKey: 'brokerage/partners',
    icon: 'groups',
    searchPlaceholder: 'Name, contact or phone',
    createLabel: 'Onboard a partner',
    createIcon: 'group_add',
    emptyTitle: 'No channel partners',
    emptyMessage: 'Onboard one to start taking their registrations.',
    columns: [
      { key: 'name', label: 'Partner', kind: 'strong', sub: r => r.tradingName ?? r.reference },
      { key: 'contactName', label: 'Contact', sub: r => r.phone ?? null },
      { key: 'tierName', label: 'Tier', kind: 'pill', hideBelow: 'md' },
      { key: 'bookingsMade', label: 'Bookings', kind: 'number', align: 'right' },
      { key: 'bookingValue', label: 'Value', kind: 'money', align: 'right' },
      { key: 'conversionPercent', label: 'Conversion', kind: 'percent', align: 'right', hideBelow: 'md' },
      { key: 'commissionPending', label: 'Owed', kind: 'money', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.PARTNER_STATUS_LABELS, r.status), tone: r => partnerTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.PARTNER_STATUS_LABELS) },
    ],
    presets: [
      { key: 'active', label: 'Active', apply: { status: E.PartnerStatus.Active } },
      { key: 'pending', label: 'Applying', apply: { status: E.PartnerStatus.Applied }, tone: 'warning' },
      { key: 'documents', label: 'Documents expired', apply: { documentsExpiredOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.brokerage.getPartners(toListQuery(q), (q.filters['status'] as any));

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/brokerage/partners/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
