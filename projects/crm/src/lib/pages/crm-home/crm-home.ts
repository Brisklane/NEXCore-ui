import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * CRM Dashboard — bento "command center" layout.
 * Data is representative/illustrative for now (wire to live services later).
 */
@Component({
  selector: 'crm-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-home.html',
  styleUrl: './crm-home.css',
})
export class CrmHomeComponent {
  userName = 'there';
  today = new Date();

  stats = [
    { label: 'New Leads',    value: '148',   icon: 'person_add',   color: 'c-brand',   delta: '+12%', dir: 'up',   foot: 'this month' },
    { label: 'Open Deals',   value: '37',    icon: 'trending_up',  color: 'c-violet',  delta: '+5%',  dir: 'up',   foot: '$1.24M pipeline' },
    { label: 'Revenue MTD',  value: '$284K', icon: 'payments',     color: 'c-success', delta: '+18%', dir: 'up',   foot: 'vs last month' },
    { label: 'Open Cases',   value: '9',     icon: 'support_agent',color: 'c-amber',   delta: '-3',   dir: 'down', foot: '2 high priority' },
  ];

  pipeline = [
    { stage: 'Qualify',          count: 14, pct: 100, cls: '' },
    { stage: 'Meet & Present',   count: 9,  pct: 68,  cls: 'v' },
    { stage: 'Proposal',         count: 7,  pct: 52,  cls: 'a' },
    { stage: 'Negotiation',      count: 4,  pct: 34,  cls: 'a' },
    { stage: 'Closed Won',       count: 6,  pct: 44,  cls: 'g' },
  ];

  performers = [
    { name: 'Sarah Malik',   sub: '11 deals · $412K', val: '92%', ini: 'SM' },
    { name: 'David Chen',    sub: '9 deals · $318K',  val: '84%', ini: 'DC' },
    { name: 'Aisha Khan',   sub: '7 deals · $265K',  val: '77%', ini: 'AK' },
    { name: 'Marco Rossi',   sub: '6 deals · $198K',  val: '71%', ini: 'MR' },
  ];

  sources = [
    { label: 'Website',   count: 62, pct: 42, color: 'var(--kpi-1, #2b7fff)', dash: '105.6 251.3', off: '0' },
    { label: 'Referral',  count: 38, pct: 26, color: 'var(--kpi-3, #7c3aed)', dash: '65.3 251.3',  off: '-105.6' },
    { label: 'Campaign',  count: 28, pct: 19, color: 'var(--kpi-2, #22c7e6)', dash: '47.7 251.3',  off: '-170.9' },
    { label: 'Cold Call', count: 20, pct: 13, color: 'var(--kpi-4, #f59e0b)', dash: '32.7 251.3',  off: '-218.6' },
  ];

  activity = [
    { text: '<strong>Sarah</strong> closed <strong>Acme Corp</strong> — $84,000', time: '18 minutes ago', dot: 'g' },
    { text: 'New lead <strong>Nimbus Retail</strong> from website', time: '1 hour ago', dot: '' },
    { text: '<strong>David</strong> logged a call with <strong>Orbit Ltd</strong>', time: '2 hours ago', dot: 'v' },
    { text: 'Case <strong>#4821</strong> escalated to high priority', time: '3 hours ago', dot: 'a' },
    { text: 'Proposal sent to <strong>Vertex Group</strong>', time: 'Yesterday', dot: '' },
  ];

  constructor(private router: Router) {}

  navigate(route: string): void { this.router.navigate([route]); }
}
