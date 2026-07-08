import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-skills-competencies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skills-competencies.html',
  styleUrl: './skills-competencies.css',
})
export class SkillsCompetenciesComponent implements OnInit {
  skills: any[] = [];
  loading = false;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadSkills(); }

  loadSkills() {
    this.loading = true;
    this.error = '';
    this.skills = [];
    this.loading = false;
    this.cdr.detectChanges();
  }
}
