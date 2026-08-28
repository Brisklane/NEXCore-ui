import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Green when it can be sold, amber when it is spoken for, red when something is wrong. */
function statusTone(s: E.PropertyStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.PropertyStatus.Available: return 'positive';
    case E.PropertyStatus.Held:
    case E.PropertyStatus.Reserved:
    case E.PropertyStatus.UnderOffer: return 'warning';
    case E.PropertyStatus.Litigation:
    case E.PropertyStatus.Blocked: return 'danger';
    default: return 'neutral';
  }
}

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

/** Properties — The property register. */
@Component({
  standalone: true,
  selector: 'lib-re-properties',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowClick)="open($any($event))"
      (create)="create()"
    />
  `,
})
export class PropertiesComponent implements OnInit {
  private properties = inject(PropertyService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Properties',
    subtitle: 'The property register.',
    helpKey: 'properties',
    icon: 'home_work',
    searchPlaceholder: 'Reference, address, unit number or post code',
    createLabel: 'Add a property',
    createIcon: 'add_home',
    emptyTitle: 'No properties yet',
    emptyMessage: 'Add the first one, or bring an existing register in from a file under Setup.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', sub: r => r.name ?? null, width: '140px' },
      { key: 'addressOneLine', label: 'Address', sub: r => r.areaName ?? null },
      { key: 'subType', label: 'Type', kind: 'pill', value: r => lbl(E.PROPERTY_SUB_TYPE_LABELS, r.subType) },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.PROPERTY_STATUS_LABELS, r.status), tone: r => statusTone(r.status) },
      { key: 'bedrooms', label: 'Beds', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'area', label: 'Area', kind: 'area', value: r => r.area?.value, sub: r => r.area?.unitLabel ?? null, align: 'right' },
      { key: 'askingPrice', label: 'Asking', kind: 'money', align: 'right' },
    ],
    filters: [
      { key: 'category', label: 'Category', kind: 'select', options: enumOptions(E.PROPERTY_CATEGORY_LABELS) },
      { key: 'subType', label: 'Type', kind: 'select', options: enumOptions(E.PROPERTY_SUB_TYPE_LABELS) },
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.PROPERTY_STATUS_LABELS) },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'available', label: 'Available', apply: { status: E.PropertyStatus.Available } },
      { key: 'let', label: 'Let', apply: { status: E.PropertyStatus.Let } },
      { key: 'litigation', label: 'Under litigation', apply: { status: E.PropertyStatus.Litigation }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.properties.search({ page: q.page, pageSize: q.pageSize, search: q.search, categories: q.filters['category'] ? [(q.filters['category'] as any)] : undefined, subTypes: q.filters['subType'] ? [(q.filters['subType'] as any)] : undefined, statuses: q.filters['status'] ? [(q.filters['status'] as any)] : undefined });

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/properties/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
