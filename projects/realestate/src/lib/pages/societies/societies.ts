import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocietyService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Societies — Gated communities and apartment associations. */
@Component({
  standalone: true,
  selector: 'lib-re-societies',
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
export class SocietiesComponent implements OnInit {
  private societies = inject(SocietyService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Societies',
    subtitle: 'Gated communities and apartment associations.',
    icon: 'holiday_village',
    searchPlaceholder: 'Society name or registration number',
    createLabel: 'Add a society',
    createIcon: 'add',
    emptyTitle: 'No societies',
    emptyMessage: 'Add one to start billing maintenance and running the gate.',
    columns: [
      { key: 'name', label: 'Society', kind: 'strong', sub: r => r.registrationNumber ?? null },
      { key: 'totalUnits', label: 'Units', kind: 'number', align: 'right' },
      { key: 'occupiedUnits', label: 'Occupied', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'monthlyBillingTotal', label: 'Monthly billing', kind: 'money', align: 'right' },
      { key: 'outstandingTotal', label: 'Outstanding', kind: 'money', align: 'right' },
      { key: 'openComplaints', label: 'Open complaints', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'isHandedOver', label: 'Handed over', kind: 'bool', align: 'center' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.societies.getAll(toListQuery(q));

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/society/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
