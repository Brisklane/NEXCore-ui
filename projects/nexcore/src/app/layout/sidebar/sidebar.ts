import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';

import { SidebarChild, SidebarItem, SIDEBAR_MENU, expandToRoute } from './sidebar-menu';
import { InstalledAppsService } from '@nexcore/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnChanges, OnDestroy {
  @Input() collapsed = false;
  @Output() aiOpen = new EventEmitter<void>();
  @Output() collapseToggle = new EventEmitter<void>();

  menuItems: SidebarItem[] = [];
  /** Module whose page tree is shown in the context panel. */
  activeModuleLabel = '';
  /** Module that owns the current route (drives the rail highlight). */
  routeModuleLabel = '';
  activeParent = '';

  /** Collapsed-rail hover flyout: the module whose pages are popped out. */
  flyoutModule: SidebarItem | null = null;
  flyoutTop = 0;
  private flyoutTimer: any = null;

  private routerSub?: Subscription;

  private appsService = inject(InstalledAppsService);

  constructor(private router: Router) {}

  /** Hides an app the company has removed. Untagged entries are always shown. */
  private isVisible = (i: SidebarItem): boolean => !i.appKey || this.appsService.isInstalled(i.appKey);

  ngOnInit() {
    void this.appsService.load();
    this.getSidebarFromApi().subscribe((data) => {
      this.menuItems = data;
      this.syncFromRoute();
    });
    this.routerSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.syncFromRoute();
    });
  }

  ngOnDestroy(): void { this.routerSub?.unsubscribe(); clearTimeout(this.flyoutTimer); }
  ngOnChanges(changes: SimpleChanges): void {
    // Leaving collapsed mode closes any open hover flyout.
    if (changes['collapsed'] && !this.collapsed) this.flyoutModule = null;
  }

  // ── Collapsed-rail hover flyout ───────────────────────────────────────────
  openFlyout(item: SidebarItem, event: MouseEvent): void {
    if (!this.collapsed || window.innerWidth <= 768) return;
    if (!item.children?.length) return;
    clearTimeout(this.flyoutTimer);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.flyoutTop = Math.max(8, Math.min(rect.top, window.innerHeight - 380));
    this.flyoutModule = item;
  }
  keepFlyout(): void { clearTimeout(this.flyoutTimer); }
  scheduleCloseFlyout(): void {
    clearTimeout(this.flyoutTimer);
    this.flyoutTimer = setTimeout(() => (this.flyoutModule = null), 160);
  }

  // ── Rail groups (far-left icon strip) ─────────────────────────────────────
  get railTop(): SidebarItem[] { return this.menuItems.filter((i) => i.iconType === 'dashboard'); }
  /** Retained for older menu data; nothing is tagged 'module' any more. */
  get railModules(): SidebarItem[] {
    return this.menuItems.filter((i) => i.iconType === 'module' && this.isVisible(i))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  /** Every business app the company has installed. */
  get railApps(): SidebarItem[] {
    return this.menuItems.filter((i) => i.iconType === 'app' && this.isVisible(i))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  get railAdmin(): SidebarItem[] { return this.menuItems.filter((i) => i.iconType === 'admin'); }

  /** The module currently populating the context panel. */
  get activeModule(): SidebarItem | undefined {
    return this.menuItems.find((i) => i.label === this.activeModuleLabel && !!i.children?.length);
  }

  isRailActive(item: SidebarItem): boolean {
    return this.routeModuleLabel === item.label || this.activeModuleLabel === item.label;
  }

  /** Rail click: a module opens its panel + jumps to its first page; a plain link just navigates. */
  selectModule(item: SidebarItem): void {
    if (item.children?.length) {
      this.activeModuleLabel = item.label;
      const first = this.firstLeafRoute(item.children);
      if (first) this.router.navigateByUrl(first);
    } else if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

  private firstLeafRoute(nodes?: SidebarChild[]): string | null {
    if (!nodes) return null;
    for (const n of nodes) {
      if (n.route) return n.route;
      const r = this.firstLeafRoute(n.children);
      if (r) return r;
    }
    return null;
  }

  /** Keep the rail highlight + panel in sync with the URL, and auto-open the active group. */
  private syncFromRoute(): void {
    const url = this.router.url;
    const owner = this.menuItems.find(
      (i) => (!!i.route && (url === i.route || url.startsWith(i.route + '/'))) || this.containsRoute(i.children, url),
    );
    this.routeModuleLabel = owner?.label ?? '';
    if (owner?.children?.length) {
      this.activeModuleLabel = owner.label;
      expandToRoute(owner.children, url);
    } else if (!this.activeModuleLabel) {
      this.activeModuleLabel = (this.railModules[0] ?? this.railApps[0])?.label ?? '';
    }
  }

  private containsRoute(nodes: SidebarChild[] | undefined, url: string): boolean {
    if (!nodes) return false;
    return nodes.some(
      (n) => (!!n.route && (url === n.route || url.startsWith(n.route + '/'))) || this.containsRoute(n.children, url),
    );
  }

  getSidebarFromApi(): Observable<SidebarItem[]> {
    return of(SIDEBAR_MENU);
  }

  toggleMenu(item: SidebarItem): void {
    const accordionModules = [
      'Human Resource',
      'CRM',
      'Sales',
      'Inventory',
      'Accounting',
      'Procurement',
      'Manufacturing',
    ];

    if (accordionModules.includes(item.label)) {
      this.menuItems.forEach((i) => {
        if (i !== item && accordionModules.includes(i.label)) {
          i.expanded = false;
          i.children?.forEach((child) => this.closeAllNested(child));
        }
      });
    }

    item.expanded = !item.expanded;

    if (!item.expanded) {
      item.children?.forEach((child) => this.closeAllNested(child));
    }
  }

  closeAllNested(child: SidebarChild): void {
    child.expanded = false;
    child.children?.forEach((c) => this.closeAllNested(c));
  }

  toggleChild(child: SidebarChild, event: Event, siblings?: SidebarChild[]): void {
    event.stopPropagation();

    if (!child.children?.length) return;

    if (siblings) {
      siblings.forEach((sibling) => {
        if (sibling !== child) {
          this.closeAllNested(sibling);
        }
      });
    }

    child.expanded = !child.expanded;

    if (!child.expanded) {
      child.children.forEach((c) => this.closeAllNested(c));
    }
  }

  hasNestedChildren(child: SidebarChild): boolean {
    return !!child.children && child.children.length > 0;
  }

  setActiveParent(label: string): void {
    this.activeParent = this.activeParent === label ? '' : label;
  }
}
