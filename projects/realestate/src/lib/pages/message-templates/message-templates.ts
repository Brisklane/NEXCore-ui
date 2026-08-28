import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, type Observable } from 'rxjs';
import { CommunicationService } from '../../services/realestate.services';
import type * as M from '../../models/realestate.models';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
} from '../shared/list-page';

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

/** Message templates — What automated messages say. */
@Component({
  standalone: true,
  selector: 'lib-re-message-templates',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class MessageTemplatesComponent implements OnInit {
  private communication = inject(CommunicationService);

  readonly config: ListConfig<any> = {
    title: 'Message templates',
    subtitle: 'What automated messages say.',
    icon: 'chat',
    createLabel: 'New template',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No message templates',
    emptyMessage: 'Write one so automated messages read consistently.',
    columns: [
      { key: 'name', label: 'Template', kind: 'strong', sub: r => r.category ?? null },
      { key: 'channel', label: 'Channel', kind: 'pill', value: r => lbl(E.NOTIFICATION_CHANNEL_LABELS, r.channel) },
      { key: 'languageCode', label: 'Language', kind: 'pill', hideBelow: 'md' },
      { key: 'version', label: 'Version', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'sentCount', label: 'Sent', kind: 'number', align: 'right' },
      { key: 'isProviderApproved', label: 'Approved', kind: 'bool', tone: r => r.isProviderApproved ? 'positive' : 'warning', align: 'center' },
      { key: 'isActive', label: 'Active', kind: 'bool', align: 'center' },
    ],
    filters: [
      { key: 'channel', label: 'Channel', kind: 'select', options: enumOptions(E.NOTIFICATION_CHANNEL_LABELS) },
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
    this.wrap(this.communication.getTemplates((q.filters['channel'] as any), (q.filters['category'] as any)));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
