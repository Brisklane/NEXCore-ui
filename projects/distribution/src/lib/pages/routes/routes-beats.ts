import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FieldService, RouteService } from '../../services/distribution.services';
import {
  FieldRepDto, OutletDto, RouteDto, RouteStopDto, SaveRouteDto, TerritoryDto,
} from '../../models/distribution.models';
import {
  FREQUENCY_LABELS, ROUTE_KIND_ICONS, ROUTE_KIND_LABELS, RouteKind, VisitFrequency,
  WEEKDAYS, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, required, validate } from '../shared/validation';

/**
 * Routes and beats: the ordered walk a rep does, and who owns it.
 *
 * The sequence is the whole product. A beat ordered by when shops were captured rather than by
 * how somebody actually walks the street costs an hour a day, every day, and nobody notices
 * because each individual hop looks reasonable.
 *
 * Unrouted outlets get their own panel rather than a filter, because a shop nobody is scheduled
 * to visit is a silent revenue leak, and hiding it behind a dropdown is how it stays silent.
 */
@Component({
  standalone: true,
  selector: 'lib-routes-beats',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    EmptyStateComponent, FieldErrorComponent,
  ],
  templateUrl: './routes-beats.html',
  styleUrls: ['../distribution-shared.css', './routes-beats.css'],
})
export class RoutesBeatsComponent implements OnInit {
  private routeSvc = inject(RouteService);
  private field = inject(FieldService);
  private cdr = inject(ChangeDetectorRef);

  routes: RouteDto[] = [];
  selected: RouteDto | null = null;
  unrouted: OutletDto[] = [];
  reps: FieldRepDto[] = [];
  territories: TerritoryDto[] = [];

  loading = true;
  loadingDetail = false;
  error = '';
  saving = false;

  search = '';
  territoryId: string | null = null;

  showEditor = false;
  editing: SaveRouteDto & { id?: string } = this.blank();
  editorErrors: FieldErrors = {};
  activeDays: number[] = [];

  showAddOutlets = false;
  outletSearch = '';
  addCandidates: OutletDto[] = [];
  selectedToAdd = new Set<string>();

  showAssign = false;
  assignRepId = '';
  assignFrom = new Date().toISOString().slice(0, 10);
  assignTemporary = false;
  assignReason = '';

  showSplit = false;
  splitName = '';
  splitStops = new Set<string>();

  readonly kindOptions = enumOptions(ROUTE_KIND_LABELS);
  readonly frequencyOptions = enumOptions(FREQUENCY_LABELS);
  readonly kindLabels = ROUTE_KIND_LABELS;
  readonly kindIcons = ROUTE_KIND_ICONS;
  readonly frequencyLabels = FREQUENCY_LABELS;
  readonly weekdays = WEEKDAYS;

  async ngOnInit(): Promise<void> {
    const [repsRes, terrRes] = await Promise.all([
      firstValueFrom(this.field.reps({ pageSize: 200, isActive: true })).catch(() => null),
      firstValueFrom(this.routeSvc.territories({ pageSize: 200 })).catch(() => null),
    ]);

    this.reps = repsRes?.data ?? [];
    this.territories = terrRes?.data ?? [];
    this.cdr.detectChanges();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const [routesRes, unroutedRes] = await Promise.all([
      firstValueFrom(this.routeSvc.list({
        pageSize: 200,
        territoryId: this.territoryId || undefined,
        search: this.search || undefined,
      })).catch(() => null),
      firstValueFrom(this.routeSvc.unrouted({
        pageSize: 50,
        territoryId: this.territoryId || undefined,
      })).catch(() => null),
    ]);

    this.routes = routesRes?.data ?? [];
    this.unrouted = unroutedRes?.data ?? [];
    if (!routesRes) this.error = 'Could not load the routes.';

    // Keep the open route selected across a refresh, or fall back to the first one.
    const keepId = this.selected?.id;
    const keep = keepId ? this.routes.find(r => r.id === keepId) : null;
    await this.select(keep ?? this.routes[0] ?? null);

    this.loading = false;
    this.cdr.detectChanges();
  }

  async select(route: RouteDto | null): Promise<void> {
    if (!route) { this.selected = null; return; }

    this.loadingDetail = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.routeSvc.get(route.id)).catch(() => null);
    this.selected = res?.data ?? route;

