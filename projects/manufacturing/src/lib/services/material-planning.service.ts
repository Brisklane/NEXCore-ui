import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { MaterialPlanningDataDto, CreateMaterialPlanningDataDto, UpdateMaterialPlanningDataDto } from '../models/material-planning.model';

@Injectable({ providedIn: 'root' })
export class MaterialPlanningService {
  constructor(private http: HttpClient, private auth: ManufacturingAuthHelper) {}

  getAll(options?: { pageSize?: number }): Observable<ApiResponse<MaterialPlanningDataDto[]>> {
    let params = new HttpParams();
    if (options?.pageSize) params = params.set('PageSize', options.pageSize);
    return this.http.get<ApiResponse<MaterialPlanningDataDto[]>>(MANUFACTURING_API.materialPlanning.getAll, { headers: this.auth.getAuthHeaders(), params });
  }

  getById(id: string): Observable<ApiResponse<MaterialPlanningDataDto>> {
    return this.http.get<ApiResponse<MaterialPlanningDataDto>>(MANUFACTURING_API.materialPlanning.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<MaterialPlanningDataDto>> {
    return this.http.get<ApiResponse<MaterialPlanningDataDto>>(MANUFACTURING_API.materialPlanning.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateMaterialPlanningDataDto): Observable<ApiResponse<MaterialPlanningDataDto>> {
    return this.http.post<ApiResponse<MaterialPlanningDataDto>>(MANUFACTURING_API.materialPlanning.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateMaterialPlanningDataDto): Observable<ApiResponse<MaterialPlanningDataDto>> {
    return this.http.put<ApiResponse<MaterialPlanningDataDto>>(MANUFACTURING_API.materialPlanning.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.materialPlanning.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
