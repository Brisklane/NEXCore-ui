import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '@env';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  LabelDesignerOptionsDto,
  PosBarcodeLabelTemplateDto,
  CreatePosBarcodeLabelTemplateDto,
  RenderBarcodeLabelBatchDto,
} from '../models/barcode-label.model';

/**
 * Barcode label / price-tag endpoints. These live on the Sales API
 * (`/api/sales/...`) but share the same gateway + bearer token, so we call them
 * directly from inventory rather than taking a dependency on the sales library.
 */
@Injectable({ providedIn: 'root' })
export class BarcodeLabelService {
  private readonly base = `${environment.apiBaseUrl}/api/sales`;

  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  /** Symbologies, paper presets and slider ranges in a single call. */
  getDesignerOptions(): Observable<ApiResponse<LabelDesignerOptionsDto>> {
    return this.http.get<ApiResponse<LabelDesignerOptionsDto>>(
      `${this.base}/SalesLookup/label-designer-options`,
      { headers: this.auth.getAuthHeaders() },
    );
  }

  /**
   * Server-rendered barcode as a data URL (works in print windows). The image
   * endpoint needs the bearer token, so we fetch it as a blob and inline it.
   */
  getBarcodeDataUrl(value: string, symbology: string, width = 400, height = 150): Observable<string> {
    const params = new URLSearchParams({ value, symbology, width: String(width), height: String(height) });
    return this.http.get(`${this.base}/Barcode?${params.toString()}`, {
      headers: this.auth.getAuthHeaders(),
      responseType: 'blob',
    }).pipe(switchMap((blob) => from(this.blobToDataUrl(blob))));
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ── Templates ────────────────────────────────────────────────────────────────
  getTemplates(): Observable<ApiResponse<PosBarcodeLabelTemplateDto[]>> {
    return this.http.get<ApiResponse<PosBarcodeLabelTemplateDto[]>>(
      `${this.base}/PosBarcodeLabelTemplate`,
      { headers: this.auth.getAuthHeaders() },
    );
  }

  createTemplate(dto: CreatePosBarcodeLabelTemplateDto): Observable<ApiResponse<PosBarcodeLabelTemplateDto>> {
    return this.http.post<ApiResponse<PosBarcodeLabelTemplateDto>>(
      `${this.base}/PosBarcodeLabelTemplate`, dto,
      { headers: this.auth.getAuthHeaders() },
    );
  }

  setDefaultTemplate(id: string): Observable<ApiResponse<PosBarcodeLabelTemplateDto>> {
    return this.http.post<ApiResponse<PosBarcodeLabelTemplateDto>>(
      `${this.base}/PosBarcodeLabelTemplate/${id}/set-default`, {},
      { headers: this.auth.getAuthHeaders() },
    );
  }

  /** Server-rendered, print-ready PDF for a batch of labels. */
  renderBatch(dto: RenderBarcodeLabelBatchDto): Observable<Blob> {
    return this.http.post(`${this.base}/PosBarcodeLabelTemplate/render-batch`, dto, {
      headers: this.auth.getAuthHeaders(),
      responseType: 'blob',
    });
  }
}
