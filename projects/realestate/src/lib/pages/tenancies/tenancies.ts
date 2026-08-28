import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeasingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function tenancyTone(s: E.TenancyStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.TenancyStatus.Active:
    case E.TenancyStatus.Renewed: return 'positive';
    case E.TenancyStatus.Expiring:
    case E.TenancyStatus.NoticeGiven: return 'warning';
    case E.TenancyStatus.InEviction:
    case E.TenancyStatus.Abandoned: return 'danger';
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

/** Tenancies — Every tenancy, its rent and its arrears. */
@Component({
  standalone: true,
  selector: 'lib-re-tenancies',
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
export class TenanciesComponent implements OnInit {
  private leasing = inject(LeasingService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Tenancies',
    subtitle: 'Every tenancy, its rent and its arrears.',
    helpKey: 'leasing/tenancies',
    icon: 'key',
    searchPlaceholder: 'Reference, property or tenant',
    scope: 'office',
    createLabel: 'New tenancy',
    createIcon: 'add',
    emptyTitle: 'No tenancies',
    emptyMessage: 'Create one from an instruction or a property.',
    columns: [
      { key: 'reference', label: 'Tenancy', kind: 'strong', width: '130px' },
      { key: 'addressOneLine', label: 'Property', sub: r => r.tenantName ?? null },
      { key: 'rent', label: 'Rent', kind: 'money', sub: r => r.frequencyLabel ?? null, align: 'right' },
      { key: 'startDate', label: 'From', kind: 'date', hideBelow: 'md' },
      { key: 'endDate', label: 'To', kind: 'date', sub: r => r.daysToEnd !== undefined && r.daysToEnd <= 90 ? 'ending soon' : null },
      { key: 'arrearsAmount', label: 'Arrears', kind: 'money', sub: r => r.daysInArrears ? r.daysInArrears + ' days' : null, align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.TENANCY_STATUS_LABELS, r.status), tone: r => tenancyTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.TENANCY_STATUS_LABELS) },
    ],
    presets: [
      { key: 'live', label: 'Live', apply: { status: E.TenancyStatus.Active } },
      { key: 'arrears', label: 'In arrears', apply: { inArrearsOnly: true }, tone: 'danger' },
      { key: 'ending', label: 'Ending soon', apply: { endingSoonOnly: true }, tone: 'warning' },
      { key: 'notice', label: 'On notice', apply: { status: E.TenancyStatus.NoticeGiven } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.searchTenancies({ page: q.page, pageSize: q.pageSize, search: q.search, officeId: q.scopeId ?? undefined, statuses: q.filters['status'] ? [(q.filters['status'] as any)] : undefined });

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/leasing/tenancies/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
