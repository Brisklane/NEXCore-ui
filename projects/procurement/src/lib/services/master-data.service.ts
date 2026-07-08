import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import {
  VendorCategoryDto, CreateVendorCategoryDto, UpdateVendorCategoryDto,
  ProcurementCategoryDto, CreateProcurementCategoryDto, UpdateProcurementCategoryDto,
  VendorDocumentDto, CreateVendorDocumentDto, UpdateVendorDocumentDto,
  VendorPricelistDto, CreateVendorPricelistDto,
  ApprovalWorkflowDto, CreateApprovalWorkflowDto,
  DocumentSequenceDto, UpdateDocumentSequenceDto,
  ProcurementSettingsDto, UpdateProcurementSettingsDto,
} from '../models/master-data.model';

@Injectable({ providedIn: 'root' })
export class VendorCategoryService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(): Observable<ApiResponse<VendorCategoryDto[]>> {
    return this.http.get<ApiResponse<VendorCategoryDto[]>>(PROCUREMENT_API.vendorCategory.getAll, { headers: this.h });
  }
  getActive(): Observable<ApiResponse<VendorCategoryDto[]>> {
    return this.http.get<ApiResponse<VendorCategoryDto[]>>(PROCUREMENT_API.vendorCategory.getActive, { headers: this.h });
  }
  create(dto: CreateVendorCategoryDto): Observable<ApiResponse<VendorCategoryDto>> {
    return this.http.post<ApiResponse<VendorCategoryDto>>(PROCUREMENT_API.vendorCategory.create, dto, { headers: this.h });
  }
  update(id: string, dto: UpdateVendorCategoryDto): Observable<ApiResponse<VendorCategoryDto>> {
    return this.http.put<ApiResponse<VendorCategoryDto>>(PROCUREMENT_API.vendorCategory.update(id), dto, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendorCategory.delete(id), { headers: this.h });
  }
}

@Injectable({ providedIn: 'root' })
export class ProcurementCategoryService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(): Observable<ApiResponse<ProcurementCategoryDto[]>> {
    return this.http.get<ApiResponse<ProcurementCategoryDto[]>>(PROCUREMENT_API.procurementCategory.getAll, { headers: this.h });
  }
  getActive(): Observable<ApiResponse<ProcurementCategoryDto[]>> {
    return this.http.get<ApiResponse<ProcurementCategoryDto[]>>(PROCUREMENT_API.procurementCategory.getActive, { headers: this.h });
  }
  create(dto: CreateProcurementCategoryDto): Observable<ApiResponse<ProcurementCategoryDto>> {
    return this.http.post<ApiResponse<ProcurementCategoryDto>>(PROCUREMENT_API.procurementCategory.create, dto, { headers: this.h });
  }
  update(id: string, dto: UpdateProcurementCategoryDto): Observable<ApiResponse<ProcurementCategoryDto>> {
    return this.http.put<ApiResponse<ProcurementCategoryDto>>(PROCUREMENT_API.procurementCategory.update(id), dto, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.procurementCategory.delete(id), { headers: this.h });
  }
}

@Injectable({ providedIn: 'root' })
export class VendorDocumentService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(vendorId: string): Observable<ApiResponse<VendorDocumentDto[]>> {
    return this.http.get<ApiResponse<VendorDocumentDto[]>>(PROCUREMENT_API.vendorDocument.getAll(vendorId), { headers: this.h });
  }
  getExpiring(days = 30): Observable<ApiResponse<VendorDocumentDto[]>> {
    return this.http.get<ApiResponse<VendorDocumentDto[]>>(PROCUREMENT_API.vendorDocument.getExpiring(days), { headers: this.h });
  }
  create(vendorId: string, dto: CreateVendorDocumentDto): Observable<ApiResponse<VendorDocumentDto>> {
    return this.http.post<ApiResponse<VendorDocumentDto>>(PROCUREMENT_API.vendorDocument.create(vendorId), dto, { headers: this.h });
  }
  update(vendorId: string, id: string, dto: UpdateVendorDocumentDto): Observable<ApiResponse<VendorDocumentDto>> {
    return this.http.put<ApiResponse<VendorDocumentDto>>(PROCUREMENT_API.vendorDocument.update(vendorId, id), dto, { headers: this.h });
  }
  verify(vendorId: string, id: string): Observable<ApiResponse<VendorDocumentDto>> {
    return this.http.post<ApiResponse<VendorDocumentDto>>(PROCUREMENT_API.vendorDocument.verify(vendorId, id), {}, { headers: this.h });
  }
  delete(vendorId: string, id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendorDocument.delete(vendorId, id), { headers: this.h });
  }
}

