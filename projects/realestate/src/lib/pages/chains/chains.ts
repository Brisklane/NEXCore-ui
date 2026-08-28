import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { BrokerageService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Chains — Who is holding everything up. */
@Component({
  standalone: true,
  selector: 'lib-re-chains',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class ChainsComponent implements OnInit {
  private brokerage = inject(BrokerageService);

  readonly config: ListConfig<any> = {
    title: 'Chains',
    subtitle: 'Who is holding everything up.',
    helpKey: 'brokerage/chains',
    icon: 'link',
    createLabel: 'Record a chain',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No chains',
    emptyMessage: 'Every deal is standing on its own.',
    columns: [
      { key: 'reference', label: 'Chain', kind: 'strong', width: '130px' },
      { key: 'linkCount', label: 'Links', kind: 'number', align: 'right' },
      { key: 'targetCompletionDate', label: 'Target', kind: 'date' },
      { key: 'isBroken', label: 'Broken', kind: 'bool', tone: r => r.isBroken ? 'danger' : 'neutral', align: 'center' },
      { key: 'brokenAtPosition', label: 'Broke at', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'isComplete', label: 'Complete', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'atRiskOnly', label: 'At risk only', kind: 'toggle' },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'risk', label: 'At risk', apply: { atRiskOnly: true }, tone: 'danger' },
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
    this.wrap(this.brokerage.getChains((q.filters['atRiskOnly'] as any) ?? false));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
