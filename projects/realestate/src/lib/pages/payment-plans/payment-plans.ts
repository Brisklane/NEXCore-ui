import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { MoneyService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Payment plans — The schedules a scheme sells on. */
@Component({
  standalone: true,
  selector: 'lib-re-payment-plans',
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
export class PaymentPlansComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Payment plans',
    subtitle: 'The schedules a scheme sells on.',
    icon: 'calendar_month',
    scope: 'project',
    createLabel: 'New plan',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No payment plans',
    emptyMessage: 'Build one so a booking has a schedule to hang its instalments on.',
    columns: [
      { key: 'name', label: 'Plan', kind: 'strong', sub: r => r.projectName ?? null },
      { key: 'version', label: 'Version', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'lineCount', label: 'Instalments', kind: 'number', align: 'right' },
      { key: 'effectiveFrom', label: 'From', kind: 'date', hideBelow: 'md' },
      { key: 'lumpSumDiscountPercent', label: 'Lump-sum discount', kind: 'percent', align: 'right', hideBelow: 'lg' },
      { key: 'isDefault', label: 'Default', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'activeOnly', label: 'Active only', kind: 'toggle' },
    ],
    rowActions: [
      { key: 'preview', label: 'Preview a schedule', icon: 'visibility' },
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
    this.wrap(this.money.getTemplates(q.scopeId ?? undefined, (q.filters['activeOnly'] as any) ?? true));

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
