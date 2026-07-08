import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  CommunicationTemplateDto,
  CreateCommunicationTemplateDto,
  UpdateCommunicationTemplateDto,
} from '../models/communication-template.model';

@Injectable({ providedIn: 'root' })
export class CommunicationTemplateService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<CommunicationTemplateDto[]>> {
    return this.http.get<ApiResponse<CommunicationTemplateDto[]>>(
      HR_API.communicationTemplate.getAll,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getById(id: string): Observable<ApiResponse<CommunicationTemplateDto>> {
    return this.http.get<ApiResponse<CommunicationTemplateDto>>(
      HR_API.communicationTemplate.getById(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  create(dto: CreateCommunicationTemplateDto): Observable<ApiResponse<CommunicationTemplateDto>> {
    return this.http.post<ApiResponse<CommunicationTemplateDto>>(
      HR_API.communicationTemplate.create,
      dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  update(id: string, dto: UpdateCommunicationTemplateDto): Observable<ApiResponse<CommunicationTemplateDto>> {
    return this.http.put<ApiResponse<CommunicationTemplateDto>>(
      HR_API.communicationTemplate.update(id),
      dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      HR_API.communicationTemplate.delete(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
