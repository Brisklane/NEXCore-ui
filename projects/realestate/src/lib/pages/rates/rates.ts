import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Rate analysis — What sits behind each unit rate. */
@Component({
  standalone: true,
  selector: 'lib-re-rates',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class RatesComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Rate analysis',
    subtitle: 'What sits behind each unit rate.',
    icon: 'calculate',
    searchPlaceholder: 'Code or description',
    scope: 'project',
    createLabel: 'New analysis',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No rate analyses',
    emptyMessage: 'Build them so a bill of quantities can be priced from first principles.',
    columns: [
      { key: 'code', label: 'Code', kind: 'strong', width: '120px' },
      { key: 'description', label: 'Item' },
      { key: 'unit', label: 'Unit', kind: 'pill', hideBelow: 'md' },
      { key: 'labourCost', label: 'Labour', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'materialCost', label: 'Material', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'plantCost', label: 'Plant', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'overheadPercent', label: 'Overhead', kind: 'percent', align: 'right', hideBelow: 'lg' },
      { key: 'totalRate', label: 'Rate', kind: 'money', align: 'right' },
    ],
    filters: [
      { key: 'libraryOnly', label: 'Library only', kind: 'toggle' },
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
    this.wrap(this.construction.getRateAnalyses(q.scopeId ?? undefined, (q.filters['libraryOnly'] as any) ?? false));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
