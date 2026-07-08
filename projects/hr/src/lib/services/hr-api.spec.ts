import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { TestBed } from '@angular/core/testing';

import { HrApi } from './hr-api';

describe('HrApi', () => {
  let service: HrApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HrApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
