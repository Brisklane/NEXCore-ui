import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeductionService } from '../../services/deduction.service';
import { DeductionDto, CreateDeductionDto, UpdateDeductionDto } from '../../models/deduction.model';

@Component({
  selector: 'lib-deduction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deduction.html',
  styleUrl: './deduction.css',
})
export class DeductionComponent implements OnInit {
  deductions: DeductionDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingDeduction: DeductionDto | null = null;

  formName = '';
  formCode = '';
  formDeductionType = 'tax';
  formAmount: number | null = null;
  formPercentage: number | null = null;
  formIsActive = true;

  constructor(private service: DeductionService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadDeductions(); }

  loadDeductions() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.deductions = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load deductions'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingDeduction = null; this.resetForm(); this.showForm = true; }

  openEditForm(d: DeductionDto) {
    this.editingDeduction = d;
    this.formName = d.name;
    this.formCode = d.code;
    this.formDeductionType = d.deductionType;
    this.formAmount = d.amount ?? null;
    this.formPercentage = d.percentage ?? null;
    this.formIsActive = d.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formName = '';
    this.formCode = '';
    this.formDeductionType = 'tax';
    this.formAmount = null;
    this.formPercentage = null;
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingDeduction = null; this.resetForm(); }

  saveDeduction() {
    if (this.editingDeduction) {
      const dto: UpdateDeductionDto = {
        name: this.formName,
        code: this.formCode,
        deductionType: this.formDeductionType,
        amount: this.formAmount ?? undefined,
        percentage: this.formPercentage ?? undefined,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingDeduction.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadDeductions(); },
        error: () => { this.error = 'Failed to update deduction'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateDeductionDto = {
        name: this.formName,
        code: this.formCode,
        deductionType: this.formDeductionType,
        amount: this.formAmount ?? undefined,
        percentage: this.formPercentage ?? undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadDeductions(); },
        error: () => { this.error = 'Failed to create deduction'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteDeduction(d: DeductionDto) {
    if (confirm(`Delete deduction "${d.name}"?`)) {
      this.service.delete(d.id).subscribe({
        next: () => this.loadDeductions(),
        error: () => { this.error = 'Failed to delete deduction'; this.cdr.detectChanges(); },
      });
    }
  }
}
