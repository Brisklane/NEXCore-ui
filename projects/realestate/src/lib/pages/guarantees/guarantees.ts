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

/** Bank guarantees — Cover given and cover held. */
@Component({
  standalone: true,
  selector: 'lib-re-guarantees',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class GuaranteesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Bank guarantees',
    subtitle: 'Cover given and cover held.',
    icon: 'shield',
    scope: 'project',
    createLabel: 'Record a guarantee',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No guarantees',
    emptyMessage: 'Record them so none lapses unnoticed.',
    columns: [
      { key: 'guaranteeNumber', label: 'Guarantee', kind: 'strong', width: '150px' },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.GUARANTEE_KIND_LABELS, r.kind) },
      { key: 'counterpartyName', label: 'Party', sub: r => r.issuingBank ?? null },
      { key: 'amount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'expiresOn', label: 'Expires', kind: 'date' },
      { key: 'daysToExpiry', label: 'Days', kind: 'days', tone: r => daysTone(r.daysToExpiry), align: 'right' },
      { key: 'isAutoRenewing', label: 'Auto-renews', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
    filters: [
      { key: 'expiringOnly', label: 'Expiring only', kind: 'toggle' },
    ],
    presets: [
      { key: 'active', label: 'Active', apply: {  } },
      { key: 'expiring', label: 'Expiring soon', apply: { expiringOnly: true }, tone: 'danger' },
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
    this.wrap(this.finance.getGuarantees(q.scopeId ?? undefined, (q.filters['expiringOnly'] as any) ?? false));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
