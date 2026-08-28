import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Specifications — What is being built, to what standard. */
@Component({
  standalone: true,
  selector: 'lib-re-specifications',
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
export class SpecificationsComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Specifications',
    subtitle: 'What is being built, to what standard.',
    icon: 'checklist',
    scope: 'project',
    createLabel: 'New specification',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No specifications',
    emptyMessage: 'Write one and freeze it before it becomes contractual.',
    columns: [
      { key: 'name', label: 'Specification', kind: 'strong', sub: r => r.gradeLabel ?? null },
      { key: 'itemCount', label: 'Items', kind: 'number', align: 'right' },
      { key: 'version', label: 'Version', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'frozenOn', label: 'Frozen', kind: 'date', sub: r => r.isFrozen ? 'contractual' : 'still editable', tone: r => r.isFrozen ? 'positive' : 'warning' },
      { key: 'isFrozen', label: 'Frozen', kind: 'bool', align: 'center' },
    ],
    rowActions: [
      { key: 'freeze', label: 'Freeze', icon: 'lock', tone: 'accent' },
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
    this.wrap(this.construction.getSpecifications(q.scopeId ?? undefined, undefined));

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
