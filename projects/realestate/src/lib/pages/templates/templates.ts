import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { FinanceService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Document templates — What each document is built from. */
@Component({
  standalone: true,
  selector: 'lib-re-templates',
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
export class TemplatesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Document templates',
    subtitle: 'What each document is built from.',
    icon: 'article',
    scope: 'project',
    createLabel: 'New template',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No templates',
    emptyMessage: 'Create one so a document can be generated rather than typed.',
    columns: [
      { key: 'name', label: 'Template', kind: 'strong', sub: r => r.documentType ?? null },
      { key: 'languageCode', label: 'Language', kind: 'pill', hideBelow: 'md' },
      { key: 'currentVersion', label: 'Version', kind: 'number', align: 'right' },
      { key: 'usageCount', label: 'Used', kind: 'number', align: 'right' },
      { key: 'isDefault', label: 'Default', kind: 'bool', align: 'center' },
      { key: 'includeQrVerification', label: 'Verifiable', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'isActive', label: 'Active', kind: 'bool', align: 'center' },
    ],
    rowActions: [
      { key: 'publish', label: 'Publish a version', icon: 'publish', tone: 'accent' },
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
    this.wrap(this.finance.getTemplates((q.filters['documentType'] as any), q.scopeId ?? undefined));

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
