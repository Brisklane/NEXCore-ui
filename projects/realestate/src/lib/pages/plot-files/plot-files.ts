import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Plot files — Files issued against a scheme. */
@Component({
  standalone: true,
  selector: 'lib-re-plot-files',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class PlotFilesComponent implements OnInit {
  private projects = inject(ProjectService);

  readonly config: ListConfig<any> = {
    title: 'Plot files',
    subtitle: 'Files issued against a scheme.',
    icon: 'folder_special',
    searchPlaceholder: 'File number, owner or plot',
    scope: 'project',
    createLabel: 'Issue files',
    createIcon: 'note_add',
    clickable: false,
    emptyTitle: 'No files issued',
    emptyMessage: 'Issue a run of files to start selling this scheme before the plots are balloted.',
    columns: [
      { key: 'fileNumber', label: 'File', kind: 'strong', width: '170px' },
      { key: 'categoryCode', label: 'Category', kind: 'pill', hideBelow: 'md' },
      { key: 'ownerName', label: 'Owner', sub: r => r.ownerPhone ?? null },
      { key: 'area', label: 'Area', kind: 'area', value: r => r.area?.value, align: 'right' },
      { key: 'price', label: 'Price', kind: 'money', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill' },
      { key: 'plotNumber', label: 'Plot', sub: r => r.blockName ?? null, hideBelow: 'md' },
      { key: 'transferCount', label: 'Transfers', kind: 'number', align: 'right', hideBelow: 'lg' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.projects.getPlotFiles(q.scopeId!, toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
