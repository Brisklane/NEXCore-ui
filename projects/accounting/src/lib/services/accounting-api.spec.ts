import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { TestBed } from '@angular/core/testing';

import { AccountingApi } from './accounting-api';

describe('AccountingApi', () => {
  let service: AccountingApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AccountingApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
