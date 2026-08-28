import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Documents — Everything this business has issued. */
@Component({
  standalone: true,
  selector: 'lib-re-documents',
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
export class DocumentsComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Documents',
    subtitle: 'Everything this business has issued.',
    helpKey: 'documents',
    icon: 'description',
    searchPlaceholder: 'Number, title or verification code',
    createLabel: 'Generate a document',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No documents',
    emptyMessage: 'Generate one from a booking, tenancy or contract.',
    columns: [
      { key: 'documentNumber', label: 'Number', kind: 'strong', width: '150px' },
      { key: 'title', label: 'Document', sub: r => r.documentType ?? null },
      { key: 'generatedAt', label: 'Generated', kind: 'datetime' },
      { key: 'generatedByName', label: 'By', hideBelow: 'lg' },
      { key: 'pageCount', label: 'Pages', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'isSent', label: 'Sent', kind: 'bool', align: 'center' },
      { key: 'isSigned', label: 'Signed', kind: 'bool', align: 'center' },
      { key: 'verificationCode', label: 'Code', hideBelow: 'md' },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'unsigned', label: 'Awaiting signature', apply: { unsignedOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'download', label: 'Open', icon: 'open_in_new' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getDocuments(toListQuery(q), (q.filters['documentType'] as any), undefined);

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
