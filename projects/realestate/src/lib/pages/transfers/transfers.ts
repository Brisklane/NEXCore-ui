import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExitService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function transferTone(s: E.TransferStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.TransferStatus.Completed: return 'positive';
    case E.TransferStatus.Rejected:
    case E.TransferStatus.Cancelled: return 'danger';
    default: return 'warning';
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

/** Transfers — Files and units changing hands. */
@Component({
  standalone: true,
  selector: 'lib-re-transfers',
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
export class TransfersComponent implements OnInit {
  private exit = inject(ExitService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Transfers',
    subtitle: 'Files and units changing hands.',
    helpKey: 'exit/transfers',
    icon: 'swap_horiz',
    searchPlaceholder: 'Reference, transferor or transferee',
    scope: 'project',
    createLabel: 'Start a transfer',
    createIcon: 'add',
    emptyTitle: 'No transfers',
    emptyMessage: 'Start one from a booking or a plot file.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'fromPartyName', label: 'From', sub: r => r.unitNumber ?? r.fileNumber ?? null },
      { key: 'toPartyName', label: 'To', sub: r => r.toPartyPhone ?? null },
      { key: 'requestedOn', label: 'Started', kind: 'date', hideBelow: 'md' },
      { key: 'totalFees', label: 'Fees', kind: 'money', align: 'right' },
      { key: 'duesCleared', label: 'Dues clear', kind: 'bool', align: 'center' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.TRANSFER_STATUS_LABELS, r.status), tone: r => transferTone(r.status) },
      { key: 'blockingReason', label: 'Blocked by', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.TRANSFER_STATUS_LABELS) },
    ],
    presets: [
      { key: 'inflight', label: 'In progress', apply: {  } },
      { key: 'blocked', label: 'Blocked', apply: { blockedOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.exit.getTransfers(toListQuery(q), (q.filters['status'] as any), q.scopeId ?? undefined);

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/exit/transfers/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
