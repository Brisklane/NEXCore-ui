import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Accounting Dashboard — bento "command center" layout.
 * Data is hardcoded/illustrative for now (wire to live services later).
 */
@Component({
  selector: 'lib-accounting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounting-dashboard.html',
  styleUrl: './accounting-dashboard.css',
})
export class AccountingDashboardPage {
  stats = [
    { label: 'Revenue (MTD)', value: '$962K', icon: 'trending_up',   color: 'c-success', delta: '+11%', dir: 'up',   foot: 'this month' },
    { label: 'Expenses (MTD)',value: '$748K', icon: 'trending_down', color: 'c-amber',   delta: '+6%',  dir: 'down', foot: 'vs last month' },
    { label: 'Net Profit',    value: '$214K', icon: 'savings',       color: 'c-brand',   delta: '+18%', dir: 'up',   foot: '22% margin' },
    { label: 'Overdue AR',    value: '$86K',  icon: 'warning',       color: 'c-danger',  delta: '+$12K',dir: 'down', foot: '3 invoices' },
  ];

  flowX = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  expenses = [
    { label: 'Payroll',    count: '$314K', color: '#2b7fff', dash: '105.5 251.3', off: '0' },
    { label: 'COGS',       count: '$195K', color: '#22c7e6', dash: '65.3 251.3',  off: '-105.5' },
    { label: 'Operations', count: '$135K', color: '#7c3aed', dash: '45.2 251.3',  off: '-170.8' },
    { label: 'Tax',        count: '$67K',  color: '#f59e0b', dash: '22.6 251.3',  off: '-216.0' },
    { label: 'Other',      count: '$37K',  color: '#94a3b8', dash: '12.6 251.3',  off: '-238.6' },
  ];

  cash = [
    { name: 'Main Operating', sub: 'HBL · ****4821', val: '$842K', ini: 'MO' },
    { name: 'Payroll Account',sub: 'Meezan · ****1190', val: '$220K', ini: 'PA' },
    { name: 'Reserve Fund',   sub: 'UBL · ****3355',  val: '$310K', ini: 'RF' },
    { name: 'Petty Cash',     sub: 'On hand',         val: '$28K',  ini: 'PC' },
  ];

  pnl = [
    { label: 'Revenue', count: '$962K', pct: 100, cls: 'g' },
    { label: 'COGS',    count: '$448K', pct: 47,  cls: 'a' },
    { label: 'OpEx',    count: '$300K', pct: 31,  cls: '' },
    { label: 'Tax',     count: '$42K',  pct: 4,   cls: 'v' },
    { label: 'Net',     count: '$214K', pct: 22,  cls: 'g' },
  ];

  feed = [
    { text: 'Journal <strong>JE-2048</strong> posted — $18,400', time: '22 min ago', dot: 'v' },
    { text: 'Invoice <strong>INV-1192</strong> paid by <strong>Acme Corp</strong>', time: '1 hour ago', dot: 'g' },
    { text: 'Bank reconciliation completed — Main Operating', time: '2 hours ago', dot: 'g' },
    { text: 'Invoice <strong>INV-1180</strong> now overdue', time: '3 hours ago', dot: 'r' },
    { text: 'Fiscal period <strong>Jun</strong> closed', time: 'Yesterday', dot: '' },
  ];

  constructor(private router: Router) {}
  go(route: string): void { this.router.navigate([route]); }
}
