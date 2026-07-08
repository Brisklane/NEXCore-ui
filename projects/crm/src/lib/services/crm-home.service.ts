import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, shareReplay, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { CrmHomeDashboard } from '../models/crm-home.model';
import { ContactDto } from '../models/contact.model';
import { AccountDto } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class CrmHomeService {
  private readonly TTL = 60_000;

  private chartCache$:    Observable<CrmHomeDashboard> | null = null;
  private chartCachedAt   = 0;
  private contactCache$:  Observable<ContactDto[]>     | null = null;
  private contactCachedAt = 0;
  private accountCache$:  Observable<AccountDto[]>     | null = null;
  private accountCachedAt = 0;

  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getCharts(): Observable<CrmHomeDashboard> {
    if (this.chartCache$ && Date.now() - this.chartCachedAt < this.TTL) {
      return this.chartCache$;
    }
    this.chartCache$ = this.http
      .get<ApiResponse<CrmHomeDashboard>>(CRM_API.home, { headers: this.auth.getAuthHeaders() })
      .pipe(
        map(r => {
          this.chartCachedAt = Date.now(); // stamp only on success
          return r.data ?? {};
        }),
        catchError(err => {
          this.chartCache$ = null; // don't cache failures — next visit retries fresh
          this.chartCachedAt = 0;
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    return this.chartCache$;
  }

  getRecentContacts(): Observable<ContactDto[]> {
    if (this.contactCache$ && Date.now() - this.contactCachedAt < this.TTL) {
      return this.contactCache$;
    }
    this.contactCache$ = forkJoin({
      contacts: this.http.get<ApiResponse<ContactDto[]>>(CRM_API.contacts.getAll, { headers: this.auth.getAuthHeaders() }),
      accounts: this.http.get<ApiResponse<AccountDto[]>>(CRM_API.accounts.getAll, { headers: this.auth.getAuthHeaders() }),
    }).pipe(
      map(({ contacts, accounts }) => {
        this.contactCachedAt = Date.now();
        const accountMap = new Map<string, string>(
          (accounts.data ?? [])
            .filter(a => a.id && a.accountName)
            .map(a => [a.id, a.accountName!])
        );
        const all = (contacts.data ?? []).map(c => ({
          ...c,
          accountName: c.accountName || accountMap.get(c.accountId ?? '') || null,
        }));
        return [...all]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      }),
      catchError(err => {
        this.contactCache$ = null;
        this.contactCachedAt = 0;
        return throwError(() => err);
      }),
      shareReplay(1)
    );
    return this.contactCache$;
  }

  getRecentAccounts(): Observable<AccountDto[]> {
    if (this.accountCache$ && Date.now() - this.accountCachedAt < this.TTL) {
      return this.accountCache$;
    }
    this.accountCache$ = this.http
      .get<ApiResponse<AccountDto[]>>(CRM_API.accounts.getAll, { headers: this.auth.getAuthHeaders() })
      .pipe(
        map(r => {
          this.accountCachedAt = Date.now();
          const all = r.data ?? [];
          return [...all]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
        }),
        catchError(err => {
          this.accountCache$ = null;
          this.accountCachedAt = 0;
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    return this.accountCache$;
  }

  invalidate(): void {
    this.chartCache$    = null;
    this.chartCachedAt  = 0;
    this.contactCache$  = null;
    this.contactCachedAt = 0;
    this.accountCache$  = null;
    this.accountCachedAt = 0;
  }
}
