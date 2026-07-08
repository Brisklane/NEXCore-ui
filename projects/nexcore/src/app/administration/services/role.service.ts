import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@nexcore/core';
import { API_CONFIG } from '../../config/api.config';
import { RoleDto } from './user-admin.models';

interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken() ?? ''}` });
  }

  listByCompany(companyId: string): Observable<ApiEnvelope<RoleDto[]>> {
    return this.http.get<ApiEnvelope<RoleDto[]>>(API_CONFIG.role.listByCompany(companyId), {
      headers: this.authHeaders(),
    });
  }

  assign(userId: string, roleId: string): Observable<ApiEnvelope<void>> {
    return this.http.post<ApiEnvelope<void>>(API_CONFIG.role.assign, { userId, roleId }, {
      headers: this.authHeaders(),
    });
  }

  remove(userId: string, roleId: string): Observable<ApiEnvelope<void>> {
    return this.http.post<ApiEnvelope<void>>(API_CONFIG.role.remove, { userId, roleId }, {
      headers: this.authHeaders(),
    });
  }
}
