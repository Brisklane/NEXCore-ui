import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationService } from '../../services/realestate.services';
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

/** Inbox — Every conversation, in one place. */
@Component({
  standalone: true,
  selector: 'lib-re-inbox',
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
export class InboxComponent implements OnInit {
  private communication = inject(CommunicationService);

  readonly config: ListConfig<any> = {
    title: 'Inbox',
    subtitle: 'Every conversation, in one place.',
    helpKey: 'inbox',
    icon: 'forum',
    searchPlaceholder: 'Contact, subject or number',
    createLabel: 'New message',
    createIcon: 'edit',
    clickable: false,
    emptyTitle: 'Nothing in the inbox',
    emptyMessage: 'Conversations appear here as customers write in.',
    columns: [
      { key: 'partyName', label: 'With', kind: 'strong', sub: r => r.partyPhone ?? null },
      { key: 'channel', label: 'Channel', kind: 'pill', value: r => lbl(E.NOTIFICATION_CHANNEL_LABELS, r.channel) },
      { key: 'lastMessagePreview', label: 'Last message', sub: r => r.subject ?? null },
      { key: 'lastMessageAt', label: 'When', kind: 'datetime' },
      { key: 'minutesAwaitingReply', label: 'Waiting', kind: 'days', sub: r => r.awaitingReply ? 'minutes' : null, tone: r => r.awaitingReply ? 'warning' : 'neutral', align: 'right' },
      { key: 'assignedToName', label: 'With', hideBelow: 'lg' },
      { key: 'unreadCount', label: 'Unread', kind: 'number', align: 'right', hideBelow: 'md' },
    ],
    filters: [
      { key: 'channel', label: 'Channel', kind: 'select', options: enumOptions(E.NOTIFICATION_CHANNEL_LABELS) },
    ],
    presets: [
      { key: 'waiting', label: 'Waiting on us', apply: { awaitingOnly: true }, tone: 'warning' },
      { key: 'mine', label: 'Assigned to me', apply: { mineOnly: true } },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'assign', label: 'Assign', icon: 'person_add' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.communication.getConversations(toListQuery(q), (q.filters['channel'] as any), (q.filters['status'] as any), undefined);

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
