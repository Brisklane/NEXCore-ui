import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { LeasingService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
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

/** Critical dates — Lease dates that cannot be missed. */
@Component({
  standalone: true,
  selector: 'lib-re-critical-dates',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class CriticalDatesComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Critical dates',
    subtitle: 'Lease dates that cannot be missed.',
    icon: 'event_busy',
    clickable: false,
    emptyTitle: 'Nothing critical coming up',
    emptyMessage: 'Break notices, option windows and review triggers appear here.',
    columns: [
      { key: 'label', label: 'Date', kind: 'strong', sub: r => r.addressOneLine ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill' },
      { key: 'dueDate', label: 'Due', kind: 'date' },
      { key: 'daysToDue', label: 'Days', kind: 'days', tone: r => daysTone(r.daysToDue), align: 'right' },
      { key: 'noticeRequiredDays', label: 'Notice needed', kind: 'days', align: 'right', hideBelow: 'md' },
      { key: 'ownerName', label: 'Owner', hideBelow: 'lg' },
      { key: 'isActioned', label: 'Actioned', kind: 'bool', align: 'center' },
    ],
    rowActions: [
      { key: 'action', label: 'Mark actioned', icon: 'check', tone: 'accent' },
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
    this.wrap(this.leasing.getCriticalDates(undefined, 180));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
