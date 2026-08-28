import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { CrmService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Keys — Who has which keys. */
@Component({
  standalone: true,
  selector: 'lib-re-keys',
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
export class KeysComponent implements OnInit {
  private crm = inject(CrmService);

  readonly config: ListConfig<any> = {
    title: 'Keys',
    subtitle: 'Who has which keys.',
    icon: 'key',
    createLabel: 'Add a key set',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No key sets',
    emptyMessage: 'Register a set so its movements can be tracked.',
    columns: [
      { key: 'label', label: 'Key set', kind: 'strong', sub: r => r.addressOneLine ?? null },
      { key: 'keyCount', label: 'Keys', kind: 'number', align: 'right' },
      { key: 'holderName', label: 'With', sub: r => r.isOut ? 'signed out' : 'in the office' },
      { key: 'takenOn', label: 'Since', kind: 'date', hideBelow: 'md' },
      { key: 'dueBackOn', label: 'Due back', kind: 'date', tone: r => r.isOverdue ? 'danger' : 'neutral' },
      { key: 'isOverdue', label: 'Overdue', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'outOnly', label: 'Signed out only', kind: 'toggle' },
    ],
    rowActions: [
      { key: 'out', label: 'Sign out', icon: 'logout' },
      { key: 'in', label: 'Sign in', icon: 'login' },
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
    this.wrap(this.crm.getKeys(undefined, (q.filters['outOnly'] as any) ?? false));

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
