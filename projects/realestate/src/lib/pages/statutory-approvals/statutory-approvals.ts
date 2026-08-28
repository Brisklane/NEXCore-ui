import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function approvalTone(s: E.ApprovalState): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.ApprovalState.Granted:
    case E.ApprovalState.GrantedWithConditions: return 'positive';
    case E.ApprovalState.QueryRaised:
    case E.ApprovalState.RenewalDue: return 'warning';
    case E.ApprovalState.Rejected:
    case E.ApprovalState.Expired: return 'danger';
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

/** Statutory approvals — Permissions the scheme depends on. */
@Component({
  standalone: true,
  selector: 'lib-re-statutory-approvals',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class StatutoryApprovalsComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Statutory approvals',
    subtitle: 'Permissions the scheme depends on.',
    icon: 'stamp',
    searchPlaceholder: 'Reference, authority or approval number',
    scope: 'project',
    createLabel: 'Record an approval',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No approvals on file',
    emptyMessage: 'Record them so nothing is built under a permission that has lapsed.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'kind', label: 'Approval', kind: 'pill', value: r => lbl(E.APPROVAL_KIND_LABELS, r.kind) },
      { key: 'authority', label: 'Authority', sub: r => r.approvalNumber ?? null },
      { key: 'appliedOn', label: 'Applied', kind: 'date', hideBelow: 'lg' },
      { key: 'grantedOn', label: 'Granted', kind: 'date', hideBelow: 'md' },
      { key: 'validUntil', label: 'Valid until', kind: 'date' },
      { key: 'daysToExpiry', label: 'Days', kind: 'days', tone: r => daysTone(r.daysToExpiry), align: 'right' },
      { key: 'state', label: 'State', kind: 'pill', value: r => lbl(E.APPROVAL_STATE_LABELS, r.state), tone: r => approvalTone(r.state) },
    ],
    filters: [
      { key: 'kind', label: 'Approval', kind: 'select', options: enumOptions(E.APPROVAL_KIND_LABELS) },
      { key: 'state', label: 'State', kind: 'select', options: enumOptions(E.APPROVAL_STATE_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Not yet granted', apply: { pendingOnly: true }, tone: 'warning' },
      { key: 'expiring', label: 'Expiring', apply: { expiringOnly: true }, tone: 'danger' },
      { key: 'blocking', label: 'Blocking a milestone', apply: { blockingOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getApprovalRecords(toListQuery(q), q.scopeId ?? undefined, (q.filters['state'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
