import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@nexcore/core';
import { API_CONFIG } from '../../config/api.config';
import { AdminUserDto, InviteUserRequest, UpdateUserRequest } from './user-admin.models';

interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken() ?? ''}` });
  }

  listByCompany(companyId: string): Observable<ApiEnvelope<AdminUserDto[]>> {
    return this.http.get<ApiEnvelope<AdminUserDto[]>>(API_CONFIG.userAdmin.listByCompany(companyId), {
      headers: this.authHeaders(),
    });
  }

  getById(id: string): Observable<ApiEnvelope<AdminUserDto>> {
    return this.http.get<ApiEnvelope<AdminUserDto>>(API_CONFIG.userAdmin.getById(id), {
      headers: this.authHeaders(),
    });
  }

  update(id: string, dto: UpdateUserRequest): Observable<ApiEnvelope<AdminUserDto>> {
    return this.http.put<ApiEnvelope<AdminUserDto>>(API_CONFIG.userAdmin.update(id), dto, {
      headers: this.authHeaders(),
    });
  }

  activate(id: string): Observable<ApiEnvelope<void>> {
    return this.http.post<ApiEnvelope<void>>(API_CONFIG.userAdmin.activate(id), {}, {
      headers: this.authHeaders(),
    });
  }

  deactivate(id: string): Observable<ApiEnvelope<void>> {
    return this.http.post<ApiEnvelope<void>>(API_CONFIG.userAdmin.deactivate(id), {}, {
      headers: this.authHeaders(),
    });
  }

  lock(id: string): Observable<ApiEnvelope<void>> {
    return this.http.post<ApiEnvelope<void>>(API_CONFIG.userAdmin.lock(id), {}, {
      headers: this.authHeaders(),
    });
  }

  unlock(id: string): Observable<ApiEnvelope<void>> {
    return this.http.post<ApiEnvelope<void>>(API_CONFIG.userAdmin.unlock(id), {}, {
      headers: this.authHeaders(),
    });
  }

  invite(dto: InviteUserRequest): Observable<ApiEnvelope<AdminUserDto>> {
    return this.http.post<ApiEnvelope<AdminUserDto>>(API_CONFIG.userAdmin.invite, dto, {
      headers: this.authHeaders(),
    });
  }
}
