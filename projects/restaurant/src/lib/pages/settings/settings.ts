import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CheckService, OutletService } from '../../services/restaurant.services';
import { ComplianceService } from '../../services/compliance.service';
import {
  DiscountReasonDto, OutletDto, RestaurantSettingsDto, SaveOutletDto, ServiceChargeRuleDto,
  VoidReasonDto,
} from '../../models/restaurant.models';
import { DeliveryZoneDto } from '../../models/compliance.models';
import {
  SERVICE_CHARGE_BASIS_LABELS, SERVICE_STYLE_LABELS, ServiceChargeBasis, ServiceStyle,
  TIP_BASIS_LABELS, enumOptions,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

type Tab = 'service' | 'money' | 'kitchen' | 'outlets' | 'reasons' | 'delivery';

/**
 * Everything a manager configures once and then leaves alone: how service behaves, how money is
 * handled, what the kitchen screens do, the outlets themselves, the reason codes every audit
 * depends on, and the delivery zones.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-settings',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './settings.html',
  styleUrls: ['../restaurant-shared.css', './settings.css'],
})
export class SettingsComponent {
  private outlets = inject(OutletService);
  private checks = inject(CheckService);
  private compliance = inject(ComplianceService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'service';
  outletId: string | null = null;

  settings: RestaurantSettingsDto | null = null;
  outletList: OutletDto[] = [];
  voidReasons: VoidReasonDto[] = [];
  discountReasons: DiscountReasonDto[] = [];
  serviceCharges: ServiceChargeRuleDto[] = [];
  zones: DeliveryZoneDto[] = [];

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  editingOutlet: SaveOutletDto | null = null;
  editingOutletId: string | null = null;

  editingVoid: VoidReasonDto | null = null;
  editingDiscount: DiscountReasonDto | null = null;
  editingCharge: ServiceChargeRuleDto | null = null;
  editingZone: DeliveryZoneDto | null = null;

  readonly styleOptions = enumOptions(SERVICE_STYLE_LABELS);
  readonly basisOptions = enumOptions(SERVICE_CHARGE_BASIS_LABELS);
  readonly tipBasisOptions = enumOptions(TIP_BASIS_LABELS);
  readonly basisLabels = SERVICE_CHARGE_BASIS_LABELS;
  readonly styleLabels = SERVICE_STYLE_LABELS;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;

    const [settings, outlets, voids, discounts, charges] = await Promise.all([
      firstValueFrom(this.outlets.getSettings()).catch(() => null),
      firstValueFrom(this.outlets.getAll(false)).catch(() => null),
      firstValueFrom(this.checks.getVoidReasons()).catch(() => null),
      firstValueFrom(this.checks.getDiscountReasons()).catch(() => null),
      firstValueFrom(this.checks.getServiceCharges(this.outletId ?? undefined)).catch(() => null),
    ]);

    this.settings = settings?.data ?? null;
    this.outletList = outlets?.data ?? [];
    this.voidReasons = voids?.data ?? [];
    this.discountReasons = discounts?.data ?? [];
    this.serviceCharges = charges?.data ?? [];

    if (this.outletId) {
      const zones = await firstValueFrom(this.compliance.getZones(this.outletId)).catch(() => null);
      this.zones = zones?.data ?? [];
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  /**
   * Loads the demonstration venue for a company that skipped sample data at sign-up.
   *
   * Refused server-side once the menu has anything in it, so it can never duplicate a real
   * restaurant's own work.
   */
  async loadSampleData(): Promise<void> {
    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.outlets.provision(true))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not load the sample data.';
        return null;
      });

    this.busy = false;

    if (res?.data) {
      this.notice = 'Sample venue loaded — a laid-out floor, a menu, staff and recipes.';
      await this.load();
    }

    this.cdr.detectChanges();
  }

  async saveSettings(): Promise<void> {
    if (!this.settings) return;

    this.fieldErrors = validate(this.settings as unknown as Record<string, unknown>, {
      kdsWarningMinutes: [positive('The kitchen warning time')],
      kitchenTipSharePercent: [between(0, 100, 'The kitchen tip share')],
      discountApprovalThreshold: [notNegative('The discount approval threshold')],
      largePartyThreshold: [positive('The large-party threshold')],
      defaultReservationDuration: [positive('The default sitting length')],
      seatedAttentionMinutes: [positive('The seated attention time')],
      servedAttentionMinutes: [positive('The served attention time')],
      packagingChargePerOrder: [notNegative('The packaging charge')],
      cashRoundingIncrement: [notNegative('The cash rounding increment')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.outlets.updateSettings(this.settings))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not save.';
        return null;
      });

    this.busy = false;
    if (res?.data) { this.settings = res.data; this.notice = 'Settings saved.'; }
    this.cdr.detectChanges();
  }

  // ── Outlets ────────────────────────────────────────────────────────

  newOutlet(): void {
    this.fieldErrors = {};
    this.editingOutletId = null;
    this.editingOutlet = {
      code: null,
      name: '',
      serviceStyle: ServiceStyle.CasualDining,
      cuisineType: null,
      phone: null,
      email: null,
      addressLine: null,
      city: null,
      countryCode: null,
      timeZoneId: null,
      currencyCode: 'USD',
      warehouseId: null,
      posStoreId: null,
      defaultMenuId: null,
      defaultTaxGroupId: null,
      defaultTaxPercent: 0,
      takeawayTaxPercent: 0,
      serviceChargeRuleId: null,
      averageDiningMinutes: 60,
      acceptsReservations: true,
      acceptsDelivery: false,
      acceptsTakeaway: true,
      hasDriveThru: false,
      qrOrderingEnabled: false,
      isTemporarilyClosed: false,
      closureNote: null,
      logoUrl: null,
      receiptFooter: null,
      isActive: true,
      description: null,
    };
    this.error = '';
  }

  editOutlet(o: OutletDto): void {
    this.fieldErrors = {};
    this.editingOutletId = o.id;
    const { id, schedules, tableCount, openOrderCount, occupiedTableCount, seatingCapacity, ...rest } = o;
    this.editingOutlet = { ...rest };
    this.error = '';
  }

  async saveOutlet(): Promise<void> {
    if (!this.editingOutlet) return;
    this.fieldErrors = validate(this.editingOutlet as unknown as Record<string, unknown>, {
      name: [required('An outlet name'), maxLength(160, 'The outlet name')],
      code: [maxLength(40, 'The code')],
      phone: [maxLength(40, 'The phone number')],
      currencyCode: [required('A currency'), maxLength(3, 'The currency code')],
      defaultTaxPercent: [between(0, 100, 'The default tax')],
      takeawayTaxPercent: [between(0, 100, 'The takeaway tax')],
      averageDiningMinutes: [positive('The average sitting')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const call = this.editingOutletId
      ? this.outlets.update(this.editingOutletId, this.editingOutlet)
      : this.outlets.create(this.editingOutlet);

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the outlet.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Outlet saved.'; this.editingOutlet = null; await this.load(); }
    this.cdr.detectChanges();
  }

  // ── Reasons ────────────────────────────────────────────────────────

  newVoidReason(): void {
    this.fieldErrors = {};
    this.editingVoid = {
      id: '', name: '', displayOrder: this.voidReasons.length,
      requiresApproval: false, countsAsWastage: false, isActive: true,
    };
  }

  async saveVoidReason(): Promise<void> {
    if (!this.editingVoid) return;

    this.fieldErrors = validate(this.editingVoid as unknown as Record<string, unknown>, {
      name: [required('A reason'), maxLength(120, 'The reason')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.checks.saveVoidReason(this.editingVoid)).catch(() => null);
    this.busy = false;
    if (res?.data) { this.notice = 'Saved.'; this.editingVoid = null; await this.load(); }
    this.cdr.detectChanges();
  }

  async deleteVoidReason(r: VoidReasonDto): Promise<void> {
    await firstValueFrom(this.checks.deleteVoidReason(r.id)).catch(() => null);
    await this.load();
  }

  newDiscountReason(): void {
    this.fieldErrors = {};
    this.editingDiscount = {
      id: '', name: '', displayOrder: this.discountReasons.length,
      requiresApproval: false, maxAmountWithoutApproval: 0, isComp: false, isActive: true,
    };
  }

  async saveDiscountReason(): Promise<void> {
    if (!this.editingDiscount) return;

    this.fieldErrors = validate(this.editingDiscount as unknown as Record<string, unknown>, {
      name: [required('A reason'), maxLength(120, 'The reason')],
      maxAmountWithoutApproval: [notNegative('The approval-free limit')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.checks.saveDiscountReason(this.editingDiscount)).catch(() => null);
    this.busy = false;
    if (res?.data) { this.notice = 'Saved.'; this.editingDiscount = null; await this.load(); }
    this.cdr.detectChanges();
  }

  async deleteDiscountReason(r: DiscountReasonDto): Promise<void> {
    await firstValueFrom(this.checks.deleteDiscountReason(r.id)).catch(() => null);
    await this.load();
  }

  newCharge(): void {
    this.fieldErrors = {};
    this.editingCharge = {
      id: '', outletId: this.outletId, name: '', basis: ServiceChargeBasis.Percentage,
      value: 0, minPartySize: 0, applicableOrderTypes: '1', isTaxable: true, taxGroupId: null,
      isWaivable: true, requiresApprovalToWaive: true, priority: 0, isActive: true,
    };
  }

  async saveCharge(): Promise<void> {
    if (!this.editingCharge) return;

    this.fieldErrors = validate(this.editingCharge as unknown as Record<string, unknown>, {
      name: [required('A name for the charge'), maxLength(120, 'The name')],
      value: [required('An amount or percentage'), notNegative('The value')],
      minPartySize: [notNegative('The minimum party size')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.checks.saveServiceCharge(this.editingCharge)).catch(() => null);
    this.busy = false;
    if (res?.data) { this.notice = 'Saved.'; this.editingCharge = null; await this.load(); }
    this.cdr.detectChanges();
  }

  async deleteCharge(r: ServiceChargeRuleDto): Promise<void> {
    await firstValueFrom(this.checks.deleteServiceCharge(r.id)).catch(() => null);
    await this.load();
  }

  // ── Delivery zones ─────────────────────────────────────────────────

  newZone(): void {
    this.fieldErrors = {};
    if (!this.outletId) return;
    this.editingZone = {
      id: '', outletId: this.outletId, name: '', deliveryFee: 0, minimumOrderValue: 0,
      radiusKm: 3, estimatedMinutes: 30, freeDeliveryThreshold: 0, coveredAreas: null,
      displayOrder: this.zones.length, colorHex: '#2b7fff', isActive: true, description: null,
    };
  }

  async saveZone(): Promise<void> {
    const z = this.editingZone;
    if (!z) return;
    this.fieldErrors = validate(z as unknown as Record<string, unknown>, {
      name: [required('A zone name'), maxLength(120, 'The zone name')],
      deliveryFee: [notNegative('The delivery fee')],
      minimumOrderValue: [notNegative('The minimum order')],
      freeDeliveryThreshold: [notNegative('The free-delivery threshold')],
      estimatedMinutes: [notNegative('The estimated time')],
      radiusKm: [notNegative('The radius')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const call = z.id ? this.compliance.updateZone(z.id, z) : this.compliance.createZone(z);
    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the zone.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Zone saved.'; this.editingZone = null; await this.load(); }
    this.cdr.detectChanges();
  }

  async deleteZone(z: DeliveryZoneDto): Promise<void> {
    await firstValueFrom(this.compliance.deleteZone(z.id)).catch(() => null);
    await this.load();
  }

  trackOutlet = (_: number, o: OutletDto) => o.id;
}
