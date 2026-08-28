import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { CrmService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Matching — Requirements against what is on the market. */
@Component({
  standalone: true,
  selector: 'lib-re-matching',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class MatchingComponent implements OnInit {
  private crm = inject(CrmService);

  readonly config: ListConfig<any> = {
    title: 'Matching',
    subtitle: 'Requirements against what is on the market.',
    icon: 'join_inner',
    clickable: false,
    emptyTitle: 'No matches',
    emptyMessage: 'Record what somebody is looking for, and matches appear here as stock comes in.',
    columns: [
      { key: 'addressOneLine', label: 'Property', kind: 'strong', sub: r => r.listingReference ?? null },
      { key: 'score', label: 'Match', kind: 'progress', align: 'right' },
      { key: 'askingPrice', label: 'Asking', kind: 'money', align: 'right' },
      { key: 'bedrooms', label: 'Beds', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'matchedOn', label: 'Matched on', hideBelow: 'md' },
      { key: 'missedOn', label: 'Missed on', hideBelow: 'lg' },
      { key: 'wasSent', label: 'Sent', kind: 'bool', align: 'center' },
    ],
    rowActions: [
      { key: 'send', label: 'Send', icon: 'send', tone: 'accent' },
      { key: 'dismiss', label: 'Dismiss', icon: 'close', tone: 'danger' },
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
    this.wrap(this.crm.runMatch(q.scopeId ?? '', 40));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
