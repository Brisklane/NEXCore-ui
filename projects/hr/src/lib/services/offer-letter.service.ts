import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { OfferLetterDto, CreateOfferLetterDto, UpdateOfferLetterDto } from '../models/offer-letter.model';

@Injectable({ providedIn: 'root' })
export class OfferLetterService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<OfferLetterDto[]>> {
    return this.http.get<ApiResponse<OfferLetterDto[]>>(HR_API.offerLetter.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<OfferLetterDto>> {
    return this.http.get<ApiResponse<OfferLetterDto>>(HR_API.offerLetter.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateOfferLetterDto): Observable<ApiResponse<OfferLetterDto>> {
    return this.http.post<ApiResponse<OfferLetterDto>>(HR_API.offerLetter.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateOfferLetterDto): Observable<ApiResponse<OfferLetterDto>> {
    return this.http.put<ApiResponse<OfferLetterDto>>(HR_API.offerLetter.update(id), { request: dto }, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.offerLetter.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
