import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { BenefitsPlanDto, CreateBenefitsPlanDto, UpdateBenefitsPlanDto } from '../models/benefits-plan.model';

@Injectable({ providedIn: 'root' })
export class BenefitsPlanService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<BenefitsPlanDto[]>> {
    return this.http.get<ApiResponse<BenefitsPlanDto[]>>(HR_API.benefitsPlan.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<BenefitsPlanDto>> {
    return this.http.get<ApiResponse<BenefitsPlanDto>>(HR_API.benefitsPlan.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateBenefitsPlanDto): Observable<ApiResponse<BenefitsPlanDto>> {
    return this.http.post<ApiResponse<BenefitsPlanDto>>(HR_API.benefitsPlan.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateBenefitsPlanDto): Observable<ApiResponse<BenefitsPlanDto>> {
    return this.http.put<ApiResponse<BenefitsPlanDto>>(HR_API.benefitsPlan.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.benefitsPlan.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
