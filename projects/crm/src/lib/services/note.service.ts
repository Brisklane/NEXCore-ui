import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { NoteDto, CreateNoteDto, UpdateNoteDto } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<NoteDto[]>> {
    return this.http.get<ApiResponse<NoteDto[]>>(CRM_API.notes.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<NoteDto>> {
    return this.http.get<ApiResponse<NoteDto>>(CRM_API.notes.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateNoteDto): Observable<ApiResponse<NoteDto>> {
    return this.http.post<ApiResponse<NoteDto>>(CRM_API.notes.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateNoteDto): Observable<ApiResponse<NoteDto>> {
    return this.http.put<ApiResponse<NoteDto>>(CRM_API.notes.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.notes.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
