import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { AttachmentDto, CreateAttachmentDto } from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<AttachmentDto[]>> {
    return this.http.get<ApiResponse<AttachmentDto[]>>(CRM_API.attachments.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<AttachmentDto>> {
    return this.http.get<ApiResponse<AttachmentDto>>(CRM_API.attachments.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateAttachmentDto): Observable<ApiResponse<AttachmentDto>> {
    return this.http.post<ApiResponse<AttachmentDto>>(CRM_API.attachments.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.attachments.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
