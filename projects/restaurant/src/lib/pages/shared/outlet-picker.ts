import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantContextService } from '../../services/restaurant.services';
import { OutletDto } from '../../models/restaurant.models';

/**
 * The outlet every Restaurant screen works in.
 *
 * A single-venue company sees a plain label rather than a select with one option — asking someone
 * to pick from a list of one is a small insult repeated on every page. It only becomes a control
 * when there is genuinely a choice to make.
 */
@Component({
  standalone: true,
  selector: 'rst-outlet-picker',
  imports: [CommonModule, FormsModule],
  template: `
    @if (outlets().length > 1) {
      <div class="rst-context">
        <label [attr.for]="id">Outlet</label>
        <select [id]="id" [ngModel]="selected()" (ngModelChange)="choose($event)">
          @for (o of outlets(); track o.id) {
            <option [value]="o.id">{{ o.name }}</option>
          }
        </select>
      </div>
    } @else if (outlets().length === 1) {
      <div class="rst-context rst-single">
        <span class="material-symbols-outlined">storefront</span>
        <span class="rst-single-name">{{ outlets()[0].name }}</span>
      </div>
    }
  `,
  styles: [`
    .rst-context { display: flex; align-items: center; gap: 10px; }
    .rst-context label {
      font-size: 12px; font-weight: 600; color: var(--text-secondary, #64748b);
      text-transform: uppercase; letter-spacing: .04em;
    }
    .rst-context select {
      min-height: 40px; padding: 8px 14px; border-radius: 10px;
      border: 1px solid var(--border-strong, #cbd5e1);
      background: var(--input-bg, #fff); color: var(--input-text, #1e293b);
      font-size: 13.5px; font-weight: 600;
    }
    .rst-context select:focus-visible {
      outline: none; box-shadow: var(--focus-ring); border-color: var(--accent, #2b7fff);
    }
    .rst-single {
      padding: 8px 14px; border-radius: 10px;
      background: var(--bg-muted, #f1f5f9);
      border: 1px solid var(--border-default, #e6eaf0);
    }
    .rst-single .material-symbols-outlined { font-size: 18px; color: var(--text-secondary, #64748b); }
    .rst-single-name { font-size: 13.5px; font-weight: 700; color: var(--text-heading, #0f172a); }
  `],
})
export class OutletPickerComponent implements OnInit {
  private ctx = inject(RestaurantContextService);

  /** Emitted on first resolve and on every change, so pages have one place to reload from. */
  @Output() outletChange = new EventEmitter<string | null>();

  @Input() id = 'rst-outlet';

  readonly outlets = signal<OutletDto[]>([]);
  readonly selected = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const list = await this.ctx.ensureLoaded();
    this.outlets.set(list);
    this.selected.set(this.ctx.outletId());
    this.outletChange.emit(this.selected());
  }

  choose(id: string): void {
    this.ctx.setOutlet(id);
    this.selected.set(id);
    this.outletChange.emit(id);
  }
}
