import { Component, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarChild, SidebarItem, SIDEBAR_MENU, expandToRoute } from './sidebar-menu';

/**
 * Classic single-column sidebar (alternative to the two-tier icon rail).
 * Full-width menu: brand + top links + modules (icon · name · subtitle · chevron,
 * accordion-expanding to their page tree) + an admin section. Theme-aware via tokens.
 * Selected via Administration › Settings › Appearance › Sidebar Layout.
 */
@Component({
  selector: 'app-sidebar-classic',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-classic.html',
  styleUrl: './sidebar-classic.css',
})
export class SidebarClassic implements OnInit, OnDestroy {
  @Output() aiOpen = new EventEmitter<void>();

  menuItems: SidebarItem[] = SIDEBAR_MENU;
  private routerSub?: Subscription;

  /** One-line description shown under each module name. */
  private readonly descriptions: Record<string, string> = {
    'Human Resource': 'Human Resources',
    'CRM': 'Customer Relationship',
    'Sales': 'Sales Management',
    'Inventory': 'Inventory Management',
    'Accounting': 'Financial Management',
    'Manufacturing': 'Production & MRP',
    'Procurement': 'Purchase Management',
    'Point Of Sale': 'Point of Sale',
  };

  // ── Resizing ────────────────────────────────────────────────────────────────
  // Menus nest four deep here (App › Back Office › Products & Pricing › Price Lists),
  // and each level indents, so a fixed width truncates the labels that identify where
  // you are. Letting the user set the width is a better fix than shortening the names.

  private static readonly WIDTH_KEY = 'sidebar_width';
  private static readonly MIN_WIDTH = 220;
  private static readonly MAX_WIDTH = 460;
  private static readonly DEFAULT_WIDTH = 264;

  width = SidebarClassic.DEFAULT_WIDTH;
  resizing = false;
  private stopResize?: () => void;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const stored = Number(localStorage.getItem(SidebarClassic.WIDTH_KEY));
    if (Number.isFinite(stored) && stored > 0) this.width = this.clampWidth(stored);

    this.syncFromRoute();
    this.routerSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.syncFromRoute();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    // A drag in progress when the component dies would otherwise leave document-level
    // listeners and the text-selection lock behind.
    this.stopResize?.();
  }

  private clampWidth(px: number): number {
    return Math.min(SidebarClassic.MAX_WIDTH, Math.max(SidebarClassic.MIN_WIDTH, Math.round(px)));
  }

  beginResize(event: PointerEvent): void {
    event.preventDefault();
    this.resizing = true;

    const startX = event.clientX;
    const startWidth = this.width;

    const onMove = (e: PointerEvent) => { this.width = this.clampWidth(startWidth + (e.clientX - startX)); };
    const onUp = () => {
      this.stopResize?.();
      localStorage.setItem(SidebarClassic.WIDTH_KEY, String(this.width));
    };

    this.stopResize = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      this.resizing = false;
      this.stopResize = undefined;
    };

    // Without these the drag selects sidebar text and the cursor flickers over children.
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  /** Double-click the handle to go back to the default width. */
  resetWidth(): void {
    this.width = SidebarClassic.DEFAULT_WIDTH;
    localStorage.setItem(SidebarClassic.WIDTH_KEY, String(this.width));
  }

  // ── Groups (same partitioning as the rail) ──────────────────────────────────
  get topItems(): SidebarItem[] { return this.menuItems.filter((i) => i.iconType === 'dashboard'); }
  /** Core business modules. */
  get modules(): SidebarItem[] {
    return this.menuItems.filter((i) => i.iconType === 'module').sort((a, b) => a.label.localeCompare(b.label));
  }
  /** Apps built on top of the core modules (POS today; more later). */
  get apps(): SidebarItem[] {
    return this.menuItems.filter((i) => i.iconType === 'app').sort((a, b) => a.label.localeCompare(b.label));
  }
  get adminItems(): SidebarItem[] { return this.menuItems.filter((i) => i.iconType === 'admin'); }

  descFor(label: string): string { return this.descriptions[label] ?? ''; }

  /** Module row: accordion-toggle its page tree; a childless module just navigates. */
  onModuleClick(item: SidebarItem): void {
    if (item.children?.length) {
      const willOpen = !item.expanded;
      this.modules.forEach((m) => { if (m !== item) { m.expanded = false; m.children?.forEach((c) => this.closeAllNested(c)); } });
      item.expanded = willOpen;
      if (!willOpen) item.children?.forEach((c) => this.closeAllNested(c));
    } else if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

  toggleChild(child: SidebarChild, event: Event, siblings?: SidebarChild[]): void {
    event.stopPropagation();
    if (!child.children?.length) return;
    if (siblings) siblings.forEach((s) => { if (s !== child) this.closeAllNested(s); });
    child.expanded = !child.expanded;
    if (!child.expanded) child.children.forEach((c) => this.closeAllNested(c));
  }

  private closeAllNested(child: SidebarChild): void {
    child.expanded = false;
    child.children?.forEach((c) => this.closeAllNested(c));
  }

  hasNestedChildren(child: SidebarChild): boolean { return !!child.children && child.children.length > 0; }

  /** True when the current URL belongs to this module (drives the module-head highlight). */
  isModuleActive(item: SidebarItem): boolean {
    const url = this.router.url;
    return (!!item.route && (url === item.route || url.startsWith(item.route + '/'))) || this.containsRoute(item.children, url);
  }

  /** Auto-expand the module (and the group) that owns the current route. */
  private syncFromRoute(): void {
    const url = this.router.url;
    for (const m of this.menuItems) {
      if (m.iconType === 'admin') continue;
      const owns = this.containsRoute(m.children, url);
      if (owns) {
        m.expanded = true;
        expandToRoute(m.children, url);
      }
    }
  }

  private containsRoute(nodes: SidebarChild[] | undefined, url: string): boolean {
    if (!nodes) return false;
    return nodes.some(
      (n) => (!!n.route && (url === n.route || url.startsWith(n.route + '/'))) || this.containsRoute(n.children, url),
    );
  }
}
