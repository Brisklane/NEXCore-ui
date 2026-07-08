import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaryStructureService } from '../../services/salary-structure.service';
import { SalaryStructureDto, CreateSalaryStructureDto, UpdateSalaryStructureDto } from '../../models/salary-structure.model';

@Component({
  selector: 'lib-salary-structure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary-structure.html',
  styleUrl: './salary-structure.css',
})
export class SalaryStructureComponent implements OnInit {
  structures: SalaryStructureDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingStructure: SalaryStructureDto | null = null;

  formEmployeeId = '';
  formBasicSalary = 0;
  formCurrency = 'USD';
  formEffectiveFrom = '';
  formEffectiveTo = '';
  formIsActive = true;

  constructor(private service: SalaryStructureService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadStructures(); }

  loadStructures() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.structures = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load salary structures'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingStructure = null; this.resetForm(); this.showForm = true; }

  openEditForm(s: SalaryStructureDto) {
    this.editingStructure = s;
    this.formEmployeeId = s.employeeId;
    this.formBasicSalary = s.basicSalary;
    this.formCurrency = s.currency;
    this.formEffectiveFrom = s.effectiveFrom;
    this.formEffectiveTo = s.effectiveTo ?? '';
    this.formIsActive = s.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formEmployeeId = '';
    this.formBasicSalary = 0;
    this.formCurrency = 'USD';
    this.formEffectiveFrom = '';
    this.formEffectiveTo = '';
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingStructure = null; this.resetForm(); }

  saveStructure() {
    if (this.editingStructure) {
      const dto: UpdateSalaryStructureDto = {
        basicSalary: this.formBasicSalary,
        currency: this.formCurrency,
        effectiveFrom: this.formEffectiveFrom,
        effectiveTo: this.formEffectiveTo || undefined,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingStructure.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadStructures(); },
        error: () => { this.error = 'Failed to update salary structure'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateSalaryStructureDto = {
        employeeId: this.formEmployeeId,
        basicSalary: this.formBasicSalary,
        currency: this.formCurrency || undefined,
        effectiveFrom: this.formEffectiveFrom,
        effectiveTo: this.formEffectiveTo || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadStructures(); },
        error: () => { this.error = 'Failed to create salary structure'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteStructure(s: SalaryStructureDto) {
    if (confirm('Delete this salary structure?')) {
      this.service.delete(s.id).subscribe({
        next: () => this.loadStructures(),
        error: () => { this.error = 'Failed to delete salary structure'; this.cdr.detectChanges(); },
      });
    }
  }
}
