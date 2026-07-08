import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceRecordService } from '../../services/attendance-record.service';
import { AttendanceRecordDto, CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from '../../models/attendance-record.model';

@Component({
  selector: 'lib-attendance-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-record.html',
  styleUrl: './attendance-record.css',
})
export class AttendanceRecordComponent implements OnInit {
  records: AttendanceRecordDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingRecord: AttendanceRecordDto | null = null;

  formEmployeeId = '';
  formDate = '';
  formCheckIn = '';
  formCheckOut = '';
  formStatus = 'present';
  formNotes = '';

  constructor(private service: AttendanceRecordService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadRecords(); }

  loadRecords() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.records = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load attendance records'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingRecord = null; this.resetForm(); this.showForm = true; }

  openEditForm(r: AttendanceRecordDto) {
    this.editingRecord = r;
    this.formEmployeeId = r.employeeId;
    this.formDate = r.date;
    this.formCheckIn = r.checkIn ?? '';
    this.formCheckOut = r.checkOut ?? '';
    this.formStatus = r.status;
    this.formNotes = r.notes ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formEmployeeId = '';
    this.formDate = '';
    this.formCheckIn = '';
    this.formCheckOut = '';
    this.formStatus = 'present';
    this.formNotes = '';
  }

  cancelForm() { this.showForm = false; this.editingRecord = null; this.resetForm(); }

  saveRecord() {
    if (this.editingRecord) {
      const dto: UpdateAttendanceRecordDto = {
        checkIn: this.formCheckIn || undefined,
        checkOut: this.formCheckOut || undefined,
        status: this.formStatus,
        notes: this.formNotes || undefined,
      };
      this.service.update(this.editingRecord.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadRecords(); },
        error: () => { this.error = 'Failed to update record'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateAttendanceRecordDto = {
        employeeId: this.formEmployeeId,
        date: this.formDate,
        checkIn: this.formCheckIn || undefined,
        checkOut: this.formCheckOut || undefined,
        status: this.formStatus || undefined,
        notes: this.formNotes || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadRecords(); },
        error: () => { this.error = 'Failed to create record'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteRecord(r: AttendanceRecordDto) {
    if (confirm('Delete this attendance record?')) {
      this.service.delete(r.id).subscribe({
        next: () => this.loadRecords(),
        error: () => { this.error = 'Failed to delete record'; this.cdr.detectChanges(); },
      });
    }
  }
}
