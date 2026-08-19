import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DistributionContextService } from '../../services/distribution-context.service';
import { TerritoryDto } from '../../models/distribution.models';

/**
 * The territory every Distribution screen works in, plus an optional period.
 *
 * A company with one territory sees a plain label rather than a select with one option — asking
 * someone to pick from a list of one is a small insult repeated on every page. It only becomes a
 * control when there is genuinely a choice to make.
 *
 * The period defaults to the current month because that is the unit distributors think in:
 * targets, schemes, claims and settlements are all monthly.
 */
@Component({
  standalone: true,
  selector: 'dst-scope-bar',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sb">
      @if (territories().length > 1) {
        <div class="sb-group">
          <label [attr.for]="id + '-terr'">Territory</label>
          <select [id]="id + '-terr'" [ngModel]="territoryId()" (ngModelChange)="chooseTerritory($event)">
            <option value="">All territories</option>
            @for (t of territories(); track t.id) {
              <option [value]="t.id">{{ ctx.indent(t.id) }}{{ t.name }}</option>
            }
          </select>
        </div>
      } @else if (territories().length === 1) {
        <div class="sb-single">
          <span class="material-symbols-outlined">travel_explore</span>
          <span class="sb-single-name">{{ territories()[0].name }}</span>
        </div>
      }

      @if (showPeriod) {
        <div class="sb-group">
          <label [attr.for]="id + '-from'">From</label>
          <input [id]="id + '-from'" type="date" [ngModel]="from" (ngModelChange)="changeFrom($event)" />
        </div>
        <div class="sb-group">
          <label [attr.for]="id + '-to'">To</label>
          <input [id]="id + '-to'" type="date" [ngModel]="to" (ngModelChange)="changeTo($event)" />
        </div>

        <div class="sb-presets" role="group" aria-label="Quick periods">
          @for (p of presets; track p.key) {
            <button
              type="button"
              [class.is-active]="activePreset === p.key"
              (click)="applyPreset(p.key)"
            >{{ p.label }}</button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .sb { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .sb-group { display: flex; align-items: center; gap: 8px; }
    .sb-group label {
      font-size: 11.5px; font-weight: 650; color: var(--text-secondary, #64748b);
      text-transform: uppercase; letter-spacing: .04em;
    }
    .sb-group select, .sb-group input {
      min-height: 40px; padding: 8px 12px; border-radius: 10px;
      border: 1px solid var(--border-strong, #cbd5e1);
      background: var(--input-bg, #fff); color: var(--input-text, #1e293b);
      font-size: 13.5px; font-weight: 600; font-family: inherit;
    }
    .sb-group select { max-width: 230px; }
    .sb-group select:focus-visible, .sb-group input:focus-visible {
      outline: none; box-shadow: var(--focus-ring); border-color: var(--accent, #2b7fff);
    }
    .sb-single {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 14px; border-radius: 10px;
      background: var(--bg-muted, #f1f5f9);
      border: 1px solid var(--border-default, #e6eaf0);
    }
    .sb-single .material-symbols-outlined { font-size: 18px; color: var(--text-secondary, #64748b); }
    .sb-single-name { font-size: 13.5px; font-weight: 700; color: var(--text-heading, #0f172a); }
    .sb-presets {
      display: inline-flex; padding: 3px; gap: 2px; border-radius: 10px;
      background: var(--bg-muted, #f1f5f9); border: 1px solid var(--border-default, #e6eaf0);
    }
    .sb-presets button {
      min-height: 32px; padding: 5px 11px; border: none; border-radius: 7px;
      background: transparent; color: var(--text-secondary, #64748b);
      font-size: 12px; font-weight: 650; font-family: inherit; cursor: pointer;
    }
    .sb-presets button.is-active {
      background: var(--bg-surface, #fff); color: var(--accent, #2b7fff);
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(15,23,42,.08));
    }
    .sb-presets button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
  `],
})
export class ScopeBarComponent implements OnInit {
  readonly ctx = inject(DistributionContextService);

  @Input() id = 'dst-scope';

  /** Show the from/to period controls. Off for screens that are inherently "now". */
  @Input() showPeriod = false;

  /** Emitted once on resolve and on every change, so pages have one place to reload from. */
  @Output() scopeChange = new EventEmitter<{ territoryId: string | null; from: string; to: string }>();

  readonly territories = signal<TerritoryDto[]>([]);
  readonly territoryId = this.ctx.territoryId;

  from = '';
  to = '';
  activePreset = 'mtd';

  readonly presets = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: '7d' },
    { key: 'mtd', label: 'MTD' },
    { key: 'lastmonth', label: 'Last month' },
    { key: 'quarter', label: 'QTD' },
  ];

  async ngOnInit(): Promise<void> {
    this.applyPreset('mtd', false);
    this.territories.set(await this.ctx.ensureLoaded());
    this.emit();
  }

  chooseTerritory(id: string): void {
    this.ctx.setTerritory(id || null);
    this.emit();
  }

  changeFrom(value: string): void { this.from = value; this.activePreset = ''; this.emit(); }
  changeTo(value: string): void { this.to = value; this.activePreset = ''; this.emit(); }

  applyPreset(key: string, emit = true): void {
    const now = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    switch (key) {
      case 'today':
        this.from = this.to = iso(now);
        break;
      case 'week': {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        this.from = iso(start);
        this.to = iso(now);
        break;
      }
      case 'lastmonth': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        this.from = iso(start);
        this.to = iso(end);
        break;
      }
      case 'quarter': {
        const q = Math.floor(now.getMonth() / 3) * 3;
        this.from = iso(new Date(now.getFullYear(), q, 1));
        this.to = iso(now);
        break;
      }
      default:
        this.from = iso(new Date(now.getFullYear(), now.getMonth(), 1));
        this.to = iso(now);
        key = 'mtd';
    }

    this.activePreset = key;
    if (emit) this.emit();
  }

  private emit(): void {
    this.scopeChange.emit({ territoryId: this.territoryId(), from: this.from, to: this.to });
  }
}
