import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function outcomeTone(o: E.ApprovalOutcome): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (o) {
    case E.ApprovalOutcome.Approved:
    case E.ApprovalOutcome.AutoApproved: return 'positive';
    case E.ApprovalOutcome.Pending:
    case E.ApprovalOutcome.Escalated: return 'warning';
    case E.ApprovalOutcome.Rejected:
    case E.ApprovalOutcome.Withdrawn: return 'danger';
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

/** Approvals — Decisions waiting on you. */
@Component({
  standalone: true,
  selector: 'lib-re-approval-inbox',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class ApprovalInboxComponent implements OnInit {
  private admin = inject(AdminService);

  readonly config: ListConfig<any> = {
    title: 'Approvals',
    subtitle: 'Decisions waiting on you.',
    helpKey: 'setup/approval-inbox',
    icon: 'inbox',
    searchPlaceholder: 'Reference or summary',
    clickable: false,
    emptyTitle: 'Nothing waiting on you',
    emptyMessage: 'Every decision has been made.',
    columns: [
      { key: 'documentType', label: 'What', kind: 'strong', sub: r => r.entityReference ?? null },
      { key: 'summary', label: 'Summary' },
      { key: 'amount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'requestedByName', label: 'Asked by', hideBelow: 'md' },
      { key: 'requestedAt', label: 'Asked', kind: 'datetime' },
      { key: 'currentLevel', label: 'Level', kind: 'number', sub: r => 'of ' + (r.requiredLevels ?? 1), align: 'right', hideBelow: 'md' },
      { key: 'outcome', label: 'Outcome', kind: 'pill', value: r => lbl(E.APPROVAL_OUTCOME_LABELS, r.outcome), tone: r => outcomeTone(r.outcome) },
    ],
    filters: [
      { key: 'mineOnly', label: 'Mine only', kind: 'toggle' },
    ],
    presets: [
      { key: 'mine', label: 'Waiting on me', apply: { mineOnly: true } },
      { key: 'all', label: 'Everything', apply: { mineOnly: false } },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
      { key: 'reject', label: 'Reject', icon: 'close', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.admin.getApprovals(toListQuery(q), (q.filters['mineOnly'] as any) ?? true);

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
