import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { SidebarClassic } from '../sidebar/sidebar-classic';
import { AiPanel } from '../ai-panel/ai-panel';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, Header, Sidebar, SidebarClassic, AiPanel],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit, OnDestroy {
  sidebarOpen = false;        // mobile drawer
  sidebarCollapsed = false;   // desktop icon-only rail
  aiOpen = false;

  /** 'rail' = two-tier icon rail (default) · 'classic' = single-column sidebar. */
  sidebarLayout: 'rail' | 'classic' = 'rail';

  private static readonly COLLAPSE_KEY = 'nexcore.sidebar.collapsed';
  static readonly LAYOUT_KEY = 'ui_sidebar_layout';

  private onLayoutChange = () => { this.sidebarLayout = this.readLayout(); };

  constructor() {
    try {
      this.sidebarCollapsed = localStorage.getItem(MainLayout.COLLAPSE_KEY) === '1';
    } catch { /* storage unavailable — default to expanded */ }
    this.sidebarLayout = this.readLayout();
  }

  ngOnInit(): void {
    // Live-update when the user changes the layout in Settings (same tab) or another tab.
    window.addEventListener('ui-sidebar-layout', this.onLayoutChange);
    window.addEventListener('storage', this.onLayoutChange);
  }
  ngOnDestroy(): void {
    window.removeEventListener('ui-sidebar-layout', this.onLayoutChange);
    window.removeEventListener('storage', this.onLayoutChange);
  }

  private readLayout(): 'rail' | 'classic' {
    try {
      return localStorage.getItem(MainLayout.LAYOUT_KEY) === 'classic' ? 'classic' : 'rail';
    } catch { return 'rail'; }
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }

  toggleCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    try {
      localStorage.setItem(MainLayout.COLLAPSE_KEY, this.sidebarCollapsed ? '1' : '0');
    } catch { /* ignore persistence failures */ }
  }

  toggleAi(): void { this.aiOpen = !this.aiOpen; }
  closeAi(): void { this.aiOpen = false; }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) this.sidebarOpen = false;
  }
}
