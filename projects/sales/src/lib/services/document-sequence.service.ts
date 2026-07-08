import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  DocumentSequenceDto,
  PreviewSequenceFormatResultDto,
  CreateDocumentSequenceDto,
  UpdateDocumentSequenceDto,
  ResetSequenceDto,
  PreviewSequenceFormatDto,
} from '../models/document-sequence.model';

@Injectable({ providedIn: 'root' })
export class DocumentSequenceService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<DocumentSequenceDto[]>> {
    return this.http.get<ApiResponse<DocumentSequenceDto[]>>(SALES_API.documentSequence.getAll);
  }

  getByDocumentType(documentType: string): Observable<ApiResponse<DocumentSequenceDto>> {
    return this.http.get<ApiResponse<DocumentSequenceDto>>(
      SALES_API.documentSequence.getByDocumentType(documentType),
    );
  }

  create(dto: CreateDocumentSequenceDto): Observable<ApiResponse<DocumentSequenceDto>> {
    return this.http.post<ApiResponse<DocumentSequenceDto>>(SALES_API.documentSequence.create, dto);
  }

  update(id: string, dto: UpdateDocumentSequenceDto): Observable<ApiResponse<DocumentSequenceDto>> {
    return this.http.put<ApiResponse<DocumentSequenceDto>>(SALES_API.documentSequence.update(id), dto);
  }

  reset(id: string, dto: ResetSequenceDto): Observable<ApiResponse<DocumentSequenceDto>> {
    return this.http.post<ApiResponse<DocumentSequenceDto>>(SALES_API.documentSequence.reset(id), dto);
  }

  preview(dto: PreviewSequenceFormatDto): Observable<ApiResponse<PreviewSequenceFormatResultDto>> {
    return this.http.post<ApiResponse<PreviewSequenceFormatResultDto>>(
      SALES_API.documentSequence.preview,
      dto,
    );
  }
}
