import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { TestBed } from '@angular/core/testing';

import { ProcurementApi } from './procurement-api';

describe('ProcurementApi', () => {
  let service: ProcurementApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProcurementApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
