import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { CommunicationService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
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

/** Notifications — What this app tells people, and how. */
@Component({
  standalone: true,
  selector: 'lib-re-notification-rules',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class NotificationRulesComponent implements OnInit {
  private communication = inject(CommunicationService);

  readonly config: ListConfig<any> = {
    title: 'Notifications',
    subtitle: 'What this app tells people, and how.',
    icon: 'notifications',
    createLabel: 'New rule',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No notification rules',
    emptyMessage: 'Without them, nothing tells anybody anything.',
    columns: [
      { key: 'name', label: 'Rule', kind: 'strong', sub: r => r.ruleKey ?? null },
      { key: 'severity', label: 'Severity', kind: 'pill', value: r => lbl(E.ALERT_SEVERITY_LABELS, r.severity), tone: r => severityTone(r.severity) },
      { key: 'channels', label: 'Channels', value: r => (r.channels ?? []).map((c: number) => lbl(E.NOTIFICATION_CHANNEL_LABELS, c as E.NotificationChannel)).join(', '), hideBelow: 'md' },
      { key: 'leadDays', label: 'Lead days', kind: 'days', align: 'right', hideBelow: 'md' },
      { key: 'firedLast30Days', label: 'Fired (30d)', kind: 'number', align: 'right' },
      { key: 'respectQuietHours', label: 'Quiet hours', kind: 'bool', align: 'center', hideBelow: 'lg' },
      { key: 'isEnabled', label: 'On', kind: 'bool', align: 'center' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  /** Wraps a non-paged endpoint in the page envelope the list expects. */
  private wrap<T>(source: Observable<M.ApiResponse<T[]>>): Observable<M.PaginatedResponse<T>> {
    return source.pipe(map(r => ({
      success: r.success,
      data: r.data ?? [],
      pagination: {
        currentPage: 1,
        pageSize: (r.data ?? []).length || 1,
        totalCount: (r.data ?? []).length,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      },
    })));
  }

  fetch = (q: ListQueryState) =>
    this.wrap(this.communication.getRules());

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
