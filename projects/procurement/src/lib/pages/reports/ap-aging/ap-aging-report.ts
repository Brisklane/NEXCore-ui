import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, TableColumn } from '@nexcore/shared';
import { ProcurementReportsService } from '../../../services/reports.service';
import { ApAgingDto } from '../../../models/reports.model';
import { DonutChartComponent } from '../../../components/charts/donut-chart.component';
import { ChartPoint } from '../../../components/charts/bar-chart.component';

@Component({
  selector: 'lib-ap-aging-report',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, DonutChartComponent],
  templateUrl: './ap-aging-report.html',
  styleUrl: './ap-aging-report.css',
})
export class ApAgingReportPage implements OnInit {
  loading = false;
  error = '';
  data: ApAgingDto | null = null;
  bucketPoints: ChartPoint[] = [];

  readonly columns: TableColumn[] = [
    { key: 'vendorName', label: 'Vendor' },
    { key: 'current', label: 'Current', type: 'currency', align: 'right' },
    { key: 'days1To30', label: '1–30 days', type: 'currency', align: 'right' },
    { key: 'days31To60', label: '31–60 days', type: 'currency', align: 'right' },
    { key: 'days61To90', label: '61–90 days', type: 'currency', align: 'right' },
    { key: 'days90Plus', label: '90+ days', type: 'currency', align: 'right' },
    { key: 'total', label: 'Total Due', type: 'currency', align: 'right' },
  ];

  constructor(private service: ProcurementReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  get currency(): string { return this.data?.currencyCode ?? 'PKR'; }

  load(): void {
    this.loading = true; this.error = '';
    this.service.apAging().subscribe({
      next: (r) => {
        this.data = r.data ?? null;
        const d = this.data;
        this.bucketPoints = d ? [
          { label: 'Current', value: d.current },
          { label: '1–30 days', value: d.days1To30 },
          { label: '31–60 days', value: d.days31To60 },
          { label: '61–90 days', value: d.days61To90 },
          { label: '90+ days', value: d.days90Plus },
        ] : [];
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load AP aging'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
