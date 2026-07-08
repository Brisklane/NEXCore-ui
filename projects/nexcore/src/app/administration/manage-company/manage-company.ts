import { Component, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { API_CONFIG } from '../../config/api.config';
import { AuthService } from '@nexcore/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';

interface CountryUI {
  name: string;
  code: string;
  flagUrl: string;
}

interface BranchForm {
  branchId?: string;
  code: string;
  name: string;
  branchType: string;
  phoneCountry?: CountryUI;
  showPhoneDropdown?: boolean;
  phoneNumber: string;
  email: string;
  managerName: string;
  branchLogo: string;
  branchLogoPreview?: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
  businessUnits: BusinessUnitForm[];
  showBUSection?: boolean;
}

interface BusinessUnitForm {
  businessUnitId?: string;
  code: string;
  name: string;
  unitType: string;
  description: string;
  managerName: string;
  managerEmail: string;
  isActive: boolean;
}

@Component({
  standalone: true,
  selector: 'app-manage-company',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-company.html',
  styleUrls: ['./manage-company.css'],
})
export class ManageCompany implements OnInit {
  companyId = '';

  companyCode = '';
  companyName = '';
  legalName = '';
  contactPerson = '';
  address = '';
  preferredCurrency = '';
  postalCode = '';
  country = '';
  state = '';
  city = '';

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

  // Map Picker
  showMapModal = false;
  map!: L.Map;
  marker?: L.Marker;
  mapSearchQuery = '';
  selectedLatLng: { lat: number; lng: number } | null = null;
  activeCoordIndex = 0;
  pickedMessages: Record<number, string> = {};

  countries: CountryUI[] = [
    { name: 'Pakistan', code: '+92', flagUrl: 'https://flagcdn.com/w40/pk.png' },
    { name: 'United States', code: '+1', flagUrl: 'https://flagcdn.com/w40/us.png' },
    { name: 'United Kingdom', code: '+44', flagUrl: 'https://flagcdn.com/w40/gb.png' },
    { name: 'UAE', code: '+971', flagUrl: 'https://flagcdn.com/w40/ae.png' },
  ];

  selectedPhoneCountry: CountryUI = this.countries[0];
  selectedMobileCountry: CountryUI = this.countries[0];
  selectedFaxCountry: CountryUI = this.countries[0];

  showPhoneDropdown = false;
  showMobileDropdown = false;
  showFaxDropdown = false;

  locationData: Record<string, Record<string, string[]>> = {
    Pakistan: {
      Punjab: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan'],
      Sindh: ['Karachi', 'Hyderabad', 'Sukkur'],
      'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan'],
      Balochistan: ['Quetta', 'Khuzdar'],
      'Islamabad Capital Territory': ['Islamabad'],
    },
  };

  countryOptions: string[] = Object.keys(this.locationData);
  stateOptions: string[] = [];
  cityOptions: string[] = [];

  branches: BranchForm[] = [this.createDefaultBranch()];

  showBranchSection = false;

  activeTab: 'profile' | 'contact' | 'structure' = 'profile';

  setTab(tab: 'profile' | 'contact' | 'structure'): void {
    this.activeTab = tab;
  }

  isSaving = false;
  isLoadingCompany = false;

  errors: any = {};

  toastMessage = '';
  private toastTimer: any;

  private lastAutoContactPerson = '';
  private lastAutoCompanyEmail = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.companyId = this.authService.getCompanyId() || '';
    if (!this.companyId) {
      this.redirectToLogin();
      return;
    }

    this.showBranchSection = false;

    if (!this.country) this.country = 'Pakistan';
    this.updateStateOptions();
    this.updateCityOptions();

    this.loadCompany();
  }

  // REDIRECT TO LOGIN 
  private redirectToLogin() {
    try {
      this.authService.logout();
    } catch {}
    this.router.navigate(['/login']);
  }

  // MAP PICKER 

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
    let zoom = 12;

    const existingVal = (this.coordinatesList[this.activeCoordIndex]?.value || '').trim();
    if (existingVal.includes(',')) {
      const parts = existingVal.split(',');
      const lat = parseFloat(parts[0]?.trim());
      const lng = parseFloat(parts[1]?.trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        defaultLat = lat;
        defaultLng = lng;
        zoom = 14;
        this.selectedLatLng = { lat, lng };
      }
    }

    this.map = L.map('leafletMapManageCompany', { zoomControl: true }).setView(
      [defaultLat, defaultLng],
      zoom
    );

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
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

        if (this.marker) this.marker.setLatLng([lat, lng]);
        else this.marker = L.marker([lat, lng]).addTo(this.map);

        this.cdr.detectChanges();
      });
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }

  async searchOnMapManageCompany() {
    const q = this.mapSearchQuery.trim();
    if (!q) return;

    try {
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

      if (this.marker) this.marker.setLatLng([lat, lng]);
      else this.marker = L.marker([lat, lng]).addTo(this.map);

      this.map.setView([lat, lng], 15);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  confirmLocationManageCompany() {
    if (!this.selectedLatLng) return;

    const { lat, lng } = this.selectedLatLng;
    this.coordinatesList[this.activeCoordIndex].value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    this.pickedMessages[this.activeCoordIndex] = 'Location selected successfully';
    this.clearError('coordinates' + this.activeCoordIndex);

    this.autoFillBranchAndBusinessUnit();
    this.closeMapModal();
    this.cdr.detectChanges();
  }

  private showToast(msg: string) {
    this.toastMessage = msg;
    this.cdr.detectChanges();
  }

  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  private alnum(raw: string): string {
    return (raw || '').trim().replace(/[^a-zA-Z0-9]/g, '');
  }

  private splitPhone(full: string): { country: CountryUI; number: string } {
    const val = (full || '').trim();
    const found = this.countries.find((c) => val.startsWith(c.code));
    if (!found) return { country: this.countries[0], number: val };
    return { country: found, number: val.slice(found.code.length).trim() };
  }

  validateEmail(email: string): boolean {
    return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  clearError(field: string) {
    if (this.errors[field]) {
      delete this.errors[field];
      this.cdr.detectChanges();
    }
  }

  private branchPayloadCode(i: number): string {
    const c = this.alnum(this.companyCode);
    const num = this.pad2(i + 1);
    return c ? `${c}BR${num}` : `BR${num}`;
  }

  private buPayloadCode(j: number): string {
    const c = this.alnum(this.companyCode);
    const num = this.pad2(j + 1);
    return c ? `${c}BU${num}` : `BU${num}`;
  }

  private createDefaultBranch(): BranchForm {
    return {
      branchId: undefined,
      code: this.companyCode,
      name: 'Main Branch',
      branchType: 'Main',
      phoneCountry: this.countries[0],
      showPhoneDropdown: false,
      phoneNumber: '',
      email: '',
      managerName: '',
      branchLogo: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      latitude: '',
      longitude: '',
      isActive: true,
      businessUnits: [this.createDefaultBusinessUnit()],
      showBUSection: false,
    };
  }

  private createDefaultBusinessUnit(): BusinessUnitForm {
    return {
      businessUnitId: undefined,
      code: this.companyCode,
      name: 'Main Business Unit',
      unitType: 'Default',
      description: 'Default business unit created with the company.',
      managerName: (this.contactPerson || '').trim(),
      managerEmail: (this.companyEmail || '').trim(),
      isActive: true,
    };
  }

  // TOGGLE SECTIONS
  toggleBranchContainer() {
    this.showBranchSection = !this.showBranchSection;
  }

  toggleBUContainer(branch: BranchForm) {
    branch.showBUSection = !branch.showBUSection;
  }

  // LOGO 
  onCompanyLogoSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      this.companyLogoBase64 = base64;
      this.companyLogoPreview = result;

      if (this.branches.length && !this.branches[0].branchLogo) {
        this.branches[0].branchLogo = base64;
      }

      this.clearError('companyLogo');
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  onBranchLogoSelected(event: any, index: number) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.branches[index].branchLogo = (reader.result as string).split(',')[1] || '';
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  // PHONE DROPDOWNS 
  toggleCompanyPhoneDropdown(e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.showPhoneDropdown = !this.showPhoneDropdown;
  }

  selectCompanyPhoneCountry(c: CountryUI, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.selectedPhoneCountry = c;
    this.showPhoneDropdown = false;
    if (this.branches.length) this.branches[0].phoneCountry = c;
  }

  toggleMobilePhoneDropdown(e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.showMobileDropdown = !this.showMobileDropdown;
  }

  selectMobilePhoneCountry(c: CountryUI, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.selectedMobileCountry = c;
    this.showMobileDropdown = false;
  }

  toggleFaxPhoneDropdown(e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.showFaxDropdown = !this.showFaxDropdown;
  }

  selectFaxPhoneCountry(c: CountryUI, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.selectedFaxCountry = c;
    this.showFaxDropdown = false;
  }

  toggleBranchPhoneDropdown(i: number, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.branches[i].showPhoneDropdown = !this.branches[i].showPhoneDropdown;
  }

  selectBranchPhoneCountry(i: number, c: CountryUI, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.branches[i].phoneCountry = c;
    this.branches[i].showPhoneDropdown = false;
  }

  // LOCATION
  onCountrySelected(value: string) {
    this.country = value;
    this.clearError('country');
    this.state = '';
    this.city = '';
    this.updateStateOptions();
    this.updateCityOptions();
    this.autoFillBranchAndBusinessUnit();
  }

  onStateSelected(value: string) {
    this.state = value;
    this.clearError('state');
    this.city = '';
    this.updateCityOptions();
    this.autoFillBranchAndBusinessUnit();
  }

  private updateStateOptions() {
    const map = this.locationData[this.country] || {};
    this.stateOptions = Object.keys(map);
  }

  private updateCityOptions() {
    const map = this.locationData[this.country] || {};
    this.cityOptions = this.state ? map[this.state] || [] : [];
  }

  addLocation() {
    this.coordinatesList.push({ value: '' });
    this.autoFillBranchAndBusinessUnit();
  }

  removeLocation(i: number) {
    if (this.coordinatesList.length > 1) {
      this.coordinatesList.splice(i, 1);

      const next: Record<number, string> = {};
      Object.keys(this.pickedMessages).forEach((k) => {
        const idx = Number(k);
        if (idx < i) next[idx] = this.pickedMessages[idx];
        else if (idx > i) next[idx - 1] = this.pickedMessages[idx];
      });
      this.pickedMessages = next;
    } else {
      this.coordinatesList[0].value = '';
      this.pickedMessages = {};
    }
    this.autoFillBranchAndBusinessUnit();
  }

  extractLatitude(): number | null {
    const val = this.coordinatesList[0].value?.trim();
    if (!val) return null;
    const parts = val.split(',');
    if (parts.length < 2) return null;
    const lat = parseFloat(parts[0].trim());
    return Number.isFinite(lat) ? lat : null;
  }

  extractLongitude(): number | null {
    const val = this.coordinatesList[0].value?.trim();
    if (!val) return null;
    const parts = val.split(',');
    if (parts.length < 2) return null;
    const lng = parseFloat(parts[1].trim());
    return Number.isFinite(lng) ? lng : null;
  }

  autoFillBranchAndBusinessUnit() {
    this.legalName = this.companyName;

    this.syncCodes();

    const main = this.branches[0];
    if (main) {
      main.name = this.companyName ? `${this.companyName} Branch` : 'Main Branch';
      main.email = this.companyEmail;
      main.managerName = this.contactPerson;
      main.streetAddress = this.address;
      main.city = this.city;
      main.state = this.state;
      main.postalCode = this.postalCode;
      main.phoneNumber = this.phoneNumber;
      main.phoneCountry = this.selectedPhoneCountry;

      const lat = this.extractLatitude();
      const lng = this.extractLongitude();
      main.latitude = lat !== null ? String(lat) : '';
      main.longitude = lng !== null ? String(lng) : '';
    }

    const newN = (this.contactPerson || '').trim();
    const newE = (this.companyEmail || '').trim();

    // Default the first branch's first business unit; keep manager fields in sync with the contact.
    this.branches.forEach((b, bIdx) => {
      b.businessUnits.forEach((bu, idx) => {
        if (bIdx === 0 && idx === 0)
          bu.name = this.companyName ? `${this.companyName} Business Unit` : 'Main Business Unit';
        if (!bu.description?.trim()) bu.description = 'Default business unit created with the company.';

        if (!bu.managerName?.trim() || bu.managerName.trim() === this.lastAutoContactPerson) {
          bu.managerName = newN;
        }
        if (!bu.managerEmail?.trim() || bu.managerEmail.trim() === this.lastAutoCompanyEmail) {
          bu.managerEmail = newE;
        }
      });
    });

    this.lastAutoContactPerson = newN;
    this.lastAutoCompanyEmail = newE;
  }

  /** Mirror the company code onto every branch and its business units (display only). */
  private syncCodes() {
    this.branches.forEach((b) => {
      b.code = this.companyCode;
      b.businessUnits.forEach((u) => (u.code = this.companyCode));
    });
  }

  onCompanyCodeChange() {
    this.syncCodes();
    this.clearError('companyCode');
    this.cdr.detectChanges();
  }

  // BRANCHES
  addBranch() {
    const b = this.createDefaultBranch();
    b.code = this.companyCode;
    b.name = '';                  // user names it (validated inline)
    b.branchType = 'Branch';
    // Pre-fill the API's required fields from the company so a new branch is savable
    // after just entering a name (the company already supplies valid values for these).
    b.email = (this.companyEmail || '').trim();
    b.managerName = (this.contactPerson || '').trim();
    b.phoneCountry = this.selectedPhoneCountry;
    b.phoneNumber = this.phoneNumber;
    b.branchLogo = this.companyLogoBase64;
    b.streetAddress = (this.address || '').trim();
    b.city = (this.city || '').trim();
    b.state = (this.state || '').trim();
    b.postalCode = (this.postalCode || '').trim();
    const lat = this.extractLatitude();
    const lng = this.extractLongitude();
    b.latitude = lat !== null ? String(lat) : '';
    b.longitude = lng !== null ? String(lng) : '';
    this.branches.push(b);
  }

  removeBranch(i: number) {
    if (this.branches.length > 1) this.branches.splice(i, 1);
  }

  // BUSINESS UNITS
  addBusinessUnit(branch: BranchForm) {
    const bu = this.createDefaultBusinessUnit();
    bu.code = this.companyCode;
    bu.name = '';                      // user names it (validated inline); other fields keep
    bu.unitType = 'Department';        //  sensible defaults so the API's required-field checks pass
    bu.description = 'Business unit';
    bu.managerName = (this.contactPerson || '').trim();
    bu.managerEmail = (this.companyEmail || '').trim();
    branch.businessUnits.push(bu);
  }

  removeBusinessUnit(branch: BranchForm, j: number) {
    if (branch.businessUnits.length > 1) branch.businessUnits.splice(j, 1);
  }

  // VALIDATION 
  private validateForm(): boolean {
    this.errors = {};

    if (!this.companyName.trim()) this.errors.companyName = 'Company name is required';
    if (!this.legalName.trim()) this.errors.legalName = 'Legal name is required';
    if (!this.contactPerson.trim()) this.errors.contactPerson = 'Contact person is required';
    if (!this.address.trim()) this.errors.address = 'Address is required';
    if (!this.preferredCurrency.trim()) this.errors.preferredCurrency = 'Preferred currency is required';
    if (!this.postalCode.trim()) this.errors.postalCode = 'Postal code is required';
    if (!this.country.trim()) this.errors.country = 'Country is required';
    if (!this.state.trim()) this.errors.state = 'State is required';
    if (!this.city.trim()) this.errors.city = 'City is required';
    // Radius is optional.

    if (!this.companyEmail.trim()) this.errors.companyEmail = 'Company email is required';
    else if (!this.validateEmail(this.companyEmail)) this.errors.companyEmail = 'Invalid company email';

    if (!this.registrationNo.trim()) this.errors.registrationNo = 'Registration number is required';
    if (!this.phoneNumber.trim()) this.errors.phoneNumber = 'Phone number is required';

    // Coordinates (latitude/longitude) are optional.

    const seenBranchNames = new Set<string>();
    this.branches.forEach((b, i) => {
      if (!b.name.trim()) this.errors['branchName' + i] = 'Branch name is required';
      if (b.email && !this.validateEmail(b.email)) this.errors['branchEmail' + i] = 'Invalid branch email';

      // Branch name unique within the company
      const bKey = b.name.trim().toLowerCase();
      if (bKey) {
        if (seenBranchNames.has(bKey)) this.errors['branchName' + i] = 'Branch name must be unique';
        else seenBranchNames.add(bKey);
      }

      const seenUnitNames = new Set<string>();
      b.businessUnits.forEach((u, j) => {
        if (!u.name.trim()) this.errors[`buName${i}_${j}`] = 'Unit name is required';
        if (u.managerEmail && !this.validateEmail(u.managerEmail))
          this.errors[`buManagerEmail${i}_${j}`] = 'Invalid manager email';

        // Business unit name unique within its branch
        const uKey = u.name.trim().toLowerCase();
        if (uKey) {
          if (seenUnitNames.has(uKey)) this.errors[`buName${i}_${j}`] = 'Unit name must be unique in this branch';
          else seenUnitNames.add(uKey);
        }
      });
    });

    this.cdr.detectChanges();
    return Object.keys(this.errors).length === 0;
  }

  // PAYLOAD 
  private buildUpdatePayload() {
    const lat = this.extractLatitude();
    const lng = this.extractLongitude();

    return {
      code: this.companyCode?.trim() ? this.alnum(this.companyCode) : null,
      companyName: this.companyName.trim(),
      legalName: this.legalName.trim(),
      registrationNumber: this.registrationNo.trim(),
      baseCurrencyCode: this.preferredCurrency.trim(),
      phoneNumber: `${this.selectedPhoneCountry.code} ${this.phoneNumber}`.trim(),
      mobileNumber: `${this.selectedMobileCountry.code} ${this.mobileNumber}`.trim(),
      fax: `${this.selectedFaxCountry.code} ${this.fax}`.trim(),
      contactPerson: this.contactPerson.trim(),
      email: this.companyEmail.trim(),
      websiteUrl: this.website.trim(),
      companyLogo: this.companyLogoBase64,
      latitude: lat ?? 0,
      longitude: lng ?? 0,
      radiusInMeters: Number(this.radius || 0),
      streetAddress: this.address.trim(),
      city: this.city.trim(),
      state: this.state.trim(),
      postalCode: this.postalCode.trim(),

      branches: this.branches.map((b, idx) => ({
        // New rows send null id (API treats null/empty as "create") and null code
        // (the (CompanyId, Code) unique index ignores null, avoiding collisions). The API
        // does not update codes for existing rows, so the value sent there is irrelevant.
        branchId: b.branchId ?? null,
        code: b.branchId ? this.branchPayloadCode(idx) : null,
        name: b.name.trim(),
        branchType: (b.branchType || '').trim(),
        phoneNumber: `${b.phoneCountry?.code || ''} ${b.phoneNumber}`.trim(),
        email: (b.email || '').trim(),
        managerName: (b.managerName || '').trim(),
        branchLogo: b.branchLogo,
        streetAddress: (b.streetAddress || '').trim(),
        city: (b.city || '').trim(),
        state: (b.state || '').trim(),
        postalCode: (b.postalCode || '').trim(),
        latitude: Number.isFinite(Number(b.latitude)) ? Number(b.latitude) : 0,
        longitude: Number.isFinite(Number(b.longitude)) ? Number(b.longitude) : 0,
        isActive: b.isActive,
        businessUnits: b.businessUnits.map((u, j) => ({
          businessUnitId: u.businessUnitId ?? null,
          code: u.businessUnitId ? this.buPayloadCode(j) : null,
          name: u.name.trim(),
          unitType: (u.unitType || '').trim(),
          description: (u.description || '').trim(),
          managerName: (u.managerName || '').trim(),
          managerEmail: (u.managerEmail || '').trim(),
          isActive: u.isActive,
        })),
      })),
    };
  }

  // API ERRORS 
  private applyApiErrors(err: any) {
    const msg: string = err?.error?.message || 'Request failed';
    delete this.errors.api;

    const lower = msg.toLowerCase();

    if (lower.includes('company') && lower.includes('code')) {
      this.errors.companyCode = msg;
      this.cdr.detectChanges();
      return;
    }
    if (lower.includes('branch') && lower.includes('code')) {
      this.branches.forEach((_, i) => (this.errors['branchCode' + i] = msg));
      this.cdr.detectChanges();
      return;
    }
    if ((lower.includes('business unit') || lower.includes('unit')) && lower.includes('code')) {
      this.branches.forEach((b, i) => b.businessUnits.forEach((_, j) => (this.errors[`buCode${i}_${j}`] = msg)));
      this.cdr.detectChanges();
      return;
    }

    this.errors.api = msg;
    this.cdr.detectChanges();
  }

  // SAVE 
  saveChanges() {
    if (!this.validateForm()) return;
    if (!this.companyId) return;

    const token = this.authService.getToken();
    if (!token) {
      this.redirectToLogin();
      return;
    }

    // A newly-added branch changes the user's available context, so force a fresh login afterwards.
    const hasNewBranch = this.branches.some((b) => !b.branchId);

    const payload = this.buildUpdatePayload();
    this.isSaving = true;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .put(API_CONFIG.company.update(this.companyId), payload, { headers })
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          if (hasNewBranch) {
            // New branch added → sign out and return to login so the new context is picked up.
            this.authService.logout().subscribe({
              next: () => this.router.navigate(['/login']),
              error: () => this.router.navigate(['/login']),
            });
            return;
          }
          this.showToast('Updated successfully');
        },
        error: (err) => {
          console.error('Update error', err);
          if (err.status === 400 || err.status === 409) {
            this.applyApiErrors(err);
            return;
          }
          if (err.status === 401) {
            this.redirectToLogin();
            return;
          }
          this.errors.api = 'Something went wrong. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }

  // LOAD COMPANY
  private loadCompany() {
    const token = this.authService.getToken();
    if (!token) {
      this.redirectToLogin();
      return;
    }

    this.isLoadingCompany = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get(API_CONFIG.company.getById(this.companyId), { headers })
      .pipe(
        finalize(() => {
          this.isLoadingCompany = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data;
          if (!data) return;

          this.companyCode = data?.code ?? '';
          this.companyName = data?.companyName ?? '';
          this.legalName = data?.legalName ?? '';
          this.registrationNo = data?.registrationNumber ?? '';
          this.preferredCurrency = data?.baseCurrencyCode ?? '';
          this.contactPerson = data?.contactPerson ?? '';
          this.companyEmail = data?.email ?? '';
          this.website = data?.websiteUrl ?? '';
          this.address = data?.streetAddress ?? '';
          this.city = data?.city ?? '';
          this.state = data?.state ?? '';
          this.postalCode = data?.postalCode ?? '';
          this.radius = String(data?.radiusInMeters ?? '');

          this.companyLogoBase64 = data?.companyLogo ?? '';
          this.companyLogoPreview = this.companyLogoBase64
            ? `data:image/*;base64,${this.companyLogoBase64}`
            : '';

          const phone = this.splitPhone(data?.phoneNumber);
          this.selectedPhoneCountry = phone.country;
          this.phoneNumber = phone.number;

          const mobile = this.splitPhone(data?.mobileNumber);
          this.selectedMobileCountry = mobile.country;
          this.mobileNumber = mobile.number;

          this.selectedFaxCountry = this.selectedPhoneCountry;
          this.fax = this.phoneNumber;

          const lat = data?.latitude;
          const lng = data?.longitude;
          this.coordinatesList = [
            {
              value: lat != null && lng != null ? `${lat}, ${lng}` : '',
            },
          ];

          this.pickedMessages = {};

          const defName = (this.contactPerson || '').trim();
          const defEmail = (this.companyEmail || '').trim();

          // Load ALL branches, each with its OWN business units (nested per branch).
          const apiBranches = Array.isArray(data?.branches) ? data.branches : [];

          this.branches = apiBranches.length
            ? apiBranches.map((b: any) => {
                const buList = Array.isArray(b?.businessUnits) ? b.businessUnits : [];
                const businessUnits: BusinessUnitForm[] = buList.length
                  ? buList.map((u: any) => ({
                      businessUnitId: u?.businessUnitId,
                      code: this.companyCode,
                      name: u?.name ?? 'Main Business Unit',
                      unitType: u?.unitType ?? 'Default',
                      description: u?.description ?? '',
                      managerName: u?.managerName?.trim() ? u.managerName : defName,
                      managerEmail: u?.managerEmail?.trim() ? u.managerEmail : defEmail,
                      isActive: u?.isActive ?? true,
                    }))
                  : [this.createDefaultBusinessUnit()];

                return {
                  branchId: b?.branchId,
                  code: this.companyCode,
                  name: b?.name ?? 'Main Branch',
                  branchType: b?.branchType ?? 'Main',
                  phoneCountry: this.selectedPhoneCountry,
                  showPhoneDropdown: false,
                  phoneNumber: this.phoneNumber,
                  email: b?.email ?? '',
                  managerName: b?.managerName ?? '',
                  branchLogo: b?.branchLogo ?? '',
                  streetAddress: b?.streetAddress ?? '',
                  city: b?.city ?? '',
                  state: b?.state ?? '',
                  postalCode: b?.postalCode ?? '',
                  latitude: String(b?.latitude ?? ''),
                  longitude: String(b?.longitude ?? ''),
                  isActive: b?.isActive ?? true,
                  businessUnits,
                  showBUSection: false,
                } as BranchForm;
              })
            : [this.createDefaultBranch()];

          this.lastAutoContactPerson = defName;
          this.lastAutoCompanyEmail = defEmail;

          this.syncCodes();

          this.updateStateOptions();
          this.updateCityOptions();

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('GET company error', err);
          if (err.status === 401) {
            this.redirectToLogin();
            return;
          }
          this.errors.api = 'Failed to load company data.';
          this.cdr.detectChanges();
        },
      });
  }
}