import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartPoint } from './bar-chart.component';

/**
 * Dependency-free donut chart (CSS conic-gradient) with a legend.
 * Segments are proportional to each point's value.
 */
@Component({
  selector: 'lib-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dn">
      @if (total > 0) {
        <div class="dn-ring" [style.background]="gradient">
          <div class="dn-hole">
            <span class="dn-total">{{ format(total) }}</span>
            <span class="dn-cap">{{ caption }}</span>
          </div>
        </div>
        <div class="dn-legend">
          @for (p of data; track p.label; let i = $index) {
            @if (p.value > 0) {
              <div class="dn-item">
                <span class="dn-dot" [style.background]="color(i)"></span>
                <span class="dn-name">{{ p.label }}</span>
                <span class="dn-val">{{ format(p.value) }} · {{ share(p.value) }}%</span>
              </div>
            }
          }
        </div>
      } @else {
        <div class="dn-empty">No data to chart.</div>
      }
    </div>
  `,
  styles: [`
    .dn { display: flex; gap: 28px; align-items: center; flex-wrap: wrap; }
    .dn-ring { width: 180px; height: 180px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .dn-hole { width: 116px; height: 116px; background: #fff; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px #f1f5f9; }
    .dn-total { font-size: 18px; font-weight: 700; color: #1e293b; }
    .dn-cap { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
    .dn-legend { display: flex; flex-direction: column; gap: 8px; min-width: 220px; }
    .dn-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .dn-dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
    .dn-name { color: #475569; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dn-val { color: #1e293b; font-weight: 600; white-space: nowrap; }
    .dn-empty { color: #94a3b8; font-size: 13px; padding: 16px; }
  `],
})
export class DonutChartComponent {
  @Input() data: ChartPoint[] = [];
  @Input() currency = '';
  @Input() asCurrency = true;
  @Input() caption = 'Total';

  private readonly palette = ['#2b7fff', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

  get total(): number { return this.data.reduce((s, d) => s + (d.value ?? 0), 0); }
  color(i: number): string { return this.palette[i % this.palette.length]; }
  share(v: number): string { return this.total > 0 ? ((v / this.total) * 100).toFixed(1) : '0'; }

  get gradient(): string {
    if (this.total <= 0) return '#f1f5f9';
    let acc = 0;
    const stops: string[] = [];
    this.data.forEach((p, i) => {
      if (p.value <= 0) return;
      const from = (acc / this.total) * 100;
      acc += p.value;
      const to = (acc / this.total) * 100;
      stops.push(`${this.color(i)} ${from}% ${to}%`);
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  format(v: number): string {
    const n = (v ?? 0).toLocaleString(undefined, { minimumFractionDigits: this.asCurrency ? 0 : 0, maximumFractionDigits: this.asCurrency ? 0 : 0 });
    return this.asCurrency && this.currency ? `${n} ${this.currency}` : n;
  }
}
