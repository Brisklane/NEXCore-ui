import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function kycTone(s: E.KycStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.KycStatus.Verified: return 'positive';
    case E.KycStatus.PendingVerification:
    case E.KycStatus.InProgress:
    case E.KycStatus.EnhancedReview: return 'warning';
    case E.KycStatus.Rejected:
    case E.KycStatus.Expired: return 'danger';
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

/** KYC queue — Identity checks waiting on a decision. */
@Component({
  standalone: true,
  selector: 'lib-re-kyc',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class KycComponent implements OnInit {
  private crm = inject(CrmService);

  readonly config: ListConfig<any> = {
    title: 'KYC queue',
    subtitle: 'Identity checks waiting on a decision.',
    helpKey: 'kyc',
    icon: 'badge',
    searchPlaceholder: 'Contact name or reference',
    clickable: false,
    emptyTitle: 'Nothing waiting',
    emptyMessage: 'Every identity check has been decided.',
    columns: [
      { key: 'partyName', label: 'Contact', kind: 'strong', sub: r => r.partyPhone ?? null },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.KYC_STATUS_LABELS, r.status), tone: r => kycTone(r.status) },
      { key: 'riskRating', label: 'Risk', kind: 'pill', hideBelow: 'md' },
      { key: 'documentCount', label: 'Documents', kind: 'number', align: 'right' },
      { key: 'verifiedCount', label: 'Verified', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'submittedOn', label: 'Submitted', kind: 'date' },
      { key: 'daysWaiting', label: 'Waiting', kind: 'days', sub: r => r.daysWaiting ? 'days' : null, align: 'right' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.KYC_STATUS_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Waiting on us', apply: { status: E.KycStatus.PendingVerification }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
      { key: 'reject', label: 'Reject', icon: 'close', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.crm.getKycQueue(toListQuery(q), (q.filters['status'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
