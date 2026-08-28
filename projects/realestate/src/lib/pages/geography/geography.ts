import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { AdminService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Geography — The areas this business works in. */
@Component({
  standalone: true,
  selector: 'lib-re-geography',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class GeographyComponent implements OnInit {
  private admin = inject(AdminService);

  readonly config: ListConfig<any> = {
    title: 'Geography',
    subtitle: 'The areas this business works in.',
    icon: 'map',
    createLabel: 'Add an area',
    createIcon: 'add_location',
    clickable: false,
    emptyTitle: 'No areas',
    emptyMessage: 'Add them so property can be searched and priced by locality.',
    columns: [
      { key: 'name', label: 'Area', kind: 'strong', sub: r => r.parentName ?? null },
      { key: 'level', label: 'Level', kind: 'pill' },
      { key: 'propertyCount', label: 'Properties', kind: 'number', align: 'right' },
      { key: 'listingCount', label: 'Listings', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'averagePrice', label: 'Average price', kind: 'money', align: 'right', hideBelow: 'md' },
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
    this.wrap(this.admin.getGeoTree(undefined, 3));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
