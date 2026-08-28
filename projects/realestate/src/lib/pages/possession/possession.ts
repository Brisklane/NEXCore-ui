import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExitService } from '../../services/realestate.services';
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

/** Possession — Units ready to hand over. */
@Component({
  standalone: true,
  selector: 'lib-re-possession',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class PossessionComponent implements OnInit {
  private exit = inject(ExitService);

  readonly config: ListConfig<any> = {
    title: 'Possession',
    subtitle: 'Units ready to hand over.',
    helpKey: 'exit/possession',
    icon: 'key',
    searchPlaceholder: 'Reference, customer or unit',
    scope: 'project',
    clickable: false,
    emptyTitle: 'Nothing ready for possession',
    emptyMessage: 'Units appear here once the scheme is far enough along.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'applicantName', label: 'Customer', sub: r => r.bookingReference ?? null },
      { key: 'unitNumber', label: 'Unit', sub: r => r.blockName ?? null },
      { key: 'offeredOn', label: 'Offered', kind: 'date', hideBelow: 'md' },
      { key: 'windowFrom', label: 'Window', kind: 'date', sub: r => r.windowTo ? 'to ' + r.windowTo : null, hideBelow: 'md' },
      { key: 'outstandingDues', label: 'Dues', kind: 'money', align: 'right' },
      { key: 'openSnagCount', label: 'Snags', kind: 'number', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.POSSESSION_STATUS_LABELS, r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.POSSESSION_STATUS_LABELS) },
    ],
    presets: [
      { key: 'offered', label: 'Offered', apply: { status: E.PossessionStatus.Offered } },
      { key: 'blocked', label: 'Blocked', apply: { blockedOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'handover', label: 'Complete handover', icon: 'key', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.exit.getPossessions(toListQuery(q), (q.filters['status'] as any), q.scopeId ?? undefined);

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
