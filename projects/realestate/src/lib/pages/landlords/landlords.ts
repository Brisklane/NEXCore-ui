import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

/** Landlords — Owners whose property we manage. */
@Component({
  standalone: true,
  selector: 'lib-re-landlords',
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
export class LandlordsComponent implements OnInit {
  private leasing = inject(LeasingService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Landlords',
    subtitle: 'Owners whose property we manage.',
    icon: 'real_estate_agent',
    searchPlaceholder: 'Name, reference or phone',
    createLabel: 'Add a landlord',
    createIcon: 'person_add',
    emptyTitle: 'No landlords',
    emptyMessage: 'Add one to start managing property on their behalf.',
    columns: [
      { key: 'name', label: 'Landlord', kind: 'strong', sub: r => r.reference ?? null },
      { key: 'phone', label: 'Contact', sub: r => r.email ?? null },
      { key: 'defaultService', label: 'Service', kind: 'pill', value: r => lbl(E.MANAGEMENT_SERVICE_LABELS, r.defaultService) },
      { key: 'propertyCount', label: 'Properties', kind: 'number', align: 'right' },
      { key: 'totalRentCollected', label: 'Collected', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'currentBalance', label: 'Balance', kind: 'money', align: 'right' },
      { key: 'payoutsOnHold', label: 'On hold', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'defaultService', label: 'Service', kind: 'select', options: enumOptions(E.MANAGEMENT_SERVICE_LABELS) },
    ],
    presets: [
      { key: 'all', label: 'Everyone', apply: {  } },
      { key: 'hold', label: 'Payouts on hold', apply: { onHoldOnly: true }, tone: 'warning' },
      { key: 'unverified', label: 'Bank not verified', apply: { unverifiedBankOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getLandlords(toListQuery(q));

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/leasing/landlords/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
