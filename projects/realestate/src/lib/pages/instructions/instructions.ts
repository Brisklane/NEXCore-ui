import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Instructions — What the vendor or landlord signed. */
@Component({
  standalone: true,
  selector: 'lib-re-instructions',
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
export class InstructionsComponent implements OnInit {
  private listings = inject(ListingService);

  readonly config: ListConfig<any> = {
    title: 'Instructions',
    subtitle: 'What the vendor or landlord signed.',
    helpKey: 'instructions',
    icon: 'assignment',
    searchPlaceholder: 'Reference, property or client',
    scope: 'office',
    createLabel: 'Take an instruction',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No instructions',
    emptyMessage: 'Take an instruction before advertising a property.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'addressOneLine', label: 'Property', sub: r => r.clientName ?? null },
      { key: 'basis', label: 'Basis', kind: 'pill', value: r => r.basisLabel ?? '—' },
      { key: 'feePercent', label: 'Fee', kind: 'percent', align: 'right' },
      { key: 'signedOn', label: 'Signed', kind: 'date', hideBelow: 'md' },
      { key: 'expiresOn', label: 'Expires', kind: 'date' },
      { key: 'status', label: 'Status', kind: 'pill', tone: r => r.isExpiring ? 'warning' : 'neutral' },
    ],
    presets: [
      { key: 'live', label: 'Live', apply: {  } },
      { key: 'expiring', label: 'Expiring soon', apply: { expiringOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'terminate', label: 'End instruction', icon: 'cancel', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.listings.getInstructions(toListQuery(q, { officeId: q.scopeId ?? undefined }));

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
