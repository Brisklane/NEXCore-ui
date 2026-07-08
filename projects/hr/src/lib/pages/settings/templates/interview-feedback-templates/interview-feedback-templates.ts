import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-interview-feedback-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-feedback-templates.html',
  styleUrl: './interview-feedback-templates.css',
})
export class InterviewFeedbackTemplatesComponent implements OnInit {
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
