import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollRunService } from '../../services/payroll-run.service';
import { PayrollRunDto, CreatePayrollRunDto, UpdatePayrollRunDto } from '../../models/payroll-run.model';

@Component({
  selector: 'lib-payroll-run',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-run.html',
  styleUrl: './payroll-run.css',
})
export class PayrollRunComponent implements OnInit {
  runs: PayrollRunDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingRun: PayrollRunDto | null = null;

  formName = '';
  formPeriodStart = '';
  formPeriodEnd = '';
  formCurrency = 'USD';
  formStatus = 'draft';

  constructor(private service: PayrollRunService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadRuns(); }

  loadRuns() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.runs = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load payroll runs'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingRun = null; this.resetForm(); this.showForm = true; }

  openEditForm(r: PayrollRunDto) {
    this.editingRun = r;
    this.formName = r.name;
    this.formPeriodStart = r.periodStart;
    this.formPeriodEnd = r.periodEnd;
    this.formCurrency = r.currency;
    this.formStatus = r.status;
    this.showForm = true;
  }

  resetForm() {
    this.formName = '';
    this.formPeriodStart = '';
    this.formPeriodEnd = '';
    this.formCurrency = 'USD';
    this.formStatus = 'draft';
  }

  cancelForm() { this.showForm = false; this.editingRun = null; this.resetForm(); }

  saveRun() {
    if (this.editingRun) {
      const dto: UpdatePayrollRunDto = { name: this.formName, status: this.formStatus };
      this.service.update(this.editingRun.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadRuns(); },
        error: () => { this.error = 'Failed to update payroll run'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePayrollRunDto = {
        name: this.formName,
        periodStart: this.formPeriodStart,
        periodEnd: this.formPeriodEnd,
        currency: this.formCurrency || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadRuns(); },
        error: () => { this.error = 'Failed to create payroll run'; this.cdr.detectChanges(); },
      });
    }
  }

  processRun(r: PayrollRunDto) {
    if (confirm(`Process payroll run "${r.name}"?`)) {
      this.service.process(r.id).subscribe({
        next: () => this.loadRuns(),
        error: () => { this.error = 'Failed to process payroll run'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteRun(r: PayrollRunDto) {
    if (confirm(`Delete payroll run "${r.name}"?`)) {
      this.service.delete(r.id).subscribe({
        next: () => this.loadRuns(),
        error: () => { this.error = 'Failed to delete payroll run'; this.cdr.detectChanges(); },
      });
    }
  }
}
