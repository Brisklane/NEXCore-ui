import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UsageStat {
  label: string;
  used: number;
  limit: number;
  unit: string;
  icon: string;
  accent: string;
}

interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  features: string[];
  current: boolean;
  highlight: boolean;
}

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

@Component({
  standalone: true,
  selector: 'app-admin-subscription-details',
  imports: [CommonModule],
  templateUrl: './subscription-details.html',
  styleUrls: ['./subscription-details.css'],
})
export class SubscriptionDetails {
  /** All figures on this page are placeholder data — billing isn't wired to a real provider yet. */
  currentPlan = {
    name: 'Professional',
    status: 'Active',
    price: '$79',
    cadence: '/ month, billed monthly',
    renewsOn: 'August 1, 2026',
    seatsIncluded: 25,
  };

  usage: UsageStat[] = [
    { label: 'Users', used: 12, limit: 25, unit: 'seats', icon: 'group', accent: 'var(--kpi-1)' },
    { label: 'Branches', used: 3, limit: 5, unit: 'branches', icon: 'storefront', accent: 'var(--kpi-2)' },
    { label: 'Storage', used: 4.2, limit: 20, unit: 'GB', icon: 'database', accent: 'var(--kpi-3)' },
    { label: 'API calls', used: 12400, limit: 50000, unit: 'this month', icon: 'data_object', accent: 'var(--kpi-4)' },
  ];

  plans: PlanTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'For small teams getting started',
      price: '$29',
      cadence: '/ month',
      features: ['Up to 5 users', '1 branch', '2 GB storage', 'Email support'],
      current: false,
      highlight: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      tagline: 'For growing businesses',
      price: '$79',
      cadence: '/ month',
      features: ['Up to 25 users', '5 branches', '20 GB storage', 'Priority support', 'Advanced reporting'],
      current: true,
      highlight: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'For large, multi-branch operations',
      price: 'Custom',
      cadence: 'contact sales',
      features: ['Unlimited users', 'Unlimited branches', '200 GB storage', 'Dedicated support', 'SSO & audit logs'],
      current: false,
      highlight: false,
    },
  ];

  paymentMethod = {
    brand: 'Visa',
    last4: '4242',
    expiry: '09/27',
  };

  invoices: Invoice[] = [
    { id: 'INV-2026-0007', date: 'Jul 1, 2026', description: 'Professional plan — monthly', amount: '$79.00', status: 'Paid' },
    { id: 'INV-2026-0006', date: 'Jun 1, 2026', description: 'Professional plan — monthly', amount: '$79.00', status: 'Paid' },
    { id: 'INV-2026-0005', date: 'May 1, 2026', description: 'Professional plan — monthly', amount: '$79.00', status: 'Paid' },
    { id: 'INV-2026-0004', date: 'Apr 1, 2026', description: 'Starter plan — monthly', amount: '$29.00', status: 'Paid' },
  ];

  usagePercent(stat: UsageStat): number {
    return Math.min(100, Math.round((stat.used / stat.limit) * 100));
  }
}
