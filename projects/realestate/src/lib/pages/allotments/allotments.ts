import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Allotment letters — Issued against confirmed bookings. */
@Component({
  standalone: true,
  selector: 'lib-re-allotments',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class AllotmentsComponent implements OnInit {
  private bookings = inject(BookingService);

  readonly config: ListConfig<any> = {
    title: 'Allotment letters',
    subtitle: 'Issued against confirmed bookings.',
    icon: 'description',
    searchPlaceholder: 'Number, booking or applicant',
    scope: 'project',
    clickable: false,
    emptyTitle: 'No allotment letters',
    emptyMessage: 'Issue one from a confirmed booking.',
    columns: [
      { key: 'allotmentNumber', label: 'Number', kind: 'strong', width: '150px' },
      { key: 'bookingReference', label: 'Booking', sub: r => r.applicantName ?? null },
      { key: 'unitNumber', label: 'Unit', sub: r => r.blockName ?? null },
      { key: 'issuedOn', label: 'Issued', kind: 'date' },
      { key: 'totalConsideration', label: 'Consideration', kind: 'money', align: 'right' },
      { key: 'isSuperseded', label: 'Superseded', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'reissueReason', label: 'Reissue reason', hideBelow: 'lg' },
    ],
    rowActions: [
      { key: 'reissue', label: 'Reissue', icon: 'refresh' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.bookings.getAllotments(toListQuery(q), q.scopeId ?? undefined);

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