@Injectable({ providedIn: 'root' })
export class VendorPricelistService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(vendorId: string): Observable<ApiResponse<VendorPricelistDto[]>> {
    return this.http.get<ApiResponse<VendorPricelistDto[]>>(PROCUREMENT_API.vendorPricelist.getAll(vendorId), { headers: this.h });
  }
  getById(vendorId: string, id: string): Observable<ApiResponse<VendorPricelistDto>> {
    return this.http.get<ApiResponse<VendorPricelistDto>>(PROCUREMENT_API.vendorPricelist.getById(vendorId, id), { headers: this.h });
  }
  create(vendorId: string, dto: CreateVendorPricelistDto): Observable<ApiResponse<VendorPricelistDto>> {
    return this.http.post<ApiResponse<VendorPricelistDto>>(PROCUREMENT_API.vendorPricelist.create(vendorId), dto, { headers: this.h });
  }
  update(vendorId: string, id: string, dto: CreateVendorPricelistDto): Observable<ApiResponse<VendorPricelistDto>> {
    return this.http.put<ApiResponse<VendorPricelistDto>>(PROCUREMENT_API.vendorPricelist.update(vendorId, id), dto, { headers: this.h });
  }
  delete(vendorId: string, id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendorPricelist.delete(vendorId, id), { headers: this.h });
  }
}

@Injectable({ providedIn: 'root' })
export class ApprovalWorkflowService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(): Observable<ApiResponse<ApprovalWorkflowDto[]>> {
    return this.http.get<ApiResponse<ApprovalWorkflowDto[]>>(PROCUREMENT_API.approvalWorkflow.getAll, { headers: this.h });
  }
  getByDocumentType(dt: number): Observable<ApiResponse<ApprovalWorkflowDto[]>> {
    return this.http.get<ApiResponse<ApprovalWorkflowDto[]>>(PROCUREMENT_API.approvalWorkflow.getByDocumentType(dt), { headers: this.h });
  }
  getById(id: string): Observable<ApiResponse<ApprovalWorkflowDto>> {
    return this.http.get<ApiResponse<ApprovalWorkflowDto>>(PROCUREMENT_API.approvalWorkflow.getById(id), { headers: this.h });
  }
  create(dto: CreateApprovalWorkflowDto): Observable<ApiResponse<ApprovalWorkflowDto>> {
    return this.http.post<ApiResponse<ApprovalWorkflowDto>>(PROCUREMENT_API.approvalWorkflow.create, dto, { headers: this.h });
  }
  update(id: string, dto: CreateApprovalWorkflowDto): Observable<ApiResponse<ApprovalWorkflowDto>> {
    return this.http.put<ApiResponse<ApprovalWorkflowDto>>(PROCUREMENT_API.approvalWorkflow.update(id), dto, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.approvalWorkflow.delete(id), { headers: this.h });
  }
}

@Injectable({ providedIn: 'root' })
export class DocumentSequenceService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(): Observable<ApiResponse<DocumentSequenceDto[]>> {
    return this.http.get<ApiResponse<DocumentSequenceDto[]>>(PROCUREMENT_API.documentSequence.getAll, { headers: this.h });
  }
  update(id: string, dto: UpdateDocumentSequenceDto): Observable<ApiResponse<DocumentSequenceDto>> {
    return this.http.put<ApiResponse<DocumentSequenceDto>>(PROCUREMENT_API.documentSequence.update(id), dto, { headers: this.h });
  }
}

@Injectable({ providedIn: 'root' })
export class ProcurementSettingsService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  get(): Observable<ApiResponse<ProcurementSettingsDto>> {
    return this.http.get<ApiResponse<ProcurementSettingsDto>>(PROCUREMENT_API.settings.get, { headers: this.h });
  }
  update(dto: UpdateProcurementSettingsDto): Observable<ApiResponse<ProcurementSettingsDto>> {
    return this.http.put<ApiResponse<ProcurementSettingsDto>>(PROCUREMENT_API.settings.update, dto, { headers: this.h });
  }
}
