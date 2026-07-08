import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  PosBranchStatusDto,
  PosDashboardBulkRequestDto,
  PosTerminalStatusDto,
} from '../models/pos-dashboard.model';

@Injectable({ providedIn: 'root' })
export class PosDashboardService {
  constructor(private http: HttpClient) {}

  getBranchStatus(branchId: string): Observable<ApiResponse<PosBranchStatusDto>> {
    return this.http.get<ApiResponse<PosBranchStatusDto>>(SALES_API.posDashboard.branchStatus(branchId));
  }

  getBulkBranchStatus(dto: PosDashboardBulkRequestDto): Observable<ApiResponse<PosBranchStatusDto[]>> {
    return this.http.post<ApiResponse<PosBranchStatusDto[]>>(SALES_API.posDashboard.bulkBranchStatus, dto);
  }

  getTerminalStatuses(): Observable<ApiResponse<PosTerminalStatusDto[]>> {
    return this.http.get<ApiResponse<PosTerminalStatusDto[]>>(SALES_API.posDashboard.terminalStatuses);
  }
}
