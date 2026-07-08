import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { JobOfferDto, CreateJobOfferDto, UpdateJobOfferDto } from '../models/job-offer.model';

@Injectable({ providedIn: 'root' })
export class JobOfferService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<JobOfferDto[]>> {
    return this.http.get<ApiResponse<JobOfferDto[]>>(HR_API.jobOffer.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<JobOfferDto>> {
    return this.http.get<ApiResponse<JobOfferDto>>(HR_API.jobOffer.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByApplication(applicationId: string): Observable<ApiResponse<JobOfferDto[]>> {
    return this.http.get<ApiResponse<JobOfferDto[]>>(HR_API.jobOffer.byApplication(applicationId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateJobOfferDto): Observable<ApiResponse<JobOfferDto>> {
    return this.http.post<ApiResponse<JobOfferDto>>(HR_API.jobOffer.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateJobOfferDto): Observable<ApiResponse<JobOfferDto>> {
    return this.http.put<ApiResponse<JobOfferDto>>(HR_API.jobOffer.update(id), { request: dto }, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  accept(id: string): Observable<ApiResponse<JobOfferDto>> {
    return this.http.post<ApiResponse<JobOfferDto>>(HR_API.jobOffer.accept(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  decline(id: string): Observable<ApiResponse<JobOfferDto>> {
    return this.http.post<ApiResponse<JobOfferDto>>(HR_API.jobOffer.decline(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.jobOffer.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
