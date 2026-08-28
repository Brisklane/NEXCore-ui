import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function bookingTone(s: E.BookingStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.BookingStatus.Confirmed:
    case E.BookingStatus.AgreementSigned:
    case E.BookingStatus.Possessed:
    case E.BookingStatus.Completed: return 'positive';
    case E.BookingStatus.Provisional:
    case E.BookingStatus.PendingApproval:
    case E.BookingStatus.PossessionOffered: return 'warning';
    case E.BookingStatus.Defaulting:
    case E.BookingStatus.UnderCancellation:
    case E.BookingStatus.Cancelled: return 'danger';
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

/** Bookings — Every booking, with its money position. */
@Component({
  standalone: true,
  selector: 'lib-re-bookings',
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
export class BookingsComponent implements OnInit {
  private bookings = inject(BookingService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Bookings',
    subtitle: 'Every booking, with its money position.',
    helpKey: 'bookings',
    icon: 'real_estate_agent',
    searchPlaceholder: 'Booking reference, customer, phone or unit',
    scope: 'project',
    createLabel: 'New booking',
    createIcon: 'add',
    emptyTitle: 'No bookings yet',
    emptyMessage: 'Take one from the inventory board.',
    columns: [
      { key: 'reference', label: 'Booking', kind: 'strong', sub: r => r.fileNumber ?? null, width: '140px' },
      { key: 'applicantName', label: 'Customer', sub: r => r.applicantPhone ?? null },
      { key: 'unitNumber', label: 'Unit', sub: r => r.blockName ?? null, hideBelow: 'md' },
      { key: 'totalConsideration', label: 'Consideration', kind: 'money', align: 'right' },
      { key: 'collectionPercent', label: 'Collected', kind: 'progress', align: 'right' },
      { key: 'overdueAmount', label: 'Overdue', kind: 'money', sub: r => r.daysOverdue ? r.daysOverdue + ' days' : null, align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.BOOKING_STATUS_LABELS, r.status), tone: r => bookingTone(r.status) },
      { key: 'nextDueDate', label: 'Next due', kind: 'date', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.BOOKING_STATUS_LABELS) },
      { key: 'overdueOnly', label: 'Overdue only', kind: 'toggle' },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'overdue', label: 'Overdue', apply: { overdueOnly: true }, tone: 'danger' },
      { key: 'defaulting', label: 'Defaulting', apply: { status: E.BookingStatus.Defaulting }, tone: 'danger' },
      { key: 'unsigned', label: 'Awaiting agreement', apply: { status: E.BookingStatus.Confirmed }, tone: 'warning' },
      { key: 'possession', label: 'Ready for possession', apply: { status: E.BookingStatus.PossessionOffered } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.bookings.search({ page: q.page, pageSize: q.pageSize, search: q.search, projectId: q.scopeId ?? undefined, statuses: q.filters['status'] ? [(q.filters['status'] as any)] : undefined, overdueOnly: (q.filters['overdueOnly'] as any) });

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/bookings/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
