import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

/**
 * Manufacturing Dashboard — bento "command center" layout.
 * Data is representative/illustrative for now (wire to live services later).
 */
@Component({
  selector: 'lib-manufacturing-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manufacturing-dashboard.html',
  styleUrl: './manufacturing-dashboard.css',
})
export class ManufacturingDashboard {
  stats = [
    { label: 'In Progress',    value: '18', icon: 'precision_manufacturing', color: 'c-violet',  delta: '+3',  dir: 'up',   foot: 'active orders' },
    { label: 'Completed Today',value: '7',  icon: 'task_alt',                color: 'c-success', delta: '+2',  dir: 'up',   foot: 'vs yesterday' },
    { label: 'Overdue',        value: '2',  icon: 'schedule',                color: 'c-danger',  delta: '+1',  dir: 'down', foot: 'past due date' },
    { label: 'Active Downtime',value: '1',  icon: 'build',                   color: 'c-amber',   delta: '0',   dir: 'up',   foot: 'Line 3 · 42 min' },
  ];

  // production output — last 8 days (% of capacity)
  output = [
    { cap: 'Mon', pct: 72 }, { cap: 'Tue', pct: 84 }, { cap: 'Wed', pct: 66 }, { cap: 'Thu', pct: 90 },
    { cap: 'Fri', pct: 95 }, { cap: 'Sat', pct: 58 }, { cap: 'Sun', pct: 40, muted: true }, { cap: 'Today', pct: 78 },
  ];

  // OEE rings — dash = pct/100 * 213.6 (r=34)
  rings = [
    { label: 'Availability', pct: 91, dash: '194.4 213.6', color: 'var(--kpi-1, #2b7fff)' },
    { label: 'Performance',  pct: 88, dash: '188.0 213.6', color: 'var(--kpi-3, #7c3aed)' },
    { label: 'Quality',      pct: 96, dash: '205.0 213.6', color: 'var(--kpi-5, #16a34a)' },
  ];

  orderStatus = [
    { label: 'Planned',     count: 12, pct: 100, cls: '' },
    { label: 'Released',    count: 9,  pct: 75,  cls: '' },
    { label: 'In Progress', count: 18, pct: 100, cls: 'v' },
    { label: 'QA Review',   count: 5,  pct: 42,  cls: 'a' },
    { label: 'Completed',   count: 31, pct: 100, cls: 'g' },
  ];

  quality = [
    { label: 'Passed',   count: 1284, color: 'var(--kpi-5, #16a34a)', dash: '221.1 251.3', off: '0' },
    { label: 'Reworked', count: 96,   color: 'var(--kpi-4, #d97706)', dash: '16.5 251.3',  off: '-221.1' },
    { label: 'Rejected', count: 78,   color: 'var(--kpi-6, #dc2626)', dash: '13.4 251.3',  off: '-237.6' },
  ];

  feed = [
    { text: 'Order <strong>WO-2048</strong> completed — 500 units', time: '12 min ago', dot: 'g' },
    { text: '<strong>Line 3</strong> downtime started — maintenance', time: '42 min ago', dot: 'a' },
    { text: 'QA passed batch <strong>B-1192</strong> (96% yield)', time: '1 hour ago', dot: 'g' },
    { text: 'Order <strong>WO-2051</strong> running behind schedule', time: '2 hours ago', dot: 'r' },
    { text: 'Material issued to <strong>WO-2053</strong>', time: '3 hours ago', dot: 'v' },
  ];

  constructor(private router: Router) {}
  go(route: string): void { this.router.navigate([route]); }
}
