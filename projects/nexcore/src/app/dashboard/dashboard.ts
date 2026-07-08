import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@nexcore/core';

interface Kpi {
  label: string;
  value: string;
  delta: number;        // % change
  accent: string;       // css var name
  spark: number[];      // sparkline points
  icon: string;         // svg path id
}

interface ModuleCard {
  label: string;
  desc: string;
  route: string;
  image: string;
  active: number;
  accent: string;
}

interface Activity {
  title: string;
  meta: string;
  time: string;
  tone: string;
}

interface Task {
  text: string;
  done: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

interface Industry {
  name: string;
  tag: string;
  desc: string;
  icon: string;
  accent: string;
}

interface Invoice {
  id: string;
  client: string;
  amount: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface QuickAction {
  label: string;
  icon: string;
  accent: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly today = new Date();
  readonly userName = signal<string>('there');

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  });

  readonly kpis: Kpi[] = [
    { label: 'Total Revenue', value: '$248,620', delta: 12.5, accent: 'var(--kpi-1)', icon: 'revenue', spark: [12, 18, 14, 22, 19, 26, 24, 31] },
    { label: 'Total Orders',  value: '1,428',    delta: 8.3,  accent: 'var(--kpi-2)', icon: 'orders',  spark: [8, 10, 9, 13, 12, 15, 17, 18] },
    { label: 'Customers',     value: '856',      delta: 5.7,  accent: 'var(--kpi-3)', icon: 'users',   spark: [4, 6, 7, 7, 9, 10, 11, 13] },
    { label: 'Outstanding',   value: '$32,620',  delta: -3.2, accent: 'var(--kpi-4)', icon: 'invoice', spark: [20, 18, 19, 16, 17, 14, 15, 13] },
  ];

  readonly modules: ModuleCard[] = [
    { label: 'HR',            desc: 'Manage your workforce & HR processes', route: '/hr',            image: 'images/hr.svg',            active: 12, accent: 'var(--kpi-1)' },
    { label: 'CRM',           desc: 'Build relationships & grow pipeline',  route: '/crm',           image: 'images/crm.svg',           active: 8,  accent: 'var(--kpi-2)' },
    { label: 'Sales',         desc: 'Sales orders & customer management',   route: '/sales',         image: 'images/sales.svg',         active: 24, accent: 'var(--kpi-3)' },
    { label: 'Accounting',    desc: 'Track finances & manage accounting',   route: '/accounting',    image: 'images/accounts.svg',      active: 17, accent: 'var(--kpi-4)' },
    { label: 'Manufacturing', desc: 'Plan, produce & manage operations',    route: '/manufacturing', image: 'images/manufacturing.svg', active: 6,  accent: 'var(--kpi-5)' },
    { label: 'Procurement',   desc: 'Manage purchases & suppliers',         route: '/procurement',   image: 'images/procurement.svg',   active: 9,  accent: 'var(--kpi-6)' },
  ];

  /** Revenue series for the chart (this year, monthly). */
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly revenue = [28, 34, 30, 42, 38, 48, 44, 52, 49, 58, 55, 64];
  readonly expenses = [20, 24, 22, 28, 26, 30, 29, 33, 31, 36, 34, 38];

  readonly activities: Activity[] = [
    { title: 'New sales order #SO-1042 created', meta: 'Sales · Sarah Lee', time: '11 min ago', tone: 'var(--kpi-3)' },
    { title: 'Invoice INV-2025-105 was paid',    meta: 'Accounting',        time: '1 hr ago',   tone: 'var(--kpi-5)' },
    { title: 'New employee Priya onboarded',     meta: 'HR · Recruitment',  time: '3 hrs ago',  tone: 'var(--kpi-1)' },
    { title: 'Purchase order #PO-204 approved',  meta: 'Procurement',       time: 'Yesterday',  tone: 'var(--kpi-4)' },
    { title: 'Low stock alert: 5 items',         meta: 'Inventory',         time: 'Yesterday',  tone: 'var(--kpi-6)' },
  ];

  readonly tasks: Task[] = [
    { text: 'Review purchase orders', done: false, priority: 'High' },
    { text: 'Approve invoice #INV-2024-105', done: false, priority: 'High' },
    { text: 'Follow up with new leads', done: false, priority: 'Medium' },
    { text: 'Run monthly payroll', done: true, priority: 'Low' },
  ];

  readonly recentInvoices: Invoice[] = [
    { id: 'INV-2025-108', client: 'Acme Corp',      amount: '$12,400', dueDate: 'Jun 30, 2025', status: 'Overdue'  },
    { id: 'INV-2025-107', client: 'BrightTech Ltd', amount: '$8,750',  dueDate: 'Jul 05, 2025', status: 'Pending'  },
    { id: 'INV-2025-106', client: 'GlobalMart',     amount: '$3,200',  dueDate: 'Jul 01, 2025', status: 'Paid'     },
    { id: 'INV-2025-105', client: 'Sunrise Co.',    amount: '$5,620',  dueDate: 'Jun 28, 2025', status: 'Paid'     },
    { id: 'INV-2025-104', client: 'Metro Finance',  amount: '$18,000', dueDate: 'Jul 10, 2025', status: 'Pending'  },
  ];

  readonly quickActions: QuickAction[] = [
    { label: 'New Invoice',   icon: 'receipt_long',   accent: 'var(--kpi-1)', route: '/accounting' },
    { label: 'Sales Order',   icon: 'shopping_cart',  accent: 'var(--kpi-3)', route: '/sales'      },
    { label: 'Add Employee',  icon: 'person_add',     accent: 'var(--kpi-5)', route: '/hr'         },
    { label: 'Purchase',      icon: 'inventory_2',    accent: 'var(--kpi-4)', route: '/procurement' },
    { label: 'New Report',    icon: 'bar_chart',      accent: 'var(--kpi-6)', route: '/accounting' },
    { label: 'Add Lead',      icon: 'person_search',  accent: 'var(--kpi-2)', route: '/crm'        },
  ];

  readonly industries: Industry[] = [
    { name: 'Restaurant',  tag: 'NexaDine',  desc: 'Table & floor management', icon: 'restaurant', accent: 'var(--kpi-6)' },
    { name: 'Point of Sale', tag: 'NexaPoint', desc: 'Retail & quick checkout',  icon: 'pos',        accent: 'var(--kpi-2)' },
    { name: 'Real Estate', tag: 'NexaProp',  desc: 'Listings & client matching', icon: 'realestate', accent: 'var(--kpi-1)' },
    { name: 'Healthcare',  tag: 'NexaCare',  desc: 'Records, scheduling, billing', icon: 'health',  accent: 'var(--kpi-5)' },
    { name: 'Retail',      tag: 'NexaShop',  desc: 'E-commerce & store management', icon: 'retail', accent: 'var(--kpi-3)' },
  ];

  constructor(authService: AuthService) {
    const user = authService.getUser();
    const name = user?.fullName?.split(' ')[0];
    if (name) this.userName.set(name);
  }

  /** Build an SVG polyline points string scaled to a w×h box. */
  sparkPoints(data: number[], w = 64, h = 24): string {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((d - min) / range) * h;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  /** Build a smooth area path for the main revenue chart. */
  linePath(data: number[], w: number, h: number): string {
    const max = Math.max(...data) * 1.15;
    const step = w / (data.length - 1);
    return data
      .map((d, i) => {
        const x = i * step;
        const y = h - (d / max) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  areaPath(data: number[], w: number, h: number): string {
    return `${this.linePath(data, w, h)} L${w},${h} L0,${h} Z`;
  }

  toggleTask(t: Task): void {
    t.done = !t.done;
  }
}
