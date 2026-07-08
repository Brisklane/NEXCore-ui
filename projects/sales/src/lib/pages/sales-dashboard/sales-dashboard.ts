import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Sales Dashboard — bento "command center" layout (core Sales module, not POS).
 * Data is hardcoded/illustrative for now (wire to live services later).
 */
@Component({
  selector: 'lib-sales-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-dashboard.html',
  styleUrl: './sales-dashboard.css',
})
export class SalesDashboardPage {
  stats = [
    { label: 'Orders (MTD)',    value: '128',   icon: 'shopping_cart', color: 'c-brand',   delta: '+9%',  dir: 'up',   foot: 'this month' },
    { label: 'Revenue (MTD)',   value: '$486K', icon: 'payments',      color: 'c-success', delta: '+14%', dir: 'up',   foot: 'vs last month' },
    { label: 'Avg Order Value', value: '$1,240',icon: 'sell',          color: 'c-cyan',    delta: '+3%',  dir: 'up',   foot: 'per order' },
    { label: 'Pending Delivery',value: '12',    icon: 'local_shipping',color: 'c-amber',   delta: '+2',   dir: 'down', foot: 'awaiting dispatch' },
  ];

  trendX = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  channels = [
    { label: 'Online',    count: '$214K', color: '#2b7fff', dash: '110.6 251.3', off: '0' },
    { label: 'Retail',    count: '$136K', color: '#22c7e6', dash: '70.4 251.3',  off: '-110.6' },
    { label: 'Wholesale', count: '$78K',  color: '#7c3aed', dash: '40.2 251.3',  off: '-181.0' },
    { label: 'POS',       count: '$58K',  color: '#f59e0b', dash: '30.2 251.3',  off: '-221.2' },
  ];

  products = [
    { name: 'Wireless Earbuds Pro', sub: '412 sold', val: '$61K', ini: 'WE' },
    { name: 'Smart Watch S9',       sub: '286 sold', val: '$48K', ini: 'SW' },
    { name: 'Laptop Stand Alu',     sub: '531 sold', val: '$32K', ini: 'LS' },
    { name: '4K Action Camera',     sub: '148 sold', val: '$29K', ini: 'AC' },
    { name: 'USB-C Hub 7-in-1',     sub: '624 sold', val: '$21K', ini: 'UH' },
  ];

  orderStatus = [
    { label: 'Draft',     count: 6,  pct: 12,  cls: '' },
    { label: 'Confirmed', count: 34, pct: 66,  cls: '' },
    { label: 'Packed',    count: 18, pct: 35,  cls: 'v' },
    { label: 'Shipped',   count: 12, pct: 23,  cls: 'a' },
    { label: 'Delivered', count: 58, pct: 100, cls: 'g' },
  ];

  feed = [
    { text: 'Order <strong>SO-4821</strong> delivered to <strong>Nimbus Retail</strong>', time: '9 min ago', dot: 'g' },
    { text: 'New order <strong>SO-4830</strong> — $3,480', time: '35 min ago', dot: '' },
    { text: 'Payment received for <strong>SO-4812</strong>', time: '1 hour ago', dot: 'g' },
    { text: '<strong>SO-4805</strong> shipment dispatched', time: '2 hours ago', dot: 'v' },
    { text: 'Quotation <strong>Q-1189</strong> accepted', time: 'Yesterday', dot: '' },
  ];

  constructor(private router: Router) {}
  go(route: string): void { this.router.navigate([route]); }
}
