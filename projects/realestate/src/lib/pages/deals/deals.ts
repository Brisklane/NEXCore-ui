import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BrokerageService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function dealTone(s: E.DealStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.DealStatus.Completed:
    case E.DealStatus.Exchanged: return 'positive';
    case E.DealStatus.OnHold: return 'warning';
    case E.DealStatus.FellThrough:
    case E.DealStatus.Cancelled: return 'danger';
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

/** Deals — Sales agreed but not yet completed. */
@Component({
  standalone: true,
  selector: 'lib-re-deals',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowClick)="open($any($event))"
      (create)="create()"
    />
  `,
})
export class DealsComponent implements OnInit {
  private brokerage = inject(BrokerageService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Deals',
    subtitle: 'Sales agreed but not yet completed.',
    helpKey: 'brokerage/deals',
    icon: 'handshake',
    searchPlaceholder: 'Deal reference, property or buyer',
    scope: 'office',
    createLabel: 'Agree a sale',
    createIcon: 'add',
    emptyTitle: 'No deals in progress',
    emptyMessage: 'Agree a sale from an offer.',
    columns: [
      { key: 'reference', label: 'Deal', kind: 'strong', width: '130px' },
      { key: 'addressOneLine', label: 'Property', sub: r => r.buyerName ?? null },
      { key: 'agreedPrice', label: 'Agreed', kind: 'money', align: 'right' },
      { key: 'grossFee', label: 'Our fee', kind: 'money', align: 'right' },
      { key: 'progressPercent', label: 'Progress', kind: 'progress', align: 'right' },
      { key: 'daysSinceLastMilestone', label: 'Stuck', kind: 'days', sub: r => r.isStalled ? 'days — chase it' : 'days', tone: r => r.isStalled ? 'danger' : 'neutral', align: 'right' },
      { key: 'nextStepLabel', label: 'Next step', sub: r => r.nextStepOverdue ? 'overdue' : null, hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.DEAL_STATUS_LABELS, r.status), tone: r => dealTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.DEAL_STATUS_LABELS) },
    ],
    presets: [
      { key: 'live', label: 'In progress', apply: {  } },
      { key: 'stalled', label: 'Stalled', apply: { stalledOnly: true }, tone: 'danger' },
      { key: 'chain', label: 'In a chain', apply: { inChainOnly: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.brokerage.getDeals(toListQuery(q, { officeId: q.scopeId ?? undefined }), (q.filters['status'] as any), undefined);

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/brokerage/deals/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
