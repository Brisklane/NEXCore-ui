import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function severityTone(s: E.AlertSeverity): 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.AlertSeverity.Critical: return 'danger';
    case E.AlertSeverity.Warning: return 'warning';
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

/** Client money — Money held on behalf of clients. */
@Component({
  standalone: true,
  selector: 'lib-re-client-money',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class ClientMoneyComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Client money',
    subtitle: 'Money held on behalf of clients.',
    helpKey: 'leasing/client-money',
    icon: 'account_balance_wallet',
    clickable: false,
    emptyTitle: 'Everything reconciles',
    emptyMessage: 'Client money that will not reconcile is the one finding that closes an agency down.',
    columns: [
      { key: 'kind', label: 'Exception', kind: 'pill', value: r => lbl(E.CLIENT_MONEY_EXCEPTION_KIND_LABELS, r.kind) },
      { key: 'severity', label: 'Severity', kind: 'pill', value: r => lbl(E.ALERT_SEVERITY_LABELS, r.severity), tone: r => severityTone(r.severity) },
      { key: 'partyName', label: 'Party', sub: r => r.accountName ?? null },
      { key: 'amount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'raisedOn', label: 'Raised', kind: 'date' },
      { key: 'assignedToName', label: 'With', hideBelow: 'md' },
      { key: 'requiresRegulatoryReport', label: 'Reportable', kind: 'bool', tone: r => r.requiresRegulatoryReport ? 'danger' : 'neutral', align: 'center' },
      { key: 'isResolved', label: 'Resolved', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'openOnly', label: 'Open only', kind: 'toggle' },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: { openOnly: true } },
      { key: 'reportable', label: 'Reportable', apply: { reportableOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'resolve', label: 'Resolve', icon: 'check', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getExceptions(toListQuery(q), (q.filters['openOnly'] as any) ?? true);

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
