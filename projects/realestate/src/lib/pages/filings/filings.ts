import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Regulatory filings — Returns due and returns made. */
@Component({
  standalone: true,
  selector: 'lib-re-filings',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class FilingsComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Regulatory filings',
    subtitle: 'Returns due and returns made.',
    icon: 'upload_file',
    searchPlaceholder: 'Reference or filing type',
    clickable: false,
    emptyTitle: 'No filings',
    emptyMessage: 'They appear here when a return is generated.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'filingType', label: 'Filing', sub: r => r.projectName ?? null },
      { key: 'authority', label: 'Authority', hideBelow: 'md' },
      { key: 'periodTo', label: 'Period to', kind: 'date', hideBelow: 'md' },
      { key: 'dueOn', label: 'Due', kind: 'date', sub: r => r.isOverdue ? 'overdue' : null, tone: r => r.isOverdue ? 'danger' : 'neutral' },
      { key: 'filedOn', label: 'Filed', kind: 'date' },
      { key: 'acknowledgementNumber', label: 'Acknowledgement', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
    presets: [
      { key: 'due', label: 'Due', apply: {  } },
      { key: 'overdue', label: 'Overdue', apply: { overdueOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getFilings(toListQuery(q), (q.filters['status'] as any));

}
