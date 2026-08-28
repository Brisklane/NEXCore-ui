import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { AdminService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Approval bands — Who signs off what, and above what amount. */
@Component({
  standalone: true,
  selector: 'lib-re-approval-setup',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class ApprovalSetupComponent implements OnInit {
  private admin = inject(AdminService);

  readonly config: ListConfig<any> = {
    title: 'Approval bands',
    subtitle: 'Who signs off what, and above what amount.',
    icon: 'approval',
    createLabel: 'Add a band',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No approval bands',
    emptyMessage: 'Without them nothing needs approving — which is rarely what anybody wants.',
    columns: [
      { key: 'documentType', label: 'Document', kind: 'strong' },
      { key: 'level', label: 'Level', kind: 'number', align: 'right' },
      { key: 'minAmount', label: 'From', kind: 'money', align: 'right' },
      { key: 'maxAmount', label: 'To', kind: 'money', sub: r => r.maxAmount ? null : 'and above', align: 'right' },
      { key: 'approverRoleName', label: 'Approver', hideBelow: 'md' },
      { key: 'escalateAfterHours', label: 'Escalates after', kind: 'days', sub: r => r.escalateAfterHours ? 'hours' : null, align: 'right', hideBelow: 'md' },
      { key: 'autoApproveBelowMin', label: 'Auto below', kind: 'bool', align: 'center' },
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
    this.wrap(this.admin.getMatrix((q.filters['documentType'] as any)));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
