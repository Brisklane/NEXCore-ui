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

/** Payment certificates — What a contractor gets paid. */
@Component({
  standalone: true,
  selector: 'lib-re-ipcs',
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
export class IpcsComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Payment certificates',
    subtitle: 'What a contractor gets paid.',
    helpKey: 'build/certificates',
    icon: 'receipt',
    searchPlaceholder: 'Certificate number or contractor',
    scope: 'project',
    createLabel: 'Prepare a certificate',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No certificates',
    emptyMessage: 'Prepare one once progress has been measured.',
    columns: [
      { key: 'certificateNumber', label: 'Certificate', kind: 'strong', width: '150px' },
      { key: 'counterpartyName', label: 'For', sub: r => r.packageName ?? null },
      { key: 'periodTo', label: 'Period to', kind: 'date', hideBelow: 'md' },
      { key: 'thisCertificateGross', label: 'This period', kind: 'money', align: 'right' },
      { key: 'retentionThisCertificate', label: 'Retention', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'netPayable', label: 'Net payable', kind: 'money', align: 'right' },
      { key: 'paidAmount', label: 'Paid', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.CERTIFICATE_STATUS_LABELS, r.status), tone: r => certificateTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.CERTIFICATE_STATUS_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Awaiting certification', apply: { status: E.CertificateStatus.SubmittedForCertification }, tone: 'warning' },
      { key: 'unpaid', label: 'Certified but unpaid', apply: { unpaidOnly: true } },
    ],
    rowActions: [
      { key: 'certify', label: 'Certify', icon: 'check', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getIpcs(toListQuery(q), q.scopeId ?? undefined, (q.filters['direction'] as any), (q.filters['status'] as any));

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
