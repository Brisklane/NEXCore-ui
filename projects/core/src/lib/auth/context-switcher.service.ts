import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

export interface CompanyOption {
  companyId: string;
  companyName: string;
}

export interface BranchOption {
  id: string;
  name: string;
  code: string;
}

export interface BusinessUnitOption {
  id: string;
  name: string;
  code: string;
}

/**
 * Drives the company / branch / business-unit context switcher in the header.
 *
 * Companies come from Core's tenant-scoped `GET /api/Company` (every company in the
 * user's tenant). Branches and business units come from Core filtered by the selected
 * company / branch. Switching posts to `POST /api/Auth/switch-context`, which validates
 * the chain against the tenant server-side and returns a fresh scoped JWT.
 */
@Injectable({ providedIn: 'root' })
export class ContextSwitcherService {
  readonly contextChanged$ = new Subject<void>();

  companies = signal<CompanyOption[]>([]);
  branches = signal<BranchOption[]>([]);
  businessUnits = signal<BusinessUnitOption[]>([]);

  selectedCompanyId = signal<string>('');
  selectedBranchId = signal<string>('');
  selectedBusinessUnitId = signal<string>('');

  isSwitching = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async loadCompanies(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<any>(API_CONFIG.company.list)
    );
    const raw: any[] = res?.data ?? [];
    const list: CompanyOption[] = raw.map(c => ({
      companyId: c.id ?? c.companyId,
      companyName: c.companyName ?? c.name,
    }));
    this.companies.set(list);

    const user = this.authService.getUser();
    const current = list.find(c => c.companyId === user?.companyId) ?? list[0];
    if (current) {
      this.selectedCompanyId.set(current.companyId);
      await this.loadBranches(current.companyId);
    }
  }

  async loadBranches(companyId: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<any>(API_CONFIG.branch.list, { params: { companyId } })
    );
    const raw: any[] = res?.data ?? [];
    const list: BranchOption[] = raw.map(b => ({
      id: b.id ?? b.branchId,
      name: b.name,
      code: b.code,
    }));
    this.branches.set(list);

    const user = this.authService.getUser();
    const current = list.find(b => b.id === user?.branchId) ?? list[0];
    if (current) {
      this.selectedBranchId.set(current.id);
      await this.loadBusinessUnits(current.id);
    } else {
      this.branches.set(list);
      this.selectedBranchId.set('');
      this.businessUnits.set([]);
      this.selectedBusinessUnitId.set('');
    }
  }

  async loadBusinessUnits(branchId: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<any>(API_CONFIG.businessUnit.list, { params: { branchId } })
    );
    const raw: any[] = res?.data ?? [];
    const list: BusinessUnitOption[] = raw.map(bu => ({
      id: bu.id ?? bu.businessUnitId,
      name: bu.name,
      code: bu.code,
    }));
    this.businessUnits.set(list);

    const user = this.authService.getUser();
    const current = list.find(bu => bu.id === user?.businessUnitId) ?? list[0];
    this.selectedBusinessUnitId.set(current ? current.id : '');
  }

  async switchContext(companyId: string, branchId: string, businessUnitId: string): Promise<boolean> {
    if (this.isSwitching()) return false;
    if (!companyId || !branchId || !businessUnitId) return false;
    this.isSwitching.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<any>(API_CONFIG.auth.switchContext, { companyId, branchId, businessUnitId })
      );
      if (res?.success && res?.data?.accessToken) {
        this.authService.updateSession(res.data.accessToken, res.data.refreshToken, res.data.user);
        this.selectedCompanyId.set(companyId);
        this.selectedBranchId.set(branchId);
        this.selectedBusinessUnitId.set(businessUnitId);
        this.contextChanged$.next();
        return true;
      }
      return false;
    } finally {
      this.isSwitching.set(false);
    }
  }
}
