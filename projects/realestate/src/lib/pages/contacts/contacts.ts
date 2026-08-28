import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CrmService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function kycTone(s: E.KycStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.KycStatus.Verified: return 'positive';
    case E.KycStatus.PendingVerification:
    case E.KycStatus.InProgress:
    case E.KycStatus.EnhancedReview: return 'warning';
    case E.KycStatus.Rejected:
    case E.KycStatus.Expired: return 'danger';
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

/** Contacts — Everybody this business deals with. */
@Component({
  standalone: true,
  selector: 'lib-re-contacts',
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
export class ContactsComponent implements OnInit {
  private crm = inject(CrmService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Contacts',
    subtitle: 'Everybody this business deals with.',
    helpKey: 'contacts',
    icon: 'contacts',
    searchPlaceholder: 'Name, phone, email or identity number',
    createLabel: 'Add a contact',
    createIcon: 'person_add',
    emptyTitle: 'No contacts yet',
    emptyMessage: 'Add somebody, or import an existing list under Setup.',
    columns: [
      { key: 'displayName', label: 'Name', kind: 'strong', sub: r => r.reference ?? null },
      { key: 'primaryPhone', label: 'Phone', sub: r => r.primaryEmail ?? null },
      { key: 'roles', label: 'Roles', kind: 'pill', value: r => r.roleLabels?.join(', '), hideBelow: 'md' },
      { key: 'city', label: 'City', hideBelow: 'lg' },
      { key: 'kycStatus', label: 'KYC', kind: 'pill', value: r => lbl(E.KYC_STATUS_LABELS, r.kycStatus), tone: r => kycTone(r.kycStatus) },
      { key: 'isOnCautionList', label: 'Caution', kind: 'bool', align: 'center', hideBelow: 'md' },
    ],
    filters: [
      { key: 'role', label: 'Role', kind: 'select', options: enumOptions(E.PARTY_ROLE_KIND_LABELS) },
      { key: 'kycStatus', label: 'KYC', kind: 'select', options: enumOptions(E.KYC_STATUS_LABELS) },
    ],
    presets: [
      { key: 'all', label: 'Everyone', apply: {  } },
      { key: 'buyers', label: 'Buyers', apply: { role: E.PartyRoleKind.Buyer } },
      { key: 'tenants', label: 'Tenants', apply: { role: E.PartyRoleKind.Tenant } },
      { key: 'landlords', label: 'Landlords', apply: { role: E.PartyRoleKind.Landlord } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.crm.searchParties({ page: q.page, pageSize: q.pageSize, search: q.search, role: (q.filters['role'] as any), kycStatus: (q.filters['kycStatus'] as any) });

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/contacts/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
