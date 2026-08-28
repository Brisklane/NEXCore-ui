import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { InventoryService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Price lists — What the scheme sells at. */
@Component({
  standalone: true,
  selector: 'lib-re-pricing',
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
export class PricingComponent implements OnInit {
  private inventory = inject(InventoryService);

  readonly config: ListConfig<any> = {
    title: 'Price lists',
    subtitle: 'What the scheme sells at.',
    helpKey: 'pricing',
    icon: 'price_change',
    scope: 'project',
    createLabel: 'New price list',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No price lists',
    emptyMessage: 'Build one so a unit has a price to sell at.',
    columns: [
      { key: 'name', label: 'Price list', kind: 'strong', sub: r => 'version ' + (r.version ?? 1) },
      { key: 'effectiveFrom', label: 'From', kind: 'date', sub: r => r.effectiveTo ? 'to ' + r.effectiveTo : 'open-ended' },
      { key: 'lineCount', label: 'Lines', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'averageRate', label: 'Average rate', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'publishedAt', label: 'Published', kind: 'datetime' },
      { key: 'isPublished', label: 'Published', kind: 'bool', tone: r => r.isPublished ? 'positive' : 'warning', align: 'center' },
    ],
    rowActions: [
      { key: 'publish', label: 'Publish', icon: 'publish', tone: 'accent' },
      { key: 'reprice', label: 'Apply to available units', icon: 'sync' },
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
    this.wrap(this.inventory.getPriceLists(q.scopeId ?? ''));

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
