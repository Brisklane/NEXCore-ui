import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/realestate.services';
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

/** Land parcels — Land held, with its title and encumbrances. */
@Component({
  standalone: true,
  selector: 'lib-re-parcels',
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
export class ParcelsComponent implements OnInit {
  private properties = inject(PropertyService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Land parcels',
    subtitle: 'Land held, with its title and encumbrances.',
    helpKey: 'parcels',
    icon: 'landscape',
    searchPlaceholder: 'Reference, survey number or village',
    createLabel: 'Record a parcel',
    createIcon: 'add_location',
    emptyTitle: 'No land on the register',
    emptyMessage: 'Record a parcel to start building its chain of title.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'surveyNumber', label: 'Survey no.', sub: r => r.village ?? null },
      { key: 'tenure', label: 'Tenure', kind: 'pill', value: r => lbl(E.TENURE_LABELS, r.tenure) },
      { key: 'area', label: 'Area', kind: 'area', value: r => r.area?.value, sub: r => r.area?.unitLabel ?? null, align: 'right' },
      { key: 'titleStatus', label: 'Title', kind: 'pill', value: r => r.titleStatusLabel ?? '—', tone: r => r.isTitleClear ? 'positive' : 'warning' },
      { key: 'encumbranceCount', label: 'Charges', kind: 'number', align: 'right' },
      { key: 'acquisitionCost', label: 'Cost', kind: 'money', align: 'right', hideBelow: 'md' },
    ],
    filters: [
      { key: 'tenure', label: 'Tenure', kind: 'select', options: enumOptions(E.TENURE_LABELS) },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.properties.getParcels(toListQuery(q));

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/land/parcels/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
