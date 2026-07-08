import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AppCard {
  name: string;          // display name (e.g. "Restaurant")
  brand: string;         // product brand (e.g. "NexaDine")
  description: string;
  icon: string;          // material symbol name
  accent: string;        // tile gradient (CSS)
  available: boolean;    // false → "Coming soon" placeholder
  route?: string;        // set once the real app exists
}

@Component({
  selector: 'app-apps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apps.html',
  styleUrl: './apps.css',
})
export class Apps {
  /**
   * Demo catalogue. When a real app is built, set `available: true` and add its
   * `route` (or wire `onExplore` to navigate) — the card lights up automatically.
   */
  apps: AppCard[] = [
    {
      name: 'Restaurant',
      brand: 'NexaDine',
      description: 'Table & floor management',
      icon: 'restaurant',
      accent: 'linear-gradient(135deg, #fb7185, #ef4444)',
      available: false,
    },
    {
      name: 'Point of Sale',
      brand: 'NexaPoint',
      description: 'Retail & quick checkout',
      icon: 'desktop_windows',
      accent: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
      available: false,
    },
    {
      name: 'Real Estate',
      brand: 'NexaProp',
      description: 'Listings & client matching',
      icon: 'home',
      accent: 'linear-gradient(135deg, #60a5fa, #2563eb)',
      available: false,
    },
    {
      name: 'Healthcare',
      brand: 'NexaCare',
      description: 'Records, scheduling, billing',
      icon: 'favorite',
      accent: 'linear-gradient(135deg, #34d399, #10b981)',
      available: false,
    },
    {
      name: 'Retail',
      brand: 'NexaShop',
      description: 'E-commerce & store management',
      icon: 'shopping_bag',
      accent: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
      available: false,
    },
  ];

  onExplore(app: AppCard): void {
    // Real apps aren't wired yet — navigation will be added per app later.
    if (!app.available) return;
  }
}
