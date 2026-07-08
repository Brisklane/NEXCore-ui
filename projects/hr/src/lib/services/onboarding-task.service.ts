import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { OnboardingTaskDto, CreateOnboardingTaskDto, UpdateOnboardingTaskDto } from '../models/onboarding-task.model';

@Injectable({ providedIn: 'root' })
export class OnboardingTaskService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<OnboardingTaskDto[]>> {
    return this.http.get<ApiResponse<OnboardingTaskDto[]>>(HR_API.onboardingTask.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<OnboardingTaskDto>> {
    return this.http.get<ApiResponse<OnboardingTaskDto>>(HR_API.onboardingTask.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByEmployee(employeeId: string): Observable<ApiResponse<OnboardingTaskDto[]>> {
    return this.http.get<ApiResponse<OnboardingTaskDto[]>>(HR_API.onboardingTask.byEmployee(employeeId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateOnboardingTaskDto): Observable<ApiResponse<OnboardingTaskDto>> {
    return this.http.post<ApiResponse<OnboardingTaskDto>>(HR_API.onboardingTask.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateOnboardingTaskDto): Observable<ApiResponse<OnboardingTaskDto>> {
    return this.http.put<ApiResponse<OnboardingTaskDto>>(HR_API.onboardingTask.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  complete(id: string): Observable<ApiResponse<OnboardingTaskDto>> {
    return this.http.post<ApiResponse<OnboardingTaskDto>>(HR_API.onboardingTask.complete(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.onboardingTask.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
