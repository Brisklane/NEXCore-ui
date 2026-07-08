import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAdjustment } from './inventory-adjustment';

describe('InventoryAdjustment', () => {
  let component: InventoryAdjustment;
  let fixture: ComponentFixture<InventoryAdjustment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAdjustment],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryAdjustment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
