import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PosStoreService } from '../../services/pos-store.service';
import { StoreVendorProfileService } from '../../services/store-vendor-profile.service';
import { PriceListService } from '../../services/price-list.service';
import { WarehouseService, WarehouseDto } from '@nexcore/inventory';
import { GeoService, CountryDto, SubdivisionDto, CityDto } from '@nexcore/core';
import {
  PosStoreDto,
  CreatePosStoreDto,
  UpdatePosStoreDto,
  PosStoreType,
  PosStoreFormat,
  StoreOnlineStatus,
  VendorProfileDto,
  UpsertVendorProfileDto,
  VendorOnboardingStatus,
} from '../../models/pos-store.model';
import { PriceListDto } from '../../models/price-list.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-pos-stores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-stores.html',
  styleUrl: './pos-stores.css',
})
export class PosStoresComponent implements OnInit {
  stores: PosStoreDto[] = [];
  loading = false;
  error = '';
  successMsg = '';
  showForm = false;
  editingStore: PosStoreDto | null = null;
  searchQuery = '';
  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ── Country / location data (loaded from API) ─────────────
  allCountries: CountryDto[] = [];
  loadedSubdivisions: SubdivisionDto[] = [];
  loadedCities: CityDto[] = [];
  loadingSubdivisions = false;
  loadingCities = false;

  // ── Basic Info ─────────────────────────────────────────────
  formTradingName = '';
  formNativeLanguageName = '';
  formStoreCode = '';
  formStoreType: PosStoreType = 'Retail';
  formStoreFormat: PosStoreFormat = 'Standalone';

  // ── Phone ──────────────────────────────────────────────────
  formPhone = '';
  formPhoneCountry: CountryDto | null = null;
  showPhoneDropdown = false;

  // ── Address ────────────────────────────────────────────────
  formCountryCode = '';   // ISO code used for API calls
  formCountry = '';       // name stored in DTO
  formSubdivisionCode = '';
  formState = '';
  formCity = '';
  detectingIpLocation = false;

  // ── Configuration ──────────────────────────────────────────
  priceLists: PriceListDto[] = [];
  warehouses: WarehouseDto[] = [];
  formDefaultWarehouseId = '';
  formDefaultPriceListId = '';

  // ── Fulfillment / Online ───────────────────────────────────
  formIsOnlineOrderingEnabled = false;
  formAcceptsOnlinePickup = false;
  formHasDelivery = false;
  formEstimatedPrepTimeMinutes: number | null = null;
  formMinOnlineOrderAmount: number | null = null;
  formMaxDeliveryRadiusKm: number | null = null;

  // ── Media ──────────────────────────────────────────────────
  formOnlineLogoUrl = '';
  formOnlineBannerUrl = '';

  // ── Location ───────────────────────────────────────────────
  formLatitude: number | null = null;
  formLongitude: number | null = null;
  detectingLocation = false;

  // ── Edit-only ──────────────────────────────────────────────
  formOnlineStatus: StoreOnlineStatus = 'Offline';
  formOnlineStatusNote = '';
  formIsActive = true;

  // ── Form tabs ──────────────────────────────────────────────
  activeTab: 'info' | 'config' | 'online' | 'location' | 'status' | 'vendor' = 'info';
  vendorTab: 'owner' | 'business' | 'banking' | 'social' = 'owner';

  // ── Vendor Profile ─────────────────────────────────────────
  showVendorPanel = false;
  vendorProfile: VendorProfileDto | null = null;
  vendorLoading = false;
  vendorSaving = false;
  vendorError = '';
  vendorSuccessMsg = '';

  vpOwnerName = '';
  vpOwnerCnic = '';
  vpOwnerPhone = '';
  vpOwnerEmail = '';
  vpCnicFrontDocUrl = '';
  vpCnicBackDocUrl = '';
  vpBusinessName = '';
  vpBusinessRegistrationNumber = '';
  vpFoodLicenseNumber = '';
  vpFoodLicenseExpiry = '';
  vpFoodLicenseDocUrl = '';
  vpBusinessDescription = '';
  vpBankName = '';
  vpBankBranch = '';
  vpAccountTitle = '';
  vpAccountNumber = '';
  vpIbanNumber = '';
  vpFacebookUrl = '';
  vpInstagramUrl = '';
  vpTiktokUrl = '';
  vpWhatsappNumber = '';
  vpStoreFrontPhotoUrl = '';

