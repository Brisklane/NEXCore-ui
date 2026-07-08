import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  SalesTeamDto,
  CreateSalesTeamDto,
  UpdateSalesTeamDto,
  AddSalesTeamMemberDto,
} from '../models/sales-team.model';

@Injectable({ providedIn: 'root' })
export class SalesTeamService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SalesTeamDto[]>> {
    return this.http.get<ApiResponse<SalesTeamDto[]>>(SALES_API.salesTeam.getAll);
  }

  getActive(): Observable<ApiResponse<SalesTeamDto[]>> {
    return this.http.get<ApiResponse<SalesTeamDto[]>>(SALES_API.salesTeam.getActive);
  }

  getById(id: string): Observable<ApiResponse<SalesTeamDto>> {
    return this.http.get<ApiResponse<SalesTeamDto>>(SALES_API.salesTeam.getById(id));
  }

  create(dto: CreateSalesTeamDto): Observable<ApiResponse<SalesTeamDto>> {
    return this.http.post<ApiResponse<SalesTeamDto>>(SALES_API.salesTeam.create, dto);
  }

  update(id: string, dto: UpdateSalesTeamDto): Observable<ApiResponse<SalesTeamDto>> {
    return this.http.put<ApiResponse<SalesTeamDto>>(SALES_API.salesTeam.update(id), dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.salesTeam.delete(id));
  }

  addMember(id: string, dto: AddSalesTeamMemberDto): Observable<ApiResponse<SalesTeamDto>> {
    return this.http.post<ApiResponse<SalesTeamDto>>(SALES_API.salesTeam.addMember(id), dto);
  }

  removeMember(id: string, memberId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.salesTeam.removeMember(id, memberId));
  }
}
