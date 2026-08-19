import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RouteService } from './distribution.services';
import { TerritoryDto } from '../models/distribution.models';

const TERRITORY_KEY = 'nexcore.distribution.territoryId';

/**
 * The scope every Distribution screen works in.
 *
 * A national sales director and a single-territory distributor are looking at the same screens;
 * the only difference is how much of the network they can see. Holding the choice here means it
 * survives navigation — moving from the dashboard to claims does not silently widen the scope
 * back to the whole company, which would be a quietly wrong number rather than an obvious error.
 *
 * The territory list is fetched once and cached, because it changes on the timescale of
 * reorganisations, not of page views.
 */
@Injectable({ providedIn: 'root' })
export class DistributionContextService {
  private routes = inject(RouteService);

  /** Flattened territory tree — every node, depth-stamped for indentation. */
  readonly territories = signal<TerritoryDto[]>([]);
  readonly territoryId = signal<string | null>(null);
  readonly loaded = signal(false);

  private inflight?: Promise<TerritoryDto[]>;

  /** Depth of each territory in the tree, keyed by id, for indenting the picker. */
  readonly depths = new Map<string, number>();

  async ensureLoaded(): Promise<TerritoryDto[]> {
    if (this.loaded()) return this.territories();
    this.inflight ??= this.fetch();
    return this.inflight;
  }

  private async fetch(): Promise<TerritoryDto[]> {
    const res = await firstValueFrom(this.routes.territoryTree()).catch(() => null);
    const flat: TerritoryDto[] = [];

    const walk = (nodes: TerritoryDto[], depth: number): void => {
      for (const node of nodes ?? []) {
        this.depths.set(node.id, depth);
        flat.push(node);
        walk(node.children ?? [], depth + 1);
      }
    };

    walk(res?.data ?? [], 0);

    this.territories.set(flat);
    this.loaded.set(true);

    // Restore the last scope, but only if it still exists — a territory can be merged away
    // while somebody's browser still remembers it.
    let stored: string | null = null;
    try { stored = localStorage.getItem(TERRITORY_KEY); } catch { /* ignore */ }
    if (stored && flat.some(t => t.id === stored)) this.territoryId.set(stored);

    return flat;
  }

  setTerritory(id: string | null): void {
    this.territoryId.set(id || null);
    try {
      if (id) localStorage.setItem(TERRITORY_KEY, id);
      else localStorage.removeItem(TERRITORY_KEY);
    } catch { /* ignore */ }
  }

  territoryName(id?: string | null): string {
    if (!id) return 'All territories';
    return this.territories().find(t => t.id === id)?.name ?? 'Territory';
  }

  /** Indent prefix for a picker option, so the hierarchy reads without a tree widget. */
  indent(id: string): string {
    return '  '.repeat(this.depths.get(id) ?? 0);
  }
}
