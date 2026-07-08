import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { RowHighlighter } from '@nexcore/shared';
import { WorkCenterService } from '../../services/work-center.service';
import {
  WorkCenterDto,
  WorkCenterShiftDto,
  CreateWorkCenterShiftDto,
  UpdateWorkCenterShiftDto,
} from '../../models/work-center.model';

const DAY_OPTIONS = [
  { label: 'Mon', value: 'Monday' },
  { label: 'Tue', value: 'Tuesday' },
  { label: 'Wed', value: 'Wednesday' },
  { label: 'Thu', value: 'Thursday' },
  { label: 'Fri', value: 'Friday' },
  { label: 'Sat', value: 'Saturday' },
  { label: 'Sun', value: 'Sunday' },
] as const;
const WORK_CENTER_FILTER_STORAGE_KEY = 'manufacturing.workCenterShifts.selectedWorkCenterId';

@Component({
  selector: 'lib-work-center-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-center-shifts.html',
  styleUrl: './work-center-shifts.css',
})
export class WorkCenterShifts implements OnInit {
  workCenters: WorkCenterDto[] = [];
  shifts: WorkCenterShiftDto[] = [];
  selectedWorkCenterId = '';
  loading = false;
  error = '';
  info = '';
  showForm = false;
  editing: WorkCenterShiftDto | null = null;
  submitAttempted = false;

  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  shiftPage = 1;
  shiftPageSize = 10;
  shiftTotalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  get displayRows(): any[] {
    let rows: any[] = [...this.shifts];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const id = this.highlighter.id;
    if (id != null) {
      const idx = rows.findIndex(r => r?.id === id);
      if (idx > 0) { const [row] = rows.splice(idx, 1); rows.unshift(row); }
    }
    return rows;
  }

