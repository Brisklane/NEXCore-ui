import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { JobPostingChannelDto, CreateJobPostingChannelDto, UpdateJobPostingChannelDto } from '../models/job-posting-channel.model';

@Injectable({ providedIn: 'root' })
export class JobPostingChannelService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<JobPostingChannelDto[]>> {
    return this.http.get<ApiResponse<JobPostingChannelDto[]>>(HR_API.jobPostingChannel.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<JobPostingChannelDto>> {
    return this.http.get<ApiResponse<JobPostingChannelDto>>(HR_API.jobPostingChannel.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateJobPostingChannelDto): Observable<ApiResponse<JobPostingChannelDto>> {
    return this.http.post<ApiResponse<JobPostingChannelDto>>(HR_API.jobPostingChannel.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateJobPostingChannelDto): Observable<ApiResponse<JobPostingChannelDto>> {
    return this.http.put<ApiResponse<JobPostingChannelDto>>(HR_API.jobPostingChannel.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(HR_API.jobPostingChannel.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
