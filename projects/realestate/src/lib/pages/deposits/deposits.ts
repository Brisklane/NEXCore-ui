import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Deposits — Taken, protected and returned. */
@Component({
  standalone: true,
  selector: 'lib-re-deposits',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class DepositsComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Deposits',
    subtitle: 'Taken, protected and returned.',
    helpKey: 'leasing/deposits',
    icon: 'savings',
    searchPlaceholder: 'Tenancy, tenant or scheme reference',
    clickable: false,
    emptyTitle: 'No deposits held',
    emptyMessage: 'They appear here when a tenancy takes one.',
    columns: [
      { key: 'tenancyReference', label: 'Tenancy', kind: 'strong', sub: r => r.tenantName ?? null },
      { key: 'amount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'takenOn', label: 'Taken', kind: 'date' },
      { key: 'schemeName', label: 'Scheme', sub: r => r.schemeReference ?? null, hideBelow: 'md' },
      { key: 'registeredOn', label: 'Protected', kind: 'date', sub: r => r.registrationOverdue ? 'past the deadline' : null, tone: r => r.registrationOverdue ? 'danger' : 'neutral' },
      { key: 'deductionTotal', label: 'Deductions', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'isReleased', label: 'Released', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'unregisteredOnly', label: 'Unprotected only', kind: 'toggle' },
    ],
    presets: [
      { key: 'unprotected', label: 'Not yet protected', apply: { unregisteredOnly: true }, tone: 'danger' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'register', label: 'Record protection', icon: 'shield', tone: 'accent' },
      { key: 'release', label: 'Release', icon: 'undo' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getDeposits(toListQuery(q), (q.filters['unregisteredOnly'] as any) ?? false);

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
