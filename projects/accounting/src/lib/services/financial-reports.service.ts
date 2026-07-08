import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse } from '../models/api-response.model';

interface ReportQuery {
  ledgerId?: string;
  reportDate?: string;
  fromDate?: string;
  toDate?: string;
  asOfDate?: string;
}

@Injectable({ providedIn: 'root' })
export class FinancialReportsService {
  constructor(private http: HttpClient, private auth: AccountingAuthHelper) {}

  private buildParams(query?: ReportQuery): HttpParams {
    let params = new HttpParams();
    if (!query) return params;

    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params = params.set(key, value);
      }
    }

    return params;
  }

  trialBalance(query?: Pick<ReportQuery, 'ledgerId' | 'reportDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.trialBalance, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  generalLedger(query?: Pick<ReportQuery, 'ledgerId' | 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.generalLedger, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  accountLedger(accountId: string, query?: Pick<ReportQuery, 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.accountLedger(accountId), {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  profitAndLoss(query?: Pick<ReportQuery, 'ledgerId' | 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.profitAndLoss, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  balanceSheet(query?: Pick<ReportQuery, 'ledgerId' | 'reportDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.balanceSheet, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  journal(query?: Pick<ReportQuery, 'ledgerId' | 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.journal, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  journalAudit(query?: Pick<ReportQuery, 'ledgerId' | 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.journalAudit, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  arAging(asOfDate?: string): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.arAging, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams({ asOfDate }),
    });
  }

  apAging(asOfDate?: string): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.apAging, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams({ asOfDate }),
    });
  }

  customerStatement(customerCode: string, query?: Pick<ReportQuery, 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.customerStatement(customerCode), {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  vendorStatement(vendorCode: string, query?: Pick<ReportQuery, 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.vendorStatement(vendorCode), {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  taxSummary(query?: Pick<ReportQuery, 'ledgerId' | 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.taxSummary, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  cashFlow(query?: Pick<ReportQuery, 'ledgerId' | 'fromDate' | 'toDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.cashFlow, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  unpostedJournals(ledgerId?: string): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.unpostedJournals, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams({ ledgerId }),
    });
  }

  trialBalanceByDimension(
    dimensionId: string,
    query?: Pick<ReportQuery, 'ledgerId' | 'reportDate'>
  ): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.trialBalanceByDimension(dimensionId), {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  profitAndLossByDimension(
    dimensionId: string,
    query?: Pick<ReportQuery, 'ledgerId' | 'fromDate' | 'toDate'>
  ): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.profitAndLossByDimension(dimensionId), {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }

  reconciliation(accountId: string, asOfDate?: string): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.reconciliation(accountId), {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams({ asOfDate }),
    });
  }

  dailyTransactions(query?: Pick<ReportQuery, 'ledgerId' | 'reportDate'>): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(ACCOUNTING_API.financialReports.dailyTransactions, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(query),
    });
  }
}
