import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-interview-plan-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-plan-templates.html',
  styleUrl: './interview-plan-templates.css',
})
export class InterviewPlanTemplatesComponent implements OnInit {
  templates: any[] = [];
  loading = false;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadTemplates(); }

  loadTemplates() {
    this.loading = true;
    this.error = '';
    this.templates = [];
    this.loading = false;
    this.cdr.detectChanges();
  }
}
