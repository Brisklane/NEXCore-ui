import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InventoryService, MoneyService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  BLOCK_REASON_LABELS, FACING_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_SUB_TYPE_LABELS,
  PropertyStatus,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import { FactsComponent, SectionComponent, type Fact } from '../shared/detail-bits';
import {
  DrawerComponent, ProgressComponent, SkeletonComponent, ToastComponent,
} from '../shared/ui';

/* =====================================================================================
 * A unit.
 *
 * One sellable thing inside a project. The screen exists so a salesperson standing in front of a
 * customer can answer three questions without leaving it: what is it, what does it cost all in,
 * and can I take it off the market right now.
 *
 * The cost sheet is fetched from the server against a chosen payment plan, because the price a
 * customer is quoted and the price the ledger will raise have to be the same number. Quoting from
 * a spreadsheet is how a booking ends up being re-cut a week later.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-unit-detail',
  imports: [
    CommonModule, FormsModule, DetailPageComponent, SectionComponent, FactsComponent,
    ProgressComponent, SkeletonComponent, DrawerComponent, ToastComponent,
  ],
  templateUrl: './unit-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './unit-detail.css',
  ],
})
export class UnitDetailComponent implements OnInit {
  private inventory = inject(InventoryService);
  private plans = inject(MoneyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.InventoryUnitDto | null>(null);
  readonly sheet = signal<M.CostSheetDto | null>(null);
  readonly templates = signal<M.PaymentPlanTemplateDto[]>([]);
  readonly templateId = signal<string | null>(null);

  readonly loading = signal(true);
  readonly pricing = signal(false);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  // The hold drawer.
  readonly holding = signal(false);
  readonly holdFor = signal('');
  readonly holdHours = signal(24);
  readonly holdNote = signal('');
  readonly saving = signal(false);

  readonly discount = signal(0);

  readonly flags = computed(() => {
    const d = this.data();
    if (!d) return [];

    const flags: string[] = [];
    if (d.isLandownerShare) flags.push('landowner’s share');
    if (d.hasLitigation) flags.push('under litigation');
    if (d.isMortgaged) flags.push('mortgaged to a lender');
    return flags;
  });

  readonly tabs = computed<DetailTab[]>(() => [
    { key: 'overview', label: 'Overview', icon: 'grid_view' },
    { key: 'price', label: 'Cost sheet', icon: 'receipt_long' },
  ]);

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: PROPERTY_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
      { label: PROPERTY_SUB_TYPE_LABELS[d.subType] },
    ];

    if (d.isCorner) pills.push({ label: 'Corner', tone: 'accent' });
    if (d.holdMinutesRemaining !== undefined && d.holdMinutesRemaining > 0) {
      pills.push({
        label: 'Held, ' + this.remaining(d.holdMinutesRemaining) + ' left',
        tone: 'warning', icon: 'timer',
      });
    }
    if (d.blockReason !== undefined) {
      pills.push({ label: BLOCK_REASON_LABELS[d.blockReason], tone: 'danger', icon: 'block' });
    }
    for (const flag of this.flags()) {
      pills.push({ label: flag, tone: 'danger' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    const figures: DetailFigure[] = [
      { label: 'Price', value: this.money(d.totalPrice), hint: 'list, before discount' },
      { label: 'Rate', value: this.money(d.ratePerSqFt), hint: 'per sq ft' },
      { label: 'Area', value: d.areaDisplay },
    ];

    if (d.collectionPercent !== undefined) {
      figures.push({
        label: 'Collected', value: d.collectionPercent.toFixed(0) + '%',
        hint: d.buyerName ? 'from ' + d.buyerName : null,
      });
    }

    return figures;
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [];
    const available = d.status === PropertyStatus.Available;
    const flagged = this.flags().length > 0;

    actions.push({
      key: 'book', label: 'Start a booking', icon: 'sell', tone: 'primary',
      disabled: !available,
      reason: !available
        ? 'This unit is ' + PROPERTY_STATUS_LABELS[d.status].toLowerCase()
          + '. Only an available unit can be booked.'
        : null,
    });

    if (d.holdId) {
      actions.push({ key: 'release', label: 'Release the hold', icon: 'lock_open', tone: 'danger' });
    } else {
      actions.push({
        key: 'hold', label: 'Hold it', icon: 'timer',
        disabled: !available || flagged,
        reason: flagged
          ? 'This unit carries an encumbrance and cannot be held without approval.'
          : (!available ? 'Only an available unit can be held.' : null),
      });
    }

    if (d.bookingId) {
      actions.push({ key: 'booking', label: 'Open the booking', icon: 'open_in_new' });
    }

    return actions;
  });

  readonly facts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Unit', value: d.unitNumber },
      { label: 'Type', value: PROPERTY_SUB_TYPE_LABELS[d.subType] },
      { label: 'Block', value: d.blockName },
      { label: 'Floor', value: d.floorLabel ?? d.floorNumber },
      { label: 'Stack', value: d.stackIndex },
      { label: 'Area', value: d.areaDisplay },
      { label: 'Bedrooms', value: d.bedrooms },
      { label: 'Facing', value: d.facing !== undefined ? FACING_LABELS[d.facing] : null },
      { label: 'Corner', value: d.isCorner ? 'Yes' : 'No' },
      { label: 'Base price', value: this.money(d.basePrice) },
      { label: 'Total price', value: this.money(d.totalPrice), tone: 'positive' },
      { label: 'Rate', value: this.money(d.ratePerSqFt) + ' per sq ft' },
    ];
  });

  readonly holdFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d?.holdId) return [];

    return [
      { label: 'Held for', value: d.heldForName },
      { label: 'Placed by', value: d.heldByName },
      {
        label: 'Expires',
        value: d.holdExpiresAt ? new Date(d.holdExpiresAt).toLocaleString() : null,
        hint: d.holdMinutesRemaining !== undefined
          ? this.remaining(d.holdMinutesRemaining) + ' left' : null,
        tone: (d.holdMinutesRemaining ?? 0) < 60 ? 'danger' : 'warning',
      },
    ];
  });

  readonly buyerFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d?.bookingId) return [];

    return [
      { label: 'Buyer', value: d.buyerName },
      {
        label: 'Collected',
        value: d.collectionPercent !== undefined ? d.collectionPercent.toFixed(1) + '%' : null,
        tone: (d.collectionPercent ?? 0) >= 50 ? 'positive' : 'warning',
      },
    ];
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.inventory.getUnit(id)).catch(() => null);

    if (res?.data) {
      this.data.set(res.data);

      const templates = await firstValueFrom(
        this.plans.getTemplates(this.ctx.projectId() ?? undefined, true),
      ).catch(() => null);

      if (templates?.data) {
        this.templates.set(templates.data);
        const preferred = templates.data.find(t => t.isDefault) ?? templates.data[0];
        if (preferred) this.templateId.set(preferred.id);
      }

      await this.price();
    } else {
      this.notFound.set(true);
    }

    this.loading.set(false);
  }

  /** The cost sheet is always the server's arithmetic, never the browser's. */
  async price(): Promise<void> {
    const d = this.data();
    if (!d) return;

    this.pricing.set(true);

    const res = await firstValueFrom(this.inventory.getCostSheet(
      d.id,
      this.templateId() ?? undefined,
      this.discount() || undefined,
    )).catch(() => null);

    this.sheet.set(res?.data ?? null);
    this.pricing.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    switch (key) {
      case 'book':
        void this.router.navigate(['/realestate/bookings/new'],
          { queryParams: { unitId: d.id } });
        break;
      case 'hold':
        this.holdFor.set('');
        this.holdNote.set('');
        this.holdHours.set(this.ctx.settings()?.defaultHoldHours ?? 24);
        this.holding.set(true);
        break;
      case 'release':
        void this.release();
        break;
      case 'booking':
        if (d.bookingId) void this.router.navigate(['/realestate/bookings', d.bookingId]);
        break;
    }
  }

  async placeHold(): Promise<void> {
    const d = this.data();
    if (!d || !this.holdFor().trim()) return;

    this.saving.set(true);

    const res = await firstValueFrom(this.inventory.hold({
      unitId: d.id,
      contactName: this.holdFor(),
      hours: this.holdHours(),
      note: this.holdNote() || undefined,
    })).catch(() => null);

    this.saving.set(false);

    if (res?.success) {
      this.holding.set(false);
      this.toast.set('Held for ' + this.holdFor() + '. It releases itself in '
        + this.holdHours() + ' hours.');
      await this.load();
    } else {
      this.toast.set('The hold was not placed.');
    }
  }

  private async release(): Promise<void> {
    const d = this.data();
    if (!d?.holdId) return;

    const res = await firstValueFrom(this.inventory.releaseHold(d.holdId)).catch(() => null);

    if (res?.success) {
      this.toast.set('Released. The unit is back on the market.');
      await this.load();
    } else {
      this.toast.set('The hold could not be released.');
    }
  }

  remaining(minutes: number): string {
    if (minutes <= 0) return 'expired';
    if (minutes < 60) return minutes + ' min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? h + 'h ' + m + 'm' : h + 'h';
  }

  private statusTone(s: PropertyStatus): DetailPill['tone'] {
    if (s === PropertyStatus.Available) return 'positive';
    if (s === PropertyStatus.Held || s === PropertyStatus.Reserved) return 'warning';
    if (s === PropertyStatus.Blocked || s === PropertyStatus.Litigation) return 'danger';
    return 'neutral';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.sheet()?.currencyCode ?? this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
