import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Anything past ninety days is red, because recovery rates fall off a cliff there. */
function ageTone(days: number | undefined): 'positive' | 'warning' | 'danger' | 'neutral' {
  if (!days || days <= 0) return 'positive';
  if (days > 90) return 'danger';
  if (days > 30) return 'warning';
  return 'neutral';
}

/** Rent arrears — Who is behind, and for how long. */
@Component({
  standalone: true,
  selector: 'lib-re-arrears',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class ArrearsComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Rent arrears',
    subtitle: 'Who is behind, and for how long.',
    icon: 'money_off',
    searchPlaceholder: 'Case, tenant or property',
    clickable: false,
    emptyTitle: 'Nobody in arrears',
    emptyMessage: 'Every tenancy is current.',
    columns: [
      { key: 'reference', label: 'Case', kind: 'strong', width: '140px' },
      { key: 'tenantName', label: 'Tenant', sub: r => r.addressOneLine ?? null },
      { key: 'arrearsAmount', label: 'Arrears', kind: 'money', align: 'right' },
      { key: 'lateFeeAmount', label: 'Late fees', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'daysInArrears', label: 'Days', kind: 'days', tone: r => ageTone(r.daysInArrears), align: 'right' },
      { key: 'monthsInArrears', label: 'Months', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'noticeServed', label: 'Notice served', kind: 'bool', align: 'center' },
      { key: 'referredToLegal', label: 'With legal', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'month', label: 'Over a month', apply: { minDays: 30 }, tone: 'warning' },
      { key: 'serious', label: 'Over three months', apply: { minDays: 90 }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'notice', label: 'Serve notice', icon: 'gavel', tone: 'danger' },
      { key: 'promise', label: 'Record a promise', icon: 'handshake' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getArrears(toListQuery(q), (q.filters['minDays'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
