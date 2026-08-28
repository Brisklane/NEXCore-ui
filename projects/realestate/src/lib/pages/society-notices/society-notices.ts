import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function severityTone(s: E.AlertSeverity): 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.AlertSeverity.Critical: return 'danger';
    case E.AlertSeverity.Warning: return 'warning';
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

/** Notices — What has been put on the board. */
@Component({
  standalone: true,
  selector: 'lib-re-society-notices',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class SocietyNoticesComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);

  readonly config: ListConfig<any> = {
    title: 'Notices',
    subtitle: 'What has been put on the board.',
    icon: 'campaign',
    searchPlaceholder: 'Title or body',
    createLabel: 'Post a notice',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No notices',
    emptyMessage: 'Post one so residents hear it from you rather than from rumour.',
    columns: [
      { key: 'title', label: 'Notice', kind: 'strong', sub: r => r.noticeType ?? null },
      { key: 'severity', label: 'Severity', kind: 'pill', value: r => lbl(E.ALERT_SEVERITY_LABELS, r.severity), tone: r => severityTone(r.severity) },
      { key: 'publishedAt', label: 'Published', kind: 'datetime' },
      { key: 'expiresOn', label: 'Expires', kind: 'date', hideBelow: 'md' },
      { key: 'readCount', label: 'Read', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'isPinned', label: 'Pinned', kind: 'bool', align: 'center' },
      { key: 'sendAsBroadcast', label: 'Broadcast', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
  };

  /** Which society this screen is showing. Read from the route the sidebar linked to. */
  protected societyId = '';

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  fetch = (q: ListQueryState) =>
    this.societies.getNotices(this.societyId, toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
