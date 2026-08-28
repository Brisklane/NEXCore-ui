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

/** Viewings — Booked, done and missed. */
@Component({
  standalone: true,
  selector: 'lib-re-viewings',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class ViewingsComponent implements OnInit {
  private crm = inject(CrmService);

  readonly config: ListConfig<any> = {
    title: 'Viewings',
    subtitle: 'Booked, done and missed.',
    helpKey: 'viewings',
    icon: 'visibility',
    searchPlaceholder: 'Reference, applicant or property',
    scope: 'office',
    createLabel: 'Book a viewing',
    createIcon: 'event',
    clickable: false,
    emptyTitle: 'No viewings',
    emptyMessage: 'Book one from a listing or an enquiry.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '130px' },
      { key: 'scheduledAt', label: 'When', kind: 'datetime' },
      { key: 'applicantName', label: 'Applicant', sub: r => r.applicantPhone ?? null },
      { key: 'propertySummary', label: 'Property', hideBelow: 'md' },
      { key: 'agentName', label: 'Agent', hideBelow: 'lg' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.VIEWING_STATUS_LABELS, r.status), tone: r => viewingTone(r.status) },
      { key: 'feedbackReceived', label: 'Feedback', kind: 'bool', align: 'center', hideBelow: 'md' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.VIEWING_STATUS_LABELS) },
    ],
    presets: [
      { key: 'today', label: 'Today', apply: { today: true } },
      { key: 'upcoming', label: 'Upcoming', apply: { status: E.ViewingStatus.Confirmed } },
      { key: 'no-feedback', label: 'Awaiting feedback', apply: { awaitingFeedback: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.crm.getViewings(toListQuery(q, { officeId: q.scopeId ?? undefined }), undefined, (q.filters['status'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
