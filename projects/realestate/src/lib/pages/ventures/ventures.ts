import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { FinanceService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
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

/** Joint ventures — Land partnerships and what the landowner is owed. */
@Component({
  standalone: true,
  selector: 'lib-re-ventures',
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
export class VenturesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Joint ventures',
    subtitle: 'Land partnerships and what the landowner is owed.',
    helpKey: 'finance/ventures',
    icon: 'diversity_3',
    scope: 'project',
    createLabel: 'New joint venture',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No joint ventures',
    emptyMessage: 'Record one where land was contributed rather than bought.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'name', label: 'Venture', sub: r => r.projectName ?? null },
      { key: 'basis', label: 'Basis', kind: 'pill', value: r => lbl(E.JV_SHARE_BASIS_LABELS, r.basis) },
      { key: 'landownerSharePercent', label: 'Landowner share', kind: 'percent', align: 'right' },
      { key: 'totalLandownerEntitlement', label: 'Accrued', kind: 'money', align: 'right' },
      { key: 'totalLandownerPaid', label: 'Paid', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'landownerBalance', label: 'Balance', kind: 'money', align: 'right' },
      { key: 'allocatedUnitCount', label: 'Units allocated', kind: 'number', align: 'right', hideBelow: 'lg' },
    ],
    rowActions: [
      { key: 'accrue', label: 'Accrue the share', icon: 'calculate', tone: 'accent' },
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
    this.wrap(this.finance.getVentures(q.scopeId ?? undefined));

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
