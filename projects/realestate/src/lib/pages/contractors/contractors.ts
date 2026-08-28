import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService } from '../../services/realestate.services';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Contractors — Who does the work. */
@Component({
  standalone: true,
  selector: 'lib-re-contractors',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class ContractorsComponent implements OnInit {
  private facility = inject(FacilityService);

  readonly config: ListConfig<any> = {
    title: 'Contractors',
    subtitle: 'Who does the work.',
    icon: 'engineering',
    searchPlaceholder: 'Name, contact or trade',
    createLabel: 'Add a contractor',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No contractors',
    emptyMessage: 'Add one before assigning work.',
    columns: [
      { key: 'name', label: 'Contractor', kind: 'strong', sub: r => r.reference ?? null },
      { key: 'contactName', label: 'Contact', sub: r => r.phone ?? null },
      { key: 'trades', label: 'Trades', hideBelow: 'md' },
      { key: 'openJobCount', label: 'Open jobs', kind: 'number', align: 'right' },
      { key: 'averageRating', label: 'Rating', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'complianceOk', label: 'Compliant', kind: 'bool', tone: r => r.complianceOk ? 'positive' : 'danger', align: 'center' },
      { key: 'isApproved', label: 'Approved', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'approvedOnly', label: 'Approved only', kind: 'toggle' },
    ],
    presets: [
      { key: 'approved', label: 'Approved', apply: { approvedOnly: true } },
      { key: 'lapsed', label: 'Insurance lapsed', apply: { lapsedOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.facility.getContractors(toListQuery(q), (q.filters['trade'] as any), (q.filters['approvedOnly'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
