import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { InventoryService } from '../../services/realestate.services';
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

/** Holds — Units currently off the board. */
@Component({
  standalone: true,
  selector: 'lib-re-holds',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class HoldsComponent implements OnInit {
  private inventory = inject(InventoryService);

  readonly config: ListConfig<any> = {
    title: 'Holds',
    subtitle: 'Units currently off the board.',
    helpKey: 'holds',
    icon: 'pan_tool',
    scope: 'project',
    clickable: false,
    emptyTitle: 'Nothing on hold',
    emptyMessage: 'Every unit is either available or sold.',
    columns: [
      { key: 'unitNumber', label: 'Unit', kind: 'strong', sub: r => r.projectName ?? null },
      { key: 'heldForName', label: 'Held for', sub: r => r.phone ?? null },
      { key: 'heldByName', label: 'Held by', hideBelow: 'md' },
      { key: 'heldAt', label: 'Since', kind: 'datetime', hideBelow: 'md' },
      { key: 'expiresAt', label: 'Expires', kind: 'datetime' },
      { key: 'minutesRemaining', label: 'Left', kind: 'days', sub: r => r.minutesRemaining !== undefined ? 'minutes' : null, align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.HOLD_STATUS_LABELS, r.status), tone: r => r.isExpiringSoon ? 'warning' : 'neutral' },
    ],
    rowActions: [
      { key: 'release', label: 'Release', icon: 'lock_open', tone: 'danger' },
      { key: 'convert', label: 'Convert to booking', icon: 'arrow_forward', tone: 'accent' },
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
    this.wrap(this.inventory.getActiveHolds(q.scopeId ?? undefined));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
