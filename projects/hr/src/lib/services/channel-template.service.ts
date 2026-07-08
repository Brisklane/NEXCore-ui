import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { ChannelTemplateDto, CreateChannelTemplateDto, UpdateChannelTemplateDto } from '../models/channel-template.model';

@Injectable({ providedIn: 'root' })
export class ChannelTemplateService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<ChannelTemplateDto[]>> {
    return this.http.get<ApiResponse<ChannelTemplateDto[]>>(HR_API.channelTemplate.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<ChannelTemplateDto>> {
    return this.http.get<ApiResponse<ChannelTemplateDto>>(HR_API.channelTemplate.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateChannelTemplateDto): Observable<ApiResponse<ChannelTemplateDto>> {
    return this.http.post<ApiResponse<ChannelTemplateDto>>(HR_API.channelTemplate.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateChannelTemplateDto): Observable<ApiResponse<ChannelTemplateDto>> {
    return this.http.put<ApiResponse<ChannelTemplateDto>>(HR_API.channelTemplate.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(HR_API.channelTemplate.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
