import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Procurement Dashboard — bento "command center" layout.
 * Data is hardcoded/illustrative for now (wire to live services later).
 */
@Component({
  selector: 'lib-procurement-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procurement-dashboard.html',
  styleUrl: './procurement-dashboard.css',
})
export class ProcurementDashboardPage {
  stats = [
    { label: 'Open POs',        value: '42', icon: 'receipt_long',     color: 'c-brand',  delta: '+5',  dir: 'up',   foot: '$1.9M committed' },
    { label: 'Pending Approval',value: '14', icon: 'pending_actions',  color: 'c-amber',  delta: '+3',  dir: 'down', foot: 'awaiting sign-off' },
    { label: 'Awaiting Receipt',value: '6',  icon: 'local_shipping',   color: 'c-violet', delta: '-2',  dir: 'up',   foot: 'GRNs pending' },
    { label: 'Overdue Bills',   value: '3',  icon: 'warning',          color: 'c-danger', delta: '+1',  dir: 'down', foot: '$128K past due' },
  ];

  spendX = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  categories = [
    { label: 'Raw Materials', count: '$3.8M', color: '#2b7fff', dash: '113.1 251.3', off: '0' },
    { label: 'Packaging',     count: '$1.7M', color: '#22c7e6', dash: '50.3 251.3',  off: '-113.1' },
    { label: 'Services',      count: '$1.3M', color: '#7c3aed', dash: '37.7 251.3',  off: '-163.4' },
    { label: 'Logistics',     count: '$1.0M', color: '#16a34a', dash: '30.2 251.3',  off: '-201.1' },
    { label: 'Other',         count: '$0.6M', color: '#f59e0b', dash: '20.1 251.3',  off: '-231.3' },
  ];

  vendors = [
    { name: 'Acme Supplies',      sub: '128 orders · on-time 97%', val: '$1.2M', ini: 'AC' },
    { name: 'Globex Materials',   sub: '96 orders · on-time 94%',  val: '$890K', ini: 'GM' },
    { name: 'Initech Parts',      sub: '74 orders · on-time 91%',  val: '$640K', ini: 'IP' },
    { name: 'Umbrella Logistics', sub: '52 orders · on-time 88%',  val: '$410K', ini: 'UL' },
    { name: 'Soylent Foods',      sub: '41 orders · on-time 96%',  val: '$320K', ini: 'SF' },
  ];

  poStatus = [
    { label: 'Draft',              count: 8,  pct: 8,   cls: '' },
    { label: 'Sent',               count: 21, pct: 22,  cls: '' },
    { label: 'Confirmed',          count: 42, pct: 44,  cls: 'v' },
    { label: 'Partially Received', count: 12, pct: 13,  cls: 'a' },
    { label: 'Closed',             count: 96, pct: 100, cls: 'g' },
  ];

  aging = [
    { cap: 'Current', pct: 90 }, { cap: '1–30', pct: 55 }, { cap: '31–60', pct: 35 },
    { cap: '61–90', pct: 20 }, { cap: '90+', pct: 12 },
  ];

  constructor(private router: Router) {}
  go(route: string): void { this.router.navigate([route]); }
}
