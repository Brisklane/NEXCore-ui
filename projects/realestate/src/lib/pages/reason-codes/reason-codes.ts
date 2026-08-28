import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { AdminService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Reason codes — Why things happen, in a fixed vocabulary. */
@Component({
  standalone: true,
  selector: 'lib-re-reason-codes',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class ReasonCodesComponent implements OnInit {
  private admin = inject(AdminService);

  readonly config: ListConfig<any> = {
    title: 'Reason codes',
    subtitle: 'Why things happen, in a fixed vocabulary.',
    icon: 'label',
    createLabel: 'Add a reason',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No reason codes',
    emptyMessage: 'Half the controls in this app will not save without one.',
    columns: [
      { key: 'context', label: 'Where', kind: 'pill' },
      { key: 'label', label: 'Reason', kind: 'strong', sub: r => r.code ?? null },
      { key: 'requiresNote', label: 'Note required', kind: 'bool', align: 'center' },
      { key: 'isSystem', label: 'System', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'isActive', label: 'Active', kind: 'bool', align: 'center' },
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
    this.wrap(this.admin.getReasonCodes((q.filters['context'] as any)));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
