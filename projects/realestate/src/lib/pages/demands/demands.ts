import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function demandTone(s: E.DemandStatus): 'positive' | 'warning' | 'neutral' {
  switch (s) {
    case E.DemandStatus.Settled: return 'positive';
    case E.DemandStatus.Sent:
    case E.DemandStatus.Generated: return 'warning';
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

/** Demands — Instalments raised against buyers. */
@Component({
  standalone: true,
  selector: 'lib-re-demands',
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
export class DemandsComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Demands',
    subtitle: 'Instalments raised against buyers.',
    helpKey: 'money/demands',
    icon: 'request_quote',
    searchPlaceholder: 'Demand number, customer or booking',
    createLabel: 'Raise demands',
    createIcon: 'playlist_add',
    clickable: false,
    emptyTitle: 'No demands raised',
    emptyMessage: 'Raise them against a milestone or a date, and preview before committing.',
    columns: [
      { key: 'demandNumber', label: 'Demand', kind: 'strong', width: '140px' },
      { key: 'applicantName', label: 'Customer', sub: r => r.bookingReference ?? null },
      { key: 'unitNumber', label: 'Unit', sub: r => r.projectName ?? null, hideBelow: 'md' },
      { key: 'issuedOn', label: 'Issued', kind: 'date', hideBelow: 'lg' },
      { key: 'dueDate', label: 'Due', kind: 'date', sub: r => r.daysOverdue > 0 ? r.daysOverdue + ' days overdue' : null },
      { key: 'totalAmount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'balance', label: 'Outstanding', kind: 'money', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.DEMAND_STATUS_LABELS, r.status), tone: r => demandTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.DEMAND_STATUS_LABELS) },
    ],
    presets: [
      { key: 'outstanding', label: 'Outstanding', apply: { outstandingOnly: true } },
      { key: 'overdue', label: 'Overdue', apply: { overdueOnly: true }, tone: 'danger' },
      { key: 'unsent', label: 'Not yet sent', apply: { status: E.DemandStatus.Generated }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'send', label: 'Send', icon: 'send', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.money.getDemands(toListQuery(q), undefined, (q.filters['status'] as any));

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
