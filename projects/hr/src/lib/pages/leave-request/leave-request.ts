import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveRequestDto, CreateLeaveRequestDto, UpdateLeaveRequestDto } from '../../models/leave-request.model';

@Component({
  selector: 'lib-leave-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-request.html',
  styleUrl: './leave-request.css',
})
export class LeaveRequestComponent implements OnInit {
  requests: LeaveRequestDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingRequest: LeaveRequestDto | null = null;

  formEmployeeId = '';
  formLeaveTypeId = '';
  formStartDate = '';
  formEndDate = '';
  formReason = '';

  constructor(private service: LeaveRequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadRequests(); }

  loadRequests() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.requests = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load leave requests'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingRequest = null; this.resetForm(); this.showForm = true; }

  openEditForm(r: LeaveRequestDto) {
    this.editingRequest = r;
    this.formEmployeeId = r.employeeId;
    this.formLeaveTypeId = r.leaveTypeId;
    this.formStartDate = r.startDate;
    this.formEndDate = r.endDate;
    this.formReason = r.reason ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formEmployeeId = '';
    this.formLeaveTypeId = '';
    this.formStartDate = '';
    this.formEndDate = '';
    this.formReason = '';
  }

  cancelForm() { this.showForm = false; this.editingRequest = null; this.resetForm(); }

  saveRequest() {
    if (this.editingRequest) {
      const dto: UpdateLeaveRequestDto = {
        startDate: this.formStartDate,
        endDate: this.formEndDate,
        reason: this.formReason || undefined,
      };
      this.service.update(this.editingRequest.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadRequests(); },
        error: () => { this.error = 'Failed to update leave request'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateLeaveRequestDto = {
        employeeId: this.formEmployeeId,
        leaveTypeId: this.formLeaveTypeId,
        startDate: this.formStartDate,
        endDate: this.formEndDate,
        reason: this.formReason || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadRequests(); },
        error: () => { this.error = 'Failed to create leave request'; this.cdr.detectChanges(); },
      });
    }
  }

  approve(r: LeaveRequestDto) {
    this.service.approve(r.id).subscribe({
      next: () => this.loadRequests(),
      error: () => { this.error = 'Failed to approve request'; this.cdr.detectChanges(); },
    });
  }

  reject(r: LeaveRequestDto) {
    this.service.reject(r.id).subscribe({
      next: () => this.loadRequests(),
      error: () => { this.error = 'Failed to reject request'; this.cdr.detectChanges(); },
    });
  }

  deleteRequest(r: LeaveRequestDto) {
    if (confirm('Delete this leave request?')) {
      this.service.delete(r.id).subscribe({
        next: () => this.loadRequests(),
        error: () => { this.error = 'Failed to delete leave request'; this.cdr.detectChanges(); },
      });
    }
  }
}
