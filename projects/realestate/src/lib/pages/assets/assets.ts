import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService } from '../../services/realestate.services';
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

/** Assets — Plant and equipment being maintained. */
@Component({
  standalone: true,
  selector: 'lib-re-assets',
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
export class AssetsComponent implements OnInit {
  private facility = inject(FacilityService);

  readonly config: ListConfig<any> = {
    title: 'Assets',
    subtitle: 'Plant and equipment being maintained.',
    icon: 'precision_manufacturing',
    searchPlaceholder: 'Name, tag or location',
    createLabel: 'Add an asset',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No assets on the register',
    emptyMessage: 'Register the plant so its servicing and warranties are tracked.',
    columns: [
      { key: 'name', label: 'Asset', kind: 'strong', sub: r => r.assetTag ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.ASSET_KIND_LABELS, r.kind) },
      { key: 'location', label: 'Where', sub: r => r.addressOneLine ?? null, hideBelow: 'md' },
      { key: 'installedOn', label: 'Installed', kind: 'date', hideBelow: 'lg' },
      { key: 'warrantyUntil', label: 'Warranty', kind: 'date', hideBelow: 'md' },
      { key: 'lastServicedOn', label: 'Last serviced', kind: 'date' },
      { key: 'condition', label: 'Condition', kind: 'pill' },
    ],
    filters: [
      { key: 'kind', label: 'Kind', kind: 'select', options: enumOptions(E.ASSET_KIND_LABELS) },
    ],
    rowActions: [
      { key: 'service', label: 'Record a service', icon: 'build' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.facility.getAssets(toListQuery(q), undefined, (q.filters['kind'] as any));

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
