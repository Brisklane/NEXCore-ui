import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * HR Dashboard — bento "command center" layout.
 * Data is hardcoded/illustrative for now (wire to live services later).
 */
@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  stats = [
    { label: 'Total Employees', value: '247', icon: 'groups',        color: 'c-brand',   delta: '+6',   dir: 'up',   foot: 'this quarter' },
    { label: 'Present Today',   value: '231', icon: 'how_to_reg',    color: 'c-success', delta: '94%',  dir: 'up',   foot: 'attendance rate' },
    { label: 'On Leave',        value: '11',  icon: 'beach_access',  color: 'c-amber',   delta: '+2',   dir: 'down', foot: '3 pending approval' },
    { label: 'Open Positions',  value: '8',   icon: 'work',          color: 'c-violet',  delta: '+1',   dir: 'up',   foot: '31 in interview' },
  ];

  // headcount growth — last 8 months
  headcountX = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  attendance = [
    { label: 'On-site', count: 213, color: 'var(--kpi-1, #2b7fff)', dash: '216.7 251.3', off: '0' },
    { label: 'Remote',  count: 18,  color: 'var(--kpi-2, #22c7e6)', dash: '18.3 251.3',  off: '-216.7' },
    { label: 'On leave',count: 11,  color: 'var(--kpi-4, #d97706)', dash: '11.2 251.3',  off: '-235.0' },
    { label: 'Absent',  count: 5,   color: 'var(--kpi-6, #dc2626)', dash: '5.1 251.3',   off: '-246.2' },
  ];

  pipeline = [
    { label: 'Applied',    count: 142, pct: 100, cls: '' },
    { label: 'Screening',  count: 68,  pct: 48,  cls: '' },
    { label: 'Interview',  count: 31,  pct: 22,  cls: 'v' },
    { label: 'Offer',      count: 12,  pct: 9,   cls: 'a' },
    { label: 'Hired',      count: 6,   pct: 5,   cls: 'g' },
  ];

  departments = [
    { name: 'Engineering', sub: 'Product & platform', val: '84', ini: 'EN' },
    { name: 'Sales',       sub: 'Revenue',            val: '46', ini: 'SA' },
    { name: 'Operations',  sub: 'Supply & logistics', val: '38', ini: 'OP' },
    { name: 'Support',     sub: 'Customer success',    val: '29', ini: 'SU' },
    { name: 'Marketing',   sub: 'Brand & growth',      val: '21', ini: 'MK' },
  ];

  activity = [
    { text: '<strong>Ayesha Noor</strong> completed onboarding', time: '25 min ago', dot: 'g' },
    { text: 'Leave approved for <strong>Bilal Ahmed</strong> (3 days)', time: '1 hour ago', dot: '' },
    { text: '<strong>Zara Iqbal</strong> accepted the offer — Sr. Engineer', time: '2 hours ago', dot: 'v' },
    { text: 'Performance review due for <strong>4 employees</strong>', time: 'Today', dot: 'a' },
    { text: 'New requisition opened — <strong>UX Designer</strong>', time: 'Yesterday', dot: '' },
  ];

  constructor(private router: Router) {}
  go(route: string): void { this.router.navigate([route]); }
}
