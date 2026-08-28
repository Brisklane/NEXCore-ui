import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService } from '../../services/realestate.services';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Parking — Bays and who has them. */
@Component({
  standalone: true,
  selector: 'lib-re-parking',
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
export class ParkingComponent implements OnInit {
  private facility = inject(FacilityService);

  readonly config: ListConfig<any> = {
    title: 'Parking',
    subtitle: 'Bays and who has them.',
    icon: 'local_parking',
    searchPlaceholder: 'Bay number, resident or vehicle',
    createLabel: 'Add bays',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No parking bays',
    emptyMessage: 'Add them so they can be allotted and charged.',
    columns: [
      { key: 'slotNumber', label: 'Bay', kind: 'strong', sub: r => r.level ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill' },
      { key: 'allottedToName', label: 'Allotted to', sub: r => r.unitNumber ?? null },
      { key: 'vehicleNumber', label: 'Vehicle', hideBelow: 'md' },
      { key: 'monthlyCharge', label: 'Charge', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'isAllotted', label: 'Allotted', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'unallottedOnly', label: 'Free bays only', kind: 'toggle' },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'free', label: 'Free', apply: { unallottedOnly: true } },
    ],
    rowActions: [
      { key: 'allot', label: 'Allot', icon: 'assignment_ind', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.facility.getParking(toListQuery(q), undefined, (q.filters['unallottedOnly'] as any));

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
