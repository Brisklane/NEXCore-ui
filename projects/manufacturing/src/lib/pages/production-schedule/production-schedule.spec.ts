import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductionSchedule } from './production-schedule';
describe('ProductionSchedule', () => {
  let c: ProductionSchedule; let f: ComponentFixture<ProductionSchedule>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [ProductionSchedule], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(ProductionSchedule); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
