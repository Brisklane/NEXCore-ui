import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveTypeService } from '../../services/leave-type.service';
import { LeaveTypeDto, CreateLeaveTypeDto, UpdateLeaveTypeDto } from '../../models/leave-type.model';

@Component({
  selector: 'lib-leave-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-type.html',
  styleUrl: './leave-type.css',
})
export class LeaveTypeComponent implements OnInit {
  leaveTypes: LeaveTypeDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingLeaveType: LeaveTypeDto | null = null;

  formName = '';
  formCode = '';
  formDaysAllowed = 0;
  formIsPaid = true;
  formIsActive = true;

  constructor(private service: LeaveTypeService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadLeaveTypes(); }

  loadLeaveTypes() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.leaveTypes = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load leave types'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingLeaveType = null; this.resetForm(); this.showForm = true; }

  openEditForm(l: LeaveTypeDto) {
    this.editingLeaveType = l;
    this.formName = l.name;
    this.formCode = l.code;
    this.formDaysAllowed = l.daysAllowed;
    this.formIsPaid = l.isPaid;
    this.formIsActive = l.isActive;
    this.showForm = true;
  }

  resetForm() { this.formName = ''; this.formCode = ''; this.formDaysAllowed = 0; this.formIsPaid = true; this.formIsActive = true; }

  cancelForm() { this.showForm = false; this.editingLeaveType = null; this.resetForm(); }

  saveLeaveType() {
    if (this.editingLeaveType) {
      const dto: UpdateLeaveTypeDto = {
        name: this.formName,
        code: this.formCode,
        daysAllowed: this.formDaysAllowed,
        isPaid: this.formIsPaid,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingLeaveType.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadLeaveTypes(); },
        error: () => { this.error = 'Failed to update leave type'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateLeaveTypeDto = {
        name: this.formName,
        code: this.formCode,
        daysAllowed: this.formDaysAllowed,
        isPaid: this.formIsPaid,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadLeaveTypes(); },
        error: () => { this.error = 'Failed to create leave type'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteLeaveType(l: LeaveTypeDto) {
    if (confirm(`Delete leave type "${l.name}"?`)) {
      this.service.delete(l.id).subscribe({
        next: () => this.loadLeaveTypes(),
        error: () => { this.error = 'Failed to delete leave type'; this.cdr.detectChanges(); },
      });
    }
  }
}
