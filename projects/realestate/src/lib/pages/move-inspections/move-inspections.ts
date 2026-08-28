import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/**
 * Reads a label map with a value that arrived as JSON.
 *
 * The wire carries a plain number, so the lookup is unavoidably untyped at this one point. A
 * missing value renders as an em dash rather than as `undefined`, which is the difference between
 * a gap in the data and a bug on screen.
 */
function lbl<T extends number>(map: Record<T, string>, value: unknown): string {
  return map[value as T] ?? '\u2014';
}

/** Inspections — Check-in, check-out and interim. */
@Component({
  standalone: true,
  selector: 'lib-re-move-inspections',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class MoveInspectionsComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Inspections',
    subtitle: 'Check-in, check-out and interim.',
    icon: 'fact_check',
    searchPlaceholder: 'Reference, property or tenancy',
    createLabel: 'New inspection',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No inspections',
    emptyMessage: 'Do one at check-in so there is something to compare against.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'addressOneLine', label: 'Property', sub: r => r.tenancyReference ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.INSPECTION_KIND_LABELS, r.kind) },
      { key: 'inspectedOn', label: 'Inspected', kind: 'date' },
      { key: 'inspectorName', label: 'By', hideBelow: 'md' },
      { key: 'itemCount', label: 'Items', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'issueCount', label: 'Issues', kind: 'number', align: 'right' },
      { key: 'tenantSigned', label: 'Tenant signed', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'kind', label: 'Kind', kind: 'select', options: enumOptions(E.INSPECTION_KIND_LABELS) },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getInspections(toListQuery(q), (q.filters['kind'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
