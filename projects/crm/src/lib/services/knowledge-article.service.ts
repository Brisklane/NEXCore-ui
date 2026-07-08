import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { KnowledgeArticleDto, CreateKnowledgeArticleDto, UpdateKnowledgeArticleDto } from '../models/knowledge-article.model';

@Injectable({ providedIn: 'root' })
export class KnowledgeArticleService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<KnowledgeArticleDto[]>> {
    return this.http.get<ApiResponse<KnowledgeArticleDto[]>>(CRM_API.knowledgeArticles.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<KnowledgeArticleDto>> {
    return this.http.get<ApiResponse<KnowledgeArticleDto>>(CRM_API.knowledgeArticles.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateKnowledgeArticleDto): Observable<ApiResponse<KnowledgeArticleDto>> {
    return this.http.post<ApiResponse<KnowledgeArticleDto>>(CRM_API.knowledgeArticles.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateKnowledgeArticleDto): Observable<ApiResponse<KnowledgeArticleDto>> {
    return this.http.put<ApiResponse<KnowledgeArticleDto>>(CRM_API.knowledgeArticles.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.knowledgeArticles.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  publish(id: string): Observable<ApiResponse<KnowledgeArticleDto>> {
    return this.http.post<ApiResponse<KnowledgeArticleDto>>(CRM_API.knowledgeArticles.publish(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  archive(id: string): Observable<ApiResponse<KnowledgeArticleDto>> {
    return this.http.post<ApiResponse<KnowledgeArticleDto>>(CRM_API.knowledgeArticles.archive(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
