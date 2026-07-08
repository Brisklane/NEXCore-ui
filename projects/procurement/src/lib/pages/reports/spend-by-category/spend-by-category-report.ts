import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, TableColumn } from '@nexcore/shared';
import { ProcurementReportsService } from '../../../services/reports.service';
import { SpendByCategoryDto } from '../../../models/reports.model';
import { BarChartComponent, ChartPoint } from '../../../components/charts/bar-chart.component';
import { DonutChartComponent } from '../../../components/charts/donut-chart.component';

@Component({
  selector: 'lib-spend-by-category-report',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, BarChartComponent, DonutChartComponent],
  templateUrl: './spend-by-category-report.html',
  styleUrl: './spend-by-category-report.css',
})
export class SpendByCategoryReportPage implements OnInit {
  loading = false;
  error = '';
  data: SpendByCategoryDto | null = null;
  points: ChartPoint[] = [];

  readonly columns: TableColumn[] = [
    { key: 'categoryName', label: 'Category' },
    { key: 'lineCount', label: 'Line Items', align: 'center' },
    { key: 'value', label: 'Spend', type: 'currency', align: 'right' },
    { key: 'percent', label: 'Share', align: 'right', format: (v) => `${(+v).toFixed(1)}%` },
  ];

  constructor(private service: ProcurementReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  get currency(): string { return this.data?.currencyCode ?? 'PKR'; }

  load(): void {
    this.loading = true; this.error = '';
    this.service.spendByCategory().subscribe({
      next: (r) => {
        this.data = r.data ?? null;
        this.points = (this.data?.categories ?? []).map(c => ({ label: c.categoryName, value: c.value, count: c.lineCount }));
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load spend by category'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