  get pagedShifts(): WorkCenterShiftDto[] {
    const start = (this.shiftPage - 1) * this.shiftPageSize;
    return this.displayRows.slice(start, start + this.shiftPageSize);
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  private applyJustCreated(): void {
    const c = this.justCreated;
    if (!c) return;
    this.justCreated = null;
    if (!this.shifts.some((i: any) => i?.id === c.id)) this.shifts = [c, ...this.shifts];
    this.highlighter.flash(c.id, this.cdr);
  }

  goToShiftPage(page: number) { this.shiftPage = page; }
  onShiftPageSizeChange() { this.shiftPage = 1; this.shiftTotalPages = Math.max(1, Math.ceil(this.shifts.length / this.shiftPageSize)); }

  readonly allDays = DAY_OPTIONS;
  formShiftName = '';
  formWorkCenterId = '';
  formStartTime = '07:00';
  formEndTime = '15:00';
  formSelectedDays: Record<string, boolean> = {};

  constructor(
    private svc: WorkCenterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const savedWorkCenterId = localStorage.getItem(WORK_CENTER_FILTER_STORAGE_KEY);
    if (savedWorkCenterId) {
      this.selectedWorkCenterId = savedWorkCenterId;
    }
    this.loadWorkCenters();
  }

  loadWorkCenters() {
    this.loading = true;
    this.error = '';

    this.svc.getAll({ pageSize: 1000 }).subscribe({
      next: (response) => {
        this.workCenters = response.data ?? [];
        if (this.selectedWorkCenterId && !this.workCenters.some((center) => center.id === this.selectedWorkCenterId)) {
          this.selectedWorkCenterId = this.workCenters[0]?.id ?? '';
        }
        if (this.selectedWorkCenterId) {
          localStorage.setItem(WORK_CENTER_FILTER_STORAGE_KEY, this.selectedWorkCenterId);
        }
        if (this.showForm && !this.editing) {
          this.formWorkCenterId = this.getDefaultWorkCenterId();
        }
        this.loadShifts();
      },
      error: () => {
        this.error = 'Failed to load work centers';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadShifts() {
    this.loading = true;
    this.error = '';

    if (!this.selectedWorkCenterId) {
      if (!this.workCenters.length) {
        this.shifts = [];
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      forkJoin(this.workCenters.map((c) => this.svc.getShifts(c.id))).subscribe({
        next: (responses) => {
          this.shifts = responses.flatMap((r) => r.data ?? []);
          this.shiftPage = 1;
          this.shiftTotalPages = Math.max(1, Math.ceil(this.shifts.length / this.shiftPageSize));
          this.loading = false;
          this.applyJustCreated();
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Failed to load shifts';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
      return;
    }

    this.svc.getShifts(this.selectedWorkCenterId).subscribe({
      next: (response) => {
        this.shifts = response.data ?? [];
        this.shiftPage = 1;
        this.shiftTotalPages = Math.max(1, Math.ceil(this.shifts.length / this.shiftPageSize));
        this.loading = false;
        this.applyJustCreated();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load shifts for the selected work center';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onWorkCenterChange(workCenterId: string) {
    this.selectedWorkCenterId = workCenterId;
    if (workCenterId) {
      localStorage.setItem(WORK_CENTER_FILTER_STORAGE_KEY, workCenterId);
    } else {
      localStorage.removeItem(WORK_CENTER_FILTER_STORAGE_KEY);
    }
    this.cancel();
    this.loadShifts();
  }

  openCreate() {
    this.resetForm();
    this.editing = null;
    this.formWorkCenterId = this.getDefaultWorkCenterId();
    this.showForm = true;
  }

  openEdit(shift: WorkCenterShiftDto) {
    this.editing = shift;
    this.formShiftName = shift.shiftName ?? '';
    this.formWorkCenterId = shift.workCenterId;
    this.formStartTime = shift.startTime ?? '07:00';
    this.formEndTime = shift.endTime ?? '15:00';
    this.formSelectedDays = {};
    const days = (shift.workingDays ?? '').split(',').map((d) => this.normalizeDayToken(d));
    for (const d of this.allDays) { this.formSelectedDays[d.value] = days.includes(d.value); }
    this.showForm = true;
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.submitAttempted = false;
    this.resetForm();
  }

  save() {
    console.info('[WorkCenterShifts] save clicked');
    this.error = '';
    this.info = '';
    this.submitAttempted = true;

    const shiftName = String(this.formShiftName ?? '').trim();
    const workCenterId = String(this.formWorkCenterId || this.getDefaultWorkCenterId()).trim();
    const startRaw = String(this.formStartTime ?? '').trim();
    const endRaw = String(this.formEndTime ?? '').trim();
    const workingDays = this.getWorkingDaysString();

    if (!this.canSubmitShiftForm()) {
      this.error = 'Please fill in the required fields before submitting.';
      this.cdr.detectChanges();
      return;
    }

    const normalizedStartTime = this.toApiTime(startRaw);
    const normalizedEndTime = this.toApiTime(endRaw);
    const availableHours = this.calculateAvailableHours(normalizedStartTime, normalizedEndTime);

    if (!normalizedStartTime || !normalizedEndTime || availableHours <= 0) {
      this.error = 'Please provide valid start and end times for the shift.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;

    if (this.editing) {
      const updateDto: UpdateWorkCenterShiftDto = {
        shiftName,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        workingDays: workingDays || null,
        availableHours,
      };

      this.svc.updateShift(workCenterId, this.editing.id, updateDto).subscribe({
        next: () => {
          this.loading = false;
          this.showForm = false;
          this.selectedWorkCenterId = workCenterId;
          localStorage.setItem(WORK_CENTER_FILTER_STORAGE_KEY, workCenterId);
          this.info = 'Shift updated successfully.';
          this.loadShifts();
        },
        error: (err: unknown) => {
          this.loading = false;
          this.error = this.getApiErrorMessage(err, 'Failed to update shift');
          this.cdr.detectChanges();
        },
      });
    } else {
      const createDto: CreateWorkCenterShiftDto = {
        shiftName,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        workingDays: workingDays || null,
        availableHours,
        isActive: true,
      };

      this.svc.createShift(workCenterId, createDto).subscribe({
        next: (res: any) => {
          this.justCreated = res?.data ?? null;
          this.loading = false;
          this.showForm = false;
          this.selectedWorkCenterId = workCenterId;
          localStorage.setItem(WORK_CENTER_FILTER_STORAGE_KEY, workCenterId);
          this.info = 'Shift created successfully.';
          this.loadShifts();
        },
        error: (err: unknown) => {
          this.loading = false;
          this.error = this.getApiErrorMessage(err, 'Failed to create shift');
          this.cdr.detectChanges();
        },
      });
    }
  }

  delete(shift: WorkCenterShiftDto) {
    if (!shift.id) {
      return;
    }

    if (confirm(`Delete shift "${shift.shiftName ?? 'Unnamed'}"?`)) {
      this.svc.deleteShift(shift.workCenterId, shift.id).subscribe({
        next: () => this.loadShifts(),
        error: () => {
          this.error = 'Failed to delete shift';
          this.cdr.detectChanges();
        },
      });
    }
  }

  resetForm() {
    this.formShiftName = '';
    this.formWorkCenterId = this.getDefaultWorkCenterId();
    this.formStartTime = '07:00';
    this.formEndTime = '15:00';
    this.formSelectedDays = {};
    for (const d of this.allDays) { this.formSelectedDays[d.value] = false; }
  }

  getWorkingDaysString(): string {
    return this.allDays.filter((d) => this.formSelectedDays[d.value]).map((d) => d.value).join(',');
  }

  canSubmitShiftForm(): boolean {
    return !!(
      this.formShiftName.trim()
      && (this.formWorkCenterId || this.getDefaultWorkCenterId())
      && this.formStartTime
      && this.formEndTime
      && this.getWorkingDaysString()
    );
  }

  getShiftNameError(): string {
    return this.submitAttempted && !this.formShiftName.trim() ? 'Shift name is required.' : '';
  }

  getWorkCenterError(): string {
    return this.submitAttempted && !(this.formWorkCenterId || this.getDefaultWorkCenterId()) ? 'Work center is required.' : '';
  }

  getStartTimeError(): string {
    return this.submitAttempted && !this.formStartTime ? 'Start time is required.' : '';
  }

  getEndTimeError(): string {
    return this.submitAttempted && !this.formEndTime ? 'End time is required.' : '';
  }

  getWorkingDaysError(): string {
    return this.submitAttempted && !this.getWorkingDaysString() ? 'Select at least one working day.' : '';
  }

  private getDefaultWorkCenterId(): string {
    return this.selectedWorkCenterId || this.workCenters[0]?.id || '';
  }

  private toApiTime(time: string): string {
    if (!time?.trim()) {
      return '';
    }

    const parsed = this.parseTimeToMinutes(time);
    if (parsed === null) {
      return '';
    }

    const hours = Math.floor(parsed / 60);
    const minutes = parsed % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  private calculateAvailableHours(startTime: string, endTime: string): number {
    const startTotalMinutes = this.parseTimeToMinutes(startTime);
    const endTotalMinutes = this.parseTimeToMinutes(endTime);
    if (startTotalMinutes === null || endTotalMinutes === null) {
      return 0;
    }

    const durationMinutes = endTotalMinutes >= startTotalMinutes
      ? endTotalMinutes - startTotalMinutes
      : (24 * 60) - startTotalMinutes + endTotalMinutes;

    return Math.round((durationMinutes / 60) * 100) / 100;
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    const candidate = error as {
      error?: { message?: string; title?: string };
      message?: string;
    };

    return candidate?.error?.message
      || candidate?.error?.title
      || candidate?.message
      || fallback;
  }

  private parseTimeToMinutes(value: string): number | null {
    const raw = value.trim();
    if (!raw) {
      return null;
    }

    const amPmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if (amPmMatch) {
      let hour = Number(amPmMatch[1]);
      const minute = Number(amPmMatch[2]);
      const ampm = amPmMatch[3].toUpperCase();
      if (Number.isNaN(hour) || Number.isNaN(minute) || minute < 0 || minute > 59 || hour < 1 || hour > 12) {
        return null;
      }
      if (ampm === 'AM' && hour === 12) {
        hour = 0;
      } else if (ampm === 'PM' && hour < 12) {
        hour += 12;
      }
      return (hour * 60) + minute;
    }

    const twentyFourHourMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (twentyFourHourMatch) {
      const hour = Number(twentyFourHourMatch[1]);
      const minute = Number(twentyFourHourMatch[2]);
      if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return null;
      }
      return (hour * 60) + minute;
    }

    return null;
  }

  private normalizeDayToken(token: string): string {
    const normalized = token.trim().toLowerCase();
    const mapping: Record<string, string> = {
      mon: 'Monday', monday: 'Monday',
      tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
      wed: 'Wednesday', wednesday: 'Wednesday',
      thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
      fri: 'Friday', friday: 'Friday',
      sat: 'Saturday', saturday: 'Saturday',
      sun: 'Sunday', sunday: 'Sunday',
    };
    return mapping[normalized] ?? token.trim();
  }

  getWorkCenterName(workCenterId: string) {
    return this.workCenters.find((center) => center.id === workCenterId)?.name ?? 'Unknown';
  }

  getSelectedWorkCenterName(): string {
    return this.getWorkCenterName(this.selectedWorkCenterId);
  }
}
