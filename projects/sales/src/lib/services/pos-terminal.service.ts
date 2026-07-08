import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  PosTerminalDto,
  CreatePosTerminalDto,
  UpdatePosTerminalDto,
  TerminalHeartbeatDto,
} from '../models/pos-terminal.model';

@Injectable({ providedIn: 'root' })
export class PosTerminalService {
  constructor(private http: HttpClient) {}

  getByBranch(branchId: string): Observable<ApiResponse<PosTerminalDto[]>> {
    return this.http.get<ApiResponse<PosTerminalDto[]>>(SALES_API.posTerminal.byBranch(branchId));
  }

  getActiveByBranch(branchId: string): Observable<ApiResponse<PosTerminalDto[]>> {
    return this.http.get<ApiResponse<PosTerminalDto[]>>(SALES_API.posTerminal.activeByBranch(branchId));
  }

  getById(id: string): Observable<ApiResponse<PosTerminalDto>> {
    return this.http.get<ApiResponse<PosTerminalDto>>(SALES_API.posTerminal.getById(id));
  }

  create(dto: CreatePosTerminalDto): Observable<ApiResponse<PosTerminalDto>> {
    return this.http.post<ApiResponse<PosTerminalDto>>(SALES_API.posTerminal.create, dto);
  }

  update(id: string, dto: UpdatePosTerminalDto): Observable<ApiResponse<PosTerminalDto>> {
    return this.http.put<ApiResponse<PosTerminalDto>>(SALES_API.posTerminal.update(id), dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.posTerminal.delete(id));
  }

  heartbeat(id: string, dto: TerminalHeartbeatDto): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(SALES_API.posTerminal.heartbeat(id), dto);
  }

  goOffline(id: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(SALES_API.posTerminal.goOffline(id), {});
  }
}
