import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BenefitsPlanService } from '../../services/benefits-plan.service';
import { BenefitsPlanDto, CreateBenefitsPlanDto, UpdateBenefitsPlanDto } from '../../models/benefits-plan.model';

@Component({
  selector: 'lib-benefits-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './benefits-plan.html',
  styleUrl: './benefits-plan.css',
})
export class BenefitsPlanComponent implements OnInit {
  plans: BenefitsPlanDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingPlan: BenefitsPlanDto | null = null;

  formName = '';
  formDescription = '';
  formPlanType = '';
  formIsActive = true;

  constructor(
    private service: BenefitsPlanService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => {
        this.plans = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load benefits plans';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingPlan = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(plan: BenefitsPlanDto) {
    this.editingPlan = plan;
    this.formName = plan.name ?? '';
    this.formDescription = plan.description ?? '';
    this.formPlanType = plan.planType ?? '';
    this.formIsActive = plan.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formName = '';
    this.formDescription = '';
    this.formPlanType = '';
    this.formIsActive = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingPlan = null;
    this.resetForm();
  }

  savePlan() {
    if (this.editingPlan) {
      const dto: UpdateBenefitsPlanDto = {
        name: this.formName,
        description: this.formDescription,
        planType: this.formPlanType,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingPlan.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadPlans(); },
        error: () => { this.error = 'Failed to update benefits plan'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateBenefitsPlanDto = {
        name: this.formName,
        description: this.formDescription,
        planType: this.formPlanType,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadPlans(); },
        error: () => { this.error = 'Failed to create benefits plan'; this.cdr.detectChanges(); },
      });
    }
  }

  deletePlan(plan: BenefitsPlanDto) {
    if (confirm(`Delete benefits plan "${plan.name}"?`)) {
      this.service.delete(plan.id).subscribe({
        next: () => this.loadPlans(),
        error: () => { this.error = 'Failed to delete benefits plan'; this.cdr.detectChanges(); },
      });
    }
  }
}
