import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, TableColumn } from '@nexcore/shared';
import { ProcurementReportsService } from '../../../services/reports.service';
import { ThreeWayMatchDto } from '../../../models/reports.model';
import { DonutChartComponent } from '../../../components/charts/donut-chart.component';
import { ChartPoint } from '../../../components/charts/bar-chart.component';

@Component({
  selector: 'lib-three-way-match-report',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, AppAlertComponent, AppDataTableComponent, DonutChartComponent],
  templateUrl: './three-way-match-report.html',
  styleUrl: './three-way-match-report.css',
})
export class ThreeWayMatchReportPage implements OnInit {
  loading = false;
  error = '';
  data: ThreeWayMatchDto | null = null;
  statusPoints: ChartPoint[] = [];

  readonly columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', width: '150px' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'purchaseOrderNumber', label: 'PO #', format: (v) => v ?? '—' },
    { key: 'orderedAmount', label: 'Ordered', type: 'currency', align: 'right' },
    { key: 'receivedAmount', label: 'Received', type: 'currency', align: 'right' },
    { key: 'invoicedAmount', label: 'Invoiced', type: 'currency', align: 'right' },
    { key: 'matchingStatus', label: 'Match Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.matchBadge(String(v)) },
    { key: 'isException', label: 'Flag', align: 'center', type: 'badge',
      badgeClass: (v) => v ? 'badge-blocked' : 'badge-active', format: (v) => v ? '⚠ Exception' : 'OK' },
  ];

  constructor(private service: ProcurementReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  get currency(): string { return this.data?.currencyCode ?? 'PKR'; }

  matchBadge(s: string): string {
    const t = (s ?? '').toLowerCase();
    if (t.includes('fully') || t.includes('matched') && !t.includes('not') && !t.includes('partial')) return 'badge-active';
    if (t.includes('partial')) return 'badge-pending';
    if (t.includes('not') || t.includes('exception')) return 'badge-blocked';
    return 'badge-draft';
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.threeWayMatch().subscribe({
      next: (r) => {
        this.data = r.data ?? null;
        this.statusPoints = (this.data?.byStatus ?? []).map(b => ({ label: b.label, value: b.count }));
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load 3-way match'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
