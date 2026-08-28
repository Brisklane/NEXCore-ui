import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Turnover rent — Tenant sales declarations. */
@Component({
  standalone: true,
  selector: 'lib-re-turnover',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class TurnoverComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Turnover rent',
    subtitle: 'Tenant sales declarations.',
    icon: 'storefront',
    searchPlaceholder: 'Tenant or unit',
    createLabel: 'Record a declaration',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No declarations',
    emptyMessage: 'Turnover rent needs the tenant to declare their takings first.',
    columns: [
      { key: 'tenantName', label: 'Tenant', kind: 'strong', sub: r => r.unitNumber ?? null },
      { key: 'periodFrom', label: 'Period', kind: 'date', sub: r => 'to ' + (r.periodTo ?? '') },
      { key: 'declaredSales', label: 'Declared', kind: 'money', align: 'right' },
      { key: 'breakpoint', label: 'Breakpoint', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'overageDue', label: 'Overage due', kind: 'money', align: 'right' },
      { key: 'dueOn', label: 'Due', kind: 'date', sub: r => r.isOverdue ? 'overdue' : null, tone: r => r.isOverdue ? 'danger' : 'neutral' },
      { key: 'isCertified', label: 'Certified', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'overdueOnly', label: 'Overdue only', kind: 'toggle' },
    ],
    presets: [
      { key: 'overdue', label: 'Overdue', apply: { overdueOnly: true }, tone: 'danger' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getSalesDeclarations(toListQuery(q), undefined, (q.filters['overdueOnly'] as any) ?? false);

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
