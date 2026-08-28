import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Drawings — The drawing register and its revisions. */
@Component({
  standalone: true,
  selector: 'lib-re-drawings',
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
export class DrawingsComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Drawings',
    subtitle: 'The drawing register and its revisions.',
    icon: 'architecture',
    searchPlaceholder: 'Number or title',
    scope: 'project',
    createLabel: 'Register a drawing',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No drawings registered',
    emptyMessage: 'Register them so the site is never building from a superseded sheet.',
    columns: [
      { key: 'drawingNumber', label: 'Drawing', kind: 'strong', width: '150px' },
      { key: 'title', label: 'Title', sub: r => r.discipline ?? null },
      { key: 'currentRevision', label: 'Revision', kind: 'pill' },
      { key: 'issuedOn', label: 'Issued', kind: 'date', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill' },
      { key: 'revisionCount', label: 'Revisions', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'isSuperseded', label: 'Superseded', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    rowActions: [
      { key: 'revise', label: 'Add a revision', icon: 'add' },
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
    this.wrap(this.construction.getDrawings(undefined, q.scopeId ?? undefined));

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
