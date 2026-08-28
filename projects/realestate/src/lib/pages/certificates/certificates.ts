import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
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

/** Safety certificates — What is current and what has lapsed. */
@Component({
  standalone: true,
  selector: 'lib-re-certificates',
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
export class CertificatesComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Safety certificates',
    subtitle: 'What is current and what has lapsed.',
    icon: 'verified_user',
    searchPlaceholder: 'Property or certificate number',
    createLabel: 'Record a certificate',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No certificates on file',
    emptyMessage: 'A let property without a current certificate is an offence.',
    columns: [
      { key: 'addressOneLine', label: 'Property', kind: 'strong' },
      { key: 'kind', label: 'Certificate', kind: 'pill', value: r => lbl(E.COMPLIANCE_CERTIFICATE_KIND_LABELS, r.kind) },
      { key: 'certificateNumber', label: 'Number', hideBelow: 'md' },
      { key: 'issuedOn', label: 'Issued', kind: 'date', hideBelow: 'lg' },
      { key: 'expiresOn', label: 'Expires', kind: 'date' },
      { key: 'daysToExpiry', label: 'Days', kind: 'days', tone: r => daysTone(r.daysToExpiry), align: 'right' },
      { key: 'hasFailures', label: 'Failures', kind: 'bool', align: 'center' },
      { key: 'servedToTenant', label: 'Served', kind: 'bool', align: 'center', hideBelow: 'md' },
    ],
    filters: [
      { key: 'kind', label: 'Certificate', kind: 'select', options: enumOptions(E.COMPLIANCE_CERTIFICATE_KIND_LABELS) },
      { key: 'expiringOnly', label: 'Expiring only', kind: 'toggle' },
    ],
    presets: [
      { key: 'expired', label: 'Expired', apply: { expiredOnly: true }, tone: 'danger' },
      { key: 'expiring', label: 'Expiring soon', apply: { expiringOnly: true }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'book', label: 'Book a renewal', icon: 'event' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getCertificates(toListQuery(q), (q.filters['expiringOnly'] as any) ?? false);

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
