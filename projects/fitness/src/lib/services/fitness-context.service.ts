import { Injectable, inject, signal } from '@angular/core';
import { ClubService } from './fitness.services';
import * as M from '../models/fitness.models';

/**
 * Which club the user is working in, remembered between visits.
 *
 * Every screen in this app is scoped to one club, so this is the one piece of state that has to
 * survive a page reload. It lives in local storage rather than the URL because a receptionist
 * bookmarking the front desk should land on *their* front desk, not the first club in the list.
 */
@Injectable({ providedIn: 'root' })
export class FitnessContextService {
  private static readonly KEY = 'nexcore.fitness.club';
  private clubs = inject(ClubService);

  readonly clubId = signal<string | null>(this.read());
  readonly clubs$ = signal<M.ClubDto[]>([]);
  readonly loaded = signal(false);

  /** True while the app is standing itself up for the first time. */
  readonly provisioning = signal(false);

  private read(): string | null {
    try { return localStorage.getItem(FitnessContextService.KEY); } catch { return null; }
  }

  setClub(id: string | null): void {
    this.clubId.set(id);
    try {
      if (id) localStorage.setItem(FitnessContextService.KEY, id);
      else localStorage.removeItem(FitnessContextService.KEY);
    } catch {
      // A blocked or full storage quota must not stop the app working.
    }
  }

  /**
   * Loads the club list once, and picks a sensible default if none is chosen yet.
   *
   * If the company has no club at all, the Fitness app has never been provisioned here — which
   * happens whenever it is installed onto a business that already existed. Rather than dropping
   * the user on a screen where every button silently fails, we stand the essentials up and carry
   * on. Sample data is never added this way; that is a choice made at registration.
   */
  async ensureLoaded(force = false): Promise<M.ClubDto[]> {
    if (this.loaded() && !force) return this.clubs$();

    let list = await this.fetch();

    if (list.length === 0) {
      this.provisioning.set(true);
      const provisioned = await new Promise<M.ApiResponse<M.ClubDto[]> | null>(resolve => {
        this.clubs.provision(false).subscribe({
          next: r => resolve(r),
          error: () => resolve(null),
        });
      });
      this.provisioning.set(false);

      list = provisioned?.data ?? await this.fetch();
    }

    this.clubs$.set(list);
    this.clubs.clubs.set(list);
    this.loaded.set(true);

    const current = this.clubId();
    if (!current || !list.some(c => c.id === current)) this.setClub(list[0]?.id ?? null);
    this.clubs.selectedClubId.set(this.clubId());

    return list;
  }

  private async fetch(): Promise<M.ClubDto[]> {
    const res = await new Promise<M.ApiResponse<M.ClubDto[]> | null>(resolve => {
      this.clubs.getAll(true).subscribe({
        next: r => resolve(r),
        error: () => resolve(null),
      });
    });

    return res?.data ?? [];
  }

  get current(): M.ClubDto | undefined {
    const id = this.clubId();
    return this.clubs$().find(c => c.id === id);
  }

  /** The currency the selected club trades in, for money formatting. */
  get currency(): string {
    return this.current?.currencyCode ?? 'USD';
  }
}
