import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function viewingTone(s: E.ViewingStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.ViewingStatus.Completed: return 'positive';
    case E.ViewingStatus.Confirmed:
    case E.ViewingStatus.Scheduled: return 'warning';
    case E.ViewingStatus.NoShow:
    case E.ViewingStatus.Cancelled: return 'danger';
    default: return 'neutral';
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

/** Site visits — Visits to a scheme. */
@Component({
  standalone: true,
  selector: 'lib-re-site-visits',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class SiteVisitsComponent implements OnInit {
  private crm = inject(CrmService);

  readonly config: ListConfig<any> = {
    title: 'Site visits',
    subtitle: 'Visits to a scheme.',
    helpKey: 'site-visits',
    icon: 'directions_car',
    searchPlaceholder: 'Reference or visitor',
    scope: 'project',
    createLabel: 'Book a visit',
    createIcon: 'event',
    clickable: false,
    emptyTitle: 'No site visits',
    emptyMessage: 'Book one from an enquiry.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'scheduledAt', label: 'When', kind: 'datetime' },
      { key: 'partyName', label: 'Visitor', sub: r => r.partyPhone ?? null },
      { key: 'partnerName', label: 'Brought by', hideBelow: 'md' },
      { key: 'guestCount', label: 'Guests', kind: 'number', align: 'right', hideBelow: 'lg' },
      { key: 'visitNumber', label: 'Visit', kind: 'number', sub: r => r.isRevisit ? 'revisit' : null, align: 'right', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.VIEWING_STATUS_LABELS, r.status), tone: r => viewingTone(r.status) },
      { key: 'costSheetIssued', label: 'Cost sheet', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.VIEWING_STATUS_LABELS) },
    ],
    presets: [
      { key: 'today', label: 'Today', apply: { today: true } },
      { key: 'revisits', label: 'Revisits', apply: { revisitsOnly: true } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.crm.getSiteVisits(toListQuery(q), q.scopeId ?? undefined, (q.filters['status'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
