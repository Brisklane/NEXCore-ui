import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { QuotationDto, CreateQuotationDto } from '../models/quotation.model';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<QuotationDto[]>> {
    return this.http.get<ApiResponse<QuotationDto[]>>(SALES_API.quotation.getAll);
  }

  getById(id: string): Observable<ApiResponse<QuotationDto>> {
    return this.http.get<ApiResponse<QuotationDto>>(SALES_API.quotation.getById(id));
  }

  create(dto: CreateQuotationDto): Observable<ApiResponse<QuotationDto>> {
    return this.http.post<ApiResponse<QuotationDto>>(SALES_API.quotation.create, dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.quotation.delete(id));
  }

  send(id: string): Observable<ApiResponse<QuotationDto>> {
    return this.http.post<ApiResponse<QuotationDto>>(SALES_API.quotation.send(id), {});
  }

  accept(id: string): Observable<ApiResponse<QuotationDto>> {
    return this.http.post<ApiResponse<QuotationDto>>(SALES_API.quotation.accept(id), {});
  }
}
