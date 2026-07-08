import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrder } from './purchase-order';

describe('PurchaseOrder', () => {
  let component: PurchaseOrder;
  let fixture: ComponentFixture<PurchaseOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrder],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
