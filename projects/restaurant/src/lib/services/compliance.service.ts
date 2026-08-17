import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { ApiResponse } from '../models/restaurant.models';
import * as C from '../models/compliance.models';

const BASE = `${environment.apiBaseUrl}/api/restaurant/compliance`;

/** Food safety records, and the delivery-zone engine. */
@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private http = inject(HttpClient);

  board(outletId: string): Observable<ApiResponse<C.ComplianceBoardDto>> {
    return this.http.get<ApiResponse<C.ComplianceBoardDto>>(`${BASE}/board/${outletId}`);
  }

  // ── Temperature ──────────────────────────────────────────────────────

  getCheckpoints(outletId: string): Observable<ApiResponse<C.TemperatureCheckpointDto[]>> {
    return this.http.get<ApiResponse<C.TemperatureCheckpointDto[]>>(`${BASE}/checkpoints/${outletId}`);
  }

  createCheckpoint(dto: C.SaveTemperatureCheckpointDto): Observable<ApiResponse<C.TemperatureCheckpointDto>> {
    return this.http.post<ApiResponse<C.TemperatureCheckpointDto>>(`${BASE}/checkpoints`, dto);
  }

  updateCheckpoint(id: string, dto: C.SaveTemperatureCheckpointDto): Observable<ApiResponse<C.TemperatureCheckpointDto>> {
    return this.http.put<ApiResponse<C.TemperatureCheckpointDto>>(`${BASE}/checkpoints/${id}`, dto);
  }

  deleteCheckpoint(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/checkpoints/${id}`);
  }

  recordTemperature(dto: C.RecordTemperatureDto): Observable<ApiResponse<C.TemperatureLogDto>> {
    return this.http.post<ApiResponse<C.TemperatureLogDto>>(`${BASE}/temperature`, dto);
  }

  resolveBreach(dto: C.ResolveBreachDto): Observable<ApiResponse<C.TemperatureLogDto>> {
    return this.http.post<ApiResponse<C.TemperatureLogDto>>(`${BASE}/temperature/resolve`, dto);
  }

  getLogs(outletId: string, from?: string, to?: string, breachesOnly = false):
    Observable<ApiResponse<C.TemperatureLogDto[]>> {
    const params = new URLSearchParams({ breachesOnly: String(breachesOnly) });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return this.http.get<ApiResponse<C.TemperatureLogDto[]>>(`${BASE}/temperature/${outletId}?${params}`);
  }

  // ── Checklists ───────────────────────────────────────────────────────

  getChecklists(outletId: string): Observable<ApiResponse<C.ChecklistDto[]>> {
    return this.http.get<ApiResponse<C.ChecklistDto[]>>(`${BASE}/checklists/${outletId}`);
  }

  createChecklist(dto: C.SaveChecklistDto): Observable<ApiResponse<C.ChecklistDto>> {
    return this.http.post<ApiResponse<C.ChecklistDto>>(`${BASE}/checklists`, dto);
  }

  updateChecklist(id: string, dto: C.SaveChecklistDto): Observable<ApiResponse<C.ChecklistDto>> {
    return this.http.put<ApiResponse<C.ChecklistDto>>(`${BASE}/checklists/${id}`, dto);
  }

  deleteChecklist(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/checklists/${id}`);
  }

  submitRun(dto: C.SubmitChecklistRunDto): Observable<ApiResponse<C.ChecklistRunDto>> {
    return this.http.post<ApiResponse<C.ChecklistRunDto>>(`${BASE}/checklists/submit`, dto);
  }

  getRuns(outletId: string, from?: string, to?: string): Observable<ApiResponse<C.ChecklistRunDto[]>> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return this.http.get<ApiResponse<C.ChecklistRunDto[]>>(
      `${BASE}/checklists/runs/${outletId}${qs ? '?' + qs : ''}`);
  }

  // ── Prep batches ─────────────────────────────────────────────────────

  getBatches(outletId: string, activeOnly = true): Observable<ApiResponse<C.PrepBatchDto[]>> {
    return this.http.get<ApiResponse<C.PrepBatchDto[]>>(
      `${BASE}/batches/${outletId}?activeOnly=${activeOnly}`);
  }

  createBatch(dto: C.SavePrepBatchDto): Observable<ApiResponse<C.PrepBatchDto>> {
    return this.http.post<ApiResponse<C.PrepBatchDto>>(`${BASE}/batches`, dto);
  }

  discardBatch(id: string, reason?: string): Observable<ApiResponse<C.PrepBatchDto>> {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return this.http.post<ApiResponse<C.PrepBatchDto>>(`${BASE}/batches/${id}/discard${qs}`, {});
  }

  // ── Delivery zones ───────────────────────────────────────────────────

  getZones(outletId: string): Observable<ApiResponse<C.DeliveryZoneDto[]>> {
    return this.http.get<ApiResponse<C.DeliveryZoneDto[]>>(`${BASE}/delivery-zones/${outletId}`);
  }

  createZone(dto: C.DeliveryZoneDto): Observable<ApiResponse<C.DeliveryZoneDto>> {
    return this.http.post<ApiResponse<C.DeliveryZoneDto>>(`${BASE}/delivery-zones`, dto);
  }

  updateZone(id: string, dto: C.DeliveryZoneDto): Observable<ApiResponse<C.DeliveryZoneDto>> {
    return this.http.put<ApiResponse<C.DeliveryZoneDto>>(`${BASE}/delivery-zones/${id}`, dto);
  }

  deleteZone(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/delivery-zones/${id}`);
  }

  quoteDelivery(dto: C.DeliveryQuoteRequestDto): Observable<ApiResponse<C.DeliveryQuoteDto>> {
    return this.http.post<ApiResponse<C.DeliveryQuoteDto>>(`${BASE}/delivery-quote`, dto);
  }
}