    this.loadingDetail = false;
    this.cdr.detectChanges();
  }

  // ── Sequencing ─────────────────────────────────────────────────────────────

  /**
   * Moving a stop rewrites the whole sequence on the server rather than swapping two numbers,
   * because a partially applied reorder is the kind of bug that silently sends a rep to the far
   * end of the beat and back.
   */
  async move(stop: RouteStopDto, by: number): Promise<void> {
    if (!this.selected) return;

    const stops = [...this.selected.stops];
    const from = stops.indexOf(stop);
    const to = from + by;
    if (from < 0 || to < 0 || to >= stops.length) return;

    stops.splice(to, 0, ...stops.splice(from, 1));

    // Optimistic: the sequence numbers on screen update immediately, then the server confirms.
    this.selected = { ...this.selected, stops: stops.map((s, i) => ({ ...s, stopSequence: i + 1 })) };
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.routeSvc.resequence({
      routeId: this.selected.id,
      orderedRouteOutletIds: stops.map(s => s.id),
    })).catch(() => null);

    if (res?.data) this.selected = res.data;
    else { this.error = 'The new order could not be saved.'; await this.select(this.selected); }

    this.cdr.detectChanges();
  }

  async removeStop(stop: RouteStopDto): Promise<void> {
    if (!this.selected) return;

    const res = await firstValueFrom(
      this.routeSvc.removeOutlet(this.selected.id, stop.outletId),
    ).catch(() => null);

    if (res?.data) { this.selected = res.data; await this.load(); }
    else this.error = 'That stop could not be removed.';

    this.cdr.detectChanges();
  }

  // ── Editor ─────────────────────────────────────────────────────────────────

  private blank(): SaveRouteDto {
    return {
      name: '',
      territoryId: this.territoryId ?? '',
      kind: RouteKind.PreSales,
      frequency: VisitFrequency.Weekly,
      targetCallsPerDay: 35,
      minimumProductiveCalls: 20,
      isActive: true,
    };
  }

  create(): void {
    this.editing = this.blank();
    this.activeDays = [1, 2, 3, 4, 5];
    this.editorErrors = {};
    this.showEditor = true;
  }

  edit(): void {
    if (!this.selected) return;
    this.editing = { ...this.selected };
    this.activeDays = (this.selected.activeDays ?? '').split(',')
      .map(Number).filter(n => !Number.isNaN(n));
    this.editorErrors = {};
    this.showEditor = true;
  }

  toggleDay(day: number): void {
    this.activeDays = this.activeDays.includes(day)
      ? this.activeDays.filter(d => d !== day)
      : [...this.activeDays, day].sort();
  }

  async save(): Promise<void> {
    this.editorErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A route name')],
      territoryId: [required('A territory')],
    });

    if (Object.keys(this.editorErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.saving = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.routeSvc.save(this.editing.id ?? null, {
      ...this.editing,
      activeDays: this.activeDays.join(','),
    } as SaveRouteDto)).catch(() => null);

    if (res?.data) {
      this.showEditor = false;
      this.selected = res.data;
      await this.load();
    } else {
      this.error = 'The route could not be saved.';
    }

    this.saving = false;
    this.cdr.detectChanges();
  }

  // ── Adding outlets ─────────────────────────────────────────────────────────

  openAddOutlets(): void {
    this.showAddOutlets = true;
    this.selectedToAdd.clear();
    this.addCandidates = this.unrouted;
    this.outletSearch = '';
  }

  async searchOutlets(): Promise<void> {
    if (!this.outletSearch.trim()) { this.addCandidates = this.unrouted; return; }

    const res = await firstValueFrom(this.routeSvc.unrouted({
      pageSize: 50,
      search: this.outletSearch,
      territoryId: this.territoryId || undefined,
    })).catch(() => null);

    this.addCandidates = res?.data ?? [];
    this.cdr.detectChanges();
  }

  toggleAdd(id: string): void {
    if (this.selectedToAdd.has(id)) this.selectedToAdd.delete(id);
    else this.selectedToAdd.add(id);
  }

  async confirmAdd(): Promise<void> {
    if (!this.selected || this.selectedToAdd.size === 0) return;

    const res = await firstValueFrom(this.routeSvc.addOutlets({
      routeId: this.selected.id,
      outletIds: [...this.selectedToAdd],
    })).catch(() => null);

    if (res?.data) { this.showAddOutlets = false; await this.load(); }
    else this.error = 'Those shops could not be added to the route.';

    this.cdr.detectChanges();
  }

  // ── Assignment ─────────────────────────────────────────────────────────────

  openAssign(): void {
    if (!this.selected) return;
    this.assignRepId = this.selected.fieldRepId ?? '';
    this.assignTemporary = false;
    this.assignReason = '';
    this.showAssign = true;
  }

  async confirmAssign(): Promise<void> {
    if (!this.selected || !this.assignRepId) return;

    const res = await firstValueFrom(this.routeSvc.assign({
      routeId: this.selected.id,
      fieldRepId: this.assignRepId,
      effectiveFrom: this.assignFrom,
      isTemporary: this.assignTemporary,
      reason: this.assignReason || undefined,
    })).catch(() => null);

    if (res?.data) { this.showAssign = false; await this.load(); }
    else this.error = 'The assignment did not go through.';

    this.cdr.detectChanges();
  }

  // ── Splitting ──────────────────────────────────────────────────────────────

  openSplit(): void {
    this.splitName = '';
    this.splitStops.clear();
    this.showSplit = true;
  }

  toggleSplit(outletId: string): void {
    if (this.splitStops.has(outletId)) this.splitStops.delete(outletId);
    else this.splitStops.add(outletId);
  }

  async confirmSplit(): Promise<void> {
    if (!this.selected || !this.splitName.trim() || this.splitStops.size === 0) return;

    const res = await firstValueFrom(
      this.routeSvc.split(this.selected.id, this.splitName.trim(), [...this.splitStops]),
    ).catch(() => null);

    if (res?.data) { this.showSplit = false; await this.load(); }
    else this.error = 'The split did not go through. Nothing has been changed.';

    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  activeDayLabel(route: RouteDto): string {
    const days = (route.activeDays ?? '').split(',').map(Number).filter(n => !Number.isNaN(n));
    if (days.length === 0) return 'no days set';
    if (days.length === 7) return 'every day';
    return days.map(d => WEEKDAYS[d]?.short ?? '?').join(' ');
  }

  get totalDistance(): number {
    return (this.selected?.stops ?? []).reduce((sum, s) => sum + (s.distanceFromPreviousKm || 0), 0);
  }

  get totalServiceMinutes(): number {
    return (this.selected?.stops ?? []).reduce((sum, s) => sum + (s.serviceMinutes || 0), 0);
  }

  /** A beat longer than a working day is the thing this screen exists to catch. */
  get isOverloaded(): boolean {
    return this.totalServiceMinutes > 8 * 60;
  }

  trackRoute = (_: number, r: RouteDto) => r.id;
  trackStop = (_: number, s: RouteStopDto) => s.id;
  trackOutlet = (_: number, o: OutletDto) => o.id;
}
