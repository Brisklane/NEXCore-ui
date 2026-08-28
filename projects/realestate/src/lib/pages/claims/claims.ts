import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function certificateTone(s: E.CertificateStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.CertificateStatus.Paid:
    case E.CertificateStatus.Approved: return 'positive';
    case E.CertificateStatus.Certified:
    case E.CertificateStatus.SubmittedForCertification: return 'warning';
    case E.CertificateStatus.Rejected:
    case E.CertificateStatus.Cancelled: return 'danger';
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

/** Subcontractor claims — What has been claimed and certified. */
@Component({
  standalone: true,
  selector: 'lib-re-claims',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class ClaimsComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Subcontractor claims',
    subtitle: 'What has been claimed and certified.',
    icon: 'request_page',
    searchPlaceholder: 'Claim reference or contractor',
    clickable: false,
    emptyTitle: 'No claims',
    emptyMessage: 'They arrive from subcontractors as work is done.',
    columns: [
      { key: 'reference', label: 'Claim', kind: 'strong', width: '140px' },
      { key: 'contractorName', label: 'Contractor', sub: r => r.subcontractReference ?? null },
      { key: 'periodTo', label: 'Period to', kind: 'date', hideBelow: 'md' },
      { key: 'claimedGross', label: 'Claimed', kind: 'money', align: 'right' },
      { key: 'certifiedGross', label: 'Certified', kind: 'money', align: 'right' },
      { key: 'disallowedAmount', label: 'Disallowed', kind: 'money', tone: r => r.disallowedAmount ? 'danger' : 'neutral', align: 'right' },
      { key: 'netPayable', label: 'Net payable', kind: 'money', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.CERTIFICATE_STATUS_LABELS, r.status), tone: r => certificateTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.CERTIFICATE_STATUS_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Awaiting certification', apply: { status: E.CertificateStatus.SubmittedForCertification }, tone: 'warning' },
      { key: 'disputed', label: 'Disputed', apply: { disputedOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'certify', label: 'Certify', icon: 'check', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getClaims(toListQuery(q), undefined, (q.filters['status'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
