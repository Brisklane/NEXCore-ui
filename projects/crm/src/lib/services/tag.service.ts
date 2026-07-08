import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  TagDto, CreateTagDto, UpdateTagDto,
  AssignTagDto, EntityTagDto,
} from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<TagDto[]>> {
    return this.http.get<ApiResponse<TagDto[]>>(CRM_API.tags.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<TagDto>> {
    return this.http.get<ApiResponse<TagDto>>(CRM_API.tags.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateTagDto): Observable<ApiResponse<TagDto>> {
    return this.http.post<ApiResponse<TagDto>>(CRM_API.tags.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateTagDto): Observable<ApiResponse<TagDto>> {
    return this.http.put<ApiResponse<TagDto>>(CRM_API.tags.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.tags.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  assign(dto: AssignTagDto): Observable<ApiResponse<EntityTagDto>> {
    return this.http.post<ApiResponse<EntityTagDto>>(CRM_API.tags.assign, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByEntity(entityType: string, entityId: string): Observable<ApiResponse<EntityTagDto[]>> {
    return this.http.get<ApiResponse<EntityTagDto[]>>(CRM_API.tags.getByEntity(entityType, entityId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  removeEntityTag(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.tags.removeEntityTag(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
