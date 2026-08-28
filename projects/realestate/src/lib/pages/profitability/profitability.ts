import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { FinanceService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

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

/** Unit profitability — Realisation against allocated cost. */
@Component({
  standalone: true,
  selector: 'lib-re-profitability',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class ProfitabilityComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Unit profitability',
    subtitle: 'Realisation against allocated cost.',
    icon: 'trending_up',
    scope: 'project',
    clickable: false,
    emptyTitle: 'Nothing to show',
    emptyMessage: 'Allocate costs for the project and every unit margin appears here.',
    columns: [
      { key: 'unitNumber', label: 'Unit', kind: 'strong', sub: r => r.blockName ?? null },
      { key: 'subType', label: 'Type', kind: 'pill', value: r => lbl(E.PROPERTY_SUB_TYPE_LABELS, r.subType), hideBelow: 'md' },
      { key: 'listPrice', label: 'List', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'totalRevenue', label: 'Revenue', kind: 'money', align: 'right' },
      { key: 'totalCost', label: 'Cost', kind: 'money', align: 'right' },
      { key: 'grossMargin', label: 'Margin', kind: 'money', tone: r => r.grossMargin < 0 ? 'danger' : 'neutral', align: 'right' },
      { key: 'marginPercent', label: 'Margin %', kind: 'percent', align: 'right' },
      { key: 'costPerSqFt', label: 'Cost / sq ft', kind: 'money', align: 'right', hideBelow: 'lg' },
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
    this.wrap(this.finance.getUnitProfitability(q.scopeId ?? '', toListQuery(q)));

}
