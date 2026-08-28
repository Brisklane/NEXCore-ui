import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
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

/** Broadcasts — Messaging a whole segment at once. */
@Component({
  standalone: true,
  selector: 'lib-re-broadcasts',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class BroadcastsComponent implements OnInit {
  private communication = inject(CommunicationService);

  readonly config: ListConfig<any> = {
    title: 'Broadcasts',
    subtitle: 'Messaging a whole segment at once.',
    helpKey: 'broadcasts',
    icon: 'campaign',
    searchPlaceholder: 'Reference or name',
    createLabel: 'New broadcast',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No broadcasts',
    emptyMessage: 'The best broadcast is usually the one you decide not to send.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'name', label: 'Broadcast', sub: r => r.segmentKey ?? null },
      { key: 'channel', label: 'Channel', kind: 'pill', value: r => lbl(E.NOTIFICATION_CHANNEL_LABELS, r.channel) },
      { key: 'targetCount', label: 'Targeted', kind: 'number', align: 'right' },
      { key: 'suppressedCount', label: 'Suppressed', kind: 'number', tone: r => r.suppressedCount ? 'warning' : 'neutral', align: 'right' },
      { key: 'sentCount', label: 'Sent', kind: 'number', align: 'right' },
      { key: 'deliveryRatePercent', label: 'Delivered', kind: 'percent', align: 'right', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.communication.getBroadcasts(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
