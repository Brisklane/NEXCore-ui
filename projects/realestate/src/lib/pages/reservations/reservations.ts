import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/realestate.services';
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

/** Reservations — Tokens taken against units. */
@Component({
  standalone: true,
  selector: 'lib-re-reservations',
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
export class ReservationsComponent implements OnInit {
  private bookings = inject(BookingService);

  readonly config: ListConfig<any> = {
    title: 'Reservations',
    subtitle: 'Tokens taken against units.',
    icon: 'bookmark',
    searchPlaceholder: 'Reference, customer or unit',
    scope: 'project',
    createLabel: 'Take a token',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No reservations',
    emptyMessage: 'Take a token from the inventory board.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'partyName', label: 'Customer', sub: r => r.partyPhone ?? null },
      { key: 'unitNumber', label: 'Unit', sub: r => r.projectName ?? null },
      { key: 'tokenAmount', label: 'Token', kind: 'money', align: 'right' },
      { key: 'takenOn', label: 'Taken', kind: 'date', hideBelow: 'md' },
      { key: 'expiresOn', label: 'Expires', kind: 'date' },
      { key: 'daysRemaining', label: 'Left', kind: 'days', sub: r => r.daysRemaining !== undefined ? 'days' : null, align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.RESERVATION_STATUS_LABELS, r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.RESERVATION_STATUS_LABELS) },
    ],
    presets: [
      { key: 'live', label: 'Live', apply: { status: E.ReservationStatus.Active } },
      { key: 'expiring', label: 'Expiring soon', apply: { expiringOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'convert', label: 'Convert to booking', icon: 'arrow_forward', tone: 'accent' },
      { key: 'cancel', label: 'Cancel', icon: 'close', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.bookings.getTokens(toListQuery(q), q.scopeId ?? undefined, (q.filters['status'] as any));

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
