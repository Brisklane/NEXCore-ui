import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartPoint {
  label: string;
  value: number;
  count?: number;
}

/**
 * Lightweight, dependency-free horizontal bar chart.
 * Bars are scaled to the max value; hover reveals the exact value.
 */
@Component({
  selector: 'lib-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bc">
      @for (p of data; track p.label; let i = $index) {
        <div class="bc-row" [title]="p.label + ': ' + format(p.value)">
          <span class="bc-label">{{ p.label }}</span>
          <div class="bc-track">
            <div class="bc-fill" [style.width.%]="pct(p.value)" [style.background]="color(i)"></div>
          </div>
          <span class="bc-value">{{ format(p.value) }}</span>
        </div>
      } @empty {
        <div class="bc-empty">No data for this period.</div>
      }
    </div>
  `,
  styles: [`
    .bc { display: flex; flex-direction: column; gap: 8px; }
    .bc-row { display: grid; grid-template-columns: 130px 1fr 110px; align-items: center; gap: 10px; }
    .bc-label { font-size: 12.5px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bc-track { background: #f1f5f9; border-radius: 6px; height: 18px; overflow: hidden; }
    .bc-fill { height: 100%; border-radius: 6px; min-width: 2px; transition: width .5s ease; }
    .bc-value { font-size: 12.5px; font-weight: 600; color: #1e293b; text-align: right; }
    .bc-empty { color: #94a3b8; font-size: 13px; padding: 16px; text-align: center; }
  `],
})
export class BarChartComponent {
  @Input() data: ChartPoint[] = [];
  @Input() currency = '';
  @Input() asCurrency = true;

  private readonly palette = ['#2b7fff', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  get max(): number { return Math.max(1, ...this.data.map(d => d.value)); }
  pct(v: number): number { return Math.max(0, (v / this.max) * 100); }
  color(i: number): string { return this.palette[i % this.palette.length]; }
  format(v: number): string {
    const n = (v ?? 0).toLocaleString(undefined, { minimumFractionDigits: this.asCurrency ? 2 : 0, maximumFractionDigits: this.asCurrency ? 2 : 0 });
    return this.asCurrency && this.currency ? `${n} ${this.currency}` : n;
  }
}
