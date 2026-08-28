import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Ballots — Allocating plots by draw. */
@Component({
  standalone: true,
  selector: 'lib-re-ballots',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class BallotsComponent implements OnInit {
  private bookings = inject(BookingService);

  readonly config: ListConfig<any> = {
    title: 'Ballots',
    subtitle: 'Allocating plots by draw.',
    icon: 'casino',
    searchPlaceholder: 'Reference or name',
    scope: 'project',
    createLabel: 'Set up a ballot',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No ballots',
    emptyMessage: 'Set one up to allocate plots fairly and reproducibly.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'name', label: 'Ballot', sub: r => r.projectName ?? null },
      { key: 'status', label: 'Status', kind: 'pill', tone: r => r.isPublished ? 'positive' : 'neutral' },
      { key: 'entryCount', label: 'Entries', kind: 'number', align: 'right' },
      { key: 'unitCount', label: 'Units', kind: 'number', align: 'right' },
      { key: 'scheduledFor', label: 'Draw', kind: 'datetime' },
      { key: 'drawnOn', label: 'Drawn', kind: 'date', hideBelow: 'md' },
      { key: 'isPoolLocked', label: 'Pool locked', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.bookings.getBallots(toListQuery(q), q.scopeId ?? undefined);

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
