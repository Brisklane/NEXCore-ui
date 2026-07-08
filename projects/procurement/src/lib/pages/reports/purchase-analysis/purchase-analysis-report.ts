import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, TableColumn } from '@nexcore/shared';
import { ProcurementReportsService } from '../../../services/reports.service';
import { PurchaseAnalysisDto } from '../../../models/reports.model';
import { BarChartComponent, ChartPoint } from '../../../components/charts/bar-chart.component';
import { DonutChartComponent } from '../../../components/charts/donut-chart.component';

@Component({
  selector: 'lib-purchase-analysis-report',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, BarChartComponent, DonutChartComponent],
  templateUrl: './purchase-analysis-report.html',
  styleUrl: './purchase-analysis-report.css',
})
export class PurchaseAnalysisReportPage implements OnInit {
  loading = false;
  error = '';
  data: PurchaseAnalysisDto | null = null;

  statusPoints: ChartPoint[] = [];
  trendPoints: ChartPoint[] = [];
  vendorPoints: ChartPoint[] = [];

  readonly vendorColumns: TableColumn[] = [
    { key: 'vendorName', label: 'Vendor' },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    { key: 'value', label: 'Purchase Value', type: 'currency', align: 'right' },
  ];

  constructor(private service: ProcurementReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  get currency(): string { return this.data?.currencyCode ?? 'PKR'; }

  load(): void {
    this.loading = true; this.error = '';
    this.service.purchaseAnalysis().subscribe({
      next: (r) => {
        this.data = r.data ?? null;
        const d = this.data;
        this.statusPoints = (d?.byStatus ?? []).map(b => ({ label: b.label, value: b.value, count: b.count }));
        this.trendPoints = (d?.monthlyTrend ?? []).map(b => ({ label: b.label, value: b.value, count: b.count }));
        this.vendorPoints = (d?.topVendors ?? []).map(v => ({ label: v.vendorName, value: v.value, count: v.orderCount }));
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load purchase analysis'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
