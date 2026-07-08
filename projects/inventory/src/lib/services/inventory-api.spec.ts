import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { TestBed } from '@angular/core/testing';

import { InventoryApi } from './inventory-api';

describe('InventoryApi', () => {
  let service: InventoryApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InventoryApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
