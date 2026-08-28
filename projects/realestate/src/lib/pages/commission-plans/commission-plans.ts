import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { BrokerageService } from '../../services/realestate.services';
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

/** Commission plans — How fees are split. */
@Component({
  standalone: true,
  selector: 'lib-re-commission-plans',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class CommissionPlansComponent implements OnInit {
  private brokerage = inject(BrokerageService);

  readonly config: ListConfig<any> = {
    title: 'Commission plans',
    subtitle: 'How fees are split.',
    icon: 'rule',
    scope: 'project',
    createLabel: 'New plan',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No commission plans',
    emptyMessage: 'Create one so a fee has a rule to split by.',
    columns: [
      { key: 'name', label: 'Plan', kind: 'strong', sub: r => r.projectName ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.COMMISSION_PLAN_KIND_LABELS, r.kind) },
      { key: 'appliesTo', label: 'Applies to', hideBelow: 'md' },
      { key: 'agentSharePercent', label: 'Agent share', kind: 'percent', align: 'right' },
      { key: 'annualCapAmount', label: 'Annual cap', kind: 'money', align: 'right' },
      { key: 'assignedCount', label: 'People on it', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'isActive', label: 'Active', kind: 'bool', align: 'center' },
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
    this.wrap(this.brokerage.getPlans((q.filters['appliesTo'] as any), q.scopeId ?? undefined));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
