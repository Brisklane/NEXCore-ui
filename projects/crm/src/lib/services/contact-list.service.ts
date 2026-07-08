import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  ContactListDto, CreateContactListDto, UpdateContactListDto,
  ContactListMemberDto, CreateContactListMemberDto,
} from '../models/contact-list.model';

@Injectable({ providedIn: 'root' })
export class ContactListService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<ContactListDto[]>> {
    return this.http.get<ApiResponse<ContactListDto[]>>(CRM_API.contactLists.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<ContactListDto>> {
    return this.http.get<ApiResponse<ContactListDto>>(CRM_API.contactLists.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateContactListDto): Observable<ApiResponse<ContactListDto>> {
    return this.http.post<ApiResponse<ContactListDto>>(CRM_API.contactLists.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateContactListDto): Observable<ApiResponse<ContactListDto>> {
    return this.http.put<ApiResponse<ContactListDto>>(CRM_API.contactLists.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.contactLists.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getMembers(id: string): Observable<ApiResponse<ContactListMemberDto[]>> {
    return this.http.get<ApiResponse<ContactListMemberDto[]>>(CRM_API.contactLists.getMembers(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addMember(id: string, dto: CreateContactListMemberDto): Observable<ApiResponse<ContactListMemberDto>> {
    return this.http.post<ApiResponse<ContactListMemberDto>>(CRM_API.contactLists.addMember(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  removeMember(id: string, memberId: string): Observable<void> {
    return this.http.delete<void>(CRM_API.contactLists.removeMember(id, memberId), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
