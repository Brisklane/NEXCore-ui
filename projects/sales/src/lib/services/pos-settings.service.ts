import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  PosReceiptTemplateDto,
  CreatePosReceiptTemplateDto,
  UpdatePosReceiptTemplateDto,
  PosCashDrawerDto,
  CreatePosCashDrawerDto,
  UpdatePosCashDrawerDto,
  PosSettingsDto,
  UpdatePosSettingsDto,
} from '../models/pos-settings.model';

@Injectable({ providedIn: 'root' })
export class PosSettingsService {
  constructor(private http: HttpClient) {}

  // ── POS Settings (tenant-wide config) ──────────────────────────────────────

  getSettings(): Observable<ApiResponse<PosSettingsDto>> {
    return this.http.get<ApiResponse<PosSettingsDto>>(
      SALES_API.posSettings.get,
    );
  }

  updateSettings(dto: UpdatePosSettingsDto): Observable<ApiResponse<PosSettingsDto>> {
    return this.http.put<ApiResponse<PosSettingsDto>>(
      SALES_API.posSettings.update,
      dto,
    );
  }

  resetSettings(): Observable<ApiResponse<PosSettingsDto>> {
    return this.http.post<ApiResponse<PosSettingsDto>>(
      SALES_API.posSettings.reset,
      {},
    );
  }

  // ── Receipt Templates (PosReceiptTemplate controller) ──────────────────────
  // Templates are tenant-global; one is marked default via setDefaultReceiptTemplate.

  getReceiptTemplates(): Observable<ApiResponse<PosReceiptTemplateDto[]>> {
    return this.http.get<ApiResponse<PosReceiptTemplateDto[]>>(
      SALES_API.posReceiptTemplate.getAll,
    );
  }

  getDefaultReceiptTemplate(): Observable<ApiResponse<PosReceiptTemplateDto>> {
    return this.http.get<ApiResponse<PosReceiptTemplateDto>>(
      SALES_API.posReceiptTemplate.getDefault,
    );
  }

  getReceiptTemplateById(id: string): Observable<ApiResponse<PosReceiptTemplateDto>> {
    return this.http.get<ApiResponse<PosReceiptTemplateDto>>(
      SALES_API.posReceiptTemplate.getById(id),
    );
  }

  createReceiptTemplate(dto: CreatePosReceiptTemplateDto): Observable<ApiResponse<PosReceiptTemplateDto>> {
    return this.http.post<ApiResponse<PosReceiptTemplateDto>>(
      SALES_API.posReceiptTemplate.create,
      dto,
    );
  }

  updateReceiptTemplate(id: string, dto: UpdatePosReceiptTemplateDto): Observable<ApiResponse<PosReceiptTemplateDto>> {
    return this.http.put<ApiResponse<PosReceiptTemplateDto>>(
      SALES_API.posReceiptTemplate.update(id),
      dto,
    );
  }

  deleteReceiptTemplate(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      SALES_API.posReceiptTemplate.delete(id),
    );
  }

  setDefaultReceiptTemplate(id: string): Observable<ApiResponse<PosReceiptTemplateDto>> {
    return this.http.post<ApiResponse<PosReceiptTemplateDto>>(
      SALES_API.posReceiptTemplate.setDefault(id),
      {},
    );
  }

  /** Upload a logo image for a template; returns the stored logo URL. */
  uploadReceiptTemplateLogo(id: string, file: File): Observable<ApiResponse<string>> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    // Let the browser set the multipart Content-Type + boundary.
    return this.http.post<ApiResponse<string>>(
      SALES_API.posReceiptTemplate.uploadLogo(id),
      fd,
    );
  }

  deleteReceiptTemplateLogo(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      SALES_API.posReceiptTemplate.deleteLogo(id),
    );
  }

  // ── Cash Drawers ───────────────────────────────────────────────────────────

  getCashDrawersByStore(storeId: string): Observable<ApiResponse<PosCashDrawerDto[]>> {
    return this.http.get<ApiResponse<PosCashDrawerDto[]>>(
      SALES_API.posSettings.cashDrawers.byStore(storeId),
    );
  }

  getActiveCashDrawersByStore(storeId: string): Observable<ApiResponse<PosCashDrawerDto[]>> {
    return this.http.get<ApiResponse<PosCashDrawerDto[]>>(
      SALES_API.posSettings.cashDrawers.activeByStore(storeId),
    );
  }

  getCashDrawerById(id: string): Observable<ApiResponse<PosCashDrawerDto>> {
    return this.http.get<ApiResponse<PosCashDrawerDto>>(
      SALES_API.posSettings.cashDrawers.getById(id),
    );
  }

  createCashDrawer(dto: CreatePosCashDrawerDto): Observable<ApiResponse<PosCashDrawerDto>> {
    return this.http.post<ApiResponse<PosCashDrawerDto>>(
      SALES_API.posSettings.cashDrawers.create,
      dto,
    );
  }

  updateCashDrawer(id: string, dto: UpdatePosCashDrawerDto): Observable<ApiResponse<PosCashDrawerDto>> {
    return this.http.put<ApiResponse<PosCashDrawerDto>>(
      SALES_API.posSettings.cashDrawers.update(id),
      dto,
    );
  }

  deleteCashDrawer(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      SALES_API.posSettings.cashDrawers.delete(id),
    );
  }
}
