import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductionOrder } from './production-order';
describe('ProductionOrder', () => {
  let c: ProductionOrder; let f: ComponentFixture<ProductionOrder>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [ProductionOrder], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(ProductionOrder); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
