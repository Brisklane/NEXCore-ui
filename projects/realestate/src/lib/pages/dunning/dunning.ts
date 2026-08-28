import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
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

/** Dunning — Cases climbing the escalation ladder. */
@Component({
  standalone: true,
  selector: 'lib-re-dunning',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class DunningComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Dunning',
    subtitle: 'Cases climbing the escalation ladder.',
    helpKey: 'money/dunning',
    icon: 'campaign',
    searchPlaceholder: 'Case reference or customer',
    clickable: false,
    emptyTitle: 'Nothing in collections',
    emptyMessage: 'Every account is current.',
    columns: [
      { key: 'reference', label: 'Case', kind: 'strong', width: '140px' },
      { key: 'partyName', label: 'Customer', sub: r => r.bookingReference ?? null },
      { key: 'currentStep', label: 'Step', kind: 'number', sub: r => r.currentStepName ?? null, align: 'right' },
      { key: 'overdueAmount', label: 'Overdue', kind: 'money', align: 'right' },
      { key: 'daysOverdue', label: 'Days', kind: 'days', tone: r => ageTone(r.daysOverdue), align: 'right' },
      { key: 'nextStepDueAt', label: 'Next step', kind: 'datetime', hideBelow: 'md' },
      { key: 'assignedToName', label: 'With', hideBelow: 'lg' },
      { key: 'isSuspended', label: 'Suspended', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'openOnly', label: 'Open only', kind: 'toggle' },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: { openOnly: true } },
      { key: 'suspended', label: 'Suspended', apply: { suspendedOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'promise', label: 'Record a promise', icon: 'handshake' },
      { key: 'suspend', label: 'Suspend', icon: 'pause', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.money.getDunningCases(toListQuery(q), (q.filters['openOnly'] as any) ?? true);

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
