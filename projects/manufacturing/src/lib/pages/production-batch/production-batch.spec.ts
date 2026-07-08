import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductionBatch } from './production-batch';
describe('ProductionBatch', () => {
  let c: ProductionBatch; let f: ComponentFixture<ProductionBatch>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [ProductionBatch], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(ProductionBatch); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
