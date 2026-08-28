import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Signatures — Documents out for signing. */
@Component({
  standalone: true,
  selector: 'lib-re-signatures',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class SignaturesComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Signatures',
    subtitle: 'Documents out for signing.',
    icon: 'draw',
    clickable: false,
    emptyTitle: 'Nothing out for signature',
    emptyMessage: 'Start signing from a generated document.',
    columns: [
      { key: 'documentNumber', label: 'Document', kind: 'strong', width: '150px' },
      { key: 'title', label: 'Title', sub: r => r.documentType ?? null },
      { key: 'generatedAt', label: 'Generated', kind: 'datetime' },
      { key: 'isSigned', label: 'Signed', kind: 'bool', tone: r => r.isSigned ? 'positive' : 'warning', align: 'center' },
      { key: 'isSent', label: 'Sent', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'verificationCode', label: 'Code', hideBelow: 'lg' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getDocuments(toListQuery(q), undefined, undefined);

}
