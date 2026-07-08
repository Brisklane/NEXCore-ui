import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeContractService } from '../../services/employee-contract.service';
import { EmployeeContractDto, CreateEmployeeContractDto, UpdateEmployeeContractDto } from '../../models/employee-contract.model';

@Component({
  selector: 'lib-employee-contract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-contract.html',
  styleUrl: './employee-contract.css',
})
export class EmployeeContractComponent implements OnInit {
  contracts: EmployeeContractDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingContract: EmployeeContractDto | null = null;

  formEmployeeId = '';
  formStartDate = '';
  formEndDate = '';
  formContractType = 'permanent';
  formSalary = 0;
  formCurrency = 'USD';
  formNotes = '';
  formIsActive = true;

  constructor(private service: EmployeeContractService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadContracts(); }

  loadContracts() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.contracts = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load contracts'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingContract = null; this.resetForm(); this.showForm = true; }

  openEditForm(c: EmployeeContractDto) {
    this.editingContract = c;
    this.formEmployeeId = c.employeeId;
    this.formStartDate = c.startDate;
    this.formEndDate = c.endDate ?? '';
    this.formContractType = c.contractType;
    this.formSalary = c.salary;
    this.formCurrency = c.currency;
    this.formNotes = c.notes ?? '';
    this.formIsActive = c.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formEmployeeId = '';
    this.formStartDate = '';
    this.formEndDate = '';
    this.formContractType = 'permanent';
    this.formSalary = 0;
    this.formCurrency = 'USD';
    this.formNotes = '';
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingContract = null; this.resetForm(); }

  saveContract() {
    if (this.editingContract) {
      const dto: UpdateEmployeeContractDto = {
        endDate: this.formEndDate || undefined,
        contractType: this.formContractType,
        salary: this.formSalary,
        currency: this.formCurrency,
        isActive: this.formIsActive,
        notes: this.formNotes || undefined,
      };
      this.service.update(this.editingContract.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadContracts(); },
        error: () => { this.error = 'Failed to update contract'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateEmployeeContractDto = {
        employeeId: this.formEmployeeId,
        startDate: this.formStartDate,
        endDate: this.formEndDate || undefined,
        contractType: this.formContractType,
        salary: this.formSalary,
        currency: this.formCurrency || undefined,
        notes: this.formNotes || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadContracts(); },
        error: () => { this.error = 'Failed to create contract'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteContract(c: EmployeeContractDto) {
    if (confirm('Delete this employee contract?')) {
      this.service.delete(c.id).subscribe({
        next: () => this.loadContracts(),
        error: () => { this.error = 'Failed to delete contract'; this.cdr.detectChanges(); },
      });
    }
  }
}
