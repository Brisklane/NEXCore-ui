import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { KitchenService, MenuService } from '../../services/restaurant.services';
import {
  KitchenStationDto, MenuCategoryDto, PrinterProfileDto, SaveKitchenStationDto,
  StationRoutingRuleDto,
} from '../../models/restaurant.models';
import {
  ORDER_TYPE_LABELS, ROUTING_MATCH_LABELS, RoutingMatchType, STATION_TYPE_LABELS, StationType,
  enumOptions,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

/**
 * Kitchen stations, the rules that route dishes to them, and the printers behind them.
 *
 * Routing is the part worth understanding: a fired line finds its station by the most *specific*
 * matching rule — a rule naming the dish beats one naming its category, which beats one naming
 * the order type, which beats the catch-all. That ordering is shown on screen because a kitchen
 * that cannot predict where a dish will appear will not trust the screen.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-kitchen-setup',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './kitchen-setup.html',
  styleUrls: ['../restaurant-shared.css', './kitchen-setup.css'],
})
export class KitchenSetupComponent {
  private kitchen = inject(KitchenService);
  private menu = inject(MenuService);
  private cdr = inject(ChangeDetectorRef);

  outletId: string | null = null;
  stations: KitchenStationDto[] = [];
  printers: PrinterProfileDto[] = [];
  categories: MenuCategoryDto[] = [];

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  editing: SaveKitchenStationDto | null = null;
  editingId: string | null = null;

  editingRule: StationRoutingRuleDto | null = null;
  editingPrinter: PrinterProfileDto | null = null;

  readonly stationTypeOptions = enumOptions(STATION_TYPE_LABELS);
  readonly matchOptions = enumOptions(ROUTING_MATCH_LABELS);
  readonly orderTypeOptions = enumOptions(ORDER_TYPE_LABELS);
  readonly stationTypeLabels = STATION_TYPE_LABELS;
  readonly matchLabels = ROUTING_MATCH_LABELS;
  readonly orderTypeLabels = ORDER_TYPE_LABELS;
  readonly RoutingMatchType = RoutingMatchType;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    this.loading = true;

    const [stations, printers, categories] = await Promise.all([
      firstValueFrom(this.kitchen.getStations(this.outletId)).catch(() => null),
      firstValueFrom(this.kitchen.getPrinters(this.outletId)).catch(() => null),
      firstValueFrom(this.menu.getCategories()).catch(() => null),
    ]);

    this.stations = stations?.data ?? [];
    this.printers = printers?.data ?? [];
    this.categories = categories?.data ?? [];

    this.loading = false;
    this.cdr.detectChanges();
  }

  /** Rules across all stations, ordered the way the router actually evaluates them. */
  get allRules(): StationRoutingRuleDto[] {
    const specificity: Record<number, number> = {
      [RoutingMatchType.Item]: 4,
      [RoutingMatchType.Category]: 3,
      [RoutingMatchType.OrderType]: 2,
      [RoutingMatchType.AllItems]: 1,
    };

    return this.stations
      .flatMap(s => s.routingRules.map(r => ({ ...r, stationName: s.name })))
      .sort((a, b) =>
        (specificity[b.matchType] - specificity[a.matchType]) || (a.priority - b.priority));
  }

  categoryName(id?: string | null): string {
    if (!id) return '';
    return this.categories.find(c => c.id === id)?.name ?? '';
  }

  // ── Stations ───────────────────────────────────────────────────────

  newStation(): void {
    this.fieldErrors = {};
    if (!this.outletId) return;
    this.editingId = null;
    this.editing = {
      outletId: this.outletId,
      name: '',
      stationType: StationType.Grill,
      displayOrder: this.stations.length,
      colorHex: '#2b7fff',
      isExpo: false,
      slaMinutes: 15,
      maxConcurrentTickets: 12,
      printsTickets: false,
      printerProfileId: null,
      isActive: true,
      description: null,
    };
    this.error = '';
  }

  editStation(s: KitchenStationDto): void {
    this.fieldErrors = {};
    this.editingId = s.id;
    this.editing = {
      outletId: s.outletId,
      name: s.name,
      stationType: s.stationType,
      displayOrder: s.displayOrder,
      colorHex: s.colorHex ?? '#2b7fff',
      isExpo: s.isExpo,
      slaMinutes: s.slaMinutes,
      maxConcurrentTickets: s.maxConcurrentTickets,
      printsTickets: s.printsTickets,
      printerProfileId: s.printerProfileId ?? null,
      isActive: s.isActive,
      description: s.description ?? null,
    };
    this.error = '';
  }

  async saveStation(): Promise<void> {
    if (!this.editing) return;
    this.fieldErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A station name'), maxLength(120, 'The station name')],
      slaMinutes: [positive('The target time')],
      maxConcurrentTickets: [positive('The ticket limit')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const call = this.editingId
      ? this.kitchen.updateStation(this.editingId, this.editing)
      : this.kitchen.createStation(this.editing);

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the station.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Station saved.'; this.editing = null; await this.load(); }
    this.cdr.detectChanges();
  }

  async deleteStation(s: KitchenStationDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.kitchen.deleteStation(s.id))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not remove the station.';
        return null;
      });

    this.busy = false;
    if (res) { this.notice = 'Station removed.'; await this.load(); }
    this.cdr.detectChanges();
  }

  // ── Routing ────────────────────────────────────────────────────────

  newRule(): void {
    this.fieldErrors = {};
    if (!this.outletId || !this.stations.length) return;
    this.editingRule = {
      id: '',
      stationId: this.stations[0].id,
      outletId: this.outletId,
      matchType: RoutingMatchType.Category,
      categoryId: this.categories[0]?.id ?? null,
      menuItemId: null,
      orderType: null,
      priority: 10,
      isAdditional: false,
      isActive: true,
    };
    this.error = '';
  }

  async saveRule(): Promise<void> {
    const r = this.editingRule;
    if (!r) return;

    this.fieldErrors = validate(r as unknown as Record<string, unknown>, {
      stationId: [required('A station to route to')],
      priority: [notNegative('The priority')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const call = r.id ? this.kitchen.updateRule(r.id, r) : this.kitchen.createRule(r);

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the rule.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Routing rule saved.'; this.editingRule = null; await this.load(); }
    this.cdr.detectChanges();
  }

  async deleteRule(r: StationRoutingRuleDto): Promise<void> {
    this.busy = true;
    await firstValueFrom(this.kitchen.deleteRule(r.id)).catch(() => null);
    this.busy = false;
    this.notice = 'Rule removed.';
    await this.load();
  }

  // ── Printers ───────────────────────────────────────────────────────

  newPrinter(): void {
    this.fieldErrors = {};
    if (!this.outletId) return;
    this.editingPrinter = {
      id: '',
      outletId: this.outletId,
      name: '',
      target: null,
      paperWidthMm: 80,
      isReceiptPrinter: false,
      isKitchenPrinter: true,
      isLabelPrinter: false,
      opensCashDrawer: false,
      copiesPerTicket: 1,
      headerText: null,
      footerText: null,
      isActive: true,
    };
    this.error = '';
  }

  async savePrinter(): Promise<void> {
    const p = this.editingPrinter;
    if (!p) return;
    this.fieldErrors = validate(p as unknown as Record<string, unknown>, {
      name: [required('A printer name'), maxLength(120, 'The printer name')],
      target: [required('Where to print — an address or queue name')],
      copiesPerTicket: [positive('The number of copies')],
      paperWidthMm: [positive('The paper width')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const call = p.id ? this.kitchen.updatePrinter(p.id, p) : this.kitchen.createPrinter(p);

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the printer.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Printer saved.'; this.editingPrinter = null; await this.load(); }
    this.cdr.detectChanges();
  }

  async deletePrinter(p: PrinterProfileDto): Promise<void> {
    this.busy = true;
    await firstValueFrom(this.kitchen.deletePrinter(p.id)).catch(() => null);
    this.busy = false;
    this.notice = 'Printer removed.';
    await this.load();
  }

  trackStation = (_: number, s: KitchenStationDto) => s.id;
  trackRule = (_: number, r: StationRoutingRuleDto) => r.id;
  trackPrinter = (_: number, p: PrinterProfileDto) => p.id;
}
