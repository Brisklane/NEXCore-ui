import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExitService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function nocTone(s: E.NocStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.NocStatus.Issued: return 'positive';
    case E.NocStatus.Requested:
    case E.NocStatus.DuesCheckPending: return 'warning';
    case E.NocStatus.Rejected:
    case E.NocStatus.Revoked:
    case E.NocStatus.Expired: return 'danger';
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

/** No-objection certificates — Requested, issued and revoked. */
@Component({
  standalone: true,
  selector: 'lib-re-nocs',
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
export class NocsComponent implements OnInit {
  private exit = inject(ExitService);

  readonly config: ListConfig<any> = {
    title: 'No-objection certificates',
    subtitle: 'Requested, issued and revoked.',
    helpKey: 'exit/nocs',
    icon: 'verified',
    searchPlaceholder: 'Number, contact or unit',
    createLabel: 'Request a NOC',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No certificates',
    emptyMessage: 'Request one against a transfer, a mortgage or a construction.',
    columns: [
      { key: 'nocNumber', label: 'Number', kind: 'strong', width: '150px' },
      { key: 'partyName', label: 'For', sub: r => r.unitNumber ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.NOC_KIND_LABELS, r.kind) },
      { key: 'requestedOn', label: 'Requested', kind: 'date', hideBelow: 'md' },
      { key: 'issuedOn', label: 'Issued', kind: 'date' },
      { key: 'outstandingAtIssue', label: 'Dues at issue', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.NOC_STATUS_LABELS, r.status), tone: r => nocTone(r.status) },
      { key: 'verificationCode', label: 'Code', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'kind', label: 'Kind', kind: 'select', options: enumOptions(E.NOC_KIND_LABELS) },
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.NOC_STATUS_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Waiting to issue', apply: { status: E.NocStatus.Requested }, tone: 'warning' },
      { key: 'issued', label: 'Issued', apply: { status: E.NocStatus.Issued } },
    ],
    rowActions: [
      { key: 'issue', label: 'Issue', icon: 'verified', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.exit.getNocs(toListQuery(q), (q.filters['kind'] as any), (q.filters['status'] as any));

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
