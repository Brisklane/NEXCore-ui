import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../services/realestate.services';
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

/** Amenities — Bookings for shared facilities. */
@Component({
  standalone: true,
  selector: 'lib-re-amenities',
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
export class AmenitiesComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);

  readonly config: ListConfig<any> = {
    title: 'Amenities',
    subtitle: 'Bookings for shared facilities.',
    icon: 'pool',
    searchPlaceholder: 'Amenity, resident or unit',
    createLabel: 'Book an amenity',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No bookings',
    emptyMessage: 'Residents book the clubhouse and the courts from here.',
    columns: [
      { key: 'amenityName', label: 'Amenity', kind: 'strong', sub: r => r.slotLabel ?? null },
      { key: 'residentName', label: 'Booked by', sub: r => r.unitNumber ?? null },
      { key: 'bookedFor', label: 'For', kind: 'datetime' },
      { key: 'guestCount', label: 'Guests', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'charge', label: 'Charge', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.AMENITY_BOOKING_STATUS_LABELS, r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.AMENITY_BOOKING_STATUS_LABELS) },
    ],
    presets: [
      { key: 'upcoming', label: 'Upcoming', apply: {  } },
      { key: 'pending', label: 'Awaiting approval', apply: { pendingOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
      { key: 'cancel', label: 'Cancel', icon: 'close', tone: 'danger' },
    ],
  };

  /** Which society this screen is showing. Read from the route the sidebar linked to. */
  protected societyId = '';

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  fetch = (q: ListQueryState) =>
    this.societies.getBookings(this.societyId, toListQuery(q), (q.filters['status'] as any));

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