  readonly storeTypes: PosStoreType[] = ['Retail', 'Restaurant', 'Cafe', 'Pharmacy', 'Grocery', 'Other'];
  readonly storeFormats: PosStoreFormat[] = ['Standalone', 'Mall', 'Kiosk', 'DriveThrough', 'Ghost', 'Other'];
  readonly onlineStatuses: StoreOnlineStatus[] = ['Online', 'Offline', 'Busy', 'Closed'];

  readonly storeTypeToInt: Record<string, number> = {
    Retail: 0, Restaurant: 1, Cafe: 2, Pharmacy: 3, Grocery: 4,
    Bakery: 5, Electronics: 6, Apparel: 7, FoodCourt: 8, Other: 9,
  };
  readonly storeFormatToInt: Record<string, number> = {
    Standalone: 0, Mall: 1, Kiosk: 2, DriveThrough: 3, Ghost: 4, Other: 5,
  };
  readonly onlineStatusToInt: Record<string, number> = {
    Online: 0, Offline: 1, Busy: 2, Closed: 3,
  };
  private toInt(map: Record<string, number>, val: string): number {
    return map[val] ?? 0;
  }
  fromInt<T extends string>(map: Record<string, number>, val: number | string | null, fallback: T): T {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val as T;
    const entry = Object.entries(map).find(([, v]) => v === val);
    return (entry ? entry[0] : fallback) as T;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  get filteredStores(): PosStoreDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    let source = this.stores;
    if (q) {
      source = this.stores.filter(s =>
        (s.tradingName ?? '').toLowerCase().includes(q) ||
        (s.storeCode ?? '').toLowerCase().includes(q) ||
        this.fromInt(this.storeTypeToInt, s.storeType as any, '').toLowerCase().includes(q) ||
        this.fromInt(this.storeFormatToInt, s.storeFormat as any, '').toLowerCase().includes(q),
      );
    }
    const rows: any[] = [...source];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const hid = this.highlighter?.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  constructor(
    private storeService: PosStoreService,
    private vendorService: StoreVendorProfileService,
    private priceListService: PriceListService,
    private warehouseService: WarehouseService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private geo: GeoService,
  ) {}

  ngOnInit() {
    this.load();
    this.priceListService.getActive().subscribe({
      next: (res) => { this.priceLists = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
    this.warehouseService.getAll().subscribe({
      next: (res) => { this.warehouses = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
    this.geo.getCountries().subscribe({
      next: (countries) => {
        this.allCountries = countries;
        if (!this.formPhoneCountry && countries.length) this.formPhoneCountry = countries[0];
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.storeService.getAll().subscribe({
      next: (res) => {
        this.stores = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load POS stores.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingStore = null;
    this.resetForm();
    this.showForm = true;
    this.showVendorPanel = false;
    this.activeTab = 'info';
  }

  openEditForm(store: PosStoreDto) {
    this.editingStore = store;
    this.formTradingName = store.tradingName ?? '';
    this.formNativeLanguageName = store.nativeLanguageName ?? '';
    this.formStoreCode = store.storeCode ?? '';
    this.formStoreType = this.fromInt(this.storeTypeToInt, store.storeType as any, 'Retail');
    this.formStoreFormat = this.fromInt(this.storeFormatToInt, store.storeFormat as any, 'Standalone');
    // Phone
    const storedPhone = store.phone ?? '';
    const dialMatch = this.allCountries.find(c => c.phoneCode && storedPhone.startsWith(`+${c.phoneCode}`));
    this.formPhoneCountry = dialMatch ?? this.allCountries[0] ?? null;
    this.formPhone = dialMatch ? storedPhone.slice(dialMatch.phoneCode!.length + 1).trim() : storedPhone;
    // Address — restore country, then load subdivisions/cities
    this.formCountry = store.country ?? '';
    this.formState = store.state ?? '';
    this.formCity = store.city ?? '';
    const matchedCountry = this.allCountries.find(c => c.name === store.country);
    if (matchedCountry?.code) {
      this.formCountryCode = matchedCountry.code;
      this.geo.getSubdivisions(matchedCountry.code).subscribe({
        next: (subs) => {
          this.loadedSubdivisions = subs;
          const matchedSub = subs.find(s => s.name === store.state);
          if (matchedSub?.code) {
            this.formSubdivisionCode = matchedSub.code;
            this.geo.getCities(matchedCountry.code!, matchedSub.code).subscribe({
              next: (cities) => { this.loadedCities = cities; this.cdr.detectChanges(); },
              error: () => {},
            });
          }
          this.cdr.detectChanges();
        },
        error: () => {},
      });
    }
    this.formDefaultWarehouseId = store.defaultWarehouseId ?? '';
    this.formDefaultPriceListId = store.defaultPriceListId ?? '';
    this.formIsOnlineOrderingEnabled = store.isOnlineOrderingEnabled;
    this.formAcceptsOnlinePickup = store.acceptsOnlinePickup;
    this.formHasDelivery = store.hasDelivery;
    this.formEstimatedPrepTimeMinutes = store.estimatedPrepTimeMinutes;
    this.formMinOnlineOrderAmount = store.minOnlineOrderAmount;
    this.formMaxDeliveryRadiusKm = store.maxDeliveryRadiusKm;
    this.formOnlineLogoUrl = store.onlineLogoUrl ?? '';
    this.formOnlineBannerUrl = store.onlineBannerUrl ?? '';
    this.formLatitude = store.latitude;
    this.formLongitude = store.longitude;
    this.formOnlineStatus = this.fromInt(this.onlineStatusToInt, store.onlineStatus as any, 'Offline');
    this.formOnlineStatusNote = store.onlineStatusNote ?? '';
    this.formIsActive = store.isActive;
    this.showForm = true;
    this.showVendorPanel = false;
    this.vendorProfile = null;
    this.vendorError = '';
    this.vendorSuccessMsg = '';
    this.activeTab = 'info';
  }

  resetForm() {
    this.formTradingName = '';
    this.formNativeLanguageName = '';
    this.formStoreCode = '';
    this.formStoreType = 'Retail';
    this.formStoreFormat = 'Standalone';
    this.formPhone = '';
    this.formPhoneCountry = this.allCountries[0] ?? null;
    this.formCountry = '';
    this.formCountryCode = '';
    this.formState = '';
    this.formSubdivisionCode = '';
    this.formCity = '';
    this.loadedSubdivisions = [];
    this.loadedCities = [];
    this.formDefaultWarehouseId = '';
    this.formDefaultPriceListId = '';
    this.formIsOnlineOrderingEnabled = false;
    this.formAcceptsOnlinePickup = false;
    this.formHasDelivery = false;
    this.formEstimatedPrepTimeMinutes = null;
    this.formMinOnlineOrderAmount = null;
    this.formMaxDeliveryRadiusKm = null;
    this.formOnlineLogoUrl = '';
    this.formOnlineBannerUrl = '';
    this.formLatitude = null;
    this.formLongitude = null;
    this.formOnlineStatus = 'Offline';
    this.formOnlineStatusNote = '';
    this.formIsActive = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingStore = null;
    this.showVendorPanel = false;
    this.vendorProfile = null;
    this.resetForm();
  }

  useMyLocation() {
    if (!navigator.geolocation) return;
    this.detectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.formLatitude = parseFloat(pos.coords.latitude.toFixed(6));
        this.formLongitude = parseFloat(pos.coords.longitude.toFixed(6));
        this.detectingLocation = false;
        this.cdr.detectChanges();
      },
      () => {
        this.detectingLocation = false;
        this.cdr.detectChanges();
      },
    );
  }

  save() {
    if (!this.formTradingName) { this.error = 'Trading Name is required.'; return; }
    if (!this.editingStore && !this.formStoreCode) { this.error = 'Store Code is required.'; return; }

    const fullPhone = this.formPhone
      ? `+${this.formPhoneCountry?.phoneCode ?? ''} ${this.formPhone}`.trim()
      : null;

    if (this.editingStore) {
      const dto: UpdatePosStoreDto = {
        tradingName: this.formTradingName,
        nativeLanguageName: this.formNativeLanguageName || null,
        storeType: this.toInt(this.storeTypeToInt, this.formStoreType),
        storeFormat: this.toInt(this.storeFormatToInt, this.formStoreFormat),
        defaultWarehouseId: this.formDefaultWarehouseId || null,
        defaultPriceListId: this.formDefaultPriceListId || null,
        phone: fullPhone,
        country: this.formCountry || null,
        state: this.formState || null,
        city: this.formCity || null,
        isOnlineOrderingEnabled: this.formIsOnlineOrderingEnabled,
        estimatedPrepTimeMinutes: this.formEstimatedPrepTimeMinutes,
        minOnlineOrderAmount: this.formMinOnlineOrderAmount,
        maxDeliveryRadiusKm: this.formMaxDeliveryRadiusKm,
        latitude: this.formLatitude,
        longitude: this.formLongitude,
        onlineStatus: this.toInt(this.onlineStatusToInt, this.formOnlineStatus),
        onlineStatusNote: this.formOnlineStatusNote || null,
        isActive: this.formIsActive,
      };
      this.storeService.update(this.editingStore.id, dto).subscribe({
        next: () => { this.successMsg = 'Store updated.'; this.cancelForm(); this.load(); },
        error: () => { this.error = 'Failed to update store.'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePosStoreDto = {
        storeCode: this.formStoreCode,
        tradingName: this.formTradingName,
        nativeLanguageName: this.formNativeLanguageName || null,
        storeType: this.toInt(this.storeTypeToInt, this.formStoreType),
        storeFormat: this.toInt(this.storeFormatToInt, this.formStoreFormat),
        phone: fullPhone,
        country: this.formCountry || null,
        state: this.formState || null,
        city: this.formCity || null,
        defaultWarehouseId: this.formDefaultWarehouseId || null,
        defaultPriceListId: this.formDefaultPriceListId || null,
        acceptsOnlinePickup: this.formAcceptsOnlinePickup,
        hasDelivery: this.formHasDelivery,
        isOnlineOrderingEnabled: this.formIsOnlineOrderingEnabled,
        estimatedPrepTimeMinutes: this.formEstimatedPrepTimeMinutes,
        minOnlineOrderAmount: this.formMinOnlineOrderAmount,
        maxDeliveryRadiusKm: this.formMaxDeliveryRadiusKm,
        onlineLogoUrl: this.formOnlineLogoUrl || null,
        onlineBannerUrl: this.formOnlineBannerUrl || null,
        latitude: this.formLatitude,
        longitude: this.formLongitude,
      };
      this.storeService.create(dto).subscribe({
        next: (res) => { this.successMsg = 'Store created.'; this.cancelForm(); this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: () => { this.error = 'Failed to create store.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteStore(id: string) {
    if (!confirm('Delete this POS store?')) return;
    this.storeService.delete(id).subscribe({
      next: () => { this.successMsg = 'Store deleted.'; this.load(); },
      error: () => { this.error = 'Failed to delete store.'; this.cdr.detectChanges(); },
    });
  }

  getMapUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  onCountrySelected(countryCode: string) {
    const country = this.allCountries.find(c => c.code === countryCode);
    this.formCountryCode = countryCode;
    this.formCountry = country?.name ?? '';
    this.formSubdivisionCode = '';
    this.formState = '';
    this.formCity = '';
    this.loadedSubdivisions = [];
    this.loadedCities = [];
    if (country) this.formPhoneCountry = country;
    if (!countryCode) return;
    this.loadingSubdivisions = true;
    this.geo.getSubdivisions(countryCode).subscribe({
      next: (subs) => { this.loadedSubdivisions = subs; this.loadingSubdivisions = false; this.cdr.detectChanges(); },
      error: () => { this.loadingSubdivisions = false; this.cdr.detectChanges(); },
    });
  }

  onStateSelected(subdivisionCode: string) {
    const sub = this.loadedSubdivisions.find(s => s.code === subdivisionCode);
    this.formSubdivisionCode = subdivisionCode;
    this.formState = sub?.name ?? '';
    this.formCity = '';
    this.loadedCities = [];
    if (!subdivisionCode || !this.formCountryCode) return;
    this.loadingCities = true;
    this.geo.getCities(this.formCountryCode, subdivisionCode).subscribe({
      next: (cities) => { this.loadedCities = cities; this.loadingCities = false; this.cdr.detectChanges(); },
      error: () => { this.loadingCities = false; this.cdr.detectChanges(); },
    });
  }

  onCitySelected(cityName: string) {
    this.formCity = cityName;
    const city = this.loadedCities.find(c => c.name === cityName);
    if (city && this.formLatitude == null && city.latitude != null) this.formLatitude = city.latitude;
    if (city && this.formLongitude == null && city.longitude != null) this.formLongitude = city.longitude;
  }

  detectFromIp() {
    this.detectingIpLocation = true;
    this.http.get<any>('https://ipapi.co/json/').subscribe({
      next: (data) => {
        const countryCode: string = data.country_code ?? '';
        const country = this.allCountries.find(c => c.code === countryCode);
        if (country?.code) {
          this.formCountryCode = country.code;
          this.formCountry = country.name ?? '';
          this.formPhoneCountry = country;
          this.loadingSubdivisions = true;
          this.geo.getSubdivisions(country.code).subscribe({
            next: (subs) => {
              this.loadedSubdivisions = subs;
              this.loadingSubdivisions = false;
              const region: string = data.region ?? '';
              const sub = subs.find(s => s.name?.toLowerCase() === region.toLowerCase());
              if (sub?.code) {
                this.formSubdivisionCode = sub.code;
                this.formState = sub.name ?? '';
                this.loadingCities = true;
                this.geo.getCities(country.code!, sub.code).subscribe({
                  next: (cities) => {
                    this.loadedCities = cities;
                    this.loadingCities = false;
                    const cityName: string = data.city ?? '';
                    const city = cities.find(c => c.name?.toLowerCase() === cityName.toLowerCase());
                    if (city) this.formCity = city.name ?? '';
                    this.cdr.detectChanges();
                  },
                  error: () => { this.loadingCities = false; this.cdr.detectChanges(); },
                });
              }
              this.cdr.detectChanges();
            },
            error: () => { this.loadingSubdivisions = false; this.cdr.detectChanges(); },
          });
        }
        if (this.formLatitude == null && data.latitude != null)  this.formLatitude  = data.latitude;
        if (this.formLongitude == null && data.longitude != null) this.formLongitude = data.longitude;
        this.detectingIpLocation = false;
        this.cdr.detectChanges();
      },
      error: () => { this.detectingIpLocation = false; this.cdr.detectChanges(); },
    });
  }

  flagUrl(country: CountryDto | null): string {
    return this.geo.flagUrl(country?.code ?? null);
  }

  dialCode(country: CountryDto | null): string {
    return country ? this.geo.dialCode(country) : '';
  }

  onlineStatusClass(status: StoreOnlineStatus | null): string {
    const map: Record<string, string> = {
      Online: 'badge badge-accepted',
      Offline: 'badge badge-cancelled',
      Busy: 'badge badge-warning',
      Closed: 'badge badge-cancelled',
    };
    return map[status ?? 'Offline'] ?? 'badge';
  }

  storeTypeIcon(t: PosStoreType): string {
    const map: Record<PosStoreType, string> = {
      Retail: 'store', Restaurant: 'restaurant', Cafe: 'local_cafe',
      Pharmacy: 'local_pharmacy', Grocery: 'shopping_basket', Other: 'business_center',
    };
    return map[t] ?? 'store';
  }

  storeFormatIcon(f: PosStoreFormat): string {
    const map: Record<PosStoreFormat, string> = {
      Standalone: 'home', Mall: 'shopping_bag', Kiosk: 'qr_code_2',
      DriveThrough: 'drive_eta', Ghost: 'cloud', Other: 'more_horiz',
    };
    return map[f] ?? 'store';
  }

  storeAvatarBg(): string {
    const map: Record<PosStoreType, string> = {
      Retail:     'linear-gradient(135deg,#6366f1,#8b5cf6)',
      Restaurant: 'linear-gradient(135deg,#f97316,#ef4444)',
      Cafe:       'linear-gradient(135deg,#92400e,#d97706)',
      Pharmacy:   'linear-gradient(135deg,#16a34a,#059669)',
      Grocery:    'linear-gradient(135deg,#0891b2,#0284c7)',
      Other:      'linear-gradient(135deg,#475569,#334155)',
    };
    return map[this.formStoreType] ?? 'linear-gradient(135deg,#6366f1,#8b5cf6)';
  }

  statusPillClass(s: StoreOnlineStatus): string {
    const c: Record<StoreOnlineStatus, string> = {
      Online: 'sp-online', Offline: 'sp-offline', Busy: 'sp-busy', Closed: 'sp-closed',
    };
    return `status-pill ${c[s]}${this.formOnlineStatus === s ? ' status-pill-active' : ''}`;
  }

  vendorStatusClass(status: VendorOnboardingStatus | null): string {
    const map: Record<string, string> = {
      NotStarted: 'badge badge-cancelled',
      InProgress: 'badge badge-warning',
      PendingReview: 'badge badge-warning',
      Approved: 'badge badge-accepted',
      Rejected: 'badge badge-cancelled',
      Suspended: 'badge badge-cancelled',
    };
    return map[status ?? 'NotStarted'] ?? 'badge';
  }

  openVendorTab(store: PosStoreDto) {
    this.openEditForm(store);
    this.activeTab = 'vendor';
    this.vendorTab = 'owner';
    this.resetVendorForm();
    this.loadVendorProfile(store.id);
  }

  // ── Vendor Profile ─────────────────────────────────────────
  openVendorPanel(store: PosStoreDto) {
    this.showForm = false;
    this.editingStore = store;
    this.showVendorPanel = true;
    this.vendorProfile = null;
    this.vendorError = '';
    this.vendorSuccessMsg = '';
    this.resetVendorForm();
    this.loadVendorProfile(store.id);
  }

  closeVendorPanel() {
    this.showVendorPanel = false;
    this.editingStore = null;
    this.vendorProfile = null;
  }

  loadVendorProfile(storeId: string) {
    this.vendorLoading = true;
    this.vendorService.getVendorProfile(storeId).subscribe({
      next: (res) => {
        this.vendorProfile = res.data ?? null;
        if (this.vendorProfile) this.populateVendorForm(this.vendorProfile);
        this.vendorLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.vendorLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  populateVendorForm(vp: VendorProfileDto) {
    this.vpOwnerName = vp.ownerName ?? '';
    this.vpOwnerCnic = vp.ownerCnic ?? '';
    this.vpOwnerPhone = vp.ownerPhone ?? '';
    this.vpOwnerEmail = vp.ownerEmail ?? '';
    this.vpCnicFrontDocUrl = vp.cnicFrontDocUrl ?? '';
    this.vpCnicBackDocUrl = vp.cnicBackDocUrl ?? '';
    this.vpBusinessName = vp.businessName ?? '';
    this.vpBusinessRegistrationNumber = vp.businessRegistrationNumber ?? '';
    this.vpFoodLicenseNumber = vp.foodLicenseNumber ?? '';
    this.vpFoodLicenseExpiry = vp.foodLicenseExpiry ?? '';
    this.vpFoodLicenseDocUrl = vp.foodLicenseDocUrl ?? '';
    this.vpBusinessDescription = vp.businessDescription ?? '';
    this.vpBankName = vp.bankName ?? '';
    this.vpBankBranch = vp.bankBranch ?? '';
    this.vpAccountTitle = vp.accountTitle ?? '';
    this.vpAccountNumber = vp.accountNumber ?? '';
    this.vpIbanNumber = vp.ibanNumber ?? '';
    this.vpFacebookUrl = vp.facebookUrl ?? '';
    this.vpInstagramUrl = vp.instagramUrl ?? '';
    this.vpTiktokUrl = vp.tiktokUrl ?? '';
    this.vpWhatsappNumber = vp.whatsappNumber ?? '';
    this.vpStoreFrontPhotoUrl = vp.storeFrontPhotoUrl ?? '';
  }

  resetVendorForm() {
    this.vpOwnerName = '';
    this.vpOwnerCnic = '';
    this.vpOwnerPhone = '';
    this.vpOwnerEmail = '';
    this.vpCnicFrontDocUrl = '';
    this.vpCnicBackDocUrl = '';
    this.vpBusinessName = '';
    this.vpBusinessRegistrationNumber = '';
    this.vpFoodLicenseNumber = '';
    this.vpFoodLicenseExpiry = '';
    this.vpFoodLicenseDocUrl = '';
    this.vpBusinessDescription = '';
    this.vpBankName = '';
    this.vpBankBranch = '';
    this.vpAccountTitle = '';
    this.vpAccountNumber = '';
    this.vpIbanNumber = '';
    this.vpFacebookUrl = '';
    this.vpInstagramUrl = '';
    this.vpTiktokUrl = '';
    this.vpWhatsappNumber = '';
    this.vpStoreFrontPhotoUrl = '';
  }

  saveVendorProfile() {
    if (!this.editingStore) return;
    this.vendorSaving = true;
    this.vendorError = '';
    this.vendorSuccessMsg = '';
    const dto: UpsertVendorProfileDto = {
      ownerName: this.vpOwnerName || null,
      ownerCnic: this.vpOwnerCnic || null,
      ownerPhone: this.vpOwnerPhone || null,
      ownerEmail: this.vpOwnerEmail || null,
      cnicFrontDocUrl: this.vpCnicFrontDocUrl || null,
      cnicBackDocUrl: this.vpCnicBackDocUrl || null,
      businessName: this.vpBusinessName || null,
      businessRegistrationNumber: this.vpBusinessRegistrationNumber || null,
      foodLicenseNumber: this.vpFoodLicenseNumber || null,
      foodLicenseExpiry: this.vpFoodLicenseExpiry || null,
      foodLicenseDocUrl: this.vpFoodLicenseDocUrl || null,
      businessDescription: this.vpBusinessDescription || null,
      bankName: this.vpBankName || null,
      bankBranch: this.vpBankBranch || null,
      accountTitle: this.vpAccountTitle || null,
      accountNumber: this.vpAccountNumber || null,
      ibanNumber: this.vpIbanNumber || null,
      facebookUrl: this.vpFacebookUrl || null,
      instagramUrl: this.vpInstagramUrl || null,
      tiktokUrl: this.vpTiktokUrl || null,
      whatsappNumber: this.vpWhatsappNumber || null,
      storeFrontPhotoUrl: this.vpStoreFrontPhotoUrl || null,
    };
    this.vendorService.upsertVendorProfile(this.editingStore.id, dto).subscribe({
      next: (res) => {
        this.vendorProfile = res.data ?? null;
        this.vendorSuccessMsg = 'Vendor profile saved.';
        this.vendorSaving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.vendorError = 'Failed to save vendor profile.';
        this.vendorSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  submitVendorApplication() {
    if (!this.editingStore) return;
    if (!confirm('Submit this vendor profile for review?')) return;
    this.vendorService.submitVendorApplication(this.editingStore.id).subscribe({
      next: () => {
        this.vendorSuccessMsg = 'Application submitted for review.';
        if (this.editingStore) this.loadVendorProfile(this.editingStore.id);
      },
      error: () => {
        this.vendorError = 'Failed to submit application.';
        this.cdr.detectChanges();
      },
    });
  }
}
