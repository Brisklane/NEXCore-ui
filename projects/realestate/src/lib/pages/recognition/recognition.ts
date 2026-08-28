import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Revenue recognition — What has actually been earned. */
@Component({
  standalone: true,
  selector: 'lib-re-recognition',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class RecognitionComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Revenue recognition',
    subtitle: 'What has actually been earned.',
    helpKey: 'finance/recognition',
    icon: 'trending_up',
    searchPlaceholder: 'Run reference',
    createLabel: 'Run recognition',
    createIcon: 'play_arrow',
    clickable: false,
    emptyTitle: 'No recognition runs',
    emptyMessage: 'Run one to close a period.',
    columns: [
      { key: 'reference', label: 'Run', kind: 'strong', width: '130px' },
      { key: 'projectName', label: 'Project', sub: r => r.periodFrom + ' to ' + r.periodTo },
      { key: 'contractCount', label: 'Contracts', kind: 'number', align: 'right' },
      { key: 'revenueRecognised', label: 'Revenue', kind: 'money', align: 'right' },
      { key: 'costRecognised', label: 'Cost', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'grossMargin', label: 'Margin', kind: 'money', align: 'right' },
      { key: 'contractLiabilityTotal', label: 'Deferred', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'isDryRun', label: 'Dry run', kind: 'bool', align: 'center' },
    ],
    presets: [
      { key: 'posted', label: 'Posted', apply: { postedOnly: true } },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getRecognitionRuns(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
