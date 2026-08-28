import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/* =====================================================================================
 * The three shapes that repeat inside every record screen: a titled card, a list of facts,
 * and a table of rows. Written once so eighteen record screens read the same way.
 * ===================================================================================== */

/** One label-and-value pair. `tone` colours the value; `mono` for references and amounts. */
export interface Fact {
  label: string;
  value: string | number | null | undefined;
  hint?: string | null;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger' | 'muted';
  /** Full width on the grid — addresses, notes, legal descriptions. */
  wide?: boolean;
}

/**
 * A card with a title, an optional note, and whatever is put inside it.
 *
 * The note is where the screen explains what the reader is looking at — a section called
 * "Entitlement" means nothing on its own, and a person guessing at a number is a person about
 * to make a mistake with somebody else's money.
 */
@Component({
  standalone: true,
  selector: 're-section',
  imports: [CommonModule],
  template: `
    <section class="re-card">
      @if (title) {
        <div class="re-card-head">
          <h3 class="re-card-title">
            @if (icon) { <span class="material-symbols-outlined">{{ icon }}</span> }
            {{ title }}
          </h3>
          <ng-content select="[section-actions]" />
        </div>
      }
      @if (note) { <p class="re-section-note">{{ note }}</p> }
      <div class="re-card-body" [class.is-flush]="flush">
        <ng-content />
      </div>
    </section>
  `,
  styleUrls: ['./detail-bits.css'],
})
export class SectionComponent {
  @Input() title = '';
  @Input() icon: string | null = null;
  @Input() note: string | null = null;
  @Input() flush = false;
}

/** A grid of facts. Empty values render as an em dash rather than a blank, so nothing looks broken. */
@Component({
  standalone: true,
  selector: 're-facts',
  imports: [CommonModule],
  template: `
    <dl class="re-dl" [class.is-tight]="tight">
      @for (f of items; track f.label) {
        <div class="re-dl-row" [class.is-wide]="f.wide">
          <dt>{{ f.label }}</dt>
          <dd [class]="'tone-' + (f.tone ?? 'neutral')">
            {{ (f.value === null || f.value === undefined || f.value === '') ? '—' : f.value }}
            @if (f.hint) { <span class="re-dl-hint">{{ f.hint }}</span> }
          </dd>
        </div>
      }
    </dl>
  `,
  styleUrls: ['./detail-bits.css'],
})
export class FactsComponent {
  @Input() items: Fact[] = [];
  @Input() tight = false;
}

/** One line on a mini table inside a record screen. */
export interface MiniRow {
  id?: string;
  title: string;
  sub?: string | null;
  meta?: string | null;
  value?: string | null;
  valueSub?: string | null;
  tone?: 'neutral' | 'good' | 'warn' | 'alert';
  icon?: string | null;
}

/**
 * The small table that appears inside a record screen — payments against a plan, snags on a
 * unit, documents on a file. Not the list framework: this is read-only, unpaged, and rarely
 * longer than a dozen rows.
 */
@Component({
  standalone: true,
  selector: 're-mini-list',
  imports: [CommonModule],
  template: `
    @if (rows.length) {
      <div class="re-rows">
        @for (r of rows; track r.id ?? r.title) {
          <div class="re-row" [class.is-good]="r.tone === 'good'"
               [class.is-warn]="r.tone === 'warn'" [class.is-alert]="r.tone === 'alert'">
            <div class="re-row-main">
              <span class="re-row-title">
                @if (r.icon) { <span class="material-symbols-outlined">{{ r.icon }}</span> }
                {{ r.title }}
              </span>
              @if (r.sub) { <span class="re-row-sub">{{ r.sub }}</span> }
            </div>
            @if (r.meta) { <span class="re-row-meta">{{ r.meta }}</span> }
            @if (r.value) {
              <span class="re-row-figure">
                <span class="re-row-figure-value">{{ r.value }}</span>
                @if (r.valueSub) { <span class="re-row-figure-label">{{ r.valueSub }}</span> }
              </span>
            }
          </div>
        }
      </div>
    } @else {
      <p class="re-mini-empty">{{ emptyMessage }}</p>
    }
  `,
  styleUrls: ['./detail-bits.css'],
})
export class MiniListComponent {
  @Input() rows: MiniRow[] = [];
  @Input() emptyMessage = 'Nothing here yet.';
}

export const RE_DETAIL_BITS = [SectionComponent, FactsComponent, MiniListComponent] as const;
