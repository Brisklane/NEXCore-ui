import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';

/**
 * The project every development screen works in.
 *
 * A company with one scheme sees a plain label rather than a select with one option — asking
 * somebody to choose from a list of one is a small insult repeated on every page. It only becomes
 * a control when there is genuinely a choice to make.
 *
 * A company with none at all sees a prompt to create one, because a sales executive who lands on
 * an empty inventory board with no explanation will assume the software is broken.
 */
@Component({
  standalone: true,
  selector: 're-project-picker',
  imports: [CommonModule, FormsModule],
  template: `
    @if (projects().length > 1) {
      <div class="re-context">
        <label [attr.for]="id">Project</label>
        <select [id]="id" [ngModel]="selected()" (ngModelChange)="choose($event)">
          @if (allowAll) { <option [ngValue]="null">All projects</option> }
          @for (p of projects(); track p.id) {
            <option [ngValue]="p.id">{{ p.label }}</option>
          }
        </select>
      </div>
    } @else if (projects().length === 1) {
      <div class="re-context re-single">
        <span class="material-symbols-outlined">apartment</span>
        <span class="re-single-name">{{ projects()[0].label }}</span>
      </div>
    } @else if (resolved()) {
      <div class="re-context re-empty">
        <span class="material-symbols-outlined">info</span>
        <span>No projects yet</span>
      </div>
    }
  `,
  styles: [`
    .re-context { display: flex; align-items: center; gap: 10px; }
    .re-context label {
      font-size: 12px; font-weight: 600; color: var(--text-secondary, #64748b);
      text-transform: uppercase; letter-spacing: .04em;
    }
    .re-context select {
      min-height: 40px; padding: 8px 14px; border-radius: 10px;
      border: 1px solid var(--border-strong, #cbd5e1);
      background: var(--input-bg, #fff); color: var(--input-text, #1e293b);
      font-size: 13.5px; font-weight: 600; max-width: 280px;
    }
    .re-context select:focus-visible {
      outline: none; box-shadow: var(--focus-ring); border-color: var(--accent, #2b7fff);
    }
    .re-single, .re-empty {
      padding: 8px 14px; border-radius: 10px;
      background: var(--bg-muted, #f1f5f9);
      border: 1px solid var(--border-default, #e6eaf0);
    }
    .re-single .material-symbols-outlined,
    .re-empty .material-symbols-outlined { font-size: 18px; color: var(--text-secondary, #64748b); }
    .re-single-name { font-size: 13.5px; font-weight: 700; color: var(--text-heading, #0f172a); }
    .re-empty span:last-child { font-size: 13px; color: var(--text-secondary, #64748b); }
  `],
})
export class ProjectPickerComponent implements OnInit {
  private ctx = inject(RealEstateContextService);

  /** Emitted on first resolve and on every change, so a page has one place to reload from. */
  @Output() projectChange = new EventEmitter<string | null>();

  @Input() id = 're-project';

  /** Adds an "All projects" option, for screens that can genuinely show every scheme at once. */
  @Input() allowAll = false;

  readonly projects = signal<M.LookupDto[]>([]);
  readonly selected = signal<string | null>(null);
  readonly resolved = signal(false);

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    this.projects.set(this.ctx.projectList());
    this.selected.set(this.ctx.projectId());
    this.resolved.set(true);
    this.projectChange.emit(this.selected());
  }

  choose(id: string | null): void {
    this.ctx.setProject(id);
    this.selected.set(id);
    this.projectChange.emit(id);
  }
}

/**
 * The office a brokerage or estate-management screen works in. Same reasoning as the project
 * picker: it is only a control when there is more than one office to choose between.
 */
@Component({
  standalone: true,
  selector: 're-office-picker',
  imports: [CommonModule, FormsModule],
  template: `
    @if (offices().length > 1) {
      <div class="re-context">
        <label [attr.for]="id">Office</label>
        <select [id]="id" [ngModel]="selected()" (ngModelChange)="choose($event)">
          @if (allowAll) { <option [ngValue]="null">All offices</option> }
          @for (o of offices(); track o.id) {
            <option [ngValue]="o.id">{{ o.name }}</option>
          }
        </select>
      </div>
    }
  `,
  styles: [`
    .re-context { display: flex; align-items: center; gap: 10px; }
    .re-context label {
      font-size: 12px; font-weight: 600; color: var(--text-secondary, #64748b);
      text-transform: uppercase; letter-spacing: .04em;
    }
    .re-context select {
      min-height: 40px; padding: 8px 14px; border-radius: 10px;
      border: 1px solid var(--border-strong, #cbd5e1);
      background: var(--input-bg, #fff); color: var(--input-text, #1e293b);
      font-size: 13.5px; font-weight: 600; max-width: 240px;
    }
    .re-context select:focus-visible {
      outline: none; box-shadow: var(--focus-ring); border-color: var(--accent, #2b7fff);
    }
  `],
})
export class OfficePickerComponent implements OnInit {
  private ctx = inject(RealEstateContextService);

  @Output() officeChange = new EventEmitter<string | null>();
  @Input() id = 're-office';
  @Input() allowAll = true;

  readonly offices = signal<M.RealEstateOfficeDto[]>([]);
  readonly selected = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    this.offices.set(this.ctx.officeList());
    this.selected.set(this.allowAll ? null : this.ctx.officeId());
    this.officeChange.emit(this.selected());
  }

  choose(id: string | null): void {
    if (id) this.ctx.setOffice(id);
    this.selected.set(id);
    this.officeChange.emit(id);
  }
}
