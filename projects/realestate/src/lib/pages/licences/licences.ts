import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { FinanceService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** A countdown: red once it has passed, amber inside a month. */
function daysTone(days: number | undefined | null): 'positive' | 'warning' | 'danger' {
  if (days === undefined || days === null) return 'positive';
  if (days < 0) return 'danger';
  if (days <= 30) return 'warning';
  return 'positive';
}

/** Licences — What this business needs to trade. */
@Component({
  standalone: true,
  selector: 'lib-re-licences',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class LicencesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Licences',
    subtitle: 'What this business needs to trade.',
    icon: 'id_card',
    createLabel: 'Record a licence',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No licences on file',
    emptyMessage: 'Trading without one is not a paperwork problem; it voids the transactions.',
    columns: [
      { key: 'licenceType', label: 'Licence', kind: 'strong', sub: r => r.licenceNumber ?? null },
      { key: 'authority', label: 'Authority', hideBelow: 'md' },
      { key: 'officeName', label: 'Office', sub: r => r.agentName ?? null, hideBelow: 'lg' },
      { key: 'issuedOn', label: 'Issued', kind: 'date', hideBelow: 'md' },
      { key: 'expiresOn', label: 'Expires', kind: 'date' },
      { key: 'daysToExpiry', label: 'Days', kind: 'days', tone: r => daysTone(r.daysToExpiry), align: 'right' },
      { key: 'isMandatoryToTrade', label: 'Required', kind: 'bool', align: 'center' },
      { key: 'renewalFee', label: 'Renewal fee', kind: 'money', align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'expiringOnly', label: 'Expiring only', kind: 'toggle' },
    ],
    presets: [
      { key: 'current', label: 'Current', apply: {  } },
      { key: 'expiring', label: 'Expiring', apply: { expiringOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  /** Wraps a non-paged endpoint in the page envelope the list expects. */
  private wrap<T>(source: Observable<M.ApiResponse<T[]>>): Observable<M.PaginatedResponse<T>> {
    return source.pipe(map(r => ({
      success: r.success,
      data: r.data ?? [],
      pagination: {
        currentPage: 1,
        pageSize: (r.data ?? []).length || 1,
        totalCount: (r.data ?? []).length,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      },
    })));
  }

  fetch = (q: ListQueryState) =>
    this.wrap(this.finance.getLicences((q.filters['expiringOnly'] as any) ?? false));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
