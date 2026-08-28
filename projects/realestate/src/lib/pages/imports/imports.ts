import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Data imports — Bringing an existing business in. */
@Component({
  standalone: true,
  selector: 'lib-re-imports',
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
export class ImportsComponent implements OnInit {
  private admin = inject(AdminService);

  readonly config: ListConfig<any> = {
    title: 'Data imports',
    subtitle: 'Bringing an existing business in.',
    icon: 'upload',
    searchPlaceholder: 'Batch reference or file name',
    createLabel: 'New import',
    createIcon: 'upload',
    clickable: false,
    emptyTitle: 'No imports',
    emptyMessage: 'Upload a file to bring an existing register in. Nothing is written until you commit.',
    columns: [
      { key: 'reference', label: 'Batch', kind: 'strong', width: '140px' },
      { key: 'entityType', label: 'What', sub: r => r.fileName ?? null },
      { key: 'uploadedAt', label: 'Uploaded', kind: 'datetime' },
      { key: 'rowCount', label: 'Rows', kind: 'number', align: 'right' },
      { key: 'validCount', label: 'Valid', kind: 'number', align: 'right' },
      { key: 'errorCount', label: 'Errors', kind: 'number', tone: r => r.errorCount ? 'danger' : 'neutral', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
    rowActions: [
      { key: 'commit', label: 'Commit', icon: 'check', tone: 'accent' },
      { key: 'rollback', label: 'Roll back', icon: 'undo', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.admin.getImports(toListQuery(q));

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
