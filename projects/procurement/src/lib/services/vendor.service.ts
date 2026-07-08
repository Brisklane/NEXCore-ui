import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import {
  VendorDto, CreateVendorDto, UpdateVendorDto, BlockVendorDto,
  VendorContactDto, VendorAddressDto, VendorBankAccountDto,
} from '../models/vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<VendorDto>> {
    return this.http.get<PaginatedResponse<VendorDto>>(PROCUREMENT_API.vendor.getAll, {
      headers: this.auth.getAuthHeaders(),
      params: buildPaginationParams(pagination),
    });
  }

  getById(id: string): Observable<ApiResponse<VendorDto>> {
    return this.http.get<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByNumber(number: string): Observable<ApiResponse<VendorDto>> {
    return this.http.get<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.getByNumber(number), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByStatus(status: number): Observable<ApiResponse<VendorDto[]>> {
    return this.http.get<ApiResponse<VendorDto[]>>(PROCUREMENT_API.vendor.getByStatus(status), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getPreferred(): Observable<ApiResponse<VendorDto[]>> {
    return this.http.get<ApiResponse<VendorDto[]>>(PROCUREMENT_API.vendor.getPreferred, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateVendorDto): Observable<ApiResponse<VendorDto>> {
    return this.http.post<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateVendorDto): Observable<ApiResponse<VendorDto>> {
    return this.http.put<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  approve(id: string): Observable<ApiResponse<VendorDto>> {
    return this.http.post<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.approve(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deactivate(id: string): Observable<ApiResponse<VendorDto>> {
    return this.http.post<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.deactivate(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  reactivate(id: string): Observable<ApiResponse<VendorDto>> {
    return this.http.post<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.reactivate(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  block(id: string, dto: BlockVendorDto): Observable<ApiResponse<VendorDto>> {
    return this.http.post<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.block(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  unblock(id: string): Observable<ApiResponse<VendorDto>> {
    return this.http.post<ApiResponse<VendorDto>>(PROCUREMENT_API.vendor.unblock(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendor.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addContact(vendorId: string, dto: VendorContactDto): Observable<ApiResponse<VendorContactDto>> {
    return this.http.post<ApiResponse<VendorContactDto>>(PROCUREMENT_API.vendor.addContact(vendorId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateContact(vendorId: string, contactId: string, dto: VendorContactDto): Observable<ApiResponse<VendorContactDto>> {
    return this.http.put<ApiResponse<VendorContactDto>>(PROCUREMENT_API.vendor.updateContact(vendorId, contactId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteContact(vendorId: string, contactId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendor.deleteContact(vendorId, contactId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addAddress(vendorId: string, dto: VendorAddressDto): Observable<ApiResponse<VendorAddressDto>> {
    return this.http.post<ApiResponse<VendorAddressDto>>(PROCUREMENT_API.vendor.addAddress(vendorId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateAddress(vendorId: string, addressId: string, dto: VendorAddressDto): Observable<ApiResponse<VendorAddressDto>> {
    return this.http.put<ApiResponse<VendorAddressDto>>(PROCUREMENT_API.vendor.updateAddress(vendorId, addressId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteAddress(vendorId: string, addressId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendor.deleteAddress(vendorId, addressId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addBankAccount(vendorId: string, dto: VendorBankAccountDto): Observable<ApiResponse<VendorBankAccountDto>> {
    return this.http.post<ApiResponse<VendorBankAccountDto>>(PROCUREMENT_API.vendor.addBankAccount(vendorId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateBankAccount(vendorId: string, bankAccountId: string, dto: VendorBankAccountDto): Observable<ApiResponse<VendorBankAccountDto>> {
    return this.http.put<ApiResponse<VendorBankAccountDto>>(PROCUREMENT_API.vendor.updateBankAccount(vendorId, bankAccountId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteBankAccount(vendorId: string, bankAccountId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendor.deleteBankAccount(vendorId, bankAccountId), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
