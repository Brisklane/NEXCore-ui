import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { LeasingService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Anything past ninety days is red, because recovery rates fall off a cliff there. */
function ageTone(days: number | undefined): 'positive' | 'warning' | 'danger' | 'neutral' {
  if (!days || days <= 0) return 'positive';
  if (days > 90) return 'danger';
  if (days > 30) return 'warning';
  return 'neutral';
}

/** Voids — Empty periods and the rent they cost. */
@Component({
  standalone: true,
  selector: 'lib-re-voids',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class VoidsComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Voids',
    subtitle: 'Empty periods and the rent they cost.',
    icon: 'door_open',
    clickable: false,
    emptyTitle: 'Nothing empty',
    emptyMessage: 'Every managed property is let.',
    columns: [
      { key: 'addressOneLine', label: 'Property', kind: 'strong' },
      { key: 'vacantFrom', label: 'Vacant from', kind: 'date' },
      { key: 'letFrom', label: 'Let from', kind: 'date' },
      { key: 'daysVoid', label: 'Days void', kind: 'days', tone: r => ageTone(r.daysVoid), align: 'right' },
      { key: 'askingRent', label: 'Asking', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'lostRent', label: 'Rent lost', kind: 'money', align: 'right' },
      { key: 'viewingCount', label: 'Viewings', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'refurbishmentRequired', label: 'Needs work', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'openOnly', label: 'Still empty', kind: 'toggle' },
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
    this.wrap(this.leasing.getVoids(undefined, (q.filters['openOnly'] as any) ?? true));

}
