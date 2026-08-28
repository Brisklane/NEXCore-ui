import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function legalTone(s: E.LegalCaseStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.LegalCaseStatus.Settled:
    case E.LegalCaseStatus.Withdrawn:
    case E.LegalCaseStatus.Dismissed: return 'positive';
    case E.LegalCaseStatus.Decided:
    case E.LegalCaseStatus.Appealed: return 'warning';
    default: return 'neutral';
  }
}

/** A countdown: red once it has passed, amber inside a month. */
function daysTone(days: number | undefined | null): 'positive' | 'warning' | 'danger' {
  if (days === undefined || days === null) return 'positive';
  if (days < 0) return 'danger';
  if (days <= 30) return 'warning';
  return 'positive';
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

/** Legal cases — Litigation and what it is worth. */
@Component({
  standalone: true,
  selector: 'lib-re-legal-cases',
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
export class LegalCasesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Legal cases',
    subtitle: 'Litigation and what it is worth.',
    helpKey: 'legal/cases',
    icon: 'gavel',
    searchPlaceholder: 'Reference, case number or opposing party',
    createLabel: 'Record a case',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No litigation',
    emptyMessage: 'Long may that last.',
    columns: [
      { key: 'reference', label: 'Case', kind: 'strong', sub: r => r.caseNumber ?? null, width: '140px' },
      { key: 'caseType', label: 'Type', kind: 'pill' },
      { key: 'opposingParty', label: 'Against', sub: r => r.court ?? null },
      { key: 'ourRole', label: 'Our role', kind: 'pill', hideBelow: 'md' },
      { key: 'claimAmount', label: 'Claim', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'exposureAmount', label: 'Exposure', kind: 'money', align: 'right' },
      { key: 'nextHearingDate', label: 'Next hearing', kind: 'date', tone: r => daysTone(r.daysToHearing) },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.LEGAL_CASE_STATUS_LABELS, r.status), tone: r => legalTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.LEGAL_CASE_STATUS_LABELS) },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: {  } },
      { key: 'hearing', label: 'Hearing this week', apply: { hearingSoonOnly: true }, tone: 'warning' },
      { key: 'blocking', label: 'Blocking transactions', apply: { blockingOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'hearing', label: 'Record a hearing', icon: 'event' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getLegalCases(toListQuery(q), (q.filters['status'] as any));

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
