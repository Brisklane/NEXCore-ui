import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_REGISTRY, AppDefinition, InstalledAppsService, findApp } from '@nexcore/core';

/**
 * The app catalogue — install what this business needs, remove what it does not.
 *
 * Three sections, in the order a customer cares about: what they are running now, what
 * they could add today, and what is still being built. The last group is genuinely
 * different — nothing there can be clicked — so it sits at the bottom, visually quieter,
 * instead of being mixed in with things that actually work.
 */
@Component({
  selector: 'app-apps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apps.html',
  styleUrl: './apps.css',
})
export class Apps implements OnInit {
  private appsService = inject(InstalledAppsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly busy = this.appsService.busy;

  /** Set when the guard bounced someone off an app they have not installed. */
  blockedApp = signal<AppDefinition | null>(null);

  /** Confirmation state for a removal. */
  pendingRemoval = signal<AppDefinition | null>(null);
  notice = signal('');

  private readonly business = APP_REGISTRY.filter(a => !a.core);

  readonly installed = computed(() =>
    this.business.filter(a => a.status === 'available' && this.appsService.installed().includes(a.key)));

  readonly available = computed(() =>
    this.business.filter(a => a.status === 'available' && !this.appsService.installed().includes(a.key)));

  readonly comingSoon = this.business.filter(a => a.status === 'coming-soon');

  async ngOnInit(): Promise<void> {
    await this.appsService.load();

    const missing = this.route.snapshot.queryParamMap.get('missing');
    if (missing) this.blockedApp.set(findApp(missing) ?? null);
  }

  open(app: AppDefinition): void {
    if (app.home) this.router.navigateByUrl(app.home);
  }

  async add(app: AppDefinition): Promise<void> {
    this.notice.set('');
    await this.appsService.install(app.key);
    this.notice.set(`${app.name} added.`);
    if (this.blockedApp()?.key === app.key) this.blockedApp.set(null);
  }

  askRemove(app: AppDefinition): void {
    this.notice.set('');
    this.pendingRemoval.set(app);
  }

  cancelRemove(): void {
    this.pendingRemoval.set(null);
  }

  async confirmRemove(): Promise<void> {
    const app = this.pendingRemoval();
    if (!app) return;

    const result = await this.appsService.uninstall(app.key);
    if (!result.ok) return;

    this.pendingRemoval.set(null);
    this.notice.set(`${app.name} removed. Its data is untouched — add it back any time.`);
  }

}
