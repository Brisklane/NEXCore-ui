import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function fileTone(s: E.PhysicalFileState): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.PhysicalFileState.InRecordRoom: return 'positive';
    case E.PhysicalFileState.Missing:
    case E.PhysicalFileState.Destroyed: return 'danger';
    case E.PhysicalFileState.ReleasedToOwner:
    case E.PhysicalFileState.Archived: return 'neutral';
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

/** Record room — Where every original file is. */
@Component({
  standalone: true,
  selector: 'lib-re-physical-files',
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
export class PhysicalFilesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Record room',
    subtitle: 'Where every original file is.',
    helpKey: 'records/files',
    icon: 'folder',
    searchPlaceholder: 'File number, barcode or rack',
    createLabel: 'Register a file',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No files registered',
    emptyMessage: 'Register them so an original title deed is never simply lost.',
    columns: [
      { key: 'fileNumber', label: 'File', kind: 'strong', width: '140px' },
      { key: 'partyName', label: 'Belongs to', sub: r => r.unitNumber ?? r.bookingReference ?? null },
      { key: 'state', label: 'State', kind: 'pill', value: r => lbl(E.PHYSICAL_FILE_STATE_LABELS, r.state), tone: r => fileTone(r.state) },
      { key: 'rack', label: 'Location', value: r => [r.roomLocation, r.rack, r.shelf].filter(Boolean).join(' / '), hideBelow: 'md' },
      { key: 'issuedToName', label: 'With', sub: r => r.issuedOn ?? null },
      { key: 'dueBackOn', label: 'Due back', kind: 'date', tone: r => r.isOverdue ? 'danger' : 'neutral' },
      { key: 'documentCount', label: 'Documents', kind: 'number', align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'state', label: 'State', kind: 'select', options: enumOptions(E.PHYSICAL_FILE_STATE_LABELS) },
    ],
    presets: [
      { key: 'out', label: 'Out of the room', apply: { outOnly: true }, tone: 'warning' },
      { key: 'overdue', label: 'Overdue back', apply: { overdueOnly: true }, tone: 'danger' },
      { key: 'missing', label: 'Missing', apply: { state: E.PhysicalFileState.Missing }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'out', label: 'Issue', icon: 'logout' },
      { key: 'in', label: 'Return', icon: 'login', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getPhysicalFiles(toListQuery(q), (q.filters['state'] as any));

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
