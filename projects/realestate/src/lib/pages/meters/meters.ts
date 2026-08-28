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

/** Meters — What is measured and what it read. */
@Component({
  standalone: true,
  selector: 'lib-re-meters',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class MetersComponent implements OnInit {
  private facility = inject(FacilityService);

  readonly config: ListConfig<any> = {
    title: 'Meters',
    subtitle: 'What is measured and what it read.',
    helpKey: 'facility/meters',
    icon: 'speed',
    searchPlaceholder: 'Meter number or location',
    createLabel: 'Add a meter',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No meters',
    emptyMessage: 'Register them so consumption can be billed and losses spotted.',
    columns: [
      { key: 'meterNumber', label: 'Meter', kind: 'strong', sub: r => r.location ?? null },
      { key: 'kind', label: 'Utility', kind: 'pill', value: r => lbl(E.METER_KIND_LABELS, r.kind) },
      { key: 'unitNumber', label: 'Serves', sub: r => r.isCommonArea ? 'common area' : null, hideBelow: 'md' },
      { key: 'lastReading', label: 'Last reading', kind: 'number', align: 'right' },
      { key: 'lastReadOn', label: 'Read on', kind: 'date' },
      { key: 'averageConsumption', label: 'Average', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'isFaulty', label: 'Faulty', kind: 'bool', tone: r => r.isFaulty ? 'danger' : 'neutral', align: 'center' },
    ],
    filters: [
      { key: 'kind', label: 'Utility', kind: 'select', options: enumOptions(E.METER_KIND_LABELS) },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'faulty', label: 'Faulty', apply: { faultyOnly: true }, tone: 'danger' },
      { key: 'unread', label: 'Not read recently', apply: { staleOnly: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.facility.getMeters(toListQuery(q), undefined, undefined, (q.filters['kind'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
