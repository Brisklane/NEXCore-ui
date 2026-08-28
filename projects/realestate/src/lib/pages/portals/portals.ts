import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { ListingService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Portals — Where listings are advertised. */
@Component({
  standalone: true,
  selector: 'lib-re-portals',
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
export class PortalsComponent implements OnInit {
  private listings = inject(ListingService);

  readonly config: ListConfig<any> = {
    title: 'Portals',
    subtitle: 'Where listings are advertised.',
    icon: 'hub',
    createLabel: 'Add a portal',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No portals connected',
    emptyMessage: 'Connect one so a listing reaches somewhere other than your own website.',
    columns: [
      { key: 'name', label: 'Portal', kind: 'strong', sub: r => r.code ?? null },
      { key: 'liveListingCount', label: 'Live listings', kind: 'number', align: 'right' },
      { key: 'lastPublishedAt', label: 'Last published', kind: 'datetime' },
      { key: 'failureCount', label: 'Failures', kind: 'number', tone: r => r.failureCount ? 'danger' : 'neutral', align: 'right' },
      { key: 'monthlyCost', label: 'Cost', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'isActive', label: 'Active', kind: 'bool', align: 'center' },
    ],
    rowActions: [
      { key: 'publish', label: 'Publish now', icon: 'publish', tone: 'accent' },
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
    this.wrap(this.listings.getPortals());

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
