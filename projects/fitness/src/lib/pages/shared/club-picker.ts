import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FitnessContextService } from '../../services/fitness-context.service';
import { ClubDto } from '../../models/fitness.models';

/**
 * The club every Fitness screen works in.
 *
 * A single-site company sees a plain label rather than a select with one option — asking someone
 * to pick from a list of one is a small insult repeated on every page. It only becomes a control
 * when there is genuinely a choice to make.
 */
@Component({
  standalone: true,
  selector: 'fit-club-picker',
  imports: [CommonModule, FormsModule],
  template: `
    @if (clubs().length > 1) {
      <div class="fit-context">
        <label [attr.for]="id">Club</label>
        <select [id]="id" [ngModel]="selected()" (ngModelChange)="choose($event)">
          @for (c of clubs(); track c.id) {
            <option [value]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
    } @else if (clubs().length === 1) {
      <div class="fit-context fit-single">
        <span class="material-symbols-outlined">fitness_center</span>
        <span class="fit-single-name">{{ clubs()[0].name }}</span>
      </div>
    }
  `,
  styles: [`
    .fit-context { display: flex; align-items: center; gap: 10px; }
    .fit-context label {
      font-size: 12px; font-weight: 600; color: var(--text-secondary, #64748b);
      text-transform: uppercase; letter-spacing: .04em;
    }
    .fit-context select {
      min-height: 40px; padding: 8px 14px; border-radius: 10px;
      border: 1px solid var(--border-strong, #cbd5e1);
      background: var(--input-bg, #fff); color: var(--input-text, #1e293b);
      font-size: 13.5px; font-weight: 600;
    }
    .fit-context select:focus-visible {
      outline: none; box-shadow: var(--focus-ring); border-color: var(--accent, #2b7fff);
    }
    .fit-single {
      padding: 8px 14px; border-radius: 10px;
      background: var(--bg-muted, #f1f5f9);
      border: 1px solid var(--border-default, #e6eaf0);
    }
    .fit-single .material-symbols-outlined { font-size: 18px; color: var(--text-secondary, #64748b); }
    .fit-single-name { font-size: 13.5px; font-weight: 700; color: var(--text-heading, #0f172a); }
  `],
})
export class ClubPickerComponent implements OnInit {
  private ctx = inject(FitnessContextService);

  /** Emitted on first resolve and on every change, so pages have one place to reload from. */
  @Output() clubChange = new EventEmitter<string | null>();

  @Input() id = 'fit-club';

  readonly clubs = signal<ClubDto[]>([]);
  readonly selected = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const list = await this.ctx.ensureLoaded();
    this.clubs.set(list);
    this.selected.set(this.ctx.clubId());
    this.clubChange.emit(this.selected());
  }

  choose(id: string): void {
    this.ctx.setClub(id);
    this.selected.set(id);
    this.clubChange.emit(id);
  }
}
