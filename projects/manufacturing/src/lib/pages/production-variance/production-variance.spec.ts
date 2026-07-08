import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductionVariance } from './production-variance';
describe('ProductionVariance', () => {
  let c: ProductionVariance; let f: ComponentFixture<ProductionVariance>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [ProductionVariance], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(ProductionVariance); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
