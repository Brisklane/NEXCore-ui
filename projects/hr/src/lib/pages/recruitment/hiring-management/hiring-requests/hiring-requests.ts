import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobRequisitionService } from '../../../../services/job-requisition.service';
import { DepartmentService } from '../../../../services/department.service';
import { JobTitleService } from '../../../../services/job-title.service';
import { JobRequisitionDto, CreateJobRequisitionDto, UpdateJobRequisitionDto } from '../../../../models/job-requisition.model';
import { HrLookupItemDto } from '../../../../models/hr-lookup-item.model';
import { JobRecordType } from 'projects/hr/src/lib/models/hr-enums';

@Component({
  selector: 'lib-hiring-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hiring-requests.html',
  styleUrl: './hiring-requests.css',
})
export class HiringRequests implements OnInit {
  requisitions: JobRequisitionDto[] = [];
  departments: HrLookupItemDto[] = [];
  designations: HrLookupItemDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingRequisition: JobRequisitionDto | null = null;

  formJobTitle = '';
  formDepartmentId = '';
  formDesignationId = '';
  formHeadcount = 1;
  formTargetStartDate = '';

  constructor(
    private service: JobRequisitionService,
    private departmentService: DepartmentService,
    private jobTitleService: JobTitleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadRequisitions();
  }

  loadLookups() {
    this.departmentService.getLookup().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.departments = []; },
    });
    this.jobTitleService.getLookup().subscribe({
      next: (res) => { this.designations = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.designations = []; },
    });
  }

  loadRequisitions() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.requisitions = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load requisitions'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  getDepartmentName(id: string): string {
    return this.departments.find(d => d.id === id)?.name ?? id;
  }

  getDesignationName(id: string): string {
    return this.designations.find(d => d.id === id)?.name ?? id;
  }

  openCreateForm() { this.editingRequisition = null; this.resetForm(); this.showForm = true; }

  openEditForm(r: JobRequisitionDto) {
    this.editingRequisition = r;
    this.formJobTitle = r.jobTitle ?? '';
    this.formDepartmentId = r.departmentId;
    this.formDesignationId = r.designationId;
    this.formHeadcount = r.headcount;
    this.formTargetStartDate = r.targetStartDate ? r.targetStartDate.substring(0, 10) : '';
    this.showForm = true;
  }

  resetForm() {
    this.formJobTitle = '';
    this.formDepartmentId = '';
    this.formDesignationId = '';
    this.formHeadcount = 1;
    this.formTargetStartDate = '';
  }

  cancelForm() { this.showForm = false; this.editingRequisition = null; this.resetForm(); this.error = ''; }

  saveRequisition() {
    if (!this.formJobTitle.trim() || !this.formDepartmentId.trim() || !this.formDesignationId.trim()) {
      this.error = 'Job Title, Department and Designation are required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingRequisition) {
      const dto: UpdateJobRequisitionDto = {
        jobTitle: this.formJobTitle,
        headcount: this.formHeadcount,
        targetStartDate: this.formTargetStartDate || undefined,
      };
      this.service.update(this.editingRequisition.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadRequisitions(); },
        error: () => { this.error = 'Failed to update requisition'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateJobRequisitionDto = {
        jobTitle: this.formJobTitle,
        departmentId: this.formDepartmentId,
        designationId: this.formDesignationId,
        headcount: this.formHeadcount,
        targetStartDate: this.formTargetStartDate || undefined,
        recordType: JobRecordType.Requisition,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadRequisitions(); },
        error: () => { this.error = 'Failed to create requisition'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteRequisition(r: JobRequisitionDto) {
    if (confirm(`Delete requisition?`)) {
      this.service.delete(r.id).subscribe({
        next: () => this.loadRequisitions(),
        error: () => { this.error = 'Failed to delete requisition'; this.cdr.detectChanges(); },
      });
    }
  }
}