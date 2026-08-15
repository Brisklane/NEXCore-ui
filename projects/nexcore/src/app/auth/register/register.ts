import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {
  AuthService, GeoService, CountryDto, CityDto,
  SearchableSelect, SearchableOption,
} from '@nexcore/core';
import { API_CONFIG } from '../../config/api.config';
import * as L from 'leaflet';

interface Country {
  name: string;
  flagUrl: string;
  code: string;
}

/** Most sign-ups are local, so the form opens on Pakistan. */
const DEFAULT_COUNTRY_CODE = 'PK';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableSelect],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  step = 1;
  showBranch = false;
  showBU = false;
  showPopup = false;
  popupMessage = '';
  isLoadingStepOne = false;
  isRegistering = false;

  showMapModal = false;
  map!: L.Map;
  marker?: L.Marker;
  mapSearchQuery = '';
  selectedLatLng: { lat: number; lng: number } | null = null;
  activeCoordIndex = 0;
  pickedMessages: Record<number, string> = {};

  countries: Country[] = [
    { name: 'Pakistan', flagUrl: 'https://flagcdn.com/w40/pk.png', code: '+92' },
    { name: 'United States', flagUrl: 'https://flagcdn.com/w40/us.png', code: '+1' },
    { name: 'United Kingdom', flagUrl: 'https://flagcdn.com/w40/gb.png', code: '+44' },
    { name: 'UAE', flagUrl: 'https://flagcdn.com/w40/ae.png', code: '+971' }
  ];

  selectedPhoneCountry = this.countries[0];
  selectedMobileCountry = this.countries[0];
  selectedFaxCountry = this.countries[0];
  selectedAdminPhoneCountry = this.countries[0];

  showPhoneDropdown = false;
  showMobileDropdown = false;
  showFaxDropdown = false;
  showAdminPhoneDropdown = false;

  companyCode = '';
  companyName = '';
  legalName = '';
  contactPerson = '';
  address = '';
  preferredCurrency = '';
  postalCode = '';
  country = '';       // country NAME — this is what the API stores
  state = '';
  city = '';

  // ---- Country / city lookups (served by the backend's public geo endpoints) ----
  /** ISO 3166-1 alpha-2 of the selected country; drives the city list and currency. */
  countryCode = DEFAULT_COUNTRY_CODE;
  geoCountries: CountryDto[] = [];
  cities: CityDto[] = [];
  /** Every currency in use by a country, so an auto-selected code is always an option. */
  currencies: string[] = [];
  loadingCountries = false;
  loadingCities = false;
  /** Current text in the city search box — drives the empty-state wording. */
  citySearchTerm = '';

  companyLogo: File | null = null;
  companyLogoBase64 = '';
  companyLogoPreview = '';

  coordinatesList = [{ value: '' }];
  radius = '';
  companyEmail = '';
  registrationNo = '';
  phoneNumber = '';
  mobileNumber = '';
  website = '';
  fax = '';
  agreed = false;

  branchCode = 'BR01';
  branchName = 'Main Branch';
  branchType = 'Main';
  branchPhoneNumber = '';
  branchEmail = '';
  branchManagerName = '';
  branchStreetAddress = '';
  branchCity = '';
  branchState = '';
  branchPostalCode = '';
  branchLatitude = '';
  branchLongitude = '';
  branchLogo: File | null = null;
  branchLogoBase64 = '';
  branchLogoPreview = '';
  branchIsActive = true;

  buCode = 'BU01';
  buName = 'Main Business Unit';
  buUnitType = 'Default';
  buDescription = 'Default business unit created with the company registration.';
  buManagerName = '';
  buManagerEmail = '';
  buIsActive = true;

  fullName = '';
  userName = '';
  dateOfBirth = '';
  adminAddress = '';
  gender = '';
  adminPhone = '';
  adminEmail = '';
  adminPassword = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  registeredEmail = '';
  errors: any = {};

  // ---- Sample data seeding ----
  seedSampleData = false;
  showSeedOverlay = false;
  seedCompleted = false;
  seedProgress = 0;
  currentSeedModuleIndex = -1;
  private seedTimer: any = null;

  currentTipIndex = 0;
  tipVisible = true;
  private tipTimer: any = null;

  erpTips: string[] = [
    // Accounting
    'Chart of Accounts structures every financial transaction in your business',
    'Double-entry bookkeeping: every debit has an equal and opposite credit',
    'Aged receivables reports show how long invoices have been outstanding',
    'Bank reconciliation matches your ledger against actual bank statements',
    // CRM
    'Leads are unqualified prospects — Opportunities are leads worth pursuing',
    'Sales pipelines give your team clear visibility into deals at every stage',
    'Activity logging keeps a complete history of every customer interaction',
    'Customer segmentation lets you target the right audience at the right time',
    // Human Resources
    'Payroll automation reduces errors and ensures staff are paid on time',
    'Leave policies can be configured by department, grade, or contract type',
    'Employee self-service lets staff apply for leave and view their payslips',
    'Performance cycles help align individual goals with company objectives',
    // Inventory
    'FIFO — First In, First Out — is the most common stock valuation method',
    'Reorder points trigger purchase orders before your stock runs out',
    'Batch and serial tracking provides end-to-end product traceability',
    'Cycle counting keeps inventory records accurate without full stocktakes',
    // Manufacturing
    'A Bill of Materials (BOM) lists every component needed to build a product',
    'Work orders track each production step from queue through to completion',
    'Capacity planning ensures machines and staff are never over-allocated',
    'Scrap and yield tracking improves production efficiency over time',
    // Procurement
    'Purchase requisitions are internal requests to buy goods or services',
    'Three-way matching verifies PO, goods receipt and invoice before payment',
    'Approved vendor lists keep your supply chain compliant and controlled',
    'Blanket orders let you lock in pricing for recurring supplier purchases',
    // Sales
    'Quotations become sales orders once a customer confirms the price',
    'Invoicing automatically triggers the accounts receivable workflow',
    'Sales dashboards give managers real-time visibility into team performance',
    'Price lists let you offer different rates to different customer groups',
  ];

  seedModules: { name: string; icon: string; done: boolean }[] = [
    { name: 'Accounting', icon: 'fa-solid fa-coins', done: false },
    { name: 'CRM', icon: 'fa-solid fa-handshake', done: false },
    { name: 'Human Resources', icon: 'fa-solid fa-users', done: false },
    { name: 'Inventory', icon: 'fa-solid fa-boxes-stacked', done: false },
    { name: 'Manufacturing', icon: 'fa-solid fa-industry', done: false },
    { name: 'Procurement', icon: 'fa-solid fa-cart-shopping', done: false },
    { name: 'Sales', icon: 'fa-solid fa-chart-line', done: false }
  ];

  get currentSeedModuleName(): string {
    if (this.seedCompleted) return 'All modules seeded successfully!';
    const m = this.seedModules[this.currentSeedModuleIndex];
    return m ? `Seeding ${m.name}...` : 'Preparing sample data...';
  }

  readonly ringCircumference = 2 * Math.PI * 52;

  get ringDashOffset(): number {
    return this.ringCircumference * (1 - this.seedProgress / 100);
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private geo: GeoService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  /**
   * Countries come from the backend's public geo endpoint (all 249 ISO 3166-1
   * entries) and are cached by GeoService for the rest of the session.
   */
  private loadCountries(): void {
    this.loadingCountries = true;

    this.geo.getCountries()
      .pipe(finalize(() => { this.loadingCountries = false; this.cdr.detectChanges(); }))
      .subscribe((list) => {
        this.ngZone.run(() => {
          this.geoCountries = (list ?? [])
            .filter((c) => !!c.code && !!c.name)
            .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

          // Every currency any country uses, so auto-selection always has a match.
          this.currencies = [...new Set(
            this.geoCountries.map((c) => c.currencyCode).filter((c): c is string => !!c)
          )].sort();

          // Open on the default country (falls back to the first one if absent).
          const initial =
            this.geoCountries.find((c) => c.code === DEFAULT_COUNTRY_CODE) ?? this.geoCountries[0];

          if (initial?.code) {
            this.countryCode = initial.code;
            this.onCountryChange();
          }
          this.cdr.detectChanges();
        });
      });
  }

  /**
   * Country picked: store its name for the payload, adopt its ISO 4217 currency, and
   * reload the city list. The currency stays editable — this only pre-fills it.
   */
  onCountryChange(): void {
    const country = this.geoCountries.find((c) => c.code === this.countryCode);

    this.country = country?.name ?? '';
    if (country?.currencyCode) this.preferredCurrency = country.currencyCode;

    this.city = '';
    this.cities = [];

    this.clearError('country');
    this.clearError('city');
    this.clearError('preferredCurrency');

    if (this.countryCode) this.loadCities(this.countryCode);
    this.autoFillBranchAndBusinessUnit();
  }

  /**
   * Opening list for the city picker: the most populous cities in the country. The
   * table holds ~156k cities, so the rest are reached by typing — see onCitySearch.
   */
  private loadCities(countryCode: string): void {
    this.loadingCities = true;
    this.citySearchTerm = '';

    this.geo.getCities(countryCode)
      .pipe(finalize(() => { this.loadingCities = false; this.cdr.detectChanges(); }))
      .subscribe((list) => {
        this.ngZone.run(() => {
          this.cities = list ?? [];
          this.cdr.detectChanges();
        });
      });
  }

  /**
   * Typing in the city box queries the server, so every city in the country is
   * reachable — not just the ones in the opening list. Blanking the box restores it.
   */
  onCitySearch(term: string): void {
    this.citySearchTerm = term;

    if (!term) {
      if (this.countryCode) this.loadCities(this.countryCode);
      return;
    }

    this.loadingCities = true;
    this.geo.searchCities(this.countryCode, term)
      .pipe(finalize(() => { this.loadingCities = false; this.cdr.detectChanges(); }))
      .subscribe((list) => {
        this.ngZone.run(() => {
          this.cities = list ?? [];
          this.cdr.detectChanges();
        });
      });
  }

  onCityChange(): void {
    this.clearError('city');
    this.autoFillBranchAndBusinessUnit();
  }

  // ---- Options for the searchable pickers ----
  get countryOptions(): SearchableOption[] {
    return this.geoCountries.map((c) => ({
      value: c.code ?? '',
      label: c.name ?? '',
      prefix: c.flagEmoji ?? '',
    }));
  }

  get cityOptions(): SearchableOption[] {
    return this.cities.map((c) => ({ value: c.name ?? '', label: c.name ?? '' }));
  }

  get cityEmptyText(): string {
    if (!this.countryCode) return 'Pick a country first';
    return this.citySearchTerm ? 'No city matches' : 'No cities listed';
  }


  openMapModal(index: number) {
    this.activeCoordIndex = index;
    this.showMapModal = true;
    this.selectedLatLng = null;
    this.mapSearchQuery = '';

    setTimeout(() => this.initMap(), 50);
  }

  closeMapModal() {
    this.showMapModal = false;
    this.selectedLatLng = null;

    try {
      if (this.map) this.map.remove();
    } catch {}
  }

  private initMap() {
    try {
      if (this.map) this.map.remove();
    } catch {}

    let defaultLat = 33.6844;
    let defaultLng = 73.0479;
    let defaultZoom = 12;

    const existingVal = this.coordinatesList[this.activeCoordIndex]?.value?.trim();
    if (existingVal && existingVal.includes(',')) {
      const parts = existingVal.split(',');
      const lat = parseFloat(parts[0]?.trim());
      const lng = parseFloat(parts[1]?.trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        defaultLat = lat;
        defaultLng = lng;
        defaultZoom = 14;
        this.selectedLatLng = { lat, lng };
      }
    }

    this.map = L.map('leafletMap', { zoomControl: true }).setView([defaultLat, defaultLng], defaultZoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO'
    }).addTo(this.map);

    if (this.selectedLatLng) {
      this.marker = L.marker([this.selectedLatLng.lat, this.selectedLatLng.lng]).addTo(this.map);
    } else {
      this.marker = undefined;
    }

    this.map.on('click', (e: any) => {
      this.ngZone.run(() => {
        const { lat, lng } = e.latlng;
        this.selectedLatLng = { lat, lng };

        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        } else {
          this.marker = L.marker([lat, lng]).addTo(this.map);
        }

        this.cdr.detectChanges();
      });
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }

  async searchOnMap() {
    const q = this.mapSearchQuery.trim();
    if (!q) return;

    try {
      // Nominatim (OSM) search
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`,
        { headers: { Accept: 'application/json' } }
      );
      const data: any[] = await res.json();
      if (!data?.length) return;

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (isNaN(lat) || isNaN(lng)) return;

      this.selectedLatLng = { lat, lng };

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }

      this.map.setView([lat, lng], 15);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  confirmLocation() {
    if (!this.selectedLatLng) return;

    const { lat, lng } = this.selectedLatLng;
    this.coordinatesList[this.activeCoordIndex].value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    this.pickedMessages[this.activeCoordIndex] = 'Location selected successfully';
    this.clearError('coordinates' + this.activeCoordIndex);

    this.autoFillBranchAndBusinessUnit();
    this.closeMapModal();
    this.cdr.detectChanges();
  }


  toggleBranch() { this.showBranch = !this.showBranch; }
  toggleBU() { this.showBU = !this.showBU; }

  togglePhoneDropdown() { this.showPhoneDropdown = !this.showPhoneDropdown; }
  toggleMobileDropdown() { this.showMobileDropdown = !this.showMobileDropdown; }
  toggleFaxDropdown() { this.showFaxDropdown = !this.showFaxDropdown; }
  toggleAdminPhoneDropdown() { this.showAdminPhoneDropdown = !this.showAdminPhoneDropdown; }

  selectPhoneCountry(c: Country) {
    this.selectedPhoneCountry = c;
    this.showPhoneDropdown = false;
    this.autoFillBranchAndBusinessUnit();
    this.clearError('phoneNumber');
  }

  selectMobileCountry(c: Country) {
    this.selectedMobileCountry = c;
    this.showMobileDropdown = false;
    this.autoFillBranchAndBusinessUnit();
    this.clearError('mobileNumber');
  }

  selectFaxCountry(c: Country) {
    this.selectedFaxCountry = c;
    this.showFaxDropdown = false;
  }

  selectAdminPhoneCountry(c: Country) {
    this.selectedAdminPhoneCountry = c;
    this.showAdminPhoneDropdown = false;
    this.clearError('adminPhone');
  }

  addLocation() {
    this.coordinatesList.push({ value: '' });
    this.autoFillBranchAndBusinessUnit();
  }

  removeLocation(index: number) {
    if (this.coordinatesList.length > 1) {
      this.coordinatesList.splice(index, 1);

      const newMsgs: Record<number, string> = {};
      Object.keys(this.pickedMessages).forEach((k) => {
        const oldIndex = Number(k);
        if (oldIndex < index) newMsgs[oldIndex] = this.pickedMessages[oldIndex];
        else if (oldIndex > index) newMsgs[oldIndex - 1] = this.pickedMessages[oldIndex];
      });
      this.pickedMessages = newMsgs;
    } else {
      this.coordinatesList[0].value = '';
      this.pickedMessages = {};
    }

    this.autoFillBranchAndBusinessUnit();
  }

  clearError(field: string) {
    if (this.errors[field]) {
      delete this.errors[field];
      this.cdr.detectChanges();
    }
  }

  clearAutoFilledErrors() {
    if (this.legalName?.trim()) this.clearError('legalName');

    if (this.branchName?.trim()) this.clearError('branchName');
    if (this.branchCode?.trim()) this.clearError('branchCode');
    if (this.branchPhoneNumber?.trim()) this.clearError('branchPhoneNumber');
    if (this.branchEmail?.trim()) this.clearError('branchEmail');
    if (this.branchManagerName?.trim()) this.clearError('branchManagerName');
    if (this.branchStreetAddress?.trim()) this.clearError('branchStreetAddress');
    if (this.branchCity?.trim()) this.clearError('branchCity');
    if (this.branchState?.trim()) this.clearError('branchState');
    if (this.branchPostalCode?.trim()) this.clearError('branchPostalCode');
    if (this.branchLatitude?.trim()) this.clearError('branchLatitude');
    if (this.branchLongitude?.trim()) this.clearError('branchLongitude');

    if (this.buName?.trim()) this.clearError('buName');
    if (this.buCode?.trim()) this.clearError('buCode');
    if (this.buManagerName?.trim()) this.clearError('buManagerName');
    if (this.buManagerEmail?.trim()) this.clearError('buManagerEmail');

    this.cdr.detectChanges();
  }

  onCompanyCodeChange() {
    this.autoFillBranchAndBusinessUnit();
    this.clearError('companyCode');
  }

  onCompanyLogoSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.companyLogo = file;
      this.branchLogo = file;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';

        this.companyLogoBase64 = base64;
        this.branchLogoBase64 = base64;

        this.companyLogoPreview = result;
        this.branchLogoPreview = result;

        this.clearError('companyLogo');
        this.clearError('branchLogo');
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onBranchLogoSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.branchLogo = file;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.branchLogoBase64 = result.split(',')[1] || '';
        this.branchLogoPreview = result;

        this.clearError('branchLogo');
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  showErrorPopup(message: string) {
    this.popupMessage = message;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }

  extractLatitude(): number | null {
    const val = this.coordinatesList[0].value?.trim();
    if (!val) return null;
    const parts = val.split(',');
    return parts.length >= 2 ? parseFloat(parts[0].trim()) : null;
  }

  extractLongitude(): number | null {
    const val = this.coordinatesList[0].value?.trim();
    if (!val) return null;
    const parts = val.split(',');
    return parts.length >= 2 ? parseFloat(parts[1].trim()) : null;
  }

  generateCompanyCode(): string {
    const cleanedName = (this.companyName || 'COMP')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 6);

    return `${cleanedName}${Date.now()}`;
  }

  isAtLeast18(dateOfBirth: string): boolean {
    if (!dateOfBirth) return false;

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    return age >= 18;
  }

  autoFillBranchAndBusinessUnit() {
    this.legalName = this.companyName;

    const cleanCode = this.companyCode?.trim().replace(/[^a-zA-Z0-9]/g, '') || '';

    this.branchCode = cleanCode ? `${cleanCode}` : 'BR01';
    this.buCode = cleanCode ? `${cleanCode}` : 'BU01';

    this.branchName = this.companyName ? `${this.companyName} Branch` : 'Main Branch';
    this.branchPhoneNumber = this.phoneNumber
      ? `${this.selectedPhoneCountry.code} ${this.phoneNumber}`.trim()
      : '';
    this.branchEmail = this.companyEmail;
    this.branchManagerName = this.contactPerson;
    this.branchStreetAddress = this.address;
    this.branchCity = this.city;
    this.branchState = this.state;
    this.branchPostalCode = this.postalCode;
    this.branchLatitude = String(this.extractLatitude() ?? '');
    this.branchLongitude = String(this.extractLongitude() ?? '');

    this.buName = this.companyName ? `${this.companyName} Business Unit` : 'Main Business Unit';
    this.buManagerName = this.contactPerson;
    this.buManagerEmail = this.companyEmail;

    if (!this.buDescription?.trim()) {
      this.buDescription = 'Default business unit created with the company registration.';
    }

    if (!this.userName?.trim()) {
      this.userName = this.adminEmail;
    }

    this.clearAutoFilledErrors();
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ---- Live password strength / match feedback ----
  // Each rule mirrors the backend password policy so the checklist below the
  // field turns green the moment a requirement is satisfied.
  get passwordRules(): { label: string; ok: boolean }[] {
    const pwd = this.adminPassword || '';

    return [
      { label: '8+ characters', ok: pwd.length >= 8 },
      { label: 'Uppercase letter', ok: /[A-Z]/.test(pwd) },
      { label: 'Lowercase letter', ok: /[a-z]/.test(pwd) },
      { label: 'Number', ok: /\d/.test(pwd) },
      { label: 'Special character', ok: /[^A-Za-z0-9]/.test(pwd) }
    ];
  }

  get isPasswordValid(): boolean {
    return this.passwordRules.every(r => r.ok);
  }

  get passwordsMatch(): boolean {
    return !!this.adminPassword && this.adminPassword === this.confirmPassword;
  }

  onPasswordChange() {
    this.clearError('adminPassword');
    if (this.passwordsMatch) this.clearError('confirmPassword');
  }

  onConfirmPasswordChange() {
    this.clearError('confirmPassword');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validateStepOneFrontend(): boolean {
    this.errors = {};
    this.autoFillBranchAndBusinessUnit();

    // Minimal registration — only the essentials are collected up front.
    // All other company / branch / business-unit details default sensibly and
    // can be edited later in Administration → Manage Company.
    if (!this.companyName.trim()) this.errors.companyName = 'Company name is required';
    if (!this.countryCode.trim()) this.errors.country = 'Country is required';
    // Only enforced when the country actually has a list — never a dead end.
    if (this.cities.length && !this.city.trim()) this.errors.city = 'City is required';
    if (!this.preferredCurrency.trim()) this.errors.preferredCurrency = 'Preferred currency is required';

    // Company code is generated automatically when not supplied.
    if (!this.companyCode.trim()) {
      this.companyCode = this.generateCompanyCode();
      this.autoFillBranchAndBusinessUnit();
    }

    this.cdr.detectChanges();
    return Object.keys(this.errors).length === 0;
  }

  validateStepTwo(): boolean {
    this.errors = {};

    if (!this.fullName.trim()) this.errors.fullName = 'Full name is required';
    if (!this.userName.trim()) this.errors.userName = 'Username is required';

    if (!this.adminEmail.trim()) {
      this.errors.adminEmail = 'Email address is required';
    } else if (!this.validateEmail(this.adminEmail)) {
      this.errors.adminEmail = 'Invalid email address';
    }

    const pwd = this.adminPassword.trim();
    if (!pwd) {
      this.errors.adminPassword = 'Password is required';
    } else if (
      pwd.length < 8 ||
      !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd)
    ) {
      // Mirror the backend rule so users see the requirement before submitting.
      this.errors.adminPassword =
        'Use 8+ characters with an uppercase, lowercase, number and special character.';
    }

    const confirm = this.confirmPassword.trim();
    if (!confirm) {
      this.errors.confirmPassword = 'Please confirm your password';
    } else if (pwd !== confirm) {
      this.errors.confirmPassword = 'Passwords do not match';
    }

    this.cdr.detectChanges();
    return Object.keys(this.errors).length === 0;
  }

  handleBackendMessage(message: string, step: number) {
    if (!message) return;

    const msg = message.toLowerCase();

    if (msg.includes('email') && msg.includes('exist')) {
      if (step === 1) this.errors.companyEmail = message;
      if (step === 2) this.errors.adminEmail = message;
    } else if (msg.includes('company code')) {
      this.errors.companyCode = message;
    } else if (msg.includes('branch code')) {
      this.errors.branchCode = message;
    } else if (msg.includes('branch name')) {
      this.errors.branchName = message;
    } else if (msg.includes('business unit code') || msg.includes('unit code')) {
      this.errors.buCode = message;
    } else if (msg.includes('business unit name') || msg.includes('unit name')) {
      this.errors.buName = message;
    } else if (msg.includes('username')) {
      this.errors.userName = message;
    } else {
      this.showErrorPopup(message);
    }

    this.cdr.detectChanges();
  }

  mapBackendErrors(errors: any) {
    if (!errors) return;

    Object.keys(errors).forEach((key) => {
      const message = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
      const lowerKey = key.toLowerCase();

      if (lowerKey.includes('companyname')) this.errors.companyName = message;
      else if (lowerKey.includes('legalname')) this.errors.legalName = message;
      else if (lowerKey.includes('contactperson')) this.errors.contactPerson = message;
      else if (lowerKey === 'address') this.errors.address = message;
      else if (lowerKey.includes('preferredcurrency') || lowerKey.includes('basecurrencycode')) this.errors.preferredCurrency = message;
      else if (lowerKey === 'postalcode') this.errors.postalCode = message;
      else if (lowerKey === 'country') this.errors.country = message;
      else if (lowerKey === 'state') this.errors.state = message;
      else if (lowerKey === 'city') this.errors.city = message;
      else if (lowerKey.includes('companycode') || lowerKey === 'code') this.errors.companyCode = message;
      else if (lowerKey.includes('companyemail')) this.errors.companyEmail = message;
      else if (lowerKey.includes('registration')) this.errors.registrationNo = message;
      else if (lowerKey === 'phonenumber') this.errors.phoneNumber = message;
      else if (lowerKey === 'mobilenumber') this.errors.mobileNumber = message;
      else if (lowerKey.includes('website')) this.errors.website = message;
      else if (lowerKey.includes('companylogo')) this.errors.companyLogo = message;

      else if (lowerKey.includes('branchname')) this.errors.branchName = message;
      else if (lowerKey.includes('branchcode')) this.errors.branchCode = message;
      else if (lowerKey.includes('branchtype')) this.errors.branchType = message;
      else if (lowerKey.includes('branchphonenumber')) this.errors.branchPhoneNumber = message;
      else if (lowerKey.includes('branchemail')) this.errors.branchEmail = message;
      else if (lowerKey.includes('branchmanagername')) this.errors.branchManagerName = message;
      else if (lowerKey.includes('branchstreetaddress')) this.errors.branchStreetAddress = message;
      else if (lowerKey.includes('branchcity')) this.errors.branchCity = message;
      else if (lowerKey.includes('branchstate')) this.errors.branchState = message;
      else if (lowerKey.includes('branchpostalcode')) this.errors.branchPostalCode = message;
      else if (lowerKey.includes('branchlatitude')) this.errors.branchLatitude = message;
      else if (lowerKey.includes('branchlongitude')) this.errors.branchLongitude = message;
      else if (lowerKey.includes('branchlogo')) this.errors.branchLogo = message;

      else if (lowerKey.includes('buname') || lowerKey.includes('unitname')) this.errors.buName = message;
      else if (lowerKey.includes('bucode') || lowerKey.includes('unitcode')) this.errors.buCode = message;
      else if (lowerKey.includes('buunittype') || lowerKey.includes('unittype')) this.errors.buUnitType = message;
      else if (lowerKey.includes('bumanagername')) this.errors.buManagerName = message;
      else if (lowerKey.includes('bumanageremail')) this.errors.buManagerEmail = message;
      else if (lowerKey.includes('budescription')) this.errors.buDescription = message;

      else if (lowerKey.includes('fullname')) this.errors.fullName = message;
      else if (lowerKey.includes('username')) this.errors.userName = message;
      else if (lowerKey.includes('dateofbirth')) this.errors.dateOfBirth = message;
      else if (lowerKey.includes('adminaddress')) this.errors.adminAddress = message;
      else if (lowerKey.includes('gender')) this.errors.gender = message;
      else if (lowerKey.includes('adminphone')) this.errors.adminPhone = message;
      else if (lowerKey.includes('adminemail') || lowerKey === 'email') this.errors.adminEmail = message;
      else if (lowerKey.includes('password')) this.errors.adminPassword = message;
      else this.errors[key] = message;
    });

    this.cdr.detectChanges();
  }

  /**
   * Fill the fields the minimal form no longer collects with sensible defaults,
   * so the backend still receives a complete, valid payload. Anything left blank
   * here can be filled in later via Administration → Manage Company.
   */
  private applyMinimalDefaults(): void {
    if (!this.legalName.trim()) this.legalName = this.companyName.trim();
    if (!this.contactPerson.trim()) this.contactPerson = (this.fullName || this.companyName).trim();
    if (!this.companyEmail.trim()) this.companyEmail = this.adminEmail.trim();
    if (!this.radius.trim()) this.radius = '0';
  }

  buildValidatePayload() {
    this.applyMinimalDefaults();
    const lat = this.extractLatitude();
    const lng = this.extractLongitude();

    return {
      code: this.companyCode?.trim().replace(/[^a-zA-Z0-9]/g, '') || this.generateCompanyCode(),
      companyName: this.companyName.trim(),
      legalName: this.legalName.trim(),
      registrationNumber: this.registrationNo.trim(),
      baseCurrencyCode: this.preferredCurrency.trim(),
      // Only send a phone/mobile when the user actually typed a number — otherwise an
      // empty field would serialize as just the country code (e.g. "+92"), which fails
      // the backend phone-format rule. Empty string lets the backend skip it.
      phoneNumber: this.phoneNumber.trim() ? `${this.selectedPhoneCountry.code} ${this.phoneNumber}`.trim() : '',
      mobileNumber: this.mobileNumber.trim() ? `${this.selectedMobileCountry.code} ${this.mobileNumber}`.trim() : '',
      contactPerson: this.contactPerson.trim(),
      email: this.companyEmail.trim(),
      websiteUrl: this.website.trim(),
      companyLogo: this.companyLogoBase64,
      latitude: lat ?? 0,
      longitude: lng ?? 0,
      radiusInMeters: Number(this.radius),
      streetAddress: this.address.trim(),
      city: this.city.trim(),
      state: this.state.trim(),
      country: this.country.trim(),
      postalCode: this.postalCode.trim(),
      branches: [{
        code: this.branchCode.trim(),
        name: this.branchName.trim(),
        branchType: this.branchType.trim(),
        phoneNumber: this.branchPhoneNumber.trim(),
        email: this.branchEmail.trim(),
        managerName: this.branchManagerName.trim(),
        branchLogo: this.branchLogoBase64,
        streetAddress: this.branchStreetAddress.trim(),
        city: this.branchCity.trim(),
        state: this.branchState.trim(),
        postalCode: this.branchPostalCode.trim(),
        latitude: Number(this.branchLatitude),
        longitude: Number(this.branchLongitude),
        isActive: this.branchIsActive,
        businessUnits: [{
          code: this.buCode.trim(),
          name: this.buName.trim(),
          unitType: this.buUnitType.trim(),
          description: this.buDescription.trim(),
          managerName: this.buManagerName.trim(),
          managerEmail: this.buManagerEmail.trim(),
          isActive: this.buIsActive
        }]
      }]
    };
  }

  buildCreateCompanyPayload() {
    const companyPayload = this.buildValidatePayload();

    return {
      company: {
        ...companyPayload,
        companyLogo: this.companyLogoBase64,
        branches: companyPayload.branches.map((branch, index) => ({
          ...branch,
          branchLogo: index === 0 ? this.branchLogoBase64 : ''
        }))
      },
      user: {
        email: this.adminEmail.trim(),
        password: this.adminPassword.trim(),
        fullName: this.fullName.trim(),
        userName: this.userName.trim(),
        gender: this.gender.trim(),
        address: this.adminAddress.trim(),
        dateOfBirth: this.dateOfBirth,
        phoneNumber: this.adminPhone.trim() ? `${this.selectedAdminPhoneCountry.code} ${this.adminPhone}`.trim() : ''
      },
      includeSampleData: this.seedSampleData
    };
  }

  nextStep() {
    console.log('nextStep called');
    console.log('validate endpoint:', API_CONFIG.company.validate);

    this.autoFillBranchAndBusinessUnit();

    if (!this.validateStepOneFrontend()) return;

    const payload = this.buildValidatePayload();

    this.isLoadingStepOne = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.authService.validateCompany(payload)
        .pipe(
          finalize(() => {
            this.isLoadingStepOne = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (res) => {
            this.ngZone.run(() => {
              if (res?.success) this.step = 2;
              else this.handleBackendMessage(res?.message || 'Validation failed', 1);
              this.cdr.detectChanges();
            });
          },
          error: (err) => {
            this.ngZone.run(() => {
              this.mapBackendErrors(err?.error?.errors);
              this.handleBackendMessage(err?.error?.message || 'Validation failed', 1);
              this.cdr.detectChanges();
            });
          }
        });
    }, 0);
  }

  prevStep() { this.step = 1; }

  register() {
    if (!this.validateStepTwo()) return;

    this.isRegistering = true;
    const payload = this.buildCreateCompanyPayload();

    if (this.seedSampleData) {
      this.showSeedOverlay = true;
      this.seedModules.forEach(m => m.done = false);
      this.seedProgress = 0;
      this.seedCompleted = false;
      this.currentSeedModuleIndex = 0;
      this.runSeedAnimation();
      this.startTipCycling();
    }

    this.authService.createCompany(payload)
      .pipe(
        finalize(() => {
          this.isRegistering = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success) {
              this.registeredEmail = this.adminEmail;

              if (this.seedSampleData) {
                this.completeSeedAnimation(() => {
                  this.stopTipCycling();
                  this.showSeedOverlay = false;
                  this.step = 3;
                  this.cdr.detectChanges();
                });
              } else {
                this.step = 3;
              }
            } else {
              this.showSeedOverlay = false;
              this.stopSeedAnimation();
              this.handleBackendMessage(res?.message, 2);
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.showSeedOverlay = false;
            this.stopSeedAnimation();
            this.mapBackendErrors(err?.error?.errors);
            this.handleBackendMessage(err?.error?.message || 'Registration failed', 2);
            this.cdr.detectChanges();
          });
        }
      });
  }

  private runSeedAnimation() {
    const totalModules = this.seedModules.length;

    this.seedTimer = setInterval(() => {
      this.ngZone.run(() => {
        if (this.seedProgress >= 85) {
          clearInterval(this.seedTimer);
          this.seedTimer = null;
          return;
        }

        this.seedProgress = Math.min(85, this.seedProgress + 1);

        const reachedIndex = Math.min(
          totalModules - 1,
          Math.floor((this.seedProgress / 85) * (totalModules - 1))
        );

        for (let i = 0; i < reachedIndex; i++) {
          this.seedModules[i].done = true;
        }
        this.currentSeedModuleIndex = reachedIndex;
        this.cdr.detectChanges();
      });
    }, 140);
  }

  private completeSeedAnimation(onDone: () => void) {
    if (this.seedTimer) {
      clearInterval(this.seedTimer);
      this.seedTimer = null;
    }

    const fillTimer = setInterval(() => {
      this.ngZone.run(() => {
        this.seedProgress = Math.min(100, this.seedProgress + 3);

        const totalModules = this.seedModules.length;
        const stepPerModule = 100 / totalModules;
        for (let i = 0; i < totalModules; i++) {
          if (this.seedProgress >= (i + 1) * stepPerModule) {
            this.seedModules[i].done = true;
          }
        }

        if (this.seedProgress >= 100) {
          clearInterval(fillTimer);
          this.seedModules.forEach(m => m.done = true);
          this.seedCompleted = true;
          this.currentSeedModuleIndex = totalModules - 1;
          this.cdr.detectChanges();
          setTimeout(() => onDone(), 900);
        }

        this.cdr.detectChanges();
      });
    }, 50);
  }

  private stopSeedAnimation() {
    if (this.seedTimer) {
      clearInterval(this.seedTimer);
      this.seedTimer = null;
    }
    this.stopTipCycling();
    this.seedProgress = 0;
    this.seedCompleted = false;
    this.currentSeedModuleIndex = -1;
    this.seedModules.forEach(m => m.done = false);
  }

  private startTipCycling() {
    this.currentTipIndex = 0;
    this.tipVisible = true;
    this.tipTimer = setInterval(() => {
      this.ngZone.run(() => {
        this.tipVisible = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.currentTipIndex = (this.currentTipIndex + 1) % this.erpTips.length;
          this.tipVisible = true;
          this.cdr.detectChanges();
        }, 350);
      });
    }, 3200);
  }

  private stopTipCycling() {
    if (this.tipTimer) {
      clearInterval(this.tipTimer);
      this.tipTimer = null;
    }
  }

  goToLogin() {
    if (this.seedTimer) {
      clearInterval(this.seedTimer);
      this.seedTimer = null;
    }
    this.stopTipCycling();
    this.router.navigate(['/login']);
  }
}