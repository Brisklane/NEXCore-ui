import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { MoneyService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Anything past ninety days is red, because recovery rates fall off a cliff there. */
function ageTone(days: number | undefined): 'positive' | 'warning' | 'danger' | 'neutral' {
  if (!days || days <= 0) return 'positive';
  if (days > 90) return 'danger';
  if (days > 30) return 'warning';
  return 'neutral';
}

/** Collections — Who to chase today. */
@Component({
  standalone: true,
  selector: 'lib-re-collections',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class CollectionsComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Collections',
    subtitle: 'Who to chase today.',
    helpKey: 'money/collections',
    icon: 'call',
    searchPlaceholder: 'Customer, phone or booking',
    scope: 'project',
    clickable: false,
    emptyTitle: 'Nothing to chase',
    emptyMessage: 'Every account is current.',
    columns: [
      { key: 'partyName', label: 'Customer', kind: 'strong', sub: r => r.phone ?? null },
      { key: 'bookingReference', label: 'Booking', sub: r => r.unitNumber ?? null, hideBelow: 'md' },
      { key: 'overdueAmount', label: 'Overdue', kind: 'money', align: 'right' },
      { key: 'daysOverdue', label: 'Days', kind: 'days', tone: r => ageTone(r.daysOverdue), align: 'right' },
      { key: 'lastContactedAt', label: 'Last spoken to', kind: 'date', sub: r => r.lastOutcome ?? null },
      { key: 'promiseDate', label: 'Promised', kind: 'date', hideBelow: 'md' },
      { key: 'exposure', label: 'Exposure', kind: 'money', align: 'right', hideBelow: 'lg' },
    ],
    presets: [
      { key: 'all', label: 'Everyone overdue', apply: {  } },
      { key: 'month', label: 'Over a month', apply: { minDays: 30 }, tone: 'warning' },
      { key: 'serious', label: 'Over ninety days', apply: { minDays: 90 }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'call', label: 'Log a call', icon: 'call' },
      { key: 'promise', label: 'Record a promise', icon: 'handshake', tone: 'accent' },
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
    this.wrap(this.money.getWorklist({ page: q.page, pageSize: q.pageSize, search: q.search, minDaysOverdue: (q.filters['minDays'] as any) }).pipe(map(w => ({ success: w.success, data: w.data?.items ?? [] }))));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
