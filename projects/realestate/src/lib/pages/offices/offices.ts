import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/realestate.services';
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

/** Offices — Where this business trades from. */
@Component({
  standalone: true,
  selector: 'lib-re-offices',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class OfficesComponent implements OnInit {
  private admin = inject(AdminService);

  readonly config: ListConfig<any> = {
    title: 'Offices',
    subtitle: 'Where this business trades from.',
    icon: 'store',
    searchPlaceholder: 'Name, code or city',
    createLabel: 'Add an office',
    createIcon: 'add_business',
    clickable: false,
    emptyTitle: 'No offices',
    emptyMessage: 'Add one so agents and listings have somewhere to belong.',
    columns: [
      { key: 'name', label: 'Office', kind: 'strong', sub: r => r.code ?? null },
      { key: 'officeType', label: 'Type', kind: 'pill', value: r => lbl(E.OFFICE_TYPE_LABELS, r.officeType) },
      { key: 'city', label: 'City', sub: r => r.phone ?? null },
      { key: 'currencyCode', label: 'Currency', kind: 'pill', hideBelow: 'md' },
      { key: 'isFranchise', label: 'Franchise', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'isActive', label: 'Active', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'officeType', label: 'Type', kind: 'select', options: enumOptions(E.OFFICE_TYPE_LABELS) },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.admin.getOffices(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
