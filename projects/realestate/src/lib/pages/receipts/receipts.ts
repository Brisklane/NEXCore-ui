import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function receiptTone(s: E.ReceiptStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.ReceiptStatus.Posted: return 'positive';
    case E.ReceiptStatus.Reversed:
    case E.ReceiptStatus.Cancelled: return 'danger';
    case E.ReceiptStatus.OnAccount:
    case E.ReceiptStatus.Draft: return 'warning';
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

/** Receipts — Money in. */
@Component({
  standalone: true,
  selector: 'lib-re-receipts',
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
export class ReceiptsComponent implements OnInit {
  private money = inject(MoneyService);

  readonly config: ListConfig<any> = {
    title: 'Receipts',
    subtitle: 'Money in.',
    helpKey: 'money/receipts',
    icon: 'payments',
    searchPlaceholder: 'Receipt number, payer or instrument number',
    scope: 'project',
    createLabel: 'Take a payment',
    createIcon: 'add_card',
    clickable: false,
    emptyTitle: 'No receipts',
    emptyMessage: 'Take a payment against a booking or a demand.',
    columns: [
      { key: 'receiptNumber', label: 'Receipt', kind: 'strong', width: '140px' },
      { key: 'receivedOn', label: 'Date', kind: 'date' },
      { key: 'partyName', label: 'From', sub: r => r.bookingReference ?? null },
      { key: 'instrument', label: 'Instrument', kind: 'pill', value: r => lbl(E.PAYMENT_INSTRUMENT_LABELS, r.instrument), sub: r => r.instrumentNumber ?? null, hideBelow: 'md' },
      { key: 'amount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'unallocatedAmount', label: 'Unallocated', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'escrowAmount', label: 'To escrow', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.RECEIPT_STATUS_LABELS, r.status), tone: r => receiptTone(r.status) },
    ],
    filters: [
      { key: 'instrument', label: 'Instrument', kind: 'select', options: enumOptions(E.PAYMENT_INSTRUMENT_LABELS) },
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.RECEIPT_STATUS_LABELS) },
    ],
    presets: [
      { key: 'today', label: 'Today', apply: { today: true } },
      { key: 'unallocated', label: 'Unallocated', apply: { unallocatedOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'print', label: 'Print', icon: 'print' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.money.searchReceipts({ page: q.page, pageSize: q.pageSize, search: q.search, projectId: q.scopeId ?? undefined, instrument: (q.filters['instrument'] as any), status: (q.filters['status'] as any) });

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
