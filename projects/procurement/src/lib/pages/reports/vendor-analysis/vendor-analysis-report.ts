import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, TableColumn } from '@nexcore/shared';
import { ProcurementReportsService } from '../../../services/reports.service';
import { VendorAnalysisDto } from '../../../models/reports.model';
import { BarChartComponent, ChartPoint } from '../../../components/charts/bar-chart.component';

@Component({
  selector: 'lib-vendor-analysis-report',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, BarChartComponent],
  templateUrl: './vendor-analysis-report.html',
  styleUrl: './vendor-analysis-report.css',
})
export class VendorAnalysisReportPage implements OnInit {
  loading = false;
  error = '';
  data: VendorAnalysisDto | null = null;
  spendPoints: ChartPoint[] = [];

  readonly columns: TableColumn[] = [
    { key: 'vendorNumber', label: 'Vendor #', width: '120px' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    { key: 'totalPurchaseValue', label: 'Purchase Value', type: 'currency', align: 'right' },
    { key: 'invoicedValue', label: 'Invoiced', type: 'currency', align: 'right' },
    { key: 'paidValue', label: 'Paid', type: 'currency', align: 'right' },
    { key: 'outstanding', label: 'Outstanding', type: 'currency', align: 'right' },
    { key: 'overallRating', label: 'Rating', align: 'center', format: (v) => v != null ? `${(+v).toFixed(1)} ★` : '—' },
    { key: 'onTimeDeliveryRate', label: 'On-Time %', align: 'center', format: (v) => v != null ? `${(+v).toFixed(0)}%` : '—' },
    { key: 'isPreferred', label: 'Preferred', align: 'center', type: 'badge',
      badgeClass: (v) => v ? 'badge-active' : 'badge-draft', format: (v) => v ? 'Preferred' : '—' },
  ];

  constructor(private service: ProcurementReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  get currency(): string { return this.data?.currencyCode ?? 'PKR'; }

  load(): void {
    this.loading = true; this.error = '';
    this.service.vendorAnalysis().subscribe({
      next: (r) => {
        this.data = r.data ?? null;
        this.spendPoints = (this.data?.vendors ?? [])
          .slice(0, 10)
          .map(v => ({ label: v.vendorName, value: v.totalPurchaseValue, count: v.orderCount }));
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load vendor analysis'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
