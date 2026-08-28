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

/** Portal accounts — Who can sign in from outside. */
@Component({
  standalone: true,
  selector: 'lib-re-portal-users',
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
export class PortalUsersComponent implements OnInit {
  private communication = inject(CommunicationService);

  readonly config: ListConfig<any> = {
    title: 'Portal accounts',
    subtitle: 'Who can sign in from outside.',
    icon: 'account_circle',
    searchPlaceholder: 'Name, email or phone',
    createLabel: 'Create an account',
    createIcon: 'person_add',
    clickable: false,
    emptyTitle: 'No portal accounts',
    emptyMessage: 'Create one so a customer can see their own statement without telephoning.',
    columns: [
      { key: 'displayName', label: 'Name', kind: 'strong', sub: r => r.loginIdentifier ?? null },
      { key: 'audience', label: 'Audience', kind: 'pill', value: r => lbl(E.PORTAL_AUDIENCE_LABELS, r.audience) },
      { key: 'email', label: 'Contact', sub: r => r.phone ?? null, hideBelow: 'md' },
      { key: 'lastLoginAt', label: 'Last signed in', kind: 'datetime' },
      { key: 'invitedAt', label: 'Invited', kind: 'date', hideBelow: 'lg' },
      { key: 'isLocked', label: 'Locked', kind: 'bool', tone: r => r.isLocked ? 'danger' : 'neutral', align: 'center' },
      { key: 'isActive', label: 'Active', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'audience', label: 'Audience', kind: 'select', options: enumOptions(E.PORTAL_AUDIENCE_LABELS) },
    ],
    presets: [
      { key: 'active', label: 'Active', apply: {  } },
      { key: 'never', label: 'Never signed in', apply: { neverSignedInOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'invite', label: 'Send an invitation', icon: 'send', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.communication.getPortalUsers(toListQuery(q), (q.filters['audience'] as any));

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
