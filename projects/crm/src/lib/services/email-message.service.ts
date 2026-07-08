import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { EmailMessageDto, CreateEmailMessageDto } from '../models/email-message.model';

@Injectable({ providedIn: 'root' })
export class EmailMessageService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<EmailMessageDto[]>> {
    return this.http.get<ApiResponse<EmailMessageDto[]>>(CRM_API.emailMessages.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<EmailMessageDto>> {
    return this.http.get<ApiResponse<EmailMessageDto>>(CRM_API.emailMessages.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateEmailMessageDto): Observable<ApiResponse<EmailMessageDto>> {
    return this.http.post<ApiResponse<EmailMessageDto>>(CRM_API.emailMessages.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.emailMessages.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
