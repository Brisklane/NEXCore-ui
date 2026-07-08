import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { TestBed } from '@angular/core/testing';

import { SalesApi } from './sales-api';

describe('SalesApi', () => {
  let service: SalesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SalesApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
