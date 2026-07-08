import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

/**
 * Inventory Dashboard — bento "command center" layout.
 * Data is representative/illustrative for now (wire to live services later).
 */
@Component({
  selector: 'lib-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inventory-dashboard.html',
  styleUrl: './inventory-dashboard.css',
})
export class InventoryDashboard {
  stats = [
    { label: 'Stock Value',  value: '$2.8M', icon: 'account_balance_wallet', color: 'c-brand',   delta: '+4%',  dir: 'up',   foot: 'vs last month' },
    { label: 'Total SKUs',   value: '1,842', icon: 'inventory_2',            color: 'c-cyan',    delta: '+23',  dir: 'up',   foot: 'active products' },
    { label: 'Low Stock',    value: '12',    icon: 'warning',                color: 'c-amber',   delta: '+4',   dir: 'down', foot: 'below reorder point' },
    { label: 'Out of Stock', value: '3',     icon: 'error',                  color: 'c-danger',  delta: '-1',   dir: 'up',   foot: 'need urgent restock' },
  ];

  movement = [
    { cap: 'W1', pct: 55 }, { cap: 'W2', pct: 68 }, { cap: 'W3', pct: 60 }, { cap: 'W4', pct: 80 },
    { cap: 'W5', pct: 72 }, { cap: 'W6', pct: 88 }, { cap: 'W7', pct: 79 }, { cap: 'W8', pct: 95 },
  ];

  categories = [
    { label: 'Electronics', count: 700, color: '#2b7fff', dash: '95.5 251.3',  off: '0' },
    { label: 'Apparel',     count: 442, color: '#22c7e6', dash: '60.3 251.3',  off: '-95.5' },
    { label: 'Home',        count: 331, color: '#7c3aed', dash: '45.2 251.3',  off: '-155.8' },
    { label: 'Grocery',     count: 221, color: '#16a34a', dash: '30.2 251.3',  off: '-201.0' },
    { label: 'Other',       count: 148, color: '#f59e0b', dash: '20.1 251.3',  off: '-231.2' },
  ];

  alerts = [
    { name: 'iPhone 15 Pro 256GB', wh: 'Main Warehouse · reorder @ 20', qty: '4',  av: 'av-danger' },
    { name: 'USB-C Cable 2m',      wh: 'Main Warehouse · reorder @ 100', qty: '0', av: 'av-danger' },
    { name: 'Samsung Galaxy A24',  wh: 'North DC · reorder @ 50',        qty: '18', av: 'av-amber' },
    { name: 'Office Chair Ergo',   wh: 'South DC · reorder @ 15',        qty: '6',  av: 'av-amber' },
    { name: 'Wireless Mouse',      wh: 'Main Warehouse · reorder @ 40',  qty: '12', av: 'av-amber' },
  ];

  constructor(private router: Router) {}
  go(route: string): void { this.router.navigate([route]); }
}
