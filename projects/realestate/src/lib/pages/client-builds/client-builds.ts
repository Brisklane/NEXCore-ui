import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConstructionService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Client builds — Building on the client own land. */
@Component({
  standalone: true,
  selector: 'lib-re-client-builds',
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
export class ClientBuildsComponent implements OnInit {
  private construction = inject(ConstructionService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Client builds',
    subtitle: 'Building on the client own land.',
    helpKey: 'client-builds',
    icon: 'home_work',
    searchPlaceholder: 'Reference, client or site',
    createLabel: 'New contract',
    createIcon: 'add',
    emptyTitle: 'No client builds',
    emptyMessage: 'Create a contract to build on somebody else land.',
    columns: [
      { key: 'reference', label: 'Contract', kind: 'strong', width: '140px' },
      { key: 'clientName', label: 'Client', sub: r => r.siteAddress ?? null },
      { key: 'revisedContractValue', label: 'Value', kind: 'money', align: 'right' },
      { key: 'totalReceived', label: 'Received', kind: 'money', align: 'right' },
      { key: 'progressPercent', label: 'Progress', kind: 'progress', align: 'right' },
      { key: 'forecastMargin', label: 'Forecast margin', kind: 'money', sub: r => r.marginPercent ? r.marginPercent.toFixed(1) + '%' : null, tone: r => r.isMarginAtRisk ? 'danger' : 'neutral', align: 'right' },
      { key: 'slipDays', label: 'Slip', kind: 'days', align: 'right', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
    presets: [
      { key: 'live', label: 'On site', apply: {  } },
      { key: 'margin', label: 'Margin at risk', apply: { marginAtRiskOnly: true }, tone: 'danger' },
      { key: 'decisions', label: 'Awaiting client decisions', apply: { pendingDecisionsOnly: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getClientBuilds(toListQuery(q), (q.filters['status'] as any));

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/client-builds/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
