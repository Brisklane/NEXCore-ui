import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnboardingTaskService } from '../../../../services/onboarding-task.service';
import { OnboardingTaskDto, CreateOnboardingTaskDto, UpdateOnboardingTaskDto } from '../../../../models/onboarding-task.model';

@Component({
  selector: 'lib-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding implements OnInit {
  tasks: OnboardingTaskDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingTask: OnboardingTaskDto | null = null;

  formEmployeeId = '';
  formTitle = '';
  formDescription = '';
  formDueDate = '';
  formAssignedToId = '';
  formIsCompleted = false;

  constructor(private service: OnboardingTaskService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadTasks(); }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.tasks = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load tasks'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingTask = null; this.resetForm(); this.showForm = true; }

  openEditForm(t: OnboardingTaskDto) {
    this.editingTask = t;
    this.formEmployeeId = t.templateCode ?? '';
    this.formTitle = t.taskName ?? '';
    this.formDescription = t.description ?? '';
    this.formDueDate = String(t.defaultDueDaysFromStart ?? 0);
    this.formAssignedToId = t.defaultAssigneeRole ?? '';
    this.formIsCompleted = !t.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formEmployeeId = '';
    this.formTitle = '';
    this.formDescription = '';
    this.formDueDate = '';
    this.formAssignedToId = '';
    this.formIsCompleted = false;
  }

  cancelForm() { this.showForm = false; this.editingTask = null; this.resetForm(); }

  saveTask() {
    if (!this.formEmployeeId.trim() || !this.formTitle.trim()) {
      this.error = 'Employee ID and Title are required';
      this.cdr.detectChanges();
      return;
    }

    if (this.editingTask) {
      const dto: UpdateOnboardingTaskDto = {
        taskName: this.formTitle,
        description: this.formDescription || undefined,
        defaultDueDaysFromStart: Number(this.formDueDate) || undefined,
        isActive: !this.formIsCompleted,
      };
      this.service.update(this.editingTask.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadTasks(); },
        error: () => { this.error = 'Failed to update task'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateOnboardingTaskDto = {
        templateCode: this.formEmployeeId || undefined,
        taskName: this.formTitle,
        description: this.formDescription || undefined,
        defaultDueDaysFromStart: Number(this.formDueDate) || undefined,
        defaultAssigneeRole: this.formAssignedToId || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadTasks(); },
        error: () => { this.error = 'Failed to create task'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteTask(t: OnboardingTaskDto) {
    if (confirm(`Delete task?`)) {
      this.service.delete(t.id).subscribe({
        next: () => this.loadTasks(),
        error: () => { this.error = 'Failed to delete task'; this.cdr.detectChanges(); },
      });
    }
  }
}
