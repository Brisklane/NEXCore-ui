import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Quarterly returns — What goes to the regulator. */
@Component({
  standalone: true,
  selector: 'lib-re-qpr',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class QprComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Quarterly returns',
    subtitle: 'What goes to the regulator.',
    helpKey: 'compliance/qpr',
    icon: 'summarize',
    searchPlaceholder: 'Reference or project',
    createLabel: 'Generate a return',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No returns',
    emptyMessage: 'Generate one for the quarter just ended.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'projectName', label: 'Project', sub: r => r.filingType ?? null },
      { key: 'periodTo', label: 'Period to', kind: 'date' },
      { key: 'dueOn', label: 'Due', kind: 'date', tone: r => r.isOverdue ? 'danger' : 'neutral' },
      { key: 'filedOn', label: 'Filed', kind: 'date' },
      { key: 'acknowledgementNumber', label: 'Acknowledgement', hideBelow: 'md' },
      { key: 'lateFilingPenalty', label: 'Penalty', kind: 'money', align: 'right', hideBelow: 'lg' },
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

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
