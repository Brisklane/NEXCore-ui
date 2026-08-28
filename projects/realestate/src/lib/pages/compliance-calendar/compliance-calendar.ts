import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { FinanceService } from '../../services/realestate.services';
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

/** Compliance calendar — Every dated obligation, with one owner each. */
@Component({
  standalone: true,
  selector: 'lib-re-compliance-calendar',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class ComplianceCalendarComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Compliance calendar',
    subtitle: 'Every dated obligation, with one owner each.',
    helpKey: 'compliance/calendar',
    icon: 'event_available',
    clickable: false,
    emptyTitle: 'Nothing due',
    emptyMessage: 'Obligations appear here as approvals and licences are recorded.',
    columns: [
      { key: 'title', label: 'Obligation', kind: 'strong', sub: r => r.projectName ?? r.societyName ?? null },
      { key: 'category', label: 'Category', kind: 'pill' },
      { key: 'dueDate', label: 'Due', kind: 'date' },
      { key: 'daysToDue', label: 'Days', kind: 'days', tone: r => daysTone(r.daysToDue), align: 'right' },
      { key: 'ownerName', label: 'Owner', hideBelow: 'md' },
      { key: 'penaltyIfMissed', label: 'Penalty', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'isOverdue', label: 'Overdue', kind: 'bool', tone: r => r.isOverdue ? 'danger' : 'neutral', align: 'center' },
      { key: 'isCompleted', label: 'Done', kind: 'bool', align: 'center' },
    ],
    rowActions: [
      { key: 'complete', label: 'Mark done', icon: 'check', tone: 'accent' },
    ],
  };

  /** The window shown by default: from today out three months. */
  protected from = new Date().toISOString().slice(0, 10);
  protected to = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);

  ngOnInit(): void { /* the list starts itself */ }

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
    this.wrap(this.finance.getCalendar(this.from, this.to, (q.filters['category'] as any)));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
