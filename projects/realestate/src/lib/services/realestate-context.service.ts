import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminService, ProjectService, ReportService } from './realestate.services';
import type * as M from '../models/realestate.models';

/**
 * The two pieces of state every Real Estate screen needs before it can draw anything: which lines
 * of business this company runs, and which project or office the user is working in.
 *
 * The lines of business matter more than they look. A letting agency and a plot developer install
 * the same application, and if both are shown the same menu, both conclude it was built for
 * somebody else. So the sidebar, the dashboard and the report catalogue are all filtered by these
 * four flags, and the flags are fetched once and cached for the session.
 *
 * The chosen project lives in local storage rather than the URL, because a sales executive who
 * bookmarks the inventory board should land on *their* scheme, not the first one alphabetically.
 */
@Injectable({ providedIn: 'root' })
export class RealEstateContextService {
  private static readonly PROJECT_KEY = 'nexcore.realestate.project';
  private static readonly OFFICE_KEY = 'nexcore.realestate.office';

  private admin = inject(AdminService);
  private projects = inject(ProjectService);
  private reports = inject(ReportService);

  readonly projectId = signal<string | null>(this.read(RealEstateContextService.PROJECT_KEY));
  readonly officeId = signal<string | null>(this.read(RealEstateContextService.OFFICE_KEY));

  readonly projectList = signal<M.LookupDto[]>([]);
  readonly officeList = signal<M.RealEstateOfficeDto[]>([]);
  readonly lines = signal<M.LinesOfBusinessDto | null>(null);
  readonly settings = signal<M.RealEstateSettingsDto | null>(null);

  readonly loaded = signal(false);
  readonly loadError = signal<string | null>(null);

  /** What the sidebar and the dashboard switch on. Defaults to development until told otherwise. */
  readonly brokerage = computed(() => this.lines()?.brokerage ?? false);
  readonly development = computed(() => this.lines()?.development ?? true);
  readonly contracting = computed(() => this.lines()?.contracting ?? false);
  readonly estateManagement = computed(() => this.lines()?.estateManagement ?? false);

  readonly currency = computed(() => this.settings()?.currencyCode ?? 'USD');
  readonly areaUnit = computed(() => this.settings()?.displayAreaUnit);

  readonly projectName = computed(() => {
    const id = this.projectId();
    return id ? (this.projectList().find(p => p.id === id)?.label ?? null) : null;
  });

  private read(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  private write(key: string, value: string | null): void {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      // A blocked or full storage quota must not stop the app working.
    }
  }

  setProject(id: string | null): void {
    this.projectId.set(id);
    this.write(RealEstateContextService.PROJECT_KEY, id);
  }

  setOffice(id: string | null): void {
    this.officeId.set(id);
    this.write(RealEstateContextService.OFFICE_KEY, id);
  }

  /**
   * Loads the settings, lines of business, projects and offices once.
   *
   * Everything is fetched in parallel and every failure is tolerated: a company that has just
   * installed the app has no projects yet, and landing them on an error screen rather than an
   * empty one would be an odd first impression.
   */
  async ensureLoaded(force = false): Promise<void> {
    if (this.loaded() && !force) return;

    this.loadError.set(null);

    const [lines, settings, projects, offices] = await Promise.all([
      firstValueFrom(this.admin.getLinesOfBusiness()).catch(() => null),
      firstValueFrom(this.admin.getSettings()).catch(() => null),
      firstValueFrom(this.projects.lookup()).catch(() => null),
      firstValueFrom(this.admin.getOffices({ pageSize: 200 })).catch(() => null),
    ]);

    if (lines?.data) this.lines.set(lines.data);
    if (settings?.data) this.settings.set(settings.data);

    const projectList = projects?.data ?? [];
    this.projectList.set(projectList);

    const officeList = offices?.data ?? [];
    this.officeList.set(officeList);

    // A remembered project that has since been closed or deleted would leave every screen
    // silently empty, so the selection falls back to the first available one.
    const project = this.projectId();
    if (projectList.length > 0 && (!project || !projectList.some(p => p.id === project))) {
      this.setProject(projectList[0].id);
    } else if (projectList.length === 0) {
      this.setProject(null);
    }

    const office = this.officeId();
    if (officeList.length > 0 && (!office || !officeList.some(o => o.id === office))) {
      this.setOffice(officeList[0].id);
    }

    if (!lines && !settings) {
      this.loadError.set('Could not reach the Real Estate service. Some screens may be empty.');
    }

    this.loaded.set(true);
  }

  /** Re-reads the project list — after creating one, so the picker shows it immediately. */
  async refreshProjects(): Promise<void> {
    const res = await firstValueFrom(this.projects.lookup()).catch(() => null);
    if (res?.data) this.projectList.set(res.data);
  }

  /** The attention list, shared by the dashboard and the header bell so both agree. */
  async attention(): Promise<M.AttentionItemDto[]> {
    const res = await firstValueFrom(
      this.reports.getAttention(this.officeId() ?? undefined, this.projectId() ?? undefined),
    ).catch(() => null);

    return res?.data ?? [];
  }
}
