import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasingService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Rent runs — Charges raised against tenancies. */
@Component({
  standalone: true,
  selector: 'lib-re-rent-runs',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class RentRunsComponent implements OnInit {
  private leasing = inject(LeasingService);

  readonly config: ListConfig<any> = {
    title: 'Rent runs',
    subtitle: 'Charges raised against tenancies.',
    icon: 'playlist_add_check',
    searchPlaceholder: 'Run reference',
    createLabel: 'Run rent',
    createIcon: 'play_arrow',
    clickable: false,
    emptyTitle: 'No rent runs',
    emptyMessage: 'Run rent to raise this period charges.',
    columns: [
      { key: 'reference', label: 'Run', kind: 'strong', width: '140px' },
      { key: 'periodFrom', label: 'Period', kind: 'date', sub: r => 'to ' + (r.periodTo ?? '') },
      { key: 'runDate', label: 'Run on', kind: 'date' },
      { key: 'tenancyCount', label: 'Tenancies', kind: 'number', align: 'right' },
      { key: 'totalCharged', label: 'Charged', kind: 'money', align: 'right' },
      { key: 'failedCount', label: 'Failed', kind: 'number', tone: r => r.failedCount ? 'danger' : 'neutral', align: 'right' },
      { key: 'isDryRun', label: 'Dry run', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'runByName', label: 'By', hideBelow: 'lg' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.leasing.getRentRuns(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
