import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LogisticsService } from '../../services/distribution.services';
import {
  DriverDto, PaginationMetadata, SaveDriverDto, SaveVehicleDto, VehicleComplianceDto, VehicleDto,
} from '../../models/distribution.models';
import {
  COMPLIANCE_LABELS, OWNERSHIP_LABELS, VEHICLE_KIND_LABELS,
  VehicleKind, VehicleOwnership, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, notNegative, phone, required, validate } from '../shared/validation';

type Tab = 'vehicles' | 'drivers';

/**
 * Vehicles and drivers.
 *
 * Compliance expiry is the reason this screen leads with a warning list rather than a register.
 * A permit that lapsed last Tuesday is discovered at a roadside check, and by then it has cost a
 * day's deliveries and a fine. Anything expiring within a month is at the top, and a vehicle with
 * expired compliance is not offered when a trip is built.
 */
@Component({
  standalone: true,
  selector: 'lib-fleet-drivers',
  imports: [
    CommonModule, FormsModule, PageHelpComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, FieldErrorComponent,
  ],
  templateUrl: './fleet.html',
  styleUrls: ['../distribution-shared.css', './fleet.css'],
})
export class FleetDriversComponent implements OnInit {
  private logistics = inject(LogisticsService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'vehicles';

  vehicles: VehicleDto[] = [];
  drivers: DriverDto[] = [];
  expiring: VehicleComplianceDto[] = [];
  meta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  search = '';
  page = 1;
  pageSize = 25;

  showVehicle = false;
  vehicle: SaveVehicleDto & { id?: string } = this.blankVehicle();
  vehicleErrors: FieldErrors = {};

  showDriver = false;
  driver: SaveDriverDto & { id?: string } = this.blankDriver();
  driverErrors: FieldErrors = {};

  readonly kindOptions = enumOptions(VEHICLE_KIND_LABELS);
  readonly ownershipOptions = enumOptions(OWNERSHIP_LABELS);
  readonly kindLabels = VEHICLE_KIND_LABELS;
  readonly ownershipLabels = OWNERSHIP_LABELS;
  readonly complianceLabels = COMPLIANCE_LABELS;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.logistics.expiringCompliance(30)).catch(() => null);
    this.expiring = res?.data ?? [];
    await this.load();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    await this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 320);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const query = { page: this.page, pageSize: this.pageSize, search: this.search || undefined };

    if (this.tab === 'vehicles') {
      const res = await firstValueFrom(this.logistics.vehicles(query)).catch(() => null);
      this.vehicles = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the vehicles.';
    } else {
      const res = await firstValueFrom(this.logistics.drivers(query)).catch(() => null);
      this.drivers = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the drivers.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Vehicles ───────────────────────────────────────────────────────────────

  private blankVehicle(): SaveVehicleDto {
    return {
      registrationNumber: '',
      kind: VehicleKind.Van,
      ownership: VehicleOwnership.Owned,
      capacityWeightKg: 0,
      capacityVolumeM3: 0,
      isRefrigerated: false,
      currentOdometerKm: 0,
      isOutOfService: false,
      isActive: true,
    };
  }

  createVehicle(): void {
    this.vehicle = this.blankVehicle();
    this.vehicleErrors = {};
    this.showVehicle = true;
  }

  async editVehicle(v: VehicleDto): Promise<void> {
    const res = await firstValueFrom(this.logistics.vehicle(v.id)).catch(() => null);
    this.vehicle = { ...(res?.data ?? v) };
    this.vehicleErrors = {};
    this.showVehicle = true;
    this.cdr.detectChanges();
  }

  async saveVehicle(): Promise<void> {
    this.vehicleErrors = validate(this.vehicle as unknown as Record<string, unknown>, {
      registrationNumber: [required('A registration number')],
      capacityWeightKg: [notNegative('The weight capacity')],
      currentOdometerKm: [notNegative('The odometer reading')],
    });

    if (Object.keys(this.vehicleErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.busy = true;
    const res = await firstValueFrom(
      this.logistics.saveVehicle(this.vehicle.id ?? null, this.vehicle),
    ).catch(() => null);

    if (res?.data) { this.showVehicle = false; await this.load(); }
    else this.error = 'The vehicle could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Drivers ────────────────────────────────────────────────────────────────

  private blankDriver(): SaveDriverDto {
    return { fullName: '', isActive: true };
  }

  createDriver(): void {
    this.driver = this.blankDriver();
    this.driverErrors = {};
    this.showDriver = true;
  }

  async editDriver(d: DriverDto): Promise<void> {
    const res = await firstValueFrom(this.logistics.driver(d.id)).catch(() => null);
    this.driver = { ...(res?.data ?? d) };
    this.driverErrors = {};
    this.showDriver = true;
    this.cdr.detectChanges();
  }

  async saveDriver(): Promise<void> {
    this.driverErrors = validate(this.driver as unknown as Record<string, unknown>, {
      fullName: [required('A name')],
      phone: [phone('The phone number')],
    });

    if (Object.keys(this.driverErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.busy = true;
    const res = await firstValueFrom(
      this.logistics.saveDriver(this.driver.id ?? null, this.driver),
    ).catch(() => null);

    if (res?.data) { this.showDriver = false; await this.load(); }
    else this.error = 'The driver could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get blockedVehicles(): number {
    return this.vehicles.filter(v => v.hasExpiredCompliance || v.isOutOfService).length;
  }

  complianceTone(c: VehicleComplianceDto): string {
    if (c.daysToExpiry == null) return 'neutral';
    if (c.daysToExpiry < 0) return 'bad';
    return c.daysToExpiry < 14 ? 'bad' : 'warn';
  }

  vehicleState(v: VehicleDto): { label: string; tone: string } {
    if (v.isOutOfService) return { label: 'Out of service', tone: 'bad' };
    if (v.hasExpiredCompliance) return { label: 'Compliance expired', tone: 'bad' };
    if (v.expiringComplianceCount > 0) return { label: `${v.expiringComplianceCount} expiring`, tone: 'warn' };
    if (!v.isActive) return { label: 'Inactive', tone: 'neutral' };
    return { label: 'Available', tone: 'good' };
  }

  licenceTone(d: DriverDto): string {
    if (d.daysToLicenceExpiry == null) return 'neutral';
    if (d.daysToLicenceExpiry < 0) return 'bad';
    return d.daysToLicenceExpiry < 30 ? 'warn' : 'good';
  }

  licenceLabel(d: DriverDto): string {
    if (!d.licenceExpiresOn) return 'No licence on file';
    if (d.daysToLicenceExpiry == null) return 'Valid';
    if (d.daysToLicenceExpiry < 0) return 'Expired';
    return `${d.daysToLicenceExpiry} days left`;
  }

  serviceDue(v: VehicleDto): boolean {
    if (v.nextServiceDueOn && new Date(v.nextServiceDueOn).getTime() < Date.now()) return true;
    return !!v.nextServiceDueAtKm && v.currentOdometerKm >= v.nextServiceDueAtKm;
  }

  trackVehicle = (_: number, v: VehicleDto) => v.id;
  trackDriver = (_: number, d: DriverDto) => d.id;
  trackCompliance = (_: number, c: VehicleComplianceDto) => c.id;
}
