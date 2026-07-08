import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  PosCashierDto,
  PosSessionDto,
  PosCashMovementDto,
  CashierPinLoginDto,
  CashierCheckInDto,
  CashierCheckOutDto,
  CashMovementDto,
  CreatePosCashierDto,
  UpdatePosCashierDto,
  SetCashierPinDto,
  ChangeCashierPinDto,
} from '../models/pos-cashier.model';

@Injectable({ providedIn: 'root' })
export class PosCashierService {
  constructor(private http: HttpClient) {}

  getByStore(storeId: string): Observable<ApiResponse<PosCashierDto[]>> {
    return this.http.get<ApiResponse<PosCashierDto[]>>(SALES_API.posCashier.byStore(storeId));
  }

  getById(id: string): Observable<ApiResponse<PosCashierDto>> {
    return this.http.get<ApiResponse<PosCashierDto>>(SALES_API.posCashier.getById(id));
  }

  create(dto: CreatePosCashierDto): Observable<ApiResponse<PosCashierDto>> {
    return this.http.post<ApiResponse<PosCashierDto>>(SALES_API.posCashier.create, dto);
  }

  update(id: string, dto: UpdatePosCashierDto): Observable<ApiResponse<PosCashierDto>> {
    return this.http.put<ApiResponse<PosCashierDto>>(SALES_API.posCashier.update(id), dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.posCashier.delete(id));
  }

  setPin(id: string, dto: SetCashierPinDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(SALES_API.posCashier.setPin(id), dto);
  }

  changePin(id: string, dto: ChangeCashierPinDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(SALES_API.posCashier.changePin(id), dto);
  }

  pinLogin(dto: CashierPinLoginDto): Observable<ApiResponse<PosCashierDto>> {
    return this.http.post<ApiResponse<PosCashierDto>>(SALES_API.posCashier.pinLogin, dto);
  }

  checkIn(dto: CashierCheckInDto): Observable<ApiResponse<PosSessionDto>> {
    return this.http.post<ApiResponse<PosSessionDto>>(SALES_API.posCashier.checkIn, dto);
  }

  checkOut(sessionId: string, dto: CashierCheckOutDto): Observable<ApiResponse<PosSessionDto>> {
    return this.http.post<ApiResponse<PosSessionDto>>(SALES_API.posCashier.checkOut(sessionId), dto);
  }

  getOpenSession(cashierId?: string, terminalId?: string): Observable<ApiResponse<PosSessionDto>> {
    let url = SALES_API.posCashier.openSession;
    const params: string[] = [];
    if (cashierId) params.push(`cashierId=${cashierId}`);
    if (terminalId) params.push(`terminalId=${terminalId}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<ApiResponse<PosSessionDto>>(url);
  }

  getCashMovements(sessionId: string): Observable<ApiResponse<PosCashMovementDto[]>> {
    return this.http.get<ApiResponse<PosCashMovementDto[]>>(SALES_API.posCashier.cashMovements(sessionId));
  }

  cashIn(sessionId: string, dto: CashMovementDto): Observable<ApiResponse<PosCashMovementDto>> {
    return this.http.post<ApiResponse<PosCashMovementDto>>(SALES_API.posCashier.cashIn(sessionId), dto);
  }

  cashOut(sessionId: string, dto: CashMovementDto): Observable<ApiResponse<PosCashMovementDto>> {
    return this.http.post<ApiResponse<PosCashMovementDto>>(SALES_API.posCashier.cashOut(sessionId), dto);
  }

  getSessionsByTerminal(terminalId: string): Observable<ApiResponse<PosSessionDto[]>> {
    return this.http.get<ApiResponse<PosSessionDto[]>>(SALES_API.posCashier.sessionsByTerminal(terminalId));
  }

  getSessionsByDate(date: string, storeId?: string): Observable<ApiResponse<PosSessionDto[]>> {
    let url = SALES_API.posCashier.sessionsByDate;
    const params: string[] = [`date=${encodeURIComponent(date)}`];
    if (storeId) params.push(`storeId=${storeId}`);
    url += '?' + params.join('&');
    return this.http.get<ApiResponse<PosSessionDto[]>>(url);
  }
}
